
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="w-full relative">
      <img 
        src="/lovable-uploads/169494f7-fa90-4f18-b40d-8eb90025805b.png" 
        alt="옳은영어 AI조교 소피아" 
        className="w-full h-auto object-cover"
      />
      
      {!isHomePage && (
        <button 
          onClick={handleGoBack}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5 text-toss-gray" />
        </button>
      )}
    </header>
  );
};

export default Header;
