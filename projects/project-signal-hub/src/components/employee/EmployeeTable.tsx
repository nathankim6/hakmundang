
import React from "react";
import { Employee, EmployeeDepartment, AccessLevel } from "@/lib/types";
import { DepartmentGroup } from "./DepartmentGroup";

interface EmployeeTableProps {
  groupedEmployees: {
    department: EmployeeDepartment;
    departmentName: string;
    employees: Employee[];
  }[];
  handleDeleteEmployee: (employee: Employee) => void;
  openEditDialog: (employee: Employee) => void;
  departmentNames: Record<EmployeeDepartment, string>;
  accessLevelNames: Record<AccessLevel, string>;
  sortOrder: "name" | "position" | "default";
  isMobile?: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  groupedEmployees,
  handleDeleteEmployee,
  openEditDialog,
  departmentNames,
  accessLevelNames,
  sortOrder,
  isMobile = false,
}) => {
  // Show empty state if no employees
  const isEmpty = groupedEmployees.every(group => group.employees.length === 0);

  // Filter out empty department groups except for 'assistant' department
  // We want to show the assistant department even if it's empty
  const filteredGroups = groupedEmployees.filter(group => 
    group.employees.length > 0 || group.department === 'assistant'
  );
  
  return (
    <div className={`space-y-${isMobile ? '6' : '0'} ${isMobile ? 'px-2 pb-4' : ''}`}>
      {filteredGroups.map(group => (
        <div key={group.department} className={`space-y-${isMobile ? '3' : '2'}`}>
          <DepartmentGroup
            department={group.department}
            departmentName={group.departmentName}
            employees={group.employees}
            departmentNames={departmentNames}
            accessLevelNames={accessLevelNames}
            isMobile={isMobile}
            sortOrder={sortOrder}
            onEdit={openEditDialog}
            onDelete={handleDeleteEmployee}
          />
        </div>
      ))}
      
      {isEmpty && (
        <div className="text-center py-12 text-muted-foreground">
          등록된 직원이 없습니다.
        </div>
      )}
    </div>
  );
};
