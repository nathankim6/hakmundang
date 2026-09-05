import raw from "@/data/achievement.json";
import type { SchoolAchievement } from "@/types/achievement";

/**
 * 저장소에 심어 둔 학업성취 자료.
 *
 * 브라우저에서 불러온 자료를 '파일로 내보내기'로 받아 이 파일에 넣으면
 * 모든 기기에서 같은 자료를 본다. 비어 있으면 브라우저 저장소만 쓴다.
 */
export const ACHIEVEMENT_SEED: Record<string, SchoolAchievement> = raw as unknown as Record<string, SchoolAchievement>;
