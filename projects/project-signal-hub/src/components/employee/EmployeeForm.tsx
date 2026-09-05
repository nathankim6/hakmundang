
import React from "react";
import { Employee, EmployeeDepartment, AccessLevel, CalendarType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, ShieldCheck, Calendar } from "lucide-react";

interface EmployeeFormProps {
  employee: {
    name: string;
    position: string;
    department: EmployeeDepartment;
    accessCode: string;
    accessLevel: AccessLevel;
    birthday?: Date;
    birthdayMonth?: number;
    birthdayDay?: number;
    calendarType?: CalendarType;
  };
  setEmployee: React.Dispatch<React.SetStateAction<any>>;
  isNewEmployee: boolean;
  handleBirthdayMonthChange: (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => void;
  handleBirthdayDayChange: (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => void;
  // Add the missing props that are being passed from AddEmployeeDialog
  canAssignAllAccess?: boolean;
  canAssignDepartmentAccess?: boolean;
  currentUserDepartment?: EmployeeDepartment;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  setEmployee,
  isNewEmployee,
  handleBirthdayMonthChange,
  handleBirthdayDayChange,
  canAssignAllAccess,
  canAssignDepartmentAccess,
  currentUserDepartment
}) => {
  // Apply access level restrictions if provided
  const renderAccessLevelOptions = () => {
    return (
      <SelectContent>
        <SelectItem value="personal">
          <div className="flex items-center">
            <ShieldCheck className="mr-2 h-4 w-4 text-slate-500" />
            <span>개인 리포트/업무만</span>
          </div>
        </SelectItem>
        
        {/* Only show department option if user can assign it */}
        {(canAssignDepartmentAccess === undefined || canAssignDepartmentAccess) && (
          <SelectItem value="department">
            <div className="flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4 text-amber-500" />
              <span>부서 전체 관리</span>
            </div>
          </SelectItem>
        )}
        
        {/* Only show all option if user can assign it */}
        {(canAssignAllAccess === undefined || canAssignAllAccess) && (
          <SelectItem value="all">
            <div className="flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
              <span>전체 관리</span>
            </div>
          </SelectItem>
        )}
      </SelectContent>
    );
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor={isNewEmployee ? "name" : "edit-name"} className="text-sm font-medium">
          이름 {isNewEmployee && <span className="text-destructive">*</span>}
        </label>
        <Input
          id={isNewEmployee ? "name" : "edit-name"}
          value={employee.name}
          onChange={(e) => setEmployee({...employee, name: e.target.value})}
          placeholder="직원 이름"
          className="border-input/60"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={isNewEmployee ? "position" : "edit-position"} className="text-sm font-medium">
          직책 {isNewEmployee && <span className="text-destructive">*</span>}
        </label>
        <Input
          id={isNewEmployee ? "position" : "edit-position"}
          value={employee.position}
          onChange={(e) => setEmployee({...employee, position: e.target.value})}
          placeholder="직책"
          className="border-input/60"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={isNewEmployee ? "department" : "edit-department"} className="text-sm font-medium">
          부서 {isNewEmployee && <span className="text-destructive">*</span>}
        </label>
        <Select
          value={employee.department}
          onValueChange={(value: EmployeeDepartment) => 
            setEmployee({...employee, department: value})
          }
        >
          <SelectTrigger className="border-input/60">
            <SelectValue placeholder="부서 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="administration">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-blue-500" />
                <span>행정부</span>
              </div>
            </SelectItem>
            <SelectItem value="elementary">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-green-500" />
                <span>초등부</span>
              </div>
            </SelectItem>
            <SelectItem value="middle">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-orange-500" />
                <span>중등부</span>
              </div>
            </SelectItem>
            <SelectItem value="high">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-purple-500" />
                <span>고등부</span>
              </div>
            </SelectItem>
            <SelectItem value="assistant">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-pink-500" />
                <span>조교부</span>
              </div>
            </SelectItem>
            <SelectItem value="operations">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-cyan-500" />
                <span>운영본부</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor={isNewEmployee ? "birthday" : "edit-birthday"} className="text-sm font-medium">생일</label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            min="1"
            max="12"
            placeholder="월"
            value={employee.birthdayMonth || ''}
            onChange={(e) => handleBirthdayMonthChange(e, isNewEmployee)}
            className="border-input/60"
          />
          <Input
            type="number"
            min="1"
            max="31"
            placeholder="일"
            value={employee.birthdayDay || ''}
            onChange={(e) => handleBirthdayDayChange(e, isNewEmployee)}
            className="border-input/60"
          />
          <Select
            value={employee.calendarType || 'solar'}
            onValueChange={(value: CalendarType) => 
              setEmployee({...employee, calendarType: value})
            }
          >
            <SelectTrigger className="border-input/60">
              <SelectValue placeholder="양/음력" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solar">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                  <span>양력</span>
                </div>
              </SelectItem>
              <SelectItem value="lunar">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                  <span>음력</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor={isNewEmployee ? "accessLevel" : "edit-accessLevel"} className="text-sm font-medium">
          접근 권한 {isNewEmployee && <span className="text-destructive">*</span>}
        </label>
        <Select
          value={employee.accessLevel}
          onValueChange={(value: AccessLevel) => 
            setEmployee({...employee, accessLevel: value})
          }
        >
          <SelectTrigger className="border-input/60">
            <SelectValue placeholder="접근 권한 선택" />
          </SelectTrigger>
          {renderAccessLevelOptions()}
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor={isNewEmployee ? "accessCode" : "edit-accessCode"} className="text-sm font-medium">
          엑세스 코드 {isNewEmployee && <span className="text-destructive">*</span>}
        </label>
        <Input
          id={isNewEmployee ? "accessCode" : "edit-accessCode"}
          value={employee.accessCode}
          onChange={(e) => setEmployee({...employee, accessCode: e.target.value})}
          placeholder="엑세스 코드"
          type={isNewEmployee ? "password" : "text"}
          className={`border-input/60 ${!isNewEmployee && "font-mono"}`}
        />
      </div>
    </div>
  );
};
