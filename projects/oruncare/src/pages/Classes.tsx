import { useState } from 'react';
import { ClassList } from '@/components/ClassList';
import NavBar from '@/components/NavBar';
import { useFilteredClasses } from '@/hooks/useFilteredClasses';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Filter, 
  Search,
  GraduationCap
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const Classes = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { classes, isClassesLoading } = useFilteredClasses(selectedTeacher);

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-soft">
      <NavBar />
      
      <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-blue-50 via-slate-50 to-teal-50">
        <div className="max-w-[1200px] mx-auto animate-fade-in">
          <div className="glass-card p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-all duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50">
                    <img 
                      src="/lovable-uploads/44f9e770-9118-417d-aec8-ed193c895905.png" 
                      alt="Orun Academy Logo" 
                      className="w-10 h-10 md:w-12 md:h-12 object-contain" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Class Management</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    반 관리
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">학급과 학생을 관리할 수 있습니다</p>
                </div>
              </div>
              
              <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle() + " bg-primary/10 text-primary"}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>학급</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                      <Users className="w-4 h-4 mr-2" />
                      <span>학생</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>일정</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          <div className="glass-card p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">선생님 필터:</h3>
                <Select 
                  value={selectedTeacher} 
                  onValueChange={setSelectedTeacher}
                >
                  <SelectTrigger className="w-full md:w-[180px] border-primary/20 focus:ring-primary/30">
                    <SelectValue placeholder="선생님 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 선생님</SelectItem>
                    {classes && Array.from(new Set(classes.map(c => c.teacher))).map(teacher => (
                      <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-full md:w-auto md:min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="학급 또는 학생 검색..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm p-5 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300">
            <ClassList />
          </div>
        </div>
      </main>
      
      <footer className="w-full py-4 px-6 text-center text-sm text-gray-600 bg-white/10 backdrop-blur-sm border-t border-white/20">
        <p>© {new Date().getFullYear()} 옳은영어. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Classes;
