import React from 'react';
import { getSchoolLogo } from '@/lib/schoolLogos';
import { School, GraduationCap, ClipboardList, UserRound, BookOpenText } from 'lucide-react';

interface ReportInfoCardsProps {
  reportData: {
    school: string;
    grade: string;
    examScope: string;
    teacher: string;
    examInfo?: string;
  };
  themeColors: any;
}

const MetricCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  span?: 'single' | 'double' | 'triple' | 'wide';
}> = ({ label, icon, children, span = 'single' }) => (
  <div
    className={`bg-[hsl(var(--card))] rounded-3xl px-5 py-4 md:px-6 md:py-5 border border-[hsl(var(--border))] shadow-[0_2px_12px_-6px_hsl(var(--ink)/0.06)] hover:shadow-[0_10px_28px_-10px_hsl(var(--ink)/0.12)] hover:-translate-y-0.5 transition-all duration-300 min-h-[120px] flex flex-col justify-between ${
      span === 'double' ? 'col-span-2 md:col-span-2' : span === 'triple' ? 'col-span-2 md:col-span-6' : span === 'wide' ? 'col-span-2 md:col-span-4' : 'col-span-1 md:col-span-2'
    }`}
  >
    {/* 라벨 행 — 아이콘 칩 + 라벨, 모든 카드 동일 구조 */}
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--gold-soft)/0.35)] text-[hsl(var(--gold-deep))] shrink-0">
        {icon}
      </span>
      <p className="text-[10px] md:text-[11px] font-semibold text-[hsl(var(--muted-foreground))] tracking-[0.12em] uppercase leading-none">
        {label}
      </p>
    </div>
    {/* 값 영역 — 하단 기준 정렬로 카드 간 기준이 통일됨 */}
    <div className="flex items-end mt-3">
      {children}
    </div>
  </div>
);

const ReportInfoCards: React.FC<ReportInfoCardsProps> = ({ reportData }) => {

  // 내용 길이에 따라 글자 크기를 조정해 잘림/넘침 방지
  const valueClass = (text: string, shortClass: string) => {
    const len = (text || '').length;
    if (len <= 2) return shortClass;
    if (len <= 5) return 'text-xl md:text-2xl';
    if (len <= 12) return 'text-base md:text-lg';
    return 'text-sm md:text-base';
  };

  const valueText = 'font-display text-[hsl(var(--ink))] font-semibold tracking-[-0.02em] break-keep leading-tight';

  return (
    <section className="report-section">

      {/* Main grid — branding + metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Branding card */}
        <div
          className="md:col-span-2 relative overflow-hidden rounded-3xl p-4 md:p-5 flex flex-col justify-center items-center min-h-[160px] bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
          style={{
            boxShadow: '0 12px 30px -12px hsl(var(--ink) / 0.08)',
          }}
        >
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <p
              className="inline-flex items-center justify-center text-[10px] md:text-[11px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-full border border-[hsl(var(--gold)/0.25)] bg-[hsl(var(--gold-soft)/0.15)] text-[hsl(var(--gold-deep))] mb-2"
            >
              ORUN ANALYSIS
            </p>
            {getSchoolLogo(reportData.school) && (
              <div className="mt-2 flex justify-center">
                <img
                  src={getSchoolLogo(reportData.school)!}
                  alt={`${reportData.school} 로고`}
                  className="h-24 md:h-44 w-auto max-w-[320px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                />
              </div>
            )}
          </div>

          {/* Decorative glow */}
          <div
            className="absolute -right-6 -bottom-6 w-40 h-40 rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--gold-soft)) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        {/* Metric cards container — 카드 간 간격/높이/타이포 통일 */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-6 gap-4">
          {/* School */}
          <MetricCard label="학교" icon={<School size={13} strokeWidth={2.2} />} span="double">
            <p className={`${valueText} ${valueClass(reportData.school, 'text-lg md:text-xl')}`}>
              {reportData.school}
            </p>
          </MetricCard>

          {/* Grade */}
          <MetricCard label="학년" icon={<GraduationCap size={13} strokeWidth={2.2} />}>
            <span className={`${valueText} ${valueClass(reportData.grade, 'text-xl md:text-2xl')}`}>
              {reportData.grade}
            </span>
          </MetricCard>

          {/* Exam info */}
          <MetricCard label="시험 정보" icon={<ClipboardList size={13} strokeWidth={2.2} />}>
            <p className={`${valueText} ${valueClass(reportData.examInfo || '미지정', 'text-base md:text-lg')}`}>
              {reportData.examInfo || '미지정'}
            </p>
          </MetricCard>

          {/* Teacher */}
          <MetricCard label="담당 강사" icon={<UserRound size={13} strokeWidth={2.2} />}>
            <span className={`${valueText} ${valueClass(reportData.teacher, 'text-2xl md:text-3xl')}`}>
              {reportData.teacher}
            </span>
          </MetricCard>

          {/* Exam scope */}
          <MetricCard label="시험 범위" icon={<BookOpenText size={13} strokeWidth={2.2} />} span="wide">
            <span className={`${valueText} ${valueClass(reportData.examScope, 'text-xl md:text-2xl')}`}>
              {reportData.examScope}
            </span>
          </MetricCard>
        </div>
      </div>
    </section>
  );
};

export default ReportInfoCards;
