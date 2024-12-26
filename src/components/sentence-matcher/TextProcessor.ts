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
  const englishRegex = /^[A-Za-z0-9\s.,!?'"()\-:;@#$%&*]+$/;
  const koreanRegex = /^[가-힣0-9\s.,!?'"()\-:;@#$%&*]+$/;
  return isEnglish ? englishRegex.test(text) : koreanRegex.test(text);
};

export const matchSentences = (engSentences: string[], korSentences: string[]) => {
  const minLength = Math.min(engSentences.length, korSentences.length);
  const normalizedEng = [...engSentences];
  const normalizedKor = [...korSentences];

  if (engSentences.length > korSentences.length) {
    const remainingEng = normalizedEng.splice(minLength).join(' ');
    if (normalizedKor[minLength - 1]) {
      normalizedKor[minLength - 1] += ' ' + remainingEng;
    }
  } else if (korSentences.length > engSentences.length) {
    const remainingKor = normalizedKor.splice(minLength).join(' ');
    if (normalizedEng[minLength - 1]) {
      normalizedEng[minLength - 1] += ' ' + remainingKor;
    }
  }

  const validatedPairs = normalizedEng.map((eng, index) => {
    const kor = normalizedKor[index] || '';
    const isValidEng = validateText(eng, true);
    const isValidKor = validateText(kor, false);

    return {
      english: isValidEng ? eng : '',
      korean: isValidKor ? kor : ''
    };
  });

  return validatedPairs.filter(pair => pair.english && pair.korean);
};