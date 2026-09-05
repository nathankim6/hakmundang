import { A4Page } from "./A4Page";

interface EndpaperPageProps {
  pageNumber: number;
  totalPages: number;
  variant?: 'front' | 'back';
}

export function EndpaperPage({ pageNumber, totalPages, variant = 'front' }: EndpaperPageProps) {
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Elegant marbled paper effect - 내지 */}
      <div 
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ 
          backgroundColor: '#1a1f2e',
        }}
      >
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: variant === 'front' 
              ? 'radial-gradient(ellipse at 30% 30%, rgba(212,175,55,0.05) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 70% 70%, rgba(212,175,55,0.05) 0%, transparent 50%)',
          }}
        />

        {/* Thin gold border */}
        <div 
          className="absolute"
          style={{
            inset: '16px',
            border: '1px solid rgba(212,175,55,0.15)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </A4Page>
  );
}
