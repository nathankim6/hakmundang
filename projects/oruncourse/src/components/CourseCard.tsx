import React, { useState } from 'react';
import { Course, gradeLabels, gradeColors } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Users, Clock, DollarSign, GraduationCap, Expand, Upload } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { isAdmin } = useAuth();
  const { addApplication, deleteCourse, updateCourse } = useCourses();
  const { toast } = useToast();
  
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  
  // 수정용 상태
  const [editData, setEditData] = useState({
    title: course.title,
    description: course.description,
    fee: course.fee,
    schedule: course.schedule,
    instructor: course.instructor,
    capacity: course.capacity,
    poster: course.poster,
    applicationEndDate: course.applicationEndDate ? new Date(course.applicationEndDate).toISOString().slice(0, 10) : ''
  });
  
  const [isUploading, setIsUploading] = useState(false);

  const handleApply = () => {
    if (!studentName.trim() || !studentSchool.trim() || !studentGrade.trim() || !parentPhone.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (course.enrolled >= course.capacity) {
      toast({
        title: "신청 불가",
        description: "수강 정원이 마감되었습니다.",
        variant: "destructive"
      });
      return;
    }

    if (!isApplicationOpen) {
      toast({
        title: "신청 불가",
        description: "신청 기간이 마감되었습니다.",
        variant: "destructive"
      });
      return;
    }

    addApplication({
      courseId: course.id,
      studentName: studentName.trim(),
      studentSchool: studentSchool.trim(),
      studentGrade: studentGrade.trim(),
      parentPhone: parentPhone.trim()
    });

    toast({
      title: "신청 완료",
      description: `${course.title} 수강신청이 완료되었습니다.`,
    });

    setIsApplyOpen(false);
    setStudentName('');
    setStudentSchool('');
    setStudentGrade('');
    setParentPhone('');
  };

  const handleEdit = () => {
    const updateData: Partial<Course> = {
      title: editData.title,
      description: editData.description,
      fee: editData.fee,
      schedule: editData.schedule,
      instructor: editData.instructor,
      capacity: editData.capacity,
      poster: editData.poster
    };

    if (editData.applicationEndDate) {
      updateData.applicationEndDate = new Date(editData.applicationEndDate);
    }

    updateCourse(course.id, updateData);
    toast({
      title: "수정 완료",
      description: "강의 정보가 수정되었습니다.",
    });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (confirm('정말로 이 강의를 삭제하시겠습니까?')) {
      deleteCourse(course.id);
      toast({
        title: "삭제 완료",
        description: "강의가 삭제되었습니다.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast({
        title: "업로드 오류",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive"
      });
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "업로드 오류",
        description: "파일 크기는 5MB 이하여야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `course-posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      const newEditData = { ...editData, poster: publicUrl };
      setEditData(newEditData);

      // 자동으로 저장
      updateCourse(course.id, { poster: publicUrl });

      toast({
        title: "이미지 저장 완료",
        description: "이미지가 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "업로드 오류",
        description: "이미지 업로드에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const now = new Date();
  const isFullyBooked = course.enrolled >= course.capacity;
  const isApplicationClosed = course.applicationEndDate ? new Date(course.applicationEndDate) < now : false;
  const isApplicationOpen = !isApplicationClosed;
  const gradeVariant = gradeColors[course.grade] as "elementary" | "middle" | "high";

  return (
    <Card className="group h-full bg-card shadow-card hover:shadow-floating transition-all duration-500 rounded-2xl sm:rounded-3xl border border-border/50 hover:border-primary/20 overflow-hidden">
      <CardContent className="p-0 h-full">
        <div className="flex flex-col h-full">
          {/* 포스터 이미지 - A4 비율 */}
          <div className="relative">
            <div 
              className="relative cursor-pointer group/image overflow-hidden"
              style={{ aspectRatio: '1 / 1.414' }}
              onClick={() => setIsImageOpen(true)}
            >
              <img 
                src={editData.poster || course.poster} 
                alt={course.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              {/* 마감된 경우 오버레이 */}
              {(isFullyBooked || isApplicationClosed) ? (
                <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="border-2 sm:border-3 md:border-4 border-white px-6 sm:px-8 md:px-12 py-2 sm:py-4 md:py-6">
                      <div className="text-white font-black text-xl sm:text-3xl md:text-4xl tracking-wider drop-shadow-2xl">
                        CLOSED
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                  <div className="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transform scale-75 group-hover/image:scale-100 transition-all duration-500">
                    <Expand className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Grade badge */}
            <div className="absolute top-2 sm:top-2 md:top-3 left-2 sm:left-2 md:left-3">
              <div className={`
                px-2 sm:px-2 md:px-2.5 py-1 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold backdrop-blur-md
                transition-all duration-300 hover:scale-105 shadow-card
                ${getGradeBadgeStyle(course.grade)}
              `}>
                <span>{gradeLabels[course.grade]}</span>
              </div>
            </div>
            
            {/* Status badge */}
            {(isFullyBooked || isApplicationClosed) && (
              <div className="absolute top-2 sm:top-2 md:top-3 right-2 sm:right-2 md:right-3">
                <div className="px-2 sm:px-2 md:px-2.5 py-1 sm:py-1 rounded-full bg-destructive text-destructive-foreground backdrop-blur-md text-[10px] sm:text-xs md:text-sm font-semibold shadow-card flex items-center gap-1 sm:gap-1 md:gap-1.5">
                  <div className="w-1.5 sm:w-1.5 md:w-2 h-1.5 sm:h-1.5 md:h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
                  마감
                </div>
              </div>
            )}
            
            {/* Available badge */}
            {!isFullyBooked && isApplicationOpen && (
              <div className="absolute top-2 sm:top-2 md:top-3 right-2 sm:right-2 md:right-3">
                <div className="px-2 sm:px-2 md:px-2.5 py-1 sm:py-1 rounded-full bg-success text-success-foreground backdrop-blur-md text-[10px] sm:text-xs md:text-sm font-semibold shadow-card flex items-center gap-1 sm:gap-1 md:gap-1.5">
                  <div className="w-1.5 sm:w-1.5 md:w-2 h-1.5 sm:h-1.5 md:h-2 bg-success-foreground rounded-full animate-pulse"></div>
                  신청가능
                </div>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-between flex-1">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xs leading-tight sm:text-base md:text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">{course.title}</h3>
                {isAdmin && (
                  <div className="flex space-x-2 ml-4">
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-muted transition-colors">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                           <DialogTitle>강의 수정</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-6 pt-4">
                           <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <Label htmlFor="edit-title">강의명 *</Label>
                               <Input
                                 id="edit-title"
                                 value={editData.title}
                                 onChange={(e) => setEditData({...editData, title: e.target.value})}
                                 placeholder="예: 초등 수학 기초반"
                               />
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="edit-grade">학년 *</Label>
                               <select
                                 id="edit-grade"
                                 value={course.grade}
                                 disabled
                                 className="w-full p-2 border border-input rounded-md bg-muted text-muted-foreground"
                               >
                                 <option value="elementary">초등부</option>
                                 <option value="middle">중등부</option>
                                 <option value="high">고등부</option>
                               </select>
                             </div>
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor="edit-description">강의 설명 *</Label>
                             <Textarea
                               id="edit-description"
                               value={editData.description}
                               onChange={(e) => setEditData({...editData, description: e.target.value})}
                               placeholder="강의에 대한 자세한 설명을 입력하세요"
                               rows={3}
                             />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <Label htmlFor="edit-instructor">강사명 *</Label>
                               <Input
                                 id="edit-instructor"
                                 value={editData.instructor}
                                 onChange={(e) => setEditData({...editData, instructor: e.target.value})}
                                 placeholder="예: 김선생님"
                               />
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="edit-schedule">수업 시간 *</Label>
                               <Input
                                 id="edit-schedule"
                                 value={editData.schedule}
                                 onChange={(e) => setEditData({...editData, schedule: e.target.value})}
                                 placeholder="예: 월, 수, 금 16:00-17:30"
                               />
                             </div>
                           </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-fee">수강료 (원) *</Label>
                                <Input
                                  id="edit-fee"
                                  type="number"
                                  value={editData.fee}
                                  onChange={(e) => setEditData({...editData, fee: Number(e.target.value)})}
                                  placeholder="예: 150000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-capacity">수강 정원 *</Label>
                                <Input
                                  id="edit-capacity"
                                  type="number"
                                  value={editData.capacity}
                                  onChange={(e) => setEditData({...editData, capacity: Number(e.target.value)})}
                                  placeholder="예: 15"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-application-end">신청 마감일</Label>
                              <Input
                                id="edit-application-end"
                                type="date"
                                value={editData.applicationEndDate}
                                onChange={(e) => setEditData({...editData, applicationEndDate: e.target.value})}
                              />
                            </div>

                           <div className="space-y-2">
                             <Label htmlFor="edit-poster">포스터 이미지</Label>
                             <div className="space-y-3">
                               <div className="flex items-center space-x-4">
                                 <input
                                   type="file"
                                   accept="image/*"
                                   onChange={handleFileUpload}
                                   disabled={isUploading}
                                   className="flex-1 p-2 border border-input rounded-md"
                                 />
                               </div>
                               <div className="text-center text-sm text-muted-foreground">
                                 또는
                               </div>
                               <Input
                                 placeholder="이미지 URL을 직접 입력하세요"
                                 value={editData.poster}
                                 onChange={(e) => setEditData({...editData, poster: e.target.value})}
                               />
                             </div>
                             {editData.poster && (
                               <div className="mt-3">
                                 <img 
                                   src={editData.poster} 
                                   alt="미리보기" 
                                   className="w-32 h-24 object-cover rounded-lg border border-border/50"
                                   onError={(e) => {
                                     e.currentTarget.style.display = 'none';
                                   }}
                                 />
                               </div>
                             )}
                           </div>

                           <Button onClick={handleEdit} className="w-full" size="lg">
                             수정하기
                           </Button>
                         </div>
                       </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight line-clamp-2 sm:line-clamp-3">{course.description}</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <DollarSign className="w-3 sm:w-3 md:w-3.5 h-3 sm:h-3 md:h-3.5 text-muted-foreground" />
                    <span className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground">수강료</span>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">{course.fee.toLocaleString()}원</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <Clock className="w-3 sm:w-3 md:w-3.5 h-3 sm:h-3 md:h-3.5 text-muted-foreground" />
                    <span className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground">시간</span>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground line-clamp-2">{course.schedule}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <GraduationCap className="w-3 sm:w-3 md:w-3.5 h-3 sm:h-3 md:h-3.5 text-muted-foreground" />
                    <span className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground">강사</span>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">{course.instructor}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <Users className="w-3 sm:w-3 md:w-3.5 h-3 sm:h-3 md:h-3.5 text-muted-foreground" />
                    <span className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground">인원</span>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">
                    {course.capacity}명
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-border/50">
              <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="w-full font-semibold rounded-full text-xs sm:text-sm md:text-base py-3 sm:py-4"
                    disabled={!isApplicationOpen || isFullyBooked}
                  >
                    {isFullyBooked ? '마감' : 
                     isApplicationClosed ? '마감' : '신청'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>수강 신청</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 md:space-y-6 pt-4">
                    <div className="p-6 bg-secondary rounded-lg">
                      <h4 className="font-semibold text-foreground">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.schedule}</p>
                      <p className="text-lg font-semibold text-foreground">{course.fee.toLocaleString()}원</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentName">학생 이름</Label>
                      <Input
                        id="studentName"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="학생 이름을 입력하세요"
                        className="modern-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentSchool">학교</Label>
                        <Input
                          id="studentSchool"
                          value={studentSchool}
                          onChange={(e) => setStudentSchool(e.target.value)}
                          placeholder="학교명을 입력하세요"
                          className="modern-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentGrade">학년</Label>
                        <Input
                          id="studentGrade"
                          value={studentGrade}
                          onChange={(e) => setStudentGrade(e.target.value)}
                          placeholder="학년을 입력하세요"
                          className="modern-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentPhone">부모님 전화번호</Label>
                      <Input
                        id="parentPhone"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="modern-input"
                      />
                    </div>
                    <Button onClick={handleApply} className="w-full" size="lg">
                      신청하기
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* 이미지 확대 다이얼로그 */}
        <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <div className="relative">
              <img 
                src={editData.poster || course.poster} 
                alt={course.title}
                className="w-full h-auto object-contain rounded-lg"
                style={{ maxHeight: '90vh' }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const getGradeBadgeStyle = (grade: string) => {
  switch (grade) {
    case 'elementary':
      return 'bg-education-elementary text-white border-education-elementary';
    case 'middle':
      return 'bg-education-middle text-white border-education-middle';
    case 'high':
      return 'bg-education-high text-white border-education-high';
    default:
      return 'bg-primary text-white border-primary';
  }
};

export default CourseCard;