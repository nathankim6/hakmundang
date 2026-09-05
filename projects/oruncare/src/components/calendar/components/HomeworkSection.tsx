
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';

interface HomeworkSectionProps {
  content?: string;
  onContentChange: (content: string) => void;
  isReadOnly?: boolean;
  isSaving?: boolean;
}

export const HomeworkSection = ({
  content,
  onContentChange,
  isReadOnly = false,
  isSaving = false,
}: HomeworkSectionProps) => {
  const [localContent, setLocalContent] = useState(content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef(content);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasContentChanged = useRef(false);
  const userIsTypingRef = useRef(false);

  // Sync with external content changes but only when not editing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      contentRef.current = content;
      return;
    }
    
    // CRITICAL: Never update local content when user is actively typing
    if (isEditing || userIsTypingRef.current) return;
    
    // Only update local content when prop changes and we're not editing
    if (content !== contentRef.current && content !== localContent) {
      setLocalContent(content || '');
      contentRef.current = content;
    }
  }, [content, isEditing, localContent]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'; // Minimum height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 60)}px`; // Max 60px
    }
  }, [localContent]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Final save before unmounting if content has changed
      if (hasContentChanged.current && localContent !== contentRef.current) {
        console.log("Final save on unmount");
        onContentChange(localContent);
      }
    };
  }, [localContent, onContentChange]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    userIsTypingRef.current = true;
    setLocalContent(newContent);
    hasContentChanged.current = newContent !== contentRef.current;
    
    // Cancel any previous timeout save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Don't schedule a save if content is unchanged
    if (!hasContentChanged.current) return;
    
    // Schedule content save with delay
    saveTimeoutRef.current = setTimeout(() => {
      if (hasContentChanged.current && !isReadOnly) {
        console.log("Saving homework content on timeout");
        onContentChange(newContent);
        contentRef.current = newContent;
        hasContentChanged.current = false;
      }
      saveTimeoutRef.current = null;
      userIsTypingRef.current = false;
    }, 1500);
  };

  const handleFocus = () => {
    setIsEditing(true);
    userIsTypingRef.current = true;
  };

  const handleBlur = () => {
    // Add a small delay to ensure any focus-related state has settled
    setTimeout(() => {
      setIsEditing(false);
      
      // Cancel any pending timeout save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      // Save immediately on blur if content changed
      if (hasContentChanged.current) {
        console.log("Saving homework content on blur");
        onContentChange(localContent);
        contentRef.current = localContent;
        hasContentChanged.current = false;
      }
      
      // Reset typing flag with a slight delay to prevent immediate external updates
      setTimeout(() => {
        userIsTypingRef.current = false;
      }, 200);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="h-3.5 w-3.5 text-primary" />
        <Label className="text-[11px] font-medium text-gray-600 whitespace-nowrap">과제</Label>
        {isSaving && (
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping ml-1"></div>
        )}
      </div>
      <div className={`relative rounded-md overflow-hidden transition-all duration-200 ${isSaving ? 'ring-2 ring-blue-300' : ''}`}>
        <Textarea
          ref={textareaRef}
          placeholder={isReadOnly ? "로그인이 필요합니다" : "과제 내용 입력"}
          value={localContent}
          onChange={handleContentChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`w-full min-h-[36px] max-h-[60px] py-1.5 px-2.5 text-xs resize-none rounded-md focus:border-primary/60 focus-visible:ring-primary/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none overflow-hidden ${
            isReadOnly 
              ? 'bg-gray-50 text-gray-500' 
              : 'bg-white/90 hover:bg-white transition-colors duration-200'
          } ${
            isSaving ? 'border-blue-400/60' : 'border-gray-200/80'
          }`}
          readOnly={isReadOnly}
          disabled={isReadOnly || isSaving}
          style={{ 
            height: '36px',
            boxShadow: isEditing ? '0 2px 8px rgba(155, 135, 245, 0.15)' : 'none'
          }}
        />
        {isSaving && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50/40 to-transparent animate-shimmer pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};
