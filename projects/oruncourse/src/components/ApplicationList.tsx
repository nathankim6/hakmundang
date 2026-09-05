import React, { useState } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import { Application } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Check, Clock, Pause, Phone, User, BookOpen } from 'lucide-react';

const ApplicationList: React.FC = () => {
  const { courses, applications, updateApplicationStatus } = useCourses();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const filteredApplications = applications.filter(app => {
    const course = courses.find(c => c.id === app.courseId);
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.parentPhone.includes(searchTerm) ||
                         app.studentSchool.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || app.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // 강의별로 신청자 그룹화
  const applicationsByCourse = courses.reduce((acc, course) => {
    const courseApplications = filteredApplications.filter(app => app.courseId === course.id);
    if (courseApplications.length > 0) {
      acc[course.id] = {
        course,
        applications: courseApplications
      };
    }
    return acc;
  }, {} as Record<string, { course: any; applications: Application[] }>);

  const handleStatusUpdate = (applicationId: string, status: Application['status']) => {
    updateApplicationStatus(applicationId, status);
    const statusText = {
      approved: '승인',
      on_hold: '취소',
      pending: '대기'
    };
    toast({
      title: "상태 업데이트",
      description: `신청이 ${statusText[status]}되었습니다.`,
    });
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-white border-success">승인</Badge>;
      case 'on_hold':
        return <Badge className="bg-destructive text-white border-destructive">취소</Badge>;
      case 'pending':
        return <Badge className="bg-muted text-muted-foreground border-muted">대기</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const getStatusButtons = (application: Application) => (
    <div className="flex flex-wrap gap-2 md:space-x-2 md:gap-0">
      <Button
        size="sm"
        variant={application.status === 'approved' ? 'success' : 'outline'}
        onClick={() => handleStatusUpdate(application.id, 'approved')}
        className="flex items-center gap-1 flex-1 md:flex-none min-h-[44px] md:min-h-0"
      >
        <Check className="w-4 h-4" />
        승인
      </Button>
      <Button
        size="sm"
        variant={application.status === 'on_hold' ? 'destructive' : 'outline'}
        onClick={() => handleStatusUpdate(application.id, 'on_hold')}
        className="flex items-center gap-1 flex-1 md:flex-none min-h-[44px] md:min-h-0"
      >
        <Pause className="w-4 h-4" />
        취소
      </Button>
      <Button
        size="sm"
        variant={application.status === 'pending' ? 'default' : 'outline'}
        onClick={() => handleStatusUpdate(application.id, 'pending')}
        className="flex items-center gap-1 flex-1 md:flex-none min-h-[44px] md:min-h-0"
      >
        <Clock className="w-4 h-4" />
        대기
      </Button>
    </div>
  );

  console.log('Applications data:', applications);
  console.log('Filtered applications:', filteredApplications);
  console.log('Applications by course:', applicationsByCourse);

  return (
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>수강 신청자 관리</span>
          <Badge variant="secondary" className="ml-2">{applications.length}건</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 검색 및 필터 */}
        <div className="flex flex-col gap-3 md:flex-row md:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="학생명, 학교명, 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 md:h-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-64 h-12 md:h-10">
              <SelectValue placeholder="강의 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 강의</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 강의별 신청자 목록 */}
        <div className="space-y-6">
          {Object.keys(applicationsByCourse).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || selectedCourse !== 'all' ? '검색 결과가 없습니다.' : '신청자가 없습니다.'}
              </p>
            </div>
          ) : (
            Object.values(applicationsByCourse).map(({ course, applications }) => (
              <Card key={course.id} className="border border-border/50">
                <CardHeader className="pb-4 bg-gradient-subtle border-b border-border/20">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">강의 신청 현황</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                      {applications.length}명 신청
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {applications.map(application => (
                    <div
                      key={application.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-secondary/5 rounded-lg border border-border/30 space-y-3 md:space-y-0"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{application.studentName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{application.parentPhone}</span>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{application.studentSchool} {application.studentGrade}</span>
                          <span>신청일: {application.appliedAt.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {getStatusButtons(application)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationList;