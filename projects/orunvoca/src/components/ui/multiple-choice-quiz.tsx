import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Switch } from './switch';
import { Check, X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { playCorrectSound, playIncorrectSound, initializeAudioContext } from '@/utils/sound-effects';
import { isIOS, playBase64AudioWebAudio } from '@/utils/audio';
import usFlag from '@/assets/us-flag.png';
import ukFlag from '@/assets/uk-flag.png';
import { isAdminUser } from '@/utils/admin-check';
import { showAnswerToast } from '@/utils/answer-toast';
interface MultipleChoiceQuizProps {
  word: string;
  meaning: string;
  example?: string;
  type: 'meaning' | 'example';
  onAnswer: (isCorrect: boolean) => void;
  onSkipPrevious?: () => void;
  onSkipNext?: () => void;
  className?: string;
  isLastQuestion?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

// CEFR B1-C1 수준의 영단어 풀 (품사별)
const CEFR_B1_C1_WORDS_BY_POS = {
  동사: ['establish', 'implement', 'evaluate', 'demonstrate', 'investigate', 'coordinate', 'constitute', 'facilitate', 'encounter', 'endeavor', 'negotiate', 'manipulate', 'elaborate', 'authorize', 'acknowledge', 'contribute', 'emphasize', 'eliminate', 'illustrate', 'anticipate', 'participate', 'accommodate', 'communicate', 'concentrate', 'distinguish', 'appreciate', 'accelerate', 'accumulate', 'accomplish'],
  명사: ['framework', 'phenomenon', 'perspective', 'hypothesis', 'methodology', 'consequence', 'significance', 'initiative', 'criterion', 'parameter', 'strategy', 'procedure', 'principle', 'concept', 'aspect', 'factor', 'element', 'component', 'feature', 'characteristic', 'attribute', 'dimension', 'category', 'priority', 'alternative', 'advantage', 'consequence', 'evidence', 'analysis'],
  형용사: ['significant', 'comprehensive', 'substantial', 'considerable', 'fundamental', 'essential', 'crucial', 'vital', 'critical', 'relevant', 'appropriate', 'adequate', 'sufficient', 'efficient', 'effective', 'substantial', 'distinctive', 'apparent', 'evident', 'obvious', 'complex', 'sophisticated', 'comprehensive', 'extensive', 'intensive', 'diverse', 'various', 'numerous', 'multiple'],
  부사: ['significantly', 'substantially', 'considerably', 'fundamentally', 'essentially', 'critically', 'effectively', 'efficiently', 'appropriately', 'adequately', 'sufficiently', 'apparently', 'evidently', 'obviously', 'particularly', 'specifically', 'generally', 'typically', 'frequently', 'occasionally', 'ultimately', 'eventually', 'consequently', 'therefore', 'furthermore', 'moreover', 'nevertheless', 'nonetheless', 'simultaneously']
};

// 품사별 최소 fallback 풀 (GPT 실패 시에만 사용 - 다양하고 구체적인 단어)
const DUMMY_MEANINGS_BY_POS = {
  동사: ['뒤집다', '꿰매다', '절이다', '조각하다', '갈다', '헤엄치다', '짓밟다', '끓이다', '녹이다', '빚다', '깎다', '엮다', '떠다', '굽다', '삶다', '짜다', '뜨다', '묶다', '감다', '접다', '찢다', '긁다', '쓸다', '닦다', '말리다', '빨다', '다리다', '개다', '펴다', '젓다'],
  명사: ['선반', '양동이', '등대', '고개', '울타리', '벽돌', '손잡이', '발판', '칼날', '물레', '굴뚝', '바퀴', '사다리', '지붕', '기둥', '턱', '모서리', '마당', '창고', '지하실', '다락방', '처마', '담장', '우물', '돌담', '빨래줄', '가마솥', '절구', '풀무', '두레박'],
  형용사: ['축축한', '날카로운', '희미한', '울퉁불퉁한', '뻣뻣한', '미지근한', '텁텁한', '느슨한', '빳빳한', '눅눅한', '꾸덕한', '퍽퍽한', '아삭한', '쫄깃한', '탱탱한', '말캉한', '뽀송한', '까끌까끌한', '매끈한', '부드러운', '거칠한', '딱딱한', '물렁한', '반질반질한', '끈적한', '보슬보슬한', '포슬포슬한', '단단한', '무른', '빽빽한'],
  부사: ['슬며시', '불쑥', '살금살금', '느닷없이', '부랴부랴', '주뼛주뼛', '꼬박꼬박', '더듬더듬', '우물쭈물', '허겁지겁', '질끈', '후다닥', '살짝', '홱', '쑥', '툭', '벌컥', '쩔쩔', '어물어물', '덥석', '냉큼', '스르르', '사뿐사뿐', '성큼성큼', '터벅터벅', '어슬렁', '날쌔게', '후딱', '째깍째깍', '또렷이']
};

// 카테고리별 fallback은 제거 - GPT가 단어별로 맞춤 생성하도록 함

// 정답의 모든 품사를 추출하는 함수
const extractAllPartsOfSpeech = (meaning: string): string[] => {
  console.log('=== extractAllPartsOfSpeech DEBUG ===');
  console.log('Input meaning:', meaning);

  // 품사 기호 패턴 ([명], [동], [형], [부])
  const posPattern = /\[([명동형부])\]/g;
  const matches = [...meaning.matchAll(posPattern)];
  console.log('Found POS matches:', matches);
  if (matches.length > 0) {
    // 명시적 품사 기호가 있는 경우
    const parts = matches.map(match => {
      const pos = match[1];
      console.log('Processing POS:', pos);
      switch (pos) {
        case '명':
          return '명사';
        case '동':
          return '동사';
        case '형':
          return '형용사';
        case '부':
          return '부사';
        default:
          return '명사';
      }
    });
    const uniqueParts = [...new Set(parts)];
    const result = uniqueParts.length > 0 ? uniqueParts : ['명사'];
    console.log('Final extracted parts of speech from markers:', result);
    return result;
  }

  // 품사 기호가 없는 경우 의미론적 분석
  const cleanMeaning = meaning.toLowerCase();

  // 명사 키워드들
  const nounKeywords = ['계산서', '고지서', '지폐', '법안', '문서', '서류', '종이', '카드', '표', '증명서', '계약서', '영수증', '청구서', '명세서', '목록', '명단', '부채', '채무', '돈', '화폐', '개념', '원리', '방법', '절차', '체계', '구조', '요소', '성분', '특성', '속성'];

  // 동사 키워드들  
  const verbKeywords = ['하다', '되다', '이다', '아니다', '있다', '없다', '가다', '오다', '보다', '듣다', '말하다', '쓰다', '읽다', '만들다', '찾다', '생각하다', '느끼다', '알다', '모르다'];

  // 형용사 키워드들
  const adjKeywords = ['크다', '작다', '좋다', '나쁘다', '높다', '낮다', '빠르다', '느리다', '새롭다', '오래되다', '중요하다', '필요하다', '가능하다', '어렵다', '쉽다', '복잡하다', '간단하다'];

  // 의미 기반 품사 판정
  const foundNouns = nounKeywords.some(keyword => cleanMeaning.includes(keyword));
  const foundVerbs = verbKeywords.some(keyword => cleanMeaning.includes(keyword));
  const foundAdjs = adjKeywords.some(keyword => cleanMeaning.includes(keyword));
  const inferredParts = [];
  if (foundNouns) inferredParts.push('명사');
  if (foundVerbs) inferredParts.push('동사');
  if (foundAdjs) inferredParts.push('형용사');
  const result = inferredParts.length > 0 ? inferredParts : ['명사']; // 기본값: 명사
  console.log('Final extracted parts of speech from semantic analysis:', result);
  return result;
};

// 품사 추출 함수 (품사 기호 제거) - 첫 번째 품사만 반환 (하위 호환성)
const extractPartOfSpeech = (meaning: string): string => {
  const allParts = extractAllPartsOfSpeech(meaning);
  return allParts[0]; // 첫 번째 품사 반환
};

// 품사 기호 제거 함수 - 더 포괄적인 패턴
const removePOSMarkers = (text: string): string => {
  // [명], [동], [형], [부] 등의 품사 표시 제거
  let cleaned = text.replace(/\[([명동형부])\]\s*/g, '');
  // 문자열 중간에 있는 품사 표시도 제거 (예: "장 [형] 주요한" -> "장 주요한")
  cleaned = cleaned.replace(/\s*\[([명동형부])\]\s*/g, ' ');
  return cleaned.trim();
};

// 선지 표시용 정리 함수 - 괄호 내용 제거 및 세미콜론 앞뒤 뜻 분리
// 괄호는 답을 유추하는 힌트가 될 수 있으므로 선지 표시 시 제거
const cleanChoiceForDisplay = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text.trim();
  
  // 1. 품사 마커 제거 [명], [동], [형], [부]
  cleaned = removePOSMarkers(cleaned);
  
  // 2. 소괄호와 그 내용 제거 (예: "(상품의) 소매점" -> "소매점", "(난파선 등의) 잔해" -> "잔해")
  cleaned = cleaned.replace(/\([^)]*\)\s*/g, '');
  
  // 3. 대괄호와 그 내용 제거 (예: "신입 사원[회원]" -> "신입 사원", "난파[조난]시키다" -> "난파시키다")
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
  
  // 4. 연속된 공백 정리 및 앞뒤 공백 제거
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // 5. 빈 문자열이면 원본 텍스트 반환 (품사 마커만 제거한 버전)
  if (cleaned.length === 0) {
    return removePOSMarkers(text).trim();
  }
  
  return cleaned;
};

// 잘못 합쳐진 뜻을 분리하는 함수 (캐시된 데이터 정리용)
const splitCombinedMeanings = (text: string): string[] => {
  if (!text || text.trim().length === 0) return [];
  
  const trimmed = text.trim();
  
  // 품사 마커 패턴으로 분리 (예: "[형] 친절한 [명] 종류" -> ["친절한", "종류"])
  // 품사 마커: [명], [동], [형], [부]
  const posPattern = /\[[명동형부]\]/g;
  if (posPattern.test(trimmed)) {
    // 품사 마커로 분리
    const parts = trimmed.split(/\[[명동형부]\]/).map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length > 1) {
      // 각 파트에서 추가로 쉼표, 중점 등으로 분리
      const allMeanings: string[] = [];
      parts.forEach(part => {
        const subParts = splitByDelimiters(part);
        allMeanings.push(...subParts);
      });
      return allMeanings.filter(s => s.length > 0);
    } else if (parts.length === 1) {
      // 품사 마커가 하나만 있는 경우, 그 안에서 쉼표/중점 등으로 분리
      return splitByDelimiters(parts[0]);
    }
  }
  
  // 품사 마커가 없는 경우 구분자로 분리
  return splitByDelimiters(trimmed);
};

// 괄호 내부의 쉼표를 무시하고 구분자로 분리하는 스마트 스플릿 함수
const smartSplitIgnoringParens = (text: string, delimiters: RegExp): string[] => {
  const results: string[] = [];
  let current = '';
  let parenDepth = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(') { parenDepth++; current += char; }
    else if (char === ')') { parenDepth = Math.max(0, parenDepth - 1); current += char; }
    else if (delimiters.test(char) && parenDepth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 0) results.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }
  const last = current.trim();
  if (last.length > 0) results.push(last);
  return results;
};

// 괄호가 의미의 핵심 문맥인지 판별
const hasContextualParentheses = (text: string): boolean => {
  if (/\([^)]*등[이의을를에]\)\s*[가-힣]+/.test(text)) return true;
  if (/\([^)]*[이가]\)\s*[가-힣]+/.test(text)) return true;
  if (/^\(/.test(text.trim())) return true;
  return false;
};

// 괄호 내용을 선택적으로 제거하는 함수
const cleanParenthesesSmart = (text: string): string => {
  if (hasContextualParentheses(text)) return text;
  return text.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
};

// 구분자(쉼표, 중점, 슬래시, 세미콜론 등)로 분리하는 헬퍼 함수
const splitByDelimiters = (text: string): string[] => {
  if (!text || text.trim().length === 0) return [];
  
  let trimmed = text.trim();
  
  // 괄호 내용 선택적 제거 (의미의 일부인 괄호는 보존)
  trimmed = cleanParenthesesSmart(trimmed);
  // 대괄호 내용 제거
  trimmed = trimmed.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
  
  // 숫자 패턴으로 분리 (예: "1. 친절한 2. 종류" -> ["친절한", "종류"])
  const numberPattern = /^\d+\.\s*/;
  if (numberPattern.test(trimmed) || /\s+\d+\.\s+/.test(trimmed)) {
    const parts = trimmed.split(/\d+\.\s*/).map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length > 1) {
      return parts;
    }
  }
  
  // 세미콜론으로 분리 (괄호 내부 무시)
  if (trimmed.includes(';')) {
    const parts = smartSplitIgnoringParens(trimmed, /[;]/);
    console.log('Split by semicolon:', parts);
    return parts;
  }
  
  // 쉼표로 분리 (괄호 내부 무시)
  if (trimmed.includes(',')) {
    return smartSplitIgnoringParens(trimmed, /[,]/);
  }
  
  // 중점(·)으로 분리 (명시적 구분자)
  if (trimmed.includes('·')) {
    return trimmed.split('·').map(s => s.trim()).filter(s => s.length > 0);
  }
  
  // 슬래시로 분리 (명시적 구분자)
  if (trimmed.includes('/')) {
    return trimmed.split('/').map(s => s.trim()).filter(s => s.length > 0);
  }
  
  // ========================================
  // 공백 기반 분리는 매우 보수적으로 접근
  // 오직 "명확히 별개의 뜻"인 경우에만 분리
  // ========================================
  
  // 기본: 분리하지 않고 원본 텍스트를 배열로 반환
  return trimmed.length > 0 ? [trimmed] : [];
};

// 정답 뜻을 최대 4개로 제한하는 함수 (랜덤 선택)
const limitCorrectAnswers = (answers: string[], maxCount: number = 4): string[] => {
  if (answers.length <= maxCount) return answers;
  
  // 랜덤 셔플 후 최대 4개 선택
  const shuffled = [...answers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxCount);
};

// AI를 사용하여 선지 전처리 (split-choices) - GPT 기반 분리
const splitChoicesWithAI = async (choices: string[]): Promise<string[]> => {
  try {
    console.log('=== splitChoicesWithAI called ===');
    console.log('Input choices:', choices);
    
    const { data, error } = await supabase.functions.invoke('split-choices', {
      body: { choices }
    });
    
    if (error) {
      console.error('Error from split-choices function:', error);
      throw error;
    }
    
    console.log('AI split choices result:', data.splitChoices);
    return data.splitChoices || fallbackSplitChoices(choices);
  } catch (error) {
    console.error('Error splitting choices with AI:', error);
    // 폴백: 기본 분리
    return fallbackSplitChoices(choices);
  }
};

// 폴백 선지 분리 로직 (AI 실패 시)
const fallbackSplitChoices = (choices: string[]): string[] => {
  const result: string[] = [];
  for (const choice of choices) {
    if (!choice || typeof choice !== 'string') continue;
    
    let cleaned = choice
      .replace(/^\d+\.\s*/, '')
      .replace(/\s+\d+\.\s+/g, ', ');
    
    // 괄호 내용 선택적 제거 (의미의 일부인 괄호는 보존)
    cleaned = cleanParenthesesSmart(cleaned);
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '').trim();
    
    // 괄호 내부 쉼표를 무시하면서 분리
    const parts = smartSplitIgnoringParens(cleaned, /[,;·\/]/).filter(s => s.length > 0);
    result.push(...parts);
  }
  return [...new Set(result)];
};

// 빈칸 만들기 함수
const createBlankedExample = (example: string, targetWord: string) => {
  if (!example || example.length < 5) {
    return `The _____ was very important for the success of the project.`;
  }
  const regex = new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const match = example.match(regex);
  if (!match || match.length === 0) {
    return `${example} The _____ made a significant difference.`;
  }
  return example.replace(regex, '_____');
};

// GPT를 이용한 예문 생성 함수
const generateExampleSentenceWithGPT = async (word: string, meaning: string): Promise<string> => {
  try {
    console.log('=== Generating example sentence with GPT ===');
    console.log('Word:', word, 'Meaning:', meaning);
    const partOfSpeech = extractPartOfSpeech(meaning);
    const {
      data,
      error
    } = await supabase.functions.invoke('generate-example-sentence', {
      body: {
        word,
        meaning: removePOSMarkers(meaning),
        partOfSpeech
      }
    });
    if (error) {
      console.error('Error generating example sentence:', error);
      return `The ${word} was very important in this situation.`;
    }
    console.log('Generated example sentence:', data.exampleSentence);
    return data.exampleSentence || `The ${word} was very important in this situation.`;
  } catch (error) {
    console.error('Error in generateExampleSentenceWithGPT:', error);
    return `The ${word} was very important in this situation.`;
  }
};

// 패턴 감지 함수 - 정답에서 ~을/를/에 등 패턴 추론
const detectPattern = (meaning: string): { hasPattern: boolean; patternType: string; patternPrefix: string } => {
  // "~을" 패턴
  if (/~을/.test(meaning)) {
    return { hasPattern: true, patternType: '~을', patternPrefix: '~을 ' };
  }
  // "~를" 패턴
  if (/~를/.test(meaning)) {
    return { hasPattern: true, patternType: '~를', patternPrefix: '~를 ' };
  }
  // "~에" 패턴
  if (/~에/.test(meaning)) {
    return { hasPattern: true, patternType: '~에', patternPrefix: '~에 ' };
  }
  // "~와/과" 패턴
  if (/~[와과]/.test(meaning)) {
    const match = meaning.match(/~([와과])/);
    return { hasPattern: true, patternType: '~와', patternPrefix: match ? `~${match[1]} ` : '~와 ' };
  }
  // "A를" 패턴
  if (/[A-Z]를/.test(meaning)) {
    return { hasPattern: true, patternType: 'A를', patternPrefix: 'A를 ' };
  }
  // "A에게" 패턴
  if (/[A-Z]에게/.test(meaning)) {
    return { hasPattern: true, patternType: 'A에게', patternPrefix: 'A에게 ' };
  }
  // 일반 "~" 패턴
  if (/~/.test(meaning)) {
    return { hasPattern: true, patternType: '~', patternPrefix: '~' };
  }
  
  return { hasPattern: false, patternType: '', patternPrefix: '' };
};

// 패턴별 fallback 풀
const DUMMY_MEANINGS_BY_PATTERN: Record<string, string[]> = {
  '~을': ['~을 망설이다', '~을 부정하다', '~을 피하다', '~을 잊다', '~을 거부하다', '~을 미루다', '~을 포기하다', '~을 무시하다', '~을 회피하다', '~을 확인하다', '~을 분석하다', '~을 비교하다'],
  '~를': ['~를 망설이다', '~를 부정하다', '~를 피하다', '~를 잊다', '~를 거부하다', '~를 미루다', '~를 포기하다', '~를 무시하다', '~를 회피하다', '~를 확인하다', '~를 분석하다', '~를 비교하다'],
  '~에': ['~에 집중하다', '~에 의존하다', '~에 참여하다', '~에 속하다', '~에 반응하다', '~에 적응하다', '~에 동의하다', '~에 반대하다', '~에 기여하다', '~에 관심을 갖다'],
  '~와': ['~와 협력하다', '~와 경쟁하다', '~와 비교하다', '~와 대조하다', '~와 연결하다', '~와 교류하다', '~와 소통하다', '~와 충돌하다'],
  'A를': ['A를 격려하다', 'A를 설득하다', 'A를 비난하다', 'A를 칭찬하다', 'A를 위로하다', 'A를 응원하다', 'A를 경고하다', 'A를 축하하다'],
  'A에게': ['A에게 부탁하다', 'A에게 사과하다', 'A에게 감사하다', 'A에게 항의하다', 'A에게 질문하다', 'A에게 보고하다', 'A에게 전달하다'],
  '~': ['~하다', '~되다', '~시키다', '~받다', '~당하다', '~이다', '~아니다', '~있다']
};

// 카테고리 감지 함수 - 정답에서 카테고리 추론
const detectCategory = (meaning: string, word: string): string => {
  const cleanMeaning = removePOSMarkers(meaning).toLowerCase();
  const cleanWord = word.toLowerCase();
  
  // 동물 카테고리 감지
  const animals = ['곰', '호랑이', '사자', '코끼리', '원숭이', '기린', '늑대', '토끼', '여우', '독수리', '펭귄', '고래', '상어', '돌고래', '거북이', '뱀', '개', '고양이', '새', '물고기', 'bear', 'tiger', 'lion', 'elephant', 'monkey', 'dog', 'cat', 'bird', 'fish'];
  if (animals.some(a => cleanMeaning.includes(a) || cleanWord.includes(a))) return '동물';
  
  // 색상 카테고리 감지
  const colors = ['빨간', '노란', '파란', '초록', '하얀', '검은', '보라', '주황', '분홍', '갈색', '회색', 'red', 'blue', 'green', 'yellow', 'white', 'black', 'purple', 'orange', 'pink'];
  if (colors.some(c => cleanMeaning.includes(c) || cleanWord.includes(c))) return '색상';
  
  // 감정 카테고리 감지
  const emotions = ['기쁜', '슬픈', '화난', '행복', '우울', '불안', '외로운', '즐거운', 'happy', 'sad', 'angry', 'joy', 'fear', 'love', 'hate'];
  if (emotions.some(e => cleanMeaning.includes(e) || cleanWord.includes(e))) return '감정';
  
  // 음식 카테고리 감지
  const foods = ['사과', '바나나', '오렌지', '빵', '쌀', '고기', '생선', '야채', '과일', 'apple', 'banana', 'bread', 'rice', 'meat', 'fish', 'fruit', 'vegetable'];
  if (foods.some(f => cleanMeaning.includes(f) || cleanWord.includes(f))) return '음식';
  
  // 장소 카테고리 감지
  const places = ['집', '학교', '병원', '공원', '도서관', 'home', 'school', 'hospital', 'park', 'library', 'store', 'market'];
  if (places.some(p => cleanMeaning.includes(p) || cleanWord.includes(p))) return '장소';
  
  // 신체 카테고리 감지
  const body = ['머리', '눈', '코', '입', '귀', '손', '발', 'head', 'eye', 'nose', 'mouth', 'ear', 'hand', 'foot', 'arm', 'leg'];
  if (body.some(b => cleanMeaning.includes(b) || cleanWord.includes(b))) return '신체';
  
  // 자연 카테고리 감지
  const nature = ['산', '강', '바다', '숲', '하늘', 'mountain', 'river', 'sea', 'ocean', 'forest', 'sky', 'sun', 'moon', 'star'];
  if (nature.some(n => cleanMeaning.includes(n) || cleanWord.includes(n))) return '자연';
  
  return ''; // 카테고리 없음
};

// 한국어 뜻 오답 선택지 생성 함수 (GPT 사용 - 품사 자동 판정 + 타임아웃)
const generateKoreanWrongChoicesWithGPT = async (correctWord: string, correctMeaning: string, numberOfChoices: number = 4): Promise<string[]> => {
  console.log('=== Generating Korean wrong choices with GPT (auto POS detection) ===');
  console.log('Correct word:', correctWord, 'Correct meaning:', correctMeaning);
  
  // 카테고리, 패턴, 품사 기반 로컬 fallback 함수
  const getLocalFallback = () => {
    const cleanCorrectMeaning = removePOSMarkers(correctMeaning);
    const patternInfo = detectPattern(correctMeaning);
    const category = detectCategory(correctMeaning, correctWord);
    const pos = extractPartOfSpeech(correctMeaning);
    
    console.log('Local fallback - detected pattern:', patternInfo.patternType, 'category:', category, 'POS:', pos);
    
    // 1. 패턴이 있으면 패턴별 풀에서 선택 (최우선)
    if (patternInfo.hasPattern && DUMMY_MEANINGS_BY_PATTERN[patternInfo.patternType]) {
      const patternPool = [...DUMMY_MEANINGS_BY_PATTERN[patternInfo.patternType]];
      const shuffled = patternPool.sort(() => Math.random() - 0.5);
      const filtered = shuffled.filter(m => m !== cleanCorrectMeaning && !cleanCorrectMeaning.includes(m));
      console.log('Using pattern-based fallback:', patternInfo.patternType, filtered.slice(0, numberOfChoices));
      return filtered.slice(0, numberOfChoices);
    }
    
    // 2. 품사별 풀에서 선택 (카테고리별 풀 제거됨 - GPT가 단어별로 맞춤 생성)
    
    // 3. 카테고리가 없으면 품사별 풀에서 선택
    const posKey = pos as keyof typeof DUMMY_MEANINGS_BY_POS;
    const posPool = DUMMY_MEANINGS_BY_POS[posKey] || DUMMY_MEANINGS_BY_POS['명사'];
    const shuffled = [...posPool].sort(() => Math.random() - 0.5);
    const filtered = shuffled.filter(m => m !== cleanCorrectMeaning && !cleanCorrectMeaning.includes(m));
    console.log('Using POS-based fallback:', pos, filtered.slice(0, numberOfChoices));
    return filtered.slice(0, numberOfChoices);
  };

  try {
    // Create a promise that rejects after 8 seconds (increased from 3 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 8000);
    });

    const apiPromise = supabase.functions.invoke('generate-korean-wrong-choices', {
      body: {
        correctWord,
        correctMeaning,
        numberOfChoices
      }
    });

    const { data, error } = await Promise.race([apiPromise, timeoutPromise]);
    
    if (error) throw error;
    
    // API 에러가 있어도 wrongChoices가 있으면 사용
    if (data?.wrongChoices && Array.isArray(data.wrongChoices) && data.wrongChoices.length > 0) {
      console.log('GPT detected POS:', data.detectedPartOfSpeech);
      console.log('GPT generated wrong choices:', data.wrongChoices);
      return data.wrongChoices;
    }
    
    throw new Error('No valid wrong choices returned');
  } catch (error) {
    console.error('Error or timeout calling GPT for wrong choices:', error);
    return getLocalFallback();
  }
};

// 오답 선택지 생성 함수 - GPT 사용 (예문완성 모드용 - 품사 자동 판정 + 타임아웃)
const generateWrongChoicesForExampleWithGPT = async (correctWord: string, koreanMeaning: string, exampleSentence: string, numberOfChoices: number = 4): Promise<string[]> => {
  console.log('=== Generating wrong choices for example mode with GPT (auto POS detection) ===');
  console.log('Correct word:', correctWord, 'Korean meaning:', koreanMeaning, 'Example:', exampleSentence);
  
  // Local fallback function
  const getLocalFallback = () => {
    const allWords = Object.values(CEFR_B1_C1_WORDS_BY_POS).flat();
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    return shuffled.filter(w => w.toLowerCase() !== correctWord.toLowerCase()).slice(0, numberOfChoices);
  };

  try {
    // Create a promise that rejects after 3 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });

    const apiPromise = supabase.functions.invoke('generate-english-wrong-choices', {
      body: {
        correctWord,
        koreanMeaning,
        exampleSentence,
        numberOfChoices
      }
    });

    const { data, error } = await Promise.race([apiPromise, timeoutPromise]);
    
    if (error) throw error;
    console.log('GPT detected POS:', data.detectedPartOfSpeech);
    console.log('GPT generated wrong choices for example:', data.wrongChoices);
    return data.wrongChoices || getLocalFallback();
  } catch (error) {
    console.error('Error or timeout calling GPT for example wrong choices:', error);
    return getLocalFallback();
  }
};

// 단어의 모든 뜻을 추출하는 함수 - 개선된 버전
const extractAllMeanings = (meaningText: string): string[] => {
  console.log('=== extractAllMeanings DEBUG ===');
  console.log('Original meaningText:', meaningText);
  
  // 먼저 품사 표시 제거
  const cleanMeaning = removePOSMarkers(meaningText);
  console.log('After removePOSMarkers:', cleanMeaning);

  // 숫자와 점으로 시작하는 패턴으로 분리 (예: "1. 계산서", "2. 지폐")
  // 하지만 괄호 안의 숫자는 제외 (예: "(정치적 2." 이런 패턴 방지)
  const allMeanings: string[] = [];
  
  // 패턴: 숫자. 뒤에 공백이 오는 경우만 분리
  // 먼저 각 번호별 의미를 추출
  const numberPattern = /(?:^|\s)(\d+)\.\s+/g;
  const parts = cleanMeaning.split(numberPattern).filter(part => part.trim() && !/^\d+$/.test(part.trim()));
  
  console.log('Split by number pattern:', parts);
  
  // 숫자 패턴이 없으면 전체를 하나의 파트로 처리
  const partsToProcess = parts.length === 0 ? [cleanMeaning] : parts;
  
  partsToProcess.forEach(part => {
    let trimmed = part.trim();
    
    // 다시 한번 품사 표시 제거 (분리 후에도 남아있을 수 있음)
    trimmed = removePOSMarkers(trimmed);
    
    if (!trimmed) return;
    
    // 괄호로 시작하는 설명과 실제 뜻을 함께 유지
    // 예: "(얼굴이) 창백한" -> 하나로 유지
    // 예: "(색깔이) 옅은" -> 하나로 유지
    
    // 괄호 보호: 괄호 안의 내용은 분리하지 않도록 처리
    const protectedMeaning = trimmed.replace(/\([^)]*\)/g, match => {
      return match.replace(/,/g, '##COMMA##').replace(/·/g, '##DOT##');
    });

    // 쉼표와 중점(·)으로 분리하되, 괄호 패턴이 포함된 경우는 분리하지 않음
    // "(얼굴이) 창백한, (색깔이) 옅은" 같은 경우 분리
    let subMeanings: string[] = [];
    
    // 괄호+설명 패턴이 여러 개인 경우만 분리
    const bracketPattern = /\([^)]+\)\s*[^,·(]+/g;
    const bracketMatches = protectedMeaning.match(bracketPattern);
    
    if (bracketMatches && bracketMatches.length > 1) {
      // 여러 개의 (설명) 뜻 패턴이 있으면 각각 분리
      subMeanings = bracketMatches.map(m => m.replace(/##COMMA##/g, ',').replace(/##DOT##/g, '·').trim());
    } else if (!protectedMeaning.includes('(')) {
      // 괄호가 없는 경우 다양한 구분자로 분리
      if (protectedMeaning.includes(',')) {
        // 쉼표가 있는 경우 분리
        subMeanings = smartSplitIgnoringParens(protectedMeaning, /[,]/).map(s => s.trim());
      } else if (protectedMeaning.includes('·')) {
        // 중점이 있는 경우 분리
        subMeanings = protectedMeaning.split('·').map(s => s.trim());
      } else if (protectedMeaning.includes('/')) {
        // 슬래시가 있는 경우 분리
        subMeanings = protectedMeaning.split('/').map(s => s.trim());
      } else {
        // "~의 ~" 패턴 체크 (예: "비전문가의 아마추어" -> ["비전문가", "아마추어"])
        // 단, 문맥상 하나의 뜻인 경우 제외 (예: "미래의 약속")
        const possibleSplit = protectedMeaning.match(/^([가-힣]+)의\s+([가-힣]+)$/);
        if (possibleSplit && possibleSplit[1].length <= 5 && possibleSplit[2].length <= 5) {
          // 두 단어 모두 짧은 경우 (5자 이하) 분리 가능성 높음
          subMeanings = [possibleSplit[1], possibleSplit[2]];
        } else {
          subMeanings = [protectedMeaning];
        }
      }
    } else {
      // 그 외에는 전체를 하나로 유지
      subMeanings = [protectedMeaning];
    }

    subMeanings.forEach(subMeaning => {
      // 보호된 문자 복원
      let restoredMeaning = subMeaning.replace(/##COMMA##/g, ',').replace(/##DOT##/g, '·').trim();
      // 최종 품사 제거
      restoredMeaning = removePOSMarkers(restoredMeaning);
      
      if (restoredMeaning) {
        allMeanings.push(restoredMeaning);
      }
    });
  });
  
  // 결과가 없으면 원본에서 품사만 제거해서 반환
  if (allMeanings.length === 0) {
    const fallback = removePOSMarkers(meaningText.trim());
    return fallback ? [fallback] : [];
  }
  
  console.log('Final extracted meanings:', allMeanings);
  return allMeanings;
};

// 선택지 생성 함수 - 정답을 선택지에서 제외 (재시도 로직 포함)
const generateChoices = async (correctAnswer: string, type: 'meaning' | 'example', targetWord?: string, meaningText?: string): Promise<{
  choices: string[];
  correctAnswers: string[];
}> => {
  console.log('=== generateChoices called ===');
  console.log('correctAnswer:', correctAnswer);
  console.log('type:', type);
  console.log('targetWord:', targetWord);
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500; // 500ms delay between retries
  
  let choices: string[] = [];
  let correctAnswers: string[] = [];
  
  if (type === 'meaning') {
    // 해당 단어의 모든 뜻을 추출 (정답) - AI 기반 분리 사용
    console.log('=== Step 1: Extract correct answers with AI splitting ===');
    
    // 먼저 기본 추출
    let basicExtractedMeanings = extractAllMeanings(correctAnswer);
    console.log('Basic extracted meanings:', basicExtractedMeanings);
    
    // AI 기반 분리 적용 (GPT가 "친절한 종류" -> ["친절한", "종류"]로 분리)
    let allExtractedMeanings: string[] = [];
    try {
      const aiSplitMeanings = await splitChoicesWithAI(basicExtractedMeanings);
      console.log('AI split meanings:', aiSplitMeanings);
      
      // AI 결과 정리: 빈 문자열 제거, 중복 제거, 품사 마커 제거
      allExtractedMeanings = [...new Set(
        aiSplitMeanings
          .map(m => cleanChoiceForDisplay(m))
          .filter(m => m && m.trim().length > 0)
      )];
      console.log('Cleaned AI split meanings:', allExtractedMeanings);
    } catch (error) {
      console.error('AI splitting failed, using fallback:', error);
      allExtractedMeanings = basicExtractedMeanings.map(m => cleanChoiceForDisplay(m)).filter(m => m);
    }
    
    // 정답 뜻이 너무 많으면 최대 4개로 제한 (랜덤 선택)
    correctAnswers = limitCorrectAnswers(allExtractedMeanings, 4);
    console.log('Limited correct answers (max 4):', correctAnswers);

    // 모든 품사 추출
    const allPartsOfSpeech = extractAllPartsOfSpeech(correctAnswer);
    console.log('Extracted all parts of speech:', allPartsOfSpeech);

    // 총 8개 선택지 고정 (정답 + 오답)
    const totalChoices = 8;
    const wrongChoicesNeeded = totalChoices - correctAnswers.length;
    // 캐시에 더 많은 오답을 저장하여 매번 다른 조합 제공 (최소 12개 요청)
    const wrongChoicesToRequest = Math.max(12, wrongChoicesNeeded * 2);
    console.log('Total choices:', totalChoices, 'Wrong choices needed:', wrongChoicesNeeded, 'Requesting:', wrongChoicesToRequest);

    // 뜻 맞추기 모드: 한국어 뜻 오답 선택지 생성 (재시도 로직 포함)
    let uniqueWrongChoices: string[] = [];
    let retryCount = 0;
    
    while (uniqueWrongChoices.length < wrongChoicesNeeded && retryCount < MAX_RETRIES) {
      try {
        // 영어 단어는 targetWord에서 가져옴
        const validTargetWord = targetWord && targetWord.trim() && !targetWord.startsWith('Day') ? targetWord : '';
        const validMeaning = correctAnswers[0] && correctAnswers[0].trim() ? correctAnswers[0] : '';
        if (!validTargetWord || !validMeaning) {
          console.log('Invalid data for Korean wrong choices generation:', {
            targetWord: validTargetWord,
            meaning: validMeaning
          });
          throw new Error('Invalid word or meaning data');
        }
        
        console.log(`Generating Korean wrong choices with GPT (attempt ${retryCount + 1}/${MAX_RETRIES})...`, {
          word: validTargetWord,
          meaning: validMeaning
        });

        // 한국어 뜻 오답 선택지 생성 (GPT 사용 - 품사 자동 판정)
        const wrongChoices = await generateKoreanWrongChoicesWithGPT(validTargetWord, validMeaning, wrongChoicesToRequest);
        console.log('Generated Korean wrong choices with GPT:', wrongChoices);
        
        // ⚠️ 오답 선지는 splitChoicesWithAI를 적용하지 않음 - 패턴 보존을 위해
        // 특수 패턴(~, A를 등)이 포함된 오답은 분리하면 패턴이 손실됨
        let splitWrongChoices = wrongChoices.map(m => cleanChoiceForDisplay(m)).filter(m => m && m.trim().length > 0);
        console.log('Cleaned wrong choices (no AI split for pattern preservation):', splitWrongChoices);

        // 중복 제거하고 정답과 다른 것들만 필터링
        const filteredChoices = splitWrongChoices.filter((choice: string) => 
          !correctAnswers.some(correct => choice.includes(correct) || correct.includes(choice) || choice === correct)
        );
        
        // 기존 uniqueWrongChoices에 새로운 선택지 추가 (중복 제거)
        filteredChoices.forEach(choice => {
          if (!uniqueWrongChoices.includes(choice)) {
            uniqueWrongChoices.push(choice);
          }
        });
        
        console.log(`After attempt ${retryCount + 1}, unique wrong choices:`, uniqueWrongChoices);
        
        // 충분한 오답이 생성되었으면 종료
        if (uniqueWrongChoices.length >= wrongChoicesNeeded) {
          console.log('Sufficient wrong choices generated, exiting retry loop');
          break;
        }
        
        retryCount++;
        
        // 재시도 전 딜레이
        if (retryCount < MAX_RETRIES) {
          console.log(`Waiting ${RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      } catch (error) {
        console.error(`Error generating wrong choices (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        // 재시도 전 딜레이
        if (retryCount < MAX_RETRIES) {
          console.log(`Waiting ${RETRY_DELAY}ms before retry after error...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }

    // 오답이 여전히 부족한 경우 DUMMY_MEANINGS에서 추가 (모든 품사에서 추가)
    if (uniqueWrongChoices.length < wrongChoicesNeeded) {
      console.log(`After ${MAX_RETRIES} retries, still need ${wrongChoicesNeeded - uniqueWrongChoices.length} more wrong choices. Using fallback.`);
      let fallbackChoices: string[] = [];

      // 각 품사별로 더미 선택지 추가
      for (const pos of allPartsOfSpeech) {
        const availableDummies = DUMMY_MEANINGS_BY_POS[pos as keyof typeof DUMMY_MEANINGS_BY_POS] || DUMMY_MEANINGS_BY_POS.동사;
        const filteredDummies = availableDummies.filter(meaning => 
          !correctAnswers.some(correct => meaning.includes(correct) || correct.includes(meaning) || meaning === correct) && 
          !uniqueWrongChoices.includes(meaning)
        );
        fallbackChoices.push(...filteredDummies);
      }

      // 중복 제거하고 추가
      const uniqueFallbackChoices = [...new Set(fallbackChoices)];
      uniqueWrongChoices = [...uniqueWrongChoices, ...uniqueFallbackChoices];
      console.log('After adding fallback choices:', uniqueWrongChoices);
    }

    // 표시할 오답은 wrongChoicesNeeded개만 선택하지만, 캐시에는 모든 오답을 저장
    const allWrongChoicesForCache = [...uniqueWrongChoices];
    const finalWrongChoices = uniqueWrongChoices.sort(() => Math.random() - 0.5).slice(0, wrongChoicesNeeded);
    choices = [...correctAnswers, ...finalWrongChoices];
    // 캐시 저장 시 사용할 전체 오답 풀 보관
    (choices as any).__allWrongChoices = allWrongChoicesForCache;
    
    console.log('Final choices count:', choices.length, 'Expected:', totalChoices);
  } else {
    // 예문 빈칸 선택지 생성 (새로운 로직 - GPT 품사 자동 판정 + 재시도)
    correctAnswers = [targetWord || correctAnswer];
    let wrongChoices: string[] = [];
    let retryCount = 0;
    
    while (wrongChoices.length < 4 && retryCount < MAX_RETRIES) {
      try {
        console.log(`Generating English wrong choices for example mode (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        console.log('Target word:', targetWord, 'Korean meaning:', meaningText);
        
        // GPT로 매력적인 오답 선택지 생성 (품사 자동 판정)
        const exampleSentence = correctAnswer; // 예문 전체를 전달
        const generatedChoices = await generateWrongChoicesForExampleWithGPT(
          targetWord || correctAnswer, 
          meaningText || '', 
          exampleSentence, 
          4
        );
        
        // 기존 선택지에 추가 (중복 제거)
        generatedChoices.forEach(choice => {
          if (!wrongChoices.includes(choice) && choice.toLowerCase() !== (targetWord || correctAnswer).toLowerCase()) {
            wrongChoices.push(choice);
          }
        });
        
        console.log(`After attempt ${retryCount + 1}, wrong choices:`, wrongChoices);
        
        if (wrongChoices.length >= 4) {
          break;
        }
        
        retryCount++;
        
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      } catch (error) {
        console.error(`Error generating wrong choices for example (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
    
    // Fallback if still not enough
    if (wrongChoices.length < 4) {
      console.log('Using fallback choices for example mode');
      const fallbackChoices = CEFR_B1_C1_WORDS_BY_POS['형용사'] || CEFR_B1_C1_WORDS_BY_POS.명사;
      const uniqueFallbackChoices = [...new Set(fallbackChoices)]
        .filter(choice => 
          choice.toLowerCase() !== (targetWord || correctAnswer).toLowerCase() && 
          !wrongChoices.includes(choice)
        );
      wrongChoices = [...wrongChoices, ...uniqueFallbackChoices].slice(0, 4);
    }
    
    choices = [correctAnswers[0], ...wrongChoices.slice(0, 4)];
  }

  // 모든 선택지 섞기 (정답 포함)
  return {
    choices: choices.sort(() => Math.random() - 0.5),
    correctAnswers
  };
};
export function MultipleChoiceQuiz({
  word,
  meaning,
  example = "",
  type,
  onAnswer,
  onSkipPrevious,
  onSkipNext,
  className = "",
  isLastQuestion = false,
  currentQuestion = 1,
  totalQuestions = 30
}: MultipleChoiceQuizProps) {
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [blankedExample, setBlankedExample] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCorrectAnswers, setCurrentCorrectAnswers] = useState<string[]>([]);
  const [isSavingToWordbook, setIsSavingToWordbook] = useState(false);
  const [phoneticSpelling, setPhoneticSpelling] = useState<string>('');
  const [usPhonetics, setUsPhonetics] = useState<string>('');
  const [koreanPronunciation, setKoreanPronunciation] = useState<string>('');
  const [loadingPhonetics, setLoadingPhonetics] = useState(false);
  const [autoNextTimer, setAutoNextTimer] = useState<NodeJS.Timeout | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const {
    toast
  } = useToast();

  // 재출제 함수 - 캐시 삭제 후 새로운 문제 생성
  const handleRegenerate = async () => {
    try {
      console.log('=== REGENERATE STARTED ===');
      setIsLoading(true);

      // 기존 캐시 완전 삭제 
      console.log('Deleting cache for word:', word, 'meaning:', meaning);
      const {
        error: deleteError
      } = await supabase.from('word_quiz_cache').delete().eq('word', word.trim()).eq('meaning', meaning.trim());
      if (deleteError) {
        console.error('Cache deletion error:', deleteError);
      } else {
        console.log('Cache deleted successfully');
      }

      // 상태 완전 초기화
      setChoices([]);
      setSelectedChoices([]);
      setShowResult(false);
      setIsCorrect(false);
      setCurrentCorrectAnswers([]);
      setBlankedExample('');
      setUsPhonetics('');
      setKoreanPronunciation('');
      console.log('=== States reset, calling loadQuizData ===');

      // 강제로 새 데이터 로드 (캐시 무시)
      setTimeout(async () => {
        await loadQuizData();
        console.log('=== REGENERATE COMPLETED ===');
        toast({
          title: "재출제 완료",
          description: "새로운 문제가 생성되었습니다."
        });
      }, 100);
    } catch (error) {
      console.error('Error regenerating quiz:', error);
      toast({
        title: "재출제 실패",
        description: "문제를 재출제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // CEFR 레벨을 가져오는 함수
  const getCEFRLevel = (word: string) => {
    const cefrDict: {
      [key: string]: string;
    } = {
      'promote': 'B2',
      'develop': 'B1',
      'create': 'A2',
      'achieve': 'B1',
      'establish': 'B2',
      'maintain': 'B1',
      'improve': 'A2',
      'increase': 'A2',
      'decrease': 'B1',
      'analyze': 'B2'
    };
    return cefrDict[word.toLowerCase()] || 'B1';
  };

  // CEFR 레벨을 별표로 변환하는 함수
  const getCEFRStars = (level: string) => {
    const starMap: {
      [key: string]: string;
    } = {
      'A1': '⭐',
      'A2': '⭐⭐',
      'B1': '⭐⭐⭐',
      'B2': '⭐⭐⭐⭐',
      'C1': '⭐⭐⭐⭐⭐',
      'C2': '⭐⭐⭐⭐⭐⭐'
    };
    return starMap[level] || '⭐⭐⭐';
  };

  // 발음기호를 가져오는 함수 (간단한 사전)
  const getPhonetics = (word: string) => {
    const phoneticsDict: {
      [key: string]: {
        us: string;
        uk: string;
      };
    } = {
      'promote': {
        us: '/prəˈmoʊt/',
        uk: '/prəˈməʊt/'
      },
      'develop': {
        us: '/dɪˈveləp/',
        uk: '/dɪˈveləp/'
      },
      'create': {
        us: '/kriˈeɪt/',
        uk: '/kriˈeɪt/'
      },
      'achieve': {
        us: '/əˈtʃiv/',
        uk: '/əˈtʃiːv/'
      },
      'establish': {
        us: '/ɪˈstæblɪʃ/',
        uk: '/ɪˈstæblɪʃ/'
      },
      'maintain': {
        us: '/meɪnˈteɪn/',
        uk: '/meɪnˈteɪn/'
      },
      'improve': {
        us: '/ɪmˈpruv/',
        uk: '/ɪmˈpruːv/'
      },
      'increase': {
        us: '/ɪnˈkris/',
        uk: '/ɪnˈkriːs/'
      },
      'decrease': {
        us: '/dɪˈkris/',
        uk: '/dɪˈkriːs/'
      },
      'analyze': {
        us: '/ˈænəlaɪz/',
        uk: '/ˈænəlaɪz/'
      }
    };
    return phoneticsDict[word.toLowerCase()] || {
      us: `/${word}/`,
      uk: `/${word}/`
    };
  };

  // GPT를 사용해서 발음기호와 한글발음 가져오기
  const fetchPronunciationData = async (word: string) => {
    if (!word || word.length === 0) return;
    setLoadingPhonetics(true);
    try {
      console.log('Fetching pronunciation from GPT for:', word);
      const {
        data,
        error
      } = await supabase.functions.invoke('get-pronunciation', {
        body: {
          word
        }
      });
      if (error) {
        console.error('Error fetching pronunciation from GPT:', error);
        setUsPhonetics('/unknown/');
        setKoreanPronunciation('unknown');
        return;
      }
      console.log('Received pronunciation data from GPT:', data);
      setUsPhonetics(data.ipa || '/unknown/');
      setKoreanPronunciation(data.korean || 'unknown');
    } catch (error) {
      console.error('Error in fetchPronunciationData:', error);
      setUsPhonetics('/unknown/');
      setKoreanPronunciation('unknown');
    } finally {
      setLoadingPhonetics(false);
    }
  };

  // Oxford Dictionary API를 사용한 TTS 기능
  const playPronunciation = async (accent: 'american' | 'british') => {
    if (type !== 'meaning') return;
    setIsPlayingAudio(accent);
    try {
      initializeAudioContext();
      const {
        data,
        error
      } = await supabase.functions.invoke('oxford-dictionary', {
        body: {
          word: word,
          accent: accent
        }
      });
      if (error) throw error;
      if (data?.audioUrl) {
        // Oxford Dictionary API의 오디오 URL 사용
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setIsPlayingAudio(null);
        audio.onerror = () => {
          console.error('Error playing Oxford audio, falling back to TTS');
          // Fallback to existing TTS function
          fallbackToTTS(accent);
        };
        await audio.play();
      } else {
        // 오디오 URL이 없으면 기존 TTS 사용
        fallbackToTTS(accent);
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error);
      fallbackToTTS(accent);
    }
  };

  // 기존 TTS로 폴백
  const fallbackToTTS = async (accent: 'american' | 'british') => {
    try {
      initializeAudioContext();
      const {
        data,
        error
      } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: word,
          accent: accent
        }
      });
      if (error) throw error;
      if (isIOS) {
        await playBase64AudioWebAudio(data.audioContent);
        setIsPlayingAudio(null);
        return;
      }
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.onended = () => setIsPlayingAudio(null);
      audio.onerror = () => setIsPlayingAudio(null);
      await audio.play();
    } catch (error) {
      console.error('TTS fallback failed:', error);
      setIsPlayingAudio(null);
    }
  };

  const loadQuizData = async () => {
    console.log("=== Multiple Choice Quiz Debug ===");
    console.log("Word:", word);
    console.log("Meaning:", meaning);
    console.log("Example:", example);
    console.log("Type:", type);
    console.log("Current choices before clear:", choices);
    console.log("Current loading state:", isLoading);

    // 즉시 상태 초기화로 이전 데이터가 보이지 않게 함
    setChoices([]);
    setSelectedChoices([]);
    setShowResult(false);
    setIsCorrect(false);
    setCurrentCorrectAnswers([]);
    setUsPhonetics('');
    setKoreanPronunciation('');
    setIsLoading(true);
    try {
      // Check cache first - query with quiz_type for accurate matching
      const {
        data: cachedData
      } = await supabase.from('word_quiz_cache').select('*').eq('word', word.trim()).eq('meaning', meaning.trim()).eq('quiz_type', type).limit(1);
      
      const foundCachedData = cachedData && cachedData.length > 0 ? cachedData[0] : null;
      console.log("Found cached data for type", type, ":", foundCachedData);
      if (foundCachedData) {
        console.log("Using cached data:", foundCachedData);

        // Use new column structure if available, fall back to old
        let choicesData: string[] = [];
        let correctAnswersData: string[] = [];
        if (foundCachedData.choices) {
          const rawChoices = Array.isArray(foundCachedData.choices) ? (foundCachedData.choices as unknown as string[]).filter((c): c is string => typeof c === 'string' && c.trim().length > 0) : [];
          const rawCorrectAnswers = Array.isArray(foundCachedData.correct_answers) ? (foundCachedData.correct_answers as unknown as string[]).filter((c): c is string => typeof c === 'string' && c.trim().length > 0) : [];
          
          // 캐시된 선지에서 잘못 합쳐진 뜻 분리 처리
          const splitChoices = rawChoices.flatMap((choice: string) => splitCombinedMeanings(choice));
          const splitCorrectAnswers = rawCorrectAnswers.flatMap((answer: string) => splitCombinedMeanings(answer));
          
          // 중복 제거
          const uniqueSplitChoices = [...new Set(splitChoices)];
          const uniqueSplitCorrectAnswers = [...new Set(splitCorrectAnswers)];
          
          // 정답이 4개를 초과하면 랜덤으로 4개만 선택
          correctAnswersData = limitCorrectAnswers(uniqueSplitCorrectAnswers, 4);
          
          // 정답에서 제외된 뜻은 오답 선택지에 포함하지 않도록 처리
          // 총 8개 선택지 유지: 정답 + 오답
          const excludedCorrectAnswers = uniqueSplitCorrectAnswers.filter(a => !correctAnswersData.includes(a));
          const wrongChoicesFromCache = uniqueSplitChoices.filter(c => !uniqueSplitCorrectAnswers.includes(c) && !excludedCorrectAnswers.includes(c));
          
          // 필요한 오답 개수 계산 - 캐시에 더 많은 오답이 저장되어 있으므로 랜덤 선택
          const wrongChoicesNeeded = 8 - correctAnswersData.length;
          // 셔플하여 매번 다른 오답 조합 제공 (핵심 수정!)
          const shuffledWrongChoices = [...wrongChoicesFromCache].sort(() => Math.random() - 0.5);
          const finalWrongChoices = shuffledWrongChoices.slice(0, wrongChoicesNeeded);
          
          choicesData = [...correctAnswersData, ...finalWrongChoices].sort(() => Math.random() - 0.5);
        } else if (foundCachedData.wrong_choices) {
          // Old structure fallback
          const correctMeanings = smartSplitIgnoringParens(meaning, /[,]/).map((m: string) => m?.trim() || '').filter(m => m.length > 0);
          correctAnswersData = limitCorrectAnswers(correctMeanings, 4);
          const wrongChoices = Array.isArray(foundCachedData.wrong_choices) ? (foundCachedData.wrong_choices as unknown as string[]).filter((c): c is string => typeof c === 'string' && c.trim().length > 0) : [];
          const wrongChoicesNeeded = 8 - correctAnswersData.length;
          choicesData = [...correctAnswersData, ...wrongChoices.slice(0, wrongChoicesNeeded)].sort(() => Math.random() - 0.5);
        }
        
        // meaning 타입에서 영어 오답이 포함되어 있는지 확인 (3글자 이상의 영어 단어 패턴)
        const hasEnglishWrongChoices = type === 'meaning' && choicesData.some(choice => {
          if (!choice || typeof choice !== 'string') return false;
          // 정답이 아닌 선택지 중 영어로만 이루어진 것이 있는지 확인
          const isCorrect = correctAnswersData.some(correct => choice === correct || choice.includes(correct) || correct.includes(choice));
          if (isCorrect) return false;
          // 3글자 이상의 영문 단어가 있으면 영어 오답으로 판단
          return /^[a-zA-Z]{3,}$/.test(choice.trim());
        });
        
        if (hasEnglishWrongChoices) {
          console.log("Cache contains English wrong choices for meaning type, regenerating...");
          // 잘못된 캐시 삭제
          await supabase.from('word_quiz_cache').delete().eq('id', foundCachedData.id);
          // 캐시 무시하고 새로 생성하도록 진행
        } else if (choicesData.length > 0) {
          setChoices(choicesData);
          setCurrentCorrectAnswers(correctAnswersData);

          // Set phonetic data if available - 캐시된 발음 데이터 사용
          if (foundCachedData.phonetic_transcription && foundCachedData.phonetic_transcription !== 'null') {
            setUsPhonetics(foundCachedData.phonetic_transcription);
          }
          if (foundCachedData.korean_pronunciation && foundCachedData.korean_pronunciation !== 'null') {
            setKoreanPronunciation(foundCachedData.korean_pronunciation);
          }

          // 캐시에 발음 데이터가 없는 경우 비동기로 가져오기 (퀴즈 표시를 블로킹하지 않음)
          if (type === 'meaning' && (!foundCachedData.phonetic_transcription || !foundCachedData.korean_pronunciation || foundCachedData.phonetic_transcription === 'null' || foundCachedData.korean_pronunciation === 'null')) {
            console.log("Cached data missing pronunciation, fetching async...");
            const cacheId = foundCachedData.id;

            // 비동기로 발음 데이터 가져오기 - await 없이 백그라운드에서 실행
            supabase.functions.invoke('get-pronunciation', {
              body: { word }
            }).then(async ({ data: pronunciationData, error: pronunciationError }) => {
              if (!pronunciationError && pronunciationData) {
                const newIPA = pronunciationData.ipa || '/unknown/';
                const newKorean = pronunciationData.korean || 'unknown';

                // 상태 업데이트
                setUsPhonetics(newIPA);
                setKoreanPronunciation(newKorean);

                // 캐시 업데이트 - id를 사용해서 정확한 레코드 업데이트
                await supabase.from('word_quiz_cache').update({
                  phonetic_transcription: newIPA,
                  korean_pronunciation: newKorean
                }).eq('id', cacheId);
                console.log("Updated cache with new pronunciation data:", { cacheId, newIPA, newKorean });
              }
            }).catch(updateError => {
              console.warn("Failed to fetch or update pronunciation:", updateError);
            });
          }
          if (type === 'example') {
            // 예문 완성 모드: 항상 GPT로 새로운 예문 생성 (캐시된 데이터 무시)
            console.log('Regenerating example sentence for cached data');
            const generatedExample = await generateExampleSentenceWithGPT(word, meaning);
            console.log('Generated new example sentence:', generatedExample);
            setBlankedExample(createBlankedExample(generatedExample, word));
          }
          setIsLoading(false);
          return;
        }
      }
      console.log("=== No cached data found, generating new choices ===");

      // Generate new data if not cached
      console.log(`Generating choices for ${type} type...`);
      console.log('Word:', word, 'Meaning:', meaning);
      let result;
      if (type === 'meaning') {
        result = await generateChoices(meaning, 'meaning', word, meaning);
        console.log('generateChoices result for meaning:', result);
        // Get phonetic data for meaning type - 비동기로 백그라운드에서 가져오기
        fetchPronunciationData(word);
      } else {
        // 예문 완성 모드: 항상 GPT로 새로운 예문 생성
        console.log('Generating new example sentence with GPT for word:', word, 'meaning:', meaning);
        const generatedExample = await generateExampleSentenceWithGPT(word, meaning);
        console.log('Generated example sentence:', generatedExample);
        setBlankedExample(createBlankedExample(generatedExample, word));
        result = await generateChoices(word, 'example', word, meaning);
        console.log('generateChoices result for example:', result);
      }
      console.log("Generated choices result:", result);

      // Set choices and answers
      if (result && result.choices && result.correctAnswers) {
        console.log('Setting choices:', result.choices);
        console.log('Setting correct answers:', result.correctAnswers);
        setChoices(result.choices);
        setCurrentCorrectAnswers(result.correctAnswers);

        // Cache the results - use flexible upsert
        try {
          // 캐시에는 전체 오답 풀을 저장하여 매번 다른 조합 제공
          const allWrongChoices = (result.choices as any).__allWrongChoices || result.choices.filter((c: string) => !result.correctAnswers.includes(c));
          const allChoicesForCache = [...result.correctAnswers, ...allWrongChoices];
          await supabase.from('word_quiz_cache').upsert({
            word: word.trim(),
            meaning: meaning.trim(),
            english_definition: meaning.trim(),
            part_of_speech: "동사",
            wrong_choices: allWrongChoices,
            choices: allChoicesForCache,
            correct_answers: result.correctAnswers,
            phonetic_transcription: usPhonetics || null,
            korean_pronunciation: koreanPronunciation || null,
            quiz_type: type
          }, {
            onConflict: 'word,meaning',
            ignoreDuplicates: false
          });
        } catch (cacheError) {
          console.warn("Failed to cache data:", cacheError);
        }
      } else {
        console.error("Failed to generate choices - result is invalid:", result);
        setChoices([]);
      }
    } catch (error) {
      console.error("Error loading quiz data:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      setChoices([]);
    } finally {
      console.log("=== Setting loading to false ===");
      console.log("Final choices:", choices);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (word && meaning) {
      loadQuizData();
    }
  }, [word, meaning, example, type]);

  // 첫 번째 사용자 상호작용 시 오디오 컨텍스트 초기화
  useEffect(() => {
    const initAudio = () => {
      initializeAudioContext();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // 자동으로 다음 문제로 넘어가는 기능 제거

  const handleChoiceSelect = (choice: string) => {
    if (showResult) return;
    setSelectedChoices(prev => prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]);
  };

  // 효과음 재생 함수
  const playSound = (frequency: number, duration: number, type: 'correct' | 'incorrect') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      if (type === 'correct') {
        // 정답: 상승하는 화음
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
      } else {
        // 오답: 하강하는 음
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.15);
      }
      oscillator.type = 'triangle';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // 박수소리 효과음 재생 함수
  const playApplauseSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 2.5; // 2.5초간 재생

      // 여러 개의 박수 소리를 만들기 위해 반복
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          // 화이트 노이즈를 이용한 박수 소리 시뮬레이션
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          oscillator.type = 'white' as any; // 화이트 노이즈
          if (oscillator.type !== 'white') {
            oscillator.type = 'sawtooth'; // 대체 파형
          }

          // 필터로 박수 소리 특성 만들기
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000 + Math.random() * 2000, audioContext.currentTime);
          filter.Q.setValueAtTime(5, audioContext.currentTime);
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // 박수 소리의 특징적인 어택과 디케이
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(200 + Math.random() * 400, audioContext.currentTime);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        }, i * 150 + Math.random() * 100); // 약간의 랜덤 딜레이로 자연스러운 박수
      }

      // 마지막에 축하 멜로디 추가
      setTimeout(() => {
        const celebrationNotes = [523, 659, 784, 1047]; // C, E, G, C 옥타브
        celebrationNotes.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          }, index * 100);
        });
      }, 1000);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // 정답 체크 함수 - 부분 일치도 허용
  const isAnswerCorrect = (selectedChoice: string, correctAnswer: string): boolean => {
    if (type === 'meaning') {
      const cleanCorrectAnswer = removePOSMarkers(correctAnswer);

      // 선택지가 정답과 정확히 일치하는 경우
      if (selectedChoice === cleanCorrectAnswer) {
        return true;
      }

      // 정답에 선택지가 포함되어 있는 경우 (부분 일치)
      // 1. 숫자와 점으로 분리된 뜻들 중 하나와 일치
      const meanings = cleanCorrectAnswer.split(/\d+\.\s*/).filter(part => part.trim());
      for (const meaningPart of meanings) {
        if (meaningPart.trim() === selectedChoice) {
          return true;
        }
        // 중점(·)으로 연결된 뜻들 중 하나와 일치
        if (meaningPart.includes('·')) {
          const subMeanings = meaningPart.split('·').map(s => s.trim());
          if (subMeanings.includes(selectedChoice)) {
            return true;
          }
        }
      }

      // 전체 정답에서 선택지가 포함되어 있는지 확인
      return cleanCorrectAnswer.includes(selectedChoice);
    }
    return selectedChoice === correctAnswer;
  };
  const handleSubmit = () => {
    if (selectedChoices.length === 0) return;

    // 정규화 함수 - 괄호 제거 + 공백, 특수문자 정규화
    const normalizeChoice = (s: string | undefined | null): string => {
      if (!s) return '';
      return cleanChoiceForDisplay(s).trim().replace(/\s+/g, ' ').toLowerCase();
    };

    // 선택된 항목과 정답 목록 정규화
    const normalizedSelected = selectedChoices.filter(Boolean).map(normalizeChoice).filter(s => s.length > 0);
    const normalizedCorrect = currentCorrectAnswers.filter(Boolean).map(normalizeChoice).filter(s => s.length > 0);
    
    // 유연한 매칭 함수 - 최소 2글자 이상일 때만 substring 매칭
    const matchesAnswer = (a: string, b: string): boolean => {
      if (a === b) return true;
      if (a.length >= 2 && b.length >= 2) {
        if (a.includes(b) || b.includes(a)) return true;
      }
      return false;
    };

    // 방법 1: 정규화된 비교
    const hasAllCorrect = normalizedCorrect.every(answer => 
      normalizedSelected.some(selected => matchesAnswer(selected, answer))
    );
    const hasNoIncorrect = normalizedSelected.every(choice => 
      normalizedCorrect.some(correct => matchesAnswer(choice, correct))
    );
    const normalizedMatch = hasAllCorrect && hasNoIncorrect && normalizedSelected.length === normalizedCorrect.length;

    // 방법 2: 원본 문자열 직접 비교 (fallback - 정규화 과정에서 문제 발생 시)
    const rawSelectedSet = new Set(selectedChoices.map(s => s.trim().toLowerCase()));
    const rawCorrectSet = new Set(currentCorrectAnswers.map(s => s.trim().toLowerCase()));
    const rawMatch = rawSelectedSet.size === rawCorrectSet.size && 
      [...rawSelectedSet].every(s => rawCorrectSet.has(s));

    // 둘 중 하나라도 맞으면 정답 처리
    const correct = normalizedMatch || rawMatch;
    
    console.log('=== handleSubmit DEBUG ===');
    console.log('Selected:', selectedChoices);
    console.log('Correct answers:', currentCorrectAnswers);
    console.log('Normalized selected:', normalizedSelected);
    console.log('Normalized correct:', normalizedCorrect);
    console.log('normalizedMatch:', normalizedMatch, 'rawMatch:', rawMatch, 'correct:', correct);
    
    setIsCorrect(correct);
    setShowResult(true);
    showAnswerToast(correct, currentCorrectAnswers.join(', '));

    // 효과음 재생
    playSound(correct ? 523 : 400, correct ? 0.4 : 0.3, correct ? 'correct' : 'incorrect');

    // 정답일 경우 0.5초 후 자동으로 다음 문제로 이동
    if (correct) {
      const timer = setTimeout(() => {
        handleNextQuestion(correct);
      }, 500);
      setAutoNextTimer(timer);
    }
  };
  const handleNextQuestion = (wasCorrect?: boolean) => {
    // wasCorrect가 전달되면 그 값 사용 (stale closure 방지), 아니면 현재 state 사용
    const answerResult = wasCorrect !== undefined ? wasCorrect : isCorrect;
    
    // 자동 타이머가 있다면 클리어
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      setAutoNextTimer(null);
    }

    // 마지막 문제이고 정답일 경우 박수 효과음 재생
    if (isLastQuestion && answerResult) {
      playApplauseSound();
    }

    // 모든 상태 리셋
    setShowResult(false);
    setSelectedChoices([]);
    setChoices([]);
    setIsCorrect(false);
    setCurrentCorrectAnswers([]);
    setIsLoading(true);

    // 다음 문제로 이동
    onAnswer(answerResult);
  };

  // 뜻에서 하나만 랜덤 선택하는 함수
  const getRandomMeaning = (meaningText: string) => {
    // 숫자와 점으로 시작하는 패턴으로 분리 (예: "1. 계산서", "2. 지폐")
    const meanings = meaningText.split(/\d+\.\s*/).filter(part => part.trim());
    if (meanings.length === 0) {
      return meaningText;
    }

    // 랜덤하게 하나 선택
    const randomIndex = Math.floor(Math.random() * meanings.length);
    return meanings[randomIndex].trim();
  };
  const getChoiceButtonClass = (choice: string) => {
    if (!choice || typeof choice !== 'string') return 'bg-muted/50 text-muted-foreground border-border opacity-60';
    const isSelected = selectedChoices.includes(choice);
    
    // 정답 확인 시 정규화된 비교 수행
    const normalizedChoice = (cleanChoiceForDisplay(choice) || '').trim().toLowerCase();
    const isCorrectAnswer = currentCorrectAnswers.some(correct => {
      if (!correct || typeof correct !== 'string') return false;
      const normalizedCorrect = (cleanChoiceForDisplay(correct) || '').trim().toLowerCase();
      return normalizedChoice === normalizedCorrect || 
             normalizedChoice.includes(normalizedCorrect) || 
             normalizedCorrect.includes(normalizedChoice);
    });
    
    if (!showResult) {
      return isSelected ? 'console-choice-selected' : 'console-choice';
    }
    if (isCorrectAnswer) {
      return 'console-choice-correct';
    }
    if (isSelected && !isCorrectAnswer) {
      return 'console-choice-wrong';
    }
    return 'console-choice-muted';
  };
  return <div className={`min-h-screen flex flex-col console-canvas ${className}`}>
      {/* Top Header Bar - Console */}
      <div className="flex-shrink-0 console-bar border-b px-4 py-2.5 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-2xl mx-auto gap-3">
          {/* Left: Progress */}
          <div className="console-badge">
            <span>{String(currentQuestion).padStart(2, '0')}</span>
            <span className="text-white/35">/</span>
            <span className="text-white/70">{String(totalQuestions).padStart(2, '0')}</span>
          </div>
          
          {/* Center: Word */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1 text-center">
            {type !== 'example' ? (
              <>
                <h2
                  className="w-full font-semibold text-neutral-950 leading-tight tracking-[-0.02em] break-words hyphens-auto"
                  style={{ fontSize: 'clamp(14px, 4.4vw, 21px)' }}
                >
                  {word}
                </h2>
                {usPhonetics && (
                  <span className="max-w-full text-[10px] sm:text-[11px] text-neutral-400 font-mono leading-tight break-all">
                    {loadingPhonetics ? '...' : usPhonetics}
                  </span>
                )}
              </>
            ) : (
              <h2 className="editorial-eyebrow">Sentence Completion</h2>
            )}
          </div>

          
          {/* Right: Actions */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={() => playPronunciation('american')} disabled={isPlayingAudio !== null} className="h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100">
              {isPlayingAudio === 'american' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            {isAdminUser() && (
              <Button variant="ghost" size="icon" onClick={handleRegenerate} disabled={isLoading} className="h-8 w-8 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </div>



      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pt-3 pb-20">
        <div className="editorial-card flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
          
          {/* Example sentence (if type is example) */}
          {type === 'example' && (
            <div className="flex-shrink-0 console-panel px-4 py-3 mb-3">
              <div className="editorial-eyebrow mb-1.5">Context</div>
              <p className="text-[15px] leading-relaxed font-medium text-neutral-900 tracking-tight">
                {blankedExample}
              </p>
            </div>
          )}

          {/* Selection Guide - Console */}
          {!showResult && (
            <div className="flex-shrink-0 mb-3">
              <div className="console-panel">
                <div className="relative px-3.5 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Indicator dot */}
                    <div className={`relative w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isLoading || selectedChoices.length < currentCorrectAnswers.length
                        ? 'bg-amber-500'
                        : 'bg-neutral-900'
                    }`}>
                      {isLoading && <div className="absolute inset-0 rounded-full animate-ping opacity-60 bg-amber-500" />}
                    </div>

                    <p className="text-[12.5px] font-medium tracking-tight text-neutral-600 truncate">
                      {isLoading 
                        ? 'Generating'
                        : type === 'example' 
                          ? '빈칸에 들어갈 단어 선택' 
                          : selectedChoices.length >= currentCorrectAnswers.length 
                            ? '선택 완료' 
                            : '해당하는 뜻을 모두 선택'}
                    </p>
                  </div>
                  
                  {/* Count badge */}
                  <div className={`px-2 py-0.5 rounded-md text-[11px] font-medium tabular-nums flex-shrink-0 border font-mono ${
                    isLoading
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : selectedChoices.length >= currentCorrectAnswers.length 
                        ? 'border-neutral-900 bg-neutral-950 text-white' 
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                  }`}>
                    {isLoading ? '···' : type === 'example' ? '1' : `${selectedChoices.length}/${currentCorrectAnswers.length}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Choices Grid */}
          <div className="flex-1 grid grid-cols-1 gap-2 content-start auto-rows-min overflow-y-auto">
            {isLoading ?
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-white border border-neutral-200 animate-pulse" />
              )) : 

              choices.filter(c => c && typeof c === 'string').map((choice, index) => {
                const normalizedChoice = (cleanChoiceForDisplay(choice) || '').trim().toLowerCase();
                const isCorrectAnswer = currentCorrectAnswers.some(correct => {
                  if (!correct || typeof correct !== 'string') return false;
                  const normalizedCorrect = (cleanChoiceForDisplay(correct) || '').trim().toLowerCase();
                  return normalizedChoice === normalizedCorrect || 
                         normalizedChoice.includes(normalizedCorrect) || 
                         normalizedCorrect.includes(normalizedChoice);
                });
                const isSelected = selectedChoices.includes(choice);
                
                return (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className={`group h-auto min-h-[46px] text-left justify-start pl-2.5 pr-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl ${getChoiceButtonClass(choice)}`} 
                    onClick={() => handleChoiceSelect(choice)} 
                    disabled={showResult}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <div className={`w-6 h-6 rounded-md flex-shrink-0 transition-all duration-200 flex items-center justify-center font-mono text-[10.5px] border ${
                        isSelected 
                          ? 'bg-amber-400 border-amber-400 text-neutral-950' 
                          : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        {isSelected ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : String(index + 1).padStart(2, '0')}
                      </div>
                      <span className="flex-1 text-left leading-tight line-clamp-2 text-[15.5px] tracking-tight">{cleanChoiceForDisplay(choice)}</span>
                      {showResult && isCorrectAnswer && <Check className="w-4 h-4 flex-shrink-0 text-amber-600" />}
                      {showResult && isSelected && !isCorrectAnswer && <X className="w-4 h-4 flex-shrink-0 text-neutral-400" />}
                    </div>
                  </Button>

                );
              })
            }
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      {!showResult && (
        <div className="fixed bottom-0 left-0 right-0 z-40 console-bar border-t shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),0.625rem)] max-w-2xl mx-auto">
            {/* Previous Button */}
            <Button 
              onClick={onSkipPrevious} 
              disabled={!onSkipPrevious || currentQuestion <= 1}
              variant="ghost"
              size="sm" 
              className="h-9 px-3 text-[12px] font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-25 tracking-tight"
            >
              ← 이전
            </Button>

            {/* Center: Submit */}
            <Button 
              onClick={handleSubmit} 
              disabled={selectedChoices.length === 0} 
              size="sm" 
              className="h-10 px-7 text-[13px] font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg shadow-[0_10px_24px_-14px_rgba(15,23,42,0.9)] disabled:opacity-25 disabled:shadow-none tracking-tight"
            >
              정답 확인
            </Button>

            {/* Next Button: 선택이 있으면 채점, 없으면 건너뛰기 */}
            <Button 
              onClick={() => (selectedChoices.length > 0 ? handleSubmit() : onSkipNext?.())} 
              disabled={selectedChoices.length === 0 && !onSkipNext}
              variant="ghost"
              size="sm" 
              className="h-9 px-3 text-[12px] font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-25 tracking-tight"
            >
              다음 →
            </Button>


          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 bg-neutral-950/45 backdrop-blur-md flex items-center justify-center p-4">
          <div className="space-y-3 w-full max-w-md mx-auto">
            <div className="editorial-card p-5 text-left">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${isCorrect ? 'bg-amber-400 border-amber-400 text-neutral-950' : 'bg-white border-neutral-300 text-neutral-500'}`}>
                      {isCorrect ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="editorial-eyebrow">Result</div>
                      <span className="text-[15px] font-semibold tracking-tight text-neutral-950">
                        {isCorrect ? '정답입니다' : '틀렸습니다'}
                      </span>
                    </div>
                  </div>
                  <span className="editorial-qbadge">{String(currentQuestion).padStart(2, '0')}</span>
                </div>
                <div className="editorial-rule mb-4" />
                
                <div className="space-y-2">

                  {/* 문제 단어/뜻 표시 */}
                  <div className="console-panel p-2.5">
                    <div className="editorial-eyebrow mb-1">
                      {type === 'meaning' ? '문제 단어' : '문제 뜻'}
                    </div>
                    <div className="text-[15px] font-semibold tracking-tight text-neutral-950">
                      {type === 'meaning' ? word : removePOSMarkers(meaning)}
                    </div>
                  </div>
                  
                  {/* 선택한 답안 */}
                  <div className="console-panel p-2.5">
                    <div className="editorial-eyebrow mb-1.5 !text-blue-700">선택한 답안</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedChoices.map((choice, index) => {
                        // 정답 확인과 동일한 정규화 로직 사용
                        const normalizedChoice = cleanChoiceForDisplay(choice).trim().replace(/\s+/g, ' ').toLowerCase();
                        const isThisCorrect = currentCorrectAnswers.some(correct => {
                          if (!correct || typeof correct !== 'string') return false;
                          const normalizedCorrect = cleanChoiceForDisplay(correct).trim().replace(/\s+/g, ' ').toLowerCase();
                          return normalizedChoice === normalizedCorrect || 
                                 (normalizedChoice.length > 1 && normalizedChoice.includes(normalizedCorrect)) || 
                                 (normalizedCorrect.length > 1 && normalizedCorrect.includes(normalizedChoice));
                        });
                        return (
                          <div key={index} className={`text-[12px] font-medium px-2 py-0.5 rounded-md border ${isThisCorrect ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
                            {cleanChoiceForDisplay(choice)}
                          </div>
                        );
                      })}
                      {selectedChoices.length === 0 && <div className="text-[12px] text-neutral-400">선택된 답안이 없습니다</div>}
                    </div>
                  </div>

                  {/* 놓친 정답 */}
                  {(() => {
                    // 정답 확인과 동일한 정규화 로직 사용
                    const normalizedSelected = selectedChoices.map(c => cleanChoiceForDisplay(c).trim().replace(/\s+/g, ' ').toLowerCase());
                    const missedAnswers = currentCorrectAnswers.filter(answer => {
                      if (!answer || typeof answer !== 'string') return false;
                      const normalizedAnswer = cleanChoiceForDisplay(answer).trim().replace(/\s+/g, ' ').toLowerCase();
                      // 선택된 답안 중 이 정답과 매칭되는 것이 있는지 확인
                      const isSelected = normalizedSelected.some(selected => 
                        selected === normalizedAnswer || 
                        (selected.length > 1 && selected.includes(normalizedAnswer)) || 
                        (normalizedAnswer.length > 1 && normalizedAnswer.includes(selected))
                      );
                      return !isSelected;
                    });
                    return (
                      <div className="console-panel p-2.5 !border-amber-200 !bg-amber-50/50">
                        <div className="editorial-eyebrow mb-1.5 !text-red-700">놓친 정답</div>
                        <div className="flex flex-wrap gap-1">
                          {missedAnswers.length > 0 ? missedAnswers.map((answer, index) => (
                            <div key={index} className="text-[12px] font-medium bg-white text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                              {cleanChoiceForDisplay(answer)}
                            </div>
                          )) : <div className="text-[12px] text-amber-700">모든 정답을 선택했습니다</div>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleNextQuestion()} className="flex-1 editorial-btn-primary">
                다음 문제
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="editorial-btn-ghost px-4 !text-neutral-500">
                시험중단
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>;
}