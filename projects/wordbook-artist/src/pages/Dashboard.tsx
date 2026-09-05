import { useNavigate } from 'react-router-dom';
import { BookOpen, School, Edit, FileText, PlusCircle, Wand2, Layers, ListChecks, ClipboardList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  onClick: () => void;
}

const MenuCard = ({ title, description, icon, accentColor, onClick }: MenuCardProps) => (
  <button
    onClick={onClick}
    className="group relative text-left rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
    style={{
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}40`;
      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${accentColor}12`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))';
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    }}
  >
    {/* Accent line */}
    <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{
      background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
    }} />
    
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{
      background: `${accentColor}0a`,
    }}>
      {icon}
    </div>
    <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
    <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
    <div className="mt-3 text-[10px] font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accentColor }}>
      열기 →
    </div>
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const SUNGNAM_RANGES = ['1-13', '14-25', '26-38', '39-50'];
  const ROUND_ITEMS = [
    { type: 'round1', label: '1회독', desc: '뜻쓰기 · 뜻 개수 빈칸', color: '#10b981' },
    { type: 'round2', label: '2회독', desc: '예문 빈칸 + 첫 글자', color: '#14b8a6' },
    { type: 'round3', label: '3회독', desc: '영영풀이 → 단어쓰기', color: '#a855f7' },
    { type: 'round4', label: '4회독', desc: '다의어 AI 예문', color: '#f97316' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%)',
    }}>
      {/* Header */}
      <header className="py-5 px-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(32 75% 45%))',
            }}>
              <span className="text-sm font-bold text-primary-foreground" style={{ fontFamily: '"Orbitron", serif' }}>V</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight" style={{ fontFamily: '"Orbitron", serif', letterSpacing: '0.05em' }}>
                ORUN VOCA
              </h1>
              <p className="text-[10px] text-muted-foreground">Workbook Studio</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main with Tabs */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="orun" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-10 h-10 rounded-xl">
            <TabsTrigger value="orun" className="text-xs font-semibold gap-1.5 rounded-lg">
              <BookOpen className="w-3.5 h-3.5" />
              ORUN VOCA
            </TabsTrigger>
            <TabsTrigger value="sungnam" className="text-xs font-semibold gap-1.5 rounded-lg">
              <School className="w-3.5 h-3.5" />
              워드마스터 수능2000
            </TabsTrigger>
          </TabsList>

          {/* ========== ORUN VOCA Tab ========== */}
          <TabsContent value="orun" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: '"Orbitron", serif' }}>ORUN VOCA</h2>
              <p className="text-xs text-muted-foreground mt-1">VOCA 0~8 및 Ultimate · 단어장 편집 · 시험지 생성</p>
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
              <MenuCard title="레벨 테스트 시험지" description="VOCA 0~8 각 20단어 랜덤 추출 · 총 180문항 + 정답지"
                icon={<ListChecks className="w-5 h-5" style={{ color: '#8b5cf6' }} />}
                accentColor="#8b5cf6" onClick={() => navigate('/level-test')} />
              <div className="rounded-2xl p-5 border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                    <Edit className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">단어장 생성/편집</h3>
                    <p className="text-[11px] text-muted-foreground">엑셀 업로드 → AI 발음기호·예문 생성 → B5 단어장</p>
                  </div>
                  <button
                    onClick={() => navigate('/generator')}
                    className="ml-auto text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-lg border transition-colors hover:bg-muted/60"
                    style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--primary))' }}
                  >
                    열기 →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => navigate('/append-words')}
                    className="text-left rounded-xl px-3 py-2.5 border border-border transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <PlusCircle className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                      <span className="text-[11px] font-semibold text-foreground">단어 추가/수정</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">기존 단어장 보완</div>
                  </button>
                  <button
                    onClick={() => navigate('/generate-definitions')}
                    className="text-left rounded-xl px-3 py-2.5 border border-border transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Wand2 className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
                      <span className="text-[11px] font-semibold text-foreground">정의 생성</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">영영 정의·어원</div>
                  </button>
                  <button
                    onClick={() => navigate('/organize-words')}
                    className="text-left rounded-xl px-3 py-2.5 border border-border transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Layers className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />
                      <span className="text-[11px] font-semibold text-foreground">단어 정리</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">DAY 재구성</div>
                  </button>
                  <button
                    onClick={() => navigate('/pos-tagger')}
                    className="text-left rounded-xl px-3 py-2.5 border border-border transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Wand2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                      <span className="text-[11px] font-semibold text-foreground">품사 기호 적용</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">[명]·[형]·[부]·[숙어]</div>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========== 성남고 Tab ========== */}
          <TabsContent value="sungnam" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">워드마스터 수능2000</h2>
              <p className="text-xs text-muted-foreground mt-1">표제어+파생어 · DAY별 40단어</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <MenuCard title="단어장 보기/편집" description="워드마스터 수능2000 전용 단어장 열람 및 편집"
                icon={<FileText className="w-5 h-5" style={{ color: '#3b82f6' }} />}
                accentColor="#3b82f6" onClick={() => navigate('/textbook/sungnam')} />
              <MenuCard title="동형모의고사" description="DAY별 범위 → 10문제 선택형 모의고사 · 인쇄"
                icon={<ClipboardList className="w-5 h-5" style={{ color: '#22c55e' }} />}
                accentColor="#22c55e" onClick={() => navigate('/mock-exam')} />
              <MenuCard title="유형별 모의고사" description="문제 유형을 선택하여 원하는 수만큼 생성"
                icon={<ListChecks className="w-5 h-5" style={{ color: '#f59e0b' }} />}
                accentColor="#f59e0b" onClick={() => navigate('/sungnam-type-exam')} />
            </div>

            {/* 회독 시험지 - 범위별 정리 */}
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground">회독 시험지</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground">DAY 범위별</span>
              </div>
              {SUNGNAM_RANGES.map((range) => (
                <div key={range} className="rounded-2xl p-4" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                  <div className="text-[11px] font-bold text-foreground mb-3">DAY {range}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ROUND_ITEMS.map((r) => (
                      <button
                        key={r.type}
                        onClick={() => navigate(`/sungnam-review?type=${r.type}&days=${range}`)}
                        className="text-left rounded-xl px-3 py-2.5 border border-border transition-colors hover:bg-muted/60"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                          <span className="text-[11px] font-semibold text-foreground">{r.label}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </main>

      <footer className="py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/50">
          <div className="w-1 h-1 rotate-45 bg-muted-foreground/20" />
          <span style={{ fontFamily: '"Orbitron", serif', letterSpacing: '0.1em' }}>ORUN ENGLISH</span>
          <div className="w-1 h-1 rotate-45 bg-muted-foreground/20" />
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
