
import { Slider } from "@/components/ui/slider";
import { Employee, EmployeeDepartment } from "@/lib/types";
import { useTaskStore } from "@/lib/taskStore";
import { useState, useEffect, useRef } from "react";
import { useEmployeeStore } from "@/lib/employeeStore";
import { supabase } from "@/integrations/supabase/client";

// Define the type that matches the table structure in Supabase
type EmployeeProgressRow = {
  id: string;
  task_id: string;
  employee_id: string;
  progress: number;
  created_at: string;
  updated_at: string;
};

interface TaskAssigneeProps {
  employeeIds: string[];
  taskId?: string;
}

interface EmployeeProgress {
  [key: string]: number;
}

function getDepartmentIcon(department?: EmployeeDepartment): string {
  switch (department) {
    case 'administration':
      return '🏢';
    case 'elementary':
      return '🧸';
    case 'middle':
      return '✏️';
    case 'high':
      return '🎓';
    case 'assistant':
      return '👨‍🏫';
    case 'operations':
      return '⚙️';
    default:
      return '📄';
  }
}

export function TaskAssignee({
  employeeIds,
  taskId
}: TaskAssigneeProps) {
  const {
    getEmployee,
    updateTaskProgress,
    tasks
  } = useTaskStore();
  
  const { employees } = useEmployeeStore();
  const [employeeProgress, setEmployeeProgress] = useState<EmployeeProgress>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggingEmployeeId, setDraggingEmployeeId] = useState<string | null>(null);
  
  const progressInitializedRef = useRef(false);
  const fetchedRef = useRef(false);

  // 직원별 개별 진행도 서버(DB)에서 불러오기
  useEffect(() => {
    if (!taskId || !employeeIds.length || fetchedRef.current) return;
    
    const fetchProgress = async () => {
      fetchedRef.current = true;
      
      // Use a more specific type cast for the Supabase query
      const { data, error } = await supabase
        .from('task_employee_progress')
        .select('employee_id, progress')
        .eq('task_id', taskId)
        .in('employee_id', employeeIds);

      if (!error && Array.isArray(data)) {
        const loaded: EmployeeProgress = {};
        data.forEach((row: any) => {
          loaded[row.employee_id] = row.progress ?? 0;
        });
        setEmployeeProgress(loaded);
        progressInitializedRef.current = true;
      }
    };
    
    fetchProgress();
  }, [taskId, employeeIds]);

  if (!employeeIds || !Array.isArray(employeeIds)) {
    return <div className="text-muted-foreground text-xs">담당자 없음</div>;
  }

  const updatedEmployees = employeeIds
    .map(id => {
      const storeEmployee = employees.find(emp => emp.id === id);
      if (storeEmployee) return storeEmployee;
      return getEmployee(id);
    })
    .filter(emp => emp !== undefined) as Employee[];

  if (updatedEmployees.length === 0) {
    return <div className="text-muted-foreground text-xs">담당자 없음</div>;
  }

  // 슬라이더 드래그로 진행률 변화
  const handleDragging = (employeeId: string, value: number[]) => {
    setEmployeeProgress(prev => ({
      ...prev,
      [employeeId]: value[0],
    }));
    setDraggingEmployeeId(employeeId);
  };

  // 슬라이더 조정 후 서버에 저장 (퍼센트 반영)
  const handleProgressChange = async (employeeId: string, value: number[]) => {
    if (!taskId) return;
    setIsUpdating(true);
    try {
      const roundedValue = Math.round(value[0] / 10) * 10;
      setEmployeeProgress(prev => ({
        ...prev,
        [employeeId]: roundedValue
      }));

      // Update using proper Supabase types
      const { error } = await supabase
        .from('task_employee_progress')
        .upsert([
          { 
            task_id: taskId, 
            employee_id: employeeId, 
            progress: roundedValue,
            updated_at: new Date().toISOString()
          }
        ], 
        { onConflict: 'task_id,employee_id' });

      if (error) {
        console.error('Error updating employee progress:', error);
      }

      // 전체 평균 진행률 계산해 task 테이블에 반영
      const updatedProgress = { ...employeeProgress, [employeeId]: roundedValue };
      const relevantProgressValues = employeeIds.map(id => 
        updatedProgress[id] !== undefined ? updatedProgress[id] : 0
      );
      const avgProgress = Math.round(
        relevantProgressValues.reduce((sum, val) => sum + val, 0) / relevantProgressValues.length
      );
      
      await updateTaskProgress(taskId, avgProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsUpdating(false);
      setDraggingEmployeeId(null);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {updatedEmployees.map(employee => {
        const progressValue = employeeProgress[employee.id] !== undefined 
          ? employeeProgress[employee.id] 
          : 0;
        return (
          <div key={employee.id} className="space-y-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs flex items-center gap-1">
                  <span className="text-muted-foreground">{getDepartmentIcon(employee.department)}</span>
                  {employee.name}
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {Math.round(progressValue)}%
              </span>
            </div>
            <div className="px-1 w-full">
              <Slider
                value={[progressValue]}
                max={100}
                step={1}
                className="cursor-grab active:cursor-grabbing w-full"
                onValueChange={value => handleDragging(employee.id, value)}
                onValueCommit={value => handleProgressChange(employee.id, value)}
                disabled={isUpdating && draggingEmployeeId !== employee.id}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
