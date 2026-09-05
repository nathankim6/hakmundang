import { useState, useEffect, useMemo } from "react";
import { BulkRTReviewDialog } from "./BulkRTReviewDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Users, Eye, Mic, BadgeCheck, Clock, Heart, BookOpen, ChevronRight, Send } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { RTRecordingPlayerDialog } from "./RTRecordingPlayerDialog";
import { QuickMessageDialog } from "./QuickMessageDialog";
import { QuickKakaoDialog } from "./QuickKakaoDialog";
import { cn } from "@/lib/utils";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";
import iconReviewHeader from "@/assets/icon-review-header.png";

interface RecordingTimestamp {
  sentenceIndex: number;
  startTime: number;
  endTime: number;
}

interface HomeworkSubmission {
  id: string;
  submitted_at: string | null;
  status: string;
  recording_url?: string | null;
  recording_timestamps?: unknown;
  teacher_note?: string | null;
  reviewed_at?: string | null;
}

interface HomeworkWithSubmissions {
  id: string;
  title: string;
  due_date: string;
  created_at: string;
  target_grade_id: string | null;
  target_student_id: string | null;
  target_type: string;
  passage?: {
    id: string;
    title: string;
  } | null;
  grade?: {
    id: string;
    name: string;
    school?: {
      id: string;
      name: string;
      logo_url?: string | null;
    } | null;
  } | null;
}

interface StudentSubmission {
  student_id: string;
  student_name: string;
  submission: HomeworkSubmission | null;
}

interface RTSubmissionStatusProps {
  selectedDate?: Date;
}

interface SelectedStudent {
  studentId: string;
  studentName: string;
  homeworkId: string;
  homeworkTitle: string;
  passageId?: string;
  submission: HomeworkSubmission | null;
}

export function RTSubmissionStatus({ selectedDate }: RTSubmissionStatusProps = {}) {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [selectedSchoolKey, setSelectedSchoolKey] = useState<string | null>(null);
  const [messageChoiceStudent, setMessageChoiceStudent] = useState<{ id: string; name: string; student_phone?: string | null; parent_phone?: string | null; incompleteAssignments?: { title: string; passageTitle?: string; dueDate: string }[] } | null>(null);
  const [messageStudent, setMessageStudent] = useState<{ id: string; name: string; student_phone?: string | null; parent_phone?: string | null } | null>(null);
  const [messageType, setMessageType] = useState<"sms" | "kakao" | null>(null);
  const [filterUnreviewed, setFilterUnreviewed] = useState(false);
  const [bulkReviewOpen, setBulkReviewOpen] = useState(false);
  const [bulkReviewData, setBulkReviewData] = useState<{ students: { studentId: string; studentName: string; submissionIds: string[]; recordingUrls: (string | null)[] }[]; sessionLabel: string }>({ students: [], sessionLabel: "" });
  
  const targetDate = selectedDate || new Date();
  const formattedDate = format(targetDate, "yyyy-MM-dd");
  const todayFormatted = format(new Date(), "yyyy-MM-dd");

  // 실시간 구독 - 리뷰 과제 및 학생/학년/학교 업데이트 수신
  useEffect(() => {
    const channel = supabase
      .channel('rt-submissions-admin-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework_submissions',
        },
        (payload) => {
          console.log('RT submission realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ["rt-submissions-only", formattedDate] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-students-basic"], refetchType: 'all' });
          queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"], refetchType: 'all' });
          queryClient.invalidateQueries({ queryKey: ["rt-homework-list"], refetchType: 'all' });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grades' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-students-basic"], refetchType: 'all' });
          queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"], refetchType: 'all' });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-students-with-grades"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homework' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["rt-homework-list"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, formattedDate]);

  // 학생 목록은 별도 캐시로 관리 (변경이 적으므로 오래 캐싱)
  const { data: allStudents = [] } = useQuery({
    queryKey: ["all-students-basic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, grade_id, student_phone, parent_phone")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1분 캐시
    gcTime: 5 * 60 * 1000,
  });

  // 모든 리뷰 과제 조회 (차시 전체 표시)
  const { data: homeworkList = [] } = useQuery({
    queryKey: ["rt-homework-list", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("homework")
        .select(`
          id,
          title,
          due_date,
          created_at,
          target_grade_id,
          target_student_id,
          target_type,
          passage:passage_id(id, title),
          grade:target_grade_id(
            id,
            name,
            school:school_id(id, name, logo_url)
          )
        `)
        .eq("type", "rt_review")
        .order("created_at", { ascending: true });

      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as HomeworkWithSubmissions[];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // 제출 현황만 빠르게 조회
  const { data: allSubmissions = [], isLoading } = useQuery({
    queryKey: ["rt-submissions-only", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homework_submissions")
        .select("id, student_id, homework_id, submitted_at, status, recording_url, recording_timestamps, teacher_note, reviewed_at");

      if (error) throw error;
      return data || [];
    },
    staleTime: 10000, // 10초 (빠른 반응성)
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  // 옳은커밋 사용 현황 조회 (homework_id 기준)
  const { data: commitExtensions = [] } = useQuery({
    queryKey: ["rt-commit-extensions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadline_extensions")
        .select("student_id, homework_id")
        .not("homework_id", "is", null);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const commitByHomework = useMemo(() => {
    const map = new Map<string, number>();
    commitExtensions.forEach(ext => {
      if (ext.homework_id) {
        map.set(ext.homework_id, (map.get(ext.homework_id) || 0) + 1);
      }
    });
    return map;
  }, [commitExtensions]);

  // 모든 RT 과제의 세션 날짜 조회 (차시 번호 전역 계산용)
  const { data: allSessionDates = [] } = useQuery({
    queryKey: ["rt-all-session-dates", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("homework")
        .select("title, created_at, target_grade_id")
        .eq("type", "rt_review");
      if (shouldFilter) query = query.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // baseTitle + gradeId별 전역 세션 번호 맵 생성
  const globalSessionMap = useMemo(() => {
    // key: `${baseTitle}|||${gradeId}`, value: Map<assignDate, globalSessionNumber>
    const groupSessions = new Map<string, Map<string, number>>();
    
    // 그룹별 세션 날짜 수집
    const groupDates = new Map<string, Set<string>>();
    allSessionDates.forEach(hw => {
      const baseTitle = hw.title.replace(/\s*#\d+$/, '');
      const gradeId = hw.target_grade_id || 'unknown';
      const key = `${baseTitle}|||${gradeId}`;
      const assignDate = hw.created_at.slice(0, 10);
      if (!groupDates.has(key)) groupDates.set(key, new Set());
      groupDates.get(key)!.add(assignDate);
    });

    // 정렬 후 번호 매기기
    groupDates.forEach((dates, key) => {
      const sorted = Array.from(dates).sort();
      const map = new Map<string, number>();
      sorted.forEach((date, idx) => map.set(date, idx + 1));
      groupSessions.set(key, map);
    });

    return groupSessions;
  }, [allSessionDates]);

  // 데이터 결합 (메모이제이션)
  const homeworkData = useMemo(() => {
    // 학년별 학생 매핑
    const studentsByGrade = new Map<string, { id: string; name: string }[]>();
    allStudents.forEach(student => {
      if (student.grade_id) {
        const gradeStudents = studentsByGrade.get(student.grade_id) || [];
        gradeStudents.push({ id: student.id, name: student.name });
        studentsByGrade.set(student.grade_id, gradeStudents);
      }
    });

    // 과제별 제출 현황 매핑
    const submissionsByHomework = new Map<string, Map<string, typeof allSubmissions[0]>>();
    allSubmissions.forEach(sub => {
      if (!submissionsByHomework.has(sub.homework_id)) {
        submissionsByHomework.set(sub.homework_id, new Map());
      }
      submissionsByHomework.get(sub.homework_id)!.set(sub.student_id, sub);
    });

    // 결과 조합
    return homeworkList.map((hw) => {
      let students: { id: string; name: string }[] = [];
      
      if (hw.target_type === "grade" && hw.target_grade_id) {
        students = studentsByGrade.get(hw.target_grade_id) || [];
      } else if (hw.target_type === "student" && hw.target_student_id) {
        const student = allStudents.find(s => s.id === hw.target_student_id);
        if (student) students = [{ id: student.id, name: student.name }];
      }

      const submissionMap = submissionsByHomework.get(hw.id) || new Map();

      const studentSubmissions: StudentSubmission[] = students.map(student => ({
        student_id: student.id,
        student_name: student.name,
        submission: submissionMap.get(student.id) || null,
      }));

      return {
        homework: hw,
        studentSubmissions,
        submittedCount: studentSubmissions.filter(s => s.submission?.submitted_at).length,
        totalCount: studentSubmissions.length,
      };
    });
  }, [allStudents, homeworkList, allSubmissions]);

  // Group by school
  const schoolGroups = useMemo(() => {
    const groups = new Map<string, {
      schoolId: string;
      schoolName: string;
      logoUrl: string | null;
      gradeName: string;
      passageSets: Map<string, typeof homeworkData>; // baseTitle -> homework items
      totalSubmitted: number;
      totalStudents: number;
    }>();

    homeworkData.forEach(item => {
      const school = item.homework.grade?.school;
      const grade = item.homework.grade;
      const key = `${school?.id || 'unknown'}-${grade?.id || 'unknown'}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          schoolId: school?.id || '',
          schoolName: school?.name || '미지정',
          logoUrl: school?.logo_url || null,
          gradeName: grade?.name || '',
          passageSets: new Map(),
          totalSubmitted: 0,
          totalStudents: 0,
        });
      }

      const group = groups.get(key)!;
      // Extract base title (remove #N suffix for grouping)
      const baseTitle = item.homework.title.replace(/\s*#\d+$/, '');
      if (!group.passageSets.has(baseTitle)) {
        group.passageSets.set(baseTitle, []);
      }
      group.passageSets.get(baseTitle)!.push(item);
      group.totalSubmitted += item.submittedCount;
      group.totalStudents += item.totalCount;
    });

    return groups;
  }, [homeworkData]);

  const totalSubmitted = homeworkData.reduce((acc, hw) => acc + hw.submittedCount, 0);
  const totalStudents = homeworkData.reduce((acc, hw) => acc + hw.totalCount, 0);
  const overallRate = totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

  const selectedGroup = selectedSchoolKey ? schoolGroups.get(selectedSchoolKey) : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="relative bg-gradient-to-br from-gray-700 via-slate-700 to-gray-800 text-white py-2 px-4 overflow-hidden">
        {/* 고급 장식 패턴 */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.05]" style={{
          background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)',
        }} />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <img src={iconReviewHeader} alt="" className="w-7 h-7 object-cover rounded" />
            </div>
            <div>
              <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                리뷰 과제
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tracking-tight">
                  전체 현황
                </span>
                <span className="text-sm font-medium text-white/70">
                  모든 차시 표시
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterUnreviewed(prev => !prev)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                filterUnreviewed
                  ? "bg-amber-500/30 text-amber-200 border border-amber-400/30"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              <Clock className="w-3 h-3" />
              미확인만
            </button>
            <div className="text-right">
              <div className="text-xl font-bold">
                {totalSubmitted}<span className="text-white/50 font-normal">/ {totalStudents}</span>
              </div>
              <div className="text-[10px] text-white/50">
                제출률 {overallRate}%
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* 범례 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200/50" />
            <span className="text-muted-foreground">미제출</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-100 border border-orange-200/50" />
            <span className="text-muted-foreground">일부제출</span>
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
        {homeworkData.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>진행 중인 리뷰 과제가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Array.from(schoolGroups.entries()).map(([key, group]) => {
              const rate = group.totalStudents > 0 ? Math.round((group.totalSubmitted / group.totalStudents) * 100) : 0;
              
              // 그룹(세트)별로 학생 상태를 구성
              const passageSetEntries = Array.from(group.passageSets.entries());

              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedSchoolKey(key);
                    setSchoolDialogOpen(true);
                  }}
                  className="group flex items-start gap-3 px-4 py-3 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-full text-left"
                >
                  {/* School Logo */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                    {group.logoUrl ? (
                      <img
                        src={group.logoUrl}
                        alt={group.schoolName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shadow-sm group-hover:border-primary/40 transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary border-2 border-primary/20 shadow-sm group-hover:border-primary/40 transition-colors">
                        {group.schoolName.slice(0, 1)}
                      </div>
                    )}
                    <span className="text-[9px] font-medium text-primary">{rate}%</span>
                  </div>

                  {/* Right side: school info + student labels per group */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{group.schoolName}</span>
                        <span className="text-[10px] text-muted-foreground">{group.gradeName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{group.totalSubmitted}/{group.totalStudents}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden mt-1.5">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
                    </div>

                    {/* 그룹(세트)별 학생 라벨 */}
                    {passageSetEntries.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {passageSetEntries.map(([baseTitle, items]) => {
                          // 차시별 그룹핑 (배정일 기준)
                          const sessionMap = new Map<string, typeof items>();
                          items.forEach(item => {
                            const assignDate = item.homework.created_at.slice(0, 10); // YYYY-MM-DD
                            if (!sessionMap.has(assignDate)) sessionMap.set(assignDate, []);
                            sessionMap.get(assignDate)!.push(item);
                          });
                          const sessions = Array.from(sessionMap.entries()).sort(([a], [b]) => a.localeCompare(b));

                          return (
                            <div key={baseTitle}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <BookOpen className="w-2.5 h-2.5 text-primary/60" />
                                <span className="text-[9px] font-semibold text-muted-foreground">{baseTitle}</span>
                                <span className="text-[9px] px-1 py-0 rounded bg-muted text-muted-foreground">
                                  ~{format(new Date(items[0].homework.due_date + 'T00:00:00'), "M/d", { locale: ko })}
                                </span>
                              </div>
                              {sessions.map(([assignDate, sessionItems], sessionIdx) => {
                                // 이 차시의 학생 상태 수집
                                const sessionStudentMap = new Map<string, {
                                  name: string;
                                  totalPassages: number;
                                  submitted: number;
                                  reviewed: number;
                                  firstSubmission: { homeworkId: string; homeworkTitle: string; passageId?: string; submission: HomeworkSubmission } | null;
                                }>();

                                sessionItems.forEach(item => {
                                  item.studentSubmissions.forEach(s => {
                                    if (!sessionStudentMap.has(s.student_id)) {
                                      sessionStudentMap.set(s.student_id, { name: s.student_name, totalPassages: 0, submitted: 0, reviewed: 0, firstSubmission: null });
                                    }
                                    const st = sessionStudentMap.get(s.student_id)!;
                                    st.totalPassages++;
                                    if (s.submission?.submitted_at) {
                                      st.submitted++;
                                      if (s.submission.reviewed_at || s.submission.teacher_note) st.reviewed++;
                                      if (!st.firstSubmission) {
                                        st.firstSubmission = {
                                          homeworkId: item.homework.id,
                                          homeworkTitle: item.homework.title,
                                          passageId: item.homework.passage?.id,
                                          submission: s.submission,
                                        };
                                      }
                                    }
                                  });
                                });

                                let sessionStudents = Array.from(sessionStudentMap.entries()).sort(([,a], [,b]) => {
                                  const aScore = a.submitted === 0 ? 0 : a.submitted < a.totalPassages ? 1 : (a.reviewed === a.totalPassages || (a.submitted > 0 && a.reviewed === a.submitted)) ? 3 : 2;
                                  const bScore = b.submitted === 0 ? 0 : b.submitted < b.totalPassages ? 1 : (b.reviewed === b.totalPassages || (b.submitted > 0 && b.reviewed === b.submitted)) ? 3 : 2;
                                  return aScore - bScore;
                                });

                                if (filterUnreviewed) {
                                  sessionStudents = sessionStudents.filter(([, s]) => s.submitted > 0 && s.submitted > s.reviewed);
                                }

                                if (sessionStudents.length === 0) return null;

                                const sessionSubmitted = Array.from(sessionStudentMap.values()).reduce((a, s) => a + s.submitted, 0);
                                const sessionTotal = Array.from(sessionStudentMap.values()).reduce((a, s) => a + s.totalPassages, 0);

                                return (
                                  <div key={assignDate} className="mb-1.5">
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <span className="text-[8px] font-bold text-primary/80 bg-primary/10 px-1 py-0 rounded">
                                        {(() => {
                                          const gradeId = sessionItems[0]?.homework?.target_grade_id || 'unknown';
                                          const lookupKey = `${baseTitle}|||${gradeId}`;
                                          return globalSessionMap.get(lookupKey)?.get(assignDate) || (sessionIdx + 1);
                                        })()}차시
                                      </span>
                                      <span className="text-[8px] text-muted-foreground">
                                        {sessionItems.length}개 · {sessionSubmitted}/{sessionTotal}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {sessionStudents.map(([studentId, status]) => {
                                        const allSubmitted = status.submitted === status.totalPassages;
                                        const allReviewed = status.reviewed === status.totalPassages;
                                        const submittedAllReviewed = status.submitted > 0 && status.reviewed === status.submitted;
                                        const effectivelyReviewed = allReviewed || submittedAllReviewed;
                                        const partialSubmitted = status.submitted > 0 && !allSubmitted;

                                        return (
                                          <span
                                            key={studentId}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (status.firstSubmission) {
                                                setSelectedStudent({
                                                  studentId,
                                                  studentName: status.name,
                                                  homeworkId: status.firstSubmission.homeworkId,
                                                  homeworkTitle: status.firstSubmission.homeworkTitle,
                                                  passageId: status.firstSubmission.passageId,
                                                  submission: status.firstSubmission.submission,
                                                });
                                                setDialogOpen(true);
                                              } else {
                                                const incompleteAssignments: { title: string; passageTitle?: string; dueDate: string }[] = [];
                                                sessionItems.forEach(item => {
                                                  const studentSub = item.studentSubmissions.find(s => s.student_id === studentId);
                                                  if (studentSub && !studentSub.submission?.submitted_at) {
                                                    incompleteAssignments.push({
                                                      title: item.homework.title,
                                                      passageTitle: item.homework.passage?.title,
                                                      dueDate: item.homework.due_date,
                                                    });
                                                  }
                                                });
                                                const studentData = allStudents.find(s => s.id === studentId);
                                                setMessageChoiceStudent({
                                                  id: studentId,
                                                  name: status.name,
                                                  student_phone: studentData?.student_phone,
                                                  parent_phone: studentData?.parent_phone,
                                                  incompleteAssignments,
                                                });
                                              }
                                            }}
                                            className={cn(
                                              "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                                              effectivelyReviewed
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-100"
                                                : allSubmitted
                                                ? "bg-amber-50 text-amber-600 border border-amber-200/50 hover:bg-amber-100"
                                                : partialSubmitted
                                                ? "bg-orange-50 text-orange-600 border border-orange-200/50 hover:bg-orange-100"
                                                : "bg-red-50 text-red-600 border border-red-200/50 hover:bg-red-100"
                                            )}
                                          >
                                            {effectivelyReviewed ? (
                                              <BadgeCheck className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                                            ) : allSubmitted ? (
                                              <Clock className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                                            ) : partialSubmitted ? (
                                              <Clock className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                                            ) : (
                                              <XCircle className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                                            )}
                                            {status.name}
                                            {status.totalPassages > 1 && (
                                              <span className="text-[8px] ml-0.5 opacity-70">{status.submitted}/{status.totalPassages}</span>
                                            )}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {group.totalStudents === 0 && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        등록된 학생이 없습니다
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* 학교별 상세 다이얼로그 */}
      <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {selectedGroup && (
            <>
              {/* 프리미엄 헤더 */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-8 w-24 h-24 border border-white/20 rotate-45" />
                  <div className="absolute bottom-2 left-12 w-16 h-16 border border-white/10 rotate-12" />
                </div>
                <div className="relative flex items-center gap-4">
                  {selectedGroup.logoUrl ? (
                    <img
                      src={selectedGroup.logoUrl}
                      alt={selectedGroup.schoolName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white border-2 border-white/20">
                      {selectedGroup.schoolName.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-white text-lg font-bold">
                      {selectedGroup.schoolName}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-white/15 text-white/90 border-white/20 text-[10px]">
                        {selectedGroup.gradeName}
                      </Badge>
                      <span className="text-white/60 text-xs">
                        {selectedGroup.totalSubmitted}/{selectedGroup.totalStudents}명 제출
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 지문 세트별 목록 */}
              <div className="p-5 space-y-4">
                {Array.from(selectedGroup.passageSets.entries()).map(([baseTitle, items]) => {
                  // 차시별 그룹핑 (배정일 기준)
                  const sessionMap = new Map<string, typeof items>();
                  items.forEach(item => {
                    const assignDate = item.homework.created_at.slice(0, 10);
                    if (!sessionMap.has(assignDate)) sessionMap.set(assignDate, []);
                    sessionMap.get(assignDate)!.push(item);
                  });
                  const sessions = Array.from(sessionMap.entries()).sort(([a], [b]) => a.localeCompare(b));

                  return (
                    <div key={baseTitle} className="rounded-xl border bg-card overflow-hidden">
                      {/* 세트 헤더 */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-semibold">{baseTitle}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {sessions.length}차시 · {items.length}개 지문
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(items[0].homework.due_date + 'T00:00:00'), "M/d")} 마감
                        </div>
                      </div>

                      {/* 차시별 학생 현황 */}
                      <div className="divide-y">
                        {sessions.map(([assignDate, sessionItems], sessionIdx) => {
                          const sessionStudentMap = new Map<string, {
                            name: string;
                            totalPassages: number;
                            submitted: number;
                            reviewed: number;
                            firstSubmission: { homeworkId: string; homeworkTitle: string; passageId?: string; submission: HomeworkSubmission } | null;
                          }>();

                          sessionItems.forEach(({ homework, studentSubmissions }) => {
                            studentSubmissions.forEach(s => {
                              if (!sessionStudentMap.has(s.student_id)) {
                                sessionStudentMap.set(s.student_id, { name: s.student_name, totalPassages: 0, submitted: 0, reviewed: 0, firstSubmission: null });
                              }
                              const st = sessionStudentMap.get(s.student_id)!;
                              st.totalPassages++;
                              if (s.submission?.submitted_at) {
                                st.submitted++;
                                if (s.submission.reviewed_at || s.submission.teacher_note) st.reviewed++;
                                if (!st.firstSubmission) {
                                  st.firstSubmission = {
                                    homeworkId: homework.id,
                                    homeworkTitle: homework.title,
                                    passageId: homework.passage?.id,
                                    submission: s.submission,
                                  };
                                }
                              }
                            });
                          });

                          // 카테고리별 분류
                          const notSubmitted: [string, typeof sessionStudentMap extends Map<string, infer V> ? V : never][] = [];
                          const waitingReview: [string, typeof sessionStudentMap extends Map<string, infer V> ? V : never][] = [];
                          const reviewed: [string, typeof sessionStudentMap extends Map<string, infer V> ? V : never][] = [];

                          Array.from(sessionStudentMap.entries()).forEach(([id, st]) => {
                            const allReviewed = st.reviewed === st.totalPassages;
                            const submittedAllReviewed = st.submitted > 0 && st.reviewed === st.submitted;
                            if (st.submitted === 0) notSubmitted.push([id, st]);
                            else if (allReviewed) reviewed.push([id, st]);
                            else if (submittedAllReviewed) reviewed.push([id, st]);
                            else waitingReview.push([id, st]);
                          });

                          const sessionTotal = Array.from(sessionStudentMap.values()).reduce((a, s) => a + s.totalPassages, 0);
                          const sessionSubmitted = Array.from(sessionStudentMap.values()).reduce((a, s) => a + s.submitted, 0);

                          return (
                            <div key={assignDate} className="px-4 py-3">
                              {/* 차시 헤더 */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    {(() => {
                                      const gradeId = sessionItems[0]?.homework?.target_grade_id || 'unknown';
                                      const lookupKey = `${baseTitle}|||${gradeId}`;
                                      return globalSessionMap.get(lookupKey)?.get(assignDate) || (sessionIdx + 1);
                                    })()}차시
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    배정일 {format(new Date(assignDate + 'T00:00:00'), "M월 d일", { locale: ko })}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    · {sessionItems.length}개 지문
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {waitingReview.length > 0 && (
                                    <button
                                      onClick={() => {
                                        const studentsToReview = waitingReview.map(([studentId, status]) => {
                                          const subIds: string[] = [];
                                          const recUrls: (string | null)[] = [];
                                          sessionItems.forEach(item => {
                                            const studentSub = item.studentSubmissions.find(s => s.student_id === studentId);
                                            if (studentSub?.submission?.submitted_at && !studentSub.submission.reviewed_at) {
                                              subIds.push(studentSub.submission.id);
                                              recUrls.push(studentSub.submission.recording_url || null);
                                            }
                                          });
                                          return { studentId, studentName: status.name, submissionIds: subIds, recordingUrls: recUrls };
                                        }).filter(s => s.submissionIds.length > 0);
                                        const sessionNum = (() => {
                                          const gradeId = sessionItems[0]?.homework?.target_grade_id || 'unknown';
                                          const lookupKey = `${baseTitle}|||${gradeId}`;
                                          return globalSessionMap.get(lookupKey)?.get(assignDate) || (sessionIdx + 1);
                                        })();
                                        setBulkReviewData({ students: studentsToReview, sessionLabel: `${baseTitle} ${sessionNum}차시` });
                                        setBulkReviewOpen(true);
                                      }}
                                      className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                                    >
                                      전체 확인처리
                                    </button>
                                  )}
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    {sessionSubmitted}/{sessionTotal}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2.5">
                                {/* 미제출 */}
                                {notSubmitted.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <XCircle className="w-3 h-3 text-red-500" />
                                      <span className="text-[10px] font-semibold text-red-600">미제출 ({notSubmitted.length}명)</span>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
                                      {notSubmitted.map(([studentId, status]) => (
                                        <div
                                          key={studentId}
                                          onClick={() => {
                                            const studentData = allStudents.find(s => s.id === studentId);
                                            const incompleteAssignments = sessionItems.map(item => ({
                                              title: item.homework.title,
                                              passageTitle: item.homework.passage?.title,
                                              dueDate: item.homework.due_date,
                                            }));
                                            setMessageChoiceStudent({
                                              id: studentId,
                                              name: status.name,
                                              student_phone: studentData?.student_phone,
                                              parent_phone: studentData?.parent_phone,
                                              incompleteAssignments,
                                            });
                                          }}
                                          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs bg-red-50 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
                                        >
                                          <XCircle className="w-3 h-3 flex-shrink-0" />
                                          <span className="font-medium whitespace-nowrap">{status.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 제출완료 (검토대기) */}
                                {waitingReview.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Clock className="w-3 h-3 text-amber-500" />
                                      <span className="text-[10px] font-semibold text-amber-600">검토대기 ({waitingReview.length}명)</span>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
                                      {waitingReview.map(([studentId, status]) => (
                                        <div
                                          key={studentId}
                                          onClick={() => {
                                            if (status.firstSubmission) {
                                              setSelectedStudent({
                                                studentId,
                                                studentName: status.name,
                                                homeworkId: status.firstSubmission.homeworkId,
                                                homeworkTitle: status.firstSubmission.homeworkTitle,
                                                passageId: status.firstSubmission.passageId,
                                                submission: status.firstSubmission.submission,
                                              });
                                              setSchoolDialogOpen(false);
                                              setTimeout(() => setDialogOpen(true), 150);
                                            }
                                          }}
                                          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                                        >
                                          <Clock className="w-3 h-3 flex-shrink-0" />
                                          <span className="font-medium whitespace-nowrap">{status.name}</span>
                                          {status.totalPassages > 1 && (
                                            <span className="text-[9px] opacity-60">{status.submitted}/{status.totalPassages}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 확인완료 */}
                                {reviewed.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <BadgeCheck className="w-3 h-3 text-emerald-500" />
                                      <span className="text-[10px] font-semibold text-emerald-600">확인완료 ({reviewed.length}명)</span>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
                                      {reviewed.map(([studentId, status]) => (
                                        <div
                                          key={studentId}
                                          onClick={() => {
                                            if (status.firstSubmission) {
                                              setSelectedStudent({
                                                studentId,
                                                studentName: status.name,
                                                homeworkId: status.firstSubmission.homeworkId,
                                                homeworkTitle: status.firstSubmission.homeworkTitle,
                                                passageId: status.firstSubmission.passageId,
                                                submission: status.firstSubmission.submission,
                                              });
                                              setSchoolDialogOpen(false);
                                              setTimeout(() => setDialogOpen(true), 150);
                                            }
                                          }}
                                          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                                        >
                                          <BadgeCheck className="w-3 h-3 flex-shrink-0" />
                                          <span className="font-medium whitespace-nowrap">{status.name}</span>
                                        </div>
                                      ))}
                                    </div>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 녹음 재생 다이얼로그 */}
      {selectedStudent && (
        <RTRecordingPlayerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          studentName={selectedStudent.studentName}
          studentId={selectedStudent.studentId}
          homeworkId={selectedStudent.homeworkId}
          homeworkTitle={selectedStudent.homeworkTitle}
          passageId={selectedStudent.passageId}
          submission={selectedStudent.submission ? {
            id: selectedStudent.submission.id,
            recording_url: selectedStudent.submission.recording_url,
            recording_timestamps: selectedStudent.submission.recording_timestamps as RecordingTimestamp[] | null,
            submitted_at: selectedStudent.submission.submitted_at,
            status: selectedStudent.submission.status,
            teacher_note: selectedStudent.submission.teacher_note,
            reviewed_at: selectedStudent.submission.reviewed_at,
          } : null}
        />
      )}

      {/* 미제출 학생 메시지 발송 선택 팝업 */}
      <Dialog open={!!messageChoiceStudent} onOpenChange={(open) => !open && setMessageChoiceStudent(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
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
          {messageChoiceStudent?.incompleteAssignments && messageChoiceStudent.incompleteAssignments.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" />
                미완료 과제 ({messageChoiceStudent.incompleteAssignments.length}건)
              </p>
              <div className="space-y-1">
                {messageChoiceStudent.incompleteAssignments.map((hw, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-destructive/5 border border-destructive/10">
                    <span className="text-[11px] font-semibold text-destructive/70 flex-shrink-0">#{idx + 1}</span>
                    <span className="text-[11px] text-foreground truncate flex-1">
                      {hw.passageTitle || hw.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      ~{format(new Date(hw.dueDate + "T00:00:00"), "M/d")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* 전체 확인처리 다이얼로그 */}
      <BulkRTReviewDialog
        open={bulkReviewOpen}
        onOpenChange={setBulkReviewOpen}
        students={bulkReviewData.students}
        sessionLabel={bulkReviewData.sessionLabel}
      />
    </Card>
  );
}
