import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users } from 'lucide-react';

interface DaySelectorProps {
  dayGroups: { [key: number]: number };
  selectedDays: number[];
  onDayToggle: (day: number) => void;
  onShowPreview: () => void;
  totalWords: number;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  dayGroups,
  selectedDays,
  onDayToggle,
  onShowPreview,
  totalWords
}) => {
  const selectedWordsCount = selectedDays.reduce((sum, day) => sum + (dayGroups[day] || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Day 선택</span>
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>전체 단어: {totalWords}개</span>
          <span>선택된 단어: {selectedWordsCount}개</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(dayGroups).map(([day, count]) => (
            <Button
              key={day}
              variant={selectedDays.includes(Number(day)) ? "default" : "outline"}
              onClick={() => onDayToggle(Number(day))}
              className="flex flex-col h-auto py-3 px-2"
            >
              <span className="font-medium">Day {day}</span>
              <Badge variant="secondary" className="text-xs mt-1">
                {count}개
              </Badge>
            </Button>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {selectedDays.length > 0 ? `Day ${selectedDays.join(', ')} 선택됨` : '선택된 Day가 없습니다'}
          </div>
          <Button 
            onClick={onShowPreview}
            disabled={selectedDays.length === 0}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            시험지 미리보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};