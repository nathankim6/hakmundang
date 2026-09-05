import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CourseProvider } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CourseList from '@/components/CourseList';
import AdminPanel from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import orunLogo from '@/assets/orun-academy-logo-footer.jpg';
const MainContent: React.FC = () => {
  const {
    isAdmin
  } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24">
        {/* Minimal Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            수강 과정
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            최적화된 학습 프로그램을 만나보세요
          </p>
        </div>
        
        {isAdmin ? <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12 h-12 rounded-full bg-muted/50 p-1">
              <TabsTrigger 
                value="courses" 
                className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-card font-semibold transition-all"
              >
                수강 과정
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-card font-semibold transition-all"
              >
                관리자
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" id="courses">
              <CourseList />
            </TabsContent>
            
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          </Tabs> : <div id="courses">
            <CourseList />
          </div>}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 mt-12 sm:mt-16 md:mt-24 bg-muted/30">
        <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-14">
          <div className="max-w-5xl mx-auto">
            {/* Logo & Tagline */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <img 
                src={orunLogo} 
                alt="ORUN ACADEMY" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 mx-auto mb-3 sm:mb-4 object-contain opacity-90" 
              />
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-4">
                English Learning Empowered by Christian Value
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto">
              <div className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-card hover:shadow-floating transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                    <span className="text-xl sm:text-2xl">📞</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">전화 문의</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">010-7522-4494</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-card hover:shadow-floating transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-2.5 md:p-3 rounded-full">
                    <span className="text-xl sm:text-2xl">📧</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">블로그</p>
                    <a 
                      href="https://blog.naver.com/orunenglish" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm sm:text-base md:text-lg font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                      방문하기
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address */}
            <div className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-8 sm:mb-10 md:mb-12 shadow-card max-w-2xl mx-auto">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-primary/10 p-2 sm:p-2.5 md:p-3 rounded-full shrink-0">
                  <span className="text-xl sm:text-2xl">📍</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">찾아오시는 길</p>
                  <p className="text-xs sm:text-sm md:text-base font-medium text-foreground leading-relaxed">
                    서울특별시 동작구 상도로161-1 옳은영어 뉴베리타스관 3층
                  </p>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center pt-6 sm:pt-8 border-t border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground">© 2025 옳은영어. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
const Index = () => {
  return <AuthProvider>
      <CourseProvider>
        <MainContent />
      </CourseProvider>
    </AuthProvider>;
};
export default Index;