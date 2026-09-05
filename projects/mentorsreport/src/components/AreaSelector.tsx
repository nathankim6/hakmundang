
import React, { useState, useRef, useEffect } from 'react';
import { Square, ZoomIn, ZoomOut } from 'lucide-react';

interface AreaSelectorProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  imageUrl?: string;
  onSelectionComplete?: (area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onAreaSelected?: (area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  zoom?: number;
  themeColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    light: string;
  };
}

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const AreaSelector: React.FC<AreaSelectorProps> = ({ 
  containerRef, 
  imageUrl,
  onSelectionComplete,
  onAreaSelected,
  zoom = 1,
  themeColors = {
    primary: "#2563eb",
    secondary: "#0ea5e9",
    tertiary: "#3b82f6",
    accent: "#60a5fa",
    light: "#93c5fd"
  }
}) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(true); // Start in selection mode
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(zoom);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const localContainerRef = useRef<HTMLDivElement>(null);
  
  // Update zoomLevel when zoom prop changes
  useEffect(() => {
    setZoomLevel(zoom);
  }, [zoom]);
  
  // Function to initialize the selection overlay
  useEffect(() => {
    const targetRef = containerRef || localContainerRef;
    if (targetRef.current && overlayRef.current && isSelecting) {
      const container = targetRef.current;
      const rect = container.getBoundingClientRect();
      
      overlayRef.current.style.position = 'absolute';
      overlayRef.current.style.top = `0px`;
      overlayRef.current.style.left = `0px`;
      overlayRef.current.style.width = `${rect.width}px`;
      overlayRef.current.style.height = `${rect.height}px`;
      overlayRef.current.style.display = 'block';
      overlayRef.current.style.zIndex = '9999';
    }
  }, [isSelecting, containerRef]);
  
  // Function to handle mouse down event
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!overlayRef.current || isPanning) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    setSelection({
      x,
      y,
      width: 0,
      height: 0
    });
  };
  
  // Function to handle mouse move event
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPoint || !overlayRef.current || !selection || isPanning) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y)
    });
  };
  
  // Function to handle mouse up event
  const handleMouseUp = () => {
    if (selection && selection.width > 10 && selection.height > 10) {
      if (onSelectionComplete) onSelectionComplete(selection);
      if (onAreaSelected) onAreaSelected(selection);
    }
    
    setStartPoint(null);
    setSelection(null);
  };
  
  // Function to handle panning
  const handlePanStart = (e: React.MouseEvent) => {
    if (!isPanning || !imageContainerRef.current) return;
    
    setPanStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart || !imageContainerRef.current) return;
    
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    
    setPanPosition({
      x: panPosition.x + deltaX,
      y: panPosition.y + deltaY
    });
    
    setPanStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handlePanEnd = () => {
    setPanStart(null);
  };

  // Function to toggle panning mode
  const togglePanMode = () => {
    setIsPanning(!isPanning);
    setIsSelecting(isPanning); // Turn on selecting when turning off panning
  };
  
  // Function to handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 3));
  };
  
  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  };
  
  // Clean up function when component unmounts
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
      }
    };
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2 items-center">
        <button
          onClick={() => setIsSelecting(true)}
          className={`flex items-center gap-2 transition-all duration-300 rounded-full px-3 py-1 text-sm shadow-sm ${
            isSelecting 
              ? 'bg-blue-600 text-white animate-pulse' 
              : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:shadow-md'
          }`}
          disabled={isPanning}
        >
          <Square
            size={14}
            className={isSelecting ? 'animate-pulse' : ''}
            style={{ color: isSelecting ? 'white' : themeColors.primary }}
          />
          <span style={{ color: isSelecting ? 'white' : themeColors.primary }}>
            {isSelecting ? '영역 선택 중' : '영역 선택'}
          </span>
        </button>
        
        <button
          onClick={handleZoomIn}
          className="p-1 bg-white/80 rounded-full shadow-sm hover:shadow-md hover:bg-white/90 transition-all"
          title="확대"
        >
          <ZoomIn size={18} style={{ color: themeColors.primary }} />
        </button>
        
        <button
          onClick={handleZoomOut}
          className="p-1 bg-white/80 rounded-full shadow-sm hover:shadow-md hover:bg-white/90 transition-all"
          title="축소"
        >
          <ZoomOut size={18} style={{ color: themeColors.primary }} />
        </button>
        
        <button
          onClick={togglePanMode}
          className={`p-1 rounded-full shadow-sm hover:shadow-md transition-all ${
            isPanning 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/80 hover:bg-white/90'
          }`}
          title="이동 모드"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isPanning ? 'white' : themeColors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l3-3 3 3M19 9l3 3-3 3M2 12h20M12 2v20"/>
          </svg>
        </button>
        
        <span className="text-xs text-gray-500">{Math.round(zoomLevel * 100)}%</span>
      </div>
      
      <div ref={localContainerRef} className="relative overflow-hidden">
        {/* If imageUrl is provided, display the image for selection */}
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Selection area" 
            className="max-w-full"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
              transformOrigin: 'center',
              transition: 'transform 0.1s ease'
            }}
          />
        )}
        
        {isSelecting && (
          <div
            ref={overlayRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              cursor: 'crosshair',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {selection && (
              <div
                style={{
                  position: 'absolute',
                  border: `2px dashed ${themeColors.primary}`,
                  backgroundColor: `${themeColors.accent}30`,
                  left: `${selection.x}px`,
                  top: `${selection.y}px`,
                  width: `${selection.width}px`,
                  height: `${selection.height}px`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
                }}
              />
            )}
          </div>
        )}
        
        <div 
          ref={imageContainerRef}
          className="relative overflow-hidden"
          style={{ 
            cursor: isPanning ? 'move' : 'default'
          }}
          onMouseDown={isPanning ? handlePanStart : undefined}
          onMouseMove={isPanning ? handlePanMove : undefined}
          onMouseUp={isPanning ? handlePanEnd : undefined}
          onMouseLeave={isPanning ? handlePanEnd : undefined}
        >
          {containerRef?.current && (
            <div
              className="transform origin-center"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                transition: 'transform 0.1s ease'
              }}
            >
              {/* The content is rendered inside containerRef */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaSelector;
