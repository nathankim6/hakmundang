import { useState, useMemo, useCallback, useEffect } from "react";
import { getKSTNow } from "@/utils/koreanTime";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { useOwnerStudentIds } from "@/hooks/useOwnerStudentIds";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  startOfMonth,
  endOfMonth,
  getWeek,
  getDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Camera, CheckCheck, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Eye, Filter, Heart, Loader2, MessageCircle, MessageSquare, Mic, Minus, PenLine, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageZoomDialog } from "@/components/ui/image-zoom-dialog";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";
import { RTRecordingPlayerDialog } from "@/components/dashboard/RTRecordingPlayerDialog";
import { getMessageTemplates } from "@/components/notifications/MessageTemplateDialog";

const GLOBAL_START_DATE = "2026-02-08";

const ASSIGNMENT_TYPES = [
  { key: "사진(단어)", label: "단어", color: "bg-slate-500", colorLight: "bg-slate-100", textColor: "text-slate-600", headerBg: "bg-slate-50" },
  { key: "사진(단어 재시험)", label: "재시험", color: "bg-slate-400", colorLight: "bg-slate-100/70", textColor: "text-slate-500", headerBg: "bg-slate-50/70" },
  { key: "사진(복습노트)", label: "복습", color: "bg-zinc-500", colorLight: "bg-zinc-100", textColor: "text-zinc-600", headerBg: "bg-zinc-50" },
  { key: "모의고사", label: "모의", color: "bg-stone-500", colorLight: "bg-stone-100", textColor: "text-stone-600", headerBg: "bg-stone-50" },
  { key: "녹음", label: "녹음", color: "bg-neutral-500", colorLight: "bg-neutral-100", textColor: "text-neutral-600", headerBg: "bg-neutral-50" },
];

export default function PhotoAssignments() {
  const { isAdmin, ownerCodeId } = useOwnerFilter();
  const { studentIds: ownerStudentIds } = useOwnerStudentIds();
  const { session } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [photoDialog, setPhotoDialog] = useState<{
    open: boolean;
    urls: string[];
    studentName: string;
    date: string;
    type: string;
    submissionId?: string;
    teacherNote?: string;
    status?: string;
  }>({ open: false, urls: [], studentName: "", date: "", type: "" });
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [rtDialog, setRtDialog] = useState<{
    open: boolean;
    submission: any;
    studentName: string;
    studentId: string;
    homeworkId: string;
    homeworkTitle: string;
    passageId?: string;
  }>({ open: false, submission: null, studentName: "", studentId: "", homeworkId: "", homeworkTitle: "" });
  const [feedbackText, setFeedbackText] = useState("");
  const [quickSmsStudent, setQuickSmsStudent] = useState<any>(null);
  const [quickKakaoStudent, setQuickKakaoStudent] = useState<any>(null);
  const [bulkProcessingSchool, setBulkProcessingSchool] = useState<string | null>(null);
  const [bulkConfirmDialog, setBulkConfirmDialog] = useState<{
    open: boolean;
    school: any | null;
    messageType: "sms" | "kakao";
    extraMessage: string;
    preview: { studentName: string; photoCount: number; rtCount: number; photoMsg: string; rtMsg: string }[];
  }>({ open: false, school: null, messageType: "sms", extraMessage: "", preview: [] });

  const displayDays = useMemo(() => {
    if (viewMode === "week") {
      return eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
      });
    } else {
      return eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      });
    }
  }, [viewMode, currentWeekStart, currentMonth]);

  // Keep weekDays as alias for backward compat in stats etc
  const weekDays = displayDays;

  // 월간 모드: 주 단위로 그룹핑 (월~일, 7열 x 4~5행)
  const monthWeeks = useMemo(() => {
    if (viewMode !== "month") return [];
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    // 첫째 날 앞에 빈 칸 채우기 (월=0, 화=1, ... 일=6)
    const firstDay = displayDays[0];
    const firstDayOfWeek = (getDay(firstDay) + 6) % 7; // 월요일 기준
    for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);
    displayDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  }, [viewMode, displayDays]);

  const dateLabel = useMemo(() => {
    if (viewMode === "week") {
      const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const monthYear = format(currentWeekStart, "yyyy년 M월", { locale: ko });
      return `${monthYear} ${format(currentWeekStart, "M/d")}~${format(end, "M/d")}`;
    } else {
      return format(currentMonth, "yyyy년 M월", { locale: ko });
    }
  }, [viewMode, currentWeekStart, currentMonth]);

  // 학교 목록
  const { data: schools = [] } = useQuery({
    queryKey: ["schools-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name, logo_url")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // 학년 목록
  const { data: grades = [] } = useQuery({
    queryKey: ["grades-list", selectedSchool],
    queryFn: async () => {
      let query = supabase
        .from("grades")
        .select("id, name, school_id")
        .order("name");
      if (selectedSchool !== "all") query = query.eq("school_id", selectedSchool);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // 학생 목록
  const { data: allFilteredStudents = [] } = useQuery({
    queryKey: ["students-for-matrix", selectedSchool, selectedGrade],
    queryFn: async () => {
      let query = supabase
        .from("students")
        .select(
          "id, name, created_at, grade_id, grade:grade_id(id, name, school_id, school:school_id(id, name, logo_url))"
        )
        .order("name");
      if (selectedGrade !== "all") query = query.eq("grade_id", selectedGrade);
      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];
      if (selectedSchool !== "all") {
        filtered = filtered.filter(
          (s: any) => s.grade?.school_id === selectedSchool
        );
      }
      if (!isAdmin && ownerStudentIds) {
        filtered = filtered.filter((s: any) =>
          ownerStudentIds.includes(s.id)
        );
      }
      return filtered;
    },
  });




  // 날짜 범위 계산 (주/월 모드 공용)
  const weekStartStr = viewMode === "week"
    ? format(currentWeekStart, "yyyy-MM-dd")
    : format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const weekEndStr = viewMode === "week"
    ? format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "yyyy-MM-dd")
    : format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: photoSubmissions = [] } = useQuery({
    queryKey: ["week-photo-submissions", weekStartStr, weekEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select(
          "id, submission_date, submitted_at, photo_urls, status, reviewed_at, teacher_note, student_id, assignment_type"
        )
        .gte("submission_date", weekStartStr)
        .lte("submission_date", weekEndStr)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // 해당 주의 녹음과제 (homework + submissions) - due_date가 있는 것 + due_date가 null인 상시과제
  const { data: rtHomework = [] } = useQuery({
    queryKey: ["week-rt-homework", weekStartStr, weekEndStr, ownerCodeId, isAdmin],
    queryFn: async () => {
      // due_date가 해당 주 범위인 과제
      let query1 = supabase
        .from("homework")
        .select("id, title, due_date, type, target_type, target_grade_id, target_student_id, passage_id")
        .gte("due_date", weekStartStr)
        .lte("due_date", weekEndStr);
      if (!isAdmin && ownerCodeId) {
        query1 = query1.eq("owner_code_id", ownerCodeId);
      }
      const { data: dated, error: e1 } = await query1;
      if (e1) throw e1;

      // due_date가 null인 상시 과제 (녹음과제)
      let query2 = supabase
        .from("homework")
        .select("id, title, due_date, type, target_type, target_grade_id, target_student_id, passage_id")
        .is("due_date", null);
      if (!isAdmin && ownerCodeId) {
        query2 = query2.eq("owner_code_id", ownerCodeId);
      }
      const { data: undated, error: e2 } = await query2;
      if (e2) throw e2;

      return [...(dated || []), ...(undated || [])];
    },
  });

  const { data: rtSubmissions = [] } = useQuery({
    queryKey: ["week-rt-submissions", weekStartStr, weekEndStr, ownerCodeId, isAdmin],
    queryFn: async () => {
      // Get homework IDs for the week (by due_date) + 상시과제 (null due_date)
      let query1 = supabase.from("homework").select("id").gte("due_date", weekStartStr).lte("due_date", weekEndStr);
      if (!isAdmin && ownerCodeId) query1 = query1.eq("owner_code_id", ownerCodeId);
      const { data: hw1 } = await query1;

      let query2 = supabase.from("homework").select("id").is("due_date", null);
      if (!isAdmin && ownerCodeId) query2 = query2.eq("owner_code_id", ownerCodeId);
      const { data: hw2 } = await query2;

      const hwIds = [...(hw1 || []), ...(hw2 || [])].map((h) => h.id);
      if (hwIds.length === 0) return [];

      const { data, error } = await supabase
        .from("homework_submissions")
        .select(
          "id, student_id, homework_id, submitted_at, status, recording_url, recording_timestamps, teacher_note, reviewed_at"
        )
        .in("homework_id", hwIds);
      if (error) throw error;
      return data || [];
    },
  });

  // 제출일이 이번 주/월인 녹음과제 (due_date는 범위 밖이지만 제출은 이번 주에 한 경우)
  const { data: earlyRtSubmissions = [] } = useQuery({
    queryKey: ["week-early-rt-submissions", weekStartStr, weekEndStr],
    queryFn: async () => {
      const startISO = `${weekStartStr}T00:00:00`;
      const endISO = `${weekEndStr}T23:59:59`;
      const { data, error } = await supabase
        .from("homework_submissions")
        .select(
          "id, student_id, homework_id, submitted_at, status, recording_url, recording_timestamps, teacher_note, reviewed_at"
        )
        .not("submitted_at", "is", null)
        .not("recording_url", "is", null)
        .gte("submitted_at", startISO)
        .lte("submitted_at", endISO);
      if (error) throw error;
      return data || [];
    },
  });

  // earlyRtSubmissions에서 homework 정보 가져오기
  const earlyHwIds = useMemo(() => {
    const dueDateHwIds = new Set(rtHomework.map((hw: any) => hw.id));
    return [...new Set(earlyRtSubmissions
      .map((s: any) => s.homework_id)
      .filter((id: string) => !dueDateHwIds.has(id))
    )];
  }, [earlyRtSubmissions, rtHomework]);

  const { data: earlyRtHomework = [] } = useQuery({
    queryKey: ["early-rt-homework", earlyHwIds],
    queryFn: async () => {
      if (earlyHwIds.length === 0) return [];
      const { data, error } = await supabase
        .from("homework")
        .select("id, title, due_date, type, target_type, target_grade_id, target_student_id, passage_id")
        .in("id", earlyHwIds);
      if (error) throw error;
      return data || [];
    },
    enabled: earlyHwIds.length > 0,
  });

  // dismissed 일일단어
  const { data: dismissedData = [] } = useQuery({
    queryKey: ["dismissed-week", weekStartStr, weekEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dismissed_daily_words")
        .select("student_id, dismissed_date")
        .gte("dismissed_date", weekStartStr)
        .lte("dismissed_date", weekEndStr);
      if (error) throw error;
      return data || [];
    },
  });

  const commitSet = useMemo(() => new Set<string>(), []);

  const dismissedSet = useMemo(
    () =>
      new Set(dismissedData.map((d: any) => `${d.student_id}-${d.dismissed_date}`)),
    [dismissedData]
  );

  // 그룹(태그) 목록 조회
  const { data: allTags = [] } = useQuery({
    queryKey: ["student-tags-for-matrix", ownerCodeId, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("student_tags")
        .select("id, name, color")
        .order("name");
      if (!isAdmin && ownerCodeId) {
        query = query.eq("owner_code_id", ownerCodeId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 태그-학생 매핑 조회
  const { data: tagAssignments = [] } = useQuery({
    queryKey: ["student-tag-assignments-for-matrix"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_tag_assignments")
        .select("student_id, tag_id");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const students = useMemo(() => {
    let result = allFilteredStudents;
    if (selectedGroup !== "all") {
      const groupStudentIds = new Set(
        tagAssignments.filter((a: any) => a.tag_id === selectedGroup).map((a: any) => a.student_id)
      );
      result = result.filter((s: any) => groupStudentIds.has(s.id));
    }
    if (selectedStudent !== "all") {
      result = result.filter((s: any) => s.id === selectedStudent);
    }
    return result;
  }, [allFilteredStudents, selectedStudent, selectedGroup, tagAssignments]);


  const groupedStudents = useMemo(() => {
    const studentToTags = new Map<string, string[]>();
    for (const a of tagAssignments) {
      const existing = studentToTags.get(a.student_id) || [];
      existing.push(a.tag_id);
      studentToTags.set(a.student_id, existing);
    }

    const tagMap = new Map(allTags.map(t => [t.id, t]));

    const groups: Array<{
      groupId: string;
      groupName: string;
      groupColor: string;
      students: any[];
    }> = [];

    const groupMap = new Map<string, any[]>();

    // Initialize all tags
    for (const tag of allTags) {
      groupMap.set(tag.id, []);
    }

    const untaggedStudents: any[] = [];

    (students || []).forEach((student: any) => {
      const tags = studentToTags.get(student.id);
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          if (!groupMap.has(tagId)) groupMap.set(tagId, []);
          groupMap.get(tagId)!.push(student);
        }
      } else {
        untaggedStudents.push(student);
      }
    });

    groupMap.forEach((students, tagId) => {
      const tag = tagMap.get(tagId);
      if (tag) {
        groups.push({
          groupId: tagId,
          groupName: tag.name,
          groupColor: tag.color,
          students,
        });
      }
    });

    if (untaggedStudents.length > 0) {
      groups.push({
        groupId: "untagged",
        groupName: "미지정 그룹",
        groupColor: "#94a3b8",
        students: untaggedStudents,
      });
    }

    return groups;
  }, [students, allTags, tagAssignments]);

  // 학생별 일별 과제 상태 계산
  const getCellData = (studentId: string, day: Date, studentCreatedAt: string) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const todayDate = getKSTNow();

    // 미래 날짜
    if (isBefore(todayDate, startOfDay(day)) && !isSameDay(todayDate, day)) {
      return { status: "future" as const, photos: [], rtStatus: null };
    }

    // 글로벌 시작일 이전
    if (dayStr < GLOBAL_START_DATE) {
      return { status: "no-assignment" as const, photos: [], rtStatus: null };
    }

    // 학생 등록일 이전
    const createdKST = new Date(
      new Date(studentCreatedAt).getTime() + 9 * 60 * 60 * 1000
    );
    const createdDateStr = `${createdKST.getUTCFullYear()}-${String(
      createdKST.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(createdKST.getUTCDate()).padStart(2, "0")}`;
    if (dayStr < createdDateStr) {
      return { status: "no-assignment" as const, photos: [], rtStatus: null };
    }

    // dismissed
    if (dismissedSet.has(`${studentId}-${dayStr}`)) {
      return { status: "dismissed" as const, photos: [], rtStatus: null };
    }

    // 사진과제 확인
    const dayPhotos = photoSubmissions.filter(
      (s: any) => s.student_id === studentId && s.submission_date === dayStr
    );

    // 녹음과제 확인 - 이 학생에게 해당 날짜에 due인 과제가 있는지
    const dayRtHomework = rtHomework.filter((hw: any) => {
      const isForStudent = hw.target_type === "student"
        ? hw.target_student_id === studentId
        : hw.target_type === "grade"
          ? (() => { const student = (students || []).find((s: any) => s.id === studentId); return student?.grade_id === hw.target_grade_id; })()
          : false;
      if (!isForStudent) return false;
      // due_date가 있으면 날짜 매칭, null이면 상시과제로 모든 날짜에 표시
      if (hw.due_date) return hw.due_date === dayStr;
      return true;
    });

    const rtStatusList = dayRtHomework.map((hw: any) => {
      const sub = rtSubmissions.find(
        (s: any) => {
          if (s.student_id !== studentId || s.homework_id !== hw.id || !s.submitted_at) return false;
          // 상시과제(due_date=null)는 제출일 기준으로 매칭
          if (!hw.due_date) {
            const submittedDateStr = format(new Date(s.submitted_at), "yyyy-MM-dd");
            return submittedDateStr === dayStr;
          }
          return true;
        }
      );
      return {
        hwId: hw.id,
        title: hw.title,
        type: hw.type,
        submitted: !!sub,
        reviewed: !!sub?.reviewed_at,
        submissionId: sub?.id,
      };
    });

    // due_date는 이번 주/월 밖이지만 이 날짜에 제출된 녹음과제
    const dayEarlyRtSubs = earlyRtSubmissions.filter((s: any) => {
      if (s.student_id !== studentId || !s.submitted_at) return false;
      const submittedDateStr = format(new Date(s.submitted_at), "yyyy-MM-dd");
      if (submittedDateStr !== dayStr) return false;
      // 이미 due_date 기준으로 표시된 건 제외
      return !rtStatusList.some((r) => r.submissionId === s.id);
    });

    const earlyRtStatusList = dayEarlyRtSubs.map((sub: any) => {
      const hw = earlyRtHomework.find((h: any) => h.id === sub.homework_id);
      return {
        hwId: sub.homework_id,
        title: hw?.title || "녹음 과제",
        type: hw?.type || "rt",
        submitted: true,
        reviewed: !!sub.reviewed_at,
        submissionId: sub.id,
        isEarly: true,
      };
    });

    const combinedRtStatus = [...rtStatusList, ...earlyRtStatusList];

    const hasPhotos = dayPhotos.length > 0;
    const hasRt = combinedRtStatus.length > 0;
    const allRtDone = combinedRtStatus.every((r) => r.submitted);

    let status: "submitted" | "partial" | "missed" | "no-assignment" | "today";
    if (isToday(day)) {
      status = "today";
    } else if (!hasPhotos && !hasRt) {
      status = "missed"; // 단어과제 미제출
    } else if (hasPhotos && (!hasRt || allRtDone)) {
      status = "submitted";
    } else if (hasPhotos || (hasRt && combinedRtStatus.some((r) => r.submitted))) {
      status = "partial";
    } else {
      status = "missed";
    }

    return {
      status,
      photos: dayPhotos,
      rtStatus: combinedRtStatus,
      hasPhotos,
      hasRt,
    };
  };

  // 통계 계산
  const weekStats = useMemo(() => {
    let totalCells = 0;
    let submittedCells = 0;
    let missedCells = 0;

    (students || []).forEach((student: any) => {
      weekDays.forEach((day) => {
        const cell = getCellData(student.id, day, student.created_at);
        if (
          cell.status === "submitted" ||
          cell.status === "missed" ||
          cell.status === "partial"
        ) {
          totalCells++;
          if (cell.status === "submitted") submittedCells++;
          if (cell.status === "missed") missedCells++;
        }
      });
    });

    return {
      total: totalCells,
      submitted: submittedCells,
      missed: missedCells,
      rate: totalCells > 0 ? Math.round((submittedCells / totalCells) * 100) : 0,
    };
  }, [students, weekDays, photoSubmissions, rtHomework, rtSubmissions, dismissedSet]);

  const handleViewPhotos = (photos: any[], studentName: string, dayStr: string, assignmentType?: string) => {
    const filtered = assignmentType 
      ? photos.filter((p: any) => (p.assignment_type || "사진(단어)") === assignmentType)
      : photos;
    const allUrls = filtered.flatMap((p: any) => p.photo_urls || []);
    if (allUrls.length === 0) return;
    const sub = filtered[0];
    setPhotoDialog({
      open: true,
      urls: allUrls,
      studentName,
      date: format(new Date(dayStr + "T00:00:00"), "M월 d일 (EEE)", {
        locale: ko,
      }),
      type: assignmentType || sub?.assignment_type || "사진과제",
      submissionId: sub?.id,
      teacherNote: sub?.teacher_note || "",
      status: sub?.status,
    });
    setFeedbackText(sub?.teacher_note || "");
  };

  const handleViewRt = (rtInfo: any, studentName: string, studentId: string) => {
    if (!rtInfo.submitted) return;
    // Find the full submission data from both regular and early submissions
    const sub = rtSubmissions.find((s: any) => s.id === rtInfo.submissionId)
      || earlyRtSubmissions.find((s: any) => s.id === rtInfo.submissionId);
    // Find the homework to get passage_id
    const hw = [...rtHomework, ...earlyRtHomework].find((h: any) => h.id === rtInfo.hwId);
    setRtDialog({
      open: true,
      submission: sub ? { ...sub, recording_timestamps: sub.recording_timestamps } : { ...rtInfo },
      studentName,
      studentId,
      homeworkId: rtInfo.hwId,
      homeworkTitle: rtInfo.title,
      passageId: hw?.passage_id || undefined,
    });
  };

  const queryClient = useQueryClient();

  // 실시간 동기화: 제출/확인처리 즉시 반영
  useEffect(() => {
    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ["week-photo-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["week-rt-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["week-early-rt-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["week-rt-homework"] });
      queryClient.invalidateQueries({ queryKey: ["week-deadline-extensions"] });
    };

    const channel = supabase
      .channel("photo-assignments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_word_submissions" }, invalidateAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions" }, invalidateAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework" }, invalidateAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "writing_submissions" }, invalidateAll)
      
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const photoFeedbackMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { error } = await supabase
        .from("daily_word_submissions")
        .update({ teacher_note: note, reviewed_at: new Date().toISOString(), status: "completed" })
        .eq("id", id);
      if (error) throw error;

      // Fire-and-forget: 백엔드에서 파일 삭제 처리
      supabase.functions.invoke("cleanup-submission-files", {
        body: { type: "photo", submissionId: id },
      }).catch((err) => console.error("Cleanup failed:", err));
    },
    onMutate: () => {
      // 낙관적 UI: 즉시 다이얼로그 닫고 토스트 표시
      toast.success("피드백이 저장되었습니다.");
      setPhotoDialog((prev) => ({ ...prev, open: false }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["week-photo-submissions"] });
    },
    onError: () => {
      toast.error("피드백 저장에 실패했습니다.");
    },
  });


  // 모든과제 확인처리 - 미리보기 팝업 열기
  const handleBulkConfirm = (group: typeof groupedStudents[0]) => {
    if (bulkProcessingSchool) return;
    const allStudents = group.students;
    const preview: typeof bulkConfirmDialog.preview = [];

    for (const student of allStudents) {
      const unreviewedPhotos = photoSubmissions.filter(
        (s: any) => s.student_id === student.id && s.status !== "completed" && !s.reviewed_at
      );
      const unreviewedRt = rtSubmissions.filter(
        (s: any) => s.student_id === student.id && s.status !== "completed" && !s.reviewed_at && s.submitted_at
      );
      if (unreviewedPhotos.length > 0 || unreviewedRt.length > 0) {
        preview.push({
          studentName: student.name,
          photoCount: unreviewedPhotos.length,
          rtCount: unreviewedRt.length,
          photoMsg: unreviewedPhotos.length > 0 ? `${student.name}학생의 사진 과제 확인 완료♥` : "",
          rtMsg: unreviewedRt.length > 0 ? `${student.name}학생의 녹음 과제 확인 완료♥` : "",
        });
      }
    }

    if (preview.length === 0) {
      toast.info("확인 처리할 미검토 과제가 없습니다.");
      return;
    }

    setBulkConfirmDialog({ open: true, school: group, messageType: "sms", extraMessage: "", preview });
  };

  // 실제 일괄 확인 실행
  const executeBulkConfirm = async () => {
    const group = bulkConfirmDialog.school;
    if (!group) return;
    const messageType = bulkConfirmDialog.messageType;
    const extraMsg = bulkConfirmDialog.extraMessage.trim();
    const previewCount = bulkConfirmDialog.preview.length;
    setBulkConfirmDialog(prev => ({ ...prev, open: false }));

    // 낙관적 UI: 즉시 토스트 표시
    toast.success(`${group.groupName} - ${previewCount}명의 과제를 확인 처리하고 ${messageType === "kakao" ? "카톡" : "문자"}을 발송합니다.`);
    setBulkProcessingSchool(group.groupId);

    // 백그라운드에서 실제 처리
    (async () => {
      try {
        const templates = await getMessageTemplates(session?.accessCodeId);
        const now = new Date().toISOString();
        const allStudents = group.students;
        const studentsWithPhotoReview: Set<string> = new Set();
        const studentsWithRtReview: Set<string> = new Set();

        for (const student of allStudents) {
          const unreviewedPhotos = photoSubmissions.filter(
            (s: any) => s.student_id === student.id && s.status !== "completed" && !s.reviewed_at
          );
          if (unreviewedPhotos.length > 0) {
            const ids = unreviewedPhotos.map((p: any) => p.id);
            const { error } = await supabase
              .from("daily_word_submissions")
              .update({ status: "completed", reviewed_at: now, teacher_note: `${student.name}학생의 사진 과제 확인 완료♥${extraMsg ? `\n${extraMsg}` : ""}` })
              .in("id", ids);
            if (error) console.error("Photo bulk update error:", error);
            else {
              studentsWithPhotoReview.add(student.id);
              for (const p of unreviewedPhotos) {
                supabase.functions.invoke("cleanup-submission-files", {
                  body: { type: "photo", submissionId: p.id },
                }).catch((err) => console.error("Cleanup failed:", err));
              }
            }
          }
        }

        for (const student of allStudents) {
          const unreviewedRt = rtSubmissions.filter(
            (s: any) => s.student_id === student.id && s.status !== "completed" && !s.reviewed_at && s.submitted_at
          );
          if (unreviewedRt.length > 0) {
            const ids = unreviewedRt.map((r: any) => r.id);
            const { error } = await supabase
              .from("homework_submissions")
              .update({ status: "completed", reviewed_at: now, teacher_note: `${student.name}학생의 녹음 과제 확인 완료♥${extraMsg ? `\n${extraMsg}` : ""}` })
              .in("id", ids);
            if (error) console.error("RT bulk update error:", error);
            else {
              studentsWithRtReview.add(student.id);
              // 녹음 파일은 3개월 후 자동 삭제 (즉시 삭제하지 않음)
            }
          }
        }

        const studentMap = new Map(allStudents.map((s: any) => [s.id, s]));

        for (const studentId of studentsWithPhotoReview) {
          const student = studentMap.get(studentId) as any;
          if (!student) continue;
          supabase.functions.invoke("send-kakao-notification", {
            body: {
              studentId: student.id,
              studentName: student.name,
              submissionType: "daily_word",
              customMessage: `${student.name}학생의 사진 과제 확인 완료♥${extraMsg ? `\n${extraMsg}` : ""}`,
              brandPrefix: templates.brandPrefix,
              messageType: messageType === "kakao" ? "kakao" : "sms",
              recipientType: "student",
              ownerCodeId: session?.accessCodeId,
            },
          }).catch((err) => console.error("Photo notification failed:", err));
        }

        for (const studentId of studentsWithRtReview) {
          const student = studentMap.get(studentId) as any;
          if (!student) continue;
          supabase.functions.invoke("send-kakao-notification", {
            body: {
              studentId: student.id,
              studentName: student.name,
              submissionType: "review",
              customMessage: `${student.name}학생의 녹음 과제 확인 완료♥${extraMsg ? `\n${extraMsg}` : ""}`,
              brandPrefix: templates.brandPrefix,
              messageType: messageType === "kakao" ? "kakao" : "sms",
              recipientType: "student",
              ownerCodeId: session?.accessCodeId,
            },
          }).catch((err) => console.error("RT notification failed:", err));
        }

        queryClient.invalidateQueries({ queryKey: ["week-photo-submissions"] });
        queryClient.invalidateQueries({ queryKey: ["week-rt-submissions"] });
      } catch (error) {
        console.error("Bulk confirm error:", error);
        toast.error("일괄 확인 처리 중 오류가 발생했습니다.");
      } finally {
        setBulkProcessingSchool(null);
      }
    })();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        icon={ClipboardCheck}
        title="과제 현황"
        description="학교별, 학년별, 학생별로 사진과제 및 녹음과제 제출 현황을 한눈에 확인합니다."
      />

      {/* 네비게이션 + 필터 */}
      <div className="bg-muted/30 rounded-xl border p-4 space-y-3">
        {/* 모드 토글 + 네비게이션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 주/월 토글 */}
            <div className="flex items-center bg-primary/10 rounded-xl p-1 border border-primary/20 shadow-sm">
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  viewMode === "week" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-primary/60 hover:text-primary hover:bg-primary/10"
                )}
              >
                이번 주
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  viewMode === "month" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-primary/60 hover:text-primary hover:bg-primary/10"
                )}
              >
                이번 달
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground ml-1">주/월 단위로 전환하여 확인</p>

            <div className="w-px h-5 bg-border mx-1" />

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (viewMode === "week") setCurrentWeekStart(subWeeks(currentWeekStart, 1));
                else setCurrentMonth(subMonths(currentMonth, 1));
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm">{dateLabel}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (viewMode === "week") setCurrentWeekStart(addWeeks(currentWeekStart, 1));
                else setCurrentMonth(addMonths(currentMonth, 1));
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                if (viewMode === "week") setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
                else setCurrentMonth(new Date());
              }}
            >
              {viewMode === "week" ? "이번 주" : "이번 달"}
            </Button>
          </div>

          {/* 통계 */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {weekStats.rate}%
              </span>
            </div>
            <span className="text-muted-foreground">
              제출 {weekStats.submitted} · 미제출 {weekStats.missed}
            </span>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            필터
          </div>
          <Select
            value={selectedGroup}
            onValueChange={(v) => {
              setSelectedGroup(v);
              setSelectedStudent("all");
            }}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="그룹" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 그룹</SelectItem>
              {allTags.map((tag: any) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSchool}
            onValueChange={(v) => {
              setSelectedSchool(v);
              setSelectedGrade("all");
              setSelectedStudent("all");
            }}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="학교" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학교</SelectItem>
              {schools.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학년</SelectItem>
              {grades.map((g: any) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="학생" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학생</SelectItem>
              {allFilteredStudents.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 과제 유형 범례 */}
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
              <span>일일단어</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
              <span>단어재시험</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
              <span>복습노트</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-stone-500" />
              <span>모의고사</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-neutral-500" />
              <Mic className="w-2.5 h-2.5" />
              <span>녹음과제</span>
            </div>
            <div className="w-px h-3 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-pink-200 border border-pink-300" />
              <span>단어 미제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300" />
              <span>제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
              <span>확인완료</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
              <span>다짐Talk</span>
            </div>
          </div>
        </div>
      </div>

      {/* 매트릭스 테이블 */}
      {groupedStudents.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            등록된 학생이 없습니다.
          </p>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="space-y-4">
            {groupedStudents.map((group) => (
              <div
                key={group.groupId}
                className="bg-card rounded-xl border-2 border-border shadow-sm overflow-hidden"
              >
                {/* 그룹 헤더 */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/10 border-b-2 border-border">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.groupColor }}
                  />
                  <span className="font-bold text-sm text-primary">{group.groupName}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{group.students.length}명</span>
                  <div className="ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] gap-1 bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      onClick={() => handleBulkConfirm(group)}
                      disabled={bulkProcessingSchool === group.groupId}
                    >
                      {bulkProcessingSchool === group.groupId ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> 처리 중...</>
                      ) : (
                        <><CheckCheck className="w-3 h-3" /> 모든과제 확인처리</>
                      )}
                    </Button>
                    <p className="text-[9px] text-muted-foreground mt-0.5">※ 녹음과제는 개별 확인 필요</p>
                  </div>
                </div>

                {/* 테이블 - 그룹 내 학생 직접 표시 (학년 구분 없음) */}
                <ScrollArea className="w-full">
                      {viewMode === "week" ? (
                      /* ========== 주간 모드 ========== */
                      <div className="min-w-[1200px]">
                        {/* 헤더 */}
                         <div style={{ display: "grid", gridTemplateColumns: `160px repeat(7, 1fr)` }} className="border-b-2 border-foreground/20 bg-muted/40">
                          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground flex items-end border-r-2 border-foreground/20">
                            {format(currentWeekStart, "M월", { locale: ko })} {Math.ceil(currentWeekStart.getDate() / 7)}주차
                          </div>
                          {weekDays.map((day) => (
                            <div key={day.toISOString()} className="border-r-2 border-foreground/15 last:border-r-0">
                              <div className={cn(
                                "px-0.5 py-1 text-center text-[9px] font-semibold border-b-2 border-foreground/15 whitespace-nowrap",
                                isToday(day) ? "text-violet-600 font-bold bg-violet-100" :
                                getDay(day) === 6 ? "text-blue-600 font-bold" :
                                getDay(day) === 0 ? "text-red-500 font-bold" :
                                "text-muted-foreground"
                              )}>
                                {format(day, "M/d")}({format(day, "EEE", { locale: ko })})
                              </div>
                              <div className="grid grid-cols-5 divide-x divide-foreground/10">
                                {ASSIGNMENT_TYPES.map((at) => (
                                  <div key={at.key} className={cn(
                                    "text-center py-0.5 text-[7px] font-bold",
                                    at.textColor, at.headerBg
                                  )}>
                                    {at.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 학생 행 */}
                        {group.students.map((student: any, idx: number) => (
                          <div
                            key={student.id}
                            style={{ display: "grid", gridTemplateColumns: `160px repeat(7, 1fr)` }}
                             className={cn(
                              idx < group.students.length - 1 ? "border-b border-foreground/10" : "",
                              idx % 2 === 0 ? "bg-background" : "bg-muted/15"
                            )}
                          >
                            <div className="px-2 py-1.5 text-[10px] font-semibold border-r-2 border-foreground/20 flex items-center gap-0.5 bg-muted/40">
                              <span className="flex items-center gap-0.5 flex-1 whitespace-nowrap">
                                {student.grade?.school?.logo_url && (
                                  <img src={student.grade.school.logo_url} alt="" className="w-3 h-3 rounded-full object-cover flex-shrink-0" />
                                )}
                                <span className="text-[7px] opacity-50">{(() => { const n = student.grade?.school?.name || ""; const i = n.indexOf("고"); return i >= 0 ? n.slice(0, i + 1) : n.slice(0, 4); })()}</span>
                                <span className="text-[7px] opacity-40">{student.grade?.name}</span>
                                <span>{student.name}</span>
                              </span>
                              <button
                                onClick={() => setQuickSmsStudent(student)}
                                className="shrink-0 hover:opacity-70 transition-opacity"
                                title="문자 보내기"
                              >
                                <MessageSquare className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                              </button>
                              <button
                                onClick={() => setQuickKakaoStudent(student)}
                                className="shrink-0 hover:opacity-70 transition-opacity"
                                title="카톡 보내기"
                              >
                                <MessageCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                              </button>
                            </div>

                            {weekDays.map((day) => {
                              const dayStr = format(day, "yyyy-MM-dd");
                              const cell = getCellData(student.id, day, student.created_at);
                              const isInactive = cell.status === "future" || cell.status === "no-assignment" || cell.status === "dismissed";
                              const photosByType = (type: string) =>
                                (cell.photos || []).filter((p: any) => (p.assignment_type || "사진(단어)") === type);
                              const hasAnyRt = cell.rtStatus && cell.rtStatus.length > 0;
                              const anyRtSubmitted = hasAnyRt && cell.rtStatus!.some((r: any) => r.submitted);

                              return (
                                <div key={dayStr} className="grid grid-cols-5 divide-x divide-foreground/10 border-r-2 border-foreground/15 last:border-r-0">
                                  {ASSIGNMENT_TYPES.slice(0, 4).map((at) => {
                                    const photos = photosByType(at.key);
                                    const hasSubmitted = photos.length > 0;
                                    const isReviewed = photos.some((p: any) => p.status === "completed");
                                    const hasCommit = at.key === "사진(단어)" && !hasSubmitted && commitSet.has(`${student.id}-${dayStr}`);
                                    return (
                                      <Tooltip key={at.key}>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => { if (hasSubmitted) handleViewPhotos(cell.photos!, student.name, dayStr, at.key); }}
                                            disabled={isInactive}
                                            className={cn(
                                              "h-7 flex items-center justify-center transition-all",
                                              isInactive ? "bg-muted/20"
                                                : hasSubmitted
                                                  ? isReviewed
                                                    ? "bg-emerald-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-emerald-400/40"
                                                    : "bg-amber-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-amber-400/40"
                                                  : hasCommit
                                                    ? "bg-rose-50 hover:bg-rose-100"
                                                    : at.key === "사진(단어)"
                                                      ? "bg-pink-100 hover:bg-pink-50"
                                                      : "hover:bg-muted/30"
                                            )}
                                          >
                                            {isInactive ? <Minus className="w-2 h-2 text-muted-foreground/20" />
                                              : hasSubmitted ? <CheckCircle2 className={cn("w-3 h-3", isReviewed ? "text-emerald-600" : "text-amber-500")} />
                                              : hasCommit
                                                ? <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                                                : at.key === "사진(단어)"
                                                  ? <XCircle className="w-3 h-3 text-pink-400" />
                                                  : <XCircle className="w-3 h-3 text-muted-foreground/20" />}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[10px]">
                                          {isInactive ? "해당없음" : hasSubmitted
                                            ? `${at.label} ✅ 제출${isReviewed ? " (확인완료)" : ""}`
                                            : hasCommit
                                              ? `${at.label} ❤️ 다짐Talk 제출`
                                              : `${at.label} ❌ 미제출`}
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                  {/* 녹음과제 */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => {
                                          if (anyRtSubmitted && cell.rtStatus) {
                                            const submitted = cell.rtStatus.find((r: any) => r.submitted);
                                            if (submitted) handleViewRt(submitted, student.name, student.id);
                                          }
                                        }}
                                        disabled={isInactive}
                                        className={cn(
                                          "h-7 flex items-center justify-center transition-all",
                                          isInactive ? "bg-muted/20"
                                            : anyRtSubmitted
                                              ? cell.rtStatus!.some((r: any) => r.reviewed)
                                                ? "bg-emerald-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-emerald-400/40"
                                                : "bg-amber-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-amber-400/40"
                                              : "hover:bg-muted/30"
                                        )}
                                      >
                                        {isInactive ? <Minus className="w-2 h-2 text-muted-foreground/20" />
                                          : anyRtSubmitted ? <Mic className={cn("w-3 h-3", cell.rtStatus!.some((r: any) => r.reviewed) ? "text-emerald-600" : "text-amber-500")} />
                                          : hasAnyRt ? <XCircle className="w-3 h-3 text-muted-foreground/20" />
                                          : <Minus className="w-2 h-2 text-muted-foreground/15" />}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[10px]">
                                      {isInactive ? "해당없음" : anyRtSubmitted
                                        ? "녹음 ✅ 제출"
                                        : hasAnyRt ? "녹음 ❌ 미제출" : "녹음과제 없음"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      ) : (
                      /* ========== 월간 모드 (학생별 모든 주차 통합) ========== */
                      <div className="min-w-[1200px]">
                        {group.students.map((student: any, studentIdx: number) => (
                          <div key={student.id} className={studentIdx > 0 ? "border-t-4 border-foreground/20" : ""}>
                            <div className="px-3 py-1.5 bg-muted/60 border-b border-foreground/10 flex items-center gap-2 sticky top-0 z-10">
                              <span className="flex items-center gap-1 text-[11px] font-bold">
                                {student.grade?.school?.logo_url && (
                                  <img src={student.grade.school.logo_url} alt="" className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0" />
                                )}
                                <span className="text-[9px] opacity-50">{student.grade?.school?.name?.slice(0, 2)}</span>
                                <span className="text-[9px] opacity-40">{student.grade?.name}</span>
                                <span>{student.name}</span>
                              </span>
                              <div className="flex items-center gap-1 ml-auto">
                                <button onClick={() => setQuickSmsStudent(student)} className="shrink-0 hover:opacity-70 transition-opacity" title="문자 보내기">
                                  <MessageSquare className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                                </button>
                                <button onClick={() => setQuickKakaoStudent(student)} className="shrink-0 hover:opacity-70 transition-opacity" title="카톡 보내기">
                                  <MessageCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                                </button>
                              </div>
                            </div>
                            {monthWeeks.map((week, weekIdx) => {
                              const validDays = week.filter((d): d is Date => d !== null);
                              if (validDays.length === 0) return null;
                              return (
                                <div key={weekIdx} className={weekIdx > 0 ? "border-t border-foreground/10" : ""}>
                                  <div style={{ display: "grid", gridTemplateColumns: `80px repeat(7, 1fr)` }} className="border-b border-foreground/15 bg-muted/30">
                                    <div className="px-2 py-1 text-[9px] font-bold text-primary flex items-end border-r-2 border-foreground/20">
                                      {weekIdx + 1}주차
                                    </div>
                                    {week.map((day, dayIdx) => (
                                      <div key={dayIdx} className="border-r border-foreground/10 last:border-r-0">
                                        {day ? (
                                          <>
                                            <div className={cn(
                                              "px-0.5 py-0.5 text-center text-[10px] font-bold border-b border-foreground/10 whitespace-nowrap",
                                              isToday(day) ? "text-violet-600 font-bold bg-violet-100" :
                                              getDay(day) === 6 ? "text-blue-600 font-bold" :
                                              getDay(day) === 0 ? "text-red-500 font-bold" :
                                              "text-muted-foreground"
                                            )}>
                                              {format(day, "M/d")}({format(day, "EEE", { locale: ko })})
                                            </div>
                                            <div className="grid grid-cols-5 divide-x divide-foreground/10">
                                              {ASSIGNMENT_TYPES.map((at) => (
                                                <div key={at.key} className={cn("text-center py-0.5 text-[7px] font-bold", at.textColor, at.headerBg)}>
                                                  {at.label}
                                                </div>
                                              ))}
                                            </div>
                                          </>
                                        ) : (
                                          <div className="px-0.5 py-0.5 text-center text-[9px] text-muted-foreground/30 border-b border-foreground/10">-</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: `80px repeat(7, 1fr)` }} className="bg-background">
                                    <div className="px-2 py-1 text-[9px] text-muted-foreground border-r-2 border-foreground/20 flex items-center bg-muted/20">
                                      {format(validDays[0], "M/d")}~{format(validDays[validDays.length - 1], "M/d")}
                                    </div>
                                    {week.map((day, dayIdx) => {
                                      if (!day) return <div key={`empty-${dayIdx}`} className="h-7 border-r border-foreground/10 last:border-r-0 bg-muted/10" />;
                                      const dayStr = format(day, "yyyy-MM-dd");
                                      const cell = getCellData(student.id, day, student.created_at);
                                      const isInactive = cell.status === "future" || cell.status === "no-assignment" || cell.status === "dismissed";
                                      const photosByType = (type: string) => (cell.photos || []).filter((p: any) => (p.assignment_type || "사진(단어)") === type);
                                      const hasAnyRt = cell.rtStatus && cell.rtStatus.length > 0;
                                      const anyRtSubmitted = hasAnyRt && cell.rtStatus!.some((r: any) => r.submitted);
                                      return (
                                        <div key={dayStr} className="grid grid-cols-5 divide-x divide-foreground/10 border-r border-foreground/10 last:border-r-0">
                                          {ASSIGNMENT_TYPES.slice(0, 4).map((at) => {
                                            const photos = photosByType(at.key);
                                            const hasSubmitted = photos.length > 0;
                                            const isReviewed = photos.some((p: any) => p.status === "completed");
                                            return (
                                              <Tooltip key={at.key}>
                                                <TooltipTrigger asChild>
                                                  <button
                                                    onClick={() => { if (hasSubmitted) handleViewPhotos(cell.photos!, student.name, dayStr, at.key); }}
                                                    disabled={isInactive}
                                                    className={cn(
                                                      "h-7 flex items-center justify-center transition-all",
                                                      isInactive ? "bg-muted/20"
                                                        : hasSubmitted
                                                          ? isReviewed ? "bg-emerald-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-emerald-400/40"
                                                            : "bg-amber-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-amber-400/40"
                                                          : at.key === "사진(단어)" ? "bg-pink-100 hover:bg-pink-50" : "hover:bg-muted/30"
                                                    )}
                                                  >
                                                    {isInactive ? <Minus className="w-2 h-2 text-muted-foreground/20" />
                                                      : hasSubmitted ? <CheckCircle2 className={cn("w-3 h-3", isReviewed ? "text-emerald-600" : "text-amber-500")} />
                                                      : at.key === "사진(단어)" ? <XCircle className="w-3 h-3 text-pink-400" /> : <XCircle className="w-3 h-3 text-muted-foreground/20" />}
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-[10px]">
                                                  {isInactive ? "해당없음" : hasSubmitted ? `${at.label} ✅ 제출${isReviewed ? " (확인완료)" : ""}` : `${at.label} ❌ 미제출`}
                                                </TooltipContent>
                                              </Tooltip>
                                            );
                                          })}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() => {
                                                  if (anyRtSubmitted && cell.rtStatus) {
                                                    const submitted = cell.rtStatus.find((r: any) => r.submitted);
                                                    if (submitted) handleViewRt(submitted, student.name, student.id);
                                                  }
                                                }}
                                                disabled={isInactive}
                                                className={cn(
                                                  "h-7 flex items-center justify-center transition-all",
                                                  isInactive ? "bg-muted/20"
                                                    : anyRtSubmitted
                                                      ? cell.rtStatus!.some((r: any) => r.reviewed) ? "bg-emerald-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-emerald-400/40"
                                                        : "bg-amber-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-amber-400/40"
                                                      : "hover:bg-muted/30"
                                                )}
                                              >
                                                {isInactive ? <Minus className="w-2 h-2 text-muted-foreground/20" />
                                                  : anyRtSubmitted ? <Mic className={cn("w-3 h-3", cell.rtStatus!.some((r: any) => r.reviewed) ? "text-emerald-600" : "text-amber-500")} />
                                                  : hasAnyRt ? <XCircle className="w-3 h-3 text-muted-foreground/20" /> : <Minus className="w-2 h-2 text-muted-foreground/15" />}
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px]">
                                              {isInactive ? "해당없음" : anyRtSubmitted ? "녹음 ✅ 제출" : hasAnyRt ? "녹음 ❌ 미제출" : "녹음과제 없음"}
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      )}
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
              </div>
            ))}
          </div>
        </TooltipProvider>
      )}

      {/* 사진 과제 상세 + 피드백 다이얼로그 */}
      <Dialog
        open={photoDialog.open}
        onOpenChange={(v) => setPhotoDialog((prev) => ({ ...prev, open: v }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-primary" />
              {photoDialog.studentName} · {photoDialog.date} · {photoDialog.type}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
            {photoDialog.urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`사진 ${index + 1}`}
                className="w-full rounded-xl cursor-zoom-in hover:opacity-80 transition-opacity"
                onClick={() => { setZoomIndex(index); setZoomOpen(true); }}
              />
            ))}
          </div>
          {photoDialog.submissionId && (
            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-semibold text-muted-foreground">💬 피드백</label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="피드백을 입력하세요..."
                className="text-sm min-h-[60px]"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    if (photoDialog.submissionId) {
                      photoFeedbackMutation.mutate({ id: photoDialog.submissionId, note: feedbackText });
                    }
                  }}
                  disabled={photoFeedbackMutation.isPending}
                >
                  {photoFeedbackMutation.isPending ? "저장 중..." : "피드백 저장"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 녹음 과제 상세 + 피드백 다이얼로그 */}
      <RTRecordingPlayerDialog
        open={rtDialog.open}
        onOpenChange={(v) => setRtDialog((prev) => ({ ...prev, open: v }))}
        studentName={rtDialog.studentName}
        studentId={rtDialog.studentId}
        homeworkId={rtDialog.homeworkId}
        homeworkTitle={rtDialog.homeworkTitle}
        passageId={rtDialog.passageId}
        submission={rtDialog.submission}
      />

      <ImageZoomDialog
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        images={photoDialog.urls}
        initialIndex={zoomIndex}
      />
      {quickSmsStudent && (
        <QuickMessageDialog
          open={!!quickSmsStudent}
          onOpenChange={(open) => !open && setQuickSmsStudent(null)}
          studentId={quickSmsStudent.id}
          studentName={quickSmsStudent.name}
          studentPhone={quickSmsStudent.student_phone}
          parentPhone={quickSmsStudent.parent_phone}
        />
      )}

      {quickKakaoStudent && (
        <QuickKakaoDialog
          open={!!quickKakaoStudent}
          onOpenChange={(open) => !open && setQuickKakaoStudent(null)}
          studentId={quickKakaoStudent.id}
          studentName={quickKakaoStudent.name}
          studentPhone={quickKakaoStudent.student_phone}
          parentPhone={quickKakaoStudent.parent_phone}
        />
      )}

      {/* 일괄 확인처리 미리보기 다이얼로그 */}
      <Dialog
        open={bulkConfirmDialog.open}
        onOpenChange={(v) => setBulkConfirmDialog(prev => ({ ...prev, open: v }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              {bulkConfirmDialog.school?.schoolName} — 모든과제 확인처리
            </DialogTitle>
          </DialogHeader>

          {/* 발송 방법 선택 */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground">📨 알림 발송 방법</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBulkConfirmDialog(prev => ({ ...prev, messageType: "sms" }))}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium",
                  bulkConfirmDialog.messageType === "sms"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                문자 (SMS)
              </button>
              <button
                onClick={() => setBulkConfirmDialog(prev => ({ ...prev, messageType: "kakao" }))}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium",
                  bulkConfirmDialog.messageType === "kakao"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-yellow-400/60"
                )}
              >
                <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                카카오톡
              </button>
            </div>
          </div>

          {/* 추가 멘트 입력 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">✏️ 추가 멘트 (선택)</label>
            <textarea
              value={bulkConfirmDialog.extraMessage}
              onChange={(e) => setBulkConfirmDialog(prev => ({ ...prev, extraMessage: e.target.value }))}
              placeholder="기본 멘트 뒤에 추가할 내용을 입력하세요"
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={2}
            />
          </div>

          {/* 메시지 미리보기 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">💬 발송될 메시지 미리보기</label>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 pr-2">
                {bulkConfirmDialog.preview.map((item, idx) => (
                  <div key={idx} className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
                    <div className="text-xs font-bold text-foreground">{item.studentName}</div>
                    {item.photoMsg && (
                      <div className="flex items-start gap-2">
                        <Camera className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {item.photoMsg}{bulkConfirmDialog.extraMessage.trim() && <><br /><span className="text-primary/70">{bulkConfirmDialog.extraMessage.trim()}</span></>}
                          <Badge variant="secondary" className="ml-1.5 text-[9px] px-1.5 py-0">
                            사진 {item.photoCount}건
                          </Badge>
                        </span>
                      </div>
                    )}
                    {item.rtMsg && (
                      <div className="flex items-start gap-2">
                        <Mic className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {item.rtMsg}{bulkConfirmDialog.extraMessage.trim() && <><br /><span className="text-primary/70">{bulkConfirmDialog.extraMessage.trim()}</span></>}
                          <Badge variant="secondary" className="ml-1.5 text-[9px] px-1.5 py-0">
                            녹음 {item.rtCount}건
                          </Badge>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 요약 & 실행 */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              총 <strong>{bulkConfirmDialog.preview.length}명</strong>에게{" "}
              {bulkConfirmDialog.messageType === "kakao" ? "카톡" : "문자"} 발송
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkConfirmDialog(prev => ({ ...prev, open: false }))}
              >
                취소
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={executeBulkConfirm}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                확인처리 및 발송
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
