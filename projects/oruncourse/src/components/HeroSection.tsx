import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, BookOpen, Award } from 'lucide-react';
import orunLogo from '@/assets/orun-academy-logo.jpg';
const HeroSection: React.FC = () => {
  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative py-12 sm:py-16 md:py-24 lg:py-40 xl:py-48 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Minimal Apple-style background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] sm:h-[600px] bg-gradient-to-b from-primary/5 via-primary/2 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/3 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative w-full px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-6xl mx-auto relative">
          {/* Minimal badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted text-muted-foreground text-xs sm:text-sm font-medium mb-6 sm:mb-8 md:mb-12 transition-all duration-300 hover:bg-accent hover:text-accent-foreground">
            <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary animate-pulse"></div>
            <span className="tracking-wide">ORUN ENGLISH</span>
          </div>
          
          {/* Clean Apple-style title */}
          <h1 className="font-display font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">옳은영어</span>
            <span className="block text-muted-foreground font-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-3 sm:mt-4 md:mt-6 tracking-tight">수강신청 플랫폼</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-14 leading-relaxed font-normal px-4">
            체계적인 커리큘럼과 전문 강사진의 맞춤형 케어로<br className="hidden sm:block" />
            최고의 학습경험을 제공합니다
          </p>
          
          {/* Minimal CTA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 md:mb-20">
            <Button 
              size="lg" 
              onClick={scrollToCourses} 
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-full font-semibold shadow-card hover:shadow-floating transition-all duration-300 w-full sm:w-auto min-w-[180px] sm:min-w-[200px] group"
            >
              수강 신청하기
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 transition-transform group-hover:translate-x-1 duration-300" />
            </Button>
          </div>
          
          {/* Feature highlights */}
          
        </div>
      </div>
    </section>;
};
export default HeroSection;