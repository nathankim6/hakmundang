
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { BookCheck, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StudentHomeworkProps {
  homeworkContent: string;
  homeworkCompleted: boolean;
  onHomeworkContentChange: (content: string) => void;
  onHomeworkCompletedChange: (completed: boolean) => void;
}

export const StudentHomework = ({
  homeworkContent,
  homeworkCompleted,
  onHomeworkContentChange,
  onHomeworkCompletedChange,
}: StudentHomeworkProps) => {
  const [localContent, setLocalContent] = useState(homeworkContent || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = useRef(false);
  const pendingChange = useRef(false);
  const initialLoadComplete = useRef(false);
  const lastBlurTime = useRef(0);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Only sync content on initial load
  useEffect(() => {
    if (!initialLoadComplete.current) {
      setLocalContent(homeworkContent || '');
      initialLoadComplete.current = true;
    }
  }, [homeworkContent]);

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [localContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    
    // Reset height to auto to properly calculate the new height
    textarea.style.height = 'auto';
    
    // Set the height to match the scrollHeight (content height)
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    isEditing.current = true;
    pendingChange.current = true;
    setLocalContent(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const handleCompletedChange = (checked: boolean) => {
    onHomeworkCompletedChange(checked);
  };

  const handleBlur = () => {
    // Don't auto-save on blur anymore - wait for manual save
    isEditing.current = false;
    lastBlurTime.current = Date.now();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
      (e.target as HTMLElement).blur();
    }
  };

  // Manual save button handler
  const handleSave = () => {
    // Cancel any pending timeout save
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    
    setIsSaving(true);
    
    // Save content
    console.log("Saving homework content on button click:", localContent);
    onHomeworkContentChange(localContent);
    pendingChange.current = false;
    
    // Show saved confirmation
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "저장 완료",
        description: "과제 내용이 저장되었습니다.",
        duration: 2000,
      });
    }, 500);
  };

  return (
    <div className={cn(
      "flex flex-col pt-3 border-t transition-colors duration-300 w-full",
      homeworkCompleted ? "border-t-green-300/80" : "border-t-gray-200/80"
    )}>
      <div className="w-full mb-2 relative">
        <Textarea
          ref={textareaRef}
          placeholder="과제 내용을 입력하세요"
          value={localContent}
          onChange={handleContentChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            isEditing.current = true;
          }}
          spellCheck={false}
          className={cn(
            "w-full py-2 pr-16 resize-none bg-white/90 transition-colors duration-300",
            homeworkCompleted ? "border-green-300/70" : "border-gray-200/70"
          )}
        />
        <div className="absolute bottom-2 right-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white/80 h-7 px-2" 
            onClick={handleSave}
            disabled={isSaving || (!pendingChange.current && !isEditing.current)}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={homeworkCompleted}
          onCheckedChange={(checked) => handleCompletedChange(checked as boolean)}
          className={cn(
            "transition-all duration-300",
            homeworkCompleted ? 
              "border-green-500/90 data-[state=checked]:bg-green-500/90 hover:bg-green-600/90" : 
              "border-gray-300 hover:border-gray-400"
          )}
        />
        <Label className={cn(
          "text-sm font-medium flex items-center gap-1 transition-colors duration-300 whitespace-nowrap",
          homeworkCompleted ? "text-green-700/90" : "text-gray-700"
        )}>
          <BookCheck className={cn(
            "w-4 h-4 transition-colors duration-300",
            homeworkCompleted ? "text-green-600/90" : "text-gray-500"
          )} />
          과제 완료
        </Label>
      </div>
    </div>
  );
};
