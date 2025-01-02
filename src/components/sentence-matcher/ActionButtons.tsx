import { Button } from '@/components/ui/button';
import { Plus, FileDown, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

interface MatchedSet {
  setNumber: number;
  sentences: Array<{ english: string; korean: string }>;
}

interface ActionButtonsProps {
  matchedSets: MatchedSet[];
  isLoading: boolean;
  onAddPair: () => void;
  onMatch: () => void;
}

export const ActionButtons = ({ matchedSets, isLoading, onAddPair, onMatch }: ActionButtonsProps) => {
  const { toast } = useToast();

  const handleExportExcel = () => {
    if (matchedSets.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "저장할 문장이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      
      matchedSets.forEach((set, setIndex) => {
        const worksheetData = set.sentences.map((sentence, index) => ({
          '번호': index + 1,
          'English': sentence.english,
          '한글': sentence.korean
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Set ${setIndex + 1}`);
      });

      XLSX.writeFile(workbook, 'matched_sentences.xlsx');

      toast({
        title: "내보내기 성공",
        description: "문장이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "내보내기 실패",
        description: "Excel 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <Button
        onClick={onAddPair}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        지문 추가하기
      </Button>
      
      <div className="flex gap-2">
        {matchedSets.length > 0 && (
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Excel로 저장
          </Button>
        )}
        
        <Button
          onClick={onMatch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              처리중...
            </>
          ) : (
            '문장 나누기'
          )}
        </Button>
      </div>
    </div>
  );
};