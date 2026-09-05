import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Users, Trophy, TrendingUp, Loader2, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { getExamById, getSubmissionsByExamId, getProblemAccuracy, Exam, ExamSubmission } from '@/lib/examStorageCloud';
import orunLogo from '@/assets/orun-academy-logo.jpg';

export default function ExamResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [problemAccuracy, setProblemAccuracy] = useState<{ problemId: string; problemNumber: number; korean: string; correctCount: number; totalCount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'participants' | 'problems'>('participants');

  useEffect(() => {
    const loadData = async () => {
      if (!examId) return;
      
      setIsLoading(true);
      
      const loadedExam = await getExamById(examId);
      if (loadedExam) {
        setExam(loadedExam);
        const loadedSubmissions = await getSubmissionsByExamId(examId);
        setSubmissions(loadedSubmissions);
        
        const accuracy = await getProblemAccuracy(examId);
        setProblemAccuracy(accuracy);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [examId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAverageScore = () => {
    if (submissions.length === 0) return 0;
    const total = submissions.reduce((sum, s) => sum + s.score, 0);
    return Math.round((total / submissions.length) * 10) / 10;
  };

  const getHighestScore = () => {
    if (submissions.length === 0) return 0;
    return Math.max(...submissions.map(s => s.score));
  };

  const getTotalProblems = () => {
    if (submissions.length === 0) return exam?.problems?.length || 0;
    return submissions[0].total_problems;
  };

  const exportToCSV = () => {
    if (!exam || submissions.length === 0) return;
    
    const headers = ['순위', '이름', '소속', '점수', '총점', '백분율', '제출시간'];
    const rows = submissions.map((s, index) => [
      index + 1,
      s.participant_name,
      s.affiliation || '-',
      s.score,
      s.total_problems,
      Math.round((s.score / s.total_problems) * 100) + '%',
      formatDate(s.submitted_at),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exam.title}_결과.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">결과를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">시험을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/exam/list')}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 bg-white shadow-lg shadow-primary/5">
                  <img src={orunLogo} alt="ORUN Academy Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">{exam.title}</h1>
                  <p className="text-sm text-muted-foreground">시험 결과 분석</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={exportToCSV} disabled={submissions.length === 0} className="rounded-xl">
              <Download className="w-4 h-4 mr-1" />
              CSV 내보내기
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 참여자</p>
                <p className="text-2xl font-bold">{submissions.length}명</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평균 점수</p>
                <p className="text-2xl font-bold">
                  {getAverageScore()} / {getTotalProblems()}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">최고 점수</p>
                <p className="text-2xl font-bold">
                  {getHighestScore()} / {getTotalProblems()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 전환 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'participants' ? 'default' : 'outline'}
            onClick={() => setActiveTab('participants')}
            className="rounded-xl"
          >
            <Users className="w-4 h-4 mr-2" />
            참여자 결과
          </Button>
          <Button
            variant={activeTab === 'problems' ? 'default' : 'outline'}
            onClick={() => setActiveTab('problems')}
            className="rounded-xl"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            문제별 분석
          </Button>
        </div>

        {activeTab === 'participants' ? (
          /* 참여자 결과 테이블 */
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                참여자 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p>아직 참여자가 없습니다.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">순위</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>소속</TableHead>
                      <TableHead className="text-center">점수</TableHead>
                      <TableHead className="text-center">백분율</TableHead>
                      <TableHead>제출 시간</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission, index) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {index === 0 && <span className="text-yellow-500">🥇</span>}
                          {index === 1 && <span className="text-gray-400">🥈</span>}
                          {index === 2 && <span className="text-amber-600">🥉</span>}
                          {index > 2 && (index + 1)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {submission.participant_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.affiliation || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{submission.score}</span> / {submission.total_problems}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold ${
                            (submission.score / submission.total_problems) >= 0.8 
                              ? 'text-green-600' 
                              : (submission.score / submission.total_problems) >= 0.6 
                                ? 'text-yellow-600' 
                                : 'text-red-600'
                          }`}>
                            {Math.round((submission.score / submission.total_problems) * 100)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(submission.submitted_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          /* 문제별 분석 */
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                문제별 정답률
              </CardTitle>
            </CardHeader>
            <CardContent>
              {problemAccuracy.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p>분석할 데이터가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {problemAccuracy.map((problem) => {
                    const accuracy = problem.totalCount > 0 
                      ? Math.round((problem.correctCount / problem.totalCount) * 100) 
                      : 0;
                    
                    return (
                      <div key={problem.problemId} className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {problem.problemNumber}
                            </span>
                            <p className="text-sm leading-relaxed pt-0.5">{problem.korean}</p>
                          </div>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                            accuracy >= 80 
                              ? 'bg-green-100 text-green-700' 
                              : accuracy >= 60 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {accuracy}%
                          </span>
                        </div>
                        <div className="ml-10">
                          <Progress value={accuracy} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {problem.correctCount}명 정답 / {problem.totalCount}명 응시
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
