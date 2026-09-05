import { useState, useEffect } from "react";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Camera, Mic } from "lucide-react";

interface CreateHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type HomeworkType = "daily_word" | "rt_review";

const homeworkTypeConfig = {
  daily_word: {
    label: "일일 단어과제",
    description: "단어시험지 사진 제출",
    icon: Camera,
    color: "text-blue-500",
  },
  rt_review: {
    label: "리뷰 과제",
    description: "수업 복습 녹음 제출",
    icon: Mic,
    color: "text-orange-500",
  },
};

export function CreateHomeworkDialog({ open, onOpenChange }: CreateHomeworkDialogProps) {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HomeworkType>("daily_word");
  const [passageId, setPassageId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [targetType, setTargetType] = useState<"grade" | "student">("grade");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Fetch schools
  const { data: schools = [] } = useQuery({
    queryKey: ["schools", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase.from("schools").select("*").order("name");
      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch grades for selected school
  const { data: grades = [] } = useQuery({
    queryKey: ["grades", selectedSchoolId],
    queryFn: async () => {
      if (!selectedSchoolId) return [];
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("school_id", selectedSchoolId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSchoolId,
  });

  // Fetch students for selected grade
  const { data: students = [] } = useQuery({
    queryKey: ["students", selectedGradeId],
    queryFn: async () => {
      if (!selectedGradeId) return [];
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("grade_id", selectedGradeId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGradeId && targetType === "student",
  });

  // Fetch passages for selected grade (리뷰 과제용)
  const { data: passages = [] } = useQuery({
    queryKey: ["passages", selectedGradeId],
    queryFn: async () => {
      if (!selectedGradeId) return [];
      const { data, error } = await supabase
        .from("passages")
        .select("*")
        .eq("grade_id", selectedGradeId)
        .order("title");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGradeId && type === "rt_review",
  });

  // Create homework mutation
  const createHomework = useMutation({
    mutationFn: async () => {
      const homeworkData = {
        title,
        description: description || null,
        type,
        passage_id: type === "rt_review" && passageId ? passageId : null,
        due_date: dueDate,
        target_type: targetType,
        target_grade_id: targetType === "grade" ? selectedGradeId : null,
        target_student_id: targetType === "student" ? selectedStudentId : null,
        owner_code_id: ownerCodeId,
      };

      const { data: homework, error: homeworkError } = await supabase
        .from("homework")
        .insert(homeworkData)
        .select()
        .single();

      if (homeworkError) throw homeworkError;

      // If targeting a grade, create submissions for all students in that grade
      if (targetType === "grade" && selectedGradeId) {
        const { data: gradeStudents, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("grade_id", selectedGradeId);

        if (studentsError) throw studentsError;

        if (gradeStudents && gradeStudents.length > 0) {
          const submissions = gradeStudents.map((student) => ({
            homework_id: homework.id,
            student_id: student.id,
            status: "pending" as const,
          }));

          const { error: submissionsError } = await supabase
            .from("homework_submissions")
            .insert(submissions);

          if (submissionsError) throw submissionsError;
        }
      } else if (targetType === "student" && selectedStudentId) {
        const { error: submissionError } = await supabase
          .from("homework_submissions")
          .insert({
            homework_id: homework.id,
            student_id: selectedStudentId,
            status: "pending",
          });

        if (submissionError) throw submissionError;
      }

      return homework;
    },
    onSuccess: () => {
      toast.success("숙제가 등록되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["homework"] });
      queryClient.invalidateQueries({ queryKey: ["homework_submissions"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating homework:", error);
      toast.error("숙제 등록에 실패했습니다.");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("daily_word");
    setPassageId("");
    setDueDate("");
    setTargetType("grade");
    setSelectedSchoolId("");
    setSelectedGradeId("");
    setSelectedStudentId("");
  };

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setSelectedGradeId("");
    setSelectedStudentId("");
  }, [selectedSchoolId]);

  useEffect(() => {
    setSelectedStudentId("");
    setPassageId("");
  }, [selectedGradeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!dueDate) {
      toast.error("마감일을 선택해주세요.");
      return;
    }
    if (!selectedGradeId) {
      toast.error("학년을 선택해주세요.");
      return;
    }
    if (targetType === "student" && !selectedStudentId) {
      toast.error("학생을 선택해주세요.");
      return;
    }

    createHomework.mutate();
  };

  const TypeIcon = homeworkTypeConfig[type].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>숙제 등록</DialogTitle>
          <DialogDescription>
            새로운 숙제를 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 숙제 유형 */}
          <div className="space-y-3">
            <Label>숙제 유형 *</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(homeworkTypeConfig) as [HomeworkType, typeof homeworkTypeConfig.daily_word][]).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      type === key 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${config.color}`} />
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "daily_word" ? "예: 1월 2일 단어시험" : "예: Unit 3 복습"}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="숙제에 대한 추가 설명..."
              rows={2}
            />
          </div>

          {/* 마감일 */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">마감일 *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* 배정 대상 유형 */}
          <div className="space-y-2">
            <Label>배정 대상 *</Label>
            <RadioGroup value={targetType} onValueChange={(v) => setTargetType(v as typeof targetType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grade" id="target-grade" />
                <Label htmlFor="target-grade" className="font-normal">학년 전체</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="target-student" />
                <Label htmlFor="target-student" className="font-normal">개별 학생</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 학교 선택 */}
          <div className="space-y-2">
            <Label>학교 *</Label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="학교를 선택하세요" />
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

          {/* 학년 선택 */}
          {selectedSchoolId && (
            <div className="space-y-2">
              <Label>학년 *</Label>
              <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="학년을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 학생 선택 (개별 학생일 때만) */}
          {targetType === "student" && selectedGradeId && (
            <div className="space-y-2">
              <Label>학생 *</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="학생을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 지문 선택 (리뷰 과제일 때만) */}
          {type === "rt_review" && selectedGradeId && (
            <div className="space-y-2">
              <Label>지문 선택</Label>
              <Select value={passageId} onValueChange={setPassageId}>
                <SelectTrigger>
                  <SelectValue placeholder="지문을 선택하세요 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  {passages.map((passage) => (
                    <SelectItem key={passage.id} value={passage.id}>
                      {passage.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={createHomework.isPending}>
              {createHomework.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              등록하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
