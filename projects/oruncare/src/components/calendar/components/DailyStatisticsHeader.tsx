
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, subDays } from 'date-fns';
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface DailyStatisticsHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onCalendarOpen: () => void;
}

export const DailyStatisticsHeader = ({
  selectedDate,
  onDateChange,
  onCalendarOpen
}: DailyStatisticsHeaderProps) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const formattedDate = format(selectedDate, "M월 d일(E)", {
    locale: ko
  });
  
  const handlePrevDay = () => {
    console.log('Previous day clicked');
    const newDate = subDays(selectedDate, 1);
    onDateChange(newDate);
  };
  
  const handleNextDay = () => {
    console.log('Next day clicked');
    const newDate = addDays(selectedDate, 1);
    onDateChange(newDate);
  };
  
  return (
    <div className="bg-gradient-to-r from-primary/5 via-white to-primary/5 backdrop-blur-lg py-3 px-4 rounded-xl border border-white/60 shadow-lg shadow-primary/10 transition-all duration-300 hover:shadow-primary/20 animate-glow w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-lg flex items-center justify-center shadow-md text-white">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent tracking-tight">Daily Review</span>
              <span className="text-xs text-gray-500 font-medium">Management</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrevDay} 
              className="hover:bg-primary/10 hover:scale-105 transition-all duration-200 rounded-full h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4 text-primary-dark" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="font-medium text-md hover:bg-primary/10 hover:scale-105 transition-all duration-200 h-8 px-3"
              onClick={onCalendarOpen}
            >
              <div className="flex items-center gap-1">
                <span className="text-gray-600">
                  {formattedDate}
                </span>
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNextDay} 
              className="hover:bg-primary/10 hover:scale-105 transition-all duration-200 rounded-full h-8 w-8"
            >
              <ChevronRight className="h-4 w-4 text-primary-dark" />
            </Button>
          </div>
        </div>
        
        {/* Removed filter and settings buttons */}
      </div>
    </div>
  );
};
