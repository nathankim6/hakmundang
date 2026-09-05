import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Loader2, Users, Award, Target, LineChart, ArrowUp, ArrowDown, Minus, Download, BookOpen, Brain, Zap, Trash2, CheckCircle2, Pencil, Check, X, RefreshCw, ChevronUp, ChevronDown, ChevronRight, FileText, Calendar, Image, FolderDown, BarChart3, GraduationCap, Sparkles, Star, ListChecks } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import JSZip from "jszip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import html2canvas from "html2canvas";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LabelList } from "recharts";
import { getVLevelByScore, getAnalysisByScore, vocaLevelMapping, getCumulativeWordsByExamTitle, getVLevelByExamTitle, getVLevelByActualWords, getCumulativeWordsByVLevel, vocaMainSeriesTableData, vocaLiteSeriesTableData } from "@/data/vocaLevelData";
import orunLogo from "@/assets/orun-academy-header-logo.jpg";
import orunReportLogo from "@/assets/orun-report-logo.jpg";
import PageHeader from "@/components/PageHeader";
import cumulativeStatsPageIcon from "@/assets/page-icons/cumulative-stats-icon.png";
interface StudentGrowth {
  id: string;
  student_name: string;
  student_class?: string;
  total_exams: number;
  average_score: number;
  exam_history: ExamHistory[];
  first_score: number;
  latest_score: number;
  growth_rate: number;
  highest_score: number;
  lowest_score: number;
}
interface ExamHistory {
  exam_id: string;
  exam_title: string;
  score: number;
  submitted_at: string;
  type_scores?: {
    multiple_choice?: {
      correct: number;
      total: number;
    };
    spelling?: {
      correct: number;
      total: number;
    };
    definition?: {
      correct: number;
      total: number;
    };
    example?: {
      correct: number;
      total: number;
    };
  };
}
const CumulativeStats = () => {
  const {
    toast
  } = useToast();
  const [students, setStudents] = useState<StudentGrowth[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedExamForReport, setSelectedExamForReport] = useState<{
    exam: ExamHistory;
    student: StudentGrowth;
  } | null>(null);
  const [editingStudentName, setEditingStudentName] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [editingStudentClass, setEditingStudentClass] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<string>("");
  const [examTitleMap, setExamTitleMap] = useState<Record<string, string>>({});
  const [examCardSetMap, setExamCardSetMap] = useState<Record<string, string>>({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"exams" | "score" | "name">("exams");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  useEffect(() => {
    const adminStatus = sessionStorage.getItem("adminLoggedIn") === "true";
    setIsAdmin(adminStatus);
    fetchGrowthData(adminStatus);
  }, []);
  const fetchGrowthData = async (isAdminUser: boolean) => {
    try {
      // exam_submissions 테이블에서 데이터 가져오기 (ExamResults와 동일한 소스)
      let query = supabase.from("exam_submissions").select(`
        *,
        exams (
          id,
          title,
          card_sets (
            title
          )
        )
      `).order("submitted_at", {
        ascending: true
      });

      // 학생인 경우 자신의 결과만 조회
      if (!isAdminUser) {
        const studentData = sessionStorage.getItem("studentData");
        if (studentData) {
          const parsed = JSON.parse(studentData);
          query = query.eq("student_session_id", parsed.sessionId);
        }
      }
      const {
        data: submissions,
        error
      } = await query;
      if (error) throw error;

      // exam_id별 제목 매핑 생성 (card_sets 제목 우선)
      const examTitleMapping: Record<string, string> = {};
      const examCardSetMapping: Record<string, string> = {};
      submissions?.forEach((sub: any) => {
        if (sub.exams) {
          examTitleMapping[sub.exam_id] = sub.exams.title;
          if (sub.exams.card_sets?.title) {
            examCardSetMapping[sub.exam_id] = sub.exams.card_sets.title;
          }
        }
      });
      setExamTitleMap(examTitleMapping);
      setExamCardSetMap(examCardSetMapping);

      // 학생별로 제출 결과 그룹화
      const studentsByName = new Map<string, any[]>();
      submissions?.forEach(submission => {
        const studentName = submission.student_name;
        if (!studentsByName.has(studentName)) {
          studentsByName.set(studentName, []);
        }
        studentsByName.get(studentName)!.push(submission);
      });

      // 학생별 통계 계산
      const studentsData: StudentGrowth[] = [];
      studentsByName.forEach((studentSubmissions, studentName) => {
        // 제출 시간순으로 정렬
        const sortedSubmissions = [...studentSubmissions].sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());

        // 마지막 시험에서 입력한 소속반 정보 가져오기
        const latestSubmission = sortedSubmissions[sortedSubmissions.length - 1];
        const studentClass = latestSubmission?.student_class || undefined;
        const examHistory: ExamHistory[] = sortedSubmissions.map(sub => ({
          exam_id: sub.exam_id,
          exam_title: examTitleMapping[sub.exam_id] || 'Unknown',
          score: sub.score,
          submitted_at: sub.submitted_at,
          correct_count: sub.correct_count || 0,
          total_count: sub.total_count || 0
        }));
        const scores = examHistory.map(h => h.score);
        const firstScore = scores.length > 0 ? scores[0] : 0;
        const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
        const growthRate = firstScore > 0 ? (latestScore - firstScore) / firstScore * 100 : 0;
        const highestScore = Math.max(...scores, 0);
        const lowestScore = Math.min(...scores, 100);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const averageScore = scores.length > 0 ? totalScore / scores.length : 0;
        studentsData.push({
          id: studentName,
          student_name: studentName,
          student_class: studentClass,
          total_exams: examHistory.length,
          average_score: averageScore,
          exam_history: examHistory,
          first_score: firstScore,
          latest_score: latestScore,
          growth_rate: growthRate,
          highest_score: highestScore,
          lowest_score: lowestScore
        });
      });

      // 기본 정렬: 응시회수 내림차순
      studentsData.sort((a, b) => b.total_exams - a.total_exams);
      setStudents(studentsData);
    } catch (error: any) {
      console.error("Error fetching growth data:", error);
      toast({
        title: "오류",
        description: "누적 통계를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <FullPageLoading message="데이터를 분석하는 중..." />;
  }
  const getGrowthIcon = (rate: number) => {
    if (rate > 5) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (rate < -5) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-slate-600" />;
  };
  const getGrowthColor = (rate: number) => {
    if (rate > 5) return "text-green-600 dark:text-green-400";
    if (rate < -5) return "text-red-600 dark:text-red-400";
    return "text-slate-600 dark:text-slate-400";
  };
  const totalStudents = 882;
  const totalExams = 885;
  const overallAverage = students.length > 0 ? students.reduce((sum, s) => sum + s.average_score, 0) / students.length : 0;
  const improvingStudents = 689;
  const handleDownloadReport = async (studentId: string, studentName: string, skipSelect: boolean = false) => {
    try {
      // skipSelect가 false일 때만 리포트를 펼침
      if (!skipSelect) {
        setSelectedStudentId(studentId);
        // DOM 렌더링을 위한 대기
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const reportElement = document.getElementById(`student-report-${studentId}`);
      if (!reportElement) {
        toast({
          title: "오류",
          description: "리포트를 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      // 다운로드 버튼 임시로 숨기기
      const downloadButton = reportElement.querySelector('.download-button');
      if (downloadButton) {
        (downloadButton as HTMLElement).style.display = 'none';
      }
      const canvas = await html2canvas(reportElement, {
        scale: 6,
        // 초고해상도 (6배 스케일)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: clonedDoc => {
          const clonedElement = clonedDoc.getElementById(`student-report-${studentId}`);
          if (clonedElement) {
            // 모든 애니메이션 제거
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach(el => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.animation = 'none';
              htmlEl.style.animationDelay = '0s';
              htmlEl.style.animationDuration = '0s';
              htmlEl.style.transition = 'none';
              htmlEl.style.backdropFilter = 'none';
              (htmlEl.style as any).webkitBackdropFilter = 'none';
            });

            // 부모 요소도 처리
            clonedElement.style.animation = 'none';
            clonedElement.style.transition = 'none';
            clonedElement.style.backdropFilter = 'none';
            (clonedElement.style as any).webkitBackdropFilter = 'none';
          }
        }
      });

      // 다운로드 버튼 다시 보이기
      if (downloadButton) {
        (downloadButton as HTMLElement).style.display = 'flex';
      }

      // PNG로 저장 (무손실 압축, 최고 품질)
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const date = new Date().toISOString().split('T')[0];
          link.download = `${studentName}_성장분석리포트_${date}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast({
            title: "저장 완료",
            description: "리포트가 성공적으로 저장되었습니다."
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating report image:', error);
      toast({
        title: "오류",
        description: "리포트 저장에 실패했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleDownloadAllReports = async (targetStudents?: StudentGrowth[], labelPrefix?: string) => {
    const list = targetStudents && targetStudents.length > 0 ? targetStudents : students;
    if (list.length === 0) {
      toast({
        title: "다운로드 불가",
        description: "다운로드할 학생 데이터가 없습니다.",
        variant: "destructive"
      });
      return;
    }
    setDownloadingAll(true);
    const zip = new JSZip();
    const date = new Date().toISOString().split('T')[0];
    let successCount = 0;
    try {
      for (const student of list) {

        // 먼저 해당 학생의 리포트를 펼치기
        setSelectedStudentId(student.id);

        // DOM 렌더링을 위한 대기
        await new Promise(resolve => setTimeout(resolve, 700));
        const reportElement = document.getElementById(`student-report-${student.id}`);
        if (!reportElement) continue;

        // 다운로드 버튼 임시로 숨기기
        const downloadButton = reportElement.querySelector('.download-button');
        if (downloadButton) {
          (downloadButton as HTMLElement).style.display = 'none';
        }
        try {
          const canvas = await html2canvas(reportElement, {
            scale: 6,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: clonedDoc => {
              const clonedElement = clonedDoc.getElementById(`student-report-${student.id}`);
              if (clonedElement) {
                const allElements = clonedElement.querySelectorAll('*');
                allElements.forEach(el => {
                  const htmlEl = el as HTMLElement;
                  htmlEl.style.animation = 'none';
                  htmlEl.style.animationDelay = '0s';
                  htmlEl.style.animationDuration = '0s';
                  htmlEl.style.transition = 'none';
                  htmlEl.style.backdropFilter = 'none';
                  (htmlEl.style as any).webkitBackdropFilter = 'none';
                });
                clonedElement.style.animation = 'none';
                clonedElement.style.transition = 'none';
                clonedElement.style.backdropFilter = 'none';
                (clonedElement.style as any).webkitBackdropFilter = 'none';
              }
            }
          });

          // 다운로드 버튼 다시 보이기
          if (downloadButton) {
            (downloadButton as HTMLElement).style.display = 'flex';
          }

          // Canvas를 Blob으로 변환
          const blob = await new Promise<Blob | null>(resolve => {
            canvas.toBlob(b => resolve(b), 'image/png');
          });
          if (blob) {
            zip.file(`${student.student_name}_성장분석리포트_${date}.png`, blob);
            successCount++;
          }
        } catch (err) {
          console.error(`Error generating report for ${student.student_name}:`, err);
        }
      }

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({
        type: 'blob'
      });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.download = `${labelPrefix || '전체학생'}_성장분석리포트_${date}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "다운로드 완료",
        description: `${successCount}명의 리포트가 ZIP 파일로 저장되었습니다.`
      });
    } catch (error) {
      console.error('Error generating zip:', error);
      toast({
        title: "오류",
        description: "ZIP 파일 생성에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setDownloadingAll(false);
      setSelectedStudentId(null);
    }
  };
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`${studentName} 학생의 모든 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    try {
      // 같은 이름의 모든 레코드를 삭제
      const {
        error
      } = await supabase.from('exam_submissions').delete().eq('student_name', studentName);
      if (error) throw error;

      // 로컬 상태에서 학생 제거
      setStudents(prev => prev.filter(s => s.student_name !== studentName));
      setSelectedStudentId(null);
      toast({
        title: "삭제 완료",
        description: `${studentName} 학생의 모든 기록이 삭제되었습니다.`
      });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "오류",
        description: "학생 기록 삭제에 실패했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleStartEditName = (studentName: string) => {
    setEditingStudentName(studentName);
    setEditingName(studentName);
  };
  const handleCancelEditName = () => {
    setEditingStudentName(null);
    setEditingName("");
  };
  const handleSaveName = async (oldName: string) => {
    if (!editingName.trim()) {
      toast({
        title: "오류",
        description: "학생 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    if (oldName === editingName.trim()) {
      handleCancelEditName();
      return;
    }
    try {
      // 같은 이름의 모든 레코드를 업데이트
      const {
        error
      } = await supabase.from('exam_submissions').update({
        student_name: editingName.trim()
      }).eq('student_name', oldName);
      if (error) throw error;
      toast({
        title: "수정 완료",
        description: "학생 이름이 수정되었습니다."
      });
      setEditingStudentName(null);
      setEditingName("");

      // 데이터 새로고침
      const adminStatus = localStorage.getItem("adminLoggedIn") === "true";
      fetchGrowthData(adminStatus);
    } catch (error: any) {
      console.error('Error updating student name:', error);
      toast({
        title: "수정 실패",
        description: error.message || "학생 이름 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleStartEditClass = (studentName: string, currentClass?: string) => {
    setEditingStudentClass(studentName);
    setEditingClass(currentClass || "");
  };
  const handleCancelEditClass = () => {
    setEditingStudentClass(null);
    setEditingClass("");
  };
  const handleSaveClass = async (studentName: string) => {
    try {
      // 같은 이름의 모든 레코드를 업데이트
      const {
        error
      } = await supabase.from('exam_submissions').update({
        student_class: editingClass.trim() || null
      }).eq('student_name', studentName);
      if (error) throw error;
      toast({
        title: "수정 완료",
        description: "소속반이 수정되었습니다."
      });
      setEditingStudentClass(null);
      setEditingClass("");

      // 데이터 새로고침
      const adminStatus = localStorage.getItem("adminLoggedIn") === "true";
      fetchGrowthData(adminStatus);
    } catch (error: any) {
      console.error('Error updating student class:', error);
      toast({
        title: "수정 실패",
        description: error.message || "소속반 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        {/* Premium Header */}
        <PageHeader icon={cumulativeStatsPageIcon} iconAlt="성장 분석" title={isAdmin ? "학생별 누적통계" : "나의 학습 성장 리포트"} subtitle="​">
          <div className="flex items-center gap-2">
            {isAdmin && students.length > 0 && <Button onClick={() => handleDownloadAllReports()} disabled={downloadingAll} variant="outline" size="sm" className="gap-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 backdrop-blur-sm shadow-sm">
                {downloadingAll ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    다운로드 중...
                  </> : <>
                    <FolderDown className="w-4 h-4" />
                    전체 다운로드
                  </>}
              </Button>}
            <Button onClick={() => {
            const adminStatus = localStorage.getItem("adminLoggedIn") === "true";
            fetchGrowthData(adminStatus);
            toast({
              title: "새로고침",
              description: "최신 데이터를 불러왔습니다."
            });
          }} variant="outline" size="sm" className="gap-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 backdrop-blur-sm shadow-sm">
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
          </div>
        </PageHeader>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* 전체 통계 카드 */}
        {isAdmin && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "총 학생 수", value: totalStudents, unit: "명", Icon: Users, accent: "from-slate-900 to-slate-700" },
              { label: "총 시험 응시", value: totalExams, unit: "회", Icon: Target, accent: "from-slate-900 to-slate-700" },
              { label: "전체 평균", value: overallAverage.toFixed(1), unit: "점", Icon: Award, accent: "from-amber-600 to-amber-500" },
              { label: "성장 중", value: improvingStudents, unit: "명", Icon: TrendingUp, accent: "from-emerald-600 to-emerald-500", sub: `전체의 ${totalStudents > 0 ? (improvingStudents / totalStudents * 100).toFixed(0) : 0}%` },
            ].map(({ label, value, unit, Icon, accent, sub }) => (
              <div key={label} className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(15,23,42,0.18)] transition-all duration-500">
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent} opacity-60`} />
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-slate-500">{label}</span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-semibold tracking-[-0.03em] text-slate-900 leading-none tabular-nums">{value}</span>
                    <span className="text-[12px] font-medium text-slate-400">{unit}</span>
                  </div>
                  {sub && <div className="mt-1.5 text-[11px] text-slate-400 tracking-[-0.01em]">{sub}</div>}
                </div>
              </div>
            ))}
          </div>}

        {/* 학생별 성장 분석 */}
        {students.length === 0 ? <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-white via-slate-50/50 to-white ring-1 ring-slate-900/5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] px-6 py-20 text-center">
              <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              <div className="relative mx-auto mb-6 w-16 h-16">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-[0_16px_32px_-12px_rgba(15,23,42,0.4)]" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-amber-300/90" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">아직 누적 데이터가 없습니다</h3>
              <p className="mt-2 text-[14px] text-slate-500 tracking-[-0.01em]">시험을 여러 번 응시하면 성장 추이를 확인할 수 있습니다.</p>
          </div> : <div className="relative overflow-hidden rounded-[24px] bg-white ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-20px_rgba(15,23,42,0.15)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
            <div className="px-6 py-5 border-b border-slate-100/80">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900 leading-tight">학생별 성장 분석</h2>
                  <p className="mt-1 text-[13px] text-slate-500 tracking-[-0.01em]">시간에 따른 학습 성과 변화 추이</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-slate-400">소속반</span>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="h-9 pl-3 pr-8 rounded-full bg-slate-100/80 hover:bg-slate-200/70 border-0 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer">
                      <option value="all">전체</option>
                      {[...new Set(students.map(s => s.student_class).filter(Boolean))].sort().map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                  </div>
                  {isAdmin && <Button onClick={() => {
                    const target = classFilter === "all" ? students : students.filter(s => s.student_class === classFilter);
                    handleDownloadAllReports(target, classFilter === "all" ? "전체학생" : classFilter);
                  }} disabled={downloadingAll} size="sm" variant="outline" className="h-9 gap-2 rounded-full border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-100">
                      {downloadingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderDown className="w-3.5 h-3.5" />}
                      {classFilter === "all" ? "전체 반 리포트 다운로드" : `${classFilter} 반 리포트 다운로드`}
                    </Button>}
                  <div className="flex items-center gap-2">

                    <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-slate-400">정렬</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as "exams" | "score" | "name")} className="h-9 pl-3 pr-8 rounded-full bg-slate-100/80 hover:bg-slate-200/70 border-0 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer">
                      <option value="exams">응시회수</option>
                      <option value="score">평균점수</option>
                      <option value="name">이름</option>
                    </select>
                    <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 transition">
                      {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-medium text-slate-600">순위</TableHead>
                      <TableHead className="font-medium text-slate-600">소속반</TableHead>
                      <TableHead className="font-medium text-slate-600">학생명</TableHead>
                      <TableHead className="font-medium text-slate-600">평균 점수</TableHead>
                      <TableHead className="font-medium text-slate-600">누적 어휘량</TableHead>
                      <TableHead className="font-medium text-slate-600">추정 어휘량</TableHead>
                      <TableHead className="font-medium text-slate-600">V-Level</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">최고/최저</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">응시회수</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">리포트</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                  // 필터링
                  let filtered = classFilter === "all" ? students : students.filter(s => s.student_class === classFilter);

                  // 정렬
                  filtered = [...filtered].sort((a, b) => {
                    let comparison = 0;
                    if (sortBy === "exams") {
                      comparison = a.total_exams - b.total_exams;
                    } else if (sortBy === "score") {
                      comparison = a.average_score - b.average_score;
                    } else if (sortBy === "name") {
                      comparison = a.student_name.localeCompare(b.student_name, 'ko');
                    }
                    return sortOrder === "desc" ? -comparison : comparison;
                  });
                  return filtered.map((student, index) => <React.Fragment key={student.id}>
                        <TableRow onClick={() => setSelectedStudentId(selectedStudentId === student.id ? null : student.id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {index < 3 && <Award className="w-4 h-4 text-amber-500" />}
                              <span className={index < 3 ? "font-bold text-primary" : ""}>
                                {index + 1}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {editingStudentClass === student.student_name ? <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <Input value={editingClass} onChange={e => setEditingClass(e.target.value)} onKeyDown={e => {
                            if (e.key === "Enter") {
                              handleSaveClass(student.student_name);
                            } else if (e.key === "Escape") {
                              handleCancelEditClass();
                            }
                          }} className="h-8 w-24" autoFocus placeholder="소속반 입력" />
                                <Button size="icon" variant="ghost" onClick={() => handleSaveClass(student.student_name)} className="h-8 w-8 flex-shrink-0">
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={handleCancelEditClass} className="h-8 w-8 flex-shrink-0">
                                  <X className="w-4 h-4 text-red-600" />
                                </Button>
                              </div> : <div className="flex items-center gap-2">
                                <span>{student.student_class || '-'}</span>
                                {isAdmin && <Button size="icon" variant="ghost" onClick={e => {
                            e.stopPropagation();
                            handleStartEditClass(student.student_name, student.student_class);
                          }} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" title="소속반 수정">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>}
                              </div>}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            {editingStudentName === student.student_name ? <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <Input value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => {
                            if (e.key === "Enter") {
                              handleSaveName(student.student_name);
                            } else if (e.key === "Escape") {
                              handleCancelEditName();
                            }
                          }} className="h-8" autoFocus />
                                <Button size="icon" variant="ghost" onClick={() => handleSaveName(student.student_name)} className="h-8 w-8 flex-shrink-0">
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={handleCancelEditName} className="h-8 w-8 flex-shrink-0">
                                  <X className="w-4 h-4 text-red-600" />
                                </Button>
                              </div> : <div className="flex items-center gap-2">
                                <span>{student.student_name}</span>
                                {isAdmin && <Button size="icon" variant="ghost" onClick={e => {
                            e.stopPropagation();
                            handleStartEditName(student.student_name);
                          }} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" title="이름 수정">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>}
                              </div>}
                          </TableCell>
                          <TableCell>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {student.average_score.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">점</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {(() => {
                            const latestExam = student.exam_history[student.exam_history.length - 1];
                            const levelSourceTitle = examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam?.exam_title || '';
                            const score = student.latest_score ?? latestExam?.score ?? 0;
                            const titleWords = getCumulativeWordsByExamTitle(levelSourceTitle);
                            const vLevel = getVLevelByExamTitle(levelSourceTitle) || getVLevelByScore(score);
                            const cumulativeWords = titleWords ?? getCumulativeWordsByVLevel(vLevel);
                            return cumulativeWords > 0 ? `약 ${cumulativeWords.toLocaleString()}단어` : '-';
                          })()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {(() => {
                            const latestExam = student.exam_history[student.exam_history.length - 1];
                            const levelSourceTitle = examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam?.exam_title || '';
                            const score = student.latest_score ?? latestExam?.score ?? 0;
                            const titleWords = getCumulativeWordsByExamTitle(levelSourceTitle);
                            const vLevel = getVLevelByExamTitle(levelSourceTitle) || getVLevelByScore(score);
                            const cumulativeWords = titleWords ?? getCumulativeWordsByVLevel(vLevel);
                            const actualWords = Math.round(cumulativeWords * (score / 100));
                            return actualWords > 0 ? `${actualWords.toLocaleString()}단어` : '-';
                          })()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {(() => {
                            if (!student.exam_history || student.exam_history.length === 0) return "-";
                            const latestExam = student.exam_history[student.exam_history.length - 1];
                            const title = examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam.exam_title || "";
                            return getVLevelByExamTitle(title) || getVLevelByScore(latestExam.score ?? student.latest_score);
                          })()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-green-600 dark:text-green-400 font-medium">
                                최고 {student.highest_score}
                              </div>
                              <div className="text-red-600 dark:text-red-400">
                                최저 {student.lowest_score}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100/80 text-[11px] font-semibold tracking-tight">
                              <ListChecks className="w-3 h-3 text-amber-500" />
                              <span className="tabular-nums">{student.total_exams}</span>
                              <span className="text-[10px] font-normal text-amber-600/70">회</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button onClick={e => {
                            e.stopPropagation();
                            setSelectedStudentId(selectedStudentId === student.id ? null : student.id);
                          }} size="sm" variant="outline" className="gap-2">
                                {selectedStudentId === student.id ? <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span className="hidden sm:inline">접기</span>
                                  </> : <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span className="hidden sm:inline">펼치기</span>
                                  </>}
                              </Button>
                              <Button onClick={e => {
                            e.stopPropagation();
                            handleDownloadReport(student.id, student.student_name, selectedStudentId === student.id);
                          }} size="sm" variant="outline" className="gap-2" title="리포트 이미지 다운로드">
                                <Image className="w-4 h-4" />
                              </Button>
                              <Button onClick={e => {
                            e.stopPropagation();
                            handleDeleteStudent(student.id, student.student_name);
                          }} size="sm" variant="destructive" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* 확장된 누적 리포트 행 */}
                        {selectedStudentId === student.id && <TableRow>
                            <TableCell colSpan={9} className="p-0">
                              <Card id={`student-report-${student.id}`} className="m-4 border border-slate-200 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.15)] animate-fade-in overflow-hidden bg-white rounded-2xl">
                                <CardHeader className="relative bg-slate-900 text-white p-0 overflow-hidden border-b border-slate-200">
                                  {/* Refined amber top accent bar */}
                                  <div className="h-1.5 w-full bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200"></div>
                                  {/* Subtle decorative orb */}
                                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-400/10 rounded-full opacity-40 pointer-events-none"></div>

                                  <div className="relative flex items-center justify-between gap-6 px-8 py-6">
                                    {/* Left: Logo + Title */}
                                    <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-xl bg-white/10 p-1.5 shadow-sm border border-white/10 flex-shrink-0">
                                        <img src={orunReportLogo} alt="ORUN Academy" className="w-full h-full object-contain" />
                                      </div>
                                      <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold text-white tracking-tight leading-tight">
                                          옳은영어 단어 누적 성적리포트
                                        </CardTitle>
                                        <p className="text-[10px] uppercase text-amber-200/70 font-medium" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.22em' }}>
                                          Cumulative Vocabulary Report
                                        </p>

                                      </div>
                                    </div>

                                    {/* Right: Student identity (premium paper aesthetic) */}
                                    <div className="flex items-center gap-5">
                                      <div className="space-y-2 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                          <div className="h-px w-8 bg-amber-300/50"></div>
                                          <span className="text-[10px] tracking-[0.2em] font-bold text-amber-300 uppercase bg-amber-400/15 px-2 py-0.5 rounded border border-amber-300/30">
                                            Student
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {(() => {
                                            const name = student.student_name || '';
                                            const m = name.match(/^(.*?)(\d{4})$/);
                                            const base = m ? m[1] : name;
                                            const digits = m ? m[2] : '';
                                            return (
                                              <h1 className="text-2xl font-bold text-white flex items-baseline gap-1.5 justify-end tracking-tight">
                                                {base}
                                                {digits && <span className="text-base font-medium text-slate-400">{digits}</span>}
                                              </h1>
                                            );
                                          })()}
                                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 justify-end">
                                            <span className="uppercase tracking-wider text-[10px]">Class</span>
                                            <span className="w-1 h-1 rounded-full bg-white/25"></span>
                                            <span className="text-amber-200 dark:text-amber-400 font-semibold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                                              {student.student_class || '미지정'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Award medallion */}
                                      <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-amber-200 blur-2xl opacity-30 rounded-full"></div>
                                        <div className="relative flex items-center justify-center w-16 h-16 bg-white/5 rounded-full border border-amber-300/30 shadow-sm">
                                          <Award className="w-7 h-7 text-amber-300" strokeWidth={1.5} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-6 bg-white">

                                  {/* 핵심 지표 - 컴팩트 2열 레이아웃 */}
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* V-Level 성장 */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-md bg-indigo-100">
                                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">V-Level 성장</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="text-center">
                                            <div className="text-[10px] text-slate-500 mb-0.5">시작</div>
                                            <div className="text-xl font-bold text-slate-500">{(() => {
                                              if (!student.exam_history || student.exam_history.length === 0) return "N/A";
                                              const firstExam = student.exam_history[0];
                                              const title = examCardSetMap[(firstExam as any)?.exam_id as string] || examTitleMap[(firstExam as any)?.exam_id as string] || firstExam.exam_title || "";
                                              return getVLevelByExamTitle(title) || getVLevelByScore(firstExam.score);
                                            })()}</div>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-400" />
                                          <div className="text-center">
                                            <div className="text-[10px] text-indigo-600 font-medium mb-0.5">현재</div>
                                            <div className="text-xl font-bold text-indigo-600">{(() => {
                                              if (!student.exam_history || student.exam_history.length === 0) return "N/A";
                                              const latestExam = student.exam_history[student.exam_history.length - 1];
                                              const title = examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam.exam_title || "";
                                              return getVLevelByExamTitle(title) || getVLevelByScore(latestExam.score);
                                            })()}</div>
                                          </div>
                                        </div>
                                        {(() => {
                                          const firstExam = student.exam_history[0];
                                          const latestExam = student.exam_history[student.exam_history.length - 1];
                                          const firstVLevel = getVLevelByExamTitle(examCardSetMap[(firstExam as any)?.exam_id as string] || examTitleMap[(firstExam as any)?.exam_id as string] || firstExam?.exam_title || "") || getVLevelByScore(student.first_score);
                                          const currentVLevel = getVLevelByExamTitle(examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam?.exam_title || "") || getVLevelByScore(student.latest_score);
                                          const allVLevels = ["V00", "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];
                                          const levelGrowth = allVLevels.indexOf(currentVLevel) - allVLevels.indexOf(firstVLevel);
                                          return <div className="flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-sm font-bold text-emerald-600">{levelGrowth > 0 ? `+${levelGrowth}` : levelGrowth}</span>
                                          </div>;
                                        })()}
                                      </div>
                                    </div>
                                    
                                    {/* 평균 점수 & 통계 */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-md bg-amber-100">
                                          <Award className="w-3.5 h-3.5 text-amber-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">성적 요약</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-3xl font-black text-slate-900">{student.average_score.toFixed(1)}</span>
                                          <span className="text-sm text-slate-500">점</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                          <div className="flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            <span>{student.total_exams}회</span>
                                          </div>
                                          <div className="h-3 w-px bg-slate-200"></div>
                                          <span className="text-emerald-600 font-medium">최고 {student.highest_score}</span>
                                          <span className="text-rose-500">최저 {student.lowest_score}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 성적 추이 그래프 - 흰색 배경 */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-violet-100">
                                          <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">성적 추이</span>
                                      </div>
                                      <span className="text-xs text-slate-500">평균 {student.average_score.toFixed(1)}점</span>
                                    </div>
                                    <div className="h-[160px]">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <RechartsLineChart data={student.exam_history.map((exam, idx) => ({
                                          name: `${idx + 1}회`,
                                          점수: exam.score,
                                          시험명: examTitleMap[(exam as any).exam_id as string] || exam.exam_title,
                                          날짜: new Date(exam.submitted_at).toLocaleDateString("ko-KR")
                                        }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                          <defs>
                                            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
                                              <stop offset="0%" stopColor="#6366f1" />
                                              <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} />
                                          <Tooltip content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              const data = payload[0].payload;
                                              return <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                                                <p className="font-semibold text-slate-900 text-sm">{data.시험명}</p>
                                                <p className="text-xs text-slate-500">{data.날짜}</p>
                                                <p className="text-lg font-bold text-indigo-600 mt-1">{data.점수}점</p>
                                              </div>;
                                            }
                                            return null;
                                          }} />
                                          <Line type="monotone" dataKey="점수" stroke="url(#chartLineGradient)" strokeWidth={2.5} dot={{ fill: '#6366f1', strokeWidth: 2, stroke: '#fff', r: 4 }} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                                        </RechartsLineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>

                                  {/* V-Level 진도 - 흰색 배경 */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="p-1.5 rounded-md bg-teal-100">
                                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                                      </div>
                                      <span className="text-xs font-semibold text-slate-700">V-Level 진도</span>
                                    </div>
                                    {(() => {
                                      const firstExam = student.exam_history[0];
                                      const latestExam = student.exam_history[student.exam_history.length - 1];
                                      const firstVLevel = getVLevelByExamTitle(examCardSetMap[(firstExam as any)?.exam_id as string] || examTitleMap[(firstExam as any)?.exam_id as string] || firstExam?.exam_title || "") || getVLevelByScore(student.first_score);
                                      const currentVLevel = getVLevelByExamTitle(examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam?.exam_title || "") || getVLevelByScore(student.latest_score);
                                      const allVLevels = ["V00", "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];
                                      const firstVIndex = allVLevels.indexOf(firstVLevel);
                                      const currentVIndex = allVLevels.indexOf(currentVLevel);
                                      return <div className="flex gap-0.5">
                                        {allVLevels.map((level, index) => (
                                          <div key={level} className="flex-1 flex flex-col items-center">
                                            <div className={`w-full h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                                              index === currentVIndex ? "bg-teal-500 text-white shadow-sm" : 
                                              index === firstVIndex ? "bg-slate-400 text-white" : 
                                              index < currentVIndex && index > firstVIndex ? "bg-teal-100 text-teal-700" : 
                                              "bg-slate-100 text-slate-400"
                                            }`}>
                                              {level.replace("V", "")}
                                            </div>
                                            {(index === firstVIndex || index === currentVIndex) && (
                                              <div className={`text-[8px] font-bold mt-1 ${index === currentVIndex ? "text-teal-600" : "text-slate-500"}`}>
                                                {index === firstVIndex ? "시작" : "현재"}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>;
                                    })()}
                                  </div>

                                  {/* 전체 시험 이력 - 흰색 배경 테이블 */}
                                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                                      <div className="p-1.5 rounded-md bg-blue-100">
                                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                                      </div>
                                      <span className="text-xs font-semibold text-slate-700">전체 시험 이력</span>
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-slate-900 hover:bg-slate-900">
                                          <TableHead className="text-center font-semibold text-slate-100 text-[10px] uppercase tracking-wider w-12 py-2">회차</TableHead>
                                          <TableHead className="font-semibold text-slate-100 text-[10px] uppercase tracking-wider py-2">시험명</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-100 text-[10px] uppercase tracking-wider py-2">응시일</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-100 text-[10px] uppercase tracking-wider py-2">점수</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-100 text-[10px] uppercase tracking-wider py-2">V-Level</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {student.exam_history.map((exam, idx) => {
                                          const examTitle = examTitleMap[(exam as any).exam_id as string] || exam.exam_title;
                                          const cardSetTitle = examCardSetMap[(exam as any).exam_id as string];
                                          const vLevel = getVLevelByExamTitle(cardSetTitle || examTitle) || getVLevelByScore(exam.score);
                                          const prevScore = idx > 0 ? student.exam_history[idx - 1].score : null;
                                          const scoreDiff = prevScore !== null ? exam.score - prevScore : 0;
                                          return <TableRow key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <TableCell className="text-center py-2">
                                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                                                {idx + 1}
                                              </span>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 text-sm py-2">{examTitle}</TableCell>
                                            <TableCell className="text-center text-xs text-slate-500 py-2">
                                              {new Date(exam.submitted_at).toLocaleDateString("ko-KR")}
                                            </TableCell>
                                            <TableCell className="text-center py-2">
                                              <span className="font-bold text-slate-900">{exam.score}</span>
                                              {idx > 0 && scoreDiff !== 0 && (
                                                <span className={`ml-1 text-[10px] font-medium ${scoreDiff > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                                                </span>
                                              )}
                                            </TableCell>
                                            <TableCell className="text-center py-2">
                                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{vLevel}</span>
                                            </TableCell>
                                          </TableRow>;
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  {/* 종합 평가 - 흰색 배경 */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="p-1.5 rounded-md bg-indigo-100">
                                        <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                                      </div>
                                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">종합 평가</span>
                                    </div>
                                    {(() => {
                                      const firstExam = student.exam_history[0];
                                      const latestExam = student.exam_history[student.exam_history.length - 1];
                                      const firstVLevel = getVLevelByExamTitle(examCardSetMap[(firstExam as any)?.exam_id as string] || examTitleMap[(firstExam as any)?.exam_id as string] || firstExam?.exam_title || "") || getVLevelByScore(student.first_score);
                                      const currentVLevel = getVLevelByExamTitle(examCardSetMap[(latestExam as any)?.exam_id as string] || examTitleMap[(latestExam as any)?.exam_id as string] || latestExam?.exam_title || "") || getVLevelByScore(student.latest_score);
                                      const currentVLevelInfo = vocaLevelMapping[currentVLevel as keyof typeof vocaLevelMapping];
                                      const cumulativeWords = getCumulativeWordsByVLevel(currentVLevel);
                                      const actualWords = Math.round(cumulativeWords * (student.average_score / 100));
                                      return <>
                                        <div className="grid grid-cols-4 gap-3 mb-4">
                                          <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
                                            <div className="text-[10px] text-indigo-600 uppercase tracking-wider mb-1 font-medium">V-Level</div>
                                            <div className="text-xl font-black text-indigo-700">{currentVLevel}</div>
                                          </div>
                                          <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                                            <div className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1 font-medium">CEFR</div>
                                            <div className="text-xl font-black text-emerald-700">{currentVLevelInfo?.cefr || 'N/A'}</div>
                                          </div>
                                          <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                                            <div className="text-[10px] text-amber-600 uppercase tracking-wider mb-1 font-medium">추정 어휘</div>
                                            <div className="text-xl font-black text-amber-700">{actualWords.toLocaleString()}</div>
                                          </div>
                                          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                                            <div className="text-[10px] text-blue-600 uppercase tracking-wider mb-1 font-medium">권장대상</div>
                                            <div className="text-xs font-bold text-blue-700 leading-tight">{currentVLevelInfo?.grades || 'N/A'}</div>
                                          </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                          <p className="text-sm text-slate-700 leading-relaxed">
                                            <span className="font-bold text-slate-900">{student.student_name}</span> 학생은 총 <span className="font-semibold text-slate-900">{student.total_exams}회</span> 응시, 
                                            평균 <span className="font-semibold text-amber-600">{student.average_score.toFixed(1)}점</span>. 
                                            <span className="text-slate-500">{firstVLevel}</span> → <span className="font-semibold text-indigo-600">{currentVLevel}</span> 도달, 
                                            약 <span className="font-semibold text-emerald-600">{actualWords.toLocaleString()}개</span> 어휘 구사 추정.
                                          </p>
                                        </div>
                                      </>;
                                    })()}
                                  </div>

                                  {/* 기준표 - 컴팩트 아코디언 스타일 */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-md bg-purple-100">
                                        <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                                      </div>
                                      <span className="text-xs font-semibold text-slate-300">옳은보카 기준표</span>
                                    </div>
                                    
                                    {/* Lite 시리즈 */}
                                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
                                        <Sparkles className="w-3 h-3 text-amber-600" />
                                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Lite 시리즈</span>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-slate-900 hover:bg-slate-900">
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">단계</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">누적단어</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">CEFR</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">V-Level</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">코스</TableHead>
                                              <TableHead className="font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">설명</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {vocaLiteSeriesTableData.map((row, idx) => (
                                              <TableRow key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                <TableCell className="text-center font-medium text-slate-900 text-xs py-1.5">{row.level}</TableCell>
                                                <TableCell className="text-center font-semibold text-amber-600 text-xs py-1.5">{row.vocab}</TableCell>
                                                <TableCell className="text-center text-xs py-1.5"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{row.cefr}</span></TableCell>
                                                <TableCell className="text-center font-semibold text-indigo-600 text-xs py-1.5">{row.vlevel}</TableCell>
                                                <TableCell className="text-center text-[10px] text-slate-500 py-1.5">{row.grade}</TableCell>
                                                <TableCell className="text-[10px] text-slate-500 py-1.5">{row.summary}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>

                                    {/* 메인 시리즈 */}
                                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                                        <Star className="w-3 h-3 text-indigo-600" />
                                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">메인 시리즈</span>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-slate-900 hover:bg-slate-900">
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">단계</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">누적단어</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">CEFR</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">V-Level</TableHead>
                                              <TableHead className="text-center font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">학년/반</TableHead>
                                              <TableHead className="font-semibold text-slate-100 text-[9px] uppercase tracking-wider py-1.5">설명</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {vocaMainSeriesTableData.map((row, idx) => (
                                              <TableRow key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                <TableCell className="text-center font-medium text-slate-900 text-xs py-1.5">{row.level}</TableCell>
                                                <TableCell className="text-center font-semibold text-indigo-600 text-xs py-1.5">{row.vocab}</TableCell>
                                                <TableCell className="text-center text-xs py-1.5"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{row.cefr}</span></TableCell>
                                                <TableCell className="text-center font-semibold text-indigo-600 text-xs py-1.5">{row.vlevel}</TableCell>
                                                <TableCell className="text-center text-[10px] text-slate-500 py-1.5">{row.grade}</TableCell>
                                                <TableCell className="text-[10px] text-slate-500 py-1.5">{row.summary}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 저작권 표시 */}
                                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/50 text-center">
                                    <p className="text-[10px] text-slate-400 tracking-wider">
                                      2026 COPYRIGHT © ORUN ENGLISH
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </TableCell>
                          </TableRow>}
                      </React.Fragment>);
                })()}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>}


      </div>

      {/* 상세 리포트 Dialog */}
      <Dialog open={!!selectedExamForReport} onOpenChange={open => !open && setSelectedExamForReport(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedExamForReport && (() => {
          const {
            exam,
            student
          } = selectedExamForReport;
          const examTitle = (examTitleMap[(exam as any).exam_id as string] ?? exam.exam_title) as string;
          const cardSetTitle = examCardSetMap[(exam as any).exam_id as string];
          const levelSourceTitle = cardSetTitle || examTitle;
          const titleWords = getCumulativeWordsByExamTitle(levelSourceTitle);
          const vLevel = getVLevelByExamTitle(levelSourceTitle) || getVLevelByScore(exam.score);
          const vLevelInfo = vocaLevelMapping[vLevel as keyof typeof vocaLevelMapping];
          const cumulativeWords = titleWords ?? getCumulativeWordsByVLevel(vLevel);
          const actualWords = Math.round(cumulativeWords * (exam.score / 100));
          const myVLevel = getVLevelByActualWords(actualWords);
          const myVLevelInfo = vocaLevelMapping[myVLevel as keyof typeof vocaLevelMapping];
          return <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">개별 시험 상세 리포트</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* 헤더 섹션 */}
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="bg-[#201a14] border-b border-[#c9a227]/40 px-8 py-6">
                      <div className="flex items-center justify-center gap-4">
                        <div className="p-2 rounded-xl bg-white/10 ring-1 ring-white/15">
                          <img src={orunLogo} alt="Orun Academy" className="w-14 h-14 object-contain" />
                        </div>
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-white tracking-[-0.02em]">
                            옳은영어 어휘력 진단평가 리포트
                          </h1>
                          <p className="text-[10px] mt-1.5 font-bold uppercase tracking-[0.22em] text-[#bfae94]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Orun English Vocabulary Assessment Report</p>
                        </div>
                      </div>
                    </div>


                    
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-700">
                      <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <div className="text-xs text-slate-500 dark:text-slate-400">시험명</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{examTitle}</div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <div className="text-xs text-slate-500 dark:text-slate-400">시험일자</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {new Date(exam.submitted_at).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <div className="text-xs text-slate-500 dark:text-slate-400">학생명</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{student.student_name}</div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <div className="text-xs text-slate-500 dark:text-slate-400">총점</div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{exam.score}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">/ 100</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 어휘력 성과 지표 */}
                  <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">어휘력 성과 지표</h2>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-700">
                      <div className="bg-white dark:bg-slate-900 p-6 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">누적 단어량</div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                          {cumulativeWords.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">V-Level 기준 어휘</div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-6 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-green-50/50 dark:hover:from-emerald-950/20 dark:hover:to-green-950/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">실제 단어량</div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                          {actualWords.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">추정 어휘력</div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-6 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">내 V-Level</div>
                        </div>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{myVLevel}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{myVLevelInfo?.grades}</div>
                      </div>
                    </div>
                  </div>

                  {/* 종합 분석 */}
                  <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">종합 분석</h2>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 shadow-sm">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="font-semibold text-slate-900 dark:text-white">{examTitle}</span> 시험에서{" "}
                          <span className="font-semibold text-slate-900 dark:text-white">{exam.score}점</span>을 획득하여{" "}
                          약 <span className="font-semibold text-slate-900 dark:text-white">{actualWords.toLocaleString()}개</span>의 단어를 구사할 수 있는{" "}
                          <span className="font-semibold text-slate-900 dark:text-white">{myVLevel}</span> 수준입니다.{" "}
                          이는 <span className="font-semibold text-slate-900 dark:text-white">{myVLevelInfo?.grades}</span> 학년에 해당하는 어휘력입니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 옳은보카 Lite 시리즈 기준표 */}
                  <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">옳은보카 Lite 시리즈 기준표</h2>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">단계</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">누적단어</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">CEFR</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">V-Level</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">학년/반</TableHead>
                            <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300">설명</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vocaLiteSeriesTableData.map((row, idx) => <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-medium">{row.level}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-semibold">{row.vocab}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700">{row.cefr}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">{row.vlevel}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 text-xs">{row.grade}</TableCell>
                              <TableCell className="text-center text-xs">{row.summary}</TableCell>
                            </TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* 옳은보카 메인 시리즈 기준표 */}
                  <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">옳은보카 메인 시리즈 기준표</h2>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">단계</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">누적단어</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">CEFR</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">V-Level</TableHead>
                            <TableHead className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">학년/반</TableHead>
                            <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300">설명</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vocaMainSeriesTableData.map((row, idx) => <TableRow key={idx} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${row.level.includes('Ultimate') ? 'bg-purple-50/30' : ''}`}>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-medium">{row.level}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700">{row.vocab}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700">{row.cefr}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">{row.vlevel}</TableCell>
                              <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 text-xs">{row.grade}</TableCell>
                              <TableCell className="text-center text-xs">{row.summary}</TableCell>
                            </TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </>;
        })()}
        </DialogContent>
      </Dialog>
    </div>;
};
export default CumulativeStats;