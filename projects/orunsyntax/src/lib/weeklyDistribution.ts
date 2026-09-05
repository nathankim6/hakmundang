import type { Question } from '@/lib/parseQuestions';

const TOTAL_WEEKS = 20;
const SENTENCES_PER_WEEK = 90;

export interface WeekData {
  weekNumber: number;
  questions: Question[]; // renumbered 1-90 within week
  originalIds: number[]; // original question IDs for DB lookups
  grammarLabels: Record<number, string>; // weekQuestionId -> grammar category
}

/**
 * Distribute sentences across 20 weeks with balanced grammar categories.
 * Selects 1800 sentences from the pool, prioritizing categorized ones.
 * Each week gets a mix of all grammar categories via round-robin distribution.
 */
export function distributeWeekly(
  allQuestions: Question[],
  grammarCategories: Record<number, string>,
  sentencesPerWeek: number = SENTENCES_PER_WEEK
): WeekData[] {
  // Group questions by category (exclude 기타)
  const catQuestions: Record<string, Question[]> = {};
  const uncategorized: Question[] = [];

  for (const q of allQuestions) {
    const cat = grammarCategories[q.id];
    if (!cat || cat === '기타') {
      uncategorized.push(q);
    } else {
      if (!catQuestions[cat]) catQuestions[cat] = [];
      catQuestions[cat].push(q);
    }
  }

  // Sort categories by count descending for consistent ordering
  const sortedCats = Object.entries(catQuestions)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([cat]) => cat);

  const totalNeeded = TOTAL_WEEKS * sentencesPerWeek;

  // Calculate how many from each category proportionally
  const totalCategorized = sortedCats.reduce((sum, cat) => sum + catQuestions[cat].length, 0);
  
  // If we have enough categorized sentences, use only those
  // Otherwise supplement with uncategorized
  let selectedPerCat: Record<string, Question[]> = {};
  let remaining = totalNeeded;

  if (totalCategorized >= totalNeeded) {
    // Proportionally select from each category
    for (const cat of sortedCats) {
      const proportion = catQuestions[cat].length / totalCategorized;
      const count = Math.floor(proportion * totalNeeded);
      selectedPerCat[cat] = catQuestions[cat].slice(0, count);
      remaining -= count;
    }
    // Distribute remaining slots round-robin
    let catIdx = 0;
    while (remaining > 0) {
      const cat = sortedCats[catIdx % sortedCats.length];
      const currentCount = selectedPerCat[cat].length;
      if (currentCount < catQuestions[cat].length) {
        selectedPerCat[cat].push(catQuestions[cat][currentCount]);
        remaining--;
      }
      catIdx++;
      if (catIdx > sortedCats.length * 100) break; // safety
    }
  } else {
    // Use all categorized + fill with uncategorized
    for (const cat of sortedCats) {
      selectedPerCat[cat] = [...catQuestions[cat]];
      remaining -= catQuestions[cat].length;
    }
    // Add uncategorized to fill
    const uncatNeeded = Math.min(remaining, uncategorized.length);
    if (uncatNeeded > 0) {
      selectedPerCat['기타'] = uncategorized.slice(0, uncatNeeded);
      if (!sortedCats.includes('기타')) sortedCats.push('기타');
    }
  }

  // Now distribute across weeks using round-robin by category
  // Create a queue for each category
  const queues: Record<string, Question[]> = {};
  for (const cat of sortedCats) {
    queues[cat] = [...(selectedPerCat[cat] || [])];
  }

  const weeks: WeekData[] = [];
  
  for (let w = 0; w < TOTAL_WEEKS; w++) {
    const weekQuestions: { question: Question; originalId: number; category: string }[] = [];
    
    // Round-robin: cycle through categories, taking one at a time
    let filled = 0;
    let passes = 0;
    while (filled < sentencesPerWeek && passes < 100) {
      for (const cat of sortedCats) {
        if (filled >= sentencesPerWeek) break;
        if (queues[cat].length > 0) {
          const q = queues[cat].shift()!;
          weekQuestions.push({ question: q, originalId: q.id, category: cat });
          filled++;
        }
      }
      passes++;
    }

    // Renumber 1-90 within week
    const questions: Question[] = weekQuestions.map((item, idx) => ({
      id: idx + 1,
      sentence: item.question.sentence,
      translation: item.question.translation,
    }));

    const originalIds = weekQuestions.map(item => item.originalId);
    const grammarLabels: Record<number, string> = {};
    weekQuestions.forEach((item, idx) => {
      grammarLabels[idx + 1] = item.category;
    });

    weeks.push({
      weekNumber: w + 1,
      questions,
      originalIds,
      grammarLabels,
    });
  }

  return weeks;
}

/**
 * Get global question number (across all weeks)
 */
export function getGlobalQuestionNumber(weekNumber: number, localId: number): number {
  return (weekNumber - 1) * SENTENCES_PER_WEEK + localId;
}
