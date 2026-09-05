
import React from 'react';
import { Zap, Sparkles, Lightbulb } from 'lucide-react';

interface StatsCardProps {
  label: string;
  subLabel: string;
  icon?: "easy" | "auto" | "fine";
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  subLabel, 
  icon = "easy",
  description 
}) => {
  const getIcon = () => {
    switch (icon) {
      case "easy":
        return <Zap className="h-8 w-8 text-amber-500" />;
      case "auto":
        return <Sparkles className="h-8 w-8 text-indigo-500" />;
      case "fine":
        return <Lightbulb className="h-8 w-8 text-emerald-500" />;
      default:
        return <Zap className="h-8 w-8 text-amber-500" />;
    }
  };

  const getBgGradient = () => {
    switch (icon) {
      case "easy":
        return "from-amber-500/5 to-amber-500/20";
      case "auto":
        return "from-indigo-500/5 to-indigo-500/20";
      case "fine":
        return "from-emerald-500/5 to-emerald-500/20";
      default:
        return "from-indigo-500/5 to-indigo-500/20";
    }
  };

  const getTextColor = () => {
    switch (icon) {
      case "easy":
        return "from-amber-600 to-orange-600";
      case "auto":
        return "from-indigo-600 to-purple-600";
      case "fine":
        return "from-emerald-600 to-teal-600";
      default:
        return "from-indigo-600 to-purple-600";
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getBgGradient()} p-5 rounded-xl border border-indigo-100 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 shadow-md group`}>
      <div className="mb-3 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        {getIcon()}
      </div>
      <span className={`text-2xl font-bold bg-gradient-to-r ${getTextColor()} bg-clip-text text-transparent mb-1`}>
        {label}
      </span>
      <span className="text-sm font-medium text-indigo-600 mb-2">
        {subLabel}
      </span>
      {description && (
        <p className="text-xs text-gray-500 mt-2 opacity-70 group-hover:opacity-100 transition-opacity max-w-[150px]">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
