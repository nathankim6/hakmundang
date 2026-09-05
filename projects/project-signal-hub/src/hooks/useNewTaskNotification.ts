import { useEffect, useState } from 'react';
import { Task } from '@/lib/types';
import { useAuthStore } from '@/lib/authStore';
import { supabase } from '@/integrations/supabase/client';

export function useNewTaskNotification() {
  const [newTask, setNewTask] = useState<Task | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { currentUser, hasAdminPrivileges } = useAuthStore();

  useEffect(() => {
    if (!currentUser || hasAdminPrivileges()) {
      return; // 관리자는 알림을 받지 않음
    }

    const channel = supabase
      .channel('task_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('New task created:', payload);
          
          if (payload.new) {
            const newTaskData = payload.new;
            
            // 현재 사용자가 담당자로 지정되었는지 확인
            const assignedTo = newTaskData.assigned_to || [];
            const isAssignedToCurrentUser = Array.isArray(assignedTo) && 
              assignedTo.includes(currentUser.id);
            
            if (isAssignedToCurrentUser) {
              // Task 형식으로 변환
              const formattedTask: Task = {
                id: newTaskData.id.toString(),
                title: newTaskData.title,
                description: newTaskData.description,
                assignedTo: Array.isArray(assignedTo) ? assignedTo.map(id => String(id)) : [],
                status: newTaskData.status,
                priority: newTaskData.priority,
                createdAt: newTaskData.created_at,
                updatedAt: newTaskData.updated_at,
                dueDate: newTaskData.due_date,
                progress: newTaskData.progress || 0,
                isDeleted: newTaskData.is_deleted || false,
                attachments: newTaskData.attachments || [],
                createdBy: newTaskData.created_by ? String(newTaskData.created_by) : undefined,
              };
              
              setNewTask(formattedTask);
              setShowNotification(true);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, hasAdminPrivileges]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewTask(null);
  };

  return {
    newTask,
    showNotification,
    handleCloseNotification
  };
}