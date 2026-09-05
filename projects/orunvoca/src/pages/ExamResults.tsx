import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import orunLogo from "@/assets/orun-academy-logo-full.jpg";
import orunLogoIcon from "@/assets/orun-academy-logo-icon.jpg";
import vocathonLogo from "@/assets/vocathon-logo.png";
import PageHeader from "@/components/PageHeader";
import examResultsPageIcon from "@/assets/page-icons/exam-results-icon.png";
import vocathonExamIcon from "@/assets/vocathon-exam-icon-2.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Loader2, TrendingUp, Users, Award, Target, Calendar, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp, BookOpen, AlertCircle, LineChart, PieChart, Download, FileSpreadsheet, FolderArchive, Image, ArrowUpDown, ArrowUp, ArrowDown, Trash2, ClipboardCheck, Upload, Plus, Edit2, Check, X } from "lucide-react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend, PolarAngleAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAnalysisByScore, getVLevelByScore, getVLevelByAchievement, getVLevelByExamTitle, getVLevelByActualWords, getCumulativeWordsByVLevel, getCumulativeWordsByExamTitle, getNextQuarterPrediction, getTop10PercentBenchmark, getNextVLevel, getScoreForNextVLevel, vocaLevelMapping, getElementaryVocabPercentage, getSuneungVocabPercentage, vocaMainSeriesTableData, vocaLiteSeriesTableData } from "@/data/vocaLevelData";
interface ExamSubmission {
  id: string;
  student_name: string;
  student_class?: string;
  score: number;
  correct_count: number;
  total_count: number;
  submitted_at: string;
}
interface ExamWithSubmissions {
  id: string;
  title: string;
  total_questions: number;
  multiple_choice_count: number;
  spelling_count: number;
  definition_count: number;
  example_count: number;
  created_at: string;
  submissions: ExamSubmission[];
  card_sets?: {
    title: string;
    image_url?: string | null;
  };
}
// 단어장별 고유 색상 및 로고 매핑
const getWordbookStyle = (title: string, logos: {
  orun: string;
  vocathon: string;
  default: string;
}) => {
  const lowerTitle = title.toLowerCase();

  // ORUN VOCA 시리즈
  if (lowerTitle.includes('orun voca 3') || lowerTitle.includes('오룬보카 3')) {
    return {
      main: 'from-emerald-500 via-teal-500 to-cyan-500',
      spine: 'from-emerald-600 to-emerald-500',
      logo: logos.orun
    };
  }
  if (lowerTitle.includes('orun voca 4') || lowerTitle.includes('오룬보카 4')) {
    return {
      main: 'from-blue-500 via-indigo-500 to-violet-500',
      spine: 'from-blue-600 to-blue-500',
      logo: logos.orun
    };
  }
  if (lowerTitle.includes('orun voca 5') || lowerTitle.includes('오룬보카 5')) {
    return {
      main: 'from-violet-500 via-purple-500 to-fuchsia-500',
      spine: 'from-violet-600 to-violet-500',
      logo: logos.orun
    };
  }
  if (lowerTitle.includes('orun voca 6') || lowerTitle.includes('오룬보카 6')) {
    return {
      main: 'from-rose-500 via-pink-500 to-red-500',
      spine: 'from-rose-600 to-rose-500',
      logo: logos.orun
    };
  }
  if (lowerTitle.includes('orun voca 7') || lowerTitle.includes('오룬보카 7')) {
    return {
      main: 'from-amber-500 via-orange-500 to-red-500',
      spine: 'from-amber-600 to-amber-500',
      logo: logos.orun
    };
  }
  if (lowerTitle.includes('orun voca 8') || lowerTitle.includes('오룬보카 8')) {
    return {
      main: 'from-slate-600 via-slate-500 to-zinc-500',
      spine: 'from-slate-700 to-slate-600',
      logo: logos.orun
    };
  }

  // ORUN VOCA (숫자 없는 경우)
  if (lowerTitle.includes('orun voca') || lowerTitle.includes('오룬보카') || lowerTitle.includes('orun')) {
    return {
      main: 'from-amber-500 via-orange-500 to-rose-500',
      spine: 'from-amber-600 to-amber-500',
      logo: logos.orun
    };
  }

  // 기타 시리즈
  if (lowerTitle.includes('word master') || lowerTitle.includes('워드마스터')) {
    return {
      main: 'from-sky-500 via-blue-500 to-indigo-500',
      spine: 'from-sky-600 to-sky-500',
      logo: logos.default
    };
  }
  if (lowerTitle.includes('능률') || lowerTitle.includes('neungyul')) {
    return {
      main: 'from-green-500 via-emerald-500 to-teal-500',
      spine: 'from-green-600 to-green-500',
      logo: logos.default
    };
  }

  // 기본 색상
  return {
    main: 'from-amber-500 via-orange-500 to-rose-500',
    spine: 'from-amber-600 to-amber-500',
    logo: logos.default
  };
};
const ExamResults = () => {
  const {
    toast
  } = useToast();
  const [exams, setExams] = useState<ExamWithSubmissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [zipExpandedExamId, setZipExpandedExamId] = useState<string | null>(null);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; studentName: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<{
    [examId: string]: 'asc' | 'desc';
  }>({});
  const [classFilter, setClassFilter] = useState<{
    [examId: string]: string;
  }>({});
  const [regradingExamId, setRegradingExamId] = useState<string | null>(null);
  const reportRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  // CSV 업로드 모달 상태
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadExamTitle, setUploadExamTitle] = useState("");
  const [uploadExamDate, setUploadExamDate] = useState("");
  const [uploadWordbook, setUploadWordbook] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cardSetsList, setCardSetsList] = useState<{
    id: string;
    title: string;
    image_url?: string | null;
  }[]>([]);

  // 학생 반 수정 상태
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassValue, setEditingClassValue] = useState<string>("");

  // 학생 이름 수정 상태
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>("");
  useEffect(() => {
    const adminStatus = sessionStorage.getItem("adminLoggedIn") === "true";
    setIsAdmin(adminStatus);
    fetchResults(adminStatus);
    fetchCardSets();
  }, []);
  const fetchCardSets = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("card_sets").select("id, title, image_url").order("title", {
        ascending: true
      });
      if (error) throw error;
      setCardSetsList(data || []);
    } catch (error) {
      console.error("Error fetching card sets:", error);
    }
  };
  const getAverageScore = (submissions: ExamSubmission[]) => {
    if (submissions.length === 0) return 0;
    const total = submissions.reduce((sum, sub) => sum + sub.score, 0);
    return total / submissions.length;
  };
  const fetchResults = async (isAdminUser: boolean) => {
    try {
      // 시험 목록 가져오기 (card_sets 정보 포함)
      const {
        data: examsData,
        error: examsError
      } = await supabase.from("exams").select(`
        *,
        card_sets (
          title,
          image_url
        )
      `).order("created_at", {
        ascending: false
      });
      if (examsError) throw examsError;

      // 각 시험에 대한 제출 결과 가져오기
      const examsWithSubmissions = await Promise.all((examsData || []).map(async exam => {
        let query = supabase.from("exam_submissions").select("*").eq("exam_id", exam.id).order("score", {
          ascending: false
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
          error: submissionsError
        } = await query;
        if (submissionsError) throw submissionsError;
        return {
          ...exam,
          submissions: submissions || []
        };
      }));

      // 제출 결과가 있는 시험만 필터링
      const filteredExams: ExamWithSubmissions[] = examsWithSubmissions.filter(exam => exam.submissions.length > 0);

      // exam_id가 NULL인 orphan submissions도 가져오기 (삭제된 시험의 결과)
      let orphanQuery = supabase.from("exam_submissions").select("*").is("exam_id", null).order("score", { ascending: false });
      if (!isAdminUser) {
        const studentData = sessionStorage.getItem("studentData");
        if (studentData) {
          const parsed = JSON.parse(studentData);
          orphanQuery = orphanQuery.eq("student_session_id", parsed.sessionId);
        }
      }
      const { data: orphanSubmissions } = await orphanQuery;

      // orphan submissions를 날짜별로 그룹화
      if (orphanSubmissions && orphanSubmissions.length > 0) {
        const dateGroups: Record<string, typeof orphanSubmissions> = {};
        orphanSubmissions.forEach(sub => {
          const date = sub.submitted_at ? sub.submitted_at.split('T')[0] : 'unknown';
          if (!dateGroups[date]) dateGroups[date] = [];
          dateGroups[date].push(sub);
        });

        const orphanExams: ExamWithSubmissions[] = Object.entries(dateGroups).map(([date, subs]) => ({
          id: `orphan-${date}`,
          title: `수동 등록 시험 (${date})`,
          total_questions: 10,
          multiple_choice_count: 0,
          spelling_count: 0,
          definition_count: 0,
          example_count: 0,
          created_at: `${date}T00:00:00`,
          submissions: subs.map(s => ({
            id: s.id,
            student_name: s.student_name,
            student_class: s.student_class || undefined,
            score: s.score || 0,
            correct_count: s.correct_count || 0,
            total_count: s.total_count || 10,
            submitted_at: s.submitted_at
          }))
        }));

        filteredExams.push(...orphanExams);
      }

      setExams(filteredExams);
    } catch (error: any) {
      console.error("Error fetching results:", error);
      toast({
        title: "오류",
        description: "시험 결과를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSubmission = async (submissionId: string, studentName: string, examId: string) => {
    if (!confirm(`${studentName} 학생의 시험 결과를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 누적 통계에서도 삭제됩니다.`)) {
      return;
    }

    // 즉시 화면에서 제거 (Optimistic UI)
    setExams(prevExams => prevExams.map(exam => {
      if (exam.id === examId) {
        return {
          ...exam,
          submissions: exam.submissions.filter(s => s.id !== submissionId)
        };
      }
      return exam;
    }).filter(exam => exam.submissions.length > 0));

    toast({
      title: "삭제 완료",
      description: `${studentName} 학생의 시험 결과가 삭제되었습니다.`
    });

    // 서버 삭제는 백그라운드에서 처리
    (async () => {
      try {
        const { data: submissionToDelete } = await supabase
          .from("exam_submissions")
          .select("score, exam_id")
          .eq("id", submissionId)
          .single();

        const { error } = await supabase.from("exam_submissions").delete().eq("id", submissionId);
        if (error) throw error;

        // exam_results 누적 통계 업데이트
        try {
          const { data: examResult } = await supabase
            .from("exam_results")
            .select("*")
            .eq("student_name", studentName)
            .maybeSingle();

          if (examResult) {
            const history = Array.isArray(examResult.exam_history) ? examResult.exam_history : [];
            const actualExamId = submissionToDelete?.exam_id || examId;
            let removed = false;
            const updatedHistory = history.filter((h: any) => {
              if (!removed && h.exam_id === actualExamId) {
                removed = true;
                return false;
              }
              return true;
            });

            if (updatedHistory.length === 0) {
              await supabase.from("exam_results").delete().eq("id", examResult.id);
            } else {
              const newTotalExams = updatedHistory.length;
              const newTotalScore = updatedHistory.reduce((sum: number, h: any) => sum + (h.score || 0), 0);
              const newAverageScore = newTotalExams > 0 ? newTotalScore / newTotalExams : 0;
              await supabase.from("exam_results").update({
                total_exams: newTotalExams,
                total_score: newTotalScore,
                average_score: newAverageScore,
                exam_history: updatedHistory,
                updated_at: new Date().toISOString()
              }).eq("id", examResult.id);
            }
          }
        } catch (examResultError) {
          console.error("Error updating exam_results:", examResultError);
        }
      } catch (error: any) {
        console.error("Error deleting submission:", error);
        toast({
          title: "서버 삭제 실패",
          description: "화면에서는 제거되었지만 서버 삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.",
          variant: "destructive"
        });
      }
    })();
  };

  // 시험 전체 삭제 (결과는 보존)
  const handleDeleteExam = async (examId: string, examTitle: string, submissionCount: number) => {
    const isOrphan = examId.startsWith("orphan-");
    
    if (isOrphan) {
      if (!confirm(`"${examTitle}"의 모든 시험 결과(${submissionCount}건)를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 누적 통계에서도 삭제됩니다.`)) {
        return;
      }
    } else {
      if (!confirm(`"${examTitle}" 시험을 삭제하시겠습니까?\n\n시험 문제는 삭제되지만, ${submissionCount}명의 응시 결과는 보존됩니다.`)) {
        return;
      }
    }

    // 즉시 화면에서 제거 (Optimistic UI)
    const prevExamsSnapshot = [...exams];
    setExams(prevExams => prevExams.filter(exam => exam.id !== examId));

    toast({
      title: "삭제 완료",
      description: isOrphan 
        ? `"${examTitle}"의 모든 결과가 삭제되었습니다.`
        : `"${examTitle}" 시험이 삭제되었습니다. 응시 결과는 보존됩니다.`
    });

    // 서버 삭제는 백그라운드에서 처리
    (async () => {
      try {
        if (isOrphan) {
          const orphanExam = prevExamsSnapshot.find(e => e.id === examId);
          if (orphanExam) {
            const submissionIds = orphanExam.submissions.map(s => s.id);
            
            for (const sub of orphanExam.submissions) {
              try {
                const { data: examResult } = await supabase
                  .from("exam_results")
                  .select("*")
                  .eq("student_name", sub.student_name)
                  .maybeSingle();

                if (examResult) {
                  const history = Array.isArray(examResult.exam_history) ? examResult.exam_history : [];
                  let removed = false;
                  const updatedHistory = history.filter((h: any) => {
                    if (!removed && h.exam_id === null) {
                      removed = true;
                      return false;
                    }
                    return true;
                  });

                  if (updatedHistory.length === 0) {
                    await supabase.from("exam_results").delete().eq("id", examResult.id);
                  } else {
                    const newTotalScore = updatedHistory.reduce((sum: number, h: any) => sum + (h.score || 0), 0);
                    await supabase.from("exam_results").update({
                      total_exams: updatedHistory.length,
                      total_score: newTotalScore,
                      average_score: newTotalScore / updatedHistory.length,
                      exam_history: updatedHistory,
                      updated_at: new Date().toISOString()
                    }).eq("id", examResult.id);
                  }
                }
              } catch (e) {
                console.error("Error updating exam_results for orphan:", e);
              }
            }
            
            const { error } = await supabase
              .from("exam_submissions")
              .delete()
              .in("id", submissionIds);
            if (error) throw error;
          }
        } else {
          const { error: questionsError } = await supabase
            .from("exam_questions")
            .delete()
            .eq("exam_id", examId);
          if (questionsError) throw questionsError;

          const { error: examError } = await supabase
            .from("exams")
            .delete()
            .eq("id", examId);
          if (examError) throw examError;
        }
      } catch (error: any) {
        console.error("Error deleting exam:", error);
        toast({
          title: "서버 삭제 실패",
          description: "화면에서는 제거되었지만 서버 삭제에 실패했습니다. 새로고침 후 다시 시도해주세요.",
          variant: "destructive"
        });
      }
    })();
  };

  // 시험 재채점
  const handleRegradeExam = async (examId: string, examTitle: string) => {
    if (!confirm(`"${examTitle}" 시험의 모든 응시 결과를 재채점하시겠습니까?\n\n복수 정답 문제의 부분 점수가 적용됩니다.`)) {
      return;
    }
    
    setRegradingExamId(examId);
    toast({
      title: "재채점 중...",
      description: "잠시만 기다려주세요."
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-regrade-exam', {
        body: { exam_id: examId }
      });
      
      if (error) throw error;
      
      const results = data?.results || [];
      const changedCount = results.filter((r: any) => r.old_score !== r.new_score).length;
      
      toast({
        title: "재채점 완료",
        description: `${results.length}명 중 ${changedCount}명의 점수가 변경되었습니다.`
      });
      
      // 결과 새로고침
      fetchResults(isAdmin);
    } catch (error: any) {
      console.error("Error regrading exam:", error);
      toast({
        title: "재채점 실패",
        description: error.message || "재채점 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setRegradingExamId(null);
    }
  };

  // 학생 반(student_class) 수정
  const handleUpdateStudentClass = async (submissionId: string, examId: string) => {
    try {
      const {
        error
      } = await supabase.from("exam_submissions").update({
        student_class: editingClassValue || null
      }).eq("id", submissionId);
      if (error) throw error;

      // 로컬 상태 업데이트
      setExams(prevExams => prevExams.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            submissions: exam.submissions.map(s => s.id === submissionId ? {
              ...s,
              student_class: editingClassValue || undefined
            } : s)
          };
        }
        return exam;
      }));
      setEditingClassId(null);
      setEditingClassValue("");
      toast({
        title: "수정 완료",
        description: "학생 반 정보가 수정되었습니다."
      });
    } catch (error: any) {
      console.error("Error updating student class:", error);
      toast({
        title: "수정 실패",
        description: error.message || "반 정보 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const startEditingClass = (submissionId: string, currentClass: string | undefined) => {
    setEditingClassId(submissionId);
    setEditingClassValue(currentClass || "");
  };
  const cancelEditingClass = () => {
    setEditingClassId(null);
    setEditingClassValue("");
  };

  // 학생 이름 수정
  const handleUpdateStudentName = async (submissionId: string, examId: string) => {
    if (!editingNameValue.trim()) {
      toast({
        title: "입력 오류",
        description: "학생 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from("exam_submissions").update({
        student_name: editingNameValue.trim()
      }).eq("id", submissionId);
      if (error) throw error;

      // 로컬 상태 업데이트
      setExams(prevExams => prevExams.map(exam => {
        if (exam.id === examId) {
          return {
            ...exam,
            submissions: exam.submissions.map(s => s.id === submissionId ? {
              ...s,
              student_name: editingNameValue.trim()
            } : s)
          };
        }
        return exam;
      }));
      setEditingNameId(null);
      setEditingNameValue("");
      toast({
        title: "수정 완료",
        description: "학생 이름이 수정되었습니다."
      });
    } catch (error: any) {
      console.error("Error updating student name:", error);
      toast({
        title: "수정 실패",
        description: error.message || "이름 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  const startEditingName = (submissionId: string, currentName: string) => {
    setEditingNameId(submissionId);
    setEditingNameValue(currentName);
  };
  const cancelEditingName = () => {
    setEditingNameId(null);
    setEditingNameValue("");
  };
  const handleExcelUpload = async () => {
    if (!uploadExamTitle || !uploadExamDate || !uploadWordbook || !uploadFile) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력하고 파일을 첨부해주세요.",
        variant: "destructive"
      });
      return;
    }
    setIsUploading(true);
    try {
      // 엑셀 파일 읽기
      const arrayBuffer = await uploadFile.arrayBuffer();
      const fileName = uploadFile.name.toLowerCase();
      
      let workbook;
      if (fileName.endsWith('.csv')) {
        // CSV: EUC-KR(cp949) 인코딩 시도 후 실패 시 UTF-8
        let text: string;
        try {
          const decoder = new TextDecoder('euc-kr');
          text = decoder.decode(arrayBuffer);
        } catch {
          text = new TextDecoder('utf-8').decode(arrayBuffer);
        }
        workbook = XLSX.read(text, { type: "string" });
      } else {
        workbook = XLSX.read(arrayBuffer, { type: "array", codepage: 949 });
      }
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (jsonData.length === 0) {
        throw new Error("엑셀 파일에 데이터가 없습니다.");
      }

      // 데이터 파싱 (소속반, 이름, 총점)
      const students: {
        student_class: string;
        student_name: string;
        score: number;
      }[] = [];
      for (const row of jsonData as any[]) {
        const studentClass = row['소속반'] || row['반'] || '';
        const studentName = row['이름'] || row['학생명'] || '';
        const score = Number(row['총점'] || row['점수'] || row['score'] || 0);
        if (studentName) {
          students.push({
            student_class: String(studentClass).trim(),
            student_name: String(studentName).trim(),
            score: Math.min(100, Math.max(0, score)) // 0-100 범위로 제한
          });
        }
      }
      if (students.length === 0) {
        throw new Error("유효한 학생 데이터가 없습니다. 엑셀 파일의 열 헤더를 확인해주세요 (소속반, 이름, 총점).");
      }

      // 1. 기존 card_set 검색 또는 새로 생성
      let createdCardSetId: string | null = null;
      let createdExamId: string | null = null;
      let isNewCardSet = false;
      
      try {
        // 같은 이름의 기존 단어장이 있는지 확인 (단어 데이터가 있는 것 우선)
        const { data: existingCardSets } = await supabase
          .from("card_sets")
          .select("id, title, word_data")
          .eq("title", uploadWordbook)
          .order("created_at", { ascending: true });
        
        // 단어 데이터가 있는 기존 단어장 사용, 없으면 새로 생성
        const existingWithData = existingCardSets?.find(cs => {
          const wordData = cs.word_data as any[];
          return Array.isArray(wordData) && wordData.length > 0;
        });
        const existingCardSet = existingWithData || existingCardSets?.[0];
        
        let cardSetId: string;
        if (existingCardSet) {
          cardSetId = existingCardSet.id;
        } else {
          const {
            data: cardSetData,
            error: cardSetError
          } = await supabase.from("card_sets").insert({
            title: uploadWordbook,
            description: `${uploadExamTitle} 시험용 단어장`,
            word_data: [],
            selected_days: [],
            test_type: "meaning"
          }).select().single();
          if (cardSetError) throw cardSetError;
          cardSetId = cardSetData.id;
          createdCardSetId = cardSetId;
          isNewCardSet = true;
        }

        // 2. exam 생성
        const totalQuestions = 10;
        const {
          data: examData,
          error: examError
        } = await supabase.from("exams").insert({
          title: uploadExamTitle,
          card_set_id: cardSetId,
          total_questions: totalQuestions,
          multiple_choice_count: 0,
          spelling_count: 0,
          definition_count: 0,
          example_count: 0,
          selected_days: []
        }).select().single();
        if (examError) throw examError;
        createdExamId = examData.id;

        // 3. exam_submissions 생성 (배치 처리 - 100개씩)
        const BATCH_SIZE = 100;
        let totalInserted = 0;
        
        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          const batch = students.slice(i, i + BATCH_SIZE);
          const submissions = batch.map(student => ({
            exam_id: examData.id,
            student_name: student.student_name,
            student_class: student.student_class,
            score: student.score,
            correct_count: Math.round(student.score / 100 * totalQuestions),
            total_count: totalQuestions,
            answers: [],
            student_session_id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
            submitted_at: new Date(uploadExamDate).toISOString()
          }));
          const { error: submissionsError } = await supabase.from("exam_submissions").insert(submissions);
          if (submissionsError) throw submissionsError;
          totalInserted += batch.length;
        }
        
        toast({
          title: "업로드 완료",
          description: `${totalInserted}명의 시험 결과가 등록되었습니다.`
        });
      } catch (innerError) {
        // 롤백: 생성된 exam과 card_set 삭제
        if (createdExamId) {
          await supabase.from("exam_submissions").delete().eq("exam_id", createdExamId);
          await supabase.from("exams").delete().eq("id", createdExamId);
        }
        if (createdCardSetId) {
          await supabase.from("card_sets").delete().eq("id", createdCardSetId);
        }
        throw innerError;
      }

      // 상태 초기화 및 모달 닫기
      setUploadExamTitle("");
      setUploadExamDate("");
      setUploadWordbook("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploadModalOpen(false);

      // 데이터 새로고침
      fetchResults(isAdmin);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "업로드 실패",
        description: error.message || "시험 결과 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">데이터를 불러오는 중...</p>
        </div>
      </div>;
  }
  const getScoreGrade = (score: number) => {
    if (score >= 90) return {
      grade: "A",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      textColor: "text-emerald-700 dark:text-emerald-400"
    };
    if (score >= 80) return {
      grade: "B",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      textColor: "text-blue-700 dark:text-blue-400"
    };
    if (score >= 70) return {
      grade: "C",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-700 dark:text-amber-400"
    };
    return {
      grade: "D",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      textColor: "text-red-700 dark:text-red-400"
    };
  };
  const handleDownloadReport = async (submissionId: string, studentName: string, studentClass?: string, examTitle?: string) => {
    const reportElement = reportRefs.current[submissionId];
    if (!reportElement) return;
    try {
      toast({
        title: "리포트 저장 중",
        description: "고화질 이미지를 생성하고 있습니다..."
      });

      // PC모드 고정 너비로 캡처 (모바일에서도 데스크탑 레이아웃)
      const DESKTOP_WIDTH = 1200;
      const canvas = await html2canvas(reportElement, {
        scale: 6,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: DESKTOP_WIDTH,
        foreignObjectRendering: false,
        // false로 변경하여 더 안정적인 렌더링
        imageTimeout: 0,
        removeContainer: true,
        onclone: clonedDoc => {
          // 클론된 문서를 데스크탑 너비로 강제 설정
          clonedDoc.documentElement.style.width = `${DESKTOP_WIDTH}px`;
          clonedDoc.body.style.width = `${DESKTOP_WIDTH}px`;
          clonedDoc.body.style.minWidth = `${DESKTOP_WIDTH}px`;

          const clonedElement = clonedDoc.querySelector(`[data-report-id="${submissionId}"]`) || Array.from(clonedDoc.querySelectorAll('div')).find(el => el.className === reportElement.className);
          if (clonedElement) {
            const htmlClonedEl = clonedElement as HTMLElement;

            htmlClonedEl.style.width = `${DESKTOP_WIDTH}px`;
            htmlClonedEl.style.minWidth = `${DESKTOP_WIDTH}px`;
            htmlClonedEl.style.position = 'relative';
            htmlClonedEl.style.transform = 'none';

            // 모든 자식 요소 처리
            const allElements = htmlClonedEl.querySelectorAll('*');
            allElements.forEach(el => {
              const htmlEl = el as HTMLElement;

              // 애니메이션 및 효과 제거
              htmlEl.style.animation = 'none';
              htmlEl.style.animationDelay = '0s';
              htmlEl.style.animationDuration = '0s';
              htmlEl.style.transition = 'none';
              htmlEl.style.transform = 'none';
              htmlEl.style.backdropFilter = 'none';
              (htmlEl.style as any).webkitBackdropFilter = 'none';

              // 오버플로우 처리
              if (htmlEl.style.overflow !== 'hidden') {
                htmlEl.style.overflow = 'visible';
              }

              // 텍스트 렌더링 개선
              htmlEl.style.lineHeight = htmlEl.style.lineHeight || '1.5';
              htmlEl.style.letterSpacing = htmlEl.style.letterSpacing || 'normal';

              // 여백 보정
              if (htmlEl.classList?.contains('truncate')) {
                htmlEl.style.paddingBottom = '4px';
                htmlEl.style.overflow = 'visible';
                htmlEl.style.textOverflow = 'clip';
                htmlEl.style.whiteSpace = 'normal';
              }

              // 그라데이션 텍스트 처리
              if (htmlEl.classList.contains('bg-clip-text') || htmlEl.style.backgroundClip === 'text' || (htmlEl.style as any).webkitBackgroundClip === 'text') {
                htmlEl.style.backgroundClip = 'unset';
                (htmlEl.style as any).webkitBackgroundClip = 'unset';
                htmlEl.style.color = '#0f172a';
                htmlEl.style.background = 'none';
                htmlEl.style.webkitTextFillColor = 'currentColor';
              }

              // 투명도 처리
              if (window.getComputedStyle(htmlEl).opacity === '0') {
                htmlEl.style.opacity = '1';
              }
            });

            // 부모 요소 최종 처리
            htmlClonedEl.style.animation = 'none';
            htmlClonedEl.style.transition = 'none';
            htmlClonedEl.style.backdropFilter = 'none';
            (htmlClonedEl.style as any).webkitBackdropFilter = 'none';
            htmlClonedEl.style.overflow = 'visible';
            htmlClonedEl.style.display = 'block';
          }
        }
      });

      // PNG로 저장 (무손실 압축, 최고 품질)
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const cls = studentClass || '미지정';
          const title = examTitle || '리포트';
          link.download = `${cls}_${studentName}_${title}.png`;
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
  const handleDownloadAllAsExcel = async (exam: ExamWithSubmissions) => {
    try {
      toast({
        title: "엑셀 생성 중",
        description: "전체 학생 결과를 엑셀 파일로 생성하고 있습니다..."
      });
      const worksheetData = exam.submissions.map((submission, index) => {
        // V레벨 및 단어량 계산 (card_sets title 우선)
        const titleToCheck = exam.card_sets?.title || exam.title;
        const examTitleVLevel = getVLevelByExamTitle(titleToCheck);
        const vLevel = examTitleVLevel || getVLevelByScore(submission.score);
        const examTitleWords = getCumulativeWordsByExamTitle(titleToCheck);
        const cumulativeWords = examTitleWords || getCumulativeWordsByVLevel(vLevel);
        const actualWords = Math.round(cumulativeWords * (submission.score / 100));
        const myVLevel = getVLevelByActualWords(actualWords);
        const myVLevelInfo = vocaLevelMapping[myVLevel as keyof typeof vocaLevelMapping];
        return {
          '학생명': submission.student_name,
          '점수': submission.score,
          '누적단어량': cumulativeWords,
          '실제단어량': actualWords,
          '응시 시험 난이도': vLevel,
          '내 V-Level': myVLevel,
          'VOCABULARY 수준': myVLevelInfo?.grades || '-'
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "시험결과");
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${exam.title}_전체결과_${new Date().toLocaleDateString('ko-KR')}.xlsx`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "다운로드 완료",
        description: "엑셀 파일이 성공적으로 저장되었습니다."
      });
    } catch (error) {
      console.error('Error generating excel:', error);
      toast({
        title: "오류",
        description: "엑셀 파일 생성에 실패했습니다.",
        variant: "destructive"
      });
    }
  };
  const handleDownloadAllAsZip = async (exam: ExamWithSubmissions) => {
    try {
      setZipProgress({ current: 0, total: exam.submissions.length, studentName: '준비 중...' });
      const zip = new JSZip();
      let completed = 0;

      // 모든 리포트를 동시에 열기
      setZipExpandedExamId(exam.id);
      
      // DOM 렌더링 완료 대기 - refs가 모두 채워질 때까지
      const waitForRefs = () => new Promise<void>((resolve) => {
        const checkRefs = (attempts = 0) => {
          const allFound = exam.submissions.every(s => reportRefs.current[s.id]);
          if (allFound || attempts > 50) {
            resolve();
          } else {
            requestAnimationFrame(() => checkRefs(attempts + 1));
          }
        };
        setTimeout(() => checkRefs(), 300);
      });
      await waitForRefs();

      for (const submission of exam.submissions) {
        setZipProgress({ current: completed, total: exam.submissions.length, studentName: submission.student_name });
        const reportElement = reportRefs.current[submission.id];
        if (!reportElement) {
          console.warn('Report element not found for:', submission.student_name);
          continue;
        }
        // PC모드 고정 너비로 캡처 (모바일에서도 데스크탑 레이아웃)
        const DESKTOP_WIDTH = 1200;
        const canvas = await html2canvas(reportElement, {
          scale: 4,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: DESKTOP_WIDTH,
          foreignObjectRendering: false,
          imageTimeout: 0,
          removeContainer: true,
          onclone: (clonedDoc) => {
            // 클론된 문서의 body를 데스크탑 너비로 강제 설정
            clonedDoc.documentElement.style.width = `${DESKTOP_WIDTH}px`;
            clonedDoc.body.style.width = `${DESKTOP_WIDTH}px`;
            clonedDoc.body.style.minWidth = `${DESKTOP_WIDTH}px`;

            const clonedElement = clonedDoc.querySelector(`[data-report-id="${submission.id}"]`) || Array.from(clonedDoc.querySelectorAll('div')).find(el => el.className === reportElement.className);
            if (clonedElement) {
              const htmlClonedEl = clonedElement as HTMLElement;
              htmlClonedEl.style.width = `${DESKTOP_WIDTH}px`;
              htmlClonedEl.style.minWidth = `${DESKTOP_WIDTH}px`;
              htmlClonedEl.style.position = 'relative';
              htmlClonedEl.style.transform = 'none';
              const allElements = htmlClonedEl.querySelectorAll('*');
              allElements.forEach(el => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.animation = 'none';
                htmlEl.style.transition = 'none';
                htmlEl.style.transform = 'none';
                htmlEl.style.backdropFilter = 'none';
              });
            }
          }
        });
        const blob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9);
        });
        const className = submission.student_class || '미지정';
        zip.file(`${className}_${submission.student_name}_${exam.title}.jpg`, blob);
        completed++;
        setZipProgress({ current: completed, total: exam.submissions.length, studentName: submission.student_name });
      }
      const zipBlob = await zip.generateAsync({
        type: 'blob'
      });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.download = `${exam.title}_전체리포트_${new Date().toLocaleDateString('ko-KR')}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setZipProgress(null);
      setZipExpandedExamId(null);
      setExpandedSubmission(null);
      toast({
        title: "다운로드 완료",
        description: "전체 리포트가 ZIP 파일로 저장되었습니다."
      });
    } catch (error) {
      console.error('Error generating zip:', error);
      setZipProgress(null);
      setZipExpandedExamId(null);
      toast({
        title: "오류",
        description: "ZIP 파일 생성에 실패했습니다.",
        variant: "destructive"
      });
    }
  };
  const renderStudentReport = (submission: ExamSubmission, examData: ExamWithSubmissions) => {
    // 시험 제목에서 V레벨 추출 (우선순위: card_sets title > exam title > 점수)
    const titleToCheck = examData.card_sets?.title || examData.title;
    const examTitleVLevel = getVLevelByExamTitle(titleToCheck);
    const vLevel = examTitleVLevel || getVLevelByScore(submission.score);
    const analysis = getAnalysisByScore(submission.score);
    const vLevelInfo = vocaLevelMapping[vLevel as keyof typeof vocaLevelMapping];
    const elementaryPercent = getElementaryVocabPercentage(submission.score);
    const suneungPercent = getSuneungVocabPercentage(submission.score);
    const accuracy = submission.correct_count / submission.total_count * 100;

    // 누적 단어량과 실제 단어량 계산 (card_sets title 우선, V레벨 기준 폴백)
    const examTitleWords = getCumulativeWordsByExamTitle(titleToCheck);
    const cumulativeWords = examTitleWords || getCumulativeWordsByVLevel(vLevel);
    const actualWords = Math.round(cumulativeWords * (submission.score / 100));
    const achievementRate = actualWords / cumulativeWords * 100;
    const achievementVLevel = getVLevelByAchievement(achievementRate);
    const achievementVLevelInfo = vocaLevelMapping[achievementVLevel as keyof typeof vocaLevelMapping];

    // 실제 단어량 기반 내 V레벨
    const myVLevel = getVLevelByActualWords(actualWords);
    const myVLevelInfo = vocaLevelMapping[myVLevel as keyof typeof vocaLevelMapping];
    const allVLevels = ["V00", "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];
    const currentVIndex = allVLevels.indexOf(vLevel);
    const achievementVIndex = allVLevels.indexOf(achievementVLevel);
    const myVIndex = allVLevels.indexOf(myVLevel);
    const gradeInfo = getScoreGrade(submission.score);

    // 추가 분석 데이터
    const nextQuarterWords = getNextQuarterPrediction(submission.score, vLevel);
    const top10Benchmark = getTop10PercentBenchmark();
    const nextVLevel = getNextVLevel(myVLevel);
    const nextVLevelInfo = vocaLevelMapping[nextVLevel as keyof typeof vocaLevelMapping];
    const scoreForNextLevel = getScoreForNextVLevel(myVLevel);
    const scoreGapToNextLevel = scoreForNextLevel - submission.score;

    // 그래프 데이터 준비
    const vocabularyProgressData = allVLevels.map((level, index) => {
      const levelInfo = vocaLevelMapping[level as keyof typeof vocaLevelMapping];
      return {
        level: level.replace("V", ""),
        words: levelInfo?.vocabularyRange || 0,
        achieved: index <= myVIndex ? actualWords : 0,
        status: index < myVIndex ? "completed" : index === myVIndex ? "current" : "future"
      };
    });
    const performanceData = [{
      category: "응시 V레벨",
      value: currentVIndex + 1,
      max: 13,
      fill: "hsl(var(--chart-1))"
    }, {
      category: "내 V레벨",
      value: myVIndex + 1,
      max: 13,
      fill: "hsl(var(--chart-2))"
    }, {
      category: "성취 V레벨",
      value: achievementVIndex + 1,
      max: 13,
      fill: "hsl(var(--chart-3))"
    }];
    return <div className="relative space-y-5 max-w-6xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-10 border border-slate-200 dark:border-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-900 dark:bg-slate-100 pointer-events-none" />

        {/* 헤더 섹션 */}
        <div className="border-b border-slate-900 dark:border-slate-100">

          <div className="flex items-end justify-between gap-6 pb-4">
            <div className="flex items-center gap-4">
              <img src={orunLogo} alt="Orun Academy" className="w-11 h-11 object-contain" />
              <div className="text-left">
                <p className="text-[9px] tracking-[0.42em] uppercase text-slate-400 mb-1.5" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Orun Academy</p>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white leading-none">
                  옳은영어 어휘력 진단평가 리포트
                </h1>
              </div>
            </div>
            <p className="hidden md:block text-[10px] tracking-[0.26em] uppercase text-slate-400 pb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Vocabulary Assessment Report</p>
          </div>
          <div className="h-[2px] w-16 bg-amber-500" />
        </div>

        <div className="border border-slate-200 dark:border-slate-800 overflow-hidden">

            
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-px bg-slate-200 dark:bg-slate-700">
            <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <div className="text-xs text-slate-500 dark:text-slate-400">시험명</div>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{examData.title} ({examData.card_sets?.title || titleToCheck})</div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <div className="text-xs text-slate-500 dark:text-slate-400">시험일자</div>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {new Date(examData.created_at).toLocaleDateString("ko-KR")}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <div className="text-xs text-slate-500 dark:text-slate-400">학생명</div>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {submission.student_name}
                {submission.student_class && <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">({submission.student_class})</span>}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <div className="text-xs text-slate-500 dark:text-slate-400">총점</div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{submission.score}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* 어휘력 성과 지표 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-900 dark:border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-900 dark:text-slate-100" />
              <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>어휘력 성과 지표</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-700">
            <div className="bg-white dark:bg-slate-900 p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="">
                  <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">누적 단어량</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {cumulativeWords.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">V-Level 기준 어휘</div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">실제 단어량</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {actualWords.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">추정 어휘력</div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="">
                  <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">성취율</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {achievementRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">달성 비율</div>
            </div>
          </div>

          {/* 지표 설명 */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 p-6 m-6 mt-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="">
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              지표 설명
            </h3>
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-fit pt-0.5">
                  <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">V-Level (Vocabulary Level)</div>
                  <p className="leading-relaxed">
                    학생의 현재 어휘 수준을 나타내는 등급입니다. V01(유치)부터 V13(대입·원서 수준)까지 13단계로 구분되며, 
                    각 레벨은 학년별 권장 어휘량과 CEFR 등급에 대응됩니다.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-fit pt-0.5">
                  <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">누적어휘량 (Cumulative Vocabulary Size)</div>
                  <p className="leading-relaxed">
                    학생이 가장 최근에 응시한 시험에서 학습해야 할 목표 어휘의 총량입니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-fit pt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">실제 어휘량 (Estimated Active Vocabulary Size)</div>
                  <p className="leading-relaxed">
                    학생이 실제로 숙지하고 있는 것으로 추정되는 어휘의 개수입니다. 
                    누적 어휘량 × 시험 성취율(점수)를 바탕으로 계산됩니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-fit pt-0.5">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">CEFR Level</div>
                  <p className="leading-relaxed">
                    유럽 공통 언어 참조 기준입니다. Pre-A1부터 C2까지 6개의 주요 등급으로 구성되며, 
                    국제적으로 통용되는 언어 능력 지표입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 종합 분석 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-900 dark:border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-900 dark:text-slate-100" />
              <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>종합 분석</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* V-Level 설명 */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-white">V레벨(Vocabulary Level)</span>은 학생의 어휘력을 단어량과 난이도를 기준으로 분석하여 공통유럽언어기준(CEFR) 단계별 등급과 매칭하여 시각화한 옳은영어의 진단 지표입니다.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="">
                    <Target className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">응시 시험 난이도</div>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{vLevel}</div>
                {examData.card_sets && <div className="flex items-center gap-1.5 text-xs">
                    <Badge variant="outline" className="rounded-none border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {examData.card_sets.title}
                    </Badge>
                  </div>}
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">내 점수</div>
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{submission.score.toFixed(1)}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">/ 100</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="">
                    <Award className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">내 V-Level</div>
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2 tracking-tight">{myVLevel}</div>
              </div>
            </div>

            {/* V레벨 시각화 */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                {allVLevels.map((level, index) => <div key={level} className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all ${index === currentVIndex ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : index < currentVIndex ? "bg-slate-300 dark:bg-slate-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      {level.replace("V", "")}
                    </div>
                    {index === currentVIndex && <div className="text-[9px] font-medium tracking-wider text-slate-500">현재</div>}
                  </div>)}
              </div>
              
              <div className="relative h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                <div className="absolute h-full bg-slate-900 dark:bg-white transition-all duration-1000" style={{
                width: `${(currentVIndex + 1) / allVLevels.length * 100}%`
              }} />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                <span className="font-semibold text-slate-900 dark:text-white">{vLevel}</span> 시험은{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{vLevelInfo?.grades}</span>{" "}
                수준의 문항으로 구성됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 나의 V-Level */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-900 dark:border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-900 dark:text-slate-100" />
              <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>나의 V-Level</h2>
            </div>
            <div className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base tracking-wider">
              {myVLevel}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              {allVLevels.map((level, index) => <div key={level} className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all ${index === myVIndex ? "bg-amber-500 text-white" : index < myVIndex ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                    {level.replace("V", "")}
                  </div>
                  {index === myVIndex && <div className="text-[9px] font-medium tracking-wider text-amber-600">달성</div>}
                </div>)}
            </div>
            
            <div className="relative h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="absolute h-full bg-amber-500 transition-all duration-1000" style={{
              width: `${(myVIndex + 1) / allVLevels.length * 100}%`
            }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">V-Level / 현재 등급</div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base tracking-wider">
                    {myVLevel}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {myVLevelInfo?.grades || "측정중"}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">CEFR 레벨</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {myVLevelInfo?.cefr || "-"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {(() => {
                  const cefr = myVLevelInfo?.cefr || "";
                  if (cefr === "C2" || cefr === "C2+") return "언어의 미묘한 뉘앙스까지 조정하며, 모든 상황에서 적절하고 자연스럽게 어휘를 운용함";
                  if (cefr === "C2-") return "거의 모든 상황에서 어휘를 정확하게 사용하나, 드문 문학적 표현에는 약간의 한계가 있음";
                  if (cefr === "C1+" || cefr === "C1+~C2") return "추상적·은유적 표현을 자유롭게 다루고, 문체적 변화를 능숙히 조절함";
                  if (cefr === "C1") return "다양한 문체와 복합어를 자유롭게 구사하며, 어휘 선택이 정밀하고 일관됨";
                  if (cefr === "C1-") return "학문적·전문적 주제에 필요한 어휘를 다루기 시작함. 어휘 사용이 정교해짐";
                  if (cefr === "B2+") return "유의어·관용표현 등을 자연스럽게 사용하며, 문체와 상황에 맞게 어휘를 조절함";
                  if (cefr === "B2") return "복잡한 주제에 맞는 어휘를 자유롭게 선택·조합 가능. 어휘의 뉘앙스를 인식함";
                  if (cefr === "B2-") return "일반적 주제에서 다양한 어휘를 사용하나, 전문 영역에서는 어휘 선택이 제한됨";
                  if (cefr === "B1+") return "동의어·반의어를 적절히 활용하며, 문맥에 따라 어휘를 변형해 표현할 수 있음";
                  if (cefr === "B1") return "일상적·사회적 주제에서 풍부하게 어휘를 사용 가능. 문장 내 어휘 정확도가 높아짐";
                  if (cefr === "B1-") return "익숙한 주제에서 어휘를 충분히 사용하나, 추상적 개념이나 미묘한 표현에는 한계가 있음";
                  if (cefr === "A2+") return "주제별로 다양한 단어를 활용할 수 있으며, 문맥에 맞게 어휘를 선택하는 능력이 향상됨";
                  if (cefr === "A2") return "일상 대화에 필요한 기본 어휘를 폭넓게 알고, 간단한 묘사나 이유 제시 가능";
                  if (cefr === "A2-") return "구체적 주제(가족, 장소, 음식 등)에 한정된 어휘를 사용함. 표현이 반복적이고 다양성이 부족함";
                  if (cefr === "A1+") return "익숙한 주제에서 간단한 문장으로 말하거나 쓸 수 있으며, 일부 동의어·반의어 구별 시작";
                  if (cefr === "A1") return "일상생활의 매우 기초적인 어휘를 이해하고 사용할 수 있음. 단순한 구문 내 단어 조합 가능";
                  if (cefr === "A1-" || cefr === "Pre-A1") return "극히 제한된 단어와 표현만 이해 가능. 기본 명사·동사 중심으로 단어를 개별적으로 인식함";
                  return "-";
                })()}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">{myVLevel}</span> 레벨은{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{myVLevelInfo?.vocabularyRange}</span>개 단어를 구사할 수 있는 수준입니다.{" "}
                {myVLevelInfo?.description}
              </p>
            </div>
          </div>
        </div>

        {/* 평가 결과 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-900 dark:border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-900 dark:text-slate-100" />
              <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>평가 결과</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-700">
            <div className="bg-white dark:bg-slate-900 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">현재 단어량</div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                약 {actualWords.toLocaleString()}단어
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="">
                  <Award className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">현재 등급</div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {myVLevelInfo?.grades}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">다음 단계 어휘량</div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {(() => {
                if (!nextVLevelInfo?.vocabularyRange) return '-';
                const range = String(nextVLevelInfo.vocabularyRange);
                const maxValue = range.split('-')[1]?.trim() || range;
                return maxValue;
              })()}개
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{nextVLevel} 최대 어휘</div>
            </div>
          </div>
        </div>

        {/* 최종 진단 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-900 dark:border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-slate-100" />
              <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>최종 진단</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs rounded-none border-slate-300 dark:border-slate-700 tracking-widest uppercase">
                {myVLevel}
              </Badge>
              <Badge variant="outline" className="text-xs rounded-none border-slate-300 dark:border-slate-700 tracking-widest uppercase">
                {myVLevelInfo?.cefr}
              </Badge>
              <Badge variant="outline" className="text-xs rounded-none border-slate-300 dark:border-slate-700 tracking-widest uppercase">
                {myVLevelInfo?.grades}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              현재 약 <span className="font-semibold text-slate-900 dark:text-white">{actualWords.toLocaleString()}개</span>의 단어를 구사할 수 있는{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{myVLevelInfo?.grades}</span> 수준입니다.{" "}
              {myVLevelInfo?.description} 다음 단계인{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{nextVLevelInfo?.grades}</span> 수준
              (<span className="font-semibold text-slate-900 dark:text-white">
                {(() => {
                if (!nextVLevelInfo?.vocabularyRange) return '-';
                const range = String(nextVLevelInfo.vocabularyRange);
                const maxValue = range.split('-')[1]?.trim() || range;
                return maxValue;
              })()}개
              </span>)에 도달하기 위해서는 
              약 <span className="font-semibold text-slate-900 dark:text-white">
                {(() => {
                if (!nextVLevelInfo?.vocabularyRange) return '-';
                const range = String(nextVLevelInfo.vocabularyRange);
                const maxValue = range.split('-')[1]?.trim() || range;
                const maxNumber = parseInt(maxValue.replace(/,/g, ''));
                if (isNaN(maxNumber)) return '-';
                return (maxNumber - actualWords).toLocaleString();
              })()}개
              </span>의 
              추가 어휘 학습이 필요합니다.
            </p>
          </div>
        </div>

        {/* V-Level 기준 지표표 */}
        <div className="space-y-6">
          {/* 옳은보카 Lite 시리즈 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>옳은보카 Lite 시리즈 (보카0~2)</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">초등~예비중 기초 어휘 과정</p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">옳은보카 단계</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">누적 어휘량</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">CEFR</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">V레벨</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">옳은영어 학년기준</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center">요약</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vocaLiteSeriesTableData.map((row, idx) => <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-medium">{row.level}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-semibold">{row.vocab}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700">{row.cefr}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-amber-600 dark:text-amber-400">{row.vlevel}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 text-xs">{row.grade}</TableCell>
                      <TableCell className="text-center text-xs">{row.summary}</TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 옳은보카 일반 시리즈 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">옳은보카 시리즈 (보카3~Ultimate)</h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">중등~고등 정규 어휘 과정 | **V-Level (Vocabulary Level)**은 학생의 단어량과 난이도를 공통유럽언어기준으로 시각화한 옳은영어의 진단 지표입니다.</p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">옳은보카 단계</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">누적 어휘량(약)</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">CEFR</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">V레벨</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-700">옳은영어 학년기준</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-white text-center">요약</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vocaMainSeriesTableData.map((row, idx) => <TableRow key={idx} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${row.level.includes('Ultimate') ? 'bg-amber-50/40' : ''}`}>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-medium">{row.level}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700">{row.vocab}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700">{row.cefr}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400">{row.vlevel}</TableCell>
                      <TableCell className="text-center border-r border-slate-200 dark:border-slate-700 text-xs">{row.grade}</TableCell>
                      <TableCell className="text-center text-xs">{row.summary}</TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* 저작권 표시 */}
        <div className="text-center py-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 ORUN ENGLISH. All rights reserved.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">이용약관</span>
            <span className="mx-2">|</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">개인정보처리방침</span>
            <span className="mx-2">|</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">문의하기</span>
          </p>
        </div>
      </div>;
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }} />
      
      {/* 그라데이션 오버레이 */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-gradient-to-bl from-blue-100/40 via-indigo-100/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-72 bg-gradient-to-tr from-emerald-100/30 via-teal-100/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
          
          {/* 프리미엄 헤더 */}
          <PageHeader icon={examResultsPageIcon} iconAlt="시험 결과" title={isAdmin ? "시험 결과 분석" : "나의 학습 성과"} subtitle="​">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl px-5 py-3 border border-slate-600/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">총 시험</span>
                </div>
                <span className="text-2xl font-bold text-white">{exams.length}<span className="text-sm font-normal text-slate-400 ml-1">개</span></span>
              </div>
              {exams.length > 0 && <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl px-5 py-3 border border-slate-600/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">총 응시자</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {exams.reduce((sum, e) => sum + e.submissions.length, 0)}<span className="text-sm font-normal text-slate-400 ml-1">명</span>
                  </span>
                </div>}
            </div>
          </PageHeader>
        </div>

        {/* ZIP 다운로드 진행 오버레이 */}
        {zipProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-2">
                  <FolderArchive className="w-7 h-7 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">리포트 다운로드 중</h3>
                <p className="text-sm text-slate-500">
                  {zipProgress.current === 0
                    ? '리포트를 준비하고 있습니다...'
                    : `${zipProgress.studentName} 처리 완료`}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">{zipProgress.current}/{zipProgress.total}명 완료</span>
                  <span className="text-blue-600">{zipProgress.total > 0 ? Math.round((zipProgress.current / zipProgress.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${zipProgress.total > 0 ? (zipProgress.current / zipProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* 엑셀 업로드 버튼 - 관리자만 표시 */}
          {isAdmin && <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="group relative w-full md:w-auto bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 rounded-xl px-4 h-10 font-semibold tracking-[-0.01em]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  <span className="relative flex items-center justify-center">
                    <span className="mr-2 inline-flex w-6 h-6 rounded-lg bg-slate-900 items-center justify-center shadow-[0_4px_10px_-4px_rgba(15,23,42,0.5)]">
                      <Upload className="w-3.5 h-3.5 text-white" />
                    </span>
                    <span className="text-[12.5px]">CSV 파일로 시험결과 직접 입력</span>
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    시험 결과 직접 입력
                  </DialogTitle>
                  <DialogDescription>
                    엑셀 파일을 업로드하여 시험 결과를 등록합니다. 파일에는 소속반, 이름, 총점 열이 포함되어야 합니다.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="examTitle">시험명</Label>
                    <Input id="examTitle" placeholder="예: 옳은영어 Vocathon 12월" value={uploadExamTitle} onChange={e => setUploadExamTitle(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="examDate">시험일자</Label>
                    <Input id="examDate" type="date" value={uploadExamDate} onChange={e => setUploadExamDate(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wordbook">사용 단어장</Label>
                    <Select value={uploadWordbook} onValueChange={setUploadWordbook}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="단어장을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {cardSetsList.map(cardSet => <SelectItem key={cardSet.id} value={cardSet.title}>
                            {cardSet.title}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      V-Level 계산에 사용됩니다
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excelFile">엑셀 파일</Label>
                    <div className="flex items-center gap-2">
                      <Input id="excelFile" type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={e => setUploadFile(e.target.files?.[0] || null)} className="flex-1" />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 font-medium mb-1">파일 형식 안내:</p>
                      <p className="text-xs text-slate-500">
                        엑셀 파일의 첫 번째 행에는 열 헤더가 있어야 합니다.
                      </p>
                      <div className="mt-2 overflow-hidden rounded border border-slate-200">
                        <table className="text-xs w-full">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-2 py-1 text-left text-slate-600 font-medium border-r border-slate-200">소속반</th>
                              <th className="px-2 py-1 text-left text-slate-600 font-medium border-r border-slate-200">이름</th>
                              <th className="px-2 py-1 text-left text-slate-600 font-medium">총점</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            <tr>
                              <td className="px-2 py-1 text-slate-500 border-r border-slate-200">6FO</td>
                              <td className="px-2 py-1 text-slate-500 border-r border-slate-200">김옳은</td>
                              <td className="px-2 py-1 text-slate-500">90</td>
                            </tr>
                            <tr className="border-t border-slate-100">
                              <td className="px-2 py-1 text-slate-500 border-r border-slate-200">3FO</td>
                              <td className="px-2 py-1 text-slate-500 border-r border-slate-200">김토르</td>
                              <td className="px-2 py-1 text-slate-500">80</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isUploading}>
                      취소
                    </Button>
                  </DialogClose>
                  <Button onClick={handleExcelUpload} disabled={isUploading || !uploadExamTitle || !uploadExamDate || !uploadWordbook || !uploadFile} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                    {isUploading ? <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        업로드 중...
                      </> : <>
                        <Upload className="w-4 h-4 mr-2" />
                        업로드
                      </>}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>}

          {exams.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">아직 시험 결과가 없습니다</h3>
              <p className="text-slate-500">첫 시험을 완료하면 여기에 결과가 표시됩니다.</p>
            </div> : <div className="space-y-8">
              {exams.map((exam, examIndex) => {
            const avgScore = getAverageScore(exam.submissions);

            // 평균 V-Level 계산
            const titleToCheck = exam.card_sets?.title || exam.title;
            const avgVLevels = exam.submissions.map(s => {
              const examTitleVLevel = getVLevelByExamTitle(titleToCheck);
              return examTitleVLevel || getVLevelByScore(s.score);
            });
            const avgVLevelNum = avgVLevels.reduce((sum, v) => sum + parseInt(v.replace('V', '')), 0) / avgVLevels.length;
            const avgVLevel = `V${Math.round(avgVLevelNum)}`;
            const gradeInfo = getScoreGrade(avgScore);
            return <Collapsible key={exam.id} defaultOpen={false} open={zipExpandedExamId === exam.id ? true : undefined}>
                    <div className="group relative rounded-[18px] overflow-hidden bg-white ring-1 ring-slate-200/80 shadow-[0_6px_20px_-12px_rgba(15,23,42,0.16)] hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.22)] hover:ring-slate-300/80 transition-all duration-300" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                      {/* 상단 앰버 액센트 */}
                      <div className="h-[2px] bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />

                      <CollapsibleTrigger className="w-full group/trigger">
                        <div className="relative px-4 py-3 transition-all duration-200 cursor-pointer hover:bg-slate-50/60">
                          <div className="flex items-start gap-3">
                            {/* 메인 콘텐츠 */}
                            <div className="flex-1 min-w-0 text-left">
                              {/* 상단: 상태 + 날짜 */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold ring-1 ring-amber-200/60">
                                  진행 중
                                </span>
                                <span className="text-[11px] text-slate-400 tabular-nums">
                                  {new Date(exam.created_at).toLocaleDateString("ko-KR")}
                                </span>
                              </div>

                              {/* 제목 */}
                              <h2 className="font-semibold text-slate-800 text-[15px] mb-1 leading-tight tracking-[-0.02em]">
                                {exam.title}
                              </h2>

                              {/* 단어장 뱃지 */}
                              {exam.card_sets?.title && <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-50 text-lime-700 ring-1 ring-lime-200/70 mb-2">
                                  <BookOpen className="w-3 h-3" />
                                  <span className="text-[10px] font-semibold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                                    {exam.card_sets.title}
                                  </span>
                                </div>}

                              {/* 메타 정보 - 깔끔한 행 */}
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="flex items-center gap-1.5 text-slate-500">
                                    <FileText className="w-3 h-3 text-slate-400" />
                                    문제 수
                                  </span>
                                  <span className="font-medium text-slate-700 tabular-nums">{exam.total_questions}문항</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="flex items-center gap-1.5 text-slate-500">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    응시 인원
                                  </span>
                                  <span className="font-medium text-slate-700 tabular-nums">{exam.submissions.length}명</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="flex items-center gap-1.5 text-slate-500">
                                    <BarChart3 className="w-3 h-3 text-slate-400" />
                                    유형
                                  </span>
                                  <span className="font-medium text-slate-700">
                                    {[exam.multiple_choice_count > 0 && `객관식 ${exam.multiple_choice_count}`, exam.spelling_count > 0 && `철자 ${exam.spelling_count}`, exam.definition_count > 0 && `영영 ${exam.definition_count}`, exam.example_count > 0 && `예문 ${exam.example_count}`].filter(Boolean).join(' · ')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200" onClick={e => {
                          e.stopPropagation();
                          handleDownloadAllAsExcel(exam);
                        }} title="엑셀 다운로드">
                                  <FileSpreadsheet className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-200" onClick={e => {
                          e.stopPropagation();
                          handleDownloadAllAsZip(exam);
                        }} title="ZIP 다운로드">
                                  <FolderArchive className="w-3.5 h-3.5" />
                                </Button>
                                {isAdmin && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200" 
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleRegradeExam(exam.id, exam.title);
                                      }} 
                                      title="재채점"
                                      disabled={regradingExamId === exam.id}
                                    >
                                      {regradingExamId === exam.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <ClipboardCheck className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200" onClick={e => {
                          e.stopPropagation();
                          handleDeleteExam(exam.id, exam.title, exam.submissions.length);
                        }} title="시험 삭제">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 ring-1 ring-slate-200 group-hover:bg-slate-200 transition-colors">
                                <ChevronDown className="w-4 h-4 text-slate-500 group-data-[state=open]/trigger:rotate-180 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                        
                      <CollapsibleContent>
                        <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-100 bg-slate-50/30">
                          <div className="overflow-x-auto rounded-lg border border-slate-200/80 mt-4 shadow-sm bg-white">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-100 hover:to-slate-50">
                                  <TableHead className="font-semibold text-slate-700">순위</TableHead>
                                  <TableHead className="font-semibold text-slate-700">학생명</TableHead>
                                    <TableHead className="font-bold text-slate-700">
                                      <Select value={classFilter[exam.id] || "all"} onValueChange={value => setClassFilter(prev => ({
                                ...prev,
                                [exam.id]: value
                              }))}>
                                        <SelectTrigger className="w-[100px] h-8 text-xs font-bold border-0 bg-transparent hover:bg-slate-200/50 focus:ring-0 focus:ring-offset-0">
                                          <SelectValue placeholder="소속반" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">전체</SelectItem>
                                          {(() => {
                                    const classes = [...new Set(exam.submissions.map(s => s.student_class).filter(Boolean))];
                                    return classes.map(cls => <SelectItem key={cls} value={cls!}>{cls}</SelectItem>);
                                  })()}
                                        </SelectContent>
                                      </Select>
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700">
                                      <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto font-bold text-slate-700 hover:text-blue-600 hover:bg-transparent" onClick={() => setSortOrder(prev => ({
                                ...prev,
                                [exam.id]: prev[exam.id] === 'asc' ? 'desc' : 'asc'
                              }))}>
                                        점수
                                        {sortOrder[exam.id] === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : sortOrder[exam.id] === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                                      </Button>
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700">등급</TableHead>
                                    <TableHead className="font-bold text-slate-700">정답률</TableHead>
                                    <TableHead className="font-bold text-slate-700">응시일시</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-center">리포트</TableHead>
                                    {isAdmin && <TableHead className="font-bold text-slate-700 text-center">관리</TableHead>}
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white">
                                  {[...exam.submissions].filter(s => !classFilter[exam.id] || classFilter[exam.id] === "all" || s.student_class === classFilter[exam.id]).sort((a, b) => {
                            const order = sortOrder[exam.id];
                            if (order === 'asc') return a.score - b.score;
                            return b.score - a.score;
                          }).map((submission, index) => {
                            const gradeInfo = getScoreGrade(submission.score);
                            const accuracy = submission.correct_count / submission.total_count * 100;
                            return <>
                                          <TableRow key={submission.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-all duration-200">
                                            <TableCell className="font-medium text-slate-700">
                                              <div className="flex items-center gap-2">
                                                {index === 0 && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                                                    <Award className="w-3.5 h-3.5 text-white" />
                                                  </div>}
                                                {index === 1 && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow">
                                                    <span className="text-xs font-bold text-white">2</span>
                                                  </div>}
                                                {index === 2 && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 flex items-center justify-center shadow">
                                                    <span className="text-xs font-bold text-white">3</span>
                                                  </div>}
                                                {index > 2 && <span className="w-6 text-center text-slate-500">{index + 1}</span>}
                                              </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-900">
                                              {editingNameId === submission.id ? <div className="flex items-center gap-1">
                                                  <Input value={editingNameValue} onChange={e => setEditingNameValue(e.target.value)} className="h-7 w-24 text-xs" placeholder="이름 입력" autoFocus onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleUpdateStudentName(submission.id, exam.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingName();
                                      }
                                    }} />
                                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStudentName(submission.id, exam.id)}>
                                                    <Check className="w-3.5 h-3.5" />
                                                  </Button>
                                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={cancelEditingName}>
                                                    <X className="w-3.5 h-3.5" />
                                                  </Button>
                                                </div> : <div className="flex items-center gap-1 group/name cursor-pointer" onClick={() => startEditingName(submission.id, submission.student_name)}>
                                                  {submission.student_name}
                                                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                                </div>}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                              {editingClassId === submission.id ? <div className="flex items-center gap-1">
                                                  <Input value={editingClassValue} onChange={e => setEditingClassValue(e.target.value)} className="h-7 w-20 text-xs" placeholder="반 입력" autoFocus onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleUpdateStudentClass(submission.id, exam.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingClass();
                                      }
                                    }} />
                                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStudentClass(submission.id, exam.id)}>
                                                    <Check className="w-3.5 h-3.5" />
                                                  </Button>
                                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={cancelEditingClass}>
                                                    <X className="w-3.5 h-3.5" />
                                                  </Button>
                                                </div> : <div className="flex items-center gap-1 group/class cursor-pointer" onClick={() => startEditingClass(submission.id, submission.student_class)}>
                                                  {submission.student_class ? <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                                                      {submission.student_class}
                                                    </span> : <span className="text-slate-400">-</span>}
                                                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/class:opacity-100 transition-opacity" />
                                                </div>}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-1.5">
                                                <span className={`text-lg font-bold ${gradeInfo.textColor}`}>
                                                  {submission.score}
                                                </span>
                                                <span className="text-sm text-slate-500">점</span>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge className={`${gradeInfo.bgColor} ${gradeInfo.textColor} border-0 text-xs font-bold px-3 py-0.5 shadow-sm`}>
                                                {gradeInfo.grade}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <div className="flex-1 max-w-[80px]">
                                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm" style={{
                                          width: `${accuracy}%`
                                        }} />
                                                  </div>
                                                </div>
                                                <span className="text-sm text-slate-700 min-w-[100px]">
                                                  {submission.correct_count} / {submission.total_count}
                                                  <span className="text-xs ml-1 text-slate-500">
                                                    ({accuracy.toFixed(0)}%)
                                                  </span>
                                                </span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-700">
                                              {new Date(submission.submitted_at).toLocaleString("ko-KR", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <div className="flex items-center justify-center gap-2">
                                                <Button size="sm" variant={expandedSubmission === submission.id ? "default" : "outline"} className={`gap-1.5 text-xs transition-all duration-300 ${expandedSubmission === submission.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-md' : 'bg-white border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-slate-700'}`} onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}>
                                                  {expandedSubmission === submission.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                  {expandedSubmission === submission.id ? "닫기" : "리포트"}
                                                </Button>
                                                <Button size="sm" variant="outline" className="gap-1.5 text-xs bg-white border-slate-300 hover:bg-emerald-50 hover:border-emerald-400 text-slate-700 hover:text-emerald-700 transition-all duration-300" onClick={() => handleDownloadReport(submission.id, submission.student_name, submission.student_class, exam.title)} title="리포트 다운로드">
                                                  <Image className="w-3.5 h-3.5" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                            {isAdmin && <TableCell className="text-center">
                                                <Button size="sm" variant="outline" className="gap-1.5 text-xs bg-white border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600 hover:text-red-700 transition-all duration-300" onClick={() => handleDeleteSubmission(submission.id, submission.student_name, exam.id)} title="결과 삭제">
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                              </TableCell>}
                                          </TableRow>
                                          {(expandedSubmission === submission.id || zipExpandedExamId === exam.id) && <TableRow key={`${submission.id}-report`}>
                                              <TableCell colSpan={isAdmin ? 8 : 7} className="bg-slate-50 border-t border-slate-200 p-0">
                                                <div ref={el => reportRefs.current[submission.id] = el} data-report-id={submission.id} className="p-8">
                                                  {renderStudentReport(submission, exam)}
                                                </div>
                                              </TableCell>
                                            </TableRow>}
                                        </>;
                          })}
                                </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>;
          })}
            </div>}
        </div>
      </div>
    </div>;
};
export default ExamResults;