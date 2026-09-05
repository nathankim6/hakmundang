import orunMainLogo from '@/assets/orun-academy-main-logo.jpg';
import lighthouseImg from '@/assets/lighthouse-cover.png';

interface CoverPageG12Props {
  totalQuestions: number;
  totalPages: number;
}

export function CoverPageG12({ totalQuestions, totalPages }: CoverPageG12Props) {
  return (
    <div className="cv7-cover a4-page animate-fade-in">
      <img src={lighthouseImg} alt="" className="cv7-cover-bg" />
      <div className="cv7-cover-overlay" />

      <div className="cv7-cover-content">
        <div className="cv7-cover-top">
          <span className="cv7-cover-top-brand">ORUN WEEKLY</span>
        </div>

        <div className="cv7-cover-spacer" />

        <div className="cv7-cover-title-section">
          <h1 className="cv7-cover-title">
            <span className="cv7-cover-title-main">ORUN</span>
            <span className="cv7-cover-title-accent">WEEKLY</span>
          </h1>
        </div>

        {/* G12 badge */}
        <div className="cv7-cover-badge">
          <span>옳은영어 고2</span>
        </div>

        <div className="cv7-cover-subtitle">
          <span className="cv7-cover-subtitle-kr">열매로 맺다</span>
          <span className="cv7-cover-subtitle-dot" />
          <span className="cv7-cover-subtitle-en">20-WEEK GRAMMAR TRAINING</span>
        </div>

        <div className="cv7-cover-spacer" />

        <div className="cv7-cover-logo">
          <img src={orunMainLogo} alt="ORUN Academy" className="cv7-cover-logo-img" />
        </div>

        <div className="cv7-cover-bottom">
          <span className="cv7-cover-bottom-author">NATHAN T</span>
          <div className="cv7-cover-bottom-sep" />
          <span className="cv7-cover-bottom-url">www.orunenglish.com</span>
        </div>
      </div>
    </div>
  );
}
