import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Clock, BookOpen, Target, LogOut, Award, TrendingUp } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";

interface StudentData {
  id: string;
  name: string;
  class_id: string;
  class_name: string;
  access_code: string;
}

interface StudentStats {
  totalWords: number;
  completedAssignments: number;
  averageScore: number;
  totalStudyTime: number;
  loginCount: number;
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    totalWords: 0,
    completedAssignments: 0,
    averageScore: 0,
    totalStudyTime: 0,
    loginCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if student is logged in
    const storedData = sessionStorage.getItem('studentData');
    if (!storedData) {
      navigate('/student-login');
      return;
    }
    
    const student = JSON.parse(storedData);
    setStudentData(student);
    fetchStudentStats(student);
    
    // Update login count
    updateLoginCount();
  }, [navigate]);

  const fetchStudentStats = async (student: StudentData) => {
    try {
      // Fetch completed assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('card_assignments')
        .select('score, card_sets(word_data)')
        .or(`student_id.eq.${student.id},class_id.eq.${student.class_id}`)
        .eq('completed', true);

      if (assignmentError) throw assignmentError;

      // Calculate stats
      const completedAssignments = assignments?.length || 0;
      const scores = assignments?.filter(a => a.score !== null).map(a => a.score as number) || [];
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      // Calculate total words studied
      const totalWords = assignments?.reduce((total, assignment) => {
        const wordData = assignment.card_sets?.word_data;
        if (Array.isArray(wordData)) {
          return total + wordData.length;
        }
        return total;
      }, 0) || 0;

      // Get stored usage data
      const storedUsageTime = localStorage.getItem(`usage_time_${student.id}`) || '0';
      const storedLoginCount = localStorage.getItem(`login_count_${student.id}`) || '0';

      setStats({
        totalWords,
        completedAssignments,
        averageScore: Math.round(averageScore * 10) / 10,
        totalStudyTime: parseInt(storedUsageTime),
        loginCount: parseInt(storedLoginCount)
      });

    } catch (error) {
      console.error('Error fetching student stats:', error);
      toast({
        title: "오류",
        description: "통계를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLoginCount = () => {
    if (!studentData) return;
    
    const loginCountKey = `login_count_${studentData.id}`;
    const currentCount = parseInt(localStorage.getItem(loginCountKey) || '0');
    const lastLoginDate = localStorage.getItem(`last_login_${studentData.id}`);
    const today = new Date().toDateString();
    
    // Only increment if it's a new day
    if (lastLoginDate !== today) {
      localStorage.setItem(loginCountKey, (currentCount + 1).toString());
      localStorage.setItem(`last_login_${studentData.id}`, today);
    }
  };

  const handleLogout = () => {
    if (!studentData) return;
    
    // Save logout time for session duration calculation
    const sessionStart = localStorage.getItem(`session_start_${studentData.id}`);
    if (sessionStart) {
      const sessionDuration = Date.now() - parseInt(sessionStart);
      const currentUsageTime = parseInt(localStorage.getItem(`usage_time_${studentData.id}`) || '0');
      localStorage.setItem(`usage_time_${studentData.id}`, (currentUsageTime + sessionDuration).toString());
    }
    
    // Clear student data
    sessionStorage.removeItem('studentData');
    sessionStorage.removeItem('accessCode');
    sessionStorage.removeItem('user_session_id');
    localStorage.removeItem(`session_start_${studentData.id}`);
    
    toast({
      title: "로그아웃 완료",
      description: "안전하게 로그아웃되었습니다."
    });
    
    navigate('/');
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Set session start time on mount  
  useEffect(() => {
    if (studentData) {
      const sessionStartKey = `session_start_${studentData.id}`;
      if (!localStorage.getItem(sessionStartKey)) {
        localStorage.setItem(sessionStartKey, Date.now().toString());
      }
    }
  }, [studentData]);

  if (loading) {
    return <FullPageLoading message="프로필을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col hide-scrollbar overflow-auto">
      <div className="flex-1 px-2 sm:px-4 py-2 flex flex-col min-h-0 max-w-6xl mx-auto w-full">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/student-dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                내 프로필
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {studentData ? `${studentData.name}님의 학습 프로필` : "학습 프로필"}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-xs sm:text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {/* 기본 정보 카드 */}
        {studentData && (
          <Card className="bg-white/70 backdrop-blur-sm border border-border/30 mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{studentData.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{studentData.class_name}</Badge>
                    <Badge variant="outline" className="text-xs">
                      코드: {studentData.access_code}
                    </Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* 통계 카드들 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-border/30">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground">학습한 단어</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{stats.totalWords}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-border/30">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">완료한 과제</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{stats.completedAssignments}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-border/30">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground">평균 점수</p>
                <p className={`text-lg sm:text-xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore > 0 ? `${stats.averageScore}점` : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-border/30">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <p className="text-xs text-muted-foreground">누적 학습</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {formatTime(stats.totalStudyTime)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 통계 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                학습 활동
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">총 로그인 횟수</span>
                <span className="font-semibold">{stats.loginCount}회</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">앱 사용 시간</span>
                <span className="font-semibold">{formatTime(stats.totalStudyTime)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">완료율</span>
                <span className="font-semibold">
                  {stats.totalWords > 0 
                    ? `${Math.round((stats.completedAssignments / (stats.completedAssignments + 1)) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="w-5 h-5 text-purple-500" />
                성취도
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">평균 점수</span>
                <span className={`font-semibold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore > 0 ? `${stats.averageScore}점` : '아직 없음'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">학습한 단어</span>
                <span className="font-semibold">{stats.totalWords}개</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">완료한 과제</span>
                <span className="font-semibold">{stats.completedAssignments}개</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="mt-6">
          <Link to="/student-assignments">
            <Button variant="outline" className="w-full">
              <Target className="w-4 h-4 mr-2" />
              내 과제 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}