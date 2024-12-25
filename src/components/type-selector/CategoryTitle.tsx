import { Sparkles } from "lucide-react";

interface CategoryTitleProps {
  children: React.ReactNode;
}

export const CategoryTitle = ({ children }: CategoryTitleProps) => (
  <div className="flex items-center justify-center mb-4">
    <h3 className="text-lg font-bold relative px-6 py-2 text-[#1A1F2C]">
      <span className="relative z-10 tracking-wider">{children}</span>
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 rounded-lg" />
      {/* Decorative border */}
      <div className="absolute inset-0 border-2 border-[#9b87f5]/20 rounded-lg" />
      {/* Sparkle decorations */}
      <Sparkles className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b87f5]" />
      <Sparkles className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b87f5]" />
    </h3>
  </div>
);