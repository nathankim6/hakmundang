import { useState } from "react";
import { Employee, EmployeeDepartment } from "@/lib/types";
import { useEmployeeStore } from "@/lib/employee/store";
import { useAuthStore } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useEmployeeManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasAdminPrivileges, currentUser } = useAuthStore();
  const { employees, addEmployee, updateEmployee, deleteEmployee, fetchEmployees, isLoading } = useEmployeeStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<EmployeeDepartment | "all">("all");
  const [sortOrder, setSortOrder] = useState<"name" | "position" | "default">("default");
  
  const [newEmployee, setNewEmployee] = useState<{
    name: string;
    position: string;
    department: EmployeeDepartment;
    accessCode: string;
    accessLevel: "personal" | "department" | "all";
    birthday?: Date;
    birthdayMonth?: number;
    birthdayDay?: number;
    calendarType?: "solar" | "lunar";
    avatar?: string;
  }>({
    name: "",
    position: "",
    department: "administration",
    accessCode: "",
    accessLevel: "personal",
    birthday: undefined,
    birthdayMonth: undefined,
    birthdayDay: undefined,
    calendarType: "solar",
    avatar: undefined,
  });
  
  const employee = currentUser ? employees.find(emp => emp.id === currentUser.id) : null;
  const canAccessPage = hasAdminPrivileges() || (employee && employee.accessLevel === 'department');
  
  if (!canAccessPage) {
    navigate("/");
  }
  
  const departmentNames = {
    administration: "행정부",
    elementary: "초등부",
    middle: "중등부",
    high: "고등부",
    assistant: "조교부",
    operations: "운영본부",
  };
  
  const accessLevelNames = {
    personal: "개인 리포트/업무만",
    department: "부서 전체 관리",
    all: "전체 관리",
  };
  
  const departmentOrder: EmployeeDepartment[] = ['operations', 'administration', 'elementary', 'middle', 'high', 'assistant'];
  
  const isAssistantEmployee = (employee: Employee): boolean => {
    return employee.department === 'assistant' || 
      (employee.position && (
        employee.position.toLowerCase().includes('조교') || 
        employee.position.toLowerCase().includes('assistant') || 
        employee.position.toLowerCase().includes('ta')
      ));
  };
  
  const getFilteredEmployees = () => {
    let visibleEmployees = useEmployeeStore.getState().getVisibleEmployees();
    
    if (filterDepartment !== "all") {
      if (filterDepartment === 'assistant') {
        visibleEmployees = visibleEmployees.filter(emp => isAssistantEmployee(emp));
      } else {
        visibleEmployees = visibleEmployees.filter(emp => 
          emp.department === filterDepartment && !isAssistantEmployee(emp)
        );
      }
    }
    
    if (searchTerm) {
      visibleEmployees = visibleEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return visibleEmployees;
  };
  
  const filteredEmployees = getFilteredEmployees();
  
  const groupedEmployees = departmentOrder.map(dept => {
    const shouldShowDepartment = hasAdminPrivileges() || 
      (filterDepartment === 'all' && currentUser?.department === dept) ||
      filterDepartment === dept;
    
    if (!shouldShowDepartment) {
      return {
        department: dept,
        departmentName: departmentNames[dept],
        employees: []
      };
    }
    
    let deptEmployees;
    
    if (dept === 'assistant') {
      deptEmployees = filteredEmployees.filter(emp => isAssistantEmployee(emp));
    } else {
      deptEmployees = filteredEmployees.filter(emp => 
        emp.department === dept && !isAssistantEmployee(emp)
      );
    }
    
    return {
      department: dept,
      departmentName: departmentNames[dept],
      employees: deptEmployees
    };
  });

  const handleBirthdayMonthChange = (e: React.ChangeEvent<HTMLInputElement>, isNewEmployee: boolean) => {
    const value = parseInt(e.target.value, 10);
    const month = isNaN(value) ? undefined : Math.min(12, Math.max(1, value));
    
    if (isNewEmployee) {
      setNewEmployee({ ...newEmployee, birthdayMonth: month });
    } else if (selectedEmployee) {
      setSelectedEmployee({ ...selectedEmployee, birthdayMonth: month });
    }
  };

  const handleBirthdayDayChange = (e: React.ChangeEvent<HTMLInputElement>, isNewEmployee: boolean) => {
    const value = parseInt(e.target.value, 10);
    const day = isNaN(value) ? undefined : Math.min(31, Math.max(1, value));
    
    if (isNewEmployee) {
      setNewEmployee({ ...newEmployee, birthdayDay: day });
    } else if (selectedEmployee) {
      setSelectedEmployee({ ...selectedEmployee, birthdayDay: day });
    }
  };
  
  return {
    employees,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedEmployee,
    setSelectedEmployee,
    searchTerm,
    setSearchTerm,
    filterDepartment,
    setFilterDepartment,
    sortOrder,
    setSortOrder,
    newEmployee,
    setNewEmployee,
    departmentNames,
    accessLevelNames,
    groupedEmployees,
    handleBirthdayMonthChange,
    handleBirthdayDayChange,
    fetchEmployees,
    toast,
    hasAdminPrivileges
  };
}
