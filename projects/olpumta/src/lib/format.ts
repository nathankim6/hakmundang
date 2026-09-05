export function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatTotal(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h === 0 && m === 0 && s > 0) return `${s}초`;
  return `${h}시간 ${m.toString().padStart(2, "0")}분`;
}

export function formatTotalShort(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}분`;
  return `${h}시간 ${m}분`;
}

export const STICKER_BG: Record<string, string> = {
  pink: "bg-sticker-pink",
  blue: "bg-sticker-blue",
  green: "bg-sticker-green",
  yellow: "bg-sticker-yellow",
};

export const STICKER_BAR: Record<string, string> = {
  pink: "bg-[oklch(0.8_0.12_20)]",
  blue: "bg-[oklch(0.75_0.12_240)]",
  green: "bg-[oklch(0.78_0.12_150)]",
  yellow: "bg-[oklch(0.85_0.15_85)]",
};
