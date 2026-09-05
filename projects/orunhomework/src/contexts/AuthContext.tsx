import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "teacher" | "student";

interface AuthSession {
  code: string;
  name: string;
  isAdmin: boolean;
  role: UserRole;
  accessCodeId: string; // access_codes 테이블의 ID
  studentId?: string; // 학생 역할일 경우 학생 ID
  schoolName?: string; // 소속 학교명
  gradeName?: string; // 학년명
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "homework_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 세션 복구
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 접속 코드 확인
      const { data, error } = await supabase
        .from("access_codes")
        .select("*")
        .eq("code", code.trim())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        return { success: false, error: "유효하지 않은 접속 코드입니다." };
      }

      // 마지막 사용 시간 업데이트
      await supabase
        .from("access_codes")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", data.id);

      // 학생 코드인 경우 학생 ID, 학교, 학년 조회
      let studentId: string | undefined;
      let schoolName: string | undefined;
      let gradeName: string | undefined;
      
      if (data.role === "student") {
        const { data: studentData } = await supabase
          .from("students")
          .select(`
            id,
            grade:grade_id(
              name,
              school:school_id(name)
            )
          `)
          .eq("access_code_id", data.id)
          .maybeSingle();
        
        studentId = studentData?.id;
        if (studentData?.grade) {
          gradeName = (studentData.grade as any).name;
          if ((studentData.grade as any).school) {
            schoolName = (studentData.grade as any).school.name;
          }
        }
      }

      const newSession: AuthSession = {
        code: data.code,
        name: data.name,
        isAdmin: data.is_admin,
        role: data.role as UserRole,
        accessCodeId: data.id,
        studentId,
        schoolName,
        gradeName,
      };

      setSession(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

      return { success: true };
    } catch (err) {
      return { success: false, error: "로그인 중 오류가 발생했습니다." };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
