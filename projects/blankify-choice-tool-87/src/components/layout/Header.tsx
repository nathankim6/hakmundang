import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const {
    logout,
    isAdmin
  } = useAccessCode();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/access');
  };
  
  return <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/60 border-b border-indigo-200/40 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-celestial bg-pattern-md opacity-15"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 text-xs text-indigo-900 rotate-12 select-none">
          01101110 01100101 01110111 00100000 01110110 01100101 01110010 01101001 01110100 01100001 01110011
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-xs text-indigo-900 -rotate-6 select-none">
          ∫∂Ω √∑∏ ∞≠≡⊕⊗
        </div>
        <div className="absolute top-1/3 right-1/4 text-xs text-indigo-900 rotate-45 select-none">
          φ = (1+√5)/2
        </div>
      </div>
      
      <div className="absolute -right-8 -top-8 w-24 h-24 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
          <path fill="none" stroke="currentColor" strokeWidth="1" d="M90,90 A80,80 0 0,1 10,90 A70,70 0 0,1 90,20 A60,60 0 0,1 30,90 A50,50 0 0,1 90,40 A40,40 0 0,1 50,90 A30,30 0 0,1 90,60 A20,20 0 0,1 70,90 A10,10 0 0,1 90,80" />
        </svg>
      </div>
      
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-300/10 via-indigo-500/40 to-blue-300/10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-200/10 via-amber-300/30 to-amber-200/10"></div>
      
      <div className="container mx-auto px-4 py-2.5 flex justify-between items-center relative z-10">
        <motion.div className="flex items-center gap-3" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="h-10 w-10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-colors duration-300"></div>
            <img alt="Orun Academy Logo" className="h-full w-full object-contain relative z-10" src="/lovable-uploads/f0766864-b703-41e3-a7a8-b78bbbcdd496.jpg" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent flex items-center">
              NEW VERITAS <Sparkles className="ml-1 h-4 w-4 text-indigo-500" />
            </span>
            <span className="text-slate-500 font-medium tracking-wide text-xs">옳은영어 워크북 제작플랫폼</span>
          </div>
        </motion.div>
        
        <motion.div className="flex items-center gap-2" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.5,
        delay: 0.1
      }}>
          {isAdmin && <Button variant="outline" size="sm" onClick={() => navigate('/admin/codes')} className="text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300">
              <Settings className="h-4 w-4 mr-1.5" />
              엑세스 코드 관리
            </Button>}
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300">
            <LogOut className="h-4 w-4 mr-1.5" />
            로그아웃
          </Button>
        </motion.div>
      </div>
    </header>;
};

export default Header;
