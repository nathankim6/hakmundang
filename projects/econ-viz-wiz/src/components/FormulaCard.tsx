import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface FormulaCardProps {
  title: string;
  formula: string;
  description?: string;
}

const FormulaCard = ({ title, formula, description }: FormulaCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-primary mb-2">{title}</h4>
          <div className="bg-card p-4 rounded-lg border border-border mb-2">
            <code className="text-lg font-mono font-semibold text-foreground">{formula}</code>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FormulaCard;
