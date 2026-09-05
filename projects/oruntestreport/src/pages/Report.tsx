import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReportCardById, convertDbToAppFormat, ReportHighlight } from "@/integrations/supabase/reportService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { captureElement } from "@/utils/captureUtils";
import AreaSelector from "@/components/AreaSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeType, themeColorMap, getSchoolThemeColor } from "@/utils/themeColorUtils";
import { addHighlightStyles, removeHighlightStyles } from "@/utils/highlightUtils";
import ReportToolbar from "@/components/ReportToolbar";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import ReportHeader from "@/components/ReportHeader";
import ReportInfoCards from "@/components/ReportInfoCards";
import ReportKpiRail from "@/components/ReportKpiRail";
import ReportStatCharts from "@/components/ReportStatCharts";
import DifficultProblemsExplanation from "@/components/DifficultProblemsExplanation";
import HitQuestionPhotos from "@/components/HitQuestionPhotos";
import ExamFeaturesSection from "@/components/ExamFeaturesSection";
import KillerTop5Section from "@/components/KillerTop5Section";
import PassageVariantSection from "@/components/PassageVariantSection";
import type { ExamFeature, KillerProblem, PassageVariant } from "@/integrations/supabase/reportService";


import TeacherComment from "@/components/TeacherComment";
import ReportFooter from "@/components/ReportFooter";
import useHighlights from "@/hooks/useHighlights";
import useCapture from "@/hooks/useCapture";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSchoolLogo } from "@/lib/schoolLogos";
import { useLogoBannerTheme } from "@/lib/logoColor";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { Users } from "lucide-react";
import StudentSubmissionsDialog from "@/components/StudentSubmissionsDialog";

type ReportDataType = {
  id?: string;
  school: string;
  grade: string;
  examScope: string;
  teacher: string;
  teacherPhoto?: string;
  totalQuestions: number;
  objectiveQuestions: number;
  subjectiveQuestions: number;
  problemTypes: {
    id: string;
    name: string;
    category: string;
    questionType: 'objective' | 'subjective';
    difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  }[];
  overallEvaluation?: string;
  difficultProblemsExplanation?: string;
  examInfo?: string;
  examFeatures?: ExamFeature[];
  killerTop5?: KillerProblem[];
  originalPassages?: string;
  passageVariants?: PassageVariant[];

  highlights?: Array<ReportHighlight>;

  hitQuestionPhotos?: Array<{
    url: string;
    problemNumber?: number;
    problemName?: string;
    selectedArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  analysisType?: 'detailed' | 'simple';
};

const Report: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [reportData, setReportData] = useState<ReportDataType | null>(null);
  const [theme, setTheme] = useState<ThemeType>('blue');
  // 사용자가 수동으로 테마를 오버라이드했는지 추적 — true면 자동 매핑이 덮어쓰지 않음
  const [themeOverridden, setThemeOverridden] = useState<boolean>(false);

  const handleThemeChange = useCallback((next: ThemeType) => {
    setTheme(next);
    setThemeOverridden(true);
  }, []);

  // 학년/학교 자동 매핑 — 수동 오버라이드가 없을 때만 적용
  const applyAutoTheme = useCallback((school: string, grade: string) => {
    if (themeOverridden) return;
    const { color } = getSchoolThemeColor(school, grade);
    setTheme(color as ThemeType);
  }, [themeOverridden]);
  const [date] = useState<string>(new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const themeColors = themeColorMap[theme];
  // 학교 로고에서 추출한 헤더 배너 컬러 — 리포트 테두리에도 동일 적용
  const banner = useLogoBannerTheme(getSchoolLogo(reportData?.school || ''));
  const [reportTitle, setReportTitle] = useState<string>("");
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  
  const {
    highlights,
    highlightColor,
    setHighlightColor,
    saveHighlights,
    loadHighlights,
    restoreHighlights,
    addHighlight,
    removeHighlight
  } = useHighlights(id);

  const {
    handleCaptureReport,
    handleVisibleAreaCapture,
    handleScrollCapture,
    handleAreaSelectionComplete
  } = useCapture(reportData);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    highlights,
    highlightColor,
    addHighlight,
    removeHighlight
  });

  const handlePrintPDF = () => {
    toast.info("인쇄 창에서 'PDF로 저장'을 선택하시면 화면과 동일하게 저장됩니다.", {
      duration: 5000
    });
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    const target = reportContainerRef.current;
    const toastId = toast.loading("PDF 생성 중입니다...");
    try {
      // Temporarily expand any internal scroll areas so full content is captured
      const viewports = target.querySelectorAll<HTMLElement>('[data-radix-scroll-area-viewport]');
      const originalStyles: { el: HTMLElement; maxHeight: string; height: string; overflow: string }[] = [];
      viewports.forEach((el) => {
        originalStyles.push({
          el,
          maxHeight: el.style.maxHeight,
          height: el.style.height,
          overflow: el.style.overflow,
        });
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
        el.style.overflow = 'visible';
      });

      target.classList.add('pdf-capture-nowrap');

      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: target.scrollWidth,
        height: target.scrollHeight,
        style: {
          transform: 'none',
        },
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute('data-comment-empty-actions')) return false;
            if (node.hasAttribute('data-comment-actions')) return false;
          }
          return true;
        },
      });

      // Restore styles
      target.classList.remove('pdf-capture-nowrap');
      originalStyles.forEach(({ el, maxHeight, height, overflow }) => {
        el.style.maxHeight = maxHeight;
        el.style.height = height;
        el.style.overflow = overflow;
      });

      // Load image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load captured image'));
      });

      // 이미지 픽셀 크기와 정확히 일치하는 단일 페이지로 저장 (여백 제거)
      const pdfWidthPx = img.width;
      const pdfHeightPx = img.height;

      const pdf = new jsPDF({
        orientation: pdfHeightPx > pdfWidthPx ? 'p' : 'l',
        unit: 'px',
        format: [pdfWidthPx, pdfHeightPx],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidthPx, pdfHeightPx);

      const filename = `${reportTitle || 'report'}.pdf`;
      pdf.save(filename);
      toast.success("PDF가 저장되었습니다.", { id: toastId });
    } catch (e) {
      console.error('PDF 생성 실패:', e);
      toast.error("PDF 생성에 실패했습니다.", { id: toastId });
    }
  };

  const calculateStatistics = (data: ReportDataType) => {
    // Check if this is simple analysis mode
    const isSimpleAnalysis = data.analysisType === 'simple';

    if (isSimpleAnalysis) {
      // For simple analysis, use the actual question counts from the form
      const objectivePercentage = data.objectiveQuestions / data.totalQuestions * 100;
      const subjectivePercentage = data.subjectiveQuestions / data.totalQuestions * 100;
      
      // Calculate difficulty distribution based on category-weighted counts
      const difficulty = {
        easy: 0,
        medium: 0,
        hard: 0,
        very_hard: 0
      };
      
      const categoryDifficultyCount: Record<string, Record<string, number>> = {};
      
      // Count difficulties by category
      data.problemTypes.forEach(type => {
        const category = type.category || '기타';
        if (!categoryDifficultyCount[category]) {
          categoryDifficultyCount[category] = { easy: 0, medium: 0, hard: 0, very_hard: 0 };
        }
        categoryDifficultyCount[category][type.difficulty]++;
      });
      
      // Sum up difficulties across all categories
      Object.values(categoryDifficultyCount).forEach(categoryDiff => {
        Object.keys(difficulty).forEach(key => {
          difficulty[key as keyof typeof difficulty] += categoryDiff[key as keyof typeof categoryDiff] || 0;
        });
      });
      
      // Convert to percentages
      const totalProblems = Math.max(1, Object.values(difficulty).reduce((sum, count) => sum + count, 0));
      Object.keys(difficulty).forEach(key => {
        difficulty[key as keyof typeof difficulty] = (difficulty[key as keyof typeof difficulty] / totalProblems) * 100;
      });
      
      // Ensure all problemTypes have the category property
      const problemTypes = data.problemTypes.map(type => {
        if (!type.category) {
          return {
            ...type,
            category: type.name?.split(' ')[0] || '기타'
          };
        }
        return type;
      });
      
      return {
        objectivePercentage,
        subjectivePercentage,
        problemTypes,
        difficulty
      };
    } else {
      // Original calculation for detailed analysis
      // Calculate raw percentages
      const objectivePercentage = data.objectiveQuestions / data.totalQuestions * 100;
      const subjectivePercentage = data.subjectiveQuestions / data.totalQuestions * 100;

      // Calculate difficulty distribution
      const difficulty = {
        easy: 0,
        medium: 0,
        hard: 0,
        very_hard: 0
      };
      
      // Ensure all problemTypes have the category property
      const problemTypes = data.problemTypes.map(type => {
        // Only add category if it doesn't exist
        if (!type.category) {
          return {
            ...type,
            category: type.name?.split(' ')[0] || '기타' // Use first word of name as category or default to '기타'
          };
        }
        return type;
      });
      
      problemTypes.forEach(type => {
        difficulty[type.difficulty]++;
      });

      // Convert to percentages based on total problems
      const totalProblems = problemTypes.length;
      Object.keys(difficulty).forEach(key => {
        difficulty[key as keyof typeof difficulty] = difficulty[key as keyof typeof difficulty] / totalProblems * 100;
      });

      return {
        objectivePercentage,
        subjectivePercentage,
        problemTypes,
        difficulty
      };
    }
  };

  // Load report data and set theme based on school/grade
  useEffect(() => {
    const loadReportData = async () => {
      if (id) {
        const { data, error } = await getReportCardById(id);
        if (error) {
          toast.error("리포트 데이터를 불러오는데 실패했습니다: " + error.message);
          navigate("/saved-reports");
          return;
        }
        if (data) {
          const reportData = convertDbToAppFormat(data);
          // 학교명 뒤에 붙은 숫자(예: 1, 2) 제거
          reportData.school = reportData.school.replace(/\d+$/, '').trim();
          console.log('Loaded report data:', reportData);
          setReportData(reportData as unknown as ReportDataType);
          
          // Generate report title
          const title = `${reportData.school} ${reportData.grade} ${reportData.examScope} 분석리포트`;
          setReportTitle(title);
          
          // Automatically set theme based on school and grade (수동 오버라이드 없을 때만)
          applyAutoTheme(reportData.school, reportData.grade);
          
          // Set default values for missing data to prevent empty sections
          if (!reportData.difficultProblemsExplanation || reportData.difficultProblemsExplanation.trim() === '') {
            reportData.difficultProblemsExplanation = "현재 시험은 기본적인 문제 유형으로 구성되어 있어 일반적인 학습 방법을 통해 충분히 대비할 수 있습니다.";
          }
          
          if (!reportData.examInfo || reportData.examInfo.trim() === '') {
            reportData.examInfo = "중간고사";
          }
          
          if (!reportData.hitQuestionPhotos || reportData.hitQuestionPhotos.length === 0) {
            reportData.hitQuestionPhotos = [];
          }

          // Set default teacher if missing
          if (!reportData.teacher || reportData.teacher.trim() === '') {
            reportData.teacher = "미정";
          }

          // Set default overall evaluation if missing
          if (!reportData.overallEvaluation || reportData.overallEvaluation.trim() === '') {
            const defaultEval = [
              {
                category: '종합 평가',
                evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
              },
              {
                category: '학습 난이도',
                evaluation: '중간 수준의 난이도로, 기본 개념을 충실히 학습한 학생이라면 쉽게 해결할 수 있습니다.'
              },
              {
                category: '시험 유형',
                evaluation: '다양한 유형의 문제가 골고루 출제되었으며, 기본적인 영어 능력을 평가하기에 적합합��다.'
              }
            ];
            reportData.overallEvaluation = JSON.stringify(defaultEval);
          }

          setTimeout(() => {
            setIsLoaded(true);
          }, 100);
          return;
        }
      }
      
      const storedData = localStorage.getItem("examReportData");
      if (!storedData) {
        toast.error("리포트 데이터를 찾을 수 없습니다. 새로운 분석을 생성해주세요.");
        navigate("/");
        return;
      }
      
      try {
        const parsedData = JSON.parse(storedData);
        setReportData(parsedData);
        
        // Generate report title
        const title = `${parsedData.school} ${parsedData.grade} ${parsedData.examScope} 분석리포트`;
        setReportTitle(title);
        
        // Automatically set theme based on school and grade (수동 오버라이드 없을 때만)
        applyAutoTheme(parsedData.school, parsedData.grade);
        
        // Set default values for missing data
        if (!parsedData.difficultProblemsExplanation || parsedData.difficultProblemsExplanation.trim() === '') {
          parsedData.difficultProblemsExplanation = "현재 시험은 기본적인 문제 유형으로 구성되어 있어 일반적인 학습 방법을 통해 충분히 대비할 수 있습니다.";
        }
        
        if (!parsedData.examInfo || parsedData.examInfo.trim() === '') {
          parsedData.examInfo = "중간고사";
        }

        // Set default teacher if missing
        if (!parsedData.teacher || parsedData.teacher.trim() === '') {
          parsedData.teacher = "미정";
        }

        // Set default overall evaluation if missing
        if (!parsedData.overallEvaluation || parsedData.overallEvaluation.trim() === '') {
          const defaultEval = [
            {
              category: '종합 평가',
              evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
            },
            {
              category: '학습 난이도',
              evaluation: '중간 수준의 난이도로, 기본 개념을 충실히 학습한 학생이라면 쉽게 해결할 수 있습니다.'
            },
            {
              category: '시험 유형',
              evaluation: '다양한 유형의 문제가 골고루 출제되었으며, 기본적인 영어 능력을 평가하기에 적합합니다.'
            }
          ];
          parsedData.overallEvaluation = JSON.stringify(defaultEval);
        }
        
        setTimeout(() => {
          setIsLoaded(true);
        }, 100);
      } catch (error) {
        console.error("Failed to parse report data:", error);
        toast.error("리포트 데이터를 불러오는데 실패했습니다.");
        navigate("/");
      }
    };
    
    loadReportData();
  }, [navigate, id]);

  // Load highlights when report data is loaded
  useEffect(() => {
    if (id && reportData) {
      loadHighlights();
    }
  }, [id, reportData, loadHighlights]);

  // Add CSS for highlights to the component
  useEffect(() => {
    addHighlightStyles();
    return () => {
      removeHighlightStyles();
    };
  }, []);

  // Apply highlights after the component has loaded and when highlights change
  useEffect(() => {
    if (isLoaded && reportContainerRef.current) {
      // Give a short delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        console.log('Running restoreHighlights after delay');
        restoreHighlights(reportContainerRef.current);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, restoreHighlights]);

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative w-20 h-20">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full opacity-75 group-hover:opacity-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-4 border-indigo-500 animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-t-4 border-violet-400 animate-spin animation-delay-300"></div>
        </div>
        <p className="mt-6 text-xl text-indigo-900 font-medium">리포트 데이터 로딩 중...</p>
        <p className="text-sm text-indigo-600/70">잠시만 기다려주세요</p>
      </div>
    );
  }

  const stats = calculateStatistics(reportData);
  
  // Ensure gradient consistency for all school types
  const gradient = `from-${theme}-50 via-${theme}-50/30 to-${theme}-50/10`;
  
  const hasDifficultProblems = reportData.problemTypes.some(
    type => type.difficulty === 'hard' || type.difficulty === 'very_hard'
  );

  // Parse the overall evaluation data
  let parsedEvaluations = [];
  try {
    if (reportData.overallEvaluation) {
      parsedEvaluations = JSON.parse(reportData.overallEvaluation);
      
      // Filter out categories with empty evaluations
      parsedEvaluations = parsedEvaluations.filter((item: any) => 
        item.evaluation && item.evaluation.trim() !== ''
      );
      
      // If we ended up with no evaluations, add a default one
      if (parsedEvaluations.length === 0) {
        parsedEvaluations = [{
          category: '종합 평가',
          evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
        }];
      }
    } else {
      // If no evaluation at all, add a default one
      parsedEvaluations = [{
        category: '종합 평가',
        evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
      }];
    }
    
    // Update report data with parsed evaluations
    reportData.overallEvaluation = JSON.stringify(parsedEvaluations);
    
  } catch (e) {
    console.error('Error parsing overall evaluation:', e);
    // Create a default evaluation
    parsedEvaluations = [{
      category: '종합 평가',
      evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
    }];
    reportData.overallEvaluation = JSON.stringify(parsedEvaluations);
  }

  return (
    <div 
      data-theme={theme}
      className="min-h-screen py-12 px-4 print:bg-white print:py-0 relative" 
      style={{
        '--theme-primary': themeColors.primary,
        '--theme-secondary': themeColors.secondary,
        '--theme-tertiary': themeColors.tertiary,
        '--theme-accent': themeColors.accent,
        '--theme-light': themeColors.light,
        '--theme-vibrant': themeColors.vibrant,
        '--theme-pastel': themeColors.pastel,
        '--theme-accent2': themeColors.accent2,
        '--theme-highlight': themeColors.highlight,
        backgroundColor: 'hsl(var(--paper-warm))',
        backgroundImage: `
          radial-gradient(1100px 640px at 108% -12%, hsl(var(--backdrop-glow-1) / 0.07), transparent 62%),
          radial-gradient(900px 560px at -8% 108%, hsl(var(--backdrop-glow-2) / 0.06), transparent 62%)
        `
      } as React.CSSProperties}
    >
      <div 
        className={`w-full max-w-5xl mx-auto transition-all duration-700 relative z-10 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <ReportToolbar 
          onNavigateBack={() => navigate("/saved-reports")}
          onPrintPDF={handlePrintPDF}
          theme={theme}
          onThemeChange={handleThemeChange}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          themeColors={themeColors}
          title={reportTitle}
        />

        <div 
          ref={reportContainerRef} 
          className="report-container print:shadow-none print:border-none print:outline-none flex flex-col"
          style={{
            borderColor: 'hsl(0 0% 100% / 0.75)',
            outline: `1px solid color-mix(in srgb, ${banner.mid} 40%, transparent)`,
            outlineOffset: '-18px',
            boxShadow: `inset 0 1px 0 hsl(0 0% 100% / 0.9), inset 0 0 0 1px color-mix(in srgb, ${banner.mid} 18%, transparent), 0 1px 2px hsl(var(--ink) / 0.04), 0 24px 60px -28px color-mix(in srgb, ${banner.from} 55%, transparent), 0 64px 120px -56px hsl(var(--ink) / 0.35)`,
          }}
        >
          <ScrollArea className="flex-1 overflow-hidden pr-4">
            <div className="space-y-8">
              <ReportHeader 
                date={date}
                themeColors={themeColors}
                schoolName={reportData.school}
              />

              <ReportInfoCards 
                reportData={reportData}
                themeColors={themeColors}
              />

              <div className="report-section">
                <ReportKpiRail problemTypes={reportData.problemTypes as any} />
              </div>

              <ReportStatCharts 
                stats={stats}
                themeColors={themeColors}
                analysisType={reportData.analysisType}
                reportId={id}
                banner={banner}
              />

              {/* 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
              {(reportData.school.includes('고등학교') || reportData.grade.includes('고') || 
                (!reportData.school.includes('고등학교') && !reportData.grade.includes('고') && reportData.analysisType === 'detailed')) && (
                <>
                  <ExamFeaturesSection features={reportData.examFeatures} />
                  <KillerTop5Section items={reportData.killerTop5} />
                  <PassageVariantSection items={reportData.passageVariants || []} />

                  {(reportData.examFeatures?.length ?? 0) === 0 && (
                    <DifficultProblemsExplanation 
                      explanation={reportData.difficultProblemsExplanation}
                      hasDifficultProblems={hasDifficultProblems}
                      themeColors={themeColors}
                    />
                  )}
                  {(reportData.killerTop5?.length ?? 0) === 0 && (
                    <HitQuestionPhotos 
                      photos={reportData.hitQuestionPhotos}
                      themeColors={themeColors}
                      reportId={id}
                    />
                  )}
                </>
              )}


              <TeacherComment 
                teacherPhoto={reportData.teacherPhoto}
                teacher={reportData.teacher}
                overallEvaluation={reportData.overallEvaluation}
                themeColors={themeColors}
                isHighSchool={reportData.school.includes('고등학교') || reportData.grade.includes('고')}
                banner={banner}
              />
            </div>
          </ScrollArea>

          <ReportFooter themeColors={themeColors} />
        </div>
      </div>

      {/* PDF 다운로드 플로팅 버튼 */}
      <Button
        onClick={handleDownloadPDF}
        size="lg"
        className="fixed bottom-8 right-8 z-[9999] shadow-2xl print:hidden gap-2 px-6 py-6 text-base font-bold rounded-full border-2"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-deep)))',
          color: 'hsl(var(--paper))',
          borderColor: 'hsl(var(--gold-soft))',
        }}
      >
        <Download className="h-5 w-5" />
        PDF 다운로드
      </Button>

      {/* 학생 제출 플로팅 버튼 */}
      {id && (
        <Button
          onClick={() => setSubmissionsOpen(true)}
          size="lg"
          variant="outline"
          className="fixed bottom-8 right-[15.5rem] z-[9999] shadow-2xl print:hidden gap-2 px-6 py-6 text-base font-bold rounded-full border-2 bg-white"
        >
          <Users className="h-5 w-5" />
          학생 제출
        </Button>
      )}

      {id && (
        <StudentSubmissionsDialog
          open={submissionsOpen}
          onOpenChange={setSubmissionsOpen}
          reportId={id}
          problems={reportData.problemTypes as any}
        />
      )}

      {/* 우상단 플로팅 테마 토글 */}
      <FloatingThemeToggle
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        isOverridden={themeOverridden}
      />
    </div>
  );
};

export default Report;
