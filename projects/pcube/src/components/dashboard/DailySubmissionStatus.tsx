import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
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
import { AlertCircle, BadgeCheck, BookOpen, Camera, CheckCheck, CheckCircle2, Clock, Eye, Filter, Heart, Hourglass, ListFilter, MessageCircle, MessageSquare, Pause, Play, Send, UserPlus, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
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
import { DailySubmissionDetailDialog } from "./DailySubmissionDetailDialog";
import { AddStudentDialog } from "./AddStudentDialog";
import { QuickMessageDialog } from "./QuickMessageDialog";
import { QuickKakaoDialog } from "./QuickKakaoDialog";
import { Button } from "@/components/ui/button";
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
  const [selectedStudent, setSelectedStudent] = useState<StudentWithSubmission | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [messageStudent, setMessageStudent] = useState<StudentWithSubmission | null>(null);
  const [messageType, setMessageType] = useState<"sms" | "kakao" | null>(null);
  const [messageChoiceStudent, setMessageChoiceStudent] = useState<StudentWithSubmission | null>(null);
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [isBulkReviewing, setIsBulkReviewing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<{
    id: string;
    name: string;
    school?: { id: string; name: string };
  } | null>(null); // kept for AddStudentDialog compatibility

  // 단어과제 일시중지 상태 조회
  const { data: pauseData } = useQuery({
    queryKey: ["daily-word-paused", ownerCodeId],
    queryFn: async () => {
      if (!ownerCodeId) return null;
      const { data, error } = await supabase
        .from("app_settings")
        .select("id, value")
        .eq("owner_code_id", ownerCodeId)
        .eq("key", "daily_word_paused")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!ownerCodeId,
  });

  const isDailyWordPaused = !!pauseData;

  // 일시중지 토글 뮤테이션
  const togglePause = useMutation({
    mutationFn: async () => {
      if (!ownerCodeId) throw new Error("No owner code");

      if (isDailyWordPaused) {
        // 재개: 일시중지 해제 + 중지 기간 동안의 밀린 과제를 모두 dismiss 처리
        const pauseStartDate = pauseData!.value;
        const today = new Date();
        const formatDate = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        // 소유한 학교의 모든 학생 ID 조회
        const { data: ownedSchools } = await supabase
          .from("schools").select("id").eq("owner_code_id", ownerCodeId);
        const schoolIds = ownedSchools?.map(s => s.id) || [];
        if (schoolIds.length > 0) {
          const { data: ownedGrades } = await supabase
            .from("grades").select("id").in("school_id", schoolIds);
          const gradeIds = ownedGrades?.map(g => g.id) || [];
          if (gradeIds.length > 0) {
            const { data: students } = await supabase
              .from("students").select("id").in("grade_id", gradeIds);
            const studentIds = students?.map(s => s.id) || [];

            if (studentIds.length > 0) {
              // 중지 기간의 날짜 목록 생성
              const dates: string[] = [];
              const current = new Date(pauseStartDate);
              current.setHours(0, 0, 0, 0);
              const todayDate = new Date(formatDate(today));
              while (current <= todayDate) {
                dates.push(formatDate(current));
                current.setDate(current.getDate() + 1);
              }

              if (dates.length > 0) {
                // 기존 dismiss 기록 조회하여 중복 방지
                const { data: existing } = await supabase
                  .from("dismissed_daily_words")
                  .select("student_id, dismissed_date")
                  .in("student_id", studentIds)
                  .in("dismissed_date", dates);

                const existingSet = new Set(
                  (existing || []).map(e => `${e.student_id}_${e.dismissed_date}`)
                );

                // 중지 기간 동안의 제출물 삭제
                for (const date of dates) {
                  await supabase
                    .from("daily_word_submissions")
                    .delete()
                    .in("student_id", studentIds)
                    .eq("submission_date", date);
                }

                // 새로운 dismiss 레코드 생성 (중복 제외)
                const dismissRecords: { student_id: string; dismissed_date: string }[] = [];
                for (const studentId of studentIds) {
                  for (const date of dates) {
                    if (!existingSet.has(`${studentId}_${date}`)) {
                      dismissRecords.push({ student_id: studentId, dismissed_date: date });
                    }
                  }
                }

                // 배치로 삽입 (500개씩)
                for (let i = 0; i < dismissRecords.length; i += 500) {
                  const batch = dismissRecords.slice(i, i + 500);
                  await supabase.from("dismissed_daily_words").insert(batch);
                }
              }
            }
          }
        }

        // 일시중지 설정 삭제
        await supabase
          .from("app_settings")
          .delete()
          .eq("id", pauseData!.id);
      } else {
        // 일시중지: 오늘 날짜를 시작일로 저장
        const today = new Date();
        const formatDate = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };
        const todayStr = formatDate(today);
        await supabase.from("app_settings").insert({
          key: "daily_word_paused",
          value: todayStr,
          owner_code_id: ownerCodeId,
        });

        // 당일 단어과제도 생성되지 않도록 오늘 날짜를 즉시 dismiss 처리
        const { data: ownedSchools } = await supabase
          .from("schools").select("id").eq("owner_code_id", ownerCodeId);
        const schoolIds = ownedSchools?.map(s => s.id) || [];
        if (schoolIds.length > 0) {
          const { data: ownedGrades } = await supabase
            .from("grades").select("id").in("school_id", schoolIds);
          const gradeIds = ownedGrades?.map(g => g.id) || [];
          if (gradeIds.length > 0) {
            const { data: students } = await supabase
              .from("students").select("id").in("grade_id", gradeIds);
            const studentIds = students?.map(s => s.id) || [];
            if (studentIds.length > 0) {
              // 이미 제출된 기록은 보존하고, 오늘자 과제 생성만 막습니다.


              const { data: existing } = await supabase
                .from("dismissed_daily_words")
                .select("student_id")
                .in("student_id", studentIds)
                .eq("dismissed_date", todayStr);
              const existingSet = new Set((existing || []).map(e => e.student_id));

              const records = studentIds
                .filter(id => !existingSet.has(id))
                .map(id => ({ student_id: id, dismissed_date: todayStr }));

              for (let i = 0; i < records.length; i += 500) {
                await supabase.from("dismissed_daily_words").insert(records.slice(i, i + 500));
              }
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-word-paused"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-only"] });
      queryClient.invalidateQueries({ queryKey: ["unreviewed-submissions-all"] });
      if (isDailyWordPaused) {
        toast.success("단어과제가 재개되었습니다!");
      } else {
        toast.success("단어과제가 일시중지되었습니다.");
      }
    },
    onError: (error) => {
      console.error("Pause toggle failed:", error);
      toast.error("처리에 실패했습니다.");
    },
  });
  
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

  // 그룹(태그) 목록 조회
  const { data: allTags = [] } = useQuery({
    queryKey: ["student-tags-for-daily", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("student_tags")
        .select("id, name, color")
        .order("name");
      if (shouldFilter) {
        query = query.eq("owner_code_id", ownerCodeId!);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // 태그-학생 매핑 조회
  const { data: tagAssignments = [] } = useQuery({
    queryKey: ["student-tag-assignments-for-daily"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_tag_assignments")
        .select("student_id, tag_id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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

  const commitStudentSet = useMemo(() => new Set<string>(), []);
  const commitDetailMap = useMemo(() => new Map<string, { new_due_date: string; commitment_message: string }>(), []);

  const isLoading = allStudents.length === 0 && isLoadingSubmissions;
  const isRefreshing = isFetchingStudents || isFetchingSubmissions || isFetchingUnreviewed;

  const submittedCount = studentsWithSubmissions.filter(s => s.submission).length;
  const totalCount = showUnreviewedOnly ? submittedCount : studentsWithSubmissions.length;
  const submissionRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  // 그룹(태그)별 학생 그룹핑
  const groupedByTag = useMemo(() => {
    // 학생ID → 태그ID 매핑 (학생이 여러 태그에 속할 수 있으므로 배열)
    const studentToTags = new Map<string, string[]>();
    for (const a of tagAssignments) {
      const existing = studentToTags.get(a.student_id) || [];
      existing.push(a.tag_id);
      studentToTags.set(a.student_id, existing);
    }

    const tagMap = new Map(allTags.map(t => [t.id, t]));

    const acc: Record<string, {
      tagName: string;
      tagColor: string;
      students: StudentWithSubmission[];
    }> = {};

    // 모든 태그를 빈 배열로 초기화
    if (!showUnreviewedOnly) {
      for (const tag of allTags) {
        acc[tag.id] = { tagName: tag.name, tagColor: tag.color, students: [] };
      }
    }

    // 태그 미지정 그룹
    const untaggedKey = "untagged";

    for (const student of studentsWithSubmissions) {
      const originalId = student.id.includes('_') ? student.id.split('_')[0] : student.id;
      const tags = studentToTags.get(originalId);
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          const tag = tagMap.get(tagId);
          if (!acc[tagId]) {
            acc[tagId] = { tagName: tag?.name || "미지정", tagColor: tag?.color || "#94a3b8", students: [] };
          }
          acc[tagId].students.push(student);
        }
      } else {
        if (!acc[untaggedKey]) {
          acc[untaggedKey] = { tagName: "미지정 그룹", tagColor: "#94a3b8", students: [] };
        }
        acc[untaggedKey].students.push(student);
      }
    }

    return acc;
  }, [studentsWithSubmissions, allTags, tagAssignments, showUnreviewedOnly]);

  const handleAddStudent = (grade: StudentWithSubmission["grade"]) => {
    setSelectedGrade(grade);
    setAddStudentDialogOpen(true);
  };

  const handleBulkReview = async () => {
    if (!unreviewedSubmissions.length || isBulkReviewing) return;
    const confirmed = window.confirm(`미확인 제출물 ${unreviewedSubmissions.length}건을 모두 확인 처리하시겠습니까?`);
    if (!confirmed) return;
    
    setIsBulkReviewing(true);
    try {
      const ids = unreviewedSubmissions.map(s => s.id);
      const { error } = await supabase
        .from("daily_word_submissions")
        .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["unreviewed-submissions-all"] });
      queryClient.invalidateQueries({ queryKey: ["daily-submissions-only"] });
    } catch (err) {
      console.error("Bulk review failed:", err);
    } finally {
      setIsBulkReviewing(false);
    }
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
        <CardHeader className="relative sec-teal sec-header py-1.5 px-3.5 overflow-hidden">
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
          <div className="relative flex items-center justify-between gap-2 flex-nowrap overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 shrink-0 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center ${isRefreshing ? 'animate-pulse' : ''}`}>
                <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-medium text-white/60 uppercase tracking-wide leading-none whitespace-nowrap">
                  {showUnreviewedOnly ? "미확인 제출물" : "일일 단어과제"}
                </span>
                <div className="flex items-baseline gap-1.5 flex-nowrap whitespace-nowrap">
                  {showUnreviewedOnly ? (
                    <span className="text-sm font-semibold tracking-tight">
                      전체 날짜
                    </span>
                  ) : (
                    <>
                      <span className="text-sm font-semibold tracking-tight">
                        {format(targetDate, "M월 d일", { locale: ko })}
                      </span>
                      <span className="hidden sm:inline text-xs font-medium text-white/60">
                        {format(targetDate, "EEEE", { locale: ko })}
                      </span>

                    </>
                  )}
                  {!isToday && !showUnreviewedOnly && (
                    <Badge variant="secondary" className="shrink-0 whitespace-nowrap bg-white/10 text-white/80 border-0 text-[10px]">
                      과거
                    </Badge>
                  )}
                  {isDailyWordPaused && (
                    <Badge variant="secondary" className="shrink-0 whitespace-nowrap bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px]">
                      ⏸ 중지중
                    </Badge>
                  )}
                  {isRefreshing && (
                    <span className="text-[10px] text-white/50 animate-pulse whitespace-nowrap">갱신중...</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0 flex-nowrap [&_button]:whitespace-nowrap">

              <button
                onClick={() => setShowUnreviewedOnly(!showUnreviewedOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  showUnreviewedOnly 
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/30" 
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
               <ListFilter className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">미확인과제</span>

              </button>
              <button
                onClick={() => {
                  const msg = isDailyWordPaused
                    ? "단어과제를 재개하시겠습니까?\n중지 기간 동안의 밀린 과제가 자동으로 삭제됩니다."
                    : "단어과제를 일시중지하시겠습니까?\n중지 기간 동안 학생들에게 일일 단어과제가 표시되지 않습니다.";
                  if (window.confirm(msg)) {
                    togglePause.mutate();
                  }
                }}
                disabled={togglePause.isPending}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isDailyWordPaused
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/50"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                } disabled:opacity-50`}
              >
                {isDailyWordPaused ? <Play className="w-3 h-3 shrink-0" /> : <Pause className="w-3 h-3 shrink-0" />}
                <span>{togglePause.isPending ? "처리중" : isDailyWordPaused ? "재개" : "중지"}</span>
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
              <div className="text-right shrink-0 whitespace-nowrap leading-none">
                <div className="text-lg font-bold whitespace-nowrap">
                  {showUnreviewedOnly 
                    ? submittedCount
                    : <>{submittedCount}<span className="text-white/50 font-normal">/{totalCount}</span></>
                  }
                </div>
                <div className="text-[10px] text-white/50 whitespace-nowrap">
                  {showUnreviewedOnly ? "건 미확인" : `${submissionRate}%`}
                </div>
              </div>

            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(groupedByTag).map(([tagId, { tagName, tagColor, students }]) => {
                const tagSubmitted = students.filter(s => s.submission).length;
                const tagRate = students.length > 0 ? Math.round((tagSubmitted / students.length) * 100) : 0;
                
                return (
                  <div key={tagId} className="rounded-xl border border-border/40 bg-card shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/20" style={{ background: `linear-gradient(135deg, ${tagColor}08, ${tagColor}04)` }}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tagColor, boxShadow: `0 0 0 3px ${tagColor}25` }}
                        />
                        <span className="font-bold text-xs tracking-tight text-foreground/90">{tagName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const commitCount = students.filter(s => {
                            const origId = s.id.includes('_') ? s.id.split('_')[0] : s.id;
                            return commitStudentSet.has(origId);
                          }).length;
                          if (commitCount === 0) return null;
                          return (
                            <span className="flex items-center gap-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm" title="다짐Talk 사용 학생 수">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              {commitCount}
                            </span>
                          );
                        })()}
                        <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/20">
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: tagColor }}>
                            {tagSubmitted}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50 font-normal">/ {students.length}</span>
                          <div className="h-1.5 w-10 bg-muted/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ 
                                width: `${tagRate}%`,
                                background: `linear-gradient(90deg, ${tagColor}90, ${tagColor})`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* 학생 목록 */}
                    <div className="px-2 py-2">
                      {students.length === 0 ? (
                        <div className="py-3 text-center text-xs text-muted-foreground">
                          <Users className="w-4 h-4 mx-auto mb-1 opacity-40" />
                          등록된 학생이 없습니다
                        </div>
                      ) : (
                      <div>
                        {(() => {
                          const schoolCards: { schoolName: string; logoUrl: string | null; gradeName: string; students: typeof students }[] = [];
                          const byGrade: Record<string, typeof students> = {};
                          students.forEach((student) => {
                            const gradeName = student.grade?.name || "미지정";
                            if (!byGrade[gradeName]) byGrade[gradeName] = [];
                            byGrade[gradeName].push(student);
                          });
                          Object.entries(byGrade).sort(([a], [b]) => a.localeCompare(b)).forEach(([gradeName, gradeStudents]) => {
                            const bySchool: Record<string, typeof gradeStudents> = {};
                            gradeStudents.forEach((student) => {
                              const schoolName = student.grade?.school?.name || "미지정";
                              if (!bySchool[schoolName]) bySchool[schoolName] = [];
                              bySchool[schoolName].push(student);
                            });
                            Object.entries(bySchool).sort(([a], [b]) => a.localeCompare(b)).forEach(([schoolName, schoolStudents]) => {
                              schoolCards.push({
                                schoolName,
                                logoUrl: schoolStudents[0]?.grade?.school?.logo_url || null,
                                gradeName,
                                students: schoolStudents,
                              });
                            });
                          });
                          return (
                            <div className="grid grid-cols-3 gap-1.5">
                              {schoolCards.map((card, idx) => (
                                <div key={`${card.gradeName}-${card.schoolName}-${idx}`} className="rounded-lg bg-muted/20 border border-border/40 p-1.5 hover:bg-muted/30 transition-colors">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {card.logoUrl ? (
                                      <img src={cacheBustUrl(card.logoUrl)} alt="" className="w-4 h-4 rounded-full object-cover ring-1 ring-border/20 flex-shrink-0 shadow-sm" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[7px] font-bold text-primary">{card.schoolName.charAt(0)}</span>
                                      </div>
                                    )}
                                    <span className="text-[10px] font-bold text-foreground truncate">{card.schoolName.replace("고등학교", "고").replace("중학교", "중")}</span>
                                    <span className="text-[9px] text-foreground/70 flex-shrink-0 font-semibold">{card.gradeName}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 pl-5">
                                    {card.students.map((student) => {
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
                                className={`relative flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-medium cursor-pointer transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] hover:shadow-sm ${
                                  isReviewed 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-[0_1px_2px_rgba(16,185,129,0.08)]" 
                                    : isPending
                                      ? "bg-amber-50 text-amber-700 border border-amber-200/60 shadow-[0_1px_2px_rgba(245,158,11,0.08)]"
                                      : "bg-background text-foreground border border-border/60 hover:border-border"
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
                                       <p className="font-semibold mb-0.5">다짐Talk</p>
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
                                  <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-white z-10 ${
                                    isReviewed 
                                      ? "bg-emerald-500 text-white" 
                                      : "bg-amber-500 text-white"
                                  }`}>
                                    {isReviewed ? (
                                      <BadgeCheck className="w-1.5 h-1.5" />
                                    ) : (
                                      <Hourglass className="w-1.5 h-1.5" />
                                    )}
                                  </span>
                                )}
                               <span className="whitespace-nowrap text-foreground/90 font-medium">{student.name}</span>
                               {showUnreviewedOnly && (student.submission as any)?.submission_date && (
                                 <span className="text-[8px] opacity-50 ml-0.5 whitespace-nowrap font-mono tabular-nums">
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
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          <div className="sec-teal sec-header p-4">
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
              <MessageSquare className="w-8 h-8 shrink-0" strokeWidth={1.75} />
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
              <MessageCircle className="w-8 h-8 shrink-0" strokeWidth={1.75} />
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
    </TooltipProvider>
  );
}