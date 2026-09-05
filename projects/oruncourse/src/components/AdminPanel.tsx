import React, { useState } from 'react';
import { Course, GradeType } from '@/types/course';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, BookOpen, TrendingUp } from 'lucide-react';
import ApplicationList from './ApplicationList';

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const { courses, applications, addCourse } = useCourses();
  const { toast } = useToast();
  
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    grade: 'elementary' as GradeType,
    fee: 0,
    schedule: '',
    poster: '',
    instructor: '',
    capacity: 15
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  const handleAddCourse = () => {
    if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.schedule.trim() || !newCourse.instructor.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필수 필드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    addCourse({
      ...newCourse,
      poster: newCourse.poster || `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop`
    });

    toast({
      title: "강의 추가 완료",
      description: "새로운 강의가 추가되었습니다.",
    });

    setIsAddCourseOpen(false);
    setNewCourse({
      title: '',
      description: '',
      grade: 'elementary',
      fee: 0,
      schedule: '',
      poster: '',
      instructor: '',
      capacity: 15
    });
  };

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolled, 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <h2 className="text-4xl font-bold text-gradient">관리자 패널</h2>
        <p className="text-xl text-muted-foreground">강의 관리 및 신청자 현황을 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">총 강의 수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEnrolled}</p>
                <p className="text-sm text-muted-foreground">총 수강생</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalApplications}</p>
                <p className="text-sm text-muted-foreground">총 신청 건수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingApplications}</p>
                <p className="text-sm text-muted-foreground">대기 중</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 강의 추가 버튼 */}
      <div className="flex justify-center">
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="px-8">
              <Plus className="w-5 h-5 mr-2" />
              새 강의 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 강의 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">강의명 *</Label>
                  <Input
                    id="title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    placeholder="예: 초등 수학 기초반"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">학년 *</Label>
                  <Select value={newCourse.grade} onValueChange={(value: GradeType) => setNewCourse({...newCourse, grade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">초등부</SelectItem>
                      <SelectItem value="middle">중등부</SelectItem>
                      <SelectItem value="high">고등부</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">강의 설명 *</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="강의에 대한 자세한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">강사명 *</Label>
                  <Input
                    id="instructor"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                    placeholder="예: 김선생님"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">수업 시간 *</Label>
                  <Input
                    id="schedule"
                    value={newCourse.schedule}
                    onChange={(e) => setNewCourse({...newCourse, schedule: e.target.value})}
                    placeholder="예: 월, 수, 금 16:00-17:30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee">수강료 (원) *</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={newCourse.fee}
                    onChange={(e) => setNewCourse({...newCourse, fee: Number(e.target.value)})}
                    placeholder="예: 150000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">수강 정원 *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({...newCourse, capacity: Number(e.target.value)})}
                    placeholder="예: 15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poster">포스터 이미지</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const { supabase } = await import('@/integrations/supabase/client');
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${Date.now()}.${fileExt}`;
                          
                          const { data, error } = await supabase.storage
                            .from('course-images')
                            .upload(fileName, file);
                          
                          if (error) {
                            toast({
                              title: "업로드 실패",
                              description: error.message,
                              variant: "destructive"
                            });
                          } else {
                            const { data: { publicUrl } } = supabase.storage
                              .from('course-images')
                              .getPublicUrl(fileName);
                            setNewCourse({...newCourse, poster: publicUrl});
                            toast({
                              title: "업로드 완료",
                              description: "이미지가 성공적으로 업로드되었습니다."
                            });
                          }
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    또는
                  </div>
                  <Input
                    placeholder="이미지 URL을 직접 입력하세요"
                    value={newCourse.poster}
                    onChange={(e) => setNewCourse({...newCourse, poster: e.target.value})}
                  />
                </div>
                {newCourse.poster && (
                  <div className="mt-3">
                    <img 
                      src={newCourse.poster} 
                      alt="미리보기" 
                      className="w-32 h-24 object-cover rounded-lg border border-border/50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleAddCourse} className="w-full" size="lg">
                강의 추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 신청자 목록 */}
      <ApplicationList />
    </div>
  );
};

export default AdminPanel;