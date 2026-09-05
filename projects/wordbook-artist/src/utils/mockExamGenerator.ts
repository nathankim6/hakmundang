import { VocabularyWord, DayGroup } from '@/types/vocabulary';

// ========== Types ==========

export interface ExamQuestion {
  number: number;
  type: string;
  instruction: string;
  choices?: ExamChoice[];
  sentences?: ExamSentence[];
  sentencePairs?: ExamSentencePair[];
  answer: number; // 1-based index of correct answer
  points: number;
  explanation?: string; // 해설 텍스트
}

export interface ExamChoice {
  label: string;
  text: string;
}

export interface ExamSentence {
  label: string;
  text: string; // may contain HTML bold/underline
}

export interface ExamSentencePair {
  sentence1: string;
  sentence2: string;
}

export interface MockExam {
  questions: ExamQuestion[];
  dayRange: string;
  version: number;
}

// ========== Helpers ==========

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Get headwords only (표제어) with examples */
function getHeadwords(words: VocabularyWord[]): VocabularyWord[] {
  return words.filter(w => (!w.wordType || w.wordType === '표제어') && w.examples && w.examples.length > 0);
}

/** Get words with synonyms */
function getWordsWithSynonyms(words: VocabularyWord[]): VocabularyWord[] {
  return words.filter(w => w.synonyms && w.synonyms.length > 0);
}

/** Get words with antonyms */
function getWordsWithAntonyms(words: VocabularyWord[]): VocabularyWord[] {
  return words.filter(w => w.antonyms && w.antonyms.length > 0);
}

/** Get 핵심표현 or multi-word expressions */
function getExpressions(words: VocabularyWord[]): VocabularyWord[] {
  return words.filter(w => 
    w.wordType === '핵심표현' || 
    w.word.includes(' ') || 
    w.word.includes('-')
  );
}

/** Extract first meaning in Korean */
function getKoreanMeaning(word: VocabularyWord): string {
  const m = word.meaning;
  // Remove part of speech markers like (v.), (n.), etc.
  return m.replace(/^\([a-z.]+\)\s*/, '').split(',')[0].trim();
}

/** Create a wrong meaning by picking another word's meaning */
function getWrongMeaning(word: VocabularyWord, allWords: VocabularyWord[]): string {
  const others = allWords.filter(w => w.id !== word.id);
  if (others.length === 0) return '알 수 없는';
  const picked = others[randInt(0, others.length - 1)];
  return getKoreanMeaning(picked);
}

/** Find a matching word form in a sentence (returns the matched substring or null) */
function findWordInSentence(sentence: string, word: string): string | null {
  const exact = new RegExp(`\\b(${escapeRegex(word)}(?:s|es|ed|ing|d|er|est|ly|tion|ment|ness|ful|less|ous|ive|al|able|ible|ity|ize|ise)?)\\b`, 'i');
  const m1 = sentence.match(exact);
  if (m1) return m1[1];
  if (word.length >= 4) {
    const stem = word.slice(0, Math.max(4, Math.floor(word.length * 0.7)));
    const m2 = sentence.match(new RegExp(`\\b(${escapeRegex(stem)}\\w*)\\b`, 'i'));
    if (m2) return m2[1];
  }
  return null;
}

/** Make a sentence with the target word bolded and underlined */
function formatSentenceWithWord(example: { english: string }, word: string): string {
  const matched = findWordInSentence(example.english, word);
  if (matched) {
    return example.english.replace(
      new RegExp(`\\b${escapeRegex(matched)}\\b`, 'i'),
      `<b><u>${matched}</u></b>`
    );
  }
  // Fallback: 단어를 못 찾으면 첫 번째 4글자 이상 단어에 밑줄
  const fallback = example.english.match(/\b(\w{4,})\b/);
  if (fallback) {
    return example.english.replace(
      new RegExp(`\\b${escapeRegex(fallback[1])}\\b`),
      `<b><u>${fallback[1]}</u></b>`
    );
  }
  return example.english;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Create blank in sentence for fill-in */
function createBlank(sentence: string, word: string): string {
  const matched = findWordInSentence(sentence, word);
  if (!matched) return sentence;
  return sentence.replace(new RegExp(`\\b${escapeRegex(matched)}\\b`, 'i'), '____________');
}

// ========== Question Generators ==========

const LABELS = ['①', '②', '③', '④', '⑤'];

/**
 * Q1: 의미 연결이 옳지 않은 것 (4지선다)
 */
function generateQ1(allWords: VocabularyWord[]): ExamQuestion {
  const headwords = allWords.filter(w => !w.wordType || w.wordType === '표제어');
  const selected = pick(headwords, 5);
  const wrongIdx = randInt(0, 4);

  const wrongWord = selected[wrongIdx];
  const wrongMeaning = getWrongMeaning(wrongWord, allWords);
  const correctMeaning = getKoreanMeaning(wrongWord);

  const choices: ExamChoice[] = selected.map((w, i) => ({
    label: LABELS[i],
    text: i === wrongIdx 
      ? `${w.word} – ${wrongMeaning}`
      : `${w.word} – ${getKoreanMeaning(w)}`
  }));

  return {
    number: 1,
    type: 'meaning-match',
    instruction: '다음 단어의 의미 연결이 옳지 <b>않은</b> 것은?',
    choices,
    answer: wrongIdx + 1,
    points: 1.5,
    explanation: `${wrongWord.word}의 뜻은 "${correctMeaning}"이다. (오답 선지: "${wrongMeaning}")`,
  };
}

/**
 * Q2-4: 문맥상 밑줄 친 단어의 쓰임이 가장 어색한 것
 * 오답은 정답 단어를 그 단어의 "반의어"로 치환하여 문맥상 어색하게 만든다.
 */
function generateContextAwkward(allWords: VocabularyWord[], questionNum: number): ExamQuestion {
  const withExamples = getHeadwords(allWords);
  const firstToken = (s: string) => s.split(/[,;/]|\s-\s/)[0].trim();

  // 반의어가 있고 예문에 단어가 실제로 등장하는 단어들 우선
  const candidatesWithAnt = withExamples.filter(w => {
    if (!w.antonyms || w.antonyms.length === 0) return false;
    const ex = w.examples?.[0]?.english || '';
    return new RegExp(`\\b${escapeRegex(w.word)}\\b`, 'i').test(ex);
  });

  if (candidatesWithAnt.length === 0) {
    // 폴백: 반의어 없으면 기존 swap 방식
    const selected = pick(withExamples, 5);
    const wrongIdx = randInt(0, 4);
    const sentences: ExamSentence[] = selected.map((w, i) => ({
      label: LABELS[i],
      text: formatSentenceWithWord(w.examples![0], w.word),
    }));
    const wrongWord = selected[wrongIdx];
    const others = withExamples.filter(o => o.id !== wrongWord.id);
    const otherWord = others[randInt(0, others.length - 1)];
    if (otherWord?.examples?.length) {
      sentences[wrongIdx] = {
        label: LABELS[wrongIdx],
        text: otherWord.examples[0].english.replace(
          new RegExp(`\\b${escapeRegex(otherWord.word)}\\b`, 'gi'),
          `<b><u>${wrongWord.word}</u></b>`
        ),
      };
    }
    return {
      number: questionNum,
      type: 'context-awkward',
      instruction: '문맥상 밑줄 친 단어의 쓰임이 가장 <b>어색한</b> 것을 고르시오.',
      sentences,
      answer: wrongIdx + 1,
      points: 1.5,
    };
  }

  // 오답으로 사용할 단어 선택 (반의어 보유)
  const wrongSourceWord = candidatesWithAnt[randInt(0, candidatesWithAnt.length - 1)];
  const antonym = firstToken(wrongSourceWord.antonyms![0]);

  // 정답(자연스러운) 문장 4개
  const remaining = withExamples.filter(w => w.id !== wrongSourceWord.id);
  const correctSelections = pick(remaining, 4);

  const wrongIdx = randInt(0, 4);
  const sentences: ExamSentence[] = [];
  let cI = 0;
  for (let i = 0; i < 5; i++) {
    if (i === wrongIdx) {
      // 원래 단어를 반의어로 치환 → 문맥 어색
      const originalSentence = wrongSourceWord.examples![0].english;
      const swapped = originalSentence.replace(
        new RegExp(`\\b${escapeRegex(wrongSourceWord.word)}\\b`, 'gi'),
        `<b><u>${antonym}</u></b>`
      );
      sentences.push({ label: LABELS[i], text: swapped });
    } else {
      const w = correctSelections[cI++];
      sentences.push({
        label: LABELS[i],
        text: formatSentenceWithWord(w.examples![0], w.word),
      });
    }
  }

  return {
    number: questionNum,
    type: 'context-awkward',
    instruction: '문맥상 밑줄 친 단어의 쓰임이 가장 <b>어색한</b> 것을 고르시오.',
    sentences,
    answer: wrongIdx + 1,
    points: 1.5,
    explanation: `정답 ${LABELS[wrongIdx]}: 원문의 "${wrongSourceWord.word}"를 반의어 "${antonym}"으로 치환하여 문맥상 어색해졌다.`,
  };
}

/**
 * Q5: 유의어 관계가 아닌 것 (= 동의어가 아닌 것)
 * SynonymAntonymList와 동일한 로직 사용:
 * - 표제어 바로 다음에 오는 파생어/관련어를 쌍으로 봄
 * - AI가 라벨링한 derivative-relations(localStorage)에서 '동의'/'반의'를 활용
 * - '어원으로 줄줄이' wordType은 동의어 관계로 간주
 * → 동의어 4쌍 + 반의어 1쌍 (오답)으로 5지선다 구성
 */
interface SynAntPair {
  headword: string;
  paired: string;
  relation: '동의어' | '반의어';
}

function getDerivativeRelationsFromStorage(workbookId?: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    // workbookId 모르는 경우 모든 키를 합쳐서 사용
    const merged: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('derivative-relations-v2:')) {
        if (workbookId && !key.endsWith(workbookId)) continue;
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          Object.assign(merged, data);
        } catch {}
      }
    }
    return merged;
  } catch {
    return {};
  }
}

function extractSynAntPairs(dayGroups: DayGroup[], startDay: number, endDay: number): SynAntPair[] {
  const relations = getDerivativeRelationsFromStorage();
  const result: SynAntPair[] = [];
  const filtered = dayGroups.filter((_, i) => i + 1 >= startDay && i + 1 <= endDay);

  for (const dg of filtered) {
    let currentHeadword: VocabularyWord | null = null;
    for (const w of dg.words) {
      if (w.wordType === '표제어') {
        currentHeadword = w;
      } else if (currentHeadword) {
        const relationKey = `${currentHeadword.word}::${w.word}`;
        const analyzedRelation = relations[relationKey];
        const isEtymology = w.wordType === '어원으로 줄줄이';
        const isSynLabel = analyzedRelation === '동의';
        const isAntLabel = analyzedRelation === '반의';

        if (isSynLabel || isAntLabel || isEtymology) {
          result.push({
            headword: currentHeadword.word,
            paired: w.word,
            relation: isAntLabel ? '반의어' : '동의어',
          });
        }
      }
    }
  }
  return result;
}

function generateQ5FromExtracted(pairs: SynAntPair[]): ExamQuestion | null {
  const synPairs = shuffle(pairs.filter(p => p.relation === '동의어'));
  const antPairs = shuffle(pairs.filter(p => p.relation === '반의어'));

  if (synPairs.length < 4 || antPairs.length < 1) return null;

  const selectedSyn = synPairs.slice(0, 4);
  const selectedAnt = antPairs.slice(0, 1);
  const wrongIdx = randInt(0, 4);
  const items: ExamChoice[] = [];

  // 콤마/세미콜론으로 여러 단어가 묶인 경우 첫 번째 단어만 표시
  const firstWord = (s: string) => s.split(/[,;/]|\s-\s/)[0].trim();

  let sI = 0, aI = 0;
  for (let i = 0; i < 5; i++) {
    if (i === wrongIdx) {
      const p = selectedAnt[aI++];
      items.push({ label: LABELS[i], text: `${firstWord(p.headword)} - ${firstWord(p.paired)}` });
    } else {
      const p = selectedSyn[sI++];
      items.push({ label: LABELS[i], text: `${firstWord(p.headword)} - ${firstWord(p.paired)}` });
    }
  }

  return {
    number: 5,
    type: 'synonym-false',
    instruction: '다음 짝지어진 단어 중 유의어 관계가 <b>아닌</b> 것은?',
    choices: items,
    answer: wrongIdx + 1,
    points: 1.5,
  };
}

function generateQ5(allWords: VocabularyWord[]): ExamQuestion {
  // 폴백: 추출 데이터 없을 때만 사용
  return generateQ5Fallback(allWords);
}

/** Fallback Q5 using standard synonyms/antonyms when not enough derivative pairs */
function generateQ5Fallback(allWords: VocabularyWord[]): ExamQuestion {
  const withSyn = getWordsWithSynonyms(allWords);
  const withAnt = getWordsWithAntonyms(allWords);

  const synPairs = pick(withSyn, 4);
  const antPair = pick(withAnt.filter(w => !synPairs.find(s => s.id === w.id)), 1);
  
  const wrongIdx = randInt(0, 4);
  const items: ExamChoice[] = [];
  let synIdx = 0, antIdx = 0;

  for (let i = 0; i < 5; i++) {
    if (i === wrongIdx && antPair.length > 0) {
      const w = antPair[antIdx++];
      items.push({ label: LABELS[i], text: `${w.word} - ${w.antonyms![0]}` });
    } else if (synIdx < synPairs.length) {
      const w = synPairs[synIdx++];
      items.push({ label: LABELS[i], text: `${w.word} - ${w.synonyms![0]}` });
    } else {
      items.push({ label: LABELS[i], text: 'N/A' });
    }
  }

  return {
    number: 5,
    type: 'synonym-false',
    instruction: '다음 짝지어진 단어 중 유의어 관계가 <b>아닌</b> 것은?',
    choices: items,
    answer: wrongIdx + 1,
    points: 1.5,
  };
}

/**
 * Q6: 빈칸에 들어갈 가장 적절한 단어 (단어장 예문 사용)
 * 정답 단어가 실제 예문에 포함되어 blank가 생성되는 것만 사용
 */
function generateQ6(allWords: VocabularyWord[]): ExamQuestion {
  const headwords = getHeadwords(allWords);
  // 예문이 있고, 예문에 단어가 실제 포함된 것만 필터
  const wordsWithValidExamples = (headwords.length >= 5 ? headwords : allWords).filter(w => {
    if (!w.examples?.length) return false;
    const blanked = createBlank(w.examples[0].english, w.word);
    return blanked !== w.examples[0].english; // blank가 실제로 생성되었는지 확인
  });

  if (wordsWithValidExamples.length < 5) {
    // fallback: 예문이 있는 모든 단어
    const fallback = allWords.filter(w => {
      if (!w.examples?.length) return false;
      const blanked = createBlank(w.examples[0].english, w.word);
      return blanked !== w.examples[0].english;
    });
    if (fallback.length < 5) throw new Error('빈칸 문제에 사용할 수 있는 예문이 부족합니다.');
    wordsWithValidExamples.length = 0;
    wordsWithValidExamples.push(...fallback);
  }

  const selected = pick(wordsWithValidExamples, 5);
  const correctIdx = randInt(0, 4);
  const correctWord = selected[correctIdx];

  const ex = correctWord.examples![0];
  const blankedSentence = createBlank(ex.english, correctWord.word);

  const choices: ExamChoice[] = selected.map((w, i) => ({
    label: LABELS[i],
    text: w.word,
  }));

  const sentences: ExamSentence[] = [{ label: '', text: blankedSentence }];

  return {
    number: 6,
    type: 'fill-blank',
    instruction: '다음 빈칸에 들어갈 가장 적절한 단어는?',
    sentences,
    choices,
    answer: correctIdx + 1,
    points: 1.5,
  };
}

/**
 * Q7: 밑줄 친 구동사/표현의 쓰임이 가장 어색한 것
 */
function generateQ7(allWords: VocabularyWord[]): ExamQuestion {
  // Use expressions or multi-word entries
  let expressions = getExpressions(allWords).filter(w => w.examples && w.examples.length > 0);
  
  // Fallback: if not enough expressions, use regular headwords
  if (expressions.length < 5) {
    expressions = getHeadwords(allWords);
  }
  
  const selected = pick(expressions, 5);
  const wrongIdx = randInt(0, 4);

  const sentences: ExamSentence[] = selected.map((w, i) => {
    const ex = w.examples![0];
    return {
      label: LABELS[i],
      text: formatSentenceWithWord(ex, w.word),
    };
  });

  // Create wrong answer by swapping
  const wrongWord = selected[wrongIdx];
  const otherWord = expressions.filter(o => o.id !== wrongWord.id && o.examples && o.examples.length > 0);
  if (otherWord.length > 0) {
    const other = otherWord[randInt(0, otherWord.length - 1)];
    sentences[wrongIdx] = {
      label: LABELS[wrongIdx],
      text: other.examples![0].english.replace(
        new RegExp(`\\b${escapeRegex(other.word)}\\b`, 'gi'),
        `<b><u>${wrongWord.word}</u></b>`
      ),
    };
  }

  return {
    number: 7,
    type: 'expression-awkward',
    instruction: '밑줄 친 동사의 쓰임이 가장 <b>어색한</b> 것은?',
    sentences,
    answer: wrongIdx + 1,
    points: 1.5,
  };
}

/**
 * Q8-9: 공통으로 들어갈 단어 (단어장 예문 사용)
 */
function generateCommonBlank(allWords: VocabularyWord[], questionNum: number): ExamQuestion {
  // 예문이 2개 이상인 표제어 우선, 없으면 1개라도 있는 것 사용
  const headwords = getHeadwords(allWords);
  const withTwoExamples = headwords.filter(w => w.examples && w.examples.length >= 2);
  const pool = withTwoExamples.length >= 5 ? withTwoExamples : headwords;
  
  const selected = pick(pool, 5);
  const correctIdx = randInt(0, 4);
  const correctWord = selected[correctIdx];

  let sentencePairs: ExamSentencePair[] | undefined;

  if (correctWord.examples && correctWord.examples.length >= 2) {
    const ex1 = correctWord.examples[0];
    const ex2 = correctWord.examples[1];
    let s1 = '· ' + createBlank(ex1.english, correctWord.word);
    let s2 = '· ' + createBlank(ex2.english, correctWord.word);
    sentencePairs = [{ sentence1: s1, sentence2: s2 }];
  } else if (correctWord.examples && correctWord.examples.length >= 1) {
    const ex1 = correctWord.examples[0];
    let s1 = '· ' + createBlank(ex1.english, correctWord.word);
    sentencePairs = [{ sentence1: s1, sentence2: '· The ____________ is important in this context.' }];
  }

  const choices: ExamChoice[] = selected.map((w, i) => ({
    label: LABELS[i],
    text: w.word,
  }));

  return {
    number: questionNum,
    type: 'common-blank',
    instruction: '다음 빈칸에 공통으로 들어갈 단어로 가장 적절한 것을 고르시오.',
    sentencePairs,
    choices,
    answer: correctIdx + 1,
    points: 1.5,
  };
}

/**
 * Q10: 밑줄 친 단어를 괄호 안의 단어와 바꾸어 쓸 수 없는 것
 */
function generateQ10(allWords: VocabularyWord[]): ExamQuestion {
  const withSyn = getWordsWithSynonyms(allWords).filter(w => w.examples && w.examples.length > 0);
  const withAnt = getWordsWithAntonyms(allWords).filter(w => w.examples && w.examples.length > 0);

  // 4 correct replacements (synonym) + 1 wrong (antonym)
  const synWords = pick(withSyn, 4);
  const antWords = pick(withAnt.filter(w => !synWords.find(s => s.id === w.id)), 1);
  
  const wrongIdx = randInt(0, 4);
  const sentences: ExamSentence[] = [];

  // Q10 문장이 너무 길면 잘라서 표시 (지면 절약)
  const trimSentence = (s: string, maxLen = 110): string => {
    if (s.length <= maxLen) return s;
    // HTML 태그를 보존하며 자연스러운 끝 위치 찾기
    const cut = s.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + '...';
  };

  let synI = 0, antI = 0;
  for (let i = 0; i < 5; i++) {
    if (i === wrongIdx && antWords.length > 0) {
      const w = antWords[antI++];
      const ex = w.examples![0];
      const formatted = formatSentenceWithWord(ex, w.word);
      sentences.push({
        label: LABELS[i],
        text: `${trimSentence(formatted)} (${w.antonyms![0]})`,
      });
    } else if (synI < synWords.length) {
      const w = synWords[synI++];
      const ex = w.examples![0];
      const formatted = formatSentenceWithWord(ex, w.word);
      sentences.push({
        label: LABELS[i],
        text: `${trimSentence(formatted)} (${w.synonyms![0]})`,
      });
    }
  }

  return {
    number: 10,
    type: 'synonym-replace',
    instruction: '다음 밑줄 친 단어를 괄호 안의 단어와 바꾸어 쓸 수 <b>없는</b> 것은?',
    sentences,
    answer: wrongIdx + 1,
    points: 1.5,
  };
}

// ========== Type-Based Generator ==========

export interface SungnamQuestionType {
  id: string;
  label: string;
  generator: (allWords: VocabularyWord[], questionNum: number) => ExamQuestion;
}

export const SUNGNAM_QUESTION_TYPES: SungnamQuestionType[] = [
  { id: 'meaning-match', label: '의미 연결 부적절 (Q1)', generator: (w) => generateQ1(w) },
  { id: 'context-awkward', label: '문맥상 어색한 것 (Q2-4)', generator: (w, n) => generateContextAwkward(w, n) },
  { id: 'synonym-false', label: '유의어 관계 아닌 것 (Q5)', generator: (w) => generateQ5(w) },
  { id: 'fill-blank', label: '빈칸 채우기 (Q6)', generator: (w) => generateQ6(w) },
  { id: 'expression-awkward', label: '동사 쓰임 어색 (Q7)', generator: (w) => generateQ7(w) },
  { id: 'common-blank', label: '공통 빈칸 (Q8-9)', generator: (w, n) => generateCommonBlank(w, n) },
  { id: 'synonym-replace', label: '대체 불가 동의어 (Q10)', generator: (w) => generateQ10(w) },
];

export function generateSungnamTypeExam(
  dayGroups: DayGroup[],
  startDay: number,
  endDay: number,
  typeId: string,
  questionCount: number,
  version: number = 1
): MockExam {
  const allWords: VocabularyWord[] = [];
  for (const dg of dayGroups) {
    const dayNum = parseInt(dg.day.replace(/\D/g, ''));
    if (dayNum >= startDay && dayNum <= endDay) {
      allWords.push(...dg.words);
    }
  }

  if (allWords.length < 10) {
    throw new Error('선택한 범위에 단어가 충분하지 않습니다. (최소 10개 필요)');
  }

  const qType = SUNGNAM_QUESTION_TYPES.find(t => t.id === typeId);
  if (!qType) throw new Error('알 수 없는 문제 유형입니다.');

  const questions: ExamQuestion[] = [];

  for (let i = 0; i < questionCount; i++) {
    try {
      const q = qType.generator(allWords, i + 1);
      questions.push({ ...q, number: i + 1 });
    } catch {
      // Skip if not enough data
    }
  }

  if (questions.length === 0) {
    throw new Error('해당 유형의 문제를 생성할 수 없습니다. 데이터가 부족합니다.');
  }

  return {
    questions,
    dayRange: `DAY ${String(startDay).padStart(2, '0')} ~ DAY ${String(endDay).padStart(2, '0')}`,
    version,
  };
}

// ========== Main Generator ==========

export function generateMockExam(dayGroups: DayGroup[], startDay: number, endDay: number, version: number = 1): MockExam {
  const allWords: VocabularyWord[] = [];
  for (const dg of dayGroups) {
    const dayNum = parseInt(dg.day.replace(/\D/g, ''));
    if (dayNum >= startDay && dayNum <= endDay) {
      allWords.push(...dg.words);
    }
  }

  if (allWords.length < 20) {
    throw new Error('선택한 범위에 단어가 충분하지 않습니다. (최소 20개 필요)');
  }

  // Q5: SynonymAntonymList와 동일한 추출 로직(AI derivative-relations + 어원으로 줄줄이) 활용
  const extractedPairs = extractSynAntPairs(dayGroups, startDay, endDay);
  const q5FromExtracted = generateQ5FromExtracted(extractedPairs);

  const questions: ExamQuestion[] = [
    generateQ1(allWords),
    generateContextAwkward(allWords, 2),
    generateContextAwkward(allWords, 3),
    generateContextAwkward(allWords, 4),
    q5FromExtracted ?? generateQ5(allWords),
    generateQ6(allWords),
    generateQ7(allWords),
    generateCommonBlank(allWords, 8),
    generateCommonBlank(allWords, 9),
    generateQ10(allWords),
  ];

  return {
    questions,
    dayRange: `DAY ${String(startDay).padStart(2, '0')} ~ DAY ${String(endDay).padStart(2, '0')}`,
    version,
  };
}

