import { MAIN_CATEGORIES } from "./problemTypeUtils";

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

// 고등학교 대분류 카테고리 정의 - 실제 데이터에 맞게 수정
const HIGH_SCHOOL_CATEGORIES = ["부교재(모의고사)", "교과서", "핸드아웃", "부교재", "모의고사", "워크북", "단어장"];

export const calculateChartData = (problemTypes: ProblemType[], isHighSchool: boolean = false) => {
  // Group problem types by their categories
  const categoryCount: Record<string, number> = {};

  console.log('calculateChartData - isHighSchool:', isHighSchool);
  console.log('calculateChartData - problemTypes:', problemTypes);

  if (isHighSchool) {
    // For high school: group by actual category names and filter to only show high school categories
    problemTypes.forEach(type => {
      const category = type.category;
      console.log('Processing high school category:', category);
      // 고등학교 카테고리에 해당하는 것만 카운트
      if (HIGH_SCHOOL_CATEGORIES.includes(category)) {
        if (!categoryCount[category]) {
          categoryCount[category] = 0;
        }
        categoryCount[category] += 1;
      }
    });
  } else {
    // For middle school: use predefined main categories (어휘, 대화문, 본문, 문법/어법, 서술형)
    problemTypes.forEach(type => {
      const category = type.category;
      console.log('Processing middle school category:', category);
      // 중등학교 카테고리에 해당하는 것만 카운트
      if (MAIN_CATEGORIES.includes(category)) {
        if (!categoryCount[category]) {
          categoryCount[category] = 0;
        }
        categoryCount[category] += 1;
      }
    });
  }

  console.log('Final categoryCount:', categoryCount);

  // Get raw counts for all categories that have problems
  const rawData = Object.entries(categoryCount)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => {
      return {
        name,
        value: count
      };
    });

  console.log('Raw data:', rawData);

  // Calculate percentages
  const totalCount = problemTypes.length;

  // First pass: calculate initial percentages and sort by count
  const initialData = rawData.map(item => {
    const exactPercentage = item.value / totalCount * 100;
    const flooredPercentage = Math.floor(exactPercentage);
    return {
      name: item.name,
      value: item.value,
      exactPercentage,
      percentage: flooredPercentage
    };
  }).sort((a, b) => b.value - a.value);

  // Calculate how many percentage points we need to distribute
  const initialTotal = initialData.reduce((sum, item) => sum + item.percentage, 0);
  const pointsToDistribute = 100 - initialTotal;

  // Distribute remaining points based on decimal parts
  if (pointsToDistribute > 0) {
    // Sort by fractional part descending to distribute points fairly
    const sortedByFraction = [...initialData].sort((a, b) => {
      return (b.exactPercentage - b.percentage) - (a.exactPercentage - a.percentage);
    });

    // Distribute the points
    for (let i = 0; i < pointsToDistribute; i++) {
      if (sortedByFraction[i % sortedByFraction.length]) {
        sortedByFraction[i % sortedByFraction.length].percentage += 1;
      }
    }
  }

  // Final data with integer percentages, sorted by value
  const finalData = initialData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage.toString()
  })).sort((a, b) => b.value - a.value);

  console.log('Final chart data:', finalData);
  
  return finalData;
};

export const calculateSubcategoryData = (problemTypes: ProblemType[]) => {
  // Group problem types by their specific names (subcategories)
  const subcategoryCount: Record<string, number> = {};

  // Count occurrences of each unique problem type name
  problemTypes.forEach(type => {
    const subcategory = type.name;
    if (!subcategoryCount[subcategory]) {
      subcategoryCount[subcategory] = 0;
    }
    subcategoryCount[subcategory] += 1;
  });

  // Get raw counts for all subcategories that have problems
  const rawData = Object.entries(subcategoryCount)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => {
      return {
        name,
        value: count
      };
    });

  // Calculate percentages
  const totalCount = problemTypes.length;

  // First pass: calculate initial percentages and sort by count
  const initialData = rawData.map(item => {
    const exactPercentage = item.value / totalCount * 100;
    const flooredPercentage = Math.floor(exactPercentage);
    return {
      name: item.name,
      value: item.value,
      exactPercentage,
      percentage: flooredPercentage
    };
  }).sort((a, b) => b.value - a.value);

  // Calculate how many percentage points we need to distribute
  const initialTotal = initialData.reduce((sum, item) => sum + item.percentage, 0);
  const pointsToDistribute = 100 - initialTotal;

  // Distribute remaining points based on decimal parts
  if (pointsToDistribute > 0) {
    // Sort by fractional part descending to distribute points fairly
    const sortedByFraction = [...initialData].sort((a, b) => {
      return (b.exactPercentage - b.percentage) - (a.exactPercentage - a.percentage);
    });

    // Distribute the points
    for (let i = 0; i < pointsToDistribute; i++) {
      if (sortedByFraction[i % sortedByFraction.length]) {
        sortedByFraction[i % sortedByFraction.length].percentage += 1;
      }
    }
  }

  // Final data with integer percentages, sorted by value
  return initialData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage.toString()
  })).sort((a, b) => b.value - a.value);
};
