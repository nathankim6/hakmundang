import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface DefinitionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const DefinitionCard = ({ title, description, icon }: DefinitionCardProps) => {
  return (
    <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-br from-card to-secondary/30 hover:shadow-lg transition-all duration-300 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon || <CheckCircle2 className="w-5 h-5 text-primary" />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
          <p className="text-foreground/80 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default DefinitionCard;
