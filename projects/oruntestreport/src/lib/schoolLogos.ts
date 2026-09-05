import gangnamJung from "@/assets/school-logos/강남중.asset.json";
import ganghyeonJung from "@/assets/school-logos/강현중.asset.json";
import guksabongJung from "@/assets/school-logos/국사봉중.asset.json";
import namseongJung from "@/assets/school-logos/남성중.asset.json";
import danggokJung from "@/assets/school-logos/당곡중.asset.json";
import daebangJung from "@/assets/school-logos/대방중.asset.json";
import dongyangJung from "@/assets/school-logos/동양중.asset.json";
import dongjakJung from "@/assets/school-logos/동작중.asset.json";
import munchangJung from "@/assets/school-logos/문창중.asset.json";
import sadangJung from "@/assets/school-logos/사당중.asset.json";
import sangdoJung from "@/assets/school-logos/상도중.asset.json";
import sanghyeonJung from "@/assets/school-logos/상현중.asset.json";
import seongnamJung from "@/assets/school-logos/성남중.asset.json";
import sungeuiYeoJung from "@/assets/school-logos/숭의여중.asset.json";
import singilJung from "@/assets/school-logos/신길중.asset.json";
import yeongdeungpoJung from "@/assets/school-logos/영등포중.asset.json";
import jangseungJung from "@/assets/school-logos/장승중.asset.json";
import jungdaebuJung from "@/assets/school-logos/중대부중.asset.json";
import heukseokGo from "@/assets/school-logos/흑석고.asset.json";
import guamGo from "@/assets/school-logos/구암고.asset.json";
import danggokGo from "@/assets/school-logos/당곡고.asset.json";
import seongnamGo from "@/assets/school-logos/성남고.asset.json";
import sungeuiYeoGo from "@/assets/school-logos/숭의여고2-2.asset.json";
import yeongdeungpoGo from "@/assets/school-logos/영등포고.asset.json";
import sudoYeoGo from "@/assets/school-logos/수도여고.asset.json";

// key: 학교 핵심 이름 (예: "강남중"), value: 로고 URL
// 추후 학교가 추가되면 이 맵에만 항목을 추가하면 됨
const LOGO_MAP: Record<string, string> = {
  "강남중": gangnamJung.url,
  "강현중": ganghyeonJung.url,
  "국사봉중": guksabongJung.url,
  "남성중": namseongJung.url,
  "당곡중": danggokJung.url,
  "대방중": daebangJung.url,
  "동양중": dongyangJung.url,
  "동작중": dongjakJung.url,
  "문창중": munchangJung.url,
  "사당중": sadangJung.url,
  "상도중": sangdoJung.url,
  "상현중": sanghyeonJung.url,
  "성남중": seongnamJung.url,
  "숭의여중": sungeuiYeoJung.url,
  "신길중": singilJung.url,
  "영등포중": yeongdeungpoJung.url,
  "장승중": jangseungJung.url,
  "중대부중": jungdaebuJung.url,
  "중대부속중": jungdaebuJung.url,
  "중앙대부속중": jungdaebuJung.url,
  "중대부중학교": jungdaebuJung.url,
  "중대부속중학교": jungdaebuJung.url,
  "중앙대부속중학교": jungdaebuJung.url,
  "흑석고": heukseokGo.url,
  "구암고": guamGo.url,
  "당곡고": danggokGo.url,
  "성남고": seongnamGo.url,
  "숭의여고": sungeuiYeoGo.url,
  "영등포고": yeongdeungpoGo.url,
  "수도여고": sudoYeoGo.url,
};

/**
 * 학교명을 받아 매칭되는 로고 URL 반환. 없으면 null.
 * "강남 중학교", "강남중학교", "강남중" 모두 매칭되도록 공백/학교 접미어를 정규화.
 */
export function getSchoolLogo(schoolName: string | null | undefined): string | null {
  if (!schoolName) return null;

  // 학교명 정규화: 공백/괄호 제거 → "여자" → "여" → "중학교/고등학교" 축약
  const normalize = (raw: string) =>
    raw
      .replace(/\s+/g, "")
      .replace(/[()[\]]/g, "")
      .replace(/여자/g, "여")
      .replace(/중학교/g, "중")
      .replace(/고등학교/g, "고")
      .replace(/고교/g, "고")
      .replace(/중교/g, "중")
      .replace(/학교/g, "")
      .toLowerCase();

  const target = normalize(schoolName);
  if (!target) return null;

  // 1) 정확 일치 → 2) 포함 관계 (양방향)
  const entries = Object.entries(LOGO_MAP).map(([k, url]) => [normalize(k), url] as const);
  const exact = entries.find(([k]) => k === target);
  if (exact) return exact[1];

  const partial = entries.find(([k]) => target.includes(k) || k.includes(target));
  if (partial) return partial[1];

  return null;
}
