
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { QRDataType, QuestionAnswer } from "@/types/test";
import { loadTests, saveTest, deleteTest } from "@/utils/testStorage";
import TestHeader from './admin/TestHeader';
import TestForm from './admin/TestForm';
import QuestionList from './admin/QuestionList';
import TestList from './admin/TestList';
import QRCodeDisplay from './admin/QRCodeDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilLine, ListChecks, QrCode } from 'lucide-react';

const AdminForm = () => {
  const [testTitle, setTestTitle] = useState('');
  const [testId, setTestId] = useState('');
  const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [showQRCode, setShowQRCode] = useState(false);
  const [questionCount, setQuestionCount] = useState(45);
  const [savedTests, setSavedTests] = useState<QRDataType[]>([]);
  const [activeTab, setActiveTab] = useState("create");

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
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
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
    
    if (newCount < Object.keys(answers).length) {
      const newAnswers = { ...answers };
      Object.keys(newAnswers).forEach(key => {
        if (parseInt(key) > newCount) {
          delete newAnswers[parseInt(key)];
        }
      });
      setAnswers(newAnswers);
    }
  };

  const generateTest = async () => {
    if (!testTitle || !testId || Object.keys(answers).length !== questionCount) {
      toast({
        title: "모든 정보를 입력해주세요",
        description: "시험 제목, 고유번호, 그리고 모든 문항의 정답을 입력해야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    const testData: QRDataType = {
      title: testTitle,
      testId,
      answers,
      questionCount,
      timestamp: new Date().getTime()
    };
    
    const success = await saveTest(testData);
    if (success) {
      loadSavedTests(); // 저장 후 목록 새로고침
      setShowQRCode(true);
      setActiveTab("qrcode");
      
      toast({
        title: "시험이 생성되었습니다",
        description: "시험 데이터가 저장되었습니다.",
      });

      setTestTitle('');
      setTestId('');
      setAnswers({});
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
              <TabsList className="w-full bg-white/20 text-white grid grid-cols-3 h-auto">
                <TabsTrigger 
                  value="create" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">시험 생성</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <ListChecks className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">시험 목록</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="qrcode" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">QR 코드</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="p-3 sm:p-6 bg-white">
                <TabsContent value="create" className="mt-0 space-y-4 sm:space-y-6">
                  <TestForm 
                    testTitle={testTitle}
                    testId={testId}
                    onTitleChange={setTestTitle}
                    onIdChange={setTestId}
                    onSubmit={generateTest}
                  />

                  <QuestionList 
                    questionCount={questionCount}
                    onQuestionCountChange={handleQuestionCountChange}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                  />
                </TabsContent>
                
                <TabsContent value="list" className="mt-0">
                  <TestList 
                    tests={savedTests} 
                    onDelete={handleDeleteTest} 
                  />
                </TabsContent>
                
                <TabsContent value="qrcode" className="mt-0">
                  <QRCodeDisplay show={showQRCode} />
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
