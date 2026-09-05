import { useState, useCallback, useRef, memo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Trash2, Check, X, AlertTriangle, Clock, CheckCircle2, ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
interface Student {
  id: string;
  name: string;
  result?: 'pass' | 'fail' | 'absent' | 'not-taken' | null;
  wrongCount?: number;
  range_start: number | string;
  range_end: number | string;
  next_range_start?: number | string;
  next_range_end?: number | string;
  homework_content?: string;
  homework_completed?: boolean;
  next_homework_content?: string; // 개인 과제
  previous_range_start?: number | string;
  previous_range_end?: number | string;
  previous_result?: 'pass' | 'fail' | 'absent' | 'not-taken' | null;
  class_id?: string;
  teacher_comment?: string | null;
}
interface ClassStatistics {
  students: Student[];
  teacher?: string;
}
interface DailyStatisticsTableProps {
  statistics: Record<string, ClassStatistics>;
  selectedDate: Date;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
}

// Memoized row component for performance
const StudentRow = memo(({
  student,
  onUpdate,
  onDelete,
  isAuthenticated,
  externalHomework
}: {
  student: Student;
  onUpdate: (id: string, updates: Record<string, any>) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
  externalHomework?: string;
}) => {
  const [localResult, setLocalResult] = useState(student.result || 'not-taken');
  const [localWrongCount, setLocalWrongCount] = useState(student.wrongCount?.toString() || '');
  const [localHomework, setLocalHomework] = useState(student.homework_content || '');
  const [localPersonalHomework, setLocalPersonalHomework] = useState(student.next_homework_content || '');
  const [localComment, setLocalComment] = useState(student.teacher_comment || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [homeworkDialogOpen, setHomeworkDialogOpen] = useState(false);
  const [personalHomeworkDialogOpen, setPersonalHomeworkDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [homeworkOverflow, setHomeworkOverflow] = useState(false);
  const [personalHomeworkOverflow, setPersonalHomeworkOverflow] = useState(false);
  const [commentOverflow, setCommentOverflow] = useState(false);

  // Sync with external homework from common input
  useEffect(() => {
    if (externalHomework !== undefined && externalHomework !== '') {
      setLocalHomework(externalHomework);
    }
  }, [externalHomework]);

  // Refs to track debounce timers
  const homeworkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const personalHomeworkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wrongCountTimerRef = useRef<NodeJS.Timeout | null>(null);
  const homeworkTextRef = useRef<HTMLDivElement>(null);
  const personalHomeworkTextRef = useRef<HTMLDivElement>(null);
  const commentTextRef = useRef<HTMLDivElement>(null);

  // Check for text overflow
  useEffect(() => {
    if (homeworkTextRef.current) {
      const el = homeworkTextRef.current;
      setHomeworkOverflow(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    }
  }, [localHomework]);
  useEffect(() => {
    if (personalHomeworkTextRef.current) {
      const el = personalHomeworkTextRef.current;
      setPersonalHomeworkOverflow(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    }
  }, [localPersonalHomework]);
  useEffect(() => {
    if (commentTextRef.current) {
      const el = commentTextRef.current;
      setCommentOverflow(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    }
  }, [localComment]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (homeworkTimerRef.current) clearTimeout(homeworkTimerRef.current);
      if (personalHomeworkTimerRef.current) clearTimeout(personalHomeworkTimerRef.current);
      if (commentTimerRef.current) clearTimeout(commentTimerRef.current);
      if (wrongCountTimerRef.current) clearTimeout(wrongCountTimerRef.current);
    };
  }, []);
  const handleResultChange = (value: string) => {
    setLocalResult(value as any);
    setHasChanges(true);
    // Auto-save result immediately
    onUpdate(student.id, {
      result: value === 'not-taken' ? null : value
    });
  };
  const handleWrongCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalWrongCount(value);
    setHasChanges(true);

    // Debounce the update
    if (wrongCountTimerRef.current) clearTimeout(wrongCountTimerRef.current);
    wrongCountTimerRef.current = setTimeout(() => {
      const wrongCount = value ? parseInt(value, 10) : null;
      onUpdate(student.id, {
        wrong_count: wrongCount
      });
    }, 1000);
  };
  const handleHomeworkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalHomework(value);
    setHasChanges(true);

    // Debounce the update
    if (homeworkTimerRef.current) clearTimeout(homeworkTimerRef.current);
    homeworkTimerRef.current = setTimeout(() => {
      onUpdate(student.id, {
        homework_content: value
      });
    }, 1000);
  };
  const handlePersonalHomeworkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalPersonalHomework(value);
    setHasChanges(true);

    // Debounce the update
    if (personalHomeworkTimerRef.current) clearTimeout(personalHomeworkTimerRef.current);
    personalHomeworkTimerRef.current = setTimeout(() => {
      onUpdate(student.id, {
        next_homework_content: value
      });
    }, 1000);
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalComment(value);
    setHasChanges(true);

    // Debounce the update
    if (commentTimerRef.current) clearTimeout(commentTimerRef.current);
    commentTimerRef.current = setTimeout(() => {
      onUpdate(student.id, {
        teacher_comment: value
      });
    }, 1000);
  };
  const getResultBadgeClass = (result: string | null | undefined) => {
    switch (result) {
      case 'pass':
        return 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/60 shadow-sm shadow-emerald-100/50 ring-1 ring-emerald-100';
      case 'fail':
        return 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200/60 shadow-sm shadow-rose-100/50 ring-1 ring-rose-100';
      case 'absent':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200/60 shadow-sm shadow-amber-100/50 ring-1 ring-amber-100';
      default:
        return 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-500 border-slate-200/60 ring-1 ring-slate-100';
    }
  };
  const getResultIcon = (result: string | null | undefined) => {
    switch (result) {
      case 'pass':
        return <Check className="h-3 w-3" />;
      case 'fail':
        return <X className="h-3 w-3" />;
      case 'absent':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };
  return <TableRow className={cn("hover:bg-slate-50/60 transition-all duration-200 border-b border-slate-100/80 last:border-b-0", hasChanges && "bg-blue-50/20")}>
      <TableCell className="font-semibold py-3 px-3 text-slate-700">
        <span className="truncate max-w-[100px] block text-sm">{student.name}</span>
      </TableCell>
      

      <TableCell className="py-3 px-2">
        <Select value={localResult || 'not-taken'} onValueChange={handleResultChange} disabled={!isAuthenticated}>
          <SelectTrigger className={cn("h-9 w-[110px] text-xs font-medium border rounded-xl transition-all duration-200", getResultBadgeClass(localResult))}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-lg">
            <SelectItem value="not-taken" className="rounded-lg">
              <span className="text-xs font-medium text-slate-500">미응시</span>
            </SelectItem>
            <SelectItem value="pass" className="rounded-lg">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Check className="h-3 w-3" /> 통과
              </span>
            </SelectItem>
            <SelectItem value="fail" className="rounded-lg">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <X className="h-3 w-3" /> 미통과
              </span>
            </SelectItem>
            <SelectItem value="absent" className="rounded-lg">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-3 w-3" /> 결석
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="py-3 px-2">
        <Input type="number" value={localWrongCount} onChange={handleWrongCountChange} placeholder="-" className="h-9 w-[65px] text-xs text-center font-medium rounded-xl border-slate-200 focus:border-slate-300 focus:ring-slate-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" disabled={!isAuthenticated} min={0} />
      </TableCell>

      <TableCell className="py-3 px-2 min-w-[200px] max-w-[250px]">
        <div className="relative">
          {/* Hidden div to measure overflow */}
          <div ref={homeworkTextRef} className="absolute invisible max-h-[36px] text-xs py-2 px-3 whitespace-pre-wrap break-all overflow-hidden" style={{
          width: 'calc(100% - 4px)'
        }}>
            {localHomework}
          </div>
          
          {homeworkOverflow ?
        // 텍스트가 넘치면 클릭시 팝업
        <div onClick={() => setHomeworkDialogOpen(true)} className={cn("min-h-[36px] text-sm py-2 px-3 border border-slate-200 rounded-xl cursor-pointer whitespace-pre-wrap break-words", "hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 bg-slate-50/50")}>
              {localHomework}
            </div> :
        // 넘치지 않으면 직접 입력
        <Textarea value={localHomework} onChange={handleHomeworkChange} placeholder="RT 과제 입력" className="min-h-[36px] h-9 text-xs resize-none py-2 px-3 rounded-xl border-slate-200 focus:border-slate-300 focus:ring-slate-200 placeholder:text-slate-400" disabled={!isAuthenticated} />}
        </div>
        <Dialog open={homeworkDialogOpen} onOpenChange={setHomeworkDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800">{student.name} - RT 과제</DialogTitle>
            </DialogHeader>
            <Textarea value={localHomework} onChange={handleHomeworkChange} placeholder="RT 과제 입력" className="min-h-[150px] text-sm resize-none rounded-xl border-slate-200" disabled={!isAuthenticated} autoFocus />
            <div className="flex justify-end">
              <Button onClick={() => setHomeworkDialogOpen(false)} className="rounded-xl px-6">
                확인
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>

      {/* 개인 과제 */}
      <TableCell className="py-3 px-2 min-w-[180px] max-w-[220px]">
        <div className="relative">
          {/* Hidden div to measure overflow */}
          <div ref={personalHomeworkTextRef} className="absolute invisible max-h-[36px] text-xs py-2 px-3 whitespace-pre-wrap break-all overflow-hidden" style={{
            width: 'calc(100% - 4px)'
          }}>
            {localPersonalHomework}
          </div>
          
          {personalHomeworkOverflow ?
            // 텍스트가 넘치면 클릭시 팝업
            <div onClick={() => setPersonalHomeworkDialogOpen(true)} className={cn("min-h-[36px] text-sm py-2 px-3 border border-blue-200 rounded-xl cursor-pointer whitespace-pre-wrap break-words", "hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-slate-700 bg-blue-50/30")}>
              {localPersonalHomework}
            </div> :
            // 넘치지 않으면 직접 입력
            <Textarea value={localPersonalHomework} onChange={handlePersonalHomeworkChange} placeholder="개인 과제 입력" className="min-h-[36px] h-9 text-xs resize-none py-2 px-3 rounded-xl border-blue-200 bg-blue-50/20 focus:border-blue-300 focus:ring-blue-200 placeholder:text-blue-400" disabled={!isAuthenticated} />}
        </div>
        <Dialog open={personalHomeworkDialogOpen} onOpenChange={setPersonalHomeworkDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800">{student.name} - 개인 과제</DialogTitle>
            </DialogHeader>
            <Textarea value={localPersonalHomework} onChange={handlePersonalHomeworkChange} placeholder="개인 과제 입력" className="min-h-[150px] text-sm resize-none rounded-xl border-blue-200" disabled={!isAuthenticated} autoFocus />
            <div className="flex justify-end">
              <Button onClick={() => setPersonalHomeworkDialogOpen(false)} className="rounded-xl px-6">
                확인
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>

      <TableCell className="py-3 px-2 min-w-[150px] max-w-[200px]">
        <div className="relative">
          {/* Hidden div to measure overflow */}
          <div ref={commentTextRef} className="absolute invisible max-h-[36px] text-xs py-2 px-3 whitespace-pre-wrap break-all overflow-hidden" style={{
          width: 'calc(100% - 4px)'
        }}>
            {localComment}
          </div>
          
          {commentOverflow ?
        // 텍스트가 넘치면 클릭시 팝업
        <div onClick={() => setCommentDialogOpen(true)} className={cn("min-h-[36px] max-h-[36px] text-xs py-2 px-3 border border-slate-200 rounded-xl cursor-pointer whitespace-pre-wrap break-all overflow-hidden", "hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 bg-slate-50/50")}>
              {localComment}
            </div> :
        // 넘치지 않으면 직접 입력
        <Input value={localComment} onChange={handleCommentChange} placeholder="특이사항 입력" className="h-9 text-xs rounded-xl border-slate-200 focus:border-slate-300 focus:ring-slate-200 placeholder:text-slate-400" disabled={!isAuthenticated} />}
        </div>
        <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800">{student.name} - 특이사항</DialogTitle>
            </DialogHeader>
            <Textarea value={localComment} onChange={e => {
            const value = e.target.value;
            setLocalComment(value);
            setHasChanges(true);
            if (commentTimerRef.current) clearTimeout(commentTimerRef.current);
            commentTimerRef.current = setTimeout(() => {
              onUpdate(student.id, {
                teacher_comment: value
              });
            }, 1000);
          }} placeholder="특이사항 입력" className="min-h-[150px] text-sm resize-none rounded-xl border-slate-200" disabled={!isAuthenticated} autoFocus />
            <div className="flex justify-end">
              <Button onClick={() => setCommentDialogOpen(false)} className="rounded-xl px-6">
                확인
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>


      <TableCell className="py-3 px-2">
        <Button variant="ghost" size="sm" onClick={() => onDelete(student.id)} className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200" disabled={!isAuthenticated}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>;
});
StudentRow.displayName = 'StudentRow';

// Helper function to get school logo URL
const getSchoolLogoUrl = (className: string): string | null => {
  const schoolLogos: Record<string, string> = {
    '수도여고': '/lovable-uploads/6ed011f2-1218-43fc-81f1-b570eac76530.png',
    '숭의여고': '/lovable-uploads/4201708f-ed03-4235-8a93-0bcd3c8ab973.png',
    '성남고': '/lovable-uploads/seongnam-logo.png',
    '영등포고': '/lovable-uploads/yeongdeungpo-logo-new.png',
    '당곡고': '/lovable-uploads/danggok-logo.png',
    '구암고': '/lovable-uploads/guam-logo.png'
  };
  for (const [school, url] of Object.entries(schoolLogos)) {
    if (className.includes(school)) {
      return url;
    }
  }
  return null;
};

// Collapsible class section
const ClassSection = memo(({
  className,
  students,
  teacher,
  onUpdate,
  onDelete,
  onUpdateAll,
  isAuthenticated,
  defaultExpanded = true
}: {
  className: string;
  students: Student[];
  teacher?: string;
  onUpdate: (id: string, updates: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onUpdateAll: (studentIds: string[], updates: Record<string, any>) => void;
  isAuthenticated: boolean;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [commonHomework, setCommonHomework] = useState('');
  const [commonHomeworkDialogOpen, setCommonHomeworkDialogOpen] = useState(false);
  const [commonHomeworkOverflow, setCommonHomeworkOverflow] = useState(false);
  const commonHomeworkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commonHomeworkTextRef = useRef<HTMLDivElement>(null);
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));
  const logoUrl = getSchoolLogoUrl(className);
  const passCount = students.filter(s => s.result === 'pass').length;
  const failCount = students.filter(s => s.result === 'fail').length;
  const absentCount = students.filter(s => s.result === 'absent').length;
  const notTakenCount = students.filter(s => !s.result || s.result === 'not-taken').length;

  // Check for common homework overflow
  useEffect(() => {
    if (commonHomeworkTextRef.current) {
      const el = commonHomeworkTextRef.current;
      setCommonHomeworkOverflow(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    }
  }, [commonHomework]);
  const handleCommonHomeworkChange = (value: string) => {
    setCommonHomework(value);
    if (commonHomeworkTimerRef.current) clearTimeout(commonHomeworkTimerRef.current);
    commonHomeworkTimerRef.current = setTimeout(() => {
      const studentIds = students.map(s => s.id);
      onUpdateAll(studentIds, {
        homework_content: value
      });
    }, 1000);
  };
  return <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] mb-5 transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] hover:border-slate-300/60">
      {/* Class Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 gap-4 border-b border-slate-100/80">
        {/* Left side: expand button, logo, class info, student count, and common homework */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 shrink-0 group">
            <div className="w-6 h-6 rounded-lg bg-slate-100/80 flex items-center justify-center group-hover:bg-slate-200/80 transition-colors">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-300" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500 transition-transform duration-300" />}
            </div>
            
            {/* School Logo */}
            <Avatar className="h-9 w-9 border-2 border-white shadow-md ring-2 ring-slate-100/50">
              {logoUrl && !imageError ? <AvatarImage src={logoUrl} alt="School logo" className={cn("object-contain p-0.5 transition-opacity duration-300", isImageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setIsImageLoaded(true)} onError={() => setImageError(true)} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                <GraduationCap className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 tracking-tight whitespace-nowrap text-[15px]">{className}</span>
              {teacher && <span className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-100/80 px-2 py-0.5 rounded-full">
                  {teacher}
                </span>}
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                {students.length}명
              </span>
            </div>
          </button>

          {/* Common Homework Input - wide and flexible */}
          <div className="relative flex-1">
            {/* Hidden div to measure overflow */}
            <div ref={commonHomeworkTextRef} className="absolute invisible max-h-[36px] text-xs py-2 px-3 whitespace-pre-wrap break-all overflow-hidden w-full">
              {commonHomework}
            </div>
            
            {commonHomeworkOverflow ?
          // 텍스트가 넘치면 클릭시 팝업
          <div onClick={e => {
            e.stopPropagation();
            setCommonHomeworkDialogOpen(true);
          }} className={cn("min-h-[44px] max-h-[44px] text-sm py-2.5 px-4 border-2 border-blue-300 rounded-xl cursor-pointer whitespace-pre-wrap break-all overflow-hidden font-medium", "hover:bg-blue-100/80 hover:border-blue-400 transition-all duration-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md shadow-blue-200/50 ring-1 ring-blue-200/50")}>
                {commonHomework}
              </div> :
          // 넘치지 않으면 직접 입력
          <Input value={commonHomework} onChange={e => handleCommonHomeworkChange(e.target.value)} onClick={e => e.stopPropagation()} placeholder="📝 공통 RT 과제 입력" className="h-12 w-full text-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 placeholder:text-blue-400 placeholder:font-medium shadow-md shadow-blue-200/50 ring-1 ring-blue-200/50 font-medium" disabled={!isAuthenticated} />}
          </div>
          <Dialog open={commonHomeworkDialogOpen} onOpenChange={setCommonHomeworkDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800">{className} - 공통 RT 과제</DialogTitle>
              </DialogHeader>
              <Textarea value={commonHomework} onChange={e => handleCommonHomeworkChange(e.target.value)} placeholder="공통 RT 과제를 입력하면 모든 학생에게 적용됩니다" className="min-h-[150px] text-sm resize-none rounded-xl border-slate-200" disabled={!isAuthenticated} autoFocus />
              <p className="text-xs text-slate-500">
                * 입력한 내용이 이 반의 모든 학생에게 적용됩니다
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setCommonHomeworkDialogOpen(false)} className="rounded-xl px-6">
                  확인
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Right side: Quick stats */}
        <div className="flex items-center gap-2.5 text-xs shrink-0">
          {passCount > 0 && <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-bold border border-emerald-200/60 shadow-sm shadow-emerald-100/30 ring-1 ring-emerald-100/50">
              <span className="opacity-70">통과</span> {passCount}
            </span>}
          {failCount > 0 && <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 font-bold border border-rose-200/60 shadow-sm shadow-rose-100/30 ring-1 ring-rose-100/50">
              <span className="opacity-70">미통과</span> {failCount}
            </span>}
          {absentCount > 0 && <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-bold border border-amber-200/60 shadow-sm shadow-amber-100/30 ring-1 ring-amber-100/50">
              <span className="opacity-70">결석</span> {absentCount}
            </span>}
          {notTakenCount > 0 && <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-100 to-gray-100 text-slate-500 font-semibold border border-slate-200/60 shadow-sm ring-1 ring-slate-100/50">
              <span className="opacity-60">미응시</span> {notTakenCount}
            </span>}
        </div>
      </div>

      {/* Table */}
      {isExpanded && <div className="overflow-x-auto bg-gradient-to-b from-white to-slate-50/30">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-100/80 to-slate-50/80 border-t border-slate-200/50">
                <TableHead className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[100px]">학생</TableHead>
                <TableHead className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[100px]">결과</TableHead>
                <TableHead className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[60px]">오답수</TableHead>
                <TableHead className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[180px]">공통 RT 과제</TableHead>
                <TableHead className="py-3.5 px-3 text-[11px] font-bold text-blue-500 uppercase tracking-wider w-[180px]">개인 과제</TableHead>
                <TableHead className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[150px]">특이사항(조교 작성)</TableHead>
                <TableHead className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student, index) => <StudentRow key={student.id} student={student} onUpdate={onUpdate} onDelete={onDelete} isAuthenticated={isAuthenticated} externalHomework={commonHomework} />)}
            </TableBody>
          </Table>
        </div>}
    </div>;
});
ClassSection.displayName = 'ClassSection';
export const DailyStatisticsTable = ({
  statistics,
  selectedDate,
  onDeleteSchedule
}: DailyStatisticsTableProps) => {
  const {
    toast
  } = useToast();
  const {
    isAuthenticated
  } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: Record<string, any>;
    }) => {
      const {
        error
      } = await supabase.from('test_schedules').update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return {
        id,
        updates
      };
    },
    onSuccess: () => {
      // Don't invalidate queries immediately to prevent UI jitter
      // The local state already reflects the changes
    },
    onError: error => {
      console.error('Update error:', error);
      toast({
        title: "저장 실패",
        description: "변경사항 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });
  const handleUpdate = useCallback((id: string, updates: Record<string, any>) => {
    updateMutation.mutate({
      id,
      updates
    });
  }, [updateMutation]);
  const handleUpdateAll = useCallback((studentIds: string[], updates: Record<string, any>) => {
    studentIds.forEach(id => {
      updateMutation.mutate({
        id,
        updates
      });
    });
  }, [updateMutation]);
  const handleDelete = useCallback(async (id: string) => {
    await onDeleteSchedule(id);
  }, [onDeleteSchedule]);
  if (Object.keys(statistics).length === 0) {
    return <div className="text-center py-8 text-muted-foreground">
        <p>선택한 날짜에 시험 일정이 없습니다.</p>
      </div>;
  }
  const sortedClasses = Object.entries(statistics).sort(([a], [b]) => a.localeCompare(b));
  return <div className="space-y-2">
      {sortedClasses.map(([className, stats]) => <ClassSection key={className} className={className} students={stats.students} teacher={stats.teacher} onUpdate={handleUpdate} onDelete={handleDelete} onUpdateAll={handleUpdateAll} isAuthenticated={isAuthenticated} />)}
    </div>;
};
export default DailyStatisticsTable;