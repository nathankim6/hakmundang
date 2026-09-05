// 테마 토큰 기반 카테고리 팔레트 — data-theme에 따라 자동으로 색감이 바뀐다.
export type PaletteEntry = { bar: string; tint: string; label: string; track: string; line: string };

export const CATEGORY_PALETTE: PaletteEntry[] = [1, 2, 3, 4, 5].map((n) => ({
  bar: `hsl(var(--c${n}))`,
  tint: `hsl(var(--c${n}-soft))`,
  label: `hsl(var(--c${n}-deep))`,
  track: `hsl(var(--c${n}) / 0.14)`,
  line: `hsl(var(--c${n}) / 0.22)`,
}));

export const getCategoryAccent = (index: number): PaletteEntry =>
  CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];

export const DIFFICULTY_PALETTE = {
  easy: { color: 'hsl(var(--diff-easy))', soft: 'hsl(var(--diff-easy-soft))' },
  medium: { color: 'hsl(var(--diff-mid))', soft: 'hsl(var(--diff-mid-soft))' },
  hard: { color: 'hsl(var(--diff-hard))', soft: 'hsl(var(--diff-hard-soft))' },
  very_hard: { color: 'hsl(var(--diff-xhard))', soft: 'hsl(var(--diff-xhard-soft))' },
} as const;
