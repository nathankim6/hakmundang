
// Helper functions for problem type charts and displays

// 5 main categories as specified
export const MAIN_CATEGORIES = ["어휘", "대화문", "본문", "문법/어법", "서술형"];

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

// Helper to get category color
export const getCategoryColor = (category: string, index: number) => {
  const colors = [
    'from-blue-500 to-indigo-600',     // First category
    'from-purple-500 to-fuchsia-600',  // Second category
    'from-teal-500 to-emerald-600',    // Third category
    'from-amber-500 to-orange-600',    // Fourth category
    'from-rose-500 to-pink-600'        // Fifth category
  ];
  
  const categoryIndex = MAIN_CATEGORIES.indexOf(category);
  return categoryIndex >= 0 ? colors[categoryIndex % colors.length] : colors[index % colors.length];
};
