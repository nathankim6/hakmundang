import React, { useState } from 'react';
import { useReportStore } from '@/lib/reportStore';
import { useEmployeeStore } from '@/lib/employeeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  User, 
  Clock, 
  Book, 
  UserCheck, 
  BookOpen, 
  PenTool, 
  GraduationCap, 
  Edit, 
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmployeeDepartment } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuthStore } from '@/lib/authStore';

interface ReportListProps {
  department: EmployeeDepartment;
  date: string;
  onEditReport?: (employeeId: string) => void;
  approvalFilter?: string;
}

export function ReportList({ department, date, onEditReport, approvalFilter = 'all' }: ReportListProps) {
  const { toast } = useToast();
  const { reports, deleteReport, approveReport } = useReportStore();
  const { employees } = useEmployeeStore();
  const { isAdmin, currentUser } = useAuthStore();
  
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [reportToApprove, setReportToApprove] = useState<string | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'rejected'>('approved');
  const [comments, setComments] = useState<string>('');
  
  const departmentEmployees = employees.filter(emp => emp.department === department);
  const employeeIds = departmentEmployees.map(emp => emp.id);
  
  let filteredReports = reports.filter(
    report => report.date === date && employeeIds.includes(report.employeeId)
  );
  
  if (approvalFilter !== 'all') {
    filteredReports = filteredReports.filter(report => report.approvalStatus === approvalFilter);
  }
  
  const getEmployee = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };
  
  const isEducationDepartment = department === 'elementary' || 
                               department === 'middle' || 
                               department === 'high';
  
  const getDepartmentHeaderStyle = () => {
    switch (department) {
      case 'elementary':
        return 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-950/50 dark:to-blue-900/30';
      case 'middle':
        return 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-950/50 dark:to-green-900/30';
      case 'high':
        return 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-950/50 dark:to-purple-900/30';
      case 'administration':
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900/50 dark:to-gray-800/30';
    }
  };
  
  const formatTimeAgo = (dateStr: string) => {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return format(date, 'PPP p', { locale: ko });
    }
  };
  
  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    
    try {
      await deleteReport(deleteReportId);
      toast({
        title: "리포트 ���제 완료",
        description: "선택한 리포트가 삭제되었습니다.",
      });
      setDeleteReportId(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "오류 발생",
        description: "리포트를 삭제하는 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveReport = async () => {
    if (!reportToApprove || !currentUser) return;
    
    try {
      const adminInfo = `${currentUser.name} (${currentUser.position})`;
      const commentWithAdmin = comments ? `${adminInfo}: ${comments}` : comments;
      
      console.log("Sending approval with:", {
        reportId: reportToApprove,
        status: approvalAction,
        comments: commentWithAdmin
      });
      
      await approveReport(reportToApprove, approvalAction, commentWithAdmin);
      
      toast({
        title: approvalAction === 'approved' ? "리포트 승인 완료" : "리포트 반려 완료",
        description: approvalAction === 'approved' 
          ? "선택한 리포트가 승인되었습니다." 
          : "선택한 리포트가 반려되었습니다.",
      });
      
      setReportToApprove(null);
      setComments('');
    } catch (error) {
      console.error("Error approving report:", error);
      toast({
        title: "오류 발생",
        description: "리포트 상태를 변경하는 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  
  const canEditReport = (employeeId: string) => {
    if (isAdmin) return true;
    return currentUser && currentUser.id === employeeId;
  };
  
  const getApprovalStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            승인됨
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            반려됨
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            대기중
          </Badge>
        );
    }
  };
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-xl font-semibold text-foreground/90 flex items-center gap-2 whitespace-nowrap">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>
            {format(parseISO(date), 'yyyy년 M월 d일', { locale: ko })} 
            {' ('}{format(parseISO(date), 'EEEE', { locale: ko })}{') '}
            {getDepartmentName(department)} 리포트
          </span>
        </h3>
        <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary whitespace-nowrap">
          {filteredReports.length}개 보고서
        </Badge>
      </div>
      
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 w-full">
          {filteredReports.map(report => {
            const employee = getEmployee(report.employeeId);
            
            return (
              <Card key={report.id} className="animate-fade-in overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col w-full max-w-[250%]">
                <CardHeader className={`pb-3 ${getDepartmentHeaderStyle()}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <Avatar className="border-2 border-white shadow-sm">
                        <AvatarImage src={employee?.avatar} alt={employee?.name} />
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2 whitespace-nowrap">
                          {employee?.name}
                          <Badge variant="outline" className="text-xs bg-white/50 dark:bg-black/20 ml-1 whitespace-nowrap">
                            {employee?.position}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1 whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(report.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getApprovalStatusBadge(report.approvalStatus)}
                      
                      {canEditReport(report.employeeId) && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => onEditReport && onEditReport(report.employeeId)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">수정</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => setDeleteReportId(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">삭제</span>
                          </Button>
                        </>
                      )}
                      
                      {isAdmin && report.approvalStatus === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                            onClick={() => {
                              setReportToApprove(report.id);
                              setApprovalAction('approved');
                              setComments('');
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="sr-only">승인</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={() => {
                              setReportToApprove(report.id);
                              setApprovalAction('rejected');
                              setComments('');
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">반려</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 flex flex-col">
                  {isEducationDepartment ? (
                    <div className="grid grid-cols-1 w-full h-full flex-1 flex flex-col">
                      <div className="p-4 border-b flex-1">
                        <div className="space-y-3">
                          {report.classContent && (
                            <div>
                              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary/80 mb-1.5 whitespace-nowrap">
                                <Book className="h-4 w-4" />
                                <span>수업 정보</span>
                              </h4>
                              <div className="rounded-md bg-secondary/40 p-3 text-sm w-full">
                                <div className="mb-2">
                                  <span className="font-medium">수업 반:</span> {report.classContent}
                                </div>
                                {report.progressStatus && (
                                  <div>
                                    <span className="font-medium">진도 현황:</span>
                                    <p className="mt-1 text-sm leading-relaxed break-words">{report.progressStatus}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {report.homework && (
                            <div>
                              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary/80 mb-1.5 whitespace-nowrap">
                                <PenTool className="h-4 w-4" />
                                <span>숙제</span>
                              </h4>
                              <div className="rounded-md bg-accent/30 p-3 w-full">
                                <p className="text-sm leading-relaxed break-words">{report.homework}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 border-b bg-muted/20">
                        {report.absentStudents && (
                          <div>
                            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary/80 mb-1.5 whitespace-nowrap">
                              <UserCheck className="h-4 w-4" />
                              <span>결석 현황</span>
                            </h4>
                            <div className="bg-card p-3 rounded-md shadow-sm border border-border/50 w-full mb-4">
                              <p className="text-sm break-words">{report.absentStudents}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {report.content && (
                        <div className="p-4 bg-gradient-to-b from-background to-secondary/20">
                          <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary/80 mb-3 whitespace-nowrap">
                            <BookOpen className="h-4 w-4" />
                            <span>기타 보고 사항</span>
                          </h4>
                          <div className="bg-card p-3 rounded-md shadow-sm border border-border/50 w-full">
                            <p className="text-sm leading-relaxed break-words">{report.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 w-full h-full">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary/80 mb-3 whitespace-nowrap">
                        <BookOpen className="h-4 w-4" />
                        <span>업무 보고</span>
                      </h4>
                      <div className="text-sm leading-relaxed bg-secondary/30 p-3 rounded-md w-full h-full break-words">
                        {report.content}
                      </div>
                    </div>
                  )}
                  
                  {report.approvalComments && (
                    <div className="p-4 border-t bg-muted/10">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary/80 mb-2 whitespace-nowrap">
                        <MessageSquare className="h-4 w-4" />
                        <span>관리자 코멘트</span>
                      </h4>
                      <div className={`bg-card p-3 rounded-md shadow-sm border border-border/50 w-full ${
                        report.approvalStatus === 'rejected' ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/40' : 
                        'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800/40'
                      }`}>
                        <p className="text-sm leading-relaxed">
                          {report.approvalComments}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center bg-secondary/30 rounded-lg border border-dashed border-primary/20 w-full">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-3" />
          <p className="text-muted-foreground">
            {format(parseISO(date), 'PPP', { locale: ko })}
            {' ('}{format(parseISO(date), 'EEEE', { locale: ko })}{')'} 에 작성된 {getDepartmentName(department)} 리포트가 없습니다.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {approvalFilter !== 'all' ? `${getApprovalFilterName(approvalFilter)} 상태의 리포트가 없습니다.` : 
            '좌측에서 이름을 선택하여 새 리포트를 작성하세요.'}
          </p>
        </div>
      )}
      
      <AlertDialog open={!!deleteReportId} onOpenChange={(open) => !open && setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리포트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 리포트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!reportToApprove} onOpenChange={(open) => !open && setReportToApprove(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalAction === 'approved' ? '리포트 승인' : '리포트 반려'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalAction === 'approved' 
                ? '해당 리포트를 승인하시겠습니까? 피드백을 남기실 수 있습니다.' 
                : '해당 리포트를 반려하시겠습니까? 반려 사유를 작성해 주세요.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={approvalAction === 'approved' 
                ? '피드백을 입력하세요 (선택사항)' 
                : '반려 사유를 입력하세요'
              }
              className="min-h-[120px]"
            />
            {currentUser && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">코멘트 작성자:</span> {currentUser.name} ({currentUser.position})
              </p>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApproveReport}
              className={approvalAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {approvalAction === 'approved' ? '승인' : '반려'}
            </AlertDialogAction>
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
    case 'assistant':
      return '조교부';
    default:
      return '';
  }
}

function getApprovalFilterName(filter: string): string {
  switch (filter) {
    case 'pending':
      return '대기중';
    case 'approved':
      return '승인됨';
    case 'rejected':
      return '반려됨';
    default:
      return '';
  }
}
