
export type ThemeType = 'blue' | 'emerald' | 'purple' | 'yellow';

export const themeColorMap = {
  blue: {
    primary: "#2563eb",
    secondary: "#0ea5e9",
    tertiary: "#3b82f6",
    accent: "#60a5fa",
    light: "#93c5fd",
    vibrant: "#0EA5E9",
    pastel: "#D3E4FD",
    accent2: "#4F46E5",
    highlight: "#38BDF8"
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
  blue: "고등부",
  emerald: "중3",
  purple: "중2",
  yellow: "중1"
};

// Helper function to get theme color based on school and grade
export const getSchoolThemeColor = (school: string, grade: string) => {
  // Default to blue theme
  let color = 'blue';
  let borderColor = 'border-blue-100';
  
  // Check if school name contains middle school info
  const isMiddleSchool = school.includes('중학') || grade.includes('중') || 
                         school.includes('중등') || grade.includes('중등');
  
  // Check if grade contains "고등" (high school) or school contains high school info
  if (grade.includes('고등') || school.includes('고등')) {
    color = 'blue';
    borderColor = 'border-blue-100';
  }
  // Check middle school grades (중1, 중2, 중3)
  else if (isMiddleSchool) {
    // Check if explicitly grade 1
    if (grade.includes('중1') || grade.includes('중 1') || grade === '1' || 
        grade.includes('1학년') || grade.includes('일학년')) {
      color = 'yellow';
      borderColor = 'border-yellow-100';
    } 
    // Check if explicitly grade 2
    else if (grade.includes('중2') || grade.includes('중 2') || grade === '2' || 
             grade.includes('2학년') || grade.includes('이학년')) {
      color = 'purple';
      borderColor = 'border-purple-100';
    } 
    // Check if explicitly grade 3
    else if (grade.includes('중3') || grade.includes('중 3') || grade === '3' || 
             grade.includes('3학년') || grade.includes('삼학년')) {
      color = 'emerald';
      borderColor = 'border-emerald-100';
    } 
    // Default for middle school with unclear grade - try to detect grade from school name
    else {
      if (school.includes('1') || school.includes('일') || school.includes('1학년')) {
        color = 'yellow';
        borderColor = 'border-yellow-100';
      } else if (school.includes('2') || school.includes('이') || school.includes('2학년')) {
        color = 'purple';
        borderColor = 'border-purple-100';
      } else if (school.includes('3') || school.includes('삼') || school.includes('3학년')) {
        color = 'emerald';
        borderColor = 'border-emerald-100';
      } else {
        // If we can't determine the exact grade, default to purple for middle school
        color = 'purple';
        borderColor = 'border-purple-100';
      }
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
