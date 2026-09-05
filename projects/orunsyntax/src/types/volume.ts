export interface VolumeInfo {
  id: number;
  name: string;
  startQuestion: number;
  endQuestion: number;
}

export const VOLUMES: VolumeInfo[] = [
  { id: 1, name: 'Vol. 1', startQuestion: 1, endQuestion: 3000 },
  { id: 2, name: 'Vol. 2', startQuestion: 3001, endQuestion: 6000 },
  { id: 3, name: 'Vol. 3', startQuestion: 6001, endQuestion: 10000 },
];

export function getVolumeForQuestion(questionId: number): VolumeInfo {
  return VOLUMES.find(v => questionId >= v.startQuestion && questionId <= v.endQuestion) || VOLUMES[0];
}
