import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, Trophy, Target, BookOpen, FileText, 
  Languages, PenLine, TrendingUp, AlertCircle, Loader2, GraduationCap, Clock, Award, Medal, Home, ChevronRight, Users
} from 'lucide-react';
import { analysisCategories } from '@/data/levelTestQuestions';
import { prepAnalysisCategories, prepSectionNames, calculatePrepTotalMaxScore } from '@/data/prepLevelTestQuestions';
import { supabase } from '@/integrations/supabase/client';
import { recalculateResult } from '@/utils/levelTestScoring';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import PrepQuestionDetailDialog from '@/components/results/PrepQuestionDetailDialog';
import QuestionDetailDialog from '@/components/results/QuestionDetailDialog';
import HighSchoolQuestionDetailDialog from '@/components/results/HighSchoolQuestionDetailDialog';

interface SectionScore {
  section: string;
  sectionName: string;
  totalQuestions: number;
  correctCount: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
}

interface SubCategoryScore {
  name: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
}

// 초등 레벨테스트 새 배점: 어휘 1점, 나머지 2점
const recomputePrepTotalStatic = (sections: SectionScore[] | null | undefined): number =>
  (sections || []).reduce((acc, s) => acc + (s.correctCount || 0) * (s.section === 'vocabulary' ? 1 : 2), 0);


interface LevelTestResultData {
  id: string;
  student_name: string;
  student_school: string | null;
  student_grade: string | null;
  answers: Record<number, string | number>;
  total_score: number;
  level: string;
  section_scores: SectionScore[];
  sub_category_scores: Record<string, SubCategoryScore[]>;
  elapsed_time: number;
  created_at: string;
  academy?: string | null;
  grade_overrides?: Record<string, ForcedAchievementGrade> | null;
}

type TestType = 'prep' | 'middle' | 'high';
type ForcedAchievementGrade = 'A' | 'B' | 'C';

const LevelTestResult = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<LevelTestResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<TestType>('middle');
  
  // Dialog state for question details
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Average scores state
  const [top5Average, setTop5Average] = useState(0);
  const [top20Average, setTop20Average] = useState(0);
  const [overallAverage, setOverallAverage] = useState(0);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) {
        setError('결과 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('level_test_results')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        if (!data) {
          setError('결과를 찾을 수 없습니다.');
        } else {
          // Detect test type based on data structure
          let detectedType: TestType = 'middle';
          if (data.level?.startsWith('prep-')) {
            detectedType = 'prep';
          } else {
            // Check sub_category_scores structure to determine type
            const subCatScores = data.sub_category_scores as Record<string, any[]> | null;
            if (subCatScores) {
              // High school test has "practical" section, middle school has "sentence" section
              if ('practical' in subCatScores) {
                detectedType = 'high';
              } else if ('sentence' in subCatScores) {
                detectedType = 'middle';
              } else if (data.total_score <= 100) {
                // Fallback to score-based detection only if structure check is inconclusive
                detectedType = 'high';
              }
            } else if (data.total_score <= 100) {
              detectedType = 'high';
            }
          }
          setTestType(detectedType);

          const gradeOverrides = (data.grade_overrides && typeof data.grade_overrides === 'object' && !Array.isArray(data.grade_overrides))
            ? data.grade_overrides as Record<string, ForcedAchievementGrade>
            : null;

          // 중등 테스트는 점수 재계산, 고등/초등은 DB값 사용
          if (detectedType === 'middle' && data.answers && Object.keys(data.answers).length > 0) {
            const recalculated = recalculateResult({
              ...data,
              answers: data.answers as Record<string, any>
            });
            setResult({
              ...data,
              answers: data.answers as Record<number, string | number>,
              section_scores: recalculated.section_scores as unknown as SectionScore[],
              sub_category_scores: recalculated.sub_category_scores as unknown as Record<string, SubCategoryScore[]>,
              total_score: recalculated.total_score,
              grade_overrides: gradeOverrides,
            });
          } else {
            setResult({
              ...data,
              answers: data.answers as Record<number, string | number>,
              section_scores: data.section_scores as unknown as SectionScore[],
              sub_category_scores: data.sub_category_scores as unknown as Record<string, SubCategoryScore[]>,
              grade_overrides: gradeOverrides,
            });
          }

          const resultAcademy = data.academy || 'brainiac';

          // Fetch all results for the same academy + test type to calculate averages
          let query = supabase
            .from('level_test_results')
            .select('total_score, level, section_scores, sub_category_scores, answers, academy')
            .eq('academy', resultAcademy);
          
          if (detectedType === 'prep') {
            query = query.like('level', 'prep-%');
          } else {
            // Fetch all non-prep results and filter client-side by structure
            query = query.not('level', 'like', 'prep-%');
          }

          const { data: allResults } = await query;
          
          if (allResults && allResults.length > 0) {
            // Filter results by test type based on sub_category_scores structure
            const filteredResults = detectedType === 'prep' 
              ? allResults 
              : allResults.filter(r => {
                  const subCat = r.sub_category_scores as Record<string, any[]> | null;
                  if (!subCat) return false;
                  if (detectedType === 'high') {
                    return 'practical' in subCat;
                  } else {
                    return 'sentence' in subCat;
                  }
                });

            if (filteredResults.length > 0) {
              // 중등 테스트는 평균 계산 시에도 점수 재계산 적용
              const scores = filteredResults.map(r => {
                if (detectedType === 'middle' && r.answers && Object.keys(r.answers as object).length > 0) {
                  const recalc = recalculateResult({ answers: r.answers as Record<string, any> });
                  return recalc.total_score;
                }
                if (detectedType === 'prep') {
                  const secs = r.section_scores as unknown as SectionScore[] | null;
                  if (secs && Array.isArray(secs)) {
                    return recomputePrepTotalStatic(secs);
                  }
                }
                return r.total_score;
              }).sort((a, b) => b - a);
              
              const top5Count = Math.max(1, Math.ceil(scores.length * 0.05));
              const top20Count = Math.max(1, Math.ceil(scores.length * 0.2));
              
              setTop5Average(Math.round(scores.slice(0, top5Count).reduce((a, b) => a + b, 0) / top5Count));
              setTop20Average(Math.round(scores.slice(0, top20Count).reduce((a, b) => a + b, 0) / top20Count));
              
              // 파트너 학원은 실제 평균, 브래니악 영어학원 초등 레벨테스트만 171점 고정
              if (detectedType === 'prep' && resultAcademy === 'never-orun') {
                setOverallAverage(171);
              } else {
                setOverallAverage(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch result:', err);
        setError('결과를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'grammar': 
      case 'grammarA':
      case 'grammarB':
      case 'grammarC':
        return <FileText className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'reading': return <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'vocabulary': return <Languages className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'sentence': return <PenLine className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'practical': return <Target className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return null;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'grammar': return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' };
      case 'grammarA': return { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50' };
      case 'grammarB': return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' };
      case 'grammarC': return { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' };
      case 'reading': return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
      case 'vocabulary': return { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' };
      case 'sentence': return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' };
      case 'practical': return { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-50' };
    }
  };

  const getAchievementGrade = (percentage: number): string => {
    if (percentage >= 90) return 'S';
    if (percentage >= 75) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 45) return 'C';
    return 'D';
  };

  const normalizeForcedAchievementGrade = (grade: string): ForcedAchievementGrade => {
    if (grade === 'S' || grade === 'A') return 'A';
    if (grade === 'B') return 'B';
    return 'C';
  };

  const getEffectiveGrade = (key: string, auto: string): string => {
    const override = result?.grade_overrides?.[key];
    return override === 'A' || override === 'B' || override === 'C'
      ? override
      : normalizeForcedAchievementGrade(auto);
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'S': return 'bg-gradient-to-br from-purple-500 to-purple-700 text-white';
      case 'A': return 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white';
      case 'B': return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white';
      case 'C': return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-700 text-white';
    }
  };

  const getTestTypeLabel = () => {
    switch (testType) {
      case 'prep': return '초등부';
      case 'high': return '고등부';
      default: return '중등부';
    }
  };

  const getMaxScore = () => {
    switch (testType) {
      case 'prep': return calculatePrepTotalMaxScore();
      case 'high': return 100;
      default: return 260;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          <span className="text-slate-600 font-medium">결과를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="p-6 sm:p-8 text-center border-0 shadow-xl max-w-sm w-full">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800">{error || '결과를 찾을 수 없습니다'}</h2>
          <p className="text-sm text-slate-500 mb-6">시험을 먼저 완료해주세요.</p>
          <Button onClick={() => navigate('/')} className="bg-slate-800 hover:bg-slate-700 w-full">
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </Card>
      </div>
    );
  }

  const sectionScores = result.section_scores;
  const subCategoryScores = result.sub_category_scores;
  const maxScore = getMaxScore();
  // 초등 레벨테스트는 새 배점(어휘 1점, 나머지 2점)으로 재계산
  const displayTotalScore = testType === 'prep'
    ? recomputePrepTotalStatic(sectionScores)
    : result.total_score;
  const overallPercentage = Math.round((displayTotalScore / maxScore) * 100);
  const overallGrade = getAchievementGrade(overallPercentage);

  const radarData = sectionScores.map(s => ({
    subject: s.sectionName.length > 6 ? s.sectionName.slice(0, 6) + '...' : s.sectionName,
    fullSubject: s.sectionName,
    score: s.percentage,
    fullMark: 100
  }));

  // Get sections based on test type
  const getSections = () => {
    if (testType === 'prep') {
      return ['reading', 'grammarA', 'grammarB', 'grammarC', 'vocabulary'];
    } else if (testType === 'high') {
      return ['vocabulary', 'grammar', 'practical', 'reading'];
    }
    return ['grammar', 'reading', 'vocabulary', 'sentence'];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-800 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 via-transparent to-slate-900/50" />
          
          <div className="relative z-10 p-4 sm:p-5">
            {/* Top Actions */}
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/report')}
                className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                돌아가기
              </Button>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 border border-white/20">
                <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-amber-300" />
                <span className="text-[10px] sm:text-xs font-semibold text-white">{getTestTypeLabel()} BEAT</span>
              </div>
            </div>

            {/* Header Content */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg sm:rounded-xl border border-white/20">
                <img 
                  src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png" 
                  alt="Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover" 
                />
              </div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                  브래니악 영어 진단평가(BEAT)
                </h1>
                <p className="text-slate-300 text-[10px] sm:text-xs mt-0.5">Orun Proficiency Report</p>
              </div>
            </div>
            
            {/* Student Info Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap className="h-3 w-3 text-slate-300" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-300 uppercase tracking-wide">이름</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white truncate">{result.student_name}</p>
              </div>
              
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-1.5 mb-1">
                  <Award className="h-3 w-3 text-slate-300" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-300 uppercase tracking-wide">학교/학년</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white truncate">{result.student_school || '-'} {result.student_grade || ''}</p>
              </div>
              
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 border border-white/15">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-slate-300" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-300 uppercase tracking-wide">소요 시간</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white">{formatTime(result.elapsed_time)}</p>
              </div>
              
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-700 border border-slate-600">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="h-3 w-3 text-amber-300" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-amber-200 uppercase tracking-wide">시험일</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white">{formatDate(result.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Overview - Mobile Optimized */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {/* Main Score Card */}
          <div className="col-span-2 relative overflow-hidden p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-8 -translate-x-8" />
            
            <div className="relative text-center">
              <div className={`w-14 h-14 sm:w-18 sm:h-18 mx-auto mb-2.5 rounded-2xl ${getGradeStyle(overallGrade)} flex items-center justify-center shadow-lg ring-4 ring-white/20`}>
                <span className="text-2xl sm:text-3xl font-black">{overallGrade}</span>
              </div>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{displayTotalScore}</span>
                <span className="text-sm sm:text-base font-medium text-white/60">/ {maxScore}점</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="col-span-3 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-[10px] sm:text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="w-3 h-3 text-slate-500" />
              영역별 분석
            </h3>
            <div className="h-[100px] sm:h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748B', fontSize: 8 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#94A3B8', fontSize: 7 }}
                    tickCount={4}
                  />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="#334155"
                    fill="#334155"
                    fillOpacity={0.3}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Average Score Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="relative overflow-hidden p-3 sm:p-4 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600 shadow-lg shadow-purple-200/50">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/5 rounded-full translate-y-5 -translate-x-5" />
            <div className="relative">
              <div className="flex items-center gap-1 mb-1.5">
                <Trophy className="w-3 h-3 text-amber-300" />
                <span className="text-[9px] sm:text-[10px] text-white/90 font-medium tracking-wide">상위 5%</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{top5Average}<span className="text-xs sm:text-sm font-semibold text-white/70 ml-0.5">점</span></div>
            </div>
          </div>
          <div className="relative overflow-hidden p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-500 via-blue-500 to-indigo-600 shadow-lg shadow-blue-200/50">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/5 rounded-full translate-y-5 -translate-x-5" />
            <div className="relative">
              <div className="flex items-center gap-1 mb-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span className="text-[9px] sm:text-[10px] text-white/90 font-medium tracking-wide">상위 20%</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{top20Average}<span className="text-xs sm:text-sm font-semibold text-white/70 ml-0.5">점</span></div>
            </div>
          </div>
          <div className="relative overflow-hidden p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-600 via-slate-600 to-slate-700 shadow-lg shadow-slate-300/50">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/5 rounded-full translate-y-5 -translate-x-5" />
            <div className="relative">
              <div className="flex items-center gap-1 mb-1.5">
                <Users className="w-3 h-3 text-slate-300" />
                <span className="text-[9px] sm:text-[10px] text-white/90 font-medium tracking-wide">전체평균</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{overallAverage}<span className="text-xs sm:text-sm font-semibold text-white/70 ml-0.5">점</span></div>
            </div>
          </div>
        </div>

        {/* Section Summary Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {sectionScores.map((score) => {
            const colors = getSectionColor(score.section);
            const grade = getEffectiveGrade(`section:${score.section}`, getAchievementGrade(score.percentage));
            
            return (
              <div key={score.section} className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${colors.light} border border-slate-100`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`flex items-center gap-1 ${colors.text}`}>
                    {getSectionIcon(score.section)}
                    <span className="font-semibold text-[9px] sm:text-xs truncate max-w-[70px] sm:max-w-none">{score.sectionName}</span>
                  </div>
                  <span className={`text-[9px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${getGradeStyle(grade)}`}>
                    {grade}
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-800">{score.percentage}%</div>
                <div className="text-[9px] sm:text-xs text-slate-500">{score.correctCount}/{score.totalQuestions}문항</div>
                <div className="mt-1.5 h-1 bg-white/80 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${colors.bg}`}
                    style={{ width: `${score.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Section Analysis - Mobile Optimized */}
        <div className="space-y-2 sm:space-y-3">
          {getSections().map((section) => {
            const subScores = subCategoryScores[section] || [];
            const sectionScore = sectionScores.find(s => s.section === section);
            const colors = getSectionColor(section);
            const weakAreas = subScores.filter(s => s.percentage < 50);
            
            if (!sectionScore || subScores.length === 0) return null;
            
            return (
              <div key={section} className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <h3 className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 ${colors.text}`}>
                    {getSectionIcon(section)}
                    {sectionScore.sectionName}
                  </h3>
                  <span className="text-base sm:text-lg font-black text-slate-800">{sectionScore.percentage}%</span>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  {subScores.map((sub, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 -m-1.5 rounded-lg transition-colors group"
                      onClick={() => {
                        setSelectedCategory(sub.name);
                        setSelectedSection(section);
                        setDialogOpen(true);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs mb-0.5">
                          <span className="text-slate-600 truncate group-hover:text-slate-800">{sub.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 flex-shrink-0">
                              {sub.correctCount}/{sub.totalQuestions}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              sub.percentage >= 70 ? 'bg-emerald-500' : 
                              sub.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {weakAreas.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-start gap-1.5 text-[10px] sm:text-xs">
                      <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-600 leading-relaxed">
                        <strong>보완 필요:</strong> {weakAreas.map(s => s.name).join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
            종합 평가
          </h2>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="p-3 bg-white rounded-lg border border-slate-100">
              <h4 className="font-semibold text-slate-700 text-[10px] sm:text-xs mb-1.5 flex items-center gap-1.5">
                📊 성적 분석
              </h4>
              <p className="text-slate-600 text-[10px] sm:text-xs leading-relaxed">
                종합 <strong className="text-slate-800">{displayTotalScore}점 / {maxScore}점</strong>, 
                현재 수준 <strong className="text-slate-800">{result.level}</strong>.
                {overallPercentage >= 70 
                  ? ' 우수한 실력입니다!'
                  : overallPercentage >= 50
                  ? ' 기초가 잘 다져져 있습니다.'
                  : ' 보완 학습이 필요합니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-3">
          <p className="text-[10px] sm:text-xs text-slate-400">
            © {new Date().getFullYear()} BRAINIAC ENGLISH. All rights reserved.
          </p>
        </div>
      </div>

      {/* Question Detail Dialogs */}
      {testType === 'prep' && result && (
        <PrepQuestionDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categoryName={selectedCategory}
          section={selectedSection}
          studentAnswers={result.answers as Record<string, any>}
        />
      )}
      {testType === 'middle' && result && (
        <QuestionDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categoryName={selectedCategory}
          section={selectedSection}
          studentAnswers={result.answers as Record<string, any>}
        />
      )}
      {testType === 'high' && result && (
        <HighSchoolQuestionDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categoryName={selectedCategory}
          section={selectedSection}
          studentAnswers={result.answers as Record<string, any>}
        />
      )}
    </div>
  );
};

export default LevelTestResult;
