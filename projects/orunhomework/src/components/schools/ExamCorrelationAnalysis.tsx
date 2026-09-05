import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Target, TrendingUp, TrendingDown, Minus, User } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, Legend } from "recharts";
import { getGradeFromScore } from "./MockExamScoreSheet";
import StudentDetailDialog from "@/components/statistics/StudentDetailDialog";

export default function ExamCorrelationAnalysis() {
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: schools = [] } = useQuery({
    queryKey: ["schools", ownerCodeId],
    queryFn: async () => {
      let q = supabase.from("schools").select("*").order("name");
      if (shouldFilter) q = q.eq("owner_code_id", ownerCodeId!);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: allGrades = [] } = useQuery({
    queryKey: ["all-grades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grades").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ["all-students-correlation", selectedSchoolId],
    queryFn: async () => {
      let gradeIds: string[];
      if (selectedSchoolId === "all") {
        const schoolIds = shouldFilter
          ? schools.map(s => s.id)
          : (await supabase.from("schools").select("id")).data?.map(s => s.id) || [];
        if (schoolIds.length === 0) return [];
        const { data: grades } = await supabase.from("grades").select("id").in("school_id", schoolIds);
        gradeIds = grades?.map(g => g.id) || [];
      } else {
        const { data: grades } = await supabase.from("grades").select("id").eq("school_id", selectedSchoolId);
        gradeIds = grades?.map(g => g.id) || [];
      }
      if (gradeIds.length === 0) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, name, grade_id")
        .in("grade_id", gradeIds)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: examScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["mock-exam-scores-all", selectedYear, allStudents.map(s => s.id).join(",")],
    enabled: allStudents.length > 0,
    queryFn: async () => {
      const studentIds = allStudents.map(s => s.id);
      if (studentIds.length === 0) return [];
      const { data, error } = await supabase
        .from("mock_exam_scores" as any)
        .select("*")
        .in("student_id", studentIds)
        .eq("exam_year", selectedYear);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: dailySubmissions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["daily-subs-year", selectedYear, allStudents.map(s => s.id).join(",")],
    enabled: allStudents.length > 0,
    queryFn: async () => {
      const studentIds = allStudents.map(s => s.id);
      if (studentIds.length === 0) return [];
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("student_id, submission_date")
        .in("student_id", studentIds)
        .gte("submission_date", startDate)
        .lte("submission_date", endDate);
      if (error) throw error;
      return data;
    },
  });

  const correlationData = useMemo(() => {
    if (allStudents.length === 0) return [];

    const subCountMap: Record<string, number> = {};
    dailySubmissions.forEach((s: any) => {
      subCountMap[s.student_id] = (subCountMap[s.student_id] || 0) + 1;
    });

    const scoreAccum: Record<string, { total: number; count: number }> = {};
    examScores.forEach((s: any) => {
      if (!scoreAccum[s.student_id]) scoreAccum[s.student_id] = { total: 0, count: 0 };
      scoreAccum[s.student_id].total += s.score;
      scoreAccum[s.student_id].count += 1;
    });

    const gradeMap = new Map(allGrades.map(g => [g.id, g]));
    const schoolMap = new Map(schools.map(s => [s.id, s]));

    return allStudents
      .filter(st => scoreAccum[st.id])
      .map(st => {
        const avgScore = Math.round(scoreAccum[st.id].total / scoreAccum[st.id].count);
        const subCount = subCountMap[st.id] || 0;
        const grade = gradeMap.get(st.grade_id);
        const school = grade ? schoolMap.get(grade.school_id) : null;
        return {
          id: st.id,
          name: st.name,
          avgScore,
          grade: getGradeFromScore(avgScore),
          submissionCount: subCount,
          school: school?.name || "",
          schoolLogoUrl: school?.logo_url || undefined,
          gradeName: grade?.name || "",
        };
      });
  }, [allStudents, examScores, dailySubmissions, allGrades, schools]);

  const summary = useMemo(() => {
    if (correlationData.length === 0) return null;

    const sorted = [...correlationData].sort((a, b) => b.submissionCount - a.submissionCount);
    const count = sorted.length;
    const top20Count = Math.max(1, Math.ceil(count * 0.2));
    const bottom20Count = Math.max(1, Math.ceil(count * 0.2));
    const midStart = Math.floor((count - top20Count) / 2);
    const midCount = Math.max(1, top20Count);

    const topGroup = sorted.slice(0, top20Count);
    const midGroup = sorted.slice(midStart, midStart + midCount);
    const bottomGroup = sorted.slice(count - bottom20Count);

    const avg = (arr: typeof sorted) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b.avgScore, 0) / arr.length) : 0;

    return {
      totalStudents: count,
      topAvgScore: avg(topGroup),
      midAvgScore: avg(midGroup),
      bottomAvgScore: avg(bottomGroup),
      topGroup,
      midGroup,
      bottomGroup,
    };
  }, [correlationData]);

  const monthlyTrend = useMemo(() => {
    const months = [3, 4, 5, 6, 7, 8, 9, 10, 11];
    const topStudentIds = summary?.topGroup?.map(s => s.id) || [];
    if (topStudentIds.length === 0) return [];

    return months.map(m => {
      const monthScores = examScores.filter((s: any) => s.exam_month === m && topStudentIds.includes(s.student_id));
      const avgScore = monthScores.length > 0
        ? Math.round(monthScores.reduce((a: number, s: any) => a + s.score, 0) / monthScores.length)
        : null;

      const startDate = `${selectedYear}-${String(m).padStart(2, '0')}-01`;
      const endDay = new Date(selectedYear, m, 0).getDate();
      const endDate = `${selectedYear}-${String(m).padStart(2, '0')}-${endDay}`;
      const monthSubs = dailySubmissions.filter((s: any) =>
        topStudentIds.includes(s.student_id) && s.submission_date >= startDate && s.submission_date <= endDate
      );
      const uniqueStudentsWithSubs = new Set(monthSubs.map((s: any) => s.student_id));
      const totalStudents = topStudentIds.length || 1;
      const submissionRate = totalStudents > 0
        ? Math.round((uniqueStudentsWithSubs.size / totalStudents) * 100)
        : 0;

      return { month: `${m}월`, avgScore, submissionRate };
    });
  }, [examScores, dailySubmissions, selectedYear, summary]);

  const isLoading = scoresLoading || subsLoading;
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">연도</label>
              <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">학교</label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학교</SelectItem>
                  {schools.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="py-8">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : correlationData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">모의고사 성적 데이터가 없습니다</p>
            <p className="text-xs mt-1">먼저 "모의고사 성적" 탭에서 점수를 입력해주세요</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {summary && (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">분석 대상</span>
                  </div>
                  <p className="text-2xl font-bold">{summary.totalStudents}명</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-muted-foreground">과제 상위 20% 평균</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{summary.topAvgScore}점</p>
                    <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800">
                      {getGradeFromScore(summary.topAvgScore)}등급
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {summary.topGroup.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStudent(s); setDetailOpen(true); }}
                        className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-emerald-50 transition-colors text-xs"
                      >
                        <User className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-muted-foreground ml-auto flex-shrink-0">{s.avgScore}점 · {s.submissionCount}회</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Minus className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-muted-foreground">과제 중위 20% 평균</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{summary.midAvgScore}점</p>
                    <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-800">
                      {getGradeFromScore(summary.midAvgScore)}등급
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {summary.midGroup.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStudent(s); setDetailOpen(true); }}
                        className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-blue-50 transition-colors text-xs"
                      >
                        <User className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-muted-foreground ml-auto flex-shrink-0">{s.avgScore}점 · {s.submissionCount}회</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-muted-foreground">과제 하위 20% 평균</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{summary.bottomAvgScore}점</p>
                    <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800">
                      {getGradeFromScore(summary.bottomAvgScore)}등급
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {summary.bottomGroup.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStudent(s); setDetailOpen(true); }}
                        className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-amber-50 transition-colors text-xs"
                      >
                        <User className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-muted-foreground ml-auto flex-shrink-0">{s.avgScore}점 · {s.submissionCount}회</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">📈 과제 상위 20% 학생 월별 성적 vs 과제 참여율</CardTitle>
              <CardDescription className="text-xs">
                과제 제출 상위 20% 학생들의 모의고사 평균 점수와 단어과제 참여율 월별 추이
                {summary?.topGroup && (
                  <span className="ml-1 text-emerald-600 font-medium">
                    ({summary.topGroup.map(s => s.name).join(', ')})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend.filter(d => d.avgScore !== null)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: '점수', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: '참여율(%)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value: number, name: string) => [
                        `${value}${name === "avgScore" ? "점" : "%"}`,
                        name === "avgScore" ? "평균 점수" : "과제 참여율"
                      ]}
                    />
                    <Legend formatter={(value) => value === "avgScore" ? "모의고사 평균" : "과제 참여율"} />
                    <Line yAxisId="score" type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line yAxisId="rate" type="monotone" dataKey="submissionRate" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">과제 제출 횟수 vs 모의고사 평균 점수</CardTitle>
              <CardDescription className="text-xs">단어과제 제출 횟수가 많을수록 모의고사 성적이 높은지 비교합니다 (점 위에 마우스를 올리면 학생 이름을 확인할 수 있습니다)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" dataKey="submissionCount" name="과제 제출 횟수" tick={{ fontSize: 11 }} label={{ value: '과제 제출 횟수', position: 'bottom', style: { fontSize: 11 } }} />
                    <YAxis type="number" dataKey="avgScore" name="평균 점수" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: '모의고사 평균', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg text-xs">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-muted-foreground">{data.school} · {data.gradeName}</p>
                            <p>모의고사 평균: <strong>{data.avgScore}점</strong> ({data.grade}등급)</p>
                            <p>과제 제출: <strong>{data.submissionCount}회</strong></p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={correlationData} fill="hsl(var(--primary))">
                      {correlationData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.grade <= 2 ? "hsl(142 76% 36%)" :
                            entry.grade <= 4 ? "hsl(217 91% 60%)" :
                            entry.grade <= 6 ? "hsl(38 92% 50%)" :
                            "hsl(0 84% 60%)"
                          }
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />1~2등급</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />3~4등급</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />5~6등급</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />7~9등급</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">학생별 성적-과제 비교표</CardTitle>
              <CardDescription className="text-xs">과제 제출 횟수 순 정렬</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">순위</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">학생</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">학교/학년</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">과제 제출</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">평균 점수</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">등급</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...correlationData]
                      .sort((a, b) => b.submissionCount - a.submissionCount)
                      .map((s, i) => (
                        <tr key={s.name + i} className="border-b hover:bg-muted/30">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3 font-medium">{s.name}</td>
                          <td className="p-3 text-muted-foreground text-xs">{s.school} · {s.gradeName}</td>
                          <td className="p-3 text-center font-medium">{s.submissionCount}회</td>
                          <td className="p-3 text-center font-bold">{s.avgScore}점</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={`text-[10px] ${
                              s.grade <= 2 ? "bg-emerald-100 text-emerald-800" :
                              s.grade <= 4 ? "bg-blue-100 text-blue-800" :
                              s.grade <= 6 ? "bg-amber-100 text-amber-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {s.grade}등급
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <StudentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={selectedStudent ? {
          id: selectedStudent.id,
          name: selectedStudent.name,
          school: selectedStudent.school,
          grade: selectedStudent.gradeName,
          rate: selectedStudent.submissionCount,
          schoolLogoUrl: selectedStudent.schoolLogoUrl,
        } : null}
      />
    </div>
  );
}
