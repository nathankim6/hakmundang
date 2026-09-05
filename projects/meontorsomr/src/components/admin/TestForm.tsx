
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TestFormProps {
  testTitle: string;
  testId: string;
  onTitleChange: (value: string) => void;
  onIdChange: (value: string) => void;
  onSubmit: () => void;
}

const TestForm = ({ testTitle, testId, onTitleChange, onIdChange, onSubmit }: TestFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testTitle" className="text-emerald-700 font-medium">시험 제목</Label>
        <Input
          id="testTitle"
          value={testTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="시험 제목을 입력하세요"
          className="w-full border-emerald-200 focus:border-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="testId" className="text-emerald-700 font-medium">시험 고유번호</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="testId"
            value={testId}
            onChange={(e) => onIdChange(e.target.value)}
            placeholder="고유번호를 입력하세요"
            className="flex-1 border-emerald-200 focus:border-emerald-500"
          />
          <Button
            onClick={onSubmit}
            className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
          >
            시험 생성하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestForm;
