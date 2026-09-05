// ORUN VOCA 레벨 매핑 데이터 (2025년 최신 기준)

export const vocaLevelMapping = {
  // ===== 옳은보카 일반 시리즈 (보카3~Ultimate) =====
  // 누적단어 기준: 보카3(1,200) → 보카4(2,100) → 보카5(3,300) → 보카6(5,300) → 보카7(6,800) → 보카8(8,300) → Ultimate(9,800)
  V04: {
    level: "V04",
    cefr: "A1",
    vocabularyRange: "0-1,000",
    grades: "중1 FO(1학기)",
    description: "기초 문장 읽기 가능, 교과 중심 어휘 시작",
    orunVoca: "ORUN VOCA 3 / 보카3 표제어",
    expectedNextWords: 1200
  },
  V05: {
    level: "V05",
    cefr: "A1",
    vocabularyRange: "1,000-1,200",
    grades: "중1 FO(2학기)",
    description: "문장 속 어휘를 인식하며 어형 변화를 배웁니다",
    orunVoca: "보카3 표동반",
    expectedNextWords: 1800
  },
  V06: {
    level: "V06",
    cefr: "A2",
    vocabularyRange: "1,200-1,800",
    grades: "중1 INTER(1학기), 중2 FO(1학기)",
    description: "중등 필수어휘 완성기",
    orunVoca: "ORUN VOCA 4 / 보카4 표제어",
    expectedNextWords: 2100
  },
  V07: {
    level: "V07",
    cefr: "A2",
    vocabularyRange: "1,800-2,100",
    grades: "중1 INTER(2학기), 중2 FO(2학기), 중3 FO(1학기)",
    description: "중등 상위권, 문맥 어휘 시작",
    orunVoca: "보카4 표동반",
    expectedNextWords: 3000
  },
  V08: {
    level: "V08",
    cefr: "B1",
    vocabularyRange: "2,100-3,000",
    grades: "중1 AD(1학기), 중2 INTER(1학기), 중3 FO(2학기), 중3 INTER(1학기), IVY(1학기)",
    description: "고등 입문, 기출 기초 대응",
    orunVoca: "ORUN VOCA 5 / 보카5 표제어",
    expectedNextWords: 3300
  },
  V09: {
    level: "V09",
    cefr: "B1",
    vocabularyRange: "3,000-3,300",
    grades: "중1 AD(2학기), 중2 INTER(2학기), 중2 AD(1학기), 중3 INTER(2학기), 중3 AD(1학기), IVY(1학기)",
    description: "교과 독해 기반 강화, 문맥 추론 빈도 증가",
    orunVoca: "보카5 표동반",
    expectedNextWords: 5000
  },
  V10: {
    level: "V10",
    cefr: "B2",
    vocabularyRange: "3,300-5,000",
    grades: "중2 AD(2학기), 중3 AD(2학기), IVY(2학기)",
    description: "상위권 강문 독해 가능, 기출어휘 대부분 파악",
    orunVoca: "ORUN VOCA 6 / 보카6 표제어",
    expectedNextWords: 5300
  },
  V11: {
    level: "V11",
    cefr: "B2",
    vocabularyRange: "5,000-5,300",
    grades: "중3 AD(2학기), IVY(2학기)",
    description: "고2 진입 수준, 상위권 문제에서의 다의어/파생표현 강화",
    orunVoca: "보카6 표동반",
    expectedNextWords: 6500
  },
  V12: {
    level: "V12",
    cefr: "C1",
    vocabularyRange: "5,300-6,800",
    grades: "TOP(1학기)",
    description: "수능 상위권 빈출어 완성, 논리 연결어 완성 / 추론형/논증형 글에서 어휘 운용력 향상",
    orunVoca: "ORUN VOCA 7 / 보카7 표제어 / 보카7 표동반",
    expectedNextWords: 8000
  },
  V13: {
    level: "V13",
    cefr: "C1",
    vocabularyRange: "6,800-8,300",
    grades: "TOP(2학기)",
    description: "수능 완성 단계, 고난도 어휘 완성",
    orunVoca: "ORUN VOCA 8 / 보카8 표제어 / 보카8 표동반",
    expectedNextWords: 9500
  },
  V14: {
    level: "V14",
    cefr: "C2",
    vocabularyRange: "8,300-9,800",
    grades: "TOP(2학기) 이상",
    description: "만점권/대학 수준 텍스트도 소화 가능, 최상위권 완성",
    orunVoca: "ORUN VOCA Ultimate / 보카 Ultimate",
    expectedNextWords: 10000
  }
};

export const scoreRangeAnalysis = [
  {
    scoreRange: [95, 100],
    vLevel: ["V13", "V14"],
    cefr: "C1~C2",
    vocabularySize: "8,300+",
    report: "상위 1~5%권입니다. 수능·논술·원서 독해까지 자연스럽게 해낼 수 있는 수준이에요. 지금의 학습 루틴을 유지하면서, 관심 분야의 장문 자료를 주 1편 이상 정독해 보세요. TOP(2학기) 커리큘럼을 따라가면 실전 감각이 안정적으로 유지됩니다. 시험 전에는 관용구/숙어, 파생어 접사 정리를 가볍게 훑어주면 좋아요."
  },
  {
    scoreRange: [90, 94],
    vLevel: ["V12", "V13"],
    cefr: "C1",
    vocabularySize: "6,800-8,300",
    report: "고3 상위권입니다. 장문 독해와 논리 연결어 처리, 문맥 어휘가 안정적이에요. 보카7~보카8 범위를 자연스럽게 이어가며, 오답은 테마별(다의어, 유의어 미세 차이, 학술어)로 묶어 복습하면 효과가 큽니다. 매주 한 번은 스스로 근거 문장을 표시하는 연습을 해보세요."
  },
  {
    scoreRange: [85, 89],
    vLevel: ["V11", "V12"],
    cefr: "B2~C1",
    vocabularySize: "5,300-6,800",
    report: "고2~고3 진입 수준입니다. 수능 빈출 어휘 대부분을 알고 있으며, 고난도 문맥 추론만 조금 더 연습하면 좋아집니다. 보카6 표동반~보카7 범위를 병행하고, 추상명사·학술어 묶음 학습으로 표현 폭을 넓혀 보세요."
  },
  {
    scoreRange: [80, 84],
    vLevel: ["V10", "V11"],
    cefr: "B2",
    vocabularySize: "5,000-5,300",
    report: "고2 상 수준이에요. 장문 독해는 가능하지만 다의어와 관용표현에서 점수가 조금 빠질 수 있어요. 보카6 표제어→표동반을 완주해 보세요. 문제 풀이 후에는 정답을 결정한 단서를 직접 표시해 보는 습관이 큰 도움이 됩니다."
  },
  {
    scoreRange: [75, 79],
    vLevel: ["V09", "V10"],
    cefr: "B1~B2",
    vocabularySize: "3,300-5,000",
    report: "고1 상~중3 상위 수준입니다. 연결사·지시어 추적은 잘하지만 추상어·전문어에서는 고민이 생길 수 있어요. 보카5 표동반 이후 보카6 표제어로 이어가면 탄탄해집니다. 파생어(접두·접미) 및 품사 전환 연습을 꾸준히 해주세요."
  },
  {
    scoreRange: [70, 74],
    vLevel: ["V08", "V09"],
    cefr: "B1",
    vocabularySize: "3,000-3,300",
    report: "고1 중상입니다. 기본기는 잘 잡혀 있어요. 보카5 표제어~표동반 범위를 마무리해 주세요. 해설을 읽을 때는 정답 근거를 문장에 표시하고, 같은 유형의 어휘를 함께 묶어 복습하면 기억이 오래가요."
  },
  {
    scoreRange: [65, 69],
    vLevel: ["V07", "V08"],
    cefr: "B1",
    vocabularySize: "2,100-3,000",
    report: "고등 입문이 안정화되는 구간입니다. 보카4 표동반~보카5 표제어를 2회전 해보세요. 동의어 세트 구분 훈련을 통해 의미 차이를 명확히 잡으면 성과가 빨라집니다."
  },
  {
    scoreRange: [55, 64],
    vLevel: ["V06", "V07"],
    cefr: "A2~B1",
    vocabularySize: "1,800-2,100",
    report: "중3 진입~중3 중 수준입니다. 교과 독해는 가능하지만 정보 통합이 다소 느릴 수 있어요. 보카4 표제어~표동반을 완주해 주세요. 지문에서 주제·목적·태도를 밝히는 문장을 직접 표시하는 습관이 큰 도움이 됩니다."
  },
  {
    scoreRange: [45, 54],
    vLevel: ["V05", "V06"],
    cefr: "A2",
    vocabularySize: "1,200-1,800",
    report: "중2 중 단계입니다. 문장 구조와 기본 어휘를 차근차근 쌓을 때예요. 보카3 표동반~보카4 표제어를 반복하면서, 품사 태깅(명·형·부·동)과 기본 전치사 표현을 함께 익혀 주세요."
  },
  {
    scoreRange: [35, 44],
    vLevel: ["V04", "V05"],
    cefr: "A1~A2",
    vocabularySize: "1,000-1,200",
    report: "중1 후반 수준입니다. 단문에서는 강하지만 문맥 추론은 아직 어려울 수 있어요. 보카3 표제어~표동반을 1.5~2회전 하며, about, even, just 같은 초빈도 다의어를 상황별로 구분하는 연습을 해보세요."
  },
  {
    scoreRange: [25, 34],
    vLevel: ["V04"],
    cefr: "A1~A2",
    vocabularySize: "0-1,000",
    report: "중1 초중 구간입니다. 생활어를 중심으로 기반을 다질 때예요. 보카3 표제어부터 다시 시작해도 좋습니다. 그림·한영 짝매칭과 소리내어 읽기를 함께 하면 암기 유지력이 좋아집니다."
  },
  {
    scoreRange: [0, 24],
    vLevel: ["V04"],
    cefr: "Pre-A1~A1",
    vocabularySize: "<1,000",
    report: "기초부터 차근차근 시작하면 충분히 올라갈 수 있습니다. 알파벳·파닉스와 초빈도 표현을 먼저 다지고, 보카3 표제어를 소량씩 반복해 보세요. 하루 15~20분의 규칙적인 학습이 가장 큰 변화를 만듭니다. 응원합니다!"
  }
];

export function getAnalysisByScore(score: number) {
  const analysis = scoreRangeAnalysis.find(
    range => score >= range.scoreRange[0] && score <= range.scoreRange[1]
  );
  return analysis || scoreRangeAnalysis[scoreRangeAnalysis.length - 1];
}

export function getVLevelByScore(score: number): string {
  const analysis = getAnalysisByScore(score);
  return analysis.vLevel[0];
}

// 초등 필수 어휘 (800개) 대비 추정
export function getElementaryVocabPercentage(score: number): number {
  if (score >= 95) return 100;
  if (score >= 90) return 98;
  if (score >= 85) return 95;
  if (score >= 80) return 92;
  if (score >= 75) return 88;
  if (score >= 70) return 85;
  if (score >= 65) return 80;
  if (score >= 55) return 75;
  if (score >= 45) return 68;
  if (score >= 35) return 55;
  if (score >= 25) return 42;
  return 25;
}

// 최근 5개년 수능 기출 어휘 대비 추정
export function getSuneungVocabPercentage(score: number): number {
  if (score >= 95) return 95;
  if (score >= 90) return 85;
  if (score >= 85) return 75;
  if (score >= 80) return 65;
  if (score >= 75) return 55;
  if (score >= 70) return 45;
  if (score >= 65) return 35;
  if (score >= 55) return 28;
  if (score >= 45) return 20;
  if (score >= 35) return 12;
  if (score >= 25) return 8;
  return 3;
}

// 성취율 기반 V레벨 계산 (0~100%)
export function getVLevelByAchievement(achievementRate: number): string {
  if (achievementRate >= 97) return "V14";
  if (achievementRate >= 93) return "V13";
  if (achievementRate >= 88) return "V12";
  if (achievementRate >= 83) return "V11";
  if (achievementRate >= 78) return "V10";
  if (achievementRate >= 73) return "V09";
  if (achievementRate >= 68) return "V08";
  if (achievementRate >= 60) return "V07";
  if (achievementRate >= 50) return "V06";
  if (achievementRate >= 40) return "V05";
  if (achievementRate >= 30) return "V04";
  return "V04";
}

// V레벨의 누적 단어량 추출 (vocabularyRange의 최대값)
export function getCumulativeWordsByVLevel(vLevel: string): number {
  const levelInfo = vocaLevelMapping[vLevel as keyof typeof vocaLevelMapping];
  if (!levelInfo) return 0;
  
  const range = levelInfo.vocabularyRange;
  
  // "8,300+" 형태 처리
  if (range.includes('+')) {
    const numStr = range.replace(/[,+]/g, '');
    return parseInt(numStr);
  }
  
  // "6,800-7,000+" 형태 처리 (범위 끝에 +가 있는 경우)
  if (range.includes('-')) {
    const parts = range.split('-');
    const lastPart = parts[1].replace(/[,+]/g, '');
    return parseInt(lastPart);
  }
  
  // 단일 숫자인 경우
  return parseInt(range.replace(/,/g, ''));
}

// 다음 분기 예상 단어량 계산 (현재 점수 기반 성장률 적용)
export function getNextQuarterPrediction(currentScore: number, currentVLevel: string): number {
  const currentWords = getCumulativeWordsByVLevel(currentVLevel);
  
  // 점수별 분기당 평균 성장률 (%)
  let growthRate = 0;
  if (currentScore >= 90) growthRate = 3; // 상위권은 안정적 성장
  else if (currentScore >= 80) growthRate = 5;
  else if (currentScore >= 70) growthRate = 8;
  else if (currentScore >= 60) growthRate = 10;
  else if (currentScore >= 50) growthRate = 12;
  else growthRate = 15; // 하위권은 높은 성장 가능성
  
  const predictedWords = Math.round(currentWords * (1 + growthRate / 100));
  return predictedWords;
}

// 상위 10% 기준 단어량 (V11-V13 평균)
export function getTop10PercentBenchmark(): number {
  const v11 = getCumulativeWordsByVLevel("V11");
  const v12 = getCumulativeWordsByVLevel("V12");
  const v13 = getCumulativeWordsByVLevel("V13");
  return Math.round((v11 + v12 + v13) / 3);
}

// 다음 V레벨 정보 가져오기
export function getNextVLevel(currentVLevel: string): string {
  const allLevels = ["V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];
  const currentIndex = allLevels.indexOf(currentVLevel);
  
  if (currentIndex === -1 || currentIndex === allLevels.length - 1) {
    return currentVLevel; // 최고 레벨이거나 찾을 수 없는 경우
  }
  
  return allLevels[currentIndex + 1];
}

// V레벨 상승에 필요한 점수 계산
export function getScoreForNextVLevel(currentVLevel: string): number {
  const allLevels = ["V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14"];
  const currentIndex = allLevels.indexOf(currentVLevel);
  
  if (currentIndex === -1) return 0;
  
  // V레벨별 최소 점수 기준 (V04부터 시작)
  const scoreThresholds = [30, 40, 50, 60, 68, 73, 78, 83, 88, 93, 97];
  
  if (currentIndex >= scoreThresholds.length - 1) {
    return 100; // 최고 레벨
  }
  
  return scoreThresholds[currentIndex + 1];
}

// 시험 제목에서 V레벨 추출 (보카 단계 기반)
// ORUN VOCA 0~8 및 Ultimate에 해당
// Lite 시리즈(보카0~2)도 누적어휘량 기준으로 V레벨 산정
export function getVLevelByExamTitle(examTitle: string): string | null {
  const titleLower = examTitle.toLowerCase();
  
  // Ultimate (최상위)
  if (titleLower.includes('ultimate') || titleLower.includes('얼티밋') || titleLower.includes('얼티메이트')) return 'V14';
  
  // ORUN VOCA 형식 매칭
  // ORUN VOCA 8
  if (titleLower.includes('orun voca 8') || titleLower.includes('orun voca8') || titleLower.includes('옳은보카8')) return 'V13';
  // ORUN VOCA 7
  if (titleLower.includes('orun voca 7') || titleLower.includes('orun voca7') || titleLower.includes('옳은보카7')) return 'V12';
  // ORUN VOCA 6
  if (titleLower.includes('orun voca 6') || titleLower.includes('orun voca6') || titleLower.includes('옳은보카6')) return 'V10';
  // ORUN VOCA 5
  if (titleLower.includes('orun voca 5') || titleLower.includes('orun voca5') || titleLower.includes('옳은보카5')) return 'V08';
  // ORUN VOCA 4
  if (titleLower.includes('orun voca 4') || titleLower.includes('orun voca4') || titleLower.includes('옳은보카4')) return 'V06';
  // ORUN VOCA 3
  if (titleLower.includes('orun voca 3') || titleLower.includes('orun voca3') || titleLower.includes('옳은보카3')) return 'V04';
  // ORUN VOCA 2 (Growing) - 2,560단어 → V08 (B1)
  if (titleLower.includes('orun voca 2') || titleLower.includes('orun voca2') || titleLower.includes('옳은보카2') || titleLower.includes('growing')) return 'V08';
  // ORUN VOCA 1 (Watering) - 1,920단어 → V07 (B1)
  if (titleLower.includes('orun voca 1') || titleLower.includes('orun voca1') || titleLower.includes('옳은보카1') || titleLower.includes('watering')) return 'V07';
  // ORUN VOCA 0 (Planting) - 1,280단어 → V05 (A2)
  if (titleLower.includes('orun voca 0') || titleLower.includes('orun voca0') || titleLower.includes('옳은보카0') || titleLower.includes('planting')) return 'V05';
  
  // 보카3 표제어 = V04
  if (titleLower.includes('보카3') && titleLower.includes('표제어')) return 'V04';
  // 보카3 표동반 = V05
  if (titleLower.includes('보카3') && titleLower.includes('표동반')) return 'V05';
  
  // 보카4 표제어 = V06
  if (titleLower.includes('보카4') && titleLower.includes('표제어')) return 'V06';
  // 보카4 표동반 = V07
  if (titleLower.includes('보카4') && titleLower.includes('표동반')) return 'V07';
  
  // 보카5 표제어 = V08
  if (titleLower.includes('보카5') && titleLower.includes('표제어')) return 'V08';
  // 보카5 표동반 = V09
  if (titleLower.includes('보카5') && titleLower.includes('표동반')) return 'V09';
  
  // 보카6 표제어 = V10
  if (titleLower.includes('보카6') && titleLower.includes('표제어')) return 'V10';
  // 보카6 표동반 = V11
  if (titleLower.includes('보카6') && titleLower.includes('표동반')) return 'V11';
  
  // 보카7 표제어 = V12
  if (titleLower.includes('보카7') && titleLower.includes('표제어')) return 'V12';
  // 보카7 표동반 = V12
  if (titleLower.includes('보카7') && titleLower.includes('표동반')) return 'V12';
  
  // 보카8 표제어 = V13
  if (titleLower.includes('보카8') && titleLower.includes('표제어')) return 'V13';
  // 보카8 표동반 = V13
  if (titleLower.includes('보카8') && titleLower.includes('표동반')) return 'V13';
  
  return null; // 매칭되지 않으면 null 반환
}

// 시험 제목에서 정확한 누적 단어량 추출 (보카 단계 기반)
// ORUN VOCA 0~8 및 Ultimate에 해당
export function getCumulativeWordsByExamTitle(examTitle: string): number | null {
  const titleLower = examTitle.toLowerCase();
  
  // Ultimate (최상위) - 9,800
  if (titleLower.includes('ultimate') || titleLower.includes('얼티밋') || titleLower.includes('얼티메이트')) return 9800;
  
  // ORUN VOCA 형식 매칭 (기준표 기준)
  // ORUN VOCA 8 = 보카8 표제어 = 8,000
  if (titleLower.includes('orun voca 8') || titleLower.includes('orun voca8') || titleLower.includes('옳은보카8')) return 8000;
  // ORUN VOCA 7 = 보카7 표제어 = 6,500
  if (titleLower.includes('orun voca 7') || titleLower.includes('orun voca7') || titleLower.includes('옳은보카7')) return 6500;
  // ORUN VOCA 6 = 보카6 표제어 = 5,000
  if (titleLower.includes('orun voca 6') || titleLower.includes('orun voca6') || titleLower.includes('옳은보카6')) return 5000;
  // ORUN VOCA 5 = 보카5 표제어 = 3,000
  if (titleLower.includes('orun voca 5') || titleLower.includes('orun voca5') || titleLower.includes('옳은보카5')) return 3000;
  // ORUN VOCA 4 = 보카4 표제어 = 1,800
  if (titleLower.includes('orun voca 4') || titleLower.includes('orun voca4') || titleLower.includes('옳은보카4')) return 1800;
  // ORUN VOCA 3 = 보카3 표제어 = 1,000
  if (titleLower.includes('orun voca 3') || titleLower.includes('orun voca3') || titleLower.includes('옳은보카3')) return 1000;
  // ORUN VOCA 2 (Growing) = 2,560
  if (titleLower.includes('orun voca 2') || titleLower.includes('orun voca2') || titleLower.includes('옳은보카2') || titleLower.includes('growing')) return 2560;
  // ORUN VOCA 1 (Watering) = 1,920
  if (titleLower.includes('orun voca 1') || titleLower.includes('orun voca1') || titleLower.includes('옳은보카1') || titleLower.includes('watering')) return 1920;
  // ORUN VOCA 0 (Planting) = 1,280
  if (titleLower.includes('orun voca 0') || titleLower.includes('orun voca0') || titleLower.includes('옳은보카0') || titleLower.includes('planting')) return 1280;
  
  // 보카3 표제어 = 1,000
  if (titleLower.includes('보카3') && titleLower.includes('표제어')) return 1000;
  // 보카3 표동반 = 1,200
  if (titleLower.includes('보카3') && titleLower.includes('표동반')) return 1200;
  
  // 보카4 표제어 = 1,800
  if (titleLower.includes('보카4') && titleLower.includes('표제어')) return 1800;
  // 보카4 표동반 = 2,100
  if (titleLower.includes('보카4') && titleLower.includes('표동반')) return 2100;
  
  // 보카5 표제어 = 3,000
  if (titleLower.includes('보카5') && titleLower.includes('표제어')) return 3000;
  // 보카5 표동반 = 3,300
  if (titleLower.includes('보카5') && titleLower.includes('표동반')) return 3300;
  
  // 보카6 표제어 = 5,000
  if (titleLower.includes('보카6') && titleLower.includes('표제어')) return 5000;
  // 보카6 표동반 = 5,300
  if (titleLower.includes('보카6') && titleLower.includes('표동반')) return 5300;
  
  // 보카7 표제어 = 6,500
  if (titleLower.includes('보카7') && titleLower.includes('표제어')) return 6500;
  // 보카7 표동반 = 6,800
  if (titleLower.includes('보카7') && titleLower.includes('표동반')) return 6800;
  
  // 보카8 표제어 = 8,000
  if (titleLower.includes('보카8') && titleLower.includes('표제어')) return 8000;
  // 보카8 표동반 = 8,300
  if (titleLower.includes('보카8') && titleLower.includes('표동반')) return 8300;
  
  return null; // 매칭되지 않으면 null 반환
}

// 실제 단어량을 기반으로 V레벨 계산 (옳은보카 일반 시리즈 기준)
// 보카3(1,200) → 보카4(2,100) → 보카5(3,300) → 보카6(5,300) → 보카7(6,800) → 보카8(8,300) → Ultimate(9,800)
export function getVLevelByActualWords(actualWords: number): string {
  if (actualWords >= 9500) return "V14";  // Ultimate (9,500~9,800)
  if (actualWords >= 8000) return "V13";  // 보카8 표제어~표동반 (8,000~8,300)
  if (actualWords >= 6500) return "V12";  // 보카7 표제어~표동반 (6,500~6,800)
  if (actualWords >= 5000) return "V11";  // 보카6 표동반 (5,000~5,300)
  if (actualWords >= 3300) return "V10";  // 보카6 표제어 (3,300~5,000)
  if (actualWords >= 3000) return "V09";  // 보카5 표동반 (3,000~3,300)
  if (actualWords >= 2100) return "V08";  // 보카5 표제어 (2,100~3,000)
  if (actualWords >= 1800) return "V07";  // 보카4 표동반 (1,800~2,100)
  if (actualWords >= 1200) return "V06";  // 보카4 표제어 (1,200~1,800)
  if (actualWords >= 1000) return "V05";  // 보카3 표동반 (1,000~1,200)
  return "V04";  // 보카3 표제어 (0~1,000)
}

// ===== 옳은보카 시리즈 기준표 데이터 (2025년 최신 기준) =====
// Index.tsx, CumulativeStats.tsx, ExamResults.tsx에서 동기화되어 사용

export const vocaLiteSeriesTableData = [
  { level: "보카0 (Planting)", vocab: "1,280", cefr: "A1", vlevel: "V05", grade: "Planting (Reading 집중코스)", summary: "파닉스 완성 및 기초 단어 인식" },
  { level: "보카1 (Watering)", vocab: "1,920", cefr: "A2", vlevel: "V07", grade: "Watering (Speaking 집중코스)", summary: "기초 생활어 및 회화 시작" },
  { level: "보카2 (Growing)", vocab: "2,560", cefr: "B1", vlevel: "V08", grade: "Growing (Grammar 집중코스)", summary: "문법 기초와 함께 어휘 확장" },
];

export const vocaMainSeriesTableData = [
  { level: "보카3 표제어", vocab: "1,000", cefr: "A1", vlevel: "V04", grade: "중1 FO(1학기)", summary: "기초 문장 읽기 가능" },
  { level: "보카3 표동반", vocab: "1,200", cefr: "A1", vlevel: "V05", grade: "중1 FO(2학기)", summary: "기본 문장 교과 중심 어휘" },
  { level: "보카4 표제어", vocab: "1,800", cefr: "A2", vlevel: "V06", grade: "중1 INTER(1학기), 중2 FO(1학기)", summary: "중등 필수어휘 완성기" },
  { level: "보카4 표동반", vocab: "2,100", cefr: "A2", vlevel: "V07", grade: "중1 INTER(2학기), 중2 FO(2학기), 중3 FO(1학기)", summary: "중등 상위권, 문맥 어휘 시작" },
  { level: "보카5 표제어", vocab: "3,000", cefr: "B1", vlevel: "V08", grade: "중1 AD(1학기), 중2 INTER(1학기), 중3 FO(2학기), 중3 INTER(1학기), IVY(1학기)", summary: "고등 입문, 기출 기초 대응" },
  { level: "보카5 표동반", vocab: "3,300", cefr: "B1", vlevel: "V09", grade: "중1 AD(2학기), 중2 INTER(2학기), 중2 AD(1학기), 중3 INTER(2학기), 중3 AD(1학기), IVY(1학기)", summary: "고등 교과 독해 기반 강화" },
  { level: "보카6 표제어", vocab: "5,000", cefr: "B2", vlevel: "V10", grade: "중2 AD(2학기), 중3 AD(2학기), IVY(2학기)", summary: "상위권 강문 독해 가능" },
  { level: "보카6 표동반", vocab: "5,300", cefr: "B2", vlevel: "V11", grade: "중3 AD(2학기), IVY(2학기)", summary: "고2 진입 수준, 다의어/파생표현 강화" },
  { level: "보카7 표제어", vocab: "6,500", cefr: "C1", vlevel: "V12", grade: "TOP(1학기)", summary: "수능 상위권 빈출어 완성" },
  { level: "보카7 표동반", vocab: "6,800", cefr: "C1", vlevel: "V12", grade: "TOP(1학기)", summary: "수능 상위권 빈출어 완성" },
  { level: "보카8 표제어", vocab: "8,000", cefr: "C1", vlevel: "V13", grade: "TOP(2학기)", summary: "수능 완성 단계, 고난도 어휘 정착" },
  { level: "보카8 표동반", vocab: "8,300", cefr: "C1", vlevel: "V13", grade: "TOP(2학기)", summary: "수능 완성 단계, 고난도 어휘 정착" },
  { level: "보카 Ultimate", vocab: "9,500~9,800", cefr: "C2", vlevel: "V14", grade: "TOP(2학기) 이상", summary: "만점권/대학 텍스트도 소화 가능한 상위권" },
];
