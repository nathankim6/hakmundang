
import React from "react";
import { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeForm } from "./EmployeeForm";
import { useAuthStore } from "@/lib/authStore";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEmployee: Employee | null;
  setSelectedEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  handleUpdateEmployee: () => Promise<void>;
  handleBirthdayMonthChange: (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => void;
  handleBirthdayDayChange: (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => void;
}

export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedEmployee,
  setSelectedEmployee,
  handleUpdateEmployee,
  handleBirthdayMonthChange,
  handleBirthdayDayChange
}) => {
  const { hasAdminPrivileges, currentUser } = useAuthStore();
  
  if (!selectedEmployee) return null;
  
  // Limit access level options based on user permissions
  const canAssignAllAccess = hasAdminPrivileges();
  const canAssignDepartmentAccess = hasAdminPrivileges() || 
    (currentUser?.accessLevel === 'department');
  
  // Create a compatible employee object that matches the EmployeeForm requirements
  const employeeFormData = {
    id: selectedEmployee.id, // Ensure ID is included for update operations
    name: selectedEmployee.name,
    position: selectedEmployee.position,
    department: selectedEmployee.department || 'administration', // Provide a default value if department is undefined
    accessCode: selectedEmployee.accessCode || '',
    accessLevel: selectedEmployee.accessLevel || 'personal',
    birthday: selectedEmployee.birthday,
    birthdayMonth: selectedEmployee.birthdayMonth,
    birthdayDay: selectedEmployee.birthdayDay,
    calendarType: selectedEmployee.calendarType
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>직원 정보 수정</DialogTitle>
          <DialogDescription>직원 정보를 수정해주세요.</DialogDescription>
        </DialogHeader>
        <EmployeeForm 
          employee={employeeFormData}
          setEmployee={setSelectedEmployee}
          isNewEmployee={false}
          handleBirthdayMonthChange={handleBirthdayMonthChange}
          handleBirthdayDayChange={handleBirthdayDayChange}
          canAssignAllAccess={canAssignAllAccess}
          canAssignDepartmentAccess={canAssignDepartmentAccess}
          currentUserDepartment={currentUser?.department}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleUpdateEmployee}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
