
import { Input } from '@/components/ui/input';
import { BookOpen, Edit2, Save, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { updateStudentWordbook, getStudentWordbook } from '@/utils/wordbookService';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StudentInfoProps {
  id: string;
  name: string;
  wordbook: string;
  result?: string;
  onWordbookEdit: (studentId: string, newWordbook: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const StudentInfo = ({ 
  id, 
  name, 
  wordbook = '', 
  result, 
  onWordbookEdit,
  isReadOnly = false 
}: StudentInfoProps) => {
  const [editingWorkbook, setEditingWorkbook] = useState<string>(wordbook);
  const [isEditing, setIsEditing] = useState(false);
  const [displayedWordbook, setDisplayedWordbook] = useState(wordbook);
  const [isSaving, setIsSaving] = useState(false);
  const [recentWordbooks, setRecentWordbooks] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialLoadComplete = useRef(false);
  const lastSavedWordbook = useRef(wordbook);
  const studentIdRef = useRef(id);

  // Handle student ID changes properly
  useEffect(() => {
    if (studentIdRef.current !== id) {
      studentIdRef.current = id;
      initialLoadComplete.current = false;
    }
  }, [id]);

  // Load persistent wordbook when component mounts or student changes
  useEffect(() => {
    if (initialLoadComplete.current && studentIdRef.current === id) return;
    
    const persistentWordbook = getStudentWordbook(id, wordbook);
    setDisplayedWordbook(persistentWordbook);
    setEditingWorkbook(persistentWordbook);
    lastSavedWordbook.current = persistentWordbook;
    
    // Load recent wordbooks from localStorage
    try {
      const recent = localStorage.getItem('recent_wordbooks');
      if (recent) {
        setRecentWordbooks(JSON.parse(recent));
      }
    } catch (e) {
      console.error('Failed to load recent wordbooks from localStorage:', e);
    }

    initialLoadComplete.current = true;
  }, [id, wordbook]);

  // Update state if wordbook prop changes and is valid
  useEffect(() => {
    // Skip during initial load to prevent overriding localStorage values
    if (!initialLoadComplete.current) return;
    
    // Prevent unnecessary updates if the value is the same
    if (wordbook === lastSavedWordbook.current) return;

    const persistentWordbook = getStudentWordbook(id, wordbook);
    if (persistentWordbook !== displayedWordbook) {
      console.log(`Wordbook updated for student ${id}: ${wordbook} -> ${persistentWordbook}`);
      setDisplayedWordbook(persistentWordbook);
      lastSavedWordbook.current = persistentWordbook;
      
      if (!isEditing) {
        setEditingWorkbook(persistentWordbook);
      }
    }
  }, [wordbook, id, isEditing, displayedWordbook]);

  // Auto-save the wordbook if component unmounts while editing
  useEffect(() => {
    return () => {
      if (isEditing && editingWorkbook !== displayedWordbook) {
        // Only save if there are actual changes and the value isn't empty
        if (editingWorkbook.trim() !== '') {
          console.log(`Auto-saving wordbook on unmount for student ${id}: ${editingWorkbook}`);
          updateStudentWordbook(id, editingWorkbook, queryClient)
            .catch(error => console.error('Error auto-saving wordbook on unmount:', error));
        }
      }
    };
  }, [id, editingWorkbook, displayedWordbook, isEditing, queryClient]);

  const handleWordbookSave = async () => {
    const trimmedWordbook = editingWorkbook.trim();
    if (!trimmedWordbook) {
      toast({
        title: "단어장 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Update in database and localStorage
      await updateStudentWordbook(id, trimmedWordbook, queryClient);
      
      // Update UI state
      setIsEditing(false);
      setDisplayedWordbook(trimmedWordbook);
      lastSavedWordbook.current = trimmedWordbook;
      setPopoverOpen(false);

      // Call parent handler
      await onWordbookEdit(id, trimmedWordbook);
      
      // Add to recent wordbooks list
      const updatedRecent = Array.from(new Set([trimmedWordbook, ...recentWordbooks])).slice(0, 5);
      setRecentWordbooks(updatedRecent);
      
      try {
        localStorage.setItem('recent_wordbooks', JSON.stringify(updatedRecent));
      } catch (e) {
        console.error('Failed to save recent wordbooks to localStorage:', e);
      }

      toast({
        title: "단어장 이름이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving wordbook:', error);
      toast({
        title: "단어장 이름 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = () => {
    if (isReadOnly) return;
    setEditingWorkbook(displayedWordbook);
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWorkbook(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleWordbookSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingWorkbook(displayedWordbook);
      setPopoverOpen(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingWorkbook(displayedWordbook);
    setPopoverOpen(false);
  };
  
  const selectRecentWordbook = (selected: string) => {
    setEditingWorkbook(selected);
    setPopoverOpen(false);
    
    // Auto-save the selected wordbook after a short delay
    setTimeout(() => {
      handleWordbookSave();
    }, 100);
  };

  return (
    <div className="flex items-center gap-4 min-w-[160px] max-w-[300px] whitespace-nowrap overflow-hidden px-4">
      <span className="font-semibold text-xl text-gray-800">{name}</span>
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-gray-500 flex-shrink-0" />
        {isEditing && !isReadOnly ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Input
                    value={editingWorkbook}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-base min-w-[100px]"
                    placeholder="단어장 이름 입력"
                    autoFocus
                    disabled={isSaving}
                  />
                </PopoverTrigger>
                {recentWordbooks.length > 0 && (
                  <PopoverContent className="p-1 w-[160px]" align="start">
                    <div className="text-xs font-medium text-gray-500 p-1">최근 사용 단어장</div>
                    <div className="flex flex-col gap-1">
                      {recentWordbooks.map((wb, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          className="h-6 justify-start text-xs"
                          onClick={() => selectRecentWordbook(wb)}
                        >
                          {wb}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
              {isSaving && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-7 w-7 hover:bg-gray-100"
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWordbookSave}
                className="h-7 w-7 hover:bg-green-100"
                disabled={isSaving}
              >
                <Save className="h-3.5 w-3.5 text-green-600" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-700 truncate flex-1">
              {displayedWordbook || '단어장 이름 없음'}
            </span>
            {!isReadOnly && (
              <button
                onClick={handleStartEditing}
                className="h-6 w-6 p-0 flex-shrink-0 hover:bg-gray-100 rounded"
                disabled={isSaving}
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
