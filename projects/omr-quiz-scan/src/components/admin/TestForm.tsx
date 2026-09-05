
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestFormProps {
  testTitle: string;
  testId: string;
  onTitleChange: (title: string) => void;
  onIdChange: (id: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const TestForm = ({ testTitle, testId, onTitleChange, onIdChange, onSubmit, isSubmitting = false }: TestFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="test-title">시험 제목</Label>
        <Input
          id="test-title"
          placeholder="시험 제목을 입력하세요"
          value={testTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="test-id">고유번호</Label>
        <Input
          id="test-id"
          placeholder="시험 고유번호를 입력하세요"
          value={testId}
          onChange={(e) => onIdChange(e.target.value)}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={onSubmit} 
        disabled={isSubmitting}
      >
        {isSubmitting ? "생성 중..." : "시험 생성하기"}
      </Button>
    </div>
  );
};

export default TestForm;
