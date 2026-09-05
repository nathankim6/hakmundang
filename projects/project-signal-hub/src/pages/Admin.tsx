
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeManagement } from "@/components/EmployeeManagement";
import { setupEmployeeSubscription } from "@/lib/employee/subscription";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/lib/authStore";
import { useNavigate } from "react-router-dom";
import { useEmployeeStore } from "@/lib/employee/store";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, hasAdminPrivileges, currentUser } = useAuthStore();
  const { fetchEmployees } = useEmployeeStore();
  
  // Check if the user has permission to access this page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Allow access to either users with admin privileges OR department managers
    const isDepartmentManager = currentUser?.accessLevel === 'department';
    if (!hasAdminPrivileges() && !isDepartmentManager) {
      toast({
        title: "접근 권한 없음",
        description: "이 페이지에 접근할 권한이 없습니다.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAuthenticated, hasAdminPrivileges, currentUser, navigate, toast]);
  
  // Set up real-time subscription for employees
  useEffect(() => {
    // Load initial employee data
    fetchEmployees();
    
    const channel = setupEmployeeSubscription();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmployees]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 animate-fade-in">
      <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-4'} py-6 flex-1 flex flex-col gap-6`}>
        <Header />
        <div className={`bg-card/50 rounded-xl ${isMobile ? 'p-3' : 'p-6'} shadow-md border border-border/30`}>
          <EmployeeManagement />
        </div>
      </div>
    </div>
  );
};

export default Admin;
