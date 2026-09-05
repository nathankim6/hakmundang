import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Pencil, 
  Trash2,
  Eye,
  MoreHorizontal,
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ImageZoomDialog } from "@/components/ui/image-zoom-dialog";

interface SubmittedDailyWordCardProps {
  submission: {
    id: string;
    submission_date: string;
    submitted_at: string;
    photo_urls: string[] | null;
    status: string;
    reviewed_at: string | null;
    teacher_note: string | null;
  };
  onEdit: () => void;
  isLate?: boolean;
}

export function SubmittedDailyWordCard({ submission, onEdit, isLate = false }: SubmittedDailyWordCardProps) {
  const [showPhotos, setShowPhotos] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(submission.submission_date + "T00:00:00")
  );
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("daily_word_submissions")
        .delete()
        .eq("id", submission.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("제출이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["today-daily-word"] });
      queryClient.invalidateQueries({ queryKey: ["recent-daily-words"] });
      queryClient.invalidateQueries({ queryKey: ["missed-daily-words"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-tasks"] });
    },
    onError: () => {
      toast.error("삭제에 실패했습니다.");
    },
  });

  const updateDateMutation = useMutation({
    mutationFn: async (newDate: string) => {
      const { error } = await supabase
        .from("daily_word_submissions")
        .update({ submission_date: newDate })
        .eq("id", submission.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("제출 날짜가 변경되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["today-daily-word"] });
      queryClient.invalidateQueries({ queryKey: ["student-monthly-submissions"] });
      setShowDatePicker(false);
    },
    onError: () => {
      toast.error("날짜 변경에 실패했습니다.");
    },
  });

  const handleDateChange = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      updateDateMutation.mutate(formattedDate);
    }
  };

  const isReviewed = !!submission.reviewed_at;
  const submittedDate = new Date(submission.submitted_at);

  return (
    <>
      {/* 컴팩트한 한 줄 레이아웃 */}
      <div 
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors cursor-pointer group"
        onClick={() => submission.teacher_note ? setShowFeedback(true) : setShowPhotos(true)}
      >
        {/* 썸네일 */}
        {submission.photo_urls && submission.photo_urls.length > 0 ? (
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
            <img 
              src={submission.photo_urls[0]} 
              alt="제출" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-primary" />
          </div>
        )}

        {/* 과제 날짜 (어떤 날의 과제인지) */}
        <div className="flex flex-col min-w-[60px]">
          <span className="text-xs font-semibold text-foreground">
            {format(new Date(submission.submission_date + "T00:00:00"), 'M/d', { locale: ko })}
            <span className="text-[9px] text-muted-foreground ml-0.5">과제</span>
          </span>
          <span className="text-[9px] text-muted-foreground">
            {format(submittedDate, 'M/d HH:mm', { locale: ko })} 제출
          </span>
        </div>

        {/* 사진 개수 */}
        {submission.photo_urls && submission.photo_urls.length > 1 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            +{submission.photo_urls.length - 1}장
          </span>
        )}

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* 상태 배지들 */}
        <div className="flex items-center gap-1">
          {isLate && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-600">
              지각제출
            </span>
          )}
          {isReviewed ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />확인완료
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-600 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />확인대기
            </span>
          )}
        </div>

        {/* 메뉴 버튼 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowPhotos(true); }} className="gap-2 text-xs">
              <Eye className="w-3.5 h-3.5" />
              사진 보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowDatePicker(true); }} className="gap-2 text-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              날짜 변경
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="gap-2 text-xs">
              <Pencil className="w-3.5 h-3.5" />
              사진 수정
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }} 
              className="gap-2 text-xs text-destructive focus:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 사진 보기 다이얼로그 */}
      <Dialog open={showPhotos} onOpenChange={setShowPhotos}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              제출 사진 ({format(submittedDate, 'M월 d일', { locale: ko })})
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
            {submission.photo_urls?.map((url, index) => (
              <img 
                key={index}
                src={url}
                alt={`사진 ${index + 1}`}
                className="w-full rounded-xl cursor-zoom-in hover:opacity-80 transition-opacity"
                onClick={() => { setZoomIndex(index); setZoomOpen(true); }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 피드백 보기 다이얼로그 */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              선생님 피드백
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm text-foreground leading-relaxed">{submission.teacher_note}</p>
          </div>
          {submission.photo_urls && submission.photo_urls.length > 0 && (
            <Button variant="outline" onClick={() => { setShowFeedback(false); setShowPhotos(true); }}>
              사진 보기
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>제출을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 제출은 복구할 수 없습니다. 오늘 다시 제출할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 날짜 변경 다이얼로그 */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              제출 날짜 변경
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date > new Date()}
              locale={ko}
              className={cn("rounded-md border pointer-events-auto")}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDatePicker(false)}>
              취소
            </Button>
            <Button 
              onClick={handleDateChange}
              disabled={updateDateMutation.isPending || !selectedDate}
            >
              {updateDateMutation.isPending ? "변경 중..." : "변경"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사진 확대 보기 */}
      <ImageZoomDialog open={zoomOpen} onOpenChange={setZoomOpen} images={submission.photo_urls || []} initialIndex={zoomIndex} />
    </>
  );
}
