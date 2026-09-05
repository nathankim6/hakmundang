import { create } from 'zustand';
import { Task, Employee, TaskStatus } from './types';
import { useAuthStore } from './authStore';
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeStore } from './employeeStore';

const mockTasks: Task[] = [
  {
    id: '1',
    title: '웹사이트 디자인 작업',
    description: '메인 페이지 레이아웃 구성 및 UI 컴포넌트 디자인',
    assignedTo: ['1'],
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    progress: 65,
    isDeleted: false,
    createdBy: '1',
  },
  {
    id: '2',
    title: '백엔드 API 개발',
    description: '사용자 인증 및 데이터 저장을 위한 RESTful API 개발',
    assignedTo: ['2'],
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    progress: 0,
    isDeleted: false,
  },
  {
    id: '3',
    title: '마케팅 캠페인 계획 수립',
    description: '신규 제품 출시를 위한 디지털 마케팅 전략 개발',
    assignedTo: ['3'],
    status: 'review',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    progress: 80,
    isDeleted: false,
  },
  {
    id: '4',
    title: '프로젝트 일정 관리',
    description: '팀원들의 작업 진행 상황 모니터링 및 일정 조정',
    assignedTo: ['4'],
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    progress: 100,
    isDeleted: false,
  },
];

interface TaskStore {
  tasks: Task[];
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskProgress: (id: string, progress: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markTaskAsDeleted: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  
  getEmployee: (id: string) => Employee | undefined;
  getTasksForEmployee: (employeeId: string) => Task[];
  
  getVisibleTasks: () => Task[];
  getDeletedTasks: () => Task[];
  canManageTask: (taskId: string) => boolean;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  employees: [],
  isLoading: true,
  error: null,
  
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        set({ error: error.message, isLoading: false, tasks: mockTasks });
        return;
      }
      
      if (data) {
        const formattedTasks = data.map(task => {
          let assignedTo: string[] = [];
          if (Array.isArray(task.assigned_to)) {
            assignedTo = task.assigned_to
              .filter(id => id !== null && id !== undefined)
              .map(id => String(id));
          } else if (task.assigned_to) {
            assignedTo = [String(task.assigned_to)];
          }
          
          let attachments: string[] = [];
          if (Array.isArray(task.attachments)) {
            attachments = task.attachments
              .filter(path => path !== null && path !== undefined)
              .map(path => String(path));
          }
          
          const formattedTask: Task = {
            id: task.id.toString(),
            title: task.title,
            description: task.description,
            assignedTo,
            status: task.status as TaskStatus,
            priority: task.priority as 'low' | 'medium' | 'high',
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            dueDate: task.due_date,
            progress: task.progress,
            isDeleted: task.is_deleted,
            deletedAt: task.deleted_at,
            attachments: attachments,
            createdBy: (task as any).created_by !== undefined ? String((task as any).created_by) : undefined
          };
          
          return formattedTask;
        });
        
        console.log("Fetched tasks:", formattedTasks);
        set({ tasks: formattedTasks, isLoading: false });
      } else {
        set({ tasks: mockTasks, isLoading: false });
      }
      
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*');
        
      if (!employeesError && employeesData) {
        const formattedEmployees = employeesData.map(emp => ({
          id: emp.id.toString(),
          name: emp.name,
          position: emp.position,
          department: emp.department,
          avatar: emp.avatar,
          accessCode: emp.access_code,
          accessLevel: emp.access_level,
        })) as Employee[];
        
        set({ employees: formattedEmployees });
      }
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false, 
        tasks: mockTasks 
      });
    }
  },
  
  addTask: async (taskData) => {
    const { isAdmin, currentUser } = useAuthStore.getState();
    console.log("Adding task with data:", taskData);
    console.log("Current user:", currentUser);
    
    try {
      set({ isLoading: true, error: null });
      
      const createdBy = taskData.createdBy || (currentUser ? currentUser.id : undefined);
      console.log("Using creator ID:", createdBy);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assignedTo,
          status: taskData.status,
          priority: taskData.priority,
          progress: taskData.progress || 0,
          due_date: taskData.dueDate,
          attachments: taskData.attachments || [],
          created_by: createdBy,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding task:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      if (data) {
        let assignedTo: string[] = [];
        if (Array.isArray(data.assigned_to)) {
          assignedTo = data.assigned_to
            .filter(id => id !== null && id !== undefined)
            .map(id => String(id));
        } else if (data.assigned_to) {
          assignedTo = [String(data.assigned_to)];
        }
        
        const newTask: Task = {
          id: data.id.toString(),
          title: data.title,
          description: data.description,
          assignedTo,
          status: data.status as TaskStatus,
          priority: data.priority as 'low' | 'medium' | 'high',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dueDate: data.due_date,
          progress: data.progress,
          isDeleted: data.is_deleted,
          attachments: data.attachments,
          createdBy: (data as any).created_by !== undefined ? String((data as any).created_by) : undefined
        };
        
        console.log("Added new task:", newTask);
        
        set(state => ({
          tasks: [newTask, ...state.tasks],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Unexpected error adding task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  updateTask: async (id, updates) => {
    const { isAdmin, currentUser } = useAuthStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (!isAdmin && currentUser && task && !task.assignedTo.includes(currentUser.id)) {
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.progress !== undefined) updateData.progress = updates.progress;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.isDeleted !== undefined) updateData.is_deleted = updates.isDeleted;
      if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating task:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { ...task, ...updates, updatedAt: new Date().toISOString() } 
            : task
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error updating task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  updateTaskStatus: async (id, status) => {
    const { isAdmin, currentUser } = useAuthStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (!isAdmin && currentUser && task && !task.assignedTo.includes(currentUser.id)) {
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      let progress = task?.progress || 0;
      if (status === 'completed') progress = 100;
      else if (task?.status === 'completed' && task.progress === 100) progress = 90;
      
      const { error } = await supabase
        .from('tasks')
        .update({
          status,
          progress,
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating task status:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                status, 
                updatedAt: new Date().toISOString(),
                progress: status === 'completed' ? 100 : 
                  (task.status === 'completed' && task.progress === 100 ? 90 : task.progress)
              } 
            : task
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error updating task status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  updateTaskProgress: async (id, progress) => {
    const { isAdmin, currentUser } = useAuthStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (!isAdmin && currentUser && task && !task.assignedTo.includes(currentUser.id)) {
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      let status = task?.status || 'pending';
      if (progress === 100) status = 'completed';
      else if (progress === 0) status = 'pending';
      
      const { error } = await supabase
        .from('tasks')
        .update({
          progress,
          status,
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating task progress:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                progress, 
                updatedAt: new Date().toISOString(),
                status: progress === 100 
                  ? 'completed' 
                  : progress === 0 
                    ? 'pending' 
                    : task.status
              } 
            : task
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error updating task progress:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  deleteTask: async (id) => {
    const { isAdmin, currentUser, hasAdminPrivileges } = useAuthStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (!task) {
      console.log(`Task with id ${id} not found`);
      return;
    }
    
    const canDelete = hasAdminPrivileges() || 
                     (currentUser && (
                       task.assignedTo.includes(currentUser.id) || 
                       task.createdBy === currentUser.id
                     ));
    
    if (!canDelete) {
      console.log("Permission denied: User cannot delete this task");
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      console.log(`Attempting to delete task with id: ${id}`);
      
      if (task?.attachments && task.attachments.length > 0) {
        console.log(`Deleting ${task.attachments.length} attachments for task ${id}`);
        
        const { error: storageError } = await supabase.storage
          .from('task_attachments')
          .remove(task.attachments);
          
        if (storageError) {
          console.error('Error deleting task attachments from storage:', storageError);
          // Continue with task deletion even if attachment deletion fails
        } else {
          console.log(`Successfully deleted ${task.attachments.length} files from storage`);
        }
      }
      
      const { error, data } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error deleting task from database:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      console.log(`Task deleted successfully from Supabase`, data);
      
      set(state => {
        const updatedTasks = state.tasks.filter(task => task.id !== id);
        console.log(`Local state updated, removed task ${id}. New count: ${updatedTasks.length}`);
        return {
          tasks: updatedTasks,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Unexpected error deleting task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  markTaskAsDeleted: async (id) => {
    const { isAdmin, currentUser, hasAdminPrivileges } = useAuthStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (!task) {
      console.log("Cannot mark as deleted: Task not found");
      return;
    }
    
    if (task.status !== 'completed') {
      console.log("Cannot mark as deleted: Task not completed");
      return;
    }
    
    const canMarkAsDeleted = hasAdminPrivileges() || 
                            (currentUser && (
                              task.assignedTo.includes(currentUser.id) || 
                              task.createdBy === currentUser.id
                            ));
    
    if (!canMarkAsDeleted) {
      console.log("Permission denied: User cannot mark this task as deleted");
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      console.log(`Marking task ${id} as deleted`);
      
      const { error, data } = await supabase
        .from('tasks')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error marking task as deleted:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      console.log(`Task ${id} marked as deleted successfully`, data);
      
      set(state => {
        const updatedTasks = state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                isDeleted: true, 
                deletedAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString()
              } 
            : task
        );
        console.log(`Local state updated for task ${id}. IsDeleted: ${updatedTasks.find(t => t.id === id)?.isDeleted}`);
        return {
          tasks: updatedTasks,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Unexpected error marking task as deleted:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  restoreTask: async (id) => {
    const { isAdmin, currentUser } = useAuthStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (!isAdmin && currentUser && task && !task.assignedTo.includes(currentUser.id)) {
      console.log("Permission denied: User cannot restore this task");
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      console.log(`Restoring task ${id}`);
      
      const { error, data } = await supabase
        .from('tasks')
        .update({
          is_deleted: false,
          deleted_at: null,
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error restoring task:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      console.log(`Task ${id} restored successfully`, data);
      
      set(state => {
        const updatedTasks = state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                isDeleted: false, 
                deletedAt: undefined, 
                updatedAt: new Date().toISOString()
              } 
            : task
        );
        console.log(`Local state updated for task ${id}. IsDeleted: ${updatedTasks.find(t => t.id === id)?.isDeleted}`);
        return {
          tasks: updatedTasks,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Unexpected error restoring task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  getEmployee: (id) => {
    return get().employees.find((employee) => employee.id === id);
  },
  
  getTasksForEmployee: (employeeId) => {
    return get().tasks.filter((task) => task.assignedTo.includes(employeeId) && !task.isDeleted);
  },
  
  getVisibleTasks: () => {
    const { isAdmin, currentUser, hasAdminPrivileges } = useAuthStore.getState();
    const allTasks = get().tasks.filter(task => !task.isDeleted);
    
    console.log("Getting visible tasks for user:", currentUser ? {
      userId: currentUser.id,
      userName: currentUser.name,
      accessLevel: currentUser.accessLevel,
      department: currentUser.department
    } : "No current user (or admin)");
    
    console.log("Total non-deleted tasks:", allTasks.length);
    console.log("User has admin privileges:", hasAdminPrivileges());
    
    // 개발 환경에서는 모든 태스크를 보여주도록 임시 수정
    // 또는 관리자 권한이 있으면 모든 태스크 표시
    if (hasAdminPrivileges()) {
      console.log("User has admin privileges - showing all tasks");
      return allTasks;
    }
    
    // 사용자가 로그인하지 않았어도 기본적으로 모든 태스크를 보여줌 (임시)
    if (!currentUser) {
      console.log("No current user - showing all tasks for development");
      return allTasks;
    }
    
    if (currentUser) {
      if (currentUser.accessLevel === 'department' && currentUser.department) {
        const departmentEmployeeIds = useEmployeeStore.getState().employees
          .filter(emp => emp.department === currentUser.department)
          .map(emp => emp.id);
        
        console.log("Department employee IDs:", departmentEmployeeIds);
        
        const departmentTasks = allTasks.filter(task => 
          task.assignedTo.some(assigneeId => departmentEmployeeIds.includes(assigneeId)) || 
          task.createdBy === currentUser.id
        );
        
        console.log("Found department tasks:", departmentTasks.length);
        return departmentTasks;
      }
      
      const userTasks = allTasks.filter(task => 
        task.assignedTo.includes(currentUser.id) || 
        task.createdBy === currentUser.id
      );
      
      console.log("Found user tasks:", userTasks.length);
      return userTasks;
    }
    
    console.log("Fallback - returning all tasks");
    return allTasks;
  },
  
  getDeletedTasks: () => {
    const { isAdmin, currentUser, hasAdminPrivileges } = useAuthStore.getState();
    const deletedTasks = get().tasks.filter(task => task.isDeleted);
    
    console.log("Getting deleted tasks. Total count:", deletedTasks.length);
    
    if (hasAdminPrivileges()) {
      console.log("User has admin privileges - showing all deleted tasks");
      return deletedTasks;
    }
    
    if (currentUser?.accessLevel === 'department' && currentUser.department) {
      const departmentEmployeeIds = useEmployeeStore.getState().employees
        .filter(emp => emp.department === currentUser.department)
        .map(emp => emp.id);
      
      const departmentDeletedTasks = deletedTasks.filter(task => 
        task.assignedTo.some(assigneeId => departmentEmployeeIds.includes(assigneeId)) ||
        task.createdBy === currentUser.id
      );
      
      console.log("Department deleted tasks:", departmentDeletedTasks.length);
      return departmentDeletedTasks;
    }
    
    if (currentUser) {
      const userDeletedTasks = deletedTasks.filter(task => 
        task.assignedTo.includes(currentUser.id) || 
        task.createdBy === currentUser.id
      );
      
      console.log("User deleted tasks:", userDeletedTasks.length);
      return userDeletedTasks;
    }
    
    console.log("No user access - returning empty deleted tasks array");
    return [];
  },
  
  canManageTask: (taskId: string) => {
    const { isAdmin, currentUser, hasAdminPrivileges } = useAuthStore.getState();
    
    if (hasAdminPrivileges()) return true;
    
    // 개발 환경에서는 모든 태스크를 관리 가능하도록 임시 수정
    if (!currentUser) {
      return true;
    }
    
    if (currentUser) {
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) return false;
      
      if (currentUser.accessLevel === 'department') {
        const departmentEmployeeIds = useEmployeeStore.getState().employees
          .filter(emp => emp.department === currentUser.department)
          .map(emp => emp.id);
        
        return task.assignedTo.some(assigneeId => departmentEmployeeIds.includes(assigneeId)) ||
               task.createdBy === currentUser.id;
      }
      
      return task.assignedTo.includes(currentUser.id) || task.createdBy === currentUser.id;
    }
    
    return true; // 기본적으로 관리 가능하도록 설정
  },
}));

export const setupTaskSubscription = () => {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        console.log("Real-time update received from Supabase:", payload);
        useTaskStore.getState().fetchTasks();
      }
    )
    .subscribe();

  return channel;
};
