
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { EmployeeDepartment } from "@/lib/types";
import { useEmployeeStore } from "@/lib/employeeStore";
import { mockEmployees } from "@/lib/employee/mockData";

interface DepartmentLabelProps {
  employeeIds: string[];
}

export function DepartmentLabel({ employeeIds }: DepartmentLabelProps) {
  const { employees } = useEmployeeStore();
  const [department, setDepartment] = useState<EmployeeDepartment | null>(null);
  const [hasDetermined, setHasDetermined] = useState(false); // Flag to prevent repeated lookups
  
  useEffect(() => {
    // Only try to determine the department if we haven't already found one
    // and we have employee IDs to check
    if (!hasDetermined && employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
      // Use employees from store or fall back to mock data
      const employeesToUse = employees.length > 0 ? employees : mockEmployees;
      
      // Find the first employee that matches any of the assigned IDs
      const assignedEmployee = employeesToUse.find(emp => employeeIds.includes(emp.id));
      
      if (assignedEmployee && assignedEmployee.department) {
        console.log("Found employee with department:", assignedEmployee.name, assignedEmployee.department);
        setDepartment(assignedEmployee.department);
      } else {
        console.log("No matching employee with department found for IDs:", employeeIds);
      }
      
      // Mark that we've made our determination
      setHasDetermined(true);
    }
  }, [employeeIds, employees, hasDetermined]);
  
  // For debugging only
  useEffect(() => {
    console.log("DepartmentLabel state:", { 
      employeeIds, 
      employeesCount: employees.length, 
      department,
      hasDetermined 
    });
  }, [employeeIds, employees.length, department, hasDetermined]);
  
  if (!department) {
    // Fallback to mock data if no department was found
    if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
      const mockEmployee = mockEmployees.find(emp => employeeIds.includes(emp.id));
      if (mockEmployee && mockEmployee.department) {
        return (
          <div className="absolute top-3 right-4 z-20">
            <Badge 
              variant="outline" 
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all duration-300 hover:scale-105 ${getDepartmentStyle(mockEmployee.department)}`}
            >
              <span className="mr-1.5">{getDepartmentIcon(mockEmployee.department)}</span>
              {getDepartmentName(mockEmployee.department)}
            </Badge>
          </div>
        );
      }
    }
    return null;
  }
  
  return (
    <div className="absolute top-3 right-4 z-20">
      <Badge 
        variant="outline" 
        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all duration-300 hover:scale-105 ${getDepartmentStyle(department)}`}
      >
        <span className="mr-1.5">{getDepartmentIcon(department)}</span>
        {getDepartmentName(department)}
      </Badge>
    </div>
  );
}

function getDepartmentName(department: EmployeeDepartment): string {
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
}

function getDepartmentIcon(department: EmployeeDepartment): string {
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
}

function getDepartmentStyle(department: EmployeeDepartment): string {
  switch (department) {
    case 'administration':
      return 'bg-blue-50/80 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300';
    case 'elementary':
      return 'bg-green-50/80 border-green-300 text-green-700 dark:bg-green-950/40 dark:border-green-700 dark:text-green-300';
    case 'middle':
      return 'bg-orange-50/80 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-700 dark:text-orange-300';
    case 'high':
      return 'bg-red-50/80 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-700 dark:text-red-300';
    case 'assistant':
      return 'bg-violet-50/80 border-violet-300 text-violet-700 dark:bg-violet-950/40 dark:border-violet-700 dark:text-violet-300';
    case 'operations':
      return 'bg-cyan-50/80 border-cyan-300 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-700 dark:text-cyan-300';
    default:
      return 'bg-slate-50/80 border-slate-300 text-slate-700 dark:bg-slate-800/40 dark:border-slate-600 dark:text-slate-300';
  }
}
