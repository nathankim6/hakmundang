
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";
import { useEmployeeStore } from "@/lib/employeeStore";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  const { fetchEmployees, isLoading: isEmployeesLoading } = useEmployeeStore();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure employees are loaded
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with access code:", accessCode);
      
      const success = await login(accessCode);
      
      if (success) {
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        
        // Navigate to home page or intended page
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        toast({
          title: "로그인 실패",
          description: "엑세스 코드가 올바르지 않습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "오류 발생",
        description: "로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
              <CardDescription className="text-center">
                엑세스 코드를 입력하여 로그인하세요
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="엑세스 코드 입력"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || isEmployeesLoading}
                    />
                  </div>
                </div>
                {isEmployeesLoading && (
                  <div className="text-center text-sm text-muted-foreground">
                    직원 정보를 불러오는 중...
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isEmployeesLoading || !accessCode.trim()}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
