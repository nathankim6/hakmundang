import type { CSSProperties } from "react";
import { artSvg, iconSvg, WEB, type ArtName, type IconName } from "@/assets/art";
import { characterSvg, crestSvg, sceneSvg, stickerSvg, type CharacterName, type SceneName, type StickerName } from "@/assets/toon";
import { logoUrl } from "@/lib/schools/logos";

/**
 * 그림을 인라인 SVG로 그린다.
 * 색은 CSS 토큰을 따라가므로 다크 모드에서도 그대로 쓴다.
 * 문자열은 우리 파일(assets/*.ts)에서만 오므로 innerHTML 로 넣어도 안전하다.
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

/** 선 그림(구버전). PPT와 공유. */
export function Art({ name, width, style, className }: { name: ArtName; width?: number | string; style?: CSSProperties; className?: string }) {
  const svg = artSvg(name, { palette: WEB }).replace(/ width="[^"]*" height="[^"]*"/, ' width="100%" height="100%"');
  return (
    <span
      className={className}
      style={{ display: "block", ...(width != null ? { width } : className ? {} : { width: "100%" }), aspectRatio: "320 / 220", lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** 만화풍 장면 */
export function Scene({ name, width, style, className }: { name: SceneName; width?: number | string; style?: CSSProperties; className?: string }) {
  const svg = sceneSvg(name, { width: "100%", height: "100%" });
  return (
    <span
      className={className}
      style={{ display: "block", ...(width != null ? { width } : className ? {} : { width: "100%" }), aspectRatio: "320 / 220", lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** 캐릭터(학생·선생님·등대) */
export function Character({ name, height = 120, style, className }: { name: CharacterName; height?: number; style?: CSSProperties; className?: string }) {
  return (
    <span
      className={className}
      style={{ display: "inline-block", height, width: (height * 120) / 168, lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: characterSvg(name, { height: "100%" }).replace(/ width="[^"]*"/, ' width="100%"') }}
    />
  );
}

/** 스티커(별·말풍선·트로피 …) */
export function Sticker({ name, size = 40, style, className }: { name: StickerName; size?: number; style?: CSSProperties; className?: string }) {
  return <span className={className} style={{ display: "inline-flex", width: size, height: size, flex: "none", lineHeight: 0, ...style }} dangerouslySetInnerHTML={{ __html: stickerSvg(name, { size }) }} />;
}

/** 학교 로고 배지. 파일이 없으면 문양으로. */
export function Logo({ code, name, size = "md", style }: { code: string; name: string; size?: "sm" | "md" | "lg"; style?: CSSProperties }) {
  const url = logoUrl(code);
  const cls = `orun-logo${size === "md" ? "" : ` orun-logo--${size}`}`;
  if (url) {
    return (
      <span className={cls} style={style}>
        <img src={url} alt="" loading="lazy" />
      </span>
    );
  }
  return <span className={cls} style={{ ...style, overflow: "visible" }} dangerouslySetInnerHTML={{ __html: crestSvg(name, { size: "82%" }) }} />;
}
