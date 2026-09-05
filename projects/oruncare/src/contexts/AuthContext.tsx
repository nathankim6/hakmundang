
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('사용자');
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for access code on mount
    const savedCode = localStorage.getItem('accessCode');
    if (savedCode) {
      validateAccessCode(savedCode);
    }
  }, []);

  const validateAccessCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('orun_access_codes')
        .select('name')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        console.error('Error validating access code:', error);
        setIsAuthenticated(false);
        setUserName('사용자');
        localStorage.removeItem('accessCode');
        return;
      }

      if (data) {
        setIsAuthenticated(true);
        setUserName(data.name);
        localStorage.setItem('accessCode', code);
      } else {
        setIsAuthenticated(false);
        setUserName('사용자');
        localStorage.removeItem('accessCode');
      }
    } catch (error) {
      console.error('Error validating access code:', error);
      setIsAuthenticated(false);
      setUserName('사용자');
      localStorage.removeItem('accessCode');
    }
  };

  const login = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('orun_access_codes')
        .select('name')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        console.error('Login error:', error);
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: "올바르지 않은 액세스 코드입니다.",
        });
        return;
      }

      if (data) {
        setIsAuthenticated(true);
        setUserName(data.name);
        localStorage.setItem('accessCode', code);
        toast({
          title: "로그인 성공",
          description: "관리자 모드로 접속되었습니다.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: "올바르지 않은 액세스 코드입니다.",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "올바르지 않은 액세스 코드입니다.",
      });
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUserName('사용자');
    localStorage.removeItem('accessCode');
    toast({
      title: "로그아웃",
      description: "로그아웃되었습니다.",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
