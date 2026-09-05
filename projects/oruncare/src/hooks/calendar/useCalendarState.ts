
import { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, startOfDay } from 'date-fns';

export const useCalendarState = () => {
  const [currentDate, setCurrentDate] = useState(() => startOfDay(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showHolidayDialog, setShowHolidayDialog] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start from Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 }); // End on Saturday
  
  const days = eachDayOfInterval({ 
    start: startDate, 
    end: endDate 
  }).map(day => startOfDay(day));

  return {
    currentDate,
    setCurrentDate: (date: Date) => setCurrentDate(startOfDay(date)),
    selectedDay,
    setSelectedDay,
    selectedTeacher,
    setSelectedTeacher,
    selectedClass,
    setSelectedClass,
    showHolidayDialog,
    setShowHolidayDialog,
    days,
  };
};
