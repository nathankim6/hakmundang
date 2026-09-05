import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Gem, Pencil, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import newVeritasBg from '@/assets/new-veritas-bg.jpg';
import orunLogo from '@/assets/orun-academy-logo-new.jpg';
import newVeritasBackBg from '@/assets/new-veritas-back-bg.jpg';
import orunLogoColor from '@/assets/orun-academy-logo-color.jpg';

import bg01 from '@/assets/veritas-bg/bg-01-marble.jpg';
import bg02 from '@/assets/veritas-bg/bg-02-constellation.jpg';
import bg03 from '@/assets/veritas-bg/bg-03-artdeco.jpg';
import bg04 from '@/assets/veritas-bg/bg-04-watercolor.jpg';
import bg05 from '@/assets/veritas-bg/bg-05-herringbone.jpg';
import bg06 from '@/assets/veritas-bg/bg-06-damask.jpg';
import bg07 from '@/assets/veritas-bg/bg-07-aurora.jpg';
import bg08 from '@/assets/veritas-bg/bg-08-hexagon.jpg';
import bg09 from '@/assets/veritas-bg/bg-09-leather.jpg';
import bg10 from '@/assets/veritas-bg/bg-10-topography.jpg';
import bg11 from '@/assets/veritas-bg/bg-11-stainedglass.jpg';
import bg12 from '@/assets/veritas-bg/bg-12-waves.jpg';
import bg13 from '@/assets/veritas-bg/bg-13-moroccan.jpg';
import bg14 from '@/assets/veritas-bg/bg-14-nightsky.jpg';
import bg15 from '@/assets/veritas-bg/bg-15-bokeh.jpg';
import bg16 from '@/assets/veritas-bg/bg-16-fluid.jpg';
import bg17 from '@/assets/veritas-bg/bg-17-compass.jpg';
import bg18 from '@/assets/veritas-bg/bg-18-lowpoly.jpg';
import bg19 from '@/assets/veritas-bg/bg-19-filigree.jpg';
import bg20 from '@/assets/veritas-bg/bg-20-nebula.jpg';
import bg21 from '@/assets/veritas-bg/bg-21-dawn.jpg';
import bg22 from '@/assets/veritas-bg/bg-22-ukiyoe.jpg';
import bg23 from '@/assets/veritas-bg/bg-23-neon.jpg';
import bg24 from '@/assets/veritas-bg/bg-24-tropical.jpg';
import bg25 from '@/assets/veritas-bg/bg-25-mosaic.jpg';
import bg26 from '@/assets/veritas-bg/bg-26-fog.jpg';
import bg27 from '@/assets/veritas-bg/bg-27-papercut.jpg';
import bg28 from '@/assets/veritas-bg/bg-28-firefly.jpg';
import bg29 from '@/assets/veritas-bg/bg-29-artnouveau.jpg';
import bg30 from '@/assets/veritas-bg/bg-30-cliff.jpg';
import bg31 from '@/assets/veritas-bg/bg-31-embroidery.jpg';
import bg32 from '@/assets/veritas-bg/bg-32-doubleexposure.jpg';
import bg33 from '@/assets/veritas-bg/bg-33-rainbow.jpg';
import bg34 from '@/assets/veritas-bg/bg-34-nauticalmap.jpg';
import bg35 from '@/assets/veritas-bg/bg-35-lavender.jpg';
import bg36 from '@/assets/veritas-bg/bg-36-pixel.jpg';
import bg37 from '@/assets/veritas-bg/bg-37-meteor.jpg';
import bg38 from '@/assets/veritas-bg/bg-38-korean.jpg';
import bg39 from '@/assets/veritas-bg/bg-39-goldfiligree.jpg';
import bg40 from '@/assets/veritas-bg/bg-40-compass.jpg';
import bg41 from '@/assets/veritas-bg/bg-41-watercolor-sunset.jpg';
import bg42 from '@/assets/veritas-bg/bg-42-watercolor-mist.jpg';
import bg43 from '@/assets/veritas-bg/bg-43-watercolor-flowers.jpg';
import bg44 from '@/assets/veritas-bg/bg-44-watercolor-night.jpg';
import bg45 from '@/assets/veritas-bg/bg-45-watercolor-rain.jpg';
import bg46 from '@/assets/veritas-bg/bg-46-watercolor-waves.jpg';
import bg47 from '@/assets/veritas-bg/bg-47-watercolor-cherry.jpg';
import bg48 from '@/assets/veritas-bg/bg-48-watercolor-dawn.jpg';
import bg49 from '@/assets/veritas-bg/bg-49-watercolor-snow.jpg';
import bg50 from '@/assets/veritas-bg/bg-50-watercolor-rainbow.jpg';

const BG_OPTIONS = [
  { src: newVeritasBg, label: '💎 다이아몬드' },
  { src: bg01, label: '🌙 별빛 등대' },
  { src: bg02, label: '🌅 석양 실루엣' },
  { src: bg03, label: '🌌 오로라 등대' },
  { src: bg04, label: '🎨 수채화' },
  { src: bg05, label: '⛈️ 폭풍우' },
  { src: bg06, label: '🖌️ 수묵화' },
  { src: bg07, label: '🦅 항공뷰' },
  { src: bg08, label: '🏛️ 아르데코' },
  { src: bg09, label: '🌄 골든아워' },
  { src: bg10, label: '🪟 스테인드글라스' },
  { src: bg11, label: '⭐ 별자리 지도' },
  { src: bg12, label: '🌸 벚꽃' },
  { src: bg13, label: '🔷 로우폴리' },
  { src: bg14, label: '🌕 보름달 반영' },
  { src: bg15, label: '🖼️ 유화' },
  { src: bg16, label: '🍂 단풍' },
  { src: bg17, label: '📐 블루프린트' },
  { src: bg18, label: '☁️ 구름 위' },
  { src: bg19, label: '❄️ 겨울' },
  { src: bg20, label: '🌌 은하수' },
  { src: bg21, label: '🌅 새벽' },
  { src: bg22, label: '🎌 우키요에' },
  { src: bg23, label: '💜 네온' },
  { src: bg24, label: '🏝️ 트로피컬' },
  { src: bg25, label: '🎭 모자이크' },
  { src: bg26, label: '🌫️ 안개' },
  { src: bg27, label: '📄 페이퍼컷' },
  { src: bg28, label: '✨ 반딧불이' },
  { src: bg29, label: '🎨 아르누보' },
  { src: bg30, label: '🏔️ 절벽' },
  { src: bg31, label: '🧵 자수' },
  { src: bg32, label: '📷 이중노출' },
  { src: bg33, label: '🌈 무지개' },
  { src: bg34, label: '🗺️ 항해지도' },
  { src: bg35, label: '💜 라벤더' },
  { src: bg36, label: '🎮 복셀아트' },
  { src: bg37, label: '☄️ 유성우' },
  { src: bg38, label: '🏯 한국전통' },
  { src: bg39, label: '👑 골드 필리그리' },
  { src: bg40, label: '🧭 나침반' },
  { src: bg41, label: '🎨 수채화 석양' },
  { src: bg42, label: '🎨 수채화 안개' },
  { src: bg43, label: '🎨 수채화 꽃밭' },
  { src: bg44, label: '🎨 수채화 밤' },
  { src: bg45, label: '🎨 수채화 비' },
  { src: bg46, label: '🎨 수채화 파도' },
  { src: bg47, label: '🎨 수채화 벚꽃' },
  { src: bg48, label: '🎨 수채화 새벽' },
  { src: bg49, label: '🎨 수채화 눈' },
  { src: bg50, label: '🎨 수채화 무지개' },
];

const A4_WIDTH = 840;
const A4_HEIGHT = 1188;

function NewVeritasFrontCover({ subtitle, bgSrc }: { subtitle: string; bgSrc: string }) {
  return (
    <div style={{
      width: `${A4_WIDTH}px`,
      height: `${A4_HEIGHT}px`,
      position: 'relative',
      overflow: 'hidden',
      background: '#0d1230'
    }}>
      <img src={bgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)', zIndex: 1 }} />

      <div style={{
        position: 'relative', zIndex: 2, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start', paddingTop: '180px'
      }}>
        <img src={orunLogoColor} alt="ORUN" style={{
          width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover',
          marginBottom: '28px', border: '3px solid rgba(255,255,255,0.5)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', background: '#fff'
        }} />

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif", fontSize: '22px', fontWeight: 700,
          color: 'rgba(255,255,255,0.9)', letterSpacing: '0.08em', textAlign: 'center',
          marginBottom: '18px', padding: '0 60px', lineHeight: 1.6,
          textShadow: '0 2px 12px rgba(0,0,0,0.5)'
        }}>
          {subtitle}
        </div>

        <div style={{
          fontFamily: "'Orbitron', 'Playfair Display', serif", fontSize: '72px', fontWeight: 700,
          color: '#ffffff', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.1,
          textShadow: '0 2px 20px rgba(100,140,200,0.4), 0 0 60px rgba(100,140,200,0.15)'
        }}>
          New Veritas
        </div>

        <div style={{ width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(180,200,230,0.6), transparent)', margin: '24px 0' }} />

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif", fontSize: '13px', fontWeight: 400,
          color: 'rgba(180,200,230,0.8)', letterSpacing: '0.12em',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)'
        }}>
          ORUN ENGLISH
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, rgba(100,140,200,0.3), rgba(150,180,220,0.6), rgba(100,140,200,0.3))', zIndex: 3 }} />
    </div>
  );
}

function NewVeritasBackCover({ bgSrc }: { bgSrc: string }) {
  return (
    <div style={{
      width: `${A4_WIDTH}px`,
      height: `${A4_HEIGHT}px`,
      position: 'relative',
      overflow: 'hidden',
      background: '#0d1230'
    }}>
      <img src={bgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)', zIndex: 1 }} />

      <div style={{
        position: 'relative', zIndex: 2, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          fontFamily: "'Orbitron', 'Playfair Display', serif", fontSize: '52px', fontWeight: 700,
          color: '#ffffff', letterSpacing: '0.08em', marginBottom: '16px',
          textShadow: '0 2px 20px rgba(100,140,200,0.4)'
        }}>
          ORUN ENGLISH
        </div>

        <div style={{ width: '240px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(180,200,230,0.5), transparent)', margin: '12px 0 28px' }} />

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif", fontSize: '15px',
          color: 'rgba(200,215,235,0.9)', letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.9,
        }}>
          <div>English learning empowered by Christian value</div>
          <div style={{ fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>진리 안에서 인재를 만듭니다</div>
        </div>

        <div style={{ width: '120px', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(180,200,230,0.4), transparent)', margin: '28px 0 24px' }} />

        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif", fontSize: '13px',
          color: 'rgba(160,180,210,0.7)', letterSpacing: '0.12em',
        }}>
          www.orunenglish.com
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, rgba(100,140,200,0.3), rgba(150,180,220,0.6), rgba(100,140,200,0.3))', zIndex: 3 }} />
    </div>
  );
}

export function NewVeritasCover() {
  const [isOpen, setIsOpen] = useState(false);
  const [subtitle, setSubtitle] = useState('2026년 흑석고등학교 1학년 1학기 중간고사 대비');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(subtitle);
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const selectedBg = BG_OPTIONS[selectedBgIndex].src;

  const handleSaveSubtitle = () => {
    setSubtitle(editValue);
    setIsEditing(false);
  };

  const handlePrint = () => {
    setIsOpen(false);
    document.body.classList.add('veritas-printing');
    toast.info('📋 인쇄 설정', {
      duration: 6000,
      description: '용지: A4 | 여백: 없음 | 배경 그래픽: ✓ 체크'
    });

    const cleanup = () => {
      document.body.classList.remove('veritas-printing');
    };

    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => {
      window.print();
      cleanup();
    }, 350);
  };

  return (
    <>
      {createPortal(
        <div id="veritas-print-container" className="veritas-print-only">
          <div className="page-b5" data-page-type="veritas-front">
            <NewVeritasFrontCover subtitle={subtitle} bgSrc={selectedBg} />
          </div>
          <div className="page-b5" data-page-type="endpaper">
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #141838 0%, #0d1230 100%)' }} />
          </div>
          <div className="page-b5" data-page-type="veritas-back">
            <NewVeritasBackCover bgSrc={selectedBg} />
          </div>
        </div>,
        document.body
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Gem className="h-3.5 w-3.5" />
            New Veritas
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 no-print">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5" />
                New Veritas 표지
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowBgPicker(!showBgPicker)}>
                  <Image className="w-4 h-4" />
                  배경 선택
                </Button>
                <Button onClick={handlePrint} size="sm" className="gap-2">
                  <Printer className="w-4 h-4" />
                  인쇄하기
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">서브타이틀:</span>
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSubtitle()}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveSubtitle}>저장</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm">{subtitle}</span>
                  <Button variant="ghost" size="sm" onClick={() => { setEditValue(subtitle); setIsEditing(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Background Picker */}
          {showBgPicker && (
            <div className="px-6 pb-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">배경 선택 ({BG_OPTIONS.length}개)</p>
                <div className="grid grid-cols-7 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {BG_OPTIONS.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedBgIndex(i); setShowBgPicker(false); }}
                      className="group relative rounded-md overflow-hidden border-2 transition-all hover:scale-105"
                      style={{
                        borderColor: selectedBgIndex === i ? 'hsl(var(--primary))' : 'transparent',
                        aspectRatio: '3/4',
                      }}
                    >
                      <img src={bg.src} alt={bg.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
                        <span className="text-[9px] text-white leading-tight block text-center truncate">{bg.label}</span>
                      </div>
                      {selectedBgIndex === i && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="h-[calc(95vh-160px)]">
            <div className="p-6 flex flex-col items-center gap-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">앞표지 (Front Cover)</h3>
                <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}>
                  <NewVeritasFrontCover subtitle={subtitle} bgSrc={selectedBg} />
                </div>
              </div>

              <div style={{ marginTop: `-${A4_HEIGHT * 0.55 - 40}px` }}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">뒷표지 (Back Cover)</h3>
                <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}>
                  <NewVeritasBackCover bgSrc={selectedBg} />
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
