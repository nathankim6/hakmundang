
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { QRDataType, QuestionAnswer, TestFormat, WritingQuestion } from "@/types/test";
import { loadTests, saveTest, deleteTest } from "@/utils/testStorage";
import TestHeader from './admin/TestHeader';
import QRCodeDisplay from './admin/QRCodeDisplay';
import TestForm from './admin/TestForm';
import QuestionList from './admin/QuestionList';
import TestList from './admin/TestList';
import ClassListEditor from './admin/ClassListEditor';
import WritingTestUploader from './admin/WritingTestUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilLine, ListChecks, Users, FileEdit, BookOpen } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { calculateAutoPoints, sumPoints } from "@/utils/testUtils/pointsDistribution";

const AdminForm = () => {
  const [testTitle, setTestTitle] = useState('');
  const [testId, setTestId] = useState('');
  const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [questionCount, setQuestionCount] = useState(45);
  const [savedTests, setSavedTests] = useState<QRDataType[]>([]);
  const [activeTab, setActiveTab] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [testFormat, setTestFormat] = useState<TestFormat>('45');
  const [testMode, setTestMode] = useState<'standard' | 'writing'>('standard');
  const [writingQuestions, setWritingQuestions] = useState<WritingQuestion[]>([]);

  useEffect(() => {
    loadSavedTests();
  }, []);

  const loadSavedTests = async () => {
    try {
      const tests = await loadTests();
      setSavedTests(tests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  const handleAnswerChange = (questionNumber: number, answer: QuestionAnswer) => {
    // Ensure default (auto-distributed) points are set for new answers
    const answerWithPoints = {
      ...answer,
      points: answer.points ?? calculateAutoPoints(questionCount)[questionNumber]
    };
    
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answerWithPoints
    }));
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleTestFormatChange = (format: TestFormat) => {
    setTestFormat(format);
    // Reset to default format with default points
    setQuestionCount(45);
    const newAnswers: Record<number, QuestionAnswer> = {};
    // Initialize empty answers with auto-distributed points (total = 100)
    const autoPoints = calculateAutoPoints(45);
    for (let i = 1; i <= 45; i++) {
      newAnswers[i] = {
        type: 'multiple',
        answer: [], // Empty answer - no pre-selection
        points: autoPoints[i]
      };
    }
    setAnswers(newAnswers);
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value) || 1;
    
    if (newCount < 1) {
      toast({
        title: "문항 수 변경 실패",
        description: "최소 1개의 문항이 필요합니다.",
        variant: "destructive",
      });
      setQuestionCount(1);
      return;
    }
    
    setQuestionCount(newCount);
    
    const newAnswers = { ...answers };
    
    // Remove questions beyond new count
    if (newCount < Object.keys(answers).length) {
      Object.keys(newAnswers).forEach(key => {
        if (parseInt(key) > newCount) {
          delete newAnswers[parseInt(key)];
        }
      });
    }
    
    // Auto-distribute points so that the total is always 100
    const autoPoints = calculateAutoPoints(newCount);
    for (let i = 1; i <= newCount; i++) {
      if (!newAnswers[i]) {
        newAnswers[i] = {
          type: 'multiple',
          answer: [],
          points: autoPoints[i]
        };
      } else {
        newAnswers[i] = { ...newAnswers[i], points: autoPoints[i] };
      }
    }
    
    setAnswers(newAnswers);
  };

  const validateTestData = (): boolean => {
    const errors: string[] = [];
    
    if (!testTitle.trim()) {
      errors.push("시험 제목을 입력해주세요.");
    }
    
    if (!testId.trim()) {
      errors.push("시험 고유번호를 입력해주세요.");
    }
    
    // Check if testId already exists
    if (savedTests.some(test => test.testId === testId)) {
      errors.push("이미 존재하는 시험 고유번호입니다. 다른 번호를 입력해주세요.");
    }
    
    // Standard validation
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions !== questionCount) {
      errors.push(`${questionCount}개 문항 중 ${answeredQuestions}개만 입력되었습니다. 모든 문항에 정답을 입력해주세요.`);
      
      // Find missing question numbers
      const missingQuestions = [];
      for (let i = 1; i <= questionCount; i++) {
        if (!answers[i]) {
          missingQuestions.push(i);
        }
      }
      
      if (missingQuestions.length > 0) {
        errors.push(`누락된 문항: ${missingQuestions.join(', ')}번`);
      }
    }
    
    // Validate total points = 100 (allow 1 decimal place)
    const totalPoints = sumPoints(answers as any, questionCount);

    // 45문항 형식은 기본 2점 + 34/37/39번 3점(총 93점)이므로 100점 검증 제외
    if (questionCount !== 45 && Math.abs(totalPoints - 100) > 0.05) {
      errors.push(`총 배점이 100점이 되어야 합니다. 현재 ${totalPoints}점입니다.`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generateTest = async (formatOverride?: TestFormat) => {
    if (isSubmitting) return;
    
    const effectiveFormat = formatOverride || testFormat;
    
    // Validate test data
    if (!validateTestData()) {
      // Display all validation errors
      validationErrors.forEach(error => {
        toast({
          title: "입력 오류",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const testData: QRDataType = {
        title: testTitle,
        testId,
        answers,
        questionCount,
        timestamp: new Date().getTime(),
        isEnded: false,
        testFormat: effectiveFormat
      };
      
      console.log('Saving test data:', testData);
      
      const success = await saveTest(testData);
      if (success) {
        await loadSavedTests(); // 저장 후 목록 새로고침
        
        toast({
          title: "시험이 생성되었습니다",
          description: "시험 데이터가 저장되었습니다.",
        });

        // Reset form after successful submission
        setTestTitle('');
        setTestId('');
        setAnswers({});
        setShowQRCode(true);
        
        // Hide QR code after 10 seconds
        setTimeout(() => {
          setShowQRCode(false);
        }, 10000);
      } else {
        toast({
          title: "시험 생성 실패",
          description: "시험 데이터를 저장하는데 문제가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving test:', error);
      toast({
        title: "시험 생성 실패",
        description: "시험 데이터를 저장하는데 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWritingTest = async () => {
    if (isSubmitting) return;
    
    const errors: string[] = [];
    if (!testTitle.trim()) errors.push("시험 제목을 입력해주세요.");
    if (!testId.trim()) errors.push("시험 고유번호를 입력해주세요.");
    if (savedTests.some(test => test.testId === testId)) {
      errors.push("이미 존재하는 시험 고유번호입니다.");
    }
    if (writingQuestions.length === 0) {
      errors.push("CSV 파일을 업로드해주세요.");
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      errors.forEach(error => {
        toast({ title: "입력 오류", description: error, variant: "destructive" });
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const testRecord = {
        test_id: testId,
        title: testTitle,
        answers: {} as any,
        question_count: writingQuestions.length,
        is_ended: false,
        writing_questions: writingQuestions as any
      };
      
      const { error } = await supabase.from('tests').insert(testRecord as any);
      
      if (error) {
        console.error('Error saving writing test:', error);
        toast({
          title: "시험 생성 실패",
          description: "시험 데이터를 저장하는데 문제가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }
      
      await loadSavedTests();
      
      toast({
        title: "영작테스트가 생성되었습니다",
        description: `${writingQuestions.length}문제가 저장되었습니다.`
      });
      
      setTestTitle('');
      setTestId('');
      setWritingQuestions([]);
      setShowQRCode(true);
      
      setTimeout(() => {
        setShowQRCode(false);
      }, 10000);
    } catch (error) {
      console.error('Error saving writing test:', error);
      toast({
        title: "시험 생성 실패",
        description: "시험 데이터를 저장하는데 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    const success = await deleteTest(testId);
    if (success) {
      setSavedTests(prev => prev.filter(test => test.testId !== testId));
      toast({
        title: "시험이 삭제되었습니다",
        description: "시험 데이터가 삭제되었습니다.",
      });
    }
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
      <div className="container py-4 sm:py-8 max-w-3xl mx-auto">
        <TestHeader />
        
        <Card className="mt-6 border-0 shadow-lg overflow-hidden rounded-xl">
          <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-2 sm:p-4">
            <Tabs 
              defaultValue="create" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full bg-white/20 text-white grid grid-cols-5 h-auto">
                <TabsTrigger 
                  value="create" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">객관식</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="grammar" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">문법</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="writing" 
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <FileEdit className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">영작</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">목록</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="classes" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">반</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="p-3 sm:p-6 bg-white">
                <TabsContent value="create" className="mt-0 space-y-4 sm:space-y-6">
                  {validationErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="text-red-700 font-medium mb-1">입력 오류가 있습니다:</h4>
                      <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <TestForm 
                    testTitle={testTitle}
                    testId={testId}
                    onTitleChange={setTestTitle}
                    onIdChange={setTestId}
                    onSubmit={generateTest}
                    isSubmitting={isSubmitting}
                  />

                  <QuestionList 
                    questionCount={questionCount}
                    onQuestionCountChange={handleQuestionCountChange}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    testFormat={testFormat}
                    onTestFormatChange={handleTestFormatChange}
                  />
                  
                  <QRCodeDisplay show={showQRCode} />
                </TabsContent>

                <TabsContent value="grammar" className="mt-0 space-y-4 sm:space-y-6">
                  {validationErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="text-red-700 font-medium mb-1">입력 오류가 있습니다:</h4>
                      <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <TestForm 
                    testTitle={testTitle}
                    testId={testId}
                    onTitleChange={setTestTitle}
                    onIdChange={setTestId}
                    onSubmit={() => generateTest('grammar')}
                    isSubmitting={isSubmitting}
                  />

                  <QuestionList 
                    questionCount={questionCount}
                    onQuestionCountChange={handleQuestionCountChange}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    testFormat={'grammar'}
                    onTestFormatChange={handleTestFormatChange}
                    showGrammarCategory={true}
                  />
                  
                  <QRCodeDisplay show={showQRCode} />
                </TabsContent>

                <TabsContent value="writing" className="mt-0 space-y-4 sm:space-y-6">
                  {validationErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="text-red-700 font-medium mb-1">입력 오류가 있습니다:</h4>
                      <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <WritingTestUploader
                    testTitle={testTitle}
                    testId={testId}
                    onTitleChange={setTestTitle}
                    onIdChange={setTestId}
                    onQuestionsLoaded={setWritingQuestions}
                    onSubmit={generateWritingTest}
                    isSubmitting={isSubmitting}
                    questions={writingQuestions}
                  />
                  
                  <QRCodeDisplay show={showQRCode} />
                </TabsContent>
                
                <TabsContent value="list" className="mt-0">
                  <TestList 
                    tests={savedTests} 
                    onDelete={handleDeleteTest} 
                  />
                </TabsContent>
                
                <TabsContent value="classes" className="mt-0">
                  <ClassListEditor />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminForm;
