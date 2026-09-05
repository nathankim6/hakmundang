import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Question } from "@/hooks/useQuestions";

interface QuestionFormProps {
  initialData?: Question;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const QuestionForm = ({ initialData, onSubmit, onCancel }: QuestionFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialData || {
      school: "",
      grade: "1학년",
      question_type: "",
      difficulty: "중",
      title: "",
      content: "",
      answer: "",
      explanation: "",
      exam_year: "",
      semester: "",
    },
  });

  const presetTypes = ["배열영작","조건영작","요약문(영작)","요약문(어휘)","어법수정","어휘수정","요지쓰기","Signiture"];
  const [isCustomType, setIsCustomType] = useState(false);

  useEffect(() => {
    if (initialData?.question_type && !presetTypes.includes(initialData.question_type)) {
      setIsCustomType(true);
    }
  }, [initialData]);

  const questionType = watch("question_type");
  const difficulty = watch("difficulty");
  const grade = watch("grade");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school">학교명</Label>
          <Input id="school" {...register("school")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">학년</Label>
          <Select
            value={grade}
            onValueChange={(value) => setValue("grade", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="학년 선택" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="1학년">1학년</SelectItem>
              <SelectItem value="2학년">2학년</SelectItem>
              <SelectItem value="3학년">3학년</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">난이도</Label>
          <Select
            value={difficulty}
            onValueChange={(value) => setValue("difficulty", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="난이도 선택" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="최상">최상</SelectItem>
              <SelectItem value="상">상</SelectItem>
              <SelectItem value="중">중</SelectItem>
              <SelectItem value="하">하</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question_type">문제유형</Label>
          <Select
            value={isCustomType ? "직접입력" : questionType}
            onValueChange={(value) => {
              if (value === "직접입력") {
                setIsCustomType(true);
                setValue("question_type", "");
              } else {
                setIsCustomType(false);
                setValue("question_type", value);
              }
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="문제유형 선택" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="배열영작">배열영작</SelectItem>
              <SelectItem value="조건영작">조건영작</SelectItem>
              <SelectItem value="요약문(영작)">요약문(영작)</SelectItem>
              <SelectItem value="요약문(어휘)">요약문(어휘)</SelectItem>
              <SelectItem value="어법수정">어법수정</SelectItem>
              <SelectItem value="어휘수정">어휘수정</SelectItem>
              <SelectItem value="요지쓰기">요지쓰기</SelectItem>
              <SelectItem value="Signiture">Signiture</SelectItem>
              <SelectItem value="직접입력">직접입력</SelectItem>
            </SelectContent>
          </Select>
          {isCustomType && (
            <Input
              placeholder="문제유형 입력"
              value={questionType}
              onChange={(e) => setValue("question_type", e.target.value)}
              className="mt-2"
              autoFocus
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">문제 제목</Label>
        <Input id="title" {...register("title")} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">문제 내용</Label>
        <Textarea
          id="content"
          {...register("content")}
          rows={6}
          required
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">정답</Label>
        <Textarea
          id="answer"
          {...register("answer")}
          rows={4}
          required
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">해설 (선택사항)</Label>
        <Textarea
          id="explanation"
          {...register("explanation")}
          rows={4}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exam_year">출제연도</Label>
          <Input id="exam_year" type="text" {...register("exam_year")} placeholder="예: 2024" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">학기</Label>
          <Select
            value={watch("semester")}
            onValueChange={(value) => setValue("semester", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="학기 선택" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="1학기 중간">1학기 중간</SelectItem>
              <SelectItem value="1학기 기말">1학기 기말</SelectItem>
              <SelectItem value="2학기 중간">2학기 중간</SelectItem>
              <SelectItem value="2학기 기말">2학기 기말</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">
          {initialData ? "수정하기" : "등록하기"}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
