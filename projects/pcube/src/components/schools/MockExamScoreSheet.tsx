import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileSpreadsheet, School, Check } from "lucide-react";

const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MONTH_LABELS: Record<number, string> = {
  3: "3월", 4: "4월", 5: "5월", 6: "6월",
  7: "7월", 8: "8월", 9: "9월", 10: "10월", 11: "11월",
};

export function getGradeFromScore(score: number): number {
  if (score >= 90) return 1;
  if (score >= 80) return 2;
  if (score >= 70) return 3;
  if (score >= 60) return 4;
  if (score >= 50) return 5;
  if (score >= 40) return 6;
  if (score >= 30) return 7;
  if (score >= 20) return 8;
  return 9;
}

function getGradeBadgeColor(grade: number): string {
  if (grade <= 2) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
  if (grade <= 4) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (grade <= 6) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

export default function MockExamScoreSheet() {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const [localScores, setLocalScores] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const saveTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Fetch all schools
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

  // Fetch all grades
  const { data: allGrades = [] } = useQuery({
    queryKey: ["all-grades-scoresheet"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grades").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all students
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["all-students-scoresheet", schools.map(s => s.id).join(",")],
    enabled: schools.length > 0,
    queryFn: async () => {
      const schoolIds = schools.map(s => s.id);
      const { data: grades } = await supabase.from("grades").select("id").in("school_id", schoolIds);
      const gradeIds = grades?.map(g => g.id) || [];
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

  // Fetch all existing scores for the year
  const { data: existingScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["mock-exam-scores-all-year", selectedYear, allStudents.map(s => s.id).join(",")],
    enabled: allStudents.length > 0,
    queryFn: async () => {
      const studentIds = allStudents.map(s => s.id);
      if (studentIds.length === 0) return [];
      const { data, error } = await supabase
        .from("mock_exam_scores")
        .select("*")
        .in("student_id", studentIds)
        .eq("exam_year", selectedYear);
      if (error) throw error;
      return data;
    },
  });

  // Build score map
  const scoreMap = useMemo(() => {
    const map: Record<string, number> = {};
    existingScores.forEach((s: any) => {
      map[`${s.student_id}::${s.exam_month}`] = s.score;
    });
    return map;
  }, [existingScores]);

  // Initialize local scores
  useEffect(() => {
    const initial: Record<string, string> = {};
    existingScores.forEach((s: any) => {
      initial[`${s.student_id}::${s.exam_month}`] = String(s.score);
    });
    setLocalScores(initial);
  }, [existingScores]);

  // Auto-save single score with debounce
  const autoSave = useCallback(async (studentId: string, month: number, value: string) => {
    const key = `${studentId}::${month}`;
    setSavingKeys(prev => new Set(prev).add(key));

    try {
      if (value === "" || value === undefined) {
        // Delete if was existing
        if (scoreMap[key] !== undefined) {
          await supabase
            .from("mock_exam_scores")
            .delete()
            .eq("student_id", studentId)
            .eq("exam_year", selectedYear)
            .eq("exam_month", month);
        }
      } else {
        const { error } = await supabase
          .from("mock_exam_scores")
          .upsert({
            student_id: studentId,
            exam_year: selectedYear,
            exam_month: month,
            score: Number(value),
            owner_code_id: ownerCodeId,
          }, { onConflict: "student_id,exam_year,exam_month" });
        if (error) throw error;
      }

      setSavedKeys(prev => new Set(prev).add(key));
      setTimeout(() => {
        setSavedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 1500);

      queryClient.invalidateQueries({ queryKey: ["mock-exam-scores"] });
    } catch {
      toast.error("저장 실패");
    } finally {
      setSavingKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, [selectedYear, ownerCodeId, scoreMap, queryClient]);

  const handleScoreChange = useCallback((studentId: string, month: number, value: string) => {
    const key = `${studentId}::${month}`;
    if (value === "" || (/^\d{0,3}$/.test(value) && (value === "" || Number(value) <= 100))) {
      setLocalScores(prev => ({ ...prev, [key]: value }));

      // Clear existing timer
      if (saveTimerRef.current[key]) {
        clearTimeout(saveTimerRef.current[key]);
      }

      // Debounce auto-save (800ms)
      saveTimerRef.current[key] = setTimeout(() => {
        autoSave(studentId, month, value);
        delete saveTimerRef.current[key];
      }, 800);
    }
  }, [autoSave]);

  // Group students by school -> grade
  const groupedData = useMemo(() => {
    const gradeMap = new Map(allGrades.map(g => [g.id, g]));

    const result: {
      school: { id: string; name: string };
      grades: {
        grade: { id: string; name: string };
        students: { id: string; name: string }[];
      }[];
    }[] = [];

    const studentsByGrade = new Map<string, typeof allStudents>();
    allStudents.forEach(st => {
      if (!studentsByGrade.has(st.grade_id)) studentsByGrade.set(st.grade_id, []);
      studentsByGrade.get(st.grade_id)!.push(st);
    });

    const gradesBySchool = new Map<string, typeof allGrades>();
    allGrades.forEach(g => {
      if (!gradesBySchool.has(g.school_id)) gradesBySchool.set(g.school_id, []);
      gradesBySchool.get(g.school_id)!.push(g);
    });

    const filteredSchools = selectedSchoolId === "all" ? schools : schools.filter(s => s.id === selectedSchoolId);

    filteredSchools.forEach(school => {
      const schoolGrades = gradesBySchool.get(school.id) || [];
      const filteredGrades = selectedGradeId === "all" ? schoolGrades : schoolGrades.filter(g => g.id === selectedGradeId);
      const gradesWithStudents = filteredGrades
        .map(g => {
          let students = studentsByGrade.get(g.id) || [];
          if (selectedStudentId !== "all") students = students.filter(st => st.id === selectedStudentId);
          return {
            grade: { id: g.id, name: g.name },
            students,
          };
        })
        .filter(g => g.students.length > 0);

      if (gradesWithStudents.length > 0) {
        result.push({
          school: { id: school.id, name: school.name },
          grades: gradesWithStudents,
        });
      }
    });

    return result;
  }, [schools, allGrades, allStudents, selectedSchoolId, selectedGradeId, selectedStudentId]);

  // Filtered grade options based on selected school
  const filteredGradeOptions = useMemo(() => {
    if (selectedSchoolId === "all") return allGrades;
    return allGrades.filter(g => g.school_id === selectedSchoolId);
  }, [allGrades, selectedSchoolId]);

  // Filtered student options based on selected grade (and school)
  const filteredStudentOptions = useMemo(() => {
    const gradeIds = selectedGradeId !== "all"
      ? [selectedGradeId]
      : filteredGradeOptions.map(g => g.id);
    return allStudents.filter(st => gradeIds.includes(st.grade_id));
  }, [allStudents, selectedGradeId, filteredGradeOptions]);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const isLoading = studentsLoading || scoresLoading;

  return (
    <div className="space-y-4">
      {/* Year filter only */}
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
              <Select value={selectedSchoolId} onValueChange={v => { setSelectedSchoolId(v); setSelectedGradeId("all"); setSelectedStudentId("all"); }}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {schools.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">학년/반</label>
              <Select value={selectedGradeId} onValueChange={v => { setSelectedGradeId(v); setSelectedStudentId("all"); }}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {filteredGradeOptions.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">학생</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {filteredStudentOptions.map(st => (
                    <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground pb-2">점수를 입력하면 자동 저장됩니다</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </CardContent>
        </Card>
      ) : groupedData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 학교/학생이 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        groupedData.map(schoolGroup => (
          <div key={schoolGroup.school.id} className="space-y-3">
            {/* School header */}
            <div className="flex items-center gap-2 px-1">
              <School className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">{schoolGroup.school.name}</h3>
            </div>

            {schoolGroup.grades.map(gradeGroup => (
              <Card key={gradeGroup.grade.id}>
                <CardContent className="p-0">
                  <div className="px-3 py-2 bg-muted/30 border-b">
                    <Badge variant="secondary" className="text-xs">{gradeGroup.grade.name}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10 min-w-[120px]">
                            학생
                          </th>
                          {MONTHS.map(m => (
                            <th key={m} className="text-center p-2 font-medium text-muted-foreground min-w-[90px]">
                              {MONTH_LABELS[m]}
                            </th>
                          ))}
                          <th className="text-center p-2 font-medium text-muted-foreground min-w-[70px]">
                            평균
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeGroup.students.map((student, idx) => {
                          const scores = MONTHS.map(m => {
                            const key = `${student.id}::${m}`;
                            const val = localScores[key];
                            return val !== undefined && val !== "" ? Number(val) : null;
                          });
                          const validScores = scores.filter((s): s is number => s !== null);
                          const avg = validScores.length > 0
                            ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                            : null;

                          return (
                            <tr key={student.id} className={`border-b hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                              <td className={`p-3 font-medium sticky left-0 z-10 ${idx % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                                {student.name}
                              </td>
                              {MONTHS.map(m => {
                                const key = `${student.id}::${m}`;
                                const val = localScores[key] ?? "";
                                const numVal = val !== "" ? Number(val) : null;
                                const grade = numVal !== null ? getGradeFromScore(numVal) : null;
                                const isSaving = savingKeys.has(key);
                                const isSaved = savedKeys.has(key);

                                return (
                                  <td key={m} className="p-1 text-center">
                                    <div className="flex flex-col items-center gap-0.5 relative">
                                      <div className="relative">
                                        <Input
                                          type="text"
                                          inputMode="numeric"
                                          value={val}
                                          onChange={e => handleScoreChange(student.id, m, e.target.value)}
                                          className={`w-16 h-8 text-center text-sm px-1 ${isSaving ? "ring-2 ring-primary/50" : isSaved ? "ring-2 ring-emerald-400/50" : ""}`}
                                          placeholder="—"
                                        />
                                        {isSaved && (
                                          <Check className="w-3 h-3 text-emerald-500 absolute -top-1 -right-1" />
                                        )}
                                      </div>
                                      {grade !== null && (
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getGradeBadgeColor(grade)}`}>
                                          {grade}등급
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="p-2 text-center">
                                {avg !== null ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-bold">{avg}</span>
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getGradeBadgeColor(getGradeFromScore(avg))}`}>
                                      {getGradeFromScore(avg)}등급
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>등급 기준:</span>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(1)}`}>1등급 90~100</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(2)}`}>2등급 80~89</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(3)}`}>3등급 70~79</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(4)}`}>4등급 60~69</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(5)}`}>5등급 50~59</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(6)}`}>6등급 40~49</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(7)}`}>7등급 30~39</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(8)}`}>8등급 20~29</Badge>
        <Badge variant="outline" className={`text-[10px] ${getGradeBadgeColor(9)}`}>9등급 0~19</Badge>
      </div>
    </div>
  );
}
