import React from 'react';
import { DayGroup, VocabularyWord } from '@/types/vocabulary';
import { WorkbookConfig } from './WorkbookSettings';
import botanicalVoca0 from '@/assets/botanical-voca0.png';
import botanicalVoca1 from '@/assets/botanical-voca1.png';
import botanicalVoca2 from '@/assets/botanical-voca2.png';


const getBotanicalImage = (volumeNumber: string) => {
  if (volumeNumber === '0') return botanicalVoca0;
  if (volumeNumber === '1') return botanicalVoca1;
  if (volumeNumber === '2') return botanicalVoca2;
  return botanicalVoca0;
};

// A4 size: 210mm x 297mm (840px x 1188px at 96dpi)
const A5_WIDTH = 840;
const A5_HEIGHT = 1188;

// Helper functions
function darkenColor(hex: string, amount: number = 0.2): string {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
  const darkened = rgb.map(c => Math.max(0, Math.floor(c * (1 - amount))));
  return `#${darkened.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

function lightenColor(hex: string, amount: number = 0.1): string {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
  const lightened = rgb.map(c => Math.min(255, Math.floor(c + (255 - c) * amount)));
  return '#' + lightened.map(x => x.toString(16).padStart(2, '0')).join('');
}

interface MiniBookProps {
  dayGroups: DayGroup[];
  config: WorkbookConfig;
}

// Mini Book Hard Cover Front Page - B5 HardCoverPage와 동일한 프리미엄 에디토리얼 스타일 (A5 스케일)
function MiniBookHardCover({
  config,
  totalDays,
  totalWords
}: {
  config: WorkbookConfig;
  totalDays: number;
  totalWords: number;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);
  const volumeMatch = config.title.match(/(?:ORUN\s*VOCA|옳은보카)\s*(.+)/i);
  const volumeNumber = volumeMatch ? volumeMatch[1].trim() : config.title.match(/\d+/)?.[0] || '';
  const isLiteVersion = /^(0|1|2)$/.test(volumeNumber);

  const subtitleMap: Record<string, string> = {
    '0': '기초단어 완성',
    '1': '초등 기본 어휘',
    '2': '초·중등 필수 어휘',
    '3': '중등 필수 어휘',
    '4': '중등 고난도 어휘',
    '5': '고등 기본 어휘',
    '6': '고등 필수 어휘',
    '7': '고등 고난도 어휘',
    '8': '고등 어휘 완성',
  };

  return <div className="page-b5 shadow-2xl relative overflow-hidden mini-book-page" data-page-type="mini-book-hard-cover" style={{
    width: `${A5_WIDTH}px`,
    height: `${A5_HEIGHT}px`,
    background: '#FAFAF8'
  }}>
    {/* === Botanical pattern overlay for Lite covers === */}
    {isLiteVersion && <>
      {/* Bottom botanical - full width, growing upward */}
      <div style={{
        position: 'absolute', bottom: -30, left: -20, right: -20,
        height: '520px', zIndex: 4, pointerEvents: 'none',
        mixBlendMode: 'multiply',
        maskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 90%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 90%)',
      }}>
        <img src={getBotanicalImage(volumeNumber)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', opacity: 0.45 }} />
      </div>
      {/* Top-right accent */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: '340px', height: '340px', zIndex: 4, pointerEvents: 'none',
        mixBlendMode: 'multiply',
        maskImage: 'radial-gradient(ellipse 80% 80% at 80% 20%, black 10%, transparent 65%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 80% 20%, black 10%, transparent 65%)',
      }}>
        <img src={getBotanicalImage(volumeNumber)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.30, transform: 'rotate(180deg) scaleX(-1)' }} />
      </div>
    </>}
    {/* === Subtle top-right gradient wash === */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '60%',
      height: '50%',
      background: `radial-gradient(ellipse at top right, ${lightenColor(bgColor, 0.75)}40 0%, transparent 70%)`,
      zIndex: 1
    }} />

    {/* === Bottom colored section with diagonal === */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '48%',
      background: `linear-gradient(145deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      clipPath: 'polygon(0 18%, 100% 0%, 100% 100%, 0 100%)',
      zIndex: 2
    }} />

    {/* Herringbone texture on colored section */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '48%',
      clipPath: 'polygon(0 18%, 100% 0%, 100% 100%, 0 100%)',
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
      backgroundSize: '60px 100px',
      backgroundPosition: '0 0, 0 0, 30px 50px, 30px 50px, 0 0, 30px 50px'
    }} />

    {/* === Left spine bar === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '8px',
      height: '100%',
      background: `linear-gradient(180deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      zIndex: 20
    }} />

    {/* === Diagonal decorative line across the split === */}
    <div style={{
      position: 'absolute',
      top: '49%',
      left: '8px',
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, ${bgColor}60 0%, ${bgColor}15 100%)`,
      transform: 'rotate(-3.5deg)',
      transformOrigin: 'left center',
      zIndex: 5
    }} />

    {/* === Ghost volume number === */}
    {volumeNumber && (
      <div style={{
        position: 'absolute',
        ...(volumeNumber.length > 3
          ? { left: '-8px' }
          : { right: '-8px' }
        ),
        top: '35%',
        transform: 'translateY(-50%)',
        fontSize: volumeNumber.length > 3 ? '200px' : '320px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 900,
        color: bgColor,
        opacity: 0.05,
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
      padding: '28px 28px 24px 32px'
    }}>
      {/* Header: logo + badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '5px', overflow: 'hidden',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontSize: '8px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: '#aaa',
            letterSpacing: '0.15em'
          }}>ORUN ENGLISH</span>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
          color: '#fff',
          padding: '3px 12px',
          borderRadius: '2px',
          fontSize: '7px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          boxShadow: `0 2px 8px ${bgColor}30`
        }}>
          {config.title}
        </div>
      </div>

      {/* Double line separator */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}40, #e0e0e0, transparent)`, marginBottom: '2px' }} />
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${bgColor}20, #eee, transparent)` }} />
      </div>

      {/* === Hero section === */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '8px' }}>
        {/* Series label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '2px', height: '12px', background: bgColor, borderRadius: '1px' }} />
          <span style={{
            fontSize: '7px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 600,
            color: bgColor,
            letterSpacing: '0.4em',
            textTransform: 'uppercase' as const
          }}>ORUN ENGLISH VOCAB SERIES</span>
        </div>

        {/* Main title */}
        <div style={{
          fontSize: '38px',
          fontFamily: '"Orbitron", "Playfair Display", serif',
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          lineHeight: 1,
          marginBottom: '10px',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px'
        }}>
          ORUN VOCA
          {isLiteVersion && <span style={{
            fontSize: '16px',
            fontFamily: '"Orbitron", serif',
            fontWeight: 700,
            color: bgColor,
            letterSpacing: '0.22em',
            opacity: 1,
            background: `linear-gradient(135deg, ${bgColor}18, ${bgColor}08)`,
            border: `2px solid ${bgColor}60`,
            padding: '3px 12px',
            borderRadius: '4px',
            textShadow: `0 1px 2px ${bgColor}30`,
          }}>Lite</span>}
        </div>

        {/* Accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '20px' }}>
          <div style={{ width: '28px', height: '2px', background: bgColor, borderRadius: '2px' }} />
          <div style={{ width: '6px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
          <div style={{ width: '3px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
        </div>

        {/* Volume / Subtitle */}
        {config.coverSubtitle ? (
          <div style={{
            fontSize: config.coverSubtitle.length > 10 ? '22px' : '28px',
            fontFamily: '"Orbitron", serif',
            fontWeight: 700,
            color: '#D4A853',
            letterSpacing: '0.05em',
            marginBottom: '10px'
          }}>
            {config.coverSubtitle}
          </div>
        ) : volumeNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                border: `2px solid ${bgColor}30`,
                position: 'absolute',
                top: '-4px',
                left: '-4px'
              }} />
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 20px ${bgColor}35`
              }}>
                <span style={{
                  fontSize: '26px',
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 800,
                  color: '#FFFFFF'
                }}>
                  {volumeNumber}
                </span>
              </div>
            </div>
            <div style={{
              fontSize: '10px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 400,
              color: '#888',
              lineHeight: 1.7
            }}>
              <div style={{ fontWeight: 700, color: '#444', fontSize: '11px', letterSpacing: '0.05em' }}>Volume {volumeNumber}</div>
              <div>{subtitleMap[volumeNumber] || '체계적 영단어 학습'}</div>
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{
          marginTop: '14px',
          fontSize: '8px',
          fontFamily: '"Noto Sans KR", sans-serif',
          fontWeight: 400,
          color: '#aaa',
          letterSpacing: '0.02em',
          lineHeight: 1.6
        }}>
          <div>English learning empowered by Christian value</div>
          <div>진리 안에서 인재를 만듭니다.</div>
        </div>
      </div>

      {/* === Bottom section on colored area === */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Feature tags */}
        <div style={{
          display: 'flex',
          gap: '5px',
          marginBottom: '14px',
          flexWrap: 'wrap'
        }}>
          {[`총 ${totalDays} DAY`, `${totalWords}단어`, '휴대용 미니북', 'A5 사이즈'].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '3px 10px',
              borderRadius: '2px',
              fontSize: '7px',
              fontFamily: '"Noto Sans KR", sans-serif',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.04em'
            }}>
              {item}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '10px'
        }}>
          <span style={{
            fontSize: '7px',
            fontFamily: '"Noto Sans KR", sans-serif',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.06em'
          }}>www.orunenglish.com</span>
          <span style={{
            fontSize: '8px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.1em'
          }}>ORUN ENGLISH</span>
        </div>
      </div>
    </div>
  </div>;
}

// Mini Book Hard Cover Back Page - B5 BackCoverPage와 동일한 프리미엄 에디토리얼 스타일 (A5 스케일)
function MiniBookHardBackCover({
  config
}: {
  config: WorkbookConfig;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);
  const volumeMatch = config.title.match(/(?:ORUN\s*VOCA|옳은보카)\s*(.+)/i);
  const volumeNumber = volumeMatch ? volumeMatch[1].trim() : '';
  const isLiteVersion = /^(0|1|2)$/.test(volumeNumber);

  return <div className="page-b5 shadow-2xl relative overflow-hidden mini-book-page" data-page-type="mini-book-hard-back-cover" style={{
    width: `${A5_WIDTH}px`,
    height: `${A5_HEIGHT}px`,
    background: '#FAFAF8'
  }}>
    {/* === Botanical pattern overlay for Lite back covers === */}
    {isLiteVersion && <>
      <div style={{
        position: 'absolute', bottom: -40, right: -30,
        width: '380px', height: '380px', zIndex: 4, pointerEvents: 'none',
        mixBlendMode: 'multiply',
        maskImage: 'radial-gradient(ellipse 75% 75% at 75% 75%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 75% 75%, black 20%, transparent 70%)',
      }}>
        <img src={getBotanicalImage(volumeNumber)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.30, transform: 'scaleX(-1)' }} />
      </div>
      <div style={{
        position: 'absolute', top: -30, left: -30,
        width: '340px', height: '340px', zIndex: 4, pointerEvents: 'none',
        mixBlendMode: 'multiply',
        maskImage: 'radial-gradient(ellipse 75% 75% at 25% 25%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 25% 25%, black 20%, transparent 70%)',
      }}>
        <img src={getBotanicalImage(volumeNumber)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22, transform: 'scaleX(-1) rotate(180deg)' }} />
      </div>
    </>}
    {/* === Top colored section with diagonal (inverted from front) === */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '48%',
      background: `linear-gradient(145deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      zIndex: 2
    }} />

    {/* Herringbone texture */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '48%',
      clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
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
      backgroundSize: '60px 100px',
      backgroundPosition: '0 0, 0 0, 30px 50px, 30px 50px, 0 0, 30px 50px'
    }} />

    {/* === Right spine bar === */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '8px',
      height: '100%',
      background: `linear-gradient(180deg, ${bgColor} 0%, ${darkerBg} 100%)`,
      zIndex: 20
    }} />

    {/* Subtle bottom-left gradient wash */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '60%',
      height: '50%',
      background: `radial-gradient(ellipse at bottom left, ${lightenColor(bgColor, 0.75)}40 0%, transparent 70%)`,
      zIndex: 1
    }} />

    {/* === Diagonal decorative line across the split === */}
    <div style={{
      position: 'absolute',
      top: '46%',
      left: 0,
      right: '8px',
      height: '1px',
      background: `linear-gradient(90deg, ${bgColor}15 0%, ${bgColor}60 100%)`,
      transform: 'rotate(3.5deg)',
      transformOrigin: 'right center',
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      {/* Logo */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
        marginBottom: '24px'
      }}>
        <img src="/assets/orun-academy-logo-print.jpg" alt="ORUN" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
      </div>

      {/* Title */}
      <div style={{
        fontSize: '30px',
        fontFamily: '"Orbitron", "Playfair Display", serif',
        fontWeight: 700,
        color: '#1a1a1a',
        letterSpacing: '0.02em',
        lineHeight: 1,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px'
      }}>
        ORUN VOCA
        {/^(0|1|2)$/.test(volumeNumber) && <span style={{
          fontSize: '11px',
          fontFamily: '"Orbitron", serif',
          fontWeight: 600,
          color: bgColor,
          letterSpacing: '0.18em',
          opacity: 0.7,
          border: `1.5px solid ${bgColor}50`,
          padding: '1px 7px',
          borderRadius: '2px',
        }}>Lite</span>}
      </div>

      {/* Accent bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '16px' }}>
        <div style={{ width: '22px', height: '2px', background: bgColor, borderRadius: '2px' }} />
        <div style={{ width: '5px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
        <div style={{ width: '3px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: '10px',
        color: '#999',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 300,
        letterSpacing: '0.15em'
      }}>
        Master vocabulary, unlock your potential
      </p>
    </div>

    {/* Bottom bar */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: '8px',
      zIndex: 20,
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span style={{
        fontSize: '8px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 600,
        color: '#bbb',
        letterSpacing: '0.12em'
      }}>ORUN ENGLISH</span>
      <span style={{
        fontSize: '7px',
        fontFamily: '"Noto Sans KR", sans-serif',
        color: '#ccc',
        letterSpacing: '0.04em'
      }}>www.orunenglish.com</span>
    </div>
  </div>;
}

// Mini Book Word Page - editorial style with theme colors
function MiniBookDayPage({
  dayGroup,
  pageNum,
  config
}: {
  dayGroup: DayGroup;
  pageNum: number;
  config: WorkbookConfig;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);
  const isLeftPage = pageNum % 2 === 0;
  const bindingMargin = 42;
  const outerMargin = 16;
  const dayNumber = dayGroup.day.replace(/[^0-9]/g, '');
  const words = dayGroup.words;

  const useColumns = words.length > 12;
  const columns = useColumns ? 2 : 1;
  const wordsPerColumn = Math.ceil(words.length / columns);

  const headerHeight = 52;
  const footerHeight = 36;
  const contentPadding = 12;
  const availableHeight = A5_HEIGHT - headerHeight - footerHeight - contentPadding * 2;
  const maxRows = useColumns ? wordsPerColumn : words.length;
  const rowHeight = Math.min(Math.floor(availableHeight / maxRows), 48);

  const getFontSize = (rh: number) => {
    if (rh >= 32) return { word: 12, meaning: 10, checkbox: 11 };
    if (rh >= 28) return { word: 11, meaning: 9, checkbox: 10 };
    if (rh >= 24) return { word: 10, meaning: 8, checkbox: 9 };
    if (rh >= 20) return { word: 9, meaning: 7, checkbox: 8 };
    if (rh >= 17) return { word: 8, meaning: 7, checkbox: 7 };
    if (rh >= 14) return { word: 7, meaning: 6, checkbox: 6 };
    return { word: 7, meaning: 6, checkbox: 6 };
  };
  const sizes = getFontSize(rowHeight);

  const pageContentWidth = A5_WIDTH - bindingMargin - outerMargin;
  const columnGap = useColumns ? 16 : 0;
  const columnWidth = useColumns ? (pageContentWidth - columnGap) / 2 : pageContentWidth;

  return <div className="page-b5 shadow-xl relative overflow-hidden mini-book-page" data-page-type="mini-book-word-page" style={{
    width: `${A5_WIDTH}px`,
    height: `${A5_HEIGHT}px`,
    backgroundColor: '#fafafa'
  }}>
    {/* Subtle page texture */}
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(250,250,250,0.4) 50%, rgba(245,245,245,0.6) 100%)'
    }} />

    {/* Decorative corner accents */}
    <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px]" style={{
        backgroundColor: bgColor,
        opacity: 0.04
      }} />
      <div className="absolute top-2 right-2 w-14 h-14 rounded-bl-[35px]" style={{
        backgroundColor: config.secondaryColor,
        opacity: 0.06
      }} />
    </div>
    <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none">
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-tr-[50px]" style={{
        backgroundColor: config.secondaryColor,
        opacity: 0.04
      }} />
      <div className="absolute bottom-2 left-2 w-12 h-12 rounded-tr-[30px]" style={{
        backgroundColor: bgColor,
        opacity: 0.03
      }} />
    </div>

    {/* Watermark */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]" style={{
      transform: 'rotate(-20deg)'
    }}>
    <div className="text-center tracking-widest select-none whitespace-nowrap" style={{
        fontSize: '60px',
        color: 'rgba(180, 180, 180, 0.10)',
        fontFamily: '"Orbitron", "Playfair Display", serif',
        fontWeight: 700
      }}>
        ORUN VOCA
      </div>
    </div>

    {/* Header - Editorial style matching main workbook */}
    <div className="absolute top-0 left-0 right-0" style={{ height: `${headerHeight}px` }}>
      <div className="h-full flex items-center justify-between relative overflow-hidden rounded-b-lg" style={{
        marginLeft: isLeftPage ? `${outerMargin}px` : `${bindingMargin}px`,
        marginRight: isLeftPage ? `${bindingMargin}px` : `${outerMargin}px`,
        background: bgColor
      }}>
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)'
        }} />

        {/* Herringbone decorative pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: 0.08,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)`
        }} />

        {/* Left decorative diamond accent */}
        <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none" style={{
          background: `linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)`
        }}>
          <div className="absolute top-1/2 left-1.5 -translate-y-1/2 w-1.5 h-1.5 rotate-45" style={{ background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* Right decorative diamond accent */}
        <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none" style={{
          background: `linear-gradient(-90deg, rgba(255,255,255,0.1) 0%, transparent 100%)`
        }}>
          <div className="absolute top-1/2 right-1.5 -translate-y-1/2 w-1.5 h-1.5 rotate-45" style={{ background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* Top & bottom border lines */}
        <div className="absolute top-0 left-2 right-2 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="absolute bottom-0 left-2 right-2 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Left: Logo + title */}
        <div className="flex items-center gap-1.5 relative z-10 pl-3">
          <div style={{
            width: '18px', height: '18px', borderRadius: '3px', overflow: 'hidden',
            background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <img src="/assets/orun-academy-logo-print.jpg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: '"Orbitron", "Playfair Display", serif',
            fontWeight: 700,
            fontSize: '8px',
            color: '#FFFFFF',
            letterSpacing: '0.1em'
          }}>
            ORUN VOCA
          </span>
        </div>

        {/* Center: DAY */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span style={{
            fontFamily: '"Orbitron", "Playfair Display", serif',
            fontWeight: 700,
            fontSize: '12px',
            color: '#FFFFFF',
            letterSpacing: '0.08em'
          }}>DAY {dayNumber}</span>
        </div>

        {/* Right: Word count */}
        <div className="flex items-center relative z-10 pr-3">
          <span style={{
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 500,
            fontSize: '8px',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.06em'
          }}>{words.length} WORDS</span>
        </div>
      </div>
    </div>

    {/* Word list */}
    <div className="absolute left-0 right-0" style={{
      top: `${headerHeight + contentPadding}px`,
      bottom: `${footerHeight + contentPadding}px`,
      paddingLeft: isLeftPage ? `${outerMargin}px` : `${bindingMargin}px`,
      paddingRight: isLeftPage ? `${bindingMargin}px` : `${outerMargin}px`
    }}>
      <div className="h-full" style={{
        display: 'grid',
        gridTemplateColumns: useColumns ? '1fr 1fr' : '1fr',
        gap: useColumns ? `${columnGap}px` : '0'
      }}>
        {useColumns ? <>
          <div className="flex flex-col justify-between h-full">
            {words.slice(0, wordsPerColumn).map((word, idx) => <WordRow key={word.id} word={word} index={idx + 1} sizes={sizes} config={config} rowHeight={rowHeight} columnWidth={columnWidth} themeColor={bgColor} />)}
          </div>
          <div className="flex flex-col justify-between h-full relative" style={{
            paddingLeft: `${columnGap / 2}px`
          }}>
            <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{
              background: `linear-gradient(180deg, transparent 0%, ${bgColor}30 10%, ${bgColor}30 90%, transparent 100%)`
            }} />
            {words.slice(wordsPerColumn).map((word, idx) => <WordRow key={word.id} word={word} index={wordsPerColumn + idx + 1} sizes={sizes} config={config} rowHeight={rowHeight} columnWidth={columnWidth} themeColor={bgColor} />)}
          </div>
        </> :
        <div className="flex flex-col justify-between h-full">
          {words.map((word, idx) => <WordRow key={word.id} word={word} index={idx + 1} sizes={sizes} config={config} rowHeight={rowHeight} columnWidth={columnWidth} themeColor={bgColor} />)}
        </div>}
      </div>
    </div>

    {/* Footer - matching main workbook style */}
    <div className="absolute bottom-0 left-0 right-0" style={{
      height: `${footerHeight}px`
    }}>
      <div className="h-[1px]" style={{
        marginLeft: isLeftPage ? `${outerMargin}px` : `${bindingMargin}px`,
        marginRight: isLeftPage ? `${bindingMargin}px` : `${outerMargin}px`,
        background: `linear-gradient(90deg, transparent, ${bgColor}25, transparent)`
      }} />

      <div className="h-full flex items-center justify-between" style={{
        paddingLeft: isLeftPage ? `${outerMargin}px` : `${bindingMargin}px`,
        paddingRight: isLeftPage ? `${bindingMargin}px` : `${outerMargin}px`
      }}>
        <span style={{
          fontSize: '7px',
          color: '#bbb',
          fontFamily: '"Noto Sans KR", sans-serif',
          letterSpacing: '0.06em'
        }}>
          {config.title}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[1px]" style={{
            background: `linear-gradient(90deg, transparent, ${bgColor}60)`
          }} />
          <span style={{
            fontSize: '10px',
            fontFamily: '"Orbitron", serif',
            fontWeight: 700,
            color: bgColor
          }}>
            {pageNum}
          </span>
          <div className="w-3 h-[1px]" style={{
            background: `linear-gradient(90deg, ${bgColor}60, transparent)`
          }} />
        </div>
        <span style={{
          fontSize: '7px',
          color: '#bbb',
          fontFamily: '"Noto Sans KR", sans-serif',
          letterSpacing: '0.1em'
        }}>
          MINI BOOK
        </span>
      </div>
    </div>
  </div>;
}

// Word Row Component
function WordRow({
  word,
  index,
  sizes,
  config,
  rowHeight,
  columnWidth,
  themeColor
}: {
  word: VocabularyWord;
  index: number;
  sizes: { word: number; meaning: number; checkbox: number; };
  config: WorkbookConfig;
  rowHeight: number;
  columnWidth: number;
  themeColor: string;
}) {
  const checkboxWidth = 14;
  const numberWidth = 18;
  const gapSpace = 10;
  const contentWidth = columnWidth - checkboxWidth - numberWidth - gapSpace;
  const wordWidth = Math.floor(contentWidth * 0.48);
  const meaningWidth = Math.floor(contentWidth * 0.52);

  return <div className="flex items-center" style={{
    height: `${rowHeight}px`,
    minHeight: `${rowHeight}px`,
    maxHeight: `${rowHeight}px`,
    borderBottom: `1px solid ${themeColor}15`
  }}>
    {/* Checkbox */}
    <div className="flex-shrink-0 flex items-center justify-center" style={{ width: `${checkboxWidth}px` }}>
      <div style={{
        width: `${sizes.checkbox}px`,
        height: `${sizes.checkbox}px`,
        border: `1px solid ${themeColor}60`,
        borderRadius: '2px',
        background: 'linear-gradient(135deg, #fff 0%, #faf8f5 100%)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
      }} />
    </div>

    {/* Number */}
    <div className="flex-shrink-0 flex items-center justify-center" style={{ width: `${numberWidth}px` }}>
      <span className="font-bold" style={{
        fontSize: `${sizes.meaning}px`,
        color: themeColor,
        fontFamily: '"Noto Sans KR", sans-serif'
      }}>
        {index}
      </span>
    </div>

    {/* Word */}
    <div className="flex-shrink-0 flex flex-col justify-center" style={{
      width: `${wordWidth}px`,
      paddingRight: '4px',
      overflow: 'hidden'
    }}>
      <span className="font-bold" style={{
        fontSize: `${sizes.word}px`,
        color: '#1e3a5f',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 700,
        lineHeight: 1.1,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'normal'
      }}>
        {word.word}
      </span>
      {word.pronunciation && <span style={{
        fontSize: `${Math.max(sizes.word - 2, 5)}px`,
        color: '#666',
        fontFamily: '"Noto Sans KR", "Arial Unicode MS", sans-serif',
        lineHeight: 1.0,
        marginTop: '1px'
      }}>
        {word.pronunciation}
      </span>}
    </div>

    {/* Meaning - auto-shrink font for long text */}
    <span style={{
      fontSize: `${word.meaning.length > 30 ? Math.max(sizes.meaning - 1.5, 5) : word.meaning.length > 20 ? Math.max(sizes.meaning - 0.5, 5.5) : sizes.meaning}px`,
      color: '#444',
      fontFamily: '"Noto Sans KR", sans-serif',
      width: `${meaningWidth}px`,
      lineHeight: word.meaning.length > 30 ? 1.15 : 1.2,
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      display: 'flex',
      alignItems: 'center'
    }}>
      {word.meaning}
    </span>
  </div>;
}

// Mini Book Section Divider - 프리미엄 에디토리얼 스타일
function MiniBookSectionDivider({
  config,
  totalDays,
  totalWords
}: {
  config: WorkbookConfig;
  totalDays: number;
  totalWords: number;
}) {
  const bgColor = config.themeColor;
  const darkerBg = darkenColor(bgColor, 0.3);

  return <div className="page-b5 shadow-xl relative overflow-hidden mini-book-page" data-page-type="mini-book-section-divider" style={{
    width: `${A5_WIDTH}px`,
    height: `${A5_HEIGHT}px`,
    background: '#FAFAF8'
  }}>
    {/* Left spine bar */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '8px',
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

    {/* Ghost "M" letter */}
    <div style={{
      position: 'absolute',
      right: '-20px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '340px',
      fontFamily: '"Orbitron", serif',
      fontWeight: 700,
      color: bgColor,
      opacity: 0.04,
      userSelect: 'none',
      zIndex: 4,
      lineHeight: 0.8
    }}>
      M
    </div>

    {/* Main content */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 32px 32px 36px'
    }}>
      {/* Badge */}
      <div style={{
        background: `linear-gradient(135deg, ${bgColor}, ${darkerBg})`,
        color: '#fff',
        padding: '4px 16px',
        borderRadius: '3px',
        fontSize: '8px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.2em',
        marginBottom: '24px',
        boxShadow: `0 2px 10px ${bgColor}30`
      }}>
        APPENDIX
      </div>

      {/* Title */}
      <div style={{
        fontSize: '32px',
        fontFamily: '"Orbitron", "Playfair Display", serif',
        fontWeight: 700,
        color: '#1a1a1a',
        letterSpacing: '0.02em',
        lineHeight: 1,
        marginBottom: '12px'
      }}>
        MINI BOOK
      </div>

      {/* Accent bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '16px' }}>
        <div style={{ width: '24px', height: '2px', background: bgColor, borderRadius: '2px' }} />
        <div style={{ width: '6px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.5 }} />
        <div style={{ width: '3px', height: '2px', background: bgColor, borderRadius: '2px', opacity: 0.25 }} />
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: '11px',
        fontFamily: '"Noto Sans KR", sans-serif',
        fontWeight: 400,
        color: '#999',
        letterSpacing: '0.15em',
        marginBottom: '32px'
      }}>
        휴대용 단어장
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 800,
            color: '#1a1a1a'
          }}>{totalDays}</div>
          <div style={{
            fontSize: '8px',
            color: '#aaa',
            letterSpacing: '0.25em',
            marginTop: '4px',
            fontFamily: '"Noto Sans KR", sans-serif'
          }}>DAYS</div>
        </div>
        <div style={{ width: '1px', height: '36px', background: '#e0e0e0' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontFamily: '"Noto Sans KR", sans-serif',
            fontWeight: 800,
            color: '#1a1a1a'
          }}>{totalWords}</div>
          <div style={{
            fontSize: '8px',
            color: '#aaa',
            letterSpacing: '0.25em',
            marginTop: '4px',
            fontFamily: '"Noto Sans KR", sans-serif'
          }}>WORDS</div>
        </div>
      </div>

      {/* Size info */}
      <div style={{
        marginTop: '20px',
        fontSize: '9px',
        color: '#bbb',
        fontFamily: '"Noto Sans KR", sans-serif'
      }}>
        A5 사이즈 (148mm × 210mm)
      </div>
    </div>
  </div>;
}

// Main Mini Book Component
export function MiniBook({
  dayGroups,
  config
}: MiniBookProps) {
  const totalWords = dayGroups.reduce((sum, g) => sum + g.words.length, 0);

  const pages: React.ReactNode[] = [];
  let currentPageNum = 1;

  // Section Divider
  pages.push(<MiniBookSectionDivider key="mini-book-section-divider" config={config} totalDays={dayGroups.length} totalWords={totalWords} />);

  // Hard Cover Front
  pages.push(<MiniBookHardCover key="mini-book-hard-cover" config={config} totalDays={dayGroups.length} totalWords={totalWords} />);

  // One page per day
  dayGroups.forEach(dayGroup => {
    pages.push(<MiniBookDayPage key={`mini-day-${dayGroup.day}`} dayGroup={dayGroup} pageNum={currentPageNum} config={config} />);
    currentPageNum++;
  });

  // Hard Cover Back
  pages.push(<MiniBookHardBackCover key="mini-book-hard-back-cover" config={config} />);
  return <>{pages}</>;
}
