
import React from 'react';
import { Employee, EmployeeDepartment } from '@/lib/types';
import { useEmployeeStore } from '@/lib/employeeStore';

interface DepartmentTabProps {
  department: EmployeeDepartment;
  active: boolean;
  onClick: () => void;
}

// 부서 한글 표시 매핑
const departmentNames: Record<EmployeeDepartment, string> = {
  administration: '행정부',
  elementary: '초등부',
  middle: '중등부',
  high: '고등부',
  assistant: '조교부',
  operations: '운영본부',
};

export function DepartmentTab({ department, active, onClick }: DepartmentTabProps) {
  const { getEmployeesByDepartment } = useEmployeeStore();
  const employees = getEmployeesByDepartment(department);
  
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        active 
          ? 'bg-primary text-primary-foreground shadow-md scale-105' 
          : 'bg-background hover:bg-secondary/70 text-muted-foreground hover:text-foreground'
      }`}
      onClick={onClick}
    >
      {departmentNames[department]}
      <span className={`ml-2 inline-flex items-center justify-center h-5 min-w-5 rounded-full text-xs ${
        active 
          ? 'bg-primary-foreground/20 text-primary-foreground' 
          : 'bg-secondary text-foreground/80'
      }`}>
        {employees.length}
      </span>
    </button>
  );
}
