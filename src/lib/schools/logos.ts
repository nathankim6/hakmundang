import raw from "@/data/logos.json";

/**
 * 학교 로고 목록. public/logos/{code}.{ext} 에 파일이 있는 학교만 적혀 있다.
 * 없는 학교는 만화풍 문양(crestSvg)으로 대신한다.
 */
export const LOGO_EXT: Record<string, "png" | "svg"> = raw as Record<string, "png" | "svg">;

export function logoUrl(code: string): string | null {
  const ext = LOGO_EXT[code];
  return ext ? `/logos/${code}.${ext}` : null;
}
