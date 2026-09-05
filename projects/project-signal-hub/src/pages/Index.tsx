import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTaskStore, setupTaskSubscription } from "@/lib/taskStore";
import { useAuthStore } from "@/lib/authStore";
import { supabase } from "@/integrations/supabase/client";
import { EventManagement } from "@/components/EventManagement";
import { useEmployeeStore, setupEmployeeSubscription } from "@/lib/employeeStore";
import { setupReportSubscription } from "@/lib/reportStore";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TaskManager } from "@/components/dashboard/TaskManager";
import { CalendarDays, ListTodo, ChevronDown, BarChart3, X } from "lucide-react";
import { QuickMenu } from "@/components/QuickMenu";
import { TaskForm } from "@/components/task-form";
import { useEventStore } from "@/lib/eventStore";
import { NewTaskNotification } from "@/components/NewTaskNotification";
import { useNewTaskNotification } from "@/hooks/useNewTaskNotification";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TodayEventPopup } from "@/components/TodayEventPopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskList } from "@/components/TaskList";
import { TaskListFilters } from "@/components/TaskListFilters";
const Index = () => {
  const {
    fetchTasks
  } = useTaskStore();
  const {
    isAuthenticated
  } = useAuthStore();
  const {
    events,
    fetchEvents,
    setupEventSubscription
  } = useEventStore();
  const {
    fetchEmployees
  } = useEmployeeStore();
  const {
    newTask,
    showNotification,
    handleCloseNotification
  } = useNewTaskNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(true);
  const [isTaskOpen, setIsTaskOpen] = useState(true);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Load data with proper sequencing to prevent dependency issues
  useEffect(() => {
    // First load employee data
    fetchEmployees().then(() => {
      console.log("Employee data loaded successfully");
      // Then load tasks after employee data is available
      return fetchTasks();
    }).then(() => {
      console.log("Task data loaded successfully");
      setIsLoading(false);
    }).catch(error => {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    });

    // Load events separately as they don't depend on employees
    fetchEvents().catch(error => {
      console.error("Error fetching events:", error);
    });

    // Setup realtime subscriptions
    const taskChannel = setupTaskSubscription();
    const employeeChannel = setupEmployeeSubscription();
    const reportChannel = setupReportSubscription();
    const eventChannel = setupEventSubscription();
    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(employeeChannel);
      supabase.removeChannel(reportChannel);
      supabase.removeChannel(eventChannel);
    };
  }, [fetchTasks, fetchEvents, fetchEmployees]);
  const todaysEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate.getDate() === today.getDate() && eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
  });
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 animate-fade-in overflow-hidden">
      <TodayEventPopup events={todaysEvents} />
      <NewTaskNotification task={newTask} open={showNotification} onOpenChange={handleCloseNotification} />
      <div className="absolute inset-0 bg-gradient-circuit opacity-10 pointer-events-none z-0"></div>
      
      <div className="w-full flex-1 flex flex-col gap-4 sm:gap-6 relative z-10">
        <Header />
        
        <div className="mobile-card">
          <QuickMenu />
        </div>

        <Collapsible open={isEventOpen} onOpenChange={setIsEventOpen} className="mobile-card animate-slide-in">
          <div className="p-0">
            <CollapsibleTrigger className="group flex justify-between items-center w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/90 dark:via-slate-700/80 dark:to-slate-800/90 border border-white/60 dark:border-slate-600/60 shadow-xl hover:shadow-2xl backdrop-blur-md hover:backdrop-blur-lg transition-all duration-500 ease-out hover:scale-[1.02] hover:from-blue-50/95 hover:via-indigo-50/85 hover:to-purple-50/95 dark:hover:from-slate-700/95 dark:hover:via-slate-600/85 dark:hover:to-slate-700/95 mobile-touch-target relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400/10 before:via-indigo-400/10 before:to-purple-400/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold mb-0 whitespace-nowrap flex items-center">
                  <div className="bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-sm mr-3 border border-blue-200/50 dark:border-blue-700/50">
                    <CalendarDays className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-200">
                    일정 및 행사
                  </span>
                </h2>
                {!isEventOpen && todaysEvents.length > 0 && <p className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-10 sm:ml-14 font-medium bg-gradient-to-r from-blue-600/80 via-indigo-600/80 to-purple-600/80 bg-clip-text text-transparent leading-relaxed tracking-wide" style={{
                filter: "drop-shadow(0 1px 2px rgba(59, 130, 246, 0.1))"
              }}>
                    오늘 {todaysEvents.length}개의 일정이 있습니다: {' '}
                    {todaysEvents.map((event, index) => <span key={event.id} className="inline-flex items-center px-4 py-2.5 mx-1.5 rounded-2xl bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-purple-500/25 border-2 border-blue-400/40 dark:border-blue-500/40 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-500 text-sm font-bold text-blue-800 dark:text-blue-200 backdrop-blur-md relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-blue-100/20 before:to-purple-100/20 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:transform after:-skew-x-12 after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-700" style={{
                  filter: "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.25))",
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))"
                }}>
                        <span className="relative z-10 flex items-center">
                          <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2.5 animate-pulse shadow-sm"></span>
                          {event.title}
                        </span>
                        {index < todaysEvents.length - 1 && <span className="mx-1 text-slate-400">•</span>}
                      </span>)}
                  </p>}
                {!isEventOpen && todaysEvents.length === 0 && <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-10 sm:ml-14">
                    오늘 예정된 일정이 없습니다
                  </p>}
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 p-2 rounded-full shadow-sm border border-blue-200/50 dark:border-blue-700/50">
                <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${isEventOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4 sm:mt-6">
              <div className="px-2 sm:px-4">
                <EventManagement />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        <Collapsible open={isTaskOpen} onOpenChange={setIsTaskOpen} className="mobile-card animate-slide-in">
          <div className="p-0">
            <CollapsibleTrigger className="group flex justify-between items-center w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/90 via-violet-50/80 to-purple-50/90 dark:from-slate-800/90 dark:via-purple-900/80 dark:to-violet-900/90 border border-white/60 dark:border-purple-600/60 shadow-xl hover:shadow-2xl backdrop-blur-md hover:backdrop-blur-lg transition-all duration-500 ease-out hover:scale-[1.02] hover:from-violet-50/95 hover:via-purple-50/85 hover:to-indigo-50/95 dark:hover:from-purple-800/95 dark:hover:via-violet-700/85 dark:hover:to-purple-800/95 mobile-touch-target relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-400/10 before:via-purple-400/10 before:to-indigo-400/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
              <h2 className="text-lg sm:text-xl font-semibold whitespace-nowrap flex items-center">
                <div className="bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-sm mr-3 border border-violet-200/50 dark:border-violet-700/50">
                  <ListTodo className="text-violet-500 h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-slate-800 dark:text-slate-200">
                  업무 관리
                </span>
              </h2>
              <div className="bg-white/60 dark:bg-slate-700/60 p-2 rounded-full shadow-sm border border-violet-200/50 dark:border-violet-700/50">
                <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-violet-600 dark:text-violet-400 transition-transform duration-200 ${isTaskOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4 sm:mt-6">
              <div className="px-2 sm:px-4">
                <div className="flex justify-end gap-2 mb-4 sm:mb-6">
                  <button onClick={() => setShowDashboard(true)} className="relative overflow-hidden bg-gradient-to-r from-secondary/90 to-secondary hover:from-secondary hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-secondary/25 group h-11 rounded-md px-8 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      상황판 보기
                    </span>
                  </button>
                  <TaskForm showDefaultTrigger={true} />
                </div>
                <TaskManager />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
      
      {/* 전체화면 상황판 모달 */}
      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0">
          <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            {/* 헤더 */}
            <div className="relative flex items-center justify-center p-6 border-b bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                업무 상황판
              </DialogTitle>
              <div className="absolute right-6 flex items-center gap-4">
                {/* 필터 버튼들 */}
                <TaskListFilters />
                <button onClick={() => setShowDashboard(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  
                </button>
              </div>
            </div>
            
            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(100vh-8rem)]">
              {/* 통계 대시보드 */}
              
              
              {/* 전체 업무 목록 */}
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-6 shadow-lg backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                <TaskList isDashboard={true} hideFilters={true} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
      
      {/* 배경 장식 요소들 - 모바일에서 줄이기 */}
      <div className="fixed top-1/4 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-1/3 left-0 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none z-0"></div>
    </div>;
};
export default Index;