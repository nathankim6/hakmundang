import { A4Page } from "./A4Page";

interface UnitCoverPageProps {
  unitNumber: number;
  title: string;
  subtitle?: string;
  problemCount: number;
  pageNumber: number;
  totalPages: number;
}

export function UnitCoverPage({ 
  unitNumber, 
  title, 
  subtitle, 
  problemCount,
  pageNumber,
  totalPages 
}: UnitCoverPageProps) {
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages}>
      <div className="flex flex-col items-center justify-center min-h-[200mm]">
        {/* Unit Badge */}
        <div className="mb-8">
          <div className="w-24 h-24 rounded-lg bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-lg">
            <span className="text-xs font-bold tracking-widest opacity-80">UNIT</span>
            <span className="text-4xl font-black">{String(unitNumber).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-3 max-w-md">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-muted-foreground text-center mb-8">
            {subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-px bg-border" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-16 h-px bg-border" />
        </div>

        {/* Problem Count */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded">
            <span className="text-muted-foreground">총</span>
            <span className="font-bold text-foreground">{problemCount}</span>
            <span className="text-muted-foreground">문제</span>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="mt-12 max-w-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 text-center">
            학습 목표
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>한글 문장을 정확한 영어 문장으로 변환</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>주어진 단어를 활용한 배열 영작</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>문법 구조의 정확한 이해와 적용</span>
            </li>
          </ul>
        </div>
      </div>
    </A4Page>
  );
}
