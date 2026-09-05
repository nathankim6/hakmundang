import type { CSSProperties } from "react";
import { artSvg, iconSvg, WEB, type ArtName, type IconName } from "@/assets/art";

/**
 * 삽화·아이콘을 인라인 SVG로 그린다.
 * 색은 currentColor 와 CSS 토큰을 따라가므로 다크 배경에서도 그대로 쓴다.
 * 문자열은 우리 파일(assets/art.ts)에서만 오므로 innerHTML 로 넣어도 안전하다.
 */

export function Icon({
  name,
  size = 18,
  stroke,
  title,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  title?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={className ? `orun-ic ${className}` : "orun-ic"}
      style={{ display: "inline-flex", width: size, height: size, flex: "none", lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: iconSvg(name, { size, stroke, title, palette: WEB }) }}
    />
  );
}

export function Art({
  name,
  width,
  style,
  className,
}: {
  name: ArtName;
  width?: number | string;
  style?: CSSProperties;
  className?: string;
}) {
  // 크기는 바깥 상자(또는 className)가 정한다. SVG는 100%로 채운다.
  const svg = artSvg(name, { palette: WEB }).replace(/ width="[^"]*" height="[^"]*"/, ' width="100%" height="100%"');
  return (
    <span
      className={className}
      style={{
        display: "block",
        ...(width != null ? { width } : className ? {} : { width: "100%" }),
        aspectRatio: "320 / 220",
        lineHeight: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
