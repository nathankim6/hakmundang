import { DayGroup, VocabularyWord } from '@/types/vocabulary';
import { Printer, RotateCcw, BookOpen, Star, Palette, Check, Pencil, Sparkles, Loader2, Download, FileUp, Quote, Feather, Languages } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { toast } from 'sonner';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { TaggedMeaning, PosBadge } from './PosMeaning';
import orunLogo from '@/assets/orun-academy-logo-new.jpg';
import orunAcademyLogo from '@/assets/orun-academy-logo.png.asset.json';
import orunVocaAppQr from '@/assets/orun-voca-app-qr.png.asset.json';
import botanicalVoca0 from '@/assets/botanical-voca0.png';
import botanicalVoca1 from '@/assets/botanical-voca1.png';
import botanicalVoca2 from '@/assets/botanical-voca2.png';


const getBotanicalImage = (volumeNumber: string) => {
  if (volumeNumber === '0') return botanicalVoca0;
  if (volumeNumber === '1') return botanicalVoca1;
  if (volumeNumber === '2') return botanicalVoca2;
  return botanicalVoca0;
};
import examIcon from '@/assets/exam-icon.png';
import { WorkbookConfig, THEME_COLORS } from './WorkbookSettings';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { downloadCSV, downloadWordTypeCSV } from '@/utils/csvExporter';
import { MiniBook } from './MiniBook';

// 색상 밝기 계산 함수
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

// 더 밝은 색상 생성
function lightenColor(hex: string, amount: number = 0.1): string {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
  const lightened = rgb.map(c => Math.min(255, Math.floor(c + (255 - c) * amount)));
  return '#' + lightened.map(x => x.toString(16).padStart(2, '0')).join('');
}

// 더 어두운 색상 생성
function darkenColor(hex: string, amount: number = 0.2): string {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
  const darkened = rgb.map(c => Math.max(0, Math.floor(c * (1 - amount))));
  return `#${darkened.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

// Cover color schemes based on coverStyle
const COVER_THEMES = {
  premium: {
    bgGradient: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
    goldColor: '#d4a853',
    goldDark: '#8b7014',
    textColor: '#d4a853',
    borderColor: 'rgba(212, 168, 83, 0.3)',
    borderColorStrong: 'rgba(212, 168, 83, 0.5)',
    logoShadow: '0 4px 16px rgba(0,0,0,0.35)',
    // Inner page colors
    innerBg: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)',
    innerTextColor: '#1a1a1a',
    innerGoldColor: '#c9a043',
    innerGoldDark: '#b48c3c',
    // Header colors for content pages
    headerBg: 'linear-gradient(135deg, #2a2520 0%, #1a1815 100%)',
    headerGoldColor: '#c9a043',
    headerGoldLight: '#e8c86b',
    headerDotColor: 'rgba(201, 160, 67, 0.08)',
    // Day divider
    dividerBg: 'linear-gradient(180deg, #fdfcfa 0%, #f8f5f0 50%, #f4efe8 100%)'
  },
  lite: {
    bgGradient: 'linear-gradient(180deg, #F5F0E6 0%, #EDE5D5 100%)',
    goldColor: '#B8860B',
    goldDark: '#8B6914',
    textColor: '#5C4033',
    borderColor: 'rgba(184, 134, 11, 0.3)',
    borderColorStrong: 'rgba(184, 134, 11, 0.5)',
    logoShadow: '0 4px 16px rgba(0,0,0,0.15)',
    // Inner page colors - lighter, friendlier tones
    innerBg: 'linear-gradient(180deg, #FFFDF8 0%, #FFF8EC 100%)',
    innerTextColor: '#5C4033',
    innerGoldColor: '#D4A853',
    innerGoldDark: '#B8860B',
    // Header colors for content pages - warm beige tone
    headerBg: 'linear-gradient(135deg, #D4C4A8 0%, #C9B896 100%)',
    headerGoldColor: '#6B5344',
    headerGoldLight: '#8B7355',
    headerDotColor: 'rgba(92, 64, 51, 0.08)',
    // Day divider - warmer, lighter
    dividerBg: 'linear-gradient(180deg, #FFFDF8 0%, #FFF5E6 50%, #FFEFD5 100%)'
  }
};

// 학교명(성남고, 숭의여고, 구암고, 흑석고 등)이 포함된 경우 제목에서 숨김
function getTitleWithoutSchool(title: string): string {
  return title.replace(/\s*(성남고|숭의여고|구암고|흑석고)\s*\d*/g, '').trim();
}

// Hard Cover Page Component - 프리미엄 아트 디자인
export function HardCoverPage({
  config,
  totalDays
}: {
  config: WorkbookConfig;
  totalDays?: number;
}) {
  const bgColor = config.themeColor;
  const volumeMatch = config.title.match(/(?:ORUN\s*VOCA|옳은보카)\s*(.+)/i);
  const volumeNumber = volumeMatch ? volumeMatch[1].trim() : config.title.match(/\d+/)?.[0] || '';
  const isLiteVersion = /^(0|1|2)$/.test(volumeNumber);
  const liteNameMap: Record<string, string> = {
    '0': 'Blooming (Basic)',
    '1': 'Blooming (Power)',
    '2': 'Harvest',
  };
  const subtitleMap: Record<string, string> = {
    '3': '중등 필수 어휘',
    '4': '중등 고난도 어휘',
    '5': '고등 기본 어휘',
    '6': '고등 필수 어휘',
    '7': '고등 고난도 어휘',
    '8': '고등 어휘 완성',
  };
  const volumeLabel = config.coverSubtitle
    || (isLiteVersion ? liteNameMap[volumeNumber] : subtitleMap[volumeNumber])
    || '';
  const daysText = `${totalDays || 0}일 완성`;

  const features: { icon: any; label: string }[] = [
    { icon: BookOpen, label: `${totalDays || 0} DAYS 학습` },
    { icon: Pencil, label: 'DAY별 DAILY TEST' },
    { icon: Feather, label: 'MINI BOOK 제공' },
    { icon: Sparkles, label: '예문 및 어원 수록' },
  ];

  const ink = '#141419';
  const deep = darkenColor(bgColor, 0.42);
  const plateBg = '#FAF7F0';

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="hard-cover" style={{
    width: '840px', height: '1188px', background: bgColor,
    fontFamily: '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif',
  }}>
    {/* 톤 깊이 */}
    <div aria-hidden style={{
      position: 'absolute', inset: 0, zIndex: 1,
      background: `linear-gradient(160deg, ${lightenColor(bgColor, 0.16)} 0%, ${bgColor} 42%, ${darkenColor(bgColor, 0.26)} 100%)`,
    }} />

    {/* 우측 상단 인그레이빙 아크 (동심원 라인) */}
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden' }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const s = 300 + i * 78;
        return <div key={i} style={{
          position: 'absolute', right: `${-s / 2 + 120}px`, top: `${-s / 2 + 90}px`,
          width: `${s}px`, height: `${s}px`, borderRadius: '50%',
          border: `1px solid rgba(255,255,255,${0.16 - i * 0.013})`,
        }} />;
      })}
    </div>

    {/* 좌측 스파인 스트립 */}
    <div aria-hidden={false} style={{
      position: 'absolute', left: 0, top: 0, bottom: 0, width: '62px', zIndex: 4,
      background: deep, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        transform: 'rotate(180deg)', writingMode: 'vertical-rl',
        fontFamily: '"Orbitron", serif', fontSize: '10.5px', fontWeight: 700,
        letterSpacing: '0.52em', color: 'rgba(255,255,255,0.72)', whiteSpace: 'nowrap',
      }}>ORUN ENGLISH · VOCABULARY SERIES</div>
      <div style={{
        position: 'absolute', bottom: '34px', left: '50%', transform: 'translateX(-50%)',
        width: '10px', height: '10px', background: '#ffffff', opacity: 0.9,
        clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
      }} />
    </div>

    {/* ===== 아이보리 플레이트 ===== */}
    <div style={{
      position: 'absolute', left: '112px', top: '92px', width: '660px', height: '626px', zIndex: 10,
      background: plateBg, boxShadow: '0 26px 60px rgba(0,0,0,0.30)',
      border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
    }}>
      {/* 플레이트 상단 컬러 바 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '7px', background: bgColor }} />

      {/* 초대형 볼륨 넘버 (아웃라인, 배경 레이어) */}
      <div aria-hidden style={{
        position: 'absolute', right: '-14px', bottom: '-72px',
        fontFamily: '"Orbitron", serif', fontWeight: 900, fontSize: '330px', lineHeight: 0.78,
        color: 'transparent', WebkitTextStroke: `2px ${bgColor}`, opacity: 0.16, letterSpacing: '-0.06em',
      }}>{volumeNumber}</div>

      {/* 헤어라인 그리드 */}
      <div aria-hidden style={{ position: 'absolute', left: '48px', right: '48px', top: '148px', height: '1px', background: 'rgba(20,20,25,0.14)' }} />
      <div aria-hidden style={{ position: 'absolute', left: '48px', right: '48px', top: '470px', height: '1px', background: 'rgba(20,20,25,0.14)' }} />

      {/* 상단 라인: 발행처 + 개정판 배지 */}
      <div style={{
        position: 'absolute', top: '46px', left: '48px', right: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: '"Noto Sans KR", sans-serif', fontSize: '11.5px', fontWeight: 700,
          letterSpacing: '0.34em', color: 'rgba(20,20,25,0.55)',
        }}>ORUN ENGLISH 어학연구소</div>
        <div style={{
          background: ink, color: '#ffffff', padding: '7px 13px',
          fontFamily: '"Noto Sans KR", sans-serif', fontSize: '11px', fontWeight: 800,
          letterSpacing: '0.14em',
        }}>전면 개정판</div>
      </div>

      {/* 대형 타이포 스택 */}
      <div style={{ position: 'absolute', top: '176px', left: '48px' }}>
        <div style={{
          fontFamily: '"Orbitron", serif', fontWeight: 900, fontSize: '112px',
          lineHeight: 0.9, letterSpacing: '-0.045em', color: ink, whiteSpace: 'nowrap',
        }}>ORUN</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px', marginTop: '6px' }}>
          <div style={{
            fontFamily: '"Orbitron", serif', fontWeight: 900, fontSize: '112px',
            lineHeight: 0.9, letterSpacing: '-0.045em', color: bgColor, whiteSpace: 'nowrap',
          }}>VOCA</div>
          {volumeNumber && (
            <div style={{
              fontFamily: '"Orbitron", serif', fontWeight: 900, fontSize: '58px',
              lineHeight: 1, color: ink, paddingBottom: '10px', letterSpacing: '-0.04em',
            }}>{volumeNumber}</div>
          )}
        </div>
      </div>

      {/* 국문 타이틀 블록 */}
      <div style={{ position: 'absolute', top: '500px', left: '48px', right: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{
              fontFamily: '"Noto Sans KR", sans-serif', fontSize: '34px', fontWeight: 900,
              color: ink, letterSpacing: '-0.035em', lineHeight: 1.15, wordBreak: 'keep-all',
            }}>옳은보카 {volumeNumber}</div>
            {volumeLabel && (
              <div style={{
                marginTop: '10px', fontFamily: '"Noto Sans KR", sans-serif', fontSize: '17px',
                fontWeight: 600, color: 'rgba(20,20,25,0.6)', letterSpacing: '-0.01em',
              }}>{volumeLabel}</div>
            )}
          </div>
          <div style={{
            border: `1.5px solid ${bgColor}`, padding: '9px 15px', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{
              fontFamily: '"Orbitron", serif', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.28em', color: bgColor, marginBottom: '4px',
            }}>PROGRAM</div>
            <div style={{
              fontFamily: '"Noto Sans KR", sans-serif', fontSize: '15px', fontWeight: 800,
              color: ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>{daysText}</div>
          </div>
        </div>
      </div>
    </div>

    {/* ===== 플레이트 하단 특징 칩 ===== */}
    <div style={{
      position: 'absolute', left: '112px', right: '68px', top: '752px', zIndex: 10,
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
    }}>
      {features.map((f, i) => (
        <div key={i} style={{
          border: '1px solid rgba(255,255,255,0.4)', padding: '14px 10px', textAlign: 'center',
          background: 'rgba(255,255,255,0.08)',
        }}>
          <f.icon size={18} color="#ffffff" style={{ margin: '0 auto 9px', display: 'block', opacity: 0.9 }} />
          <div style={{
            fontFamily: '"Noto Sans KR", sans-serif', fontSize: '12px', fontWeight: 700,
            color: '#ffffff', letterSpacing: '-0.02em', wordBreak: 'keep-all', lineHeight: 1.35,
          }}>{f.label}</div>
        </div>
      ))}
    </div>

    {/* ===== 하단 아이보리 밴드 ===== */}
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: '286px',
      background: 'linear-gradient(180deg, #fdfbf7 0%, #f5f0e8 100%)', zIndex: 13,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: bgColor }} />

      {/* 슬로건 */}
      <div style={{ position: 'absolute', top: '52px', left: '62px', width: '470px' }}>
        <div style={{
          fontFamily: '"Orbitron", serif', fontSize: '9.5px', fontWeight: 700,
          letterSpacing: '0.4em', color: bgColor, marginBottom: '16px',
        }}>PHILOSOPHY</div>
        <div style={{
          fontFamily: '"Noto Sans KR", sans-serif', fontSize: '22px', fontWeight: 800,
          color: ink, letterSpacing: '-0.035em', lineHeight: 1.4, wordBreak: 'keep-all',
        }}>English learning empowered<br />by Christian value.</div>
        <div style={{
          marginTop: '12px', fontFamily: '"Noto Sans KR", sans-serif', fontSize: '13.5px',
          fontWeight: 500, color: 'rgba(20,20,25,0.68)', letterSpacing: '-0.01em',
        }}>진리 안에서 인재를 만듭니다</div>
      </div>

      {/* 우측 QR */}
      <div style={{
        position: 'absolute', right: '62px', top: '52px',
        width: '112px', background: '#ffffff', padding: '10px 10px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      }}>
        <img src={orunVocaAppQr.url} alt="옳은보카 전용 APP QR"
          style={{ width: '92px', height: '92px', objectFit: 'contain', display: 'block' }} />
        <div style={{
          marginTop: '7px', paddingTop: '6px', width: '100%', borderTop: `1px solid ${bgColor}44`,
          fontFamily: '"Noto Sans KR", sans-serif', fontSize: '9px', fontWeight: 700,
          color: ink, textAlign: 'center',
        }}>옳은보카 전용 APP</div>
      </div>

      {/* 하단 로고 라인 */}
      <div style={{
        position: 'absolute', left: '62px', right: '62px', bottom: '38px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(20,20,25,0.14)', paddingTop: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '5px', background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <img src={orunAcademyLogo.url} alt="" style={{ width: '21px', height: '21px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: '"Noto Sans KR", sans-serif', fontSize: '12.5px', fontWeight: 700,
            color: ink, letterSpacing: '0.03em',
          }}>ORUN ENGLISH</span>
        </div>
        <span style={{
          fontFamily: '"Orbitron", serif', fontSize: '9.5px', fontWeight: 600,
          color: 'rgba(20,20,25,0.55)', letterSpacing: '0.3em',
        }}>VOL. {volumeNumber || '—'}</span>
      </div>
    </div>
  </div>;
}

// Back Cover Page Component - 프리미엄 에디토리얼 디자인
export function BackCoverPage({
  config
}: {
  config: WorkbookConfig;
}) {
  const bgColor = config.themeColor;
  const volumeMatch = config.title.match(/(?:ORUN\s*VOCA|옳은보카)\s*(.+)/i);
  const volumeNumber = volumeMatch ? volumeMatch[1].trim() : '';
  const isLiteVersion = /^(0|1|2)$/.test(volumeNumber);
  const bulletItems = [
    '체계적으로 정리된 DAY별 어휘',
    '감수 예문 & 뜻 풀이',
    'DAY별 DAILY TEST 자동 채점',
    '휴대용 MINI BOOK 부록 제공',
  ];

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="back-cover" style={{
    width: '840px', height: '1188px', background: '#fefdfb',
    fontFamily: '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif',
  }}>
    {/* ===== 상단 화이트 영역 (약 55%) ===== */}
    {/* 좌상단 시리즈 라벨 */}
    <div style={{
      position: 'absolute', top: '54px', left: '54px', zIndex: 10,
      fontFamily: '"Orbitron", serif', fontSize: '10px', fontWeight: 700,
      color: bgColor, letterSpacing: '0.4em',
    }}>ORUN ENGLISH · VOCAB SERIES</div>

    {/* 메인 헤드라인 */}
    <div style={{ position: 'absolute', top: '110px', left: '54px', right: '54px', zIndex: 10 }}>
      <div style={{
        fontFamily: '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif',
        fontSize: '56px', fontWeight: 900, color: '#0a0a0a',
        letterSpacing: '-0.04em', lineHeight: 1.05,
      }}>
        어휘를 마스터하고<br />당신의 가능성을<br />열어보세요.
      </div>
      <div style={{
        fontFamily: '"Cormorant Garamond", "Playfair Display", serif',
        fontStyle: 'italic', fontSize: '18px', color: '#666',
        marginTop: '18px', letterSpacing: '0.02em',
      }}>Master vocabulary, unlock your potential.</div>
    </div>

    {/* 구분선 + 불릿 리스트 */}
    <div style={{ position: 'absolute', top: '420px', left: '54px', right: '54px', zIndex: 10 }}>
      <div style={{ height: '1px', background: '#d8d8d8', marginBottom: '22px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', rowGap: '14px' }}>
        {bulletItems.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{
              width: '18px', height: '18px', flexShrink: 0,
              background: bgColor, color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Orbitron", serif', fontSize: '11px', fontWeight: 700,
              marginTop: '2px',
            }}>{i + 1}</span>
            <span style={{
              fontFamily: '"Noto Sans KR", sans-serif', fontSize: '14px',
              fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em', lineHeight: 1.4,
            }}>{b}</span>
          </div>
        ))}
      </div>
    </div>

    {/* ===== 하단 컬러 블록 (약 45%) ===== */}
    <div style={{
      position: 'absolute', top: '55%', left: 0, right: 0, bottom: 0,
      background: bgColor, zIndex: 5,
    }}>
      {/* 상단 태그라인 */}
      <div style={{
        position: 'absolute', top: '46px', left: '54px', right: '54px',
      }}>
        <div style={{
          fontFamily: '"Orbitron", serif', fontSize: '10px', fontWeight: 700,
          color: '#ffffff', opacity: 0.85, letterSpacing: '0.35em', marginBottom: '14px',
        }}>ABOUT · ORUN VOCA</div>
        <div style={{
          fontFamily: '"Noto Sans KR", sans-serif', fontSize: '15px',
          fontWeight: 500, color: '#ffffff', lineHeight: 1.75, letterSpacing: '-0.005em',
          maxWidth: '540px',
        }}>
          ORUN ENGLISH 어학연구소가 오랜 현장 경험을 바탕으로 설계한 어휘 시리즈입니다.
          기독교적 가치 안에서 진리와 인재를 함께 세우는 학습을 지향합니다.
        </div>
      </div>

      {/* 좌하단 발행 정보 */}
      <div style={{
        position: 'absolute', left: '54px', bottom: '54px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '6px', background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/assets/orun-academy-logo-print.jpg" alt="" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{
            fontFamily: '"Noto Sans KR", sans-serif', fontSize: '13px', fontWeight: 700,
            color: '#ffffff', letterSpacing: '0.02em',
          }}>ORUN ENGLISH</div>
          <div style={{
            fontFamily: '"Orbitron", serif', fontSize: '9px', fontWeight: 500,
            color: 'rgba(255,255,255,0.75)', letterSpacing: '0.25em', marginTop: '2px',
          }}>www.orunenglish.com</div>
        </div>
      </div>

      {/* 우하단 ISBN/바코드 자리 */}
      <div style={{
        position: 'absolute', right: '54px', bottom: '54px',
        width: '188px', background: '#ffffff', padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          fontFamily: '"Orbitron", serif', fontSize: '9px', fontWeight: 700,
          color: bgColor, letterSpacing: '0.35em', marginBottom: '8px',
        }}>ISBN · {volumeNumber || '00'}</div>
        {/* 바코드 라인 페이크 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '46px' }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{
              width: i % 3 === 0 ? '3px' : '1.5px',
              height: '100%',
              background: '#0a0a0a',
              opacity: i % 4 === 0 ? 1 : 0.85,
            }} />
          ))}
        </div>
        <div style={{
          fontFamily: '"Orbitron", serif', fontSize: '9px', fontWeight: 600,
          color: '#0a0a0a', letterSpacing: '0.2em', marginTop: '6px',
        }}>979-11-{(9000 + Number(volumeNumber || 0)).toString()}-{isLiteVersion ? 'L' : 'V'}-{volumeNumber || '0'}</div>
      </div>
    </div>
  </div>;
}
export function MiniTestHardCoverPage({
  config,
  totalDays,
  testCount,
  forPrint = false,
  title = 'MINI BOOK',
  bottomTags = ['뜻맞추기', '스펠링', '빈칸채우기', '정답지']
}: {
  config: WorkbookConfig;
  totalDays: number;
  testCount: number;
  forPrint?: boolean;
  title?: string;
  bottomTags?: string[];
}) {
  const bgColor = config.themeColor;
  const baseSecColor = config.secondaryColor || darkenColor(bgColor, 0.15);
  const secColor = forPrint ? lightenColor(baseSecColor, 0.45) : baseSecColor;
  const topGradient = forPrint ? lightenColor(secColor, 0.15) : secColor;
  const bottomGradient = darkenColor(secColor, forPrint ? 0.05 : 0.25);

  const brandTextColor = forPrint ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.9)';
  const subtitleColor = forPrint ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.55)';
  const mutedTextColor = forPrint ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.5)';

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="mini-test-hard-cover" style={{
    width: '840px',
    height: '1188px',
    background: `linear-gradient(160deg, ${topGradient} 0%, ${bottomGradient} 100%)`
  }}>
    {/* Decorative circles */}
    <div className="absolute" style={{
      width: '350px', height: '350px', borderRadius: '50%',
      top: '-60px', right: '-80px', background: forPrint ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'
    }} />
    <div className="absolute" style={{
      width: '200px', height: '200px', borderRadius: '50%',
      bottom: '-40px', left: '-40px', background: forPrint ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)'
    }} />

    {/* Top-right badge */}
    <div className="absolute top-10 right-0 z-20">
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        color: secColor,
        padding: '8px 28px 8px 20px',
        fontSize: '12px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 800,
        borderRadius: '8px 0 0 8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
      }}>
        APPENDIX
      </div>
    </div>

    {/* Top-left brand */}
    <div className="absolute top-12 left-12 z-20 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
        <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" className="w-7 h-7 object-contain" />
      </div>
      <span style={{
        fontSize: '13px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 700,
        color: brandTextColor
      }}>
        ORUN ENGLISH
      </span>
    </div>

    {/* Main content */}
    <div className="h-full flex flex-col items-center justify-center relative z-10 px-16">
      <div className="mb-3">
        <span style={{
          fontSize: '14px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 400,
          color: subtitleColor,
          letterSpacing: '0.25em'
        }}>
          TESTS & ANSWER KEYS
        </span>
      </div>

      <span style={{
        fontSize: '56px',
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: '0.06em',
        lineHeight: 1.1,
        textShadow: '0 2px 20px rgba(0,0,0,0.15)'
      }}>
        {title}
      </span>

      <div className="my-6 w-[80px] h-[2px]" style={{ background: forPrint ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.3)' }} />

      {/* Stats */}
      <div className="flex items-center justify-center gap-10">
        {[
          { value: totalDays, label: 'DAYS' },
          { value: testCount, label: 'TESTS' }
        ].map((stat, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="w-[1px] h-12" style={{ background: forPrint ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.2)' }} />}
            <div className="text-center">
              <div style={{
                fontSize: '42px',
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>{stat.value}</div>
              <div style={{
                fontSize: '10px',
                color: mutedTextColor,
                letterSpacing: '0.25em',
                marginTop: '4px',
                fontFamily: '"Noto Sans KR", sans-serif'
              }}>{stat.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>

    {/* Bottom section */}
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="flex items-center justify-center gap-2 mb-6">
        {bottomTags.map((item, i) => (
          <div key={i} style={{
            background: forPrint ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.13)',
            padding: '5px 14px',
            borderRadius: '20px',
            border: forPrint ? '1px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.18)',
            fontSize: '10px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 500,
            color: forPrint ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.85)'
          }}>
            {item}
          </div>
        ))}
      </div>
      <div style={{
        background: forPrint ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.12)',
        padding: '14px 0',
        textAlign: 'center'
      }}>
        <span style={{
          fontSize: '11px',
          color: mutedTextColor,
          letterSpacing: '0.15em',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 500
        }}>
          ORUN ENGLISH
        </span>
      </div>
    </div>
  </div>;
}

// MINI TEST Back Cover Page - 프리미엄 한국형 교재 디자인
export function MiniTestBackCoverPage({
  config,
  forPrint = false,
  title = 'MINI BOOK'
}: {
  config: WorkbookConfig;
  forPrint?: boolean;
  title?: string;
}) {
  const baseSecColor = config.secondaryColor || darkenColor(config.themeColor, 0.15);
  const secColor = forPrint ? lightenColor(baseSecColor, 0.45) : baseSecColor;
  const topGradient = forPrint ? lightenColor(secColor, 0.1) : darkenColor(secColor, 0.1);
  const bottomGradient = darkenColor(secColor, forPrint ? 0.08 : 0.3);

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="mini-test-back-cover" style={{
    width: '840px',
    height: '1188px',
    background: `linear-gradient(160deg, ${topGradient} 0%, ${bottomGradient} 100%)`
  }}>
    <div className="absolute" style={{
      width: '250px', height: '250px', borderRadius: '50%',
      top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: forPrint ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)'
    }} />

    <div className="h-full flex flex-col items-center justify-center relative z-10">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white flex items-center justify-center" style={{
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
        }}>
          <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" className="w-16 h-16 object-contain" />
        </div>
      </div>

      <span style={{
        fontSize: '26px',
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: '0.06em'
      }}>
        {title}
      </span>

      <div className="w-[50px] h-[2px] my-5" style={{ background: forPrint ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)' }} />

      <span style={{
        fontSize: '11px',
        color: forPrint ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.5)',
        fontFamily: '"Noto Sans KR", sans-serif',
        letterSpacing: '0.15em'
      }}>
        TESTS & ANSWER KEYS
      </span>
    </div>

    <div className="absolute bottom-0 left-0 right-0" style={{
      background: forPrint ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.1)',
      padding: '14px 0',
      textAlign: 'center'
    }}>
      <span style={{
        color: forPrint ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.45)',
        fontSize: '11px',
        letterSpacing: '0.15em',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 500
      }}>
        ORUN ENGLISH · www.orunenglish.com
      </span>
    </div>
  </div>;
}

interface WorkbookPreviewProps {
  dayGroups: DayGroup[];
  onReset: () => void;
  config: WorkbookConfig;
  onConfigChange?: (config: WorkbookConfig) => void;
  workbookId?: string;
}
const WORDS_PER_PAGE = 5;
const WORDS_PER_PAGE_NO_EXAMPLES = 15;
const WORDS_PER_PAGE_ULTIMATE = 20; // Ultimate 단어장 전용
const WORDS_PER_PAGE_WORD_TYPE = 40; // 단어유형 워크북 전용 (2열 x 20행)
// Unified premium color scheme
const CARD_BG = 'bg-white';
const ACCENT_GRADIENT = 'from-amber-500 to-orange-500';
const TEXT_ACCENT = 'text-amber-600';

// Generate a complementary accent color that's more visible than the theme color
const getAccentColor = (themeColor: string): string => {
  const hex = themeColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Shift hue slightly and adjust for visibility
  const newH = (h * 360 + 20) % 360;
  const newS = Math.min(s * 1.4, 0.9);
  const newL = Math.max(Math.min(l * 0.65, 0.4), 0.2);
  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h / 360 + 1 / 3);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, h / 360 - 1 / 3);
    }
    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
  };
  return hslToRgb(newH, newS, newL);
};
// Irregular verb forms mapping (base -> [past, past participle, other forms])
const IRREGULAR_VERBS: Record<string, string[]> = {
  'break': ['broke', 'broken', 'breaks', 'breaking'],
  'take': ['took', 'taken', 'takes', 'taking'],
  'make': ['made', 'makes', 'making'],
  'go': ['went', 'gone', 'goes', 'going'],
  'come': ['came', 'comes', 'coming'],
  'get': ['got', 'gotten', 'gets', 'getting'],
  'give': ['gave', 'given', 'gives', 'giving'],
  'run': ['ran', 'runs', 'running'],
  'see': ['saw', 'seen', 'sees', 'seeing'],
  'do': ['did', 'done', 'does', 'doing'],
  'have': ['had', 'has', 'having'],
  'be': ['was', 'were', 'been', 'is', 'are', 'am', 'being'],
  'write': ['wrote', 'written', 'writes', 'writing'],
  'put': ['puts', 'putting'],
  'set': ['sets', 'setting'],
  'cut': ['cuts', 'cutting'],
  'let': ['lets', 'letting'],
  'hit': ['hits', 'hitting'],
  'read': ['reads', 'reading'],
  'tell': ['told', 'tells', 'telling'],
  'sell': ['sold', 'sells', 'selling'],
  'buy': ['bought', 'buys', 'buying'],
  'bring': ['brought', 'brings', 'bringing'],
  'think': ['thought', 'thinks', 'thinking'],
  'catch': ['caught', 'catches', 'catching'],
  'teach': ['taught', 'teaches', 'teaching'],
  'find': ['found', 'finds', 'finding'],
  'hold': ['held', 'holds', 'holding'],
  'stand': ['stood', 'stands', 'standing'],
  'understand': ['understood', 'understands', 'understanding'],
  'lose': ['lost', 'loses', 'losing'],
  'pay': ['paid', 'pays', 'paying'],
  'meet': ['met', 'meets', 'meeting'],
  'sit': ['sat', 'sits', 'sitting'],
  'speak': ['spoke', 'spoken', 'speaks', 'speaking'],
  'lie': ['lay', 'lain', 'lies', 'lying'],
  'lay': ['laid', 'lays', 'laying'],
  'lead': ['led', 'leads', 'leading'],
  'leave': ['left', 'leaves', 'leaving'],
  'feel': ['felt', 'feels', 'feeling'],
  'keep': ['kept', 'keeps', 'keeping'],
  'begin': ['began', 'begun', 'begins', 'beginning'],
  'show': ['showed', 'shown', 'shows', 'showing'],
  'hear': ['heard', 'hears', 'hearing'],
  'grow': ['grew', 'grown', 'grows', 'growing'],
  'know': ['knew', 'known', 'knows', 'knowing'],
  'throw': ['threw', 'thrown', 'throws', 'throwing'],
  'draw': ['drew', 'drawn', 'draws', 'drawing'],
  'fly': ['flew', 'flown', 'flies', 'flying'],
  'drive': ['drove', 'driven', 'drives', 'driving'],
  'ride': ['rode', 'ridden', 'rides', 'riding'],
  'rise': ['rose', 'risen', 'rises', 'rising'],
  'fall': ['fell', 'fallen', 'falls', 'falling'],
  'eat': ['ate', 'eaten', 'eats', 'eating'],
  'drink': ['drank', 'drunk', 'drinks', 'drinking'],
  'swim': ['swam', 'swum', 'swims', 'swimming'],
  'sing': ['sang', 'sung', 'sings', 'singing'],
  'ring': ['rang', 'rung', 'rings', 'ringing'],
  'wear': ['wore', 'worn', 'wears', 'wearing'],
  'tear': ['tore', 'torn', 'tears', 'tearing'],
  'blow': ['blew', 'blown', 'blows', 'blowing'],
  'choose': ['chose', 'chosen', 'chooses', 'choosing'],
  'freeze': ['froze', 'frozen', 'freezes', 'freezing'],
  'hide': ['hid', 'hidden', 'hides', 'hiding'],
  'bite': ['bit', 'bitten', 'bites', 'biting'],
  'wake': ['woke', 'woken', 'wakes', 'waking'],
  'shake': ['shook', 'shaken', 'shakes', 'shaking'],
  'forget': ['forgot', 'forgotten', 'forgets', 'forgetting'],
  'forgive': ['forgave', 'forgiven', 'forgives', 'forgiving'],
  'steal': ['stole', 'stolen', 'steals', 'stealing'],
  'stick': ['stuck', 'sticks', 'sticking'],
  'strike': ['struck', 'stricken', 'strikes', 'striking'],
  'sweep': ['swept', 'sweeps', 'sweeping'],
  'swing': ['swung', 'swings', 'swinging'],
  'win': ['won', 'wins', 'winning'],
  'fight': ['fought', 'fights', 'fighting'],
  'light': ['lit', 'lighted', 'lights', 'lighting'],
  'shoot': ['shot', 'shoots', 'shooting'],
  'spend': ['spent', 'spends', 'spending'],
  'send': ['sent', 'sends', 'sending'],
  'build': ['built', 'builds', 'building'],
  'lend': ['lent', 'lends', 'lending'],
  'bend': ['bent', 'bends', 'bending'],
  'sleep': ['slept', 'sleeps', 'sleeping'],
  'creep': ['crept', 'creeps', 'creeping'],
  'deal': ['dealt', 'deals', 'dealing'],
  'mean': ['meant', 'means', 'meaning'],
  'dream': ['dreamt', 'dreamed', 'dreams', 'dreaming'],
  'learn': ['learnt', 'learned', 'learns', 'learning'],
  'burn': ['burnt', 'burned', 'burns', 'burning'],
  'spell': ['spelt', 'spelled', 'spells', 'spelling'],
  'spill': ['spilt', 'spilled', 'spills', 'spilling'],
  'spoil': ['spoilt', 'spoiled', 'spoils', 'spoiling'],
  // Additional irregular verbs
  'bear': ['bore', 'born', 'borne', 'bears', 'bearing'],
  'beat': ['beat', 'beaten', 'beats', 'beating'],
  'bind': ['bound', 'binds', 'binding'],
  'bleed': ['bled', 'bleeds', 'bleeding'],
  'breed': ['bred', 'breeds', 'breeding'],
  'burst': ['bursts', 'bursting'],
  'cast': ['casts', 'casting'],
  'cling': ['clung', 'clings', 'clinging'],
  'cost': ['costs', 'costing'],
  'dig': ['dug', 'digs', 'digging'],
  'feed': ['fed', 'feeds', 'feeding'],
  'flee': ['fled', 'flees', 'fleeing'],
  'fling': ['flung', 'flings', 'flinging'],
  'forbid': ['forbade', 'forbidden', 'forbids', 'forbidding'],
  'grind': ['ground', 'grinds', 'grinding'],
  'hang': ['hung', 'hangs', 'hanging'],
  'kneel': ['knelt', 'kneeled', 'kneels', 'kneeling'],
  'leap': ['leapt', 'leaped', 'leaps', 'leaping'],
  'mistake': ['mistook', 'mistaken', 'mistakes', 'mistaking'],
  'overcome': ['overcame', 'overcomes', 'overcoming'],
  'quit': ['quits', 'quitting'],
  'seek': ['sought', 'seeks', 'seeking'],
  'shine': ['shone', 'shined', 'shines', 'shining'],
  'shrink': ['shrank', 'shrunk', 'shrinks', 'shrinking'],
  'sink': ['sank', 'sunk', 'sunken', 'sinks', 'sinking'],
  'slide': ['slid', 'slides', 'sliding'],
  'sow': ['sowed', 'sown', 'sows', 'sowing'],
  'spin': ['spun', 'spins', 'spinning'],
  'split': ['splits', 'splitting'],
  'spread': ['spreads', 'spreading'],
  'spring': ['sprang', 'sprung', 'springs', 'springing'],
  'stink': ['stank', 'stunk', 'stinks', 'stinking'],
  'swear': ['swore', 'sworn', 'swears', 'swearing'],
  'swell': ['swelled', 'swollen', 'swells', 'swelling'],
  'weave': ['wove', 'woven', 'weaves', 'weaving'],
  'wind': ['wound', 'winds', 'winding'],
  'withdraw': ['withdrew', 'withdrawn', 'withdraws', 'withdrawing'],
  'wring': ['wrung', 'wrings', 'wringing'],
  'arise': ['arose', 'arisen', 'arises', 'arising'],
  'awake': ['awoke', 'awoken', 'awakes', 'awaking'],
  'undergo': ['underwent', 'undergone', 'undergoes', 'undergoing'],
  'undertake': ['undertook', 'undertaken', 'undertakes', 'undertaking'],
  'upset': ['upsets', 'upsetting'],
  'withstand': ['withstood', 'withstands', 'withstanding'],
  'forbear': ['forbore', 'forborne', 'forbears', 'forbearing'],
  'foresee': ['foresaw', 'foreseen', 'foresees', 'foreseeing'],
  'overthrow': ['overthrew', 'overthrown', 'overthrows', 'overthrowing'],
  'undo': ['undid', 'undone', 'undoes', 'undoing'],
  'outdo': ['outdid', 'outdone', 'outdoes', 'outdoing'],
  'outgrow': ['outgrew', 'outgrown', 'outgrows', 'outgrowing'],
  'oversee': ['oversaw', 'overseen', 'oversees', 'overseeing'],
  'partake': ['partook', 'partaken', 'partakes', 'partaking'],
  'redo': ['redid', 'redone', 'redoes', 'redoing'],
  'retake': ['retook', 'retaken', 'retakes', 'retaking'],
  'rewrite': ['rewrote', 'rewritten', 'rewrites', 'rewriting'],
};

// Generate all inflected forms of a word using morphological rules
function getAllWordForms(word: string): string[] {
  const lowerWord = word.toLowerCase();
  const forms = new Set<string>([lowerWord]);

  // Check irregular verbs (both as base and as a known form)
  if (IRREGULAR_VERBS[lowerWord]) {
    IRREGULAR_VERBS[lowerWord].forEach(f => forms.add(f));
  }
  for (const [base, irregularForms] of Object.entries(IRREGULAR_VERBS)) {
    if (irregularForms.includes(lowerWord) || base === lowerWord) {
      forms.add(base);
      irregularForms.forEach(f => forms.add(f));
    }
  }

  // Generate regular inflected forms based on morphological rules
  const endsWithE = lowerWord.endsWith('e');
  const endsWithEe = lowerWord.endsWith('ee');
  const endsWithY = lowerWord.endsWith('y');
  const endsWithConsonantY = endsWithY && lowerWord.length > 1 && !/[aeiou]/.test(lowerWord[lowerWord.length - 2]);
  const lastChar = lowerWord[lowerWord.length - 1];
  // CVC pattern: ends with consonant-vowel-consonant (for short words or stressed final syllable)
  const isCVC = lowerWord.length >= 3 &&
    !/[aeiou]/.test(lowerWord[lowerWord.length - 1]) &&
    /[aeiou]/.test(lowerWord[lowerWord.length - 2]) &&
    !/[aeiouxyw]/.test(lowerWord[lowerWord.length - 1]) &&
    // Common short CVC words or words with stressed final syllable
    (lowerWord.length <= 4 ||
     lowerWord.endsWith('mit') || lowerWord.endsWith('fer') || lowerWord.endsWith('cur') ||
     lowerWord.endsWith('gin') || lowerWord.endsWith('get') || lowerWord.endsWith('vet') ||
     lowerWord.endsWith('pat') || lowerWord.endsWith('pet') || lowerWord.endsWith('fit') ||
     lowerWord.endsWith('rop') || lowerWord.endsWith('nap') || lowerWord.endsWith('rap') ||
     lowerWord.endsWith('rip') || lowerWord.endsWith('lip') || lowerWord.endsWith('hip') ||
     lowerWord.endsWith('tip') || lowerWord.endsWith('dip') || lowerWord.endsWith('nod') ||
     lowerWord.endsWith('rob') || lowerWord.endsWith('sob') || lowerWord.endsWith('ban') ||
     lowerWord.endsWith('pin') || lowerWord.endsWith('pan') || lowerWord.endsWith('hin') ||
     lowerWord.endsWith('plot') || lowerWord.endsWith('spot') || lowerWord.endsWith('knit') ||
     lowerWord.endsWith('slit') || lowerWord.endsWith('whip') || lowerWord.endsWith('grip') ||
     lowerWord.endsWith('skip') || lowerWord.endsWith('flip') || lowerWord.endsWith('clip') ||
     lowerWord.endsWith('trip') || lowerWord.endsWith('snap') || lowerWord.endsWith('wrap') ||
     lowerWord.endsWith('trap') || lowerWord.endsWith('strap') || lowerWord.endsWith('stir') ||
     lowerWord.endsWith('blur') || lowerWord.endsWith('scar') || lowerWord.endsWith('star'));

  if (endsWithEe) {
    // Words ending in -ee: just add suffixes normally
    forms.add(lowerWord + 's');
    forms.add(lowerWord + 'd');
    forms.add(lowerWord + 'ing');
    forms.add(lowerWord + 'r');
  } else if (endsWithE) {
    // Drop 'e' before vowel suffixes (-ed, -ing, -er, -est)
    const stem = lowerWord.slice(0, -1);
    forms.add(lowerWord + 's');       // provides
    forms.add(lowerWord + 'd');       // provided (provide+d)
    forms.add(stem + 'ed');           // also match (provid+ed)
    forms.add(stem + 'ing');          // providing
    forms.add(stem + 'er');           // provider
    forms.add(stem + 'est');          // widest
    forms.add(lowerWord + 'ly');      // widely -> no, wide+ly
    forms.add(stem + 'ely');          // (unlikely)
    forms.add(lowerWord + 'ment');    // achievement? achieve+ment
    forms.add(stem + 'ement');        // (unlikely)
    forms.add(stem + 'ation');        // admiration
    forms.add(stem + 'ition');        // competition
  } else if (endsWithConsonantY) {
    // Change y to i before most suffixes
    const stem = lowerWord.slice(0, -1);
    forms.add(stem + 'ies');          // carries
    forms.add(stem + 'ied');          // carried
    forms.add(stem + 'ier');          // carrier
    forms.add(stem + 'iest');         // earliest
    forms.add(stem + 'ily');          // happily
    forms.add(lowerWord + 'ing');     // carrying (keep y before -ing)
    forms.add(lowerWord + 's');       // fallback
  } else if (isCVC) {
    // Double last consonant before vowel suffixes
    forms.add(lowerWord + 's');
    forms.add(lowerWord + lastChar + 'ed');    // stopped
    forms.add(lowerWord + lastChar + 'ing');   // stopping
    forms.add(lowerWord + lastChar + 'er');    // stopper
    forms.add(lowerWord + lastChar + 'est');   // biggest
    // Also add non-doubled forms as fallback
    forms.add(lowerWord + 'ed');
    forms.add(lowerWord + 'ing');
  } else {
    // Regular suffixes
    forms.add(lowerWord + 's');
    forms.add(lowerWord + 'es');
    forms.add(lowerWord + 'ed');
    forms.add(lowerWord + 'ing');
    forms.add(lowerWord + 'er');
    forms.add(lowerWord + 'est');
    forms.add(lowerWord + 'ly');
    forms.add(lowerWord + 'ment');
    forms.add(lowerWord + 'ness');
    forms.add(lowerWord + 'tion');
    forms.add(lowerWord + 'ation');
    forms.add(lowerWord + 'ful');
    forms.add(lowerWord + 'less');
    forms.add(lowerWord + 'able');
    forms.add(lowerWord + 'ible');
    forms.add(lowerWord + 'ive');
    forms.add(lowerWord + 'al');
    forms.add(lowerWord + 'ous');
  }

  return [...forms];
}

function highlightWord(sentence: string, targetWord: string, themeColor: string) {
  // Placeholder patterns to exclude from collocations (e.g., "put A on B")
  const placeholders = ['a', 'b', 'c', 'the', 'an', 'one', 'sb', 'sth', 'something', 'someone', 'somebody', 'oneself'];
  
  // Expand parenthetical and bracket alternatives: "speak(talk)" → ["speak", "talk"], "keep[hold]" → ["keep", "hold"]
  // Also handles tildes (~), Korean chars, and punctuation cleanup
  const expandParentheses = (text: string): string[] => {
    const expanded: string[] = [];
    const tokens = text.split(/\s+/);
    for (const token of tokens) {
      // Skip pure tildes or tilde-only tokens like "~", "~ing"
      const withoutTilde = token.replace(/~/g, '');
      if (withoutTilde.length === 0) continue;
      
      // Handle parenthetical alternatives: speak(talk)
      const parenMatch = withoutTilde.match(/^([a-zA-Z]+)\(([a-zA-Z]+)\)$/);
      if (parenMatch) {
        expanded.push(parenMatch[1]);
        expanded.push(parenMatch[2]);
        continue;
      }
      // Handle bracket alternatives: keep[hold]
      const bracketMatch = withoutTilde.match(/^([a-zA-Z]+)\[([a-zA-Z]+)\]$/);
      if (bracketMatch) {
        expanded.push(bracketMatch[1]);
        expanded.push(bracketMatch[2]);
        continue;
      }
      
      // Remove all non-English characters (parentheses, brackets, slashes, Korean, punctuation)
      const cleaned = withoutTilde.replace(/[^a-zA-Z'-]/g, '').trim();
      if (cleaned.length > 0) expanded.push(cleaned);
    }
    return expanded;
  };

  const allTokens = expandParentheses(targetWord.toLowerCase());
  const wordParts = allTokens.filter(p => 
    p.length > 0 && !placeholders.includes(p.toLowerCase())
  );

  // If no valid parts after filtering, use all parts with length >= 2
  const partsToProcess = wordParts.length > 0 
    ? wordParts 
    : allTokens.filter(p => p.length >= 2);

  // Build patterns for all word parts including irregular forms — exact match only
  const allPatterns: string[] = [];
  partsToProcess.forEach(part => {
    const allForms = getAllWordForms(part);
    allForms.forEach(form => {
      const escapedForm = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      allPatterns.push(`\\b${escapedForm}\\b`);
    });
  });

  // Remove duplicate patterns
  const uniquePatterns = [...new Set(allPatterns)];

  // Combine patterns and create regex
  const regex = new RegExp(`(${uniquePatterns.join('|')})`, 'gi');

  // Split by the regex, keeping the matched parts
  const parts: string[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(sentence)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(sentence.slice(lastIndex, match.index));
    }
    // Add matched text with marker
    parts.push(`__HIGHLIGHT__${match[0]}__HIGHLIGHT__`);
    lastIndex = regex.lastIndex;
  }
  // Add remaining text
  if (lastIndex < sentence.length) {
    parts.push(sentence.slice(lastIndex));
  }

  // Join and split again to process
  const combined = parts.join('');
  const finalParts = combined.split('__HIGHLIGHT__');
  return finalParts.map((part, index) => {
    // Check if this part matches our word patterns
    if (part && regex.test(part)) {
      regex.lastIndex = 0; // Reset regex state
      return <span key={index} className="font-bold underline" style={{
        color: themeColor
      }}>
          {part}
        </span>;
    }
    return part;
  });
}

// Test Sheet Type 1: Meaning Test (write meaning for each word)
// Test Sheet Type 1: Meaning Practice (write meaning 3 times for each word)
// Seeded shuffle function for consistent randomization
function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum += seed.charCodeAt(i);
  }
  
  for (let i = result.length - 1; i > 0; i--) {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    const j = Math.floor((seedNum / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Shared decorations for test sheets (watermark + corner frames)
function TestSheetDecorations({ config }: { config: WorkbookConfig }) {
  return <>
    <div data-watermark="true" className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]" style={{ transform: 'rotate(-20deg)' }}>
      <div className="text-center tracking-widest select-none whitespace-nowrap" style={{
        fontSize: '90px', color: 'rgba(180, 180, 180, 0.12)',
        fontFamily: '"Orbitron", "Playfair Display", serif', fontWeight: 700
      }}>ORUN VOCA</div>
    </div>
    <div className="absolute top-4 right-4 pointer-events-none" style={{ width: '60px', height: '60px' }}>
      <div className="absolute top-0 right-0 w-[40px] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${config.themeColor}20)` }} />
      <div className="absolute top-0 right-0 w-[1px] h-[40px]" style={{ background: `linear-gradient(180deg, ${config.themeColor}20, transparent)` }} />
    </div>
    <div className="absolute bottom-4 left-4 pointer-events-none" style={{ width: '60px', height: '60px' }}>
      <div className="absolute bottom-0 left-0 w-[40px] h-[1px]" style={{ background: `linear-gradient(-90deg, transparent, ${config.secondaryColor}20)` }} />
      <div className="absolute bottom-0 left-0 w-[1px] h-[40px]" style={{ background: `linear-gradient(0deg, ${config.secondaryColor}20, transparent)` }} />
    </div>
  </>;
}

// Shared editorial bar header for test/answer sheets
function EditorialTestHeader({ config, leftMargin, rightMargin, testType, subText, dayLabel, rightInfo, brandLabel }: {
  config: WorkbookConfig; leftMargin: string; rightMargin: string; testType: string;
  subText: React.ReactNode; dayLabel: string; rightInfo?: React.ReactNode; brandLabel?: string;
}) {
  const theme = config.themeColor;
  return <>
    {/* JLPT-inspired 마스트헤드: 좌측 컬러 태그 + 볼드 블랙 타이틀 + 우측 DAY 넘버 */}
    <div className="flex-shrink-0 mt-7 relative" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
      <div className="flex items-stretch" style={{ height: '52px' }}>
        {/* 좌측 컬러 태그 (브랜드 라벨) */}
        <div style={{
          background: theme, color: '#ffffff',
          padding: '0 18px', display: 'flex', alignItems: 'center', gap: '8px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '20px', height: '20px', background: '#ffffff', borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={examIcon} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: '"Orbitron", serif', fontWeight: 700, fontSize: '11px',
            color: '#ffffff', letterSpacing: '0.3em',
          }}>{brandLabel || 'MINI BOOK'}</span>
        </div>

        {/* 중앙 타이틀 영역 */}
        <div style={{
          flex: 1, background: '#fefdfb', borderTop: '1px solid #e6e6e6',
          borderBottom: '1px solid #e6e6e6', borderRight: '1px solid #e6e6e6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 18px',
        }}>
          <span style={{
            fontFamily: '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif',
            fontWeight: 800, fontSize: '17px', color: '#0a0a0a',
            letterSpacing: '-0.02em',
          }}>{testType}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontFamily: '"Orbitron", serif', fontSize: '8.5px', fontWeight: 600,
              color: '#999', letterSpacing: '0.35em',
            }}>DAY</span>
            <span style={{
              fontFamily: '"Orbitron", "Playfair Display", serif',
              fontWeight: 900, fontSize: '22px', color: theme,
              letterSpacing: '-0.02em', lineHeight: 1,
            }}>{dayLabel.replace(/DAY\s*/i, '') || dayLabel}</span>
          </div>
        </div>
      </div>
      {/* 하단 액센트 라인 (테마 컬러) */}
      <div style={{
        height: '3px', marginTop: '-1px',
        background: `linear-gradient(90deg, ${theme} 0%, ${theme} 40%, transparent 100%)`,
      }} />
    </div>
    {/* 서브 정보 라인 */}
    <div className="flex items-center justify-between px-1 py-2" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
      <div className="text-[10px]" style={{ color: '#666', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 500 }}>{subText}</div>
      {rightInfo && <div>{rightInfo}</div>}
    </div>
  </>;
}

// Shared editorial footer for test/answer sheets
function EditorialTestFooter({ config, absolutePageNum, isLeftPage, leftMargin, rightMargin }: {
  config: WorkbookConfig; absolutePageNum: number; isLeftPage: boolean; leftMargin: string; rightMargin: string;
}) {
  const themeColor = config.themeColor;
  const secColor = config.secondaryColor || darkenColor(themeColor, 0.15);

  const PageNumeral = () => (
    <div className="flex items-baseline gap-2 flex-shrink-0" style={{ lineHeight: 1 }}>
      <span style={{
        fontFamily: '"Orbitron", "Playfair Display", serif',
        fontWeight: 700, fontSize: '20px', color: themeColor,
        letterSpacing: '-0.02em', lineHeight: 0.85
      }}>{String(absolutePageNum).padStart(2, '0')}</span>
      <span style={{
        fontFamily: '"Orbitron", serif', fontSize: '6.5px',
        color: '#b0b0b0', letterSpacing: '0.4em', fontWeight: 500
      }}>PAGE</span>
    </div>
  );
  const Meta = () => (
    <div className="flex items-center gap-3 min-w-0" style={{ lineHeight: 1 }}>
      <span style={{
        fontFamily: '"Orbitron", serif', fontWeight: 700, fontSize: '8px',
        color: '#9a9a9a', letterSpacing: '0.42em', whiteSpace: 'nowrap'
      }}>ORUN&nbsp;·&nbsp;ENGLISH</span>
      <span style={{ width: '3px', height: '3px', background: `${themeColor}70`, transform: 'rotate(45deg)', display: 'inline-block' }} />
      <span style={{
        fontFamily: '"Noto Sans KR", sans-serif', fontSize: '8.5px',
        color: '#b8b8b8', letterSpacing: '0.05em', whiteSpace: 'nowrap'
      }}>{getTitleWithoutSchool(config.title)}</span>
    </div>
  );
  return <div className="flex-shrink-0 mb-5 relative" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
    <div style={{
      height: '1px', marginBottom: '8px',
      background: isLeftPage
        ? `linear-gradient(90deg, ${themeColor}70, ${themeColor}20 40%, transparent)`
        : `linear-gradient(90deg, transparent, ${themeColor}20 60%, ${themeColor}70)`
    }} />
    <div className="flex items-end justify-between">
      {isLeftPage ? (<><PageNumeral /><Meta /></>) : (<><Meta /><PageNumeral /></>)}
    </div>
  </div>;
}

// Helper function to calculate meaning practice page count
function getMeaningPracticePageCount(dayGroup: DayGroup): number {
  const wordsPerPage = 20; // 2 columns × 10 words per column
  return Math.ceil(dayGroup.words.length / wordsPerPage);
}

function MeaningPracticeSheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
}) {
  // Shuffle words with seeded randomization based on day name
  const shuffledWords = React.useMemo(() => 
    seededShuffle(dayGroup.words, `meaning-${dayGroup.day}`),
    [dayGroup.words, dayGroup.day]
  );
  
  // Pagination: 20 words per page (2 columns × 10 rows)
  const wordsPerPage = 20;
  const startIdx = pageIndex * wordsPerPage;
  const endIdx = Math.min(startIdx + wordsPerPage, shuffledWords.length);
  const words = shuffledWords.slice(startIdx, endIdx);
  const totalPages = getMeaningPracticePageCount(dayGroup);
  
  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;

  // Calculate rows per column for 2-column layout (10 words per column)
  const columns = 2;
  const rowsPerColumn = 10;

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="test" style={{
    width: '840px',
    height: '1188px',
    backgroundColor: '#fefdfb'
  }}>
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <TestSheetDecorations config={config} />
      
      <EditorialTestHeader
        config={config}
        leftMargin={leftMargin}
        rightMargin={rightMargin}
        testType="MEANING"
        subText={<>영어 단어와 뜻을 <strong>두 번씩</strong> 쓰세요 {totalPages > 1 && <span style={{ color: config.secondaryColor }}>({pageIndex + 1}/{totalPages})</span>}</>}
        dayLabel={dayGroup.day}
        rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{startIdx + 1}-{endIdx} / {shuffledWords.length} WORDS</span><span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span></div>}
      />

      {/* Test Content - 2 columns with 10 words each, 3 answer lines per word */}
      <div className="flex-1 py-2 px-1" style={{
        marginLeft: leftMargin,
        marginRight: rightMargin
      }}>
        <div className="grid grid-cols-2 gap-4 h-full">
          {[0, 1].map(colIdx => (
            <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
              border: `1px solid ${config.themeColor}15`,
              background: '#ffffff'
            }}>
              {/* Column header */}
              <div className="py-2 px-3 flex items-center justify-between flex-shrink-0" style={{
                background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
                borderBottom: `1px solid ${config.secondaryColor}25`
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{
                    background: config.secondaryColor
                  }}>
                    <span className="text-[10px] font-bold text-white">{colIdx + 1}</span>
                  </div>
                  <span className="text-[10px] font-semibold" style={{
                    color: config.themeColor,
                    fontFamily: '"Playfair Display", serif'
                  }}>
                    {String(startIdx + colIdx * rowsPerColumn + 1).padStart(2, '0')}
                    <span style={{ color: '#999' }}> — </span>
                    {String(startIdx + (colIdx + 1) * rowsPerColumn).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Questions - each word with 3 answer lines */}
              <div className="flex-1 flex flex-col px-2 py-1 overflow-hidden">
                {Array.from({ length: rowsPerColumn }).map((_, idx) => {
                  const wordIdx = colIdx * rowsPerColumn + idx;
                  const word = words[wordIdx];
                  const globalWordNum = startIdx + wordIdx + 1;
                  
                  if (!word) return null;
                  
                  return (
                    <div key={word.id} className="flex flex-col py-1 flex-1" style={{
                      borderBottom: idx < rowsPerColumn - 1 && words[wordIdx + 1] ? `1px solid ${config.themeColor}08` : 'none'
                    }}>
                      {/* Number row */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[17px] font-bold w-6 text-right flex-shrink-0" style={{
                          color: config.secondaryColor,
                          fontFamily: '"Playfair Display", serif'
                        }}>
                          {String(globalWordNum).padStart(2, '0')}
                        </span>
                        <span className="text-[17px] font-semibold" style={{
                          color: '#000000',
                          fontFamily: '"Noto Sans", sans-serif'
                        }}>
                          {word.word}
                        </span>
                      </div>
                      
                      {/* 2 rows: each row has word line + meaning line */}
                      <div className="flex flex-col gap-1 ml-6 flex-1 justify-evenly">
                        {[1, 2].map(lineNum => (
                          <div key={lineNum} className="flex items-end gap-1.5">
                            <span className="text-[12px] w-3 flex-shrink-0" style={{ color: '#bbb' }}>
                              {lineNum}
                            </span>
                            {/* Word writing line */}
                            <div className="flex-1 h-4 relative">
                              <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
                                background: `linear-gradient(90deg, ${config.themeColor}40 0%, ${config.themeColor}20 100%)`
                              }} />
                            </div>
                            <span className="text-[7px] flex-shrink-0 mx-1" style={{ color: '#ccc' }}>:</span>
                            {/* Meaning writing line */}
                            <div className="flex-1 h-4 relative">
                              <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
                                background: `linear-gradient(90deg, ${config.secondaryColor}40 0%, ${config.secondaryColor}20 100%)`
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
    </div>;
}

// Test Sheet Type 2: Spelling Test (English definition + first letter → complete word, ALL words)
function SpellingTestSheet({
  dayGroup,
  config,
  absolutePageNum
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
}) {
  // Shuffle words with seeded randomization based on day name (different seed from meaning)
  const shuffledWords = React.useMemo(() => 
    seededShuffle(dayGroup.words, `spelling-${dayGroup.day}`),
    [dayGroup.words, dayGroup.day]
  );
  const words = shuffledWords;
  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;

  // Calculate rows per column for 3-column layout (all words)
  const columns = 3;
  const rowsPerColumn = Math.ceil(words.length / columns);
  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="test" style={{
    width: '840px',
    height: '1188px',
    backgroundColor: '#fefdfb'
  }}>
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <TestSheetDecorations config={config} />
      
      <EditorialTestHeader
        config={config}
        leftMargin={leftMargin}
        rightMargin={rightMargin}
        testType="SPELLING"
        subText="영영풀이와 첫 글자를 보고 영단어를 완성하세요"
        dayLabel={dayGroup.day}
        rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{words.length} WORDS</span><span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span></div>}
      />

      {/* Test Content - 3-column layout with all words */}
      <div className="flex-1 py-2 px-1" style={{
        marginLeft: leftMargin,
        marginRight: rightMargin
      }}>
        <div className="grid grid-cols-3 gap-1.5 h-full">
          {[0, 1, 2].map(colIdx => (
            <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
              border: `1px solid ${config.secondaryColor}15`,
              background: '#ffffff'
            }}>
              {/* Column header */}
              <div className="py-1.5 px-2 flex items-center justify-between flex-shrink-0" style={{
                background: `linear-gradient(180deg, ${config.secondaryColor}08 0%, transparent 100%)`,
                borderBottom: `1px solid ${config.themeColor}25`
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{
                    background: config.themeColor
                  }}>
                    <span className="text-[8px] font-bold text-white">{colIdx + 1}</span>
                  </div>
                  <span className="text-[8px] font-semibold" style={{
                    color: config.secondaryColor,
                    fontFamily: '"Playfair Display", serif'
                  }}>
                    {colIdx === 0 ? '01' : colIdx === 1 ? String(rowsPerColumn + 1).padStart(2, '0') : String(rowsPerColumn * 2 + 1).padStart(2, '0')}
                    <span style={{ color: '#999' }}> — </span>
                    {colIdx === 0 ? String(Math.min(rowsPerColumn, words.length)).padStart(2, '0') : 
                     colIdx === 1 ? String(Math.min(rowsPerColumn * 2, words.length)).padStart(2, '0') : 
                     String(words.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div className="flex-1 flex flex-col px-1.5 py-0.5 overflow-hidden">
                {Array.from({ length: rowsPerColumn }).map((_, idx) => {
                  const wordIdx = colIdx * rowsPerColumn + idx;
                  const word = words[wordIdx];
                  const wordNum = wordIdx + 1;
                  
                  if (!word) return null;
                  
                  const firstLetter = word.word.charAt(0).toLowerCase();
                  const englishDef = word.englishDefinition || 'Definition not available';
                  
                  return (
                    <div key={word.id} className="flex flex-col py-0.5 flex-1" style={{
                      borderBottom: idx < rowsPerColumn - 1 && words[wordIdx + 1] ? `1px solid ${config.secondaryColor}08` : 'none'
                    }}>
                      {/* Number + Definition */}
                      <div className="flex items-start gap-1.5">
                        <span className="text-[12px] font-bold w-5 text-right flex-shrink-0 pt-0.5" style={{
                          color: config.themeColor,
                          fontFamily: '"Playfair Display", serif'
                        }}>
                          {String(wordNum).padStart(2, '0')}
                        </span>
                        <span className="text-[12px] leading-tight italic flex-1" style={{
                          color: '#555',
                          fontFamily: 'Georgia, serif',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {englishDef}
                        </span>
                      </div>
                      
                      {/* First letter hint + answer line */}
                      <div className="flex items-center gap-1 ml-5 mt-0.5">
                        <span className="text-[17px] font-bold" style={{
                          color: '#000000',
                          fontFamily: '"Playfair Display", serif'
                        }}>
                          {firstLetter}
                        </span>
                        <div className="flex-1 h-3 relative">
                          <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
                            background: `linear-gradient(90deg, ${config.secondaryColor}40 0%, ${config.secondaryColor}10 100%)`
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
    </div>;
}

// Helper to generate word relation test questions from synonyms/antonyms
interface WordRelationQuestion {
  examplePair: { word1: string; word2: string; isAntonym: boolean };
  pairs: { word1: string; word2: string; isSameRelation: boolean; meaning1?: string; meaning2?: string }[];
  correctCount: number;
}

function generateWordRelationQuestions(dayGroup: DayGroup, seed: string): WordRelationQuestion[] {
  // Collect all synonym and antonym pairs from the day's words
  const synonymPairs: { word1: string; word2: string; meaning1?: string; meaning2?: string }[] = [];
  const antonymPairs: { word1: string; word2: string; meaning1?: string; meaning2?: string }[] = [];
  
  dayGroup.words.forEach(word => {
    const wordMeaning = word.meaning?.split(',')[0]?.split(';')[0]?.trim();
    
    // Add synonyms
    if (word.synonyms && word.synonyms.length > 0) {
      word.synonyms.forEach((syn, idx) => {
        if (syn && syn.trim()) {
          const synKorean = word.synonymsKorean?.[idx] || '';
          synonymPairs.push({ 
            word1: word.word, 
            word2: syn.trim(),
            meaning1: wordMeaning,
            meaning2: synKorean
          });
        }
      });
    }
    
    // Add antonyms
    if (word.antonyms && word.antonyms.length > 0) {
      word.antonyms.forEach((ant, idx) => {
        if (ant && ant.trim()) {
          const antKorean = word.antonymsKorean?.[idx] || '';
          antonymPairs.push({ 
            word1: word.word, 
            word2: ant.trim(),
            meaning1: wordMeaning,
            meaning2: antKorean
          });
        }
      });
    }
  });
  
  // Need at least 1 synonym pair AND 1 antonym pair to create a question
  if (synonymPairs.length < 1 || antonymPairs.length < 1) {
    return [];
  }
  
  const questions: WordRelationQuestion[] = [];
  const shuffledSynonyms = seededShuffle(synonymPairs, `rel-syn-${seed}`);
  const shuffledAntonyms = seededShuffle(antonymPairs, `rel-ant-${seed}`);
  
  // All pairs that need to be used at least once
  const allSynPairs = [...shuffledSynonyms];
  const allAntPairs = [...shuffledAntonyms];
  const totalPairs = allSynPairs.length + allAntPairs.length;
  
  // Track used pairs (by index) to avoid duplicates across questions
  const usedSynIndices = new Set<number>();
  const usedAntIndices = new Set<number>();
  
  // Calculate number of questions: 1 if few pairs, 2-3 if many
  // Each question uses ~9 pairs max, so:
  // - 1 question: up to 9 pairs total
  // - 2 questions: 10-18 pairs
  // - 3 questions: 19+ pairs
  const numQuestions = totalPairs <= 9 ? 1 : totalPairs <= 18 ? 2 : 3;
  
  // Distribute pairs across questions evenly
  const pairsPerQuestion = Math.ceil(totalPairs / numQuestions);
  const synPairsPerQ = Math.ceil(allSynPairs.length / numQuestions);
  const antPairsPerQ = Math.ceil(allAntPairs.length / numQuestions);
  
  for (let qIdx = 0; qIdx < numQuestions; qIdx++) {
    // Get unused synonym pairs for this question
    const synStartIdx = qIdx * synPairsPerQ;
    const synEndIdx = Math.min(synStartIdx + synPairsPerQ, allSynPairs.length);
    const synPairsForQ = allSynPairs.slice(synStartIdx, synEndIdx);
    
    // Get unused antonym pairs for this question
    const antStartIdx = qIdx * antPairsPerQ;
    const antEndIdx = Math.min(antStartIdx + antPairsPerQ, allAntPairs.length);
    const antPairsForQ = allAntPairs.slice(antStartIdx, antEndIdx);
    
    // Skip if no pairs available for this question
    if (synPairsForQ.length === 0 && antPairsForQ.length === 0) continue;
    
    // Need at least 1 of each type to make a meaningful question
    if (synPairsForQ.length < 1 || antPairsForQ.length < 1) {
      // If we can't make a balanced question, skip
      continue;
    }
    
    // Decide example type: alternate between synonym and antonym examples
    const useSynonymAsExample = qIdx % 2 === 0 ? synPairsForQ.length >= antPairsForQ.length : antPairsForQ.length < 1;
    const isAntonymExample = !useSynonymAsExample;
    
    // Get example pair (first from the appropriate pool)
    const examplePool = isAntonymExample ? antPairsForQ : synPairsForQ;
    const examplePair = examplePool[0];
    
    // Remaining pairs for choices (exclude example)
    const remainingSamePairs = examplePool.slice(1);
    const oppositePool = isAntonymExample ? synPairsForQ : antPairsForQ;
    
    // Build pairs: same relation (correct answers) + opposite relation (wrong answers)
    const allPairs = [
      ...remainingSamePairs.map(p => ({ ...p, isSameRelation: true })),
      ...oppositePool.map(p => ({ ...p, isSameRelation: false }))
    ];
    
    // Shuffle and limit to 9 pairs max
    const shuffledPairs = seededShuffle(allPairs, `rel-q${qIdx}-${seed}`);
    const finalPairs = shuffledPairs.slice(0, 9);
    const correctCount = finalPairs.filter(p => p.isSameRelation).length;
    
    // Accept question only if it has at least 1 correct answer
    if (correctCount >= 1 && finalPairs.length >= 2) {
      questions.push({
        examplePair: { 
          word1: examplePair.word1, 
          word2: examplePair.word2, 
          isAntonym: isAntonymExample 
        },
        pairs: finalPairs,
        correctCount
      });
    }
  }
  
  return questions;
}

// Word Relation Test Component
function WordRelationTestSection({
  questions,
  config,
  startNumber = 1
}: {
  questions: WordRelationQuestion[];
  config: WorkbookConfig;
  startNumber?: number;
}) {
  if (questions.length === 0) return null;
  
  const choiceSymbols = ['①', '②', '③', '④', '⑤'];
  
  return (
    <div className="flex flex-col gap-3 h-full">
      {questions.map((q, qIdx) => {
        // Generate answer choices based on pairs count
        // For fewer pairs, use smaller range (0~4), for more pairs use larger range (3~7 or higher)
        const pairsCount = q.pairs.length;
        const baseMin = pairsCount <= 5 ? 0 : Math.max(0, q.correctCount - 2);
        const baseMax = pairsCount <= 5 ? Math.min(4, pairsCount) : Math.min(pairsCount, q.correctCount + 2);
        
        const choices: number[] = [];
        // Make sure correctCount is within our range
        const adjustedMin = Math.min(baseMin, q.correctCount);
        const adjustedMax = Math.max(baseMax, q.correctCount);
        
        for (let i = adjustedMin; choices.length < 5 && i <= adjustedMax; i++) {
          choices.push(i);
        }
        // Fill remaining slots if needed
        while (choices.length < 5) {
          if (choices[0] > 0) choices.unshift(choices[0] - 1);
          else if (choices[choices.length - 1] < pairsCount) choices.push(choices[choices.length - 1] + 1);
          else break;
        }
        
        return (
          <div key={qIdx} className="flex-1 rounded-lg p-2 overflow-hidden" style={{
            background: `linear-gradient(135deg, ${config.themeColor}05 0%, ${config.secondaryColor}05 100%)`,
            border: `1px solid ${config.themeColor}15`
          }}>
            {/* Question header */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.themeColor} 100%)`
              }}>
                <span className="text-[9px] font-bold text-white">R</span>
              </div>
              <span className="text-[10px] font-bold" style={{
                color: config.themeColor,
                fontFamily: '"Noto Sans KR", sans-serif'
              }}>WORD RELATION #{startNumber + qIdx}</span>
            </div>
            
            {/* Question text */}
            <p className="text-[12px] mb-1.5 leading-snug" style={{
              color: '#333',
              fontFamily: '"Noto Sans KR", sans-serif'
            }}>
              두 단어의 관계가 다음과 같은 것은 몇 개인가?
            </p>
            
            {/* Example pair (보기) */}
            <div className="px-2 py-1 rounded mb-1.5" style={{
              background: `${config.secondaryColor}15`,
              border: `1px solid ${config.secondaryColor}30`
            }}>
              <span className="text-[11px] font-medium mr-1" style={{ color: config.secondaryColor }}>
                &lt;보기&gt;
              </span>
              <span className="text-[13px] font-bold" style={{
                color: config.themeColor,
                fontFamily: '"Noto Sans", sans-serif'
              }}>
                {q.examplePair.word1} - {q.examplePair.word2}
              </span>
            </div>
            
            {/* Word pairs - 2 columns layout to save space */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mb-1.5">
              {q.pairs.map((pair, pIdx) => (
                <div key={pIdx} className="flex items-center py-0.5 px-1" style={{
                  borderBottom: `1px solid ${config.themeColor}08`
                }}>
                  <span className="text-[12px] font-medium" style={{ 
                    color: '#444',
                    fontFamily: '"Noto Sans", sans-serif',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {pair.word1} - {pair.word2}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Answer choices - spread across full width */}
            <div className="flex items-center justify-between pt-1 px-1" style={{
              borderTop: `1px solid ${config.themeColor}15`
            }}>
              {choices.map((num, cIdx) => (
                <span key={cIdx} className="text-[13px]" style={{ 
                  color: config.themeColor,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}>
                  {choiceSymbols[cIdx]} {num}개
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Test Sheet Type 3: Sentence Fill Test (English example with blank + Korean translation → complete the word)
// Returns an array of pages to allow multi-page rendering
function SentenceFillTestSheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
}) {
  // Filter words that have examples, then shuffle
  const allWordsWithExamples = React.useMemo(() => {
    const filtered = dayGroup.words.filter(w => w.examples && w.examples.length > 0);
    return seededShuffle(filtered, `sentence-${dayGroup.day}`);
  }, [dayGroup.words, dayGroup.day]);

  // Items per page - 2 columns with 10 items each = 20 per page
  const ITEMS_PER_COLUMN = 10;
  const ITEMS_PER_PAGE = ITEMS_PER_COLUMN * 2;
  const totalPages = Math.ceil(allWordsWithExamples.length / ITEMS_PER_PAGE);
  
  // Get words for this specific page
  const startIdx = pageIndex * ITEMS_PER_PAGE;
  const wordsForThisPage = allWordsWithExamples.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  
  // Split into two columns
  const leftColumnWords = wordsForThisPage.slice(0, ITEMS_PER_COLUMN);
  const rightColumnWords = wordsForThisPage.slice(ITEMS_PER_COLUMN);
  
  // Generate word relation questions (only on last page if right column has space AND not too many questions)
  const wordRelationQuestions = React.useMemo(() => {
    // Only show on the last sentence fill page for this day
    const isLastPage = pageIndex === totalPages - 1;
    if (!isLastPage) return [];
    
    const allQuestions = generateWordRelationQuestions(dayGroup, dayGroup.day);
    if (allQuestions.length === 0) return [];
    
    // Check if right column has empty slots (less than 10 items)
    const rightColumnEmptySlots = ITEMS_PER_COLUMN - rightColumnWords.length;
    if (rightColumnEmptySlots < 4) return []; // Need at least 4 empty slots for 1 question
    
    // If 3+ questions, they won't fit inline - use separate page instead
    if (allQuestions.length >= 3) return [];
    
    // Check if questions fit in available space (each question needs ~4 slots)
    const slotsNeeded = allQuestions.length * 4;
    if (slotsNeeded > rightColumnEmptySlots) return [];
    
    return allQuestions;
  }, [dayGroup, pageIndex, totalPages, rightColumnWords.length]);
  
  // Determine how many right column items to show based on relation questions
  const showRelationSection = wordRelationQuestions.length > 0;
  const rightColumnItemsToShow = showRelationSection 
    ? Math.min(rightColumnWords.length, ITEMS_PER_COLUMN - (wordRelationQuestions.length * 4))
    : rightColumnWords.length;
  const displayedRightColumnWords = rightColumnWords.slice(0, rightColumnItemsToShow);
  
  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;

  // Helper function to escape regex special characters
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Helper function to create blanked sentence with first letter hint
  const createBlankedSentence = (sentence: string, word: string) => {
    const sentenceLower = sentence.toLowerCase();
    
    // Common "filler" words that shouldn't be blanked when better options exist
    const commonWords = new Set(['have', 'has', 'had', 'be', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'get', 'gets', 'got', 'do', 'does', 'did', 'make', 'makes', 'made', 'can', 'will', 'would', 'should', 'could', 'may', 'might', 'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from', 'it', 'not']);
    
    // Check if this is a pattern-based word (contains placeholders like A, B, -ing, do, etc.)
    const isPatternWord = /\b[AB]\b|\?ing|-ing\b|\bdo\b|\bdoing\b|\(in\)/.test(word);
    
    if (isPatternWord) {
      // Strip placeholder tokens to get core words
      let cleaned = word
        .replace(/\(in\)/g, '')
        .replace(/\?ing/g, '')
        .replace(/-ing\b/g, '')
        .replace(/\bto do\b/g, '')
        .replace(/\bdo\b/g, '')
        .replace(/\bdoing\b/g, '')
        .replace(/\b[AB]\b/g, '')
        .trim();
      
      // Get remaining meaningful words
      const coreWords = cleaned.split(/\s+/).filter(w => w.length > 0);
      
      // Sort: prefer distinctive (non-common) words, then longer words
      const sortedWords = [...coreWords].sort((a, b) => {
        const aCommon = commonWords.has(a.toLowerCase());
        const bCommon = commonWords.has(b.toLowerCase());
        if (aCommon !== bCommon) return aCommon ? 1 : -1;
        return b.length - a.length;
      });
      
      // Try to find and blank the best core word in the sentence
      for (const coreWord of sortedWords) {
        const coreWordLower = coreWord.toLowerCase();
        const variations = [
          coreWordLower,
          coreWordLower + 's',
          coreWordLower + 'es',
          coreWordLower + 'ed',
          coreWordLower + 'ing',
          coreWordLower + 'er',
          coreWordLower + 'est',
          coreWordLower + 'ly',
          coreWordLower.replace(/e$/, 'ing'),
          coreWordLower.replace(/e$/, 'ed'),
          coreWordLower.replace(/y$/, 'ied'),
          coreWordLower.replace(/y$/, 'ies'),
          coreWordLower.replace(/([^aeiou])$/, '$1$1ing'),
          coreWordLower.replace(/([^aeiou])$/, '$1$1ed'),
        ];
        
        for (const variation of variations) {
          const escaped = escapeRegex(variation);
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          const match = sentence.match(regex);
          if (match && match.index !== undefined) {
            return {
              before: sentence.substring(0, match.index),
              blank: '_'.repeat(Math.max(match[0].length - 1, 3)),
              after: sentence.substring(match.index + match[0].length),
              firstLetter: match[0].charAt(0).toLowerCase(),
              blankLength: match[0].length
            };
          }
        }
      }
      
      // Fallback: try any core word even if common
      for (const coreWord of coreWords) {
        const escaped = escapeRegex(coreWord.toLowerCase());
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        const match = sentence.match(regex);
        if (match && match.index !== undefined) {
          return {
            before: sentence.substring(0, match.index),
            blank: '_'.repeat(Math.max(match[0].length - 1, 3)),
            after: sentence.substring(match.index + match[0].length),
            firstLetter: match[0].charAt(0).toLowerCase(),
            blankLength: match[0].length
          };
        }
      }
    }
    
    // Standard word matching (non-pattern words)
    const wordLower = word.toLowerCase();
    const wordVariations = [
      wordLower,
      wordLower + 's',
      wordLower + 'es',
      wordLower + 'ed',
      wordLower + 'ing',
      wordLower + 'er',
      wordLower + 'est',
      wordLower + 'ly',
      wordLower.replace(/e$/, 'ing'),
      wordLower.replace(/y$/, 'ied'),
      wordLower.replace(/y$/, 'ies'),
      wordLower.replace(/([^aeiou])$/, '$1$1ing'),
      wordLower.replace(/([^aeiou])$/, '$1$1ed'),
    ];
    
    // For multi-word phrases (not pattern words), try the full phrase first
    if (word.includes(' ') && !isPatternWord) {
      const escaped = escapeRegex(wordLower);
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      const match = sentence.match(regex);
      if (match && match.index !== undefined) {
        return {
          before: sentence.substring(0, match.index),
          blank: '_'.repeat(Math.max(match[0].length - 1, 3)),
          after: sentence.substring(match.index + match[0].length),
          firstLetter: match[0].charAt(0).toLowerCase(),
          blankLength: match[0].length
        };
      }
    }
    
    // Find which variation is in the sentence
    let foundWord = '';
    let foundIndex = -1;
    
    for (const variation of wordVariations) {
      const escapedVariation = escapeRegex(variation);
      const regex = new RegExp(`\\b${escapedVariation}\\b`, 'i');
      const match = sentence.match(regex);
      if (match && match.index !== undefined) {
        foundWord = match[0];
        foundIndex = match.index;
        break;
      }
    }
    
    if (foundIndex === -1) {
      return {
        before: sentence,
        blank: '',
        after: '',
        firstLetter: word.charAt(0).toLowerCase(),
        blankLength: word.length
      };
    }
    
    return {
      before: sentence.substring(0, foundIndex),
      blank: '_'.repeat(Math.max(foundWord.length - 1, 3)),
      after: sentence.substring(foundIndex + foundWord.length),
      firstLetter: foundWord.charAt(0).toLowerCase(),
      blankLength: foundWord.length
    };
  };
  
  if (wordsForThisPage.length === 0) {
    return null;
  }

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="sentence-test" style={{
    width: '840px',
    height: '1188px',
    backgroundColor: '#fefdfb'
  }}>
    {/* Subtle background texture */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <TestSheetDecorations config={config} />
    
    <EditorialTestHeader
      config={config}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
      testType="SENTENCE"
      subText="예문과 우리말 해석을 보고 빈칸에 알맞은 단어를 쓰세요"
      dayLabel={dayGroup.day}
      rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{totalPages > 1 ? `${pageIndex + 1}/${totalPages} · ` : ''}{allWordsWithExamples.length} 문제</span><span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span></div>}
    />

    {/* Test Content - 2 column layout with 10 items each */}
    <div className="flex-1 py-2 px-1" style={{
      marginLeft: leftMargin,
      marginRight: rightMargin
    }}>
      <div className="flex gap-2 h-full">
        {/* Left Column - always full sentence fill */}
        <div className="flex-1 flex flex-col rounded-lg overflow-hidden" style={{
          border: `1px solid ${config.themeColor}15`,
          background: '#ffffff'
        }}>
          {/* Column header */}
          <div className="py-1.5 px-3 flex items-center justify-between flex-shrink-0" style={{
            background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
            borderBottom: `1px solid ${config.secondaryColor}25`
          }}>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{
                background: config.secondaryColor
              }}>
                <span className="text-[8px] font-bold text-white">A</span>
              </div>
              <span className="text-[9px] font-semibold" style={{
                color: config.themeColor,
                fontFamily: '"Playfair Display", serif'
              }}>
                {leftColumnWords.length > 0 ? (
                  <>
                    {String(startIdx + 1).padStart(2, '0')}
                    <span style={{ color: '#999' }}> — </span>
                    {String(startIdx + leftColumnWords.length).padStart(2, '0')}
                  </>
                ) : '-'}
              </span>
            </div>
          </div>

          {/* Questions - fixed height distribution */}
          <div className="flex-1 flex flex-col px-2 py-1">
            {Array.from({ length: ITEMS_PER_COLUMN }).map((_, idx) => {
              const word = leftColumnWords[idx];
              const wordNum = startIdx + idx + 1;
              
              if (!word) {
                return (
                  <div key={`empty-${idx}`} style={{ height: `${100 / ITEMS_PER_COLUMN}%` }} />
                );
              }
              
              if (!word.examples || word.examples.length === 0) {
                return (
                  <div key={word.id} style={{ height: `${100 / ITEMS_PER_COLUMN}%` }} />
                );
              }
              
              const example = word.examples[0];
              const blanked = createBlankedSentence(example.english, word.word);
              
              return (
                <div key={word.id} className="flex flex-col py-1" style={{
                  height: `${100 / ITEMS_PER_COLUMN}%`,
                  borderBottom: idx < ITEMS_PER_COLUMN - 1 ? `1px solid ${config.themeColor}08` : 'none'
                }}>
                  {/* Number + English sentence with blank */}
                  <div className="flex items-start gap-1">
                    <span className="text-[13px] font-bold w-5 text-right flex-shrink-0" style={{
                      color: config.secondaryColor,
                      fontFamily: '"Playfair Display", serif'
                    }}>
                      {String(wordNum).padStart(2, '0')}
                    </span>
                    <div className="flex-1 text-[12px] leading-tight" style={{
                      color: '#333',
                      fontFamily: '"Noto Sans", sans-serif',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {blanked.before}
                      <span className="font-bold" style={{ color: '#000000' }}>
                        {blanked.firstLetter}
                      </span>
                      <span style={{ 
                        borderBottom: `1px solid ${config.secondaryColor}`,
                        minWidth: '30px',
                        display: 'inline-block',
                        letterSpacing: '0.15em'
                      }}>
                        {' '.repeat(blanked.blankLength)}
                      </span>
                      {blanked.after}
                    </div>
                  </div>
                  
                  {/* Korean translation */}
                  <div className="ml-5 mt-0.5">
                    <span className="text-[11px]" style={{
                      color: '#666',
                      fontFamily: '"Noto Sans KR", sans-serif'
                    }}>
                      → {example.korean}
                    </span>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - sentence fill + optional word relation test */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Right Column Sentence Fill (partial or full) */}
          {displayedRightColumnWords.length > 0 && (
            <div className="flex flex-col rounded-lg overflow-hidden" style={{
              border: `1px solid ${config.themeColor}15`,
              background: '#ffffff',
              flex: showRelationSection ? `0 0 ${(displayedRightColumnWords.length / ITEMS_PER_COLUMN) * 100}%` : '1'
            }}>
              {/* Column header */}
              <div className="py-1.5 px-3 flex items-center justify-between flex-shrink-0" style={{
                background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
                borderBottom: `1px solid ${config.secondaryColor}25`
              }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{
                    background: config.secondaryColor
                  }}>
                    <span className="text-[8px] font-bold text-white">B</span>
                  </div>
                  <span className="text-[9px] font-semibold" style={{
                    color: config.themeColor,
                    fontFamily: '"Playfair Display", serif'
                  }}>
                    {displayedRightColumnWords.length > 0 ? (
                      <>
                        {String(startIdx + ITEMS_PER_COLUMN + 1).padStart(2, '0')}
                        <span style={{ color: '#999' }}> — </span>
                        {String(startIdx + ITEMS_PER_COLUMN + displayedRightColumnWords.length).padStart(2, '0')}
                      </>
                    ) : '-'}
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div className="flex-1 flex flex-col px-2 py-1">
                {displayedRightColumnWords.map((word, idx) => {
                  const wordNum = startIdx + ITEMS_PER_COLUMN + idx + 1;
                  
                  if (!word.examples || word.examples.length === 0) {
                    return (
                      <div key={word.id} style={{ height: `${100 / displayedRightColumnWords.length}%` }} />
                    );
                  }
                  
                  const example = word.examples[0];
                  const blanked = createBlankedSentence(example.english, word.word);
                  
                  return (
                    <div key={word.id} className="flex flex-col py-1" style={{
                      height: `${100 / displayedRightColumnWords.length}%`,
                      borderBottom: idx < displayedRightColumnWords.length - 1 ? `1px solid ${config.themeColor}08` : 'none'
                    }}>
                      {/* Number + English sentence with blank */}
                      <div className="flex items-start gap-1">
                        <span className="text-[13px] font-bold w-5 text-right flex-shrink-0" style={{
                          color: config.secondaryColor,
                          fontFamily: '"Playfair Display", serif'
                        }}>
                          {String(wordNum).padStart(2, '0')}
                        </span>
                        <div className="flex-1 text-[12px] leading-tight" style={{
                          color: '#333',
                          fontFamily: '"Noto Sans", sans-serif',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {blanked.before}
                          <span className="font-bold" style={{ color: '#000000' }}>
                            {blanked.firstLetter}
                          </span>
                          <span style={{ 
                            borderBottom: `1px solid ${config.secondaryColor}`,
                            minWidth: '30px',
                            display: 'inline-block',
                            letterSpacing: '0.15em'
                          }}>
                            {' '.repeat(blanked.blankLength)}
                          </span>
                          {blanked.after}
                        </div>
                      </div>
                      
                      {/* Korean translation */}
                      <div className="ml-5 mt-0.5">
                        <span className="text-[11px]" style={{
                          color: '#666',
                          fontFamily: '"Noto Sans KR", sans-serif'
                        }}>
                          → {example.korean}
                        </span>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Word Relation Test Section (if space available) */}
          {showRelationSection && (
            <div className="flex-1">
              <WordRelationTestSection 
                questions={wordRelationQuestions} 
                config={config}
              />
            </div>
          )}
          
          {/* Empty placeholder if no right column content at all */}
          {!displayedRightColumnWords.length && !showRelationSection && (
            <div className="flex-1 rounded-lg" style={{
              border: `1px solid ${config.themeColor}15`,
              background: '#ffffff'
            }} />
          )}
        </div>
      </div>
    </div>

    <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
  </div>;
}

// Helper to calculate number of sentence fill pages for a day group
function getSentenceFillPageCount(dayGroup: DayGroup): number {
  const wordsWithExamples = dayGroup.words.filter(w => w.examples && w.examples.length > 0);
  if (wordsWithExamples.length === 0) return 0;
  // 2 columns x 10 items = 20 items per page
  return Math.ceil(wordsWithExamples.length / 20);
}

// Helper to check if word relation needs a separate page
function needsSeparateWordRelationPage(dayGroup: DayGroup): boolean {
  const wordsWithExamples = dayGroup.words.filter(w => w.examples && w.examples.length > 0);
  if (wordsWithExamples.length === 0) return false;
  
  const questions = generateWordRelationQuestions(dayGroup, dayGroup.day);
  if (questions.length === 0) return false;
  
  const ITEMS_PER_PAGE = 20;
  const ITEMS_PER_COLUMN = 10;
  const lastPageItems = wordsWithExamples.length % ITEMS_PER_PAGE || ITEMS_PER_PAGE;
  const rightColumnItems = lastPageItems > ITEMS_PER_COLUMN ? lastPageItems - ITEMS_PER_COLUMN : 0;
  const rightColumnEmptySlots = ITEMS_PER_COLUMN - rightColumnItems;
  
  if (rightColumnEmptySlots < 4) return true;
  if (questions.length >= 3) return true;
  const slotsNeeded = questions.length * 4;
  if (slotsNeeded > rightColumnEmptySlots) return true;
  
  return false;
}

// Standalone Word Relation Page
function WordRelationPage({
  dayGroup,
  config,
  absolutePageNum
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
}) {
  const questions = React.useMemo(() => {
    return generateWordRelationQuestions(dayGroup, dayGroup.day);
  }, [dayGroup]);
  
  if (questions.length === 0) return null;
  
  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const bgColor = config.themeColor;
  
  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="word-relation-test" style={{
    width: '840px',
    height: '1188px',
    backgroundColor: '#fefdfb'
  }}>
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, ${bgColor} 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <TestSheetDecorations config={config} />

    <EditorialTestHeader
      config={config}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
      testType="RELATION"
      subText="두 단어의 관계가 같은 것은 몇 개인지 고르세요"
      dayLabel={dayGroup.day}
      rightInfo={<span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span>}
    />

    {/* Content */}
    <div className="flex-1 flex flex-col gap-4 px-6 py-6 relative z-10" style={{
      marginLeft: leftMargin,
      marginRight: rightMargin
    }}>
      <WordRelationTestSection 
        questions={questions}
        config={config}
      />
    </div>

    <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
  </div>;
}

// Answer Key Sheet - matches new test sheet layout with dynamic pagination for large word counts
function AnswerKeySheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0,
  totalPages = 1
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
  totalPages?: number;
}) {
  // Use same seeded shuffle as the test sheets for consistent answer order
  const meaningShuffledWords = React.useMemo(() => 
    seededShuffle(dayGroup.words, `meaning-${dayGroup.day}`),
    [dayGroup.words, dayGroup.day]
  );
  const spellingShuffledWords = React.useMemo(() => 
    seededShuffle(dayGroup.words, `spelling-${dayGroup.day}`),
    [dayGroup.words, dayGroup.day]
  );
  const sentenceShuffledWords = React.useMemo(() => {
    const filtered = dayGroup.words.filter(w => w.examples && w.examples.length > 0);
    return seededShuffle(filtered, `sentence-${dayGroup.day}`);
  }, [dayGroup.words, dayGroup.day]);
  
  // Generate word relation questions for answer key
  const wordRelationQuestions = React.useMemo(() => {
    return generateWordRelationQuestions(dayGroup, dayGroup.day);
  }, [dayGroup]);
  
  const hasSentenceTest = sentenceShuffledWords.length > 0;
  const hasWordRelation = wordRelationQuestions.length > 0;
  const isLeftPage = absolutePageNum % 2 === 0;

  // Binding margin
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;

  // Adaptive layout based on word count
  const wordCount = dayGroup.words.length;
  const isLargeWordCount = wordCount > 30;
  const isVeryLargeWordCount = wordCount > 50;
  
  // Dynamic column and row calculation for large word counts
  const columns = isVeryLargeWordCount ? 4 : (isLargeWordCount ? 4 : 3);
  const maxRowsPerColumn = isVeryLargeWordCount ? 18 : (isLargeWordCount ? 14 : 12);
  const rowsPerColumn = Math.min(maxRowsPerColumn, Math.ceil(meaningShuffledWords.length / columns));
  const sentenceRowsPerColumn = Math.ceil(sentenceShuffledWords.length / 2);
  
  // Calculate items per page and slice data for current page
  const itemsPerSection = columns * rowsPerColumn;
  const meaningStartIdx = pageIndex * itemsPerSection;
  const meaningEndIdx = Math.min(meaningStartIdx + itemsPerSection, meaningShuffledWords.length);
  const spellingStartIdx = pageIndex * itemsPerSection;
  const spellingEndIdx = Math.min(spellingStartIdx + itemsPerSection, spellingShuffledWords.length);
  
  const currentMeaningWords = meaningShuffledWords.slice(meaningStartIdx, meaningEndIdx);
  const currentSpellingWords = spellingShuffledWords.slice(spellingStartIdx, spellingEndIdx);
  
  // Calculate actual rows needed for this page
  const currentMeaningRowsPerColumn = Math.ceil(currentMeaningWords.length / columns);
  const currentSpellingRowsPerColumn = Math.ceil(currentSpellingWords.length / columns);
  
  // Calculate answer choice symbols
  const choiceSymbols = ['①', '②', '③', '④', '⑤'];
  
  // Font sizes based on word count
  const wordFontSize = isVeryLargeWordCount ? '8px' : (isLargeWordCount ? '9px' : '9px');
  const meaningFontSize = isVeryLargeWordCount ? '7px' : (isLargeWordCount ? '8px' : '8px');
  const numberFontSize = isVeryLargeWordCount ? '6px' : (isLargeWordCount ? '7px' : '8px');

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="answer" style={{
    width: '840px',
    height: '1188px',
    backgroundColor: '#fefdfb'
  }}>
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <TestSheetDecorations config={config} />

      <EditorialTestHeader
        config={config}
        leftMargin={leftMargin}
        rightMargin={rightMargin}
        testType="ANSWER KEY"
        subText={<>채점용 정답지 {totalPages > 1 && `(${pageIndex + 1}/${totalPages})`}</>}
        dayLabel={dayGroup.day}
      />

      {/* Content Area - Four main sections stacked */}
      <div className="flex-1 py-2 flex flex-col gap-1" style={{
        marginLeft: leftMargin,
        marginRight: rightMargin
      }}>
        
        {/* Section 1: MEANING PRACTICE ANSWERS - Dynamic column layout */}
        {currentMeaningWords.length > 0 && (
          <div className="rounded-lg overflow-hidden flex flex-col" style={{
            border: `1px solid ${config.themeColor}15`,
            background: '#ffffff',
            flex: hasWordRelation ? '1 1 25%' : (hasSentenceTest ? '1 1 30%' : '1 1 50%')
          }}>
            {/* Section Header */}
            <div className="px-3 py-1 flex items-center justify-between flex-shrink-0" style={{
              background: `linear-gradient(180deg, ${config.themeColor}10 0%, transparent 100%)`,
              borderBottom: `1px solid ${config.secondaryColor}20`
            }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, ${config.themeColor} 0%, ${config.themeColor}dd 100%)`
                }}>
                  <span className="text-white text-[8px] font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>M</span>
                </div>
                <span className="text-[10px] font-bold" style={{
                  color: config.themeColor,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}>
                  MEANING PRACTICE
                </span>
              </div>
              <span className="text-[8px] px-2 py-0.5 rounded-full" style={{
                background: `${config.themeColor}10`,
                color: config.themeColor
              }}>
                {meaningStartIdx + 1}-{meaningEndIdx} / {meaningShuffledWords.length}단어
              </span>
            </div>
            
            {/* Dynamic column grid */}
            <div className="flex-1 py-1 px-1">
              <div className={`grid gap-1.5 h-full`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <div key={colIdx} className="flex flex-col rounded overflow-hidden" style={{
                    border: `1px solid ${config.themeColor}10`,
                    background: colIdx % 2 === 0 ? `${config.themeColor}02` : 'transparent'
                  }}>
                    {/* Column sub-header */}
                    <div className="py-0.5 px-1 flex items-center justify-center" style={{
                      background: `${config.themeColor}06`,
                      borderBottom: `1px solid ${config.themeColor}10`
                    }}>
                      <span className="text-[6px] font-semibold" style={{
                        color: config.secondaryColor,
                        fontFamily: '"Playfair Display", serif'
                      }}>
                        {String(meaningStartIdx + colIdx * rowsPerColumn + 1).padStart(2, '0')}
                        <span style={{ color: '#bbb' }}> — </span>
                        {String(meaningStartIdx + (colIdx + 1) * rowsPerColumn).padStart(2, '0')}
                      </span>
                    </div>
                    
                    {/* Answers - word: meaning */}
                    <div className="flex-1 flex flex-col px-1 py-0.5">
                      {Array.from({ length: currentMeaningRowsPerColumn }).map((_, idx) => {
                        const localIdx = colIdx * currentMeaningRowsPerColumn + idx;
                        const word = currentMeaningWords[localIdx];
                        if (!word) return null;
                        const globalIdx = meaningStartIdx + localIdx;
                        const simpleMeaning = word.meaning?.split(',')[0]?.split(';')[0]?.trim() || '';
                        return (
                          <div key={word.id} className="flex items-center gap-0.5 py-0.5 flex-1" style={{
                            borderBottom: idx < currentMeaningRowsPerColumn - 1 && currentMeaningWords[localIdx + 1] ? `1px solid ${config.themeColor}06` : 'none'
                          }}>
                            <span className="font-bold text-right flex-shrink-0" style={{
                              fontSize: numberFontSize,
                              width: '14px',
                              color: config.secondaryColor,
                              fontFamily: '"Playfair Display", serif'
                            }}>
                              {String(globalIdx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-semibold flex-shrink-0" style={{
                              fontSize: wordFontSize,
                              color: '#000000',
                              fontFamily: '"Noto Sans", sans-serif'
                            }}>
                              {word.word}
                            </span>
                            <span className="flex-1" style={{
                              fontSize: meaningFontSize,
                              color: '#666',
                              fontFamily: '"Noto Sans KR", sans-serif'
                            }}>
                              {simpleMeaning}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: SPELLING TEST ANSWERS - Dynamic column layout */}
        {currentSpellingWords.length > 0 && (
          <div className="rounded-lg overflow-hidden flex flex-col" style={{
            border: `1px solid ${config.secondaryColor}15`,
            background: '#ffffff',
            flex: hasWordRelation ? '1 1 25%' : (hasSentenceTest ? '1 1 30%' : '1 1 50%')
          }}>
            {/* Section Header */}
            <div className="px-3 py-1 flex items-center justify-between flex-shrink-0" style={{
              background: `linear-gradient(180deg, ${config.secondaryColor}10 0%, transparent 100%)`,
              borderBottom: `1px solid ${config.themeColor}20`
            }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.secondaryColor}dd 100%)`
                }}>
                  <span className="text-white text-[7px] font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>S</span>
                </div>
                <span className="text-[10px] font-bold" style={{
                  color: config.secondaryColor,
                  fontFamily: '"Noto Sans KR", sans-serif'
                }}>
                  SPELLING TEST
                </span>
              </div>
              <span className="text-[7px] px-2 py-0.5 rounded-full" style={{
                background: `${config.secondaryColor}10`,
                color: config.secondaryColor
              }}>
                {spellingStartIdx + 1}-{spellingEndIdx} / {spellingShuffledWords.length}단어
              </span>
            </div>
            
            {/* Dynamic column grid */}
            <div className="flex-1 py-1 px-1">
              <div className={`grid gap-1 h-full`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <div key={colIdx} className="flex flex-col rounded overflow-hidden" style={{
                    border: `1px solid ${config.secondaryColor}10`,
                    background: colIdx % 2 === 0 ? `${config.secondaryColor}02` : 'transparent'
                  }}>
                    {/* Column sub-header */}
                    <div className="py-0.5 px-1 flex items-center justify-center" style={{
                      background: `${config.secondaryColor}06`,
                      borderBottom: `1px solid ${config.secondaryColor}10`
                    }}>
                      <span className="text-[6px] font-semibold" style={{
                        color: config.themeColor,
                        fontFamily: '"Playfair Display", serif'
                      }}>
                        {String(spellingStartIdx + colIdx * currentSpellingRowsPerColumn + 1).padStart(2, '0')}
                        <span style={{ color: '#bbb' }}> — </span>
                        {String(Math.min(spellingStartIdx + (colIdx + 1) * currentSpellingRowsPerColumn, spellingEndIdx)).padStart(2, '0')}
                      </span>
                    </div>
                    
                    {/* Answers - full word spelling */}
                    <div className="flex-1 flex flex-col px-1 py-0.5">
                      {Array.from({ length: currentSpellingRowsPerColumn }).map((_, idx) => {
                        const localIdx = colIdx * currentSpellingRowsPerColumn + idx;
                        const word = currentSpellingWords[localIdx];
                        if (!word) return null;
                        const globalIdx = spellingStartIdx + localIdx;
                        return (
                          <div key={word.id} className="flex items-center gap-0.5 py-0.5 flex-1" style={{
                            borderBottom: idx < currentSpellingRowsPerColumn - 1 && currentSpellingWords[localIdx + 1] ? `1px solid ${config.secondaryColor}06` : 'none'
                          }}>
                            <span className="font-bold text-right flex-shrink-0" style={{
                              fontSize: numberFontSize,
                              width: '14px',
                              color: config.themeColor,
                              fontFamily: '"Playfair Display", serif'
                            }}>
                              {String(globalIdx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-semibold" style={{
                              fontSize: wordFontSize,
                              color: '#000000',
                              fontFamily: '"Noto Sans", sans-serif'
                            }}>
                              {word.word}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3 & 4: SENTENCE FILL + WORD RELATION side by side (only on first page) */}
        {pageIndex === 0 && (hasSentenceTest || hasWordRelation) && (
          <div className="flex gap-2" style={{ flex: '1 1 35%' }}>
            {/* SENTENCE FILL - Left side */}
            {hasSentenceTest && (
              <div className="rounded-lg overflow-hidden flex flex-col" style={{
                border: `1px solid ${config.themeColor}15`,
                background: '#ffffff',
                flex: hasWordRelation ? '1 1 50%' : '1 1 100%'
              }}>
                {/* Section Header */}
                <div className="px-3 py-1 flex items-center justify-between flex-shrink-0" style={{
                  background: `linear-gradient(180deg, ${config.themeColor}10 0%, transparent 100%)`,
                  borderBottom: `1px solid ${config.secondaryColor}20`
                }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg flex items-center justify-center" style={{
                      background: `linear-gradient(135deg, ${config.themeColor} 0%, ${config.themeColor}dd 100%)`
                    }}>
                      <span className="text-white text-[7px] font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>F</span>
                    </div>
                    <span className="text-[9px] font-bold" style={{
                      color: config.themeColor,
                      fontFamily: '"Noto Sans KR", sans-serif'
                    }}>
                      SENTENCE FILL
                    </span>
                  </div>
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{
                    background: `${config.themeColor}10`,
                    color: config.themeColor
                  }}>
                    {sentenceShuffledWords.length}단어
                  </span>
                </div>
                
                {/* 2-column grid matching Sentence Fill Test */}
                <div className="flex-1 py-1 px-1">
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {[0, 1].map(colIdx => (
                      <div key={colIdx} className="flex flex-col rounded overflow-hidden" style={{
                        border: `1px solid ${config.themeColor}10`,
                        background: colIdx % 2 === 0 ? `${config.themeColor}02` : 'transparent'
                      }}>
                        {/* Column sub-header */}
                        <div className="py-0.5 px-1 flex items-center justify-center" style={{
                          background: `${config.themeColor}06`,
                          borderBottom: `1px solid ${config.themeColor}10`
                        }}>
                          <span className="text-[6px] font-semibold" style={{
                            color: config.secondaryColor,
                            fontFamily: '"Playfair Display", serif'
                          }}>
                            {colIdx === 0 ? '01' : String(sentenceRowsPerColumn + 1).padStart(2, '0')}
                            <span style={{ color: '#bbb' }}> — </span>
                            {colIdx === 0 ? String(Math.min(sentenceRowsPerColumn, sentenceShuffledWords.length)).padStart(2, '0') : 
                             String(sentenceShuffledWords.length).padStart(2, '0')}
                          </span>
                        </div>
                        
                        {/* Answers - word only */}
                        <div className="flex-1 flex flex-col px-1 py-0.5">
                          {Array.from({ length: sentenceRowsPerColumn }).map((_, idx) => {
                            const wordIdx = colIdx * sentenceRowsPerColumn + idx;
                            const word = sentenceShuffledWords[wordIdx];
                            if (!word) return null;
                            return (
                              <div key={word.id} className="flex items-center gap-0.5 py-0.5 flex-1" style={{
                                borderBottom: idx < sentenceRowsPerColumn - 1 && sentenceShuffledWords[wordIdx + 1] ? `1px solid ${config.themeColor}06` : 'none'
                              }}>
                                <span className="font-bold text-right flex-shrink-0" style={{
                                  fontSize: numberFontSize,
                                  width: '14px',
                                  color: config.secondaryColor,
                                  fontFamily: '"Playfair Display", serif'
                                }}>
                                  {String(wordIdx + 1).padStart(2, '0')}
                                </span>
                                <span className="font-semibold" style={{
                                  fontSize: wordFontSize,
                                  color: '#000000',
                                  fontFamily: '"Noto Sans", sans-serif'
                                }}>
                                  {word.word}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WORD RELATION - Right side */}
            {hasWordRelation && (
              <div className="rounded-lg overflow-hidden flex flex-col" style={{
                border: `1px solid ${config.secondaryColor}15`,
                background: '#ffffff',
                flex: hasSentenceTest ? '1 1 50%' : '1 1 100%'
              }}>
                {/* Section Header */}
                <div className="px-2 py-1 flex items-center justify-between flex-shrink-0" style={{
                  background: `linear-gradient(180deg, ${config.secondaryColor}10 0%, transparent 100%)`,
                  borderBottom: `1px solid ${config.themeColor}20`
                }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-lg flex items-center justify-center" style={{
                      background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.themeColor} 100%)`
                    }}>
                      <span className="text-white text-[7px] font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>R</span>
                    </div>
                    <span className="text-[9px] font-bold" style={{
                      color: config.themeColor,
                      fontFamily: '"Noto Sans KR", sans-serif'
                    }}>
                      WORD RELATION
                    </span>
                  </div>
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{
                    background: `${config.secondaryColor}10`,
                    color: config.secondaryColor
                  }}>
                    {wordRelationQuestions.length}문제
                  </span>
                </div>
                
                {/* Answer content - compact vertical layout */}
                <div className="flex-1 py-1 px-2 overflow-hidden">
                  <div className="flex flex-col gap-0.5">
                    {wordRelationQuestions.slice(0, 6).map((q, qIdx) => {
                      // Generate same choices as the test
                      const pairsCount = q.pairs.length;
                      let baseMin = pairsCount <= 5 ? 0 : Math.max(0, q.correctCount - 2);
                      let baseMax = pairsCount <= 5 ? Math.min(4, pairsCount) : Math.min(pairsCount, q.correctCount + 2);
                      const choices: number[] = [];
                      for (let i = baseMin; choices.length < 5 && i <= baseMax; i++) {
                        choices.push(i);
                      }
                      while (choices.length < 5) {
                        if (choices[0] > 0) choices.unshift(choices[0] - 1);
                        else if (choices[choices.length - 1] < pairsCount) choices.push(choices[choices.length - 1] + 1);
                        else break;
                      }
                      const correctChoiceIdx = choices.indexOf(q.correctCount);
                      
                      const samePairs = q.pairs.filter(p => p.isSameRelation);
                      const diffPairs = q.pairs.filter(p => !p.isSameRelation);
                      
                      return (
                        <div key={qIdx} className="flex flex-col gap-0.5" style={{
                          borderBottom: qIdx < Math.min(wordRelationQuestions.length, 6) - 1 ? `1px solid ${config.secondaryColor}08` : 'none',
                          paddingBottom: qIdx < Math.min(wordRelationQuestions.length, 6) - 1 ? '2px' : '0'
                        }}>
                          {/* Question number and answer */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold" style={{ color: config.secondaryColor }}>
                              #{qIdx + 1}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                              background: `${config.themeColor}15`,
                              color: config.themeColor
                            }}>
                              {choiceSymbols[correctChoiceIdx]} {q.correctCount}개
                            </span>
                          </div>
                          
                          {/* Explanation - show all pairs with meanings */}
                          <div className="text-[9px] leading-relaxed" style={{
                            color: '#555',
                            fontFamily: '"Noto Sans KR", sans-serif'
                          }}>
                            {/* Same relation pairs */}
                            <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                              <span className="font-bold px-0.5 rounded" style={{ 
                                background: q.examplePair.isAntonym ? '#fef2f2' : '#eff6ff',
                                color: q.examplePair.isAntonym ? '#991b1b' : '#1e40af'
                              }}>
                                {q.examplePair.isAntonym ? '반' : '동'}
                              </span>
                              {samePairs.map((p, pIdx) => (
                                <span key={pIdx}>
                                  <span style={{ color: '#000000', fontWeight: 500 }}>{p.word1}</span>
                                   <span style={{ color: '#888' }}>({p.meaning1 || '-'})</span>
                                   <span style={{ color: '#aaa' }}>-</span>
                                   <span style={{ color: '#000000', fontWeight: 500 }}>{p.word2}</span>
                                  <span style={{ color: '#888' }}>({p.meaning2 || '-'})</span>
                                  {pIdx < samePairs.length - 1 && <span style={{ color: '#ccc' }}>, </span>}
                                </span>
                              ))}
                            </div>
                            {/* Opposite relation pairs */}
                            {diffPairs.length > 0 && (
                              <div className="flex flex-wrap gap-x-1 gap-y-0.5 mt-0.5">
                                <span className="font-bold px-0.5 rounded" style={{ 
                                  background: q.examplePair.isAntonym ? '#eff6ff' : '#fef2f2',
                                  color: q.examplePair.isAntonym ? '#1e40af' : '#991b1b'
                                }}>
                                  {q.examplePair.isAntonym ? '동' : '반'}
                                </span>
                                {diffPairs.map((p, pIdx) => (
                                  <span key={pIdx}>
                                    <span style={{ color: '#666', fontWeight: 500 }}>{p.word1}</span>
                                    <span style={{ color: '#999' }}>({p.meaning1 || '-'})</span>
                                    <span style={{ color: '#bbb' }}>-</span>
                                    <span style={{ color: '#666', fontWeight: 500 }}>{p.word2}</span>
                                    <span style={{ color: '#999' }}>({p.meaning2 || '-'})</span>
                                    {pIdx < diffPairs.length - 1 && <span style={{ color: '#ccc' }}>, </span>}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {wordRelationQuestions.length > 6 && (
                      <div className="text-[7px] text-center" style={{ color: '#999' }}>
                        +{wordRelationQuestions.length - 6}문제 더보기
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - unified editorial style */}
      <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
    </div>;
}

// ==========================================
// Word-Type (교과서) Workbook Test Components
// ==========================================

// Helper: get page count for word-type meaning test
function getWordTypeMeaningPageCount(words: VocabularyWord[]): number {
  const wordsPerPage = 50; // 2 columns × 25 rows
  return Math.ceil(words.length / wordsPerPage);
}

// Helper: get page count for word-type sentence fill test
function getWordTypeSentenceFillPageCount(words: VocabularyWord[]): number {
  const withExamples = words.filter(w => w.examples && w.examples.length > 0);
  if (withExamples.length === 0) return 0;
  return Math.ceil(withExamples.length / 20);
}

// Word-Type Meaning Test Sheet (Round 1: headwords only, Round 2: all words)
function WordTypeMeaningTestSheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0,
  round,
  words: filteredWords
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
  round: 1 | 2;
  words: VocabularyWord[];
}) {
  const shuffledWords = React.useMemo(() =>
    seededShuffle(filteredWords, `wt-meaning-r${round}-${dayGroup.day}`),
    [filteredWords, dayGroup.day, round]
  );

  const wordsPerPage = 50;
  const startIdx = pageIndex * wordsPerPage;
  const endIdx = Math.min(startIdx + wordsPerPage, shuffledWords.length);
  const words = shuffledWords.slice(startIdx, endIdx);
  const totalPages = Math.ceil(shuffledWords.length / wordsPerPage);

  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const rowsPerColumn = 25;
  const leftColCount = Math.ceil(words.length / 2);
  const rightColCount = words.length - leftColCount;

  const roundLabel = round === 1 ? '1회독' : '2회독';
  const roundDesc = round === 1
    ? '표제어의 우리말 뜻을 쓰세요'
    : '모든 단어의 우리말 뜻을 쓰세요';

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="test" style={{
    width: '840px', height: '1188px', backgroundColor: '#fefdfb'
  }}>
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <TestSheetDecorations config={config} />

    <EditorialTestHeader
      config={config}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
      testType={`MEANING · ${roundLabel}`}
      subText={<>{roundDesc} {totalPages > 1 && <span style={{ color: config.secondaryColor }}>({pageIndex + 1}/{totalPages})</span>}</>}
      dayLabel={dayGroup.day}
      rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{startIdx + 1}-{endIdx} / {shuffledWords.length} WORDS</span><span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span></div>}
      brandLabel="MINI TEST"
    />

    <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
      <div className="grid grid-cols-2 gap-3 h-full">
        {[0, 1].map(colIdx => {
          const colCount = colIdx === 0 ? leftColCount : rightColCount;
          const colStartIdx = colIdx === 0 ? 0 : leftColCount;
          return (
          <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
            border: `1px solid ${config.themeColor}15`, background: '#ffffff'
          }}>
            <div className="py-1 px-2 flex items-center justify-between flex-shrink-0" style={{
              background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
              borderBottom: `1px solid ${config.secondaryColor}25`
            }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: config.secondaryColor }}>
                  <span className="text-[8px] font-bold text-white">{colIdx + 1}</span>
                </div>
                <span className="text-[8px] font-semibold" style={{ color: config.themeColor, fontFamily: '"Playfair Display", serif' }}>
                  {String(startIdx + colStartIdx + 1).padStart(2, '0')}
                  <span style={{ color: '#999' }}> — </span>
                  {String(startIdx + colStartIdx + colCount).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col px-1 overflow-hidden">
              {Array.from({ length: rowsPerColumn }).map((_, idx) => {
                const wordIdx = colStartIdx + idx;
                const word = words[wordIdx];
                const globalWordNum = startIdx + wordIdx + 1;
                if (!word || idx >= colCount) return null;

                return (
                  <div key={word.id} className="flex items-center gap-1" style={{
                    borderBottom: idx < rowsPerColumn - 1 && words[wordIdx + 1] ? `1px solid ${config.themeColor}06` : 'none',
                    height: `${100 / rowsPerColumn}%`, flexShrink: 0
                  }}>
                    <span className="text-[10px] font-bold w-5 text-right flex-shrink-0" style={{
                      color: config.secondaryColor, fontFamily: '"Playfair Display", serif'
                    }}>
                      {String(globalWordNum).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-semibold flex-shrink-0" style={{
                      color: '#000000', fontFamily: '"Noto Sans", sans-serif',
                      maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {word.word}
                    </span>
                    {round === 2 && word.wordType && word.wordType !== '표제어' && (
                      <span className="text-[6px] px-1 py-0 rounded flex-shrink-0" style={{
                        background: '#7c3aed12', color: '#6d28d9', border: '1px solid #7c3aed25',
                        fontFamily: '"Noto Sans KR", sans-serif', lineHeight: '1.4'
                      }}>
                        {word.wordType === '어원으로 줄줄이' ? '어원' : word.wordType === '핵심표현' ? '표현' : word.wordType}
                      </span>
                    )}
                    <div className="flex-1 relative" style={{ minWidth: '40px' }}>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
                        background: `linear-gradient(90deg, ${config.secondaryColor}40 0%, ${config.secondaryColor}20 100%)`
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </div>

    <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
  </div>;
}

// Word-Type Sentence Fill Test Sheet (Round 3)
function WordTypeSentenceFillSheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0,
  words: filteredWords
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
  words: VocabularyWord[];
}) {
  const allWordsWithExamples = React.useMemo(() => {
    const filtered = filteredWords.filter(w => w.examples && w.examples.length > 0);
    return seededShuffle(filtered, `wt-sentence-${dayGroup.day}`);
  }, [filteredWords, dayGroup.day]);

  const ITEMS_PER_COLUMN = 10;
  const ITEMS_PER_PAGE = ITEMS_PER_COLUMN * 2;
  const totalPages = Math.ceil(allWordsWithExamples.length / ITEMS_PER_PAGE);
  const startIdx = pageIndex * ITEMS_PER_PAGE;
  const wordsForThisPage = allWordsWithExamples.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const leftColumnWords = wordsForThisPage.slice(0, ITEMS_PER_COLUMN);
  const rightColumnWords = wordsForThisPage.slice(ITEMS_PER_COLUMN);

  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const createBlankedSentence = (sentence: string, word: string) => {
    const commonWords = new Set(['have', 'has', 'had', 'be', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'get', 'gets', 'got', 'do', 'does', 'did', 'make', 'makes', 'made', 'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from', 'it', 'not']);
    const isPatternWord = /\b[AB]\b|\?ing|-ing\b|\bdo\b|\bdoing\b|\(in\)/.test(word);

    if (isPatternWord) {
      let cleaned = word.replace(/\(in\)/g, '').replace(/\?ing/g, '').replace(/-ing\b/g, '').replace(/\bto do\b/g, '').replace(/\bdo\b/g, '').replace(/\bdoing\b/g, '').replace(/\b[AB]\b/g, '').trim();
      const coreWords = cleaned.split(/\s+/).filter(w => w.length > 0);
      const sortedWords = [...coreWords].sort((a, b) => {
        const aCommon = commonWords.has(a.toLowerCase());
        const bCommon = commonWords.has(b.toLowerCase());
        if (aCommon !== bCommon) return aCommon ? 1 : -1;
        return b.length - a.length;
      });
      for (const coreWord of sortedWords) {
        const coreWordLower = coreWord.toLowerCase();
        const variations = [coreWordLower, coreWordLower+'s', coreWordLower+'es', coreWordLower+'ed', coreWordLower+'ing', coreWordLower+'er', coreWordLower+'est', coreWordLower+'ly', coreWordLower.replace(/e$/, 'ing'), coreWordLower.replace(/e$/, 'ed'), coreWordLower.replace(/y$/, 'ied'), coreWordLower.replace(/y$/, 'ies'), coreWordLower.replace(/([^aeiou])$/, '$1$1ing'), coreWordLower.replace(/([^aeiou])$/, '$1$1ed')];
        for (const variation of variations) {
          const escaped = escapeRegex(variation);
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          const match = sentence.match(regex);
          if (match && match.index !== undefined) {
            return { before: sentence.substring(0, match.index), blank: '_'.repeat(Math.max(match[0].length - 1, 3)), after: sentence.substring(match.index + match[0].length), firstLetter: match[0].charAt(0).toLowerCase(), blankLength: match[0].length };
          }
        }
      }
    }

    const wordLower = word.toLowerCase();
    const wordVariations = [wordLower, wordLower+'s', wordLower+'es', wordLower+'ed', wordLower+'ing', wordLower+'er', wordLower+'est', wordLower+'ly', wordLower.replace(/e$/, 'ing'), wordLower.replace(/y$/, 'ied'), wordLower.replace(/y$/, 'ies'), wordLower.replace(/([^aeiou])$/, '$1$1ing'), wordLower.replace(/([^aeiou])$/, '$1$1ed')];

    if (word.includes(' ') && !isPatternWord) {
      const escaped = escapeRegex(wordLower);
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      const match = sentence.match(regex);
      if (match && match.index !== undefined) {
        return { before: sentence.substring(0, match.index), blank: '_'.repeat(Math.max(match[0].length - 1, 3)), after: sentence.substring(match.index + match[0].length), firstLetter: match[0].charAt(0).toLowerCase(), blankLength: match[0].length };
      }
    }

    for (const variation of wordVariations) {
      const escapedVariation = escapeRegex(variation);
      const regex = new RegExp(`\\b${escapedVariation}\\b`, 'i');
      const match = sentence.match(regex);
      if (match && match.index !== undefined) {
        return { before: sentence.substring(0, match.index), blank: '_'.repeat(Math.max(match[0].length - 1, 3)), after: sentence.substring(match.index + match[0].length), firstLetter: match[0].charAt(0).toLowerCase(), blankLength: match[0].length };
      }
    }

    return { before: sentence, blank: '', after: '', firstLetter: word.charAt(0).toLowerCase(), blankLength: word.length };
  };

  if (wordsForThisPage.length === 0) return null;

  const renderColumn = (columnWords: VocabularyWord[], colLabel: string, colStartIdx: number) => (
    <div className="flex-1 flex flex-col rounded-lg overflow-hidden" style={{
      border: `1px solid ${config.themeColor}15`, background: '#ffffff'
    }}>
      <div className="py-1.5 px-3 flex items-center justify-between flex-shrink-0" style={{
        background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
        borderBottom: `1px solid ${config.secondaryColor}25`
      }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: config.secondaryColor }}>
            <span className="text-[8px] font-bold text-white">{colLabel}</span>
          </div>
          <span className="text-[9px] font-semibold" style={{ color: config.themeColor, fontFamily: '"Playfair Display", serif' }}>
            {columnWords.length > 0 ? (<>{String(colStartIdx + 1).padStart(2, '0')}<span style={{ color: '#999' }}> — </span>{String(colStartIdx + columnWords.length).padStart(2, '0')}</>) : '-'}
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col px-2 py-1">
        {Array.from({ length: ITEMS_PER_COLUMN }).map((_, idx) => {
          const word = columnWords[idx];
          const wordNum = colStartIdx + idx + 1;
          if (!word || !word.examples || word.examples.length === 0) {
            return <div key={`empty-${idx}`} style={{ height: `${100 / ITEMS_PER_COLUMN}%` }} />;
          }
          const example = word.examples[0];
          const blanked = createBlankedSentence(example.english, word.word);
          return (
            <div key={word.id} className="flex flex-col py-1" style={{
              height: `${100 / ITEMS_PER_COLUMN}%`,
              borderBottom: idx < ITEMS_PER_COLUMN - 1 ? `1px solid ${config.themeColor}08` : 'none'
            }}>
              <div className="flex items-start gap-1">
                <span className="text-[13px] font-bold w-5 text-right flex-shrink-0" style={{
                  color: config.secondaryColor, fontFamily: '"Playfair Display", serif'
                }}>
                  {String(wordNum).padStart(2, '0')}
                </span>
                <div className="flex-1 text-[12px] leading-tight" style={{
                  color: '#333', fontFamily: '"Noto Sans", sans-serif', wordBreak: 'break-word', overflowWrap: 'break-word'
                }}>
                  {blanked.before}
                  <span className="font-bold" style={{ color: '#000000' }}>{blanked.firstLetter}</span>
                  <span style={{ borderBottom: `1px solid ${config.secondaryColor}`, minWidth: '45px', display: 'inline-block', letterSpacing: '0.15em' }}>{' '.repeat(Math.ceil(blanked.blankLength * 1.5))}</span>
                  {blanked.after}
                </div>
              </div>
              <div className="ml-5 mt-0.5">
                <span className="text-[11px]" style={{ color: '#666', fontFamily: '"Noto Sans KR", sans-serif' }}>
                  → {example.korean}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="sentence-test" style={{
    width: '840px', height: '1188px', backgroundColor: '#fefdfb'
  }}>
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <TestSheetDecorations config={config} />
    <EditorialTestHeader
      config={config}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
      testType="SENTENCE · 3회독"
      subText="예문과 우리말 해석을 보고 빈칸에 알맞은 단어를 쓰세요"
      dayLabel={dayGroup.day}
      rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{totalPages > 1 ? `${pageIndex + 1}/${totalPages} · ` : ''}{allWordsWithExamples.length} 문제</span><span className="text-[9px]" style={{ color: '#999', fontFamily: '"Noto Sans KR", sans-serif' }}>이름: _______________</span></div>}
      brandLabel="MINI TEST"
    />
    <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
      <div className="flex gap-2 h-full">
        {renderColumn(leftColumnWords, 'A', startIdx)}
        {rightColumnWords.length > 0 ? renderColumn(rightColumnWords, 'B', startIdx + ITEMS_PER_COLUMN) : <div className="flex-1" />}
      </div>
    </div>
    <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
  </div>;
}

// Word-Type Answer Key Sheet for Meaning rounds (1회독/2회독) - same layout as test sheet
function WordTypeMeaningAnswerSheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0,
  round,
  words: filteredWords
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
  round: 1 | 2;
  words: VocabularyWord[];
}) {
  const shuffledWords = React.useMemo(() =>
    seededShuffle(filteredWords, `wt-meaning-r${round}-${dayGroup.day}`),
    [filteredWords, dayGroup.day, round]
  );

  const wordsPerPage = 50;
  const startIdx = pageIndex * wordsPerPage;
  const endIdx = Math.min(startIdx + wordsPerPage, shuffledWords.length);
  const words = shuffledWords.slice(startIdx, endIdx);
  const totalPages = Math.ceil(shuffledWords.length / wordsPerPage);

  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  const rowsPerColumn = 25;
  const leftColCount = Math.ceil(words.length / 2);
  const rightColCount = words.length - leftColCount;

  const roundLabel = round === 1 ? '1회독' : '2회독';

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="answer" style={{
    width: '840px', height: '1188px', backgroundColor: '#fefdfb'
  }}>
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <TestSheetDecorations config={config} />

    <EditorialTestHeader
      config={config}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
      testType={`ANSWER KEY · ${roundLabel}`}
      subText={<>채점용 정답지 {totalPages > 1 && <span style={{ color: config.secondaryColor }}>({pageIndex + 1}/{totalPages})</span>}</>}
      dayLabel={dayGroup.day}
      rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{startIdx + 1}-{endIdx} / {shuffledWords.length} WORDS</span></div>}
      brandLabel="MINI TEST"
    />

    <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
      <div className="grid grid-cols-2 gap-3 h-full">
        {[0, 1].map(colIdx => {
          const colCount = colIdx === 0 ? leftColCount : rightColCount;
          const colStartIdx = colIdx === 0 ? 0 : leftColCount;
          return (
          <div key={colIdx} className="flex flex-col rounded-lg overflow-hidden" style={{
            border: `1px solid ${config.themeColor}15`, background: '#ffffff'
          }}>
            <div className="py-1 px-2 flex items-center justify-between flex-shrink-0" style={{
              background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
              borderBottom: `1px solid ${config.secondaryColor}25`
            }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: config.secondaryColor }}>
                  <span className="text-[8px] font-bold text-white">{colIdx + 1}</span>
                </div>
                <span className="text-[8px] font-semibold" style={{ color: config.themeColor, fontFamily: '"Playfair Display", serif' }}>
                  {String(startIdx + colStartIdx + 1).padStart(2, '0')}
                  <span style={{ color: '#999' }}> — </span>
                  {String(startIdx + colStartIdx + colCount).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col px-1 overflow-hidden">
              {Array.from({ length: rowsPerColumn }).map((_, idx) => {
                const wordIdx = colStartIdx + idx;
                const word = words[wordIdx];
                const globalWordNum = startIdx + wordIdx + 1;
                if (!word || idx >= colCount) return null;
                const simpleMeaning = word.meaning?.split(',')[0]?.split(';')[0]?.trim() || word.meaning || '';

                return (
                  <div key={word.id} className="flex items-center gap-1" style={{
                    borderBottom: idx < rowsPerColumn - 1 && words[wordIdx + 1] ? `1px solid ${config.themeColor}06` : 'none',
                    height: `${100 / rowsPerColumn}%`, flexShrink: 0
                  }}>
                    <span className="text-[10px] font-bold w-5 text-right flex-shrink-0" style={{
                      color: config.secondaryColor, fontFamily: '"Playfair Display", serif'
                    }}>
                      {String(globalWordNum).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-semibold flex-shrink-0" style={{
                      color: '#000000', fontFamily: '"Noto Sans", sans-serif',
                      maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {word.word}
                    </span>
                    {round === 2 && word.wordType && word.wordType !== '표제어' && (
                      <span className="text-[6px] px-1 py-0 rounded flex-shrink-0" style={{
                        background: '#7c3aed12', color: '#6d28d9', border: '1px solid #7c3aed25',
                        fontFamily: '"Noto Sans KR", sans-serif', lineHeight: '1.4'
                      }}>
                        {word.wordType === '어원으로 줄줄이' ? '어원' : word.wordType === '핵심표현' ? '표현' : word.wordType}
                      </span>
                    )}
                    <span className="flex-1 text-[10px] truncate" style={{
                      color: '#e11d48', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600
                    }}>
                      {simpleMeaning}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </div>

    <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
  </div>;
}

// Word-Type Answer Key Sheet for Sentence Fill (3회독) - same layout as sentence test
function WordTypeSentenceAnswerSheet({
  dayGroup,
  config,
  absolutePageNum,
  pageIndex = 0,
  words: filteredWords
}: {
  dayGroup: DayGroup;
  config: WorkbookConfig;
  absolutePageNum: number;
  pageIndex?: number;
  words: VocabularyWord[];
}) {
  const allWordsWithExamples = React.useMemo(() => {
    const filtered = filteredWords.filter(w => w.examples && w.examples.length > 0);
    return seededShuffle(filtered, `wt-sentence-${dayGroup.day}`);
  }, [filteredWords, dayGroup.day]);

  const ITEMS_PER_COLUMN = 10;
  const ITEMS_PER_PAGE = ITEMS_PER_COLUMN * 2;
  const totalPages = Math.ceil(allWordsWithExamples.length / ITEMS_PER_PAGE);
  const startIdx = pageIndex * ITEMS_PER_PAGE;
  const wordsForThisPage = allWordsWithExamples.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const leftColumnWords = wordsForThisPage.slice(0, ITEMS_PER_COLUMN);
  const rightColumnWords = wordsForThisPage.slice(ITEMS_PER_COLUMN);

  const isLeftPage = absolutePageNum % 2 === 0;
  const bindingMargin = '72px';
  const outerMargin = '30px';
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;

  if (wordsForThisPage.length === 0) return null;

  const renderColumn = (columnWords: VocabularyWord[], colLabel: string, colStartIdx: number) => (
    <div className="flex-1 flex flex-col rounded-lg overflow-hidden" style={{
      border: `1px solid ${config.themeColor}15`, background: '#ffffff'
    }}>
      <div className="py-1.5 px-3 flex items-center justify-between flex-shrink-0" style={{
        background: `linear-gradient(180deg, ${config.themeColor}08 0%, transparent 100%)`,
        borderBottom: `1px solid ${config.secondaryColor}25`
      }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: config.secondaryColor }}>
            <span className="text-[8px] font-bold text-white">{colLabel}</span>
          </div>
          <span className="text-[9px] font-semibold" style={{ color: config.themeColor, fontFamily: '"Playfair Display", serif' }}>
            {columnWords.length > 0 ? (<>{String(colStartIdx + 1).padStart(2, '0')}<span style={{ color: '#999' }}> — </span>{String(colStartIdx + columnWords.length).padStart(2, '0')}</>) : '-'}
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col px-2 py-1">
        {Array.from({ length: ITEMS_PER_COLUMN }).map((_, idx) => {
          const word = columnWords[idx];
          const wordNum = colStartIdx + idx + 1;
          if (!word || !word.examples || word.examples.length === 0) {
            return <div key={`empty-${idx}`} style={{ height: `${100 / ITEMS_PER_COLUMN}%` }} />;
          }
          const example = word.examples[0];
          return (
            <div key={word.id} className="flex flex-col py-0.5" style={{
              height: `${100 / ITEMS_PER_COLUMN}%`,
              borderBottom: idx < ITEMS_PER_COLUMN - 1 ? `1px solid ${config.themeColor}08` : 'none'
            }}>
              <div className="flex items-start gap-1">
                <span className="text-[11px] font-bold w-5 text-right flex-shrink-0" style={{
                  color: config.secondaryColor, fontFamily: '"Playfair Display", serif'
                }}>
                  {String(wordNum).padStart(2, '0')}
                </span>
                <div className="flex-1 text-[10px] leading-snug" style={{
                  color: '#333', fontFamily: '"Noto Sans", sans-serif', wordBreak: 'break-word', overflowWrap: 'break-word'
                }}>
                  {example.english}
                </div>
              </div>
              <div className="ml-5 mt-0">
                <span className="text-[9px]" style={{ color: '#666', fontFamily: '"Noto Sans KR", sans-serif' }}>
                  → {example.korean}
                </span>
              </div>
              <div className="ml-5 mt-0">
                <span className="text-[10px] font-bold" style={{ color: '#e11d48', fontFamily: '"Noto Sans", sans-serif' }}>
                  ✎ {word.word}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="answer" style={{
    width: '840px', height: '1188px', backgroundColor: '#fefdfb'
  }}>
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `radial-gradient(circle at 20px 20px, ${config.themeColor} 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <TestSheetDecorations config={config} />
    <EditorialTestHeader
      config={config}
      leftMargin={leftMargin}
      rightMargin={rightMargin}
      testType="ANSWER KEY · 3회독"
      subText={<>채점용 정답지 {totalPages > 1 ? `(${pageIndex + 1}/${totalPages})` : ''}</>}
      dayLabel={dayGroup.day}
      rightInfo={<div className="flex items-center gap-3"><span className="text-[9px]" style={{ color: config.secondaryColor }}>{allWordsWithExamples.length} 문제</span></div>}
      brandLabel="MINI TEST"
    />
    <div className="flex-1 py-2 px-1" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
      <div className="flex gap-2 h-full">
        {renderColumn(leftColumnWords, 'A', startIdx)}
        {rightColumnWords.length > 0 ? renderColumn(rightColumnWords, 'B', startIdx + ITEMS_PER_COLUMN) : <div className="flex-1" />}
      </div>
    </div>
    <EditorialTestFooter config={config} absolutePageNum={absolutePageNum} isLeftPage={isLeftPage} leftMargin={leftMargin} rightMargin={rightMargin} />
  </div>;
}

// Helper function to calculate answer key pages for a day group
function getAnswerKeyPageCount(dayGroup: DayGroup): number {
  const wordCount = dayGroup.words.length;
  if (wordCount <= 30) return 1;
  const columns = 4;
  const maxRowsPerColumn = wordCount > 50 ? 18 : 14;
  const itemsPerPage = columns * maxRowsPerColumn;
  return Math.ceil(wordCount / itemsPerPage);
}

// Ultimate 단어장 전용 프리미엄 워드 카드 (2열 레이아웃 - 발음+예문 포함)
function UltimateWordCard({
  word,
  index,
  themeColor,
  secondaryColor
}: {
  word: VocabularyWord;
  index: number;
  themeColor: string;
  secondaryColor: string;
}) {
  const NAVY_COLOR = '#1e3a5f';
  const isIdiom = word.word.includes(' ');
  const hasExample = word.examples && word.examples.length > 0;

  // Get meaning text with part of speech
  const getMeaningDisplay = () => {
    if (word.meaningSegments && word.meaningSegments.length > 0) {
      return word.meaningSegments.map((seg, idx) => <span key={idx}>
          <PosBadge tag={seg.partOfSpeech.replace(/[[\]]/g, '')} size={8} />
          <span className="ml-0.5">{seg.meaning}</span>
          {idx < word.meaningSegments!.length - 1 && <span className="mx-1 text-gray-300">│</span>}
        </span>);
    }
    return <span><TaggedMeaning meaning={word.meaning} badgeSize={8} fallbackPos={word.partOfSpeech} /></span>;
  };
  return <div className="h-full rounded-lg flex flex-col overflow-hidden relative" style={{
    background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 50%, #f8f8f8 100%)',
    border: `1px solid ${themeColor}18`,
    boxShadow: '0 2px 6px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)'
  }}>
      {/* Top accent bar with gradient */}
      <div className="h-[2px] w-full flex-shrink-0" style={{
      background: `linear-gradient(90deg, ${secondaryColor}, ${themeColor}80, ${secondaryColor})`
    }} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-2.5 py-1 min-h-0 overflow-hidden">
        {/* Row 1: Number + Word + Pronunciation + Meaning (right) + Checkboxes */}
        <div className="flex items-start gap-1.5" style={{ minHeight: '18px' }}>
          {/* Number badge */}
          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{
          background: `linear-gradient(135deg, ${themeColor}, ${secondaryColor})`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.12)'
        }}>
            <span className="text-[7px] font-bold text-white leading-none">
              {String(index).padStart(2, '0')}
            </span>
          </div>
          
          {/* Word + Pronunciation inline */}
          <div className="flex items-baseline gap-1 flex-shrink-0" style={{ maxWidth: '50%' }}>
            <h3 className="text-[14px] font-black tracking-tight leading-tight" style={{
              color: NAVY_COLOR,
              fontFamily: '"Noto Sans KR", sans-serif',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {word.word}
            </h3>
            {!isIdiom && word.pronunciation && (
              <span className="text-[9px] text-gray-400 flex-shrink-0" style={{
                fontFamily: '"Noto Sans KR", "Arial Unicode MS", sans-serif'
              }}>
                {word.pronunciation}
              </span>
           )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Meaning - right aligned, bigger + bold, wrapping */}
          <div className="font-bold text-gray-700 text-right" style={{
            fontFamily: '"Noto Sans KR", sans-serif',
            maxWidth: '48%',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: 1.2,
            fontSize: (() => {
              const len = word.meaning ? word.meaning.length : 0;
              if (len > 110) return '6px';
              if (len > 90) return '6.5px';
              if (len > 70) return '7px';
              if (len > 55) return '8px';
              if (len > 40) return '9px';
              return '11px';
            })()
          }}>
            {getMeaningDisplay()}
          </div>
          
          {/* Checkboxes */}
          <div className="flex gap-0.5 flex-shrink-0 ml-1 mt-0.5">
            {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 rounded border" style={{
            borderColor: `${secondaryColor}40`,
            background: 'rgba(255,255,255,0.8)'
          }} />)}
          </div>
        </div>
        
        {/* Row 2: Example sentence */}
        {hasExample && (
          <div className="pl-6 flex-1 flex flex-col justify-center min-h-0" style={{ marginTop: '1px' }}>
            <p className="text-[10px] leading-snug text-gray-500" style={{
              fontFamily: '"Noto Sans", sans-serif',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {highlightWord(word.examples![0].english, word.word, secondaryColor)}
            </p>
            {word.examples![0].korean && (
              <div className="text-[9px] leading-snug text-gray-400" style={{
                fontFamily: '"Noto Sans KR", sans-serif',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                marginTop: '2px'
              }}>
                {word.examples![0].korean}
              </div>
            )}
          </div>
        )}
      </div>
    </div>;
}
function WordCard({
  word,
  index,
  cardIndex,
  absoluteWordNumber,
  themeColor,
  secondaryColor,
  showExample = true,
  onDeleteSynonym,
  onDeleteAntonym,
  configTitle = '',
}: {
  word: VocabularyWord;
  index: number;
  cardIndex: number;
  absoluteWordNumber: number;
  themeColor: string;
  secondaryColor: string;
  showExample?: boolean;
  onDeleteSynonym?: (wordId: string, synonymIndex: number) => void;
  onDeleteAntonym?: (wordId: string, antonymIndex: number) => void;
  configTitle?: string;
}) {
  // Navy color for headword and pronunciation
  const NAVY_COLOR = '#1e3a5f';

  // Curated accent palette — rotates per card to give the page color variety
  // without breaking the ivory editorial cohesion. Kept muted so the theme color still leads.
  const ACCENTS = [
    { key: 'theme',    tone: themeColor, soft: `${themeColor}12`, chipBg: `${themeColor}10`, chipFg: themeColor },
    { key: 'sage',     tone: '#5b8a74',  soft: '#eef3ee',          chipBg: '#e7efe9',         chipFg: '#3f6b57' },
    { key: 'terracotta', tone: '#b56a4a', soft: '#f6ece5',         chipBg: '#f2e2d8',         chipFg: '#8f4a2f' },
    { key: 'gold',     tone: '#a68341',  soft: '#f5eddc',          chipBg: '#f1e6cf',         chipFg: '#7a5e2c' },
  ];
  const accent = ACCENTS[cardIndex % ACCENTS.length];
  const SAGE = '#5b8a74';  // Definition panel — a fixed contrast to theme color
  const cardBg = (cardIndex % 2 === 0) ? '#fefdfb' : '#fbf8f2';

  // Card without examples - premium horizontal layout (left: word, right: meaning)
  // Fixed height card - content must fit within bounds
  if (!showExample) {
    const totalMeaningLength = word.meaning?.length || 0;
    const getMeaningFontSize = () => {
      if (totalMeaningLength > 100) return '9px';
      if (totalMeaningLength > 70) return '10px';
      if (totalMeaningLength > 50) return '11px';
      return '12px';
    };
    return <div className="relative flex h-full" style={{
      background: `linear-gradient(120deg, #ffffff 0%, ${cardBg} 46%, ${themeColor}07 100%)`,
      border: `0.5px solid ${themeColor}26`,
      borderRadius: '7px',
      boxShadow: `0 1px 1px rgba(30,58,95,0.05), 0 0 0 0.5px #ffffff inset, 0 6px 12px -10px ${themeColor}55`,
      overflow: 'hidden',
      minHeight: 0
    }}>
        {/* Left accent bar — rotating accent tone */}
        <div className="w-[3px] flex-shrink-0" style={{ background: `linear-gradient(180deg, ${themeColor} 0%, ${accent.tone} 55%, ${themeColor}55 100%)` }} />

        {/* Left section - Word & Pronunciation */}
        <div className="flex flex-col justify-center px-4 py-2 flex-shrink-0 overflow-hidden" style={{
          width: '38%'
        }}>
          <div className="flex items-baseline gap-2 overflow-hidden mb-1">
            <span className="text-[8.5px] tracking-[0.18em] font-semibold" style={{
              color: themeColor,
              fontFamily: '"Orbitron", serif'
            }}>
              {String(index).padStart(2, '0')}
            </span>
            <div className="h-[0.5px] flex-1" style={{ background: `${themeColor}20` }} />
          </div>
          <h3 className="text-[18px] tracking-tight leading-tight break-words" style={{
            color: NAVY_COLOR,
            fontFamily: '"Noto Sans", "Noto Sans KR", sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.015em'
          }}>
            {word.word}
          </h3>
          {word.pronunciation && <span className="text-[9.5px] mt-1 truncate" style={{
            color: '#9ca3af',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic'
          }}>
            {word.pronunciation}
          </span>}
        </div>

        {/* Hairline vertical divider */}
        <div className="w-[0.5px] self-stretch my-3 flex-shrink-0" style={{
          background: `${themeColor}20`
        }} />

        {/* Right section - Meaning */}
        <div className="flex-1 flex items-center px-4 py-2 min-w-0 overflow-hidden">
          <div className="w-full leading-relaxed overflow-hidden break-words" style={{
          fontSize: getMeaningFontSize(),
          color: '#374151',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          fontFamily: '"Noto Sans KR", sans-serif'
        }}>
            {word.meaningSegments && word.meaningSegments.length > 0 ? <div className="font-medium leading-relaxed overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
                {(() => {
              // Group meanings by part of speech
              const grouped: {
                pos: string;
                meanings: string[];
              }[] = [];
              word.meaningSegments!.forEach(seg => {
                const existing = grouped.find(g => g.pos === seg.partOfSpeech);
                if (existing) {
                  existing.meanings.push(seg.meaning);
                } else {
                  grouped.push({
                    pos: seg.partOfSpeech,
                    meanings: [seg.meaning]
                  });
                }
              });
              return grouped.map((group, gIdx) => <span key={gIdx} className="inline">
                      <PosBadge tag={group.pos.replace(/[[\]]/g, '')} size={8} />
                      {group.meanings.map((meaning, mIdx) => <span key={mIdx}>
                          <span className="break-words">{meaning}</span>
                          {mIdx < group.meanings.length - 1 && <span className="text-gray-400">, </span>}
                        </span>)}
                      {gIdx < grouped.length - 1 && <span className="mx-1.5" style={{ color: `${themeColor}25` }}>·</span>}
                    </span>);
            })()}
              </div> : <span className="font-medium break-words"><TaggedMeaning meaning={word.meaning} badgeSize={8} fallbackPos={word.partOfSpeech} /></span>}
          </div>
        </div>

        {/* Checkboxes - hairline circles */}
        <div className="flex flex-col justify-center gap-1.5 pr-3.5 flex-shrink-0">
          {[1, 2, 3].map(i => <div key={i} className="w-[9px] h-[9px] rounded-full" style={{
            border: `0.5px solid ${themeColor}45`,
            background: '#fefdfb'
          }} />)}
        </div>
      </div>;
  }

  // Card with examples - compact professional design that prevents overflow
  // Check if there are actual synonyms or antonyms (excluding "none" placeholders)
  const hasSynAnt = (word.synonyms && word.synonyms.some(s => s && s.toLowerCase() !== 'none')) || 
                    (word.antonyms && word.antonyms.some(a => a && a.toLowerCase() !== 'none'));
  return <div className="relative h-full flex flex-col" style={{
    borderRadius: '9px',
    overflow: 'hidden',
    background: `linear-gradient(135deg, #ffffff 0%, ${cardBg} 42%, ${accent.soft} 100%)`,
    border: `0.5px solid ${themeColor}24`,
    boxShadow: `0 0 0 0.5px #ffffff inset, 0 1px 2px rgba(30,58,95,0.05), 0 10px 18px -14px ${themeColor}66`
  }}>
    {/* Soft corner glow — adds depth without print artifacts */}
    <div className="absolute pointer-events-none" style={{
      top: '-46px', left: '-46px', width: '130px', height: '130px', borderRadius: '50%',
      background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}00 70%)`
    }} />

    {/* Ghost watermark — oversized serif initial */}
    <div className="absolute pointer-events-none select-none" style={{
      right: '10px', bottom: '-18px',
      fontFamily: '"Orbitron", "Orbitron", serif',
      fontWeight: 700,
      fontSize: '120px',
      lineHeight: 1,
      color: themeColor,
      opacity: 0.035,
      letterSpacing: '-0.05em'
    }}>{(word.word || '').charAt(0).toUpperCase()}</div>

    {/* Top ornamental ribbon — hairline gradient */}
    <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
      height: '2.5px',
      background: `linear-gradient(90deg, ${themeColor} 0%, ${accent.tone} 26%, ${accent.tone}55 52%, ${themeColor}14 78%, transparent 100%)`
    }} />
    <div className="absolute top-[2.5px] left-0 right-0 pointer-events-none" style={{
      height: '0.5px',
      background: `linear-gradient(90deg, ${themeColor}40 0%, ${accent.tone}22 45%, transparent 80%)`
    }} />

    {/* Corner ticks — editorial trim marks */}
    <div className="absolute bottom-[6px] right-[7px] pointer-events-none" style={{ width: '13px', height: '13px' }}>
      <div className="absolute bottom-0 right-0 w-full h-[0.5px]" style={{ background: `linear-gradient(90deg, transparent, ${themeColor}55)` }} />
      <div className="absolute bottom-0 right-0 w-[0.5px] h-full" style={{ background: `linear-gradient(180deg, transparent, ${themeColor}55)` }} />
    </div>
    
    {/* Main content wrapper */}
    <div className="flex-1 flex flex-col px-3.5 pt-2.5 pb-1.5 min-h-0 overflow-hidden">
      {/* Row 1: Word header zone */}
      <div className="flex items-start justify-between gap-2 flex-shrink-0 mb-2" style={{ position: 'relative' }}>
        {/* Left: Number + Word + Pronunciation + Meaning */}
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {/* Number badge — outlined editorial numeral */}
          <div className="flex flex-col items-center flex-shrink-0">
            {/* Unified modern index card: accent bar + numeral + hairline + serial */}
            <div style={{
              width: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              borderRadius: '5px',
              overflow: 'hidden',
              background: `linear-gradient(180deg, ${themeColor}14 0%, #ffffff 60%, ${themeColor}08 100%)`,
              boxShadow: `inset 0 0 0 0.5px ${themeColor}55, 0 1px 2px ${themeColor}18`,
              position: 'relative',
            }}>
              {/* Left accent stripe */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: '2px',
                background: `linear-gradient(180deg, ${themeColor} 0%, ${accent.tone} 100%)`,
              }} />
              {/* Numeral */}
              <div style={{
                height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingLeft: '2px',
              }}>
                <span style={{
                  fontSize: '13px',
                  color: themeColor,
                  fontFamily: '"Orbitron", serif',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  {String(index).padStart(2, '0')}
                </span>
              </div>
              {/* Hairline divider */}
              <div style={{ height: '0.5px', background: `${themeColor}40`, marginLeft: '2px' }} />
              {/* Serial */}
              <div style={{
                height: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingLeft: '2px',
                background: `${themeColor}0a`,
              }}>
                <span style={{
                  fontSize: '6px',
                  fontFamily: '"Orbitron", serif',
                  fontWeight: 600,
                  color: `${themeColor}c0`,
                  letterSpacing: '0.12em',
                  lineHeight: 1,
                }}>
                  {String(absoluteWordNumber).padStart(4, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Word info column */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* Word + Pronunciation on same line */}
            <div className="flex items-baseline gap-2 min-w-0">
              <h3 className="text-[19px] tracking-tight leading-tight truncate" style={{
                color: '#1e3a5f',
                fontFamily: '"Noto Sans", "Noto Sans KR", sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.02em'
              }}>{word.word}</h3>
              {word.pronunciation && !word.word.includes(' ') && <span className="text-[10px] flex-shrink-0" style={{
                fontFamily: '"Noto Sans", "Noto Sans KR", sans-serif',
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#9ca3af'
              }}>
                  {word.pronunciation}
                </span>}
            </div>
            {/* Ornamental micro-rule under headword */}
            <div className="flex items-center gap-1 mt-[3px]" style={{ width: '58px' }}>
              <div className="h-[0.5px] flex-1" style={{ background: themeColor }} />
              <span style={{ transform: 'rotate(45deg)', display: 'inline-block', width: '3px', height: '3px', background: themeColor }} />
              <div className="h-[0.5px] flex-1" style={{ background: `${themeColor}30` }} />
            </div>
            {/* Meaning */}
            <div className="text-[12px] leading-relaxed mt-1" style={{
              fontFamily: '"Noto Sans KR", -apple-system, sans-serif',
              fontWeight: 400,
              color: '#374151'
            }}>
              {word.meaningSegments && word.meaningSegments.length > 0 ? word.meaningSegments.map((seg, segIdx) => <span key={segIdx} className="inline">
                  <PosBadge tag={seg.partOfSpeech.replace(/[[\]]/g, '')} size={8} />
                  <span className="font-medium">{seg.meaning}</span>
                {segIdx < word.meaningSegments!.length - 1 && <span className="mx-1.5" style={{ color: accent.tone, opacity: 0.5 }}>◆</span>}
                </span>) : <span className="font-medium"><TaggedMeaning meaning={word.meaning} badgeSize={8} fallbackPos={word.partOfSpeech} /></span>}
            </div>
          </div>
        </div>

        {/* Right: Checkboxes + Synonyms/Antonyms + Definition + Example */}
        <div className="flex flex-col flex-shrink-0" style={{ position: 'absolute', left: '240px', top: '0', right: '0' }}>
          {/* Top row: Checkboxes + Syn/Ant */}
          <div className="flex items-start">
            {/* Checkboxes — hairline circles */}
            <div className="flex gap-1.5 flex-shrink-0 mt-1.5 mr-3">
              {[1, 2, 3].map(i => <div key={i} style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: `0.5px solid ${themeColor}55`,
                background: '#fefdfb'
              }} />)}
            </div>
            {/* Synonyms/Antonyms */}
            {hasSynAnt && <div className="flex flex-col gap-0.5 text-[9px]" style={{ minWidth: '180px' }}>
                {word.synonyms && word.synonyms.length > 0 && word.synonyms.some(s => s && s.toLowerCase() !== 'none') && <div className="flex items-center">
                    <span className="mr-1.5 text-[7.5px] uppercase" style={{
                      color: '#1e3a5f',
                      fontFamily: '"Orbitron", serif',
                      fontWeight: 600,
                      letterSpacing: '0.22em',
                      borderBottom: '0.5px solid #1e3a5f60',
                      paddingBottom: '1px'
                    }}>Syn</span>
                    <span className="text-gray-600" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                      {word.synonyms.filter(s => s && s.toLowerCase() !== 'none').slice(0, 3).map((syn, idx, filteredArr) => {
                        const originalIndex = word.synonyms!.indexOf(syn);
                        return <span key={idx}>
                          <span 
                            className="font-medium cursor-pointer hover:line-through hover:text-red-500 transition-all print:cursor-default print:hover:no-underline print:hover:text-gray-600"
                            onClick={(e) => { e.stopPropagation(); if (onDeleteSynonym && word.id) onDeleteSynonym(word.id, originalIndex); }}
                            title="클릭하여 삭제"
                          >{syn}</span>
                          {word.synonymsKorean?.[originalIndex] && <span className="text-gray-400 ml-0.5">({word.synonymsKorean[originalIndex]})</span>}
                          {idx < filteredArr.length - 1 && <span className="mx-0.5 text-gray-300">·</span>}
                        </span>;
                      })}
                    </span>
                  </div>}
                {word.antonyms && word.antonyms.length > 0 && word.antonyms.some(a => a && a.toLowerCase() !== 'none') && <div className="flex items-center">
                    <span className="mr-1.5 text-[7.5px] uppercase" style={{
                      color: '#8b1e2b',
                      fontFamily: '"Orbitron", serif',
                      fontWeight: 600,
                      letterSpacing: '0.22em',
                      borderBottom: '0.5px solid #8b1e2b60',
                      paddingBottom: '1px'
                    }}>Ant</span>
                    <span className="text-gray-600" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                      {word.antonyms.filter(a => a && a.toLowerCase() !== 'none').slice(0, 3).map((ant, idx, filteredArr) => {
                        const originalIndex = word.antonyms!.indexOf(ant);
                        return <span key={idx}>
                          <span 
                            className="font-medium cursor-pointer hover:line-through hover:text-red-500 transition-all print:cursor-default print:hover:no-underline print:hover:text-gray-600"
                            onClick={(e) => { e.stopPropagation(); if (onDeleteAntonym && word.id) onDeleteAntonym(word.id, originalIndex); }}
                            title="클릭하여 삭제"
                          >{ant}</span>
                          {word.antonymsKorean?.[originalIndex] && <span className="text-gray-400 ml-0.5">({word.antonymsKorean[originalIndex]})</span>}
                          {idx < filteredArr.length - 1 && <span className="mx-0.5 text-gray-300">·</span>}
                        </span>;
                      })}
                    </span>
                  </div>}
              </div>}
          </div>
        </div>
      </div>

      {/* Row 2: Two-column — Example (left) + Definition/Etymology (right) */}
      {(word.examples && word.examples.length > 0 || word.englishDefinition || word.etymology) && <div className="flex-1 min-h-0 pl-7 pr-0.5 flex gap-2 mt-auto">
          {/* Example panel (left) */}
          {word.examples && word.examples.length > 0 ? (
            <div className="flex-1 flex flex-col justify-start" style={{
              background: `linear-gradient(135deg, ${themeColor}0e 0%, ${accent.soft} 55%, #fbfaf5 100%)`,
              borderRadius: '3px',
              border: `0.5px solid ${accent.tone}30`,
              position: 'relative',
              minHeight: 0
            }}>
              <div className="absolute left-0 top-0 bottom-0 w-[1.5px]" style={{
                background: `linear-gradient(180deg, ${themeColor}, ${accent.tone})`
              }} />
              {/* Oversized opening quote glyph */}
              <div className="absolute pointer-events-none select-none" style={{
                top: '-6px', right: '4px',
                fontFamily: 'Georgia, serif',
                fontSize: '42px', lineHeight: 1,
                color: accent.tone, opacity: 0.14,
                fontStyle: 'italic', fontWeight: 700
              }}>”</div>
              <div className="py-1.5 px-2.5 pl-3 flex-1 flex flex-col justify-center" style={{ minHeight: 0 }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Quote size={9} strokeWidth={2} style={{ color: themeColor }} />
                  <span className="text-[7.5px] uppercase" style={{
                    color: themeColor,
                    fontFamily: '"Orbitron", serif',
                    fontWeight: 600,
                    letterSpacing: '0.22em'
                  }}>Example</span>
                  <div className="flex-1 h-[0.5px]" style={{ background: `linear-gradient(90deg, ${themeColor}30, ${accent.tone}30)` }} />
                </div>
                <p className="text-[13px] leading-[1.7] break-words" style={{
                  fontFamily: '"Noto Sans", sans-serif',
                  color: '#1e3a5f', fontWeight: 400,
                  wordBreak: 'break-word', overflowWrap: 'break-word'
                }}>
                  {highlightWord(word.examples[0].english, word.word, secondaryColor)}
                </p>
                {word.examples[0].korean && <p className="text-[12px] leading-[1.6] break-words mt-0.5" style={{
                  fontFamily: '"Noto Sans KR", sans-serif',
                  color: '#6b7280', fontWeight: 400,
                  wordBreak: 'break-word', overflowWrap: 'break-word'
                }}>
                  {word.examples[0].korean}
                </p>}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {/* Right panel: Definition + Etymology */}
          <div className="flex-1 flex flex-col gap-1.5">
            {/* English Definition */}
            {word.englishDefinition && <div className="flex flex-col justify-start" style={{
              background: '#f1f6f2',
              borderRadius: '3px',
              border: `0.5px solid ${SAGE}30`,
              position: 'relative',
              minHeight: 0
            }}>
              <div className="absolute left-0 top-0 bottom-0 w-[1.5px]" style={{
                background: SAGE
              }} />
              <div className="py-1.5 px-2.5 pl-3 flex flex-col justify-center" style={{ minHeight: 0 }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen size={9} strokeWidth={2} style={{ color: SAGE }} />
                  <span className="text-[7.5px] uppercase" style={{
                    color: SAGE,
                    fontFamily: '"Orbitron", serif',
                    fontWeight: 600,
                    letterSpacing: '0.22em'
                  }}>Definition</span>
                  <div className="flex-1 h-[0.5px]" style={{ background: `${SAGE}25` }} />
                </div>
                <p className="text-[11.5px] leading-[1.6] break-words" style={{
                  fontFamily: '"Noto Sans", "Noto Sans KR", sans-serif',
                  fontStyle: 'italic',
                  color: '#405a4d', fontWeight: 400,
                  wordBreak: 'break-word', overflowWrap: 'break-word'
                }}>
                  {word.englishDefinition}
                </p>
              </div>
            </div>}
            {/* Etymology */}
            {word.etymology && <div className="flex flex-col justify-start" style={{
              background: '#f8f6ef',
              borderRadius: '3px',
              border: `0.5px solid #b89b6c40`,
              position: 'relative',
              minHeight: 0
            }}>
              <div className="absolute left-0 top-0 bottom-0 w-[1.5px]" style={{
                background: '#8a6d3b'
              }} />
              <div className="py-1.5 px-2.5 pl-3 flex flex-col justify-center" style={{ minHeight: 0 }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Feather size={9} strokeWidth={2} style={{ color: '#8a6d3b' }} />
                  <span className="text-[7.5px] uppercase" style={{
                    color: '#8a6d3b',
                    fontFamily: '"Orbitron", serif',
                    fontWeight: 600,
                    letterSpacing: '0.22em'
                  }}>Etymology</span>
                  <div className="flex-1 h-[0.5px]" style={{ background: '#8a6d3b25' }} />
                </div>
                <p className="text-[10.5px] text-gray-700 leading-[1.6] break-words flex items-center flex-wrap gap-x-1" style={{
                  fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 400,
                  wordBreak: 'break-word', overflowWrap: 'break-word'
                }}>
                  {(() => {
                    const etymText = word.etymology?.includes('💡') ? word.etymology.split('💡')[0].trim() : word.etymology;
                    const styleEtymology = (text: string) => {
                      const regex = /([a-zA-Z-]+)(\([^)]+\))?/g;
                      const parts: React.ReactNode[] = [];
                      let lastIndex = 0;
                      let match;
                      let keyIndex = 0;
                      while ((match = regex.exec(text)) !== null) {
                        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
                        const englishWord = match[1];
                        const koreanMeaning = match[2] || '';
                        parts.push(<span key={keyIndex++}>
                          <span style={{ color: '#1e3a5f', fontWeight: 600, fontFamily: '"Noto Sans", sans-serif' }}>{englishWord}</span>
                          <span style={{ color: '#777' }}>{koreanMeaning}</span>
                        </span>);
                        lastIndex = match.index + match[0].length;
                      }
                      if (lastIndex < text.length) parts.push(text.slice(lastIndex));
                      return parts;
                    };
                    if (etymText?.includes('→')) {
                      const parts = etymText.split('→');
                      return parts.map((part, idx) => <span key={idx} className="inline-flex items-center">
                        {styleEtymology(part.trim())}
                        {idx < parts.length - 1 && <span className="inline-flex items-center mx-[3px]" style={{ color: '#8a6d3b' }}>
                          <svg width="10" height="8" viewBox="0 0 24 24" fill="none">
                            <path d="M4 12h16M14 6l6 6-6 6" stroke="#8a6d3b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>}
                      </span>);
                    }
                    return styleEtymology(etymText || '');
                  })()}
                </p>
              </div>
            </div>}
          </div>
        </div>}
    </div>
  </div>;
}
function ContentPage({
  dayGroup,
  words,
  absolutePageNum,
  startWordIndex,
  globalWordOffset,
  config,
  onDeleteSynonym,
  onDeleteAntonym,
  derivativeRelations
}: {
  dayGroup: DayGroup;
  words: VocabularyWord[];
  absolutePageNum: number;
  startWordIndex: number;
  globalWordOffset: number;
  config: WorkbookConfig;
  onDeleteSynonym?: (wordId: string, synonymIndex: number) => void;
  onDeleteAntonym?: (wordId: string, antonymIndex: number) => void;
  derivativeRelations?: Record<string, string>;
}) {
  const theme = COVER_THEMES[config.coverStyle || 'premium'];
  const themeStyle = {
    backgroundColor: config.themeColor,
    accentColor: config.secondaryColor
  };
  const secondaryColor = config.secondaryColor;
  // In a book: odd pages are on the right, even pages are on the left
  const isLeftPage = absolutePageNum % 2 === 0;
  const showExamples = config.includeExamples;

  // Check if this is Ultimate workbook (thicker, needs more binding margin)
  const isUltimate = config.coverSubtitle?.toLowerCase() === 'ultimate';

  // Binding margin: inner margin should be wider for book binding
  // Left page: right side is inner (binding), Left side is outer
  // Right page: left side is inner (binding), right side is outer
  const bindingMargin = '72px'; // Standard binding margin for all workbooks
  const outerMargin = '30px'; // Normal margin for outer edge
  const leftMargin = isLeftPage ? outerMargin : bindingMargin;
  const rightMargin = isLeftPage ? bindingMargin : outerMargin;
  return <div className="page-b5 shadow-2xl print-page flex flex-col relative overflow-hidden" data-page-type="content" style={{
    width: '840px',
    height: '1188px',
    backgroundColor: '#fefdfb'
  }}>
      {/* Layered page texture — warm ivory with subtle grain */}
      <div className="absolute inset-0 pointer-events-none" style={{
      background: 'linear-gradient(180deg, rgba(255,252,248,0.3) 0%, transparent 30%, transparent 70%, rgba(252,250,246,0.3) 100%)'
    }} />

      {/* Subtle geometric corner frames */}
      <div className="absolute top-4 right-4 pointer-events-none" style={{ width: '60px', height: '60px' }}>
        <div className="absolute top-0 right-0 w-[40px] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${config.themeColor}20)` }} />
        <div className="absolute top-0 right-0 w-[1px] h-[40px]" style={{ background: `linear-gradient(180deg, ${config.themeColor}20, transparent)` }} />
        <div className="absolute top-[6px] right-[6px] w-[2px] h-[2px] rotate-45" style={{ background: `${config.secondaryColor}30` }} />
      </div>
      <div className="absolute bottom-4 left-4 pointer-events-none" style={{ width: '60px', height: '60px' }}>
        <div className="absolute bottom-0 left-0 w-[40px] h-[1px]" style={{ background: `linear-gradient(-90deg, transparent, ${config.secondaryColor}20)` }} />
        <div className="absolute bottom-0 left-0 w-[1px] h-[40px]" style={{ background: `linear-gradient(0deg, ${config.secondaryColor}20, transparent)` }} />
        <div className="absolute bottom-[6px] left-[6px] w-[2px] h-[2px] rotate-45" style={{ background: `${config.themeColor}30` }} />
      </div>

      {/* Binding side accent — subtle vertical line near spine */}
      <div className="absolute top-16 bottom-16 pointer-events-none" style={{
        [isLeftPage ? 'right' : 'left']: '46px',
        width: '1px',
        background: `linear-gradient(180deg, transparent 0%, ${config.themeColor}08 20%, ${config.themeColor}12 50%, ${config.themeColor}08 80%, transparent 100%)`
      }} />

      {/* Watermark */}
      <div data-watermark="true" className="absolute inset-0 flex items-center justify-center pointer-events-none z-40" style={{
      transform: 'rotate(-20deg)'
    }}>
        <div className="text-center tracking-widest select-none whitespace-nowrap" style={{
        fontSize: '90px',
        color: 'rgba(180, 180, 180, 0.12)',
        fontFamily: '"Orbitron", "Playfair Display", serif',
        fontWeight: 700
      }}>
          ORUN VOCA
        </div>
      </div>

      {/* Header — premium editorial masthead with geometric patterns */}
      {(() => {
        const themeColor = config.themeColor;
        const headerBase = darkenColor(themeColor, 0.25);
        const headerDark = darkenColor(themeColor, 0.45);
        const displayTitle = getTitleWithoutSchool(config.title);
        const titleMatch = displayTitle.match(/(?:ORUN\s*VOCA|옳은보카)\s*(.+)/i);
        const titleBase = titleMatch ? displayTitle.replace(titleMatch[1], '').trim() : displayTitle;
        const titleSuffix = titleMatch ? titleMatch[1].trim() : '';
        const dayNum = String(dayGroup.day).match(/\d+/)?.[0] || String(dayGroup.day);
        return (
          <div className="flex-shrink-0 relative mt-7" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
            {/* Main header card with rich gradient + pattern overlay */}
            <div style={{
              background: `linear-gradient(135deg, ${headerBase} 0%, ${headerDark} 100%)`,
              padding: '14px 18px 12px',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 8px 24px -8px ${themeColor}50`
            }}>
              {/* Subtle diagonal pinstripe pattern overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.04) 42%, transparent 42%, transparent 46%, rgba(255,255,255,0.03) 46%, rgba(255,255,255,0.03) 48%, transparent 48%)`,
                backgroundSize: '60px 60px'
              }} />

              {/* Corner ornaments — top-left L frame */}
              <div className="absolute top-3 left-3 pointer-events-none" style={{ width: '28px', height: '28px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '18px', height: '1.5px', background: 'rgba(255,255,255,0.35)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '1.5px', height: '18px', background: 'rgba(255,255,255,0.35)' }} />
              </div>
              {/* Corner ornaments — bottom-right L frame */}
              <div className="absolute bottom-3 right-3 pointer-events-none" style={{ width: '28px', height: '28px' }}>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '18px', height: '1.5px', background: 'rgba(255,255,255,0.35)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '1.5px', height: '18px', background: 'rgba(255,255,255,0.35)' }} />
              </div>

              {/* Diamond micro accents along top edge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2">
                <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: 'rgba(255,255,255,0.45)' }} />
                <div style={{ width: '28px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
                <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: 'rgba(255,255,255,0.45)' }} />
              </div>

              <div className="flex items-end justify-between relative" style={{ height: '56px' }}>
                {/* LEFT — DAY numeral + title */}
                <div className="flex items-end gap-5">
                  <div className="flex flex-col items-start" style={{ lineHeight: 1 }}>
                    <span style={{
                      fontFamily: '"Orbitron", serif', fontSize: '7px',
                      color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5em', fontWeight: 500,
                      marginBottom: '4px', paddingLeft: '2px'
                    }}>DAY</span>
                    <span style={{
                      fontFamily: '"Orbitron", "Playfair Display", serif',
                      fontWeight: 700, fontSize: '36px', lineHeight: 0.85,
                      color: '#ffffff', letterSpacing: '-0.02em',
                    }}>{dayNum}</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)', marginBottom: '2px' }} />
                  <div className="flex flex-col" style={{ paddingBottom: '2px' }}>
                    <span style={{
                      fontFamily: '"Orbitron", serif', fontSize: '7px',
                      color: 'rgba(255,255,255,0.7)', letterSpacing: '0.25em', fontWeight: 500
                    }}>ORUN ENGLISH VOCAB SERIES</span>
                    <span style={{
                      fontFamily: /[가-힣]/.test(titleBase)
                        ? '"Noto Sans KR", sans-serif'
                        : '"Orbitron", "Playfair Display", serif',
                      fontWeight: 700, fontSize: '15px', color: '#ffffff',
                      letterSpacing: '0.06em', marginTop: '4px', lineHeight: 1
                    }}>
                      {titleBase}
                      {titleSuffix && <span style={{ color: 'rgba(255,255,255,0.9)', marginLeft: '8px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 500, letterSpacing: '-0.02em' }}>{titleSuffix}</span>}
                    </span>
                  </div>
                </div>

                {/* RIGHT — word count */}
                {(() => {
                  const dayWords = dayGroup.words || [];
                  const hasType = dayWords.some((w: any) => w.wordType);
                  const headCount = dayWords.filter((w: any) => w.wordType === '표제어').length;
                  const derivCount = dayWords.length - headCount;
                  return (
                    <div className="flex items-end gap-4" style={{ lineHeight: 1, paddingBottom: '2px' }}>
                      <div className="flex flex-col items-end">
                        <span style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '6.5px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em', fontWeight: 500 }}>
                          {hasType ? '표제어' : 'SESSION'}
                        </span>
                        <span style={{ fontFamily: '"Orbitron", serif', fontWeight: 700, fontSize: '14px', color: '#ffffff', letterSpacing: '0.04em', marginTop: '4px' }}>
                          {String(hasType ? headCount : dayWords.length).padStart(2, '0')}
                        </span>
                      </div>
                      <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.3)', marginBottom: '2px' }} />
                      <div className="flex flex-col items-end">
                        <span style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '6.5px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em', fontWeight: 500 }}>
                          {hasType ? '파생어' : 'WORDS'}
                        </span>
                        <span style={{ fontFamily: '"Orbitron", serif', fontWeight: 700, fontSize: '14px', color: '#ffffff', letterSpacing: '0.04em', marginTop: '4px' }}>
                          {String(hasType ? derivCount : dayWords.length).padStart(2, '0')}
                          <span style={{ fontFamily: '"Orbitron", serif', fontWeight: 400, fontSize: '7.5px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.25em', marginLeft: '4px' }}>WORDS</span>
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Hairline rule with diamond center */}
              <div className="relative mt-3" style={{ height: '1px' }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.45) 50%, transparent)` }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '6px', height: '6px', transform: 'translate(-50%, -50%) rotate(45deg)', background: 'rgba(255,255,255,0.85)' }} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Content area - layout varies by workbook type */}
      <div className="flex-1 py-4 overflow-hidden" style={{
      paddingLeft: leftMargin,
      paddingRight: rightMargin
    }}>
        {(() => {
        // Check if this is a word-type workbook (e.g., 숭의여고 format)
        const hasWordType = words.some(w => w.wordType);
        if (hasWordType) {
          // Word-type workbook: grouped by 표제어 sections
          const WORD_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
            '표제어': { bg: '#2563eb15', text: '#1d4ed8', border: '#2563eb30' },
            '파생어': { bg: '#7c3aed12', text: '#6d28d9', border: '#7c3aed25' },
            '핵심표현': { bg: '#dc262615', text: '#b91c1c', border: '#dc262630' },
            '어원으로 줄줄이': { bg: '#0d948812', text: '#047857', border: '#0d948825' },
            '동의': { bg: '#2563eb15', text: '#2563eb', border: '#2563eb30' },
            '반의': { bg: '#dc262615', text: '#dc2626', border: '#dc262630' },
          };
          const displayWords = words.slice(0, WORDS_PER_PAGE_WORD_TYPE);

          // Group words by 표제어: each 표제어 starts a new group
          const groups: { headword: typeof displayWords[0]; members: typeof displayWords }[] = [];
          displayWords.forEach((w) => {
            if (w.wordType === '표제어' || groups.length === 0) {
              groups.push({ headword: w, members: [w] });
            } else {
              groups[groups.length - 1].members.push(w);
            }
          });

          // Count only headwords (표제어) for numbering - derivatives don't get numbers
          // Calculate how many headwords came before this page's startWordIndex
          const allDayWords = dayGroup?.words || [];
          const headwordsBeforePage = allDayWords.slice(0, startWordIndex).filter(w => w.wordType === '표제어').length;
          let headwordCounter = headwordsBeforePage;

          const isFullPage = groups.length >= 7;

          return <div className="flex flex-col h-full" style={{ gap: '0px' }}>
            {groups.map((group, gIdx) => {
              const headword = group.headword;
              const subWords = group.members.filter(w => w.wordType !== '표제어');
              const headIdx = headwordCounter;
              headwordCounter += 1;

              return (
                <div key={gIdx} className={isFullPage ? "flex-1" : ""} style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: isFullPage ? 'center' : 'flex-start',
                  minHeight: 0,
                  marginTop: gIdx > 0 ? '4px' : '0px',
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  paddingLeft: '8px',
                  borderRadius: '5px',
                  background: gIdx % 2 === 0 ? '#fefdfb' : '#fbf8f2',
                  boxShadow: `inset 0 0 0 0.5px ${config.themeColor}18`,
                }}>
                  {/* Left accent rail */}
                  <div style={{
                    position: 'absolute', left: 0, top: '5px', bottom: '5px', width: '2px',
                    borderRadius: '2px',
                    background: `linear-gradient(180deg, ${config.themeColor}, ${config.themeColor}33)`,
                  }} />
                  {/* Row 1: Number + Word + Meaning */}
                  <div className="flex items-baseline gap-2 px-3" style={{ marginBottom: '5px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, width: '22px', textAlign: 'center', flexShrink: 0,
                      color: config.themeColor,
                      fontFamily: '"Orbitron", serif',
                      letterSpacing: '-0.02em',
                      padding: '1px 0',
                      borderRadius: '3px',
                      background: `${config.themeColor}0f`,
                      boxShadow: `inset 0 0 0 0.5px ${config.themeColor}40`,
                    }}>
                      {String(headIdx + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontSize: '14px', fontWeight: 800, color: '#1e3a5f',
                      fontFamily: '"Noto Sans", sans-serif', flexShrink: 0,
                      minWidth: '100px', letterSpacing: '-0.015em',
                      borderBottom: `1.5px solid ${config.themeColor}22`,
                    }}>
                      {headword.word}
                    </span>
                    {headword.pronunciation && (
                      <span style={{
                        fontSize: '10.5px', fontWeight: 400, color: '#999',
                        fontFamily: '"Noto Sans", sans-serif', fontStyle: 'italic',
                        flexShrink: 0,
                      }}>{headword.pronunciation}</span>
                    )}
                    <span style={{
                      fontSize: '12.5px', color: '#333', fontFamily: '"Noto Sans KR", sans-serif',
                      fontWeight: 500,
                      overflowWrap: 'break-word', wordBreak: 'break-word',
                    }}><TaggedMeaning meaning={headword.meaning} badgeSize={9} /></span>
                  </div>

                  {/* Row 2: Definition + Example (indented) */}
                  <div style={{ paddingLeft: '48px', paddingRight: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {headword.englishDefinition && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                        <span style={{
                          fontSize: '7px', fontWeight: 700, color: '#8a6a22', flexShrink: 0,
                          lineHeight: '15px', fontFamily: '"Orbitron", serif',
                          letterSpacing: '0.16em',
                          background: '#f6eeda', padding: '0 4px', borderRadius: '2px',
                          border: '0.5px solid #d9c48e',
                        }}>DEF</span>
                        <span style={{
                          fontSize: '12px', color: '#555', fontFamily: '"Noto Sans", sans-serif',
                          fontStyle: 'italic', overflowWrap: 'break-word', wordBreak: 'break-word',
                          lineHeight: '1.5',
                        }}>{headword.englishDefinition}</span>
                      </div>
                    )}
                    {headword.examples && headword.examples.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                        <span style={{
                          fontSize: '7px', fontWeight: 700, color: '#1e3a5f', flexShrink: 0,
                          lineHeight: '15px', fontFamily: '"Orbitron", serif',
                          letterSpacing: '0.16em',
                          background: '#e8eef6', padding: '0 4px', borderRadius: '2px',
                          border: '0.5px solid #b8c8dc',
                        }}>EX</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{
                            fontSize: '12px', color: '#1a1a1a', fontFamily: '"Noto Sans", sans-serif',
                            overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.5',
                          }}>
                            {highlightWord(headword.examples[0].english, headword.word, '#1a1a1a')}
                          </span>
                          {headword.examples[0].korean && (
                            <span style={{
                              fontSize: '11px', color: '#777', fontFamily: '"Noto Sans KR", sans-serif',
                              overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.5',
                            }}>
                              {headword.examples[0].korean}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Sub-words (derivatives) */}
                  {subWords.length > 0 && (
                    <div className="flex flex-wrap" style={{ paddingLeft: '48px', marginTop: '5px' }}>
                      {subWords.map((sw, swIdx) => {
                        // Check if AI has analyzed a specific relation for this derivative
                        const relationKey = `${headword.word}::${sw.word}`;
                        const analyzedRelation = derivativeRelations?.[relationKey];
                        const displayLabel = analyzedRelation
                          ? (analyzedRelation === '동의' ? '동의어' : analyzedRelation === '반의' ? '반의어' : analyzedRelation === '표현' ? '표현' : '파생어')
                          : (sw.wordType === '어원으로 줄줄이' ? '어원' : sw.wordType === '핵심표현' ? '표현' : sw.wordType || '');
                        const colorKey = analyzedRelation || sw.wordType || '';
                        const typeColor = WORD_TYPE_COLORS[colorKey] || WORD_TYPE_COLORS['파생어'];
                        return (
                          <div key={sw.id} className="flex items-center gap-1.5" style={{
                            height: '22px',
                            width: '50%',
                            paddingRight: '8px',
                          }}>
                            <span style={{
                              fontSize: '7.5px', fontWeight: 700, padding: '1px 5px', borderRadius: '999px',
                              background: typeColor.bg, color: typeColor.text, border: `0.5px solid ${typeColor.border}`,
                              letterSpacing: '0.02em',
                              flexShrink: 0, fontFamily: '"Noto Sans KR", sans-serif', whiteSpace: 'nowrap',
                            }}>
                              {displayLabel}
                            </span>
                            <span style={{
                              fontSize: '11.5px', fontWeight: 600, color: '#1e3a5f',
                              fontFamily: '"Noto Sans", sans-serif', flexShrink: 0,
                              overflowWrap: 'break-word', wordBreak: 'break-word',
                            }}>{sw.word}</span>
                            <span style={{
                              fontSize: '10.5px', color: '#555', fontFamily: '"Noto Sans KR", sans-serif',
                              flex: 1, overflowWrap: 'break-word', wordBreak: 'break-word',
                            }}><TaggedMeaning meaning={sw.meaning} badgeSize={8} /></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>;
        }
        
        // Check if this is Ultimate workbook (by cover subtitle)
        const isUltimate = config.coverSubtitle?.toLowerCase() === 'ultimate';
        if (isUltimate) {
          // Ultimate workbook: 2 columns x 10 rows = 20 words per page
          const displayWords = words.slice(0, 20);
          const cardHeight = 'calc((100% - 36px) / 10)'; // 10 rows with 9 gaps of 4px
          const columns = [displayWords.slice(0, 10), displayWords.slice(10, 20)];
          return <div className="flex gap-4 h-full">
              {columns.map((col, colIdx) => <div key={`col-${colIdx}`} className="flex-1 flex flex-col gap-1" style={{
              height: '100%'
            }}>
                  {Array.from({
                length: 10
              }).map((_, idx) => {
                const word = col[idx];
                const globalIdx = colIdx * 10 + idx;
                return <div key={word?.id || `empty-${colIdx}-${idx}`} style={{
                  height: cardHeight,
                  flexShrink: 0,
                  flexGrow: 0
                }}>
                      {word ? <UltimateWordCard word={word} index={startWordIndex + globalIdx + 1} themeColor={config.themeColor} secondaryColor={secondaryColor} /> : <div className="h-full rounded-lg border border-dashed bg-white/50" style={{
                    borderColor: `${config.themeColor}15`
                  }} />}
                    </div>;
              })}
                </div>)}
            </div>;
        }

        // Standard workbooks
        const wordsPerPage = showExamples ? 5 : 15;
        const displayWords = words.slice(0, wordsPerPage);

        // For examples: 5 cards per page
        if (showExamples) {
          // Standard cards: 5 rows
          const cardHeight = 'calc((100% - 16px) / 5)';

          return <div className="flex flex-col gap-1 h-full">
              {Array.from({
              length: 5
            }).map((_, idx) => {
              const word = displayWords[idx];
              return <div key={word?.id || `empty-${idx}`} style={{
                height: cardHeight,
                flexShrink: 0,
                flexGrow: 0
              }}>
                  {word ? <WordCard word={word} index={startWordIndex + idx + 1} cardIndex={startWordIndex + idx} absoluteWordNumber={globalWordOffset + startWordIndex + idx + 1} themeColor={config.themeColor} secondaryColor={secondaryColor} showExample={showExamples} onDeleteSynonym={onDeleteSynonym} onDeleteAntonym={onDeleteAntonym} configTitle={config.title} /> : <div className="h-full rounded-xl border border-dashed bg-white/50" style={{
                  borderColor: `${config.themeColor}15`
                }} />}
                </div>;
            })}
            </div>;
        } else {
          // No examples: 3 columns with 5 rows each = 15 words
          const cardHeight = 'calc((100% - 16px) / 5)'; // 5 rows with 4 gaps
          const columns = [displayWords.slice(0, 5), displayWords.slice(5, 10), displayWords.slice(10, 15)];
          return <div className="flex gap-3 h-full">
              {columns.map((col, colIdx) => <div key={`col-${colIdx}`} className="flex-1 flex flex-col gap-1" style={{
              height: '100%'
            }}>
                  {Array.from({
                length: 5
              }).map((_, idx) => {
                const word = col[idx];
                const globalIdx = colIdx * 5 + idx;
                return <div key={word?.id || `empty-${colIdx}-${idx}`} style={{
                  height: cardHeight,
                  flexShrink: 0,
                  flexGrow: 0
                }}>
                      {word ? <WordCard word={word} index={startWordIndex + globalIdx + 1} cardIndex={startWordIndex + globalIdx} absoluteWordNumber={globalWordOffset + startWordIndex + globalIdx + 1} themeColor={config.themeColor} secondaryColor={secondaryColor} showExample={showExamples} onDeleteSynonym={onDeleteSynonym} onDeleteAntonym={onDeleteAntonym} configTitle={config.title} /> : <div className="h-full rounded-lg border border-dashed bg-white/50" style={{
                    borderColor: `${config.themeColor}15`
                  }} />}
                    </div>;
              })}
                </div>)}
            </div>;
        }
      })()}
      </div>

      {/* Footer — premium colored bar with page badge and brand mark */}
      {(() => {
        const themeColor = config.themeColor;
        const footerBase = darkenColor(themeColor, 0.25);
        const footerDark = darkenColor(themeColor, 0.45);

        const PageBadge = () => {
          const radius = 25;
          const circumference = 2 * Math.PI * (radius - 3);
          return (
            <div className="flex items-center flex-shrink-0" style={{ position: 'relative' }}>
              {/* Decorative dotted ring */}
              <svg width={radius * 2} height={radius * 2} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <circle cx={radius} cy={radius} r={radius - 2} fill="none" stroke={`${themeColor}40`} strokeWidth="1" strokeDasharray="3 3" />
                <circle cx={radius} cy={radius} r={radius - 6} fill="none" stroke={`${themeColor}25`} strokeWidth="0.5" />
              </svg>
              {/* Main circular badge */}
              <div className="flex items-center justify-center" style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, ${footerBase} 0%, ${footerDark} 100%)`,
                boxShadow: `0 4px 12px -5px ${themeColor}60`,
                position: 'relative',
                zIndex: 1
              }}>
                <div className="flex flex-col items-center justify-center" style={{ lineHeight: 1 }}>
                  <span style={{
                    fontFamily: '"Orbitron", "Playfair Display", serif',
                    fontWeight: 700, fontSize: '15px', color: '#ffffff',
                    letterSpacing: '-0.02em', lineHeight: 0.95
                  }}>{String(absolutePageNum).padStart(2, '0')}</span>
                  <span style={{
                    fontFamily: '"Orbitron", serif', fontSize: '5.5px',
                    color: 'rgba(255,255,255,0.8)', letterSpacing: '0.18em', fontWeight: 500,
                    marginTop: '1px'
                  }}>PAGE</span>
                </div>
              </div>
              {/* Side diamond accents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '8px' }}>
                <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: `${themeColor}70` }} />
                <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: `${themeColor}40` }} />
                <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: `${themeColor}70` }} />
              </div>
            </div>
          );
        };
        const Meta = () => (
          <div className="flex items-center gap-3 min-w-0" style={{ lineHeight: 1 }}>
            <span style={{
              fontFamily: '"Orbitron", serif', fontWeight: 700, fontSize: '8px',
              color: '#7a7a7a', letterSpacing: '0.42em', whiteSpace: 'nowrap'
            }}>ORUN&nbsp;·&nbsp;ENGLISH</span>
            <span style={{ width: '3px', height: '3px', background: `${themeColor}90`, transform: 'rotate(45deg)', display: 'inline-block' }} />
            <span style={{
              fontFamily: '"Noto Sans KR", sans-serif', fontSize: '8.5px',
              color: '#9a9a9a', letterSpacing: '0.05em', whiteSpace: 'nowrap'
            }}>{getTitleWithoutSchool(config.title)}</span>
          </div>
        );
        return (
          <div className="flex-shrink-0 mb-5 relative" style={{ marginLeft: leftMargin, marginRight: rightMargin }}>
            {/* Decorative top rule with dots */}
            <div className="flex items-center justify-center mb-2" style={{ height: '1px' }}>
              <div style={{ flex: 1, height: '1px', background: isLeftPage ? `linear-gradient(90deg, ${themeColor}80, ${themeColor}15 60%, transparent)` : `linear-gradient(90deg, transparent, ${themeColor}15 40%, ${themeColor}80)` }} />
              <div className="mx-2" style={{ width: '5px', height: '5px', transform: 'rotate(45deg)', background: `${themeColor}80` }} />
              <div className="mx-1" style={{ width: '3px', height: '3px', transform: 'rotate(45deg)', background: `${themeColor}50` }} />
              <div className="mx-2" style={{ width: '5px', height: '5px', transform: 'rotate(45deg)', background: `${themeColor}80` }} />
              <div style={{ flex: 1, height: '1px', background: isLeftPage ? `linear-gradient(90deg, transparent, ${themeColor}15 40%, ${themeColor}80)` : `linear-gradient(90deg, ${themeColor}80, ${themeColor}15 60%, transparent)` }} />
            </div>
            <div className="flex items-end justify-between">
              {isLeftPage ? (<><PageBadge /><Meta /></>) : (<><Meta /><PageBadge /></>)}
            </div>
          </div>
        );
      })()}
    </div>;
}
function CoverPage({
  totalDays,
  totalWords,
  totalPages,
  config
}: {
  totalDays: number;
  totalWords: number;
  totalPages: number;
  config: WorkbookConfig;
}) {
  const volumeNumber = config.title.match(/\d+/)?.[0] || '';
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);

  return <div className="page-b5 shadow-2xl relative overflow-hidden" style={{
    width: '840px',
    height: '1188px',
    background: '#fefdfb'
  }}>
    {/* Hairline frame */}
    <div style={{ position: 'absolute', inset: '22px', border: `0.5px solid ${bgColor}`, zIndex: 5, pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', inset: '34px', border: `1px solid ${bgColor}`, zIndex: 5, pointerEvents: 'none' }} />

    <div style={{
      position: 'absolute', inset: '60px', zIndex: 15,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px',
    }}>
      <div style={{
        fontSize: '11px', fontFamily: '"Orbitron", serif', fontWeight: 500,
        color: bgColor, letterSpacing: '0.4em',
      }}>VOCABULARY COLLECTION</div>

      <div style={{
        fontSize: '56px', fontFamily: '"Orbitron", serif', fontWeight: 700,
        color: bgColor, letterSpacing: '0.04em', lineHeight: 1,
      }}>ORUN VOCA</div>

      <div style={{ width: '48px', height: '1px', background: bgColor }} />

      {volumeNumber && (
        <div style={{
          fontSize: '120px', fontFamily: '"Orbitron", serif', fontWeight: 700,
          color: bgColor, lineHeight: 0.9,
        }}>{volumeNumber}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginTop: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontFamily: '"Orbitron", serif', fontWeight: 700, color: '#1a1a1a' }}>{totalDays}</div>
          <div style={{ fontSize: '9px', color: bgColor, letterSpacing: '0.3em', marginTop: '6px', fontFamily: '"Orbitron", serif' }}>DAYS</div>
        </div>
        <div style={{ width: '1px', height: '48px', background: `${bgColor}40` }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontFamily: '"Orbitron", serif', fontWeight: 700, color: '#1a1a1a' }}>{totalWords}</div>
          <div style={{ fontSize: '9px', color: bgColor, letterSpacing: '0.3em', marginTop: '6px', fontFamily: '"Orbitron", serif' }}>WORDS</div>
        </div>
      </div>
    </div>

    <div style={{
      position: 'absolute', bottom: '46px', left: 0, right: 0, textAlign: 'center', zIndex: 15,
      fontSize: '9px', fontFamily: '"Orbitron", serif', color: bgColor, letterSpacing: '0.35em',
    }}>ORUN ENGLISH</div>
  </div>;
}

function __CoverPage_deprecated_unused() {
  const bgColor = '#000';
  const darkerBg = '#000';
  const volumeNumber = '';
  const totalDays = 0;
  const totalWords = 0;
  return <>
    {/* === Left spine bar === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '10px',
      height: '100%',
      background: `linear-gradient(180deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      zIndex: 20
    }} />

    {/* Subtle gradient wash */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '60%',
      height: '50%',
      background: `radial-gradient(ellipse at top right, ${lightenColor(bgColor, 0.75)}40 0%, transparent 70%)`,
      zIndex: 1
    }} />

    {/* === Bottom colored accent strip === */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '120px',
      background: `linear-gradient(145deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 2
    }} />

    {/* Herringbone texture on accent strip */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '120px',
      clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 3,
      opacity: 0.06,
      backgroundImage: `
        linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff)
      `,
      backgroundSize: '80px 140px'
    }} />

    {/* Ghost volume number */}
    {volumeNumber && (
      <div style={{
        position: 'absolute',
        right: '-10px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '400px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 900,
        color: bgColor,
        opacity: 0.04,
        letterSpacing: '-0.03em',
        userSelect: 'none',
        zIndex: 4,
        lineHeight: 0.8
      }}>
        {volumeNumber}
      </div>
    )}

    {/* === Main content === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 48px 40px 52px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '6px', overflow: 'hidden',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: '#aaa',
            letterSpacing: '0.15em'
          }}>ORUN ENGLISH</span>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
          color: '#fff',
          padding: '5px 16px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          boxShadow: `0 2px 10px ${bgColor}30`
        }}>
          CONTENTS
        </div>
      </div>

      {/* Double line separator */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}40, #e0e0e0, transparent)`, marginBottom: '2px' }} />
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}20, #eee, transparent)` }} />
      </div>

      {/* Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontSize: '44px',
          fontFamily: '"Orbitron", "Playfair Display", serif',
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          lineHeight: 1,
          marginBottom: '14px',
          whiteSpace: 'nowrap'
        }}>
          ORUN VOCA
        </div>

        {/* Accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          <div style={{ width: '30px', height: '2px', background: bgColor, borderRadius: '2px' }} />
          <div style={{ width: '6px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
          <div style={{ width: '3px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
        </div>

        {/* Subtitle label */}
        <div style={{
          fontSize: '11px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 500,
          color: '#aaa',
          letterSpacing: '0.3em',
          marginBottom: '40px'
        }}>
          Vocabulary Collection
        </div>

        {/* Volume */}
        {volumeNumber && (
          <div style={{
            fontSize: '68px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 900,
            color: bgColor,
            lineHeight: 1,
            marginBottom: '40px'
          }}>
            {volumeNumber}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              color: '#1a1a1a'
            }}>{totalDays}</div>
            <div style={{
              fontSize: '10px',
              color: '#aaa',
              letterSpacing: '0.3em',
              marginTop: '6px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 500
            }}>DAYS</div>
          </div>
          <div style={{ width: '1px', height: '48px', background: '#e0e0e0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              color: '#1a1a1a'
            }}>{totalWords}</div>
            <div style={{
              fontSize: '10px',
              color: '#aaa',
              letterSpacing: '0.3em',
              marginTop: '6px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 500
            }}>WORDS</div>
          </div>
        </div>
      </div>

      {/* Bottom branding on accent strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '12px'
      }}>
        <span style={{
          color: '#bbb',
          fontSize: '10px',
          letterSpacing: '0.2em',
          fontWeight: 500,
          fontFamily: '"Noto Sans KR", sans-serif'
        }}>
          ORUN ENGLISH
        </span>
      </div>
    </div>
  </>;
}
// Appendix Divider Page Component - 프리미엄 에디토리얼 디자인
function AppendixDividerPage({
  config,
  totalDays,
  testCount,
  title = 'MINI BOOK'
}: {
  config: WorkbookConfig;
  totalDays: number;
  testCount: number;
  title?: string;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="appendix-divider" style={{
    width: '840px',
    height: '1188px',
    background: '#FAFAF8'
  }}>
    {/* === Left spine bar === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '10px',
      height: '100%',
      background: `linear-gradient(180deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      zIndex: 20
    }} />

    {/* Subtle gradient wash */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '60%',
      height: '50%',
      background: `radial-gradient(ellipse at bottom left, ${lightenColor(bgColor, 0.75)}40 0%, transparent 70%)`,
      zIndex: 1
    }} />

    {/* === Bottom colored accent strip === */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100px',
      background: `linear-gradient(145deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 2
    }} />

    {/* Herringbone texture on accent strip */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100px',
      clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 3,
      opacity: 0.06,
      backgroundImage: `
        linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff)
      `,
      backgroundSize: '80px 140px'
    }} />

    {/* Ghost text */}
    <div style={{
      position: 'absolute',
      right: '-20px',
      top: '45%',
      transform: 'translateY(-50%)',
      fontSize: '280px',
      fontFamily: '"Orbitron", serif',
      fontWeight: 900,
      color: bgColor,
      opacity: 0.04,
      letterSpacing: '-0.03em',
      userSelect: 'none',
      zIndex: 4,
      lineHeight: 0.8
    }}>
      T
    </div>

    {/* === Main content === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 48px 40px 52px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '6px', overflow: 'hidden',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: '#aaa',
            letterSpacing: '0.15em'
          }}>ORUN ENGLISH</span>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
          color: '#fff',
          padding: '5px 16px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          boxShadow: `0 2px 10px ${bgColor}30`
        }}>
          APPENDIX
        </div>
      </div>

      {/* Double line separator */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}40, #e0e0e0, transparent)`, marginBottom: '2px' }} />
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}20, #eee, transparent)` }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Series label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div style={{ width: '3px', height: '16px', background: bgColor, borderRadius: '2px' }} />
          <span style={{
            fontSize: '10px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: bgColor,
            letterSpacing: '0.45em',
            textTransform: 'uppercase'
          }}>Test Section</span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: '42px',
          fontFamily: '"Orbitron", "Playfair Display", serif',
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          marginBottom: '14px'
        }}>
          {title}
        </div>

        {/* Accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          <div style={{ width: '30px', height: '2px', background: bgColor, borderRadius: '2px' }} />
          <div style={{ width: '6px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
          <div style={{ width: '3px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '12px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 400,
          color: '#aaa',
          letterSpacing: '0.15em',
          marginBottom: '48px'
        }}>
          Tests & Answer Keys
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', marginBottom: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '32px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              color: bgColor
            }}>{totalDays}</div>
            <div style={{
              fontSize: '10px',
              color: '#aaa',
              letterSpacing: '0.2em',
              marginTop: '4px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 500
            }}>DAYS</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#e0e0e0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '32px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 800,
              color: bgColor
            }}>{testCount}</div>
            <div style={{
              fontSize: '10px',
              color: '#aaa',
              letterSpacing: '0.2em',
              marginTop: '4px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 500
            }}>TESTS</div>
          </div>
        </div>

        {/* Test list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['뜻맞추기 테스트 (Meaning Test)', '스펠링 테스트 (Spelling Test)', '예문 빈칸 채우기 (Sentence Fill)', '정답지 (Answer Keys)'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: bgColor, opacity: 0.4 }} />
              <span style={{
                fontSize: '12px',
                color: '#888',
                fontFamily: '"Noto Sans KR", sans-serif'
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom description */}
      <div style={{
        fontSize: '11px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 400,
        color: '#bbb',
        textAlign: 'center',
        letterSpacing: '0.02em'
      }}>
        이 섹션에는 각 Day별 테스트와 정답지가 포함되어 있습니다.
      </div>
    </div>

    {/* Diagonal decorative line */}
    <div style={{
      position: 'absolute',
      bottom: '95px',
      left: '10px',
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, ${bgColor}60 0%, ${bgColor}15 100%)`,
      transform: 'rotate(-1deg)',
      transformOrigin: 'left center',
      zIndex: 5
    }} />
  </div>;
}
function DayDividerPage({
  day,
  wordCount,
  config,
  dayIndex
}: {
  day: string;
  wordCount: number;
  config: WorkbookConfig;
  dayIndex: number;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);
  const dayNumber = day.replace(/\D/g, '').padStart(2, '0');

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="day-divider" style={{
    width: '840px',
    height: '1188px',
    background: '#fefdfb'
  }}>
    {/* Hairline frame */}
    <div style={{ position: 'absolute', inset: '22px', border: `0.5px solid ${bgColor}`, zIndex: 5, pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', inset: '34px', border: `1px solid ${bgColor}`, zIndex: 5, pointerEvents: 'none' }} />

    <div style={{
      position: 'absolute', inset: '60px', zIndex: 15,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontSize: '12px', fontFamily: '"Orbitron", serif', fontWeight: 500,
        color: bgColor, letterSpacing: '0.5em', marginBottom: '16px',
      }}>DAILY LESSON</div>

      <div style={{ width: '120px', height: '1px', background: bgColor, marginBottom: '40px' }} />

      <div style={{
        fontSize: '220px', fontFamily: '"Orbitron", serif', fontWeight: 700,
        color: bgColor, lineHeight: 0.9, letterSpacing: '0.02em',
      }}>{dayNumber}</div>

      <div style={{
        fontSize: '48px', fontFamily: '"Orbitron", serif', fontWeight: 400,
        color: '#1a1a1a', letterSpacing: '0.4em', marginTop: '20px',
      }}>DAY</div>

      <div style={{ width: '48px', height: '1px', background: `${bgColor}60`, margin: '32px 0' }} />

      <div style={{
        fontSize: '11px', fontFamily: '"Orbitron", serif', fontWeight: 500,
        color: '#888', letterSpacing: '0.3em',
      }}>{wordCount} WORDS</div>
    </div>

    <div style={{
      position: 'absolute', bottom: '46px', left: 0, right: 0,
      display: 'flex', justifyContent: 'center', gap: '20px', zIndex: 15,
      fontSize: '9px', fontFamily: '"Orbitron", serif', color: bgColor, letterSpacing: '0.25em',
    }}>
      <span>{getTitleWithoutSchool(config.title)}</span>
      <span style={{ color: `${bgColor}60` }}>·</span>
      <span>ORUN ENGLISH</span>
    </div>
  </div>;
}

function __DayDivider_deprecated_unused() {
  const bgColor = '#000';
  const darkerBg = '#000';
  const dayNumber = '';
  const wordCount = 0;
  const config: any = { coverStyle: 'premium' };
  return <>
    {/* === Left spine bar === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '10px',
      height: '100%',
      background: `linear-gradient(180deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      zIndex: 20
    }} />

    {/* === Bottom colored section with diagonal === */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '35%',
      background: `linear-gradient(145deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      clipPath: 'polygon(0 22%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 2
    }} />

    {/* Herringbone texture */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '35%',
      clipPath: 'polygon(0 22%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 3,
      opacity: 0.06,
      backgroundImage: `
        linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(60deg, rgba(255,255,255,0.4) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.4) 75%),
        linear-gradient(60deg, rgba(255,255,255,0.4) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.4) 75%)
      `,
      backgroundSize: '80px 140px',
      backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
    }} />

    {/* Subtle gradient wash */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '60%',
      height: '50%',
      background: `radial-gradient(ellipse at top right, ${lightenColor(bgColor, 0.75)}40 0%, transparent 70%)`,
      zIndex: 1
    }} />

    {/* Ghost day number */}
    <div style={{
      position: 'absolute',
      right: '-20px',
      top: '35%',
      transform: 'translateY(-50%)',
      fontSize: '420px',
      fontFamily: '"Noto Sans KR", sans-serif',
      fontWeight: 900,
      color: bgColor,
      opacity: 0.05,
      letterSpacing: '-0.03em',
      userSelect: 'none',
      zIndex: 4,
      lineHeight: 0.8
    }}>
      {dayNumber}
    </div>

    {/* Diagonal decorative line */}
    <div style={{
      position: 'absolute',
      top: '63%',
      left: '10px',
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, ${bgColor}60 0%, ${bgColor}15 100%)`,
      transform: 'rotate(-2.5deg)',
      transformOrigin: 'left center',
      zIndex: 5
    }} />

    {/* === Main content === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 48px 40px 52px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '6px', overflow: 'hidden',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: '#aaa',
            letterSpacing: '0.15em'
          }}>ORUN ENGLISH</span>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
          color: '#fff',
          padding: '5px 16px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          boxShadow: `0 2px 10px ${bgColor}30`
        }}>
          VOCABULARY
        </div>
      </div>

      {/* Double line separator */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}40, #e0e0e0, transparent)`, marginBottom: '2px' }} />
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}20, #eee, transparent)` }} />
      </div>

      {/* Hero section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
        {/* Series label with left accent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div style={{ width: '3px', height: '16px', background: bgColor, borderRadius: '2px' }} />
          <span style={{
            fontSize: '10px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: bgColor,
            letterSpacing: '0.45em',
            textTransform: 'uppercase'
          }}>Daily Lesson</span>
        </div>

        {/* DAY label */}
        <div style={{
          fontSize: '24px',
          fontFamily: '"Orbitron", "Playfair Display", serif',
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.15em',
          marginBottom: '8px'
        }}>
          DAY
        </div>

        {/* Day number */}
        <div style={{
          fontSize: '120px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 900,
          color: config.coverStyle === 'lite' ? '#A0926B' : '#C0C0C0',
          lineHeight: 0.9,
          letterSpacing: '0.02em',
          marginBottom: '16px'
        }}>
          {dayNumber}
        </div>

        {/* Accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '3px', background: bgColor, borderRadius: '2px' }} />
          <div style={{ width: '8px', height: '3px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
          <div style={{ width: '4px', height: '3px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
        </div>

        {/* Word count */}
        <div style={{
          fontSize: '13px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 500,
          color: '#aaa',
          letterSpacing: '0.15em'
        }}>
          {wordCount} WORDS
        </div>
      </div>

      {/* Bottom section on colored area */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '12px'
        }}>
          <span style={{
            fontSize: '8px',
            fontFamily: '"Noto Sans KR", sans-serif',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.06em'
          }}>www.orunenglish.com</span>
          <span style={{
            fontSize: '9px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.1em'
          }}>ORUN ENGLISH</span>
        </div>
      </div>
    </div>
  </>;
}

// Part metadata for Ultimate workbook
const ULTIMATE_PARTS: Record<number, { title: string; themeColor: string; secondaryColor: string }> = {
  1: { title: '중등 필수 어휘', themeColor: '#7BAFD4', secondaryColor: '#4A8BB5' },
  2: { title: '중등 고난도 어휘', themeColor: '#7BC4A0', secondaryColor: '#5AA87E' },
  3: { title: '고등 기본 어휘', themeColor: '#9B8EC4', secondaryColor: '#7A6DAA' },
  4: { title: '고등 필수 어휘', themeColor: '#E8967A', secondaryColor: '#D47A5E' },
  5: { title: '고등 고난도 어휘', themeColor: '#5BA8A4', secondaryColor: '#458D89' },
  6: { title: '고등 어휘 완성', themeColor: '#B8A08A', secondaryColor: '#9D856F' },
  7: { title: '고난도숙어', themeColor: '#C4697A', secondaryColor: '#A85060' },
};

// Table of Contents Page Component
function TableOfContentsPage({
  config,
  tocEntries,
  pageIndex,
  totalTocPages,
  absolutePageNum,
}: {
  config: WorkbookConfig;
  tocEntries: { label: string; page: number; isPartHeader?: boolean; partColor?: string; wordCount?: number; headwordCount?: number; derivativeCount?: number; partTitle?: string }[];
  pageIndex: number;
  totalTocPages: number;
  absolutePageNum: number;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);

  return (
    <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="toc" style={{
      width: '840px',
      height: '1188px',
      background: '#fefdfb',
    }}>
      {/* Hairline frame */}
      <div style={{ position: 'absolute', inset: '22px', border: `0.5px solid ${bgColor}`, zIndex: 5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '34px', border: `1px solid ${bgColor}`, zIndex: 5, pointerEvents: 'none' }} />

      {/* Watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-20deg)',
        fontSize: '120px',
        fontFamily: '"Orbitron", serif',
        fontWeight: 700,
        color: bgColor,
        opacity: 0.04,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        zIndex: 1,
      }}>
        ORUN VOCA
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '72px 76px 60px 76px',
        display: 'flex', flexDirection: 'column',
        height: '100%', boxSizing: 'border-box',
      }}>
        {/* Header */}
        {pageIndex === 0 && (
          <div style={{ marginBottom: '36px', borderBottom: `1px solid ${bgColor}`, paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{
                fontSize: '32px', fontFamily: '"Orbitron", serif', fontWeight: 700,
                color: bgColor, letterSpacing: '0.25em',
              }}>CONTENTS</div>
              <div style={{
                fontSize: '11px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 500,
                color: '#888', letterSpacing: '0.3em',
              }}>목차 · {getTitleWithoutSchool(config.title)}</div>
            </div>
          </div>
        )}

        {/* TOC entries - explicit 2-column layout */}
        {(() => {
          const regularEntries = tocEntries.filter(e => !e.isPartHeader);
          const partHeaders = tocEntries.filter(e => e.isPartHeader);

          const renderDottedLine = () => (
            <div style={{
              flex: 1,
              borderBottom: '1.5px dotted #b8b0a8',
              marginBottom: '4px',
              minWidth: '20px',
              opacity: 0.85,
            }} />
          );

          // Single-column stacked layout: top-to-bottom, like a book's table of contents
          if (partHeaders.length === 0) {
            const entryHeight = 28; // fixed height for a compact, top-stacked list
            const visibleEntries = regularEntries; // pagination upstream guarantees fit

            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '4px', paddingTop: '4px' }}>
                {visibleEntries.map((entry, idx) => (
                  <div key={`single-${idx}`} style={{
                    height: `${entryHeight}px`,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '0 8px',
                    borderBottom: `0.5px solid ${bgColor}15`,
                    boxSizing: 'border-box' as const,
                  }}>
                    <span style={{
                      fontSize: '13.5px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600,
                      color: '#1a1a1a', minWidth: '86px', letterSpacing: '0.01em',
                    }}>
                      {entry.label}
                    </span>
                    {entry.wordCount !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '9.5px', fontFamily: '"Noto Sans KR", sans-serif',
                          color: '#fff', fontWeight: 700, background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
                          padding: '3px 7px', borderRadius: '8px',
                        }}>
                          표제어 {entry.headwordCount ?? entry.wordCount}
                        </span>
                        {entry.derivativeCount !== undefined && entry.derivativeCount > 0 && (
                          <span style={{
                            fontSize: '9.5px', fontFamily: '"Noto Sans KR", sans-serif',
                            color: bgColor, fontWeight: 700, background: `${bgColor}10`, border: `1px solid ${bgColor}30`,
                            padding: '2px 6px', borderRadius: '8px',
                          }}>
                            파생어 {entry.derivativeCount}
                          </span>
                        )}
                      </div>
                    )}
                    {renderDottedLine()}
                    <span style={{
                      fontSize: '13px', fontFamily: '"Orbitron", serif', fontWeight: 700,
                      color: bgColor, minWidth: '32px', textAlign: 'right' as const,
                    }}>
                      {entry.page}
                    </span>
                  </div>
                ))}
              </div>
            );
          }

          // For part-based (Ultimate) workbooks, also use a single stacked column
          const headerHeight = 36; // part header row
          const dayHeight = 28;    // day entry row

          const renderEntry = (entry: typeof tocEntries[0], idx: number) => (
            entry.isPartHeader ? (
              <div key={idx} style={{
                height: `${headerHeight}px`,
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0 8px',
                boxSizing: 'border-box' as const,
                borderBottom: `0.5px solid ${bgColor}12`,
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: `linear-gradient(135deg, ${entry.partColor || bgColor}, ${darkenColor(entry.partColor || bgColor, 0.2)})`,
                  padding: '4px 14px', borderRadius: '20px',
                  boxShadow: `0 2px 10px ${(entry.partColor || bgColor)}30`,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '10px', fontFamily: '"Orbitron", serif', fontWeight: 700, color: '#fff' }}>
                    {entry.label}
                  </span>
                </div>
                {entry.partTitle && (
                  <span style={{ fontSize: '11px', fontFamily: '"Noto Sans KR", sans-serif', color: '#444', fontWeight: 600, flexShrink: 0 }}>
                    {entry.partTitle}
                  </span>
                )}
                {entry.wordCount !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '9.5px', fontFamily: '"Noto Sans KR", sans-serif',
                      color: '#fff', fontWeight: 700, background: `linear-gradient(135deg, ${entry.partColor || bgColor}, ${darkenColor(entry.partColor || bgColor, 0.2)})`,
                      padding: '2px 6px', borderRadius: '8px',
                    }}>
                      표제어 {entry.headwordCount ?? entry.wordCount}
                    </span>
                    {entry.derivativeCount !== undefined && entry.derivativeCount > 0 && (
                      <span style={{
                        fontSize: '9.5px', fontFamily: '"Noto Sans KR", sans-serif',
                        color: entry.partColor || bgColor, fontWeight: 700, background: `${(entry.partColor || bgColor)}10`, border: `1px solid ${(entry.partColor || bgColor)}30`,
                        padding: '2px 6px', borderRadius: '8px',
                      }}>
                        파생어 {entry.derivativeCount}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${(entry.partColor || bgColor)}35, transparent)`, minWidth: '10px' }} />
                <span style={{ fontSize: '12px', fontFamily: '"Orbitron", serif', fontWeight: 700, color: bgColor, minWidth: '28px', textAlign: 'right' as const, flexShrink: 0 }}>
                  {entry.page}
                </span>
              </div>
            ) : (
              <div key={idx} style={{
                height: `${dayHeight}px`,
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0 8px',
                boxSizing: 'border-box' as const,
                borderBottom: `0.5px solid ${bgColor}12`,
              }}>
                <span style={{
                  fontSize: '13px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600,
                  color: '#1a1a1a', minWidth: '86px', letterSpacing: '0.01em',
                }}>
                  {entry.label}
                </span>
                {entry.wordCount !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '9.5px', fontFamily: '"Noto Sans KR", sans-serif',
                      color: '#fff', fontWeight: 700, background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
                      padding: '2px 7px', borderRadius: '8px',
                    }}>
                      표제어 {entry.headwordCount ?? entry.wordCount}
                    </span>
                    {entry.derivativeCount !== undefined && entry.derivativeCount > 0 && (
                      <span style={{
                        fontSize: '9.5px', fontFamily: '"Noto Sans KR", sans-serif',
                        color: bgColor, fontWeight: 700, background: `${bgColor}10`, border: `1px solid ${bgColor}30`,
                        padding: '2px 6px', borderRadius: '8px',
                      }}>
                        파생어 {entry.derivativeCount}
                      </span>
                    )}
                  </div>
                )}
                {renderDottedLine()}
                <span style={{
                  fontSize: '12px', fontFamily: '"Orbitron", serif', fontWeight: 700,
                  color: bgColor, minWidth: '28px', textAlign: 'right' as const,
                }}>
                  {entry.page}
                </span>
              </div>
            )
          );

          return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '4px', paddingTop: '4px' }}>
            {tocEntries.map(renderEntry)}
          </div>;
        })()}

        {/* Footer - unified editorial style */}
        <div style={{ flexShrink: 0, position: 'relative', marginLeft: '36px', marginRight: '16px' }}>
          {/* Top separator line */}
          <div style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${bgColor}18 20%, ${darkerBg}15 50%, ${bgColor}18 80%, transparent 100%)`,
            marginBottom: '8px'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', height: '32px', justifyContent: absolutePageNum % 2 === 0 ? 'flex-start' : 'flex-end' }}>
            {absolutePageNum % 2 === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: bgColor, fontFamily: '"Orbitron", serif' }}>{absolutePageNum}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: `${bgColor}30` }} />
                  <div style={{ width: '32px', height: '1px', background: `${bgColor}20` }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#888', fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '0.02em' }}>{getTitleWithoutSchool(config.title)}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: darkerBg, fontFamily: '"Orbitron", serif', letterSpacing: '0.05em' }}>TABLE OF CONTENTS</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: darkerBg, fontFamily: '"Orbitron", serif', letterSpacing: '0.05em' }}>TABLE OF CONTENTS</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#888', fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '0.02em' }}>{getTitleWithoutSchool(config.title)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '32px', height: '1px', background: `${bgColor}20` }} />
                  <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: `${bgColor}30` }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: bgColor, fontFamily: '"Orbitron", serif' }}>{absolutePageNum}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPartFromDayName(dayName: string): number | null {
  const match = dayName.match(/\[Part\s*(\d+)\]/i);
  return match ? parseInt(match[1]) : null;
}

function getDayNumberFromPartDay(dayName: string): string {
  const match = dayName.match(/DAY\s*(\d+)/i);
  return match ? match[1].padStart(2, '0') : '01';
}

// Part Divider Page Component
function PartDividerPage({ partNumber, config, totalDays, totalWords }: { partNumber: number; config: WorkbookConfig; totalDays?: number; totalWords?: number }) {
  const partMeta = ULTIMATE_PARTS[partNumber];
  if (!partMeta) return null;
  const bgColor = partMeta.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);
  const lighterBg = lightenColor(bgColor, 0.15);

  return <div className="page-b5 shadow-2xl relative overflow-hidden" data-page-type="part-divider" style={{
    width: '840px',
    height: '1188px',
    background: '#FAFAF8'
  }}>
    {/* Left spine bar - thicker with gradient accent */}
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '12px', height: '100%',
      background: `linear-gradient(180deg, ${lighterBg} 0%, ${bgColor} 30%, ${darkerBg} 100%)`, zIndex: 20
    }} />
    {/* Spine inner highlight */}
    <div style={{
      position: 'absolute', top: 0, left: '12px', width: '2px', height: '100%',
      background: `linear-gradient(180deg, ${bgColor}20 0%, ${bgColor}08 100%)`, zIndex: 20
    }} />

    {/* Bottom colored section - larger area */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
      background: `linear-gradient(145deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      clipPath: 'polygon(0 22%, 100% 0%, 100% 100%, 0 100%)', zIndex: 2
    }} />

    {/* Herringbone texture */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
      clipPath: 'polygon(0 22%, 100% 0%, 100% 100%, 0 100%)', zIndex: 3, opacity: 0.08,
      backgroundImage: `
        linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(30deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(150deg, #fff 12%, transparent 12.5%, transparent 87%, #fff 87.5%, #fff),
        linear-gradient(60deg, rgba(255,255,255,0.4) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.4) 75%),
        linear-gradient(60deg, rgba(255,255,255,0.4) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.4) 75%)
      `,
      backgroundSize: '80px 140px',
      backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
    }} />

    {/* Ghost part number - larger and more dramatic */}
    <div style={{
      position: 'absolute', right: '-30px', top: '32%', transform: 'translateY(-50%)',
      fontSize: '600px', fontFamily: '"Orbitron", serif', fontWeight: 700,
      color: bgColor, opacity: 0.04, letterSpacing: '-0.03em', userSelect: 'none', zIndex: 4, lineHeight: 0.8
    }}>
      {partNumber}
    </div>

    {/* Top-right radial glow */}
    <div style={{
      position: 'absolute', top: 0, right: 0, width: '65%', height: '55%',
      background: `radial-gradient(ellipse at top right, ${lightenColor(bgColor, 0.75)}50 0%, transparent 65%)`, zIndex: 1
    }} />

    {/* Decorative diamond cluster - top right */}
    <div style={{ position: 'absolute', top: '80px', right: '60px', zIndex: 5 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '6px', height: '6px', background: bgColor, opacity: 0.12 - i * 0.03,
          transform: 'rotate(45deg)', position: 'absolute',
          top: `${i * 14}px`, right: `${i * 14}px`
        }} />
      ))}
    </div>

    {/* Decorative horizontal lines - upper area */}
    <div style={{ position: 'absolute', top: '200px', left: '52px', right: '48px', zIndex: 5 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          height: '1px', marginBottom: '4px',
          background: `linear-gradient(90deg, ${bgColor}${i === 0 ? '18' : '08'}, transparent 60%)`,
          width: `${70 - i * 15}%`
        }} />
      ))}
    </div>

    {/* Main content */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15,
      display: 'flex', flexDirection: 'column', padding: '48px 48px 40px 56px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px', overflow: 'hidden',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '10px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600, color: '#aaa', letterSpacing: '0.15em' }}>ORUN ENGLISH</span>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`, color: '#fff',
          padding: '5px 14px', borderRadius: '3px', fontSize: '8.5px',
          fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700, letterSpacing: '0.04em',
          whiteSpace: 'nowrap'
        }}>
          ORUN VOCA 얼티밋
        </div>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <div style={{ height: '1.5px', background: `linear-gradient(90deg, ${bgColor}50, #e0e0e0, transparent)`, marginBottom: '2px' }} />
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}20, #eee, transparent)` }} />
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '30px' }}>
        {/* Series label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '18px', background: bgColor, borderRadius: '2px' }} />
          <span style={{
            fontSize: '10px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600,
            color: bgColor, letterSpacing: '0.45em', textTransform: 'uppercase' as const
          }}>ORUN VOCA ULTIMATE SERIES</span>
        </div>

        {/* "PART" label - badge style */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          padding: '8px 22px 8px 18px', borderRadius: '40px', marginBottom: '14px',
          boxShadow: `0 4px 16px ${bgColor}30`
        }}>
          <span style={{
            fontSize: '13px', fontFamily: '"Orbitron", serif',
            fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.2em'
          }}>PART</span>
          <span style={{
            fontSize: '28px', fontFamily: '"Orbitron", serif',
            fontWeight: 700, color: '#fff', lineHeight: 1
          }}>{partNumber}</span>
        </div>

        {/* Large part number + title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '8px' }}>
          {/* Big number */}
          <div style={{
            fontSize: '120px', fontFamily: '"Orbitron", serif', fontWeight: 700,
            color: bgColor, lineHeight: 0.85, letterSpacing: '-0.02em', opacity: 0.15
          }}>
            {partNumber}
          </div>
          {/* Title block */}
          <div style={{ paddingBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 800, color: '#666666', lineHeight: 1.2 }}>
              {partMeta.title}
            </div>
          </div>
        </div>

        {/* Accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '28px' }}>
          <div style={{ width: '50px', height: '3px', background: bgColor, borderRadius: '2px' }} />
          <div style={{ width: '12px', height: '3px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
          <div style={{ width: '6px', height: '3px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
        </div>

        {/* Stats cards */}
        {(totalDays || totalWords) && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            {totalDays != null && (
              <div style={{
                background: `linear-gradient(135deg, ${bgColor}12, ${bgColor}06)`,
                border: `1px solid ${bgColor}20`,
                borderRadius: '8px', padding: '14px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}>
                <span style={{ fontSize: '28px', fontFamily: '"Orbitron", serif', fontWeight: 700, color: bgColor }}>
                  {totalDays}
                </span>
                <span style={{ fontSize: '9px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600, color: '#999', letterSpacing: '0.1em' }}>
                  DAYS
                </span>
              </div>
            )}
            {totalWords != null && (
              <div style={{
                background: `linear-gradient(135deg, ${bgColor}12, ${bgColor}06)`,
                border: `1px solid ${bgColor}20`,
                borderRadius: '8px', padding: '14px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}>
                <span style={{ fontSize: '28px', fontFamily: '"Orbitron", serif', fontWeight: 700, color: bgColor }}>
                  {totalWords?.toLocaleString()}
                </span>
                <span style={{ fontSize: '9px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600, color: '#999', letterSpacing: '0.1em' }}>
                  WORDS
                </span>
              </div>
            )}
          </div>
        )}

        {/* Slogan */}
        <div style={{
          marginTop: '8px', fontSize: '11px', fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 400, color: '#aaa', letterSpacing: '0.02em', lineHeight: 1.7
        }}>
          <div>English learning empowered by Christian value</div>
          <div>진리 안에서 인재를 만듭니다.</div>
        </div>
      </div>

      {/* Bottom - on colored area */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Feature tags */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {[`Part ${partNumber}`, partMeta.title, `${totalDays || 0} DAY`, `${totalWords?.toLocaleString() || 0} 단어`].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
              padding: '5px 13px', borderRadius: '3px', fontSize: '9px',
              fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 600,
              color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em'
            }}>
              {item}
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px'
        }}>
          <span style={{ fontSize: '8px', fontFamily: '"Noto Sans KR", sans-serif', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>www.orunenglish.com</span>
          <span style={{ fontSize: '9px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>ORUN ENGLISH</span>
        </div>
      </div>
    </div>
  </div>;
}
export function WorkbookPreview({
  dayGroups,
  onReset,
  config,
  onConfigChange,
  workbookId
}: WorkbookPreviewProps) {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(config.title);
  const [isGeneratingDefinitions, setIsGeneratingDefinitions] = useState(false);
  const [isUploadingExamples, setIsUploadingExamples] = useState(false);
  const [localDayGroups, setLocalDayGroups] = useState(dayGroups);
  const [derivativeRelations, setDerivativeRelations] = useState<Record<string, string>>({});
  const [isAnalyzingRelations, setIsAnalyzingRelations] = useState(false);
  const [isReassigningDerivatives, setIsReassigningDerivatives] = useState(false);
  const exampleFileRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const relationCacheKey = useMemo(() => workbookId ? `derivative-relations-v2:${workbookId}` : null, [workbookId]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const normalizeWord = (value: string) => value.toLowerCase().trim();

  const normalizeMeaningToken = (token: string) => {
    const trimmed = token.trim();
    const groups = [
      ['세계', '국제', '글로벌'],
      ['고용', '채용', '취업'],
      ['향상', '개선'],
      ['감소', '하락', '축소'],
      ['증가', '상승', '확대'],
      ['가능', '이용'],
      ['필요', '요구'],
    ];

    for (const group of groups) {
      if (group.some(g => trimmed.includes(g))) return group[0];
    }
    return trimmed;
  };

  const tokenizeMeaning = (meaning: string) =>
    meaning
      .split(/[\s,;·ㆍ/()\[\]{}~!?.:+-]+/)
      .map(normalizeMeaningToken)
      .filter(Boolean);

  const sharedMeaningScore = (a: string, b: string) => {
    const aSet = new Set(tokenizeMeaning(a));
    const bSet = new Set(tokenizeMeaning(b));
    let count = 0;
    for (const token of aSet) {
      if (bSet.has(token)) count += 1;
    }
    return count;
  };

  const rootScore = (a: string, b: string) => {
    const x = normalizeWord(a);
    const y = normalizeWord(b);
    if (!x || !y) return 0;
    if (x === y) return 10;
    if (x.includes(y) || y.includes(x)) return 8;
    let prefix = 0;
    const max = Math.min(x.length, y.length);
    while (prefix < max && x[prefix] === y[prefix]) prefix += 1;
    return prefix >= 4 ? prefix : 0;
  };

  const isEnglishSynonymHint = (a: string, b: string) => {
    const x = normalizeWord(a);
    const y = normalizeWord(b);
    const groups = [
      ['global', 'international'],
      ['hire', 'employ', 'employment'],
      ['improve', 'enhance'],
      ['decrease', 'reduce'],
    ];
    return groups.some(group => group.includes(x) && group.includes(y));
  };

  const isAntonymByPrefix = (a: string, b: string) => {
    const x = normalizeWord(a);
    const y = normalizeWord(b);
    if (!x || !y) return false;
    const prefixes = ['un', 'in', 'im', 'ir', 'dis', 'il', 'non'];
    for (const p of prefixes) {
      if (x === p + y || y === p + x) return true;
      // handle cases like employ/unemployed (root overlap with negating prefix)
      if (x.startsWith(p) && y.startsWith(x.slice(p.length).slice(0, 4)) && x.slice(p.length).length >= 4) return true;
      if (y.startsWith(p) && x.startsWith(y.slice(p.length).slice(0, 4)) && y.slice(p.length).length >= 4) return true;
    }
    return false;
  };

  const isAntonymByMeaning = (a: string, b: string) => {
    const antonymPairs = [
      ['고용', '실업'], ['고용', '해고'], ['찬성', '반대'], ['증가', '감소'],
      ['성공', '실패'], ['행복', '불행'], ['가능', '불가능'], ['안전', '위험'],
      ['출발', '도착'], ['시작', '끝'], ['공격', '방어'], ['긍정', '부정'],
      ['낙관', '비관'], ['수출', '수입'], ['허용', '금지'], ['포함', '제외'],
      ['존재', '부재'], ['유리', '불리'], ['합법', '불법'], ['의존', '독립'],
      ['능동', '수동'], ['직접', '간접'], ['공식', '비공식'], ['유죄', '무죄'],
    ];
    const aTok = tokenizeMeaning(a);
    const bTok = tokenizeMeaning(b);
    for (const [p, q] of antonymPairs) {
      if ((aTok.some(t => t.includes(p)) && bTok.some(t => t.includes(q))) ||
          (aTok.some(t => t.includes(q)) && bTok.some(t => t.includes(p)))) return true;
    }
    // Korean negation prefix pattern: 불/비/무/미 + same root
    const negPrefixes = ['불', '비', '무', '미'];
    for (const at of aTok) {
      for (const bt of bTok) {
        for (const np of negPrefixes) {
          if ((at === np + bt || bt === np + at) && bt.length >= 1 && at.length >= 2) return true;
        }
      }
    }
    return false;
  };

  const classifyLocalRelation = (pair: { headword: string; headwordMeaning: string; derivative: string; derivativeMeaning: string }) => {
    if (pair.derivative.includes(' ')) return '표현';
    if (isAntonymByPrefix(pair.derivative, pair.headword)) return '반의';
    if (isAntonymByMeaning(pair.headwordMeaning, pair.derivativeMeaning)) return '반의';
    if (isEnglishSynonymHint(pair.derivative, pair.headword)) return '동의';
    if (sharedMeaningScore(pair.headwordMeaning, pair.derivativeMeaning) > 0) return '동의';
    if (rootScore(pair.headword, pair.derivative) >= 4) return '파생어';
    return '파생어';
  };

  const buildLocalAssignments = (
    derivatives: { id: string; word: string; meaning: string; currentHeadword: string; day: string }[],
    headwords: { index: number; word: string; meaning: string; day: string }[],
  ) => {
    return derivatives.map((d) => {
      let best = headwords[0];
      let bestScore = Number.NEGATIVE_INFINITY;

      for (const hw of headwords) {
        let score = 0;
        score += sharedMeaningScore(d.meaning, hw.meaning) * 6;
        score += rootScore(d.word, hw.word) * 2;
        if (isEnglishSynonymHint(d.word, hw.word)) score += 12;
        if (normalizeWord(hw.word) === normalizeWord(d.currentHeadword)) score += 1;
        if (score > bestScore) {
          bestScore = score;
          best = hw;
        }
      }

      return {
        derivativeId: d.id,
        derivativeWord: d.word,
        correctHeadword: best.word,
        relation: classifyLocalRelation({
          headword: best.word,
          headwordMeaning: best.meaning,
          derivative: d.word,
          derivativeMeaning: d.meaning,
        }),
      };
    });
  };

  const persistReassignedWords = async (groups: DayGroup[]) => {
    if (!workbookId) return;

    const { data: dayGroupRows, error: dayGroupError } = await supabase
      .from('day_groups')
      .select('id, day_name')
      .eq('workbook_id', workbookId);

    if (dayGroupError || !dayGroupRows) {
      throw new Error(dayGroupError?.message || 'day_groups 조회 실패');
    }

    const dayToId = new Map(dayGroupRows.map(row => [row.day_name, row.id]));
    const updates: { wordId: string; dayGroupId: string; sortOrder: number }[] = [];

    groups.forEach(group => {
      const dayGroupId = dayToId.get(group.day);
      if (!dayGroupId) return;
      group.words.forEach((word, idx) => {
        if (!word.id || word.id === 'null') return;
        updates.push({ wordId: word.id, dayGroupId, sortOrder: idx });
      });
    });

    const chunkSize = 60;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      const results = await Promise.all(chunk.map((u) =>
        supabase
          .from('words')
          .update({ day_group_id: u.dayGroupId, sort_order: u.sortOrder })
          .eq('id', u.wordId)
      ));

      const failed = results.find(r => r.error);
      if (failed?.error) {
        throw new Error(failed.error.message);
      }
    }
  };

  // Progressive rendering: render days in batches to avoid browser freeze
  const INITIAL_BATCH = 3;
  const BATCH_SIZE = 5;
  const BATCH_DELAY = 200;
  const [renderedDayCount, setRenderedDayCount] = useState(INITIAL_BATCH);

  // Sync local state with props
  useEffect(() => {
    setLocalDayGroups(dayGroups);
    setRenderedDayCount(INITIAL_BATCH);
  }, [dayGroups]);

  useEffect(() => {
    if (!relationCacheKey) return;
    try {
      const raw = localStorage.getItem(relationCacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setDerivativeRelations(parsed);
      }
    } catch {
      // ignore cache parse errors
    }
  }, [relationCacheKey]);

  // Auto-classify all derivatives on load via AI edge function
  useEffect(() => {
    if (localDayGroups.length === 0) return;
    if (Object.keys(derivativeRelations).length > 0) return;

    const pairs: { headword: string; headwordMeaning: string; derivative: string; derivativeMeaning: string; headwordPos?: string; derivativePos?: string }[] = [];
    for (const dg of localDayGroups) {
      const headwords = dg.words.filter(w => !w.wordType || w.wordType === '표제어');
      const subWords = dg.words.filter(w => w.wordType && w.wordType !== '표제어');

      for (const sw of subWords) {
        let bestHw = headwords[0];
        if (headwords.length > 1) {
          const swIdx = dg.words.indexOf(sw);
          let minDist = Infinity;
          for (const hw of headwords) {
            const hwIdx = dg.words.indexOf(hw);
            if (hwIdx < swIdx && swIdx - hwIdx < minDist) {
              minDist = swIdx - hwIdx;
              bestHw = hw;
            }
          }
        }
        if (!bestHw) continue;
        pairs.push({
          headword: bestHw.word,
          headwordMeaning: bestHw.meaning,
          derivative: sw.word,
          derivativeMeaning: sw.meaning,
          headwordPos: bestHw.partOfSpeech || bestHw.partsOfSpeech?.[0] || undefined,
          derivativePos: sw.partOfSpeech || sw.partsOfSpeech?.[0] || undefined,
        });
      }
    }

    if (pairs.length === 0) return;

    // Call AI edge function in batches
    const runAIClassification = async () => {
      const batchSize = 80;
      const allRelations: Record<string, string> = {};

      for (let i = 0; i < pairs.length; i += batchSize) {
        const batch = pairs.slice(i, i + batchSize);
        try {
          const { data, error } = await supabase.functions.invoke('analyze-derivative-relations', {
            body: { pairs: batch },
          });

          if (!error && data?.relations?.length) {
            for (const r of data.relations) {
              const key = `${r.headword}::${r.derivative}`;
              allRelations[key] = r.relation;
            }
          } else {
            // Fallback to local classification
            for (const p of batch) {
              const key = `${p.headword}::${p.derivative}`;
              allRelations[key] = classifyLocalRelation(p);
            }
          }
        } catch {
          for (const p of batch) {
            const key = `${p.headword}::${p.derivative}`;
            allRelations[key] = classifyLocalRelation(p);
          }
        }
      }

      if (Object.keys(allRelations).length > 0) {
        setDerivativeRelations(allRelations);
        if (relationCacheKey) {
          localStorage.setItem(relationCacheKey, JSON.stringify(allRelations));
        }
      }
    };

    runAIClassification();
  }, [localDayGroups]);

  // Progressively render more days with longer delay to prevent OOM
  useEffect(() => {
    if (renderedDayCount >= localDayGroups.length) return;
    const timer = setTimeout(() => {
      setRenderedDayCount(prev => Math.min(prev + BATCH_SIZE, localDayGroups.length));
    }, BATCH_DELAY);
    return () => clearTimeout(timer);
  }, [renderedDayCount, localDayGroups.length]);

  // Handle synonym deletion with confirmation
  const handleDeleteSynonym = async (wordId: string, synonymIndex: number) => {
    // Find the word to get the synonym name for confirmation
    const word = localDayGroups.flatMap(dg => dg.words).find(w => w.id === wordId);
    if (!word) return;
    
    const synonymToDelete = word.synonyms?.[synonymIndex];
    if (!synonymToDelete) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(`"${synonymToDelete}" 동의어를 삭제하시겠습니까?`);
    if (!confirmed) return;
    
    // Create updated arrays
    const newSynonyms = [...(word.synonyms || [])];
    const newSynonymsKorean = [...(word.synonymsKorean || [])];
    newSynonyms.splice(synonymIndex, 1);
    newSynonymsKorean.splice(synonymIndex, 1);
    
    // Update local state immediately for UI responsiveness
    setLocalDayGroups(prevGroups => 
      prevGroups.map(dg => ({
        ...dg,
        words: dg.words.map(w => {
          if (w.id === wordId) {
            return {
              ...w,
              synonyms: newSynonyms,
              synonymsKorean: newSynonymsKorean
            };
          }
          return w;
        })
      }))
    );
    
    // Update database
    try {
      const { error } = await supabase
        .from('words')
        .update({ 
          synonyms: newSynonyms.length > 0 ? newSynonyms : null,
          synonyms_korean: newSynonymsKorean.length > 0 ? newSynonymsKorean : null
        })
        .eq('id', wordId);
      
      if (error) throw error;
      toast.success('동의어가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete synonym:', error);
      toast.error('동의어 삭제에 실패했습니다.');
      // Revert on error
      setLocalDayGroups(dayGroups);
    }
  };

  // Handle antonym deletion with confirmation
  const handleDeleteAntonym = async (wordId: string, antonymIndex: number) => {
    // Find the word to get the antonym name for confirmation
    const word = localDayGroups.flatMap(dg => dg.words).find(w => w.id === wordId);
    if (!word) return;
    
    const antonymToDelete = word.antonyms?.[antonymIndex];
    if (!antonymToDelete) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(`"${antonymToDelete}" 반의어를 삭제하시겠습니까?`);
    if (!confirmed) return;
    
    // Create updated arrays
    const newAntonyms = [...(word.antonyms || [])];
    const newAntonymsKorean = [...(word.antonymsKorean || [])];
    newAntonyms.splice(antonymIndex, 1);
    newAntonymsKorean.splice(antonymIndex, 1);
    
    // Update local state immediately for UI responsiveness
    setLocalDayGroups(prevGroups => 
      prevGroups.map(dg => ({
        ...dg,
        words: dg.words.map(w => {
          if (w.id === wordId) {
            return {
              ...w,
              antonyms: newAntonyms,
              antonymsKorean: newAntonymsKorean
            };
          }
          return w;
        })
      }))
    );
    
    // Update database
    try {
      const { error } = await supabase
        .from('words')
        .update({ 
          antonyms: newAntonyms.length > 0 ? newAntonyms : null,
          antonyms_korean: newAntonymsKorean.length > 0 ? newAntonymsKorean : null
        })
        .eq('id', wordId);
      
      if (error) throw error;
      toast.success('반의어가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete antonym:', error);
      toast.error('반의어 삭제에 실패했습니다.');
      // Revert on error
      setLocalDayGroups(dayGroups);
    }
  };

  // Check if there are words missing definitions (only those with valid IDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const wordsNeedingDefinitions = localDayGroups.flatMap(dg => dg.words.filter(w => w.id && w.id !== 'null' && uuidRegex.test(w.id) && (!w.englishDefinition || !w.etymology)));
  const hasMissingDefinitions = wordsNeedingDefinitions.length > 0;
  const handleGenerateDefinitions = async () => {
    if (wordsNeedingDefinitions.length === 0) {
      toast.info('모든 단어에 영영정의와 어원이 이미 있습니다.');
      return;
    }
    setIsGeneratingDefinitions(true);
    toast.info(`${wordsNeedingDefinitions.length}개 단어의 영영정의/어원을 생성 중...`);
    try {
      // Process in batches of 20
      const batchSize = 20;
      let processed = 0;
      for (let i = 0; i < wordsNeedingDefinitions.length; i += batchSize) {
        const batch = wordsNeedingDefinitions.slice(i, i + batchSize);
        // Filter out any null/undefined IDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const wordIds = batch.map(w => w.id).filter(id => id && id !== 'null' && uuidRegex.test(id));

        // Skip if no valid IDs
        if (wordIds.length === 0) {
          continue;
        }
        const {
          data,
          error
        } = await supabase.functions.invoke('update-word-definitions', {
          body: {
            wordIds
          }
        });
        if (error) {
          console.error('Error generating definitions:', error);
          throw error;
        }
        processed += batch.length;
        toast.success(`${processed}/${wordsNeedingDefinitions.length} 단어 처리 완료`);
      }
      toast.success('영영정의/어원 생성이 완료되었습니다! 페이지를 새로고침해주세요.');
    } catch (error) {
      console.error('Failed to generate definitions:', error);
      toast.error('영영정의/어원 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingDefinitions(false);
    }
  };

  // Analyze derivative-headword relations via AI
  const handleAnalyzeRelations = async () => {
    const pairs: { headword: string; headwordMeaning: string; derivative: string; derivativeMeaning: string; headwordPos?: string; derivativePos?: string }[] = [];
    for (const dg of localDayGroups) {
      const words = dg.words;
      let currentHeadword: VocabularyWord | null = null;
      for (const w of words) {
        if (w.wordType === '표제어') {
          currentHeadword = w;
        } else if (w.wordType === '파생어' && currentHeadword) {
          pairs.push({
            headword: currentHeadword.word,
            headwordMeaning: currentHeadword.meaning,
            derivative: w.word,
            derivativeMeaning: w.meaning,
            headwordPos: currentHeadword.partOfSpeech || currentHeadword.partsOfSpeech?.[0] || undefined,
            derivativePos: w.partOfSpeech || w.partsOfSpeech?.[0] || undefined,
          });
        }
      }
    }
    if (pairs.length === 0) {
      toast.info('분석할 파생어가 없습니다.');
      return;
    }

    setIsAnalyzingRelations(true);
    toast.info(`${pairs.length}개 파생어의 관계를 AI로 분석 중...`);

    try {
      // Process in larger batches to reduce request count
      const batchSize = 80;
      const allRelations: Record<string, string> = {};
      let aiDisabled = false;
      let fallbackCount = 0;

      for (let i = 0; i < pairs.length; i += batchSize) {
        const batch = pairs.slice(i, i + batchSize);

        if (!aiDisabled) {
          const { data, error } = await supabase.functions.invoke('analyze-derivative-relations', {
            body: { pairs: batch },
          });

          const hasRateLimit = Boolean(data?.reason?.includes?.('rate_limited')) || error?.message?.includes('429');
          if (hasRateLimit) {
            aiDisabled = true;
          }

          const isUsableAiResult = !error && data?.relations?.length && !data?.fallback;
          if (isUsableAiResult) {
            for (const r of data.relations) {
              const key = `${r.headword}::${r.derivative}`;
              allRelations[key] = r.relation;
            }
          } else {
            fallbackCount += batch.length;
            for (const p of batch) {
              const key = `${p.headword}::${p.derivative}`;
              allRelations[key] = classifyLocalRelation(p);
            }
          }
        } else {
          fallbackCount += batch.length;
          for (const p of batch) {
            const key = `${p.headword}::${p.derivative}`;
            allRelations[key] = classifyLocalRelation(p);
          }
        }

        if (i + batchSize < pairs.length) {
          toast.info(`${Math.min(i + batchSize, pairs.length)}/${pairs.length} 분석 완료...`);
          await sleep(250);
        }
      }

      setDerivativeRelations(allRelations);
      if (relationCacheKey) {
        localStorage.setItem(relationCacheKey, JSON.stringify(allRelations));
      }

      if (fallbackCount > 0) {
        toast.success(`파생어 관계 분석 완료! (${pairs.length}개, 폴백 ${fallbackCount}개)`);
      } else {
        toast.success(`파생어 관계 분석 완료! (${pairs.length}개)`);
      }
    } catch (error) {
      console.error('Relation analysis failed:', error);
      toast.error('파생어 관계 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzingRelations(false);
    }
  };

  // Reassign derivatives to correct headwords via AI
  const handleReassignDerivatives = async () => {
    // Collect all headwords and derivatives across all days
    const headwords: { index: number; word: string; meaning: string; day: string }[] = [];
    const derivatives: { id: string; word: string; meaning: string; currentHeadword: string; day: string }[] = [];

    for (const dg of localDayGroups) {
      let currentHeadword: VocabularyWord | null = null;
      let headwordIdx = 0;
      for (const w of dg.words) {
        if (w.wordType === '표제어') {
          currentHeadword = w;
          headwordIdx++;
          headwords.push({ index: headwordIdx, word: w.word, meaning: w.meaning, day: dg.day });
        } else if ((w.wordType === '파생어' || w.wordType === '핵심표현') && currentHeadword) {
          derivatives.push({
            id: w.id,
            word: w.word,
            meaning: w.meaning,
            currentHeadword: currentHeadword.word,
            day: dg.day,
          });
        }
      }
    }

    if (derivatives.length === 0) {
      toast.info('재배치할 파생어가 없습니다.');
      return;
    }

    setIsReassigningDerivatives(true);
    toast.info(`${derivatives.length}개 파생어의 올바른 표제어를 AI로 분석 중...`);

    try {
      const allAssignments: any[] = [];
      const groupedDerivatives = new Map<string, typeof derivatives>();
      const groupedHeadwords = new Map<string, typeof headwords>();

      for (const d of derivatives) {
        if (!groupedDerivatives.has(d.day)) groupedDerivatives.set(d.day, []);
        groupedDerivatives.get(d.day)!.push(d);
      }
      for (const h of headwords) {
        if (!groupedHeadwords.has(h.day)) groupedHeadwords.set(h.day, []);
        groupedHeadwords.get(h.day)!.push(h);
      }

      let processed = 0;
      let aiDisabled = false;
      let fallbackCount = 0;
      const days = Array.from(groupedDerivatives.keys());

      for (const day of days) {
        const dayDerivatives = groupedDerivatives.get(day) || [];
        const dayHeadwords = groupedHeadwords.get(day) || [];
        if (dayDerivatives.length === 0 || dayHeadwords.length === 0) continue;

        if (!aiDisabled) {
          const { data, error } = await supabase.functions.invoke('reassign-derivatives', {
            body: { headwords: dayHeadwords, derivatives: dayDerivatives },
          });

          const hasRateLimit = Boolean(data?.reason?.includes?.('rate_limited')) || error?.message?.includes('429');
          if (hasRateLimit) {
            aiDisabled = true;
          }

          const isUsableAiResult = !error && data?.assignments?.length && !data?.fallback;
          if (isUsableAiResult) {
            allAssignments.push(...data.assignments);
          } else {
            fallbackCount += dayDerivatives.length;
            allAssignments.push(...buildLocalAssignments(dayDerivatives, dayHeadwords));
          }
        } else {
          fallbackCount += dayDerivatives.length;
          allAssignments.push(...buildLocalAssignments(dayDerivatives, dayHeadwords));
        }

        processed += dayDerivatives.length;
        if (processed < derivatives.length) {
          toast.info(`${processed}/${derivatives.length} 분석 완료...`);
          await sleep(300);
        }
      }

      // Apply reassignments: move derivatives to correct headwords and update relations
      let movedCount = 0;
      const newRelations: Record<string, string> = { ...derivativeRelations };
      const updatedGroups = localDayGroups.map(dg => ({
        ...dg,
        words: [...dg.words],
      }));

      for (const assignment of allAssignments) {
        const { derivativeId, correctHeadword, relation } = assignment;
        
        // Find the derivative in current groups
        let derivativeWord: VocabularyWord | null = null;
        let sourceGroupIdx = -1;
        let sourceWordIdx = -1;
        
        for (let gi = 0; gi < updatedGroups.length; gi++) {
          for (let wi = 0; wi < updatedGroups[gi].words.length; wi++) {
            if (updatedGroups[gi].words[wi].id === derivativeId) {
              derivativeWord = updatedGroups[gi].words[wi];
              sourceGroupIdx = gi;
              sourceWordIdx = wi;
              break;
            }
          }
          if (derivativeWord) break;
        }
        if (!derivativeWord) continue;

        // Find the correct headword's position
        let targetGroupIdx = -1;
        let targetHeadwordIdx = -1;
        for (let gi = 0; gi < updatedGroups.length; gi++) {
          for (let wi = 0; wi < updatedGroups[gi].words.length; wi++) {
            const w = updatedGroups[gi].words[wi];
            if (w.wordType === '표제어' && w.word.toLowerCase() === correctHeadword.toLowerCase()) {
              targetGroupIdx = gi;
              targetHeadwordIdx = wi;
              break;
            }
          }
          if (targetGroupIdx >= 0) break;
        }

        // Update relation
        newRelations[`${correctHeadword}::${derivativeWord.word}`] = relation;

        // Move derivative if it's under the wrong headword
        if (targetGroupIdx >= 0) {
          // Find current headword of this derivative
          let currentHw = '';
          for (let wi = sourceWordIdx - 1; wi >= 0; wi--) {
            if (updatedGroups[sourceGroupIdx].words[wi].wordType === '표제어') {
              currentHw = updatedGroups[sourceGroupIdx].words[wi].word;
              break;
            }
          }

          if (currentHw.toLowerCase() !== correctHeadword.toLowerCase()) {
            // Remove from current position
            updatedGroups[sourceGroupIdx].words.splice(sourceWordIdx, 1);
            
            // Find insertion point: after the target headword and its existing derivatives
            let insertIdx = targetHeadwordIdx + 1;
            // Recalculate targetHeadwordIdx in case of same group shifts
            if (sourceGroupIdx === targetGroupIdx && sourceWordIdx < targetHeadwordIdx) {
              insertIdx--;
            }
            while (insertIdx < updatedGroups[targetGroupIdx].words.length) {
              const nextWord = updatedGroups[targetGroupIdx].words[insertIdx];
              if (nextWord.wordType === '표제어') break;
              insertIdx++;
            }
            
            updatedGroups[targetGroupIdx].words.splice(insertIdx, 0, {
              ...derivativeWord,
              day: updatedGroups[targetGroupIdx].day,
            });
            movedCount++;
          }
        }
      }

      setLocalDayGroups(updatedGroups);
      setDerivativeRelations(newRelations);

      if (relationCacheKey) {
        localStorage.setItem(relationCacheKey, JSON.stringify(newRelations));
      }

      if (workbookId) {
        await persistReassignedWords(updatedGroups);
      }

      toast.success(`파생어 재배치 완료! ${movedCount}개 이동, ${allAssignments.length}개 관계 분석됨${fallbackCount > 0 ? ` (폴백 ${fallbackCount}개)` : ''}`);
    } catch (error) {
      console.error('Reassign failed:', error);
      toast.error('파생어 재배치 중 오류가 발생했습니다.');
    } finally {
      setIsReassigningDerivatives(false);
    }
  };

  useEffect(() => {
    setEditedTitle(config.title);
  }, [config.title]);
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);
  const handleTitleSave = () => {
    if (onConfigChange && editedTitle.trim()) {
      onConfigChange({
        ...config,
        title: editedTitle.trim()
      });
      toast.success('단어장 이름이 변경되었습니다!');
    }
    setIsEditingTitle(false);
  };
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(config.title);
      setIsEditingTitle(false);
    }
  };
  // Handle example DOCX upload
  const handleExampleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workbookId) return;
    
    setIsUploadingExamples(true);
    try {
      let text = '';
      
      if (file.name.endsWith('.txt')) {
        // Try UTF-8 first, then EUC-KR for Korean text files
        const arrayBuffer = await file.arrayBuffer();
        const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
        const koreanCountUtf8 = (utf8Text.match(/[\uAC00-\uD7AF]/g) || []).length;
        
        let eucKrText = '';
        let koreanCountEucKr = 0;
        try {
          eucKrText = new TextDecoder('euc-kr', { fatal: false }).decode(arrayBuffer);
          koreanCountEucKr = (eucKrText.match(/[\uAC00-\uD7AF]/g) || []).length;
        } catch(e) { /* ignore */ }
        
        text = koreanCountEucKr > koreanCountUtf8 ? eucKrText : utf8Text;
        console.log(`Decoded TXT: UTF-8 Korean=${koreanCountUtf8}, EUC-KR Korean=${koreanCountEucKr}`);
      } else if (file.name.endsWith('.docx')) {
        const { extractTextFromDocx } = await import('@/utils/exampleParser');
        text = await extractTextFromDocx(file);
      } else {
        toast.error('TXT 또는 DOCX 파일만 지원됩니다.');
        return;
      }

      // Fix apostrophe encoding issues
      text = text.replace(/\ufffd/g, "'").replace(/â€™/g, "'").replace(/â€œ/g, '"').replace(/â€\u009d/g, '"');
      
      // Send to edge function with clearExisting
      const { data, error } = await supabase.functions.invoke('import-examples', {
        body: { workbookId, examplesText: text, clearExisting: true }
      });
      
      if (error) throw error;
      
      if (data?.totalInserted > 0) {
        toast.success(`${data.totalInserted}개의 예문이 추가되었습니다! (${data.daysProcessed}일)`);
      } else {
        toast.error('예문을 추출할 수 없습니다. 파일 형식을 확인해주세요.');
        return;
      }
      
      // Reload workbook data
      const { loadWorkbook } = await import('@/utils/workbookStorage');
      const { dayGroups: reloaded } = await loadWorkbook(workbookId);
      setLocalDayGroups(reloaded);
    } catch (err) {
      console.error('Example upload error:', err);
      toast.error('예문 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingExamples(false);
      if (exampleFileRef.current) exampleFileRef.current.value = '';
    }
  };

  const handlePrint = () => {
    // 인쇄 전 상세 안내 메시지 표시
    toast.info(
      '📋 인쇄 설정 안내',
      { 
        duration: 8000,
        description: '용지: A4 (210×297mm) | 여백: 없음 | 크기 조정: 100% | 배경 그래픽: ✓ 체크'
      }
    );
    // 약간의 딜레이 후 인쇄 대화상자 열기
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePrintMiniBook = () => {
    // 미니북 페이지만 표시하고 인쇄
    const allPages = document.querySelectorAll('.page-b5, .page-a5');
    const miniBookPages = document.querySelectorAll('.mini-book-page');
    
    // B5 페이지와 미니북이 아닌 A5 페이지 숨기기
    allPages.forEach(page => {
      if (!page.classList.contains('mini-book-page')) {
        (page as HTMLElement).style.display = 'none';
      }
    });

    toast.info(
      '📋 미니북 인쇄 설정',
      { 
        duration: 8000,
        description: '용지: A5 (148×210mm) | 여백: 없음 | 크기 조정: 100% | 배경 그래픽: ✓ 체크'
      }
    );

    setTimeout(() => {
      window.print();
      // 인쇄 후 모든 페이지 다시 표시
      allPages.forEach(page => {
        (page as HTMLElement).style.display = '';
      });
    }, 500);
  };
  const handleThemeChange = (color: typeof THEME_COLORS[0]) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        themeColor: color.primary,
        secondaryColor: color.secondary
      });
      toast.success(`테마가 "${color.label}"로 변경되었습니다!`);
    }
    setIsThemeOpen(false);
  };
  const selectedTheme = THEME_COLORS.find(c => c.primary === config.themeColor);
  const totalWords = localDayGroups.reduce((sum, group) => sum + group.words.length, 0);
  // Determine words per page based on workbook type
  const isUltimate = config.coverSubtitle?.toLowerCase() === 'ultimate';
  
  // For Ultimate with Parts: dynamic wordsPerPage based on words in day (15 for 30-word days, 20 for 40-word days)
  const getWordsPerPageForDay = (dayGroup: DayGroup) => {
    // Word-type workbooks: 40 words per page (dense table layout)
    const hasWordType = dayGroup.words.some(w => w.wordType);
    if (hasWordType) return WORDS_PER_PAGE_WORD_TYPE;
    
    if (!isUltimate) {
      if (config.includeExamples) {
        return WORDS_PER_PAGE;
      }
      return WORDS_PER_PAGE_NO_EXAMPLES;
    }
    const wc = dayGroup.words.length;
    return wc <= 30 ? 15 : 20;
  };

  // Detect Parts in Ultimate workbook
  const hasParts = isUltimate && localDayGroups.some(dg => getPartFromDayName(dg.day) !== null);

  // Pre-calculate TOC entries count to determine how many TOC pages we need
  const tocEntryCount = (() => {
    let count = 0;
    let lastPart = -1;
    localDayGroups.forEach(dg => {
      if (hasParts) {
        const pn = getPartFromDayName(dg.day);
        if (pn !== null && pn !== lastPart) { count++; lastPart = pn; }
      }
      count++; // day entry
    });
    return count;
  })();
  // Paginate TOC to prevent overflow beyond the framed area.
  // Ultimate has part headers that consume vertical space, so fewer entries per page.
  // Capacity must match the rendered row heights (day 28px / part 36px + 4px gap)
  // inside the framed area, otherwise entries get clipped instead of flowing.
  const ENTRIES_FIRST_PAGE = isUltimate ? 24 : 28;
  const ENTRIES_PER_PAGE = isUltimate ? 26 : 31;
  const tocPageCount = tocEntryCount <= ENTRIES_FIRST_PAGE ? 1 : 1 + Math.ceil((tocEntryCount - ENTRIES_FIRST_PAGE) / ENTRIES_PER_PAGE);

  // Memoize heavy page calculations to avoid recomputing on every renderedDayCount change
  const { pages, tocPages, tocPageCount: memoTocPageCount } = useMemo(() => {
    const _pages: {
      dayGroup: DayGroup;
      words: VocabularyWord[];
      absolutePageNum: number;
      startWordIndex: number;
      globalWordOffset: number;
      partThemeColor?: string;
    }[] = [];
    let currentAbsolutePage = 2 + tocPageCount; // Start after cover + TOC pages
    let cumulativeWordCount = 0;
    let lastPartNumber = -1;

    // Build TOC entries with page numbers
    const _tocEntries: { label: string; page: number; isPartHeader?: boolean; partColor?: string; wordCount?: number; headwordCount?: number; derivativeCount?: number; partTitle?: string }[] = [];
    let tocLastPart = -1;

    localDayGroups.forEach(dayGroup => {
      if (hasParts) {
        const partNum = getPartFromDayName(dayGroup.day);
        if (partNum !== null && partNum !== lastPartNumber) {
          if (partNum !== tocLastPart) {
            const partDays = localDayGroups.filter(dg => getPartFromDayName(dg.day) === partNum);
            const partWords = partDays.reduce((s, dg) => s + dg.words.length, 0);
            const partHeadwords = partDays.reduce((s, dg) => s + dg.words.filter(w => !w.wordType || w.wordType === '표제어').length, 0);
            const partDerivatives = partWords - partHeadwords;
            _tocEntries.push({
              label: `PART ${partNum}`,
              page: currentAbsolutePage,
              isPartHeader: true,
              partColor: ULTIMATE_PARTS[partNum]?.themeColor,
              wordCount: partWords,
              headwordCount: partHeadwords,
              derivativeCount: partDerivatives,
              partTitle: ULTIMATE_PARTS[partNum]?.title,
            });
            tocLastPart = partNum;
          }
          currentAbsolutePage++;
          lastPartNumber = partNum;
        }
      }

      if (config.includeExamples && !isUltimate) {
        currentAbsolutePage++;
      }

      const dayLabel = dayGroup.day.replace(/\[Part\s*\d+\]\s*/i, '').trim();
      const headwords = dayGroup.words.filter(w => !w.wordType || w.wordType === '표제어').length;
      const derivatives = dayGroup.words.length - headwords;
      _tocEntries.push({
        label: dayLabel,
        page: currentAbsolutePage,
        wordCount: dayGroup.words.length,
        headwordCount: headwords,
        derivativeCount: derivatives,
      });

      const wpForDay = getWordsPerPageForDay(dayGroup);
      const partNum = getPartFromDayName(dayGroup.day);
      const partMeta = partNum ? ULTIMATE_PARTS[partNum] : null;

      // Word-type workbooks: paginate by 표제어 groups (10 groups per page)
      const hasWordType = dayGroup.words.some(w => w.wordType);
      if (hasWordType) {
        const HEADWORD_GROUPS_PER_PAGE = 7;
        // Build groups
        const allGroups: { startIdx: number; endIdx: number }[] = [];
        let gStart = 0;
        for (let wi = 0; wi < dayGroup.words.length; wi++) {
          if (wi > gStart && dayGroup.words[wi].wordType === '표제어') {
            allGroups.push({ startIdx: gStart, endIdx: wi });
            gStart = wi;
          }
        }
        allGroups.push({ startIdx: gStart, endIdx: dayGroup.words.length });

        for (let gi = 0; gi < allGroups.length; gi += HEADWORD_GROUPS_PER_PAGE) {
          const pageGroups = allGroups.slice(gi, gi + HEADWORD_GROUPS_PER_PAGE);
          const startIdx = pageGroups[0].startIdx;
          const endIdx = pageGroups[pageGroups.length - 1].endIdx;
          _pages.push({
            dayGroup,
            words: dayGroup.words.slice(startIdx, endIdx),
            absolutePageNum: currentAbsolutePage++,
            startWordIndex: startIdx,
            globalWordOffset: cumulativeWordCount,
            partThemeColor: partMeta?.themeColor,
          });
        }
      } else {
        for (let i = 0; i < dayGroup.words.length; i += wpForDay) {
          _pages.push({
            dayGroup,
            words: dayGroup.words.slice(i, i + wpForDay),
            absolutePageNum: currentAbsolutePage++,
            startWordIndex: i,
            globalWordOffset: cumulativeWordCount,
            partThemeColor: partMeta?.themeColor,
          });
        }
      }

      cumulativeWordCount += dayGroup.words.length;
    });

    // Split TOC entries into pages
    const _tocPages: typeof _tocEntries[] = [];
    let remaining = [..._tocEntries];
    let firstPage = remaining.splice(0, ENTRIES_FIRST_PAGE);
    _tocPages.push(firstPage);
    while (remaining.length > 0) {
      _tocPages.push(remaining.splice(0, ENTRIES_PER_PAGE));
    }

    // Build a lookup map for fast page filtering by day name
    return { pages: _pages, tocPages: _tocPages, tocPageCount };
  }, [localDayGroups, config.includeExamples, isUltimate, hasParts, tocPageCount, ENTRIES_FIRST_PAGE, ENTRIES_PER_PAGE]);

  // Build day-to-pages index for O(1) lookup instead of O(n) filter
  const pagesByDay = useMemo(() => {
    const map = new Map<string, typeof pages>();
    for (const page of pages) {
      const key = page.dayGroup.day;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(page);
    }
    return map;
  }, [pages]);

  // Total pages including hard cover, cover, TOC and dividers
  const dividerCount = config.includeExamples ? localDayGroups.length : 0;
  const totalPages = 2 + tocPageCount + dividerCount + pages.length;
  return <div className="min-h-screen bg-gradient-to-br from-[#f5f3ef] via-[#faf8f5] to-[#f0ebe3]">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                {isEditingTitle ? <Input ref={titleInputRef} value={editedTitle} onChange={e => setEditedTitle(e.target.value)} onBlur={handleTitleSave} onKeyDown={handleTitleKeyDown} className="text-xl font-bold h-8 w-48" /> : <button onClick={() => onConfigChange && setIsEditingTitle(true)} className="flex items-center gap-1.5 group text-xl font-bold text-foreground hover:text-primary transition-colors" title="클릭하여 이름 변경">
                    {config.title}
                    {onConfigChange && <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />}
                  </button>}
              </div>
              <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-muted">{localDayGroups.length}일차</span>
                <span className="px-3 py-1 rounded-full bg-muted">{totalWords}개 단어</span>
                <span className="px-3 py-1 rounded-full bg-muted">{pages.length}페이지</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme Color Picker */}
              {onConfigChange && <Popover open={isThemeOpen} onOpenChange={setIsThemeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-4 h-4 rounded-l-sm border border-black/10" style={{
                      backgroundColor: config.themeColor
                    }} />
                        <div className="w-4 h-4 rounded-r-sm border border-black/10" style={{
                      backgroundColor: config.secondaryColor
                    }} />
                      </div>
                      <span className="hidden sm:inline">테마</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">테마 색상 변경</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {THEME_COLORS.map(color => {
                      const isSelected = config.themeColor === color.primary;
                      return <button key={color.primary} type="button" onClick={() => handleThemeChange(color)} className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 hover:scale-110 ${isSelected ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : ''}`} title={color.label}>
                              <div className="absolute inset-0" style={{
                          background: `linear-gradient(135deg, ${color.primary} 50%, ${color.secondary} 50%)`
                        }} />
                              {isSelected && <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-gray-800" />
                                  </div>
                                </div>}
                            </button>;
                    })}
                      </div>
                      {selectedTheme && <div className="flex items-center gap-2 pt-2 border-t">
                          <div className="flex gap-0.5">
                            <div className="w-6 h-6 rounded-l-md border border-black/10" style={{
                        backgroundColor: selectedTheme.primary
                      }} />
                            <div className="w-6 h-6 rounded-r-md border border-black/10" style={{
                        backgroundColor: selectedTheme.secondary
                      }} />
                          </div>
                          <span className="text-sm font-medium">{selectedTheme.label}</span>
                        </div>}
                    </div>
                  </PopoverContent>
                </Popover>}

              <Button onClick={onReset} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">새 파일</span>
              </Button>

              {/* Generate Definitions Button - show when there are words missing definitions */}
              {hasMissingDefinitions && <Button onClick={handleGenerateDefinitions} variant="outline" className="gap-2" disabled={isGeneratingDefinitions}>
                  {isGeneratingDefinitions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isGeneratingDefinitions ? '생성 중...' : '영영정의 생성'}
                  </span>
                </Button>}

              {/* Analyze Derivative Relations Button */}
              {localDayGroups.some(dg => dg.words.some(w => w.wordType === '파생어')) && (
                <Button onClick={handleAnalyzeRelations} variant="outline" className="gap-2" disabled={isAnalyzingRelations}>
                  {isAnalyzingRelations ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isAnalyzingRelations ? '분석 중...' : '파생어 관계 분석'}
                  </span>
                </Button>
              )}

              {/* Reassign Derivatives Button */}
              {localDayGroups.some(dg => dg.words.some(w => w.wordType === '파생어')) && (
                <Button onClick={handleReassignDerivatives} variant="outline" className="gap-2" disabled={isReassigningDerivatives}>
                  {isReassigningDerivatives ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isReassigningDerivatives ? '재배치 중...' : '파생어 재배치'}
                  </span>
                </Button>
              )}


              <Button 
                onClick={() => {
                  const hasWordType = dayGroups.some(dg => dg.words.some(w => w.wordType));
                  if (hasWordType) {
                    downloadWordTypeCSV(dayGroups, config.title || 'vocabulary');
                  } else {
                    downloadCSV(dayGroups, config.title || 'vocabulary');
                  }
                  toast.success('CSV 파일이 다운로드되었습니다!');
                }} 
                variant="outline" 
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV 다운로드</span>
              </Button>

              {/* Example Upload Button */}
              {workbookId && (
                <>
                  <input
                    ref={exampleFileRef}
                    type="file"
                    accept=".docx,.txt"
                    onChange={handleExampleUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => exampleFileRef.current?.click()} 
                    variant="outline" 
                    className="gap-2"
                    disabled={isUploadingExamples}
                  >
                    {isUploadingExamples ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isUploadingExamples ? '업로드 중...' : '예문 업로드'}</span>
                  </Button>
                </>
              )}
              
              <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">인쇄하기</span>
              </Button>
              
              {/* Mini Book Print Button */}
              <Button onClick={handlePrintMiniBook} variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">미니북 인쇄</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="py-8 flex flex-col items-center gap-8" id="workbook-content">
        <HardCoverPage config={config} totalDays={localDayGroups.length} />
        <CoverPage totalDays={localDayGroups.length} totalWords={totalWords} totalPages={totalPages} config={config} />
        
        {/* 목차 페이지 */}
        {tocPages.map((entries, idx) => (
          <TableOfContentsPage
            key={`toc-${idx}`}
            config={config}
            tocEntries={entries}
            pageIndex={idx}
            totalTocPages={tocPages.length}
            absolutePageNum={2 + idx}
          />
        ))}
        
        {/* 본문 섹션: Part Dividers + Day Dividers + Word Cards */}
        {(() => {
          let lastRenderedPart = -1;
          return localDayGroups.slice(0, renderedDayCount).map((dayGroup, dayIdx) => {
            const dayPages = pagesByDay.get(dayGroup.day) || [];
            const partNum = getPartFromDayName(dayGroup.day);
            const showPartDivider = hasParts && partNum !== null && partNum !== lastRenderedPart;
            if (showPartDivider && partNum !== null) lastRenderedPart = partNum;

            // For Ultimate with Parts, override theme color per part for content pages
            const partMeta = partNum ? ULTIMATE_PARTS[partNum] : null;

            return <div key={dayGroup.day} style={{ contentVisibility: 'auto', containIntrinsicSize: `auto 840px ${1200 * Math.max(1, Math.ceil(dayGroup.words.length / 20))}px` }}>
              {/* Part Divider Page */}
              {showPartDivider && partNum !== null && (() => {
                const partDays = localDayGroups.filter(dg => getPartFromDayName(dg.day) === partNum);
                const partWordCount = partDays.reduce((sum, dg) => sum + dg.words.length, 0);
                return <PartDividerPage partNumber={partNum} config={config} totalDays={partDays.length} totalWords={partWordCount} />;
              })()}
              {/* Day Divider Page - only show if examples are included and not Ultimate */}
              {config.includeExamples && !isUltimate && <DayDividerPage day={dayGroup.day} wordCount={dayGroup.words.length} config={config} dayIndex={dayIdx} />}
              {/* Content Pages for this day */}
              {dayPages.map((page, idx) => {
                const wordsKey = page.words.map(w => `${w.id}-${(w.synonyms || []).length}-${(w.antonyms || []).length}`).join('_');
                // Create a config override with Part theme color for Ultimate
                const pageConfig = partMeta ? { ...config, themeColor: partMeta.themeColor, secondaryColor: partMeta.secondaryColor } : config;
                return <ContentPage 
                  key={`${dayGroup.day}-${idx}-${wordsKey}`} 
                  dayGroup={page.dayGroup} 
                  words={page.words} 
                  absolutePageNum={page.absolutePageNum} 
                  startWordIndex={page.startWordIndex} 
                  globalWordOffset={page.globalWordOffset} 
                  config={pageConfig} 
                  onDeleteSynonym={handleDeleteSynonym} 
                  onDeleteAntonym={handleDeleteAntonym}
                  derivativeRelations={derivativeRelations}
                />;
              })}
            </div>;
          });
        })()}

        {/* Progressive rendering indicator */}
        {renderedDayCount < localDayGroups.length && (
          <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">페이지 렌더링 중... ({renderedDayCount}/{localDayGroups.length}일)</span>
          </div>
        )}
        
        {/* 부록 섹션: 모든 시험지와 답지 - Ultimate 제외 */}
        {!isUltimate && renderedDayCount >= localDayGroups.length && <>
          {/* Detect word-type workbook for MINI TEST naming */}
          {(() => {
            const isWordTypeWb = localDayGroups.some(dg => dg.words.some(w => w.wordType));
            const testTitle = isWordTypeWb ? 'MINI TEST' : 'MINI BOOK';
            const testTags = isWordTypeWb ? ['1회독 뜻쓰기', '2회독 뜻쓰기', '3회독 빈칸', '정답지'] : ['뜻맞추기', '스펠링', '빈칸채우기', '정답지'];
            const testCount = localDayGroups.length * (isWordTypeWb ? 3 : 4);
            return <>
              <MiniTestHardCoverPage config={config} totalDays={localDayGroups.length} testCount={testCount} title={testTitle} bottomTags={testTags} />
              <AppendixDividerPage config={config} totalDays={localDayGroups.length} testCount={testCount} title={testTitle} />
            </>;
          })()}
          
          {/* 시험지 섹션 */}
          {(() => {
          // Check if this is a word-type workbook (교과서 형식)
          const isWordTypeWorkbook = localDayGroups.some(dg => dg.words.some(w => w.wordType));
          
          let currentPageNum = 1;
          
          if (isWordTypeWorkbook) {
            // ========== Word-Type (교과서) 3회독 시스템 ==========
            // Round 1: 표제어만 뜻 쓰기, Round 2: 모든 단어 뜻 쓰기, Round 3: 예문 빈칸 채우기
            let pageOffset = 0;

            // Pre-calculate page info per day
            const wtDayInfo = localDayGroups.map((dg) => {
              const headwords = dg.words.filter(w => w.wordType === '표제어');
              const allWords = dg.words;
              const wordsWithExamples = allWords.filter(w => w.examples && w.examples.length > 0);
              
              const r1Pages = getWordTypeMeaningPageCount(headwords);
              const r2Pages = getWordTypeMeaningPageCount(allWords);
              const r3Pages = wordsWithExamples.length > 0 ? getWordTypeSentenceFillPageCount(allWords) : 0;
              
              return { r1Pages, r2Pages, r3Pages, headwords, allWords };
            });

            // Calculate page numbers: Round 1 (all days) → Round 2 (all days) → Round 3 (all days) → Answers
            let currentOffset = 0;
            
            // Round 1 page starts
            const r1Starts = wtDayInfo.map(info => {
              const start = currentPageNum + currentOffset;
              currentOffset += info.r1Pages;
              return start;
            });
            
            // Round 2 page starts
            const r2Starts = wtDayInfo.map(info => {
              const start = currentPageNum + currentOffset;
              currentOffset += info.r2Pages;
              return start;
            });
            
            // Round 3 page starts
            const r3Starts = wtDayInfo.map(info => {
              const start = currentPageNum + currentOffset;
              currentOffset += info.r3Pages;
              return start;
            });

            // Answer pages: same structure as test pages per round
            // Answer Round 1 page starts
            const a1Starts = wtDayInfo.map(info => {
              const start = currentPageNum + currentOffset;
              currentOffset += info.r1Pages;
              return start;
            });
            // Answer Round 2 page starts
            const a2Starts = wtDayInfo.map(info => {
              const start = currentPageNum + currentOffset;
              currentOffset += info.r2Pages;
              return start;
            });
            // Answer Round 3 page starts
            const a3Starts = wtDayInfo.map(info => {
              const start = currentPageNum + currentOffset;
              currentOffset += info.r3Pages;
              return start;
            });

            return <>
              {/* 1회독: 표제어만 (모든 Day) */}
              {localDayGroups.map((dayGroup, dayIdx) => {
                const info = wtDayInfo[dayIdx];
                return Array.from({ length: info.r1Pages }).map((_, pageIdx) => (
                  <WordTypeMeaningTestSheet
                    key={`wt-r1-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={r1Starts[dayIdx] + pageIdx}
                    pageIndex={pageIdx}
                    round={1}
                    words={info.headwords}
                  />
                ));
              })}
              
              {/* 2회독: 모든 단어 (모든 Day) */}
              {localDayGroups.map((dayGroup, dayIdx) => {
                const info = wtDayInfo[dayIdx];
                return Array.from({ length: info.r2Pages }).map((_, pageIdx) => (
                  <WordTypeMeaningTestSheet
                    key={`wt-r2-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={r2Starts[dayIdx] + pageIdx}
                    pageIndex={pageIdx}
                    round={2}
                    words={info.allWords}
                  />
                ));
              })}
              
              {/* 3회독: 예문 빈칸 (모든 Day) */}
              {localDayGroups.map((dayGroup, dayIdx) => {
                const info = wtDayInfo[dayIdx];
                return Array.from({ length: info.r3Pages }).map((_, pageIdx) => (
                  <WordTypeSentenceFillSheet
                    key={`wt-r3-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={r3Starts[dayIdx] + pageIdx}
                    pageIndex={pageIdx}
                    words={info.allWords}
                  />
                ));
              })}
              
              {/* 답지 1회독 (모든 Day) */}
              {localDayGroups.map((dayGroup, dayIdx) => {
                const info = wtDayInfo[dayIdx];
                return Array.from({ length: info.r1Pages }).map((_, pageIdx) => (
                  <WordTypeMeaningAnswerSheet
                    key={`wt-a1-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={a1Starts[dayIdx] + pageIdx}
                    pageIndex={pageIdx}
                    round={1}
                    words={info.headwords}
                  />
                ));
              })}
              
              {/* 답지 2회독 (모든 Day) */}
              {localDayGroups.map((dayGroup, dayIdx) => {
                const info = wtDayInfo[dayIdx];
                return Array.from({ length: info.r2Pages }).map((_, pageIdx) => (
                  <WordTypeMeaningAnswerSheet
                    key={`wt-a2-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={a2Starts[dayIdx] + pageIdx}
                    pageIndex={pageIdx}
                    round={2}
                    words={info.allWords}
                  />
                ));
              })}
              
              {/* 답지 3회독 (모든 Day) */}
              {localDayGroups.map((dayGroup, dayIdx) => {
                const info = wtDayInfo[dayIdx];
                return Array.from({ length: info.r3Pages }).map((_, pageIdx) => (
                  <WordTypeSentenceAnswerSheet
                    key={`wt-a3-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={a3Starts[dayIdx] + pageIdx}
                    pageIndex={pageIdx}
                    words={info.allWords}
                  />
                ));
              })}
              
              <MiniTestBackCoverPage config={config} title="MINI TEST" />
            </>;
          }
          
          // ========== Standard workbook test system ==========
          // Calculate meaning practice page counts for each day
          const meaningPageCounts = localDayGroups.map(dg => getMeaningPracticePageCount(dg));
          
          // Calculate sentence fill page counts for each day
          const sentencePageCounts = localDayGroups.map(dg => getSentenceFillPageCount(dg));
          const wordRelationSeparatePages = localDayGroups.map(dg => needsSeparateWordRelationPage(dg) ? 1 : 0);
          
          // 시험지 페이지 번호 계산 (Day당 M+1+N페이지+W페이지: 뜻맞추기M페이지 + 스펠링 + 예문빈칸N페이지 + 단어관계W페이지)
          let pageOffset = 0;
          const testPages = localDayGroups.map((dg, dayIdx) => {
            const meaningStartPage = currentPageNum + pageOffset;
            const meaningPageCount = meaningPageCounts[dayIdx];
            const spellingPage = meaningStartPage + meaningPageCount;
            const sentenceStartPage = sentencePageCounts[dayIdx] > 0 ? spellingPage + 1 : null;
            const sentencePageCount = sentencePageCounts[dayIdx];
            const wordRelationPage = wordRelationSeparatePages[dayIdx] === 1 
              ? (sentenceStartPage ? sentenceStartPage + sentencePageCount : spellingPage + 1) 
              : null;
            pageOffset += meaningPageCount + 1 + sentencePageCount + wordRelationSeparatePages[dayIdx];
            return { 
              meaningStart: meaningStartPage,
              meaningCount: meaningPageCount,
              spelling: spellingPage, 
              sentenceStart: sentenceStartPage,
              sentenceCount: sentencePageCount,
              wordRelationPage
            };
          });
          
          // 답지 페이지 수 계산 (Day별로 여러 페이지 가능)
          const answerPageCounts = localDayGroups.map(dg => getAnswerKeyPageCount(dg));
          
          // 답지 시작 페이지 (모든 시험지 이후)
          const answerStartPage = currentPageNum + pageOffset;
          let answerPageOffset = 0;
          const answerPages = localDayGroups.map((_, dayIdx) => {
            const startPage = answerStartPage + answerPageOffset;
            answerPageOffset += answerPageCounts[dayIdx];
            return { startPage, pageCount: answerPageCounts[dayIdx] };
          });

          return <>
            {/* Day별 시험지 세트 (뜻맞추기N페이지 + 스펠링 + 예문빈칸채우기 N페이지) */}
            {localDayGroups.map((dayGroup, dayIdx) => (
              <React.Fragment key={`test-set-${dayGroup.day}`}>
                {/* Meaning Practice - multiple pages if needed */}
                {Array.from({ length: testPages[dayIdx].meaningCount }).map((_, pageIdx) => (
                  <MeaningPracticeSheet 
                    key={`meaning-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup} 
                    config={config} 
                    absolutePageNum={testPages[dayIdx].meaningStart + pageIdx}
                    pageIndex={pageIdx}
                  />
                ))}
                <SpellingTestSheet dayGroup={dayGroup} config={config} absolutePageNum={testPages[dayIdx].spelling} />
                {testPages[dayIdx].sentenceStart && Array.from({ length: testPages[dayIdx].sentenceCount }).map((_, pageIdx) => (
                  <SentenceFillTestSheet 
                    key={`sentence-${dayGroup.day}-${pageIdx}`}
                    dayGroup={dayGroup} 
                    config={config} 
                    absolutePageNum={testPages[dayIdx].sentenceStart! + pageIdx}
                    pageIndex={pageIdx}
                  />
                ))}
                {/* Word Relation on separate page when it doesn't fit on sentence fill */}
                {testPages[dayIdx].wordRelationPage && (
                  <WordRelationPage
                    key={`word-relation-${dayGroup.day}`}
                    dayGroup={dayGroup}
                    config={config}
                    absolutePageNum={testPages[dayIdx].wordRelationPage!}
                  />
                )}
              </React.Fragment>
            ))}
            
            {/* 모든 답지는 맨끝에 한번에 제시 (여러 페이지 지원) */}
            {localDayGroups.map((dayGroup, dayIdx) => (
              <React.Fragment key={`answer-set-${dayGroup.day}`}>
                {Array.from({ length: answerPages[dayIdx].pageCount }).map((_, pageIdx) => (
                  <AnswerKeySheet 
                    key={`answer-${dayGroup.day}-${pageIdx}`} 
                    dayGroup={dayGroup} 
                    config={config} 
                    absolutePageNum={answerPages[dayIdx].startPage + pageIdx}
                    pageIndex={pageIdx}
                    totalPages={answerPages[dayIdx].pageCount}
                  />
                ))}
              </React.Fragment>
            ))}
            
            {/* MINI TEST 백 커버 */}
            <MiniTestBackCoverPage config={config} />
          </>;
        })()}
        </>}
        
        {/* Back Cover */}
        <BackCoverPage config={config} />

        {/* Mini Book Section - A5 휴대용 단어장 - only after all days rendered */}
        {renderedDayCount >= localDayGroups.length && (
          <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 595px 10000px' }}>
            <MiniBook dayGroups={localDayGroups} config={config} />
          </div>
        )}
      </div>
      
    </div>;
}