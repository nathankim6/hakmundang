import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { Student } from '@/types/calendar';
import { useAttendance } from '@/hooks/useAttendance';
import { checkDayHasClass } from '@/utils/calendar';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, X, AlertCircle, GraduationCap, User } from 'lucide-react';

interface AttendanceTrackerProps {
  classes: any[];
  date: Date;
}

// School logo mapping
const getSchoolLogoUrl = (className: string): string | null => {
  if (className.includes('수도여고')) return '/lovable-uploads/6ed011f2-1218-43fc-81f1-b570eac76530.png';
  if (className.includes('숭의여고')) return '/lovable-uploads/soongeui-logo.png';
  if (className.includes('성남고')) return '/lovable-uploads/seongnam-logo.png';
  if (className.includes('영등포고')) return '/lovable-uploads/yeongdeungpo-logo-new.png';
  if (className.includes('당곡고')) return '/lovable-uploads/danggok-logo.png';
  if (className.includes('구암고')) return '/lovable-uploads/guam-logo.png';
  return null;
};

export function AttendanceTracker({ classes, date }: AttendanceTrackerProps) {
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { 
    attendanceRecords, 
    isLoading, 
    markAttendance, 
    isUpdating,
    updateReason 
  } = useAttendance(date);
  
  const debouncedReasonInputs = useDebounce(reasonInputs, 1000);

  useEffect(() => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const classesWithLessons = classes.filter(cls => {
      const hasScheduledClass = checkDayHasClass(cls, date);
      const hasManualClass = cls.manual_classes?.some(
        (manualClass: any) => manualClass.date === formattedDate
      );
      return hasScheduledClass || hasManualClass;
    });
    
    setFilteredClasses(classesWithLessons);
  }, [classes, date]);

  useEffect(() => {
    const newReasonInputs: Record<string, string> = {};
    attendanceRecords.forEach(record => {
      if (record.student_id && record.reason) {
        newReasonInputs[record.student_id] = record.reason;
      }
    });
    setReasonInputs(newReasonInputs);
  }, [attendanceRecords]);

  useEffect(() => {
    Object.entries(debouncedReasonInputs).forEach(([studentId, reason]) => {
      const attendance = getStudentAttendance(studentId);
      if (attendance?.status === 'absent' && attendance.reason !== reason) {
        updateReason(studentId, reason);
      }
    });
  }, [debouncedReasonInputs]);

  const getStudentAttendance = (studentId: string) => {
    return attendanceRecords.find(record => record.student_id === studentId);
  };

  const handleAttendanceChange = async (studentId: string, status: string) => {
    try {
      const currentAttendance = getStudentAttendance(studentId);
      const newStatus = (currentAttendance?.status === status) ? null : status;
      
      await markAttendance(studentId, newStatus);
      
      if (newStatus !== 'absent') {
        setReasonInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[studentId];
          return newInputs;
        });
      }
      
      toast({
        title: newStatus ? "출석 상태가 업데이트되었습니다." : "출석 상태가 취소되었습니다.",
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "출석 상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setReasonInputs(prev => ({
      ...prev,
      [studentId]: reason
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 mt-4">출석 데이터 로딩 중...</p>
      </div>
    );
  }

  if (filteredClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="p-4 rounded-full bg-slate-100 mb-4">
          <AlertCircle className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">수업 없음</h3>
        <p className="text-slate-500 text-center max-w-md">선택한 날짜에 예정된 수업이 없습니다. 다른 날짜를 선택하거나 수업 일정을 확인해주세요.</p>
      </div>
    );
  }

  const getStatusStyles = (status: string | undefined) => {
    switch(status) {
      case 'present':
        return 'from-emerald-50 to-teal-50 border-emerald-200 shadow-emerald-100/50';
      case 'late':
        return 'from-amber-50 to-yellow-50 border-amber-200 shadow-amber-100/50';
      case 'absent':
        return 'from-rose-50 to-pink-50 border-rose-200 shadow-rose-100/50';
      default:
        return 'from-white to-slate-50 border-slate-200 shadow-slate-100/50';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch(status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'absent':
        return <X className="h-5 w-5 text-rose-500" />;
      default:
        return <User className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={filteredClasses[0]?.id} className="w-full">
        <TabsList className="mb-6 w-full flex flex-wrap gap-2 bg-transparent p-0 h-auto">
          {filteredClasses.map(cls => {
            const logoUrl = getSchoolLogoUrl(cls.name);
            return (
              <TabsTrigger 
                key={cls.id} 
                value={cls.id}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-50 data-[state=active]:to-blue-50 data-[state=active]:border-cyan-300 text-slate-600 data-[state=active]:text-cyan-700 transition-all duration-300 hover:bg-slate-50 shadow-sm"
              >
                {logoUrl ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                    <img src={logoUrl} alt="" className="w-5 h-5 object-contain" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="w-3 h-3 text-slate-500" />
                  </div>
                )}
                <span className="font-medium">{cls.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {filteredClasses.map(cls => {
          const classLogoUrl = getSchoolLogoUrl(cls.name);
          return (
            <TabsContent key={cls.id} value={cls.id} className="mt-0">
              {/* Class Header */}
              <div className="flex items-center justify-between p-5 mb-6 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  {classLogoUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-md border border-slate-200">
                      <img src={classLogoUrl} alt="" className="w-12 h-12 object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center border border-cyan-200">
                      <GraduationCap className="w-7 h-7 text-cyan-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200">
                        {cls.teacher}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                        {cls.schedule}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{cls.students?.length || 0}</div>
                  <div className="text-xs text-slate-500">명 등록</div>
                </div>
              </div>
              
              {/* Quick Stats Bar */}
              {cls.students && cls.students.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: '출석', status: 'present', icon: '✓', color: 'emerald', count: cls.students.filter((s: Student) => getStudentAttendance(s.id)?.status === 'present').length },
                    { label: '지각', status: 'late', icon: '⏰', color: 'amber', count: cls.students.filter((s: Student) => getStudentAttendance(s.id)?.status === 'late').length },
                    { label: '결석', status: 'absent', icon: '✗', color: 'rose', count: cls.students.filter((s: Student) => getStudentAttendance(s.id)?.status === 'absent').length },
                    { label: '미체크', status: null, icon: '○', color: 'slate', count: cls.students.filter((s: Student) => !getStudentAttendance(s.id)?.status).length },
                  ].map((stat) => (
                    <div 
                      key={stat.label}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        stat.color === 'emerald' && "bg-emerald-50 border-emerald-200",
                        stat.color === 'amber' && "bg-amber-50 border-amber-200",
                        stat.color === 'rose' && "bg-rose-50 border-rose-200",
                        stat.color === 'slate' && "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{stat.icon}</span>
                        <span className={cn(
                          "text-sm font-medium",
                          stat.color === 'emerald' && "text-emerald-700",
                          stat.color === 'amber' && "text-amber-700",
                          stat.color === 'rose' && "text-rose-700",
                          stat.color === 'slate' && "text-slate-600"
                        )}>{stat.label}</span>
                      </div>
                      <span className={cn(
                        "text-2xl font-bold",
                        stat.color === 'emerald' && "text-emerald-600",
                        stat.color === 'amber' && "text-amber-600",
                        stat.color === 'rose' && "text-rose-600",
                        stat.color === 'slate' && "text-slate-500"
                      )}>{stat.count}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Students Table */}
              {cls.students && cls.students.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-4 bg-slate-50 border-b border-slate-200">
                    <div className="text-sm font-semibold text-slate-600">학생</div>
                    <div className="text-sm font-semibold text-slate-600 text-center w-[280px]">출석 상태</div>
                  </div>
                  
                  {/* Student Rows */}
                  <div className="divide-y divide-slate-100">
                    {cls.students.map((student: Student, index: number) => {
                      const attendance = getStudentAttendance(student.id);
                      
                      return (
                        <div 
                          key={student.id}
                          className={cn(
                            "grid grid-cols-[1fr_auto] gap-4 p-4 items-center transition-colors hover:bg-slate-50/50",
                            attendance?.status === 'present' && "bg-emerald-50/30",
                            attendance?.status === 'late' && "bg-amber-50/30",
                            attendance?.status === 'absent' && "bg-rose-50/30"
                          )}
                        >
                          {/* Student Info */}
                          <div className="flex items-center gap-3">
                            {/* Status Dot */}
                            <div className={cn(
                              "w-3 h-3 rounded-full flex-shrink-0",
                              attendance?.status === 'present' && "bg-emerald-500",
                              attendance?.status === 'late' && "bg-amber-500",
                              attendance?.status === 'absent' && "bg-rose-500",
                              !attendance?.status && "bg-slate-300"
                            )} />
                            
                            {/* Logo */}
                            {classLogoUrl ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                                <img src={classLogoUrl} alt="" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            
                            {/* Name & Status */}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{student.name}</div>
                              {attendance?.status === 'absent' && attendance?.reason && (
                                <div className="text-xs text-rose-500 truncate">사유: {attendance.reason}</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 w-[280px]">
                            {/* 출석 */}
                            <button
                              onClick={() => handleAttendanceChange(student.id, 'present')}
                              disabled={isUpdating}
                              className={cn(
                                "flex-1 h-10 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5",
                                attendance?.status === 'present'
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700"
                              )}
                            >
                              <span>✓</span>
                              <span className="hidden sm:inline">출석</span>
                            </button>
                            
                            {/* 지각 */}
                            <button
                              onClick={() => handleAttendanceChange(student.id, 'late')}
                              disabled={isUpdating}
                              className={cn(
                                "flex-1 h-10 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5",
                                attendance?.status === 'late'
                                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700"
                              )}
                            >
                              <span>⏰</span>
                              <span className="hidden sm:inline">지각</span>
                            </button>
                            
                            {/* 결석 */}
                            <button
                              onClick={() => handleAttendanceChange(student.id, 'absent')}
                              disabled={isUpdating}
                              className={cn(
                                "flex-1 h-10 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5",
                                attendance?.status === 'absent'
                                  ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
                              )}
                            >
                              <span>✗</span>
                              <span className="hidden sm:inline">결석</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Absence Reason Section (shown for students marked absent) */}
                  {cls.students.some((s: Student) => getStudentAttendance(s.id)?.status === 'absent') && (
                    <div className="border-t border-slate-200 bg-rose-50/50 p-4">
                      <h4 className="text-sm font-semibold text-rose-700 mb-3 flex items-center gap-2">
                        <span>📝</span> 결석 사유 입력
                      </h4>
                      <div className="space-y-2">
                        {cls.students
                          .filter((s: Student) => getStudentAttendance(s.id)?.status === 'absent')
                          .map((student: Student) => (
                            <div key={student.id} className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-700 w-24 truncate">{student.name}</span>
                              <Input
                                placeholder="결석 사유를 입력하세요..."
                                value={reasonInputs[student.id] || ''}
                                onChange={(e) => handleReasonChange(student.id, e.target.value)}
                                className="flex-1 h-9 text-sm bg-white border-rose-200 rounded-lg focus-visible:ring-rose-300"
                                disabled={isUpdating}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-8 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <AlertCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">이 수업에 등록된 학생이 없습니다.</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}