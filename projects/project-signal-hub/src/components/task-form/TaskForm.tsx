import { useState, useEffect } from "react";
import { useTaskStore } from "@/lib/taskStore";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { parse } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormButtons } from "./FormButtons";
import { TaskFormFields, formSchema, FormValues } from "./TaskFormFields";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/authStore";

interface TaskFormProps {
  mode?: 'add' | 'edit';
  task?: Task;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showDefaultTrigger?: boolean;
}

export function TaskForm({
  mode = 'add',
  task,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  showDefaultTrigger = false
}: TaskFormProps) {
  const { toast } = useToast();
  const { addTask, updateTask, employees } = useTaskStore();
  const { currentUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [dateInputTab, setDateInputTab] = useState<string>("calendar");
  const [dateText, setDateText] = useState("");
  const [dateError, setDateError] = useState("");
  
  const isControlled = externalOpen !== undefined && externalOnOpenChange !== undefined;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      assignedTo: task?.assignedTo || [],
      priority: task?.priority || "medium",
      dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
      attachments: [],
      filePaths: [],
      fileMetadata: [],
    },
  });
  
  useEffect(() => {
    if (mode === 'edit' && task) {
      form.reset({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        attachments: task.attachments || [],
        filePaths: task.attachments || [], // Use existing attachments if available
        fileMetadata: [], // This will be populated if we have file metadata
      });
      
      if (task.dueDate) {
        setDateText(format(new Date(task.dueDate), "yyyy-MM-dd"));
      }
    }
  }, [mode, task, form]);
  
  useEffect(() => {
    const dueDate = form.watch("dueDate");
    if (dueDate) {
      setDateText(format(dueDate, "yyyy-MM-dd"));
    } else {
      setDateText("");
    }
  }, [form.watch("dueDate")]);
  
  useEffect(() => {
    if (isControlled && externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [isControlled, externalOpen]);
  
  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateText(e.target.value);
    setDateError("");
    
    try {
      if (e.target.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsedDate = parse(e.target.value, "yyyy-MM-dd", new Date());
        if (!isNaN(parsedDate.getTime())) {
          form.setValue("dueDate", parsedDate);
        } else {
          setDateError("유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 입력해주세요.");
        }
      }
    } catch (error) {
      setDateError("유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 입력해주세요.");
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    const filePaths = values.filePaths || [];
    
    if (mode === 'add') {
      const creatorId = currentUser?.id;
      console.log("업무 생성 - 생성자 ID:", creatorId);
      
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'> = {
        title: values.title,
        description: values.description || "",
        assignedTo: values.assignedTo,
        priority: values.priority,
        status: "pending",
        progress: 0,
        dueDate: values.dueDate?.toISOString(),
        attachments: filePaths,
        createdBy: creatorId,
      };
      
      console.log("생성할 업무 데이터:", newTask);
      await addTask(newTask);
      
      toast({
        title: "업무 추가",
        description: "새로운 업무가 추가되었습니다.",
      });
    } else if (mode === 'edit' && task) {
      await updateTask(task.id, {
        title: values.title,
        description: values.description || "",
        assignedTo: values.assignedTo,
        priority: values.priority,
        dueDate: values.dueDate?.toISOString(),
        attachments: filePaths,
      });
      
      toast({
        title: "업무 수정",
        description: "업무가 성공적으로 수정되었습니다.",
      });
    }
    
    form.reset();
    handleDialogClose();
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("dueDate", date);
      setDateText(format(date, "yyyy-MM-dd"));
    }
  };
  
  const handleDialogClose = () => {
    if (isControlled) {
      externalOnOpenChange?.(false);
    } else {
      setOpen(false);
    }
  };
  
  const handleDialogOpen = () => {
    if (isControlled) {
      externalOnOpenChange?.(true);
    } else {
      setOpen(true);
    }
  };
  
  return (
    <Dialog open={isControlled ? externalOpen : open} onOpenChange={isControlled ? externalOnOpenChange : setOpen}>
      {trigger ? (
        <DialogTrigger asChild onClick={handleDialogOpen}>
          {trigger}
        </DialogTrigger>
      ) : showDefaultTrigger ? (
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/25 group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              새 업무 추가
            </span>
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[1050px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '새 업무 추가' : '업무 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? '직원에게 새로운 업무를 할당합니다.' : '업무 세부사항을 수정합니다.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <TaskFormFields
              form={form}
              employees={employees}
              dateText={dateText}
              dateError={dateError}
              setDateText={setDateText}
              setDateError={setDateError}
              dateInputTab={dateInputTab}
              setDateInputTab={setDateInputTab}
              handleCalendarSelect={handleCalendarSelect}
              handleDateTextChange={handleDateTextChange}
            />
            
            <FormButtons 
              onCancel={handleDialogClose}
              submitText={mode === 'add' ? '추가' : '수정'}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
