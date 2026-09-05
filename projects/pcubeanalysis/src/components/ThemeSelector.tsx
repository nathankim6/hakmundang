
import React from 'react';
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ThemeType, themeColorMap, themeDescriptions } from "@/utils/themeColorUtils";

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
        {Object.keys(themeColorMap).map(theme => (
          <button 
            key={theme} 
            onClick={() => onThemeChange(theme as ThemeType)} 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentTheme === theme ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"}`} 
            style={{
              backgroundColor: themeColorMap[theme as ThemeType].primary,
              borderColor: themeColorMap[theme as ThemeType].primary
            }}
          >
            {currentTheme === theme && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
        ))}
      </div>
      
      <Card className="p-2 shadow-sm bg-white/90 backdrop-blur-sm">
        <div className="text-xs font-medium mb-1.5 flex items-center gap-1">
          <Sparkles size={12} className="text-gray-500" />
          <span className="text-gray-600">왼쪽 버튼으로 테마를 선택하세요</span>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(themeDescriptions).map(([theme, description]) => (
            <div key={theme} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: themeColorMap[theme as ThemeType].primary
              }}></div>
              <span className="text-xs" style={{
                color: themeColorMap[theme as ThemeType].primary
              }}>
                {description}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ThemeSelector;
