import { Task } from "@/lib/types";

interface PriorityBadgeProps {
  priority: Task['priority'];
}

export function getPriorityText(priority: Task['priority']) {
  switch (priority) {
    case 'low': return '낮음';
    case 'medium': return '중간';
    case 'high': return '높음';
    default: return '미정';
  }
}

export function getPriorityColor(priority: Task['priority']) {
  switch (priority) {
    case 'low': 
      return 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 dark:from-emerald-900/30 dark:to-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50';
    case 'medium': 
      return 'from-amber-50 to-amber-100 text-amber-700 border-amber-200 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-300 dark:border-amber-800/50';
    case 'high': 
      return 'from-rose-50 to-rose-100 text-rose-700 border-rose-200 dark:from-rose-900/30 dark:to-rose-900/20 dark:text-rose-300 dark:border-rose-800/50';
    default: 
      return 'from-slate-50 to-slate-100 text-slate-700 border-slate-200 dark:from-slate-800/50 dark:to-slate-800/30 dark:text-slate-300 dark:border-slate-700';
  }
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`infographic-badge bg-gradient-to-r ${getPriorityColor(priority)} border flex items-center justify-center`}>
      {getPriorityText(priority)}
    </span>
  );
}
