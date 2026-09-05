
import { useCallback } from 'react';
import { captureElement, captureSelectedArea, captureVisibleArea, SelectionArea } from "@/utils/captureUtils";
import { toast } from "sonner";

export const useCapture = (reportData: any) => {
  const handleCaptureReport = useCallback(async (reportContainerRef: React.RefObject<HTMLDivElement>) => {
    if (!reportData) return;
    
    toast.info("리포트 캡처 중...");
    await captureElement(
      reportContainerRef.current, 
      `${reportData.school}-${reportData.grade}-시험분석`
    );
    toast.success("리포트가 이미지로 저장되었습니다.");
  }, [reportData]);

  const handleVisibleAreaCapture = useCallback(async () => {
    if (!reportData) return;
    
    toast.info("현재 화면 캡처 중...");
    await captureVisibleArea(`${reportData?.school}-${reportData?.grade}-현재화면`);
    toast.success("현재 화면이 이미지로 저장되었습니다.");
  }, [reportData]);

  const handleScrollCapture = useCallback(async (reportContainerRef: React.RefObject<HTMLDivElement>) => {
    if (!reportData) return;
    
    toast.info("스크롤 전체 캡처 중...");
    await captureSelectedArea(
      reportContainerRef.current, 
      {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      }, 
      `${reportData.school}-${reportData.grade}-스크롤전체`
    );
    toast.success("스크롤 전체가 이미지로 저장되었습니다.");
  }, [reportData]);

  const handleAreaSelectionComplete = useCallback(async (
    reportContainerRef: React.RefObject<HTMLDivElement>,
    area: SelectionArea
  ) => {
    if (!reportData) return;
    
    toast.info("선택 영역 캡처 중...");
    await captureSelectedArea(
      reportContainerRef.current, 
      area, 
      `${reportData.school}-${reportData.grade}-시험분석-선택영역`
    );
    toast.success("선택된 영역이 이미지로 저장되었습니다.");
  }, [reportData]);

  return {
    handleCaptureReport,
    handleVisibleAreaCapture,
    handleScrollCapture,
    handleAreaSelectionComplete
  };
};

export default useCapture;
