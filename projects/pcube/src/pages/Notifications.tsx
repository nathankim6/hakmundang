import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { getKSTNow } from "@/utils/koreanTime";
import { ko } from "date-fns/locale";
import {
  MessageSquare,
  Check,
  Send,
  AlertCircle,
  Building2,
  CalendarDays,
  XCircle,
  CheckCircle2,
  Settings,
  Clock,
  Trash2,
  BarChart3,
  Coins,
  ChevronLeft,
  ChevronRight } from
"lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { toast } from "sonner";
import { SendMessageDialog } from "@/components/notifications/SendMessageDialog";
import { MessageTemplateDialog } from "@/components/notifications/MessageTemplateDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOwnerStudentIds } from "@/hooks/useOwnerStudentIds";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";

interface Notification {
  id: string;
  student_id: string;
  type: string;
  message: string;
  status: string;
  submission_type: string | null;
  teacher_note: string | null;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
  recipient_phone: string | null;
  recipient_type: string | null;
  student: {
    name: string;
    parent_phone: string | null;
    student_phone: string | null;
    grade: {
      name: string;
      school: {
        name: string;
        logo_url: string | null;
      };
    };
  };
}

const submissionTypeLabels: Record<string, {label: string;className: string;}> = {
  daily_word: { label: "일일 단어", className: "bg-pink-100 text-pink-700" },
  review: { label: "녹음 과제", className: "bg-purple-100 text-purple-700" },
  manual: { label: "수동 발송", className: "bg-blue-100 text-blue-700" }
};

const statusConfig: Record<string, {label: string;className: string;icon: typeof Check;}> = {
  sent: { label: "발송 완료", className: "bg-success/10 text-success", icon: CheckCircle2 },
  pending: { label: "대기 중", className: "bg-warning/10 text-warning", icon: Clock },
  failed: { label: "발송 실패", className: "bg-destructive/10 text-destructive", icon: XCircle }
};

export default function Notifications() {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailNotification, setDetailNotification] = useState<any>(null);
  const ITEMS_PER_PAGE = 30;
  const queryClient = useQueryClient();
  const { studentIds, shouldFilter, isLoading: isLoadingOwner } = useOwnerStudentIds();
  const { ownerCodeId } = useOwnerFilter();

  // Fetch notification history
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-history", studentIds],
    enabled: !isLoadingOwner,
    queryFn: async () => {
      let query = supabase.
      from("notifications").
      select(`
          *,
          student:students(
            name,
            student_phone,
            parent_phone,
            grade:grades(
              name,
              school:schools(name, logo_url)
            )
          )
        `).
      order("created_at", { ascending: false }).
      limit(200);

      if (shouldFilter && studentIds) {
        if (studentIds.length === 0) return [];
        query = query.in("student_id", studentIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Notification[];
    },
    refetchInterval: 30000
  });

  // 발신번호 조회 (owner별)
  const { data: senderPhone = "" } = useQuery({
    queryKey: ["sender-phone", ownerCodeId],
    queryFn: async () => {
      let query = supabase
        .from("app_settings")
        .select("value")
        .eq("key", "solapi_sender_phone");
      if (ownerCodeId) {
        query = query.eq("owner_code_id", ownerCodeId);
      }
      const { data } = await query.limit(1).maybeSingle();
      return data?.value || "";
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.
      from("notifications").
      delete().
      eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
      toast.success("알림 내역이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("삭제에 실패했습니다.");
    }
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const today = getKSTNow();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const todayNotifications = notifications.filter((n) => {
      const date = new Date(n.created_at);
      return date >= todayStart && date <= todayEnd;
    });

    const sent = todayNotifications.filter((n) => n.status === "sent").length;
    const failed = todayNotifications.filter((n) => n.status === "failed").length;
    const total = todayNotifications.length;
    const successRate = total > 0 ? Math.round(sent / total * 100) : 100;

    return { sent, failed, total, successRate };
  }, [notifications]);

  // Calculate monthly statistics and cost
  const monthlyStats = useMemo(() => {
    const today = getKSTNow();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const monthlyNotifications = notifications.filter((n) => {
      const date = new Date(n.created_at);
      return date >= monthStart && date <= monthEnd && n.status === "sent";
    });

    const SMS_PRICE = 18;
    const LMS_PRICE = 45;

    let smsCount = 0;
    let lmsCount = 0;

    monthlyNotifications.forEach((n) => {
      const messageLength = n.message?.length || 0;
      if (messageLength <= 45) {
        smsCount++;
      } else {
        lmsCount++;
      }
    });

    const totalCount = monthlyNotifications.length;
    const totalCost = smsCount * SMS_PRICE + lmsCount * LMS_PRICE;
    const totalCostWithVat = Math.round(totalCost * 1.1);

    return {
      totalCount,
      smsCount,
      lmsCount,
      totalCost,
      totalCostWithVat,
      month: format(today, "M월", { locale: ko })
    };
  }, [notifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = n.student?.name?.toLowerCase().includes(term);
        const matchesSchool = n.student?.grade?.school?.name?.toLowerCase().includes(term);
        const matchesMessage = n.message?.toLowerCase().includes(term);
        if (!matchesName && !matchesSchool && !matchesMessage) return false;
      }
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (typeFilter !== "all" && n.submission_type !== typeFilter) return false;
      return true;
    });
  }, [notifications, searchTerm, statusFilter, typeFilter]);

  // Reset page when filters change
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, currentPage, ITEMS_PER_PAGE]);

  // Reset to page 1 when filters change
  const handleFilterChange = useCallback((setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={MessageSquare}
        title="알림센터"
        description="카카오톡/SMS 발송 내역 관리"
        showDate={false}
        actions={
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/10 text-white hover:bg-white/20" onClick={() => setTemplateDialogOpen(true)}>
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              템플릿
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setSendDialogOpen(true)}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              메시지 발송
            </Button>
          </div>
        } />

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative overflow-hidden rounded-2xl sec-indigo sec-tint p-4 shadow-sm group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-[11px] font-semibold text-blue-600/60 uppercase tracking-wider">오늘 발송</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 tracking-tight">{stats.total}<span className="text-sm font-normal text-blue-400 ml-0.5">건</span></p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl sec-teal sec-tint p-4 shadow-sm group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/20 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600/60 uppercase tracking-wider">발송 성공</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight">{stats.sent}<span className="text-sm font-normal text-emerald-400 ml-0.5">건</span></p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl sec-plum sec-tint p-4 shadow-sm group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-200/20 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <span className="text-[11px] font-semibold text-rose-600/60 uppercase tracking-wider">발송 실패</span>
            </div>
            <p className="text-2xl font-bold text-rose-700 tracking-tight">{stats.failed}<span className="text-sm font-normal text-rose-400 ml-0.5">건</span></p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl sec-gold sec-tint p-4 shadow-sm group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-200/20 rounded-full blur-2xl -translate-y-4 translate-x-4" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <span className="text-[11px] font-semibold text-violet-600/60 uppercase tracking-wider">성공률</span>
            </div>
            <p className="text-2xl font-bold text-violet-700 tracking-tight">{stats.successRate}<span className="text-sm font-normal text-violet-400 ml-0.5">%</span></p>
          </div>
        </div>
      </div>

      {/* 월간 사용량 및 비용 통계 */}
      <Card className="overflow-hidden border border-border/50 shadow-sm bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Coins className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">{monthlyStats.month} 사용량 통계</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
              <p className="text-[11px] text-muted-foreground mb-1">총 발송 건수</p>
              <p className="text-xl font-bold text-foreground">{monthlyStats.totalCount}건</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60">
              <p className="text-[11px] text-sky-600/70 mb-1">SMS (45자 이하)</p>
              <p className="text-xl font-bold text-sky-700">{monthlyStats.smsCount}건</p>
              <p className="text-[10px] text-sky-400">@18원/건</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100/60">
              <p className="text-[11px] text-purple-600/70 mb-1">LMS (45자 초과)</p>
              <p className="text-xl font-bold text-purple-700">{monthlyStats.lmsCount}건</p>
              <p className="text-[10px] text-purple-400">@45원/건</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
              <div className="flex items-center gap-1 mb-1">
                <Coins className="w-3 h-3 text-amber-600" />
                <p className="text-[11px] text-amber-600/70">예상 비용</p>
              </div>
              <p className="text-xl font-bold text-amber-700">{monthlyStats.totalCostWithVat.toLocaleString()}원</p>
              <p className="text-[10px] text-amber-400">VAT 포함</p>
            </div>
          </div>
          
          <div className="mt-3 text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <span>💡 Solapi 기준 단가: SMS 18원, LMS 45원, 카카오 알림톡 9원, 친구톡 15원 (VAT 별도)</span>
          </div>
        </CardContent>
      </Card>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="학생 이름, 학교, 메시지로 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full" />

        </div>
        <Select value={statusFilter} onValueChange={(v) => handleFilterChange(setStatusFilter, v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="sent">발송 완료</SelectItem>
            <SelectItem value="failed">발송 실패</SelectItem>
            <SelectItem value="pending">대기 중</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => handleFilterChange(setTypeFilter, v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="유형 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 유형</SelectItem>
            <SelectItem value="daily_word">일일 단어</SelectItem>
            <SelectItem value="review">녹음 과제</SelectItem>
            <SelectItem value="manual">수동 발송</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 발송 내역 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            발송 내역
          </CardTitle>
          <CardDescription>
            최근 발송된 메시지 목록입니다. (총 {filteredNotifications.length}개 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)}개 표시)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isLoadingOwner ?
          <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div> :
          filteredNotifications.length === 0 ?
          <div className="text-center py-8 text-muted-foreground">
              발송 내역이 없습니다.
            </div> :

          <>
             {/* 테이블 헤더 */}
             <div className="grid grid-cols-[1.5rem_2rem_5rem_4.5rem_1fr_5.5rem_3rem_3.5rem_3.5rem_1.5rem] gap-x-2 items-center px-3 py-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider border-b border-border/40 bg-muted/20 rounded-t-lg">
               <span>#</span>
               <span></span>
               <span>시간</span>
               <span>학생</span>
               <span>메시지</span>
               <span>수신</span>
               <span>유형</span>
               <span>타입</span>
               <span>상태</span>
               <span></span>
             </div>
             <div className="divide-y divide-border/20">
              {paginatedNotifications.map((notification, index) => {
                const status = statusConfig[notification.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const submissionType = notification.submission_type ?
                submissionTypeLabels[notification.submission_type] :
                null;

                const messageLength = notification.message?.length || 0;
                const isKakao = notification.type === "kakao";
                const isSMS = !isKakao && messageLength <= 45;
                const messageType = isKakao ? "KAKAO" : isSMS ? "SMS" : "LMS";
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

                const raw = notification.sent_at || notification.created_at;
                const kst = new Date(new Date(raw).getTime() + 9 * 60 * 60 * 1000);

                return (
                  <div
                    key={notification.id}
                    className="group grid grid-cols-[1.5rem_2rem_5rem_4.5rem_1fr_5.5rem_3rem_3.5rem_3.5rem_1.5rem] gap-x-2 items-center px-3 py-1.5 hover:bg-muted/30 transition-colors"
                  >
                    {/* # */}
                    <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                      {String(globalIndex + 1).padStart(2, "0")}
                    </span>

                    {/* Logo */}
                    {notification.student?.grade?.school?.logo_url ? (
                      <img
                        src={cacheBustUrl(notification.student.grade.school.logo_url)}
                        alt=""
                        className="w-5 h-5 rounded-md object-cover border border-border/30"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-muted/60 flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border/30">
                        {notification.student?.grade?.school?.name?.slice(0, 1) || "?"}
                      </div>
                    )}

                    {/* Time */}
                    <div className="text-[10px] tabular-nums text-muted-foreground/60 leading-tight">
                      <div>{format(kst, "MM.dd")}<span className="ml-1 font-medium text-muted-foreground/80">{format(kst, "HH:mm")}</span></div>
                    </div>

                    {/* Student */}
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] font-semibold text-foreground truncate">{notification.student?.name || "?"}</span>
                      {notification.recipient_type && (
                        <span className={`text-[8px] font-bold px-1 rounded ${
                          notification.recipient_type === "parent"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-cyan-50 text-cyan-600"
                        }`}>
                          {notification.recipient_type === "parent" ? "부" : "학"}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p
                      className="text-[11px] text-muted-foreground/70 truncate cursor-pointer hover:text-foreground hover:underline"
                      title="클릭하여 전체 내용 보기"
                      onClick={() => setDetailNotification(notification)}
                    >{notification.message}</p>

                    {/* Phone */}
                    <span className="text-[9px] tabular-nums text-muted-foreground/45 truncate">
                      {notification.recipient_phone?.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") || "-"}
                    </span>

                    {/* Submission Type */}
                    {submissionType ? (
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded text-center ${submissionType.className}`}>
                        {submissionType.label === "일일 단어" ? "단어" : submissionType.label === "녹음 과제" ? "녹음" : "수동"}
                      </span>
                    ) : <span />}

                    {/* SMS/LMS */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-center ${
                      isSMS ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"
                    }`}>{messageType}</span>

                    {/* Status */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-center ${status.className}`}>
                      {notification.status === "sent" ? "완료" : notification.status === "failed" ? "실패" : "대기"}
                    </span>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("이 알림을 삭제하시겠습니까?")) {
                          deleteMutation.mutate(notification.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
             </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0">
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
          }
        </CardContent>
      </Card>

      <SendMessageDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen} />
      <MessageTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen} />

      {/* 메시지 상세 보기 */}
      <Dialog open={!!detailNotification} onOpenChange={(open) => { if (!open) setDetailNotification(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {detailNotification?.student?.name || "?"} · 발송 메시지
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>
                {detailNotification && format(
                  new Date(new Date(detailNotification.sent_at || detailNotification.created_at).getTime() + 9 * 60 * 60 * 1000),
                  "M/d(EEE) HH:mm",
                  { locale: ko }
                )}
              </span>
              {detailNotification?.recipient_phone && (
                <span className="tabular-nums">
                  {detailNotification.recipient_phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}
                </span>
              )}
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-[13px] leading-relaxed whitespace-pre-line break-all max-h-[50vh] overflow-y-auto">
              {detailNotification?.message}
            </div>
            {detailNotification?.teacher_note && (
              <div className="rounded-xl border border-border/50 bg-background p-3 text-[12px] whitespace-pre-line break-all">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">선생님 피드백</p>
                {detailNotification.teacher_note}
              </div>
            )}
            {detailNotification?.error_message && (
              <p className="text-[11px] text-destructive whitespace-pre-line break-all">{detailNotification.error_message}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
