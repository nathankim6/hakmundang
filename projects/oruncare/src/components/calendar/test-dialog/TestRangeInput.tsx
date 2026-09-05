
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestRangeInputProps {
  wordbook: string;
  rangeStart: number;
  rangeEnd: number;
  onWordbookChange: (value: string) => void;
  onRangeStartChange: (value: number) => void;
  onRangeEndChange: (value: number) => void;
  isDisabled?: boolean;
}

export const TestRangeInput = ({
  wordbook,
  rangeStart,
  rangeEnd,
  onWordbookChange,
  onRangeStartChange,
  onRangeEndChange,
  isDisabled = false
}: TestRangeInputProps) => {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label>단어장</Label>
          <Input 
            value={wordbook}
            onChange={(e) => onWordbookChange(e.target.value)}
            placeholder="단어장을 입력하세요"
            disabled={isDisabled}
          />
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <Label>시험 범위</Label>
            <Input 
              type="number"
              className="w-24"
              value={rangeStart}
              onChange={(e) => onRangeStartChange(Number(e.target.value))}
              disabled={isDisabled}
            />
          </div>
          <span className="mb-2">~</span>
          <div className="mb-2">
            <Input 
              type="number"
              className="w-24"
              value={rangeEnd}
              onChange={(e) => onRangeEndChange(Number(e.target.value))}
              disabled={isDisabled}
            />
          </div>
          <span className="mb-2">일차</span>
        </div>
      </div>
    </div>
  );
};
