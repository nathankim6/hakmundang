import { APIConfig } from "@/components/APIConfig";
import { QuestionGenerator } from "@/components/QuestionGenerator";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/header/AppHeader";
import { LoginSection } from "@/components/auth/LoginSection";
import { ActionButtons } from "@/components/buttons/ActionButtons";

const Index = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accessCode, setAccessCode] = useState("");
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
    
    navigate("/login");
  };

  const handleLogin = async () => {
    try {
      const { data: accessCodeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (accessCodeData && new Date(accessCodeData.expiry_date) > new Date()) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("subscriptionExpiry", accessCodeData.expiry_date);
        localStorage.setItem("userName", accessCodeData.name);
        
        const formattedDate = new Date(accessCodeData.expiry_date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setExpiryDate(formattedDate);
        setUserName(accessCodeData.name);
        setShowLoginForm(false);
        setAccessCode("");
        
        toast({
          title: "로그인 성공",
          description: "엑세스 코드가 확인되었습니다.",
        });
      } else {
        toast({
          title: "로그인 실패",
          description: "유효하지 않은 엑세스 코드입니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("Access code check error:", error);
    }
  };

  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showAIManagementModal, setShowAIManagementModal] = useState(false);

  const openVocabModal = () => setShowVocabModal(true);
  const openAIManagementModal = () => setShowAIManagementModal(true);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F1F0FB] to-[#E5DEFF] z-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col space-y-8">
          <AppHeader />

          <div className="metallic-border rounded-xl p-4 backdrop-blur-lg bg-gradient-to-b from-white/90 to-gray-50/90">
            <LoginSection 
              showLoginForm={showLoginForm}
              userName={userName}
              expiryDate={expiryDate}
              accessCode={accessCode}
              setAccessCode={setAccessCode}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              setShowLoginForm={setShowLoginForm}
            />
            <APIConfig />
          </div>
          
          <div className="metallic-border rounded-xl p-8">
            <QuestionGenerator />
          </div>

          <ActionButtons 
            openVocabModal={openVocabModal}
            openAIManagementModal={openAIManagementModal}
          />
        </div>
      </div>

      {/* Vocabulary Modal */}
      {showVocabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[95vw] h-[95vh] rounded-lg shadow-2xl relative">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowVocabModal(false)}
            >
              ✕
            </Button>
            <iframe
              src="https://vocabulary-voyage.lovable.app/"
              className="w-full h-full rounded-lg"
              title="Vocabulary Generator"
            />
          </div>
        </div>
      )}

      {/* AI Management Modal */}
      {showAIManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[95vw] h-[95vh] rounded-lg shadow-2xl relative">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAIManagementModal(false)}
            >
              ✕
            </Button>
            <iframe
              src="http://orunstudy.site"
              className="w-full h-full rounded-lg"
              title="AI Learning Management"
            />
          </div>
        </div>
      )}

      <footer className="mt-16 text-center relative z-10">
        <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          © 2024 ORUN AI QUIZ MAKER. All rights reserved by 옳은영어 김성진T
        </p>
      </footer>
    </div>
  );
};

export default Index;
