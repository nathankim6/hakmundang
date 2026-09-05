import lh0 from "@/assets/lighthouse-0.png";
import lh1 from "@/assets/lighthouse-1.png";
import lh2 from "@/assets/lighthouse-2.png";
import lh3 from "@/assets/lighthouse-3.png";
import lh4 from "@/assets/lighthouse-4.png";

// 단일 건축물(등대) 시스템. 호환성을 위해 기존 export 이름을 유지합니다.
export type CharacterType = "lighthouse";
export const CHARACTER_TYPES: CharacterType[] = ["lighthouse"];

type CharacterMeta = {
  name: string;
  tagline: string;
  stages: [string, string, string, string, string]; // [기초, 기단, 탑신, 등롱, 완공]
  bg: string;
};

const LIGHTHOUSE_META: CharacterMeta = {
  name: "옳은 Lighthouse",
  tagline: "공부의 빛을 밝히는 나만의 등대",
  stages: [lh0, lh1, lh2, lh3, lh4],
  bg: "bg-sticker-blue/30",
};

// Proxy: 어떤 key(레거시 DB 값 포함)로 접근해도 항상 등대 메타를 반환합니다.
export const CHARACTERS = new Proxy({ lighthouse: LIGHTHOUSE_META } as Record<string, CharacterMeta>, {
  get: (target, prop: string) => target[prop] ?? LIGHTHOUSE_META,
}) as Record<CharacterType, CharacterMeta> & Record<string, CharacterMeta>;

// 1분 = 1 EXP. 단계: 0 기초공사(0h), 1 기단공사(2h), 2 탑신공사(10h), 3 등롱공사(30h), 4 완공(100h)
export const STAGE_THRESHOLDS = [0, 120, 600, 1800, 6000];
export const STAGE_LABEL = ["기초공사", "기단공사", "탑신공사", "등롱공사", "완공"];

export function expToStage(exp: number): number {
  let stage = 0;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (exp >= STAGE_THRESHOLDS[i]) stage = i;
  }
  return stage;
}

/** 어떤 type 값이 와도(legacy DB값 포함) 단일 등대 이미지로 매핑합니다. */
export function characterImage(_type: CharacterType | string | null | undefined, exp: number): string {
  return CHARACTERS.lighthouse.stages[expToStage(exp)];
}

export function randomCharacterType(): CharacterType {
  return "lighthouse";
}

export function nextStageProgress(exp: number) {
  const stage = expToStage(exp);
  const current = STAGE_THRESHOLDS[stage];
  const next = STAGE_THRESHOLDS[stage + 1];
  if (next === undefined) return { stage, percent: 100, label: STAGE_LABEL[stage], remaining: 0 };
  const percent = Math.min(100, Math.round(((exp - current) / (next - current)) * 100));
  return { stage, percent, label: STAGE_LABEL[stage], remaining: next - exp };
}
