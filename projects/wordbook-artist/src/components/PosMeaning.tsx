import React from 'react';

/** 품사 기호별 색상 팔레트 (ORUN VOCA 프리미엄 에디토리얼 스타일) */
const POS_PALETTE: Record<string, { bg: string; fg: string; border: string; accent: string }> = {
  '명':        { bg: '#F0F4FF', fg: '#1E3A8A', border: '#C7D2FE', accent: '#3B82F6' },
  '동':        { bg: '#ECFDF5', fg: '#064E3B', border: '#A7F3D0', accent: '#10B981' },
  '동사':      { bg: '#ECFDF5', fg: '#064E3B', border: '#A7F3D0', accent: '#10B981' },
  '형':        { bg: '#FFF7ED', fg: '#9A3412', border: '#FED7AA', accent: '#F97316' },
  '부':        { bg: '#FEF2F2', fg: '#991B1B', border: '#FECACA', accent: '#EF4444' },
  '대':        { bg: '#F5F3FF', fg: '#5B21B6', border: '#DDD6FE', accent: '#8B5CF6' },
  '전':        { bg: '#F0F9FF', fg: '#075985', border: '#BAE6FD', accent: '#0EA5E9' },
  '접':        { bg: '#F0FDFA', fg: '#115E59', border: '#99F6E4', accent: '#14B8A6' },
  '감탄':      { bg: '#FDF2F8', fg: '#9D174D', border: '#FBCFE8', accent: '#EC4899' },
  '한정':      { bg: '#F8FAFC', fg: '#334155', border: '#E2E8F0', accent: '#64748B' },
  '조동':      { bg: '#EFF6FF', fg: '#1E40AF', border: '#BFDBFE', accent: '#3B82F6' },
  'COLLOC.':   { bg: '#FEFCE8', fg: '#854D0E', border: '#FEF08A', accent: '#EAB308' },
  '숙어':      { bg: '#FAF5FF', fg: '#6B21A8', border: '#E9D5FF', accent: '#A855F7' },
  '접두':      { bg: '#F1F5F9', fg: '#475569', border: '#CBD5E1', accent: '#94A3B8' },
  '접미':      { bg: '#F1F5F9', fg: '#475569', border: '#CBD5E1', accent: '#94A3B8' },
  '약어':      { bg: '#F1F5F9', fg: '#475569', border: '#CBD5E1', accent: '#94A3B8' },
};

const DEFAULT_POS = { bg: '#F3F4F6', fg: '#374151', border: '#E5E7EB', accent: '#9CA3AF' };

export const getPosStyle = (tag: string) => POS_PALETTE[tag.trim()] || DEFAULT_POS;

export function PosBadge({ tag, size = 8 }: { tag: string; size?: number }) {
  const c = getPosStyle(tag);
  const scale = size / 8;
  return (
    <span
      className="inline-flex items-center align-middle"
      style={{
        background: c.bg,
        color: c.fg,
        border: `0.5px solid ${c.border}`,
        borderRadius: `${3 * scale}px`,
        padding: `${1 * scale}px ${4 * scale}px`,
        marginRight: `${3 * scale}px`,
        fontSize: `${size}px`,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
        fontFamily: '"Orbitron", "Noto Sans KR", sans-serif',
        textTransform: 'uppercase',
        boxShadow: `inset 2px 0 0 ${c.accent}`,
      }}
    >
      {tag}
    </span>
  );
}

/** "[명] 속임수; [동] 속이다" 처럼 대괄호 품사 기호가 포함된 뜻을 배지로 예쁘게 렌더링 */
export function TaggedMeaning({ meaning, badgeSize = 8, fallbackPos }: { meaning?: string | null; badgeSize?: number; fallbackPos?: string | null }) {
  if (!meaning) return null;
  const hasTag = /\[[^\]]{1,10}\]/.test(meaning);
  const normalized = !hasTag && fallbackPos
    ? `[${fallbackPos.replace(/[[\]]/g, '').split('/')[0].trim()}] ${meaning}`
    : meaning;
  const parts = normalized.split(/(\[[^\]]{1,10}\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[([^\]]{1,10})\]$/);
        if (m) return <PosBadge key={i} tag={m[1]} size={badgeSize} />;
        return <span key={i}>{p.replace(/^\s+/, ' ')}</span>;
      })}
    </>
  );
}

export default TaggedMeaning;

