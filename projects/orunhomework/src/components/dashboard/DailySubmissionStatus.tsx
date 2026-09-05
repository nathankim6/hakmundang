import { useState, useEffect, useMemo, useCallback } from "react";
import { BulkMessageDialog } from "./BulkMessageDialog";
import { BulkKakaoDialog } from "./BulkKakaoDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyWordPause } from "@/hooks/useDailyWordPause";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Camera, Users, Eye, UserPlus, BadgeCheck, AlertCircle, Filter, ListFilter, Heart, Send, Hourglass, CheckCheck, Pause, Play, FileText, PenLine } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DailySubmissionDetailDialog } from "./DailySubmissionDetailDialog";
import { AddStudentDialog } from "./AddStudentDialog";
import { QuickMessageDialog } from "./QuickMessageDialog";
import { QuickKakaoDialog } from "./QuickKakaoDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMessageTemplates, formatMessage } from "@/components/notifications/MessageTemplateDialog";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";
import iconDailyHeader from "@/assets/icon-daily-header.png";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface Submission {
  id: string;
  submitted_at: string;
  status: string;
  photo_urls?: string[] | null;
  teacher_note?: string | null;
}

interface StudentWithSubmission {
  id: string;
  name: string;
  student_phone?: string | null;
  parent_phone?: string | null;
  grade: {
    id: string;
    name: string;
    school: {
      id: string;
      name: string;
      logo_url?: string | null;
    };
  };
  submission: Submission | null;
}

interface DailySubmissionStatusProps {
  selectedDate?: Date;
}

export function DailySubmissionStatus({ selectedDate }: DailySubmissionStatusProps = {}) {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const { session } = useAuth();
  const { isPaused, pauseDailyWord, resumeDailyWord } = useDailyWordPause();
  const [selectedStudent, setSelectedStudent] = useState<StudentWithSubmission | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [messageStudent, setMessageStudent] = useState<StudentWithSubmission | null>(null);
  const [messageType, setMessageType] = useState<"sms" | "kakao" | null>(null);
  const [messageChoiceStudent, setMessageChoiceStudent] = useState<StudentWithSubmission | null>(null);
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [isBulkReviewing, setIsBulkReviewing] = useState(false);
  const [bulkReviewedStudents, setBulkReviewedStudents] = useState<StudentWithSubmission[]>([]);
  const [showBulkMessageChoice, setShowBulkMessageChoice] = useState(false);
  const [bulkMessageType, setBulkMessageType] = useState<"sms" | "kakao" | null>(null);
  const [bulkMessageMode, setBulkMessageMode] = useState<"template" | "custom" | null>(null);
  const [isPauseToggling, setIsPauseToggling] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<{
    id: string;
    name: string;
    school?: { id: string; name: string };
  } | null>(null);
  
  const targetDate = selectedDate || new Date();
  // KST 기준으로 날짜 포맷팅 (UTC 대신 로컬 타임존 사용)
  const formattedDate = format(targetDate, "yyyy-MM-dd");
  const todayFormatted = format(new Date(), "yyyy-MM-dd");
  const isToday = formattedDate === todayFormatted;

  // Realtime subscription for daily_word_submissions + students/grades/schools
  useEffect(() => {
    const channel = supabase
      .channel('daily-submissions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_word_submissions',
        },
        (payload) => {
          console.log('Daily submission changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["daily-submissions-only", formattedDate] });
          queryClient.invalidateQueries({ queryKey: ["unreviewed-submissions-all"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grades' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formattedDate, queryClient]);

  // 학생 목록은 별도 캐시로 관리 (변경이 적으므로 오래 캐싱)
  const { data: allStudents = [], isFetching: isFetchingStudents } = useQuery({
    queryKey: ["all-students-with-grades", ownerCodeId, shouldFilter],
    queryFn: async () => {
      // 소유한 학교의 학생만 조회
      let gradeIds: string[] | null = null;
      if (shouldFilter) {
        const { data: ownedSchools } = await supabase
          .from("schools").select("id").eq("owner_code_id", ownerCodeId!);
        const schoolIds = ownedSchools?.map(s => s.id) || [];
        if (schoolIds.length === 0) return [];
        const { data: ownedGrades } = await supabase
          .from("grades").select("id").in("school_id", schoolIds);
        gradeIds = ownedGrades?.map(g => g.id) || [];
        if (gradeIds.length === 0) return [];
      }

      let query = supabase
        .from("students")
        .select(`
          id,
          name,
          student_phone,
          parent_phone,
          grade:grade_id(
            id,
            name,
            school:school_id(
              id,
              name,
              logo_url
            )
          )
        `)
        .order("name");
      
      if (shouldFilter && gradeIds && gradeIds.length > 0) {
        query = query.in("grade_id", gradeIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2분 캐시
    gcTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });

  // 선택된 날짜의 제출 현황 조회 (photo_urls 제외 - 데이터 크기 최적화)
  const { data: submissions = [], isLoading: isLoadingSubmissions, isFetching: isFetchingSubmissions } = useQuery({
    queryKey: ["daily-submissions-only", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("id, student_id, submitted_at, status, teacher_note")
        .eq("submission_date", formattedDate);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  // 모든 반(grade) 조회 - 학생이 없는 반도 표시하기 위해
  const { data: allGrades = [] } = useQuery({
    queryKey: ["all-grades-with-schools", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("grades")
        .select(`
          id,
          name,
          school:school_id(
            id,
            name,
            logo_url
          )
        `)
        .order("name");

      if (shouldFilter) {
        const { data: ownedSchools } = await supabase
          .from("schools").select("id").eq("owner_code_id", ownerCodeId!);
        const schoolIds = ownedSchools?.map(s => s.id) || [];
        if (schoolIds.length === 0) return [];
        query = query.in("school_id", schoolIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 해당 날짜의 옳은커밋(기한연장) 사용 학생 조회 - confirmed 상태만 필터링 (연장기한, 작성내용 포함)
  const { data: commitExtensionsData = [] } = useQuery({
    queryKey: ["daily-commit-students", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadline_extensions")
        .select("student_id, new_due_date, commitment_message")
        .eq("daily_word_date", formattedDate)
        .eq("status", "confirmed");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // 미확인(미검토) 제출물 전체 조회 (모든 날짜)
  const { data: unreviewedSubmissions = [], isFetching: isFetchingUnreviewed } = useQuery({
    queryKey: ["unreviewed-submissions-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("id, student_id, submitted_at, status, teacher_note, submission_date")
        .eq("status", "submitted")
        .order("submission_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: showUnreviewedOnly,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  // 미확인 필터 모드: 미검토 제출물이 있는 학생만 표시
  const studentsWithSubmissions = useMemo(() => {
    if (showUnreviewedOnly) {
      // 미확인 모드: 모든 날짜의 미검토 제출물 기준 (학생당 여러 건이면 여러 번 표시)
      const studentMap = new Map(allStudents.map(s => [s.id, s]));
      const results: StudentWithSubmission[] = [];
      for (const sub of unreviewedSubmissions) {
        const student = studentMap.get(sub.student_id);
        if (student) {
          results.push({
            ...student,
            id: `${student.id}_${sub.id}`, // 고유 key를 위해 제출물 ID 결합
            submission: sub,
          } as StudentWithSubmission);
        }
      }
      return results;
    }
    
    // 일반 모드: 선택된 날짜 기준
    const submissionMap = new Map(
      submissions.map(s => [s.student_id, s])
    );
    
    return allStudents.map(student => ({
      ...student,
      submission: submissionMap.get(student.id) || null,
    })) as StudentWithSubmission[];
  }, [allStudents, submissions, unreviewedSubmissions, showUnreviewedOnly]);

  // 옳은커밋 사용 학생 Set + 상세 정보 Map (제출 여부와 무관하게 표시)
  const commitStudentSet = useMemo(() => {
    return new Set(commitExtensionsData.map(ext => ext.student_id));
  }, [commitExtensionsData]);

  const commitDetailMap = useMemo(() => {
    const map = new Map<string, { new_due_date: string; commitment_message: string }>();
    commitExtensionsData.forEach(ext => {
      map.set(ext.student_id, {
        new_due_date: ext.new_due_date,
        commitment_message: ext.commitment_message,
      });
    });
    return map;
  }, [commitExtensionsData]);

  const isLoading = allStudents.length === 0 && isLoadingSubmissions;
  const isRefreshing = isFetchingStudents || isFetchingSubmissions || isFetchingUnreviewed;

  const submittedCount = studentsWithSubmissions.filter(s => s.submission).length;
  const totalCount = showUnreviewedOnly ? submittedCount : studentsWithSubmissions.length;
  const submissionRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  // 학교별 > 학년별 그룹핑 (학생이 없는 반도 포함)
  const groupedBySchoolAndGrade = useMemo(() => {
    const acc: Record<string, { 
      schoolName: string; 
      schoolLogoUrl: string | null;
      grades: Record<string, { 
        grade: StudentWithSubmission["grade"]; 
        gradeName: string; 
        students: StudentWithSubmission[] 
      }> 
    }> = {};

    // 1) 먼저 모든 반을 빈 배열로 초기화
    if (!showUnreviewedOnly) {
      for (const g of allGrades) {
        const school = g.school as { id: string; name: string; logo_url?: string | null } | null;
        const schoolId = school?.id || "unknown";
        const schoolName = school?.name || "미지정";
        const schoolLogoUrl = school?.logo_url || null;
        if (!acc[schoolId]) {
          acc[schoolId] = { schoolName, schoolLogoUrl, grades: {} };
        }
        if (!acc[schoolId].grades[g.id]) {
          acc[schoolId].grades[g.id] = {
            grade: { id: g.id, name: g.name, school: school as StudentWithSubmission["grade"]["school"] },
            gradeName: g.name,
            students: [],
          };
        }
      }
    }

    // 2) 학생 데이터 매핑
    for (const student of studentsWithSubmissions) {
      const schoolName = student.grade?.school?.name || "미지정";
      const schoolId = student.grade?.school?.id || "unknown";
      const schoolLogoUrl = student.grade?.school?.logo_url || null;
      const gradeName = student.grade?.name || "미지정";
      const gradeId = student.grade?.id || "unknown";
      
      if (!acc[schoolId]) {
        acc[schoolId] = { schoolName, schoolLogoUrl, grades: {} };
      }
      if (!acc[schoolId].grades[gradeId]) {
        acc[schoolId].grades[gradeId] = {
          grade: student.grade,
          gradeName,
          students: [],
        };
      }
      acc[schoolId].grades[gradeId].students.push(student);
    }

    return acc;
  }, [studentsWithSubmissions, allGrades, showUnreviewedOnly]);

  const handleAddStudent = (grade: StudentWithSubmission["grade"]) => {
    setSelectedGrade(grade);
    setAddStudentDialogOpen(true);
  };

  const handleBulkReview = async () => {
    if (!unreviewedSubmissions.length || isBulkReviewing) return;
    const confirmed = window.confirm(`미확인 제출물 ${unreviewedSubmissions.length}건을 모두 확인 처리하시겠습니까?`);
    if (!confirmed) return;
    
    // Save the students who had unreviewed submissions for post-review messaging
    const reviewedStudentsList = studentsWithSubmissions.filter(
      s => s.submission && s.submission.status !== "reviewed"
    );
    
    setIsBulkReviewing(true);
    try {
      const ids = unreviewedSubmissions.map(s => s.id);
      
      // 사진은 유지 (30일 후 서버에서 자동 삭제)
      const { error } = await supabase
        .from("daily_word_submissions")
        .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["unreviewed-submissions-all"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-only"] });
      
      // Show message sending option after successful bulk review
      if (reviewedStudentsList.length > 0) {
        // 중복 학생 제거 (같은 학생이 여러 제출물로 중복될 수 있음)
        const seen = new Set<string>();
        const dedupedStudents = reviewedStudentsList
          .map(s => {
            const originalId = s.id.includes('_') ? s.id.split('_')[0] : s.id;
            return { ...s, id: originalId };
          })
          .filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
        setBulkReviewedStudents(dedupedStudents);
        setShowBulkMessageChoice(true);
      }
    } catch (err) {
      console.error("Bulk review failed:", err);
    } finally {
      setIsBulkReviewing(false);
    }
  };

  const handlePauseToggle = async () => {
    if (isPaused) {
      const confirmed = window.confirm("일일 단어과제를 재개하시겠습니까?\n오늘부터 다시 매일 과제가 생성됩니다.");
      if (!confirmed) return;
      setIsPauseToggling(true);
      try {
        await resumeDailyWord();
        toast.success("일일 단어과제가 재개되었습니다.");
      } catch (err) {
        toast.error("재개 처리 중 오류가 발생했습니다.");
      } finally {
        setIsPauseToggling(false);
      }
    } else {
      const confirmed = window.confirm("일일 단어과제를 중단하시겠습니까?\n\n기존 제출 기록은 그대로 유지되며, 새로운 일일과제 생성만 일시중지됩니다.\n재개하면 다시 매일 과제가 생성됩니다.");
      if (!confirmed) return;
      setIsPauseToggling(true);
      try {
        const studentIds = allStudents.map(s => s.id);
        await pauseDailyWord(studentIds);
        toast.success("일일 단어과제가 중단되었습니다.");
      } catch (err) {
        toast.error("중단 처리 중 오류가 발생했습니다.");
      } finally {
        setIsPauseToggling(false);
      }
    }
  };

  const handleBulkSendTemplate = async (msgType: "sms" | "kakao") => {
    if (bulkReviewedStudents.length === 0) return;
    
    const students = [...bulkReviewedStudents];
    setShowBulkMessageChoice(false);
    
    toast.success(`${students.length}명에게 확인 문자 발송 중...`);
    
    (async () => {
      try {
        const templates = await getMessageTemplates(session?.accessCodeId);
        let successCount = 0;
        let failCount = 0;

        for (const student of students) {
          try {
            const messageContent = formatMessage(templates.dailyWordReview, { studentName: student.name });
            const response = await supabase.functions.invoke("send-kakao-notification", {
              body: {
                studentId: student.id,
                studentName: student.name,
                submissionType: "daily_word",
                messageTemplate: messageContent,
                brandPrefix: templates.brandPrefix,
                messageType: msgType,
                recipientType: "student",
                ownerCodeId: session?.accessCodeId,
              },
            });
            if (response.data?.needsApiKey) {
              toast.error("🔑 솔라피 API 키가 설정되지 않았습니다.");
              return;
            }
            if (response.data?.insufficientBalance) {
              toast.error("💰 솔라피 잔액이 부족합니다.");
              return;
            }
            if (response.error || !response.data?.success) {
              failCount++;
            } else {
              successCount++;
            }
          } catch {
            failCount++;
          }
        }

        if (failCount > 0) {
          toast.warning(`발송 완료: ${successCount}명 성공, ${failCount}명 실패`);
        } else {
          toast.success(`${successCount}명에게 확인 문자 발송 완료!`);
        }
        queryClient.invalidateQueries({ queryKey: ["notifications-history"] });
      } catch (error: any) {
        toast.error(error.message || "발송 중 오류가 발생했습니다");
      }
      setBulkReviewedStudents([]);
    })();
  };

  // 복합 ID에서 원래 학생 ID를 추출하는 헬퍼
  const getOriginalStudent = (student: StudentWithSubmission): StudentWithSubmission => {
    const originalId = student.id.includes('_') ? student.id.split('_')[0] : student.id;
    return { ...student, id: originalId };
  };

  const handleRowClick = (student: StudentWithSubmission) => {
    if (student.submission) {
      setSelectedStudent(getOriginalStudent(student));
      setDetailDialogOpen(true);
    } else {
      // 미제출 학생 → 메시지 발송 선택 팝업
      setMessageChoiceStudent(getOriginalStudent(student));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="relative bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 text-white py-2 px-4 overflow-hidden">
          {/* 고급 장식 패턴 */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
          <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.06]" style={{
            background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)',
          }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-[0.04]" style={{
            background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)',
          }} />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center ${isRefreshing ? 'animate-pulse' : ''}`}>
                <img src={iconDailyHeader} alt="" className="w-7 h-7 object-cover rounded" />
              </div>
              <div>
                <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                  {showUnreviewedOnly ? "미확인 제출물" : "일일 단어과제"}
                </span>
                <div className="flex items-baseline gap-2">
                  {showUnreviewedOnly ? (
                    <span className="text-lg font-bold tracking-tight">
                      전체 날짜
                    </span>
                  ) : (
                    <>
                      <span className="text-lg font-bold tracking-tight">
                        {format(targetDate, "M월 d일", { locale: ko })}
                      </span>
                      <span className="text-sm font-medium text-white/70">
                        {format(targetDate, "EEEE", { locale: ko })}
                      </span>
                    </>
                  )}
                  {!isToday && !showUnreviewedOnly && (
                    <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 text-[10px]">
                      과거
                    </Badge>
                  )}
                  {isRefreshing && (
                    <span className="text-[10px] text-white/50 animate-pulse">갱신중...</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreviewedOnly(!showUnreviewedOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  showUnreviewedOnly 
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/30" 
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
               <ListFilter className="w-3 h-3" />
                미확인과제
              </button>
              {showUnreviewedOnly && submittedCount > 0 && (
                <button
                  onClick={handleBulkReview}
                  disabled={isBulkReviewing}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/50 disabled:opacity-50"
                >
                  <CheckCheck className="w-3 h-3" />
                  {isBulkReviewing ? "처리중..." : "전체확인처리"}
                </button>
              )}
              <button
                onClick={handlePauseToggle}
                disabled={isPauseToggling}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50 ${
                  isPaused 
                    ? "bg-blue-500/30 text-blue-200 border border-blue-400/30 hover:bg-blue-500/50" 
                    : "bg-red-500/20 text-red-200 border border-red-400/20 hover:bg-red-500/40"
                }`}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isPauseToggling ? "처리중..." : isPaused ? "과제재개" : "과제중단"}
              </button>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {showUnreviewedOnly 
                    ? submittedCount
                    : <>{submittedCount}<span className="text-white/50 font-normal">/ {totalCount}</span></>
                  }
                </div>
                <div className="text-[10px] text-white/50">
                  {showUnreviewedOnly ? "건 미확인" : `${submissionRate}%`}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
        {isPaused && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-700">
            <Pause className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">일일 단어과제가 중단되어 있습니다. 재개 버튼을 눌러 다시 시작할 수 있습니다.</p>
          </div>
        )}
        <>
        {/* 범례 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200/50" />
            <span className="text-muted-foreground">미제출</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-200/50" />
            <span className="text-muted-foreground">검토대기</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-200/50" />
            <span className="text-muted-foreground">확인완료</span>
          </div>
        </div>
          {totalCount === 0 && !showUnreviewedOnly ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>등록된 학생이 없습니다.</p>
            </div>
          ) : showUnreviewedOnly && submittedCount === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BadgeCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>미확인 제출물이 없습니다. 모두 확인 완료!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBySchoolAndGrade).map(([schoolId, { schoolName, schoolLogoUrl, grades }]) => {
                const allStudentsInSchool = Object.values(grades).flatMap(g => g.students);
                const schoolSubmitted = allStudentsInSchool.filter(s => s.submission).length;
                
                return (
                  <div key={schoolId} className="space-y-2">
                    {/* 학교 헤더 */}
                    <div className="relative flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 via-gray-50 to-slate-100 border border-slate-200/80 overflow-hidden">
                      {/* 장식 패턴 */}
                      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-200/40 to-transparent rounded-bl-full" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-slate-200/30 to-transparent rounded-tr-full" />
                      <div className="relative flex items-center gap-2.5">
                        {schoolLogoUrl ? (
                          <img 
                            src={cacheBustUrl(schoolLogoUrl)} 
                            alt={schoolName} 
                            className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-300/60 shadow-sm"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {schoolName.charAt(0)}
                          </div>
                        )}
                        <h3 className="font-semibold text-sm text-slate-700 tracking-tight">{schoolName}</h3>
                      </div>
                      <div className="relative flex items-center gap-1.5">
                        <div className="h-1.5 w-16 bg-slate-200/80 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${allStudentsInSchool.length > 0 ? (schoolSubmitted / allStudentsInSchool.length) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-600">
                          {schoolSubmitted}<span className="text-slate-400">/{allStudentsInSchool.length}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* 학년별 카드 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pl-1">
                      {Object.entries(grades).map(([gradeId, { grade, gradeName, students }]) => {
                        const gradeSubmitted = students.filter(s => s.submission).length;
                        const gradeRate = students.length > 0 ? Math.round((gradeSubmitted / students.length) * 100) : 0;
                        return (
                          <div key={gradeId} className="rounded-xl border border-border/60 bg-card shadow-sm flex flex-col overflow-hidden">
                            {/* 학년 헤더 */}
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/20">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${gradeRate === 100 ? 'bg-emerald-500' : gradeRate > 0 ? 'bg-amber-500' : 'bg-destructive/60'}`} />
                                <span className="font-semibold text-sm">{gradeName}</span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  {gradeSubmitted}/{students.length}
                                </span>
                                {(() => {
                                  const commitCount = students.filter(s => commitStudentSet.has(s.id)).length;
                                  if (commitCount === 0) return null;
                                  return (
                                    <span className="flex items-center gap-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm" title="옳은커밋 사용 학생 수">
                                      <Heart className="w-2.5 h-2.5 fill-current" />
                                      {commitCount}
                                    </span>
                                  );
                                })()}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddStudent(grade);
                                }}
                              >
                                <UserPlus className="w-3 h-3" />
                                추가
                              </Button>
                            </div>
                            {/* 학생 목록 - 그리드 */}
                            <div className="p-2.5">
                              {students.length === 0 ? (
                                <div className="py-3 text-center text-xs text-muted-foreground">
                                  <Users className="w-4 h-4 mx-auto mb-1 opacity-40" />
                                  등록된 학생이 없습니다
                                </div>
                              ) : (
                              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                                {students.map((student) => {
                                   const originalStudentId = student.id.includes('_') ? student.id.split('_')[0] : student.id;
                                   const hasSubmission = !!student.submission;
                                   const isReviewed = hasSubmission && student.submission?.status === "reviewed";
                                   const isPending = hasSubmission && student.submission?.status !== "reviewed";
                                   
                                   const isLateSubmission = hasSubmission && (() => {
                                     const submittedAt = new Date(student.submission!.submitted_at);
                                     const submissionDeadline = new Date(formattedDate);
                                     submissionDeadline.setDate(submissionDeadline.getDate() + 1);
                                     submissionDeadline.setHours(0, 0, 0, 0);
                                     return submittedAt >= submissionDeadline;
                                   })();
                                   
                                   return (
                                     <button
                                       key={student.id}
                                       className={`relative flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                                         isReviewed 
                                           ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 hover:shadow-sm" 
                                           : isPending
                                             ? "bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 hover:shadow-sm"
                                             : "bg-red-50 text-red-500 border border-red-200/60 hover:bg-red-100 hover:border-red-300 hover:shadow-sm"
                                       }`}
                                       onClick={() => handleRowClick(student)}
                                     >
                                       {commitStudentSet.has(originalStudentId) && (() => {
                                        const detail = commitDetailMap.get(originalStudentId);
                                        return (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="absolute -top-1.5 -right-1 flex items-center gap-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full shadow-sm whitespace-nowrap leading-none z-20">
                                                <Heart className="w-2 h-2 fill-current" />
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[200px] text-xs">
                                              <p className="font-semibold mb-0.5">옳은커밋</p>
                                              {detail && (
                                                <>
                                                  <p className="text-muted-foreground">연장기한: {format(new Date(detail.new_due_date), "M/d")}까지</p>
                                                  <p className="text-muted-foreground mt-0.5">"{detail.commitment_message}"</p>
                                                </>
                                              )}
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })()}
                                      {(isReviewed || isPending) && !isLateSubmission && (
                                         <span className={`absolute -top-1.5 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-1 ring-white z-10 ${
                                           isReviewed 
                                             ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" 
                                             : "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                                         }`}>
                                           {isReviewed ? (
                                             <BadgeCheck className="w-2 h-2" />
                                           ) : (
                                             <Hourglass className="w-2 h-2" />
                                           )}
                                         </span>
                                       )}
                                      <span className="whitespace-nowrap">{student.name}</span>
                                      {showUnreviewedOnly && (student.submission as any)?.submission_date && (
                                        <span className="text-[9px] opacity-60 ml-auto whitespace-nowrap font-mono">
                                          {format(new Date((student.submission as any).submission_date + "T00:00:00"), "M/d")}
                                        </span>
                                      )}
                                      {isLateSubmission && (
                                        <span className="absolute -top-1.5 -right-1 flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full shadow-sm whitespace-nowrap leading-none z-10" title="지각 제출">
                                          <Clock className="w-2 h-2" />
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>

        </CardContent>
      </Card>

      <DailySubmissionDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        student={selectedStudent}
        submission={selectedStudent?.submission || null}
      />

      <AddStudentDialog
        open={addStudentDialogOpen}
        onOpenChange={setAddStudentDialogOpen}
        grade={selectedGrade}
      />

      {/* 미제출 학생 메시지 발송 선택 팝업 */}
      <Dialog open={!!messageChoiceStudent} onOpenChange={(open) => !open && setMessageChoiceStudent(null)}>
        <DialogContent className="max-w-xs p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4" />
                {messageChoiceStudent?.name}에게 알림 발송
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs">
                미완료 과제 확인 및 알림 발송
              </DialogDescription>
            </DialogHeader>
          </div>
          {/* 미완료 과제 리스트 */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              미완료 과제
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-destructive/5 border border-destructive/10">
                <Camera className="w-3 h-3 text-destructive/60 flex-shrink-0" />
                <span className="text-[11px] text-foreground flex-1">
                  일일 단어과제
                </span>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {format(targetDate, "M월 d일", { locale: ko })}
                </span>
              </div>
            </div>
          </div>
          {/* 발송 버튼 */}
          <div className="p-4 pt-2 flex gap-3">
            <button
              className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-blue-400 hover:bg-blue-50 transition-all"
              onClick={() => {
                setMessageStudent(messageChoiceStudent);
                setMessageType("sms");
                setMessageChoiceStudent(null);
              }}
            >
              <img src={iconSms} alt="SMS" className="w-8 h-8" />
              <span className="text-xs font-semibold">문자 발송</span>
            </button>
            <button
              className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-yellow-400 hover:bg-yellow-50 transition-all"
              onClick={() => {
                setMessageStudent(messageChoiceStudent);
                setMessageType("kakao");
                setMessageChoiceStudent(null);
              }}
            >
              <img src={iconKakao} alt="KakaoTalk" className="w-8 h-8 rounded" />
              <span className="text-xs font-semibold">카톡 발송</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS 발송 */}
      {messageStudent && messageType === "sms" && (
        <QuickMessageDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); }}}
          studentId={messageStudent.id}
          studentName={messageStudent.name}
          studentPhone={messageStudent.student_phone}
          parentPhone={messageStudent.parent_phone}
        />
      )}

      {/* 카톡 발송 */}
      {messageStudent && messageType === "kakao" && (
        <QuickKakaoDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); }}}
          studentId={messageStudent.id}
          studentName={messageStudent.name}
          studentPhone={messageStudent.student_phone}
          parentPhone={messageStudent.parent_phone}
        />
      )}

      {/* 전체확인처리 후 메시지 발송 선택 팝업 */}
      <Dialog open={showBulkMessageChoice} onOpenChange={(open) => {
        setShowBulkMessageChoice(open);
        if (!open) setBulkMessageMode(null);
      }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-sm flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                확인 처리 완료!
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                {bulkReviewedStudents.length}명의 제출물이 확인 처리되었습니다. 알림을 발송하시겠습니까?
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4 space-y-3">
            {/* 발송 방식 선택 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">발송 방식</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBulkMessageMode("template")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    bulkMessageMode === "template" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">템플릿 사용</p>
                    <p className="text-[10px] text-muted-foreground">저장된 확인문자</p>
                  </div>
                </button>
                <button
                  onClick={() => setBulkMessageMode("custom")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    bulkMessageMode === "custom" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <PenLine className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">직접 입력</p>
                    <p className="text-[10px] text-muted-foreground">메시지 직접 작성</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 발송 채널 선택 */}
            {bulkMessageMode && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">발송 채널</Label>
                <div className="flex gap-3">
                  <button
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-border hover:border-blue-400 hover:bg-blue-50 transition-all"
                    onClick={() => {
                      if (bulkMessageMode === "template") {
                        handleBulkSendTemplate("sms");
                      } else {
                        setBulkMessageType("sms");
                        setShowBulkMessageChoice(false);
                      }
                    }}
                  >
                    <img src={iconSms} alt="SMS" className="w-7 h-7" />
                    <span className="text-[11px] font-semibold">문자</span>
                  </button>
                  <button
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-border hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                    onClick={() => {
                      if (bulkMessageMode === "template") {
                        handleBulkSendTemplate("kakao");
                      } else {
                        setBulkMessageType("kakao");
                        setShowBulkMessageChoice(false);
                      }
                    }}
                  >
                    <img src={iconKakao} alt="KakaoTalk" className="w-7 h-7 rounded" />
                    <span className="text-[11px] font-semibold">카톡</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={() => {
                setShowBulkMessageChoice(false);
                setBulkReviewedStudents([]);
                setBulkMessageMode(null);
              }}
            >
              발송 안 함
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 전체확인처리 후 일괄 SMS 발송 */}
      {bulkMessageType === "sms" && bulkReviewedStudents.length > 0 && (
        <BulkMessageDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setBulkMessageType(null); setBulkReviewedStudents([]); }}}
          students={bulkReviewedStudents.map(s => ({
            id: s.id,
            name: s.name,
            studentPhone: s.student_phone,
            parentPhone: s.parent_phone,
          }))}
        />
      )}

      {/* 전체확인처리 후 일괄 카톡 발송 */}
      {bulkMessageType === "kakao" && bulkReviewedStudents.length > 0 && (
        <BulkKakaoDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setBulkMessageType(null); setBulkReviewedStudents([]); }}}
          students={bulkReviewedStudents.map(s => ({
            id: s.id,
            name: s.name,
            studentPhone: s.student_phone,
            parentPhone: s.parent_phone,
          }))}
        />
      )}
    </TooltipProvider>
  );
}