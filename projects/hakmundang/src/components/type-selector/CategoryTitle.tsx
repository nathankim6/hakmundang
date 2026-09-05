import { Layers, Book, PenTool, Sparkles, Wrench } from "lucide-react";

interface CategoryTitleProps {
  children: React.ReactNode;
}

const getCategoryIcon = (title: string) => {
  switch (title) {
    case "수능형":
      return <Book className="w-5 h-5 text-gray-400" />;
    case "내신형":
      return <PenTool className="w-5 h-5 text-gray-400" />;
    case "서답형":
      return <Layers className="w-5 h-5 text-gray-400" />;
    case "워크북 제작":
      return <Wrench className="w-5 h-5 text-gray-400" />;
    case "기타 콘텐츠":
      return <Sparkles className="w-5 h-5 text-gray-400" />;
    default:
      return null;
  }
};

export const CategoryTitle = ({ children }: CategoryTitleProps) => (
  <div className="flex items-center justify-center mb-6">
    <h3 className="relative group">
      <div className="flex items-center gap-3 px-6 py-2 relative">
        {/* Icon with animation */}
        <span className="relative z-10 transition-transform group-hover:scale-110 duration-300">
          {getCategoryIcon(children as string)}
        </span>
        
        {/* Title text with gradient and shimmer effect */}
        <span className="relative z-10 text-lg font-bold bg-gradient-to-r from-gray-600 via-gray-800 to-gray-600 bg-clip-text text-transparent font-['Orbitron'] tracking-wider animate-text-shine">
          {children}
        </span>

        {/* Always visible underline effect (removed hover-dependent classes) */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent transform transition-transform duration-300" />
      </div>

      {/* Enhanced glow effect */}
      <div className="absolute inset-0 bg-gray-50/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </h3>
  </div>
);