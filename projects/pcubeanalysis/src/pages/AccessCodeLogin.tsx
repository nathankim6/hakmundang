import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const ACCESS_CODE = "1004";

const AccessCodeLogin: React.FC = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (code === ACCESS_CODE) {
      localStorage.setItem("pcube_access", "granted");
      navigate("/");
    } else {
      toast.error("잘못된 액세스 코드입니다.");
      setCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-rose-50/30 to-pink-50/30 px-4">
      <div className="bg-card border-2 border-border rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full">
        <div className="inline-flex p-5 bg-gradient-to-br from-primary to-rose-700 rounded-2xl shadow-lg">
          <Lock className="h-10 w-10 text-primary-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Pcube English</h1>
          <p className="text-muted-foreground text-sm">액세스 코드를 입력해주세요</p>
        </div>
        <InputOTP maxLength={4} value={code} onChange={setCode} onComplete={handleSubmit}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <Button
          onClick={handleSubmit}
          disabled={code.length < 4}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-rose-700 hover:from-rose-800 hover:to-pink-700 text-primary-foreground font-bold py-6 text-base shadow-lg"
        >
          확인
        </Button>
      </div>
    </div>
  );
};

export default AccessCodeLogin;
