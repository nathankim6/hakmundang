import { useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AccessCodeManager } from "@/components/admin/AccessCodeManager";
import { BackgroundManager } from "@/components/admin/BackgroundManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBackground } from "@/components/layout/PageBackground";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <PageBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="metallic-border rounded-xl p-8">
          <Tabs defaultValue="access-codes">
            <TabsList className="mb-4">
              <TabsTrigger value="access-codes">엑세스 코드 관리</TabsTrigger>
              <TabsTrigger value="backgrounds">배경 관리</TabsTrigger>
            </TabsList>
            
            <TabsContent value="access-codes">
              <AccessCodeManager />
            </TabsContent>
            
            <TabsContent value="backgrounds">
              <BackgroundManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;