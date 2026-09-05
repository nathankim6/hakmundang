
import { Task } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TaskStatusActionsProps {
  task?: Task;
  currentStatus: Task['status'];
  onStatusChange: (newStatus: Task['status']) => void;
  isUpdating: boolean;
}

export function TaskStatusActions({ currentStatus, onStatusChange, isUpdating }: TaskStatusActionsProps) {
  // Define status order for navigation
  const statusOrder: Task['status'][] = ['pending', 'in_progress', 'review', 'completed'];
  
  // Find current status index
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  // Determine if previous/next are available
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < statusOrder.length - 1;
  
  // Get previous/next status
  const previousStatus = hasPrevious ? statusOrder[currentIndex - 1] : currentStatus;
  const nextStatus = hasNext ? statusOrder[currentIndex + 1] : currentStatus;
  
  // Get button styles based on status
  const getPreviousButtonClass = () => {
    const baseClasses = "px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors";
    
    switch (previousStatus) {
      case 'pending':
        return `${baseClasses} bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300`;
      case 'in_progress':
        return `${baseClasses} bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300`;
      case 'review':
        return `${baseClasses} bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-800/50 dark:text-amber-300`;
      case 'completed':
        return `${baseClasses} bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 dark:text-emerald-300`;
      default:
        return `${baseClasses} bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300`;
    }
  };
  
  const getNextButtonClass = () => {
    const baseClasses = "px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors";
    
    switch (nextStatus) {
      case 'pending':
        return `${baseClasses} bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300`;
      case 'in_progress':
        return `${baseClasses} bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300`;
      case 'review':
        return `${baseClasses} bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-800/50 dark:text-amber-300`;
      case 'completed':
        return `${baseClasses} bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 dark:text-emerald-300`;
      default:
        return `${baseClasses} bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300`;
    }
  };

  return (
    <div className="flex gap-1.5">
      {hasPrevious && (
        <button
          onClick={() => onStatusChange(previousStatus)}
          disabled={isUpdating}
          className={getPreviousButtonClass()}
          title="이전 단계로"
        >
          <ArrowLeft size={14} />
          이전 단계로
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={() => onStatusChange(nextStatus)}
          disabled={isUpdating}
          className={getNextButtonClass()}
          title="다음 단계로"
        >
          다음 단계로
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
