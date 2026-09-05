import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, LogOut, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const accessCode = localStorage.getItem('access_code');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const isAdminUser = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(isAdminUser);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('access_code');
    localStorage.removeItem('is_admin');
    
    toast({
      title: "로그아웃 되었습니다",
      description: "다시 로그인하려면 엑세스 코드를 입력하세요.",
    });

    navigate('/access-code');
  };

  const handleGenerateCode = () => {
    navigate('/generate-code');
  };

  return (
    <div className="min-h-screen bg-toss-background flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Card className="mx-4 mt-8 p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-toss-blue/10 flex items-center justify-center">
              <User className="h-8 w-8 text-toss-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold">내 정보</h2>
              <p className="text-toss-textSecondary">엑세스 코드: {accessCode}</p>
            </div>
          </div>

          <div className="space-y-4">
            {isAdmin && (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleGenerateCode}
              >
                <Key className="mr-2 h-4 w-4" />
                코드 발급
              </Button>
            )}
            
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
