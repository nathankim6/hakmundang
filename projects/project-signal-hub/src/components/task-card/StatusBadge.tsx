
import { Task } from "@/lib/types";

interface StatusBadgeProps {
  status: Task['status'];
}

export function getStatusText(status: Task['status']) {
  switch (status) {
    case 'pending': return '대기 중';
    case 'in_progress': return '진행 중';
    case 'review': return '검토 요청';
    case 'completed': return '완료됨';
    default: return status;
  }
}

export function getStatusColor(status: Task['status']) {
  switch (status) {
    case 'pending': 
      return 'from-slate-50 to-slate-100 text-slate-700 border-slate-200 dark:from-slate-800/50 dark:to-slate-800/30 dark:text-slate-300 dark:border-slate-700';
    case 'in_progress': 
      return 'from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-900/30 dark:to-blue-900/20 dark:text-blue-300 dark:border-blue-800/50';
    case 'review': 
      return 'from-amber-50 to-amber-100 text-amber-700 border-amber-200 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-300 dark:border-amber-800/50';
    case 'completed': 
      return 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 dark:from-emerald-900/30 dark:to-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50';
    default: 
      return 'from-slate-50 to-slate-100 text-slate-700 border-slate-200 dark:from-slate-800/50 dark:to-slate-800/30 dark:text-slate-300 dark:border-slate-700';
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`infographic-badge bg-gradient-to-r ${getStatusColor(status)} border flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse-gentle ${
        status === 'completed' ? 'bg-emerald-500' : 
        status === 'in_progress' ? 'bg-blue-500' : 
        status === 'review' ? 'bg-amber-500' : 
        'bg-slate-500'
      }`} />
      {getStatusText(status)}
    </span>
  );
}
