import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trophy, BookOpen, Calendar, TrendingUp, Users, Target, Trash2 } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
interface StudentStats {
  user_session_id: string;
  student_name: string;
  word_count: number;
  last_study_date: string;
  recent_words: string[];
}
export default function Analytics() {
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [topStudents, setTopStudents] = useState<StudentStats[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // 학생별 시험 결과 통계 가져오기
      const {
        data: testResults,
        error
      } = await supabase.from('test_results').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      // 시험 액세스 코드와 시험 정보 가져오기
      const { data: examAccessCodes } = await supabase
        .from('student_access_codes')
        .select('access_code, exam_code');

      // 액세스 코드로 시험코드 매핑 생성
      const accessCodeToName = new Map<string, string>();
      examAccessCodes?.forEach(item => {
        if (item.exam_code) {
          accessCodeToName.set(item.access_code, item.exam_code);
        }
      });

      // test_id별로 통계 집계
      const statsMap = new Map<string, StudentStats>();
      testResults?.forEach(entry => {
        const testId = entry.test_id;
        if (!statsMap.has(testId)) {
          const studentName = entry.student_name || `응시자 ${testId.slice(0, 8)}`;
          
          statsMap.set(testId, {
            user_session_id: testId,
            student_name: studentName,
            word_count: 0,
            last_study_date: entry.created_at,
            recent_words: []
          });
        }
        const stats = statsMap.get(testId)!;
        stats.word_count += entry.correct_count || 0;

        // 더 최근 날짜로 업데이트
        if (new Date(entry.created_at) > new Date(stats.last_study_date)) {
          stats.last_study_date = entry.created_at;
        }
      });
      const allStudentStats = Array.from(statsMap.values()).sort((a, b) => b.word_count - a.word_count);
      setStudentStats(allStudentStats);
      setTopStudents(allStudentStats.slice(0, 10));
      setTotalWords(testResults?.reduce((sum, result) => sum + (result.correct_count || 0), 0) || 0);
      setTotalStudents(allStudentStats.length);
    } catch (error) {
      console.error('Error in fetchAnalyticsData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudentRecords = async (testId: string, studentName: string) => {
    try {
      const { error } = await supabase
        .from('test_results')
        .delete()
        .eq('test_id', testId);

      if (error) {
        console.error('Error deleting records:', error);
        toast.error('기록 삭제에 실패했습니다.');
        return;
      }

      toast.success(`${studentName}의 시험 기록이 삭제되었습니다.`);
      // 데이터 다시 불러오기
      fetchAnalyticsData();
    } catch (error) {
      console.error('Error in handleDeleteStudentRecords:', error);
      toast.error('기록 삭제 중 오류가 발생했습니다.');
    }
  };
  if (loading) {
    return <div className="container mx-auto p-6">
        <FullPageLoading message="통계 데이터를 불러오는 중..." />
      </div>;
  }
  return <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          학습 통계
        </h1>
        <p className="text-lg text-muted-foreground">
          학생들의 단어 학습 현황과 성과를 한눈에 확인하세요
        </p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glassmorphism border border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-900">
            <CardTitle className="text-sm font-medium text-white">총 학습 단어</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="bg-slate-900">
            <div className="text-2xl font-bold text-white">{totalWords.toLocaleString()}</div>
            <p className="text-xs text-white">전체 누적</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border border-secondary/10 hover:border-secondary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-900">
            <CardTitle className="text-sm font-medium text-white">학습 중 학생</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent className="bg-slate-900">
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <p className="text-xs text-white">활성 학습자</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border border-accent/10 hover:border-accent/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-900">
            <CardTitle className="text-sm font-medium text-white">평균 학습량</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="bg-slate-900">
            <div className="text-2xl font-bold text-white">
              {totalStudents > 0 ? Math.round(totalWords / totalStudents) : 0}
            </div>
            <p className="text-xs text-white">학생당 단어 수</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border border-orange-200/10 hover:border-orange-300/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-900">
            <CardTitle className="text-sm font-medium text-white">최고 학습량</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="bg-slate-900">
            <div className="text-2xl font-bold text-white">
              {topStudents[0]?.word_count || 0}
            </div>
            <p className="text-xs text-white">최다 학습 단어</p>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 학생 랭킹 */}
      <Card className="glassmorphism border border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 우수 학습자
          </CardTitle>
          <CardDescription className="text-white">
            가장 많은 단어를 학습한 학생들의 순위입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStudents.map((student, index) => <div key={student.user_session_id} className="flex items-center justify-between p-4 rounded-xl border border-muted/40 transition-all duration-300 bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-foreground ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-muted'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{student.student_name}</div>
                    <div className="text-sm text-white">
                      최근 학습: {format(new Date(student.last_study_date), 'yyyy년 MM월 dd일', {
                    locale: ko
                  })}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg font-bold">
                    {student.word_count}개
                  </Badge>
                  <div className="text-xs text-white mt-1">
                    학습 단어
                  </div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* 전체 학생 목록 */}
      <Card className="glassmorphism border border-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-primary" />
            전체 학습 현황
          </CardTitle>
          <CardDescription className="text-white">
            모든 학생들의 누적 학습 단어량과 최근 학습일을 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentStats.map(student => <div key={student.user_session_id} className="p-4 rounded-xl border border-muted/20 transition-all duration-300 bg-slate-900">
                <div className="flex items-center justify-between mb-3 bg-slate-900">
                  <h3 className="font-semibold truncate text-white">{student.student_name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{student.word_count}개</Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>학습 기록 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            {student.student_name}의 모든 학습 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteStudentRecords(student.user_session_id, student.student_name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-white mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(student.last_study_date), 'MM월 dd일', {
                  locale: ko
                })}
                  </span>
                </div>

                {student.recent_words.length > 0 && <div className="mt-3">
                    <p className="text-xs mb-1 text-white">최근 학습 단어:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.recent_words.slice(0, 3).map((word, index) => <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                          {word}
                        </span>)}
                    </div>
                  </div>}
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}