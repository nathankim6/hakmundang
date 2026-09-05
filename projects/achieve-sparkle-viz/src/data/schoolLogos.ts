// Permanent registry of school logos. Keyed by school short name.
import gangnam from "@/assets/school-logos/강남중.jpg.asset.json";
import daebang from "@/assets/school-logos/대방중.jpg.asset.json";
import ganghyeon from "@/assets/school-logos/강현중.png.asset.json";
import guksabong from "@/assets/school-logos/국사봉중.jpg.asset.json";
import namseong from "@/assets/school-logos/남성중.png.asset.json";
import danggok from "@/assets/school-logos/당곡중.png.asset.json";
import dongyang from "@/assets/school-logos/동양중.png.asset.json";
import dongjak from "@/assets/school-logos/동작중.webp.asset.json";
import munchang from "@/assets/school-logos/문창중.png.asset.json";
import sadang from "@/assets/school-logos/사당중.webp.asset.json";
import sangdo from "@/assets/school-logos/상도중.png.asset.json";
import sanghyeon from "@/assets/school-logos/상현중.webp.asset.json";
import seongnam from "@/assets/school-logos/성남중.png.asset.json";
import sungui from "@/assets/school-logos/숭의여중.webp.asset.json";
import singil from "@/assets/school-logos/신길중.jpeg.asset.json";
import yeongdeungpo from "@/assets/school-logos/영등포중.jpeg.asset.json";
import jangseung from "@/assets/school-logos/장승중.png.asset.json";
import jungdaebu from "@/assets/school-logos/중대부중.jpg.asset.json";

export const SCHOOL_LOGOS: Record<string, string> = {
  "강남중": gangnam.url,
  "대방중": daebang.url,
  "대대방중": daebang.url,
  "강현중": ganghyeon.url,
  "국사봉중": guksabong.url,
  "남성중": namseong.url,
  "당곡중": danggok.url,
  "동양중": dongyang.url,
  "동작중": dongjak.url,
  "문창중": munchang.url,
  "사당중": sadang.url,
  "상도중": sangdo.url,
  "상현중": sanghyeon.url,
  "성남중": seongnam.url,
  "숭의여중": sungui.url,
  "신길중": singil.url,
  "영등포중": yeongdeungpo.url,
  "장승중": jangseung.url,
  "중대부중": jungdaebu.url,
};

export const getSchoolLogo = (name: string, fallback?: string): string | undefined =>
  SCHOOL_LOGOS[name] ?? fallback;
