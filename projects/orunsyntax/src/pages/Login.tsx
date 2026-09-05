import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import orunAcademyBadge from '@/assets/orun-academy-badge.jpg';

const Login = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    const success = await login(code);
    
    if (success) {
      navigate('/');
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23C9A961' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={orunAcademyBadge} 
              alt="ORUN Academy" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="font-cinzel text-3xl font-bold text-amber-400 mb-2">
              ORUN SYNTAX
            </h1>
            <p className="text-zinc-400 text-sm">
              액세스 코드를 입력하세요
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="w-5 h-5 text-amber-500/50" />
              </div>
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                placeholder="액세스 코드 입력"
                className={`w-full pl-12 pr-4 py-4 bg-zinc-800 border ${
                  error ? 'border-red-500' : 'border-amber-500/30'
                } rounded-xl text-white text-center text-xl tracking-widest font-mono placeholder:text-zinc-500 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-amber-500 transition-colors`}
                autoFocus
                disabled={isLoggingIn}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>유효하지 않은 코드입니다</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '입장하기'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-zinc-600">
            © 2026 ORUN Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
