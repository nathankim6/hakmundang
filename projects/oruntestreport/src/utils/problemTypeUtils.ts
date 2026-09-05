
// Helper functions for problem type charts and displays

// 6 main categories as specified
export const MAIN_CATEGORIES = ["어휘", "문법/어법", "대화문", "본문", "본문 외 지문", "서술형", "기타(직접입력)"];

// "기타(직접입력): XXX" 형태로 저장된 카테고리를 표시용 라벨로 정리.
// - "기타(직접입력): 듣기"  → "듣기"
// - "기타(직접입력)"        → "기타"
// - 그 외                  → 그대로
export const formatCategoryLabel = (category: string): string => {
  if (!category) return category;
  if (category.startsWith("기타(직접입력):")) {
    return category.replace("기타(직접입력):", "").trim() || "기타";
  }
  if (category === "기타(직접입력)") return "기타";
  return category;
};

// Helper function to get difficulty label in Korean
export const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '쉬움';
    case 'medium':
      return '보통';
    case 'hard':
      return '어려움';
    case 'very_hard':
      return '매우 어려움';
    default:
      return difficulty;
  }
};

// Helper to get difficulty badge style
export const getDifficultyBadgeStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'medium':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'hard':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'very_hard':
      return 'bg-rose-50 text-rose-600 border-rose-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

// Helper to get question type badge style
export const getQuestionTypeBadgeStyle = (type: string) => {
  return type === 'objective' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-violet-50 text-violet-600 border-violet-100';
};

// Helper to get question type label
export const getQuestionTypeLabel = (type: string) => {
  return type === 'objective' ? '객관식' : '서답형';
};

// Helper to get category color - expanded to handle more categories
export const getCategoryColor = (category: string, index: number) => {
  const colors = [
    'from-blue-500 to-indigo-600',     // 어휘
    'from-purple-500 to-fuchsia-600',  // 대화문  
    'from-teal-500 to-emerald-600',    // 본문
    'from-amber-500 to-orange-600',    // 문법/어법
    'from-rose-500 to-pink-600',       // 서술형
    'from-cyan-500 to-blue-600',       // 지칭추론
    'from-green-500 to-teal-600',      // 함의추론
    'from-yellow-500 to-amber-600',    // 심경/분위기
    'from-red-500 to-rose-600',        // 순서
    'from-violet-500 to-purple-600',   // 빈칸추론
    'from-indigo-500 to-blue-600',     // 문장삽입
    'from-pink-500 to-rose-600',       // 문장삭제
    'from-slate-500 to-gray-600',      // 내용일치
    'from-orange-500 to-red-600',      // 제목
    'from-lime-500 to-green-600',      // 대의파악
    'from-sky-500 to-cyan-600',        // 삽입
    'from-fuchsia-500 to-pink-600',    // 배열영작
    'from-emerald-500 to-teal-600',    // 요약문
    'from-stone-500 to-slate-600',     // 교과서
    'from-neutral-500 to-gray-600'     // 기타
  ];
  
  // Try to find the category in MAIN_CATEGORIES first
  const categoryIndex = MAIN_CATEGORIES.indexOf(category);
  if (categoryIndex >= 0) {
    return colors[categoryIndex];
  }
  
  // For other categories, use a consistent hash-based approach
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[5 + (hash % (colors.length - 5))];
};
