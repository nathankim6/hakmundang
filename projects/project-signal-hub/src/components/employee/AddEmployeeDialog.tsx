
import React from "react";
import { EmployeeDepartment, AccessLevel, CalendarType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { useAuthStore } from "@/lib/authStore";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newEmployee: {
    name: string;
    position: string;
    department: EmployeeDepartment;
    accessCode: string;
    accessLevel: AccessLevel;
    birthday?: Date;
    birthdayMonth?: number;
    birthdayDay?: number;
    calendarType?: CalendarType;
    avatar?: string;
  };
  setNewEmployee: React.Dispatch<React.SetStateAction<any>>;
  handleAddEmployee: () => Promise<void>;
  handleBirthdayMonthChange: (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => void;
  handleBirthdayDayChange: (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => void;
}

export const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  setIsOpen,
  newEmployee,
  setNewEmployee,
  handleAddEmployee,
  handleBirthdayMonthChange,
  handleBirthdayDayChange
}) => {
  const { hasAdminPrivileges, currentUser } = useAuthStore();
  
  // Limit access level options based on user permissions
  const canAssignAllAccess = hasAdminPrivileges();
  const canAssignDepartmentAccess = hasAdminPrivileges() || 
    (currentUser?.accessLevel === 'department');
    
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <UserPlus className="mr-2 h-4 w-4" />
          직원 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>직원 추가</DialogTitle>
          <DialogDescription>신규 직원 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <EmployeeForm 
          employee={newEmployee}
          setEmployee={setNewEmployee}
          isNewEmployee={true}
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
          <Button onClick={handleAddEmployee}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
