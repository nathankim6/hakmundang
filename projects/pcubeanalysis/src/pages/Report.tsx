import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReportCardById, convertDbToAppFormat, ReportHighlight } from "@/integrations/supabase/reportService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { printElementAsImage } from "@/utils/captureUtils";
import AreaSelector from "@/components/AreaSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeType, themeColorMap, getSchoolThemeColor } from "@/utils/themeColorUtils";
import { addHighlightStyles, removeHighlightStyles } from "@/utils/highlightUtils";
import ReportToolbar from "@/components/ReportToolbar";
import ReportHeader from "@/components/ReportHeader";
import ReportInfoCards from "@/components/ReportInfoCards";
import ReportStatCharts from "@/components/ReportStatCharts";
import DifficultProblemsExplanation from "@/components/DifficultProblemsExplanation";
import HitQuestionPhotos from "@/components/HitQuestionPhotos";
import TeacherComment from "@/components/TeacherComment";
import ReportFooter from "@/components/ReportFooter";
import useHighlights from "@/hooks/useHighlights";
import useCapture from "@/hooks/useCapture";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  highlights?: Array<ReportHighlight>;
  hitQuestionPhotos?: Array<{
    url: string;
    problemNumber?: number;
    problemName?: string;
    comment?: string;
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
  const [date] = useState<string>(new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const themeColors = themeColorMap[theme];
  const [reportTitle, setReportTitle] = useState<string>("");
  
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

  const handlePrintPDF = async () => {
    const container = reportContainerRef.current;
    if (!container) {
      toast.error("리포트를 찾을 수 없습니다.");
      return;
    }

    const viewport = container.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLElement | null;
    const scrollAreaRoot = viewport?.parentElement as HTMLElement | null;

    const originalContainerStyle = {
      height: container.style.height,
      maxHeight: container.style.maxHeight,
      overflow: container.style.overflow,
    };
    const originalViewportStyle = viewport
      ? {
          height: viewport.style.height,
          maxHeight: viewport.style.maxHeight,
          overflow: viewport.style.overflow,
        }
      : null;
    const originalScrollAreaRootStyle = scrollAreaRoot
      ? {
          paddingRight: scrollAreaRoot.style.paddingRight,
        }
      : null;

    try {
      container.style.height = 'auto';
      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';
      if (viewport) {
        viewport.style.height = 'auto';
        viewport.style.maxHeight = 'none';
        viewport.style.overflow = 'visible';
      }
      if (scrollAreaRoot) {
        scrollAreaRoot.style.paddingRight = '0';
      }

      await new Promise((r) => setTimeout(r, 300));
      toast.info('선택한 영역 크기 그대로 한 페이지 PDF로 저장 중입니다...', { duration: 2500 });
      await printElementAsImage(container, { fileName: 'report' });
    } finally {
      container.style.height = originalContainerStyle.height;
      container.style.maxHeight = originalContainerStyle.maxHeight;
      container.style.overflow = originalContainerStyle.overflow;
      if (viewport && originalViewportStyle) {
        viewport.style.height = originalViewportStyle.height;
        viewport.style.maxHeight = originalViewportStyle.maxHeight;
        viewport.style.overflow = originalViewportStyle.overflow;
      }
      if (scrollAreaRoot && originalScrollAreaRootStyle) {
        scrollAreaRoot.style.paddingRight = originalScrollAreaRootStyle.paddingRight;
      }
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
          console.log('Loaded report data:', reportData);
          setReportData(reportData as unknown as ReportDataType);
          
          // Generate report title
          const title = `${reportData.school} ${reportData.grade} ${reportData.examScope} 분석리포트`;
          setReportTitle(title);
          
          // Automatically set theme based on school and grade
          const { color } = getSchoolThemeColor(reportData.school, reportData.grade);
          console.log('Setting theme color for:', reportData.school, reportData.grade, 'to', color);
          setTheme(color as ThemeType);
          
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
        
        // Automatically set theme based on school and grade
        const { color } = getSchoolThemeColor(parsedData.school, parsedData.grade);
        setTheme(color as ThemeType);
        
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
      className={`min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${gradient} py-8 px-4 print:bg-white print:py-0 relative overflow-hidden animate-gradient-slow`} 
      style={{
        '--theme-primary': themeColors.primary,
        '--theme-secondary': themeColors.secondary,
        '--theme-tertiary': themeColors.tertiary,
        '--theme-accent': themeColors.accent,
        '--theme-light': themeColors.light,
        '--theme-vibrant': themeColors.vibrant,
        '--theme-pastel': themeColors.pastel,
        '--theme-accent2': themeColors.accent2,
        '--theme-highlight': themeColors.highlight
      } as React.CSSProperties}
    >
      
      {/* Enhanced background elements - keeping consistent across all school types */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div 
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-2xl animate-pulse-glow" 
          style={{ backgroundColor: themeColors.pastel + '90' }}
        ></div>
        <div 
          className="absolute top-1/4 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-2xl animate-pulse-glow animation-delay-2000" 
          style={{ backgroundColor: themeColors.light + '80' }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/3 transform -translate-x-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-2xl animate-pulse-glow animation-delay-4000" 
          style={{ backgroundColor: themeColors.accent2 + '70' }}
        ></div>
        
        <div 
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl animate-pulse-glow animation-delay-1000" 
          style={{ backgroundColor: themeColors.vibrant + '40' }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/5 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl animate-pulse-glow animation-delay-3000" 
          style={{ backgroundColor: themeColors.highlight + '50' }}
        ></div>
        
        {/* Add subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDYwIEwgNjAgMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjI1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>
      </div>

      <div 
        className={`w-full max-w-5xl mx-auto transition-all duration-700 relative z-10 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <ReportToolbar 
          onNavigateBack={() => navigate("/saved-reports")}
          onPrintPDF={handlePrintPDF}
          theme={theme}
          onThemeChange={setTheme}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          themeColors={themeColors}
          title={reportTitle}
        />

        <div 
          ref={reportContainerRef} 
          className="report-container group transition-all duration-500 hover:shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] print:shadow-none print:border-none bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-8 flex flex-col relative"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: `0 10px 40px -10px ${themeColors.primary}30, 0 8px 30px rgba(0,0,0,0.12)`,
          }}
        >
          {/* Enhanced top gradient bar */}
          <div 
            className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r rounded-t-2xl" 
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.vibrant}, ${themeColors.highlight}, ${themeColors.accent2})`,
              boxShadow: `0 3px 15px -3px ${themeColors.primary}60`
            }}
          ></div>
          
          {/* Enhanced decorative elements - consistent for all reports */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full transform translate-x-1/4 -translate-y-1/4" 
            style={{
              background: `radial-gradient(circle at center, ${themeColors.vibrant}, transparent 70%)`,
            }}
          ></div>

          <div 
            className="absolute bottom-0 left-0 w-64 h-64 opacity-10 rounded-full transform -translate-x-1/4 translate-y-1/4" 
            style={{
              background: `radial-gradient(circle at center, ${themeColors.accent2}, transparent 70%)`,
            }}
          ></div>
          
          {/* Enhanced decorative pattern */}
          <svg 
            className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none" 
            aria-hidden="true" 
            style={{
              opacity: 0.07,
              minHeight: "100%",
              minWidth: "100%"
            }}
          >
            <defs>
              <linearGradient id="patternGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={themeColors.light} />
                <stop offset="50%" stopColor={themeColors.accent} />
                <stop offset="100%" stopColor={themeColors.vibrant} />
              </linearGradient>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill={themeColors.primary + '80'} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
            <g>
              <path d="M0 40 Q70 15 140 40 T280 40 T420 40 T560 40" stroke="url(#patternGradient)" strokeWidth="12" fill="none" />
              <path d="M0 80 Q70 55 140 80 T280 80 T420 80 T560 80" stroke="url(#patternGradient)" strokeWidth="11" fill="none" opacity="0.5" />
              <path d="M0 120 Q70 95 140 120 T280 120 T420 120 T560 120" stroke="url(#patternGradient)" strokeWidth="10" fill="none" opacity="0.33" />
            </g>
          </svg>
          
          {/* Title section removed as requested */}

          <ScrollArea className="flex-1 overflow-hidden pr-6">
            <div className="space-y-8">
              <ReportHeader 
                date={date}
                themeColors={themeColors}
              />

              <ReportInfoCards 
                reportData={reportData}
                themeColors={themeColors}
              />

              <ReportStatCharts 
                stats={stats}
                themeColors={themeColors}
                analysisType={reportData.analysisType}
              />

              {/* 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
              {(reportData.school.includes('고등학교') || reportData.grade.includes('고') || 
                (!reportData.school.includes('고등학교') && !reportData.grade.includes('고') && reportData.analysisType === 'detailed')) && (
                <DifficultProblemsExplanation 
                  explanation={reportData.difficultProblemsExplanation}
                  hasDifficultProblems={hasDifficultProblems}
                  themeColors={themeColors}
                />
              )}

              {/* 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
              {(reportData.school.includes('고등학교') || reportData.grade.includes('고') || 
                (!reportData.school.includes('고등학교') && !reportData.grade.includes('고') && reportData.analysisType === 'detailed')) && (
                <HitQuestionPhotos 
                  photos={reportData.hitQuestionPhotos}
                  themeColors={themeColors}
                />
              )}

              <TeacherComment 
                teacherPhoto={reportData.teacherPhoto}
                teacher={reportData.teacher}
                overallEvaluation={reportData.overallEvaluation}
                themeColors={themeColors}
                isHighSchool={reportData.school.includes('고등학교') || reportData.grade.includes('고')}
              />
            </div>
          </ScrollArea>

          <ReportFooter themeColors={themeColors} />
        </div>
      </div>
    </div>
  );
};

export default Report;
