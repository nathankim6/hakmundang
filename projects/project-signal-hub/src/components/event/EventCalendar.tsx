
import { CalendarIcon, Plus } from "lucide-react";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface EventCalendarProps {
  date: Date | undefined;
  setDate: (date: Date) => void;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  events: any[];
  employees: any[];
  onAddEvent: () => void;
}

export function EventCalendar({
  date,
  setDate,
  selectedDates,
  setSelectedDates,
  events,
  employees,
  onAddEvent
}: EventCalendarProps) {
  const [showAddButton, setShowAddButton] = React.useState(false);
  
  const handleDayClick = (day: Date, modifiers: any, e: React.MouseEvent<HTMLButtonElement>) => {
    setDate(day);
    setShowAddButton(true);
  };

  const handleDatesChange = (dates: Date[]) => {
    setSelectedDates(dates);
    if (dates.length > 0) {
      setDate(dates[0]);
      setShowAddButton(true);
    }
  };

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-700 app-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white dark:bg-slate-700 p-2 rounded-full shadow-sm">
              <CalendarIcon className="h-5 w-5 text-sky-500" />
            </div>
            <CardTitle className="text-xl">일정 캘린더</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-500 mr-2"></span>
            날짜 클릭 후 Shift+클릭으로 기간 선택 가능
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(234, 179, 8)' }}></span>
              <span>초등</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></span>
              <span>중등</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(59, 130, 246)' }}></span>
              <span>고등</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(249, 115, 22)' }}></span>
              <span>기타</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(168, 85, 247)' }}></span>
              <span>개인</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="p-4 pt-4 pb-0">
          <Calendar 
            onDayClick={handleDayClick}
            selectedDates={selectedDates}
            onDatesChange={handleDatesChange}
            className="w-full"
          />
          
          {showAddButton && (
            <div className="flex justify-center mt-3 mb-3">
              <Button 
                size="sm" 
                onClick={onAddEvent}
                className="bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                {selectedDates.length > 1 ? `${selectedDates.length}개 날짜에 일정 추가` : '선택한 날짜에 일정 추가'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
