
import { useState, useEffect, useCallback } from 'react';
import { ReportHighlight, updateReportHighlights, getReportHighlights } from "@/integrations/supabase/reportService";
import { toast } from "sonner";
import { applyHighlightFromRange, restoreHighlightByText } from "@/utils/highlightUtils";

export const useHighlights = (reportId?: string) => {
  const [highlights, setHighlights] = useState<ReportHighlight[]>([]);
  const [highlightHistory, setHighlightHistory] = useState<ReportHighlight[]>([]);
  const [highlightDebounceTimer, setHighlightDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [highlightColor, setHighlightColor] = useState<string>('#ffff00'); // Default yellow

  // Save highlights with debounce
  const saveHighlights = useCallback((newHighlights: ReportHighlight[]) => {
    if (!reportId) {
      // If no ID (means not yet saved to DB), save to localStorage
      localStorage.setItem("examReportHighlights", JSON.stringify({
        highlights: newHighlights,
        timestamp: new Date().getTime()
      }));
      return;
    }

    // Clear existing timer if there is one
    if (highlightDebounceTimer) {
      clearTimeout(highlightDebounceTimer);
    }

    // Set new timer to save after 500ms of inactivity
    const timer = setTimeout(async () => {
      try {
        // Always update localStorage immediately for quick access
        localStorage.setItem(`highlights-${reportId}`, JSON.stringify({
          highlights: newHighlights,
          timestamp: new Date().getTime()
        }));
        
        const { error } = await updateReportHighlights(reportId, newHighlights);
        if (error) {
          console.error("Failed to save highlights:", error);
          toast.error("하이라이트 저장에 실패했습니다.");
        } else {
          console.log("Highlights saved successfully");
        }
      } catch (error) {
        console.error("Error saving highlights:", error);
      }
    }, 500);
    
    setHighlightDebounceTimer(timer);
  }, [reportId, highlightDebounceTimer]);

  // Load highlights
  const loadHighlights = useCallback(async () => {
    if (reportId) {
      try {
        console.log('Loading highlights for report:', reportId);
        const loadedHighlights = await getReportHighlights(reportId);
        if (loadedHighlights.length > 0) {
          setHighlights(loadedHighlights);
          setHighlightHistory(loadedHighlights);
          console.log('Loaded highlights:', loadedHighlights);
        }
      } catch (error) {
        console.error('Error loading highlights:', error);
      }
    }
  }, [reportId]);

  // Improved restore highlights function
  const restoreHighlights = useCallback((container: HTMLElement | null) => {
    if (!container || !highlights.length) return;
    
    console.log('Attempting to restore highlights:', highlights);
    
    // First try to restore using the exact range information
    const rangeRestored = highlights.map(highlight => {
      // Skip if highlight already exists in DOM
      if (document.getElementById(highlight.id)) {
        return true;
      }
      
      // Try to apply highlight using its range information
      if (highlight.range) {
        return applyHighlightFromRange(highlight);
      }
      
      return false;
    });
    
    // For any highlights that couldn't be restored using ranges, try text-based approach
    let textBasedRestorationCount = 0;
    
    // Try text-based restoration for highlights that couldn't be restored by range
    highlights.forEach((highlight, index) => {
      if (!rangeRestored[index] && !document.getElementById(highlight.id) && highlight.text) {
        const success = restoreHighlightByText(container, highlight);
        if (success) textBasedRestorationCount++;
      }
    });
    
    console.log(`Restored ${textBasedRestorationCount} highlights by text content`);
  }, [highlights]);
  
  // Add a highlight
  const addHighlight = useCallback((highlight: ReportHighlight) => {
    const updatedHighlights = [...highlights, highlight];
    setHighlights(updatedHighlights);
    setHighlightHistory(prev => [...prev, highlight]);
    saveHighlights(updatedHighlights);
  }, [highlights, saveHighlights]);
  
  // Remove a highlight
  const removeHighlight = useCallback((id: string) => {
    const updatedHighlights = highlights.filter(h => h.id !== id);
    setHighlights(updatedHighlights);
    saveHighlights(updatedHighlights);
  }, [highlights, saveHighlights]);

  return {
    highlights,
    highlightColor,
    setHighlightColor,
    saveHighlights,
    loadHighlights,
    restoreHighlights,
    addHighlight,
    removeHighlight
  };
};

export default useHighlights;
