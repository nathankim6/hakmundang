import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

const ADMIN_ACCESS_CODE = "101100";

const Auth = () => {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode) {
      toast.error("액세스 코드를 입력해주세요.");
      return;
    }

    setLoading(true);

    // Simple access code validation
    if (accessCode === ADMIN_ACCESS_CODE) {
      sessionStorage.setItem("isAuthenticated", "true");
      toast.success("로그인 성공!");
      navigate("/dashboard");
    } else {
      toast.error("올바르지 않은 액세스 코드입니다.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-16 w-16 rounded-lg" />
          </div>
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <CardDescription>
            액세스 코드를 입력하여 설문조사 플랫폼에 접근하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">액세스 코드</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="••••••"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "확인 중..." : "로그인"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
