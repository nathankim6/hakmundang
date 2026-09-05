import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, GraduationCap, Clock, Target, Award, Sparkles, CheckCircle2, Users, TrendingUp, Star, Download } from "lucide-react";
import instructorProfile from "@/assets/instructor-profile.png";
import orunLogo from "@/assets/orun-academy-logo.jpg";
import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
const Index = () => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const defaultContent = {
    instructorTitle: "매주 실전 모의고사 & 꼼꼼한 피드백으로  \n수능 \"1등급\"을 동행하겠습니다.",
    instructorDescription: "10년 이상의 입시 지도 경험과 수많은 합격생을 배출한 노하우로\n학생 개개인의 약점을 정확히 파악하고 체계적인 학습 전략을 제공합니다.\n학생 개개인의 약점을 정확히 파악하고 체계적인 학습 전략을 제공합니다.",
    // Warming Up Section
    warmingUpTitle: "김성진T 예비고3 1,2월 겨울방학 커리큘럼",
    warmingUpSubtitle: "",
    // December Section
    decDate: "12월",
    decTitle: "2026년 수능 완벽분석+전 문장 구문분석",
    decItem1: "2026년 수능 전체 지문 완벽 분석",
    decItem2: "전 문장 구문분석으로 기초 다지기",
    // January Section
    janDate: "1월 1일 ~ 1월 30일",
    janTitle: "빈/순/삽/함 하프 모의고사 + 구문/어법 주간지",
    janItem1: "빈칸/순서/삽입/함의추론으로 구성된 \"하프 모의고사\" 풀이 (총 6회)",
    janItem2: "역대 고3 모의고사 중 고난도  10000문장으로 구성한 구문/어법 주간지",
    // February Section
    febMarDate: "2월 1일 ~ 3월 30일",
    febMarTitle: "EBS 연계교재(수능특강)",
    febMarItem1: "2027 EBS 수능특강 연계교재 해설",
    febMarItem2: "고3 상위권 구문/어법 10000문장 주간지"
  };
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('curriculum-content');
    if (saved) {
      const parsed = JSON.parse(saved);
      // 저장된 내용과 기본값을 병합하여 새로운 필드도 유지
      return {
        ...defaultContent,
        ...parsed
      };
    }
    return defaultContent;
  });
  useEffect(() => {
    localStorage.setItem('curriculum-content', JSON.stringify(content));
  }, [content]);
  const handleDoubleClick = (field: string) => {
    setEditingField(field);
  };
  const handleBlur = () => {
    setEditingField(null);
  };
  const handleChange = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleDownloadImage = async () => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    try {
      toast.loading("이미지를 생성하는 중...");
      const canvas = await html2canvas(mainElement, {
        scale: 3,
        // High quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `옳은영어-정시반-커리큘럼-${new Date().getTime()}.jpg`;
          link.click();
          URL.revokeObjectURL(url);
          toast.dismiss();
          toast.success("이미지가 저장되었습니다!");
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      toast.dismiss();
      toast.error("이미지 저장 중 오류가 발생했습니다.");
      console.error(error);
    }
  };
  return <div className="min-h-screen bg-gradient-subtle">
      {/* Fixed Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-soft">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-soft">
                <img src={orunLogo} alt="Orun Academy" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">옳은영어 정시반 커리큘럼</h1>
                <p className="text-sm text-muted-foreground">Orun Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleDownloadImage} variant="secondary" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">이미지 저장</span>
              </Button>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                2025 수능 대비
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-hero text-primary-foreground py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{
          animationDelay: '1s'
        }}></div>
        </div>
        
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-glow">
              <img src={orunLogo} alt="Orun Academy" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-primary opacity-30 blur-2xl animate-pulse"></div>
            <h1 className="relative text-7xl md:text-8xl font-bold mb-4 animate-slide-up tracking-tight" style={{
            animationDelay: '0.1s'
          }}>
              <span className="bg-gradient-to-r from-white via-primary-foreground to-white bg-clip-text text-transparent">
                정시반 커리큘럼
              </span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-primary rounded-full shadow-glow"></div>
            </h1>
          </div>
          <p className="text-2xl opacity-95 max-w-2xl mx-auto font-light animate-slide-up leading-relaxed" style={{
          animationDelay: '0.2s'
        }}>
            체계적인 학습 계획으로 목표를 달성하세요
          </p>
          <div className="flex items-center justify-center gap-4 mt-8 animate-slide-up flex-wrap" style={{
          animationDelay: '0.3s'
        }}>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
              <Target className="w-5 h-5" />
              <span className="font-medium">맞춤형 학습</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
              <Award className="w-5 h-5" />
              <span className="font-medium">실전 중심</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">집중 관리</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-16">
        {/* Instructor Introduction Section */}
        <section className="mb-24">
          <div className="relative bg-gradient-glass backdrop-blur-sm rounded-3xl shadow-strong p-12 border border-border/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
            
            <div className="relative z-10 grid md:grid-cols-5 gap-12 items-center">
              {/* Profile Image */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative bg-white rounded-3xl p-2 shadow-medium">
                    <img src={instructorProfile} alt="전문 강사" className="rounded-2xl w-full max-w-sm object-cover shadow-soft" />
                    <div className="absolute -bottom-4 -right-4 bg-gradient-primary text-white px-6 py-3 rounded-2xl shadow-medium flex items-center gap-2">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">김성진T</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="md:col-span-3 space-y-6">
                <div>
                  <Badge className="bg-gradient-primary text-primary-foreground mb-4 px-4 py-2 text-sm font-semibold">옳은영어 정시반</Badge>
                  {editingField === 'instructorTitle' ? <textarea className="text-4xl font-bold mb-3 text-foreground w-full bg-background border border-primary rounded-lg p-2 min-h-[120px]" value={content.instructorTitle} onChange={e => handleChange('instructorTitle', e.target.value)} onBlur={handleBlur} autoFocus /> : <h2 className="text-4xl font-bold mb-3 text-foreground cursor-pointer hover:bg-muted/30 rounded p-2 transition-colors whitespace-pre-wrap" onDoubleClick={() => handleDoubleClick('instructorTitle')}>
                      {content.instructorTitle}
                    </h2>}
                  {editingField === 'instructorDescription' ? <textarea className="text-lg text-muted-foreground leading-relaxed w-full bg-background border border-primary rounded-lg p-2 min-h-[100px]" value={content.instructorDescription} onChange={e => handleChange('instructorDescription', e.target.value)} onBlur={handleBlur} autoFocus /> : <p className="text-lg text-muted-foreground leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-2 transition-colors whitespace-pre-wrap" onDoubleClick={() => handleDoubleClick('instructorDescription')}>
                      {content.instructorDescription}
                    </p>}
                </div>

                {/* Qualifications */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">수능/입시 지도 경력 10년 이상</h4>
                      <p className="text-sm text-muted-foreground"></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">고려대학교(안암) 독어독문학과 졸업</h4>
                      <p className="text-sm text-muted-foreground"></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">외국어고 및 최상위권 학생 다수 지도 </h4>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">수강생 중 명문대학 합격생 다수</h4>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">전문 분야</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 hover:bg-primary/20">
                      구문 독해
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-0 hover:bg-secondary/20">
                      고난도 빈칸
                    </Badge>
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-0 hover:bg-accent/20">
                      실전 모의고사
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 hover:bg-primary/20">
                      약점 집중 관리
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-0 hover:bg-secondary/20">
                      시간 관리 전략
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-March Schedule */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10 animate-fade-in text-card-foreground">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-soft">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              {editingField === 'warmingUpTitle' ? <input className="text-5xl font-bold text-foreground w-full bg-background border border-primary rounded-lg p-2" value={content.warmingUpTitle} onChange={e => handleChange('warmingUpTitle', e.target.value)} onBlur={handleBlur} autoFocus /> : <h2 className="text-5xl font-bold text-foreground cursor-pointer hover:bg-muted/30 rounded p-2 transition-colors" onDoubleClick={() => handleDoubleClick('warmingUpTitle')}>
                  {content.warmingUpTitle}
                </h2>}
              {editingField === 'warmingUpSubtitle' ? <input className="text-2xl font-bold text-foreground mt-3 w-full bg-background border border-primary rounded-lg p-2" value={content.warmingUpSubtitle} onChange={e => handleChange('warmingUpSubtitle', e.target.value)} onBlur={handleBlur} autoFocus placeholder="부제목을 입력하세요" /> : <p className="text-2xl font-bold text-foreground mt-3 cursor-pointer hover:bg-muted/30 rounded p-2 transition-colors min-h-[2rem]" onDoubleClick={() => handleDoubleClick('warmingUpSubtitle')}>
                  {content.warmingUpSubtitle || '더블클릭하여 텍스트 입력'}
                </p>}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* December */}
            <Card className="group relative p-8 shadow-soft hover:shadow-strong transition-all duration-500 border-0 bg-gradient-glass backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {editingField === 'decDate' ? <input className="bg-gradient-primary text-primary-foreground mb-3 px-4 py-1.5 text-sm font-semibold shadow-soft rounded-md border border-primary" value={content.decDate} onChange={e => handleChange('decDate', e.target.value)} onBlur={handleBlur} autoFocus /> : <Badge className="bg-gradient-primary text-primary-foreground mb-3 px-4 py-1.5 text-sm font-semibold shadow-soft cursor-pointer hover:opacity-80" onDoubleClick={() => handleDoubleClick('decDate')}>
                        {content.decDate}
                      </Badge>}
                    {editingField === 'decTitle' ? <input className="text-2xl font-bold text-card-foreground mt-3 w-full bg-background border border-primary rounded-lg p-2" value={content.decTitle} onChange={e => handleChange('decTitle', e.target.value)} onBlur={handleBlur} autoFocus /> : <h3 className="text-2xl font-bold text-card-foreground mt-3 group-hover:text-primary transition-colors cursor-pointer hover:bg-muted/30 rounded p-2" onDoubleClick={() => handleDoubleClick('decTitle')}>
                        {content.decTitle}
                      </h3>}
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <ul className="space-y-4 text-card-foreground">
                  <li className="flex items-start gap-3 group/item">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-primary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                    {editingField === 'decItem1' ? <input className="text-base leading-relaxed w-full bg-background border border-primary rounded-lg p-2" value={content.decItem1} onChange={e => handleChange('decItem1', e.target.value)} onBlur={handleBlur} autoFocus /> : <span className="text-base leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1" onDoubleClick={() => handleDoubleClick('decItem1')}>
                        {content.decItem1}
                      </span>}
                  </li>
                  <li className="flex items-start gap-3 group/item">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-primary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                    {editingField === 'decItem2' ? <input className="text-base leading-relaxed w-full bg-background border border-primary rounded-lg p-2" value={content.decItem2} onChange={e => handleChange('decItem2', e.target.value)} onBlur={handleBlur} autoFocus /> : <span className="text-base leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1" onDoubleClick={() => handleDoubleClick('decItem2')}>
                        {content.decItem2}
                      </span>}
                  </li>
                </ul>
              </div>
            </Card>

            {/* January */}
            <Card className="group relative p-8 shadow-soft hover:shadow-strong transition-all duration-500 border-0 bg-gradient-glass backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {editingField === 'janDate' ? <input className="bg-gradient-secondary text-secondary-foreground mb-3 px-4 py-1.5 text-sm font-semibold shadow-soft rounded-md border border-secondary" value={content.janDate} onChange={e => handleChange('janDate', e.target.value)} onBlur={handleBlur} autoFocus /> : <Badge className="bg-gradient-secondary text-secondary-foreground mb-3 px-4 py-1.5 text-sm font-semibold shadow-soft cursor-pointer hover:opacity-80" onDoubleClick={() => handleDoubleClick('janDate')}>
                        {content.janDate}
                      </Badge>}
                    {editingField === 'janTitle' ? <input className="text-2xl font-bold text-card-foreground mt-3 w-full bg-background border border-secondary rounded-lg p-2" value={content.janTitle} onChange={e => handleChange('janTitle', e.target.value)} onBlur={handleBlur} autoFocus /> : <h3 className="text-2xl font-bold text-card-foreground mt-3 group-hover:text-secondary transition-colors cursor-pointer hover:bg-muted/30 rounded p-2" onDoubleClick={() => handleDoubleClick('janTitle')}>
                        {content.janTitle}
                      </h3>}
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <ul className="space-y-4 text-card-foreground">
                  <li className="flex items-start gap-3 group/item">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                    {editingField === 'janItem1' ? <input className="text-base leading-relaxed w-full bg-background border border-secondary rounded-lg p-2" value={content.janItem1} onChange={e => handleChange('janItem1', e.target.value)} onBlur={handleBlur} autoFocus /> : <span className="text-base leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1" onDoubleClick={() => handleDoubleClick('janItem1')}>
                        {content.janItem1}
                      </span>}
                  </li>
                  <li className="flex items-start gap-3 group/item">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                    {editingField === 'janItem2' ? <input className="text-base leading-relaxed w-full bg-background border border-secondary rounded-lg p-2" value={content.janItem2} onChange={e => handleChange('janItem2', e.target.value)} onBlur={handleBlur} autoFocus /> : <span className="text-base leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1" onDoubleClick={() => handleDoubleClick('janItem2')}>
                        {content.janItem2}
                      </span>}
                  </li>
                </ul>
              </div>
            </Card>

            {/* February */}
            <Card className="group relative p-8 shadow-soft hover:shadow-strong transition-all duration-500 border-0 bg-gradient-glass backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {editingField === 'febMarDate' ? <input className="bg-gradient-secondary text-secondary-foreground mb-3 px-4 py-1.5 text-sm font-semibold shadow-soft rounded-md border border-secondary" value={content.febMarDate} onChange={e => handleChange('febMarDate', e.target.value)} onBlur={handleBlur} autoFocus /> : <Badge className="bg-gradient-secondary text-secondary-foreground mb-3 px-4 py-1.5 text-sm font-semibold shadow-soft cursor-pointer hover:opacity-80" onDoubleClick={() => handleDoubleClick('febMarDate')}>
                        {content.febMarDate}
                      </Badge>}
                    {editingField === 'febMarTitle' ? <input className="text-2xl font-bold text-card-foreground mt-3 w-full bg-background border border-secondary rounded-lg p-2" value={content.febMarTitle} onChange={e => handleChange('febMarTitle', e.target.value)} onBlur={handleBlur} autoFocus /> : <h3 className="text-2xl font-bold text-card-foreground mt-3 group-hover:text-secondary transition-colors cursor-pointer hover:bg-muted/30 rounded p-2" onDoubleClick={() => handleDoubleClick('febMarTitle')}>
                        {content.febMarTitle}
                      </h3>}
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <ul className="space-y-4 text-card-foreground">
                  <li className="flex items-start gap-3 group/item">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                    {editingField === 'febMarItem1' ? <input className="text-base leading-relaxed w-full bg-background border border-secondary rounded-lg p-2" value={content.febMarItem1} onChange={e => handleChange('febMarItem1', e.target.value)} onBlur={handleBlur} autoFocus /> : <span className="text-base leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1" onDoubleClick={() => handleDoubleClick('febMarItem1')}>
                        {content.febMarItem1}
                      </span>}
                  </li>
                  <li className="flex items-start gap-3 group/item">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                    {editingField === 'febMarItem2' ? <input className="text-base leading-relaxed w-full bg-background border border-secondary rounded-lg p-2" value={content.febMarItem2} onChange={e => handleChange('febMarItem2', e.target.value)} onBlur={handleBlur} autoFocus /> : <span className="text-base leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1" onDoubleClick={() => handleDoubleClick('febMarItem2')}>
                        {content.febMarItem2}
                      </span>}
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* Common Curriculum */}
        <section className="mb-16">
          <div className="relative bg-navy text-navy-foreground p-10 rounded-3xl mb-10 shadow-medium overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-bold text-muted text-[sidebar-accent-foreground]">공통 커리큘럼</h2>
                  <p className="text-xl opacity-95 mt-1 font-light">4월 1일 ~ 10월 30일</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-white/25 hover:bg-white/35 text-white border-0 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all">고3 상위권 구문+어법 Daily 주간지</Badge>
                <Badge variant="secondary" className="bg-white/25 hover:bg-white/35 text-white border-0 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all">
                  매주 실전모의고사
                </Badge>
                <Badge variant="secondary" className="bg-white/25 hover:bg-white/35 text-white border-0 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all">
                  매주 단어테스트
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* March - June */}
            <Card className="group relative p-8 shadow-soft hover:shadow-strong transition-all duration-500 border-0 bg-gradient-glass backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary rounded-t-xl"></div>
              <Badge className="bg-gradient-primary text-primary-foreground mb-4 px-4 py-1.5 text-sm font-semibold">4월 1일 ~ 6월 30일</Badge>
              <h3 className="text-2xl font-bold text-card-foreground mb-5 group-hover:text-primary transition-colors">
                실전 대비 1단계
              </h3>
              <ul className="space-y-3 text-card-foreground">
                <li className="flex items-start gap-3 group/item">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-primary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                  <span className="text-base leading-relaxed">매주 실전모의고사 풀이 / 6월 평가원 대비</span>
                </li>
                <li className="flex items-start gap-3 group/item">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-primary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                  <span className="text-base leading-relaxed">구문/어법 10000문장 주간지</span>
                </li>
              </ul>
            </Card>

            {/* July - August */}
            <Card className="group relative p-8 shadow-soft hover:shadow-strong transition-all duration-500 border-0 bg-gradient-glass backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-secondary rounded-t-xl"></div>
              <Badge className="bg-gradient-secondary text-secondary-foreground mb-4 px-4 py-1.5 text-sm font-semibold">
                7월 1일 ~ 8월 30일
              </Badge>
              <h3 className="text-2xl font-bold text-card-foreground mb-5 group-hover:text-secondary transition-colors">
                EBS 연계교재(수능완성) 완독
              </h3>
              <ul className="space-y-3 text-card-foreground">
                <li className="flex items-start gap-3 group/item">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                  <span className="text-base leading-relaxed">2027 수능완성 전체 풀이/ 9월 평가원 대비</span>
                </li>
                <li className="flex items-start gap-3 group/item">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                  <span className="text-base leading-relaxed">구문/어법 10000문장 주간지</span>
                </li>
              </ul>
            </Card>

            {/* August - October */}
            <Card className="group relative p-8 shadow-soft hover:shadow-strong transition-all duration-500 border-0 bg-gradient-glass backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent rounded-t-xl"></div>
              <Badge variant="destructive" className="mb-4 px-4 py-1.5 text-sm font-semibold text-slate-50">8월 30일 ~ 11월 6일</Badge>
              <h3 className="text-2xl font-bold mb-5 transition-colors text-destructive">실전 대비 2단계 & 파이널 실모</h3>
              <ul className="space-y-3 text-card-foreground">
                <li className="flex items-start gap-3 group/item">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-accent flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                  <span className="text-base leading-relaxed">매주 실전모의고사 풀이</span>
                </li>
                <li className="flex items-start gap-3 group/item">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-accent flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                  <span className="text-base leading-relaxed">마무리 Final 강의</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Daily Schedule */}
        <section>
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-soft">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground">일일 수업 구성</h2>
              <p className="text-muted-foreground text-lg mt-1">효율적인 학습 시간표</p>
            </div>
          </div>
          
          <Card className="p-10 shadow-medium bg-gradient-glass backdrop-blur-sm border-0">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="group text-center p-6 bg-muted/50 hover:bg-muted rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-soft">
                <div className="text-4xl font-bold text-muted-foreground group-hover:text-foreground transition-colors mb-3">20분</div>
                <p className="text-muted-foreground font-medium">단어시험</p>
              </div>
              <div className="group text-center p-6 bg-gradient-primary text-primary-foreground rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <div className="text-4xl font-bold mb-3">70분</div>
                <p className="opacity-95 font-medium">모의고사</p>
              </div>
              <div className="group text-center p-6 bg-gradient-accent text-accent-foreground rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <div className="text-4xl font-bold mb-3">50분</div>
                <p className="opacity-95 font-medium">주요문제 해설</p>
              </div>
              <div className="group text-center p-6 bg-muted/50 hover:bg-muted rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-soft">
                <div className="text-4xl font-bold text-secondary group-hover:text-primary transition-colors mb-3">100분</div>
                <p className="text-muted-foreground font-medium">부교재 수업</p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border py-12 mt-20">
        
      </footer>
    </div>;
};
export default Index;