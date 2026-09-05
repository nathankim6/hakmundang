
import { useTaskStore } from "@/lib/taskStore";
import { CheckCircle2, Clock, FileCheck2, ListTodo } from "lucide-react";

export const DashboardStats = () => {
  const { getVisibleTasks } = useTaskStore();
  const tasks = getVisibleTasks();
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const reviewTasks = tasks.filter(task => task.status === 'review').length;
  
  const stats = [
    {
      title: "총 업무",
      value: totalTasks,
      icon: <ListTodo />,
      color: "bg-slate-50 dark:bg-slate-800",
      iconColor: "text-slate-500 dark:text-slate-400",
      delay: "100ms"
    },
    {
      title: "진행 중인 업무",
      value: inProgressTasks,
      icon: <Clock />,
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-500 dark:text-blue-400",
      delay: "200ms"
    },
    {
      title: "검토 중인 업무",
      value: reviewTasks,
      icon: <FileCheck2 />,
      color: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-500 dark:text-amber-400",
      delay: "300ms"
    },
    {
      title: "완료된 업무",
      value: completedTasks,
      icon: <CheckCircle2 />,
      color: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-500 dark:text-green-400",
      delay: "400ms"
    }
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`app-card rounded-lg px-3 py-2 shadow-sm flex items-center justify-center text-center animate-slide-in ${stat.color}`}
          style={{ animationDelay: stat.delay }}
        >
          <div>
            <div className={`text-lg font-bold ${stat.iconColor}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
