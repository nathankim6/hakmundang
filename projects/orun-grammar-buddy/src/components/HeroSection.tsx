import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
const HeroSection = () => {
  const features = ["학년별 맞춤 문제은행", "실시간 성적 분석", "개인별 학습 리포트"];
  return <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-soft border border-border">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">영어 문법 학습의 새로운 기준</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">​옳은영어 </span>
              <br />
              <span className="text-gradient-hero">문법시험 플랫폼</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              ORUN GRAMMAR는 학년별, 문법별 문제은행을 기반으로 정기고사를 실시하고, 
              상세한 개별 리포트와 누적 리포트를 제공합니다.
            </p>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl">
                무료로 시작하기
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl">
                데모 보기
              </Button>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-slide-in-right" style={{
          animationDelay: "200ms"
        }}>
            <div className="relative bg-card rounded-2xl shadow-elevated p-6 border border-border">
              {/* Mock Dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">학습 현황</h3>
                  <span className="text-sm text-muted-foreground">이번 주</span>
                </div>
                
                {/* Progress Bars */}
                <div className="space-y-3">
                  {[{
                  label: "문법 완료율",
                  value: 78,
                  color: "bg-gradient-hero"
                }, {
                  label: "정답률",
                  value: 92,
                  color: "bg-gradient-gold"
                }, {
                  label: "학습 진도",
                  value: 65,
                  color: "bg-primary"
                }].map((item, index) => <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{
                      width: `${item.value}%`
                    }} />
                      </div>
                    </div>)}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[{
                  label: "완료 문제",
                  value: "248"
                }, {
                  label: "평균 점수",
                  value: "87점"
                }, {
                  label: "학습 시간",
                  value: "12h"
                }].map((stat, index) => <div key={index} className="text-center p-3 bg-accent rounded-xl">
                      <div className="text-xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>)}
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-card p-4 border border-border animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">이번 달 최고 점수</div>
                  <div className="text-xs text-muted-foreground">98점 달성!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;