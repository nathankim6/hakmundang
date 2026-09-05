import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Plus, Trash2, Sparkles, Loader2, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PassageEntry {
  id: string;
  title: string;
  content: string;
  koreanContent: string;
  sentences: string[];
  koreanSentences: string[];
  isProcessing: boolean;
}

interface BulkAddPassagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schools: any[];
  grades: any[];
  onSuccess: () => void;
}

export function BulkAddPassagesDialog({
  open,
  onOpenChange,
  schools,
  grades,
  onSuccess,
}: BulkAddPassagesDialogProps) {
  const [schoolId, setSchoolId] = useState("");
  const { ownerCodeId } = useOwnerFilter();
  const [gradeIds, setGradeIds] = useState<string[]>([]);
  const [semester, setSemester] = useState("");
  const [exam, setExam] = useState("");
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));

  // 선택된 학교/학년 이름으로 자동 제목 생성
  const selectedSchool = schools.find((s) => s.id === schoolId);
  const selectedGradeNames = gradeIds
    .map((id) => grades.find((g) => g.id === id)?.name)
    .filter(Boolean) as string[];
  // 학년 이름의 괄호(반/시간표) 부분은 라벨에서 제외하고 중복 제거하여 누적 그룹 키 유지
  // 예: "1학년(월수)", "1학년(화목)" -> "1학년"
  const normalizedGradeNames = Array.from(
    new Set(selectedGradeNames.map((n) => n.replace(/\s*\([^)]*\)\s*/g, "").trim()).filter(Boolean))
  );
  const gradeLabel = normalizedGradeNames.join("·");
  const title = [
    selectedSchool?.name,
    gradeLabel,
    semester,
    exam,
  ].filter(Boolean).join(" ");
  const [passages, setPassages] = useState<PassageEntry[]>([
    { id: crypto.randomUUID(), title: "", content: "", koreanContent: "", sentences: [], koreanSentences: [], isProcessing: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const getGradesForSchool = (selectedSchoolId: string) => {
    return grades.filter((g) => g.school_id === selectedSchoolId);
  };

  const addPassageEntry = () => {
    setPassages([
      ...passages,
      { id: crypto.randomUUID(), title: "", content: "", koreanContent: "", sentences: [], koreanSentences: [], isProcessing: false },
    ]);
  };

  const removePassageEntry = (id: string) => {
    if (passages.length === 1) {
      toast.error("최소 1개의 지문이 필요합니다.");
      return;
    }
    setPassages(passages.filter((p) => p.id !== id));
  };

  const updatePassageEntry = (id: string, field: "title" | "content" | "koreanContent", value: string) => {
    setPassages(
      passages.map((p) =>
        p.id === id
          ? { ...p, [field]: value, ...(field === "content" ? { sentences: [], koreanSentences: [] } : {}) }
          : p
      )
    );
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, targetId: string, field: "title" | "content" | "koreanContent") => {
    const pastedText = e.clipboardData.getData("text");
    // Check if pasted text contains tabs (Excel copy)
    if (pastedText.includes("\t")) {
      e.preventDefault();
      const rows = pastedText.split("\n").filter((row) => row.trim());

      const newPassages: PassageEntry[] = rows.map((row) => {
        const cols = row.split("\t");
        // 3열 이상: 제목 | 영어 | 한글, 2열: 영어 | 한글
        const hasTitleCol = cols.length >= 3;
        const titleVal = hasTitleCol ? (cols[0] || "").trim() : "";
        const english = (hasTitleCol ? cols[1] : cols[0]) || "";
        const korean = (hasTitleCol ? cols[2] : cols[1]) || "";
        return {
          id: crypto.randomUUID(),
          title: titleVal,
          content: english.trim(),
          koreanContent: korean.trim(),
          sentences: [],
          koreanSentences: [],
          isProcessing: false,
        };
      });

      // Replace current empty entry or append
      setPassages((prev) => {
        const currentEntry = prev.find((p) => p.id === targetId);
        const isCurrentEmpty = currentEntry && !currentEntry.title.trim() && !currentEntry.content.trim() && !currentEntry.koreanContent.trim();
        const otherEntries = prev.filter((p) => p.id !== targetId);

        if (isCurrentEmpty) {
          return [...otherEntries, ...newPassages];
        }
        return [...prev, ...newPassages];
      });

      toast.success(`${rows.length}개 지문이 붙여넣기되었습니다!`);
    }
  };

  const processWithAI = async () => {
    const passagesWithContent = passages.filter((p) => p.content.trim());
    if (passagesWithContent.length === 0) {
      toast.error("지문 내용을 입력해주세요.");
      return;
    }

    setIsProcessingAll(true);
    setPassages(passages.map((p) => ({ ...p, isProcessing: p.content.trim().length > 0 })));

    try {
      const { data, error } = await supabase.functions.invoke("split-sentences", {
        body: {
          passages: passagesWithContent.map((p, idx) => ({
            title: `${title} #${idx + 1}`,
            content: p.content,
            koreanContent: p.koreanContent || "",
          })),
        },
      });

      if (error) {
        console.error("AI processing error:", error);
        toast.error("AI 문장 분리에 실패했습니다.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const results = data.results || [];
      setPassages(
        passages.map((p, idx) => {
          const result = results[idx];
          if (result) {
            return {
              ...p,
              sentences: result.sentences || [],
              koreanSentences: result.koreanSentences || [],
              isProcessing: false,
            };
          }
          return { ...p, isProcessing: false };
        })
      );

      toast.success(`${results.length}개 지문의 문장 분리가 완료되었습니다!`);
    } catch (err) {
      console.error("AI processing error:", err);
      toast.error("AI 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingAll(false);
      setPassages((prev) => prev.map((p) => ({ ...p, isProcessing: false })));
    }
  };

  const handleSave = async () => {
    if (!schoolId || gradeIds.length === 0) {
      toast.error("학교와 학년을 선택해주세요.");
      return;
    }

    if (!semester || !exam) {
      toast.error("학기와 시험을 선택해주세요.");
      return;
    }

    if (!dueDate) {
      toast.error("마감일을 선택해주세요.");
      return;
    }

    const validPassages = passages.filter((p) => p.content.trim());
    if (validPassages.length === 0) {
      toast.error("최소 1개의 지문을 입력해주세요.");
      return;
    }

    // Check if sentences are processed
    const unprocessed = validPassages.filter((p) => p.sentences.length === 0);
    if (unprocessed.length > 0) {
      toast.error("먼저 AI로 문장을 분리해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // 지문 제목은 학교 단위로 생성 (학년 중복 시 하나의 지문으로 관리)
      const baseTitle = [
        selectedSchool?.name,
        semester,
        exam,
      ].filter(Boolean).join(" ");

      // 0. 기존 동일 base title 지문 수 조회 (누적 넘버링)
      const { data: existingPassages } = await supabase
        .from("passages")
        .select("title")
        .eq("school_id", schoolId)
        .like("title", `${baseTitle}%`);
      
      let maxNum = 0;
      (existingPassages || []).forEach((p) => {
        const match = p.title.match(/#(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
      });

      // exam_label: 학년 + 학기 + 시험 (예: "1학년 1학기 기말고사")
      const examLabel = [gradeLabel, semester, exam].filter(Boolean).join(" ");

      // 1. 지문을 한 번만 저장 (grade_id 없이 학교 단위)
      const insertData = validPassages.map((p, idx) => ({
        title: p.title.trim() ? p.title.trim() : `${baseTitle} #${maxNum + idx + 1}`,
        content: p.content,
        korean_content: p.koreanSentences.length > 0 
          ? p.koreanSentences.join("\n") 
          : (p.koreanContent || null),
        sentences: p.sentences,
        school_id: schoolId,
        grade_id: null,
        owner_code_id: ownerCodeId,
        exam_label: examLabel || null,
      }));

      const { data: passagesData, error: passagesError } = await supabase
        .from("passages")
        .insert(insertData)
        .select();

      if (passagesError) throw passagesError;

      // 2. 각 학년별로 리뷰 과제 생성 (같은 지문을 공유)
      for (const gradeId of gradeIds) {
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("grade_id", gradeId);

        if (studentsError) throw studentsError;

        for (const passage of passagesData || []) {
          const { data: homeworkData, error: homeworkError } = await supabase
            .from("homework")
            .insert({
              title: `리뷰 과제: ${passage.title}`,
              type: "rt_review",
              target_type: "grade",
              target_grade_id: gradeId,
              passage_id: passage.id,
              due_date: dueDate,
              owner_code_id: ownerCodeId,
            })
            .select()
            .single();

          if (homeworkError) throw homeworkError;

          if (students && students.length > 0) {
            const submissions = students.map((student) => ({
              homework_id: homeworkData.id,
              student_id: student.id,
              status: "pending",
            }));

            const { error: submissionsError } = await supabase
              .from("homework_submissions")
              .insert(submissions);

            if (submissionsError) throw submissionsError;
          }
        }
      }

      toast.success(`${validPassages.length}개의 지문이 등록되고 ${gradeIds.length}개 학년에 리뷰 과제로 배정되었습니다!`);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("지문 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setPassages([
      { id: crypto.randomUUID(), title: "", content: "", koreanContent: "", sentences: [], koreanSentences: [], isProcessing: false },
    ]);
    setSchoolId("");
    setGradeIds([]);
    setSemester("");
    setExam("");
    setDueDate(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    onOpenChange(false);
  };

  const totalSentences = passages.reduce((sum, p) => sum + p.sentences.length, 0);
  const validPassagesCount = passages.filter((p) => p.content.trim()).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            지문 일괄 추가
          </DialogTitle>
          <DialogDescription>
            여러 지문을 한번에 추가할 수 있습니다. AI가 문장을 자동으로 분리해드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 학교/학년/학기/시험/마감일 선택 */}
          <div className="grid grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">학교</Label>
              <Select
                value={schoolId}
                onValueChange={(value) => {
                  setSchoolId(value);
                  setGradeIds([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="학교 선택" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">학년 (복수 선택 가능)</Label>
              {!schoolId ? (
                <p className="text-xs text-muted-foreground pt-2">학교를 먼저 선택</p>
              ) : (
                <div className="space-y-1.5 rounded-md border p-2 max-h-[120px] overflow-y-auto">
                  {getGradesForSchool(schoolId).map((grade) => {
                    const isChecked = gradeIds.includes(grade.id);
                    return (
                      <label key={grade.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            setGradeIds((prev) =>
                              checked
                                ? [...prev, grade.id]
                                : prev.filter((id) => id !== grade.id)
                            );
                          }}
                        />
                        <span className="text-xs">{grade.name}</span>
                      </label>
                    );
                  })}
                  {getGradesForSchool(schoolId).length === 0 && (
                    <p className="text-xs text-muted-foreground">등록된 학년이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">학기</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="학기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1학기">1학기</SelectItem>
                  <SelectItem value="2학기">2학기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">시험</Label>
              <Select value={exam} onValueChange={setExam}>
                <SelectTrigger>
                  <SelectValue placeholder="시험 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="중간고사">중간고사</SelectItem>
                  <SelectItem value="기말고사">기말고사</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                마감일
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          {/* 자동 생성된 제목 미리보기 */}
          {title && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40">
              <span className="text-[10px] text-muted-foreground shrink-0">제목:</span>
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
          )}

          {/* 지문 목록 - 테이블 형태 */}
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-center">#</TableHead>
                  <TableHead className="w-[18%]">지문제목</TableHead>
                  <TableHead className="w-[38%]">영어 지문</TableHead>
                  <TableHead className="w-[38%]">한글 해석</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passages.map((passage, index) => (
                  <TableRow key={passage.id}>
                    <TableCell className="text-center align-top pt-3 text-xs text-muted-foreground font-medium">
                      {index + 1}
                      {passage.sentences.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1">
                            {passage.sentences.length}문장
                          </Badge>
                          {passage.koreanSentences.length > 0 && passage.koreanSentences.length === passage.sentences.length && (
                            <Badge variant="outline" className="text-[10px] px-1 border-primary/30 text-primary">
                              1:1매칭
                            </Badge>
                          )}
                          {passage.koreanSentences.length > 0 && passage.koreanSentences.length !== passage.sentences.length && (
                            <Badge variant="outline" className="text-[10px] px-1 border-destructive/30 text-destructive">
                              불일치
                            </Badge>
                          )}
                        </div>
                      )}
                      {passage.isProcessing && (
                        <Loader2 className="w-3 h-3 mx-auto mt-1 animate-spin text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Textarea
                        placeholder="예: Lesson 3 본문 (비워두면 자동 생성)"
                        className="min-h-[80px] text-sm resize-y"
                        value={passage.title}
                        onChange={(e) => updatePassageEntry(passage.id, "title", e.target.value)}
                        onPaste={(e) => handlePaste(e, passage.id, "title")}
                      />
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Textarea
                        placeholder="영어 지문을 입력하세요..."
                        className="min-h-[80px] text-sm resize-y"
                        value={passage.content}
                        onChange={(e) => updatePassageEntry(passage.id, "content", e.target.value)}
                        onPaste={(e) => handlePaste(e, passage.id, "content")}
                      />
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Textarea
                        placeholder="한글 해석을 입력하세요..."
                        className="min-h-[80px] text-sm resize-y"
                        value={passage.koreanContent}
                        onChange={(e) => updatePassageEntry(passage.id, "koreanContent", e.target.value)}
                        onPaste={(e) => handlePaste(e, passage.id, "koreanContent")}
                      />
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removePassageEntry(passage.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex-1" onClick={addPassageEntry}>
              <Plus className="w-4 h-4 mr-2" />
              지문 추가
            </Button>
            <p className="text-xs text-muted-foreground">
              💡 엑셀에서 제목|영어|한글(3열) 또는 영어|한글(2열) 붙여넣기 가능
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <span>지문 {validPassagesCount}개</span>
            {totalSentences > 0 && <span>• 총 {totalSentences}문장</span>}
          </div>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="secondary"
            onClick={processWithAI}
            disabled={isProcessingAll || validPassagesCount === 0}
          >
            {isProcessingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI 처리중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI로 문장 분리
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || totalSentences === 0}>
            {isSaving ? "저장중..." : `${validPassagesCount}개 지문 저장`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
