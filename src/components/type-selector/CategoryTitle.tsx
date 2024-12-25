import { Sparkles } from "lucide-react";

interface CategoryTitleProps {
  children: React.ReactNode;
}

export const CategoryTitle = ({ children }: CategoryTitleProps) => (
  <div className="flex items-center justify-center mb-6">
    <div className="relative group">
      <h3 className="text-lg font-bold px-8 py-3 text-[#1A1F2C] relative">
        {/* Main text with special effects */}
        <span className="relative z-20 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#7E69AB] via-[#9b87f5] to-[#7E69AB] animate-gradient">
          {children}
        </span>

        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E5DEFF] via-[#F1F0FB] to-[#E5DEFF] rounded-lg transform transition-transform duration-300 group-hover:scale-105" />
        
        {/* Decorative border with animation */}
        <div className="absolute inset-0 rounded-lg border-2 border-[#9b87f5]/30 backdrop-blur-sm 
          before:content-[''] before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r 
          before:from-[#9b87f5] before:via-[#D6BCFA] before:to-[#9b87f5] before:rounded-lg 
          before:mask-gradient before:animate-borderGlow" />

        {/* Sparkle decorations with animations */}
        <Sparkles className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b87f5] animate-twinkle" />
        <Sparkles className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b87f5] animate-twinkle-delayed" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-[#9b87f5]/5 blur-md group-hover:bg-[#9b87f5]/10 transition-all duration-300" />
      </h3>
    </div>
  </div>
);