import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User } from "lucide-react";
import { Task } from "@/lib/types";
import { useAuthStore } from "@/lib/authStore";
import { useEmployeeStore } from "@/lib/employeeStore";
import { supabase } from "@/integrations/supabase/client";

interface NewTaskNotificationProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskNotification({ task, open, onOpenChange }: NewTaskNotificationProps) {
  const { employees } = useEmployeeStore();
  
  const assigneeNames = task?.assignedTo
    ?.map(id => employees.find(emp => emp.id === id)?.name)
    .filter(name => name)
    .join(', ') || '담당자 없음';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '설정되지 않음';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <User className="w-5 h-5" />
            새로운 업무가 할당되었습니다!
          </DialogTitle>
          <DialogDescription>
            다음 업무가 귀하에게 할당되었습니다.
          </DialogDescription>
        </DialogHeader>
        
        {task && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getPriorityColor(task.priority)}>
                  우선순위: {getPriorityText(task.priority)}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>담당자: {assigneeNames}</span>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span>마감일: {formatDate(task.dueDate)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>생성일: {formatDate(task.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}