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
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-5 bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-white/20 backdrop-blur-xl">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-200">액세스 코드 입력</span>
              </div>
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="엑세스 코드를 입력하세요..."
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="pl-12 h-12 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 rounded-lg transition-all duration-300"
                  />
                </div>
                <Button 
                  onClick={handleLogin}
                  className="h-12 px-6 relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 rounded-lg transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 font-semibold">로그인</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLoginForm(false)}
                  className="h-12 px-5 relative overflow-hidden bg-gradient-to-r from-slate-700/60 to-slate-600/40 border border-slate-500/50 hover:border-slate-400/60 text-slate-200 hover:text-white rounded-lg transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 font-medium">취소</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (userName || expiryDate) ? (
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-5 bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-white/20 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-200">인증 완료</span>
                </div>
                <div className="flex flex-col space-y-1 text-slate-300">
                  {userName && <span className="text-sm font-medium">사용자: <span className="text-blue-300">{userName}</span></span>}
                  {expiryDate && <span className="text-sm font-medium">만료일: <span className="text-indigo-300">{expiryDate}</span></span>}
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="relative overflow-hidden text-rose-300 hover:text-rose-200 bg-gradient-to-r from-rose-900/40 to-red-900/30 hover:from-rose-800/50 hover:to-red-800/40 border border-rose-700/40 hover:border-rose-600/60 rounded-lg transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LogOut className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10 font-medium">로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowLoginForm(true)}
            className="relative overflow-hidden text-blue-300 hover:text-blue-200 bg-gradient-to-r from-blue-900/40 to-indigo-900/30 hover:from-blue-800/50 hover:to-indigo-800/40 border border-blue-700/40 hover:border-blue-600/60 rounded-lg transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Key className="h-4 w-4 mr-2 relative z-10" />
            <span className="relative z-10 font-medium">엑세스 코드로 로그인</span>
          </Button>
        </div>
      )}
    </>
  );
};