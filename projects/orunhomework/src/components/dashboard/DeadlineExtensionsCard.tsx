import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, Clock, ChevronRight, ChevronLeft, Check, Sparkles, Quote, History, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOwnerStudentIds } from "@/hooks/useOwnerStudentIds";
import { toast } from "sonner";
import { QuickMessageDialog } from "./QuickMessageDialog";
import { QuickKakaoDialog } from "./QuickKakaoDialog";
import iconKakao from "@/assets/icon-kakao.png";
import iconSms from "@/assets/icon-sms.png";

interface DeadlineExtension {
  id: string;
  student_id: string;
  homework_id: string | null;
  daily_word_date: string | null;
  original_due_date: string;
  new_due_date: string;
  commitment_message: string;
  status: string;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  student?: {
    name: string;
    student_phone?: string | null;
    parent_phone?: string | null;
    grade?: {
      name: string;
      school?: { 
        name: string;
        logo_url?: string | null;
      };
    };
  };
  homework?: {
    title: string;
  };
}

const ITEMS_PER_PAGE = 6;

export function DeadlineExtensionsCard() {
  const queryClient = useQueryClient();
  const [selectedExtension, setSelectedExtension] = useState<DeadlineExtension | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [kakaoDialogOpen, setKakaoDialogOpen] = useState(false);
  const { studentIds, shouldFilter, isLoading: isLoadingOwner } = useOwnerStudentIds();

  // 미확인 내역 조회
  const { data: extensions = [], isLoading } = useQuery({
    queryKey: ["recent-deadline-extensions", studentIds],
    enabled: !isLoadingOwner,
    queryFn: async () => {
      let query = supabase
        .from("deadline_extensions")
        .select(`
          *,
           student:students(
            name,
            student_phone,
            parent_phone,
            grade:grades(
              name,
              school:schools(name, logo_url)
            )
          ),
          homework:homework_id(title)
        `)
        .neq("status", "confirmed")
        .order("created_at", { ascending: false });

      if (shouldFilter && studentIds) {
        if (studentIds.length === 0) return [];
        query = query.in("student_id", studentIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DeadlineExtension[];
    },
  });

  // 확인 완료된 지난 내역 조회
  const { data: confirmedExtensions = [], isLoading: isLoadingConfirmed } = useQuery({
    queryKey: ["confirmed-deadline-extensions", studentIds],
    enabled: !isLoadingOwner && historyDialogOpen,
    queryFn: async () => {
      let query = supabase
        .from("deadline_extensions")
        .select(`
          *,
          student:students(
            name,
            student_phone,
            parent_phone,
            grade:grades(
              name,
              school:schools(name, logo_url)
            )
          ),
          homework:homework_id(title)
        `)
        .eq("status", "confirmed")
        .order("approved_at", { ascending: false });

      if (shouldFilter && studentIds) {
        if (studentIds.length === 0) return [];
        query = query.in("student_id", studentIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DeadlineExtension[];
    },
  });

  // 확인 처리 mutation (삭제 대신 상태 변경)
  const confirmMutation = useMutation({
    mutationFn: async (extensionId: string) => {
      const { error } = await supabase
        .from("deadline_extensions")
        .update({ status: "confirmed", approved_at: new Date().toISOString() })
        .eq("id", extensionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("옳은커밋이 확인 처리되었습니다");
      queryClient.invalidateQueries({ queryKey: ["recent-deadline-extensions"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-deadline-extensions"] });
      setSelectedExtension(null);
    },
    onError: () => {
      toast.error("처리 중 오류가 발생했습니다");
    },
  });

  // 확인 완료된 지난 내역 삭제 mutation
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      let query = supabase
        .from("deadline_extensions")
        .delete()
        .eq("status", "confirmed");

      if (shouldFilter && studentIds && studentIds.length > 0) {
        query = query.in("student_id", studentIds);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("지난 내역이 모두 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["confirmed-deadline-extensions"] });
    },
    onError: () => {
      toast.error("삭제 중 오류가 발생했습니다");
    },
  });

  // 옳은커밋 전체 삭제 mutation (미확인 + 확인 완료)
  const deleteEverythingMutation = useMutation({
    mutationFn: async () => {
      let query = supabase.from("deadline_extensions").delete();

      if (shouldFilter && studentIds) {
        if (studentIds.length === 0) return;
        query = query.in("student_id", studentIds);
      } else {
        // 필터가 없는 경우에도 안전을 위해 모든 행에 매치되는 조건 부여
        query = query.not("id", "is", null);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("옳은커밋 내역이 모두 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["recent-deadline-extensions"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-deadline-extensions"] });
      setSelectedExtension(null);
    },
    onError: () => {
      toast.error("삭제 중 오류가 발생했습니다");
    },
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(extensions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExtensions = extensions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTaskTitle = (ext: DeadlineExtension) => {
    if (ext.homework?.title) {
      return ext.homework.title;
    }
    if (ext.daily_word_date) {
      return `일일 단어 (${format(new Date(ext.daily_word_date), 'M/d', { locale: ko })})`;
    }
    return "알 수 없는 과제";
  };

  if (isLoading || isLoadingOwner) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="py-3 px-4 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1 rounded-md bg-white/20 backdrop-blur-sm">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span>옳은커밋</span>
              <span className="text-[10px] font-normal text-white/60 uppercase tracking-wider">ORUN COMMIT</span>
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHistoryDialogOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-[10px] text-white/80 hover:text-white transition-colors backdrop-blur-sm"
              >
                <History className="w-3 h-3" />
                지난 내역
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-[10px] text-white/80 hover:text-white transition-colors backdrop-blur-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    전체 삭제
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>옳은커밋 내역 전체 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      미확인 및 확인 완료된 옳은커밋 내역을 모두 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteEverythingMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      전체 삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {extensions.length > 0 && (
                <Badge className="bg-white/20 text-white border-0 text-[10px] px-2 backdrop-blur-sm">
                  {extensions.length}건
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {extensions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Heart className="w-8 h-8 mx-auto mb-2 text-rose-200" />
              <p className="text-xs">미확인 커밋이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                {paginatedExtensions.map((ext, index) => (
                  <CommitCard
                    key={ext.id}
                    ext={ext}
                    index={index}
                    getTaskTitle={getTaskTitle}
                    onSelect={setSelectedExtension}
                    onConfirm={(id) => {
                      if (window.confirm(`${ext.student?.name}의 옳은커밋을 확인 처리하시겠습니까?`)) {
                        confirmMutation.mutate(id);
                      }
                    }}
                    showConfirmButton
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/30">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground">{currentPage} / {totalPages}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 다이얼로그 */}
      <Dialog open={!!selectedExtension} onOpenChange={() => setSelectedExtension(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-5 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                옳은커밋 상세
              </DialogTitle>
              <DialogDescription className="text-white/70">
                학생의 기한 연장 신청 상세 내역
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedExtension && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Avatar className="w-11 h-11 ring-2 ring-rose-100">
                  {(selectedExtension.student?.grade as any)?.school?.logo_url ? (
                    <AvatarImage 
                      src={cacheBustUrl((selectedExtension.student?.grade as any)?.school?.logo_url)} 
                      alt={(selectedExtension.student?.grade as any)?.school?.name} 
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-lg font-bold">
                    {selectedExtension.student?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedExtension.student?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedExtension.student?.grade as any)?.school?.name} · {(selectedExtension.student?.grade as any)?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">과제</p>
                <p className="font-medium text-sm">{getTaskTitle(selectedExtension)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                  <p className="text-[10px] text-muted-foreground mb-1">원래 마감일</p>
                  <p className="font-bold text-sm text-destructive">
                    {format(new Date(selectedExtension.original_due_date), 'M월 d일', { locale: ko })}
                  </p>
                </div>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[10px] text-muted-foreground mb-1">연장 마감일</p>
                  <p className="font-bold text-sm text-primary">
                    {format(new Date(selectedExtension.new_due_date), 'M월 d일', { locale: ko })}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">다짐 한마디</p>
                <div className="p-4 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-xl border border-rose-100/50">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed italic text-foreground/80">
                      {selectedExtension.commitment_message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(selectedExtension.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                </p>
                <div className="flex items-center gap-1.5">
                  {/* 문자 피드백 */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-[11px] h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      setSmsDialogOpen(true);
                    }}
                  >
                    <img src={iconSms} alt="SMS" className="w-3.5 h-3.5" />
                    문자
                  </Button>
                  {/* 카톡 피드백 */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-[11px] h-8 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => {
                      setKakaoDialogOpen(true);
                    }}
                  >
                    <img src={iconKakao} alt="KakaoTalk" className="w-3.5 h-3.5" />
                    카톡
                  </Button>
                  {selectedExtension.status !== "confirmed" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-1.5 shadow-md"
                      onClick={() => {
                        if (window.confirm("이 옳은커밋을 확인 처리하시겠습니까?")) {
                          confirmMutation.mutate(selectedExtension.id);
                        }
                      }}
                      disabled={confirmMutation.isPending}
                    >
                      <Check className="w-3.5 h-3.5" />
                      확인 완료
                    </Button>
                  )}
                  {selectedExtension.status === "confirmed" && selectedExtension.approved_at && (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">
                      <Check className="w-3 h-3 mr-1" />
                      {format(new Date(selectedExtension.approved_at), 'M/d HH:mm')} 확인됨
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 지난 내역 팝업 */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-5 text-white flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <History className="w-5 h-5" />
                지난 옳은커밋 내역
              </DialogTitle>
              <DialogDescription className="text-white/60 flex items-center justify-between">
                <span>확인 완료된 옳은커밋 내역을 모아볼 수 있습니다</span>
                {confirmedExtensions.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10">
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span className="text-[11px]">전체 삭제</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>전체 내역을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          확인 완료된 옳은커밋 내역 {confirmedExtensions.length}건이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAllMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingConfirmed ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : confirmedExtensions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm">확인된 내역이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {confirmedExtensions.map((ext, index) => (
                  <CommitCard
                    key={ext.id}
                    ext={ext}
                    index={index}
                    getTaskTitle={getTaskTitle}
                    onSelect={setSelectedExtension}
                    showConfirmButton={false}
                    showConfirmedBadge
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 문자 피드백 다이얼로그 */}
      {selectedExtension && (
        <QuickMessageDialog
          open={smsDialogOpen}
          onOpenChange={setSmsDialogOpen}
          studentId={selectedExtension.student_id}
          studentName={selectedExtension.student?.name || ""}
          studentPhone={selectedExtension.student?.student_phone}
          parentPhone={selectedExtension.student?.parent_phone}
        />
      )}

      {/* 카톡 피드백 다이얼로그 */}
      {selectedExtension && (
        <QuickKakaoDialog
          open={kakaoDialogOpen}
          onOpenChange={setKakaoDialogOpen}
          studentId={selectedExtension.student_id}
          studentName={selectedExtension.student?.name || ""}
          studentPhone={selectedExtension.student?.student_phone}
          parentPhone={selectedExtension.student?.parent_phone}
        />
      )}
    </>
  );
}

// 커밋 카드 컴포넌트
function CommitCard({
  ext,
  index,
  getTaskTitle,
  onSelect,
  onConfirm,
  showConfirmButton = false,
  showConfirmedBadge = false,
}: {
  ext: DeadlineExtension;
  index: number;
  getTaskTitle: (ext: DeadlineExtension) => string;
  onSelect: (ext: DeadlineExtension) => void;
  onConfirm?: (id: string) => void;
  showConfirmButton?: boolean;
  showConfirmedBadge?: boolean;
}) {
  const schoolLogo = (ext.student?.grade as any)?.school?.logo_url;
  const schoolName = (ext.student?.grade as any)?.school?.name || "";

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-background to-muted/20 hover:shadow-sm hover:border-rose-200/50 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {showConfirmButton && onConfirm && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirm(ext.id);
          }}
          className="absolute top-1/2 -translate-y-1/2 right-1.5 z-10 w-5 h-5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-sm"
          title="확인 처리"
        >
          <Check className="w-3 h-3" />
        </button>
      )}

      <button onClick={() => onSelect(ext)} className="w-full px-3 py-2 text-left">
        <div className="flex items-start gap-2 flex-wrap">
          <Avatar className="w-5 h-5 flex-shrink-0 ring-1 ring-rose-100">
            {schoolLogo ? <AvatarImage src={cacheBustUrl(schoolLogo)} alt={schoolName} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-[8px] font-bold">
              {ext.student?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-xs w-14 truncate flex-shrink-0">{ext.student?.name}</span>
          <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">
            {format(new Date(ext.created_at), 'M/d HH:mm')}
          </span>
          <p className="text-xs text-foreground/60 italic flex-1 min-w-0 break-words whitespace-normal">
            {ext.commitment_message}
          </p>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-[16px] bg-rose-50 text-rose-600 border-rose-100 flex-shrink-0">
            {getTaskTitle(ext)}
          </Badge>
          <span className="text-[9px] text-muted-foreground flex-shrink-0">→</span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-[16px] bg-primary/5 text-primary border-primary/10 flex-shrink-0">
            {format(new Date(ext.new_due_date), 'M/d', { locale: ko })}
          </Badge>
          {showConfirmedBadge && ext.approved_at && (
            <Badge variant="secondary" className="text-[8px] px-1 py-0 h-[14px] bg-emerald-50 text-emerald-600 border-emerald-100 flex-shrink-0">
              <Check className="w-2 h-2 mr-0.5" />
              {format(new Date(ext.approved_at), 'M/d')}
            </Badge>
          )}
        </div>
      </button>
    </div>
  );
}
