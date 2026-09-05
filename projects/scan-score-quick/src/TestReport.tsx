import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Award, Star, BookOpenCheck, Sparkles, Medal, TrendingUp, BarChart2 } from "lucide-react";

interface TestReportProps {
  studentName: string;
  studentAnswers: Record<number, any>;
  correctAnswers: Record<number, any>;
  testDate: string;
  studentClass?: string;
  allResults?: Array<{
    score: number;
    student_answers: Record<number, any>;
  }>;
  testTitle?: string;
}

const SECTIONS = [{
  name: "듣기",
  range: Array.from({
    length: 17
  }, (_, i) => i + 1)
}, {
  name: "대의파악",
  range: [...Array.from({
    length: 7
  }, (_, i) => i + 18), 40]
}, {
  name: "내용이해",
  range: Array.from({
    length: 4
  }, (_, i) => i + 25)
}, {
  name: "어법어휘",
  range: [29, 30]
}, {
  name: "빈칸추론",
  range: [31, 32, 33, 34]
}, {
  name: "간접쓰기",
  range: [35, 36, 37, 38, 39]
}, {
  name: "장문",
  range: [41, 42, 43, 44, 45]
}].filter(section => section.name);

const THREE_POINT_QUESTIONS = [6, 13, 15, 21, 23, 29, 33, 34, 37, 39];

const calculateGrade = (score: number) => {
  if (score >= 90) return "1";
  if (score >= 80) return "2";
  if (score >= 70) return "3";
  if (score >= 60) return "4";
  if (score >= 50) return "5";
  if (score >= 40) return "6";
  if (score >= 30) return "7";
  if (score >= 20) return "8";
  return "9";
};

const getAchievementGrade = (percentage: number): string => {
  if (percentage === 100) return 'S';
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  return 'C';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'S':
      return 'bg-purple-100 text-purple-800';
    case 'A':
      return 'bg-emerald-100 text-emerald-800';
    case 'B':
      return 'bg-blue-100 text-blue-800';
    case 'C':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const calculateTop30Average = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  if (scores.length === 1) return scores[0];
  
  const sortedScores = [...scores].sort((a, b) => b - a);
  
  const top30Count = Math.max(2, Math.ceil(sortedScores.length * 0.3));
  
  const finalCount = Math.min(top30Count, sortedScores.length);
  const top30Scores = sortedScores.slice(0, finalCount);
  
  const average = top30Scores.reduce((a, b) => a + b, 0) / finalCount;
  return Math.round(average * 10) / 10;
};

const calculateTop30CutoffScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  if (scores.length === 1) return scores[0];
  
  const sortedScores = [...scores].sort((a, b) => b - a);
  
  const top30Count = Math.ceil(sortedScores.length * 0.3);
  
  const cutoffIndex = Math.min(top30Count - 1, sortedScores.length - 1);
  return sortedScores[cutoffIndex];
};

const isSubjectiveAnswerCorrect = (studentAnswer: string, correctAnswer: string): boolean => {
  if (!studentAnswer || !correctAnswer) return false;
  
  const correctOptions = correctAnswer.split(',').map(opt => opt.trim().toLowerCase());
  const normalizedStudentAnswer = studentAnswer.trim().toLowerCase();
  
  return correctOptions.some(option => option === normalizedStudentAnswer);
};

const TestReport: React.FC<TestReportProps> = ({
  studentName,
  studentAnswers,
  correctAnswers,
  testDate,
  studentClass,
  allResults = [],
  testTitle,
}) => {
  const formatTestDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const results = useMemo(() => {
    const sectionResults = SECTIONS.map(section => {
      let sectionScore = 0;
      let correctCount = 0;
      const totalQuestions = section.range.length;
      let sectionMaxScore = 0;

      section.range.forEach(questionNumber => {
        const studentAnswer = studentAnswers[questionNumber]?.answer;
        const correctAnswer = correctAnswers[questionNumber]?.answer;
        const questionType = correctAnswers[questionNumber]?.type;
        
        let isCorrect = false;
        
        if (questionType === 'subjective') {
          isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
        } else {
          isCorrect = studentAnswer === correctAnswer;
        }
        
        const points = THREE_POINT_QUESTIONS.includes(questionNumber) ? 3 : 2;
        sectionMaxScore += points;
        if (isCorrect) {
          correctCount++;
          sectionScore += points;
        }
      });

      const allSectionScores = allResults.map(result => {
        let score = 0;
        section.range.forEach(questionNumber => {
          const studentAnswer = result.student_answers[questionNumber]?.answer;
          const correctAnswer = correctAnswers[questionNumber]?.answer;
          const questionType = correctAnswers[questionNumber]?.type;
          
          let isCorrect = false;
          
          if (questionType === 'subjective') {
            isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
          } else {
            isCorrect = studentAnswer === correctAnswer;
          }
          
          if (isCorrect) {
            score += THREE_POINT_QUESTIONS.includes(questionNumber) ? 3 : 2;
          }
        });
        return score;
      });

      const sectionAvg = allSectionScores.length > 0 
        ? Math.round(allSectionScores.reduce((a, b) => a + b, 0) / allSectionScores.length * 10) / 10 
        : 0;

      const sectionTop30Cutoff = calculateTop30CutoffScore(allSectionScores);

      return {
        name: section.name,
        score: sectionScore,
        maxScore: sectionMaxScore,
        correctCount,
        totalQuestions,
        percentage: sectionScore / sectionMaxScore * 100,
        average: sectionAvg,
        top30: sectionTop30Cutoff
      };
    });

    const allScores = allResults.map(result => {
      let score = 0;
      Object.keys(result.student_answers).forEach(questionNum => {
        const questionNumber = parseInt(questionNum);
        const studentAnswer = result.student_answers[questionNumber]?.answer;
        const correctAnswer = correctAnswers[questionNumber]?.answer;
        const questionType = correctAnswers[questionNumber]?.type;
        
        let isCorrect = false;
        
        if (questionType === 'subjective') {
          isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
        } else {
          isCorrect = studentAnswer === correctAnswer;
        }
        
        if (isCorrect) {
          score += THREE_POINT_QUESTIONS.includes(questionNumber) ? 3 : 2;
        }
      });
      return score;
    });

    const totalScore = sectionResults.reduce((acc, section) => acc + section.score, 0);
    const totalCorrect = sectionResults.reduce((acc, section) => acc + section.correctCount, 0);
    const totalQuestions = 45;
    
    const average = allScores.length > 0 
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length * 10) / 10 
      : 0;

    const top30Score = calculateTop30CutoffScore(allScores);

    const highestScore = allScores.length > 0 ? Math.max(...allScores) : totalScore;

    const wrongAnswerRates = Array.from({ length: 45 }, (_, idx) => {
      const questionNumber = idx + 1;
      const correctAnswer = correctAnswers[questionNumber]?.answer;
      const questionType = correctAnswers[questionNumber]?.type;
      
      const wrongCount = allResults.filter(result => {
        const studentAnswer = result.student_answers[questionNumber]?.answer;
        
        if (questionType === 'subjective') {
          return !isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
        } else {
          return studentAnswer !== correctAnswer;
        }
      }).length;
      
      const rate = wrongCount / allResults.length * 100;
      
      const isCorrect = questionType === 'subjective'
        ? isSubjectiveAnswerCorrect(String(studentAnswers[questionNumber]?.answer), String(correctAnswer))
        : studentAnswers[questionNumber]?.answer === correctAnswer;
      
      return {
        questionNumber,
        rate,
        isCorrect
      };
    });

    const top3WrongAnswers = wrongAnswerRates
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    return {
      sections: sectionResults,
      total: {
        score: totalScore,
        maxScore: 100,
        correctCount: totalCorrect,
        totalQuestions,
        percentage: totalScore / 100 * 100,
        average,
        top30Score,
        highestScore,
        grade: calculateGrade(totalScore),
        wrongAnswerTop3: top3WrongAnswers
      }
    };
  }, [studentAnswers, correctAnswers, allResults]);

  const chartData = results.sections.map(section => ({
    subject: section.name,
    score: Math.round(section.percentage)
  }));

  const scoreComparisonData = [
    {
      name: "응시자 평균",
      average: results.total.average,
      score: null
    },
    {
      name: "내 점수",
      average: null,
      score: results.total.score
    }
  ];

  return (
    <Card className="w-full overflow-hidden border-0 shadow-lg">
      <div className="space-y-8 p-6 md:p-8">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-50 via-slate-100 to-blue-100 p-8 shadow-lg border border-slate-200/50">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          <div className="relative z-10 flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="relative p-1 bg-white backdrop-blur-sm rounded-full shadow-sm">
                    <img src="/lovable-uploads/5b56e2a6-a232-40de-90c5-6d82faab51f6.png" alt="Orun Academy Logo" className="h-14 w-auto rounded-full" />
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="font-bold text-3xl text-amber-900">브래니악 영어학원 시험 성적 리포트</h1>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-1 px-3 py-1 rounded-full bg-white border border-amber-200/50 text-amber-800 text-sm">
                <Medal className="h-4 w-4 text-amber-600" />
                <span>ORUN CSAT Score Report</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="rounded-lg bg-white p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium text-amber-700">학생 이름</span>
                </div>
                <p className="text-xl font-medium text-amber-900">{studentName || '-'}</p>
              </div>
              
              <div className="rounded-lg bg-white p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium text-amber-700">소속반</span>
                </div>
                <p className="text-xl font-medium text-amber-900">{studentClass || '-'}</p>
              </div>
              
              <div className="rounded-lg bg-white p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpenCheck className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium text-amber-700">시험명</span>
                </div>
                <p className="text-xl font-medium text-amber-900">{testTitle || '-'}</p>
              </div>
              
              <div className="rounded-lg bg-white p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium text-amber-700">시행일자</span>
                </div>
                <p className="text-xl font-medium text-amber-900">{formatTestDate(testDate)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-amber-700" />
              <h2 className="text-xl font-semibold text-slate-800">성적</h2>
            </div>
          </div>
          <div className="p-6 relative overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50/80">
                    <TableHead className="text-center font-semibold text-base text-slate-700">내 점수/만점</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">등급</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">평균</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">상위 30% 컷오프</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">최고점</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-blue-50/30">
                    <TableCell className="text-center font-bold text-2xl text-blue-600 py-6">
                      <span>{results.total.score}/{results.total.maxScore}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full text-blue-700 font-bold text-xl">
                        {results.total.grade}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xl">{results.total.average}</TableCell>
                    <TableCell className="text-center text-xl">{results.total.top30Score}</TableCell>
                    <TableCell className="text-center text-xl">
                      {results.total.highestScore}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-700" />
              <h2 className="text-xl font-semibold text-slate-800">영역별 성취도</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" /> S: 100%
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                A: 80~99%
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                B: 60~79%
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                C: ~59%
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50/80">
                    <TableHead className="font-semibold text-base text-slate-700">영역구분</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">배점</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">득점</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">성취도</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">평균</TableHead>
                    <TableHead className="text-center font-semibold text-base text-slate-700">상위30%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.sections.map((section, index) => {
                    const achievementGrade = getAchievementGrade(section.percentage);
                    const gradeColor = getGradeColor(achievementGrade);
                    return <TableRow key={index} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                      <TableCell className="font-medium text-base text-slate-700">{section.name}</TableCell>
                      <TableCell className="text-center text-lg">{section.maxScore}</TableCell>
                      <TableCell className="text-center text-lg font-semibold">{section.score}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${gradeColor}`}>
                          {achievementGrade}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-lg">{section.average}</TableCell>
                      <TableCell className="text-center text-lg">{section.top30}</TableCell>
                    </TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                영역별 분석
                <span className="text-xs font-normal text-slate-500">(단위: %)</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{
                        fill: '#475569',
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    />
                    <Radar 
                      name="점수" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.4} 
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                점수 비교
                <span className="text-xs font-normal text-slate-500">(단위: 점)</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{
                        fill: '#475569',
                        fontSize: 13,
                        fontWeight: 500
                      }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{
                        fill: '#475569',
                        fontSize: 13,
                        fontWeight: 500
                      }} 
                    />
                    <Tooltip 
                      contentStyle={{
                        fontSize: '14px',
                        fontWeight: 500,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar 
                      name="응시자 평균"
                      dataKey="average" 
                      fill="#94A3B8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      name="내 점수"
                      dataKey="score" 
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-slate-800">오답률 TOP3</h3>
            </div>
            <div className="p-6">
              <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-sm whitespace-nowrap text-slate-700">문항</TableHead>
                      <TableHead className="font-semibold text-sm whitespace-nowrap text-slate-700">정답여부</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {results.total.wrongAnswerTop3.map((item, index) => (
                    <TableRow key={index} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {item.questionNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.isCorrect ? (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                            O
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600 font-bold text-lg">
                            X
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-slate-800">문항별 채점 결과</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {Array.from({
                length: 45
              }, (_, i) => i + 1).map(questionNumber => {
                const studentAnswer = studentAnswers[questionNumber]?.answer;
                const correctAnswer = correctAnswers[questionNumber]?.answer;
                const isCorrect = studentAnswer === correctAnswer;
                
                return (
                  <div 
                    key={questionNumber} 
                    className={`p-2 rounded-lg border ${
                      isCorrect 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium">{questionNumber}</span>
                    </div>
                    <div className="text-center space-y-1">
                      {isCorrect ? (
                        <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                          O
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                          X
                        </div>
                      )}
                      <div className="text-xs space-y-1">
                        <div className={`px-1.5 py-0.5 rounded-full text-center ${isCorrect ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          선택: {studentAnswer || '-'}
                        </div>
                        <div className="px-1.5 py-0.5 rounded-full text-center bg-slate-100 text-slate-700">
                          정답: {correctAnswer || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TestReport;
