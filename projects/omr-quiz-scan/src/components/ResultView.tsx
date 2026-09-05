import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { saveTestResult } from '@/utils/testStorage';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, Home, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { setupRealtimeSubscriptions } from '@/utils/testStorage/cache';
import { isSubjectiveAnswerCorrect } from '@/utils/testUtils/answerValidation';

const ResultView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSavingRef = useRef(false);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);

  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!result) {
      toast({
        title: "시험 결과를 찾을 수 없습니다",
        description: "메인 페이지로 이동합니다.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Only run once when the component mounts or when result changes
    if (isSavingRef.current || isSubmitted) return;

    const saveResult = async () => {
      if (isSavingRef.current || isSubmitted) return;
      
      isSavingRef.current = true;
      setSubmitError(null);
      
      try {
        console.log('Attempting to submit test result:', result);
        console.log('Student class:', result.studentClass);
        console.log('Student name:', result.studentName);
        
        let studentFullName = '';
        if (result.studentClass && result.studentName) {
          studentFullName = `${result.studentClass} ${result.studentName}`.trim();
        } else if (result.studentClass) {
          studentFullName = result.studentClass.trim();
        } else if (result.studentName) {
          studentFullName = result.studentName.trim();
        } else {
          studentFullName = '익명';
        }
        
        console.log('Combined student name being saved:', studentFullName);
        
        const success = await saveTestResult(
          result.testData.testId, 
          result.studentAnswers, 
          result.score, 
          result.correct, 
          result.total, 
          studentFullName
        );

        if (success) {
          setIsSubmitted(true);
          toast({
            title: "시험이 제출되었습니다",
            description: "수고하셨습니다."
          });
        } else {
          throw new Error("Failed to save test result");
        }
      } catch (error) {
        console.error('Failed to save test result:', error);
        setSubmitError("시험 제출에 실패했습니다. 다시 시도해주세요.");
        setSubmissionAttempts(prev => prev + 1);
        toast({
          title: "시험 제출에 실패했습니다",
          description: "아래 버튼을 눌러 다시 시도해주세요.",
          variant: "destructive"
        });
      } finally {
        isSavingRef.current = false;
        setIsLoading(false);
      }
    };

    saveResult();
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [result, navigate]); // 무한 루프 방지: submissionAttempts, isSubmitted 제거

  const handleRetrySubmit = async () => {
    if (!result || isSavingRef.current) return;
    
    setIsLoading(true);
    setSubmitError(null);
    isSavingRef.current = true;
    
    try {
      console.log('Retrying test result submission:', result);
      console.log('Student class on retry:', result.studentClass);
      console.log('Student name on retry:', result.studentName);
      console.log('Retry attempt #', submissionAttempts + 1);
      
      let studentFullName = '';
      if (result.studentClass && result.studentName) {
        studentFullName = `${result.studentClass} ${result.studentName}`.trim();
      } else if (result.studentClass) {
        studentFullName = result.studentClass.trim();
      } else if (result.studentName) {
        studentFullName = result.studentName.trim();
      } else {
        studentFullName = '익명';
      }
      
      console.log('Combined student name being saved on retry:', studentFullName);
      
      const cleanedAnswers = Object.fromEntries(
        Object.entries(result.studentAnswers).map(([key, value]) => [
          Number(key), 
          typeof value === 'object' ? value : { type: 'multiple', answer: value }
        ])
      );
      
      const success = await saveTestResult(
        result.testData.testId, 
        cleanedAnswers, 
        result.score, 
        result.correct, 
        result.total, 
        studentFullName
      );

      if (success) {
        setIsSubmitted(true);
        toast({
          title: "시험이 제출되었습니다",
          description: "수고하셨습니다."
        });
      } else {
        throw new Error("Failed to save test result on retry");
      }
    } catch (error) {
      console.error('Failed to save test result on retry:', error);
      setSubmitError("시험 제출에 실패했습니다. 다시 시도해주세요.");
      setSubmissionAttempts(prev => prev + 1);
      toast({
        title: "시험 제출에 실패했습니다",
        description: "네트워크 상태를 확인하고 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      isSavingRef.current = false;
      setIsLoading(false);
    }
  };

  if (!result) return null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Card className="max-w-md w-full border-0 shadow-lg overflow-hidden">
        <div className={`p-6 text-white ${isSubmitted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : submitError ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
          <div className="flex flex-col items-center">
            {isLoading ? (
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
            ) : submitError ? (
              <AlertTriangle className="h-16 w-16 mb-4" />
            ) : (
              <CheckCircle className="h-16 w-16 mb-4" />
            )}
            <CardTitle className="text-2xl font-bold text-center">
              {isLoading ? "시험 제출 중..." : submitError ? "시험 제출 실패" : "시험 제출 완료"}
            </CardTitle>
            <CardDescription className={`text-center mt-2 ${isSubmitted ? 'text-emerald-50' : submitError ? 'text-rose-50' : 'text-blue-50'}`}>
              {isLoading ? "잠시만 기다려주세요..." : 
               submitError ? "다시 시도해주세요" : 
               "시험 결과가 성공적으로 저장되었습니다"}
            </CardDescription>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="py-4 flex flex-col items-center">
            {isLoading ? (
              <p className="text-slate-600 text-center">처리 중입니다...</p>
            ) : submitError ? (
              <>
                <div className="w-full bg-red-50 p-4 rounded-md mb-4">
                  <p className="text-red-600 text-center">{submitError}</p>
                  <p className="text-sm text-red-400 text-center mt-2">
                    시도 횟수: {submissionAttempts}
                  </p>
                </div>
                <Button 
                  onClick={handleRetrySubmit} 
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white mb-4"
                  disabled={isSavingRef.current}
                >
                  {isSavingRef.current ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      제출 중...
                    </>
                  ) : "다시 시도하기"}
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">수고하셨습니다!</h3>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-slate-600 text-center">
                  시험 결과는 선생님을 통해 확인하실 수 있습니다.
                </p>
              </>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex flex-col gap-3">
          <div className="flex gap-2 w-full">
            <BackButton 
              fallbackPath="/scan" 
              className="flex-1"
              variant="outline"
            />
            <Button 
              onClick={() => navigate('/')} 
              className={`flex-1 ${isSubmitted ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600'} text-white`}
              disabled={isLoading}
            >
              <Home className="mr-2 h-4 w-4" />
              메인페이지로 돌아가기
            </Button>
          </div>
          
          {!isLoading && (
            <p className="text-xs text-center text-slate-500 mt-2">
              결과 ID: {result.testData.testId.substring(0, 8)}...
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultView;
