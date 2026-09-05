
import { create } from 'zustand';
import { Employee, EmployeeStore, EmployeeDepartment } from './types';
import { useAuthStore } from '../authStore';
import { 
  fetchEmployeesFromApi, 
  addEmployeeToApi, 
  updateEmployeeInApi, 
  deleteEmployeeFromApi 
} from './api';
import { mockEmployees } from './mockData';

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  isLoading: true,
  error: null,
  
  // Fetch employees from Supabase
  fetchEmployees: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const formattedEmployees = await fetchEmployeesFromApi();
      set({ employees: formattedEmployees, isLoading: false });
      
    } catch (error) {
      console.error('Unexpected error fetching employees:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false, 
        employees: mockEmployees 
      });
    }
  },
  
  // Add employee to Supabase
  addEmployee: async (employeeData) => {
    const { hasAdminPrivileges } = useAuthStore.getState();
    if (!hasAdminPrivileges()) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const newEmployee = await addEmployeeToApi(employeeData);
      
      set(state => ({
        employees: [...state.employees, newEmployee],
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error adding employee:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  // Update employee in Supabase
  updateEmployee: async (id, updates) => {
    const { currentUser } = useAuthStore.getState();
    const { hasAdminPrivileges } = useAuthStore.getState();
    
    if (hasAdminPrivileges()) {
      try {
        set({ isLoading: true, error: null });
        
        await updateEmployeeInApi(id, updates);
        
        set(state => ({
          employees: state.employees.map(employee => 
            employee.id === id 
              ? { ...employee, ...updates } 
              : employee
          ),
          isLoading: false
        }));
      } catch (error) {
        console.error('Unexpected error updating employee:', error);
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    }
    else if (currentUser?.accessLevel === 'department') {
      const employeeToUpdate = get().employees.find(emp => emp.id === id);
      if (!employeeToUpdate || employeeToUpdate.department !== currentUser.department) {
        return;
      }
      
      try {
        set({ isLoading: true, error: null });
        
        await updateEmployeeInApi(id, updates);
        
        set(state => ({
          employees: state.employees.map(employee => 
            employee.id === id 
              ? { ...employee, ...updates } 
              : employee
          ),
          isLoading: false
        }));
      } catch (error) {
        console.error('Unexpected error updating employee:', error);
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    }
    else if (!hasAdminPrivileges() && currentUser?.id !== id) {
      return;
    }
  },
  
  // Delete employee from Supabase
  deleteEmployee: async (id) => {
    const { hasAdminPrivileges } = useAuthStore.getState();
    const { currentUser } = useAuthStore.getState();
    
    if (hasAdminPrivileges()) {
      try {
        set({ isLoading: true, error: null });
        
        await deleteEmployeeFromApi(id);
        
        set(state => ({
          employees: state.employees.filter(employee => employee.id !== id),
          isLoading: false
        }));
      } catch (error) {
        console.error('Unexpected error deleting employee:', error);
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    }
    else if (currentUser?.accessLevel === 'department') {
      const employeeToDelete = get().employees.find(emp => emp.id === id);
      if (!employeeToDelete || employeeToDelete.department !== currentUser.department) {
        return;
      }
      
      try {
        set({ isLoading: true, error: null });
        
        await deleteEmployeeFromApi(id);
        
        set(state => ({
          employees: state.employees.filter(employee => employee.id !== id),
          isLoading: false
        }));
      } catch (error) {
        console.error('Unexpected error deleting employee:', error);
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    }
    else {
      return;
    }
  },
  
  // Get employees by department
  getEmployeesByDepartment: (department) => {
    return get().employees.filter(employee => employee.department === department);
  },
  
  // Get employees with birthdays this month
  getEmployeesWithBirthdaysThisMonth: () => {
    const currentMonth = new Date().getMonth() + 1; // +1 because JS months are 0-indexed
    return get().employees.filter(employee => {
      if (employee.birthdayMonth) {
        return employee.birthdayMonth === currentMonth;
      } else if (employee.birthday) {
        return employee.birthday.getMonth() + 1 === currentMonth;
      }
      return false;
    });
  },
  
  // Determine if an employee can access another employee's data based on access level
  canAccessEmployeeData: (viewerId, targetId) => {
    if (viewerId === targetId) return true; // Always can access own data
    
    const viewer = get().employees.find(emp => emp.id === viewerId);
    const target = get().employees.find(emp => emp.id === targetId);
    
    if (!viewer || !target) return false;
    
    // Admin-level employees can access all data
    if (viewer.accessLevel === 'all') return true;
    
    // Department-level employees can access data from same department
    if (viewer.accessLevel === 'department' && viewer.department === target.department) {
      return true;
    }
    
    // Personal-level employees can only access their own data
    return false;
  },
  
  // Get visible employees based on permissions
  getVisibleEmployees: () => {
    const { hasAdminPrivileges, currentUser } = useAuthStore.getState();
    
    // Admin can see all employees
    if (hasAdminPrivileges()) {
      return get().employees;
    }
    
    if (currentUser) {
      // Department managers can see all employees in their department
      if (currentUser.accessLevel === 'department' && currentUser.department) {
        console.log(`Department manager access: ${currentUser.name} from ${currentUser.department} department`);
        // Return all employees in the current user's department
        return get().employees.filter(emp => emp.department === currentUser.department);
      }
      
      // Regular users can only see themselves
      return get().employees.filter(emp => emp.id === currentUser.id);
    }
    
    return [];
  },
}));
