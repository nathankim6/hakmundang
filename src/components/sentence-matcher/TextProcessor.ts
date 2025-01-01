// 예외 단어 목록과 텍스트 처리 로직을 분리
export const exceptions = [
  'St.', 'Dr.', 'Mr.', 'Mrs.', 'Ms.',
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'Aug.', 'Sep.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
  'Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Thur.', 'Fri.', 'Sat.',
  'cf.', 'ref.', 'prof.', 'etc.', 'e.g.', 'i.e.',
  'A.M.', 'P.M.', 'a.m.', 'p.m.',
  'U.S.', 'U.K.', 'U.N.'
];

export const specialMarkers = [
  '①', '②', '③', '④', '⑤',
  '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽',
  '(A)', '(B)', '(C)',
  '(①)', '(②)', '(③)', '(④)', '(⑤)',
  '[3점]'
];

export const preprocessText = (text: string) => {
  let processed = text;

  exceptions.forEach(exception => {
    const regex = new RegExp(`\\b${exception.replace('.', '\\.')}\\b`, 'g');
    processed = processed.replace(regex, exception.replace('.', '@POINT@'));
  });

  specialMarkers.forEach(marker => {
    processed = processed.replace(marker, '');
  });

  return processed;
};

export const splitIntoSentences = (text: string) => {
  let processed = preprocessText(text);

  const sentences = processed
    .split(/([.!?]+["']?\s*)/)
    .filter(Boolean)
    .map(part => part.trim())
    .reduce((acc: string[], part, i, arr) => {
      if (i % 2 === 0) {
        const nextPart = arr[i + 1];
        if (nextPart) {
          acc.push(part + nextPart);
        } else if (part) {
          acc.push(part);
        }
      }
      return acc;
    }, [])
    .map(sentence => sentence.replace(/@POINT@/g, '.').trim())
    .filter(sentence => sentence.length > 0);

  return sentences;
};

export const validateText = (text: string, isEnglish: boolean) => {
  if (!text.trim()) return false;
  
  // Updated regex patterns to be more precise
  const englishRegex = /^[A-Za-z0-9\s.,!?'"()\-:;@#$%&*]+$/;
  const koreanRegex = /^[가-힣0-9\s.,!?'"()\-:;@#$%&*]+$/;
  
  const textToValidate = text.trim();
  return isEnglish ? englishRegex.test(textToValidate) : koreanRegex.test(textToValidate);
};

export const matchSentences = (engSentences: string[], korSentences: string[]) => {
  // Filter out empty sentences and validate
  const validatedEng = engSentences.filter(eng => eng.trim() && validateText(eng, true));
  const validatedKor = korSentences.filter(kor => kor.trim() && validateText(kor, false));

  // Check if the number of sentences match
  if (validatedEng.length !== validatedKor.length) {
    console.warn('Warning: Number of English and Korean sentences do not match', {
      english: validatedEng.length,
      korean: validatedKor.length
    });
    // Return only pairs up to the shorter array's length
    const minLength = Math.min(validatedEng.length, validatedKor.length);
    return validatedEng.slice(0, minLength).map((eng, index) => ({
      english: eng,
      korean: validatedKor[index]
    }));
  }

  // Create pairs of sentences with exact matching
  return validatedEng.map((eng, index) => ({
    english: eng,
    korean: validatedKor[index]
  }));
};