
import React from 'react';
import { ThemeType, themeColorMap } from '@/utils/themeColorUtils';

interface HighlightMenuProps {
  setHighlightColor: (color: string) => void;
  onClose: () => void;
  theme?: ThemeType;
}

const HighlightMenu: React.FC<HighlightMenuProps> = ({ 
  setHighlightColor, 
  onClose,
  theme = 'blue'
}) => {
  const handleColorSelect = (color: string) => {
    setHighlightColor(color);
    onClose();
  };

  // Define highlight colors: yellow, blue, green, red
  const highlightColors = [
    '#ffff00', // Yellow
    '#00bfff', // Blue
    '#00ff7f', // Green
    '#ff6b6b'  // Red
  ];

  return (
    <div id="highlightMenu" className="absolute right-0 mt-2 z-30 bg-white rounded-lg shadow-lg p-3 w-64">
      <div className="text-sm font-medium mb-2">형광펜 옵션</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {highlightColors.map((color, index) => (
          <button
            key={index}
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
          ></button>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        텍스트를 선택하고 Ctrl+1을 누르면 하이라이트가 됩니다.<br />
        하이라이트된 텍스트를 선택하고 Ctrl+2를 누르면 하이라이트가 제거됩니다.<br />
        Ctrl+Z를 누르면 마지막 하이라이트가 취소됩니다.
      </div>
    </div>
  );
};

export default HighlightMenu;
