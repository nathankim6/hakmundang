import { toPng } from 'html-to-image';
import { toast } from 'sonner';

const captureToDataUrl = async (
  element: HTMLElement,
  options: { width?: number; height?: number } = {}
): Promise<string> => {
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    width: options.width ?? element.scrollWidth,
    height: options.height ?? element.scrollHeight,
    style: { transform: 'none' },
    filter: (node: HTMLElement) => {
      // 캡처/PDF에서 숨길 요소 제외 (print:hidden, .capture-hide, data-capture-hide)
      if (!(node instanceof HTMLElement)) return true;
      if (node.classList?.contains('capture-hide')) return false;
      if (node.classList?.contains('print:hidden')) return false;
      if (node.dataset?.captureHide !== undefined) return false;
      return true;
    },
  });
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Capture entire element
export const captureElement = async (element: HTMLElement | null, fileName: string = 'report'): Promise<void> => {
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const dataUrl = await captureToDataUrl(element);
    const link = document.createElement('a');
    link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to capture element:', error);
    toast.error('이미지 캡처에 실패했습니다.');
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

    const dataUrlFull = await captureToDataUrl(element);
    const fullImg = await loadImage(dataUrlFull);

    // Create a new canvas for the selected area
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Scale the selection area by the same pixelRatio used during capture
    const scaleFactor = 2;
    
    // Set dimensions for the new canvas
    croppedCanvas.width = selectionArea.width * scaleFactor;
    croppedCanvas.height = selectionArea.height * scaleFactor;
    
    // Draw the selected portion onto the new canvas
    ctx.drawImage(
      fullImg,
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

    const dataUrl = await captureToDataUrl(document.body, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
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

    const dataUrl = await captureToDataUrl(scrollContainer, {
      width: scrollContainer.scrollWidth,
      height: scrollContainer.scrollHeight,
    });
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
