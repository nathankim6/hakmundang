import { CalendarDays, LayoutDashboard, MessageCircle, MessageSquare } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import {
  Users,
  ClipboardCheck,
  Clock,
  UserX,
  CalendarIcon,
  Sparkles,
  BarChart3,
  BookOpen,
  Mic,
  X,
  RotateCcw } from
"lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DailySubmissionStatus } from "@/components/dashboard/DailySubmissionStatus";
import { RTSubmissionStatus } from "@/components/dashboard/RTSubmissionStatus";

import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { BulkMessageDialog } from "@/components/dashboard/BulkMessageDialog";
import { BulkKakaoDialog } from "@/components/dashboard/BulkKakaoDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

interface MissingAssignment {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string | null;
  parentPhone: string | null;
  gradeName: string;
  gradeId: string;
  schoolName: string;
  schoolId: string;
  schoolLogo: string | null;
  type: "daily" | "rt";
  title: string;
  dueDate: string;
  createdAt?: string;
  isOverdue: boolean;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedGradeKey, setSelectedGradeKey] = useState<string | null>("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [quickMessageStudent, setQuickMessageStudent] = useState<{
    id: string;name: string;studentPhone?: string | null;parentPhone?: string | null;
  } | null>(null);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [showBulkKakao, setShowBulkKakao] = useState(false);
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const { session } = useAuth();
  const [quickKakaoStudent, setQuickKakaoStudent] = useState<{
    id: string;name: string;studentPhone?: string | null;parentPhone?: string | null;
  } | null>(null);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // 일일 단어과제 시작일 (이 날짜부터 미제출 체크 시작)
  const DAILY_WORD_START_DATE = '2026-02-08';

  // 실시간 구독 - 모든 관련 테이블 변경 시 대시보드 데이터 갱신
  useEffect(() => {
    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ["all-missing-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    };
    const channel = supabase
      .channel('dashboard-all-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, invalidateAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, invalidateAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, invalidateAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_word_submissions' }, invalidateAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_submissions' }, () => {
        invalidateAll();
        queryClient.invalidateQueries({ queryKey: ["student-rt-submissions"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework' }, () => {
        invalidateAll();
        queryClient.invalidateQueries({ queryKey: ["student-writing-homework"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dismissed_daily_words' }, () => {
        invalidateAll();
        queryClient.invalidateQueries({ queryKey: ["dismissed-daily-words"] });
        queryClient.invalidateQueries({ queryKey: ["missed-daily-words"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'passages' }, () => {
        queryClient.invalidateQueries({ queryKey: ["passages"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  // 과제 삭제 mutation (낙관적 업데이트)
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignment: MissingAssignment) => {
      if (assignment.type === "daily") {
        // 일일 단어과제: dismissed_daily_words에 추가하여 목록에서 제거
        const { error } = await supabase.
        from("dismissed_daily_words").
        upsert({
          student_id: assignment.studentId,
          dismissed_date: assignment.dueDate
        }, { onConflict: "student_id,dismissed_date" });
        if (error) throw error;
      } else {
        // 녹음/영작 과제: homework 자체와 관련 submissions를 삭제
        const homeworkId = assignment.id.replace(`rt-${assignment.studentId}-`, "");

        // 먼저 관련 submissions 삭제
        await supabase.
        from("homework_submissions").
        delete().
        eq("homework_id", homeworkId);

        // writing_submissions도 삭제
        await supabase.
        from("writing_submissions").
        delete().
        eq("homework_id", homeworkId);

        // homework 자체 삭제
        const { error } = await supabase.
        from("homework").
        delete().
        eq("id", homeworkId);
        if (error) throw error;
      }
    },
    onMutate: async (assignment: MissingAssignment) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ["all-missing-assignments"] });

      // 이전 데이터 스냅샷
      const previousData = queryClient.getQueryData<MissingAssignment[]>(["all-missing-assignments", todayStr, ownerCodeId, shouldFilter]);

      // 낙관적으로 즉시 제거
      if (previousData) {
        queryClient.setQueryData<MissingAssignment[]>(
          ["all-missing-assignments", todayStr, ownerCodeId, shouldFilter],
          previousData.filter((a) => a.id !== assignment.id)
        );
      }

      return { previousData };
    },
    onSuccess: () => {
      toast.success("과제가 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["all-missing-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["student-rt-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["student-writing-homework"] });
      queryClient.invalidateQueries({ queryKey: ["dismissed-daily-words"] });
      queryClient.invalidateQueries({ queryKey: ["missed-daily-words"] });
    },
    onError: (error, _assignment, context) => {
      // 실패 시 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          ["all-missing-assignments", todayStr, ownerCodeId, shouldFilter],
          context.previousData
        );
      }
      toast.error("처리 중 오류가 발생했습니다");
      console.error(error);
    }
  });

  // 대량 초기화 mutation (여러 과제를 한번에 처리)
  const bulkDeleteMutation = useMutation({
    mutationFn: async (assignments: MissingAssignment[]) => {
      const dailyAssignments = assignments.filter(a => a.type === "daily");
      const otherAssignments = assignments.filter(a => a.type !== "daily");

      // 일일 단어과제: 한번에 upsert
      if (dailyAssignments.length > 0) {
        const rows = dailyAssignments.map(a => ({
          student_id: a.studentId,
          dismissed_date: a.dueDate,
        }));
        const { error } = await supabase
          .from("dismissed_daily_words")
          .upsert(rows, { onConflict: "student_id,dismissed_date" });
        if (error) throw error;
      }

      // 녹음/영작 과제: 순차 삭제
      for (const assignment of otherAssignments) {
        const homeworkId = assignment.id.replace(`rt-${assignment.studentId}-`, "");
        await supabase.from("homework_submissions").delete().eq("homework_id", homeworkId);
        await supabase.from("writing_submissions").delete().eq("homework_id", homeworkId);
        const { error } = await supabase.from("homework").delete().eq("id", homeworkId);
        if (error) throw error;
      }
    },
    onMutate: async (assignments: MissingAssignment[]) => {
      await queryClient.cancelQueries({ queryKey: ["all-missing-assignments"] });
      const previousData = queryClient.getQueryData<MissingAssignment[]>(["all-missing-assignments", todayStr, ownerCodeId, shouldFilter]);
      if (previousData) {
        const idsToRemove = new Set(assignments.map(a => a.id));
        queryClient.setQueryData<MissingAssignment[]>(
          ["all-missing-assignments", todayStr, ownerCodeId, shouldFilter],
          previousData.filter(a => !idsToRemove.has(a.id))
        );
      }
      return { previousData };
    },
    onSuccess: () => {
      toast.success("과제가 초기화되었습니다");
      queryClient.invalidateQueries({ queryKey: ["all-missing-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["student-rt-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["student-writing-homework"] });
      queryClient.invalidateQueries({ queryKey: ["dismissed-daily-words"] });
      queryClient.invalidateQueries({ queryKey: ["missed-daily-words"] });
    },
    onError: (error, _assignments, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["all-missing-assignments", todayStr, ownerCodeId, shouldFilter],
          context.previousData
        );
      }
      toast.error("초기화 중 오류가 발생했습니다");
      console.error(error);
    },
  });

  // 통계 데이터 조회
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", todayStr, ownerCodeId, shouldFilter],
    queryFn: async () => {
      // 소유한 학교의 학생만 카운트
      let studentQuery = supabase.from("students").select("id");
      if (shouldFilter) {
        const { data: ownedSchools } = await supabase.
        from("schools").select("id").eq("owner_code_id", ownerCodeId!);
        const schoolIds = ownedSchools?.map((s) => s.id) || [];
        if (schoolIds.length === 0) return { totalStudents: 0, todaySubmissions: 0, pendingReview: 0, submissionRate: 0 };
        const { data: ownedGrades } = await supabase.
        from("grades").select("id").in("school_id", schoolIds);
        const gradeIds = ownedGrades?.map((g) => g.id) || [];
        if (gradeIds.length === 0) return { totalStudents: 0, todaySubmissions: 0, pendingReview: 0, submissionRate: 0 };
        studentQuery = studentQuery.in("grade_id", gradeIds);
      }
      const { data: studentData } = await studentQuery;
      const totalStudents = studentData?.length || 0;
      const studentIds = studentData?.map((s) => s.id) || [];

      let todaySubmissions = 0;
      let pendingReview = 0;
      if (studentIds.length > 0) {
        const { count: tc } = await supabase.
        from("daily_word_submissions").
        select("*", { count: "exact", head: true }).
        eq("submission_date", todayStr).
        in("student_id", studentIds);
        todaySubmissions = tc || 0;

        const { count: pr } = await supabase.
        from("homework_submissions").
        select("*", { count: "exact", head: true }).
        not("submitted_at", "is", null).
        eq("status", "pending").
        in("student_id", studentIds);
        pendingReview = pr || 0;
      }

      return {
        totalStudents,
        todaySubmissions,
        pendingReview,
        submissionRate: totalStudents ? Math.round(todaySubmissions / totalStudents * 100) : 0
      };
    }
  });
  // 태그 및 태그 배정 조회
  const { data: tagsData } = useQuery({
    queryKey: ["student-tags-for-filter", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let tagQuery = supabase.from("student_tags").select("id, name, color");
      if (shouldFilter) tagQuery = tagQuery.eq("owner_code_id", ownerCodeId!);
      const { data: tags } = await tagQuery;

      const { data: assignments } = await supabase
        .from("student_tag_assignments")
        .select("student_id, tag_id");

      return { tags: tags || [], assignments: assignments || [] };
    },
  });

  const tagStudentMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    tagsData?.assignments.forEach((a) => {
      if (!map.has(a.tag_id)) map.set(a.tag_id, new Set());
      map.get(a.tag_id)!.add(a.student_id);
    });
    return map;
  }, [tagsData]);


  const { data: missingAssignments } = useQuery({
    queryKey: ["all-missing-assignments", todayStr, ownerCodeId, shouldFilter],
    queryFn: async () => {
      const missing: MissingAssignment[] = [];

      // 1. 학교 정보 조회 (소유자 필터 적용)
      let schoolQuery = supabase.from("schools").select("id, name, logo_url");
      if (shouldFilter) schoolQuery = schoolQuery.eq("owner_code_id", ownerCodeId!);

      const { data: schools } = await schoolQuery;
      const schoolMap = new Map(schools?.map((s) => [s.id, { name: s.name, logo: s.logo_url }]) || []);
      const ownedSchoolIds = schools?.map((s) => s.id) || [];

      // 2. 전체 학생 정보 조회 (소유한 학교의 학생만)
      let studentQuery = supabase.
      from("students").
      select(`
          id,
          name,
          student_phone,
          parent_phone,
          grade_id,
          created_at,
          grade:grades(
            id,
            name,
            school_id
          )
        `);
      if (shouldFilter && ownedSchoolIds.length > 0) {
        const { data: ownedGrades } = await supabase.
        from("grades").select("id").in("school_id", ownedSchoolIds);
        const gradeIds = ownedGrades?.map((g) => g.id) || [];
        if (gradeIds.length > 0) {
          studentQuery = studentQuery.in("grade_id", gradeIds);
        } else {
          return [];
        }
      } else if (shouldFilter) {
        return [];
      }
      const { data: allStudents } = await studentQuery;

      // 3. 오늘 일일 단어과제 제출자 조회
      const { data: todayDailySubmissions } = await supabase.
      from("daily_word_submissions").
      select("student_id").
      eq("submission_date", todayStr);

      const todaySubmitterIds = new Set(todayDailySubmissions?.map((s) => s.student_id) || []);

      // 4. 최근 7일 일일 단어과제 미제출 확인
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, i);
        return format(date, 'yyyy-MM-dd');
      });

      const { data: recentDailySubmissions } = await supabase.
      from("daily_word_submissions").
      select("student_id, submission_date").
      in("submission_date", last7Days);

      const submissionByStudentDate = new Set(
        recentDailySubmissions?.map((s) => `${s.student_id}-${s.submission_date}`) || []
      );

      // 4.5. 삭제(무시)된 일일 단어과제 조회 (최근 7일만 필요)
      const { data: dismissedData } = await supabase.
      from("dismissed_daily_words").
      select("student_id, dismissed_date").
      in("dismissed_date", last7Days);
      const dismissedSet = new Set(
        (dismissedData || []).map((d) => `${d.student_id}-${d.dismissed_date}`)
      );

      // 5. 활성 녹음 과제 조회 (소유자 필터 적용)
      // 소유자 필터: owner_code_id 일치 OR 소유 학교 학년에 배정된 과제
      const { data: ownedGradeIdsForHw } = shouldFilter
        ? await supabase.from("grades").select("id").in("school_id", ownedSchoolIds)
        : { data: null };
      const ownedGradeIdList = ownedGradeIdsForHw?.map((g) => g.id) || [];

      let hwQuery = supabase.
      from("homework").
      select(`
          id,
          title,
          due_date,
          created_at,
          target_type,
          target_grade_id,
          target_student_id
        `).
      gte("due_date", format(subDays(today, 30), 'yyyy-MM-dd'));
      if (shouldFilter) {
        if (ownedGradeIdList.length > 0) {
          hwQuery = hwQuery.or(`owner_code_id.eq.${ownerCodeId},target_grade_id.in.(${ownedGradeIdList.join(",")})`);
        } else {
          hwQuery = hwQuery.eq("owner_code_id", ownerCodeId!);
        }
      }
      const { data: activeHomework } = await hwQuery;

      // 6. 녹음 과제 제출 현황 조회
      const { data: homeworkSubmissions } = await supabase.
      from("homework_submissions").
      select("student_id, homework_id, submitted_at").
      not("submitted_at", "is", null);

      const rtSubmittedSet = new Set(
        (homeworkSubmissions || []).map((s) => `${s.student_id}-${s.homework_id}`)
      );

      // 학생별 밀린 과제 수집
      (allStudents || []).forEach((student) => {
        const schoolId = student.grade?.school_id;
        const schoolInfo = schoolId ? schoolMap.get(schoolId) : null;

        // 학생별 시작일: 글로벌 시작일과 학생 등록일(KST) 중 더 늦은 날짜
        let studentStartDate = DAILY_WORD_START_DATE;
        if (student.created_at) {
          const createdKST = new Date(new Date(student.created_at).getTime() + 9 * 60 * 60 * 1000);
          const createdDateStr = `${createdKST.getUTCFullYear()}-${String(createdKST.getUTCMonth() + 1).padStart(2, '0')}-${String(createdKST.getUTCDate()).padStart(2, '0')}`;
          studentStartDate = createdDateStr > DAILY_WORD_START_DATE ? createdDateStr : DAILY_WORD_START_DATE;
        }

        // 오늘 일일 단어과제 미제출 (시작일 이후에만 체크)
        if (todayStr >= studentStartDate && !todaySubmitterIds.has(student.id) && !dismissedSet.has(`${student.id}-${todayStr}`)) {
          missing.push({
            id: `daily-${student.id}-${todayStr}`,
            studentId: student.id,
            studentName: student.name,
            studentPhone: student.student_phone || null,
            parentPhone: student.parent_phone || null,
            gradeName: student.grade?.name || "",
            gradeId: student.grade_id,
            schoolName: schoolInfo?.name || "",
            schoolId: schoolId || "",
            schoolLogo: schoolInfo?.logo || null,
            type: "daily",
            title: "일일 단어과제",
            dueDate: todayStr,
            isOverdue: false
          });
        }

        // 지난 일일 단어과제 미제출 (밀린 과제) - 학생별 시작일 이후만
        last7Days.slice(1).filter((dateStr) => dateStr >= studentStartDate).forEach((dateStr) => {
          if (!submissionByStudentDate.has(`${student.id}-${dateStr}`) && !dismissedSet.has(`${student.id}-${dateStr}`)) {
            missing.push({
              id: `daily-${student.id}-${dateStr}`,
              studentId: student.id,
              studentName: student.name,
              studentPhone: student.student_phone || null,
              parentPhone: student.parent_phone || null,
              gradeName: student.grade?.name || "",
              gradeId: student.grade_id,
              schoolName: schoolInfo?.name || "",
              schoolId: schoolId || "",
              schoolLogo: schoolInfo?.logo || null,
              type: "daily",
              title: `일일 단어과제 (${format(new Date(dateStr), 'M/d')})`,
              dueDate: dateStr,
              isOverdue: true
            });
          }
        });
      });

      // 녹음 과제 미제출자 수집
      (activeHomework || []).forEach((hw) => {
        const targetStudents = (allStudents || []).filter((student) => {
          if (hw.target_type === "grade" && hw.target_grade_id) {
            return student.grade_id === hw.target_grade_id;
          }
          if (hw.target_type === "student" && hw.target_student_id) {
            return student.id === hw.target_student_id;
          }
          return false;
        });

        targetStudents.forEach((student) => {
          const key = `${student.id}-${hw.id}`;
          if (!rtSubmittedSet.has(key)) {
            const schoolId = student.grade?.school_id;
            const schoolInfo = schoolId ? schoolMap.get(schoolId) : null;
            const isOverdue = hw.due_date < todayStr;

            missing.push({
              id: `rt-${student.id}-${hw.id}`,
              studentId: student.id,
              studentName: student.name,
              studentPhone: student.student_phone || null,
              parentPhone: student.parent_phone || null,
              gradeName: student.grade?.name || "",
              gradeId: student.grade_id,
              schoolName: schoolInfo?.name || "",
              schoolId: schoolId || "",
              schoolLogo: schoolInfo?.logo || null,
              type: "rt",
              title: hw.title,
              dueDate: hw.due_date,
              createdAt: hw.created_at,
              isOverdue
            });
          }
        });
      });

      return missing;
    }
  });

  // 학교별, 학년별로 그룹화
  const groupedMissing = (() => {
    if (!missingAssignments) return [];

    const schoolGradeMap = new Map<string, {
      schoolId: string;
      schoolName: string;
      schoolLogo: string | null;
      grades: Map<string, {
        gradeId: string;
        gradeName: string;
        students: Map<string, {
          studentId: string;
          studentName: string;
          gradeName: string;
          schoolName: string;
          schoolLogo: string | null;
          assignments: MissingAssignment[];
        }>;
      }>;
    }>();

    missingAssignments.forEach((item) => {
      if (!schoolGradeMap.has(item.schoolId)) {
        schoolGradeMap.set(item.schoolId, {
          schoolId: item.schoolId,
          schoolName: item.schoolName,
          schoolLogo: item.schoolLogo,
          grades: new Map()
        });
      }

      const school = schoolGradeMap.get(item.schoolId)!;
      if (!school.grades.has(item.gradeId)) {
        school.grades.set(item.gradeId, {
          gradeId: item.gradeId,
          gradeName: item.gradeName,
          students: new Map()
        });
      }

      const grade = school.grades.get(item.gradeId)!;
      if (!grade.students.has(item.studentId)) {
        grade.students.set(item.studentId, {
          studentId: item.studentId,
          studentName: item.studentName,
          gradeName: item.gradeName,
          schoolName: item.schoolName,
          schoolLogo: item.schoolLogo,
          assignments: []
        });
      }

      grade.students.get(item.studentId)!.assignments.push(item);
    });

    return Array.from(schoolGradeMap.values()).map((school) => ({
      ...school,
      grades: Array.from(school.grades.values()).map((grade) => ({
        ...grade,
        students: Array.from(grade.students.values())
      }))
    }));
  })();

  // 모든 학년 목록 생성 (탭 버튼용)
  const allGradeCategories = groupedMissing.flatMap((school) =>
  school.grades.map((grade) => ({
    key: `${school.schoolId}-${grade.gradeId}`,
    schoolId: school.schoolId,
    schoolName: school.schoolName,
    schoolLogo: school.schoolLogo,
    gradeId: grade.gradeId,
    gradeName: grade.gradeName,
    studentCount: grade.students.length,
    totalAssignments: grade.students.reduce((sum, s) => sum + s.assignments.length, 0),
    students: grade.students
  }))
  );

  // 태그 필터 적용
  const filteredGradeCategories = useMemo(() => {
    if (!selectedTagFilter) return allGradeCategories;
    const tagStudents = tagStudentMap.get(selectedTagFilter);
    if (!tagStudents) return [];
    return allGradeCategories.map((cat) => ({
      ...cat,
      students: cat.students.filter((s) => tagStudents.has(s.studentId)),
    })).filter((cat) => cat.students.length > 0).map((cat) => ({
      ...cat,
      studentCount: cat.students.length,
      totalAssignments: cat.students.reduce((sum, s) => sum + s.assignments.length, 0),
    }));
  }, [allGradeCategories, selectedTagFilter, tagStudentMap]);


  const selectedGrade = selectedGradeKey === "all" ?
  {
    key: "all",
    schoolId: "all",
    schoolName: "전체",
    schoolLogo: null,
    gradeId: "all",
    gradeName: "전체",
    studentCount: filteredGradeCategories.reduce((sum, g) => sum + g.studentCount, 0),
    totalAssignments: filteredGradeCategories.reduce((sum, g) => sum + g.totalAssignments, 0),
    students: filteredGradeCategories.flatMap((g) => g.students)
  } :
  selectedGradeKey ?
  filteredGradeCategories.find((g) => g.key === selectedGradeKey) :
  null;

  const totalMissingCount = filteredGradeCategories.reduce((sum, g) => sum + g.students.reduce((s2, st) => s2 + st.assignments.length, 0), 0);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* 컴팩트 프리미엄 헤더 */}
      <div className="relative overflow-hidden rounded-2xl sec-wine sec-header px-3 md:px-5 py-2.5">
        {/* 기하학적 패턴 배경 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          
          {/* 다이아몬드 격자 패턴 */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dash-diamonds" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="1" height="1" x="11.5" y="11.5" fill="white" />
                <rect width="24" height="24" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dash-diamonds)" />
          </svg>

          {/* 대각선 빛줄기 */}
          <div className="absolute -top-4 right-1/4 w-32 h-[200%] bg-gradient-to-b from-white/[0.03] via-white/[0.06] to-transparent rotate-[25deg] blur-sm" />
          <div className="absolute -top-4 right-[45%] w-16 h-[200%] bg-gradient-to-b from-white/[0.02] via-white/[0.04] to-transparent rotate-[25deg] blur-sm" />

          {/* 우측 장식 원호 */}
          <svg className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 opacity-[0.06] hidden md:block" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.3" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* 타이틀 + 날짜 (한 줄) */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <h1 className="text-sm md:text-base font-semibold text-white">학습 관리</h1>
              <span className="text-xs text-white/40">|</span>
              <span className="text-[11px] md:text-xs text-white/50">
                {format(new Date(), "M월 d일 (EEEE)", { locale: ko })}
              </span>
            </div>
          </div>

          {/* 인라인 통계 */}
          <div className="flex items-center gap-2">
            {/* 전체 학생 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-md border border-blue-400/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              <Users className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-[10px] md:text-xs font-medium text-blue-200/80">학생</span>
              <span className="text-xs md:text-sm font-bold text-white">{stats?.totalStudents || 0}</span>
            </div>

            {/* 금일 제출 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md border border-emerald-400/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px] md:text-xs font-medium text-emerald-200/80">제출</span>
              <span className="text-xs md:text-sm font-bold text-white">{stats?.todaySubmissions || 0}</span>
              <span className="text-[9px] md:text-[10px] text-emerald-300 font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded-full">{stats?.submissionRate || 0}%</span>
            </div>

            {/* 검사 대기 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px] md:text-xs font-medium text-amber-200/80">대기</span>
              <span className="text-xs md:text-sm font-bold text-white">{stats?.pendingReview || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <DailySubmissionStatus selectedDate={selectedDate} />
          <RTSubmissionStatus selectedDate={selectedDate} />
        </div>

        {/* 사이드바 영역 */}
        <div className="space-y-4 md:space-y-6">
          {/* 날짜 선택 캘린더 - 최상단으로 이동 */}
          <Card className="sec-gold sec-surface border-0 shadow-none">
            <CardHeader className="pb-1 pt-3 px-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[hsl(var(--sec)/0.18)] blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-[hsl(var(--accent)/0.16)] blur-lg" />
              <CardTitle className="relative flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                </div>
                날짜 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3 pt-0 relative">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border-0 calendar-colorful"
                locale={ko}
                fullWidth
                showWeekendColors />
            </CardContent>
          </Card>



          {/* 밀린 과제 현황 - 프리미엄 디자인 */}
          <Card className="sec-plum sec-surface border-0 shadow-none">
            <CardHeader className="relative overflow-hidden sec-header py-1.5 px-3.5">
              {/* 패턴 장식 */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="overdue-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="1" height="1" x="9.5" y="9.5" fill="white" />
                    <rect width="20" height="20" fill="none" stroke="white" strokeWidth="0.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#overdue-pattern)" />
              </svg>
              <div className="absolute -top-4 right-1/3 w-24 h-[200%] bg-gradient-to-b from-white/[0.02] via-white/[0.05] to-transparent rotate-[25deg] blur-sm" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                    <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-white/60 uppercase tracking-wide leading-none">Overdue</span>
                    <CardTitle className="text-sm font-semibold text-white mt-0">
                      밀린 과제 현황
                    </CardTitle>
                  </div>
                </div>
                {totalMissingCount > 0 && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {totalMissingCount}
                    </div>
                    <div className="text-[10px] text-white/50">건 밀림</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {/* 반 선택 필터 - 그룹(태그)별 정렬 */}
              <div className="space-y-1.5 mb-2.5">
                {/* 전체 버튼 */}
                <div className="flex flex-wrap gap-1">
                  <button
                    className={`inline-flex items-center h-6 px-2 text-[10px] font-medium rounded-md transition-all ${
                      selectedGradeKey === "all"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60"
                    }`}
                    onClick={() => { setSelectedGradeKey("all"); setSelectedTagFilter(null); }}
                  >
                    전체
                    <span className={`ml-1 text-[9px] ${selectedGradeKey === "all" ? "text-background/60" : "text-muted-foreground/50"}`}>
                      {allGradeCategories.reduce((s, g) => s + g.students.reduce((s2, st) => s2 + st.assignments.length, 0), 0)}
                    </span>
                  </button>
                </div>
                {/* 태그별 그룹 */}
                {(() => {
                  const tags = tagsData?.tags || [];
                  // 학생→태그 매핑 (역방향)
                  const studentTagMap = new Map<string, string>();
                  tagsData?.assignments.forEach((a) => {
                    if (!studentTagMap.has(a.student_id)) studentTagMap.set(a.student_id, a.tag_id);
                  });

                  // 태그별로 grade categories 분류
                  const tagGroups = new Map<string, typeof allGradeCategories>();
                  const untagged: typeof allGradeCategories = [];

                  allGradeCategories.forEach((cat) => {
                    // 이 카테고리의 학생들이 속한 태그 찾기
                    const tagIds = new Set<string>();
                    cat.students.forEach((s) => {
                      const tid = studentTagMap.get(s.studentId);
                      if (tid) tagIds.add(tid);
                    });
                    if (tagIds.size > 0) {
                      const primaryTag = tagIds.values().next().value;
                      if (!tagGroups.has(primaryTag)) tagGroups.set(primaryTag, []);
                      tagGroups.get(primaryTag)!.push(cat);
                    } else {
                      untagged.push(cat);
                    }
                  });

                  const renderCatButton = (category: typeof allGradeCategories[0]) => (
                    <button
                      key={category.key}
                      className={`inline-flex items-center gap-1 h-6 px-2 text-[10px] font-medium rounded-md transition-all ${
                        selectedGradeKey === category.key
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60"
                      }`}
                      onClick={() => { setSelectedGradeKey(category.key); setSelectedTagFilter(null); }}
                    >
                      <Avatar className="w-3.5 h-3.5">
                        {category.schoolLogo ? <AvatarImage src={category.schoolLogo} alt={category.schoolName} /> : null}
                        <AvatarFallback className="text-[7px] font-bold">{category.schoolName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {category.schoolName.replace("고등학교", "고").replace("중학교", "중")}{category.gradeName.replace("학년", "")}
                      <span className={`text-[9px] ${selectedGradeKey === category.key ? "text-background/60" : "text-muted-foreground/50"}`}>
                        {category.studentCount}
                      </span>
                    </button>
                  );

                  return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tags.map((tag) => {
                        const cats = tagGroups.get(tag.id) || [];
                        if (cats.length === 0) return null;
                        const tagStudentCount = cats.reduce((sum, c) => sum + c.studentCount, 0);
                        return (
                          <button
                            key={tag.id}
                            className={`inline-flex items-center gap-1 h-6 px-2 text-[10px] font-semibold rounded-md transition-all ${
                              selectedTagFilter === tag.id ? "ring-1 ring-offset-1 shadow-sm" : "hover:opacity-80"
                            }`}
                            style={{ color: tag.color, backgroundColor: `${tag.color}${selectedTagFilter === tag.id ? '30' : '15'}` }}
                            onClick={() => {
                              if (selectedTagFilter === tag.id) {
                                setSelectedTagFilter(null);
                              } else {
                                setSelectedTagFilter(tag.id);
                                setSelectedGradeKey("all");
                              }
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                            <span className="text-[9px] opacity-60">{tagStudentCount}</span>
                          </button>
                        );
                      })}
                      {untagged.length > 0 && (
                        <button
                          className={`inline-flex items-center gap-1 h-6 px-2 text-[10px] font-semibold rounded-md transition-all ${
                            selectedTagFilter === '__untagged' ? "bg-foreground text-background shadow-sm" : "text-muted-foreground/60 bg-muted/30 hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            if (selectedTagFilter === '__untagged') {
                              setSelectedTagFilter(null);
                            } else {
                              setSelectedTagFilter('__untagged');
                              setSelectedGradeKey("all");
                            }
                          }}
                        >
                          미지정
                          <span className="text-[9px] opacity-60">{untagged.reduce((sum, c) => sum + c.studentCount, 0)}</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 선택된 반의 학생 목록 */}
              {selectedGrade ? (
                <div className="space-y-0">
                  {/* 액션 바 */}
                  <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {selectedGrade.students.length}명 · {selectedGrade.students.reduce((sum, s) => sum + s.assignments.length, 0)}건
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 gap-1 rounded-full"
                        title="전체 문자 발송"
                        onClick={() => setShowBulkMessage(true)}
                      >
                        <MessageSquare className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                        전체문자
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 gap-1 rounded-full"
                        title="전체 카톡 발송"
                        onClick={() => setShowBulkKakao(true)}
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                        전체카톡
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 gap-1 rounded-full text-muted-foreground hover:text-destructive"
                        title="전체 초기화 (오늘 단어과제 제외)"
                        onClick={() => {
                          if (!selectedGrade) return;
                          const allToReset = selectedGrade.students.flatMap((s) =>
                            s.assignments.filter((a) => a.type === "daily" && a.dueDate !== todayStr)
                          );
                          if (allToReset.length === 0) {
                            toast.info("초기화할 과제가 없습니다");
                            return;
                          }
                          if (window.confirm(`전체 학생의 밀린 단어과제를 모두 초기화하시겠습니까? (녹음과제·오늘 단어과제 제외, ${allToReset.length}건)`)) {
                            bulkDeleteMutation.mutate(allToReset);
                          }
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                        초기화
                      </Button>
                    </div>
                  </div>

                  {/* 그룹(태그)별 → 학교별 그룹 */}
                  {(() => {
                    const tags = tagsData?.tags || [];
                    const studentTagMap2 = new Map<string, string>();
                    tagsData?.assignments.forEach((a) => {
                      if (!studentTagMap2.has(a.student_id)) studentTagMap2.set(a.student_id, a.tag_id);
                    });

                    // 태그별로 학생 분류
                    const tagStudentGroups = new Map<string, typeof selectedGrade.students>();
                    const untaggedStudents: typeof selectedGrade.students = [];

                    selectedGrade.students.forEach((student) => {
                      const tagId = studentTagMap2.get(student.studentId);
                      if (tagId) {
                        if (!tagStudentGroups.has(tagId)) tagStudentGroups.set(tagId, []);
                        tagStudentGroups.get(tagId)!.push(student);
                      } else {
                        untaggedStudents.push(student);
                      }
                    });

                    // 학교별 그룹핑 헬퍼
                    const groupBySchool = (students: typeof selectedGrade.students) => {
                      const schoolGroups = new Map<string, { schoolName: string; schoolLogo: string | null; students: typeof selectedGrade.students }>();
                      students.forEach((student) => {
                        const key = student.schoolName || "기타";
                        if (!schoolGroups.has(key)) {
                          schoolGroups.set(key, { schoolName: key, schoolLogo: student.schoolLogo, students: [] });
                        }
                        schoolGroups.get(key)!.students.push(student);
                      });
                      return Array.from(schoolGroups.values());
                    };

                    // 학교 + 학생 렌더링 헬퍼
                    const renderSchoolGroup = (school: { schoolName: string; schoolLogo: string | null; students: typeof selectedGrade.students }) => (
                      <div key={school.schoolName} className="mb-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/30 rounded-md mb-0.5">
                          <Avatar className="w-4 h-4">
                            {school.schoolLogo ? <AvatarImage src={school.schoolLogo} alt={school.schoolName} /> : null}
                            <AvatarFallback className="text-[7px] font-bold">{school.schoolName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-semibold text-foreground/70">
                            {school.schoolName.replace("고등학교", "고").replace("중학교", "중")}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{school.students.length}명</span>
                        </div>
                        <div className="grid grid-cols-3 gap-px">
                          {school.students.map((student) => {
                            const dailyAssignments = student.assignments.filter((a) => a.type === "daily");
                            const rtAssignments = student.assignments.filter((a) => a.type === "rt");

                            return (
                              <div
                                key={student.studentId}
                                className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-muted/20 transition-colors group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold whitespace-nowrap">{student.studentName}</span>
                                    <div className="flex flex-wrap gap-0.5">
                                      {dailyAssignments.map((a) => (
                                        <span
                                          key={a.id}
                                          className="text-[8px] px-1 h-[14px] inline-flex items-center rounded bg-pink-50 text-pink-600 border border-pink-100"
                                        >
                                          {a.title.includes("(") ? a.title.substring(a.title.indexOf("(")) : "(오늘)"}
                                        </span>
                                      ))}
                                      {(() => {
                                        const grouped = new Map<string, typeof rtAssignments>();
                                        rtAssignments.forEach((a) => {
                                          const dateKey = a.createdAt
                                            ? format(new Date(a.createdAt), 'M/d')
                                            : a.title.replace("녹음 과제: ", "");
                                          if (!grouped.has(dateKey)) grouped.set(dateKey, []);
                                          grouped.get(dateKey)!.push(a);
                                        });
                                        return Array.from(grouped.entries()).map(([dateKey, items]) => (
                                          <span
                                            key={dateKey}
                                            className="text-[8px] px-1 h-[14px] inline-flex items-center rounded bg-violet-50 text-violet-600 border border-violet-100"
                                          >
                                            <Mic className="w-2 h-2 mr-0.5" />
                                            {dateKey}{items.length > 1 && `×${items.length}`}
                                          </span>
                                        ));
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0 flex-shrink-0">
                                  <button
                                    className="w-4 h-4 flex items-center justify-center rounded hover:bg-muted/60 transition-colors"
                                    title="메시지 발송"
                                    onClick={() => {
                                      const firstAssignment = student.assignments[0];
                                      setQuickMessageStudent({
                                        id: student.studentId,
                                        name: student.studentName,
                                        studentPhone: firstAssignment?.studentPhone,
                                        parentPhone: firstAssignment?.parentPhone,
                                      });
                                    }}
                                  >
                                    <MessageSquare className="w-2.5 h-2.5 shrink-0" strokeWidth={1.75} />
                                  </button>
                                  <button
                                    className="w-4 h-4 flex items-center justify-center rounded hover:bg-muted/60 transition-colors"
                                    title="카카오톡"
                                    onClick={() => {
                                      const firstAssignment = student.assignments[0];
                                      setQuickKakaoStudent({
                                        id: student.studentId,
                                        name: student.studentName,
                                        studentPhone: firstAssignment?.studentPhone,
                                        parentPhone: firstAssignment?.parentPhone,
                                      });
                                    }}
                                  >
                                    <MessageCircle className="w-2.5 h-2.5 shrink-0" strokeWidth={1.75} />
                                  </button>
                                  <button
                                    className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-muted/60 transition-colors"
                                    title="초기화"
                                    onClick={() => {
                                      const toReset = student.assignments.filter((a) => !(a.type === "daily" && a.dueDate === todayStr));
                                      if (toReset.length === 0) {
                                        toast.info("초기화할 과제가 없습니다 (오늘 단어과제만 있음)");
                                        return;
                                      }
                                      if (window.confirm(`${student.studentName}의 밀린 과제를 모두 초기화하시겠습니까? (오늘 단어과제 제외, ${toReset.length}건)`)) {
                                        bulkDeleteMutation.mutate(toReset);
                                      }
                                    }}
                                  >
                                    <RotateCcw className="w-2 h-2" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );

                    return (
                      <>
                        {tags.map((tag) => {
                          const tagStudents = tagStudentGroups.get(tag.id);
                          if (!tagStudents || tagStudents.length === 0) return null;
                          const schools = groupBySchool(tagStudents);
                          return (
                            <div key={tag.id} className="mb-2">
                              <div className="flex items-center gap-1.5 px-2 py-1 mb-1 rounded-md" style={{ backgroundColor: `${tag.color}10` }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                <span className="text-[10px] font-bold" style={{ color: tag.color }}>{tag.name}</span>
                                <span className="text-[9px] text-muted-foreground">{tagStudents.length}명</span>
                              </div>
                              {schools.map(renderSchoolGroup)}
                            </div>
                          );
                        })}
                        {untaggedStudents.length > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 mb-1 rounded-md bg-muted/20">
                              <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                              <span className="text-[10px] font-bold text-muted-foreground/60">미지정</span>
                              <span className="text-[9px] text-muted-foreground">{untaggedStudents.length}명</span>
                            </div>
                            {groupBySchool(untaggedStudents).map(renderSchoolGroup)}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <UserX className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">반을 선택하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <QuickMessageDialog
        open={!!quickMessageStudent}
        onOpenChange={(open) => !open && setQuickMessageStudent(null)}
        studentId={quickMessageStudent?.id || ""}
        studentName={quickMessageStudent?.name || ""}
        studentPhone={quickMessageStudent?.studentPhone}
        parentPhone={quickMessageStudent?.parentPhone} />

      <BulkMessageDialog
        open={showBulkMessage}
        onOpenChange={setShowBulkMessage}
        students={(selectedGrade?.students || []).map((s) => ({
          id: s.studentId,
          name: s.studentName,
          studentPhone: s.assignments[0]?.studentPhone,
          parentPhone: s.assignments[0]?.parentPhone
        }))} />

      <BulkKakaoDialog
        open={showBulkKakao}
        onOpenChange={setShowBulkKakao}
        students={(selectedGrade?.students || []).map((s) => ({
          id: s.studentId,
          name: s.studentName,
          studentPhone: s.assignments[0]?.studentPhone,
          parentPhone: s.assignments[0]?.parentPhone
        }))} />

      {/* 개별 카톡 발송 다이얼로그 */}
      {quickKakaoStudent &&
      <QuickKakaoDialog
        open={!!quickKakaoStudent}
        onOpenChange={(open) => !open && setQuickKakaoStudent(null)}
        studentId={quickKakaoStudent.id}
        studentName={quickKakaoStudent.name}
        studentPhone={quickKakaoStudent.studentPhone}
        parentPhone={quickKakaoStudent.parentPhone} />

      }
    </div>);

}