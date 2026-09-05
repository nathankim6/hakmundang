
import { 
  Employee as BaseEmployee, 
  EmployeeDepartment, 
  AccessLevel, 
  CalendarType 
} from '../types';

// Re-export the types that are used across the employee modules
export type { EmployeeDepartment, AccessLevel, CalendarType };
export type Employee = BaseEmployee;

export interface EmployeeStore {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  
  // Employee actions
  fetchEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeesByDepartment: (department: EmployeeDepartment) => Employee[];
  
  // For current user
  getVisibleEmployees: () => Employee[];
  
  // Get employees with birthdays in current month
  getEmployeesWithBirthdaysThisMonth: () => Employee[];
  
  // Determine if an employee can access another employee's data
  canAccessEmployeeData: (viewerId: string, targetId: string) => boolean;
}
