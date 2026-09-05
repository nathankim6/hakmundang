
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee } from './types';
import { useEmployeeStore } from './employeeStore';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: Employee | null;
  isAdmin: boolean;
  lastLoginTime: string | null;
  
  // Auth actions
  login: (accessCode: string) => Promise<boolean>;
  logout: () => void;
  
  // Helper method to check if user has admin privileges
  hasAdminPrivileges: () => boolean;
  
  // Helper method to check if task is new since last login
  isNewTask: (taskCreatedAt: string) => boolean;
  
  // Helper method to check if task is created within 24 hours
  isTaskCreatedWithin24Hours: (taskCreatedAt: string) => boolean;
}

export const ADMIN_ACCESS_CODE = 'admin';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      isAdmin: false,
      lastLoginTime: null,
      
      login: async (accessCode: string) => {
        console.log("Login attempt with access code:", accessCode);
        
        try {
          const currentTime = new Date().toISOString();
          
          // Check if it's admin login
          if (accessCode === ADMIN_ACCESS_CODE) {
            console.log("Admin login successful");
            set({
              isAuthenticated: true,
              currentUser: null,
              isAdmin: true,
              lastLoginTime: currentTime,
            });
            return true;
          }
          
          // Check if it's employee login
          const employees = useEmployeeStore.getState().employees;
          console.log("Available employees:", employees.length);
          
          const employee = employees.find((emp) => emp.accessCode === accessCode);
          
          if (employee) {
            console.log("Employee login successful:", {
              name: employee.name,
              accessLevel: employee.accessLevel,
              department: employee.department
            });
            
            set({
              isAuthenticated: true,
              currentUser: employee,
              isAdmin: false,
              lastLoginTime: currentTime,
            });
            return true;
          }
          
          // If we reach here, login failed
          console.log("Login failed: Invalid access code");
          return false;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          isAdmin: false,
          lastLoginTime: null,
        });
      },
      
      // Helper method to check if user has admin privileges (either admin or "all" access)
      hasAdminPrivileges: () => {
        const { isAdmin, currentUser } = get();
        
        // True if user is admin
        if (isAdmin) return true;
        
        // True if user has "all" access level
        if (currentUser && currentUser.accessLevel === 'all') return true;
        
        // Otherwise, no admin privileges
        return false;
      },
      
      // Helper method to check if task is new since last login
      isNewTask: (taskCreatedAt: string) => {
        const { lastLoginTime, currentUser, isAdmin } = get();
        
        // 관리자가 아닌 일반 직원의 경우에만 이 함수 사용
        if (isAdmin) return false; // 관리자는 별도 로직 사용
        
        // 일반 직원이지만 currentUser가 없으면 새 업무로 간주하지 않음
        if (!currentUser) return false;
        
        // 마지막 로그인 시간이 없으면 새 업무로 간주하지 않음
        if (!lastLoginTime) return false;
        
        // 업무 생성 시간이 마지막 로그인 이후면 새 업무
        return new Date(taskCreatedAt) > new Date(lastLoginTime);
      },
      
      // Helper method to check if task is created within 24 hours
      isTaskCreatedWithin24Hours: (taskCreatedAt: string) => {
        const now = new Date();
        const taskCreated = new Date(taskCreatedAt);
        const hoursDiff = (now.getTime() - taskCreated.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
