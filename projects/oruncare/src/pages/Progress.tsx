import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFilteredClasses } from '@/hooks/useFilteredClasses';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Youtube, 
  ClipboardList,
  ChevronRight,
  Edit3,
  Trash2,
  Save,
  X,
  LayoutGrid,
  List,
  Clock,
  GraduationCap,
  Sparkles,
  BookMarked,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CurriculumCalendar } from '@/components/curriculum/CurriculumCalendar';
import NavBar from '@/components/NavBar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RealtimeDashboard from '@/components/dashboard/RealtimeDashboard';
import DashboardButton from '@/components/dashboard/DashboardButton';
import { ScrollArea } from '@/components/ui/scroll-area';

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

// Group records by week
const groupRecordsByWeek = (records: Array<{ id: string; date: string; lesson_content: string; homework: string | null; youtube_url: string | null }>, currentMonth: Date) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Filter records for current month
  const monthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return isSameMonth(recordDate, currentMonth);
  });

  // Group by week number
  const weekGroups: Record<number, typeof monthRecords> = {};
  
  monthRecords.forEach(record => {
    const recordDate = new Date(record.date);
    const weekNum = getWeek(recordDate, { weekStartsOn: 1, locale: ko });
    if (!weekGroups[weekNum]) weekGroups[weekNum] = [];
    weekGroups[weekNum].push(record);
  });

  // Sort each week's records by date
  Object.values(weekGroups).forEach(weekRecords => {
    weekRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return weekGroups;
};

const Progress = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState('');
  const [homework, setHomework] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDashboard, setShowDashboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { classes } = useFilteredClasses(selectedTeacher);

  // Filter classes by search
  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group classes by teacher
  const groupedClasses: Record<string, typeof classes> = filteredClasses.reduce((acc, cls) => {
    if (!acc[cls.teacher]) acc[cls.teacher] = [];
    acc[cls.teacher].push(cls);
    return acc;
  }, {} as Record<string, typeof classes>);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes, selectedClass]);

  const { data: progressRecords = [] } = useQuery({
    queryKey: ['progress_records', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase
        .from('progress_records')
        .select('*')
        .eq('class_id', selectedClass)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass,
  });

  const typedProgressRecords = progressRecords as Array<{
    id: string;
    date: string;
    lesson_content: string;
    homework: string | null;
    youtube_url: string | null;
  }>;

  // Group records by week for current month
  const weeklyRecords = useMemo(() => 
    groupRecordsByWeek(typedProgressRecords, currentMonth), 
    [typedProgressRecords, currentMonth]
  );
  const addProgressMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass) throw new Error('반을 선택해주세요');
      const { data, error } = await supabase
        .from('progress_records')
        .insert([{
          class_id: selectedClass,
          date: format(date, 'yyyy-MM-dd'),
          lesson_content: lessonContent,
          homework: homework,
          youtube_url: youtubeUrl,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress_records'] });
      resetForm();
      toast({ title: "✅ 진도가 추가되었습니다" });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { data, error } = await supabase
        .from('progress_records')
        .update({
          lesson_content: lessonContent,
          homework: homework,
          youtube_url: youtubeUrl,
          date: format(date, 'yyyy-MM-dd'),
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress_records'] });
      resetForm();
      toast({ title: "✅ 진도가 수정되었습니다" });
    },
  });

  const deleteProgressMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('progress_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress_records'] });
      toast({ title: "🗑️ 진도가 삭제되었습니다" });
    },
  });

  const resetForm = () => {
    setIsEditing(false);
    setEditingRecord(null);
    setLessonContent('');
    setHomework('');
    setYoutubeUrl('');
    setDate(new Date());
    setShowForm(false);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setLessonContent(record.lesson_content);
    setHomework(record.homework || '');
    setYoutubeUrl(record.youtube_url || '');
    setDate(new Date(record.date));
    setIsEditing(true);
    setShowForm(true);
  };

  const selectedClassData = classes.find(cls => cls.id === selectedClass);
  const selectedClassLogo = selectedClassData ? getSchoolLogoUrl(selectedClassData.name) : null;

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f8fafc]">
      <NavBar />
      
      <div className="flex-1 flex">
        {/* Left Sidebar - Refined Design */}
        <aside className="w-[300px] bg-white border-r border-slate-200/80 flex flex-col">
          {/* Elegant Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <BookMarked className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">진도 관리</h2>
                <p className="text-xs text-slate-400">Progress Management</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="반 검색..."
                className="pl-10 h-11 bg-slate-50 border-0 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          {/* Class List with Refined Style */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {Object.entries(groupedClasses).map(([teacher, teacherClasses]) => (
                <div key={teacher} className="mb-6">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                    {teacher}
                    <span className="ml-auto text-slate-300 font-normal">{teacherClasses.length}</span>
                  </div>
                  <div className="space-y-1">
                    {teacherClasses.map((cls) => {
                      const logo = getSchoolLogoUrl(cls.name);
                      const isSelected = selectedClass === cls.id;
                      return (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass(cls.id)}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 flex items-center gap-3 group relative overflow-hidden",
                            isSelected
                              ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {logo ? (
                            <div className={cn(
                              "w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 transition-all ring-1",
                              isSelected 
                                ? "ring-white/30" 
                                : "ring-slate-200 group-hover:ring-indigo-200"
                            )}>
                              <img src={logo} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                              isSelected 
                                ? "bg-white/20" 
                                : "bg-slate-100 group-hover:bg-indigo-50"
                            )}>
                              <GraduationCap className={cn(
                                "w-4 h-4",
                                isSelected ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
                              )} />
                            </div>
                          )}
                          <span className={cn(
                            "font-medium truncate text-sm",
                            isSelected ? "text-white" : ""
                          )}>{cls.name}</span>
                          <ChevronRight className={cn(
                            "w-4 h-4 ml-auto transition-all flex-shrink-0",
                            isSelected ? "opacity-70 text-white" : "opacity-0 group-hover:opacity-50"
                          )} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Elegant Stats Footer */}
          <div className="p-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {classes.length}
                </div>
                <div className="text-xs text-slate-400">전체 반</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600">{typedProgressRecords.length} 기록</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Premium Design */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
          {/* Refined Header */}
          <header className="px-8 py-5 bg-white/80 backdrop-blur-sm border-b border-slate-100/80 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedClassLogo && (
                <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-slate-100 shadow-md">
                  <img src={selectedClassLogo} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedClassData?.name || '반을 선택하세요'}
                </h1>
                {selectedClassData && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium">
                      {selectedClassData.teacher}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-500">{selectedClassData.schedule}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle - Clean Design */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    viewMode === 'timeline' 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <List className="w-4 h-4" />
                  타임라인
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    viewMode === 'calendar' 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  캘린더
                </button>
              </div>
              
              <DashboardButton onClick={() => setShowDashboard(true)} />
              
              {/* Add Button - Refined Style */}
              {selectedClass && (
                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center gap-2 hover:translate-y-[-1px]"
                >
                  <Plus className="w-4 h-4" />
                  진도 추가
                </button>
              )}
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {selectedClass ? (
              viewMode === 'timeline' ? (
                <div className="space-y-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-2xl px-6 py-4 shadow-xl shadow-slate-500/20">
                    <button
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                      </h2>
                      <p className="text-indigo-200 text-sm mt-0.5">진도 관리</p>
                    </div>
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  {/* Form Card - Compact Design */}
                  {showForm && (
                    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-lg animate-fade-in">
                      <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-between">
                        <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                          {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {isEditing ? '진도 수정' : '새 진도 입력'}
                        </h3>
                        <button 
                          onClick={resetForm}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-white/80" />
                        </button>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        {/* Date Picker */}
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1.5 block flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                            날짜
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-left text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2 text-sm">
                                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                {format(date, "M월 d일 (EEE)", { locale: ko })}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white border-slate-200 shadow-xl rounded-xl" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(newDate) => setDate(newDate || new Date())}
                                locale={ko}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* YouTube URL */}
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1.5 block flex items-center gap-1.5">
                            <Youtube className="w-3.5 h-3.5 text-red-500" />
                            유튜브 URL <span className="text-slate-400 font-normal">(선택)</span>
                          </label>
                          <Input
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://youtube.com/..."
                            className="bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-lg h-9 text-sm"
                          />
                        </div>

                        {/* Lesson Content */}
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-700 mb-1.5 block flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                            학습 내용
                          </label>
                          <Textarea
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                            placeholder="오늘 학습한 내용을 입력하세요..."
                            className="bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 min-h-[60px] rounded-lg resize-none text-sm"
                          />
                        </div>

                        {/* Homework */}
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-700 mb-1.5 block flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
                            숙제 <span className="text-slate-400 font-normal">(선택)</span>
                          </label>
                          <Input
                            value={homework}
                            onChange={(e) => setHomework(e.target.value)}
                            placeholder="숙제가 있다면 입력하세요..."
                            className="bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-lg h-9 text-sm"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-2 flex gap-2">
                          <button
                            onClick={() => {
                              if (isEditing && editingRecord) {
                                updateProgressMutation.mutate(editingRecord.id);
                              } else {
                                addProgressMutation.mutate();
                              }
                            }}
                            disabled={!lessonContent.trim()}
                            className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                          >
                            <Save className="w-4 h-4" />
                            {isEditing ? '수정' : '저장'}
                          </button>
                          <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Records - Compact Grid Layout */}
                  {Object.keys(weeklyRecords).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(weeklyRecords)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([weekNum, records]) => (
                        <div key={weekNum} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                          {/* Week Header */}
                          <div className="px-5 py-3 bg-gradient-to-r from-slate-100 to-indigo-100/50 border-b border-slate-200/60 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                              <span className="text-sm font-black text-white">{Number(weekNum) % 100}</span>
                            </div>
                            <div>
                              <span className="text-base font-bold text-slate-800 block">
                                {format(currentMonth, 'M월', { locale: ko })} {Math.ceil((Number(weekNum) % 100) / 1)}주차
                              </span>
                              <span className="text-sm text-indigo-600 font-medium">{records.length}개 수업</span>
                            </div>
                          </div>
                          
                          {/* Cards Row */}
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {records.map((record) => (
                              <div 
                                key={record.id} 
                                className="bg-white rounded-2xl border border-slate-200/60 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group overflow-hidden"
                              >
                                {/* Card Header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border-b border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                      <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800 text-lg">
                                        {format(new Date(record.date), "M/d", { locale: ko })}
                                      </span>
                                      <span className="text-sm text-indigo-500 font-medium">
                                        {format(new Date(record.date), "EEEE", { locale: ko })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEdit(record)}
                                      className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                      <Edit3 className="w-4 h-4 text-indigo-500" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('삭제하시겠습니까?')) {
                                          deleteProgressMutation.mutate(record.id);
                                        }
                                      }}
                                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Card Content */}
                                <div className="p-5 space-y-4">
                                  <p className="text-slate-700 text-base leading-relaxed line-clamp-4">
                                    {record.lesson_content}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {record.youtube_url && (
                                      <a
                                        href={record.youtube_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors shadow-sm"
                                      >
                                        <Youtube className="w-4 h-4" />
                                        영상 보기
                                      </a>
                                    )}
                                    {record.homework && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-semibold shadow-sm">
                                        <ClipboardList className="w-4 h-4" />
                                        숙제
                                      </span>
                                    )}
                                  </div>
                                  
                                  {record.homework && (
                                    <p className="text-sm text-slate-500 bg-amber-50/50 px-3 py-2 rounded-md line-clamp-2">
                                      {record.homework}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Empty slot if only 1 record in week */}
                            {records.length === 1 && (
                              <div className="border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center py-8 text-slate-400">
                                <span className="text-xs">수업 없음</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showForm && (
                      <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {format(currentMonth, 'M월', { locale: ko })} 진도 기록이 없습니다
                        </h3>
                        <p className="text-slate-500 mb-4 text-sm">첫 번째 진도를 추가해보세요!</p>
                        <button
                          onClick={() => setShowForm(true)}
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          진도 추가
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Calendar View */
                selectedClassData && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-lg">
                    <CurriculumCalendar
                      schedule={selectedClassData.schedule}
                      classId={selectedClass}
                    />
                  </div>
                )
              )
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">반을 선택해주세요</h3>
                  <p className="text-slate-500 text-sm">왼쪽 목록에서 반을 선택하면 진도를 관리할 수 있습니다</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] p-0 m-0 bg-transparent border-0">
          <RealtimeDashboard 
            selectedDate={date} 
            onClose={() => setShowDashboard(false)}
            selectedTeacher={selectedTeacher}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Progress;
