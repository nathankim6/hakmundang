
import { useCallback, useEffect } from 'react';
import { ReportHighlight } from "@/integrations/supabase/reportService";
import { saveRangeInfo } from "@/utils/highlightUtils";
import { toast } from "sonner";

interface UseKeyboardShortcutsProps {
  highlights: ReportHighlight[];
  highlightColor: string;
  addHighlight: (highlight: ReportHighlight) => void;
  removeHighlight: (id: string) => void;
}

export const useKeyboardShortcuts = ({
  highlights,
  highlightColor,
  addHighlight,
  removeHighlight
}: UseKeyboardShortcutsProps) => {
  // Function to handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if Ctrl+1 is pressed for highlighting
    if (e.ctrlKey && e.key === '1') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        // Get the selected text
        const selectedText = selection.toString();
        if (selectedText.trim() === '') return;

        // Store the range information before making any DOM changes
        const range = selection.getRangeAt(0);
        const rangeInfo = saveRangeInfo(range);
        
        if (!rangeInfo) {
          toast.error('선택 영역 저장에 실패했습니다.');
          return;
        }

        // Create a highlight marker
        const span = document.createElement('span');
        const uniqueId = `highlight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        span.id = uniqueId;
        span.className = 'highlighted-text';
        span.style.backgroundColor = highlightColor;

        // Apply highlighting
        try {
          range.surroundContents(span);
          selection.removeAllRanges(); // Clear selection

          // Add to highlights
          const newHighlight: ReportHighlight = {
            id: uniqueId,
            text: selectedText,
            color: highlightColor,
            serializedRange: JSON.stringify(rangeInfo),
            range: rangeInfo
          };
          
          addHighlight(newHighlight);
          toast.success('텍스트가 하이라이트 되었습니다.');
        } catch (error) {
          console.error("Highlighting error:", error);
          toast.error('텍스트 하이라이팅에 실패했습니다. 다시 시도해주세요.');
        }
        e.preventDefault();
      }
    }

    // Check if Ctrl+2 is pressed for removing highlight
    if (e.ctrlKey && e.key === '2') {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      // Get the selected text
      const range = selection.getRangeAt(0);
      const selectedNode = range.commonAncestorContainer;
      
      // Check if selection is inside a highlighted text or contains highlighted text
      let highlightElement = null;
      
      // If the selection is directly within a highlighted span
      if (selectedNode.parentNode && 
          selectedNode.parentNode.nodeType === Node.ELEMENT_NODE && 
          (selectedNode.parentNode as Element).classList?.contains('highlighted-text')) {
        highlightElement = selectedNode.parentNode;
      } 
      // If the selection is across a highlighted span
      else if (selectedNode.nodeType === Node.ELEMENT_NODE && 
              (selectedNode as Element).classList?.contains('highlighted-text')) {
        highlightElement = selectedNode;
      }
      
      // If we found a highlight element, remove it
      if (highlightElement && highlightElement.id) {
        const highlightId = highlightElement.id;
        const text = highlightElement.textContent || '';
        
        // Replace the highlight with its text content
        const textNode = document.createTextNode(text);
        highlightElement.parentNode?.replaceChild(textNode, highlightElement);
        
        // Remove from state
        removeHighlight(highlightId);
        selection.removeAllRanges(); // Clear selection
        toast.info('하이라이트가 제거되었습니다.');
        e.preventDefault();
      } else {
        toast.info('선택한 영역에 하이라이트가 없습니다.');
      }
    }

    // Check if Ctrl+Z is pressed for undo
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault(); // Prevent default browser undo

      if (highlights.length > 0) {
        const lastHighlight = highlights[highlights.length - 1];

        // Remove the highlight from DOM
        const highlightElement = document.getElementById(lastHighlight.id);
        if (highlightElement && lastHighlight.text) {
          // Replace the highlight with its original text content
          const textNode = document.createTextNode(lastHighlight.text);
          highlightElement.parentNode?.replaceChild(textNode, highlightElement);

          // Remove from state
          removeHighlight(lastHighlight.id);
          toast.info('하이라이트가 취소되었습니다.');
        }
      } else {
        toast.info('더 이상 취소할 하이라이트가 없습니다.');
      }
    }
  }, [highlights, highlightColor, addHighlight, removeHighlight]);

  // Add event listener for keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null; // This hook doesn't return anything to render
};

export default useKeyboardShortcuts;
