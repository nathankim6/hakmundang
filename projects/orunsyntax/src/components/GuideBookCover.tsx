import orunMainLogo from '@/assets/orun-academy-main-logo.jpg';
import lighthouseImg from '@/assets/lighthouse-cover.png';

interface GuideBookCoverProps {
  totalQuestions: number;
}

export function GuideBookFrontCover({ totalQuestions }: GuideBookCoverProps) {
  return (
    <div className="cv7-cover a4-page animate-fade-in">
      <img src={lighthouseImg} alt="" className="cv7-cover-bg" />
      <div className="cv7-cover-overlay cv7-cover-overlay--top" />

      <div className="cv7-cover-content cv7-cover-content--top">
        <div className="cv7-cover-logo" style={{ marginTop: 0, marginBottom: '10px' }}>
          <img src={orunMainLogo} alt="ORUN Academy" className="cv7-cover-logo-img" />
        </div>

        <h1 className="cv7-cover-title-cinzel">
          <span className="cv7-cover-title-cinzel-main">ORUN</span>
          <span className="cv7-cover-title-cinzel-sub">WEEKLY</span>
        </h1>

        <div className="cv7-cover-divider">
          <div className="cv7-cover-divider-line" />
          <span className="cv7-cover-divider-dot">◆</span>
          <div className="cv7-cover-divider-line" />
        </div>

        <div className="cv7-cover-subtitle" style={{ marginTop: '6px' }}>
          <span className="cv7-cover-subtitle-kr">ORUN GUIDE</span>
          <span className="cv7-cover-subtitle-dot" />
          <span className="cv7-cover-subtitle-en">GUIDE BOOK</span>
        </div>

        <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'hsla(0, 0%, 100%, 0.6)', marginTop: '8px' }}>
          {totalQuestions.toLocaleString()} Sentences Analyzed
        </p>

        <div style={{ marginTop: '12px' }}>
          <span className="cv7-cover-bottom-url">www.orunenglish.com</span>
        </div>
      </div>
    </div>
  );
}

export function GuideBookBackCover({ totalQuestions }: GuideBookCoverProps) {
  return (
    <div className="cv7-cover a4-page animate-fade-in">
      <img src={lighthouseImg} alt="" className="cv7-cover-bg" />
      <div className="cv7-cover-overlay cv7-cover-overlay--bottom" />

      <div className="cv7-cover-content cv7-cover-content--bottom">
        <div className="cv7-cover-logo" style={{ marginTop: 0, marginBottom: '10px' }}>
          <img src={orunMainLogo} alt="ORUN Academy" className="cv7-cover-logo-img" />
        </div>

        <h1 className="cv7-cover-title-cinzel">
          <span className="cv7-cover-title-cinzel-main" style={{ fontSize: '2.2rem' }}>ORUN WEEKLY</span>
        </h1>

        <div className="cv7-cover-divider">
          <div className="cv7-cover-divider-line" />
          <span className="cv7-cover-divider-dot">◆</span>
          <div className="cv7-cover-divider-line" />
        </div>

        <p style={{ fontSize: '11px', color: 'hsla(0, 0%, 100%, 0.8)', letterSpacing: '0.12em', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", marginTop: '6px' }}>
          "Every sentence holds a structure waiting to be understood"
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'hsla(0, 0%, 100%, 0.3)' }} />
          <span style={{ fontSize: '10px', color: 'hsla(0, 0%, 100%, 0.6)', letterSpacing: '0.1em' }}>
            {totalQuestions.toLocaleString()} 문장 구문분석 수록
          </span>
          <div style={{ flex: 1, height: '1px', background: 'hsla(0, 0%, 100%, 0.3)' }} />
        </div>

        <div style={{ marginTop: '6px' }}>
          <span className="cv7-cover-top-brand">ORUN ACADEMY</span>
        </div>
        <div style={{ marginTop: '6px' }}>
          <span className="cv7-cover-bottom-url">www.orunenglish.com</span>
        </div>
      </div>
    </div>
  );
}
