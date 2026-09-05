import { Clock, Calendar } from "lucide-react";

interface TaskDueDateProps {
  dueDate?: string;
  createdAt?: string;
}

export function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function TaskDueDate({
  dueDate,
  createdAt
}: TaskDueDateProps) {
  return (
    <div className="space-y-1">
      {createdAt && (
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">배정일: {formatDate(createdAt)}</span>
        </div>
      )}
      {dueDate && (
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">마감일: {formatDate(dueDate)}</span>
        </div>
      )}
    </div>
  );
}