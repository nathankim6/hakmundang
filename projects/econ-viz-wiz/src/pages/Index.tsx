import Hero from "@/components/Hero";
import DefinitionCard from "@/components/DefinitionCard";
import TipBox from "@/components/TipBox";
import FormulaCard from "@/components/FormulaCard";
import ExampleTable from "@/components/ExampleTable";
import StepList from "@/components/StepList";
import SectionTitle from "@/components/SectionTitle";
import { Card } from "@/components/ui/card";
import { Target, Calculator, Zap, BookMarked, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* 핵심 정의 */}
        <section className="mb-16">
          <SectionTitle icon={Target}>핵심 정의 (초간단)</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
            <DefinitionCard
              title="✔ 절대우위"
              description="생산량 많거나, 시간이 적게 걸리는 쪽"
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
            />
            <DefinitionCard
              title="✔ 비교우위"
              description="기회비용이 더 낮은 쪽"
              icon={<Calculator className="w-5 h-5 text-primary" />}
            />
          </div>
        </section>

        {/* 절대우위 공식 */}
        <section className="mb-16">
          <SectionTitle icon={Zap}>절대우위 공식 (숫자만 보면 끝)</SectionTitle>
          <TipBox>
            <div className="space-y-2">
              <p><strong>✔ 생산량 문제</strong> → 숫자 <strong className="text-primary">큰 쪽</strong></p>
              <p><strong>✔ 시간 문제</strong> → 숫자 <strong className="text-primary">작은 쪽</strong></p>
            </div>
          </TipBox>
        </section>

        {/* 비교우위 공식 */}
        <section className="mb-16">
          <SectionTitle icon={Calculator}>비교우위 공식 (기회비용 계산 필요)</SectionTitle>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">생산량 기준</h3>
              <FormulaCard
                title="기회비용 계산"
                formula="기회비용 = 포기하는 것 / 선택한 것"
                description="생산량으로 주어진 경우 이 공식을 사용합니다"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">시간 기준</h3>
              <FormulaCard
                title="기회비용 계산"
                formula="기회비용 = 선택한 것 / 포기하는 것"
                description="시간으로 주어진 경우 이 공식을 사용합니다"
              />
            </div>
          </div>
        </section>

        {/* 10초 컷 문제풀이 루틴 */}
        <section className="mb-16">
          <SectionTitle icon={Zap}>10초 컷 문제풀이 루틴</SectionTitle>
          <StepList
            steps={[
              "절대우위 → 숫자 큰/작은 쪽 바로 체크",
              "비교우위 → 각 항목 기회비용 계산",
              "기회비용이 낮은 쪽이 비교우위",
              "표로 정리 → 실수 없이 10초 컷"
            ]}
          />
        </section>

        {/* 연습 예시 */}
        <section className="mb-16">
          <SectionTitle icon={BookMarked}>연습 예시</SectionTitle>
          
          <Card className="p-6 bg-accent-light border-l-4 border-l-accent mb-8 animate-fade-in">
            <h3 className="font-bold text-accent-foreground mb-4 text-lg">예시 국가 A/B 생산량</h3>
            <div className="space-y-2 text-foreground/90">
              <p><strong>A국:</strong> 쌀 20, 옥수수 10</p>
              <p><strong>B국:</strong> 쌀 12, 옥수수 6</p>
            </div>
          </Card>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">①</span>
                절대우위
              </h3>
              <TipBox>
                <div className="space-y-2">
                  <p><strong>✔ 쌀:</strong> A국 (20 &gt; 12)</p>
                  <p><strong>✔ 옥수수:</strong> A국 (10 &gt; 6)</p>
                </div>
              </TipBox>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">②</span>
                비교우위
              </h3>
              <ExampleTable
                title="기회비용 비교"
                headers={["항목", "A국 기회비용", "B국 기회비용"]}
                rows={[
                  ["쌀 1개", "10 / 20 = 0.5", "6 / 12 = 0.5"],
                  ["옥수수 1개", "20 / 10 = 2", "12 / 6 = 2"]
                ]}
              />
              <div className="mt-6">
                <TipBox>
                  <p className="font-semibold">➜ 기회비용이 동일 → 비교우위 없음</p>
                </TipBox>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted/30 py-12 text-center border-t border-border">
        <p className="text-muted-foreground">
          © 2025 절대우위·비교우위 요약 페이지
        </p>
      </footer>
    </div>
  );
};

export default Index;
