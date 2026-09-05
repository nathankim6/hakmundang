
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { getCategoryColor } from "@/utils/problemTypeUtils";

type ProblemTypeCardProps = {
  item: {
    name: string;
    value: number;
    percentage: string;
  };
  index: number;
  themeColors: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    light: string;
    vibrant: string;
    pastel: string;
    accent2: string;
    highlight: string;
  };
};

const ProblemTypeCard: React.FC<ProblemTypeCardProps> = ({ item, index, themeColors }) => {
  const gradientClass = getCategoryColor(item.name, index);
  
  return (
    <div 
      className="relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px] group"
      style={{
        background: `linear-gradient(165deg, white, ${themeColors.light}10)`,
        borderLeft: `2px solid ${themeColors.primary}`,
        borderTop: `1px solid ${themeColors.light}90`,
        borderRight: `1px solid ${themeColors.light}50`,
        borderBottom: `1px solid ${themeColors.light}50`,
      }}
    >
      {/* Decorative top accent bar with category color */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`}></div>
      
      {/* Glass-like header with category name */}
      <div className="flex items-center justify-between p-2 border-b" style={{
        background: `linear-gradient(to right, ${themeColors.pastel}40, ${themeColors.light}10)`,
        borderBottom: `1px solid ${themeColors.light}50`
      }}>
        <h4 className="text-gray-800 font-medium text-xs flex-1 break-words">{item.name}</h4>
        
        {/* Badge showing problem count */}
        <Badge className="ml-1 font-medium text-xs shadow-sm whitespace-nowrap px-1.5 py-0" style={{
          background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.vibrant})`,
          color: 'white'
        }}>
          {item.value}문항
        </Badge>
      </div>
      
      {/* Card content - simplified without gauge */}
      <div className="p-2 text-center">
        <div className="flex flex-col items-center space-y-1">
          <span 
            className="text-lg font-bold" 
            style={{ color: themeColors.primary }}
          >
            {item.percentage}%
          </span>
          <span className="text-xs text-gray-500">출제 비율</span>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10 rounded-tl-full" style={{ 
        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.vibrant})`,
        transform: 'translate(40%, 40%)'
      }}></div>
    </div>
  );
};

export default ProblemTypeCard;
