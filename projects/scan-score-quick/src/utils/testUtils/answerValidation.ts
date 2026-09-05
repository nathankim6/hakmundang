
/**
 * Checks if a subjective answer is correct by comparing against multiple possible correct answers
 * @param studentAnswer The student's answer
 * @param correctAnswer The correct answer(s). Multiple answers should be separated by newlines.
 *                     For backward compatibility, commas are still treated as separators ONLY if
 *                     the string contains no sentence-ending punctuation (., !, ?).
 * @returns True if the student's answer matches any of the correct options
 */
export const isSubjectiveAnswerCorrect = (studentAnswer: string, correctAnswer: string): boolean => {
  if (!studentAnswer || !correctAnswer) return false;

  // Primary separator: newline. Fallback: comma (only when answer looks like short tokens, not sentences).
  let rawOptions: string[];
  if (/[\r\n]/.test(correctAnswer)) {
    rawOptions = correctAnswer.split(/\r?\n/);
  } else if (/[.!?]/.test(correctAnswer)) {
    // Looks like a sentence (or sentences) — treat as a single answer to avoid splitting on inner commas.
    rawOptions = [correctAnswer];
  } else {
    rawOptions = correctAnswer.split(',');
  }

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/g, '');

  const correctOptions = rawOptions.map(normalize).filter(Boolean);
  const normalizedStudentAnswer = normalize(studentAnswer);

  return correctOptions.some(option => option === normalizedStudentAnswer);
};
