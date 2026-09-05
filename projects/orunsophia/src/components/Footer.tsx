
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Archive, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <footer className="bg-white fixed bottom-0 left-0 right-0 z-30 border-t border-toss-border/20 shadow-sm">
      <div className="px-2 py-1 flex items-center justify-around max-w-4xl mx-auto">
        <NavButton 
          icon={<Home />} 
          label="홈" 
          active={location.pathname === '/'} 
          onClick={() => navigate('/')}
        />
        <NavButton 
          icon={<Archive />} 
          label="저장소" 
          active={location.pathname === '/storage'}
          onClick={() => navigate('/storage')}
        />
        <NavButton 
          icon={<User />} 
          label="내정보" 
          active={location.pathname === '/profile'}
          onClick={() => navigate('/profile')}
        />
      </div>
    </footer>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, active = false, onClick }: NavButtonProps) => {
  return (
    <button 
      className={cn(
        "flex flex-col items-center justify-center p-2 w-20 touch-target touch-feedback",
        active ? "text-toss-blue" : "text-toss-textSecondary"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "mb-1",
        active && "text-toss-blue"
      )}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default Footer;
