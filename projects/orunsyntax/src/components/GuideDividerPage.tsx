import orunMainLogo from '@/assets/orun-academy-main-logo.jpg';
import orunLighthouseLogo from '@/assets/orun-lighthouse-logo.jpg';

interface GuideDividerPageProps {
  weekNumber: number;
  totalGuideItems: number;
  totalGuidePages: number;
  gradeLabel?: string;
  vocabQuizAnswers?: { word: string; meaning: string }[];
}

export function GuideDividerPage({ weekNumber, totalGuideItems, totalGuidePages, gradeLabel, vocabQuizAnswers }: GuideDividerPageProps) {
  return (
    <div className="gd8 a4-page animate-fade-in">
      <div className="gd8-content">
        {/* Top rule — double line */}
        <div className="gd8-top-rule" />

        {/* Top branding */}
        <div className="gd8-top">
          <div className="gd8-top-brand">
            <img src={orunLighthouseLogo} alt="ORUN" className="gd8-top-logo" />
            <h1 className="gd8-top-brand-title font-cinzel">
              <span className="gd8-title-orun">ORUN</span>
              <span className="gd8-title-guide">GUIDE</span>
            </h1>
          </div>
          <span className="gd8-top-subtitle">
            옳은영어 {gradeLabel || '고등'} 주간지 해설
          </span>
        </div>

        {/* Center: Week display */}
        <div className="gd8-center">
          <div className="gd8-week-label">WEEK</div>
          <div className="gd8-number">{String(weekNumber).padStart(2, '0')}</div>
          <div className="gd8-ornament">
            <span className="gd8-ornament-wing">✦</span>
            <span className="gd8-ornament-line" />
            <span className="gd8-ornament-diamond" />
            <span className="gd8-ornament-line" />
            <span className="gd8-ornament-wing">✦</span>
          </div>
        </div>

        {/* Guide description */}
        <div className="gd8-guide">
          <div className="gd8-guide-header">
            <span className="gd8-guide-header-line" />
            <h3 className="gd8-guide-title font-cinzel">STUDY GUIDE</h3>
            <span className="gd8-guide-header-line" />
          </div>
          <div className="gd8-guide-subtitle">학습방법</div>
          <ol className="gd8-guide-list">
            <li><span className="gd8-guide-num">01</span><span>각 문장의 <strong>오류 수정</strong>과 <strong>오답 분석</strong>을 확인하여 왜 틀렸는지 이해하세요.</span></li>
            <li><span className="gd8-guide-num">02</span><span>구문 분석을 통해 문장의 <strong>주어(S)·동사(V) 구조</strong>를 파악하고, 의미 단위별로 해석하는 연습을 하세요.</span></li>
            <li><span className="gd8-guide-num">03</span><span>해설을 읽은 뒤 다시 원문 문장으로 돌아가 <em>스스로 분석</em>할 수 있는지 확인하세요.</span></li>
            <li><span className="gd8-guide-num">04</span><span>이해가 되지 않는 부분은 반드시 선생님께 질문하세요.<br /><span className="gd8-guide-emphasis">— 해설을 읽는 것과 이해하는 것은 다릅니다.</span></span></li>
          </ol>
        </div>

        {/* Vocab mini test answer key */}
        {vocabQuizAnswers && vocabQuizAnswers.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span className="gd8-guide-header-line" />
              <h3 className="gd8-guide-title font-cinzel" style={{ whiteSpace: 'nowrap' }}>
                VOCAB MINI TEST · 단어시험 정답
              </h3>
              <span className="gd8-guide-header-line" />
            </div>
            <div style={{
              fontSize: '7.5px',
              lineHeight: 1.7,
              color: 'hsl(222 14% 40%)',
              fontFamily: "'Noto Sans KR', sans-serif",
              wordBreak: 'keep-all',
              textAlign: 'left',
              columnCount: 3,
              columnGap: '10px',
            }}>
              {vocabQuizAnswers.map((item, idx) => (
                <div key={idx}>
                  <strong style={{ fontWeight: 600 }}>{idx + 1}.</strong> {item.word} — {item.meaning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="gd8-stats">
          <div className="gd8-stat">
            <span className="gd8-stat-value">{totalGuideItems}</span>
            <span className="gd8-stat-label">ANALYSES</span>
          </div>
          <div className="gd8-stat-sep" />
          <div className="gd8-stat">
            <span className="gd8-stat-value">{totalGuidePages}</span>
            <span className="gd8-stat-label">PAGES</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="gd8-bottom">
          <img src={orunMainLogo} alt="ORUN" className="gd8-logo" />
          <span className="gd8-bottom-text">ORUN ENGLISH</span>
        </div>

        <div className="gd8-bottom-rule" />
      </div>
    </div>
  );
}
