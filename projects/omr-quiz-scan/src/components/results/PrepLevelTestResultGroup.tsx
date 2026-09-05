import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Award, ChevronUp, ChevronDown, Image, Trash2, Eye, EyeOff, BookOpen, FileText, Languages, GraduationCap, Clock, Medal, Pencil, Check, X } from 'lucide-react';
import levelTestResultLogo from "@/assets/level-test-result-logo.png";
import brainiacLogo from "@/assets/brainiac-logo.png.asset.json";
import { formatDate } from '@/utils/resultsUtils';
import { toast } from '@/hooks/use-toast';
import { prepSectionNames } from '@/data/prepLevelTestQuestions';
import { getPrepSet, detectPrepVersion } from '@/data/prepVersions';

// 결과에 저장된 답안으로 시험지 버전(뉴베리타스 186문항 / 흑석관 145문항)을 판별
const prepSetFor = (answers: Record<string, any> | null | undefined) => getPrepSet(detectPrepVersion(answers || {}));
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import PrepQuestionDetailDialog from './PrepQuestionDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import BrainiacSpecialClassSection from './BrainiacSpecialClassSection';


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

interface PrepLevelTestResult {
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
  academy?: string | null;
  special_class_assignments?: (string | null)[] | null;
  grade_overrides?: Record<string, ForcedAchievementGrade> | null;
}

type ForcedAchievementGrade = 'A' | 'B' | 'C';

interface PrepLevelTestResultGroupProps {
  results: PrepLevelTestResult[];
  onDelete: (id: string) => Promise<void>;
  onUpdate?: (id: string, updates: { student_name?: string; student_school?: string; student_grade?: string; grade_overrides?: Record<string, ForcedAchievementGrade> }) => void;
  groupTitle?: string;
}

const PrepLevelTestResultGroup = ({
  results,
  onDelete,
  onUpdate,
  groupTitle
}: PrepLevelTestResultGroupProps) => {
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

  // 성취도 등급 강제 변경 (관리자) - resultId별 override 맵
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

  const startEdit = (result: PrepLevelTestResult) => {
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

  // 답안 기반으로 정답 여부 확인
  const isAnswerCorrect = (questionId: number, answer: any, answers: Record<string, any> = {}): boolean => {
    const question = prepSetFor(answers).questions.find(q => q.id === questionId);
    if (!question) return false;
    if (answer === undefined || answer === null || answer === '') return false;

    // sentenceClick 타입 - 정답에 포함된 단어가 학생 답안에 포함되기만 하면 정답 (순서/숫자 무관)
    if (question.inputType === 'sentenceClick') {
      if (typeof answer === 'object') {
        const correctSubjects = question.correctSubjects || [];
        const correctVerbs = question.correctVerbs || [];
        const optionalSubjects = question.optionalSubjects || [];
        const optionalVerbs = question.optionalVerbs || [];
        const studentSubjects: string[] = answer.subjects || [];
        const studentVerbs: string[] = answer.verbs || [];
        
        const extractWord = (item: string) => {
          const parts = item.split('-');
          return parts.length > 1 ? parts.slice(1).join('-') : item;
        };
        
        const normalizedStudentSubjects = studentSubjects.map(extractWord).map(s => s.toLowerCase().replace(/[,.]$/g, ''));
        const normalizedStudentVerbs = studentVerbs.map(extractWord).map(s => s.toLowerCase().replace(/[,.]$/g, ''));
        
        // 필수 정답이 포함되어 있는지 확인
        const requiredSubjectsMatch = correctSubjects.every((s: string) => 
          normalizedStudentSubjects.some(ss => ss.includes(s.toLowerCase()) || s.toLowerCase().includes(ss))
        );
        // 동사는 correctVerbs 중 하나 이상만 맞으면 정답 (모두 맞출 필요 없음)
        const requiredVerbsMatch = correctVerbs.length === 0 || correctVerbs.some((v: string) => 
          normalizedStudentVerbs.some(sv => sv.includes(v.toLowerCase()) || v.toLowerCase().includes(sv))
        );
        
        // 학생이 선택한 것이 모두 정답(필수+선택적)에 속하는지 확인
        const allSubjectsValid = normalizedStudentSubjects.every((s: string) => 
          correctSubjects.some(cs => cs.toLowerCase() === s || s.includes(cs.toLowerCase())) || 
          optionalSubjects.some(os => os.toLowerCase() === s || s.includes(os.toLowerCase()))
        );
        const allVerbsValid = normalizedStudentVerbs.every((v: string) => 
          correctVerbs.some(cv => cv.toLowerCase() === v || v.includes(cv.toLowerCase())) || 
          optionalVerbs.some(ov => ov.toLowerCase() === v || v.includes(ov.toLowerCase()))
        );
        
        // 필수 동사가 없고 선택적 동사만 있는 경우, 최소 하나의 선택적 동사를 선택해야 함
        const hasAtLeastOneVerb = correctVerbs.length > 0 || 
          (optionalVerbs.length > 0 && normalizedStudentVerbs.some(v => 
            optionalVerbs.some(ov => ov.toLowerCase() === v || v.includes(ov.toLowerCase()))
          ));
        
        return requiredSubjectsMatch && requiredVerbsMatch && allSubjectsValid && allVerbsValid && hasAtLeastOneVerb;
      }
      return false;
    }

    // 복수 선택 문제
    if (Array.isArray(question.correctAnswer) && typeof question.correctAnswer[0] === 'number') {
      if (!Array.isArray(answer)) return false;
      const correctSet = new Set(question.correctAnswer);
      const answerSet = new Set(answer);
      if (correctSet.size !== answerSet.size) return false;
      for (const item of correctSet) {
        if (!answerSet.has(item)) return false;
      }
      return true;
    }

    // 다중 텍스트 답안 (correctAnswers 배열) - 가능한 정답 중 하나만 맞으면 정답
    if (question.correctAnswers) {
      // wordArrangement 문제는 배열을 합쳐서 비교
      if (question.inputType === 'wordArrangement' && Array.isArray(answer)) {
        const joinedAnswer = answer.join(' ').toLowerCase().replace(/\s/g, '');
        for (const correctAns of question.correctAnswers) {
          const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
          if (joinedAnswer === correctStr) {
            return true;
          }
        }
        // correctAnswer와도 비교
        const mainCorrect = String(question.correctAnswer).toLowerCase().replace(/\s/g, '');
        return joinedAnswer === mainCorrect;
      }
      
      // 배열인 경우 각 요소를 개별적으로 확인 (text 문제 등)
      if (Array.isArray(answer)) {
        // 학생이 제출한 각 답안이 correctAnswers 중 하나와 일치하는지 확인
        for (const studentAns of answer) {
          const studentStr = String(studentAns).toLowerCase().replace(/\s/g, '');
          for (const correctAns of question.correctAnswers) {
            const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
            if (studentStr === correctStr) {
              return true;
            }
            // 부분 일치 확인 - 학생 답안에 정답이 포함되어 있거나 정답에 학생 답안이 포함된 경우
            if (studentStr.includes(correctStr) || correctStr.includes(studentStr)) {
              return true;
            }
          }
        }
        // multiText 타입의 경우 배열을 문자열로 합쳐서 개별 단어로 분리하여 확인
        if (question.inputType === 'multiText') {
          const combinedAnswer = answer.join(' ').toLowerCase();
          const answerWords = combinedAnswer.split(/\s+/).filter(w => w.trim());
          for (const word of answerWords) {
            const normalizedWord = word.replace(/\s/g, '');
            for (const correctAns of question.correctAnswers) {
              const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
              if (normalizedWord === correctStr || normalizedWord.includes(correctStr) || correctStr.includes(normalizedWord)) {
                return true;
              }
            }
          }
        }
        return false;
      }
      
      const studentAnswerStr = String(answer).toLowerCase().replace(/\s/g, '');
      
      // 쉼표로 구분된 복수 답안인 경우 (예: "버릇없는, 무례한")
      if (studentAnswerStr.includes(',') || studentAnswerStr.includes('，')) {
        const studentParts = studentAnswerStr.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
        
        // 1) correctAnswers 배열 전체와 매칭 (각 항목을 정답 집합으로 처리)
        const correctSet = question.correctAnswers
          .map(a => a.toLowerCase().replace(/\s/g, ''))
          .sort();
        if (studentParts.length === correctSet.length &&
            studentParts.every((s, i) => s === correctSet[i])) {
          return true;
        }
        
        // 2) correctAnswers 중 쉼표가 포함된 단일 정답 문자열과 매칭
        for (const correctAns of question.correctAnswers) {
          const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
          if (correctStr.includes(',') || correctStr.includes('，')) {
            const correctParts = correctStr.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
            if (studentParts.length === correctParts.length && 
                studentParts.every((s, i) => s === correctParts[i])) {
              return true;
            }
          }
        }
        return false;
      }
      
      // 단일 답안인 경우 - correctAnswers 중 하나와 일치하면 정답
      for (const correctAns of question.correctAnswers) {
        const correctStr = correctAns.toLowerCase().replace(/\s/g, '');
        if (studentAnswerStr === correctStr) {
          return true;
        }
      }
      return false;
    }

    // 텍스트 또는 단어 배열 문제
    if (question.inputType === 'text' || question.inputType === 'wordArrangement') {
      const correctStr = String(question.correctAnswer).toLowerCase().replace(/\s/g, '');
      
      // 배열로 저장된 답안 처리
      let studentAnswer = answer;
      if (Array.isArray(answer)) {
        studentAnswer = answer.join(' ');
      }
      
      let studentStr = String(studentAnswer).toLowerCase();
      
      // 쉼표로 구분된 단어 배열인 경우 (예: "You, should, tell, him")
      if (studentStr.includes(',')) {
        studentStr = studentStr.split(',').map(w => w.trim()).join('');
      } else {
        studentStr = studentStr.replace(/\s/g, '');
      }
      
      // correctAnswers 배열이 있으면 그 중 하나와 일치하는지 확인
      if (question.correctAnswers && question.correctAnswers.length > 0) {
        // requireAllAnswers가 true면 모든 정답을 입력해야 함
        if (question.requireAllAnswers) {
          const studentParts = studentStr.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
          const correctParts = question.correctAnswers.map(a => a.toLowerCase().replace(/\s/g, '')).sort();
          return studentParts.length === correctParts.length && 
                 correctParts.every(c => studentParts.some(s => s === c));
        }
        
        return question.correctAnswers.some(correctAns => {
          const normalizedCorrect = String(correctAns).toLowerCase().replace(/\s/g, '');
          return normalizedCorrect === studentStr;
        });
      }
      
      return correctStr === studentStr;
    }

    // 객관식
    return Number(answer) === Number(question.correctAnswer);
  };

  // 실제 답안 기반으로 subCategory 점수 계산 - 실제 문제의 subCategory 필드 기준으로 계산
  const calculateSubCategoryScores = (answers: Record<string, any>): Record<string, SubCategoryScore[]> => {
    const result: Record<string, SubCategoryScore[]> = {};
    
    Object.entries(prepSetFor(answers).analysisCategories).forEach(([sectionKey, categoryData]) => {
      result[sectionKey] = categoryData.subCategories.map(subCat => {
        // prepAnalysisCategories에 정의된 문제 ID 목록을 그대로 사용
        const questionIds = subCat.questions || [];
        const totalQuestions = questionIds.length;
        let correctCount = 0;

        questionIds.forEach(qid => {
          const answer = answers[qid];
          if (isAnswerCorrect(qid, answer, answers)) {
            correctCount++;
          }
        });

        return {
          name: subCat.name,
          totalQuestions,
          correctCount,
          percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
        };
      });
    });
    
    return result;
  };

  // 실제 답안 기반으로 섹션 점수 계산 - 서브카테고리 합산 기반
  const calculateSectionScores = (answers: Record<string, any>): SectionScore[] => {
    const subCategoryScores = calculateSubCategoryScores(answers);
    
    return Object.entries(prepSetFor(answers).analysisCategories).map(([sectionKey, categoryData]) => {
      const subScores = subCategoryScores[sectionKey] || [];
      const totalQuestions = subScores.reduce((sum, s) => sum + s.totalQuestions, 0);
      const correctCount = subScores.reduce((sum, s) => sum + s.correctCount, 0);
      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      
      return {
        section: sectionKey,
        sectionName: categoryData.name,
        totalQuestions,
        correctCount,
        totalPoints: totalQuestions, // 1문항 1점 기준
        earnedPoints: correctCount,
        percentage
      };
    });
  };

  // 새 배점(어휘 1점, 나머지 2점) 기준으로 총점 재계산
  const computeTotalScore = (answers: Record<string, any>): number => {
    let total = 0;
    const { questions, getPoints: getPrepQuestionPoints } = prepSetFor(answers);
    questions.forEach(q => {
      if (isAnswerCorrect(q.id, answers[q.id], answers)) {
        total += getPrepQuestionPoints(q);
      }
    });
    return total;
  };

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + computeTotalScore(r.answers || {}), 0) / results.length) 
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

  const handleDownloadImage = async (result: PrepLevelTestResult) => {
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

      // Capture an isolated, full-width copy. The live report can extend beyond a
      // narrow viewport, and capturing it in-place causes the right side to be
      // clipped by parent overflow or by the browser's viewport bounds.
      const exportWidth = Math.ceil(element.getBoundingClientRect().width || element.scrollWidth);
      const exportHost = document.createElement('div');
      exportHost.setAttribute('aria-hidden', 'true');
      Object.assign(exportHost.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: `${exportWidth}px`,
        overflow: 'visible',
        background: '#ffffff',
        pointerEvents: 'none',
        zIndex: '-1',
      });

      const exportElement = element.cloneNode(true) as HTMLDivElement;
      Object.assign(exportElement.style, {
        width: `${exportWidth}px`,
        minWidth: `${exportWidth}px`,
        maxWidth: 'none',
        height: 'auto',
        margin: '0',
        overflow: 'visible',
        transform: 'none',
      });
      exportElement.querySelectorAll<HTMLElement>('*').forEach(node => {
        node.style.animation = 'none';
        node.style.transition = 'none';
      });
      exportHost.appendChild(exportElement);
      document.body.appendChild(exportHost);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      let blob: Blob;
      try {
        const exportHeight = Math.ceil(exportElement.scrollHeight);
        const canvas = await html2canvas(exportElement, {
          scale: 4,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: exportWidth,
          height: exportHeight,
          windowWidth: Math.max(1200, exportWidth),
          windowHeight: exportHeight,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (el) => el instanceof HTMLElement && el.hasAttribute('data-export-ignore'),
        });

        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          }, 'image/jpeg', 1.0);
        });
      } catch (err) {
        console.warn('html2canvas failed, falling back to html-to-image:', err);
        const dataUrl = await toJpeg(exportElement, {
          quality: 1.0,
          pixelRatio: 4,
          backgroundColor: '#ffffff',
          cacheBust: true,
          width: exportWidth,
          height: Math.ceil(exportElement.scrollHeight),
          filter: (node) => !(node instanceof HTMLElement && node.hasAttribute('data-export-ignore')),
        });
        const res = await fetch(dataUrl);
        blob = await res.blob();
      } finally {
        exportHost.remove();
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${result.student_school || ''}${result.student_grade || ''}_${result.student_name}_초등부_레벨테스트_결과.jpg`;
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
      case 'reading':
        return <BookOpen className="w-4 h-4" />;
      case 'grammarA':
      case 'grammarB':
      case 'grammarC':
        return <FileText className="w-4 h-4" />;
      case 'vocabulary':
        return <Languages className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'reading':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-600',
          light: 'bg-emerald-50',
          hex: '#22C55E'
        };
      case 'grammarA':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          light: 'bg-blue-50',
          hex: '#3B82F6'
        };
      case 'grammarB':
        return {
          bg: 'bg-indigo-500',
          text: 'text-indigo-600',
          light: 'bg-indigo-50',
          hex: '#6366F1'
        };
      case 'grammarC':
        return {
          bg: 'bg-violet-500',
          text: 'text-violet-600',
          light: 'bg-violet-50',
          hex: '#8B5CF6'
        };
      case 'vocabulary':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-600',
          light: 'bg-amber-50',
          hex: '#F59E0B'
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

  // 브래니악용 부드러운 3단계 성취도 등급 (A/B/C)
  const getBrainiacAchievement = (percentage: number): 'A' | 'B' | 'C' => {
    if (percentage >= 75) return 'A';
    if (percentage >= 45) return 'B';
    return 'C';
  };

  const normalizeForcedAchievementGrade = (grade: string): ForcedAchievementGrade => {
    if (grade === 'S' || grade === 'A') return 'A';
    if (grade === 'B') return 'B';
    return 'C';
  };

  const getBrainiacAchievementStyle = (grade: 'A' | 'B' | 'C') => {
    switch (grade) {
      case 'A':
        return {
          // Sapphire blue — top tier
          pill: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border border-blue-400/40 shadow-sm shadow-blue-500/30',
          softPill: 'bg-blue-50 text-blue-700 border border-blue-200',
          text: 'text-blue-700',
          ring: 'ring-blue-200',
          cardBg: 'bg-gradient-to-br from-blue-50 via-white to-blue-50/40 border-blue-200/70',
          dot: 'bg-blue-500',
          label: '우수',
        };
      case 'B':
        return {
          // Emerald green — mid tier
          pill: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border border-emerald-400/40 shadow-sm shadow-emerald-500/30',
          softPill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
          text: 'text-emerald-700',
          ring: 'ring-emerald-200',
          cardBg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-emerald-200/70',
          dot: 'bg-emerald-500',
          label: '양호',
        };
      case 'C':
        return {
          // Amber gold — needs growth
          pill: 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white border border-amber-300/50 shadow-sm shadow-amber-500/30',
          softPill: 'bg-amber-50 text-amber-700 border border-amber-200',
          text: 'text-amber-700',
          ring: 'ring-amber-200',
          cardBg: 'bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-amber-200/70',
          dot: 'bg-amber-500',
          label: '성장 필요',
        };
    }
  };

  const getBarColorStyle = (percentage: number) => {
    if (percentage >= 70) {
      return {
        bar: 'bg-emerald-500',
        pill: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border border-emerald-400/40 shadow-sm shadow-emerald-500/30',
        softPill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-200'
      };
    }
    if (percentage >= 40) {
      return {
        bar: 'bg-amber-500',
        pill: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border border-amber-400/40 shadow-sm shadow-amber-500/30',
        softPill: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        ring: 'ring-amber-200'
      };
    }
    return {
      bar: 'bg-red-500',
      pill: 'bg-gradient-to-br from-red-500 to-red-700 text-white border border-red-400/40 shadow-sm shadow-red-500/30',
      softPill: 'bg-red-50 text-red-700 border border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-500',
      ring: 'ring-red-200'
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  // 브래니악 리포트 전용: 일부 카테고리 라벨을 학부모 친화적으로 표시
  const getBrainiacDisplayName = (name: string): string => {
    if (name === '필자의 주장') return '대의파악';
    if (name === '내용 일치/불일치' || name === '내용일치/불일치' || name === '내용 일치' || name === '내용 불일치') return '내용이해';
    return name;
  };

  const formatTestDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Calculate total possible points for prep test
  const PREP_TOTAL_POINTS = prepSetFor(results[0]?.answers).totalMaxScore; // 버전별 총 배점

  return (
    <>
    <Card className="bg-white border-teal-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-white">
        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="flex justify-center items-center w-10 h-10 rounded-xl bg-teal-100 text-teal-600 hover:bg-teal-200 transition-all duration-200 border border-teal-200" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-800 flex items-center">
                <img src={levelTestResultLogo} alt="Level Test" className="h-6 w-6 mr-2.5 object-contain" />
                {groupTitle ?? '초등부 BEAT 결과'}
              </h2>
              <div className="flex items-center gap-4 mt-1.5 text-sm">
                <span className="flex items-center text-slate-600 font-medium">
                  <Users className="h-4 w-4 mr-1.5 text-teal-500" />
                  <span className="text-teal-600 font-bold">{results.length}</span>
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
            // 저장된 값 대신 실제 답안에서 계산
            const sectionScores = calculateSectionScores(result.answers || {});
            const subCategoryScores = calculateSubCategoryScores(result.answers || {});
            const totalScore = computeTotalScore(result.answers || {});
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
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-teal-600" />
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
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        {expandedRows.has(result.id) 
                          ? <ChevronUp className="w-4 h-4 text-teal-600" /> 
                          : <ChevronDown className="w-4 h-4 text-teal-600" />
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
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-teal-600 hover:bg-teal-50"
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
                      <p className="text-lg font-bold text-teal-600">{totalScore}점</p>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDownloadImage(result)} 
                      disabled={!expandedRows.has(result.id)} 
                      className="text-slate-500 hover:text-teal-600" 
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
                            {result.student_name} 학생의 초등부 BEAT 결과를 삭제하시겠습니까?
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
                    className="bg-white rounded-2xl border border-slate-200 shadow-[0_16px_50px_-20px_rgba(15,23,42,0.18)] overflow-hidden" 
                    style={{ width: '210mm', margin: '0 auto' }}
                  >
                    {/* Premium Header */}
                    <div className="relative overflow-hidden bg-[#0b0f14] rounded-t-2xl">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,110,0.18),transparent_55%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_120%,rgba(255,255,255,0.07),transparent_55%)]" />
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

                      <div className="relative z-10 px-5 py-4">
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-3">
                            <div className="p-[3px] rounded-full bg-gradient-to-br from-amber-200/70 to-amber-500/20">
                              <img 
                                src={result.academy === 'brainiac' ? brainiacLogo.url : "/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png"} 
                                alt="Logo" 
                                className="h-9 w-9 rounded-full object-contain bg-white" 
                              />
                            </div>
                            <div>
                              <h1 className="font-semibold text-[15px] text-white tracking-[0.02em] leading-tight">옳은영어 영어 성취도 진단 리포트</h1>
                              <p className="text-amber-200/70 text-[9px] uppercase tracking-[0.3em] mt-1">ORUN ENGLISH ENGLISH PROFICIENCY ASSESSMENT REPORT</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-amber-200/30">
                            <Medal className="h-3 w-3 text-amber-300" />
                            <span className="text-[9px] font-medium text-amber-100 uppercase tracking-[0.22em]">Prep</span>
                          </div>
                        </div>

                        {/* Student Info Grid */}
                        <div className={`grid ${result.academy === 'brainiac' ? 'grid-cols-3' : 'grid-cols-4'} gap-2`}>
                          <div className="px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/10">
                            <div className="flex items-center gap-1 mb-1">
                              <GraduationCap className="h-3 w-3 text-amber-200/70" />
                              <span className="text-[8px] text-slate-400 uppercase tracking-[0.18em]">이름</span>
                            </div>
                            <p className="text-xs font-semibold text-white tracking-wide">{result.student_name}</p>
                          </div>

                          <div className="px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/10">
                            <div className="flex items-center gap-1 mb-1">
                              <Award className="h-3 w-3 text-amber-200/70" />
                              <span className="text-[8px] text-slate-400 uppercase tracking-[0.18em]">학교/학년</span>
                            </div>
                            <p className="text-xs font-semibold text-white tracking-wide whitespace-nowrap">
                              {result.student_school || '-'} {result.student_grade || ''}
                            </p>
                          </div>

                          {result.academy !== 'brainiac' && (
                            <div className="px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/10">
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="h-3 w-3 text-amber-200/70" />
                                <span className="text-[8px] text-slate-400 uppercase tracking-[0.18em]">소요 시간</span>
                              </div>
                              <p className="text-xs font-semibold text-white tracking-wide">{formatTime(result.elapsed_time)}</p>
                            </div>
                          )}

                          <div className="px-2.5 py-2 rounded-lg bg-amber-300/10 border border-amber-200/25">
                            <div className="flex items-center gap-1 mb-1">
                              <Medal className="h-3 w-3 text-amber-300" />
                              <span className="text-[8px] text-amber-200/80 uppercase tracking-[0.18em]">시험일</span>
                            </div>
                            <p className="text-xs font-semibold text-white tracking-wide">{formatTestDate(result.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white p-5 space-y-4">
                      {/* Score Overview */}
                      <div className="grid grid-cols-12 gap-3">
                        {/* Score Cards */}
                        {(() => {
                          const allScores = results.map(r => computeTotalScore(r.answers || {})).sort((a, b) => b - a);
                          const top10Count = Math.max(1, Math.ceil(allScores.length * 0.1));
                          const top10Average = allScores.length > 0
                            ? Math.round(allScores.slice(0, top10Count).reduce((acc, s) => acc + s, 0) / top10Count)
                            : 0;
                          const overallAverage = allScores.length > 0
                            ? Math.round(allScores.reduce((acc, s) => acc + s, 0) / allScores.length)
                            : 0;

                          const isBrainiac = result.academy === 'brainiac';
                          const allScoreCards = [
                            {
                              label: '총점',
                              value: totalScore,
                              maxScore: PREP_TOTAL_POINTS,
                              icon: Award,
                              highlight: true
                            },
                            {
                              label: '상위 10%',
                              value: top10Average,
                              maxScore: null,
                              icon: Award,
                              highlight: false
                            },
                            {
                              label: '전체평균',
                              value: overallAverage,
                              maxScore: null,
                              icon: Users,
                              highlight: false
                            }
                          ];
                          const isHiddenAverageStudent =
                            totalScore < 80 ||
                            (result.student_name?.trim() === '이지성' &&
                            (result.student_school?.includes('중대초') ?? false) &&
                            String(result.student_grade ?? '').includes('5')) ||
                            result.student_name?.trim() === '송준성' ||
                            result.student_name?.trim() === '임시아';
                          const scoreCards = isBrainiac
                            ? allScoreCards.filter(c =>
                                c.label === '총점' ||
                                (c.label === '전체평균' && !isHiddenAverageStudent)
                              )
                            : allScoreCards.filter(c =>
                                !(isHiddenAverageStudent && c.label === '전체평균')
                              );

                          return (
                            <div className="col-span-4 grid grid-cols-1 gap-1.5">
                              {scoreCards.map(card => (
                                <div
                                  key={card.label}
                                  className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                                    card.highlight
                                      ? 'bg-[#0b0f14] border-amber-200/25 shadow-[0_10px_30px_-16px_rgba(11,15,20,0.7)]'
                                      : 'bg-white border-slate-200/70 shadow-[0_1px_0_0_rgba(15,23,42,0.04)]'
                                  }`}
                                >
                                  {card.highlight && (
                                    <>
                                      <div className="pointer-events-none absolute -top-10 -right-8 w-28 h-28 rounded-full bg-amber-300/10 blur-2xl" />
                                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
                                    </>
                                  )}
                                  <div className="relative px-3 py-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                        card.highlight
                                          ? 'border-amber-200/40 bg-amber-200/10'
                                          : 'border-slate-200 bg-slate-50'
                                      }`}>
                                        <card.icon className={`w-3.5 h-3.5 ${
                                          card.highlight ? 'text-amber-300' : 'text-slate-500'
                                        }`} />
                                      </div>
                                      <p className={`text-[10px] font-medium uppercase tracking-[0.22em] ${
                                        card.highlight ? 'text-amber-200/80' : 'text-slate-400'
                                      }`}>
                                        {card.label}
                                      </p>
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                      <span className={`font-semibold tracking-tight tabular-nums ${
                                        card.highlight
                                          ? 'text-2xl text-white'
                                          : 'text-lg text-slate-800'
                                      }`}>
                                        {card.value}
                                      </span>
                                      {card.maxScore
                                        ? <span className="text-[10px] font-medium text-slate-400">/{card.maxScore}점</span>
                                        : <span className="text-[10px] font-medium text-slate-400">점</span>
                                      }
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Radar Chart */}
                        <div className="col-span-8 bg-white rounded-xl p-2.5 border border-slate-200/70">
                          <p className="text-[9px] font-medium text-slate-400 mb-1 text-center uppercase tracking-[0.28em]">영역별 분석</p>
                          <div className="h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis 
                                  dataKey="subject" 
                                  tick={{ fontSize: 8, fill: '#64748b' }}
                                />
                                <PolarRadiusAxis 
                                  angle={90} 
                                  domain={[0, 100]} 
                                  tick={{ fontSize: 7 }}
                                  tickCount={5}
                                />
                                <Radar 
                                  name="점수" 
                                  dataKey="score" 
                                  stroke="#b08a3e" 
                                  fill="#d4af6e" 
                                  fillOpacity={0.28}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Section Scores Summary */}
                      {result.academy === 'brainiac' && (
                        <div className="flex items-center justify-between gap-2 bg-white border border-slate-200/70 rounded-xl px-3.5 py-2">
                          <p className="text-[9px] font-medium text-slate-400 tracking-[0.28em] uppercase">성취도 범례</p>
                          <div className="flex items-center gap-2">
                            {(['A','B','C'] as const).map(g => {
                              const s = getBrainiacAchievementStyle(g);
                              return (
                                <div key={g} className={`flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-md border ${s.softPill}`}>
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${s.pill}`}>{g}</span>
                                  <span className="text-[10px] font-semibold">{s.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className={`rounded-xl p-4 border ${
                        result.academy === 'brainiac'
                          ? 'bg-white border-slate-200/70 shadow-[0_1px_0_0_rgba(15,23,42,0.04)]'
                          : 'border-transparent'
                      }`}>
                        {result.academy === 'brainiac' && (
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                            <p className="text-[9px] font-medium text-slate-400 text-center uppercase tracking-[0.28em] whitespace-nowrap">4대 영역 종합 성취도</p>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          {(() => {
                            const order = ['reading', 'vocabulary', 'sentenceAnalysis', 'grammarA', 'grammarB', 'grammarC'];
                            return [...sectionScores].sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section));
                          })().map(section => {
                            const color = getSectionColor(section.section);
                            const isBrainiac = result.academy === 'brainiac';
                            const autoGrade: ForcedAchievementGrade = isBrainiac
                              ? getBrainiacAchievement(section.percentage)
                              : normalizeForcedAchievementGrade(getAchievementGrade(section.percentage));
                            const sectionKey = `section:${section.section}`;
                            const eff = getEffective(result.id, sectionKey, autoGrade);
                            const grade = eff.grade;
                            const achievementStyle = getBrainiacAchievementStyle(grade);
                            return (
                              <div
                                key={section.section}
                                className={`p-2 rounded-lg border ${
                                  isBrainiac ? achievementStyle.cardBg : `${color.light} border-slate-100`
                                }`}
                              >
                                {isBrainiac ? (
                                  <>
                                    <div className="flex items-center gap-1 mb-2">
                                      {getSectionIcon(section.section)}
                                      <span className="text-[11px] font-semibold text-slate-700">{section.sectionName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className={`text-[9px] font-medium uppercase tracking-wider ${achievementStyle.text}`}>성취도</p>
                                        <p className={`text-xs font-bold ${achievementStyle.text}`}>{achievementStyle.label}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); cycleGrade(result.id, sectionKey, grade); }}
                                        title="클릭: A→B→C"
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-base font-black tracking-tight cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition ${achievementStyle.pill}`}
                                      >
                                        {grade}
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1">
                                        {getSectionIcon(section.section)}
                                        <span className="text-[11px] font-medium text-slate-700">{section.sectionName}</span>
                                      </div>
                                       <button
                                         type="button"
                                         onClick={(e) => { e.stopPropagation(); cycleGrade(result.id, sectionKey, grade); }}
                                         title="클릭: A→B→C"
                                         className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition ${getBarColorStyle(section.percentage).softPill}`}
                                       >
                                         {grade}
                                       </button>
                                     </div>
                                     <p className={`text-sm font-bold ${getBarColorStyle(section.percentage).text}`}>{section.percentage}%</p>
                                     <p className="text-[9px] text-slate-500">{section.correctCount}/{section.totalQuestions}문항</p>
                                     <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                       <div
                                         className={`h-full ${getBarColorStyle(section.percentage).bar} rounded-full transition-all`}
                                         style={{ width: `${section.percentage}%` }}
                                       />
                                     </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detailed Section Analysis */}
                      <div className="space-y-3">
                        {Object.entries(prepSetFor(result.answers).analysisCategories).map(([sectionKey, categoryData]) => {
                          const sectionScore = sectionScores.find(s => s.section === sectionKey);
                          const subScores = subCategoryScores[sectionKey] || [];
                          const color = getSectionColor(sectionKey);
                          const weakCategories = subScores.filter(s => s.percentage < 60);

                          if (!sectionScore) return null;

                          return (
                            <div key={sectionKey} className="bg-white rounded-xl border border-slate-200/70 p-3.5">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${color.light}`}>
                                    {getSectionIcon(sectionKey)}
                                  </div>
                                  <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{categoryData.name}</h3>
                                </div>
                                {result.academy !== 'brainiac' && (
                                  <span className={`text-sm font-bold ${color.text}`}>{sectionScore.percentage}%</span>
                                )}
                              </div>

                              {/* Sub-category Grid */}
                              <div className="grid grid-cols-4 gap-1.5 mb-2">
                                {subScores.map((sub, idx) => (
                                  <div
                                    key={idx}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleCategoryClick(sub.name, sectionKey, result.answers)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryClick(sub.name, sectionKey, result.answers); } }}
                                    className={`p-2 rounded-md text-left cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition-all border ${
                                      result.academy === 'brainiac'
                                        ? getBrainiacAchievementStyle(getEffective(result.id, `sub:${sectionKey}:${sub.name}`, getBrainiacAchievement(sub.percentage)).grade).cardBg
                                        : 'bg-white border-slate-100'
                                    }`}
                                  >
                                    {result.academy === 'brainiac' ? (() => {
                                      const subKey = `sub:${sectionKey}:${sub.name}`;
                                      const autoG = getBrainiacAchievement(sub.percentage);
                                      const subEff = getEffective(result.id, subKey, autoG);
                                      const g = subEff.grade;
                                      const s = getBrainiacAchievementStyle(g);
                                      return (
                                        <div className="flex items-center justify-between gap-1.5">
                                          <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-[11px] text-slate-700 leading-tight">{getBrainiacDisplayName(sub.name)}</p>
                                            <p className={`text-[9px] font-medium mt-0.5 ${s.text}`}>
                                              {s.label}
                                            </p>
                                          </div>
                                           <button
                                             type="button"
                                            onClick={(e) => { e.stopPropagation(); cycleGrade(result.id, subKey, g); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); cycleGrade(result.id, subKey, g); } }}
                                            title="클릭: A→B→C"
                                            className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-black cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition ${s.pill}`}
                                          >
                                            {g}
                                           </button>
                                        </div>
                                      );
                                    })() : (
                                      (() => {
                                        const subKey = `sub:${sectionKey}:${sub.name}`;
                                        const autoG = normalizeForcedAchievementGrade(getAchievementGrade(sub.percentage));
                                        const subEff = getEffective(result.id, subKey, autoG);
                                        const g = subEff.grade;
                                        return (
                                       <>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <span className="font-medium text-[11px] text-slate-700">{sub.name}</span>
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); cycleGrade(result.id, subKey, g); }}
                                            title="클릭: A→B→C"
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition ${getBarColorStyle(sub.percentage).softPill}`}
                                          >
                                            {g}
                                          </button>
                                          <span className={`text-[11px] font-semibold ${getBarColorStyle(sub.percentage).text}`}>
                                            {sub.correctCount}/{sub.totalQuestions}
                                          </span>
                                        </div>
                                        
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full transition-all ${getBarColorStyle(sub.percentage).bar}`}
                                            style={{ width: `${sub.percentage}%` }}
                                          />
                                        </div>
                                      </>
                                        );
                                      })()
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Weak Areas */}
                              {weakCategories.length > 0 && (
                                <div className={`text-[9px] rounded p-1.5 ${
                                  result.academy === 'brainiac'
                                    ? 'text-slate-600 bg-slate-50 border border-slate-100'
                                    : 'text-red-600 bg-red-50'
                                }`}>
                                  <span className="font-medium">
                                    {result.academy === 'brainiac' ? '추가 학습 추천: ' : '보완 필요: '}
                                  </span>
                                  {weakCategories.map(w => result.academy === 'brainiac' ? getBrainiacDisplayName(w.name) : w.name).join(', ')}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {result.academy === 'brainiac' && (
                        <div className="px-3 pb-2">
                          <BrainiacSpecialClassSection
                            resultId={result.id}
                            studentName={result.student_name}
                            initialAssignments={result.special_class_assignments ?? null}
                          />
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-3 border-t border-slate-200/70">
                        <p className="text-center text-[8px] text-slate-400 uppercase tracking-[0.3em]">
                          © ORUN ENGLISH. All rights reserved.
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
    </Card>
    
    {/* Question Detail Dialog */}
    <PrepQuestionDetailDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      categoryName={selectedCategory}
      section={selectedSection}
      studentAnswers={selectedAnswers}
    />
    </>
  );
};

export default PrepLevelTestResultGroup;
