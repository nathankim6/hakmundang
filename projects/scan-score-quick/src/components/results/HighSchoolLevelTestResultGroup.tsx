import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Award, ChevronUp, ChevronDown, Image, Trash2, Eye, EyeOff, BookOpen, FileText, Languages, Target, AlertCircle, GraduationCap, Clock, Medal, Pencil, Check, X } from 'lucide-react';
import levelTestResultLogo from "@/assets/level-test-result-logo.png";
import { formatDate } from '@/utils/resultsUtils';
import { toast } from '@/hooks/use-toast';
import { hsAnalysisCategories, hsSectionNames } from '@/data/highSchoolLevelTestQuestions';
import html2canvas from 'html2canvas';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import HighSchoolQuestionDetailDialog from './HighSchoolQuestionDetailDialog';
import { supabase } from '@/integrations/supabase/client';

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

interface HighSchoolLevelTestResult {
  id: string;
  student_name: string;
  student_school: string | null;
  student_grade: string | null;
  total_score: number;
  level: string;
  section_scores: SectionScore[];
  sub_category_scores: Record<string, SubCategoryScore[]>;
  elapsed_time: number;
  created_at: string;
  answers: Record<string, any>;
  grade_overrides?: Record<string, ForcedAchievementGrade> | null;
}

type ForcedAchievementGrade = 'A' | 'B' | 'C';

interface HighSchoolLevelTestResultGroupProps {
  results: HighSchoolLevelTestResult[];
  onDelete: (id: string) => Promise<void>;
  onUpdate?: (id: string, updates: { student_name?: string; student_school?: string; student_grade?: string; grade_overrides?: Record<string, ForcedAchievementGrade> }) => void;
}

const HighSchoolLevelTestResultGroup = ({
  results,
  onDelete,
  onUpdate
}: HighSchoolLevelTestResultGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const reportRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // 문제 상세 팝업 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});

  // 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editGrade, setEditGrade] = useState('');

  const [overridesMap, setOverridesMap] = useState<Record<string, Record<string, ForcedAchievementGrade>>>(() => {
    const init: Record<string, Record<string, ForcedAchievementGrade>> = {};
    results.forEach(r => {
      init[r.id] = (r.grade_overrides && typeof r.grade_overrides === 'object') ? { ...r.grade_overrides } : {};
    });
    return init;
  });

  useEffect(() => {
    const next: Record<string, Record<string, ForcedAchievementGrade>> = {};
    results.forEach(r => {
      next[r.id] = (r.grade_overrides && typeof r.grade_overrides === 'object') ? { ...r.grade_overrides } : {};
    });
    setOverridesMap(next);
  }, [results]);

  const NEXT_GRADE: Record<ForcedAchievementGrade, ForcedAchievementGrade> = { A: 'B', B: 'C', C: 'A' };

  const cycleGrade = async (resultId: string, key: string, current: ForcedAchievementGrade) => {
    const prevMap = overridesMap[resultId] || {};
    const currentGrade = prevMap[key] || current;
    const next = NEXT_GRADE[currentGrade];
    const nextMap = { ...prevMap, [key]: next };
    setOverridesMap(prev => ({ ...prev, [resultId]: nextMap }));
    try {
      const { data, error } = await supabase
        .from('level_test_results')
        .update({ grade_overrides: nextMap } as any)
        .eq('id', resultId)
        .select('grade_overrides')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('No level test result was updated.');
      const savedMap = (data.grade_overrides && typeof data.grade_overrides === 'object')
        ? data.grade_overrides as Record<string, ForcedAchievementGrade>
        : nextMap;
      setOverridesMap(prev => ({ ...prev, [resultId]: savedMap }));
      onUpdate?.(resultId, { grade_overrides: savedMap });
    } catch (e: any) {
      console.error('[GradeOverride] save failed', e);
      toast({ title: '저장 실패', description: '성취도 변경 저장에 실패했습니다.', variant: 'destructive' });
      setOverridesMap(prev => ({ ...prev, [resultId]: prevMap }));
    }
  };

  const getEffective = (resultId: string, key: string, auto: ForcedAchievementGrade): { grade: ForcedAchievementGrade; overridden: boolean } => {
    const ov = overridesMap[resultId]?.[key];
    if (ov === 'A' || ov === 'B' || ov === 'C') return { grade: ov, overridden: true };
    return { grade: auto, overridden: false };
  };

  const startEdit = (result: HighSchoolLevelTestResult) => {
    setEditingId(result.id);
    setEditName(result.student_name || '');
    setEditSchool(result.student_school || '');
    setEditGrade(result.student_grade || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSchool('');
    setEditGrade('');
  };

  const saveEdit = async (resultId: string) => {
    try {
      const { error } = await supabase
        .from('level_test_results')
        .update({ 
          student_name: editName.trim(),
          student_school: editSchool.trim() || null,
          student_grade: editGrade.trim() || null
        })
        .eq('id', resultId);

      if (error) throw error;

      toast({
        title: "수정 완료",
        description: "학생 정보가 수정되었습니다.",
      });

      if (onUpdate) {
        onUpdate(resultId, {
          student_name: editName.trim(),
          student_school: editSchool.trim() || undefined,
          student_grade: editGrade.trim() || undefined
        });
      }
      
      cancelEdit();
    } catch (error) {
      console.error('Failed to update:', error);
      toast({
        title: "수정 실패",
        description: "학생 정보 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryClick = (categoryName: string, section: string, answers: Record<string, any>) => {
    setSelectedCategory(categoryName);
    setSelectedSection(section);
    setSelectedAnswers(answers);
    setDialogOpen(true);
  };

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.total_score, 0) / results.length) 
    : 0;

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const toggleAllRows = () => {
    if (expandedRows.size === results.length) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(results.map(r => r.id)));
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadImage = async (result: HighSchoolLevelTestResult) => {
    const element = reportRefs.current[result.id];
    if (!element) {
      toast({
        title: "다운로드 실패",
        description: "리포트를 찾을 수 없습니다. 먼저 결과지를 펼쳐주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "이미지 생성 중...",
        description: "고화질 이미지를 생성하고 있습니다."
      });

      await document.fonts.ready;
      const images = element.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 1.0);
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${result.student_school || ''}${result.student_grade || ''}_${result.student_name}_고등부_BEAT_결과.jpg`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "이미지 다운로드 완료",
        description: fileName
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "다운로드 실패",
        description: "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'vocabulary':
        return <Languages className="w-4 h-4" />;
      case 'grammar':
        return <FileText className="w-4 h-4" />;
      case 'practical':
        return <GraduationCap className="w-4 h-4" />;
      case 'reading':
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'vocabulary':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-600',
          light: 'bg-purple-50',
          hex: '#A855F7'
        };
      case 'grammar':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          light: 'bg-blue-50',
          hex: '#3B82F6'
        };
      case 'practical':
        return {
          bg: 'bg-teal-500',
          text: 'text-teal-600',
          light: 'bg-teal-50',
          hex: '#14B8A6'
        };
      case 'reading':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-600',
          light: 'bg-emerald-50',
          hex: '#22C55E'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          light: 'bg-gray-50',
          hex: '#6B7280'
        };
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

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'S':
        return 'bg-gradient-to-br from-purple-500 to-purple-700 text-white';
      case 'A':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white';
      case 'B':
        return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white';
      case 'C':
        return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-700 text-white';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const formatTestDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="flex justify-center items-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200 border border-slate-200" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-800 flex items-center">
                <img src={levelTestResultLogo} alt="Level Test" className="h-6 w-6 mr-2.5 object-contain" />
                고등부 BEAT 결과
              </h2>
              <div className="flex items-center gap-4 mt-1.5 text-sm">
                <span className="flex items-center text-slate-600 font-medium">
                  <Users className="h-4 w-4 mr-1.5 text-slate-500" />
                  <span className="text-slate-700 font-bold">{results.length}</span>
                  <span className="ml-1 text-slate-500">명</span>
                </span>
                <span className="flex items-center text-slate-600 font-medium">
                  <Award className="h-4 w-4 mr-1.5 text-amber-500" />
                  <span className="text-slate-500">평균</span>
                  <span className="ml-1 text-amber-600 font-bold">{averageScore}점</span>
                </span>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" 
                onClick={toggleAllRows}
              >
                {expandedRows.size === results.length 
                  ? <><EyeOff className="mr-2 h-4 w-4" />결과지 모두 접기</> 
                  : <><Eye className="mr-2 h-4 w-4" />결과지 모두 펼치기</>
                }
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 bg-slate-50/50 space-y-4">
          {results.map(result => {
            const sectionScores = result.section_scores || [];
            const subCategoryScores = result.sub_category_scores || {};
            const radarData = sectionScores.map(s => ({
              subject: s.sectionName,
              score: s.percentage,
              fullMark: 100
            }));

            return (
              <Card key={result.id} className="bg-white border-slate-200 overflow-hidden">
                {/* Result Header */}
                <div className="p-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent">
                  {editingId === result.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </div>
                      <Input
                        value={editSchool}
                        onChange={(e) => setEditSchool(e.target.value)}
                        className="w-20 h-8 text-sm"
                        placeholder="학교"
                      />
                      <Input
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        className="w-16 h-8 text-sm"
                        placeholder="학년"
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-20 h-8 text-sm"
                        placeholder="이름"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => saveEdit(result.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button 
                      className="flex items-center gap-3 flex-1 text-left group" 
                      onClick={() => toggleRow(result.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        {expandedRows.has(result.id) 
                          ? <ChevronUp className="w-4 h-4 text-slate-600" /> 
                          : <ChevronDown className="w-4 h-4 text-slate-600" />
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {result.student_school} {result.student_grade} {result.student_name}
                          </p>
                          <p className="text-xs text-slate-500">{formatDate(result.created_at)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(result);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </button>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-700">{result.total_score}점</p>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDownloadImage(result)} 
                      disabled={!expandedRows.has(result.id)} 
                      className="text-slate-500 hover:text-slate-700" 
                      title="이미지 다운로드"
                    >
                      <Image className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>결과 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            {result.student_name} 학생의 고등부 BEAT 결과를 삭제하시겠습니까?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(result.id)} 
                            className="bg-red-500 hover:bg-red-600"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Expanded Detailed Report */}
                {expandedRows.has(result.id) && (
                  <div 
                    ref={el => reportRefs.current[result.id] = el} 
                    className="bg-white" 
                    style={{ width: '210mm', margin: '0 auto' }}
                  >
                    {/* Premium Header */}
                    <div className="relative overflow-hidden bg-slate-800">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 via-transparent to-slate-900/50" />

                      <div className="relative z-10 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/10 rounded-lg border border-white/20">
                              <img 
                                src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png" 
                                alt="Logo" 
                                className="h-8 w-8 rounded object-cover" 
                              />
                            </div>
                            <div>
                              <h1 className="font-bold text-base text-white tracking-tight">브래니악 영어 진단평가(BEAT) · 고등부 리포트</h1>
                              <p className="text-slate-300 text-[10px]">Orun English High School Level Assessment Report</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                            <Medal className="h-3 w-3 text-amber-300" />
                            <span className="text-[10px] font-semibold text-white">High School Test</span>
                          </div>
                        </div>

                        {/* Student Info Grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="p-2 rounded-md bg-white/10 border border-white/15">
                            <div className="flex items-center gap-1 mb-0.5">
                              <GraduationCap className="h-3 w-3 text-slate-300" />
                              <span className="text-[9px] text-slate-300">이름</span>
                            </div>
                            <p className="text-xs font-bold text-white">{result.student_name}</p>
                          </div>

                          <div className="p-2 rounded-md bg-white/10 border border-white/15">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Award className="h-3 w-3 text-slate-300" />
                              <span className="text-[9px] text-slate-300">학교/학년</span>
                            </div>
                            <p className="text-xs font-bold text-white whitespace-nowrap">
                              {result.student_school || '-'} {result.student_grade || ''}
                            </p>
                          </div>

                          <div className="p-2 rounded-md bg-white/10 border border-white/15">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Clock className="h-3 w-3 text-slate-300" />
                              <span className="text-[9px] text-slate-300">소요 시간</span>
                            </div>
                            <p className="text-xs font-bold text-white">{formatTime(result.elapsed_time)}</p>
                          </div>

                          <div className="p-2 rounded-md bg-slate-700 border border-slate-600">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Medal className="h-3 w-3 text-amber-300" />
                              <span className="text-[9px] text-amber-200">시험일</span>
                            </div>
                            <p className="text-xs font-bold text-white">{formatTestDate(result.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Score Overview */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Score Cards */}
                        {(() => {
                          const totalMaxScore = result.section_scores.reduce((acc: number, s: SectionScore) => acc + s.totalPoints, 0);
                          
                          // 100점 만점으로 환산
                          const convertTo100 = (score: number) => Math.round((score / totalMaxScore) * 100);
                          
                          const allScores = results.map(r => convertTo100(r.total_score)).sort((a, b) => b - a);
                          const overallAverage = allScores.length > 0 
                            ? Math.round(allScores.reduce((acc, s) => acc + s, 0) / allScores.length) 
                            : 0;
                          const top10Count = Math.max(1, Math.ceil(allScores.length * 0.1));
                          const top10Average = allScores.length > 0 
                            ? Math.round(allScores.slice(0, top10Count).reduce((acc, s) => acc + s, 0) / top10Count) 
                            : 0;

                          const scoreCards = [
                            {
                              label: '총점',
                              value: convertTo100(result.total_score),
                              maxScore: 100,
                              icon: Award,
                              highlight: true
                            },
                            {
                              label: '전체 평균',
                              value: overallAverage,
                              maxScore: null,
                              icon: Users,
                              highlight: false
                            },
                            {
                              label: '상위 10%',
                              value: top10Average,
                              maxScore: null,
                              icon: Award,
                              highlight: false
                            }
                          ];

                          return (
                            <div className="lg:col-span-4 grid grid-cols-1 gap-2.5">
                              {scoreCards.map(card => (
                                <div 
                                  key={card.label} 
                                  className={`rounded-xl border transition-all ${
                                    card.highlight 
                                      ? 'bg-slate-800 border-slate-700' 
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        card.highlight ? 'bg-slate-700' : 'bg-slate-100'
                                      }`}>
                                        <card.icon className={`w-4 h-4 ${
                                          card.highlight ? 'text-slate-300' : 'text-slate-500'
                                        }`} />
                                      </div>
                                      <p className={`text-sm font-medium ${
                                        card.highlight ? 'text-slate-400' : 'text-slate-500'
                                      }`}>
                                        {card.label}
                                      </p>
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                      <span className={`text-2xl font-bold tracking-tight ${
                                        card.highlight ? 'text-white' : 'text-slate-800'
                                      }`}>
                                        {card.value}
                                      </span>
                                      {card.maxScore 
                                        ? <span className={`text-sm ${card.highlight ? 'text-slate-500' : 'text-slate-400'}`}>/{card.maxScore}점</span> 
                                        : <span className={`text-sm ${card.highlight ? 'text-slate-500' : 'text-slate-400'}`}>점</span>
                                      }
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Radar Chart */}
                        <div className="lg:col-span-8 p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Target className="w-4 h-4 text-indigo-600" />
                              </div>
                              영역별 분석
                            </h3>
                          </div>
                          <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart 
                                data={radarData} 
                                margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
                              >
                                <PolarGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                                <PolarAngleAxis 
                                  dataKey="subject" 
                                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} 
                                />
                                <PolarRadiusAxis 
                                  angle={30} 
                                  domain={[0, 100]} 
                                  tick={{ fill: '#94A3B8', fontSize: 9 }} 
                                  tickCount={5} 
                                  axisLine={false} 
                                />
                                <Radar 
                                  name="점수" 
                                  dataKey="score" 
                                  stroke="#6366F1" 
                                  fill="url(#radarGradientHS)" 
                                  fillOpacity={0.4} 
                                  strokeWidth={2.5} 
                                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} 
                                />
                                <defs>
                                  <linearGradient id="radarGradientHS" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.6} />
                                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Section Scores Summary - Clean Compact Grid */}
                      <div className="grid grid-cols-4 gap-2">
                        {sectionScores.map(section => {
                          const color = getSectionColor(section.section);
                          const sectionKey = `section:${section.section}`;
                          const eff = getEffective(result.id, sectionKey, normalizeForcedAchievementGrade(getAchievementGrade(section.percentage)));
                          const grade = eff.grade;
                          return (
                            <div 
                              key={section.section} 
                              className={`p-2 rounded-lg ${color.light} border border-slate-100`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                  {getSectionIcon(section.section)}
                                  <span className="text-[11px] font-medium text-slate-700">{section.sectionName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); cycleGrade(result.id, sectionKey, grade); }}
                                  title="클릭: A→B→C"
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition ${getGradeStyle(grade)}`}
                                >
                                  {grade}
                                </button>
                              </div>
                              {eff.overridden && <p data-export-ignore className="mb-1 text-[8px] font-bold text-slate-500">수정됨</p>}
                              <p className={`text-sm font-bold ${color.text}`}>{section.percentage}%</p>
                              <p className="text-[8px] text-slate-500">{section.correctCount}/{section.totalQuestions}문항</p>
                              <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${color.bg} rounded-full transition-all`}
                                  style={{ width: `${section.percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Section Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {(['vocabulary', 'grammar', 'practical', 'reading'] as const).map(section => {
                          const subScores = subCategoryScores[section] || [];
                          const sectionScore = sectionScores.find(s => s.section === section);
                          const colors = getSectionColor(section);
                          const weakAreas = subScores.filter(s => s.percentage < 50);

                          return (
                            <div key={section} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <h3 className={`font-bold text-base flex items-center gap-2 ${colors.text}`}>
                                  {getSectionIcon(section)}
                                  {hsAnalysisCategories[section]?.name || section}
                                </h3>
                                <span className="text-2xl font-black text-slate-800">
                                  {sectionScore?.percentage || 0}%
                                </span>
                              </div>

                              <div className="space-y-3">
                                {subScores.map((sub, idx) => {
                                  const subKey = `sub:${section}:${sub.name}`;
                                  const eff = getEffective(result.id, subKey, normalizeForcedAchievementGrade(getAchievementGrade(sub.percentage)));
                                  return (
                                  <div
                                    key={idx} 
                                    role="button"
                                    tabIndex={0}
                                    className="py-1 w-full text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                                    onClick={() => handleCategoryClick(sub.name, section, result.answers)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryClick(sub.name, section, result.answers); } }}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-slate-700 text-sm font-medium hover:text-slate-900">{sub.name}</span>
                                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); cycleGrade(result.id, subKey, eff.grade); }}
                                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); cycleGrade(result.id, subKey, eff.grade); } }}
                                          title="클릭: A→B→C"
                                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition ${getGradeStyle(eff.grade)}`}
                                        >
                                          {eff.grade}
                                        </button>
                                        <span className="text-slate-500 text-sm font-semibold">{sub.correctCount}/{sub.totalQuestions}</span>
                                      </div>
                                    </div>
                                    {eff.overridden && <p data-export-ignore className="mb-1 text-[8px] font-bold text-slate-500">수정됨</p>}
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${
                                          sub.percentage >= 70 
                                            ? 'bg-emerald-500' 
                                            : sub.percentage >= 40 
                                              ? 'bg-amber-500' 
                                              : 'bg-red-500'
                                        }`} 
                                        style={{ width: `${sub.percentage}%` }} 
                                      />
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>

                              {weakAreas.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <div className="flex items-start gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
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

                      {/* Copyright */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <p className="text-[9px] text-slate-400">
                          © BRAINIAC ENGLISH. All rights reserved.
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {formatTestDate(result.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Question Detail Dialog */}
      <HighSchoolQuestionDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoryName={selectedCategory}
        section={selectedSection}
        studentAnswers={selectedAnswers}
      />
    </Card>
  );
};

export default HighSchoolLevelTestResultGroup;
