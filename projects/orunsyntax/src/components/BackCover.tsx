import orunMainLogo from '@/assets/orun-academy-main-logo.jpg';
import lighthouseImg from '@/assets/lighthouse-cover.png';
import { VolumeInfo } from '@/types/volume';

interface BackCoverProps {
  totalQuestions: number;
  volume?: VolumeInfo;
}

export function BackCover({ totalQuestions, volume }: BackCoverProps) {
  return (
    <div className="cv7-cover a4-page animate-fade-in">
      <img src={lighthouseImg} alt="" className="cv7-cover-bg" />
      <div className="cv7-cover-overlay cv7-cover-overlay--back" />

      {/* Thin elegant border frame */}
      <div className="cv7-cover-frame" />

      <div className="cv7-cover-content">
        {/* Spacer */}
        <div className="cv7-cover-spacer" />

        {/* Logo */}
        <div className="cv7-cover-logo-wrap">
          <img src={orunMainLogo} alt="ORUN Academy" className="cv7-cover-logo-img" />
        </div>

        {/* Title */}
        <h1 className="cv7-cover-main-title" style={{ fontSize: '2rem', letterSpacing: '0.3em' }}>
          <span style={{ color: '#fff' }}>ORUN</span>{' '}
          <span style={{ background: 'linear-gradient(135deg, hsl(38 70% 65%), hsl(45 80% 55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WEEKLY</span>
        </h1>

        {/* Ornamental divider */}
        <div className="cv7-cover-ornament">
          <div className="cv7-cover-ornament-line" />
          <span className="cv7-cover-ornament-diamond">◆</span>
          <div className="cv7-cover-ornament-line" />
        </div>

        {/* Quote */}
        <p className="cv7-cover-quote">
          "Master syntax, unlock your potential"
        </p>

        <div className="cv7-cover-spacer" style={{ flex: 0.3 }} />

        {/* Footer */}
        <div className="cv7-cover-footer">
          <span className="cv7-cover-footer-brand">ORUN ACADEMY</span>
          <div className="cv7-cover-footer-sep" />
          <span className="cv7-cover-footer-url">www.orunenglish.com</span>
        </div>
      </div>
    </div>
  );
}
