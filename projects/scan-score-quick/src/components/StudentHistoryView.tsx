import React, { useRef, useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, TrendingUp, Award, Target, Calendar, TrendingDown, Minus, CheckCircle2, AlertTriangle, Activity, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, Cell } from 'recharts';
import { calculateConsistentScore } from '@/utils/testUtils/scoreCalculation';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
interface StudentHistoryViewProps {
  studentName?: string;
  studentClass?: string;
  compact?: boolean;
}
interface TestResult {
  id: string;
  test_id: string;
  student_name: string;
  score: number;
  correct_count: number;
  total_count: number;
  student_answers: any;
  created_at: string;
}
const StudentHistoryView = ({
  studentName,
  studentClass,
  compact = false
}: StudentHistoryViewProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testNames, setTestNames] = useState<Record<string, string>>({});
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [currentClass, setCurrentClass] = useState<string | null>(studentClass || null);
  const [downloading, setDownloading] = useState(false);
  const {
    toast
  } = useToast();

  // 고화질 JPG 이미지로 저장하는 함수 - 메모리 최적화 버전
  const handleDownloadImage = async () => {
    if (!reportRef.current) {
      toast({
        title: "오류",
        description: "리포트를 찾을 수 없습니다.",
        variant: "destructive"
      });
      return;
    }
    setDownloading(true);
    try {
      // DOM이 완전히 렌더링되도록 충분한 지연
      await new Promise(resolve => setTimeout(resolve, 300));
      // 폰트가 모두 로드될 때까지 대기 (왜곡/줄바꿈 방지)
      if ((document as any).fonts?.ready) {
        try {
          await (document as any).fonts.ready;
        } catch (_) {}
      }

      // 요소의 크기 확인
      const element = reportRef.current;
      if (!element) {
        throw new Error('리포트 요소를 찾을 수 없습니다.');
      }
      const rect = element.getBoundingClientRect();
      console.log('Capturing element size:', rect.width, 'x', rect.height);

      // 크기가 너무 크면 경고
      if (rect.height > 10000) {
        toast({
          title: "경고",
          description: "리포트가 너무 커서 시간이 걸릴 수 있습니다."
        });
      }

      // 이미지 CORS 설정 및 로드 보장
      const imgs = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(imgs.map(async img => {
        try {
          img.setAttribute('crossOrigin', 'anonymous');
          if ('decode' in img && typeof (img as any).decode === 'function') {
            await (img as any).decode().catch(() => {});
          }
        } catch (e) {}
      }));
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: true,
        ignoreElements: (el) => {
          const rect = el.getBoundingClientRect();
          return rect.width === 0 || rect.height === 0 || !isFinite(rect.width) || !isFinite(rect.height);
        },
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { animation: none !important; transition: none !important; filter: none !important; mix-blend-mode: normal !important; }
            .sticky { position: static !important; top: auto !important; }
            html, body { background: #ffffff !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Canvas가 생성되었는지 확인
      if (!canvas) {
        throw new Error('Canvas 생성 실패');
      }
      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      // JPEG Blob 생성 후 다운로드 (메모리/보안 안정) - 최고 화질
      const filename = `${studentName || '학생'}_성적리포트_${format(new Date(), 'yyyy-MM-dd')}.jpg`;
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('이미지 Blob 생성 실패'));
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
          resolve();
        }, 'image/jpeg', 1.0);
      });

      // 메모리 정리
      canvas.remove();
      toast({
        title: "다운로드 완료",
        description: "리포트가 이미지로 저장되었습니다."
      });
    } catch (error) {
      console.error('Image download error:', error);
      try {
        const element = reportRef.current!;
        const filename = `${studentName || '학생'}_성적리포트_${format(new Date(), 'yyyy-MM-dd')}.jpg`;
        const dataUrl = await toJpeg(element, {
          quality: 1.0,
          backgroundColor: '#ffffff',
          cacheBust: true,
          pixelRatio: 4,
          style: {
            animation: 'none',
            transition: 'none',
            filter: 'none'
          },
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
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.style.display = 'none';
        link.click();
        toast({
          title: "다운로드 완료 (호환 모드)",
          description: "호환 모드로 이미지를 저장했습니다."
        });
      } catch (fallbackError) {
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : '알 수 없는 오류';
        toast({
          title: "다운로드 실패",
          description: `이미지 저장 중 오류가 발생했습니다: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setDownloading(false);
    }
  };
  const getGrade = (score: number): {
    grade: number;
    color: string;
    bgColor: string;
  } => {
    if (score >= 90) return {
      grade: 1,
      color: '#10b981',
      bgColor: 'bg-green-500'
    };
    if (score >= 80) return {
      grade: 2,
      color: '#3b82f6',
      bgColor: 'bg-blue-500'
    };
    if (score >= 70) return {
      grade: 3,
      color: '#f59e0b',
      bgColor: 'bg-yellow-500'
    };
    if (score >= 60) return {
      grade: 4,
      color: '#f97316',
      bgColor: 'bg-orange-500'
    };
    if (score >= 50) return {
      grade: 5,
      color: '#ef4444',
      bgColor: 'bg-red-500'
    };
    if (score >= 40) return {
      grade: 6,
      color: '#dc2626',
      bgColor: 'bg-red-600'
    };
    if (score >= 30) return {
      grade: 7,
      color: '#991b1b',
      bgColor: 'bg-red-700'
    };
    if (score >= 20) return {
      grade: 8,
      color: '#7f1d1d',
      bgColor: 'bg-red-800'
    };
    return {
      grade: 9,
      color: '#450a0a',
      bgColor: 'bg-red-900'
    };
  };
  useEffect(() => {
    if (studentName) {
      fetchStudentData();
    }
  }, [studentName]);
  const fetchStudentData = async () => {
    if (!studentName) return;
    try {
      setLoading(true);

      // 45문항 시험 결과만 조회 - 반 이름 상관없이 순수한 이름으로 조회
      const {
        data: results,
        error: resultsError
      } = await supabase.from('test_results').select('*').like('student_name', `%${studentName}`).eq('total_count', 45).order('created_at', {
        ascending: false
      });
      if (resultsError) throw resultsError;

      // 시험 제목과 정답 가져오기
      if (results && results.length > 0) {
        // 가장 최근 시험의 반 정보 추출
        const latestStudentName = results[0].student_name;
        const nameParts = latestStudentName.split(' ');
        const extractedClass = nameParts.length > 1 ? nameParts[0] : null;
        setCurrentClass(extractedClass);
        const testIds = [...new Set(results.map(r => r.test_id))];
        const {
          data: tests,
          error: testsError
        } = await supabase.from('tests').select('test_id, title, answers').in('test_id', testIds);
        if (!testsError && tests) {
          const namesMap: Record<string, string> = {};
          const answersMap: Record<string, any> = {};
          tests.forEach(test => {
            namesMap[test.test_id] = test.title;
            answersMap[test.test_id] = test.answers;
          });
          setTestNames(namesMap);
          setTestAnswers(answersMap);
        }

        // 중복 제거: 시험명(test_id), 응시날짜(날짜만), 득점이 동일한 경우 1개만 남김
        const uniqueResults: TestResult[] = [];
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
        setTestResults(uniqueResults);
      } else {
        setTestResults([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };
  const downloadReportAsImage = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 4,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        foreignObjectRendering: true
      });
      const link = document.createElement('a');
      link.download = `${studentName}_성적표.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };
  const handleDeleteResult = async () => {
    if (!selectedResultId) return;
    try {
      const {
        error
      } = await supabase.from('test_results').delete().eq('id', selectedResultId);
      if (error) throw error;
      toast({
        title: "삭제 완료",
        description: "시험 결과가 삭제되었습니다."
      });

      // 데이터 다시 가져오기
      await fetchStudentData();
    } catch (error) {
      console.error('Error deleting test result:', error);
      toast({
        title: "삭제 실패",
        description: "시험 결과 삭제에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedResultId(null);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>;
  }
  if (!studentName || testResults.length === 0) {
    return <Card className="p-8 text-center">
        <p className="text-slate-600">45문항 시험 데이터가 없습니다.</p>
      </Card>;
  }
  const totalTests = testResults.length;
  const totalScore = testResults.reduce((sum, r) => sum + r.score, 0);
  const averageScore = totalScore / totalTests;
  const highestScore = Math.max(...testResults.map(r => r.score));
  const lowestScore = Math.min(...testResults.map(r => r.score));

  // 성적 추이 분석
  const getScoreTrend = () => {
    if (testResults.length < 2) return {
      trend: 'stable',
      message: '충분한 데이터가 없습니다.'
    };
    const recentTests = testResults.slice(0, 3);
    const olderTests = testResults.slice(-3);
    const recentAvg = recentTests.reduce((sum, r) => sum + r.score, 0) / recentTests.length;
    const olderAvg = olderTests.reduce((sum, r) => sum + r.score, 0) / olderTests.length;
    const diff = recentAvg - olderAvg;
    if (diff > 5) {
      return {
        trend: 'up',
        message: `최근 성적이 ${diff.toFixed(1)}점 상승했습니다! 꾸준한 노력이 결실을 맺고 있습니다.`,
        icon: TrendingUp,
        color: 'text-green-600'
      };
    } else if (diff < -5) {
      return {
        trend: 'down',
        message: `최근 성적이 ${Math.abs(diff).toFixed(1)}점 하락했습니다. 학습 패턴을 점검해보세요.`,
        icon: TrendingDown,
        color: 'text-red-600'
      };
    } else {
      return {
        trend: 'stable',
        message: '안정적인 성적을 유지하고 있습니다. 지속적인 학습으로 더 발전시켜보세요!',
        icon: Minus,
        color: 'text-blue-600'
      };
    }
  };
  const scoreTrend = getScoreTrend();
  const TrendIconComp = (scoreTrend.icon ?? Minus) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  // 취약 유형 분석 함수
  const analyzeWeakTypes = () => {
    const typeRanges = {
      '듣기 (1-17번)': {
        questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        wrong: 0,
        total: 0
      },
      '목적/심경 (18-19번)': {
        questions: [18, 19],
        wrong: 0,
        total: 0
      },
      '대의파악 (20-24,40번)': {
        questions: [20, 21, 22, 23, 24, 40],
        wrong: 0,
        total: 0
      },
      '내용일치 (25-28번)': {
        questions: [25, 26, 27, 28],
        wrong: 0,
        total: 0
      },
      '어법/어휘 (29-30번)': {
        questions: [29, 30],
        wrong: 0,
        total: 0
      },
      '빈칸추론 (31-34번)': {
        questions: [31, 32, 33, 34],
        wrong: 0,
        total: 0
      },
      '무관한문장 (35번)': {
        questions: [35],
        wrong: 0,
        total: 0
      },
      '순서/삽입 (36-39번)': {
        questions: [36, 37, 38, 39],
        wrong: 0,
        total: 0
      },
      '장문 (41-45번)': {
        questions: [41, 42, 43, 44, 45],
        wrong: 0,
        total: 0
      }
    };
    testResults.forEach(result => {
      const correctAnswers = testAnswers[result.test_id];
      if (!correctAnswers) return;
      if (result.student_answers && typeof result.student_answers === 'object') {
        Object.entries(result.student_answers).forEach(([questionNum, studentAnswer]: [string, any]) => {
          const num = parseInt(questionNum);
          if (isNaN(num)) return;
          const correctAnswer = correctAnswers[questionNum];
          if (!correctAnswer) return;

          // 각 유형 범위에 해당하는지 확인
          Object.entries(typeRanges).forEach(([typeName, typeData]) => {
            if (typeData.questions.includes(num)) {
              typeData.total++;

              // 학생 답안과 정답 비교
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

    // 오답률 계산 및 정렬
    const analyzed = Object.entries(typeRanges).map(([name, data]) => ({
      name,
      wrong: data.wrong,
      total: data.total,
      rate: data.total > 0 ? data.wrong / data.total * 100 : 0
    })).filter(item => item.total > 0).sort((a, b) => b.rate - a.rate).slice(0, 3);
    return analyzed;
  };
  const weakTypes = analyzeWeakTypes();

  // 유형별 정답률 분석 (레이더 차트용)
  const analyzeTypePerformance = () => {
    const typeRanges = {
      '듣기': {
        questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        correct: 0,
        total: 0
      },
      '목적/심경': {
        questions: [18, 19],
        correct: 0,
        total: 0
      },
      '대의파악': {
        questions: [20, 21, 22, 23, 24, 40],
        correct: 0,
        total: 0
      },
      '내용일치': {
        questions: [25, 26, 27, 28],
        correct: 0,
        total: 0
      },
      '어법/어휘': {
        questions: [29, 30],
        correct: 0,
        total: 0
      },
      '빈칸추론': {
        questions: [31, 32, 33, 34],
        correct: 0,
        total: 0
      },
      '무관한문장': {
        questions: [35],
        correct: 0,
        total: 0
      },
      '순서/삽입': {
        questions: [36, 37, 38, 39],
        correct: 0,
        total: 0
      },
      '장문': {
        questions: [41, 42, 43, 44, 45],
        correct: 0,
        total: 0
      }
    };
    testResults.forEach(result => {
      const correctAnswers = testAnswers[result.test_id];
      if (!correctAnswers) return;
      if (result.student_answers && typeof result.student_answers === 'object') {
        Object.entries(result.student_answers).forEach(([qNum, studentAnswer]: [string, any]) => {
          const questionNum = parseInt(qNum);
          if (isNaN(questionNum)) return;
          const correctAnswer = correctAnswers[qNum];
          if (!correctAnswer) return;
          Object.entries(typeRanges).forEach(([typeName, typeData]) => {
            if (typeData.questions.includes(questionNum)) {
              typeData.total++;

              // 학생 답안과 정답 비교
              const studentAnswerValue = studentAnswer?.answer?.[0] || studentAnswer;
              const correctAnswerValue = correctAnswer?.answer?.[0] || correctAnswer;
              if (studentAnswerValue === correctAnswerValue) {
                typeData.correct++;
              }
            }
          });
        });
      }
    });
    return Object.entries(typeRanges).map(([name, data]) => ({
      type: name,
      정답률: data.total > 0 ? Math.round(data.correct / data.total * 100) : 0,
      correct: data.correct,
      total: data.total,
      fullMark: 100
    }));
  };

  // 회차별 취약유형 개선도 분석
  const analyzeTypeImprovement = () => {
    if (testResults.length < 2) {
      return {
        message: '충분한 시험 데이터가 필요합니다 (최소 2회)',
        improvements: []
      };
    }

    // 가장 최근 시험 1개와 나머지 모든 시험으로 분리
    const recentTest = [testResults[0]]; // 가장 최근 시험
    const olderTests = testResults.slice(1); // 나머지 모든 시험

    const calculateTypeScores = (tests: TestResult[]) => {
      const typeRanges = {
        '듣기': {
          questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
          correct: 0,
          total: 0
        },
        '목적/심경': {
          questions: [18, 19],
          correct: 0,
          total: 0
        },
        '대의파악': {
          questions: [20, 21, 22, 23, 24, 40],
          correct: 0,
          total: 0
        },
        '내용일치': {
          questions: [25, 26, 27, 28],
          correct: 0,
          total: 0
        },
        '어법/어휘': {
          questions: [29, 30],
          correct: 0,
          total: 0
        },
        '빈칸추론': {
          questions: [31, 32, 33, 34],
          correct: 0,
          total: 0
        },
        '무관한문장': {
          questions: [35],
          correct: 0,
          total: 0
        },
        '순서/삽입': {
          questions: [36, 37, 38, 39],
          correct: 0,
          total: 0
        },
        '장문': {
          questions: [41, 42, 43, 44, 45],
          correct: 0,
          total: 0
        }
      };
      tests.forEach(result => {
        const correctAnswers = testAnswers[result.test_id];
        if (!correctAnswers) return;
        if (result.student_answers && typeof result.student_answers === 'object') {
          Object.entries(result.student_answers).forEach(([qNum, studentAnswer]: [string, any]) => {
            const questionNum = parseInt(qNum);
            if (isNaN(questionNum)) return;
            const correctAnswer = correctAnswers[qNum];
            if (!correctAnswer) return;
            Object.entries(typeRanges).forEach(([typeName, typeData]) => {
              if (typeData.questions.includes(questionNum)) {
                typeData.total++;

                // 학생 답안과 정답 비교
                const studentAnswerValue = studentAnswer?.answer?.[0] || studentAnswer;
                const correctAnswerValue = correctAnswer?.answer?.[0] || correctAnswer;
                if (studentAnswerValue === correctAnswerValue) {
                  typeData.correct++;
                }
              }
            });
          });
        }
      });
      return Object.entries(typeRanges).map(([name, data]) => ({
        name,
        rate: data.total > 0 ? data.correct / data.total * 100 : 0
      }));
    };
    const recentScores = calculateTypeScores(recentTest);
    const olderScores = calculateTypeScores(olderTests);
    const improvements = recentScores.map((recent, index) => {
      const older = olderScores[index];
      const diff = recent.rate - older.rate;
      return {
        type: recent.name,
        recent: recent.rate,
        older: older.rate,
        diff: diff,
        status: diff > 5 ? 'improved' : diff < -5 ? 'declined' : 'stable'
      };
    }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    const improved = improvements.filter(i => i.status === 'improved').length;
    const declined = improvements.filter(i => i.status === 'declined').length;
    let message = '';
    if (improved > declined) {
      message = `최근 시험에서 ${improved}개 유형이 개선되었습니다! 꾸준한 학습의 성과입니다.`;
    } else if (declined > improved) {
      message = `최근 시험에서 ${declined}개 유형이 하락했습니다. 해당 유형에 집중이 필요합니다.`;
    } else {
      message = '전반적으로 안정적인 학습 패턴을 유지하고 있습니다.';
    }
    return {
      message,
      improvements
    };
  };
  const radarData = analyzeTypePerformance();
  const improvementAnalysis = analyzeTypeImprovement();

  // 차트 데이터 준비 (시간순으로 정렬)
  const chartData = [...testResults].reverse().slice(-10).map((result, index) => ({
    name: testNames[result.test_id] || `시험 ${index + 1}`,
    score: result.score,
    date: format(new Date(result.created_at), 'MM/dd'),
    fullDate: format(new Date(result.created_at), 'yyyy-MM-dd')
  }));
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className={compact ? "bg-white" : "min-h-screen bg-slate-50 p-4 md:p-8"}>
      {/* 다운로드 버튼 - 리포트 바깥쪽 상단 (compact 모드에서 숨김) */}
      {!compact && (
        <div className="max-w-7xl mx-auto mb-4 flex justify-end">
          <Button onClick={handleDownloadImage} disabled={downloading} className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            {downloading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </> : <>
                <Download className="mr-2 h-4 w-4" />
                이미지로 저장
              </>}
          </Button>
        </div>
      )}

      <div ref={reportRef} className={compact ? "w-full" : "max-w-7xl mx-auto"} data-student-report>
        <Card className={`overflow-hidden bg-white ${compact ? 'shadow-none border-0' : 'shadow-xl border-slate-200'}`}>
        {/* 헤더 섹션 */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 overflow-hidden border-b-4 border-slate-900">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px'
            }}></div>
          </div>
          
          {/* 프리미엄 장식 라인 */}
          <div className="absolute top-0 left-0 right-0 h-2">
            <div className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"></div>
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          
          {/* 코너 장식 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
          
          <div className="relative z-10 bg-white border-b border-slate-200">
            {/* 프리미엄 헤더 */}
            <div className="px-6 md:px-10 py-5 md:py-6">
            {/* 전체 헤더 레이아웃 */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                {/* 왼쪽: 로고와 타이틀 */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <img src={brainiacLogo.url} alt="Brainiac English" className="h-9 md:h-10 w-auto opacity-90" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-slate-500 text-[9px] md:text-[10px] font-medium tracking-[0.2em] uppercase">Orun English Academic Performance Analysis</p>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight">브래니악 영어학원 누적 성적 분석 리포트</h1>
                    <p className="text-slate-400 text-[10px] md:text-xs font-normal">
                      Cumulative Test Performance Report
                    </p>
                  </div>
                </div>

                {/* 오른쪽: 학생 정보와 문서 메타 정보 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                  {/* 학생 정보 - 컴팩트한 디자인 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 md:p-4 w-full sm:w-auto">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative group flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-lg blur-sm opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        
                      </div>
                      
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {currentClass && (
                            <Badge className="text-[10px] font-semibold px-2 py-0.5 bg-slate-800 text-white hover:bg-slate-900 flex-shrink-0">
                              {currentClass}
                            </Badge>
                          )}
                          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                            {(() => {
                              const parts = (studentName || '').trim().split(/\s+/);
                              return parts.length > 1 && currentClass && parts[0] === currentClass
                                ? parts.slice(1).join(' ')
                                : studentName;
                            })()}
                          </h2>
                        </div>
                        
                        {/* 분석 기간 - 컴팩트 */}
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[10px] font-medium">분석 기간</span>
                          <span className="text-[10px] font-bold text-slate-900">
                            {testResults.length > 0 ? `${format(new Date(testResults[testResults.length - 1].created_at), 'MM.dd')}~${format(new Date(testResults[0].created_at), 'MM.dd')}` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 문서 메타 정보 - 컴팩트 */}
                  <div className="flex flex-col justify-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 min-w-[100px]">
                    <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest mb-0.5">Report Date</p>
                    <p className="text-slate-900 text-xs md:text-sm font-bold">{format(new Date(), 'yyyy.MM.dd')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-slate-50">
          <div className="w-full space-y-4">
              {/* 주요 통계 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.1
              }}>
                  <Card className="p-3 bg-white border-slate-200 hover:shadow-lg transition-all hover:border-sky-300 group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-sky-100 rounded-lg group-hover:bg-sky-500 transition-colors">
                        <Calendar className="h-3.5 w-3.5 text-sky-600 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">응시 횟수</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {totalTests}<span className="text-sm text-slate-500 font-medium ml-1">회</span>
                    </p>
                  </Card>
                </motion.div>

                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2
              }}>
                  <Card className="p-3 bg-white border-slate-200 hover:shadow-lg transition-all hover:border-emerald-300 group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-500 transition-colors">
                        <Target className="h-3.5 w-3.5 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">평균 점수</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {averageScore.toFixed(1)}<span className="text-sm text-slate-500 font-medium ml-1">점</span>
                    </p>
                  </Card>
                </motion.div>

                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.3
              }}>
                  <Card className="p-3 bg-white border-slate-200 hover:shadow-lg transition-all hover:border-indigo-300 group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-500 transition-colors">
                        <Award className="h-3.5 w-3.5 text-indigo-600 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">최고 점수</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {highestScore.toFixed(1)}<span className="text-sm text-slate-500 font-medium ml-1">점</span>
                    </p>
                  </Card>
                </motion.div>

                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.4
              }}>
                  <Card className="p-3 bg-white border-slate-200 hover:shadow-lg transition-all hover:border-orange-300 group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg group-hover:bg-orange-500 transition-colors">
                        <TrendingUp className="h-3.5 w-3.5 text-orange-600 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">최저 점수</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {lowestScore.toFixed(1)}<span className="text-sm text-slate-500 font-medium ml-1">점</span>
                    </p>
                  </Card>
                </motion.div>
              </div>

              {/* 성적 코멘트 */}
              

              {/* 점수 추이 그래프 */}
              <Card className="p-4 md:p-5 shadow-lg bg-white border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 uppercase tracking-wide">점수 추이 분석</h3>
                    <p className="text-sm text-slate-600">시험별 성적 변화를 확인하세요</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sky-500 shadow-sm"></div>
                      <span className="text-xs text-slate-700 font-medium">점수</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-rose-500 border-dashed border-t-2"></div>
                      <span className="text-xs text-slate-700 font-medium">평균</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-800 text-white border-slate-700 font-semibold">
                      최근 {Math.min(10, testResults.length)}회
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{
                      top: 56,
                      right: 60,
                      left: 12,
                      bottom: 16
                    }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" angle={0} textAnchor="middle" height={80} tickMargin={4} interval={0} tick={props => {
                        const {
                          x,
                          y,
                          payload,
                          index
                        } = props;
                        const data = chartData[index];
                        const testName = data?.name || '';

                        // 시험명을 최대 10자씩 3줄로 분할 (더 많은 줄 허용)
                        const splitText = (text: string, maxLength: number) => {
                          if (text.length <= maxLength) return [text];
                          
                          // 먼저 _ 또는 공백으로 분리 시도
                          const separators = /[_\s]+/;
                          const words = text.split(separators).filter(w => w.length > 0);
                          
                          if (words.length === 1) {
                            // 분리자가 없으면 글자 수로 자르기
                            const lines: string[] = [];
                            for (let i = 0; i < text.length; i += maxLength) {
                              lines.push(text.substring(i, i + maxLength));
                            }
                            return lines.slice(0, 3);
                          }
                          
                          const lines: string[] = [];
                          let currentLine = '';
                          words.forEach(word => {
                            if (currentLine.length === 0) {
                              currentLine = word;
                            } else if ((currentLine + ' ' + word).length <= maxLength) {
                              currentLine = currentLine + ' ' + word;
                            } else {
                              lines.push(currentLine);
                              currentLine = word;
                            }
                          });
                          if (currentLine) lines.push(currentLine);

                          // 최대 3줄까지
                          return lines.slice(0, 3).map((line, i) => 
                            i === 2 && lines.length > 3 ? line.substring(0, maxLength - 2) + '..' : line
                          );
                        };
                        const lines = splitText(testName, 10);
                        return <g transform={`translate(${x},${y})`}>
                                <text x={0} y={0} dy={16} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight="500">
                                  {payload.value}
                                </text>
                                {lines.map((line, i) => <text key={i} x={0} y={0} dy={32 + i * 11} textAnchor="middle" fill="#94a3b8" fontSize={9}>
                                    {line}
                                  </text>)}
                              </g>;
                      }} />
                        <YAxis domain={[Math.max(0, lowestScore - 10), 100]} tick={{
                        fontSize: 12,
                        fill: '#64748b',
                        fontWeight: '500'
                      }} axisLine={{
                        stroke: '#e2e8f0'
                      }} tickLine={{
                        stroke: '#e2e8f0'
                      }} />
                        <Tooltip contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        padding: '12px 16px'
                      }} labelStyle={{
                        color: '#1e293b',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }} formatter={(value: number, name, props) => {
                        const gradeInfo = getGrade(value);
                        return [<span style={{
                          color: gradeInfo.color,
                          fontWeight: 'bold'
                        }}>
                                {value.toFixed(1)}점 ({gradeInfo.grade}등급)
                              </span>, ''];
                      }} labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return <div className="space-y-1">
                                  <div className="font-bold text-slate-800">{payload[0].payload.name}</div>
                                  <div className="text-xs text-slate-500">{payload[0].payload.fullDate}</div>
                                </div>;
                        }
                        return label;
                      }} />
                        {/* 평균선 */}
                        <Line type="monotone" dataKey={() => averageScore} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="평균" />
                        {/* 점수선 */}
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={props => {
                        const {
                          cx,
                          cy,
                          payload
                        } = props;
                        const score = payload.score;
                        const gradeInfo = getGrade(score);
                        return <g>
                                <circle cx={cx} cy={cy} r={6} fill="white" stroke={gradeInfo.color} strokeWidth={3} />
                                <circle cx={cx} cy={cy} r={3} fill={gradeInfo.color} />
                              </g>;
                      }} activeDot={{
                        r: 8,
                        fill: '#3b82f6',
                        stroke: 'white',
                        strokeWidth: 3
                      }} label={props => {
                        const {
                          x,
                          y,
                          value
                        } = props;
                        const gradeInfo = getGrade(value);
                        return <g>
                            <rect x={x - 28} y={y - 45} width={56} height={32} fill="white" stroke={gradeInfo.color} strokeWidth={2} rx={6} opacity={0.95} />
                            <text x={x} y={y - 30} textAnchor="middle" fill={gradeInfo.color} fontSize={13} fontWeight="bold">
                              {value.toFixed(1)}점
                            </text>
                            <text x={x} y={y - 17} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight="600">
                              {gradeInfo.grade}등급
                            </text>
                          </g>;
                      }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* 성적 분석 코멘트 */}
                  <div className="mt-4 p-5 bg-white rounded-lg border-2 border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 ${scoreTrend.color}`}>
                        <TrendIconComp className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">📊 그래프 분석</h4>
                        <p className="text-sm text-slate-700 leading-relaxed mb-3">
                          {scoreTrend.message}
                        </p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                            <p className="text-slate-600 mb-1 font-semibold">평균 점수</p>
                            <p className="font-bold text-sky-600 text-base">{averageScore.toFixed(1)}점</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                            <p className="text-slate-600 mb-1 font-semibold">최고 점수</p>
                            <p className="font-bold text-indigo-600 text-base">{highestScore.toFixed(1)}점</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                            <p className="text-slate-600 mb-1 font-semibold">평균 등급</p>
                            <p className="font-bold text-orange-600 text-base">{getGrade(averageScore).grade}등급</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 레이더 차트 - 유형별 강점/약점 분석 */}
                <Card className="mt-4 p-3 md:p-4 bg-white shadow-lg border-slate-200">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
                        📊
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">유형별 강점/약점 분석</h3>
                        <p className="text-xs text-slate-600">각 영역별 정답률을 한눈에 확인하세요</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* 왼쪽: 레이더 차트 */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <ResponsiveContainer width="100%" height={320}>
                        <RadarChart data={radarData}>
                          <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <PolarGrid stroke="#e2e8f0" strokeWidth={2} strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="type" tick={{
                          fill: '#1e293b',
                          fontSize: 11,
                          fontWeight: 700,
                          dy: 5
                        }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{
                          fill: '#64748b',
                          fontSize: 10,
                          fontWeight: 600
                        }} tickCount={6} />
                          <Radar name="정답률" dataKey="정답률" stroke="#8b5cf6" fill="url(#radarGradient)" fillOpacity={0.7} strokeWidth={3} dot={{
                          r: 5,
                          fill: '#8b5cf6',
                          stroke: '#fff',
                          strokeWidth: 2
                        }} animationDuration={1500} animationEasing="ease-out" />
                          <Tooltip contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          borderRadius: '16px',
                          border: '2px solid #a78bfa',
                          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
                          padding: '12px',
                          fontWeight: 600
                        }} formatter={(value: any) => [`${value}%`, '정답률']} labelStyle={{
                          color: '#1e293b',
                          fontWeight: 700,
                          marginBottom: '6px',
                          fontSize: 12
                        }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 오른쪽: 유형별 카드 + 등급 기준 */}
                    <div className="space-y-3">
                      {/* 유형별 카드 */}
                      <div className="p-3 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-3 gap-2">
                      {radarData.map((item, index) => {
                          const isExcellent = item.정답률 >= 80;
                          const isGood = item.정답률 >= 60;
                          const needsWork = item.정답률 < 60;
                          return <motion.div key={item.type} initial={{
                            opacity: 0,
                            y: 20
                          }} animate={{
                            opacity: 1,
                            y: 0
                          }} transition={{
                            delay: index * 0.05,
                            duration: 0.4
                          }} className={`group relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md ${isExcellent ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' : isGood ? 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200' : 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200'}`}>
                            {/* 배경 장식 */}
                            <div className={`absolute -right-2 -top-2 w-10 h-10 rounded-full opacity-10 ${isExcellent ? 'bg-emerald-400' : isGood ? 'bg-sky-400' : 'bg-rose-400'}`}></div>
                            
                            <div className="relative p-2">
                              {/* 아이콘과 라벨 */}
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">{item.type}</span>
                                <div className={`p-0.5 rounded ${isExcellent ? 'bg-emerald-500' : isGood ? 'bg-sky-500' : 'bg-rose-500'}`}>
                                  {isExcellent ? <CheckCircle2 className="w-2.5 h-2.5 text-white" /> : isGood ? <Activity className="w-2.5 h-2.5 text-white" /> : <AlertTriangle className="w-2.5 h-2.5 text-white" />}
                                </div>
                              </div>
                              
                              {/* 점수 및 데이터 표시 */}
                              <div className="mb-1.5">
                                <div className="flex items-baseline justify-center gap-0.5 mb-1">
                                  <span className={`text-xl font-bold ${isExcellent ? 'text-emerald-600' : isGood ? 'text-sky-600' : 'text-rose-600'}`}>
                                    {item.정답률}
                                  </span>
                                  <span className={`text-xs font-semibold ${isExcellent ? 'text-emerald-500' : isGood ? 'text-sky-500' : 'text-rose-500'}`}>
                                    %
                                  </span>
                                </div>
                                
                                {/* 맞춘 개수 / 총 개수 */}
                                <div className="text-center mb-1.5">
                                  <span className="text-[10px] text-slate-600 font-medium">
                                    <span className="font-bold text-slate-800">{item.correct}</span>
                                    <span className="mx-0.5">/</span>
                                    <span className="text-slate-500">{item.total}</span>
                                    <span className="ml-0.5">문제</span>
                                  </span>
                                </div>
                              </div>
                              
                              {/* 상태 라벨 */}
                              <div className="mb-1.5 flex justify-center">
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isExcellent ? 'bg-emerald-500 text-white' : isGood ? 'bg-sky-500 text-white' : 'bg-rose-500 text-white'}`}>
                                  {isExcellent ? '우수' : isGood ? '양호' : '보완필요'}
                                </span>
                              </div>
                              
                              {/* 프로그레스 바 */}
                              <div className="relative h-1 bg-white/50 rounded-full overflow-hidden shadow-inner">
                                <motion.div initial={{
                                  width: 0
                                }} animate={{
                                  width: `${item.정답률}%`
                                }} transition={{
                                  delay: index * 0.05 + 0.2,
                                  duration: 0.8,
                                  ease: "easeOut"
                                }} className={`h-full rounded-full shadow-sm ${isExcellent ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' : isGood ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600' : 'bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600'}`} />
                              </div>
                            </div>
                          </motion.div>;
                        })}
                        </div>
                      </div>

                      {/* 등급 기준 */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">등급 기준</h4>
                        {/* 1-4등급 (윗줄) */}
                        <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                          {[{
                          range: '90점 이상',
                          grade: '1등급',
                          color: 'bg-emerald-500'
                        }, {
                          range: '80-89점',
                          grade: '2등급',
                          color: 'bg-sky-500'
                        }, {
                          range: '70-79점',
                          grade: '3등급',
                          color: 'bg-yellow-500'
                        }, {
                          range: '60-69점',
                          grade: '4등급',
                          color: 'bg-orange-500'
                        }].map(item => <div key={item.range} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200">
                              <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm`}></div>
                              <span className="text-[10px] text-slate-700 font-semibold whitespace-nowrap">{item.range} ({item.grade})</span>
                            </div>)}
                        </div>
                        {/* 5-9등급 (아랫줄) */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {[{
                          range: '50-59점',
                          grade: '5등급',
                          color: 'bg-red-500'
                        }, {
                          range: '40-49점',
                          grade: '6등급',
                          color: 'bg-red-600'
                        }, {
                          range: '30-39점',
                          grade: '7등급',
                          color: 'bg-red-700'
                        }, {
                          range: '20-29점',
                          grade: '8등급',
                          color: 'bg-red-800'
                        }, {
                          range: '20점 미만',
                          grade: '9등급',
                          color: 'bg-red-900'
                        }].map(item => <div key={item.range} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200">
                              <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm`}></div>
                              <span className="text-[10px] text-slate-700 font-semibold whitespace-nowrap">{item.range} ({item.grade})</span>
                            </div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 회차별 취약유형 개선도 분석 */}
                <Card className="mt-4 p-5 md:p-6 bg-gradient-to-br from-white via-slate-50 to-white shadow-2xl border-2 border-slate-200/50 relative overflow-hidden">
                  {/* 배경 장식 */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-100/30 to-indigo-100/30 rounded-full blur-3xl -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-violet-100/20 to-purple-100/20 rounded-full blur-3xl -z-0"></div>
                  
                  <div className="relative z-10">
                    {/* 헤더 */}
                    <div className="mb-8 pb-6 border-b-2 border-gradient-to-r from-transparent via-slate-200 to-transparent">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-sky-500/30 relative">
                          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                          <span className="text-3xl relative z-10">📈</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-slate-900 mb-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
                            학습 성장 분석
                          </h3>
                          <p className="text-base text-slate-600 font-medium leading-relaxed">
                            이전 시험들의 평균 성적과 최근 시험 성적을 유형별로 비교하여<br className="hidden md:block" />
                            학습 성장 패턴과 집중 보완이 필요한 영역을 분석합니다
                          </p>
                        </div>
                      </div>
                    </div>

                  <div className="space-y-6">
                    {/* 메시지 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200/60 shadow-lg">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 animate-pulse"></div>
                        <p className="text-center text-slate-800 font-bold text-lg leading-relaxed">{improvementAnalysis.message}</p>
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 animate-pulse"></div>
                      </div>
                    </div>

                    {/* 개선/하락 유형 요약 */}
                    <div className="grid grid-cols-1 gap-4">
                      {improvementAnalysis.improvements.filter(i => i.status === 'improved').length > 0 && <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-200">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md text-sm">
                                ↑
                              </div>
                              <h4 className="text-base font-bold text-emerald-900">성장한 영역</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {improvementAnalysis.improvements.filter(i => i.status === 'improved').map(item => <div key={item.type} className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-emerald-200/50 hover:border-emerald-300 transition-colors">
                                    <span className="text-slate-800 font-semibold text-sm">{item.type}</span>
                                    <span className="text-emerald-600 font-bold text-sm">+{item.diff.toFixed(1)}%</span>
                                  </div>)}
                            </div>
                          </div>
                        </div>}
                      
                      {improvementAnalysis.improvements.filter(i => i.status === 'declined').length > 0 && <div className="relative bg-gradient-to-br from-rose-50 via-red-50 to-rose-50 rounded-xl p-4 border border-rose-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-200">
                              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white font-bold shadow-md text-sm">
                                ↓
                              </div>
                              <h4 className="text-base font-bold text-rose-900">보완이 필요한 영역</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {improvementAnalysis.improvements.filter(i => i.status === 'declined').map(item => <div key={item.type} className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-rose-200/50 hover:border-rose-300 transition-colors">
                                    <span className="text-slate-800 font-semibold text-sm">{item.type}</span>
                                    <span className="text-rose-600 font-bold text-sm">{item.diff.toFixed(1)}%</span>
                                  </div>)}
                            </div>
                          </div>
                        </div>}
                    </div>

                    {/* 차트 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200/60 shadow-xl">
                      <div className="mb-4 pb-3 border-b-2 border-slate-200">
                        <h4 className="text-lg font-black text-slate-900 mb-1 tracking-tight">유형별 성적 비교</h4>
                        <p className="text-sm text-slate-600 font-medium">이전 평균 대비 최근 시험의 정답률 변화</p>
                      </div>
                      <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={improvementAnalysis.improvements} margin={{
                          top: 10,
                          right: 20,
                          left: 10,
                          bottom: 60
                        }}>
                          <defs>
                            <linearGradient id="olderGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#64748b" stopOpacity={1} />
                              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.8} />
                            </linearGradient>
                            <linearGradient id="recentGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                            </linearGradient>
                            <filter id="shadow">
                              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
                            </filter>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1.5} vertical={false} />
                          <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} tick={{
                            fill: '#1e293b',
                            fontSize: 13,
                            fontWeight: 700
                          }} />
                          <YAxis domain={[0, 100]} tick={{
                            fill: '#64748b',
                            fontSize: 13,
                            fontWeight: 700
                          }} label={{
                            value: '정답률 (%)',
                            angle: -90,
                            position: 'insideLeft',
                            style: {
                              fill: '#1e293b',
                              fontWeight: 800,
                              fontSize: 15
                            }
                          }} />
                          <Tooltip contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '16px',
                            border: '2px solid #a78bfa',
                            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
                            padding: '16px',
                            fontWeight: 700
                          }} formatter={(value: any) => `${value.toFixed(1)}%`} labelStyle={{
                            color: '#1e293b',
                            fontWeight: 800,
                            marginBottom: '8px',
                            fontSize: 15
                          }} cursor={{
                            fill: 'rgba(139, 92, 246, 0.08)'
                          }} />
                          <Legend wrapperStyle={{
                            paddingTop: '12px',
                            fontWeight: 700,
                            fontSize: 14
                          }} iconType="rect" iconSize={18} />
                          <Bar dataKey="older" name="이전 평균" fill="url(#olderGradient)" radius={[10, 10, 0, 0]} maxBarSize={70} animationDuration={1500} animationEasing="ease-out">
                            {improvementAnalysis.improvements.map((entry, index) => <Cell key={`cell-older-${index}`} />)}
                          </Bar>
                          <Bar dataKey="recent" name="최근 성적" fill="url(#recentGradient)" radius={[10, 10, 0, 0]} maxBarSize={70} animationDuration={1500} animationEasing="ease-out">
                            {improvementAnalysis.improvements.map((entry, index) => <Cell key={`cell-recent-${index}`} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>


                    {/* 상세 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      {improvementAnalysis.improvements.map(item => <motion.div key={item.type} initial={{
                        opacity: 0,
                        y: 10
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        duration: 0.3
                      }} className={`relative bg-white/90 backdrop-blur-sm rounded-lg p-3 border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${item.status === 'improved' ? 'border-emerald-200' : item.status === 'declined' ? 'border-rose-200' : 'border-slate-200'}`}>
                          
                          <div className="relative z-10">
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                              <span className="font-bold text-slate-900 text-sm">{item.type}</span>
                              {item.status === 'improved' && <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4">
                                  <TrendingUp className="h-3 w-3 mr-0.5" />
                                  성장
                                </Badge>}
                              {item.status === 'declined' && <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0 h-4">
                                  <TrendingDown className="h-3 w-3 mr-0.5" />
                                  보완 필요
                                </Badge>}
                              {item.status === 'stable' && <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0 h-4">
                                  <Minus className="h-3 w-3 mr-0.5" />
                                  안정
                                </Badge>}
                            </div>
                            
                            {/* 점수 비교 */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-slate-500 mb-0.5 font-medium">이전 평균</p>
                                <p className="text-lg font-bold text-slate-700">{item.older.toFixed(1)}<span className="text-[10px] ml-0.5">%</span></p>
                              </div>
                              
                              <div className={`flex flex-col items-center px-2 py-1 rounded-lg mx-2 ${item.status === 'improved' ? 'bg-emerald-50' : item.status === 'declined' ? 'bg-rose-50' : 'bg-blue-50'}`}>
                                <span className={`text-base font-bold ${item.status === 'improved' ? 'text-emerald-600' : item.status === 'declined' ? 'text-rose-600' : 'text-blue-600'}`}>
                                  {item.diff > 0 ? '▲' : item.diff < 0 ? '▼' : '●'}
                                </span>
                                <span className={`text-xs font-bold ${item.status === 'improved' ? 'text-emerald-600' : item.status === 'declined' ? 'text-rose-600' : 'text-blue-600'}`}>
                                  {Math.abs(item.diff).toFixed(1)}%
                                </span>
                              </div>
                              
                              <div className="text-center flex-1">
                                <p className="text-[10px] text-slate-500 mb-0.5 font-medium">최근 성적</p>
                                <p className="text-lg font-bold text-purple-700">{item.recent.toFixed(1)}<span className="text-[10px] ml-0.5">%</span></p>
                              </div>
                            </div>

                            {/* 프로그레스 바 */}
                            <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div initial={{
                              width: 0
                            }} animate={{
                              width: `${item.recent}%`
                            }} transition={{
                              duration: 0.8,
                              ease: "easeOut"
                            }} className={`absolute h-full ${item.status === 'improved' ? 'bg-emerald-500' : item.status === 'declined' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                            </div>
                          </div>
                        </motion.div>)}
                    </div>
                  </div>
                  </div>
                </Card>

                {/* 취약 유형 Top 3 */}
                {weakTypes.length > 0 && <div className="mt-6 p-6 bg-white rounded-lg border-2 border-rose-200 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white font-bold shadow-sm">
                        ⚠️
                      </div>
                      <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">취약 유형 Top 3</h4>
                      <span className="text-xs text-slate-600 ml-2 font-medium">집중 보완이 필요한 영역입니다</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {weakTypes.map((type, index) => <div key={type.name} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-2xl font-bold ${type.rate >= 50 ? 'text-red-600' : type.rate >= 30 ? 'text-orange-600' : 'text-yellow-600'}`}>
                                {type.rate.toFixed(1)}%
                              </span>
                              <p className="text-xs text-slate-500">오답률</p>
                            </div>
                          </div>
                          <h5 className="font-bold text-slate-800 mb-2 text-sm">{type.name}</h5>
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>오답: <span className="font-semibold text-red-600">{type.wrong}</span>개</span>
                            <span>총 문항: <span className="font-semibold">{type.total}</span>개</span>
                          </div>
                          <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full ${type.rate >= 50 ? 'bg-red-500' : type.rate >= 30 ? 'bg-orange-500' : 'bg-yellow-500'}`} style={{
                        width: `${Math.min(type.rate, 100)}%`
                      }} />
                          </div>
                        </div>)}
                    </div>
                    
                  </div>}
              </Card>

            {/* 회차별 성적표 */}
            <div className="space-y-4">
              <div className="p-5 bg-white rounded-lg border-2 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-1 uppercase tracking-wide">회차별 성적표</h3>
                <p className="text-sm text-slate-600">총 {testResults.length}회의 시험 기록</p>
              </div>
              
              <div className="space-y-3">
                {[...testResults].reverse().map((result, index) => <motion.div key={result.id} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: index * 0.05
                }}>
                    <Card className="group relative p-5 hover:shadow-xl transition-all duration-200 bg-white border-2 border-slate-200 hover:border-sky-300 border-l-4 border-l-sky-500">
                      {/* 삭제 버튼 - 호버 시 표시 */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <Button variant="ghost" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 shadow-sm" onClick={() => {
                        setSelectedResultId(result.id);
                        setDeleteDialogOpen(true);
                      }}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="text-xs font-semibold">삭제</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between pr-24">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                              {index + 1}
                            </div>
                            <span className="text-xs text-slate-600 mt-1 font-semibold">회차</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base mb-1">
                              {testNames[result.test_id] || `시험 ${index + 1}`}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 font-medium">
                                {format(new Date(result.created_at), 'yyyy년 MM월 dd일')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {format(new Date(result.created_at), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center px-4">
                            <p className="text-xs text-slate-600 mb-1 font-semibold uppercase tracking-wide">정답</p>
                            <p className="text-base font-bold text-slate-800">
                              {result.correct_count}<span className="text-slate-500">/{result.total_count}</span>
                            </p>
                          </div>
                          <div className="text-center px-4 border-l-2 border-slate-200">
                            <p className="text-xs text-slate-600 mb-1 font-semibold uppercase tracking-wide">득점</p>
                            <p className="text-xl font-bold text-sky-600">
                              {result.score.toFixed(1)}
                            </p>
                          </div>
                          <div className="ml-2">
                            <Badge className={`text-white px-4 py-2 text-sm font-bold shadow-sm ${getGrade(result.score).bgColor}`}>
                              {getGrade(result.score).grade}등급
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>)}
              </div>
            </div>
          </div>

          
        </div>
      </Card>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-slate-900">시험 결과 삭제</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-slate-700 leading-relaxed pt-2">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-3">
                <p className="font-semibold text-red-800 mb-1">⚠️ 주의사항</p>
                <p className="text-sm text-red-700">이 작업은 되돌릴 수 없으며, 삭제된 데이터는 복구할 수 없습니다.</p>
              </div>
              <p className="text-slate-600">
                선택한 시험 결과가 즉시 삭제되고 모든 통계 데이터에 반영됩니다.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="flex-1">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResult} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold">
              <Trash2 className="h-4 w-4 mr-2" />
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copyright Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <p className="text-center text-sm text-slate-600">
          © 2025 BRAINIAC ENGLISH. All rights reserved.
        </p>
      </div>
    </motion.div>;
};
export default StudentHistoryView;