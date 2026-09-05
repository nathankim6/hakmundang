import orunAcademyLogo from '@/assets/orun-academy-logo-new.jpg';
import coverVol1 from '@/assets/orun-weekly-cover-vol1-c.png.asset.json';
import coverVol2 from '@/assets/orun-weekly-cover-vol2-b.png.asset.json';
import coverVol3 from '@/assets/orun-weekly-cover-vol3-b.png.asset.json';

interface WorkbookCoverThumbnailProps {
  variant: 'syntax-10000' | 'syntax-2320' | 'weekly-g10' | 'weekly-g11';
}

export function WorkbookCoverThumbnail({ variant }: WorkbookCoverThumbnailProps) {
  const isWeekly = variant === 'syntax-10000' || variant === 'syntax-2320' || variant === 'weekly-g10' || variant === 'weekly-g11';
  const realCover =
    variant === 'weekly-g10' ? coverVol1
    : variant === 'weekly-g11' ? coverVol2
    : variant === 'syntax-10000' ? coverVol3
    : null;
  const showRealCover = realCover !== null;
  const title = isWeekly ? 'WEEKLY' : '10000';
  const gradeLabel = variant === 'weekly-g10' ? 'TOP/고1' : variant === 'weekly-g11' ? '고2' : variant === 'syntax-10000' ? '고3' : '';
  
  return (
    <div className="relative h-72 w-full flex items-center justify-center py-6 overflow-visible">
      {/* Book Container with 3D perspective */}
      <div 
        className="relative group-hover:scale-105 transition-transform duration-500"
        style={{
          perspective: '1000px',
          perspectiveOrigin: 'center center',
        }}
      >
        {/* 3D Book */}
        <div 
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateY(-15deg) rotateX(5deg)',
          }}
        >
          {/* Book Spine (left side) */}
          <div 
            className="absolute left-0 top-0 h-full w-4"
            style={{
              background: 'linear-gradient(90deg, hsl(220 25% 5%) 0%, hsl(220 20% 12%) 50%, hsl(220 25% 8%) 100%)',
              transform: 'rotateY(90deg) translateZ(8px) translateX(-8px)',
              transformOrigin: 'left center',
              boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.5)',
            }}
          >
            {/* Gold spine accent */}
            <div 
              className="absolute inset-y-4 left-1/2 w-px"
              style={{
                background: 'linear-gradient(180deg, hsl(45 80% 55% / 0.6) 0%, hsl(45 60% 40% / 0.3) 50%, hsl(45 80% 55% / 0.6) 100%)',
              }}
            />
          </div>

          {/* Book Pages (right edge) */}
          <div 
            className="absolute right-0 top-2 bottom-2 w-2"
            style={{
              background: 'linear-gradient(90deg, hsl(40 20% 90%) 0%, hsl(40 15% 85%) 40%, hsl(40 20% 80%) 100%)',
              transform: 'translateX(100%)',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.15)',
            }}
          >
            {/* Page lines */}
            <div className="absolute inset-0" style={{
              background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px)',
            }} />
          </div>

          {/* Main Cover */}
          <div
            className="relative w-44 h-60 overflow-hidden rounded-r-sm"
            style={{
              background: showRealCover
                ? `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url(${realCover!.url})`
                : 'linear-gradient(135deg, hsl(220 25% 12%) 0%, hsl(220 20% 6%) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.7),
                0 12px 24px -8px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255,255,255,0.05)
              `,
            }}
          >
            {!showRealCover && (
              <>
                {/* Leather texture overlay */}
                <div
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Embossed border frame */}
                <div
                  className="absolute inset-4 border rounded-sm"
                  style={{
                    borderColor: 'hsl(45 70% 50% / 0.4)',
                    boxShadow: `
                      inset 0 0 0 1px hsl(45 70% 50% / 0.15),
                      0 0 8px hsl(45 80% 50% / 0.2)
                    `,
                  }}
                >
                  <div
                    className="absolute inset-2 border rounded-sm"
                    style={{
                      borderColor: 'hsl(45 70% 50% / 0.2)',
                    }}
                  />
                </div>

                {/* Content Container */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                  {/* Embossed Logo */}
                  <div className="mb-4">
                    <div
                      className="w-14 h-14 rounded-full p-0.5 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, hsl(45 80% 55%) 0%, hsl(45 70% 40%) 50%, hsl(45 80% 55%) 100%)',
                        boxShadow: `
                          0 0 20px hsl(45 80% 50% / 0.4),
                          0 4px 8px rgba(0,0,0,0.4),
                          inset 0 1px 0 rgba(255,255,255,0.3)
                        `,
                      }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img src={orunAcademyLogo} alt="ORUN Academy" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Embossed Title Section */}
                  <div className="text-center">
                    <h1 className="font-bold tracking-widest leading-tight">
                      <span
                        className="block text-sm"
                        style={{
                          color: 'hsl(40 20% 85%)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5), 0 0 10px hsl(45 80% 50% / 0.2)',
                        }}
                      >
                        ORUN
                      </span>
                      <span
                        className="block text-2xl mt-1 font-cinzel"
                        style={{
                          background: 'linear-gradient(180deg, hsl(45 85% 65%) 0%, hsl(38 70% 50%) 50%, hsl(32 60% 40%) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                        }}
                      >
                        SYNTAX
                      </span>
                      <span
                        className="block text-xl mt-1"
                        style={{
                          background: 'linear-gradient(180deg, hsl(0 0% 90%) 0%, hsl(0 0% 70%) 50%, hsl(0 0% 55%) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(192, 192, 192, 0.4))',
                        }}
                      >
                        {title}
                      </span>
                    </h1>
                  </div>

                  {/* Subtitle with embossed effect */}
                  <div className="mt-4 text-center">
                    <span
                      className="text-[8px] tracking-[0.15em]"
                      style={{
                        color: 'hsl(45 70% 50% / 0.7)',
                        textShadow: '0 1px 1px rgba(0,0,0,0.5)',
                      }}
                    >
                      {gradeLabel ? gradeLabel : 'S Y N T A X  C O L L E C T I O N'}
                    </span>
                  </div>
                </div>

                {/* Glossy shine effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)',
                  }}
                />

                {/* Edge highlight */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-px"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                  }}
                />
              </>
            )}
          </div>

          {/* Bottom shadow for 3D effect */}
          <div 
            className="absolute -bottom-4 left-4 right-0 h-8 -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
              transform: 'rotateX(90deg)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
