import { Sparkles } from "lucide-react";

interface CategoryTitleProps {
  children: React.ReactNode;
}

export const CategoryTitle = ({ children }: CategoryTitleProps) => (
  <div className="flex items-center justify-center mb-4">
    <h3 className="text-lg font-semibold text-[#1A1F2C] relative">
      {children}
    </h3>
  </div>
);