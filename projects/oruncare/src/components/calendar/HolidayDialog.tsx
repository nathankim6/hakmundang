
import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from 'lucide-react';
import { Holiday } from '@/types/calendar';

interface HolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holidays: Holiday[];
  onAddHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  onRemoveHoliday: (holidayId: string) => void;
}

export const HolidayDialog = ({
  open,
  onOpenChange,
  holidays,
  onAddHoliday,
  onRemoveHoliday
}: HolidayDialogProps) => {
  const [newHoliday, setNewHoliday] = useState({
    startDate: new Date(),
    endDate: new Date(),
    description: ''
  });

  const handleAddHoliday = () => {
    onAddHoliday({
      start_date: format(newHoliday.startDate, 'yyyy-MM-dd'),
      end_date: format(newHoliday.endDate, 'yyyy-MM-dd'),
      description: newHoliday.description
    });

    // 입력 폼 초기화
    setNewHoliday({
      startDate: new Date(),
      endDate: new Date(),
      description: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>공휴일 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4 mb-4">
            <div>
              <Label>시작일</Label>
              <Input
                type="date"
                value={format(newHoliday.startDate, 'yyyy-MM-dd')}
                onChange={(e) => setNewHoliday({
                  ...newHoliday,
                  startDate: new Date(e.target.value)
                })}
              />
            </div>
            <div>
              <Label>종료일</Label>
              <Input
                type="date"
                value={format(newHoliday.endDate, 'yyyy-MM-dd')}
                onChange={(e) => setNewHoliday({
                  ...newHoliday,
                  endDate: new Date(e.target.value)
                })}
              />
            </div>
            <div>
              <Label>설명</Label>
              <Input
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({
                  ...newHoliday,
                  description: e.target.value
                })}
                placeholder="예: 추석 연휴"
              />
            </div>
            <Button 
              onClick={handleAddHoliday}
              className="w-full"
            >
              공휴일 추가
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">등록된 공휴일</h3>
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-2 bg-accent rounded-md">
                <div>
                  <div className="font-medium">{holiday.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(holiday.start_date), 'yyyy년 MM월 dd일')} - {format(new Date(holiday.end_date), 'yyyy년 MM월 dd일')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveHoliday(holiday.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
