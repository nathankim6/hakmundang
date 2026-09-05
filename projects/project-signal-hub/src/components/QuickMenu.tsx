import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, GraduationCap, Briefcase, Brain, BookOpen, Book, Bot, BarChart3, Calendar, BookA } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type QuickLink = {
  name: string;
  url: string;
  icon: React.ReactNode;
  description?: string;
  gradient?: string;
};

const quickLinks: QuickLink[] = [
  {
    name: "시험관리(OMR)",
    url: "http://oruntest.site",
    icon: <FileText className="h-4 w-4" />,
    description: "시험 결과 및 OMR 관리",
    gradient: "from-orange-500/20 to-amber-500/20"
  },
  {
    name: "학생관리",
    url: "http://orunstudents.site",
    icon: <GraduationCap className="h-4 w-4" />,
    description: "학생 학습 진도 관리",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    name: "업무관리",
    url: "http://oruntask.site",
    icon: <Briefcase className="h-4 w-4" />,
    description: "업무 및 일정 관리",
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    name: "AI 퀴즈메이커",
    url: "http://orunquiz.site",
    icon: <Brain className="h-4 w-4" />,
    description: "AI 기반 퀴즈 생성",
    gradient: "from-emerald-500/20 to-green-500/20"
  },
  {
    name: "AI 학습매니지먼트",
    url: "http://orunstudy.site",
    icon: <BookOpen className="h-4 w-4" />,
    description: "AI 학습 진도 관리",
    gradient: "from-rose-500/20 to-pink-500/20"
  },
  {
    name: "워크북메이커",
    url: "http://newveritas.site",
    icon: <Book className="h-4 w-4" />,
    description: "워크북 제작 및 관리",
    gradient: "from-indigo-500/20 to-blue-500/20"
  },
  {
    name: "AI조교",
    url: "http://oruntutor.site",
    icon: <Bot className="h-4 w-4" />,
    description: "AI 기반 개인 조교 및 학습 지원",
    gradient: "from-cyan-500/20 to-sky-500/20"
  },
  {
    name: "내신분석",
    url: "https://oruntestreport.lovable.app/",
    icon: <BarChart3 className="h-4 w-4" />,
    description: "내신 성적 분석 및 리포트",
    gradient: "from-teal-500/20 to-emerald-500/20"
  },
  {
    name: "학교분석&기출DB",
    url: "https://schoolanalysis.lovable.app",
    icon: <FileText className="h-4 w-4" />,
    description: "학교 분석 및 기출 문제 데이터베이스",
    gradient: "from-amber-500/20 to-yellow-500/20"
  },
  {
    name: "수강신청",
    url: "https://oruncourse.lovable.app",
    icon: <Calendar className="h-4 w-4" />,
    description: "강좌 및 수강 신청 관리",
    gradient: "from-purple-500/20 to-fuchsia-500/20"
  },
  {
    name: "옳은보카",
    url: "http://orunvoca.lovable.app",
    icon: <BookA className="h-4 w-4" />,
    description: "영어 단어 학습 및 관리",
    gradient: "from-lime-500/20 to-green-500/20"
  }
];

export const QuickMenu = () => {
  return (
    <div className="quick-menu-container animate-fade-in">
      {/* Subtle Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-11 gap-0.5 px-2 py-2 relative z-10">
        {quickLinks.map((link, index) => (
          <Popover key={link.url}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="quick-menu-item group"
                onClick={() => window.open(link.url, "_blank")}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  "bg-gradient-to-br backdrop-blur-sm rounded-xl",
                  link.gradient
                )} />

                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {/* Icon Container */}
                  <div className="quick-menu-icon">
                    <div className="text-primary/80 group-hover:text-primary transition-colors duration-500">
                      {link.icon}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-0.5 text-center">
                    <h3 className="quick-menu-title">{link.name}</h3>
                    
                    {/* External Link Indicator */}
                    <div className="quick-menu-link">
                      <ExternalLink className="h-2 w-2 group-hover:animate-bounce" />
                      <span className="text-[0.45rem] font-semibold tracking-wider uppercase whitespace-nowrap">
                        바로가기
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary to-transparent rounded-b-xl" />
              </Button>
            </PopoverTrigger>
            
            {link.description && (
              <PopoverContent 
                className="w-72 p-4 backdrop-blur-xl bg-popover/98 border-border/50 shadow-xl rounded-xl" 
                sideOffset={12}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg shadow-sm",
                    "bg-gradient-to-br from-primary/20 to-primary/10"
                  )}>
                    {link.icon}
                  </div>
                  <h4 className="font-bold text-foreground text-sm">{link.name}</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs">{link.description}</p>
              </PopoverContent>
            )}
          </Popover>
        ))}
      </div>
    </div>
  );
};
