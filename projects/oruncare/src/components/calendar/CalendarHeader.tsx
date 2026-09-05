
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  selectedTeacher: string;
  teachers: string[];
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onTeacherChange: (teacher: string) => void;
  onHolidayManage: () => void;
}

export const CalendarHeader = ({
  currentDate,
  selectedTeacher,
  teachers,
  onYearChange,
  onMonthChange,
  onTeacherChange,
  onHolidayManage
}: CalendarHeaderProps) => {
  // 월 이름 배열
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className="bg-gradient-to-r from-white/70 via-white/90 to-white/70 backdrop-blur-lg p-6 rounded-2xl border border-white/80 shadow-lg shadow-primary/10 transition-all duration-300 mb-6 hover:shadow-xl hover:shadow-primary/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/90 p-2 rounded-xl shadow-sm border border-primary/10">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-gray-800">{currentYear}년 <span className="text-primary">{currentMonthName}</span></span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/10 text-gray-600"
              onClick={() => {
                const newMonth = (currentDate.getMonth() - 1 + 12) % 12;
                const newYear = currentDate.getMonth() === 0 ? 
                  (currentDate.getFullYear() - 1).toString() : 
                  currentDate.getFullYear().toString();
                
                if (currentDate.getMonth() === 0) {
                  onYearChange(newYear);
                }
                onMonthChange(newMonth.toString());
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/10 text-gray-600"
              onClick={() => {
                const newMonth = (currentDate.getMonth() + 1) % 12;
                const newYear = currentDate.getMonth() === 11 ? 
                  (currentDate.getFullYear() + 1).toString() : 
                  currentDate.getFullYear().toString();
                
                if (currentDate.getMonth() === 11) {
                  onYearChange(newYear);
                }
                onMonthChange(newMonth.toString());
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="h-8 border-l border-gray-300 mx-2"></div>

          <Select 
            value={currentDate.getFullYear().toString()} 
            onValueChange={onYearChange}
          >
            <SelectTrigger className="w-[100px] bg-white/90 shadow-sm border border-gray-200/80 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md border border-gray-200/80">
              {Array.from({ length: 11 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <SelectItem key={year} value={year.toString()} className="hover:bg-primary/5">
                    {year}년
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <Select 
            value={currentDate.getMonth().toString()} 
            onValueChange={onMonthChange}
          >
            <SelectTrigger className="w-[80px] bg-white/90 shadow-sm border border-gray-200/80 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md border border-gray-200/80">
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()} className="hover:bg-primary/5">
                  {i + 1}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <Select 
            value={selectedTeacher} 
            onValueChange={onTeacherChange}
          >
            <SelectTrigger className="w-[150px] bg-white/90 shadow-sm border border-gray-200/80 h-9">
              <SelectValue placeholder="선생님 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md border border-gray-200/80">
              <SelectItem value="all" className="hover:bg-primary/5">전체</SelectItem>
              {teachers && teachers.map((teacher) => (
                <SelectItem key={teacher} value={teacher} className="hover:bg-primary/5">
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={onHolidayManage} 
            className="bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90 border-none shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            공휴일 관리
          </Button>
        </div>
      </div>
    </div>
  );
};
