
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 text-center text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-slate-300">© {currentYear} 옳은영어. All rights reserved.</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <p className="text-slate-400">Developed by <span className="font-medium text-white">옳은영어 김성진T</span></p>
            <div className="flex items-center justify-center gap-4 mt-2 md:mt-0">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors cursor-pointer"></div>
              <div className="h-6 w-6 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors cursor-pointer"></div>
              <div className="h-6 w-6 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors cursor-pointer"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
