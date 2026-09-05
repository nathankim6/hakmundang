
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { QuestionAnswer, QuestionType } from "@/types/test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentAnswer {
  type: QuestionType;
  answer: string | number;
}

const CLASS_LIST = ["MW_M1", "MF_M3", "MW_H1", "MT_H2", "Tt_M2", "Tt_M3", "Tt_H1", "TF_H3", "WF_M2", "WF_H2"];

const OMRCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams();
  const [studentAnswers, setStudentAnswers] = useState<Record<number, StudentAnswer>>({});
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [testData, setTestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setIsLoading(true);
        if (testId) {
          const { data: test, error } = await supabase
            .from('tests')
            .select('*')
            .eq('test_id', testId)
            .maybeSingle();

          if (error) {
            console.error('Error loading test:', error);
            toast({
              title: "시험을 불러오는데 실패했습니다",
              description: "다시 시도해주세요.",
              variant: "destructive",
            });
            navigate('/tests');
            return;
          }

          if (!test) {
            toast({
              title: "시험을 찾을 수 없습니다",
              description: "올바른 시험 ID를 입력해주세요.",
              variant: "destructive",
            });
            navigate('/tests');
            return;
          }

          setTestData({
            title: test.title,
            testId: test.test_id,
            answers: test.answers,
            questionCount: test.question_count,
          });
        } else if (location.state) {
          setTestData(location.state);
        } else {
          navigate('/tests');
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "오류가 발생했습니다",
          description: "다시 시도해주세요.",
          variant: "destructive",
        });
        navigate('/tests');
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [testId, location.state, navigate]);

  const handleAnswerChange = (questionNumber: number, answer: string | number, type: QuestionType) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionNumber]: {
        type,
        answer
      }
    }));
  };

  const calculateScore = () => {
    if (!studentName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!studentClass) {
      toast({
        title: "반을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(studentAnswers).length !== testData.questionCount) {
      toast({
        title: "모든 문항을 체크해주세요",
        variant: "destructive",
      });
      return;
    }

    let correct = 0;
    Object.keys(testData.answers).forEach(questionNumber => {
      const correctAnswer = testData.answers[questionNumber] as QuestionAnswer;
      const studentAnswer = studentAnswers[Number(questionNumber)];
      
      if (correctAnswer.type === studentAnswer.type) {
        if (correctAnswer.type === 'multiple') {
          if (correctAnswer.answer === studentAnswer.answer) {
            correct++;
          }
        } else if (correctAnswer.type === 'subjective') {
          const correctAnswers = correctAnswer.answer.toString()
            .split(',')
            .map(answer => answer.trim().toLowerCase());
          
          const normalizedStudentAnswer = studentAnswer.answer.toString().trim().toLowerCase();
          
          if (correctAnswers.some(answer => 
            normalizedStudentAnswer === answer ||
            normalizedStudentAnswer.includes(answer) ||
            answer.includes(normalizedStudentAnswer)
          )) {
            correct++;
          }
        }
      }
    });

    const score = (correct / testData.questionCount) * 100;
    
    navigate('/result', {
      state: {
        score,
        correct,
        total: testData.questionCount,
        studentAnswers,
        testData,
        studentName,
        studentClass
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-emerald-50 to-emerald-100/30">
        <Card className="max-w-2xl mx-auto p-6 space-y-8 bg-white shadow-xl rounded-xl">
          <div className="flex justify-center items-center h-32">
            <p className="text-emerald-600">시험 정보를 불러오는 중...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!testData) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-emerald-50 to-emerald-100/30">
      <Card className="max-w-2xl mx-auto p-6 space-y-8 bg-white shadow-xl rounded-xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-emerald-900 flex-1 text-center">{testData.title}</h1>
          <div className="w-10" />
        </div>
        <p className="text-sm text-emerald-600 text-center">모든 문항에 답을 체크해주세요</p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="반 선택" />
              </SelectTrigger>
              <SelectContent className="max-h-none">
                {CLASS_LIST.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label htmlFor="studentName" className="text-lg font-semibold text-emerald-700 whitespace-nowrap">
              이름
            </Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="max-w-[200px] border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-emerald-700 whitespace-nowrap">시험 문항</h2>
            <div className="flex gap-2 items-center">
              <span className="text-emerald-700">{testData.questionCount}문항</span>
            </div>
          </div>
          
          {Array.from({ length: testData.questionCount }, (_, i) => i + 1).map((num) => {
            const questionType = (testData.answers[num] as QuestionAnswer)?.type || 'multiple';
            return (
              <div key={num} className="flex items-center py-2 border-b border-emerald-100">
                <span className="w-16 font-medium text-emerald-700 text-lg">{num}번</span>
                <div className="flex gap-4">
                  {questionType === 'subjective' ? (
                    <Input
                      type="text"
                      value={studentAnswers[num]?.answer || ''}
                      onChange={(e) => handleAnswerChange(num, e.target.value, 'subjective')}
                      placeholder="답을 입력하세요"
                      className="flex-1 border-emerald-200 focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`q${num}-${option}`}
                            name={`q${num}`}
                            className="hidden"
                            checked={studentAnswers[num]?.answer === option}
                            onChange={() => handleAnswerChange(num, option, 'multiple')}
                          />
                          <Label 
                            htmlFor={`q${num}-${option}`}
                            className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all border ${
                              studentAnswers[num]?.answer === option
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={calculateScore}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          제출하기
        </Button>
      </Card>
    </div>
  );
};

export default OMRCard;
