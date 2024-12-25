import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import { WordEntry } from "@/types/word";
import { exportToExcel, exportToPDF } from "@/utils/tableExport";
import { useToast } from "@/components/ui/use-toast";

interface SynonymTableActionsProps {
  words: WordEntry[];
  onAdd: () => void;
}

export const SynonymTableActions = ({ words, onAdd }: SynonymTableActionsProps) => {
  const { toast } = useToast();

  return (
    <div className="flex justify-between items-center">
      <Button onClick={onAdd} variant="outline" className="gap-2">
        <Plus className="w-4 h-4" />
        새 항목 추가
      </Button>
      <div className="flex gap-2">
        <Button 
          onClick={() => exportToExcel(words, toast)} 
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          엑셀 파일로 저장
        </Button>
        <Button 
          onClick={() => exportToPDF(words, toast)} 
          variant="secondary" 
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          PDF 파일로 저장
        </Button>
      </div>
    </div>
  );
};