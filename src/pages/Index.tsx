import { QuestionGenerator } from "@/components/QuestionGenerator";
import { APIConfig } from "@/components/APIConfig";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    if (storedExpiry) {
      const formattedDate = new Date(storedExpiry).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setExpiryDate(formattedDate);
    }

    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
    });
    
    setUserName("");
    setExpiryDate("");
    
    window.location.reload();
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF] z-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-3 relative z-10">
        <div className="flex items-center justify-center space-x-6">
          <img 
            src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
            alt="ORUN ACADEMY Logo" 
            className="w-32 h-32 object-contain"
          />
          
          <h1 className="text-7xl font-bold animate-title tracking-wider relative group">
            <span className="inline-block transform transition-transform group-hover:scale-105 duration-300">
              ORUN AI QUIZ MAKER
            </span>
          </h1>
        </div>

        <div className="relative h-1 max-w-2xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent animate-pulse" />
        </div>

        <div className="metallic-border rounded-xl p-4 backdrop-blur-lg bg-gradient-to-b from-white/90 to-gray-50/90">
          {(userName || expiryDate) && (
            <div className="mb-3 text-sm text-blue-600 flex items-center justify-between bg-[#D3E4FD] rounded-lg p-2 border-b border-blue-100">
              <div className="flex-1 text-left space-x-4">
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
          )}
          <APIConfig />
        </div>
        
        <div className="metallic-border rounded-xl p-8">
          <QuestionGenerator />
        </div>
      </div>

      <footer className="mt-16 text-center relative z-10">
        <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 옳은영어 김성진T
        </p>
      </footer>
    </div>
  );
};

export default Index;