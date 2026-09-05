import {
  allPrepQuestions,
  prepAnalysisCategories,
  prepSectionNames,
  getPrepQuestionPoints,
  calculatePrepTotalMaxScore,
  type PrepLevelTestQuestion,
} from './prepLevelTestQuestions';
import {
  allPrepQuestionsV1,
  prepAnalysisCategoriesV1,
  prepSectionNamesV1,
  getPrepQuestionPointsV1,
  calculatePrepTotalMaxScoreV1,
} from './prepLevelTestQuestionsV1';

export type PrepVersion = 'v2' | 'v1';

export const PREP_VERSION_META: Record<PrepVersion, { label: string; subtitle: string; questionCount: number }> = {
  v2: { label: '뉴베리타스', subtitle: '186문항', questionCount: allPrepQuestions.length },
  v1: { label: '흑석관', subtitle: '145문항', questionCount: allPrepQuestionsV1.length },
};

export interface PrepQuestionSet {
  version: PrepVersion;
  questions: PrepLevelTestQuestion[];
  analysisCategories: Record<string, { name: string; subCategories: { name: string; questions: number[] }[] }>;
  sectionNames: Record<string, string>;
  getPoints: (q: PrepLevelTestQuestion) => number;
  totalMaxScore: number;
}

export const getPrepSet = (version: PrepVersion): PrepQuestionSet =>
  version === 'v1'
    ? {
        version: 'v1',
        questions: allPrepQuestionsV1,
        analysisCategories: prepAnalysisCategoriesV1 as any,
        sectionNames: prepSectionNamesV1,
        getPoints: getPrepQuestionPointsV1,
        totalMaxScore: calculatePrepTotalMaxScoreV1(),
      }
    : {
        version: 'v2',
        questions: allPrepQuestions,
        analysisCategories: prepAnalysisCategories as any,
        sectionNames: prepSectionNames,
        getPoints: getPrepQuestionPoints,
        totalMaxScore: calculatePrepTotalMaxScore(),
      };

export const normalizePrepVersion = (raw?: string | null): PrepVersion =>
  raw === 'v1' || raw === 'heukseok' || raw === '흑석관' ? 'v1' : 'v2';

/** 저장된 결과에서 사용된 문제 버전을 판별 */
export const detectPrepVersion = (answers: any): PrepVersion => {
  if (!answers || typeof answers !== 'object') return 'v2';
  if (typeof answers.__prepVersion === 'string') return normalizePrepVersion(answers.__prepVersion);
  const ids = Object.keys(answers)
    .map(Number)
    .filter(n => Number.isFinite(n));
  if (ids.length === 0) return 'v2';
  return Math.max(...ids) > allPrepQuestionsV1.length ? 'v2' : 'v1';
};
