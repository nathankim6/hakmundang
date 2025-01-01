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

import { generateQuestion } from "@/lib/claude";

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

export const matchSentences = async (engSentences: string[], korSentences: string[]) => {
  try {
    // Create a prompt for Claude to match sentences
    const prompt = `
    Please match these English and Korean sentences exactly, maintaining their original meaning and ensuring no sentences are omitted.
    Keep the exact same sentences, just match them correctly.
    
    English sentences:
    ${engSentences.join('\n')}
    
    Korean sentences:
    ${korSentences.join('\n')}
    
    Format your response as a JSON array of objects with 'english' and 'korean' properties.
    Example format: [{"english": "Hello", "korean": "안녕하세요"}]
    `;

    // Use Claude to match sentences
    const result = await generateQuestion({ id: "sentenceSplitter", name: "한영문장분리" }, prompt);
    
    try {
      const matches = JSON.parse(result);
      if (Array.isArray(matches) && matches.length > 0) {
        return matches;
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    // Fallback to basic matching if Claude fails
    console.warn('Falling back to basic sentence matching');
    const validatedEng = engSentences.filter(eng => eng.trim() && validateText(eng, true));
    const validatedKor = korSentences.filter(kor => kor.trim() && validateText(kor, false));
    
    if (validatedEng.length !== validatedKor.length) {
      console.warn('Warning: Number of English and Korean sentences do not match', {
        english: validatedEng.length,
        korean: validatedKor.length
      });
    }
    
    const minLength = Math.min(validatedEng.length, validatedKor.length);
    return validatedEng.slice(0, minLength).map((eng, index) => ({
      english: eng,
      korean: validatedKor[index]
    }));
  } catch (error) {
    console.error('Error in sentence matching:', error);
    throw error;
  }
};
