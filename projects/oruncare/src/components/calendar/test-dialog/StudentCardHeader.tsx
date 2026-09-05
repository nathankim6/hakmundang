
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/calendar";
import { Edit2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { updateStudentWordbook } from "@/utils/wordbookService";

interface StudentCardHeaderProps {
  student: Student;
  onStudentSelect?: (checked: boolean) => void;
  isSelected?: boolean;
  onWordbookChange?: (wordbook: string) => void;
}

export const StudentCardHeader = ({ 
  student, 
  onStudentSelect, 
  isSelected,
  onWordbookChange 
}: StudentCardHeaderProps) => {
  const [editingWorkbook, setEditingWorkbook] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [displayedWordbook, setDisplayedWordbook] = useState(student.wordbook);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const lastSavedValue = useRef<string>(student.wordbook);

  // Add effect to update editing state when student prop changes
  useEffect(() => {
    if (editingWorkbook === null && student.wordbook !== displayedWordbook) {
      console.log(`StudentCardHeader: Updating displayed wordbook for ${student.name}: ${student.wordbook}`);
      setDisplayedWordbook(student.wordbook);
      lastSavedValue.current = student.wordbook;
    }
  }, [student.wordbook, editingWorkbook, displayedWordbook]);

  // Auto-save the wordbook if component unmounts while editing
  useEffect(() => {
    return () => {
      if (editingWorkbook !== null && editingWorkbook !== lastSavedValue.current) {
        // Only save if there are actual changes and the value isn't empty
        if (editingWorkbook.trim() !== '') {
          console.log(`Auto-saving wordbook on unmount for student ${student.id}: ${editingWorkbook}`);
          updateStudentWordbook(student.id, editingWorkbook, queryClient)
            .catch(error => console.error('Error auto-saving wordbook on unmount:', error));
        }
      }
    };
  }, [student.id, editingWorkbook, queryClient, lastSavedValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  const handleSaveWorkbook = async () => {
    if (!editingWorkbook || editingWorkbook.trim() === '') {
      toast({
        title: "단어장 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent duplicate saves
    if (isSaving) return;
    
    // Skip save if the value hasn't changed
    if (editingWorkbook === lastSavedValue.current) {
      setEditingWorkbook(null);
      return;
    }
    
    // Cancel any pending save
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    
    setIsSaving(true);
    try {
      await updateStudentWordbook(student.id, editingWorkbook, queryClient);
      
      // Update local state for immediate UI feedback
      setDisplayedWordbook(editingWorkbook);
      lastSavedValue.current = editingWorkbook;
      
      // Notify parent component of wordbook change
      if (onWordbookChange) {
        onWordbookChange(editingWorkbook);
      }
      
      toast({
        title: "단어장이 수정되었습니다",
      });

      setEditingWorkbook(null);
    } catch (error) {
      console.error('Error updating workbook:', error);
      toast({
        title: "단어장 수정 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      // Set a timeout before allowing new saves
      saveTimeout.current = setTimeout(() => {
        setIsSaving(false);
        saveTimeout.current = null;
      }, 500);
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkbook(null);
  };

  const handleStartEdit = () => {
    setEditingWorkbook(student.wordbook || displayedWordbook || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveWorkbook();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {onStudentSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onStudentSelect(checked as boolean)}
            className="h-5 w-5"
          />
        )}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
          <div className="flex items-center gap-2">
            {editingWorkbook !== null ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editingWorkbook}
                  onChange={(e) => setEditingWorkbook(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-7 text-sm"
                  disabled={isSaving}
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-7"
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveWorkbook}
                    className="h-7"
                    disabled={isSaving}
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-500">{displayedWordbook || '단어장 미정'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
