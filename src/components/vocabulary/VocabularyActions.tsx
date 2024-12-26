import { Button } from "@/components/ui/button";
import { Plus, FileDown, Book } from "lucide-react";

interface VocabularyActionsProps {
  onAddEntry: () => void;
  isAddingEntry: boolean;
  onSaveNewEntry: () => void;
  onCancelNewEntry: () => void;
  onDownloadPDF: () => void;
  onShowVocabularyApp: () => void;
}

export const VocabularyActions = ({
  onAddEntry,
  isAddingEntry,
  onSaveNewEntry,
  onCancelNewEntry,
  onDownloadPDF,
  onShowVocabularyApp
}: VocabularyActionsProps) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="space-x-2">
        {isAddingEntry ? (
          <>
            <Button onClick={onSaveNewEntry} variant="default">
              저장
            </Button>
            <Button onClick={onCancelNewEntry} variant="outline">
              취소
            </Button>
          </>
        ) : (
          <Button onClick={onAddEntry} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            새 단어 추가
          </Button>
        )}
      </div>
      <div className="space-x-2">
        <Button onClick={onShowVocabularyApp} variant="outline">
          <Book className="w-4 h-4 mr-2" />
          단어장 생성
        </Button>
        <Button onClick={onDownloadPDF} variant="default">
          <FileDown className="w-4 h-4 mr-2" />
          문서 저장
        </Button>
      </div>
    </div>
  );
};