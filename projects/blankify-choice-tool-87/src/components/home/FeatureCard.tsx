
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bulletPoints: string[];
  colorClass: string;
  hoverColorClass: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  bulletPoints,
  colorClass,
  hoverColorClass,
}) => {
  return (
    <Card className={`h-full transition-all duration-300 bg-white group-hover:${hoverColorClass} group-hover:shadow-lg border border-slate-200 group-hover:border-${colorClass}-200 group-hover:translate-y-[-4px]`}>
      <CardHeader>
        <div className={`p-2.5 rounded-full w-fit bg-${colorClass}-100 mb-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-${colorClass}-200`}>
          <Icon className={`h-6 w-6 text-${colorClass}-600`} />
        </div>
        <CardTitle className={`text-xl group-hover:text-${colorClass}-700 transition-colors relative`}>
          {title}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-full transition-all duration-300"></span>
        </CardTitle>
        <CardDescription className="text-slate-600 group-hover:text-slate-700">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          {bulletPoints.map((point, index) => (
            <li key={index} className="transition-transform duration-300 group-hover:translate-x-1">{point}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
