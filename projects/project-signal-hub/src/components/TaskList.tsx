import { useState, useEffect } from "react";
import { TaskCard } from "@/components/task-card/TaskCard";
import { useTaskStore } from "@/lib/taskStore";
import { Task } from "@/lib/types";
import { getStatusColor, getStatusText } from "@/components/task-card/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeStore } from "@/lib/employeeStore";
import { useAuthStore } from "@/lib/authStore";
import { Filter, Clock, CheckCircle, RotateCcw, AlertCircle, Users, User } from "lucide-react";
import { EmployeeDepartment } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskList({ isDashboard = false, hideFilters = false }: { isDashboard?: boolean; hideFilters?: boolean }) {
  const {
    getVisibleTasks
  } = useTaskStore();
  const {
    employees
  } = useEmployeeStore();
  const {
    currentUser
  } = useAuthStore();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const allTasks = getVisibleTasks();
    console.log("TaskList - 모든 표시 가능한 업무:", allTasks);

    let filteredTasks = allTasks;

    // 부서별 필터링
    if (selectedDepartment !== "all") {
      filteredTasks = filteredTasks.filter(task => {
        const taskEmployees = task.assignedTo.map(id => employees.find(emp => emp.id === id)).filter(Boolean);
        return taskEmployees.some(emp => emp?.department === selectedDepartment as EmployeeDepartment);
      });
    }

    // 개인별 필터링
    if (selectedEmployee !== "all") {
      filteredTasks = filteredTasks.filter(task => {
        return task.assignedTo.includes(selectedEmployee);
      });
    }

    console.log("TaskList - 필터링된 업무:", filteredTasks);
    setTasks(filteredTasks);
  }, [getVisibleTasks, selectedDepartment, selectedEmployee, employees, currentUser]);

  const tasksByStatus: Record<Task['status'], Task[]> = {
    pending: [],
    in_progress: [],
    review: [],
    completed: []
  };
  tasks.forEach(task => {
    tasksByStatus[task.status].push(task);
  });
  const getStatusTitle = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'in_progress':
        return '진행 중';
      case 'review':
        return '검토 요청';
      case 'completed':
        return '완료됨';
      default:
        return status;
    }
  };
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <RotateCcw className="h-4 w-4" />;
      case 'review':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusHeaderClass = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-transparent';
      case 'in_progress':
        return 'bg-blue-50';
      case 'review':
        return 'bg-amber-50';
      case 'completed':
        return 'bg-green-50';
      default:
        return 'bg-transparent';
    }
  };

  const departmentOptions = () => {
    const departments = new Set<string>();
    employees.forEach(emp => {
      if (emp.department) {
        departments.add(emp.department);
      }
    });
    return Array.from(departments);
  };

  const getDepartmentName = (department: EmployeeDepartment | string): string => {
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
      case 'all':
        return '전체 부서';
      default:
        return department;
    }
  };

  const getVisibleEmployees = () => {
    if (selectedDepartment === "all") {
      return employees;
    }
    return employees.filter(emp => emp.department === selectedDepartment);
  };

  const StatusBar = () => <div className="sticky top-0 z-10 grid grid-cols-4 gap-4 bg-background/95 backdrop-blur-sm py-2 border-b mb-4">
      {Object.entries(tasksByStatus).map(([status]) => <div key={status} className={cn("flex items-center justify-center px-3 py-2 rounded-md shadow-sm border", getStatusColor(status as Task['status']), "transition-all duration-200 hover:shadow-md")}>
          <div className="flex items-center">
            {getStatusIcon(status as Task['status'])}
            <span className="ml-2 font-medium">{getStatusTitle(status as Task['status'])}</span>
          </div>
        </div>)}
    </div>;

  return <div className="space-y-4">
      {!hideFilters && (
        <div className="flex items-center justify-end mb-2 gap-4">
          {/* 부서별 필터 */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedDepartment} onValueChange={value => {
              setSelectedDepartment(value);
              setSelectedEmployee("all"); // 부서 변경시 개인 필터 초기화
            }}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 부서</SelectItem>
                {departmentOptions().map(dept => <SelectItem key={dept} value={dept}>
                    {getDepartmentName(dept)}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 개인별 필터 */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedEmployee} onValueChange={value => setSelectedEmployee(value)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="담당자 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 담당자</SelectItem>
                {getVisibleEmployees().map(emp => <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <StatusBar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, tasksInStatus]) => <div key={status} className={`space-y-4 p-3 rounded-lg ${getStatusHeaderClass(status as Task['status'])}`}>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(status as Task['status'])}</span>
                <h3 className="text-lg font-semibold">{getStatusTitle(status as Task['status'])}</h3>
              </div>
            </div>
            
            <div className={isDashboard ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-3"}>
              {tasksInStatus.length === 0 ? <div className={isDashboard ? "col-span-full text-center text-muted-foreground py-8 bg-muted/30 rounded-lg border border-dashed" : "text-center text-muted-foreground py-8 bg-muted/30 rounded-lg border border-dashed"}>
                  업무 없음
                </div> : <>
                  {tasksInStatus.map(task => <TaskCard key={task.id} task={task} />)}
                </>}
            </div>
          </div>)}
      </div>
    </div>;
}
