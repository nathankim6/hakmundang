
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentListFooterProps {
  selectedCount: number;
  totalCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export const StudentListFooter = ({
  selectedCount,
  totalCount,
  onCancel,
  onConfirm,
  isLoading,
  onSelectAll,
  allSelected,
}: StudentListFooterProps) => {
  return (
    <div className="fixed bottom-0 right-0 p-4 bg-gradient-to-r from-white/95 via-white/98 to-white/95 backdrop-blur-md border-t border-gray-200/60 shadow-lg w-full z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            className="h-5 w-5 text-primary/90 border-gray-300/80 rounded-sm"
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-gray-700 cursor-pointer">
            전체 선택 <span className="text-primary/90">({selectedCount}/{totalCount}명)</span>
          </label>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300/80 hover:bg-gray-50/90"
          >
            취소
          </Button>
          <Button
            onClick={() => {
              if (!isLoading && selectedCount > 0) {
                onConfirm();
              }
            }}
            disabled={selectedCount === 0 || isLoading}
            className={`bg-gradient-to-r from-primary/90 to-primary-light/90 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isLoading ? "처리 중..." : "시험 일정 추가"}
          </Button>
        </div>
      </div>
    </div>
  );
};
