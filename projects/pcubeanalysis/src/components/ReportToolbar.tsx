
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Highlighter,
  Download
} from "lucide-react";
import ThemeSelector from './ThemeSelector';
import { ThemeType } from '@/utils/themeColorUtils';
import HighlightMenu from './HighlightMenu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ReportToolbarProps {
  onNavigateBack: () => void;
  onPrintPDF: () => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  highlightColor: string;
  setHighlightColor: (color: string) => void;
  themeColors: any;
  title?: string; // Add title prop
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onNavigateBack,
  onPrintPDF,
  theme,
  onThemeChange,
  highlightColor,
  setHighlightColor,
  themeColors,
  title
}) => {
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);

  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <div className="flex items-center mb-2 sm:mb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateBack}
          className="text-gray-600 hover:text-gray-900 hover:bg-white/50"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">목록으로</span>
        </Button>
        {/* Remove title display */}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={isHighlightMenuOpen} onOpenChange={setIsHighlightMenuOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 flex items-center"
            >
              <div 
                className="w-3 h-3 rounded-full mr-1.5" 
                style={{ backgroundColor: highlightColor }}
              ></div>
              <Highlighter className="mr-1 h-4 w-4" />
              <span>형광펜</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto">
            <HighlightMenu 
              setHighlightColor={setHighlightColor} 
              onClose={() => setIsHighlightMenuOpen(false)}
              theme={theme}
            />
          </PopoverContent>
        </Popover>
        
        <Button
          variant="default"
          size="sm"
          onClick={onPrintPDF}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center shadow-sm"
        >
          <Download className="mr-1 h-4 w-4" />
          <span>PDF 저장</span>
        </Button>

        <ThemeSelector 
          currentTheme={theme}
          onThemeChange={onThemeChange}
        />
      </div>
    </div>
  );
};

export default ReportToolbar;
