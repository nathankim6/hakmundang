// 자동 배점 계산: 총점이 100점이 되도록 문항별 배점을 균등 분배 (소수점 첫째 자리까지)
export const FIXED_THREE_POINT_QUESTIONS_45 = [34, 37, 39];

export const calculateAutoPoints = (questionCount: number): Record<number, number> => {
  const result: Record<number, number> = {};
  if (questionCount <= 0) return result;

  // 45문항: 기본 2점, 34/37/39번만 3점 고정
  if (questionCount === 45) {
    for (let i = 1; i <= 45; i++) {
      result[i] = FIXED_THREE_POINT_QUESTIONS_45.includes(i) ? 3 : 2;
    }
    return result;
  }

  const fixed: Record<number, number> = {};
  let fixedTotal = 0;

  const remainingNumbers = Array.from({ length: questionCount }, (_, i) => i + 1).filter(
    (n) => fixed[n] === undefined
  );
  const remainingTotal = 100 - fixedTotal;

  if (remainingNumbers.length === 0) return { ...fixed };

  // 0.1 단위로 내림한 기본 배점
  const base = Math.floor((remainingTotal / remainingNumbers.length) * 10) / 10;
  // 남은 점수를 0.1씩 앞 문항부터 배분
  let leftover = Math.round((remainingTotal - base * remainingNumbers.length) * 10);

  remainingNumbers.forEach((n) => {
    let p = base;
    if (leftover > 0) {
      p = Math.round((p + 0.1) * 10) / 10;
      leftover -= 1;
    }
    result[n] = p;
  });

  return { ...result, ...fixed };
};

export const sumPoints = (
  answers: Record<number, { points?: number }>,
  questionCount: number
): number => {
  let total = 0;
  for (let i = 1; i <= questionCount; i++) total += answers[i]?.points ?? 0;
  return Math.round(total * 10) / 10;
};
