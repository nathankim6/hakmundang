
import { create } from 'zustand';
import { Report, ApprovalStatus, EmployeeDepartment } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';
import { useEmployeeStore } from './employeeStore';

interface ReportStore {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  
  // Report actions
  fetchReports: () => Promise<void>;
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  approveReport: (id: string, status: ApprovalStatus, comments?: string) => Promise<void>;
  
  // Get reports by criteria
  getReportsByDate: (date: string) => Report[];
  getReportsByDateAndDepartment: (date: string, department: EmployeeDepartment) => Report[];
  getReportsByEmployee: (employeeId: string) => Report[];
  getEmployeeReportForDate: (employeeId: string, date: string) => Report | undefined;
  
  // Access control
  canViewReport: (reportId: string) => boolean;
  canEditReport: (reportId: string) => boolean;
  canApproveReport: (reportId: string) => boolean;
  
  // Filtered reports
  getVisibleReports: () => Report[];
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  isLoading: false,
  error: null,
  
  // Fetch reports from Supabase
  fetchReports: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching reports:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      if (data) {
        const formattedReports = data.map(report => ({
          id: report.id.toString(),
          employeeId: report.employee_id.toString(),
          date: report.date,
          content: report.content,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
          approvalStatus: "pending" as ApprovalStatus,
          approvalComments: report.comments,
          classContent: report.class_content,
          absentStudents: report.absent_students,
          progressStatus: report.progress_status,
          homework: report.homework,
        })) as Report[];
        
        set({ reports: formattedReports, isLoading: false });
      }
    } catch (error) {
      console.error('Unexpected error fetching reports:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  // Add report to Supabase
  addReport: async (reportData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('daily_reports')
        .insert({
          employee_id: reportData.employeeId,
          date: reportData.date,
          content: reportData.content,
          class_content: reportData.classContent,
          absent_students: reportData.absentStudents,
          progress_status: reportData.progressStatus,
          homework: reportData.homework,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding report:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      if (data) {
        const newReport: Report = {
          id: data.id.toString(),
          employeeId: data.employee_id.toString(),
          date: data.date,
          content: data.content,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          approvalStatus: "pending" as ApprovalStatus,
          approvalComments: data.comments,
          classContent: data.class_content,
          absentStudents: data.absent_students,
          progressStatus: data.progress_status,
          homework: data.homework,
        };
        
        set(state => ({
          reports: [newReport, ...state.reports],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Unexpected error adding report:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  // Update report in Supabase
  updateReport: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const updateData: any = {};
      
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.classContent !== undefined) updateData.class_content = updates.classContent;
      if (updates.absentStudents !== undefined) updateData.absent_students = updates.absentStudents;
      if (updates.progressStatus !== undefined) updateData.progress_status = updates.progressStatus;
      if (updates.homework !== undefined) updateData.homework = updates.homework;
      
      const { error } = await supabase
        .from('daily_reports')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating report:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === id 
            ? { ...report, ...updates, updatedAt: new Date().toISOString() } 
            : report
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error updating report:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  // Delete report from Supabase
  deleteReport: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting report:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      set(state => ({
        reports: state.reports.filter(report => report.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error deleting report:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  // Approve or reject report in Supabase
  approveReport: async (id, status, comments) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('daily_reports')
        .update({
          approval_status: status,
          comments: comments,
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error changing report status:', error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      set(state => ({
        reports: state.reports.map(report => 
          report.id === id 
            ? { 
                ...report, 
                approvalStatus: status, 
                approvalComments: comments,
                updatedAt: new Date().toISOString()
              } 
            : report
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Unexpected error changing report status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  // Get reports by date
  getReportsByDate: (date) => {
    return get().reports.filter(report => report.date === date);
  },
  
  // Get reports by date and department
  getReportsByDateAndDepartment: (date, department) => {
    const employees = useEmployeeStore.getState().employees;
    
    return get().reports.filter(report => {
      const employee = employees.find(emp => emp.id === report.employeeId);
      return employee && employee.department === department && report.date === date;
    });
  },
  
  // Get reports by employee
  getReportsByEmployee: (employeeId) => {
    return get().reports.filter(report => report.employeeId === employeeId);
  },
  
  // Get reports by employee and date
  getEmployeeReportForDate: (employeeId, date) => {
    return get().reports.find(report => report.employeeId === employeeId && report.date === date);
  },
  
  // Permission-based methods
  canViewReport: (reportId) => {
    const { hasAdminPrivileges, currentUser } = useAuthStore.getState();
    if (!currentUser) return false;
    
    const report = get().reports.find(r => r.id === reportId);
    if (!report) return false;
    
    // Admin can view all reports
    if (hasAdminPrivileges()) return true;
    
    // Department managers can view reports from their department
    if (currentUser.accessLevel === 'department' && currentUser.department) {
      const employees = useEmployeeStore.getState().employees;
      const reportEmployee = employees.find(emp => emp.id === report.employeeId);
      
      console.log("Department manager checking report access:", {
        reportId,
        reportEmployeeId: report.employeeId,
        managerDepartment: currentUser.department,
        reportEmployeeDepartment: reportEmployee?.department
      });
      
      return reportEmployee && reportEmployee.department === currentUser.department;
    }
    
    // Users can view their own reports
    return report.employeeId === currentUser.id;
  },
  
  canEditReport: (reportId) => {
    const { hasAdminPrivileges, currentUser } = useAuthStore.getState();
    if (!currentUser) return false;
    
    const report = get().reports.find(r => r.id === reportId);
    if (!report) return false;
    
    // Admin can edit all reports
    if (hasAdminPrivileges()) return true;
    
    // Department managers can edit reports from their department
    if (currentUser.accessLevel === 'department' && currentUser.department) {
      const employees = useEmployeeStore.getState().employees;
      const reportEmployee = employees.find(emp => emp.id === report.employeeId);
      
      return reportEmployee && reportEmployee.department === currentUser.department;
    }
    
    // Users can edit their own reports if not approved yet
    return report.employeeId === currentUser.id && report.approvalStatus !== 'approved';
  },
  
  canApproveReport: (reportId) => {
    const { hasAdminPrivileges, currentUser } = useAuthStore.getState();
    if (!currentUser) return false;
    
    const report = get().reports.find(r => r.id === reportId);
    if (!report) return false;
    
    // Admin can approve all reports
    if (hasAdminPrivileges()) return true;
    
    // Department managers can approve reports from their department
    if (currentUser.accessLevel === 'department' && currentUser.department) {
      const employees = useEmployeeStore.getState().employees;
      const reportEmployee = employees.find(emp => emp.id === report.employeeId);
      
      return reportEmployee && reportEmployee.department === currentUser.department;
    }
    
    // Regular users cannot approve reports
    return false;
  },
  
  getVisibleReports: () => {
    const { hasAdminPrivileges, currentUser } = useAuthStore.getState();
    
    if (!currentUser) return [];
    
    // Admin can see all reports
    if (hasAdminPrivileges()) {
      return get().reports;
    }
    
    console.log("Getting visible reports for user:", {
      userId: currentUser.id,
      userName: currentUser.name,
      accessLevel: currentUser.accessLevel,
      department: currentUser.department
    });
    
    // Department managers can see all reports in their department
    if (currentUser.accessLevel === 'department' && currentUser.department) {
      const employees = useEmployeeStore.getState().employees;
      
      const departmentEmployeeIds = employees
        .filter(emp => emp.department === currentUser.department)
        .map(emp => emp.id);
      
      console.log("Department employee IDs:", departmentEmployeeIds);
      
      const departmentReports = get().reports.filter(report => 
        departmentEmployeeIds.includes(report.employeeId)
      );
      
      console.log("Found department reports:", departmentReports.length);
      
      return departmentReports;
    }
    
    // Regular users can only see their own reports
    return get().reports.filter(report => report.employeeId === currentUser.id);
  },
}));

export const setupReportSubscription = () => {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'daily_reports',
      },
      () => {
        useReportStore.getState().fetchReports();
      }
    )
    .subscribe();

  return channel;
};
