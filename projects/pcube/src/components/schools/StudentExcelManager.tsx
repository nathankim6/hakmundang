import { useState, useRef } from "react";
import { Download, Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";

interface StudentExcelManagerProps {
  ownerCodeId: string | null;
}

interface ExcelRow {
  학교: string;
  학년: string;
  학생이름: string;
  학생전화번호: string;
  학부모전화번호: string;
}

interface UploadResult {
  total: number;
  success: number;
  skipped: number;
  errors: string[];
}

// 5자리 접속코드 생성
const generateAccessCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function StudentExcelManager({ ownerCodeId }: StudentExcelManagerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[] | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // ===== 다운로드 =====
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch students filtered by owner
      let schoolsQuery = supabase.from("schools").select("*");
      if (ownerCodeId) {
        schoolsQuery = schoolsQuery.eq("owner_code_id", ownerCodeId);
      }
      const { data: schools, error: schoolsError } = await schoolsQuery;
      if (schoolsError) throw schoolsError;

      const schoolIds = (schools || []).map(s => s.id);
      if (schoolIds.length === 0) {
        toast.info("등록된 학교가 없습니다.");
        setIsDownloading(false);
        return;
      }

      const { data: grades, error: gradesError } = await supabase
        .from("grades")
        .select("*")
        .in("school_id", schoolIds);
      if (gradesError) throw gradesError;

      const gradeIds = (grades || []).map(g => g.id);
      if (gradeIds.length === 0) {
        toast.info("등록된 학년이 없습니다.");
        setIsDownloading(false);
        return;
      }

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*, access_codes:access_code_id(code)")
        .in("grade_id", gradeIds)
        .order("name");
      if (studentsError) throw studentsError;

      const gradeMap = new Map(grades.map((g) => [g.id, g]));
      const schoolMap = new Map(schools.map((s) => [s.id, s]));

      const rows = students.map((student) => {
        const grade = gradeMap.get(student.grade_id);
        const school = grade ? schoolMap.get(grade.school_id) : null;
        return {
          학교: school?.name || "",
          학년: grade?.name || "",
          학생이름: student.name,
          학생전화번호: student.student_phone || "",
          학부모전화번호: student.parent_phone || "",
          접속코드: (student.access_codes as any)?.code || "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      // Set column widths
      ws["!cols"] = [
        { wch: 15 }, // 학교
        { wch: 10 }, // 학년
        { wch: 12 }, // 학생이름
        { wch: 15 }, // 학생전화번호
        { wch: 15 }, // 학부모전화번호
        { wch: 10 }, // 접속코드
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "학생명단");
      XLSX.writeFile(wb, `학생명단_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("엑셀 파일이 다운로드되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error("다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ===== 업로드 =====
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(ws);

      if (rows.length === 0) {
        toast.error("엑셀 파일에 데이터가 없습니다.");
        return;
      }

      // Validate headers
      const requiredHeaders = ["학교", "학년", "학생이름"];
      const headers = Object.keys(rows[0]);
      const missing = requiredHeaders.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        toast.error(`필수 헤더가 없습니다: ${missing.join(", ")}`);
        return;
      }

      setPreviewData(rows);
      setShowPreviewDialog(true);
    } catch (error) {
      console.error(error);
      toast.error("엑셀 파일을 읽는데 실패했습니다.");
    } finally {
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadConfirm = async () => {
    if (!previewData) return;
    setIsUploading(true);
    setShowPreviewDialog(false);

    const result: UploadResult = { total: previewData.length, success: 0, skipped: 0, errors: [] };

    try {
      // 1. Get existing schools & grades
      let schoolsQuery2 = supabase.from("schools").select("*");
      if (ownerCodeId) schoolsQuery2 = schoolsQuery2.eq("owner_code_id", ownerCodeId);
      const { data: existingSchools } = await schoolsQuery2;

      const existingSchoolIds = (existingSchools || []).map(s => s.id);
      const { data: existingGrades } = existingSchoolIds.length > 0
        ? await supabase.from("grades").select("*").in("school_id", existingSchoolIds)
        : { data: [] };
      
      const existingGradeIds = (existingGrades || []).map(g => g.id);
      const { data: existingStudents } = existingGradeIds.length > 0
        ? await supabase.from("students").select("*, access_codes:access_code_id(code)").in("grade_id", existingGradeIds)
        : { data: [] };

      const schoolMap = new Map((existingSchools || []).map((s) => [s.name, s]));
      const gradeMap = new Map((existingGrades || []).map((g) => [`${g.school_id}_${g.name}`, g]));
      
      // Build existing student set for duplicate checking
      const existingStudentSet = new Set(
        (existingStudents || []).map((s) => {
          const grade = (existingGrades || []).find((g) => g.id === s.grade_id);
          const school = grade ? (existingSchools || []).find((sc) => sc.id === grade.school_id) : null;
          return `${school?.name || ""}_${grade?.name || ""}_${s.name}`;
        })
      );

      for (let i = 0; i < previewData.length; i++) {
        const row = previewData[i];
        const rowNum = i + 2; // Excel row (1-indexed + header)

        try {
          const schoolName = String(row.학교 || "").trim();
          const gradeName = String(row.학년 || "").trim();
          const studentName = String(row.학생이름 || "").trim();

          if (!schoolName || !gradeName || !studentName) {
            result.errors.push(`${rowNum}행: 학교/학년/학생이름은 필수입니다.`);
            continue;
          }

          // Check duplicate
          const dupeKey = `${schoolName}_${gradeName}_${studentName}`;
          if (existingStudentSet.has(dupeKey)) {
            result.skipped++;
            continue;
          }

          // Ensure school exists
          let school = schoolMap.get(schoolName);
          if (!school) {
            const { data: newSchool, error } = await supabase
              .from("schools")
              .insert({ name: schoolName, owner_code_id: ownerCodeId })
              .select()
              .single();
            if (error) throw error;
            school = newSchool;
            schoolMap.set(schoolName, school);
          }

          // Ensure grade exists
          const gradeKey = `${school.id}_${gradeName}`;
          let grade = gradeMap.get(gradeKey);
          if (!grade) {
            const { data: newGrade, error } = await supabase
              .from("grades")
              .insert({ name: gradeName, school_id: school.id })
              .select()
              .single();
            if (error) throw error;
            grade = newGrade;
            gradeMap.set(gradeKey, grade);
          }

          // Create access code
          const accessCode = generateAccessCode();
          const { data: codeData, error: codeError } = await supabase
            .from("access_codes")
            .insert({
              name: studentName,
              code: accessCode,
              role: "student",
              is_admin: false,
              is_active: true,
            })
            .select()
            .single();
          if (codeError) throw codeError;

          // Create student
          const { error: studentError } = await supabase
            .from("students")
            .insert({
              name: studentName,
              grade_id: grade.id,
              student_phone: String(row.학생전화번호 || "").trim() || null,
              parent_phone: String(row.학부모전화번호 || "").trim() || null,
              access_code_id: codeData.id,
            });
          if (studentError) throw studentError;

          existingStudentSet.add(dupeKey);
          result.success++;
        } catch (error: any) {
          result.errors.push(`${rowNum}행 (${row.학생이름}): ${error.message}`);
        }
      }
    } catch (error: any) {
      toast.error("업로드 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsUploading(false);
      setPreviewData(null);
      setUploadResult(result);
      setShowResultDialog(true);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["access-codes"] });
      queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
    }
  };

  // ===== 빈 템플릿 다운로드 =====
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/student-template.xlsx";
    link.download = "학생명단_템플릿.xlsx";
    link.click();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1.5" />
          )}
          엑셀 다운로드
        </Button>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 mr-1.5" />
          )}
          엑셀 업로드
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>업로드 미리보기</DialogTitle>
            <DialogDescription>
              총 {previewData?.length || 0}명의 학생 데이터가 확인되었습니다. 
              이미 존재하는 학생은 자동으로 건너뜁니다.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">학교</th>
                  <th className="px-3 py-2 text-left font-medium">학년</th>
                  <th className="px-3 py-2 text-left font-medium">학생이름</th>
                  <th className="px-3 py-2 text-left font-medium">학생전화번호</th>
                  <th className="px-3 py-2 text-left font-medium">학부모전화번호</th>
                </tr>
              </thead>
              <tbody>
                {previewData?.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5">{row.학교}</td>
                    <td className="px-3 py-1.5">{row.학년}</td>
                    <td className="px-3 py-1.5 font-medium">{row.학생이름}</td>
                    <td className="px-3 py-1.5">{row.학생전화번호 || "-"}</td>
                    <td className="px-3 py-1.5">{row.학부모전화번호 || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData && previewData.length > 50 && (
              <p className="text-center text-xs text-muted-foreground py-2">
                ... 외 {previewData.length - 50}명 더
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPreviewDialog(false); setPreviewData(null); }}>
              취소
            </Button>
            <Button onClick={handleUploadConfirm}>
              <Upload className="w-4 h-4 mr-2" />
              {previewData?.length}명 업로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 결과 다이얼로그 */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>업로드 결과</DialogTitle>
          </DialogHeader>
          {uploadResult && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{uploadResult.success}</p>
                  <p className="text-xs text-muted-foreground">성공</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{uploadResult.skipped}</p>
                  <p className="text-xs text-muted-foreground">중복 건너뜀</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">{uploadResult.errors.length}</p>
                  <p className="text-xs text-muted-foreground">오류</p>
                </div>
              </div>
              {uploadResult.errors.length > 0 && (
                <div className="max-h-40 overflow-auto border rounded-lg p-3 text-xs space-y-1">
                  {uploadResult.errors.map((err, i) => (
                    <p key={i} className="text-destructive">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
