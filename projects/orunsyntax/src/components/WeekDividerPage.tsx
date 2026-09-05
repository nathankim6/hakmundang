import orunMainLogo from '@/assets/orun-academy-main-logo.jpg';

interface WeekDividerPageProps {
  weekNumber: number;
  totalSentences: number;
  categories: string[];
  startPage: number;
  endPage: number;
  gradeLabel?: string;
  totalVocabs?: number;
  totalRC?: number;
}

export function WeekDividerPage({ weekNumber, totalSentences, categories, startPage, endPage, gradeLabel, totalVocabs, totalRC }: WeekDividerPageProps) {
  const displayCats = categories.slice(0, 8);

  return (
    <div className="wd8 a4-page animate-fade-in">
      <div className="wd8-content">
        {/* Subtitle above top rule */}
        <span className="text-[9px] tracking-[0.15em] text-muted-foreground/70 font-medium" style={{ marginBottom: 4 }}>옳은영어 {gradeLabel || '고등'} 주간지</span>

        {/* Top rule */}
        <div className="wd8-top-rule" />

        {/* Top branding with logo */}
        <div className="wd8-top">
          <div className="wd8-top-brand">
            <img src={orunMainLogo} alt="ORUN" className="wd8-top-logo" />
            <h1 className="wd8-top-brand-title font-cinzel">
              <span className="header-title-orun text-black">ORUN</span>
              <span className="header-title-syntax">WEEKLY</span>
            </h1>
          </div>
        </div>

        {/* Center: Week display */}
        <div className="wd8-center">
          {gradeLabel && (
            <div style={{
              display: 'inline-block',
              padding: '3px 18px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'hsl(var(--brand-navy))',
              border: '1px solid hsl(var(--brand-gold) / 0.7)',
              borderRadius: '999px',
              background: 'hsl(var(--brand-gold) / 0.16)',
              marginBottom: '10px',
              fontFamily: "'Noto Sans KR', sans-serif",

            }}>{gradeLabel}</div>
          )}
          <div className="wd8-week-label">WEEK</div>
          <div className="wd8-number">{String(weekNumber).padStart(2, '0')}</div>
          <div className="wd8-ornament">
            <span className="wd8-ornament-wing">✦</span>
            <span className="wd8-ornament-line" />
            <span className="wd8-ornament-dot" />
            <span className="wd8-ornament-line" />
            <span className="wd8-ornament-wing">✦</span>
          </div>
        </div>

        {/* Study Guide */}
        <div className="wd8-guide">
          <div className="wd8-guide-header">
            <span className="wd8-guide-header-line" />
            <h3 className="wd8-guide-title font-cinzel">STUDY GUIDE</h3>
            <span className="wd8-guide-header-line" />
          </div>
          <div className="wd8-guide-subtitle">학습방법</div>
          <ol className="wd8-guide-list">
            <li><span className="wd8-guide-num">01</span><span>본 주간지는 고1·2 모의고사에서 선별한 고난도 핵심 문장으로 구성되어 있습니다.</span></li>
            <li><span className="wd8-guide-num">02</span><span>각 문장을 의미 단위(Semantic Unit)에 따라 슬래시(/)로 구분하며 정확한 해석을 연습하세요.</span></li>
            <li><span className="wd8-guide-num">03</span><span>각 문장은 어법 오류를 하나씩 포함하고 있습니다. 단순히 정답을 찾는 것이 아니라, <em>왜 틀렸는지</em> 문법적으로 설명할 수 있어야 합니다.</span></li>
            <li><span className="wd8-guide-num">04</span><span>ORUN GUIDE(해설지)을 참고하여 문장의 구조를 분석하세요. 주어(S)와 동사(V)는 형광펜으로 표시하고, 구조를 먼저 파악한 뒤 어법 오류를 분석하세요.</span></li>
            <li><span className="wd8-guide-num">05</span><span>이해가 되지 않는 문장은 반드시 선생님께 질문하세요.<br /><span className="wd8-guide-emphasis">— 질문은 실력을 끌어올리는 가장 빠른 방법입니다.</span></span></li>
            <li><span className="wd8-guide-num">06</span><span>주차별 과제를 모두 완료한 학생은 해당 주차의 핵심 어휘를 암기하세요.</span></li>
          </ol>
        </div>

        {/* Stats bar */}
        <div className="wd8-stats">
          <div className="wd8-stat">
            <span className="wd8-stat-value">{totalSentences}</span>
            <span className="wd8-stat-label">SENTENCES</span>
          </div>
          <div className="wd8-stat-sep" />
          <div className="wd8-stat">
            <span className="wd8-stat-value">{categories.length}</span>
            <span className="wd8-stat-label">GRAMMAR TOPICS</span>
          </div>
          {totalVocabs != null && totalVocabs > 0 && (
            <>
              <div className="wd8-stat-sep" />
              <div className="wd8-stat">
                <span className="wd8-stat-value">{totalVocabs}</span>
                <span className="wd8-stat-label">VOCABS</span>
              </div>
            </>
          )}
          {totalRC != null && totalRC > 0 && (
            <>
              <div className="wd8-stat-sep" />
              <div className="wd8-stat">
                <span className="wd8-stat-value">{totalRC}</span>
                <span className="wd8-stat-label">RC PRACTICE</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom */}
        <div className="wd8-bottom">
          <img src={orunMainLogo} alt="ORUN" className="wd8-logo" />
          <span className="wd8-bottom-text">ORUN ENGLISH</span>
        </div>

        <div className="wd8-bottom-rule" />
      </div>
    </div>
  );
}
