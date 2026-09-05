
import React from "react";
import { Employee, EmployeeDepartment } from "@/lib/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { EmployeeTableRow } from "./EmployeeTableRow";
import { EmployeeMobileCard } from "./EmployeeMobileCard";

interface DepartmentGroupProps {
  department: EmployeeDepartment;
  departmentName: string;
  employees: Employee[];
  departmentNames: Record<string, string>;
  accessLevelNames: Record<string, string>;
  isMobile: boolean;
  sortOrder: "name" | "position" | "default";
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const DepartmentGroup: React.FC<DepartmentGroupProps> = ({
  department,
  departmentName,
  employees,
  departmentNames,
  accessLevelNames,
  isMobile,
  sortOrder,
  onEdit,
  onDelete
}) => {
  // Skip rendering only if this isn't the assistant department and there are no employees
  if (employees.length === 0 && department !== 'assistant') return null;

  // Get position priority based on department
  const getPositionPriority = (position: string, dept: EmployeeDepartment): number => {
    if (dept === 'administration') {
      // 1. Administration department: CEO (대표) first, then 실장
      if (position.includes('대표')) return 100;
      if (position.includes('실장')) return 90;
      if (position.includes('부장')) return 80;
    } else if (dept === 'elementary') {
      // 2. Elementary department: 부장 first, then 헤드
      if (position.includes('부장')) return 100;
      if (position.includes('헤드')) return 90;
    } else {
      // Default for other departments: just prioritize 부장
      if (position.includes('부장')) return 100;
    }
    
    // Other positions in all departments
    if (position.includes('팀장')) return 70;
    if (position.includes('과장')) return 60;
    if (position.includes('대리')) return 50;
    if (position.includes('주임')) return 40;
    if (position.includes('사원')) return 30;
    if (position.includes('인턴')) return 20;
    
    return 0; // Default priority
  };

  // Sort employees based on the selected sort order and department-specific rules
  const sortedEmployees = [...employees].sort((a, b) => {
    // Apply the selected sort order
    if (sortOrder === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "position") {
      return (a.position || "").localeCompare(b.position || "");
    } else {
      // Special case for high department: Tony should appear before 김성진
      if (department === 'high') {
        if (a.name === 'Tony' && b.name === '김성진') return -1;
        if (a.name === '김성진' && b.name === 'Tony') return 1;
      }
      
      // Default sort: first by department-specific position importance
      const priorityA = getPositionPriority(a.position || "", department);
      const priorityB = getPositionPriority(b.position || "", department);
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      
      // Then by name (alphabetical)
      const nameComparison = a.name.localeCompare(b.name);
      if (nameComparison !== 0) return nameComparison;
      
      // Last resort: sort by ID for consistent ordering
      return a.id.localeCompare(b.id);
    }
  });

  const getDepartmentIconColor = (dept: EmployeeDepartment): string => {
    switch (dept) {
      case 'administration': return 'text-blue-500';
      case 'elementary': return 'text-green-500';
      case 'middle': return 'text-orange-500';
      case 'high': return 'text-purple-500';
      case 'assistant': return 'text-pink-500';
      case 'operations': return 'text-cyan-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
      <div className={`bg-muted/40 px-${isMobile ? '4' : '6'} py-${isMobile ? '2' : '3'} ${isMobile ? 'rounded-md sticky top-0 z-10 shadow-sm' : 'border-y border-border/30'}`}>
        <h3 className="text-md font-medium flex items-center gap-2">
          <Building className={`h-4 w-4 ${getDepartmentIconColor(department)}`} />
          <span>{departmentName}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {employees.length}명
          </Badge>
        </h3>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {sortedEmployees.map((employee) => (
            <EmployeeMobileCard
              key={employee.id}
              employee={employee}
              departmentNames={departmentNames}
              accessLevelNames={accessLevelNames}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          
          {department === 'assistant' && employees.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              등록된 조교가 없습니다.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/20">
                <TableHead className="w-[150px]">이름 / 직책</TableHead>
                <TableHead className="w-[150px]">부서</TableHead>
                <TableHead className="w-[180px]">생일</TableHead>
                <TableHead className="w-[150px]">엑세스 코드</TableHead>
                <TableHead className="w-[180px]">접근 권한</TableHead>
                <TableHead className="text-right w-[100px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  departmentNames={departmentNames}
                  accessLevelNames={accessLevelNames}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {department === 'assistant' && employees.length === 0 && (
                <TableRow>
                  <TableHead colSpan={6} className="h-24 text-center text-muted-foreground">
                    등록된 조교가 없습니다.
                  </TableHead>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};
