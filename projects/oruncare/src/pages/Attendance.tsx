import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { useFilteredClasses } from '@/hooks/useFilteredClasses';
import { AttendanceTracker } from '@/components/attendance/AttendanceTracker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ClipboardList, Search, Users, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NavBar from '@/components/NavBar';

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { classes, isClassesLoading } = useFilteredClasses(selectedTeacher, searchTerm);

  const formattedDate = format(date, 'yyyy년 MM월 dd일 (EEEE)', {
    locale: ko
  });

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-100/40 via-blue-100/30 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/30 via-pink-50/20 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-50/30 to-teal-50/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <NavBar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="relative mb-8 p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden animate-fade-in">
            {/* Subtle Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 to-blue-100/30 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-lg">
                    <ClipboardList className="w-10 h-10 text-cyan-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Attendance Management</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
                    출석 관리
                  </h1>
                  <p className="text-slate-500 mt-1">학생들의 출석을 효율적으로 관리하세요</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="학생 이름 검색..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-11 h-12 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-cyan-500/30 focus-visible:border-cyan-400 rounded-xl shadow-sm w-full sm:w-64"
                  />
                </div>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 bg-white border-slate-200 text-slate-800 focus:ring-cyan-500/30 rounded-xl shadow-sm">
                    <SelectValue placeholder="선생님 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all">전체 선생님</SelectItem>
                    {classes && Array.from(new Set(classes.map(c => c.teacher))).map(teacher => (
                      <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Calendar Card */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/50">
                    <CalendarIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">날짜 선택</h3>
                    <p className="text-xs text-slate-500">출석을 기록할 날짜</p>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={newDate => newDate && setDate(newDate)} 
                    locale={ko} 
                    className="rounded-xl"
                  />
                </div>
                
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border border-cyan-200/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-200/30 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">Selected Date</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800 whitespace-nowrap">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Attendance Content */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">출석 현황</h2>
                      <p className="text-sm text-slate-500">{formattedDate}</p>
                    </div>
                  </div>
                </div>
                
                {isClassesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-500 mt-6 font-medium">수업 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <AttendanceTracker classes={classes} date={date} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="w-full py-6 px-6 text-center text-sm text-slate-500 bg-white/50 backdrop-blur-sm border-t border-slate-100 z-10">
        <p>© {new Date().getFullYear()} 옳은영어. All rights reserved.</p>
      </footer>
    </div>
  );
}