
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeDepartment, AccessLevel, CalendarType } from './types';
import { mockEmployees } from './mockData';

// Map our app's department values to values accepted by the database
const departmentToDbValue = (department: EmployeeDepartment): string => {
  // Map assistant department to administration in the database
  // This is required because the database enum doesn't have "assistant" as a valid value
  if (department === 'assistant') {
    return 'administration';
  }
  return department;
};

// Map database department values back to our app's expected values
const dbValueToDepartment = (dbValue: string, position: string): EmployeeDepartment => {
  // Improved assistant department detection logic
  if (dbValue === 'assistant') {
    return 'assistant';
  }
  
  // Also detect assistant department based on position containing "조교", "assistant", or "ta" keywords
  if (position && (
      position.toLowerCase().includes('조교') || 
      position.toLowerCase().includes('assistant') ||
      position.toLowerCase().includes('ta'))
  ) {
    return 'assistant';
  }
  
  return dbValue as EmployeeDepartment;
};

// API fetch function
export const fetchEmployeesFromApi = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('department', { ascending: true })
    .order('name');
  
  if (error) {
    console.error('Error fetching employees:', error);
    throw new Error(error.message);
  }
  
  if (!data || data.length === 0) {
    console.warn('No employees data found, using mock data');
    return mockEmployees;
  }
  
  // Convert Supabase data to our app's Employee model
  return data.map(emp => {
    // Extract month and day from birthday if it exists
    let birthdayMonth: number | undefined = undefined;
    let birthdayDay: number | undefined = undefined;
    
    if (emp.birthday) {
      const date = new Date(emp.birthday);
      birthdayMonth = date.getMonth() + 1; // +1 because JS months are 0-indexed
      birthdayDay = date.getDate();
    }
    
    // Apply enhanced department detection logic
    const department = dbValueToDepartment(emp.department, emp.position || '');
    
    // Manual override for specific employees known to be in assistant department
    const knownAssistants = ['전현아', '안채원'];
    if (knownAssistants.includes(emp.name)) {
      console.log(`Override: Setting ${emp.name} to assistant department`);
      return {
        id: emp.id.toString(),
        name: emp.name,
        position: emp.position,
        department: 'assistant' as EmployeeDepartment,
        avatar: emp.avatar || '/placeholder.svg',
        accessCode: emp.access_code,
        accessLevel: emp.access_level as AccessLevel || 'personal',
        birthday: emp.birthday ? new Date(emp.birthday) : undefined,
        birthdayMonth: birthdayMonth,
        birthdayDay: birthdayDay,
        calendarType: (emp as any).calendar_type as CalendarType || 'solar'
      };
    }
    
    // Log for debugging
    console.log(`Employee ${emp.name}: DB department=${emp.department}, position=${emp.position}, mapped to=${department}`);
    
    return {
      id: emp.id.toString(),
      name: emp.name,
      position: emp.position,
      department: department,
      avatar: emp.avatar || '/placeholder.svg',
      accessCode: emp.access_code,
      accessLevel: emp.access_level as AccessLevel || 'personal',
      birthday: emp.birthday ? new Date(emp.birthday) : undefined,
      birthdayMonth: birthdayMonth,
      birthdayDay: birthdayDay,
      calendarType: (emp as any).calendar_type as CalendarType || 'solar'
    };
  });
};

// Add an employee
export const addEmployeeToApi = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
  // Format the data for Supabase
  const formattedData: any = {
    name: employeeData.name,
    position: employeeData.position,
    department: departmentToDbValue(employeeData.department),
    avatar: employeeData.avatar || '/placeholder.svg',
    access_code: employeeData.accessCode,
    access_level: employeeData.accessLevel || 'personal',
    calendar_type: employeeData.calendarType || 'solar'
  };
  
  // If this is an assistant department employee, make sure to include 'assistant' in the position
  // to ensure correct mapping when retrieving
  if (employeeData.department === 'assistant' && !formattedData.position.toLowerCase().includes('조교') && 
      !formattedData.position.toLowerCase().includes('assistant') && 
      !formattedData.position.toLowerCase().includes('ta')) {
    formattedData.position = `조교 ${formattedData.position}`;
  }
  
  // Add birthday if it exists
  if (employeeData.birthday) {
    // UTC 시간으로 변환하되 시간을 정오(12:00)로 설정하여 시간대 문제 방지
    const date = new Date(employeeData.birthday);
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
    formattedData.birthday = utcDate.toISOString();
  } else if (employeeData.birthdayMonth && employeeData.birthdayDay) {
    // birthdayMonth와 birthdayDay로부터 날짜 생성, 시간을 정오로 설정
    const currentYear = new Date().getFullYear();
    const utcDate = new Date(Date.UTC(currentYear, employeeData.birthdayMonth - 1, employeeData.birthdayDay, 12, 0, 0));
    formattedData.birthday = utcDate.toISOString();
  }
  
  // For debugging
  console.log("Adding employee with data:", formattedData);
  
  const { data, error } = await supabase
    .from('employees')
    .insert(formattedData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding employee:', error);
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('Failed to add employee: No data returned');
  }
  
  // Extract month and day from birthday if it exists
  let birthdayMonth: number | undefined = undefined;
  let birthdayDay: number | undefined = undefined;
  
  if (data.birthday) {
    const date = new Date(data.birthday);
    birthdayMonth = date.getMonth() + 1; // +1 because JS months are 0-indexed
    birthdayDay = date.getDate();
  }
  
  // Return the new employee with the correct department (which may be 'assistant' even if stored as 'administration' in DB)
  return {
    id: data.id.toString(),
    name: data.name,
    position: data.position,
    department: employeeData.department, // Return the original requested department, not what's in DB
    avatar: data.avatar || '/placeholder.svg',
    accessCode: data.access_code,
    accessLevel: data.access_level as AccessLevel || 'personal',
    birthday: data.birthday ? new Date(data.birthday) : undefined,
    birthdayMonth: birthdayMonth,
    birthdayDay: birthdayDay,
    calendarType: (data as any).calendar_type as CalendarType || 'solar'
  };
};

// Update an employee
export const updateEmployeeInApi = async (id: string, updates: Partial<Employee>): Promise<void> => {
  // Add debug logging to see the ID value
  console.log("Updating employee:", id, updates);
  
  if (!id) {
    throw new Error('Employee ID is required for updates');
  }
  
  const updateData: any = { ...updates };
  
  // Handle the field name mappings for Supabase
  if (updates.accessCode !== undefined) {
    updateData.access_code = updates.accessCode;
    delete updateData.accessCode;
  }
  
  if (updates.accessLevel !== undefined) {
    updateData.access_level = updates.accessLevel;
    delete updateData.accessLevel;
  }
  
  // 음력/양력 설정 필드 매핑
  if (updates.calendarType !== undefined) {
    updateData.calendar_type = updates.calendarType;
    delete updateData.calendarType;
  }
  
  // Map department to a value accepted by the database
  if (updates.department) {
    updateData.department = departmentToDbValue(updates.department);
    
    // If this is an assistant department employee, make sure to include 'assistant' in the position
    // to ensure correct mapping when retrieving
    if (updates.department === 'assistant' && updates.position && 
        !updates.position.toLowerCase().includes('조교') && 
        !updates.position.toLowerCase().includes('assistant') &&
        !updates.position.toLowerCase().includes('ta')) {
      updateData.position = `조교 ${updates.position}`;
    }
  }
  
  // Remove fields that don't exist in the database table
  if (updates.birthdayMonth !== undefined) {
    delete updateData.birthdayMonth;
  }
  
  if (updates.birthdayDay !== undefined) {
    delete updateData.birthdayDay;
  }
  
  // 생일 업데이트 로직 개선
  if (updates.birthdayMonth && updates.birthdayDay) {
    // birthdayMonth와 birthdayDay로부터 생일 날짜 생성
    const currentYear = new Date().getFullYear();
    // 시간을 정오(12:00)로 설정하여 시간대 문제 방지
    const birthdayDate = new Date(Date.UTC(currentYear, updates.birthdayMonth - 1, updates.birthdayDay, 12, 0, 0));
    updateData.birthday = birthdayDate.toISOString();
  } else if (updates.birthday) {
    // birthday가 Date 객체인 경우, 시간을 정오로 설정하여 변환
    const date = new Date(updates.birthday);
    const birthdayDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
    updateData.birthday = birthdayDate.toISOString();
  }
  
  const { error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating employee:', error);
    throw new Error(error.message);
  }
};

// Delete an employee
export const deleteEmployeeFromApi = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting employee:', error);
    throw new Error(error.message);
  }
};
