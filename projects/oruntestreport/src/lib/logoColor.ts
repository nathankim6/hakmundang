import { useEffect, useState } from "react";

export interface BannerTheme {
  from: string;
  mid: string;
  to: string;
  accent: string; // 라이트 포인트 컬러 (룰/텍스트 강조용)
}

const DEFAULT_BANNER: BannerTheme = {
  from: "#1b2a5e",
  mid: "#243b7a",
  to: "#1b2a5e",
  accent: "hsl(48, 100%, 58%)",
};

const cache = new Map<string, BannerTheme>();

interface RGB { r: number; g: number; b: number }

function rgbToHsl({ r, g, b }: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

/** 배너용 다크 톤 + 액센트 톤 생성 */
function toBannerTheme(dom: RGB): BannerTheme {
  const [h, s] = rgbToHsl(dom);
  const sat = Math.min(Math.max(s * 100, 35), 80); // 너무 뿌옇거나 쨍하지 않게
  return {
    from: `hsl(${Math.round(h)}, ${Math.round(sat)}%, 22%)`,
    mid: `hsl(${Math.round(h)}, ${Math.round(sat)}%, 32%)`,
    to: `hsl(${Math.round(h)}, ${Math.round(sat)}%, 22%)`,
    accent: `hsl(${Math.round(h)}, ${Math.round(Math.min(sat + 30, 95))}%, 62%)`,
  };
}

async function extractDominantColor(url: string): Promise<RGB | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), 6000);
    img.onload = () => {
      clearTimeout(timer);
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0, g = 0, b = 0, weight = 0;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 160) continue; // 투명 픽셀 제외
          const px: RGB = { r: data[i], g: data[i + 1], b: data[i + 2] };
          const [, s, l] = rgbToHsl(px);
          if (l > 0.93 || l < 0.05) continue; // 흰색 배경/순수 검정 제외
          // 채도가 높은 픽셀에 가중치 → 로고의 대표 브랜드 컬러 추출
          const w = 1 + s * 2.5;
          r += px.r * w; g += px.g * w; b += px.b * w; weight += w;
        }
        if (!weight) return resolve(null);
        resolve({ r: r / weight, g: g / weight, b: b / weight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
}

/**
 * 학교 로고 URL에서 대표 색상을 추출해 헤더 배너 테마로 변환하는 훅.
 * 추출 실패/로딩 중에는 기본 네이비 테마 반환.
 */
export function useLogoBannerTheme(logoUrl: string | null): BannerTheme {
  const [theme, setTheme] = useState<BannerTheme>(
    (logoUrl && cache.get(logoUrl)) || DEFAULT_BANNER
  );

  useEffect(() => {
    if (!logoUrl) {
      setTheme(DEFAULT_BANNER);
      return;
    }
    const hit = cache.get(logoUrl);
    if (hit) { setTheme(hit); return; }
    let cancelled = false;
    extractDominantColor(logoUrl).then((dom) => {
      if (cancelled) return;
      if (dom) {
        const t = toBannerTheme(dom);
        cache.set(logoUrl, t);
        setTheme(t);
      }
    });
    return () => { cancelled = true; };
  }, [logoUrl]);

  return theme;
}
