
import { format } from "date-fns";
import { ko } from "date-fns/locale"; // Import ko locale directly
import { CalendarIcon, Trash2, Clock, Edit } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Event, useEventStore } from "@/lib/eventStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { EventForm } from "@/components/EventForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getEventTypeColor = (type: string) => {
  switch(type.toLowerCase()) {
    case 'meeting':
    case '회의': 
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
    case 'important':
    case '중요': 
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
    case 'event':
    case '행사': 
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
    case 'holiday':
    case '휴일': 
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
    case 'birthday':
    case '생일': 
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

const getEventButtonColor = (type: string) => {
  switch(type.toLowerCase()) {
    case 'meeting':
    case '회의': 
      return 'hover:text-blue-600 hover:bg-blue-50';
    case 'important':
    case '중요': 
      return 'hover:text-red-600 hover:bg-red-50';
    case 'event':
    case '행사': 
      return 'hover:text-green-600 hover:bg-green-50';
    case 'holiday':
    case '휴일': 
      return 'hover:text-yellow-600 hover:bg-yellow-50';
    case 'birthday':
    case '생일': 
      return 'hover:text-purple-600 hover:bg-purple-50';
    default: 
      return 'hover:text-gray-600 hover:bg-gray-50';
  }
};

interface DailyEventListProps {
  date?: Date;
  events: Event[];
}

export function DailyEventList({ date, events }: DailyEventListProps) {
  const { toast } = useToast();
  const { deleteEvent } = useEventStore();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast({
        title: "일정 삭제 완료",
        description: "일정이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "일정 삭제 실패",
        description: "일정을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setEditingEvent(null);
    setShowEditForm(false);
    toast({
      title: "일정 수정 완료",
      description: "일정이 성공적으로 수정되었습니다.",
    });
  };

  // Safely format the date with korean locale
  const formattedDate = () => {
    if (!date) return null;
    
    try {
      // Use imported ko locale instead of require
      return format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko });
    } catch (error) {
      console.error("Error formatting date:", error);
      return format(date, "yyyy년 MM월 dd일");
    }
  };

  return (
    <>
      <Card className="shadow-md border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">오늘 일정</CardTitle>
          </div>
          <CardDescription className="font-medium">
            {date ? <span>{formattedDate()}</span> : "날짜를 선택해주세요"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-md">
              {date ? 
                <div className="flex flex-col items-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p>예정된 일정이 없습니다.</p>
                </div> 
              : 
                <div className="flex flex-col items-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p>날짜를 선택하세요</p>
                </div>
              }
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="flex justify-between items-start border-l-4 px-4 py-3 rounded-md border-primary bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{event.title}</h3>
                        
                        {event.time && (
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        
                        <Badge className={cn("mt-0.5", getEventTypeColor(event.type))}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200", getEventButtonColor(event.type))}
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>일정을 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 취소할 수 없습니다. 일정을 삭제하면 복구할 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Event Form */}
      {editingEvent && (
        <EventForm
          initialData={{
            id: editingEvent.id,
            title: editingEvent.title,
            date: editingEvent.date,
            type: editingEvent.type,
          }}
          onSuccess={handleEditSuccess}
          open={showEditForm}
          setOpen={setShowEditForm}
        />
      )}
    </>
  );
}
