import { cn } from "@/lib/utils";
import gangnam from "@/assets/schools/gangnam.jpg";
import ganghyeon from "@/assets/schools/ganghyeon.png";
import guksabong from "@/assets/schools/guksabong.jpg";
import guam from "@/assets/schools/guam.jpg";
import daebang from "@/assets/schools/daebang-middle.webp";
import danggok from "@/assets/schools/danggok.png";
import dongyang from "@/assets/schools/dongyang.png";
import munchang from "@/assets/schools/munchang.png";
import sanghyeon from "@/assets/schools/sanghyeon.webp";
import seongnam from "@/assets/schools/seongnam.png";
import soongeui from "@/assets/schools/soongeui.webp";
import singil from "@/assets/schools/singil.jpeg";
import yeongdeungpo from "@/assets/schools/yeongdeungpo.jpeg";
import yeongwon from "@/assets/schools/yeongwon.jpg";
import isu from "@/assets/schools/isu.jpg";
import jangseung from "@/assets/schools/jangseung.png";
import jungdaebu from "@/assets/schools/jungdaebu.jpg";

/**
 * 학교명(부분 일치) → 로고 매핑.
 * "강남중", "강남중학교", "강남" 모두 매칭되도록 핵심 키워드만 사용합니다.
 */
const LOGO_MAP: { keys: string[]; src: string; alt: string }[] = [
  { keys: ["강남중", "강남"], src: gangnam, alt: "강남중학교" },
  { keys: ["강현중", "강현"], src: ganghyeon, alt: "강현중학교" },
  { keys: ["국사봉중", "국사봉"], src: guksabong, alt: "국사봉중학교" },
  { keys: ["구암중", "구암"], src: guam, alt: "구암중학교" },
  { keys: ["대방중", "대방"], src: daebang, alt: "대방중학교" },
  { keys: ["당곡중", "당곡"], src: danggok, alt: "당곡중학교" },
  { keys: ["동양중", "동양"], src: dongyang, alt: "동양중학교" },
  { keys: ["문창중", "문창"], src: munchang, alt: "문창중학교" },
  { keys: ["상현중", "상현"], src: sanghyeon, alt: "상현중학교" },
  { keys: ["성남중", "성남"], src: seongnam, alt: "성남중학교" },
  { keys: ["숭의여중", "숭의여자", "숭의여"], src: soongeui, alt: "숭의여자중학교" },
  { keys: ["신길중", "신길"], src: singil, alt: "신길중학교" },
  { keys: ["영등포중", "영등포"], src: yeongdeungpo, alt: "영등포중학교" },
  { keys: ["영원중", "영원"], src: yeongwon, alt: "영원중학교" },
  { keys: ["이수중", "이수"], src: isu, alt: "이수중학교" },
  { keys: ["장승중", "장승"], src: jangseung, alt: "장승중학교" },
  { keys: ["중대부중", "중앙대부속", "중앙대학교사범대학부속", "중대부"], src: jungdaebu, alt: "중앙대학교 사범대학 부속중학교" },
];

export function findLogo(school?: string) {
  if (!school) return null;
  const s = school.replace(/\s+/g, "");
  for (const item of LOGO_MAP) {
    if (item.keys.some((k) => s.includes(k))) return item;
  }
  return null;
}

interface SchoolLogoProps {
  school?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<SchoolLogoProps["size"]>, string> = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export function SchoolLogo({ school, size = "sm", className }: SchoolLogoProps) {
  const logo = findLogo(school);
  if (!logo) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-white/95 ring-1 ring-border/60 overflow-hidden flex-shrink-0",
        SIZE_CLASS[size],
        className,
      )}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </span>
  );
}
