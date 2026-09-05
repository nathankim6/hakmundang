
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from '@/components/AdminLogin';
import AdminForm from '@/components/AdminForm';
import DataRecoveryTool from '@/components/DataRecoveryTool';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = (location.state as any)?.from as string | undefined;

  useEffect(() => {
    // Verify stored access code via server-side edge function
    const verifyAccess = async () => {
      const code = sessionStorage.getItem('verifiedAccessCode');
      if (!code) return;

      try {
        const { data, error } = await supabase.functions.invoke('verify-access-code', {
          body: { code },
        });

        if (!error && data?.valid) {
          if (redirectTo) {
            navigate(redirectTo, { replace: true });
          } else {
            setIsAuthenticated(true);
          }
        } else {
          sessionStorage.removeItem('verifiedAccessCode');
        }
      } catch {
        sessionStorage.removeItem('verifiedAccessCode');
      }
    };

    verifyAccess();
  }, [redirectTo, navigate]);

  const handleLoginSuccess = () => {
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    } else {
      setIsAuthenticated(true);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
          <PageHeader
            title="관리자 페이지"
            subtitle="시험 생성 및 데이터 관리"
            backPath="/"
          />
          <div className="container mx-auto max-w-6xl p-4">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recovery">데이터 복구 & 보호</TabsTrigger>
                <TabsTrigger value="create">시험 생성</TabsTrigger>
              </TabsList>
              <TabsContent value="recovery" className="space-y-4">
                <DataRecoveryTool />
              </TabsContent>
              <TabsContent value="create" className="space-y-4">
                <AdminForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default Admin;
