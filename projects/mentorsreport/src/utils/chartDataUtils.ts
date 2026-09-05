
import { MAIN_CATEGORIES } from "./problemTypeUtils";

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

export const calculateChartData = (problemTypes: ProblemType[]) => {
  // Group problem types by category only, using only the main categories
  const categoryCount: Record<string, number> = {};

  // Initialize with main categories
  MAIN_CATEGORIES.forEach(category => {
    categoryCount[category] = 0;
  });

  // Count occurrences
  problemTypes.forEach(type => {
    const category = MAIN_CATEGORIES.includes(type.category) ? type.category : "기타";
    if (!categoryCount[category]) {
      categoryCount[category] = 0;
    }
    categoryCount[category] += 1;
  });

  // Get raw counts
  const rawData = Object.entries(categoryCount)
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
