import { useEffect, useState } from "react";
import { QuestionGenerator } from "@/components/QuestionGenerator";
import { AppHeader } from "@/components/header/AppHeader";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { PageBackground } from "@/components/layout/PageBackground";
import { PageFooter } from "@/components/layout/PageFooter";

const Index = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <PageBackground />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col space-y-8">
          <AppHeader />
          <AuthContainer />
          <div className="metallic-border rounded-xl p-8">
            <QuestionGenerator />
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
};

export default Index;