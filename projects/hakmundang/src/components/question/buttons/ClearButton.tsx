import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearButtonProps {
  onClick: () => void;
}

export const ClearButton = ({ onClick }: ClearButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="h-12 px-5 relative group overflow-hidden transform hover:scale-105 transition-all duration-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-center gap-2">
        <Trash2 className="w-4 h-4 text-red-500 group-hover:animate-bounce" />
        <span className="font-semibold text-red-500">전체 삭제</span>
      </div>
    </Button>
  );
};