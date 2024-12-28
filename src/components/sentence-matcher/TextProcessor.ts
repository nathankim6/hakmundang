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
        } else {
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
  
  const englishRegex = /^[A-Za-z0-9\s.,!?'"()\-:;@#$%&*]+$/;
  const koreanRegex = /^[가-힣0-9\s.,!?'"()\-:;@#$%&*]+$/;
  
  return isEnglish ? englishRegex.test(text) : koreanRegex.test(text);
};

export const matchSentences = (engSentences: string[], korSentences: string[]) => {
  // Create arrays of valid sentences
  const validatedEng = engSentences.filter(eng => validateText(eng, true));
  const validatedKor = korSentences.filter(kor => validateText(kor, false));

  // Get the maximum length to ensure we match all sentences
  const maxLength = Math.max(validatedEng.length, validatedKor.length);
  
  // Create arrays padded to the same length
  const paddedEng = [...validatedEng];
  const paddedKor = [...validatedKor];
  
  // Pad the shorter array with empty strings if necessary
  while (paddedEng.length < maxLength) {
    paddedEng.push('');
  }
  while (paddedKor.length < maxLength) {
    paddedKor.push('');
  }

  // Create pairs of sentences
  return paddedEng.map((eng, index) => ({
    english: eng,
    korean: paddedKor[index] || ''
  })).filter(pair => pair.english && pair.korean); // Only return pairs where both sentences exist
};
