
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
        <h4 className="text-gray-800 font-medium text-xs flex-1 truncate">{item.name}</h4>
        
        {/* Badge showing problem count */}
        <Badge className="ml-1 font-medium text-xs shadow-sm whitespace-nowrap px-1.5 py-0" style={{
          background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.vibrant})`,
          color: 'white'
        }}>
          {item.value}문항
        </Badge>
      </div>
      
      {/* Card content with improved circular progress */}
      <div className="p-2 flex items-center justify-between">
        {/* Left side - percentage text */}
        <div className="flex flex-col">
          <span 
            className="text-xl font-bold" 
            style={{ color: themeColors.primary }}
          >
            {item.percentage}%
          </span>
          <span className="text-xs text-gray-500">출제 비율</span>
        </div>
        
        {/* Right side - Circular progress indicator */}
        <div className="relative w-14 h-14">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle 
              cx="60" 
              cy="60" 
              r="54" 
              fill="none" 
              stroke="#f1f5f9" 
              strokeWidth="12"
            />
            
            {/* Progress circle with gradient */}
            <circle 
              cx="60" 
              cy="60" 
              r="54" 
              fill="none" 
              stroke={`url(#gradient-${index})`} 
              strokeWidth="12" 
              strokeLinecap="round" 
              strokeDasharray={`${3.38 * parseInt(item.percentage)} 338`} 
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 3px ${themeColors.primary}80)` }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={themeColors.primary} />
                <stop offset="100%" stopColor={themeColors.vibrant} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
          >
            <span className="text-[0.65rem] font-semibold" style={{ color: themeColors.primary }}>
              {item.value}문항
            </span>
          </div>
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
