import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

// Capture entire element
export const captureElement = async (element: HTMLElement | null, fileName: string = 'report'): Promise<void> => {
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Use html2canvas to render the element to a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true, // Enable CORS for images
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });

    // Convert the canvas to a data URL and create a download link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to capture element:', error);
    toast.error('이미지 캡처에 실패했습니다.');
  }
};

export const printElementAsImage = async (
  element: HTMLElement | null,
  options: { scale?: number; backgroundColor?: string; fileName?: string } = {}
): Promise<void> => {
  if (!element) {
    toast.error('저장할 영역을 찾을 수 없습니다.');
    return;
  }

  try {
    const scale = options.scale ?? 2;
    const rect = element.getBoundingClientRect();
    const renderWidth = Math.max(1, Math.ceil(rect.width));
    const renderHeight = Math.max(
      1,
      Math.ceil(rect.height),
      element.scrollHeight,
      element.clientHeight
    );

    const dataUrl = await toPng(element, {
      pixelRatio: scale,
      backgroundColor: options.backgroundColor ?? '#ffffff',
      cacheBust: true,
      skipFonts: true,
      width: renderWidth,
      height: renderHeight,
      canvasWidth: renderWidth,
      canvasHeight: renderHeight,
      style: {
        transform: 'none',
        width: `${renderWidth}px`,
        height: `${renderHeight}px`,
      },
    });

    const widthMm = Math.max(1, Math.floor(renderWidth * 0.2645833));
    const heightMm = Math.max(1, Math.floor(renderHeight * 0.2645833));
    const orientation = widthMm >= heightMm ? 'landscape' : 'portrait';
    const fileName = options.fileName ?? 'report';

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    });

    pdf.setPage(1);
    pdf.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    pdf.save(`${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Failed to save element as PDF:', error);
    toast.error('화면 그대로 PDF 저장에 실패했습니다.');
  }
};

// Interface for selected area
export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Capture selected area
export const captureSelectedArea = async (
  element: HTMLElement | null, 
  selectionArea: SelectionArea, 
  fileName: string = 'report'
): Promise<void> => {
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    toast.info("영역 캡처 중...");
    
    // First capture the full element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create a new canvas for the selected area
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Scale the selection area by the same scale factor used in html2canvas
    const scaleFactor = 2;
    
    // Set dimensions for the new canvas
    croppedCanvas.width = selectionArea.width * scaleFactor;
    croppedCanvas.height = selectionArea.height * scaleFactor;
    
    // Draw the selected portion onto the new canvas
    ctx.drawImage(
      canvas, 
      selectionArea.x * scaleFactor, selectionArea.y * scaleFactor, 
      selectionArea.width * scaleFactor, selectionArea.height * scaleFactor,
      0, 0, selectionArea.width * scaleFactor, selectionArea.height * scaleFactor
    );
    
    // Convert to data URL and trigger download
    const dataUrl = croppedCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName}-selection-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success("선택 영역이 이미지로 저장되었습니다.");
  } catch (error) {
    console.error('Failed to capture selected area:', error);
    toast.error('선택 영역 캡처에 실패했습니다.');
  }
};

// Capture visible area (full viewport)
export const captureVisibleArea = async (fileName: string = 'screen-capture'): Promise<void> => {
  try {
    toast.info("화면 전체 캡처 중...");
    
    // Use html2canvas to capture the entire visible area
    const canvas = await html2canvas(document.body, {
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    // Convert to data URL and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName}-visible-area-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success("화면이 이미지로 저장되었습니다.");
  } catch (error) {
    console.error('Failed to capture visible area:', error);
    toast.error('화면 캡처에 실패했습니다.');
  }
};

// Capture long scrolling content
export const captureScrollContent = async (
  scrollContainer: HTMLElement | null,
  fileName: string = 'full-page'
): Promise<void> => {
  if (!scrollContainer) {
    console.error('Scroll container not found');
    toast.error('스크롤 컨테이너를 찾을 수 없습니다.');
    return;
  }

  try {
    toast.info("긴 콘텐츠 캡처 중...");
    
    // Use html2canvas with full scrollHeight
    const canvas = await html2canvas(scrollContainer, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: scrollContainer.scrollWidth,
      windowHeight: scrollContainer.scrollHeight,
      width: scrollContainer.scrollWidth,
      height: scrollContainer.scrollHeight
    });
    
    // Convert to data URL and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success("전체 콘텐츠가 이미지로 저장되었습니다.");
  } catch (error) {
    console.error('Failed to capture scroll content:', error);
    toast.error('스크롤 콘텐츠 캡처에 실패했습니다.');
  }
};
