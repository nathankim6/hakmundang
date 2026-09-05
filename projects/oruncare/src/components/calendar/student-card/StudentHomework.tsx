
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { BookCheck } from "lucide-react";
import { HomeworkSection } from "../components/HomeworkSection";
import { useState, useRef, useEffect } from "react";

interface StudentHomeworkProps {
  homeworkContent: string;
  homeworkCompleted: boolean;
  onHomeworkContentChange: (content: string) => void;
  onHomeworkCompletedChange: (completed: boolean) => void;
  studentId: string;
}

export const StudentHomework = ({
  homeworkContent,
  homeworkCompleted,
  onHomeworkContentChange,
  onHomeworkCompletedChange,
  studentId,
}: StudentHomeworkProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef(homeworkContent);
  const [localContent, setLocalContent] = useState(homeworkContent);
  const isTypingRef = useRef(false);
  const initialLoadComplete = useRef(false);
  
  // Only update local content from props on initial load
  useEffect(() => {
    if (!initialLoadComplete.current && !isTypingRef.current) {
      setLocalContent(homeworkContent);
      lastSavedContent.current = homeworkContent;
      initialLoadComplete.current = true;
    }
  }, [homeworkContent]);
  
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  const handleContentChange = (content: string) => {
    setLocalContent(content);
    isTypingRef.current = true;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (content === lastSavedContent.current) {
      isTypingRef.current = false;
      return;
    }
    
    setIsSaving(true);
    
    saveTimeoutRef.current = setTimeout(() => {
      console.log(`Saving homework content for student ${studentId}`);
      onHomeworkContentChange(content);
      lastSavedContent.current = content;
      setIsSaving(false);
      saveTimeoutRef.current = null;
      isTypingRef.current = false;
    }, 1200);
  };

  return (
    <div className={cn(
      "space-y-2",
      homeworkCompleted ? "border-green-300/80" : "border-gray-200/80"
    )}>
      <div className="w-full">
        <HomeworkSection
          content={localContent}
          onContentChange={handleContentChange}
          isReadOnly={false}
          isSaving={isSaving}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={homeworkCompleted}
          onCheckedChange={(checked) => onHomeworkCompletedChange(checked as boolean)}
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
