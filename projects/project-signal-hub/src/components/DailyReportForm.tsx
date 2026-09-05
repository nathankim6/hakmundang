import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useReportStore } from '@/lib/reportStore';
import { useEmployeeStore } from '@/lib/employeeStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Save, 
  Trash2, 
  BookOpen, 
  User, 
  BookMarked, 
  UserCheck, 
  Clock, 
  GraduationCap, 
  Pencil,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeDepartment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DailyReportFormProps {
  employeeId: string;
  onSaved?: () => void;
  onDeleted?: () => void;
}

interface FormValues {
  content: string;
  className?: string;
  absentStudents?: string;
  progressStatus?: string;
  homework?: string;
}

export function DailyReportForm({ employeeId, onSaved, onDeleted }: DailyReportFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const { employees } = useEmployeeStore();
  const { reports, addReport, updateReport, deleteReport, getEmployeeReportForDate, isLoading } = useReportStore();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const employee = employees.find(emp => emp.id === employeeId);
  const dateString = format(date, 'yyyy-MM-dd');
  const existingReport = getEmployeeReportForDate(employeeId, dateString);
  
  const isEducationDepartment = employee?.department === 'elementary' || 
                               employee?.department === 'middle' || 
                               employee?.department === 'high';
  
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      content: existingReport?.content || '',
      className: existingReport?.classContent || '',
      absentStudents: existingReport?.absentStudents || '',
      progressStatus: existingReport?.progressStatus || '',
      homework: existingReport?.homework || ''
    }
  });
  
  useEffect(() => {
    const report = getEmployeeReportForDate(employeeId, dateString);
    setValue('content', report?.content || '');
    if (isEducationDepartment) {
      setValue('className', report?.classContent || '');
      setValue('absentStudents', report?.absentStudents || '');
      setValue('progressStatus', report?.progressStatus || '');
      setValue('homework', report?.homework || '');
    }
  }, [date, employeeId, dateString, setValue, getEmployeeReportForDate, isEducationDepartment]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      const reportData = {
        content: data.content,
        ...(isEducationDepartment && {
          classContent: data.className,
          absentStudents: data.absentStudents,
          progressStatus: data.progressStatus,
          homework: data.homework
        })
      };
      
      if (existingReport) {
        await updateReport(existingReport.id, reportData);
        toast({
          title: "리포트 업데이트 완료",
          description: `${format(date, 'PPP', { locale: ko })} 리포트가 업데이트되었습니다.`,
        });
      } else {
        await addReport({
          employeeId,
          content: data.content,
          date: dateString,
          ...(isEducationDepartment && {
            classContent: data.className,
            absentStudents: data.absentStudents,
            progressStatus: data.progressStatus,
            homework: data.homework
          })
        });
        toast({
          title: "리포트 저장 완료",
          description: `${format(date, 'PPP', { locale: ko })} 리포트가 저장되었습니다.`,
        });
      }
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "리포트를 저장하는 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    if (!existingReport) return;
    
    try {
      await deleteReport(existingReport.id);
      toast({
        title: "리포트 삭제 완료",
        description: `${format(date, 'PPP', { locale: ko })} 리포트가 삭제되었습니다.`,
      });
      
      reset({
        content: '',
        className: '',
        absentStudents: '',
        progressStatus: '',
        homework: ''
      });
      
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "리포트를 삭제하는 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  
  if (!employee) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-lg font-medium">선택된 직원이 없습니다</h2>
        <p className="mt-2 text-sm text-muted-foreground">왼쪽 목록에서 직원을 선택해 주세요</p>
      </div>
    );
  }

  const getDepartmentColor = (department: EmployeeDepartment) => {
    switch (department) {
      case 'elementary': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'middle': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'high': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getApprovalStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>승인됨</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>반려됨</span>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>대기중</span>
          </Badge>
        );
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border border-primary/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background/90 pb-4 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="bg-primary/10">
                {employee.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{employee.name} 데일리 리포트</CardTitle>
                    {existingReport && getApprovalStatusBadge(existingReport.approvalStatus)}
                  </div>
                  <div className="flex items-center mt-1 gap-2">
                    <span className="text-sm text-muted-foreground">{employee.position}</span>
                    {employee.department && (
                      <Badge className={getDepartmentColor(employee.department)}>
                        {getDepartmentName(employee.department)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span>{format(date, 'PPP', { locale: ko })}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      locale={ko}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {existingReport && existingReport.approvalComments && (
            <div className={`mt-4 p-3 rounded-md border ${
              existingReport.approvalStatus === 'rejected' 
                ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50' 
                : 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/50'
            }`}>
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-4 w-4" />
                <span>관리자 코멘트</span>
              </h3>
              <p className="text-sm">
                {existingReport.approvalComments}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {isEducationDepartment && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="className" className="flex items-center gap-1.5">
                      <BookMarked className="h-4 w-4 text-primary" />
                      <span>반 이름</span>
                    </Label>
                    <Input
                      id="className"
                      placeholder="수업 진행한 반 이름을 입력해주세요..."
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...register('className', {
                        required: "반 이름을 입력해주세요",
                      })}
                      disabled={existingReport?.approvalStatus === 'approved'}
                    />
                    {errors.className && (
                      <p className="text-sm text-destructive mt-1">{errors.className.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="absentStudents" className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>결석 학생</span>
                    </Label>
                    <Input
                      id="absentStudents"
                      placeholder="결석한 학생의 이름과 보충강의 방법을 적어주세요."
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...register('absentStudents')}
                      disabled={existingReport?.approvalStatus === 'approved'}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="progressStatus" className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>진도 현황</span>
                  </Label>
                  <Textarea
                    id="progressStatus"
                    placeholder="오늘 진행한 진도를 작성해주세요..."
                    className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...register('progressStatus', {
                      required: "진도 현황을 입력해주세요",
                    })}
                    disabled={existingReport?.approvalStatus === 'approved'}
                  />
                  {errors.progressStatus && (
                    <p className="text-sm text-destructive mt-1">{errors.progressStatus.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="homework" className="flex items-center gap-1.5">
                    <Pencil className="h-4 w-4 text-primary" />
                    <span>숙제</span>
                  </Label>
                  <Textarea
                    id="homework"
                    placeholder="오늘 내준 숙제를 작성해주세요..."
                    className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...register('homework')}
                    disabled={existingReport?.approvalStatus === 'approved'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content" className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>기타 보고 사항</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="기타 보고할 내용이 있으면 작성해주세요..."
                    className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...register('content')}
                    disabled={existingReport?.approvalStatus === 'approved'}
                  />
                </div>
              </>
            )}
            
            {!isEducationDepartment && (
              <div className="space-y-2">
                <Label htmlFor="report" className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>업무 내용</span>
                </Label>
                <Textarea
                  id="report"
                  placeholder="오늘 진행한 업무내용과 전달할 사항을 작성하세요."
                  className="min-h-[300px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  {...register('content', {
                    required: "업무 내용을 입력해주세요",
                  })}
                  disabled={existingReport?.approvalStatus === 'approved'}
                />
                {errors.content && (
                  <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoading || existingReport?.approvalStatus === 'approved'} 
                className="transition-all duration-300 hover:shadow-md"
              >
                <Save className="h-4 w-4 mr-2" />
                {existingReport ? '리포트 업데이트' : '리포트 저장'}
              </Button>
              
              {existingReport && existingReport.approvalStatus !== 'approved' && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isSubmitting || isLoading}
                  className="transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  리포트 삭제
                </Button>
              )}
            </div>
            
            {existingReport?.approvalStatus === 'approved' && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                승인된 리포트는 수정할 수 없습니다. 변경이 필요한 경우 관리자에게 문의하세요.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리포트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {format(date, 'PPP', { locale: ko })}에 작성된 리포트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getDepartmentName(department: EmployeeDepartment): string {
  switch (department) {
    case 'administration':
      return '행정부';
    case 'elementary':
      return '초등부';
    case 'middle':
      return '중등부';
    case 'high':
      return '고등부';
    default:
      return '';
  }
}
