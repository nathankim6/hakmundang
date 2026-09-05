import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateFieldTabs } from "./DateFieldTabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Employee, EmployeeDepartment } from "@/lib/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TaskAttachments } from "./TaskAttachments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const formSchema = z.object({
  title: z.string().min(2, {
    message: "제목은 2글자 이상이어야 합니다.",
  }),
  description: z.string().optional(),
  assignedTo: z.array(z.string()),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional(),
  attachments: z.array(z.string()).optional(),
  filePaths: z.array(z.string()).optional(),
  fileMetadata: z.array(z.object({
    path: z.string(),
    originalName: z.string()
  })).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface TaskFormFieldsProps {
  form: UseFormReturn<FormValues>;
  employees: Employee[];
  dateText: string;
  dateError: string;
  dateInputTab: string;
  setDateInputTab: (tab: string) => void;
  setDateText: (text: string) => void;
  setDateError: (error: string) => void;
  handleCalendarSelect: (date: Date | undefined) => void;
  handleDateTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const getDepartmentName = (department: EmployeeDepartment): string => {
  switch (department) {
    case 'administration':
      return '행정부';
    case 'elementary':
      return '초등부';
    case 'middle':
      return '중등부';
    case 'high':
      return '고등부';
    case 'assistant':
      return '조교부';
    case 'operations':
      return '운영본부';
    default:
      return '';
  }
};

const getDepartmentIcon = (department: EmployeeDepartment): string => {
  switch (department) {
    case 'administration':
      return '🏢';
    case 'elementary':
      return '🧸';
    case 'middle':
      return '✏️';
    case 'high':
      return '🎓';
    case 'assistant':
      return '👨‍🏫';
    case 'operations':
      return '⚙️';
    default:
      return '📄';
  }
};

const getDepartmentStyle = (department: EmployeeDepartment): string => {
  switch (department) {
    case 'administration':
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700/50 dark:text-indigo-300';
    case 'elementary':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-300';
    case 'middle':
      return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-300';
    case 'high':
      return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700/50 dark:text-rose-300';
    case 'assistant':
      return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700/50 dark:text-purple-300';
    case 'operations':
      return 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/30 dark:border-cyan-700/50 dark:text-cyan-300';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300';
  }
};

export function TaskFormFields({
  form,
  employees,
  dateText,
  dateError,
  dateInputTab,
  setDateInputTab,
  setDateText,
  setDateError,
  handleCalendarSelect,
  handleDateTextChange,
}: TaskFormFieldsProps) {
  const employeesByDepartment: Record<string, Employee[]> = {};
  
  const departmentOrder: EmployeeDepartment[] = [
    'operations', 'administration', 'elementary', 'middle', 'high', 'assistant'
  ];
  
  departmentOrder.forEach(dept => {
    employeesByDepartment[dept] = [];
  });
  
  employees.forEach(employee => {
    if (employee && employee.department) {
      const isAssistant = 
        employee.department === 'assistant' || 
        (employee.position && (
          employee.position.toLowerCase().includes('조교') || 
          employee.position.toLowerCase().includes('assistant') || 
          employee.position.toLowerCase().includes('ta')
        ));
      
      if (isAssistant) {
        employeesByDepartment['assistant'].push(employee);
      } else {
        employeesByDepartment[employee.department].push(employee);
      }
    } else if (employee) {
      employeesByDepartment['administration'].push(employee);
    }
  });

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>제목</FormLabel>
            <FormControl>
              <Input placeholder="업무 제목" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>설명</FormLabel>
            <FormControl>
              <Textarea
                placeholder="업무 설명 (선택사항)"
                className="resize-none auto-expand"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>담당자</FormLabel>
            <div className="space-y-3">
              {departmentOrder.map((department) => (
                <Collapsible key={department} className="border rounded-md overflow-hidden">
                  <CollapsibleTrigger className={`w-full flex items-center justify-between p-3 ${getDepartmentStyle(department as EmployeeDepartment)}`}>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {getDepartmentIcon(department as EmployeeDepartment)}
                      </span>
                      <span className="font-medium">
                        {getDepartmentName(department as EmployeeDepartment)}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 ui-open:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 space-y-2 bg-white/50 dark:bg-slate-900/50">
                      {employeesByDepartment[department] && employeesByDepartment[department].length > 0 ? (
                        employeesByDepartment[department].map((employee) => (
                          <div key={employee.id} className="flex items-center space-x-2 pl-2">
                            <Checkbox 
                              id={`employee-${employee.id}`}
                              checked={field.value.includes(employee.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, employee.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== employee.id));
                                }
                              }}
                            />
                            <Label htmlFor={`employee-${employee.id}`} className="cursor-pointer">
                              {employee.name} ({employee.position})
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-2 text-muted-foreground">
                          직원이 없습니다
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>우선순위</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high">높음</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium">중간</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low">낮음</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>마감일</FormLabel>
            <DateFieldTabs
              date={field.value}
              text={dateText}
              error={dateError}
              activeTab={dateInputTab}
              onTabChange={setDateInputTab}
              onDateChange={(date) => {
                field.onChange(date);
                handleCalendarSelect(date);
              }}
              onTextChange={handleDateTextChange}
            />
            <FormDescription>
              업무 마감일을 설정합니다 (선택사항)
            </FormDescription>
            <FormMessage>{dateError}</FormMessage>
          </FormItem>
        )}
      />
      
      <TaskAttachments form={form} />
    </>
  );
}
