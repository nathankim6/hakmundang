import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export function AccessCodeCheck() {
  const [code, setCode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hasAccess = localStorage.getItem("hasAccess");
    if (hasAccess === "true") {
      setIsValid(true);
    }
  }, []);

  const checkAccessCode = () => {
    const storedCodes = JSON.parse(localStorage.getItem("accessCodes") || "[]");
    const currentTime = new Date().getTime();
    
    const validCode = storedCodes.find(
      (c: { code: string; expiryDate: number }) =>
        c.code === code && c.expiryDate > currentTime
    );

    if (validCode) {
      localStorage.setItem("hasAccess", "true");
      setIsValid(true);
      toast({
        title: "접속 성공",
        description: "엑세스 코드가 확인되었습니다.",
      });
    } else {
      toast({
        title: "접속 실패",
        description: "유효하지 않은 엑세스 코드입니다.",
        variant: "destructive",
      });
    }
  };

  if (isValid) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-4 text-center sm:text-left">
          <h2 className="text-lg font-semibold">엑세스 코드 입력</h2>
          <p className="text-sm text-muted-foreground">
            계속하려면 엑세스 코드를 입력하세요.
          </p>
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="엑세스 코드 입력..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={checkAccessCode}>확인</Button>
          </div>
          <div className="text-right">
            <Button
              variant="link"
              onClick={() => navigate("/admin")}
              className="text-sm text-muted-foreground"
            >
              관리자 로그인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}