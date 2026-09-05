import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeStore } from "@/lib/employeeStore";
import { Users, User } from "lucide-react";
import { EmployeeDepartment } from "@/lib/types";

interface TaskListFiltersProps {
  onDepartmentChange?: (department: string) => void;
  onEmployeeChange?: (employee: string) => void;
}

export function TaskListFilters({ onDepartmentChange, onEmployeeChange }: TaskListFiltersProps) {
  const { employees } = useEmployeeStore();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  const departmentOptions = () => {
    const departments = new Set<string>();
    employees.forEach(emp => {
      if (emp.department) {
        departments.add(emp.department);
      }
    });
    return Array.from(departments);
  };

  const getDepartmentName = (department: EmployeeDepartment | string): string => {
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
      case 'all':
        return '전체 부서';
      default:
        return department;
    }
  };

  const getVisibleEmployees = () => {
    if (selectedDepartment === "all") {
      return employees;
    }
    return employees.filter(emp => emp.department === selectedDepartment);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedEmployee("all");
    onDepartmentChange?.(value);
    onEmployeeChange?.("all");
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployee(value);
    onEmployeeChange?.(value);
  };

  return (
    <div className="flex items-center gap-4">
      {/* 부서별 필터 */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="부서 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 부서</SelectItem>
            {departmentOptions().map(dept => (
              <SelectItem key={dept} value={dept}>
                {getDepartmentName(dept)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 개인별 필터 */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedEmployee} onValueChange={handleEmployeeChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="담당자 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 담당자</SelectItem>
            {getVisibleEmployees().map(emp => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}