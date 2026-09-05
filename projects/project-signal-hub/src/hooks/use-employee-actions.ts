
import { Employee } from "@/lib/types";
import { useEmployeeStore } from "@/lib/employee/store";
import { useToast } from "@/hooks/use-toast";

export function useEmployeeActions() {
  const { toast } = useToast();
  const { addEmployee, updateEmployee, deleteEmployee, fetchEmployees } = useEmployeeStore();
  
  const handleAddEmployee = async (newEmployee: any) => {
    if (!newEmployee.name || !newEmployee.position || !newEmployee.accessCode) {
      toast({
        title: "입력 오류",
        description: "모든 필수 정보를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let birthday = newEmployee.birthday;
      if (newEmployee.birthdayMonth && newEmployee.birthdayDay) {
        const currentYear = new Date().getFullYear();
        // Set to noon UTC to avoid timezone issues
        birthday = new Date(Date.UTC(currentYear, newEmployee.birthdayMonth - 1, newEmployee.birthdayDay, 12, 0, 0));
      }
      
      await addEmployee({
        ...newEmployee,
        birthday,
        avatar: '/placeholder.svg',
      });
      
      toast({
        title: "직원 추가 완료",
        description: `${newEmployee.name} 직원이 추가되었습니다.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "직원 추가 실패",
        description: "직원을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleUpdateEmployee = async (selectedEmployee: Employee | null) => {
    if (!selectedEmployee) return false;
    
    // Ensure ID exists before updating
    if (!selectedEmployee.id) {
      console.error("Cannot update employee: Missing ID");
      toast({
        title: "직원 정보 업데이트 실패",
        description: "직원 ID가 없습니다.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      let birthday = selectedEmployee.birthday;
      if (selectedEmployee.birthdayMonth && selectedEmployee.birthdayDay) {
        const currentYear = new Date().getFullYear();
        // Set to noon UTC to avoid timezone issues
        birthday = new Date(Date.UTC(currentYear, selectedEmployee.birthdayMonth - 1, selectedEmployee.birthdayDay, 12, 0, 0));
      }
      
      await updateEmployee(selectedEmployee.id, {
        ...selectedEmployee,
        birthday,
      });
      
      toast({
        title: "직원 정보 업데이트 완료",
        description: `${selectedEmployee.name} 직원 정보가 업데이트되었습니다.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "직원 정보 업데이트 실패",
        description: "직원 정보를 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`${employee.name} 직원을 삭제하시겠습니까?`)) {
      try {
        await deleteEmployee(employee.id);
        
        toast({
          title: "직원 삭제 완료",
          description: `${employee.name} 직원이 삭제되었습니다.`,
        });
        return true;
      } catch (error) {
        toast({
          title: "직원 삭제 실패",
          description: "직원을 삭제하는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        return false;
      }
    }
    return false;
  };
  
  const handleRefresh = () => {
    fetchEmployees();
    toast({
      title: "새로고침 완료",
      description: "직원 목록을 새로고침했습니다.",
    });
  };
  
  return {
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleRefresh
  };
}
