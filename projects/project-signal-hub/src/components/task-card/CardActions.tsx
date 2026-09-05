
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2, Trash } from "lucide-react";
import { Task } from "@/lib/types";
import { useAuthStore } from "@/lib/authStore";
import { useTaskStore } from "@/lib/taskStore";

interface CardActionsProps {
  task: Task;
  isHovered: boolean;
  isUpdating: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onMarkAsDeletedClick: () => void;
}

export function CardActions({ 
  task, 
  isHovered, 
  isUpdating, 
  onEditClick, 
  onDeleteClick, 
  onMarkAsDeletedClick 
}: CardActionsProps) {
  const { currentUser, hasAdminPrivileges } = useAuthStore();
  const { canManageTask } = useTaskStore();
  
  // 사용자가 이 업무를 관리할 수 있는지 확인
  const canManage = canManageTask(task.id);
  
  // 사용자 권한이 없으면 버튼을 렌더링하지 않음
  if (!canManage) return null;
  
  return (
    <div 
      className={`absolute top-2 right-2 flex gap-1 z-50 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEditClick} 
              disabled={isUpdating}
              className="h-7 w-7 bg-white/80 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700"
              aria-label="업무 수정"
            >
              <Edit2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>수정</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
          
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {task.status === 'completed' ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onMarkAsDeletedClick} 
                disabled={isUpdating}
                className="h-7 w-7 bg-white/80 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700"
                aria-label="업무 삭제"
              >
                <Trash className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onDeleteClick} 
                disabled={isUpdating}
                className="h-7 w-7 bg-white/80 hover:bg-red-100 dark:bg-gray-800/80 dark:hover:bg-red-900/50"
                aria-label="업무 영구 삭제"
              >
                <Trash className="h-3.5 w-3.5 text-red-500" />
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{task.status === 'completed' ? '삭제' : '영구삭제'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
