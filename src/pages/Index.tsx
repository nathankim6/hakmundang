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
    // Get subscription expiry from localStorage
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    if (storedExpiry) {
      const formattedDate = new Date(storedExpiry).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setExpiryDate(formattedDate);
    }

    // Get user name from localStorage
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    
    // Show success toast
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
    });
    
    // Reset states
    setUserName("");
    setExpiryDate("");
    
    // Force page reload to show login screen
    window.location.reload();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF] z-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-4 relative z-10">
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

        {/* User Info Section with Logout Button */}
        {(userName || expiryDate) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-xl mx-auto mt-4 shadow-lg border border-gray-200">
            <div className="text-center space-y-2">
              {userName && (
                <p className="text-lg font-medium text-gray-800">
                  사용자: <span className="text-blue-600">{userName}</span>
                </p>
              )}
              {expiryDate && (
                <p className="text-lg font-medium text-gray-800">
                  구독 만료일: <span className="text-blue-600">{expiryDate}</span>
                </p>
              )}
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        )}
          
        <div className="relative h-1 max-w-2xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent animate-pulse" />
        </div>

        <div className="metallic-border rounded-xl p-6 backdrop-blur-lg">
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