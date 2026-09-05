import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface StepListProps {
  steps: string[];
}

const StepList = ({ steps }: StepListProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card 
          key={index} 
          className="p-4 flex items-start gap-4 hover:shadow-md transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
            {index + 1}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-foreground leading-relaxed">{step}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-primary/40 flex-shrink-0 mt-1" />
        </Card>
      ))}
    </div>
  );
};

export default StepList;
