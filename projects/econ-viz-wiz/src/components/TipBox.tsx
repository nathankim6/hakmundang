import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface TipBoxProps {
  children: React.ReactNode;
  variant?: "default" | "warning";
}

const TipBox = ({ children, variant = "default" }: TipBoxProps) => {
  const isWarning = variant === "warning";
  
  return (
    <Card 
      className={`p-5 border-l-4 transition-all duration-300 animate-fade-in ${
        isWarning 
          ? "border-l-accent bg-accent-light/50" 
          : "border-l-primary bg-primary/5"
      }`}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isWarning ? "bg-accent/20" : "bg-primary/10"
        }`}>
          <Lightbulb className={`w-4 h-4 ${isWarning ? "text-accent-foreground" : "text-primary"}`} />
        </div>
        <div className="flex-1 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </Card>
  );
};

export default TipBox;
