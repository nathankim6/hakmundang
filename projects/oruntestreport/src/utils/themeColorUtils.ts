
export type ThemeType = 'blue' | 'emerald' | 'purple' | 'yellow';

export const themeColorMap = {
  // 고등부 — 딥 네이비 + 골드 (Editorial Premium)
  blue: {
    primary: "#1f2a44",
    secondary: "#2d3a5f",
    tertiary: "#c9a961",
    accent: "#d4b87a",
    light: "#e8d9b0",
    vibrant: "#1f2a44",
    pastel: "#f4ecd8",
    accent2: "#a8853f",
    highlight: "#c9a961"
  },
  // 중3 — 딥 포레스트 + 세이지 (차분한 학구적 톤)
  emerald: {
    primary: "#2c4a3e",
    secondary: "#3d6353",
    tertiary: "#7a9b85",
    accent: "#a8c0ae",
    light: "#d4e0d6",
    vibrant: "#2c4a3e",
    pastel: "#eef2ec",
    accent2: "#5a7a64",
    highlight: "#7a9b85"
  },
  // 중2 — 버건디 + 더스티 로즈 (편집 매거진 톤)
  purple: {
    primary: "#6b2737",
    secondary: "#8b3a4e",
    tertiary: "#b07a85",
    accent: "#c89ba3",
    light: "#e6cfd3",
    vibrant: "#6b2737",
    pastel: "#f5e9eb",
    accent2: "#8b3a4e",
    highlight: "#b07a85"
  },
  // 중1 — 럭스 사프란 (고급스러운 골드 옐로우 + 차콜 잉크)
  yellow: {
    primary: "#2d2418",
    secondary: "#4a3c26",
    tertiary: "#f0c419",
    accent: "#f5d04a",
    light: "#fbe7a1",
    vibrant: "#f0c419",
    pastel: "#fdf8e3",
    accent2: "#b8860b",
    highlight: "#f0c419"
  }
};

// Theme descriptions for the legend - updated for clarity
export const themeDescriptions = {
  blue: "고등부",
  emerald: "중3",
  purple: "중2",
  yellow: "중1"
};

// Helper function to get theme color based on school and grade
export const getSchoolThemeColor = (school: string, grade: string) => {
  // Default to blue theme (고등부)
  let color = 'blue';
  let borderColor = 'border-blue-100';
  
  // Normalize inputs
  const normalizedSchool = school.trim().toLowerCase();
  const normalizedGrade = grade.trim();
  
  // Check if high school (고등학교) - check this first
  // Patterns: 고등학교, 고등, 고교, ends with "고" (e.g., 영등포고, 당곡고)
  const isHighSchool = normalizedSchool.includes('고등') || 
                       normalizedSchool.includes('고교') ||
                       /고$/.test(normalizedSchool);
  
  // Check if middle school (중학교)
  // Patterns: 중학교, 중학, 중교, ends with "중" (e.g., 숭의여중, 장승중)
  const isMiddleSchool = normalizedSchool.includes('중학') || 
                         normalizedSchool.includes('중교') ||
                         /중$/.test(normalizedSchool);
  
  if (isHighSchool && !isMiddleSchool) {
    // High school = blue theme
    color = 'blue';
    borderColor = 'border-blue-100';
  } else if (isMiddleSchool) {
    // Middle school - determine grade from grade field
    // Extract grade number from various formats: "1학년", "2학년", "3학년", "1", "2", "3"
    const gradeMatch = normalizedGrade.match(/([1-3])/);
    
    if (gradeMatch) {
      const gradeNumber = gradeMatch[1];
      
      if (gradeNumber === '1') {
        // 중1 = yellow
        color = 'yellow';
        borderColor = 'border-yellow-100';
      } else if (gradeNumber === '2') {
        // 중2 = purple
        color = 'purple';
        borderColor = 'border-purple-100';
      } else if (gradeNumber === '3') {
        // 중3 = emerald
        color = 'emerald';
        borderColor = 'border-emerald-100';
      }
    } else {
      // Default for middle school with unclear grade = purple (중2)
      color = 'purple';
      borderColor = 'border-purple-100';
    }
  }
  
  console.log(`School: "${school}", Grade: "${grade}" => Theme color: ${color}`);
  
  return { color, borderColor };
};

// Helper function to get theme classes based on school and grade
export const getThemeClasses = (school: string, grade: string) => {
  const { color } = getSchoolThemeColor(school, grade);
  
  // Default classes (blue theme)
  let classes = {
    headerBackground: 'bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-violet-50/50',
    buttonGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    cardBorder: 'border-blue-200',
    accentBackground: 'bg-blue-50',
    lightBackground: 'bg-blue-50/80',
  };
  
  // Update classes based on color theme
  if (color === 'emerald') {
    classes = {
      headerBackground: 'bg-gradient-to-r from-emerald-50/50 via-green-50/50 to-teal-50/50',
      buttonGradient: 'bg-gradient-to-r from-emerald-600 to-green-600',
      cardBorder: 'border-emerald-200',
      accentBackground: 'bg-emerald-50',
      lightBackground: 'bg-emerald-50/80',
    };
  } else if (color === 'purple') {
    classes = {
      headerBackground: 'bg-gradient-to-r from-purple-50/50 via-fuchsia-50/50 to-pink-50/50',
      buttonGradient: 'bg-gradient-to-r from-purple-600 to-fuchsia-600',
      cardBorder: 'border-purple-200',
      accentBackground: 'bg-purple-50',
      lightBackground: 'bg-purple-50/80',
    };
  } else if (color === 'yellow') {
    classes = {
      headerBackground: 'bg-gradient-to-r from-yellow-50/50 via-amber-50/50 to-orange-50/50',
      buttonGradient: 'bg-gradient-to-r from-amber-600 to-yellow-600',
      cardBorder: 'border-yellow-200',
      accentBackground: 'bg-yellow-50',
      lightBackground: 'bg-yellow-50/80',
    };
  }
  
  return classes;
};
