
export type ThemeType = 'blue' | 'emerald' | 'purple' | 'yellow';

export const themeColorMap = {
  blue: {
    primary: "#6B1D3A",
    secondary: "#9B2C5A",
    tertiary: "#8B2252",
    accent: "#C45A7B",
    light: "#F3D5E0",
    vibrant: "#A8325C",
    pastel: "#FDE8EF",
    accent2: "#7B2D4E",
    highlight: "#D4698B"
  },
  emerald: {
    primary: "#059669",
    secondary: "#10b981",
    tertiary: "#34d399",
    accent: "#6ee7b7",
    light: "#a7f3d0",
    vibrant: "#0D9488",
    pastel: "#F2FCE2",
    accent2: "#10B981", 
    highlight: "#00D09F"
  },
  purple: {
    primary: "#7e22ce",
    secondary: "#9333ea",
    tertiary: "#a855f7",
    accent: "#c084fc",
    light: "#d8b4fe",
    vibrant: "#9B87F5",
    pastel: "#E5DEFF",
    accent2: "#D946EF", 
    highlight: "#A78BFA"
  },
  yellow: {
    primary: "#ca8a04",
    secondary: "#eab308",
    tertiary: "#facc15",
    accent: "#fde047",
    light: "#fef7cd",
    vibrant: "#F97316",
    pastel: "#FEF7CD",
    accent2: "#FB923C", 
    highlight: "#FBBF24"
  }
};

// Theme descriptions for the legend - updated for clarity
export const themeDescriptions = {
  blue: "고2",
  emerald: "고1",
  purple: "중3",
  yellow: "중2"
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
