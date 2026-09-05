import { useState } from "react";
import { Task } from "@/lib/types";
import { useTaskStore } from "@/lib/taskStore";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { TaskDueDate } from "./TaskDueDate";
import { TaskAssignee } from "./TaskAssignee";
import { TaskStatusActions } from "./TaskStatusActions";
import { TaskForm } from "@/components/task-form";
import { CardActions } from "./CardActions";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { TaskAttachments } from "./TaskAttachments";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentLabel } from "./DepartmentLabel";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";
interface TaskCardProps {
  task: Task;
}
export function TaskCard({
  task
}: TaskCardProps) {
  const {
    deleteTask,
    markTaskAsDeleted,
    canManageTask
  } = useTaskStore();
  const {
    toast
  } = useToast();
  const {
    currentUser,
    hasAdminPrivileges
  } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const canManage = canManageTask(task.id);
  
  // 새 업무 효과 조건:
  // 1. 일반 직원: 자신이 담당자로 지정되고 마지막 로그인 후 생성된 업무
  // 2. 관리자: 24시간 안에 생성된 업무 또는 담당자가 아직 확인하지 않은 업무
  const authStore = useAuthStore.getState();
  const isNewTask = hasAdminPrivileges() 
    ? authStore.isTaskCreatedWithin24Hours(task.createdAt) // 관리자: 24시간 내 생성된 업무
    : (currentUser && 
       task.assignedTo?.includes(currentUser.id) && 
       authStore.isNewTask(task.createdAt)); // 일반 직원: 자신에게 할당된 새 업무
  
  // 디버깅용 로그
  console.log('Task Card Debug:', {
    taskId: task.id,
    taskTitle: task.title,
    createdAt: task.createdAt,
    isNewTask,
    currentUser: currentUser?.id,
    hasAdminPrivileges: hasAdminPrivileges(),
    assignedTo: task.assignedTo
  });
  const onStatusChange = async (status: Task["status"]) => {
    if (!canManage) return;
    setIsUpdating(true);
    try {
      await useTaskStore.getState().updateTaskStatus(task.id, status);
      toast({
        description: `업무 상태가 "${status === 'pending' ? '대기 중' : status === 'in_progress' ? '진행 중' : status === 'review' ? '검토 요청' : '완료됨'}"으로 변경되었습니다.`
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "오류",
        description: "업무 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const onDeleteClick = () => {
    if (!canManage) return;
    setShowDeleteDialog(true);
  };
  const handleDeleteTask = async () => {
    if (!canManage) return;
    setIsUpdating(true);
    try {
      console.log("Deleting task with ID:", task.id);
      console.log("Current user:", currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        accessLevel: currentUser.accessLevel
      } : "Not logged in");
      console.log("Task details:", {
        id: task.id,
        title: task.title,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy
      });
      if (task.attachments && task.attachments.length > 0) {
        console.log('Deleting attachments:', task.attachments);
        await Promise.all(task.attachments.map(async filePath => {
          try {
            const {
              error
            } = await supabase.storage.from('task_attachments').remove([filePath]);
            if (error) {
              console.error(`Error deleting file ${filePath}:`, error);
            } else {
              console.log(`Successfully deleted file: ${filePath}`);
            }
          } catch (fileError) {
            console.error(`Exception deleting file ${filePath}:`, fileError);
          }
        }));
      }
      await deleteTask(task.id);
      toast({
        description: "업무가 영구적으로 삭제되었습니다."
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "오류",
        description: "업무 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
    }
  };
  const handleMarkAsDeleted = async () => {
    if (!canManage) return;
    setIsUpdating(true);
    try {
      console.log("Marking task as deleted, ID:", task.id);
      console.log("Current user:", currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        accessLevel: currentUser.accessLevel
      } : "Not logged in");
      await markTaskAsDeleted(task.id);
      toast({
        description: "업무가 삭제 예정으로 표시되었습니다."
      });
    } catch (error) {
      console.error('Error marking task as deleted:', error);
      toast({
        title: "오류",
        description: "업무 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const handleEditClick = () => {
    if (!canManage) return;
    setShowEditForm(true);
  };
  // 개발 환경에서는 모든 카드를 표시하도록 임시 수정
  // if (!canManage && !hasAdminPrivileges()) return null;
  return <div className={cn("infographic-card", "before:absolute before:inset-0 before:rounded-xl before:border before:border-slate-200/20", "before:bg-gradient-to-br before:from-white/10 before:to-transparent", "before:pointer-events-none dark:before:border-slate-700/30", isHovered && "transform-gpu", isNewTask && "animate-new-task-glow")} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <DepartmentLabel employeeIds={task.assignedTo} />
      
      <CardActions task={task} isHovered={isHovered} isUpdating={isUpdating} onEditClick={handleEditClick} onDeleteClick={onDeleteClick} onMarkAsDeletedClick={handleMarkAsDeleted} />
      
      <div className="infographic-header">
        <div className={cn("flex items-center gap-2 mb-3", "animate-in fade-in slide-in-from-bottom-2")}>
          <StatusBadge status={task.status} />
          <div className="ml-2">
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
      </div>
      
      <h3 className="infographic-title mb-2 text-sm bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm text-slate-600">{task.title}</h3>
      
      {task.description && <p className="text-muted-foreground mb-3 whitespace-pre-line text-xs">
          {task.description}
        </p>}
      
      <TaskAttachments task={task} />
      
      {canManage && <div className="mt-4 animate-in fade-in-50 slide-in-from-bottom-1">
          <TaskStatusActions currentStatus={task.status} onStatusChange={onStatusChange} isUpdating={isUpdating} />
        </div>}
      
      <div className="flex flex-wrap items-start justify-between mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <TaskAssignee employeeIds={task.assignedTo} taskId={task.id} />
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-right">
        <TaskDueDate dueDate={task.dueDate} createdAt={task.createdAt} />
      </div>
      
      <DeleteTaskDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} onConfirm={handleDeleteTask} task={task} isLoading={isUpdating} />
      
      <TaskForm mode="edit" task={task} open={showEditForm} onOpenChange={setShowEditForm} />
    </div>;
}