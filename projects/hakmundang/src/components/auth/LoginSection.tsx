import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, LogOut } from "lucide-react";

interface LoginSectionProps {
  showLoginForm: boolean;
  userName: string;
  expiryDate: string;
  accessCode: string;
  setAccessCode: (code: string) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  setShowLoginForm: (show: boolean) => void;
}

export const LoginSection = ({
  showLoginForm,
  userName,
  expiryDate,
  accessCode,
  setAccessCode,
  handleLogin,
  handleLogout,
  setShowLoginForm
}: LoginSectionProps) => {
  return (
    <>
      {showLoginForm ? (
        <div className="mb-3 p-4 bg-white/80 rounded-lg border border-gray-100">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="엑세스 코드를 입력하세요..."
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleLogin}>로그인</Button>
            <Button variant="outline" onClick={() => setShowLoginForm(false)}>취소</Button>
          </div>
        </div>
      ) : (userName || expiryDate) ? (
        <div className="mb-3 text-sm flex items-center justify-between bg-white/80 rounded-lg p-2 border-b border-gray-100">
          <div className="flex-1 text-left space-x-4 text-[#0EA5E9]">
            {userName && <span>사용자: {userName}</span>}
            {expiryDate && <span>만료일: {expiryDate}</span>}
          </div>
          <Button 
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            로그아웃
          </Button>
        </div>
      ) : (
        <div className="mb-3 flex justify-end">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowLoginForm(true)}
            className="text-[#0EA5E9] hover:text-[#0EA5E9]/80"
          >
            <Key className="h-4 w-4 mr-1" />
            엑세스 코드로 로그인
          </Button>
        </div>
      )}
    </>
  );
};