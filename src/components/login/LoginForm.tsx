import React from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Key } from "lucide-react";

interface LoginFormProps {
  code: string;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const LoginForm = ({ code, onCodeChange, onSubmit }: LoginFormProps) => {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="relative">
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
        <Input
          type="text"
          placeholder="엑세스 코드를 입력하세요..."
          value={code}
          onChange={onCodeChange}
          className="pl-10 pr-4 py-6 text-lg bg-white/10 border-white/20 focus:border-white/40 text-white placeholder:text-white/60 transition-all duration-300 backdrop-blur-sm"
        />
      </div>
      <Button 
        onClick={onSubmit}
        className="w-full py-6 text-lg font-medium bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 text-white"
      >
        확인
      </Button>
      <p className="text-sm text-white/80 text-center">
        엑세스 코드가 필요하신 경우 관리자에게 문의하세요.
      </p>
    </div>
  );
};