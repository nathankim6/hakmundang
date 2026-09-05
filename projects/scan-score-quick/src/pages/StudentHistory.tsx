import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, Download, Filter, BarChart3, Award, FileText, SortAsc, SortDesc, Package, Loader2, X, ChevronDown, ChevronUp, Image, FileSpreadsheet } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import StudentHistoryView from '@/components/StudentHistoryView';
import PageHeader from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';
import JSZip from 'jszip';
import { toJpeg } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import DownloadProgressOverlay from '@/components/DownloadProgressOverlay';
import { useBackgroundDownload } from '@/hooks/useBackgroundDownload';
import { enablePiPKeepAlive, disablePiPKeepAlive, enableSilentAudioKeepAlive, disableSilentAudioKeepAlive } from '@/utils/backgroundTask';
interface StudentData {
  id: string;
  student_name: string;
  student_class: string | null;
  test_count: number;
  average_score: number;
  total_score: number;
}
const StudentHistory = () => {
  const navigate = useNavigate();
  const {
    studentName: urlStudentName
  } = useParams();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('전체');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'count'>('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [downloadDone, setDownloadDone] = useState(false);
  const {
    toast
  } = useToast();
  const abortDownloadRef = useRef(false);
  const reportRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const downloadDoneRef = useRef(false);
  const { acquireWakeLock, releaseWakeLock, notify } = useBackgroundDownload();
  useEffect(() => {
    fetchStudentData();
    const channel = supabase.channel('student-history-45q').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'test_results',
      filter: 'total_count=eq.45'
    }, () => {
      fetchStudentData();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    if (urlStudentName && students.length > 0) {
      const decodedName = decodeURIComponent(urlStudentName);
      const student = students.find(s => s.student_name === decodedName);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [urlStudentName, students]);
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const {
        data: resultsData,
        error: resultsError
      } = await supabase.from('test_results').select('*').eq('total_count', 45).order('created_at', {
        ascending: false
      });
      if (resultsError) throw resultsError;
      const studentMap = new Map<string, StudentData>();
      const classSet = new Set<string>();

      // 학생 식별자(이름+숫자4자리)로 그룹화 — 반(class)이 달라도 동일 학생으로 묶음
      // 반 이름에 공백이 있어도 마지막 두 토큰(이름 + 4자리)을 식별자로 사용
      const getIdentity = (fullName: string) => {
        const parts = (fullName || '').trim().split(/\s+/);
        if (parts.length >= 2) return parts.slice(-2).join(' ');
        return fullName;
      };
      const studentResultsMap = new Map<string, any[]>();
      resultsData?.forEach(result => {
        const identity = getIdentity(result.student_name);
        if (!studentResultsMap.has(identity)) {
          studentResultsMap.set(identity, []);
        }
        studentResultsMap.get(identity)!.push(result);
      });

      // 각 학생의 중복 제거된 시험 결과 집계
      studentResultsMap.forEach((results, identity) => {
        // 모든 응시 반 수집 (필터링 시 어떤 반으로 분류돼도 노출되도록)
        const classesForStudent = new Set<string>();
        results.forEach(r => {
          const raw = (r.student_name || '').trim();
          const idx = raw.lastIndexOf(' ');
          if (idx > 0) classesForStudent.add(raw.slice(0, idx).trim());
        });
        classesForStudent.forEach(c => classSet.add(c));
        // 가장 최근 결과의 반을 대표 반으로 사용 (반 이름에 공백이 있을 수 있으므로 마지막 공백 기준 분리)
        const latestRaw = (results[0].student_name || '').trim();
        const latestIdx = latestRaw.lastIndexOf(' ');
        const studentClass = latestIdx > 0 ? latestRaw.slice(0, latestIdx).trim() : null;

        // 중복 제거: 시험명(test_id), 응시날짜(날짜만), 득점이 동일한 경우 1개만 남김
        const uniqueResults: any[] = [];
        const seenKeys = new Set<string>();
        results.forEach(result => {
          // 날짜에서 시간을 제거하고 날짜만 추출
          const dateOnly = format(new Date(result.created_at), 'yyyy-MM-dd');
          // 중복 체크를 위한 키 생성: test_id + 날짜 + 점수
          const key = `${result.test_id}_${dateOnly}_${result.score.toFixed(1)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueResults.push(result);
          }
        });

        // 중복 제거된 결과로 집계
        const totalScore = uniqueResults.reduce((sum, r) => sum + r.score, 0);
        const testCount = uniqueResults.length;
        studentMap.set(identity, {
          id: results[0].id,
          // 식별자 기반 표시명 (반이 달라도 하나로 묶임). 상세 조회시 like 매칭에 사용됨
          student_name: identity,
          student_class: classesForStudent.size > 1
            ? Array.from(classesForStudent).sort().join('/')
            : studentClass,
          test_count: testCount,
          total_score: totalScore,
          average_score: testCount > 0 ? totalScore / testCount : 0
        });
      });
      const studentsArray = Array.from(studentMap.values()).sort((a, b) => b.average_score - a.average_score);
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
      setAvailableClasses(['전체', ...Array.from(classSet).sort()]);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let filtered = students;
    if (selectedClass !== '전체') {
      filtered = filtered.filter(student => {
        const cls = student.student_class || '';
        // 합쳐진 반 표기("A/B")도 부분 일치로 통과
        return cls.split('/').includes(selectedClass);
      });
    }
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(student => student.student_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'desc' ? b.average_score - a.average_score : a.average_score - b.average_score;
      } else {
        return sortOrder === 'desc' ? b.test_count - a.test_count : a.test_count - b.test_count;
      }
    });
    setFilteredStudents(filtered);
  }, [searchQuery, selectedClass, students, sortBy, sortOrder]);
  const handleStudentSelect = (student: StudentData) => {
    setSelectedStudent(student);
    navigate(`/student-history/${encodeURIComponent(student.student_name)}`, {
      replace: true
    });
  };

  const toggleStudentExpand = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleBack = () => {
    setSelectedStudent(null);
    navigate('/student-history', {
      replace: true
    });
  };
  const getBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 50) return "bg-red-500";
    if (score >= 40) return "bg-red-600";
    if (score >= 30) return "bg-red-700";
    if (score >= 20) return "bg-red-800";
    return "bg-red-900";
  };
  const getGrade = (score: number): number => {
    if (score >= 90) return 1;
    if (score >= 80) return 2;
    if (score >= 70) return 3;
    if (score >= 60) return 4;
    if (score >= 50) return 5;
    if (score >= 40) return 6;
    if (score >= 30) return 7;
    if (score >= 20) return 8;
    return 9;
  };
  const handleDownloadAllReports = async () => {
    if (filteredStudents.length === 0) {
      toast({
        title: "다운로드 불가",
        description: "다운로드할 학생이 없습니다.",
        variant: "destructive"
      });
      return;
    }
    setDownloadingAll(true);
    setDownloadDone(false);
    downloadDoneRef.current = false;
    setDownloadProgress({ current: 0, total: filteredStudents.length });
    abortDownloadRef.current = false;
    // ⚠️ gesture 만료 전 동기 호출
    enableSilentAudioKeepAlive();
    await enablePiPKeepAlive('학생 리포트 다운로드 중');
    await acquireWakeLock();
    const zip = new JSZip();
    const successfulDownloads: string[] = [];
    const failedDownloads: string[] = [];

    // Expand all students first for report rendering
    const allStudentIds = new Set(filteredStudents.map(s => s.id));
    setExpandedStudents(allStudentIds);

    // Wait for all reports to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      toast({
        title: "다운로드 시작",
        description: `${filteredStudents.length}명의 리포트를 생성 중입니다...`
      });

      for (let i = 0; i < filteredStudents.length; i++) {
        if (abortDownloadRef.current) {
          toast({
            title: "다운로드 중단됨",
            description: `${successfulDownloads.length}개의 리포트가 생성되었습니다.`,
            variant: "default"
          });
          break;
        }

        const student = filteredStudents[i];
        setDownloadProgress({ current: i + 1, total: filteredStudents.length });

        try {
          const reportElement = reportRefs.current.get(student.id);
          if (!reportElement) {
            throw new Error('리포트 요소를 찾을 수 없습니다.');
          }

          const dataUrl = await toJpeg(reportElement, {
            quality: 1.0,
            backgroundColor: '#ffffff',
            cacheBust: true,
            pixelRatio: 4,
            filter: (node: HTMLElement | SVGElement) => {
              try {
                if (node instanceof Element) {
                  const rect = node.getBoundingClientRect();
                  return rect.width > 0 && rect.height > 0 && isFinite(rect.width) && isFinite(rect.height);
                }
              } catch (_) {}
              return true;
            }
          } as any);

          const base64Data = dataUrl.split(',')[1];
          const binaryData = atob(base64Data);
          const arrayBuffer = new ArrayBuffer(binaryData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let j = 0; j < binaryData.length; j++) {
            uint8Array[j] = binaryData.charCodeAt(j);
          }

          const nameParts = student.student_name.split(' ');
          const className = nameParts.length > 1 ? nameParts[0] : '미분류';
          const studentName = nameParts.length > 1 ? nameParts.slice(1).join('_') : student.student_name;
          const filename = `${className}_${studentName}_누적성적리포트.jpg`;
          zip.file(filename, uint8Array);
          successfulDownloads.push(student.student_name);

          // Brief delay between captures
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          console.error(`Failed to download report for ${student.student_name}:`, error);
          failedDownloads.push(student.student_name);
        }
      }

      if (!abortDownloadRef.current && successfulDownloads.length > 0) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `학생_리포트_모음_${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);

        toast({
          title: "다운로드 완료",
          description: `${successfulDownloads.length}명의 리포트가 저장되었습니다.${failedDownloads.length > 0 ? ` (실패: ${failedDownloads.length}명)` : ''}`
        });
        setDownloadDone(true);
        downloadDoneRef.current = true;
        notify(
          '리포트 다운로드 완료',
          `${successfulDownloads.length}명의 리포트 ZIP 파일이 저장되었습니다.`
        );
        // 완료 상태를 4초 보여주고 자동 숨김
        setTimeout(() => {
          setDownloadingAll(false);
          setDownloadDone(false);
          setDownloadProgress({ current: 0, total: 0 });
        }, 4000);
      }

    } catch (error) {
      console.error('Download all error:', error);
      toast({
        title: "다운로드 실패",
        description: "리포트 다운로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      await releaseWakeLock();
      await disablePiPKeepAlive();
      await disableSilentAudioKeepAlive();
      // 성공 완료시에는 위 setTimeout 에서 4초 후 정리. 그 외(중단/실패/0건)는 즉시 정리
      if (!downloadDoneRef.current) {
        setDownloadingAll(false);
        setDownloadProgress({ current: 0, total: 0 });
      }
      abortDownloadRef.current = false;
      // Collapse all students after download
      setExpandedStudents(new Set());
    }
  };

  const handleAbortDownload = () => {
    abortDownloadRef.current = true;
    toast({
      title: "중단 중...",
      description: "현재 진행 중인 리포트를 완료한 후 중단됩니다."
    });
  };

  // 취약유형 분석 함수
  const analyzeWeakTypesForStudent = (studentAnswersList: any[], testAnswersMap: Record<string, any>) => {
    const typeRanges: Record<string, { questions: number[]; wrong: number; total: number }> = {
      '듣기': { questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], wrong: 0, total: 0 },
      '목적/심경': { questions: [18, 19], wrong: 0, total: 0 },
      '대의파악': { questions: [20, 21, 22, 23, 24, 40], wrong: 0, total: 0 },
      '내용일치': { questions: [25, 26, 27, 28], wrong: 0, total: 0 },
      '어법/어휘': { questions: [29, 30], wrong: 0, total: 0 },
      '빈칸추론': { questions: [31, 32, 33, 34], wrong: 0, total: 0 },
      '무관한문장': { questions: [35], wrong: 0, total: 0 },
      '순서/삽입': { questions: [36, 37, 38, 39], wrong: 0, total: 0 },
      '장문': { questions: [41, 42, 43, 44, 45], wrong: 0, total: 0 }
    };

    studentAnswersList.forEach(result => {
      const correctAnswers = testAnswersMap[result.test_id];
      if (!correctAnswers) return;
      if (result.student_answers && typeof result.student_answers === 'object') {
        Object.entries(result.student_answers).forEach(([questionNum, studentAnswer]: [string, any]) => {
          const num = parseInt(questionNum);
          if (isNaN(num)) return;
          const correctAnswer = correctAnswers[questionNum];
          if (!correctAnswer) return;

          Object.entries(typeRanges).forEach(([typeName, typeData]) => {
            if (typeData.questions.includes(num)) {
              typeData.total++;
              const studentAnswerValue = studentAnswer?.answer?.[0] || studentAnswer;
              const correctAnswerValue = correctAnswer?.answer?.[0] || correctAnswer;
              if (studentAnswerValue !== correctAnswerValue) {
                typeData.wrong++;
              }
            }
          });
        });
      }
    });

    return Object.entries(typeRanges)
      .map(([name, data]) => ({
        name,
        wrong: data.wrong,
        total: data.total,
        rate: data.total > 0 ? data.wrong / data.total * 100 : 0
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);
  };

  // CSV 엑셀 다운로드 함수
  const handleDownloadCSV = async () => {
    if (filteredStudents.length === 0) {
      toast({
        title: "다운로드 불가",
        description: "다운로드할 데이터가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "데이터 준비 중...",
      description: "취약유형 분석을 위해 데이터를 가져오고 있습니다."
    });

    try {
      // 전체 test_results와 tests 데이터 가져오기
      const { data: allResults } = await supabase
        .from('test_results')
        .select('*')
        .eq('total_count', 45);

      const { data: allTests } = await supabase
        .from('tests')
        .select('test_id, answers');

      const testAnswersMap: Record<string, any> = {};
      allTests?.forEach(test => {
        testAnswersMap[test.test_id] = test.answers;
      });

      // 학생별 결과 그룹화
      const studentResultsMap = new Map<string, any[]>();
      allResults?.forEach(result => {
        const name = result.student_name;
        if (!studentResultsMap.has(name)) {
          studentResultsMap.set(name, []);
        }
        studentResultsMap.get(name)!.push(result);
      });

      const headers = ['순번', '반', '이름', '응시횟수', '평균점수', '등급', '취약유형1', '취약유형2', '취약유형3'];
      const rows = filteredStudents.map((student, index) => {
        const nameParts = student.student_name.split(' ');
        const className = nameParts.length > 1 ? nameParts[0] : '미분류';
        const studentName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : student.student_name;
        
        // 해당 학생의 취약유형 분석
        const studentResults = studentResultsMap.get(student.student_name) || [];
        const weakTypes = analyzeWeakTypesForStudent(studentResults, testAnswersMap);
        
        return [
          index + 1,
          className,
          studentName,
          student.test_count,
          student.average_score.toFixed(1),
          getGrade(student.average_score),
          weakTypes[0] ? `${weakTypes[0].name}(${weakTypes[0].rate.toFixed(0)}%)` : '-',
          weakTypes[1] ? `${weakTypes[1].name}(${weakTypes[1].rate.toFixed(0)}%)` : '-',
          weakTypes[2] ? `${weakTypes[2].name}(${weakTypes[2].rate.toFixed(0)}%)` : '-'
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `학생_성적_데이터_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "다운로드 완료",
        description: `${filteredStudents.length}명의 데이터가 CSV로 저장되었습니다.`
      });
    } catch (error) {
      console.error('CSV download error:', error);
      toast({
        title: "다운로드 실패",
        description: "데이터를 가져오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 개별 리포트 이미지 다운로드
  const handleDownloadIndividualReport = async (student: StudentData, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 리포트가 펼쳐져 있지 않으면 먼저 펼치기
    if (!expandedStudents.has(student.id)) {
      setExpandedStudents(prev => new Set(prev).add(student.id));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const reportElement = reportRefs.current.get(student.id);
    if (!reportElement) {
      toast({
        title: "오류",
        description: "리포트를 찾을 수 없습니다. 먼저 리포트를 펼쳐주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "이미지 생성 중...",
        description: "잠시만 기다려주세요."
      });

      const dataUrl = await toJpeg(reportElement, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 4,
        filter: (node: HTMLElement | SVGElement) => {
          try {
            if (node instanceof Element) {
              const rect = node.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && isFinite(rect.width) && isFinite(rect.height);
            }
          } catch (_) {}
          return true;
        }
      } as any);

      const nameParts = student.student_name.split(' ');
      const className = nameParts.length > 1 ? nameParts[0] : '미분류';
      const studentName = nameParts.length > 1 ? nameParts.slice(1).join('_') : student.student_name;
      const filename = `${className}_${studentName}_누적성적리포트.jpg`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();

      toast({
        title: "다운로드 완료",
        description: `${student.student_name} 리포트가 저장되었습니다.`
      });
    } catch (error) {
      console.error('Individual report download error:', error);
      toast({
        title: "다운로드 실패",
        description: "리포트 이미지 생성에 실패했습니다.",
        variant: "destructive"
      });
    }
  };
  if (selectedStudent) {
    return <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Button variant="ghost" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  목록으로 돌아가기
                </Button>
                
                <div className="flex items-center gap-5">
                  <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                    <img src={brainiacLogo.url} alt="Brainiac English" className="h-9 w-auto" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                      {selectedStudent.student_name} 학생 리포트
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">모의고사 누적 성적 분석</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-8 py-12">
          <StudentHistoryView studentName={selectedStudent.student_name} studentClass={selectedStudent.student_class || undefined} />
        </div>
      </div>;
  }
  const totalStudents = students.length;
  const averageOfAll = students.reduce((sum, s) => sum + s.average_score, 0) / (totalStudents || 1);
  const highestScore = Math.max(...students.map(s => s.average_score), 0);
  const totalTests = students.reduce((sum, s) => sum + s.test_count, 0);
  return <div className="min-h-screen bg-[#fbfbfd]">
      <PageHeader
        title="Student Performance Analytics"
        subtitle="45문항 시험 누적 성적 분석"
        backPath="/"
      >
        <div className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-slate-900/[0.04] text-[13px] font-medium text-slate-700 tracking-tight">
          <Users className="h-3.5 w-3.5 text-slate-500" />
          {totalStudents}명
        </div>
        <div className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-slate-900/[0.04] text-[13px] font-medium text-slate-700 tracking-tight">
          <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
          평균 {averageOfAll.toFixed(1)}점
        </div>
      </PageHeader>

      <DownloadProgressOverlay
        visible={downloadingAll}
        current={downloadProgress.current}
        total={downloadProgress.total}
        title="누적 리포트 일괄 다운로드"
        subtitle={downloadDone ? undefined : `${downloadProgress.current} / ${downloadProgress.total} 처리 중`}
        onAbort={handleAbortDownload}
        done={downloadDone}
      />

      <div className="container mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: Users, label: '총 학생', value: totalStudents, suffix: '명', delay: 0.05 },
            { icon: BarChart3, label: '전체 평균', value: averageOfAll.toFixed(1), suffix: '점', delay: 0.1 },
            { icon: Award, label: '평균 등급', value: `${getGrade(averageOfAll)}`, suffix: '등급', delay: 0.15 },
            { icon: FileText, label: '총 응시', value: totalTests, suffix: '회', delay: 0.2 },
          ].map(({ icon: Icon, label, value, suffix, delay }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
              <Card className="border border-slate-900/[0.06] bg-white shadow-none rounded-2xl p-5 transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium tracking-tight text-slate-500">{label}</span>
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-[28px] leading-none font-semibold text-slate-900 tracking-[-0.02em]">
                  {value}<span className="text-[13px] font-normal text-slate-400 ml-1 tracking-tight">{suffix}</span>
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border border-slate-900/[0.06] bg-white shadow-none rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-900/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 bg-gradient-to-b from-slate-700 to-slate-400 rounded-full" />
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">학생 성적 목록</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {filteredStudents.length}명 | 45문항 시험 기준
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {downloadingAll ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 tabular-nums">
                        {downloadProgress.current}/{downloadProgress.total}
                      </span>
                      <Button onClick={handleAbortDownload} variant="destructive" size="sm" className="h-7 text-xs gap-1.5">
                        <X className="w-3 h-3" />
                        중단
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={handleDownloadAllReports} 
                        disabled={filteredStudents.length === 0} 
                        size="sm" 
                        className="h-7 text-xs gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
                      >
                        <Package className="w-3 h-3" />
                        ZIP
                      </Button>
                      <Button 
                        onClick={handleDownloadCSV} 
                        disabled={filteredStudents.length === 0} 
                        variant="outline"
                        size="sm" 
                        className="h-7 text-xs gap-1.5 border-slate-200"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        CSV
                      </Button>
                    </>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-7 text-xs gap-1.5 text-slate-500">
                    <Filter className="h-3 w-3" />
                    {showFilters ? '숨기기' : '필터'}
                  </Button>
                </div>
              </div>
          </div>

          <div className="px-6 py-4">
              {showFilters && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }} className="mb-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2 block">반</span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableClasses.map(cls => <Button key={cls} variant={selectedClass === cls ? "default" : "ghost"} size="sm" onClick={() => setSelectedClass(cls)} className={`h-7 text-xs rounded-full px-3 ${selectedClass === cls ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {cls}
                          </Button>)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">정렬:</span>
                        <Button variant={sortBy === 'score' ? "default" : "ghost"} size="sm" onClick={() => setSortBy('score')} className={`h-6 text-[11px] rounded-full px-2.5 ${sortBy === 'score' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                          점수
                        </Button>
                        <Button variant={sortBy === 'count' ? "default" : "ghost"} size="sm" onClick={() => setSortBy('count')} className={`h-6 text-[11px] rounded-full px-2.5 ${sortBy === 'count' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                          회수
                        </Button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant={sortOrder === 'desc' ? "default" : "ghost"} size="sm" onClick={() => setSortOrder('desc')} className={`h-6 text-[11px] rounded-full px-2.5 gap-1 ${sortOrder === 'desc' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                          <SortDesc className="h-3 w-3" />
                          높은순
                        </Button>
                        <Button variant={sortOrder === 'asc' ? "default" : "ghost"} size="sm" onClick={() => setSortOrder('asc')} className={`h-6 text-[11px] rounded-full px-2.5 gap-1 ${sortOrder === 'asc' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                          <SortAsc className="h-3 w-3" />
                          낮은순
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>}

              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-300 h-4 w-4" />
                <Input type="text" placeholder="학생 이름 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-9 bg-slate-50/50 border-slate-200/60 rounded-xl text-sm placeholder:text-slate-300 focus:bg-white" />
              </div>

            <div className="space-y-1">
              {loading ? <div className="text-center py-16 text-slate-400 text-sm">데이터를 불러오는 중...</div> : filteredStudents.length === 0 ? <div className="text-center py-16 text-slate-400 text-sm">검색 결과가 없습니다.</div> : filteredStudents.map((student, index) => <motion.div key={student.id} initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.015
            }}>
                    <div className="group relative rounded-xl hover:bg-slate-50/80 transition-all duration-200 border border-transparent hover:border-slate-100">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-slate-300 w-5 text-right tabular-nums shrink-0">{index + 1}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors truncate">
                                  {student.student_name}
                                </p>
                                {student.student_class && <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-100/80 shrink-0">
                                    {student.student_class}
                                  </span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <p className="text-[10px] text-slate-400 leading-tight">응시</p>
                                <p className="text-sm font-bold text-slate-600 tabular-nums">
                                  {student.test_count}<span className="text-[10px] font-normal text-slate-400">회</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 leading-tight">평균</p>
                                <p className="text-sm font-bold text-slate-700 tabular-nums">
                                  {student.average_score.toFixed(1)}<span className="text-[10px] font-normal text-slate-400">점</span>
                                </p>
                              </div>
                              <div className="min-w-[36px]">
                                <p className="text-[10px] text-slate-400 leading-tight">등급</p>
                                <p className={`text-sm font-bold tabular-nums ${
                                  getGrade(student.average_score) <= 2 ? 'text-emerald-600' : 
                                  getGrade(student.average_score) <= 4 ? 'text-blue-600' : 
                                  getGrade(student.average_score) <= 6 ? 'text-amber-600' : 'text-red-500'
                                }`}>
                                  {getGrade(student.average_score)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 ml-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => toggleStudentExpand(student.id, e)}
                                className="h-7 px-2.5 text-[11px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg gap-1"
                              >
                                {expandedStudents.has(student.id) ? (
                                  <><ChevronUp className="h-3 w-3" />접기</>
                                ) : (
                                  <><ChevronDown className="h-3 w-3" />리포트</>
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => handleDownloadIndividualReport(student, e)}
                                className="h-7 w-7 p-0 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                title="리포트 이미지 다운로드"
                              >
                                <Image className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expandable Report Section */}
                      <AnimatePresence>
                        {expandedStudents.has(student.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-slate-100"
                          >
                            <div 
                              ref={(el) => {
                                if (el) reportRefs.current.set(student.id, el);
                              }}
                              className="p-4 bg-slate-50/50"
                            >
                              <StudentHistoryView 
                                studentName={student.student_name} 
                                studentClass={student.student_class || undefined}
                                compact={true}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>)}
            </div>
          </div>
        </Card>
      </div>
    </div>;
};
export default StudentHistory;