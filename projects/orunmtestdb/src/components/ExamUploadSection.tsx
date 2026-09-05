import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Download, Trash2, FileText, Save, FolderDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useExamFiles, useUploadExamFile, useDeleteExamFile } from "@/hooks/useExamFiles";
import { useSchools } from "@/hooks/useSchools";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExamDownloadSection from "./ExamDownloadSection";

interface ExamUploadSectionProps {
  availableSchools: string[];
}

const ExamUploadSection = ({ availableSchools }: ExamUploadSectionProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [examYear, setExamYear] = useState("");
  const [semester, setSemester] = useState("");
  const [deleteId, setDeleteId] = useState<{ id: string; file_path: string } | null>(null);

  const { toast } = useToast();

  const { data: examFiles = [], isLoading } = useExamFiles();
  const { data: schoolsData = [] } = useSchools();
  const uploadMutation = useUploadExamFile();
  const deleteMutation = useDeleteExamFile();

  // 학교 관리에서 등록된 학교 목록 사용
  const examSchools = useMemo(() => {
    return schoolsData.map(school => school.school_name).sort();
  }, [schoolsData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !school || !grade || !examYear || !semester) {
      return;
    }

    uploadMutation.mutate(
      { file: selectedFile, school, grade, exam_year: examYear, semester },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setSchool("");
          setGrade("");
          setExamYear("");
          setSemester("");
          const fileInput = document.getElementById("file-upload") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        },
      }
    );
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("past_exams").download(filePath);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = (id: string, file_path: string) => {
    setDeleteId({ id, file_path });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Sort files for admin management
  const sortedFiles = [...examFiles].sort((a, b) => {
    const semesterOrder: Record<string, number> = {
      "1학기 중간": 1,
      "1학기 기말": 2,
      "2학기 중간": 3,
      "2학기 기말": 4,
    };
    
    const semesterDiff = (semesterOrder[a.semester] || 0) - (semesterOrder[b.semester] || 0);
    if (semesterDiff !== 0) return semesterDiff;
    
    const gradeOrder: Record<string, number> = {
      "1학년": 1,
      "2학년": 2,
      "3학년": 3,
    };
    return (gradeOrder[a.grade] || 0) - (gradeOrder[b.grade] || 0);
  });

  return (
    <div className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">연도별 기출</h2>
        <p className="text-sm text-muted-foreground font-medium">학교별 기출문제를 업로드하고 다운로드하세요</p>
      </div>

      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="download" className="gap-2">
            <FolderDown className="h-4 w-4" />
            다운로드
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            업로드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="mt-0">
          <ExamDownloadSection />
        </TabsContent>

        <TabsContent value="upload" className="mt-0 space-y-6">
          {/* Upload Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                기출문제 업로드
              </CardTitle>
              <CardDescription>학교, 연도, 학기를 선택하고 파일을 업로드하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-select">학교</Label>
                    <Select value={school} onValueChange={setSchool}>
                      <SelectTrigger id="school-select">
                        <SelectValue placeholder="학교 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {examSchools.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade-select">학년</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger id="grade-select">
                        <SelectValue placeholder="학년 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1학년">1학년</SelectItem>
                        <SelectItem value="2학년">2학년</SelectItem>
                        <SelectItem value="3학년">3학년</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year-select">연도</Label>
                    <Select value={examYear} onValueChange={setExamYear}>
                      <SelectTrigger id="year-select">
                        <SelectValue placeholder="연도 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}년
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester-select">학기</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger id="semester-select">
                        <SelectValue placeholder="학기 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1학기 중간">1학기 중간</SelectItem>
                        <SelectItem value="1학기 기말">1학기 기말</SelectItem>
                        <SelectItem value="2학기 중간">2학기 중간</SelectItem>
                        <SelectItem value="2학기 기말">2학기 기말</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">파일</Label>
                  <Input id="file-upload" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !school || !grade || !examYear || !semester || uploadMutation.isPending}
                  variant="warning"
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadMutation.isPending ? "업로드 중..." : "업로드"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 관리용 파일 목록 */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                업로드된 파일 관리
              </CardTitle>
              <CardDescription>업로드된 파일을 확인하고 삭제할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : sortedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>업로드된 파일이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sortedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.school} · {file.grade} · {file.exam_year} · {file.semester}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(file.file_path, file.file_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(file.id, file.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기출문제 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 기출문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamUploadSection;