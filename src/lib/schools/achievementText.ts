import { ACHIEVE_MID, ACHIEVE_PROFILE, SECTION } from "@/lib/schools/copy";
import { fix, type AchievementProfile, type SubjectPoint } from "@/lib/schools/achievement";

/** 성취도 프로필을 문장으로. 웹(Achievement.tsx)과 PPT(deck.ts)가 같이 쓴다. */

/** 대표 과목: 영어가 있으면 영어, 없으면 있는 것 */
export function repPoint(p: AchievementProfile): SubjectPoint | undefined {
  return p.latest.영어 ?? p.latest.국어 ?? p.latest.수학;
}

export function profileText(p: AchievementProfile, isHigh: boolean) {
  const C = SECTION.achieve;
  const rep = repPoint(p);
  const aMean = p.aMean ?? 0;
  let name: string;
  let en: string | undefined;
  let summary: string;
  let fit: string[];
  let caution: string[];
  if (isHigh) {
    const P = ACHIEVE_PROFILE[p.type];
    name = P.name;
    en = P.en;
    summary = P.summary({ seats: rep?.seats ?? 0, aCount: rep?.aCount ?? 0, avg: fix(p.avgMean, 0), sd: fix(p.sdMean, 0), aMean: fix(p.aMean, 1) });
    fit = P.fit;
    caution = P.caution;
  } else {
    const P = aMean >= 35 ? ACHIEVE_MID.high : aMean <= 20 ? ACHIEVE_MID.low : ACHIEVE_MID.mid;
    name = P.name;
    summary = P.summary(fix(p.aMean, 1));
    fit = P.fit;
    caution = P.caution;
  }
  const extra: string[] = [];
  if (p.keySubject && p.latest[p.keySubject]) extra.push(C.keySubject(p.keySubject, p.latest[p.keySubject]!.dist.A));
  if (p.trend) extra.push(p.trend.dir === "up" ? C.trendUp(p.trend.from, p.trend.to) : p.trend.dir === "down" ? C.trendDown(p.trend.from, p.trend.to) : C.trendFlat(p.trend.to));
  return { name, en, summary, fit, caution, extra };
}

