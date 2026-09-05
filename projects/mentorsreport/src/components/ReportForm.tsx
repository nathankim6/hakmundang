import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Camera, X, ArrowLeft } from "lucide-react";
import { TeacherPhotoUploader } from './TeacherPhotoUploader';
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

  // Add the missing handleEvaluationChange function with proper debugging
  const handleEvaluationChange = (category: string, value: string) => {
    console.log(`ReportForm - Updating evaluation for category: ${category} with value: ${value}`);
    setCategoryEvaluations(prev => {
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
      getReportCardById(id).then(({
        data,
        error
      }) => {
        if (data && !error) {
          const reportData = convertDbToAppFormat(data);
          setFormData(reportData);

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
        if (error) {
          console.error('Error fetching teacher photos:', error);
          throw error;
        }
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        overallEvaluation: combinedEvaluation
      };
      console.log("Saving report with data:", dataToSave);
      const {
        data,
        error
      } = await saveReportCard(dataToSave);
      if (error) {
        console.error('Error saving report card:', error);
        toast.error(`보고서 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        setLoading(false);
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

  // Define if this is a high school report based on schoolType
  const isHighSchool = schoolType === 'high';

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
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">전문가집단 영어학원 리포트 (기본정보)</h2>
        
        {/* School and Grade section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="school">학교</Label>
            <Input id="school" name="school" value={formData.school} onChange={handleInputChange} placeholder="예: 숭의여자고등학교, 당곡고등학교, 국사봉중학교" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">학년/반</Label>
            <Input id="grade" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="예: 1학년, 2학년, 3학년" required />
          </div>
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
                      <div className="mt-1">
                        <TeacherPhotoUploader onPhotoUpload={url => {
                      setFormData(prev => ({
                        ...prev,
                        teacherPhoto: url
                      }));
                    }} bucketName="teacher-photos" />
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
        
        {schoolType === 'middle' ? <MiddleSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} /> : <HighSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} />}
        
        {/* 시험특징 및 킬러문항 섹션 추가 */}
        <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">시험특징 & 킬러문항</h2>
        <div className="space-y-2">
          <Textarea id="difficultProblemsExplanation" name="difficultProblemsExplanation" value={formData.difficultProblemsExplanation || ''} onChange={handleInputChange} placeholder="시험의 특징과 어려운 문항에 대한 설명을 작성하세요." className="min-h-[150px]" />
          <p className="text-sm text-gray-500 mt-2">※ 시험의 특징, 난이도, 킬러 문항에 대한 분석을 작성해주세요.</p>
        </div>

        {/* 적중문항 업로드 섹션 추가 */}
        <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">적중문항</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-700 mb-4">학교 시험에서 적중한 문항의 사진을 업로드하세요. (A4  1/5 사이즈 권장)</p>
            <HitQuestionPhotos photos={formData.hitQuestionPhotos} themeColors={themeColors} onPhotoUpload={handlePhotoUpload} onPhotoDelete={handlePhotoDelete} editable={true} />
          </div>
        </div>
        
        {/* 종합평가 섹션 변경 */}
        <h2 className="text-2xl font-bold mb-6 mt-10 text-gray-800 border-b pb-4">종합평가</h2>
        <div className="space-y-6">
          <OverallEvaluation evaluations={categoryEvaluations} onEvaluationChange={handleEvaluationChange} selectedCategories={selectedCategories.length > 0 ? selectedCategories : undefined} isHighSchool={isHighSchool} />
          <p className="text-sm text-gray-500 mt-2">※ 각 항목별로 평가를 작성해주세요.</p>
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