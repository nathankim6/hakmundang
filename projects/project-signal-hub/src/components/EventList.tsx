
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Event, useEventStore } from "@/lib/eventStore";
import { EventForm } from "./EventForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EventList = () => {
  const { toast } = useToast();
  const { events, isLoading, fetchEvents, deleteEvent, setupEventSubscription } = useEventStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    
    // 실시간 구독 설정
    const channel = setupEventSubscription();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents, setupEventSubscription]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "important":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "event":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "meeting":
        return "회의";
      case "important":
        return "중요";
      case "event":
        return "행사";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP (eee)", { locale: ko });
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEvent(id);
      toast({
        title: "일정 삭제 완료",
        description: "일정이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "일정 삭제 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">등록된 일정이 없습니다</p>
        <EventForm onSuccess={fetchEvents} />
      </div>
    );
  }

  // 이벤트 그룹화: 현재/미래 이벤트와 과거 이벤트로 분리
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= today
  );
  const pastEvents = events.filter((event) => new Date(event.date) < today);

  return (
    <div className="space-y-6">
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">다가오는 일정</h3>
          {upcomingEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              getEventTypeColor={getEventTypeColor}
              getEventTypeLabel={getEventTypeLabel}
              formatDate={formatDate}
              onDelete={handleDeleteEvent}
              isDeleting={deletingId === event.id}
              onSuccess={fetchEvents}
            />
          ))}
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">지난 일정</h3>
          <div className="opacity-60">
            {pastEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                getEventTypeColor={getEventTypeColor}
                getEventTypeLabel={getEventTypeLabel}
                formatDate={formatDate}
                onDelete={handleDeleteEvent}
                isDeleting={deletingId === event.id}
                onSuccess={fetchEvents}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface EventItemProps {
  event: Event;
  getEventTypeColor: (type: string) => string;
  getEventTypeLabel: (type: string) => string;
  formatDate: (date: string) => string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onSuccess: () => void;
  isPast?: boolean;
}

const EventItem = ({
  event,
  getEventTypeColor,
  getEventTypeLabel,
  formatDate,
  onDelete,
  isDeleting,
  onSuccess,
  isPast = false,
}: EventItemProps) => {
  return (
    <div
      className={`flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start">
        <div className="mr-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <div className="font-medium">{event.title}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(event.date)}
          </div>
          <Badge
            variant="outline"
            className={`mt-2 ${getEventTypeColor(event.type)}`}
          >
            {getEventTypeLabel(event.type)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <EventForm initialData={event} onSuccess={onSuccess} />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 이 일정이 일정 목록에서 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(event.id);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
