import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CardSetGrid } from "@/components/CardSetGrid";
import { BookOpen, Clock, Target, LogOut, User, Users, Heart, Library, ClipboardList, GraduationCap } from "lucide-react";

interface Assignment {
  id: string;
  assignment_type: string;
  assigned_at: string;
  due_date: string | null;
  completed: boolean;
  score: number | null;
  class_id: string | null;
  card_sets: {
    id: string;
    title: string;
    description: string | null;
    test_type: string;
    word_data: any;
    selected_days: string[];
  } | null;
}

interface StudentData {
  id: string;
  name: string;
  class_id: string;
  class_name: string;
  access_code: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [cardSets, setCardSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Check if student is logged in
      const storedData = sessionStorage.getItem('studentData');
      if (!storedData) {
        navigate('/student-login');
        return;
      }
      const student = JSON.parse(storedData);
      setStudentData(student);
      await fetchAssignments(student);
      await fetchCardSets();
    };
    loadData();
  }, [navigate]);

  const fetchAssignments = async (student: StudentData) => {
    try {
      console.log('Fetching assignments for student:', student);
      
      // Fetch individual assignments and class assignments
      const { data: assignmentData, error } = await supabase
        .from('card_assignments')
        .select(`
          *,
          card_sets(
            id,
            title,
            description,
            test_type,
            word_data,
            selected_days
          )
        `)
        .or(`student_id.eq.${student.id},class_id.eq.${student.class_id}`)
        .order('assigned_at', { ascending: false });

      console.log('Assignment query result:', { data: assignmentData, error });
      if (error) throw error;
      setAssignments(assignmentData as any || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "오류",
        description: "과제를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCardSets = async () => {
    try {
      const { data, error } = await supabase
        .from('card_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get assigned card set IDs to exclude them from the general list
      const assignedCardSetIds = assignments
        .map(assignment => assignment.card_sets?.id)
        .filter(id => id !== undefined);

      // Transform data and filter out assigned card sets
      const transformedCardSets = data?.map(cardSet => ({
        id: cardSet.id,
        title: cardSet.title,
        description: cardSet.description,
        imageUrl: cardSet.image_url,
        cards: Array.isArray(cardSet.word_data) ? cardSet.word_data.map((word: any) => ({
          ...word,
          correctCount: 0,
          incorrectCount: 0
        })) : [],
        testType: cardSet.test_type
      })).filter(cardSet => !assignedCardSetIds.includes(cardSet.id)) || [];

      setCardSets(transformedCardSets);
    } catch (error) {
      console.error('Error fetching card sets:', error);
      toast({
        title: "오류",
        description: "단어장을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };


  const handleLogout = () => {
    // Clear student data from sessionStorage
    sessionStorage.removeItem('studentData');
    sessionStorage.removeItem('accessCode');
    sessionStorage.removeItem('user_session_id');
    toast({
      title: "로그아웃 완료",
      description: "안전하게 로그아웃되었습니다.",
    });
    navigate('/');
  };

  const handleStartAssignment = (assignment: Assignment) => {
    // Store assignment data for study session
    localStorage.setItem('currentAssignment', JSON.stringify(assignment));
    navigate(`/study-assignment/${assignment.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssignmentTypeIcon = (type: string) => {
    return type === 'individual' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  const getAssignmentTypeName = (type: string) => {
    return type === 'individual' ? '개인 과제' : '반 과제';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">과제를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col hide-scrollbar overflow-auto">
      {/* Clean main content */}
      <main className="flex-1 px-6 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Clean Header Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {studentData?.name}님
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  {studentData?.class_name} • {studentData?.access_code}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">총 과제</p>
            <p className="text-2xl font-semibold text-slate-900">{assignments.length}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">완료</p>
            <p className="text-2xl font-semibold text-slate-900">{assignments.filter(a => a.completed).length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">진행중</p>
            <p className="text-2xl font-semibold text-slate-900">{assignments.filter(a => !a.completed).length}</p>
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignments Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">내 과제</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {assignments.length}개
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">과제가 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getAssignmentTypeIcon(assignment.assignment_type)}
                            <div>
                              <h3 className="font-medium text-slate-900">
                                {assignment.card_sets?.title || "제목 없음"}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {getAssignmentTypeName(assignment.assignment_type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignment.completed ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                완료
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                진행 중
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                          <span>배정일: {formatDate(assignment.assigned_at)}</span>
                          {assignment.due_date && (
                            <span>마감일: {formatDate(assignment.due_date)}</span>
                          )}
                        </div>
                        
                        {!assignment.completed && (
                          <Button 
                            onClick={() => handleStartAssignment(assignment)}
                            className="w-full"
                          >
                            과제 시작하기
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">빠른 메뉴</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => navigate('/student-assignments')}
                >
                  <BookOpen className="w-4 h-4" />
                  모든 과제 보기
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => navigate('/student-profile')}
                >
                  <User className="w-4 h-4" />
                  프로필 설정
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">최근 활동</h3>
              <div className="space-y-3">
                {assignments.filter(a => a.completed).slice(0, 3).map(assignment => (
                  <div key={assignment.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {assignment.card_sets?.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        {assignment.score ? `점수: ${assignment.score}점` : '완료'}
                      </p>
                    </div>
                  </div>
                ))}
                {assignments.filter(a => a.completed).length === 0 && (
                  <p className="text-sm text-slate-600 text-center py-4">
                    완료된 과제가 없습니다
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Study Sets */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Library className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">공개 단어장</h2>
              <Badge variant="secondary" className="ml-auto">
                {cardSets.length}개
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            {cardSets.length === 0 ? (
              <div className="text-center py-12">
                <Library className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">공개 단어장이 없습니다</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <CardSetGrid
                  cardSets={cardSets}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}