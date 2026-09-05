
import { isSubjectiveAnswerCorrect } from './answerValidation';

// List of questions worth 3 points (constants shared across the application)
export const THREE_POINT_QUESTIONS = [6, 13, 15, 21, 23, 29, 33, 34, 37, 39];

// Heuristic to detect 28-question format (1-17 auto-correct) from answers metadata
export const detect28FormatFromAnswers = (correctAnswers: Record<number, any>): boolean => {
  if (!correctAnswers) return false;
  const total = Object.keys(correctAnswers).length;
  if (total !== 45) return false;
  const first17 = Array.from({ length: 17 }, (_, i) => i + 1);
  const countWithPoints = first17.filter(n => typeof correctAnswers[n]?.points === 'number').length;
  // Consider it 28-format when most of 1~17 have explicit points set
  return countWithPoints >= 12;
};

export const calculateConsistentScore = (
  studentAnswers: Record<number, any>,
  correctAnswers: Record<number, any>,
  testFormat?: string
): number => {
  let totalScore = 0;
  const totalQuestionCount = Object.keys(correctAnswers).length;
  
  // Check if this is a 45-question test using custom points
  const is45QuestionTest = totalQuestionCount === 45;
  const hasCustomPoints = Object.values(correctAnswers).some((answer: any) => answer.points !== undefined);
  
  // If not a 45-question test, calculate points per question
  const pointsPerQuestion = (is45QuestionTest && !hasCustomPoints) ? 0 : 
                           (!is45QuestionTest && !hasCustomPoints) ? 100 / totalQuestionCount : 0;
  
  Object.entries(studentAnswers).forEach(([questionNumStr, answerData]) => {
    const questionNum = parseInt(questionNumStr);
    // Skip non-numeric metadata keys (e.g. __branch)
    if (Number.isNaN(questionNum)) return;
    // Skip questions that don't exist in correctAnswers
    if (!correctAnswers[questionNum]) return;
    // Partial credit overrides correctness — award exactly partialPoints
    if (typeof answerData?.partialPoints === 'number') {
      totalScore += answerData.partialPoints;
      return;
    }
    const studentAnswer = answerData?.answer;
    const correctAnswer = correctAnswers[questionNum]?.answer;
    const questionType = correctAnswers[questionNum]?.type;
    
    let isCorrect = false;
    
    if (answerData?.forcedIncorrect === true) {
      isCorrect = false;
    } else if (answerData?.forcedCorrect === true) {
      isCorrect = true;
    } else if (questionType === 'subjective') {
      isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
    } else {
      // For multiple choice, check if arrays are equal (all correct answers selected)
      const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
      
      // Sort both arrays for comparison
      const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
      const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
      
      // Check if arrays are equal (same length and same elements)
      isCorrect = sortedCorrect.length === sortedStudent.length &&
                  sortedCorrect.every((value, index) => value === sortedStudent[index]);
    }
    
    if (isCorrect) {
      if (hasCustomPoints) {
        // Use custom points if available
        const customPoints = correctAnswers[questionNum]?.points || 2;
        totalScore += customPoints;
      } else if (is45QuestionTest) {
        // For 45-question tests without custom points, use the special 2/3 point system
        totalScore += THREE_POINT_QUESTIONS.includes(questionNum) ? 3 : 2;
      } else {
        // For other tests, use the equal distribution method
        totalScore += pointsPerQuestion;
      }
    }
  });
  
  // Round to one decimal place for non-45-question tests
  return is45QuestionTest ? totalScore : Math.round(totalScore * 10) / 10;
};
