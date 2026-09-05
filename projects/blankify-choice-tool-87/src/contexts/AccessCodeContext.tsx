
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccessCodeContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessCodes: string[];
  verifyCode: (code: string) => Promise<boolean>;
  addCode: (code: string) => void;
  removeCode: (code: string) => void;
  logout: () => void;
}

export const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

export const AccessCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [accessCodes, setAccessCodes] = useState<string[]>([]);
  const { toast } = useToast();
  
  const ADMIN_CODE = "101100";
  const ADMIN_TIMEOUT = 30 * 60 * 1000; 
  const adminTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadCodes = async () => {
      try {
        const { data, error } = await supabase
          .from('veritas_access_codes')
          .select('code');

        if (error) {
          console.error('Error loading access codes from Supabase:', error);
          fallbackToLocalStorage();
          return;
        }

        if (data && data.length > 0) {
          const codes = data.map(item => item.code);
          setAccessCodes(codes);
        } else {
          const initialCodes = ["123456"];
          setAccessCodes(initialCodes);
          
          const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          
          const { error: insertError } = await supabase
            .from('veritas_access_codes')
            .insert({ 
              code: initialCodes[0], 
              expiry_date: oneYearFromNow,
              description: 'Default access code'
            });
          
          if (insertError) {
            console.error('Error adding default code to Supabase:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in loadCodes:', error);
        fallbackToLocalStorage();
      }
    };

    const fallbackToLocalStorage = () => {
      const storedCodes = localStorage.getItem('accessCodes');
      if (storedCodes) {
        setAccessCodes(JSON.parse(storedCodes));
      } else {
        const initialCodes = ["123456"];
        setAccessCodes(initialCodes);
        localStorage.setItem('accessCodes', JSON.stringify(initialCodes));
      }
    };

    loadCodes();
    
    const authStatus = localStorage.getItem('isAuthenticated');
    const adminStatus = localStorage.getItem('isAdmin');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      
      if (adminStatus === 'true') {
        setIsAdmin(true);
        startAdminTimeout();
      }
    }
    
    return () => {
      if (adminTimeoutRef.current) {
        clearTimeout(adminTimeoutRef.current);
      }
    };
  }, []);

  const startAdminTimeout = () => {
    if (adminTimeoutRef.current) {
      clearTimeout(adminTimeoutRef.current);
    }
    
    adminTimeoutRef.current = setTimeout(() => {
      if (isAdmin) {
        logout();
        toast({
          title: "세션 만료",
          description: "관리자 세션이 만료되었습니다. 다시 로그인해주세요.",
        });
      }
    }, ADMIN_TIMEOUT);
  };

  useEffect(() => {
    const resetTimeout = () => {
      if (isAdmin) {
        startAdminTimeout();
      }
    };
    
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [isAdmin]);

  const verifyCode = async (code: string): Promise<boolean> => {
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('accessCode', code);
      
      startAdminTimeout();
      
      toast({
        title: "관리자 모드로 접속되었습니다.",
        description: "액세스 코드를 관리할 수 있습니다.",
      });
      return true;
    } else {
      try {
        const { data, error } = await supabase
          .from('veritas_access_codes')
          .select('code')
          .eq('code', code)
          .single();
        
        if (error) {
          console.error('Error verifying access code:', error);
          return false;
        }
        
        if (data) {
          setIsAuthenticated(true);
          setIsAdmin(false);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('isAdmin', 'false');
          localStorage.setItem('accessCode', code);
          
          // Update last_accessed timestamp
          await supabase
            .from('veritas_access_codes')
            .update({ last_accessed: new Date().toISOString() })
            .eq('code', code);
            
          toast({
            title: "접속 성공",
            description: "올바른 액세스 코드로 접속되었습니다.",
          });
          return true;
        }
      } catch (error) {
        console.error('Error verifying code with Supabase:', error);
      }
    }
    
    toast({
      title: "접속 실패",
      description: "유효하지 않은 액세스 코드입니다.",
      variant: "destructive",
    });
    return false;
  };

  const addCode = async (code: string) => {
    if (!code || code.trim() === '') {
      toast({
        title: "오류",
        description: "빈 코드는 추가할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    if (accessCodes.includes(code)) {
      toast({
        title: "오류",
        description: "이미 존재하는 액세스 코드입니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('veritas_access_codes')
        .insert({ 
          code: code, 
          expiry_date: oneYearFromNow,
          description: 'User added access code'
        });
      
      if (error) {
        console.error('Error adding code to Supabase:', error);
        toast({
          title: "오류",
          description: "코드 추가 중 문제가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }
      
      const newCodes = [...accessCodes, code];
      setAccessCodes(newCodes);
      
      localStorage.setItem('accessCodes', JSON.stringify(newCodes));
      
      toast({
        title: "코드 추가 완료",
        description: `액세스 코드 "${code}"가 추가되었습니다.`,
      });
    } catch (error) {
      console.error('Error in addCode:', error);
      toast({
        title: "오류",
        description: "코드 추가 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const removeCode = async (code: string) => {
    try {
      const { error } = await supabase
        .from('veritas_access_codes')
        .delete()
        .eq('code', code);
      
      if (error) {
        console.error('Error removing code from Supabase:', error);
        toast({
          title: "오류",
          description: "코드 삭제 중 문제가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }
      
      const newCodes = accessCodes.filter(c => c !== code);
      setAccessCodes(newCodes);
      
      localStorage.setItem('accessCodes', JSON.stringify(newCodes));
      
      toast({
        title: "코드 삭제 완료",
        description: `액세스 코드 "${code}"가 삭제되었습니다.`,
      });
    } catch (error) {
      console.error('Error in removeCode:', error);
      toast({
        title: "오류",
        description: "코드 삭제 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('accessCode');
    
    if (adminTimeoutRef.current) {
      clearTimeout(adminTimeoutRef.current);
      adminTimeoutRef.current = null;
    }
    
    toast({
      title: "로그아웃 되었습니다.",
    });
  };

  return (
    <AccessCodeContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        accessCodes,
        verifyCode,
        addCode,
        removeCode,
        logout,
      }}
    >
      {children}
    </AccessCodeContext.Provider>
  );
};

export const useAccessCode = (): AccessCodeContextType => {
  const context = useContext(AccessCodeContext);
  if (context === undefined) {
    throw new Error('useAccessCode must be used within an AccessCodeProvider');
  }
  return context;
};
