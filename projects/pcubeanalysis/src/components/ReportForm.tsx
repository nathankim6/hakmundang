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
import DifficultProblemsExplanation from './DifficultProblemsExplanation';
import HitQuestionPhotos from './HitQuestionPhotos';
import OverallEvaluation from './OverallEvaluation';
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
  const [analysisType, setAnalysisType] = useState<'detailed' | 'simple'>('detailed');
  const [gptLoading, setGptLoading] = useState<Record<string, boolean>>({});
  
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
    hitQuestionPhotos: []
  });

  // New state for category evaluations
  const [categoryEvaluations, setCategoryEvaluations] = useState<CategoryEvaluation[]>([{
    category: '학습 난이도',
    evaluation: ''
  }, {
    category: '시험 유형',
    evaluation: ''
  }, {
    category: '킬러 문항',
    evaluation: ''
  }, {
    category: '추천 학습 방법',
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
  const handleUpdateType = (id: string, field: keyof ProblemType, value: string) => {
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

  // 추가: 적중문항 사진 코멘트 변경 함수
  const handlePhotoCommentChange = (photoIndex: number, comment: string) => {
    setFormData(prev => {
      const updatedPhotos = [...(prev.hitQuestionPhotos || [])];
      if (updatedPhotos[photoIndex]) {
        updatedPhotos[photoIndex] = { ...updatedPhotos[photoIndex], comment };
      }
      return {
        ...prev,
        hitQuestionPhotos: updatedPhotos
      };
    });
  };

  // GPT 텍스트 향상 함수
  const handleGptEnhance = async (field: 'difficultProblemsExplanation' | 'overallEvaluation', currentText: string): Promise<void> => {
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
          setCategoryEvaluations(prev => {
            const updated = prev.map(item => ({ ...item })); // Deep copy each item
            const overallEvalIndex = updated.findIndex(item => item.category === '종합 평가');
            if (overallEvalIndex !== -1) {
              updated[overallEvalIndex] = { 
                category: '종합 평가', 
                evaluation: data.enhancedText as string 
              };
            } else {
              // If '종합 평가' doesn't exist, add it
              updated.push({ 
                category: '종합 평가', 
                evaluation: data.enhancedText as string 
              });
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
  const themeColors = {
    primary: '#4F46E5',
    vibrant: '#6366F1',
    accent2: '#8B5CF6',
    pastel: '#EEF2FF',
    light: '#C7D2FE'
  };
  return <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Add back button at the top */}
      <div className="flex justify-start mb-2">
        <Button type="button" variant="outline" onClick={handleBackClick} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 
          뒤로가기
        </Button>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Pcube Academy 리포트 (기본정보)</h2>
        
        {/* School and Grade section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="school">학교</Label>
            <Input id="school" name="school" value={formData.school} onChange={handleInputChange} placeholder="학교명은 full name으로 입력하세요. 예: 숭의여자중학교" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">학년/반</Label>
            <Input id="grade" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="예: 1학년, 2학년, 3학년" required />
          </div>
        </div>
        
        {/* Modified Exam Info section */}
        <div className="space-y-2">
          <Label htmlFor="examInfo">시험 정보</Label>
          <Select value={showCustomExamInfo ? '직접 입력' : formData.examInfo || ''} onValueChange={handleExamInfoChange}>
            <SelectTrigger>
              <SelectValue placeholder="시험 종류를 선택하세요" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="1학기 중간고사">1학기 중간고사</SelectItem>
              <SelectItem value="1학기 기말고사">1학기 기말고사</SelectItem>
              <SelectItem value="2학기 중간고사">2학기 중간고사</SelectItem>
              <SelectItem value="2학기 기말고사">2학기 기말고사</SelectItem>
              <SelectItem value="직접 입력">직접 입력</SelectItem>
            </SelectContent>
          </Select>
          {showCustomExamInfo && <Input id="customExamInfo" name="examInfo" value={formData.examInfo} onChange={handleInputChange} placeholder="시험 정보를 직접 입력하세요" className="mt-2" />}
        </div>
        
        {/* Exam scope */}
        <div className="space-y-2">
          <Label htmlFor="examScope">시험 범위</Label>
          <Input id="examScope" name="examScope" value={formData.examScope} onChange={handleInputChange} placeholder="예: 교과서: 동아(이) 2,3과, 부교재: 리딩파워 30지문" required />
        </div>
        
        {/* Teacher info section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="teacher">강사 이름</Label>
            <Input id="teacher" name="teacher" value={formData.teacher} onChange={handleInputChange} placeholder="예: Jennie" />
          </div>
          <div className="space-y-2">
            <Label>강사 사진</Label>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="flex flex-col items-center space-y-4">
                {!formData.teacherPhoto ? <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-gray-500">사진을 업로드하거나 기존 사진을 선택하세요</p>
                      <div className="flex items-center gap-3 mt-1">
                        <TeacherPhotoUploader onPhotoUpload={url => {
                      setFormData(prev => ({
                        ...prev,
                        teacherPhoto: url
                      }));
                    }} bucketName="teacher-photos" />
                        {teacherPhotos.length > 0 && <TeacherPhotoDialog teacherPhotos={teacherPhotos} onPhotoSelect={url => {
                      setFormData(prev => ({
                        ...prev,
                        teacherPhoto: url
                      }));
                    }} school={formData.school} grade={formData.grade} />}
                      </div>
                    </div>
                  </div> : <div className="relative">
                    <div className="border-2 border-primary/20 rounded-lg p-2 shadow-sm bg-white">
                      <img src={formData.teacherPhoto} alt="강사 사진" className="w-36 h-36 object-contain" />
                    </div>
                    <div className="absolute -top-3 -right-3 flex gap-2">
                      <Button type="button" variant="destructive" size="icon" className="rounded-full shadow-md h-8 w-8" onClick={() => setFormData(prev => ({
                    ...prev,
                    teacherPhoto: ''
                  }))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <TeacherPhotoUploader onPhotoUpload={url => {
                    setFormData(prev => ({
                      ...prev,
                      teacherPhoto: url
                    }));
                  }} bucketName="teacher-photos" buttonText="다른 사진 업로드" />
                      {teacherPhotos.length > 0 && <TeacherPhotoDialog teacherPhotos={teacherPhotos} onPhotoSelect={url => {
                    setFormData(prev => ({
                      ...prev,
                      teacherPhoto: url
                    }));
                  }} school={formData.school} grade={formData.grade} />}
                    </div>
                  </div>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Questions count section */}
        <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">문항수</h2>
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
        
        {/* Problem Types section */}
        <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">문제 유형</h2>
        
        {/* 중등 리포트일 때만 분석 유형 선택 옵션 표시 */}
        {!isHighSchool && <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-lg backdrop-blur-sm">
            <Label className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">분석 유형 선택</Label>
            <p className="text-sm text-muted-foreground mb-6">원하시는 분석 방식을 선택해주세요</p>
            <div className="flex gap-4 justify-center">
              <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden ${analysisType === 'detailed' ? 'border-purple-500 bg-purple-100 shadow-md' : 'border-border hover:border-purple-400 hover:shadow-md hover:bg-purple-50/50'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <input type="radio" id="detailed" name="analysisType" value="detailed" checked={analysisType === 'detailed'} onChange={e => setAnalysisType(e.target.value as 'detailed' | 'simple')} className="w-5 h-5 text-purple-600 border-2 border-purple-400 focus:ring-purple-500 focus:ring-2 focus:ring-offset-2 relative z-10" />
                <Label htmlFor="detailed" className="cursor-pointer text-base font-semibold group-hover:text-purple-700 transition-colors relative z-10">상세분석</Label>
              </div>
              <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden ${analysisType === 'simple' ? 'border-purple-500 bg-purple-100 shadow-md' : 'border-border hover:border-purple-400 hover:shadow-md hover:bg-purple-50/50'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <input type="radio" id="simple" name="analysisType" value="simple" checked={analysisType === 'simple'} onChange={e => setAnalysisType(e.target.value as 'detailed' | 'simple')} className="w-5 h-5 text-purple-600 border-2 border-purple-400 focus:ring-purple-500 focus:ring-2 focus:ring-offset-2 relative z-10" />
                <Label htmlFor="simple" className="cursor-pointer text-base font-semibold group-hover:text-purple-700 transition-colors relative z-10">간단분석</Label>
              </div>
            </div>
          </div>}
        
        {!isHighSchool ? <MiddleSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} isSimpleMode={analysisType === 'simple'} /> : <HighSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} />}
        
        {/* 시험특징 및 킬러문항 섹션 - 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
        {(isHighSchool || !isHighSchool && analysisType === 'detailed') && <>
            <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">시험특징 & 킬러문항</h2>
            <div className="space-y-4">
              <div className="relative">
                <Textarea 
                  id="difficultProblemsExplanation" 
                  name="difficultProblemsExplanation" 
                  value={formData.difficultProblemsExplanation || ''} 
                  onChange={handleInputChange} 
                  placeholder="시험의 특징과 어려운 문항에 대한 설명을 작성하세요." 
                  className="min-h-[150px] pr-28" 
                />
                <Button
                  type="button"
                  onClick={() => handleGptEnhance('difficultProblemsExplanation', formData.difficultProblemsExplanation || '')}
                  disabled={gptLoading.difficultProblemsExplanation}
                  className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md"
                  size="sm"
                >
                  {gptLoading.difficultProblemsExplanation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      첨삭 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                       AI 첨삭
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">※ 시험의 특징, 난이도, 킬러 문항에 대한 분석을 작성해주세요.</p>
            </div>
          </>}

        {/* 적중문항 업로드 섹션 - 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
        {(isHighSchool || !isHighSchool && analysisType === 'detailed') && <>
            <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">적중문항</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-700 mb-4">학교 시험에서 적중한 문항의 사진을 업로드하세요. (A4  1/5 사이즈 권장)</p>
                <HitQuestionPhotos photos={formData.hitQuestionPhotos} themeColors={themeColors} onPhotoUpload={handlePhotoUpload} onPhotoDelete={handlePhotoDelete} onPhotoCommentChange={handlePhotoCommentChange} editable={true} />
              </div>
            </div>
          </>}
        
        {/* 종합평가 섹션 변경 */}
        <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">종합평가</h2>
        <div className="space-y-6">
          <OverallEvaluation 
            evaluations={categoryEvaluations} 
            onEvaluationChange={handleEvaluationChange} 
            selectedCategories={selectedCategories.length > 0 ? selectedCategories : undefined} 
            isHighSchool={isHighSchool}
            gptLoading={gptLoading.overallEvaluation}
            onGptEnhance={() => {
              const overallEval = categoryEvaluations.find(e => e.category === '종합 평가');
              const currentText = overallEval?.evaluation || '';
              if (!currentText || currentText.trim().length === 0) {
                toast.error('먼저 종합 평가 내용을 입력해주세요.');
                return;
              }
              handleGptEnhance('overallEvaluation', currentText);
            }}
          />
          <p className="text-sm text-gray-500">※ 각 항목별로 평가를 작성해주세요.</p>
        </div>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => navigate('/saved-reports')} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </form>;
};
export default ReportForm;