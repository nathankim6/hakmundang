
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadTests } from '@/utils/testStorage';
import { QRDataType } from '@/types/test';
import BackButton from '@/components/BackButton';
import { useRegularTestPersistence } from '@/hooks/useTestAnswerPersistence';
import { toast } from "sonner";

const TestPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<QRDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<Record<number, { answer: string }>>({});

  // 답안 저장 훅
  const { loadSavedState, saveState, clearSavedState, markAsLoaded } = useRegularTestPersistence(testId);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        if (!testId) return;
        const tests = await loadTests();
        const foundTest = tests.find(t => t.testId === testId);
        
        if (foundTest) {
          setTest(foundTest);
          
          // 저장된 상태 복구
          const saved = loadSavedState();
          if (saved) {
            if (saved.studentName) setStudentName(saved.studentName);
            if (saved.answers) setAnswers(saved.answers);
            toast.info('이전에 작성하던 답안을 불러왔습니다.');
          } else {
            markAsLoaded();
          }
        } else {
          navigate('/tests');
        }
      } catch (error) {
        console.error('Error loading test:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, navigate, loadSavedState, markAsLoaded]);

  // 상태 변경 시 저장 (초기 로드 완료 후에만 동작)
  useEffect(() => {
    if (studentName || Object.keys(answers).length > 0) {
      saveState({ studentName, answers });
    }
  }, [studentName, answers, saveState]);

  const handleAnswerChange = (questionNumber: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: { answer: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit test logic would go here
    console.log('Submitting test with answers:', answers);
    clearSavedState(); // 제출 시 저장된 상태 삭제
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!test) {
    return <div className="flex items-center justify-center min-h-screen">Test not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <BackButton fallbackPath="/tests" />
        </div>
        <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
            <p className="text-gray-500 mb-6">Test ID: {test.testId}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium mb-1">
                  학생 이름
                </label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">답안 입력</h2>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: test.questionCount || 0 }).map((_, index) => (
                    <div key={index + 1} className="mb-2">
                      <label htmlFor={`question-${index + 1}`} className="block text-xs font-medium mb-1 text-center">
                        {index + 1}번
                      </label>
                      <Input
                        id={`question-${index + 1}`}
                        value={answers[index + 1]?.answer || ''}
                        onChange={(e) => handleAnswerChange(index + 1, e.target.value)}
                        className="text-center"
                        maxLength={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                제출하기
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
