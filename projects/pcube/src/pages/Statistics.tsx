import { useState, useMemo } from "react";
import { getGradeFromScore } from "@/components/schools/MockExamScoreSheet";
import { BarChart3, Download, TrendingUp, TrendingDown, Users, Target, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import StudentDetailDialog from "@/components/statistics/StudentDetailDialog";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { PageHeader } from "@/components/layout/PageHeader";
import { getKSTNow, getKSTDateString, toKST } from "@/utils/koreanTime";

interface StudentStat {
  id: string;
  name: string;
  school: string;
  grade: string;
  rate: number;
  submissionCount: number;
  missedCount: number;
  schoolLogoUrl?: string;
  groups?: string[];
}

function StudentSearchCard({
  allStudentStats,
  isLoading,
  onStudentClick,
}: {
  allStudentStats: StudentStat[];
  isLoading: boolean;
  onStudentClick: (student: StudentStat) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const groups = useMemo(() => {
    const set = new Set(allStudentStats.flatMap(s => s.groups || []));
    return Array.from(set).sort();
  }, [allStudentStats]);

  const schools = useMemo(() => {
    const filtered = selectedGroup === "all" ? allStudentStats : allStudentStats.filter(s => s.groups?.includes(selectedGroup));
    const set = new Set(filtered.map(s => s.school));
    return Array.from(set).sort();
  }, [allStudentStats, selectedGroup]);

  const grades = useMemo(() => {
    let filtered = allStudentStats;
    if (selectedGroup !== "all") filtered = filtered.filter(s => s.groups?.includes(selectedGroup));
    if (selectedSchool !== "all") filtered = filtered.filter(s => s.school === selectedSchool);
    const set = new Set(filtered.map(s => s.grade));
    return Array.from(set).sort();
  }, [allStudentStats, selectedGroup, selectedSchool]);

  const filteredStudents = useMemo(() => {
    return allStudentStats
      .filter(s => {
        if (searchQuery && !s.name.includes(searchQuery)) return false;
        if (selectedGroup !== "all" && !(s.groups || []).includes(selectedGroup)) return false;
        if (selectedSchool !== "all" && s.school !== selectedSchool) return false;
        if (selectedGrade !== "all" && s.grade !== selectedGrade) return false;
        return true;
      })
      .sort((a, b) => b.rate - a.rate);
  }, [allStudentStats, searchQuery, selectedGroup, selectedSchool, selectedGrade]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // Reset page when filters change
  const handleGroupChange = (v: string) => { setSelectedGroup(v); setSelectedSchool("all"); setSelectedGrade("all"); setCurrentPage(1); };
  const handleSchoolChange = (v: string) => { setSelectedSchool(v); setSelectedGrade("all"); setCurrentPage(1); };
  const handleGradeChange = (v: string) => { setSelectedGrade(v); setCurrentPage(1); };
  const handleSearchChange = (v: string) => { setSearchQuery(v); setCurrentPage(1); };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          학생 리포트
        </CardTitle>
        <CardDescription className="text-xs">이름 검색 또는 학교/학년 선택</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 검색 입력 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="학생 이름 검색..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={handleGroupChange}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="그룹" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 그룹</SelectItem>
              {groups.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSchool} onValueChange={handleSchoolChange}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="학교" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학교</SelectItem>
              {schools.map(s => (
                <SelectItem key={s} value={s}>{s.replace("고등학교", "고").replace("중학교", "중")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedGrade} onValueChange={handleGradeChange}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학년</SelectItem>
              {grades.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 결과 목록 */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length > 0 ? (
          <>
            <div className="space-y-0.5">
              {paginatedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onStudentClick(student)}
                >
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {student.school.replace("고등학교", "고").replace("중학교", "중")} · {student.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${student.rate >= 80 ? "text-emerald-600" : student.rate >= 50 ? "text-amber-600" : "text-destructive"}`}>
                      {student.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">검색 결과가 없습니다</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-right">
          {filteredStudents.length}명 · 클릭하여 상세 보기
        </p>
      </CardContent>
    </Card>
  );
}

export default function Statistics() {
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    school: string;
    grade: string;
    rate: number;
    schoolLogoUrl?: string;
  } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { ownerCodeId, isAdmin, shouldFilter } = useOwnerFilter();

  const today = getKSTNow();
  const todayStr = getKSTDateString();
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfMonthStr = getKSTDateString(startOfMonth);

  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - diff);
  const startOfWeekStr = getKSTDateString(startOfWeek);

  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(startOfWeek);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStartStr = getKSTDateString(lastWeekStart);
  const lastWeekEndStr = getKSTDateString(lastWeekEnd);

  // Helper: 소유자 필터가 적용된 학교 ID 목록
  const { data: ownerSchoolIds } = useQuery({
    queryKey: ["owner-school-ids", ownerCodeId],
    enabled: shouldFilter,
    queryFn: async () => {
      const { data } = await supabase
        .from("schools")
        .select("id")
        .eq("owner_code_id", ownerCodeId!);
      return data?.map((s) => s.id) || [];
    },
  });

  // Helper: 소유자 필터가 적용된 학생 ID 목록
  const { data: ownerStudentIds } = useQuery({
    queryKey: ["owner-student-ids-stats", ownerSchoolIds],
    enabled: shouldFilter && !!ownerSchoolIds,
    queryFn: async () => {
      if (!ownerSchoolIds || ownerSchoolIds.length === 0) return [];
      const { data: grades } = await supabase
        .from("grades")
        .select("id")
        .in("school_id", ownerSchoolIds);
      const gradeIds = grades?.map((g) => g.id) || [];
      if (gradeIds.length === 0) return [];
      const { data: students } = await supabase
        .from("students")
        .select("id")
        .in("grade_id", gradeIds);
      return students?.map((s) => s.id) || [];
    },
  });

  const studentIdsReady = !shouldFilter || !!ownerStudentIds;
  const effectiveStudentIds = shouldFilter ? (ownerStudentIds || []) : null;

  // 전체 학생 수 조회
  const { data: totalStudentCount = 0 } = useQuery({
    queryKey: ["total-students-count", effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      if (effectiveStudentIds !== null) return effectiveStudentIds.length;
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // 오늘 완료율 및 제출 통계
  const { data: todayStats, isLoading: isLoadingTodayStats } = useQuery({
    queryKey: ["today-stats", todayStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      let totalStudents: number;
      let todaySubmissions: number;

      if (effectiveStudentIds !== null) {
        totalStudents = effectiveStudentIds.length;
        if (totalStudents === 0) return { todaySubmissions: 0, totalStudents: 0, rate: 0 };
        const { count } = await supabase
          .from("daily_word_submissions")
          .select("*", { count: "exact", head: true })
          .eq("submission_date", todayStr)
          .in("student_id", effectiveStudentIds);
        todaySubmissions = count || 0;
      } else {
        const { count: sc } = await supabase.from("students").select("*", { count: "exact", head: true });
        totalStudents = sc || 0;
        const { count: tc } = await supabase.from("daily_word_submissions").select("*", { count: "exact", head: true }).eq("submission_date", todayStr);
        todaySubmissions = tc || 0;
      }

      const rate = totalStudents > 0 ? Math.round((todaySubmissions / totalStudents) * 100) : 0;
      return { todaySubmissions, totalStudents, rate };
    },
  });

  // 주간 제출 통계
  const { data: weeklyStats, isLoading: isLoadingWeeklyStats } = useQuery({
    queryKey: ["weekly-stats", startOfWeekStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      const daysPassedThisWeek = Math.min(diff + 1, 7);
      let totalStudents: number;
      let weekSubmissions: number;

      if (effectiveStudentIds !== null) {
        totalStudents = effectiveStudentIds.length;
        if (totalStudents === 0) return { weekSubmissions: 0, expectedSubmissions: 0 };
        const { count } = await supabase
          .from("daily_word_submissions")
          .select("*", { count: "exact", head: true })
          .gte("submission_date", startOfWeekStr)
          .lte("submission_date", todayStr)
          .in("student_id", effectiveStudentIds);
        weekSubmissions = count || 0;
      } else {
        const { count: sc } = await supabase.from("students").select("*", { count: "exact", head: true });
        totalStudents = sc || 0;
        const { count: wc } = await supabase.from("daily_word_submissions").select("*", { count: "exact", head: true }).gte("submission_date", startOfWeekStr).lte("submission_date", todayStr);
        weekSubmissions = wc || 0;
      }

      return { weekSubmissions, expectedSubmissions: totalStudents * daysPassedThisWeek };
    },
  });

  // 지난 주 완료율
  const { data: lastWeekRate = 0 } = useQuery({
    queryKey: ["last-week-rate", lastWeekStartStr, lastWeekEndStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      let totalStudents: number;
      let lastWeekSubmissions: number;

      if (effectiveStudentIds !== null) {
        totalStudents = effectiveStudentIds.length;
        if (totalStudents === 0) return 0;
        const { count } = await supabase.from("daily_word_submissions").select("*", { count: "exact", head: true }).gte("submission_date", lastWeekStartStr).lte("submission_date", lastWeekEndStr).in("student_id", effectiveStudentIds);
        lastWeekSubmissions = count || 0;
      } else {
        const { count: sc } = await supabase.from("students").select("*", { count: "exact", head: true });
        totalStudents = sc || 0;
        const { count: lc } = await supabase.from("daily_word_submissions").select("*", { count: "exact", head: true }).gte("submission_date", lastWeekStartStr).lte("submission_date", lastWeekEndStr);
        lastWeekSubmissions = lc || 0;
      }

      const expectedLastWeek = totalStudents * 7;
      return expectedLastWeek > 0 ? Math.round((lastWeekSubmissions / expectedLastWeek) * 100) : 0;
    },
  });

  const thisWeekRate = weeklyStats && weeklyStats.expectedSubmissions > 0
    ? Math.round((weeklyStats.weekSubmissions / weeklyStats.expectedSubmissions) * 100)
    : 0;
  const rateDiff = thisWeekRate - lastWeekRate;

  // 활성 학생 수
  const { data: activeStudents = 0, isLoading: isLoadingActiveStudents } = useQuery({
    queryKey: ["active-students", startOfWeekStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      let query = supabase
        .from("daily_word_submissions")
        .select("student_id")
        .gte("submission_date", startOfWeekStr)
        .lte("submission_date", todayStr);

      if (effectiveStudentIds !== null) {
        if (effectiveStudentIds.length === 0) return 0;
        query = query.in("student_id", effectiveStudentIds);
      }

      const { data } = await query;
      const uniqueStudents = new Set(data?.map((s) => s.student_id) || []);
      return uniqueStudents.size;
    },
  });

  // 평균 제출 시간
  const { data: avgSubmitTime, isLoading: isLoadingAvgTime } = useQuery({
    queryKey: ["avg-submit-time", startOfWeekStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      let query = supabase
        .from("daily_word_submissions")
        .select("submitted_at")
        .gte("submission_date", startOfWeekStr)
        .lte("submission_date", todayStr);

      if (effectiveStudentIds !== null) {
        if (effectiveStudentIds.length === 0) return { time: "--:--", period: "데이터 없음" };
        query = query.in("student_id", effectiveStudentIds);
      }

      const { data } = await query;
      if (!data || data.length === 0) return { time: "--:--", period: "데이터 없음" };

      const totalMinutes = data.reduce((sum, s) => {
        const date = new Date(s.submitted_at);
        return sum + date.getHours() * 60 + date.getMinutes();
      }, 0);

      const avgMinutes = Math.round(totalMinutes / data.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const period = hours < 12 ? "오전 시간대" : hours < 18 ? "오후 시간대" : "저녁 시간대";

      return { time: timeStr, period };
    },
  });

  // 그룹별 최근 30일 완료율 데이터
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysAgoStr = getKSTDateString(thirtyDaysAgo);

  const { data: groupChartData = [], isLoading: isLoadingGroupChart } = useQuery({
    queryKey: ["group-chart-data-30d", todayStr, thirtyDaysAgoStr, ownerCodeId],
    enabled: studentIdsReady,
    queryFn: async () => {
      // Fetch tags (groups)
      let tagsQuery = supabase.from("student_tags").select("id, name, color").order("name");
      if (shouldFilter && ownerCodeId) {
        tagsQuery = tagsQuery.eq("owner_code_id", ownerCodeId);
      }
      const { data: tags } = await tagsQuery;
      if (!tags || tags.length === 0) return [];

      // Fetch all tag assignments
      const { data: tagAssignments } = await supabase
        .from("student_tag_assignments")
        .select("tag_id, student_id");

      const tagStudentMap: Record<string, string[]> = {};
      (tagAssignments || []).forEach((ta: any) => {
        if (!tagStudentMap[ta.tag_id]) tagStudentMap[ta.tag_id] = [];
        tagStudentMap[ta.tag_id].push(ta.student_id);
      });

      // Fetch all students for created_at info
      const allStudentIds = [...new Set(Object.values(tagStudentMap).flat())];
      if (allStudentIds.length === 0) return [];

      const { data: studentsList } = await supabase
        .from("students")
        .select("id, created_at")
        .in("id", allStudentIds);

      const studentCreatedMap: Record<string, string> = {};
      (studentsList || []).forEach((s: any) => {
        const createdAtKST = toKST(new Date(s.created_at));
        studentCreatedMap[s.id] = getKSTDateString(new Date(s.created_at));
      });

      const SYSTEM_START = "2026-02-08";

      const chartData = await Promise.all(
        tags.map(async (tag) => {
          const studentIdList = tagStudentMap[tag.id] || [];
          if (studentIdList.length === 0) return { group: tag.name, shortName: tag.name, 완료: 0, 미완료: 0, color: tag.color };

          let totalExpected = 0;
          studentIdList.forEach((sid) => {
            const createdDateStr = studentCreatedMap[sid] || SYSTEM_START;
            const effectiveStart = [thirtyDaysAgoStr, createdDateStr, SYSTEM_START].sort().pop()!;
            if (effectiveStart > todayStr) return;
            const startDate = new Date(effectiveStart + "T00:00:00+09:00");
            const todayDate = new Date(todayStr + "T00:00:00+09:00");
            totalExpected += Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          });

          let totalSubmitted = 0;
          if (studentIdList.length > 0) {
            const { count } = await supabase
              .from("daily_word_submissions")
              .select("*", { count: "exact", head: true })
              .gte("submission_date", thirtyDaysAgoStr)
              .lte("submission_date", todayStr)
              .in("student_id", studentIdList);
            totalSubmitted = count || 0;
          }

          return { group: tag.name, shortName: tag.name, 완료: totalSubmitted, 미완료: Math.max(0, totalExpected - totalSubmitted), color: tag.color };
        })
      );

      return chartData.filter(d => d.완료 > 0 || d.미완료 > 0);
    },
  });

  // 최근 미제출/지각 급증 학생 Top 10
  const { data: troubleStudents = [], isLoading: isLoadingTrouble } = useQuery({
    queryKey: ["trouble-students-top10", todayStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      // 최근 7일 기준
      const recentStart = new Date(today);
      recentStart.setDate(recentStart.getDate() - 6);
      const recentStartStr = getKSTDateString(recentStart);

      let studentsQuery = supabase.from("students").select(`id, name, created_at, grade:grades(name, school:schools(name, logo_url))`);
      if (effectiveStudentIds !== null) {
        if (effectiveStudentIds.length === 0) return [];
        studentsQuery = studentsQuery.in("id", effectiveStudentIds);
      }
      const { data: students } = await studentsQuery;
      if (!students || students.length === 0) return [];

      const SYSTEM_START = "2026-02-08";

      const stats = await Promise.all(
        students.map(async (student: any) => {
          // 학생의 실제 시작일 계산
          const createdAtKST = toKST(new Date(student.created_at));
          const createdDateStr = getKSTDateString(new Date(student.created_at));
          const effectiveStart = [recentStartStr, createdDateStr, SYSTEM_START].sort().pop()!;
          
          if (effectiveStart > todayStr) {
            return { name: student.name, school: student.grade?.school?.name || "", schoolLogo: student.grade?.school?.logo_url || null, grade: student.grade?.name || "", missed: 0, late: 0, total: 0 };
          }

          const startDate = new Date(effectiveStart + "T00:00:00+09:00");
          const todayDate = new Date(todayStr + "T00:00:00+09:00");
          const expectedDays = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const { count: recentCount } = await supabase
            .from("daily_word_submissions")
            .select("*", { count: "exact", head: true })
            .eq("student_id", student.id)
            .gte("submission_date", effectiveStart)
            .lte("submission_date", todayStr);

          const { data: recentSubs } = await supabase
            .from("daily_word_submissions")
            .select("submission_date, submitted_at")
            .eq("student_id", student.id)
            .gte("submission_date", effectiveStart)
            .lte("submission_date", todayStr);

          let lateCount = 0;
          (recentSubs || []).forEach((sub: any) => {
            const dueEnd = new Date(sub.submission_date);
            dueEnd.setDate(dueEnd.getDate() + 1);
            if (new Date(sub.submitted_at) > dueEnd) lateCount++;
          });

          const missedCount = expectedDays - (recentCount || 0);

          return {
            name: student.name,
            school: student.grade?.school?.name || "",
            schoolLogo: student.grade?.school?.logo_url || null,
            grade: student.grade?.name || "",
            missed: Math.max(0, missedCount),
            late: lateCount,
            total: Math.max(0, missedCount) + lateCount,
          };
        })
      );

      return stats
        .filter(s => s.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    },
  });

  // (학년별 완료율 쿼리 제거 - 학생 검색 리포트로 대체)

  // 전체 학생 통계
  const { data: allStudentStats = [], isLoading: isLoadingTopStudents } = useQuery({
    queryKey: ["all-students-stats", startOfMonthStr, effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      let studentsQuery = supabase.from("students").select(`id, name, created_at, grade:grades(name, school:schools(name, logo_url))`);
      
      if (effectiveStudentIds !== null) {
        if (effectiveStudentIds.length === 0) return [];
        studentsQuery = studentsQuery.in("id", effectiveStudentIds);
      }

      const { data: students } = await studentsQuery;
      if (!students || students.length === 0) return [];

      // Fetch tag assignments for group info
      const studentIds = students.map((s: any) => s.id);
      const { data: tagAssignments } = await supabase
        .from("student_tag_assignments")
        .select("student_id, tag:student_tags(name)")
        .in("student_id", studentIds);

      const studentGroupMap: Record<string, string[]> = {};
      (tagAssignments || []).forEach((ta: any) => {
        const name = ta.tag?.name;
        if (!name) return;
        if (!studentGroupMap[ta.student_id]) studentGroupMap[ta.student_id] = [];
        studentGroupMap[ta.student_id].push(name);
      });

      const SYSTEM_START = "2026-02-08";

      const studentStats = await Promise.all(
        students.map(async (student: any) => {
          // 학생의 실제 시작일 계산 (KST 기준)
          const createdAtKST = toKST(new Date(student.created_at));
          const createdDateStr = getKSTDateString(new Date(student.created_at));
          const effectiveStart = [startOfMonthStr, createdDateStr, SYSTEM_START].sort().pop()!;
          
          // 시작일이 오늘 이후면 아직 과제 없음
          if (effectiveStart > todayStr) {
            return { id: student.id, name: student.name, school: student.grade?.school?.name || "", grade: student.grade?.name || "", rate: 0, submissionCount: 0, lateCount: 0, missedCount: 0, schoolLogoUrl: student.grade?.school?.logo_url || undefined, groups: studentGroupMap[student.id] || [] };
          }

          const startDate = new Date(effectiveStart + "T00:00:00+09:00");
          const todayDate = new Date(todayStr + "T00:00:00+09:00");
          const expectedDays = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const { data: submissions } = await supabase
            .from("daily_word_submissions")
            .select("submission_date, submitted_at")
            .eq("student_id", student.id)
            .gte("submission_date", effectiveStart)
            .lte("submission_date", todayStr);
          
          const submissionCount = submissions?.length || 0;
          const lateCount = submissions?.filter(s => {
            const dueDate = new Date(s.submission_date + "T23:59:59+09:00");
            const submittedAt = new Date(s.submitted_at);
            return submittedAt > dueDate;
          }).length || 0;
          
          const rate = expectedDays > 0 ? Math.round((submissionCount / expectedDays) * 100) : 0;

          return {
            id: student.id,
            name: student.name,
            school: student.grade?.school?.name || "",
            grade: student.grade?.name || "",
            rate: Math.min(rate, 100),
            submissionCount,
            lateCount,
            missedCount: Math.max(0, expectedDays - submissionCount),
            schoolLogoUrl: student.grade?.school?.logo_url || undefined,
            groups: studentGroupMap[student.id] || [],
          };
        })
      );

      return studentStats;
    },
  });

  // 모의고사 점수 변화 TOP 10 (직전 시험 vs 최근 시험)
  const { data: examScoreChanges = [], isLoading: isLoadingExamChanges } = useQuery({
    queryKey: ["exam-score-changes", effectiveStudentIds],
    enabled: studentIdsReady,
    queryFn: async () => {
      let studentsQuery = supabase.from("students").select("id, name, grade:grades(name, school:schools(name, logo_url))");
      if (effectiveStudentIds !== null) {
        if (effectiveStudentIds.length === 0) return [];
        studentsQuery = studentsQuery.in("id", effectiveStudentIds);
      }
      const { data: students } = await studentsQuery;
      if (!students || students.length === 0) return [];

      const { data: allScores } = await supabase
        .from("mock_exam_scores")
        .select("student_id, score, exam_year, exam_month")
        .order("exam_year", { ascending: true })
        .order("exam_month", { ascending: true });

      if (!allScores || allScores.length === 0) return [];

      // Group by student
      const scoreMap = new Map<string, { score: number; year: number; month: number }[]>();
      allScores.forEach((s: any) => {
        if (!scoreMap.has(s.student_id)) scoreMap.set(s.student_id, []);
        scoreMap.get(s.student_id)!.push({ score: s.score, year: s.exam_year, month: s.exam_month });
      });

      const results = students
        .filter((st: any) => {
          const scores = scoreMap.get(st.id);
          return scores && scores.length >= 2;
        })
        .map((st: any) => {
          const scores = scoreMap.get(st.id)!;
          const prevScore = scores[scores.length - 2].score;
          const latestScore = scores[scores.length - 1].score;
          const change = latestScore - prevScore;
          return {
            id: st.id,
            name: st.name,
            school: st.grade?.school?.name || "",
            grade: st.grade?.name || "",
            schoolLogoUrl: st.grade?.school?.logo_url || undefined,
            firstScore: prevScore,
            latestScore,
            change,
            examCount: scores.length,
          };
        });

      return results;
    },
  });

  // 상향/하향 TOP 10 with 과제 이행률
  const examImproved = useMemo(() => {
    return [...examScoreChanges]
      .sort((a, b) => b.change - a.change)
      .filter(s => s.change > 0)
      .slice(0, 10)
      .map(s => {
        const stat = allStudentStats.find((st: any) => st.id === s.id);
        return { ...s, assignmentRate: stat?.rate ?? null };
      });
  }, [examScoreChanges, allStudentStats]);

  const examDeclined = useMemo(() => {
    return [...examScoreChanges]
      .sort((a, b) => a.change - b.change)
      .filter(s => s.change < 0)
      .slice(0, 10)
      .map(s => {
        const stat = allStudentStats.find((st: any) => st.id === s.id);
        return { ...s, assignmentRate: stat?.rate ?? null };
      });
  }, [examScoreChanges, allStudentStats]);

  // 순위: 완료율 동일 시 지각 적은 학생이 상위
  const topStudents = [...allStudentStats].sort((a, b) => b.rate - a.rate || a.lateCount - b.lateCount);
  const bottomStudents = [...allStudentStats].sort((a, b) => a.rate - b.rate || b.lateCount - a.lateCount);

  const [topPage, setTopPage] = useState(1);
  const [bottomPage, setBottomPage] = useState(1);
  const RANK_PER_PAGE = 10;

  const topTotalPages = Math.max(1, Math.ceil(topStudents.length / RANK_PER_PAGE));
  const bottomTotalPages = Math.max(1, Math.ceil(bottomStudents.length / RANK_PER_PAGE));
  const paginatedTop = topStudents.slice((topPage - 1) * RANK_PER_PAGE, topPage * RANK_PER_PAGE);
  const paginatedBottom = bottomStudents.slice((bottomPage - 1) * RANK_PER_PAGE, bottomPage * RANK_PER_PAGE);

  const handleStudentClick = (student: typeof topStudents[0]) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const isLoading = isLoadingTodayStats || isLoadingWeeklyStats || isLoadingActiveStudents || isLoadingAvgTime;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={BarChart3}
        title="통계/리포트"
        description="숙제 완료율 및 학생 통계"
        showDate={false}
        actions={
          <div className="flex items-center gap-2">
            <Select defaultValue="week">
              <SelectTrigger className="w-28 h-8 text-xs bg-white/10 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">주간</SelectItem>
                <SelectItem value="month">월간</SelectItem>
                <SelectItem value="semester">학기별</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/10 text-white hover:bg-white/20">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/10 text-white hover:bg-white/20">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              엑셀
            </Button>
          </div>
        }
      />

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오늘 완료율</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-primary">{todayStats?.rate || 0}%</p>
                )}
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${rateDiff >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {rateDiff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{rateDiff >= 0 ? "+" : ""}{rateDiff}% 전주 대비</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">주간 제출</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{weeklyStats?.weekSubmissions || 0}</p>
                )}
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              예상 {weeklyStats?.expectedSubmissions || 0}건 중
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 학생</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{activeStudents}</p>
                )}
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">전체 {totalStudentCount}명 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 제출 시간</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold">{avgSubmitTime?.time || "--:--"}</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{avgSubmitTime?.period || ""}</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 학교별 완료/미완료 현황 */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/30">
          <CardHeader className="py-2 sec-indigo sec-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white">그룹별 제출 현황</CardTitle>
                <CardDescription className="text-slate-300">최근 30일 일일 단어과제 완료율</CardDescription>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingGroupChart ? (
              <div className="space-y-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : groupChartData.length > 0 ? (
              <div className="space-y-5">
                {groupChartData.map((group) => {
                  const total = group.완료 + group.미완료;
                  const rate = total > 0 ? Math.round((group.완료 / total) * 100) : 0;
                  return (
                    <div key={group.group} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-border" style={{ backgroundColor: group.color }}>
                            {group.shortName.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold">{group.shortName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 font-bold">{group.완료}건</span>
                            <span className="mx-0.5">/</span>
                            <span>{total}건</span>
                          </span>
                          <span className={`text-sm font-bold min-w-[3ch] text-right ${
                            rate >= 80 ? "text-emerald-600" : rate >= 50 ? "text-amber-600" : "text-destructive"
                          }`}>{rate}%</span>
                        </div>
                      </div>
                      <div className="relative h-5 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                            rate >= 80
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : rate >= 50
                                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                : "bg-gradient-to-r from-rose-500 to-rose-400"
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                        {rate > 15 && (
                          <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-white drop-shadow-sm">
                            {rate}% 완료
                          </span>
                        )}
                        {group.미완료 > 0 && rate < 85 && (
                          <span className="absolute inset-y-0 right-3 flex items-center text-[10px] font-medium text-muted-foreground">
                            {100 - rate}% 미완료
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                <BarChart3 className="w-12 h-12 opacity-20" />
                <span>데이터가 없습니다</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 미제출/지각 급증 학생 Top 10 */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/30">
          <CardHeader className="py-2 sec-wine sec-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white">⚠️ 주의 학생 Top 10</CardTitle>
                <CardDescription className="text-slate-300">최근 7일 미제출·지각 빈도 상위</CardDescription>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0 pb-0">
            {isLoadingTrouble ? (
              <div className="px-6 pb-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : troubleStudents.length > 0 ? (
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2.5rem_1fr_1fr_4rem_4rem_4rem] gap-2 px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border/40 bg-muted/30">
                  <span>#</span>
                  <span>학생</span>
                  <span>소속</span>
                  <span className="text-center">미제출</span>
                  <span className="text-center">지각</span>
                  <span className="text-center">합계</span>
                </div>
                {/* Table Body */}
                <div className="divide-y divide-border/30">
                  {troubleStudents.map((student: any, idx: number) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-[2.5rem_1fr_1fr_4rem_4rem_4rem] gap-2 px-5 py-3 items-center transition-colors hover:bg-muted/20 ${
                        idx === 0 ? "bg-rose-50/50 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                          : idx === 1
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                            : idx === 2
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                              : "bg-muted text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      {/* Name */}
                      <span className="text-sm font-semibold text-foreground truncate">{student.name}</span>
                      {/* School & Grade with Logo */}
                      <div className="flex items-center gap-2 min-w-0">
                        {student.schoolLogo ? (
                          <img
                            src={cacheBustUrl(student.schoolLogo)}
                            alt={student.school}
                            className="w-5 h-5 rounded-full object-cover border border-border/50 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border/50 flex-shrink-0">
                            {student.school?.charAt(0) || "?"}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {student.school} · {student.grade}
                        </span>
                      </div>
                      {/* Missed */}
                      <div className="flex justify-center">
                        {student.missed > 0 ? (
                          <span className="inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                            {student.missed}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">-</span>
                        )}
                      </div>
                      {/* Late */}
                      <div className="flex justify-center">
                        {student.late > 0 ? (
                          <span className="inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            {student.late}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">-</span>
                        )}
                      </div>
                      {/* Total */}
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                          student.total >= 5
                            ? "bg-rose-500 text-white"
                            : student.total >= 3
                              ? "bg-amber-500 text-white"
                              : "bg-muted text-foreground"
                        }`}>
                          {student.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Legend Footer */}
                <div className="flex items-center gap-4 px-5 py-3 border-t border-border/40 bg-muted/20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] text-muted-foreground">미제출</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-muted-foreground">지각</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2 px-6">
                <Target className="w-12 h-12 opacity-20" />
                <span>주의 학생이 없습니다 🎉</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 모의고사 점수 변화 TOP 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상향 TOP 10 */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/30">
          <CardHeader className="py-2 sec-olive sec-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white">📈 성적 상향 TOP 10</CardTitle>
                <CardDescription className="text-emerald-100">직전 시험 대비 최근 시험 점수 상승</CardDescription>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0 pb-0">
            {isLoadingExamChanges || isLoadingTopStudents ? (
              <div className="px-6 pb-6 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : examImproved.length > 0 ? (
              <div className="overflow-hidden">
                <div className="grid grid-cols-[2rem_1fr_1fr_4.5rem_4.5rem_4rem] gap-2 px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border/40 bg-muted/30">
                  <span>#</span>
                  <span>학생</span>
                  <span>소속</span>
                  <span className="text-center">점수변화</span>
                  <span className="text-center">최근점수</span>
                  <span className="text-center">이행률</span>
                </div>
                <div className="divide-y divide-border/30">
                  {examImproved.map((student, idx) => (
                    <div
                      key={student.id}
                      className={`grid grid-cols-[2rem_1fr_1fr_4.5rem_4.5rem_4rem] gap-2 px-5 py-3 items-center transition-colors hover:bg-muted/20 ${
                        idx === 0 ? "bg-emerald-50/50 dark:bg-emerald-950/10" : ""
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? "bg-emerald-100 text-emerald-600" : idx === 1 ? "bg-teal-100 text-teal-600" : idx === 2 ? "bg-cyan-100 text-cyan-600" : "bg-muted text-muted-foreground"
                      }`}>{idx + 1}</div>
                      <span className="text-sm font-semibold text-foreground truncate">{student.name}</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {student.schoolLogoUrl ? (
                          <img src={cacheBustUrl(student.schoolLogoUrl)} alt="" className="w-5 h-5 rounded-full object-cover border border-border/50 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border/50 flex-shrink-0">{student.school?.charAt(0)}</div>
                        )}
                        <span className="text-xs text-muted-foreground truncate">{student.school} · {student.grade}</span>
                      </div>
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-600">
                          <TrendingUp className="w-3 h-3" />+{student.change}
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <span className={`text-[9px] font-bold px-1 py-0 rounded ${
                          getGradeFromScore(student.latestScore) <= 2 ? "bg-emerald-100 text-emerald-700" :
                          getGradeFromScore(student.latestScore) <= 4 ? "bg-blue-100 text-blue-700" :
                          getGradeFromScore(student.latestScore) <= 6 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>{getGradeFromScore(student.latestScore)}등급</span>
                        <span className="text-sm font-semibold">{student.firstScore}→{student.latestScore}</span>
                      </div>
                      <div className="flex justify-center">
                        {student.assignmentRate !== null ? (
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                            student.assignmentRate >= 80 ? "bg-emerald-100 text-emerald-600" : student.assignmentRate >= 50 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                          }`}>{student.assignmentRate}%</span>
                        ) : <span className="text-xs text-muted-foreground/40">-</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2 px-6">
                <TrendingUp className="w-12 h-12 opacity-20" />
                <span>2회 이상 시험 데이터가 필요합니다</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 하향 TOP 10 */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/30">
          <CardHeader className="py-2 sec-plum sec-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white">📉 성적 하향 TOP 10</CardTitle>
                <CardDescription className="text-rose-100">직전 시험 대비 최근 시험 점수 하락</CardDescription>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0 pb-0">
            {isLoadingExamChanges || isLoadingTopStudents ? (
              <div className="px-6 pb-6 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : examDeclined.length > 0 ? (
              <div className="overflow-hidden">
                <div className="grid grid-cols-[2rem_1fr_1fr_4.5rem_4.5rem_4rem] gap-2 px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border/40 bg-muted/30">
                  <span>#</span>
                  <span>학생</span>
                  <span>소속</span>
                  <span className="text-center">점수변화</span>
                  <span className="text-center">최근점수</span>
                  <span className="text-center">이행률</span>
                </div>
                <div className="divide-y divide-border/30">
                  {examDeclined.map((student, idx) => (
                    <div
                      key={student.id}
                      className={`grid grid-cols-[2rem_1fr_1fr_4.5rem_4.5rem_4rem] gap-2 px-5 py-3 items-center transition-colors hover:bg-muted/20 ${
                        idx === 0 ? "bg-rose-50/50 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? "bg-rose-100 text-rose-600" : idx === 1 ? "bg-amber-100 text-amber-600" : idx === 2 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                      }`}>{idx + 1}</div>
                      <span className="text-sm font-semibold text-foreground truncate">{student.name}</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {student.schoolLogoUrl ? (
                          <img src={cacheBustUrl(student.schoolLogoUrl)} alt="" className="w-5 h-5 rounded-full object-cover border border-border/50 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border/50 flex-shrink-0">{student.school?.charAt(0)}</div>
                        )}
                        <span className="text-xs text-muted-foreground truncate">{student.school} · {student.grade}</span>
                      </div>
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-600">
                          <TrendingDown className="w-3 h-3" />{student.change}
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <span className={`text-[9px] font-bold px-1 py-0 rounded ${
                          getGradeFromScore(student.latestScore) <= 2 ? "bg-emerald-100 text-emerald-700" :
                          getGradeFromScore(student.latestScore) <= 4 ? "bg-blue-100 text-blue-700" :
                          getGradeFromScore(student.latestScore) <= 6 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>{getGradeFromScore(student.latestScore)}등급</span>
                        <span className="text-sm font-semibold">{student.firstScore}→{student.latestScore}</span>
                      </div>
                      <div className="flex justify-center">
                        {student.assignmentRate !== null ? (
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                            student.assignmentRate >= 80 ? "bg-emerald-100 text-emerald-600" : student.assignmentRate >= 50 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                          }`}>{student.assignmentRate}%</span>
                        ) : <span className="text-xs text-muted-foreground/40">-</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2 px-6">
                <TrendingDown className="w-12 h-12 opacity-20" />
                <span>2회 이상 시험 데이터가 필요합니다</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 학생 검색 & 개인 리포트 */}
        <StudentSearchCard
          allStudentStats={allStudentStats}
          isLoading={isLoadingTopStudents}
          onStudentClick={handleStudentClick}
        />

        {/* 상위 학생 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              완료율 상위 학생
            </CardTitle>
            <CardDescription className="text-xs">{new Date().getMonth() + 1}월 기준 · 클릭하여 상세 보기</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTopStudents ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))}
              </div>
            ) : topStudents.length > 0 ? (
              <>
                <div className="space-y-1">
                  {paginatedTop.map((student, idx) => {
                    const globalIdx = (topPage - 1) * RANK_PER_PAGE + idx;
                    return (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleStudentClick(student)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${globalIdx < 3 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                            {globalIdx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.school} · {student.grade}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {student.lateCount > 0 && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-medium">지각 {student.lateCount}</span>
                          )}
                          <span className="font-bold text-emerald-600 text-sm">{student.rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {topTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setTopPage(p => Math.max(1, p - 1))} disabled={topPage === 1}>‹</Button>
                    {Array.from({ length: topTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === topPage ? "default" : "ghost"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setTopPage(page)}>{page}</Button>
                    ))}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setTopPage(p => Math.min(topTotalPages, p + 1))} disabled={topPage === topTotalPages}>›</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">등록된 학생이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 미완료 상위 학생 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              미완료 상위 학생
            </CardTitle>
            <CardDescription className="text-xs">{new Date().getMonth() + 1}월 기준 · 클릭하여 상세 보기</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTopStudents ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))}
              </div>
            ) : bottomStudents.length > 0 ? (
              <>
                <div className="space-y-1">
                  {paginatedBottom.map((student, idx) => {
                    const globalIdx = (bottomPage - 1) * RANK_PER_PAGE + idx;
                    return (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleStudentClick(student)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${globalIdx < 3 ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>
                          {globalIdx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.school} · {student.grade}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-destructive text-sm">{student.rate}%</span>
                        <p className="text-xs text-muted-foreground">
                          {student.missedCount}일 미완료{student.lateCount > 0 && ` · 지각 ${student.lateCount}`}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
                {bottomTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setBottomPage(p => Math.max(1, p - 1))} disabled={bottomPage === 1}>‹</Button>
                    {Array.from({ length: bottomTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === bottomPage ? "default" : "ghost"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setBottomPage(page)}>{page}</Button>
                    ))}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setBottomPage(p => Math.min(bottomTotalPages, p + 1))} disabled={bottomPage === bottomTotalPages}>›</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">등록된 학생이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 학생 상세 다이얼로그 */}
      <StudentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={selectedStudent}
      />
    </div>
  );
}
