import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WordCardProps {
  word: string;
  meaning: string;
  day?: number;
  className?: string;
}

export const WordCard: React.FC<WordCardProps> = ({ 
  word, 
  meaning, 
  day,
  className 
}) => {
  return (
    <Card className={`hover:shadow-soft transition-all duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-card-foreground">{word}</h3>
          {day && (
            <Badge variant="secondary" className="text-xs">
              Day {day}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">{meaning}</p>
      </CardContent>
    </Card>
  );
};