
import { useState } from "react";
import { useTaskStore } from "@/lib/taskStore";
import { Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./task-card/PriorityBadge";
import { TaskAssignee } from "./task-card/TaskAssignee";
import { TaskDueDate } from "./task-card/TaskDueDate";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";
import { format } from "date-fns";

export function DeletedTaskList() {
  const { toast } = useToast();
  const { getDeletedTasks, restoreTask } = useTaskStore();
  const deletedTasks = getDeletedTasks();
  const [restoringTasks, setRestoringTasks] = useState<Record<string, boolean>>({});
  
  const handleRestoreTask = (task: Task) => {
    setRestoringTasks(prev => ({ ...prev, [task.id]: true }));
    
    // Simulate API call
    setTimeout(() => {
      restoreTask(task.id);
      
      toast({
        title: "업무 복원",
        description: `'${task.title}' 업무가 복원되었습니다.`,
      });
      
      setRestoringTasks(prev => ({ ...prev, [task.id]: false }));
    }, 600);
  };
  
  if (deletedTasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 bg-muted/30 rounded-lg border border-dashed">
        삭제된 업무가 없습니다
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deletedTasks.map((task) => {
          const isRestoring = restoringTasks[task.id];
          
          return (
            <Card 
              key={task.id} 
              className={`animate-scale-in ${isRestoring ? 'opacity-60' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex gap-2 mb-1">
                      <PriorityBadge priority={task.priority} />
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-800">
                        삭제됨
                      </span>
                    </div>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm mt-1">
                    <TaskAssignee employeeIds={task.assignedTo} />
                    <TaskDueDate dueDate={task.dueDate} />
                  </div>
                  
                  {task.deletedAt && (
                    <div className="text-xs text-muted-foreground">
                      삭제 날짜: {format(new Date(task.deletedAt), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRestoreTask(task)}
                  disabled={isRestoring}
                  className="h-8"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  복원하기
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
