
import { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Bookmark, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useHolidays } from '@/hooks/useHolidays';

interface CurriculumCalendarProps {
  schedule: string;
  classId: string;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const COLORS = [
  'bg-red-100 hover:bg-red-200',
  'bg-blue-100 hover:bg-blue-200',
  'bg-green-100 hover:bg-green-200',
  'bg-yellow-100 hover:bg-yellow-200',
  'bg-purple-100 hover:bg-purple-200',
  'bg-pink-100 hover:bg-pink-200',
];

export const CurriculumCalendar = ({ schedule, classId }: CurriculumCalendarProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { holidays } = useHolidays();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const classDays = schedule.split(',').map(day => {
    const index = WEEKDAYS.indexOf(day.trim());
    return index === -1 ? null : index;
  }).filter((day): day is number => day !== null);

  const isClassDay = (date: Date) => classDays.includes(date.getDay());

  const { data: calendarData = [] } = useQuery({
    queryKey: ['curriculum_calendar', classId, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const startOfQuery = format(startDate, 'yyyy-MM-dd');
      const endOfQuery = format(endDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('curriculum_calendar')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startOfQuery)
        .lte('date', endOfQuery);

      if (error) throw error;
      return data;
    },
  });

  const { data: progressRecords = [] } = useQuery({
    queryKey: ['progress_records', classId, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const startOfQuery = format(startDate, 'yyyy-MM-dd');
      const endOfQuery = format(endDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('progress_records')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startOfQuery)
        .lte('date', endOfQuery);

      if (error) throw error;
      return data;
    },
  });

  const updateCalendarMutation = useMutation({
    mutationFn: async ({ date, content, color }: { date: Date, content?: string, color?: string }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existing = calendarData.find(item => item.date === dateStr);

      if (existing) {
        const { error } = await supabase
          .from('curriculum_calendar')
          .update({ 
            content: content !== undefined ? content : existing.content,
            color: color !== undefined ? color : existing.color,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('curriculum_calendar')
          .insert([{
            class_id: classId,
            date: dateStr,
            content: content || '',
            color: color || '',
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum_calendar'] });
      toast({
        title: "커리큘럼이 업데이트되었습니다",
      });
    },
  });

  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStartDate(date);
    setSelectedDates([date]);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate) {
      const start = dragStartDate < date ? dragStartDate : date;
      const end = dragStartDate < date ? date : dragStartDate;
      const dateRange = eachDayOfInterval({ start, end });
      setSelectedDates(dateRange);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const getCalendarDataForDay = (date: Date) => {
    return calendarData.find(item => 
      item.date === format(date, 'yyyy-MM-dd')
    );
  };

  const getProgressRecordForDay = (date: Date) => {
    return progressRecords.find(record => 
      record.date === format(date, 'yyyy-MM-dd')
    );
  };

  const handleContentSubmit = (date: Date) => {
    updateCalendarMutation.mutate({ 
      date,
      content: editingContent,
    });
    setEditingDate(null);
    setEditingContent('');
  };

  const handleColorSelect = (color: string) => {
    selectedDates.forEach(date => {
      updateCalendarMutation.mutate({ date, color });
    });
    setSelectedDates([]);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDates([day]);
  };

  const isHoliday = (date: Date) => {
    if (!holidays) return false;
    return holidays.some(holiday => {
      const startDate = new Date(holiday.start_date);
      const endDate = new Date(holiday.end_date);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
        <Button
          variant="ghost"
          onClick={() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentDate, 'yyyy년 M월')}
        </h2>
        <Button
          variant="ghost"
          onClick={() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}
        
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const calendarItem = getCalendarDataForDay(day);
          const progressRecord = getProgressRecordForDay(day);
          const isSelected = selectedDates.some(d => d.getTime() === day.getTime());
          const dayIsHoliday = isHoliday(day);
          
          return (
            <ContextMenu key={day.toString()}>
              <ContextMenuTrigger>
                <div
                  onMouseDown={() => handleMouseDown(day)}
                  onMouseEnter={() => handleMouseEnter(day)}
                  className={cn(
                    "min-h-[100px] p-2 border rounded-lg transition-colors",
                    !isCurrentMonth && "opacity-30",
                    isToday(day) && "border-primary",
                    isClassDay(day) && isCurrentMonth && !dayIsHoliday && "bg-primary/5",
                    dayIsHoliday && "bg-[#FFDEE2]",
                    calendarItem?.color,
                    isSelected && "ring-2 ring-primary",
                    "cursor-pointer hover:bg-gray-50"
                  )}
                  onClick={() => {
                    if (!isSelected) {
                      handleDayClick(day);
                    }
                  }}
                >
                  <div className="font-medium">
                    {format(day, 'd')}
                  </div>
                  {editingDate?.getTime() === day.getTime() ? (
                    <div className="mt-1">
                      <Input
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleContentSubmit(day);
                          }
                        }}
                        onBlur={() => handleContentSubmit(day)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {dayIsHoliday && holidays?.map(holiday => {
                        const startDate = new Date(holiday.start_date);
                        const endDate = new Date(holiday.end_date);
                        const currentDate = new Date(day);
                        currentDate.setHours(0, 0, 0, 0);
                        if (currentDate >= startDate && currentDate <= endDate) {
                          return (
                            <div key={holiday.id} className="text-sm font-medium text-rose-600">
                              {holiday.description}
                            </div>
                          );
                        }
                        return null;
                      })}
                      {!dayIsHoliday && (
                        <>
                          {calendarItem?.content && (
                            <div className="mt-1 text-sm">
                              {calendarItem.content}
                            </div>
                          )}
                          {progressRecord && (
                            <div className="space-y-1">
                              {progressRecord.lesson_content && (
                                <div className="flex items-start gap-1 text-xs bg-blue-50 p-1 rounded">
                                  <Book className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span>{progressRecord.lesson_content}</span>
                                </div>
                              )}
                              {progressRecord.homework && (
                                <div className="flex items-start gap-1 text-xs bg-green-50 p-1 rounded">
                                  <Bookmark className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span>{progressRecord.homework}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {COLORS.map((color, index) => (
                  <ContextMenuItem
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className={cn("cursor-pointer", color)}
                  >
                    색상 {index + 1}
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
};
