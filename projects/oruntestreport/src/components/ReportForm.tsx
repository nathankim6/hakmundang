import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Camera, X, ArrowLeft, Sparkles } from "lucide-react";
import { TeacherPhotoUploader } from './TeacherPhotoUploader';
import TeacherPhotoDialog from './TeacherPhotoDialog';
import { supabase } from '@/integrations/supabase/client';
import { saveReportCard, getReportCardById, convertDbToAppFormat, type ProblemType, type ReportCardData } from '@/integrations/supabase/reportService';
import MiddleSchoolProblemTypes from './MiddleSchoolProblemTypes';
import HighSchoolProblemTypes from './HighSchoolProblemTypes';
import ExamFeaturesEditor from './ExamFeaturesEditor';
import KillerTop5Editor from './KillerTop5Editor';
import OverallEvaluation, { STRATEGY_CATEGORY, SUMMARY_CATEGORY } from './OverallEvaluation';

import ExamPdfAnalyzer, { type ExamAnalysis, type AppliedCrop } from './ExamPdfAnalyzer';
import OriginalPassageInput from './OriginalPassageInput';
import PassageVariantEditor from './PassageVariantEditor';

import { getSchoolLogo } from '@/lib/schoolLogos';

// 매거진 톤 섹션 헤더
const SectionHeading: React.FC<{ kicker: string; title: string; description?: string }> = ({
  kicker,
  title,
  description,
}) => (
  <div className="mt-12 mb-6">
    <div className="flex items-center gap-3 mb-2.5">
      <span className="glass-pill editorial-kicker text-[10px] tracking-[0.35em] font-bold text-[#16233A]">
        {kicker}
      </span>

      <span className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
    </div>
    <h2
      className="font-display text-[22px] md:text-[26px] tracking-[-0.02em] font-medium text-[hsl(var(--ink))] leading-tight"
    >
      {title}
    </h2>
    {description && (
      <p className="mt-1.5 text-[13px] text-[hsl(var(--ink-soft))] leading-relaxed break-keep">
        {description}
      </p>
    )}
  </div>
);

interface ReportFormProps {
  schoolType?: 'middle' | 'high';
}
interface CategoryEvaluation {
  category: string;
  evaluation: string;
}
const ReportForm: React.FC<ReportFormProps> = ({
  schoolType
}) => {
  const navigate = useNavigate();
  const {
    id
  } = useParams<{
    id: string;
  }>();

  // Add back button handler
  const handleBackClick = () => {
    navigate('/create-report');
  };
  const [loading, setLoading] = useState(false);
  const [teacherPhotos, setTeacherPhotos] = useState<any[]>([]);
  const [showCustomExamInfo, setShowCustomExamInfo] = useState(false);
  const [showCustomGrade, setShowCustomGrade] = useState(false);
  const [analysisType, setAnalysisType] = useState<'detailed' | 'simple'>('detailed');
  const [gptLoading, setGptLoading] = useState<Record<string, boolean>>({});
  // 단계별 진행 (위저드)
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 전환 방향 (1: 다음, -1: 이전)
  
  // Undo history for text fields
  const [undoHistory, setUndoHistory] = useState<{
    difficultProblemsExplanation: string[];
    categoryEvaluations: CategoryEvaluation[][];
  }>({
    difficultProblemsExplanation: [],
    categoryEvaluations: []
  });
  const [formData, setFormData] = useState<ReportCardData>({
    school: '',
    grade: '',
    examScope: '',
    teacher: '',
    // Changed from '미정' to empty string
    teacherPhoto: '',
    totalQuestions: 3,
    objectiveQuestions: 3,
    subjectiveQuestions: 0,
    problemTypes: Array.from({
      length: 3
    }, (_, index) => ({
      id: Date.now().toString() + Math.random() + index,
      name: "",
      category: "",
      questionType: 'objective' as const,
      difficulty: 'medium' as const
    })),
    difficulty: {
      easy: 25,
      medium: 25,
      hard: 25,
      very_hard: 25
    },
    difficultProblemsExplanation: '',
    overallEvaluation: '',
    examInfo: '',
    // Add default value for examInfo
    hitQuestionPhotos: [],
    examFeatures: [],
    killerTop5: [],
    originalPassages: '',
    passageVariants: []

  });

  // 입력한 학교명에 따라 왼쪽에 로고 자동 표시
  const schoolLogoUrl = useMemo(() => getSchoolLogo(formData.school), [formData.school]);

  /** 기본 정보 입력값이 헤더 제목에 즉시 반영 — 예: "숭의여자고등학교 1학년 1학기 기말고사" */
  const formLiveTitle = useMemo(() => {
    const parts = [formData.school?.trim(), formData.grade?.trim(), formData.examInfo?.trim()].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '내신분석 리포트 작성';
  }, [formData.school, formData.grade, formData.examInfo]);


  // 종합 평가 — 수준별 학습 전략 / 종합의견 2분할
  const [categoryEvaluations, setCategoryEvaluations] = useState<CategoryEvaluation[]>([{
    category: STRATEGY_CATEGORY,
    evaluation: ''
  }, {
    category: SUMMARY_CATEGORY,
    evaluation: ''
  }]);


  // Save to history before changing
  const saveToHistory = useCallback((type: 'difficultProblemsExplanation' | 'categoryEvaluations', value: string | CategoryEvaluation[]) => {
    setUndoHistory(prev => {
      if (type === 'difficultProblemsExplanation') {
        return {
          ...prev,
          difficultProblemsExplanation: [...prev.difficultProblemsExplanation, value as string].slice(-10) // Keep last 10 states
        };
      } else {
        return {
          ...prev,
          categoryEvaluations: [...prev.categoryEvaluations, value as CategoryEvaluation[]].slice(-10) // Keep last 10 states
        };
      }
    });
  }, []);

  // Undo function
  const handleUndo = useCallback(() => {
    setUndoHistory(prev => {
      // Check if we have history for difficultProblemsExplanation
      if (prev.difficultProblemsExplanation.length > 0) {
        const lastState = prev.difficultProblemsExplanation[prev.difficultProblemsExplanation.length - 1];
        setFormData(currentFormData => ({
          ...currentFormData,
          difficultProblemsExplanation: lastState
        }));
        return {
          ...prev,
          difficultProblemsExplanation: prev.difficultProblemsExplanation.slice(0, -1)
        };
      }
      // Check if we have history for categoryEvaluations
      else if (prev.categoryEvaluations.length > 0) {
        const lastState = prev.categoryEvaluations[prev.categoryEvaluations.length - 1];
        setCategoryEvaluations(lastState);
        return {
          ...prev,
          categoryEvaluations: prev.categoryEvaluations.slice(0, -1)
        };
      }
      return prev;
    });
    toast.success('이전 상태로 되돌렸습니다.');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Add the missing handleEvaluationChange function with proper debugging
  const handleEvaluationChange = (category: string, value: string) => {
    console.log(`ReportForm - Updating evaluation for category: ${category} with value: ${value}`);
    
    // Save current state to history before changing
    setCategoryEvaluations(prev => {
      saveToHistory('categoryEvaluations', prev);
      
      // First check if this category exists
      const categoryExists = prev.some(item => item.category === category);
      if (categoryExists) {
        // Update existing category
        return prev.map(item => {
          if (item.category === category) {
            return {
              ...item,
              evaluation: value
            };
          }
          return item;
        });
      } else {
        // Add new category
        return [...prev, {
          category,
          evaluation: value
        }];
      }
    });
  };
  useEffect(() => {
    if (id) {
      console.log('ReportForm - Loading report with ID:', id);
      getReportCardById(id).then(({
        data,
        error
      }) => {
        if (data && !error) {
          console.log('ReportForm - Raw data from DB:', data);
          const reportData = convertDbToAppFormat(data);
          console.log('ReportForm - Converted report data:', reportData);
          console.log('ReportForm - Problem types with categories:', reportData.problemTypes);
          setFormData(reportData);

          // Check if examInfo is a custom value (not in predefined options)
          const predefinedOptions = ['1학기 중간고사', '1학기 기말고사', '2학기 중간고사', '2학기 기말고사'];
          if (reportData.examInfo && !predefinedOptions.includes(reportData.examInfo)) {
            setShowCustomExamInfo(true);
          }

          // Check if grade is a custom value (not in predefined options)
          const predefinedGrades = ['1학년', '2학년', '3학년'];
          if (reportData.grade && !predefinedGrades.includes(reportData.grade)) {
            setShowCustomGrade(true);
          }

          // Parse the overall evaluation if it exists
          if (reportData.overallEvaluation) {
            try {
              const parsedEvaluations = JSON.parse(reportData.overallEvaluation);
              if (Array.isArray(parsedEvaluations)) {
                setCategoryEvaluations(parsedEvaluations);
              }
            } catch (e) {
              // If parsing fails, use the overall evaluation as a single category
              setCategoryEvaluations([{
                category: '종합 평가',
                evaluation: reportData.overallEvaluation
              }, ...categoryEvaluations.slice(1)]);
            }
          }
        } else {
          console.error('Error fetching report card:', error);
          toast.error('보고서를 불러오는 중 오류가 발생했습니다.');
        }
      });
    }
  }, [id]);

  // Fetch teacher photos on component mount
  useEffect(() => {
    const fetchTeacherPhotos = async () => {
      try {
        const {
          data: teacherPhotosData,
          error
        } = await supabase.from('teacher_photos').select('*').order('created_at', {
          ascending: false
        });
        if (error) throw error;
        if (teacherPhotosData) {
          setTeacherPhotos(teacherPhotosData);
        }
      } catch (error) {
        console.error('Error fetching teacher photos:', error);
      }
    };
    fetchTeacherPhotos();
  }, []);
  const handleQuestionCountChange = (field: 'totalQuestions' | 'objectiveQuestions' | 'subjectiveQuestions', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => {
      let newData = {
        ...prev,
        [field]: numValue
      };
      if (field === 'totalQuestions') {
        if (newData.objectiveQuestions + newData.subjectiveQuestions > numValue) {
          newData.objectiveQuestions = Math.floor(numValue * 0.6);
          newData.subjectiveQuestions = numValue - newData.objectiveQuestions;
        }
        const currentTypeCount = prev.problemTypes.length;
        if (numValue > currentTypeCount) {
          const newTypes = Array.from({
            length: numValue - currentTypeCount
          }, (_, index) => ({
            id: Date.now().toString() + Math.random() + index,
            name: "",
            category: "",
            questionType: 'objective' as const,
            difficulty: 'medium' as const
          }));
          newData.problemTypes = [...prev.problemTypes, ...newTypes];
        } else if (numValue < currentTypeCount) {
          newData.problemTypes = prev.problemTypes.slice(0, numValue);
        }
      } else if (field === 'objectiveQuestions') {
        // When objective question count is changed, automatically update subjective question count
        newData.subjectiveQuestions = Math.max(0, newData.totalQuestions - numValue);
      } else if (field === 'subjectiveQuestions') {
        // When subjective question count is changed, automatically update objective question count
        newData.objectiveQuestions = Math.max(0, newData.totalQuestions - numValue);
      }
      return newData;
    });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    
    // Save to history before changing for specific text fields
    if (name === 'difficultProblemsExplanation' && formData[name as keyof ReportCardData] !== value) {
      saveToHistory('difficultProblemsExplanation', formData.difficultProblemsExplanation);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Modified handler for exam info select
  const handleExamInfoChange = (value: string) => {
    if (value === '직접 입력') {
      setShowCustomExamInfo(true);
      setFormData(prev => ({
        ...prev,
        examInfo: ''
      }));
    } else {
      setShowCustomExamInfo(false);
      setFormData(prev => ({
        ...prev,
        examInfo: value
      }));
    }
  };

  // Handler for grade select
  const handleGradeChange = (value: string) => {
    if (value === '직접 입력') {
      setShowCustomGrade(true);
      setFormData(prev => ({
        ...prev,
        grade: ''
      }));
    } else {
      setShowCustomGrade(false);
      setFormData(prev => ({
        ...prev,
        grade: value
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.school.trim()) {
        toast.error('학교 이름을 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!formData.grade.trim()) {
        toast.error('학년 정보를 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!formData.examScope.trim()) {
        toast.error('시험 범위를 입력해주세요.');
        setLoading(false);
        return;
      }

      // Combine category evaluations into JSON string
      const combinedEvaluation = JSON.stringify(categoryEvaluations);

      // Ensure teacher has a default value if empty
      const dataToSave = {
        ...formData,
        teacher: formData.teacher.trim() || '미정',
        overallEvaluation: combinedEvaluation,
        analysisType: analysisType
      };
      const {
        data,
        error
      } = await saveReportCard(dataToSave);
      if (error) {
        console.error('Error saving report card:', error);
        toast.error('보고서 저장 중 오류가 발생했습니다: ' + error.message);
        return;
      }
      toast.success('보고서가 저장되었습니다.');
      navigate('/saved-reports');
    } catch (error: any) {
      console.error('Error saving report card:', error);
      toast.error(`보고서 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // State for the "Add" section
  const [addCount, setAddCount] = useState(3); // Changed from 5 to 3

  // Helper functions for ProblemTypes components
  const handleAddProblemType = () => {
    setFormData(prev => {
      const newProblemType = {
        id: Date.now().toString() + Math.random(),
        name: "",
        category: "",
        questionType: 'objective' as const,
        difficulty: 'medium' as const
      };
      return {
        ...prev,
        problemTypes: [...prev.problemTypes, newProblemType],
        totalQuestions: prev.totalQuestions + 1,
        objectiveQuestions: prev.objectiveQuestions + 1
      };
    });
  };
  const handleAddMultiple = (count: number) => {
    setFormData(prev => {
      const newTypes = Array.from({
        length: count
      }, (_, index) => ({
        id: Date.now().toString() + Math.random() + index,
        name: "",
        category: "",
        questionType: 'objective' as const,
        difficulty: 'medium' as const
      }));
      return {
        ...prev,
        problemTypes: [...prev.problemTypes, ...newTypes],
        totalQuestions: prev.totalQuestions + count,
        objectiveQuestions: prev.objectiveQuestions + count
      };
    });
  };
  const handleRemoveType = (id: string) => {
    setFormData(prev => {
      const updatedTypes = prev.problemTypes.filter(type => type.id !== id);
      return {
        ...prev,
        problemTypes: updatedTypes,
        totalQuestions: updatedTypes.length,
        objectiveQuestions: updatedTypes.filter(type => type.questionType === 'objective').length,
        subjectiveQuestions: updatedTypes.filter(type => type.questionType === 'subjective').length
      };
    });
  };
  const handleRemoveAllTypes = () => {
    setFormData(prev => ({
      ...prev,
      problemTypes: [],
      totalQuestions: 0,
      objectiveQuestions: 0,
      subjectiveQuestions: 0
    }));
  };
  const handleUpdateType = (id: string, field: keyof ProblemType, value: string | boolean | number) => {
    setFormData(prev => {
      const updatedTypes = prev.problemTypes.map(type => {
        if (type.id === id) {
          const updatedType = {
            ...type,
            [field]: value
          };
          // If questionType is changed, update the counts
          if (field === 'questionType') {
            const prevType = type.questionType;
            const newType = value as 'objective' | 'subjective';
            if (prevType !== newType) {
              if (newType === 'objective') {
                prev.objectiveQuestions += 1;
                prev.subjectiveQuestions = Math.max(0, prev.subjectiveQuestions - 1);
              } else {
                prev.subjectiveQuestions += 1;
                prev.objectiveQuestions = Math.max(0, prev.objectiveQuestions - 1);
              }
            }
          }
          return updatedType;
        }
        return type;
      });
      return {
        ...prev,
        problemTypes: updatedTypes
      };
    });
  };

  // Define if this is a high school report based on schoolType or problem types
  const isHighSchool = useMemo(() => {
    // If schoolType is explicitly passed, use it
    if (schoolType) {
      return schoolType === 'high';
    }

    // If we're in edit mode (no schoolType), determine from existing problem types
    const hasHighSchoolCategories = formData.problemTypes.some(p => p.category === "부교재(모의고사)" || p.category === "단어장" || p.category === "교과서" || p.category === "핸드아웃" || p.category === "부교재" || p.category === "모의고사" || p.category === "워크북");
    const hasMiddleSchoolCategories = formData.problemTypes.some(p => p.category === "어휘" || p.category === "문법/어법" || p.category === "대화문" || p.category === "본문" || p.category === "본문 외 지문" || p.category === "서술형" || p.category?.startsWith("기타(직접입력)"));

    // If both or neither, default to middle school
    if (hasHighSchoolCategories && !hasMiddleSchoolCategories) {
      return true;
    }
    return false; // Default to middle school
  }, [schoolType, formData.problemTypes]);

  // Extract unique categories from problemTypes for evaluation
  const selectedCategories = React.useMemo(() => {
    const categories = formData.problemTypes.map(type => type.category).filter(category => category.trim() !== '');

    // Get unique categories only
    return Array.from(new Set(categories));
  }, [formData.problemTypes]);

  // 추가: 적중문항 사진 처리 함수
  const handlePhotoUpload = (photoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      hitQuestionPhotos: [...(prev.hitQuestionPhotos || []), {
        url: photoUrl
      }]
    }));
  };

  // 추가: 적중문항 사진 삭제 함수
  const handlePhotoDelete = (photoIndex: number) => {
    setFormData(prev => {
      const updatedPhotos = [...(prev.hitQuestionPhotos || [])];
      updatedPhotos.splice(photoIndex, 1);
      return {
        ...prev,
        hitQuestionPhotos: updatedPhotos
      };
    });
    toast.success('사진이 삭제되었습니다.');
  };

  // 킬러문항 설명 수정
  const handlePhotoNameChange = (photoIndex: number, name: string) => {
    setFormData(prev => {
      const updatedPhotos = [...(prev.hitQuestionPhotos || [])];
      if (!updatedPhotos[photoIndex]) return prev;
      updatedPhotos[photoIndex] = { ...updatedPhotos[photoIndex], problemName: name };
      return { ...prev, hitQuestionPhotos: updatedPhotos };
    });
  };

  // GPT 텍스트 향상 함수
  const handleGptEnhance = async (field: 'difficultProblemsExplanation' | 'overallEvaluation', currentText: string, targetCategory?: string): Promise<void> => {
    if (!currentText || currentText.trim().length === 0) {
      toast.error('먼저 내용을 입력해주세요.');
      return;
    }

    const loadingKey = field;
    setGptLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('gpt-enhance-text', {
        body: {
          text: currentText,
          type: field === 'difficultProblemsExplanation' ? 'exam-characteristics' : 'overall-evaluation'
        }
      });

      if (error) {
        console.error('GPT enhance error:', error);
        toast.error('AI 첨삭 중 오류가 발생했습니다.');
        return;
      }

      if (data && data.enhancedText) {
        if (field === 'difficultProblemsExplanation') {
          // Save current state to history before changing
          saveToHistory('difficultProblemsExplanation', formData.difficultProblemsExplanation);
          setFormData(prev => ({
            ...prev,
            difficultProblemsExplanation: data.enhancedText as string
          }));
        } else {
          // For overall evaluation, save current state to history before changing
          saveToHistory('categoryEvaluations', categoryEvaluations);
          const target = targetCategory || SUMMARY_CATEGORY;
          setCategoryEvaluations(prev => {
            const updated = prev.map(item => ({ ...item })); // Deep copy each item
            const overallEvalIndex = updated.findIndex(item => item.category === target);
            if (overallEvalIndex !== -1) {
              updated[overallEvalIndex] = { category: target, evaluation: data.enhancedText as string };
            } else {
              updated.push({ category: target, evaluation: data.enhancedText as string });
            }
            return updated;
          });
        }

        toast.success('AI 첨삭이 완료되었습니다!');
      }
    } catch (error: unknown) {
      console.error('GPT enhance error:', error);
      toast.error('AI 첨삭 중 오류가 발생했습니다.');
    } finally {
      setGptLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // 테마 색상 설정 (DifficultProblemsExplanation, HitQuestionPhotos 컴포넌트에 필요)
  // AI 시험지 분석 결과를 폼 전체에 반영
  const handleAiAnalysis = (analysis: ExamAnalysis, crops: AppliedCrop[]) => {
    const problems = [...analysis.problems].sort((a, b) => (a.number || 0) - (b.number || 0));
    const problemTypes: ProblemType[] = problems.map((p, index) => ({
      id: `${Date.now()}-${index}-${p.number}`,
      name: p.name || '',
      category: p.category || '',
      questionType: p.questionType === 'subjective' ? 'subjective' : 'objective',
      difficulty: p.difficulty || 'medium',
      isVariant: Boolean(p.isVariant),
      isKiller: Boolean(p.isKiller),
      points: typeof p.points === 'number' && !Number.isNaN(p.points) ? p.points : undefined,
      answer: p.answer?.trim() || '',
      insight: p.insight?.trim() || '',
    }));

    const objective = problemTypes.filter((p) => p.questionType === 'objective').length;
    const subjective = problemTypes.length - objective;

    setFormData((prev) => ({
      ...prev,
      school: analysis.school?.trim() || prev.school,
      grade: analysis.grade?.trim() || prev.grade,
      examInfo: analysis.examInfo?.trim() || prev.examInfo,
      examScope: prev.examScope?.trim() || analysis.examScope?.trim() || prev.examScope,
      problemTypes: problemTypes.length > 0 ? problemTypes : prev.problemTypes,
      totalQuestions: problemTypes.length > 0 ? problemTypes.length : prev.totalQuestions,
      objectiveQuestions: problemTypes.length > 0 ? objective : prev.objectiveQuestions,
      subjectiveQuestions: problemTypes.length > 0 ? subjective : prev.subjectiveQuestions,
      examFeatures:
        Array.isArray(analysis.examFeatures) && analysis.examFeatures.length > 0
          ? analysis.examFeatures.map((f) => ({ title: f.title || '', detail: f.detail || '' }))
          : prev.examFeatures,
      killerTop5:
        Array.isArray(analysis.killerTop5) && analysis.killerTop5.length > 0
          ? analysis.killerTop5.slice(0, 5).map((k) => ({
              number: k.number || '',
              title: k.title || '',
              points: typeof k.points === 'number' ? k.points : undefined,
              reason: k.reason || '',
            }))
          : prev.killerTop5,
      passageVariants:
        Array.isArray(analysis.passageVariants) && analysis.passageVariants.length > 0
          ? analysis.passageVariants.map((v) => ({
              number: v.number || '',
              source: v.source || '',
              variantType: v.variantType || '',
              originalText: v.originalText || '',
              examText: v.examText || '',
              changeDetail: v.changeDetail || '',
              impact: v.impact || '',
            }))
          : prev.passageVariants,

      hitQuestionPhotos: [
        ...(prev.hitQuestionPhotos || []),
        ...crops.map((crop) => ({
          url: crop.url,
          problemNumber: Number(crop.problemNumber) || undefined,
          problemName: crop.problemName,
        })),
      ],
    }));

    if (analysis.examInfo && !['1학기 중간고사', '1학기 기말고사', '2학기 중간고사', '2학기 기말고사'].includes(analysis.examInfo)) {
      setShowCustomExamInfo(true);
    }

    if (analysis.grade && !['1학년', '2학년', '3학년'].includes(analysis.grade)) {
      setShowCustomGrade(true);
    }

    const incoming: CategoryEvaluation[] = [
      { category: STRATEGY_CATEGORY, evaluation: analysis.levelStrategy?.trim() || '' },
      { category: SUMMARY_CATEGORY, evaluation: analysis.parentSummary?.trim() || '' },
    ].filter((item) => item.evaluation.length > 0);

    if (incoming.length > 0) {
      saveToHistory('categoryEvaluations', categoryEvaluations);
      setCategoryEvaluations((prev) => {
        const merged = prev.map((item) => ({ ...item }));
        incoming.forEach((item) => {
          const idx = merged.findIndex((m) => m.category === item.category);
          if (idx !== -1) merged[idx].evaluation = item.evaluation;
          else merged.push(item);
        });
        return merged;
      });
    }

  };

  const themeColors = {
    primary: '#4F46E5',
    vibrant: '#6366F1',
    accent2: '#8B5CF6',
    pastel: '#EEF2FF',
    light: '#C7D2FE'
  };

  // 단계 정의 (중등 간단분석이면 출제특징/킬러 단계 제외)
  const showDetailSteps = isHighSchool || analysisType === 'detailed';
  const STEPS = [
    { key: 'basic', title: '기본 정보', sub: '학교 · 시험 정보', kicker: '01 · BASIC' },
    { key: 'count', title: '문항 수', sub: '총 문항 구성', kicker: '02 · COUNT' },
    { key: 'types', title: '문제 유형', sub: '문항별 분류', kicker: '03 · TYPES' },
    ...(showDetailSteps ? [{ key: 'features', title: '출제 특징 & 킬러 문항', sub: '한눈에 보는 분석', kicker: '04 · INSIGHT' }] : []),
    { key: 'evaluation', title: '종합 평가', sub: '전략 · 코멘트', kicker: '05 · EVALUATION' },
  ];
  const lastStep = STEPS.length - 1;

  const goNext = () => {
    if (step === 0) {
      if (!formData.school.trim()) { toast.error('학교 이름을 입력해주세요.'); return; }
      if (!formData.grade.trim()) { toast.error('학년 정보를 입력해주세요.'); return; }
      if (!formData.examScope.trim()) { toast.error('시험 범위를 입력해주세요.'); return; }
    }
    setDir(1);
    setStep(s => Math.min(lastStep, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPrev = () => {
    setDir(-1);
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <div data-theme="blue" className="glass-stage min-h-screen py-10 px-4 sm:px-6">
      {/* 오로라 블롭 */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <span className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-[#F5C64F]/15 blur-[120px]" />
        <span className="absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full bg-[#8FA6B8]/15 blur-[120px]" />
        <span className="absolute -bottom-40 left-1/3 w-[520px] h-[520px] rounded-full bg-[#B3D1FF]/20 blur-[130px]" />
      </div>
      <form onSubmit={handleSubmit} className="glass-panel glass-form relative overflow-hidden space-y-10 max-w-5xl mx-auto px-6 sm:px-10 md:px-14 py-10 md:py-14">
      <span aria-hidden className="glass-sheen" />

      {/* 헤더 — 뒤로가기 + 타이틀 */}
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackClick}
            className="glass-ghost flex items-center gap-2 px-4 text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="editorial-kicker text-[10px] tracking-[0.3em] font-bold">BACK</span>
          </Button>
          <span className="glass-pill editorial-kicker text-[9.5px] tracking-[0.35em] font-semibold text-[hsl(var(--ink-soft))]">
            ORUN ENGLISH · REPORT EDITOR
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border border-white/25 bg-gradient-to-br from-[#16233A] via-[#1E3357] to-[#16233A] px-5 py-4 text-center shadow-[0_14px_40px_-20px_rgba(22,35,58,0.7)]">
          {/* 장식 — 골드 글로우 & 미세 도트 패턴 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: 'radial-gradient(rgba(245,198,79,0.9) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-[#F5C64F]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[#5B8DEF]/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="relative space-y-2">
            <span className="editorial-kicker inline-block rounded-full bg-[#F5C64F] px-2.5 py-0.5 text-[9px] tracking-[0.35em] font-bold text-[#16233A] shadow-[0_4px_14px_-5px_rgba(245,198,79,0.8)]">
              NEW REPORT
            </span>
            <div className="flex items-center justify-center gap-3">
              {schoolLogoUrl && (
                <img
                  src={schoolLogoUrl}
                  alt="학교 로고"
                  className="h-9 w-auto max-w-[64px] rounded-lg bg-white/90 p-0.5 object-contain shadow-sm"
                />
              )}
              <h1 className="text-[18px] md:text-[22px] font-extrabold tracking-[-0.02em] text-white break-keep drop-shadow-sm">
                {formLiveTitle}
              </h1>
            </div>
          </div>
        </div>


        {/* 단계 진행 표시 — Toss 스타일 스테퍼 */}
        <div className="glass-card p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#16233A] tracking-[-0.01em]">
              STEP {step + 1} <span className="text-[#16233A]/60 font-medium">/ {STEPS.length}</span>
            </span>

            <span className="text-[13px] font-semibold text-[hsl(var(--ink))] tracking-[-0.01em]">
              {STEPS[step].title}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(var(--ink)/0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F5C64F] to-[#FFD666] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => { if (i <= step) { setDir(i > step ? 1 : -1); setStep(i); } }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-2xl border transition-all duration-300 ${
                    active
                      ? 'bg-[#F5C64F]/10 border-[#F5C64F]/40'
                      : done
                        ? 'hover:bg-[hsl(var(--ink)/0.04)] cursor-pointer border-[hsl(var(--ink)/0.1)]'
                        : 'opacity-45 cursor-default border-[hsl(var(--ink)/0.08)]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                      active
                        ? 'bg-[#F5C64F] text-[#2B3642] shadow-[0_4px_12px_rgba(245,198,79,0.45)] scale-110'
                        : done
                          ? 'bg-[#F5C64F]/15 text-[#F5C64F]'
                          : 'bg-[hsl(var(--ink)/0.06)] text-[hsl(var(--ink-soft))]'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span className={`hidden md:block text-[10.5px] font-semibold tracking-[-0.01em] whitespace-nowrap ${active ? 'text-black' : 'text-black/70'}`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1 · 기본 정보 + AI 자동 분석 */}
        <div key={step === 0 ? `active-0-${step}-${dir}` : 'idle-0'} className={`${step === 0 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} glass-card p-6 md:p-8`}>
        {/* Basic info compact card */}
        <div className="rounded-[20px] border border-slate-200/80 bg-white/60 overflow-hidden shadow-sm">
          {/* Header with gold accent */}
          <div className="relative px-5 py-4 border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-[#F5C64F]/6">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F5C64F] via-[#FFD666] to-[#F5C64F]" />
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F5C64F]/12 text-[#B8860B]">
                <span className="text-[11px] font-bold">00</span>
              </span>
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B8860B] uppercase">Basic Information</p>
                <h2 className="text-[16px] font-semibold text-[hsl(var(--ink))] tracking-[-0.01em]">기본 정보</h2>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[hsl(var(--ink-soft))] leading-relaxed break-keep">
              학교, 학년, 시험 정보와 시험 범위를 먼저 입력해 주세요.
            </p>
          </div>

          {/* Compact form body */}
          <div className="p-5 space-y-4">
            {/* School / Grade / Exam - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="school" className="text-[12px] font-semibold text-[hsl(var(--ink))]">학교</Label>
                <Input id="school" name="school" value={formData.school} onChange={handleInputChange} placeholder="예: 숭의여자중학교" className="h-10 bg-white text-black text-[13px]" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-[12px] font-semibold text-[hsl(var(--ink))]">학년/반</Label>
                <Select value={showCustomGrade ? '직접 입력' : formData.grade || ''} onValueChange={handleGradeChange}>
                  <SelectTrigger className="h-10 text-[13px]">
                    <SelectValue placeholder="학년 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                    <SelectItem value="직접 입력">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
                {showCustomGrade && <Input id="customGrade" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="학년/반 직접 입력" className="mt-1.5 h-9 text-[13px]" />}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="examInfo" className="text-[12px] font-semibold text-[hsl(var(--ink))]">시험 정보</Label>
                <Select value={showCustomExamInfo ? '직접 입력' : formData.examInfo || ''} onValueChange={handleExamInfoChange}>
                  <SelectTrigger className="h-10 text-[13px]">
                    <SelectValue placeholder="시험 종류 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1학기 중간고사">1학기 중간고사</SelectItem>
                    <SelectItem value="1학기 기말고사">1학기 기말고사</SelectItem>
                    <SelectItem value="2학기 중간고사">2학기 중간고사</SelectItem>
                    <SelectItem value="2학기 기말고사">2학기 기말고사</SelectItem>
                    <SelectItem value="직접 입력">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
                {showCustomExamInfo && <Input id="customExamInfo" name="examInfo" value={formData.examInfo} onChange={handleInputChange} placeholder="시험 정보 직접 입력" className="mt-1.5 h-9 text-[13px]" />}
              </div>
            </div>

            {/* Exam scope */}
            <div className="space-y-1.5">
              <Label htmlFor="examScope" className="text-[12px] font-semibold text-[hsl(var(--ink))]">시험 범위</Label>
              <Input id="examScope" name="examScope" value={formData.examScope} onChange={handleInputChange} placeholder="예: 교과서: 동아(이) 2,3과, 부교재: 리딩파워 30지문" className="h-10 bg-white text-black text-[13px]" required />
            </div>

            {/* Original passage */}
            <OriginalPassageInput
              value={formData.originalPassages || ''}
              onChange={(value) => setFormData((prev) => ({ ...prev, originalPassages: value }))}
            />
          </div>
        </div>

        {/* Teacher info compact card */}
        <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-white/60 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-[#3182F6]/4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#3182F6]/10 text-[#3182F6]">
                <Camera className="w-3 h-3" />
              </span>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--ink))]">강사 정보</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="teacher" className="text-[12px] font-semibold text-[hsl(var(--ink))]">강사 이름</Label>
                <Input id="teacher" name="teacher" value={formData.teacher} onChange={handleInputChange} placeholder="예: Jennie" className="h-10 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-[hsl(var(--ink))]">강사 사진</Label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-3">
                  {!formData.teacherPhoto ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-full bg-primary/10 shrink-0">
                          <Camera className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TeacherPhotoUploader onPhotoUpload={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} bucketName="teacher-photos" />
                        {teacherPhotos.length > 0 && <TeacherPhotoDialog teacherPhotos={teacherPhotos} onPhotoSelect={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} school={formData.school} grade={formData.grade} />}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="border border-primary/20 rounded-lg p-1.5 shadow-sm bg-white">
                          <img src={formData.teacherPhoto} alt="강사 사진" className="w-20 h-20 object-contain" />
                        </div>
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 rounded-full shadow-md h-6 w-6" onClick={() => setFormData(prev => ({ ...prev, teacherPhoto: '' }))}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <TeacherPhotoUploader onPhotoUpload={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} bucketName="teacher-photos" buttonText="다른 사진 업로드" />
                        {teacherPhotos.length > 0 && <TeacherPhotoDialog teacherPhotos={teacherPhotos} onPhotoSelect={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} school={formData.school} grade={formData.grade} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section-block last">
          <SectionHeading
            kicker="01 · AI"
            title="시험지 자동 분석"
            description="위에 입력한 시험 범위를 기준으로, AI가 시험지 PDF의 문항별 범위·배점·난도·정답·출제 포인트를 자동으로 채워 줍니다."
          />
          <ExamPdfAnalyzer
            schoolType={isHighSchool ? 'high' : 'middle'}
            examScope={formData.examScope}
            originalPassages={formData.originalPassages}
            onApply={handleAiAnalysis}
          />
        </div>

        </div>
        {/* // STEP 1 · 기본 정보 끝 */}

        {/* STEP 2 · 문항 수 */}
        <div key={step === 1 ? `active-1-${step}-${dir}` : 'idle-1'} className={`${step === 1 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} glass-card p-6 md:p-8`}>
        <SectionHeading kicker="02 · COUNT" title="문항 수" description="총 문항·객관식·서답형 수를 입력합니다." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="totalQuestions">총 문항수</Label>
            <Input id="totalQuestions" type="number" min="0" value={formData.totalQuestions} onChange={e => handleQuestionCountChange('totalQuestions', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objectiveQuestions">객관식</Label>
            <Input id="objectiveQuestions" type="number" min="0" value={formData.objectiveQuestions} onChange={e => handleQuestionCountChange('objectiveQuestions', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectiveQuestions">서답형</Label>
            <Input id="subjectiveQuestions" type="number" min="0" value={formData.subjectiveQuestions} onChange={e => handleQuestionCountChange('subjectiveQuestions', e.target.value)} />
          </div>
        </div>
        </div>
        {/* // STEP 2 · 문항 수 끝 */}

        {/* STEP 3 · 문제 유형 */}
        <div key={step === 2 ? `active-2-${step}-${dir}` : 'idle-2'} className={`${step === 2 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} glass-card p-6 md:p-8`}>
        <SectionHeading kicker="03 · TYPES" title="문제 유형" description="각 문항의 분류·세부유형·난이도를 지정합니다." />
        
        {/* 중등 리포트일 때만 분석 유형 선택 옵션 표시 */}
        {!isHighSchool && (
          <div className="glass-card mb-8 p-6">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="editorial-kicker text-[10px] tracking-[0.35em] font-bold text-[#F5C64F]">
                ANALYSIS MODE
              </span>
              <span className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
            </div>
            <Label className="block font-display text-[18px] tracking-[-0.015em] font-medium text-[hsl(var(--ink))] mb-1">
              분석 유형
            </Label>
            <p className="text-[13px] text-[hsl(var(--ink-soft))] mb-5 break-keep">
              상세분석은 문항별 정밀 분석을, 간단분석은 핵심만 빠르게 정리합니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'detailed', label: '상세 분석', sub: 'DETAILED' },
                { val: 'simple', label: '간단 분석', sub: 'SIMPLE' },
              ].map((opt) => {
                const active = analysisType === (opt.val as 'detailed' | 'simple');
                return (
                  <label
                    key={opt.val}
                    htmlFor={opt.val}
                    className={`relative cursor-pointer flex flex-col items-center justify-center gap-1 px-5 py-5 border transition-all duration-200 rounded-sm ${
                      active
                        ? 'bg-[rgba(49,130,246,0.08)] border-[rgba(49,130,246,0.5)] shadow-[0_0_0_4px_rgba(49,130,246,0.12)]'
                        : 'bg-white/60 border-[hsl(var(--ink)/0.1)] hover:border-[rgba(49,130,246,0.35)] hover:bg-white/80'
                    }`}
                  >
                    <input
                      type="radio"
                      id={opt.val}
                      name="analysisType"
                      value={opt.val}
                      checked={active}
                      onChange={(e) => setAnalysisType(e.target.value as 'detailed' | 'simple')}
                      className="sr-only"
                    />
                    <span className={`editorial-kicker text-[9.5px] tracking-[0.4em] font-bold ${active ? 'text-[#F5C64F]' : 'text-[hsl(var(--ink-soft))]'}`}>
                      {opt.sub}
                    </span>
                    <span className={`font-display text-[17px] tracking-[-0.01em] font-medium ${active ? 'text-[hsl(var(--ink))]' : 'text-[hsl(var(--ink))]'}`}>
                      {opt.label}
                    </span>
                    {active && (
                      <span aria-hidden className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F5C64F]" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
        
        {!isHighSchool ? <MiddleSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} isSimpleMode={analysisType === 'simple'} /> : <HighSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} />}
        </div>
        {/* // STEP 3 · 문제 유형 끝 */}

        {/* STEP 4 · 출제 특징 & 킬러 문항 (상세 분석 모드에서만) */}
        {showDetailSteps && (
        <div key={step === 3 ? `active-3-${step}-${dir}` : 'idle-3'} className={`${step === 3 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} glass-card p-6 md:p-8`}>
        {/* 한눈에 보는 출제 특징 - 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
        {(isHighSchool || (!isHighSchool && analysisType === 'detailed')) && <>
            <SectionHeading kicker="04 · OVERVIEW" title="한눈에 보는 출제 특징" description="이번 시험의 출제 특징을 항목별로 정리합니다. PDF 자동 분석으로 채울 수 있습니다." />
            <div className="space-y-4">
              <div className="glass-card p-5">
                <ExamFeaturesEditor
                  features={formData.examFeatures || []}
                  onChange={(features) => setFormData(prev => ({ ...prev, examFeatures: features }))}
                />
              </div>
            </div>
          </>}

        {/* 등급을 가른 문항 TOP 5 - 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
        {(isHighSchool || (!isHighSchool && analysisType === 'detailed')) && <>
            <SectionHeading kicker="05 · KILLER" title="등급을 가른 문항 TOP 5" description="예상 오답률이 높은 순으로 문항 번호와 이유를 정리합니다." />
            <div className="space-y-4">
              <div className="glass-card p-5">
                <KillerTop5Editor
                  items={formData.killerTop5 || []}
                  onChange={(items) => setFormData(prev => ({ ...prev, killerTop5: items }))}
                />
              </div>
            </div>
          </>}

        {/* 원문 대조 · 지문 변형 분석 */}
        <SectionHeading
          kicker="06 · VARIANTS"
          title="원문 대조 · 지문 변형 분석"
          description="기본 정보 단계에서 입력한 원문과 실제 출제 문장을 대조한 결과입니다. 자유롭게 수정·추가할 수 있습니다."
        />
        <div className="space-y-4">
          <div className="glass-card p-5">
            <PassageVariantEditor
              items={formData.passageVariants || []}
              onChange={(items) => setFormData(prev => ({ ...prev, passageVariants: items }))}
            />
          </div>
        </div>

        </div>
        )}
        {/* // STEP 4 · 출제 특징 & 킬러 문항 끝 */}

        {/* STEP 5 · 종합 평가 */}
        <div key={step === lastStep ? `active-last-${step}-${dir}` : 'idle-last'} className={`${step === lastStep ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} glass-card p-6 md:p-8`}>
        <SectionHeading kicker="06 · EVALUATION" title="종합 평가" description="수준별 학습 전략과 학부모님께 전하는 종합의견을 나누어 작성합니다." />
        <div className="space-y-6">
          <OverallEvaluation 
            evaluations={categoryEvaluations} 
            onEvaluationChange={handleEvaluationChange} 
            selectedCategories={selectedCategories.length > 0 ? selectedCategories : undefined} 
            isHighSchool={isHighSchool}
            gptLoading={gptLoading.overallEvaluation}
            onGptEnhance={(category) => {
              const target = category || SUMMARY_CATEGORY;
              const found = categoryEvaluations.find(e => e.category === target)
                || (target === SUMMARY_CATEGORY ? categoryEvaluations.find(e => e.category === '종합 평가') : undefined);
              const currentText = found?.evaluation || '';
              if (!currentText || currentText.trim().length === 0) {
                toast.error('먼저 내용을 입력해주세요.');
                return;
              }
              handleGptEnhance('overallEvaluation', currentText, target);
            }}
          />
          <p className="text-[12px] text-[hsl(var(--ink-soft))] tracking-[-0.005em]">※ 두 항목 모두 작성하시면 리포트에 순서대로 표시됩니다.</p>

        </div>
        </div>
        {/* // STEP 5 · 종합 평가 끝 */}
      </div>

      {/* 하단 네비게이션 — 단계별 이전/다음/저장 */}
      <div className="relative pt-8 mt-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--ink)/0.15)] to-transparent" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="editorial-kicker text-[10px] tracking-[0.4em] font-bold text-[hsl(var(--ink-soft))]">
            © ORUN ENGLISH
          </span>
          <div className="flex gap-3 w-full sm:w-auto">
            {step === 0 ? (
              <Button
                type="button"
                onClick={() => navigate('/saved-reports')}
                disabled={loading}
                className="glass-ghost border-none px-6 rounded-full"
              >
                취소
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goPrev}
                disabled={loading}
                className="glass-ghost border-none px-6 rounded-full"
              >
                ← 이전
              </Button>
            )}
            {step < lastStep ? (
              <Button
                type="button"
                onClick={goNext}
                className="flex-1 sm:flex-none rounded-full bg-[#F5C64F] hover:bg-[#FFD666] text-[#2B3642] font-bold tracking-[-0.01em] px-10 h-11 shadow-[0_8px_20px_rgba(245,198,79,0.35)] transition-all duration-200 hover:shadow-[0_10px_24px_rgba(245,198,79,0.45)] hover:-translate-y-0.5 active:translate-y-0"
              >
                다음
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none rounded-full bg-[#F5C64F] hover:bg-[#FFD666] text-[#2B3642] font-bold tracking-[-0.01em] px-10 h-11 shadow-[0_8px_20px_rgba(245,198,79,0.35)] transition-all duration-200 hover:shadow-[0_10px_24px_rgba(245,198,79,0.45)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? '저장 중…' : '리포트 저장'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
    </div>;
};
export default ReportForm;