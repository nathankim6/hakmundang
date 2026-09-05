
import React, { useState, useEffect } from "react";
import { useEmployeeStore } from "@/lib/employeeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEmployeeManagement } from "@/hooks/use-employee-management";
import { useEmployeeActions } from "@/hooks/use-employee-actions";

// Import refactored components
import { EmployeeToolbar } from "./employee/EmployeeToolbar";
import { EmployeeTable } from "./employee/EmployeeTable";
import { AddEmployeeDialog } from "./employee/AddEmployeeDialog";
import { EditEmployeeDialog } from "./employee/EditEmployeeDialog";

export function EmployeeManagement() {
  const isMobile = useIsMobile();
  const { fetchEmployees } = useEmployeeStore();
  const {
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
    handleBirthdayDayChange
  } = useEmployeeManagement();
  
  const {
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleRefresh
  } = useEmployeeActions();
  
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  const openEditDialog = (employee: any) => {
    setSelectedEmployee({...employee});
    setIsEditDialogOpen(true);
  };
  
  const handleAddEmployeeSubmit = async () => {
    const success = await handleAddEmployee(newEmployee);
    if (success) {
      setIsAddDialogOpen(false);
      setNewEmployee({
        name: "",
        position: "",
        department: "administration",
        accessCode: "",
        accessLevel: "personal",
        birthday: undefined,
        birthdayMonth: undefined,
        birthdayDay: undefined,
        calendarType: "solar",
      });
    }
  };
  
  const handleUpdateEmployeeSubmit = async () => {
    const success = await handleUpdateEmployee(selectedEmployee);
    if (success) {
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <EmployeeToolbar 
        employeeCount={employees.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
        addEmployeeButton={
          <AddEmployeeDialog 
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            handleAddEmployee={handleAddEmployeeSubmit}
            handleBirthdayMonthChange={handleBirthdayMonthChange}
            handleBirthdayDayChange={handleBirthdayDayChange}
          />
        }
      />
      
      <Separator className="my-4" />
      
      <Card className="overflow-hidden border-border/40 shadow-md">
        <CardHeader className="bg-card/50 pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>직원 목록</span>
            </div>
            <Badge variant="outline" className="px-3 py-1.5">
              총 {groupedEmployees.reduce((acc, group) => acc + group.employees.length, 0)}명
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EmployeeTable 
              groupedEmployees={groupedEmployees}
              handleDeleteEmployee={handleDeleteEmployee}
              openEditDialog={openEditDialog}
              departmentNames={departmentNames}
              accessLevelNames={accessLevelNames}
              sortOrder={sortOrder}
              isMobile={isMobile}
            />
          )}
        </CardContent>
      </Card>
      
      <EditEmployeeDialog 
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleUpdateEmployee={handleUpdateEmployeeSubmit}
        handleBirthdayMonthChange={handleBirthdayMonthChange}
        handleBirthdayDayChange={handleBirthdayDayChange}
      />
    </div>
  );
}
