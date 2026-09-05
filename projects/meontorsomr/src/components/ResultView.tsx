
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { saveTestResult } from '@/utils/testStorage';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Loader2, ArrowLeft, Home } from 'lucide-react';

const ResultView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!result) {
      toast({
        title: "시험 결과를 찾을 수 없습니다",
        description: "시험 스캔 페이지로 이동합니다.",
        variant: "destructive"
      });
      navigate('/tests');
      return;
    }

    const saveResult = async () => {
      if (isSavingRef.current || isSubmitted) return;
      
      isSavingRef.current = true;
      try {
        console.log('Submitting test result:', result);
        const success = await saveTestResult(
          result.testData.testId, 
          result.studentAnswers, 
          result.score, 
          result.correct, 
          result.total, 
          result.studentName,
          result.studentClass
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
        toast({
          title: "시험 제출에 실패했습니다",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
        navigate('/omr', { state: result.testData });
      } finally {
        isSavingRef.current = false;
        setIsLoading(false);
      }
    };

    saveResult();
    
    // Simulate processing time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [result, navigate, isSubmitted]);

  if (!result) return null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Card className="max-w-md w-full border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
          <div className="flex flex-col items-center">
            {isLoading ? (
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
            ) : (
              <CheckCircle className="h-16 w-16 mb-4" />
            )}
            <CardTitle className="text-2xl font-bold text-center">
              {isLoading ? "시험 제출 중..." : "시험 제출 완료"}
            </CardTitle>
            <CardDescription className="text-emerald-50 text-center mt-2">
              {isLoading ? "잠시만 기다려주세요..." : "시험 결과가 성공적으로 저장되었습니다"}
            </CardDescription>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="py-4 flex flex-col items-center">
            {isLoading ? (
              <p className="text-slate-600 text-center">처리 중입니다...</p>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">수고하셨습니다!</h3>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-slate-600 text-center">
                  시험 결과는 선생님을 통해 확인하실 수 있습니다.
                </p>
                {result.studentClass && (
                  <p className="text-slate-500 text-sm mt-3">
                    반: {result.studentClass}
                  </p>
                )}
                {result.studentName && (
                  <p className="text-slate-500 text-sm">
                    이름: {result.studentName}
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex flex-col gap-3">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600"
            disabled={isLoading}
          >
            <Home className="mr-2 h-4 w-4" />
            메인페이지로 돌아가기
          </Button>
          
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
