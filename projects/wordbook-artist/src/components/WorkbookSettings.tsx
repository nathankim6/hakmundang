import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Check, GraduationCap, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from './ui/switch';

export type DifficultyLevel = 'elementary' | 'middle' | 'high';
export type CoverStyle = 'premium' | 'lite';

export interface WorkbookConfig {
  title: string;
  themeColor: string;
  secondaryColor: string;
  difficultyLevel: DifficultyLevel;
  includeExamples: boolean;
  coverStyle: CoverStyle;
  coverSubtitle: string;
}

interface WorkbookSettingsProps {
  config: WorkbookConfig;
  onChange: (config: WorkbookConfig) => void;
}

// Dual-color theme collection
export const THEME_COLORS = [
  { name: 'Soft Blue', primary: '#7BAFD4', secondary: '#4A8BB5', label: '소프트 블루' },
  { name: 'Sage Green', primary: '#7BC4A0', secondary: '#5AA87E', label: '세이지 그린' },
  { name: 'Lavender', primary: '#9B8EC4', secondary: '#7A6DAA', label: '라벤더' },
  { name: 'Soft Coral', primary: '#E8967A', secondary: '#D47A5E', label: '소프트 코랄' },
  { name: 'Soft Teal', primary: '#5BA8A4', secondary: '#458D89', label: '소프트 틸' },
  { name: 'Warm Taupe', primary: '#B8A08A', secondary: '#9D856F', label: '웜 토프' },
  { name: 'Black & Gold', primary: '#1a1a1a', secondary: '#d4a853', label: '블랙 앤 골드' },
  { name: 'Navy', primary: '#2C3E6B', secondary: '#5A7AB5', label: '네이비' },
  { name: 'Forest', primary: '#3D6B4F', secondary: '#6BA37E', label: '포레스트' },
  { name: 'Dusty Rose', primary: '#C4868B', secondary: '#A56B70', label: '더스티 로즈' },
  { name: 'Slate', primary: '#5E6B7A', secondary: '#8A9AAD', label: '슬레이트' },
  { name: 'Deep Plum', primary: '#6B4C6E', secondary: '#9B7A9E', label: '딥 플럼' },
  { name: 'Mint Green', primary: '#6DC8A0', secondary: '#52AD85', label: '민트 그린' },
  { name: 'Bubblegum Pink', primary: '#E87CA0', secondary: '#D4608A', label: '버블껌 핑크' },
  { name: 'Sunshine Yellow', primary: '#E8C84A', secondary: '#D4B032', label: '선샤인 옐로우' },
];

export const WorkbookSettings = ({ config, onChange }: WorkbookSettingsProps) => {
  const [expanded, setExpanded] = useState(false);
  const selectedColor = THEME_COLORS.find(c => c.primary === config.themeColor);

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl overflow-hidden" style={{
      border: '1px solid hsl(var(--border))',
      background: 'hsl(var(--card))',
    }}>
      {/* Collapsed Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{config.title || '단어장 설정'}</span>
          {selectedColor && (
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor.primary }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor.secondary }} />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60">
            {config.coverStyle === 'premium' ? 'Premium' : 'Lite'} · {
              config.difficultyLevel === 'elementary' ? '초등' : config.difficultyLevel === 'middle' ? '중등' : '고등'
            }
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-border/50">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="workbook-title" className="text-xs font-medium text-muted-foreground">단어장 이름</Label>
              <Input
                id="workbook-title"
                value={config.title}
                onChange={(e) => onChange({ ...config, title: e.target.value })}
                placeholder="예: ORUN VOCA 5"
                className="h-9 text-sm"
                maxLength={30}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover-subtitle" className="text-xs font-medium text-muted-foreground">표지 부제목</Label>
              <Input
                id="cover-subtitle"
                value={config.coverSubtitle || ''}
                onChange={(e) => onChange({ ...config, coverSubtitle: e.target.value })}
                placeholder="예: Ultimate"
                className="h-9 text-sm"
                maxLength={20}
              />
            </div>
          </div>

          {/* Difficulty + Examples row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                예문 난이도
              </Label>
              <div className="flex gap-1.5">
                {[
                  { value: 'elementary' as const, label: '초등', color: '#22c55e' },
                  { value: 'middle' as const, label: '중등', color: '#3b82f6' },
                  { value: 'high' as const, label: '고등', color: '#8b5cf6' },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => onChange({ ...config, difficultyLevel: level.value })}
                    className="relative flex-1 py-2 rounded-lg border text-xs font-semibold transition-all duration-200"
                    style={{
                      borderColor: config.difficultyLevel === level.value ? level.color : 'hsl(var(--border))',
                      background: config.difficultyLevel === level.value ? `${level.color}0a` : 'transparent',
                      color: config.difficultyLevel === level.value ? level.color : 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {level.label}
                    {config.difficultyLevel === level.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: level.color }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-border/50">
              <div>
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  예문
                </Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {config.includeExamples ? '포함' : '제외'}
                </p>
              </div>
              <Switch
                checked={config.includeExamples}
                onCheckedChange={(checked) => onChange({ ...config, includeExamples: checked })}
              />
            </div>
          </div>

          {/* Cover Style */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">표지 스타일</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'premium' as const, label: 'Premium', sublabel: '블랙 & 골드', colors: ['#1a1a1a', '#d4a853'] },
                { value: 'lite' as const, label: 'Lite', sublabel: '베이지 & 골드', colors: ['#F5F0E6', '#D4A853'] },
              ].map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => onChange({ ...config, coverStyle: style.value })}
                  className="relative flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200"
                  style={{
                    borderColor: config.coverStyle === style.value ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    background: config.coverStyle === style.value ? 'hsl(var(--primary) / 0.04)' : 'transparent',
                  }}
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0" style={{
                    background: `linear-gradient(135deg, ${style.colors[0]} 50%, ${style.colors[1]} 50%)`
                  }} />
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground">{style.label}</div>
                    <div className="text-[10px] text-muted-foreground">{style.sublabel}</div>
                  </div>
                  {config.coverStyle === style.value && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Colors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">테마 색상</Label>
              {selectedColor && (
                <span className="text-[10px] text-muted-foreground">{selectedColor.label}</span>
              )}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-[repeat(15,1fr)] gap-1.5">
              {THEME_COLORS.map((color) => {
                const isSelected = config.themeColor === color.primary;
                return (
                  <button
                    key={color.primary}
                    type="button"
                    onClick={() => onChange({ ...config, themeColor: color.primary, secondaryColor: color.secondary })}
                    className="relative aspect-square rounded-lg overflow-hidden transition-all duration-300 hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${color.primary} 50%, ${color.secondary} 50%)`,
                      boxShadow: isSelected ? `0 0 0 2px hsl(var(--background)), 0 0 0 3.5px ${color.primary}` : 'none',
                    }}
                    title={color.label}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-2.5 h-2.5 text-gray-800" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


