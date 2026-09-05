import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDailyWordPauseState } from "@/hooks/useDailyWordPause";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, AlertTriangle, Heart, Send } from "lucide-react";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 일일 단어과제 시작일 (이 날짜부터 미제출 체크 시작)
const DAILY_WORD_START_DATE = '2026-02-08';

interface CommitDeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OverdueTask {
  id: string;
  type: "daily_word" | "rt";
  title: string;
  originalDueDate: Date;
  homeworkId?: string;
  dailyWordDate?: string;
  isExtensionApproved?: boolean;
}

export function CommitDeadlineDialog({ open, onOpenChange }: CommitDeadlineDialogProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(addDays(new Date(), 3));
  const [commitmentMessage, setCommitmentMessage] = useState("");

  // 실시간 구독 - 일일 단어과제 및 dismissed_daily_words 업데이트 수신
  useEffect(() => {
    if (!session?.studentId || !open) return;

    const dailyChannel = supabase
      .channel('commit-daily-submissions-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_word_submissions',
        filter: `student_id=eq.${session.studentId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["overdue-tasks", session.studentId] });
      })
      .subscribe();

    const dismissedChannel = supabase
      .channel('commit-dismissed-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dismissed_daily_words',
        filter: `student_id=eq.${session.studentId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["overdue-tasks", session.studentId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dailyChannel);
      supabase.removeChannel(dismissedChannel);
    };
  }, [session?.studentId, open, queryClient]);

  // 미제출 과제 조회 (밀린 과제들)
  const { data: overdueTasks = [], isLoading } = useQuery({
    queryKey: ["overdue-tasks", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tasks: OverdueTask[] = [];

      // KST 기준 날짜 포맷 함수
      const formatDateKST = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // 승인된 기한 연장 요청 조회
      const { data: approvedExtensions } = await supabase
        .from("deadline_extensions")
        .select("homework_id, daily_word_date")
        .eq("student_id", session.studentId)
        .eq("status", "approved");

      const approvedSet = new Set(
        (approvedExtensions || []).map(ext => 
          ext.homework_id ? `rt-${ext.homework_id}` : `daily-${ext.daily_word_date}`
        )
      );

      // 1. 리뷰 과제 중 미제출된 것
      const { data: rtSubmissions } = await supabase
        .from("homework_submissions")
        .select(`
          id,
          homework_id,
          submitted_at,
          homework:homework_id(
            id,
            title,
            due_date
          )
        `)
        .eq("student_id", session.studentId)
        .is("submitted_at", null);

      (rtSubmissions || []).forEach((sub: any) => {
        if (sub.homework) {
          const dueDate = new Date(sub.homework.due_date);
          dueDate.setHours(23, 59, 59, 999);
          if (dueDate < today) {
            const key = `rt-${sub.homework.id}`;
            tasks.push({
              id: sub.id,
              type: "rt",
              title: sub.homework.title,
              originalDueDate: new Date(sub.homework.due_date),
              homeworkId: sub.homework.id,
              isExtensionApproved: approvedSet.has(key),
            });
          }
        }
      });

      // 2. 일일 단어과제 중 미제출된 것 (학생 등록일 이후만)
      // 학생의 등록일 및 학교 정보 조회
      const { data: studentData } = await supabase
        .from("students")
        .select("created_at, grade_id")
        .eq("id", session.studentId)
        .maybeSingle();
      
      // Check if daily word is paused
      let effectiveStartDateStr = DAILY_WORD_START_DATE;
      if (studentData?.grade_id) {
        const { data: gradeData } = await supabase.from("grades").select("school_id").eq("id", studentData.grade_id).maybeSingle();
        if (gradeData?.school_id) {
          const { data: schoolData } = await supabase.from("schools").select("owner_code_id").eq("id", gradeData.school_id).maybeSingle();
          const pauseState = await fetchDailyWordPauseState(schoolData?.owner_code_id);
          if (pauseState.isPaused) {
            return tasks.sort((a, b) => a.originalDueDate.getTime() - b.originalDueDate.getTime());
          }
          if (pauseState.resumeDate && pauseState.resumeDate > effectiveStartDateStr) {
            effectiveStartDateStr = pauseState.resumeDate;
          }
        }
      }

      const globalStart = new Date(effectiveStartDateStr);
      globalStart.setHours(0, 0, 0, 0);
      let startDate = new Date(globalStart);
      if (studentData?.created_at) {
        const createdKST = new Date(new Date(studentData.created_at).getTime() + 9 * 60 * 60 * 1000);
        const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
        if (createdDate > startDate) startDate = createdDate;
      }
      startDate.setHours(0, 0, 0, 0);

      // 시작일이 오늘 이후면 일일 단어과제 밀린 것 없음
      if (startDate > today) {
        return tasks.sort((a, b) => a.originalDueDate.getTime() - b.originalDueDate.getTime());
      }

      const { data: dailySubmissions } = await supabase
        .from("daily_word_submissions")
        .select("submission_date")
        .eq("student_id", session.studentId);

      const submittedDates = new Set((dailySubmissions || []).map(s => s.submission_date));

      // 무시된 일일 단어과제 조회
      const { data: dismissedDailyWords } = await supabase
        .from("dismissed_daily_words")
        .select("dismissed_date")
        .eq("student_id", session.studentId);

      const dismissedDates = new Set((dismissedDailyWords || []).map(d => d.dismissed_date));

      // 시작일부터 오늘까지 미제출 날짜 확인 (무시된 날짜 제외, 오늘 포함)
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const current = new Date(startDate);
      while (current < tomorrow) {
        const dateStr = formatDateKST(current);
        
        // 제출됐거나 무시된 날짜는 건너뛰기
        if (!submittedDates.has(dateStr) && !dismissedDates.has(dateStr)) {
          const key = `daily-${dateStr}`;
          const isToday = dateStr === formatDateKST(today);
          tasks.push({
            id: `daily-${dateStr}`,
            type: "daily_word",
            title: isToday ? `오늘 일일 단어과제 (${format(current, 'M/d', { locale: ko })})` : `일일 단어과제 (${format(current, 'M/d', { locale: ko })})`,
            originalDueDate: new Date(current),
            dailyWordDate: dateStr,
            isExtensionApproved: approvedSet.has(key),
          });
        }
        current.setDate(current.getDate() + 1);
      }

      return tasks.sort((a, b) => a.originalDueDate.getTime() - b.originalDueDate.getTime());
    },
    enabled: !!session?.studentId && open,
  });

  const submitCommitMutation = useMutation({
    mutationFn: async () => {
      if (!session?.studentId || selectedTasks.length === 0 || !newDueDate || !commitmentMessage.trim()) {
        throw new Error("필수 항목을 모두 입력해주세요.");
      }

      const selectedOverdueTasks = overdueTasks.filter(t => selectedTasks.includes(t.id));

      const insertData = selectedOverdueTasks.map(task => ({
        student_id: session.studentId,
        homework_id: task.homeworkId || null,
        daily_word_date: task.dailyWordDate || null,
        original_due_date: task.originalDueDate.toISOString().split('T')[0],
        new_due_date: newDueDate.toISOString().split('T')[0],
        commitment_message: commitmentMessage.trim(),
        status: "approved", // 승인 없이 바로 연장 적용
        approved_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("deadline_extensions")
        .insert(insertData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("기한이 연장되었습니다! 새 마감일까지 꼭 제출해주세요 💪");
      queryClient.invalidateQueries({ queryKey: ["overdue-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["deadline-extensions"] });
      queryClient.invalidateQueries({ queryKey: ["all-missing-assignments"] });
      onOpenChange(false);
      setSelectedTasks([]);
      setCommitmentMessage("");
      setNewDueDate(addDays(new Date(), 3));
    },
    onError: (error: any) => {
      toast.error(error.message || "제출 중 오류가 발생했습니다.");
    },
  });

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    if (selectedTasks.length === overdueTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(overdueTasks.map(t => t.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-rose-500" />
            옳은 커밋 (Commit)
          </DialogTitle>
          <DialogDescription>
            수업중에 과제를 검사 받고 서로 민망한 것 보다 더욱 좋은 분위기에서 수업할 수 있습니다. 열심히 해온 다른 친구들을 배려해 주세요!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 밀린 과제 목록 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">연장할 과제 선택</Label>
              {overdueTasks.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAllTasks}
                  className="text-xs h-7 px-2"
                >
                  {selectedTasks.length === overdueTasks.length ? "선택 해제" : "전체 선택"}
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                불러오는 중...
              </div>
            ) : overdueTasks.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed">
                <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">밀린 과제가 없어요!</p>
                <p className="text-muted-foreground/70 text-xs mt-1">잘하고 있어요 👏</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      selectedTasks.includes(task.id)
                        ? "bg-primary/10 border-primary/40"
                        : "bg-muted/30 border-border/50 hover:bg-muted/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedTasks.includes(task.id)} 
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        원래 마감: {format(task.originalDueDate, 'M월 d일', { locale: ko })}
                      </p>
                    </div>
                    {(() => {
                      const todayStr = format(new Date(), 'yyyy-MM-dd');
                      const isToday = task.dailyWordDate === todayStr;
                      return (
                        <Badge 
                          variant="outline" 
                          className={task.isExtensionApproved ? "text-amber-600 border-amber-300 bg-amber-50" : isToday ? "text-blue-600 border-blue-300 bg-blue-50" : "text-destructive border-destructive/30"}
                        >
                          {task.isExtensionApproved ? "기간연장됨" : isToday ? "당일과제" : "기간초과"}
                        </Badge>
                      );
                    })()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 새 마감일 선택 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">새로운 마감일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newDueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDueDate ? format(newDueDate, 'yyyy년 M월 d일', { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDueDate}
                  onSelect={setNewDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 다짐 코멘트 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">다짐 한마디</Label>
            <Textarea
              value={commitmentMessage}
              onChange={(e) => setCommitmentMessage(e.target.value)}
              placeholder="선생님께 드리는 약속과 다짐을 적어주세요! (ex 길다다가 하늘을 보니 높새구름이 있는 것이 아니겠습니까? 그 구름을 보다가 2시간이 흘러 버렸지 뭐에요. 선생님 멋지신 분입니다 혼내지 마세요!)"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* 제출 버튼 */}
          <Button
            onClick={() => submitCommitMutation.mutate()}
            disabled={
              selectedTasks.length === 0 || 
              !newDueDate || 
              !commitmentMessage.trim() ||
              submitCommitMutation.isPending
            }
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
          >
            {submitCommitMutation.isPending ? (
              "제출 중..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                기한 연장하기
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            새 마감일까지 꼭 제출해주세요!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
