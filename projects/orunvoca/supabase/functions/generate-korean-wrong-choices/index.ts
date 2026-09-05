import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 한글이 포함되어 있는지 확인하는 함수
function containsKorean(text: string): boolean {
  return /[가-힣]/.test(text);
}

// 영어만으로 이루어져 있는지 확인하는 함수
function isEnglishOnly(text: string): boolean {
  return /^[a-zA-Z\s]+$/.test(text.trim());
}

// 특수 패턴 감지 함수
function detectPattern(meaning: string): { hasPattern: boolean; patternType: string; patternPrefix: string; patternDescription: string } {
  if (/[A-Z]를/.test(meaning)) {
    const match = meaning.match(/([A-Z])를/);
    return { hasPattern: true, patternType: 'A를', patternPrefix: match ? `${match[1]}를 ` : 'A를 ', patternDescription: 'A를 ~하다 형식' };
  }
  if (/[A-Z]에게/.test(meaning)) {
    const match = meaning.match(/([A-Z])에게/);
    return { hasPattern: true, patternType: 'A에게', patternPrefix: match ? `${match[1]}에게 ` : 'A에게 ', patternDescription: 'A에게 ~하다 형식' };
  }
  if (/[A-Z]의/.test(meaning)) {
    const match = meaning.match(/([A-Z])의/);
    return { hasPattern: true, patternType: 'A의', patternPrefix: match ? `${match[1]}의 ` : 'A의 ', patternDescription: 'A의 ~ 형식' };
  }
  if (/~을/.test(meaning)) {
    return { hasPattern: true, patternType: '~을', patternPrefix: '~을 ', patternDescription: '~을 ~하다 형식' };
  }
  if (/~를/.test(meaning)) {
    return { hasPattern: true, patternType: '~를', patternPrefix: '~를 ', patternDescription: '~를 ~하다 형식' };
  }
  if (/~에/.test(meaning)) {
    return { hasPattern: true, patternType: '~에', patternPrefix: '~에 ', patternDescription: '~에 ~하다 형식' };
  }
  if (/~[와과]/.test(meaning)) {
    const match = meaning.match(/~([와과])/);
    return { hasPattern: true, patternType: '~와', patternPrefix: match ? `~${match[1]} ` : '~와 ', patternDescription: '~와/과 ~하다 형식' };
  }
  if (/~/.test(meaning)) {
    if (/^~/.test(meaning)) {
      return { hasPattern: true, patternType: '~앞', patternPrefix: '~', patternDescription: '~로 시작하는 형식' };
    }
    return { hasPattern: true, patternType: '~중간', patternPrefix: '', patternDescription: '~가 포함된 형식' };
  }
  return { hasPattern: false, patternType: '', patternPrefix: '', patternDescription: '' };
}

// 패턴을 적용하여 선택지 보정
function applyPatternToChoice(choice: string, patternInfo: { hasPattern: boolean; patternType: string; patternPrefix: string }): string {
  if (!patternInfo.hasPattern) return choice;
  
  if (patternInfo.patternType === 'A를' && /[A-Z]를/.test(choice)) return choice;
  if (patternInfo.patternType === 'A에게' && /[A-Z]에게/.test(choice)) return choice;
  if (patternInfo.patternType === 'A의' && /[A-Z]의/.test(choice)) return choice;
  if (patternInfo.patternType === '~을' && /~을/.test(choice)) return choice;
  if (patternInfo.patternType === '~를' && /~를/.test(choice)) return choice;
  if (patternInfo.patternType === '~에' && /~에/.test(choice)) return choice;
  if (patternInfo.patternType === '~와' && /~[와과]/.test(choice)) return choice;
  if ((patternInfo.patternType === '~앞' || patternInfo.patternType === '~중간') && /~/.test(choice)) return choice;
  
  if (patternInfo.patternType === '~을') {
    const cleaned = choice.replace(/^~\s*/, '');
    return '~을 ' + cleaned;
  }
  if (patternInfo.patternType === '~를') {
    const cleaned = choice.replace(/^~\s*/, '');
    return '~를 ' + cleaned;
  }
  if (patternInfo.patternType === '~에') {
    const cleaned = choice.replace(/^~\s*/, '');
    return '~에 ' + cleaned;
  }
  if (patternInfo.patternType === '~와') {
    const cleaned = choice.replace(/^~\s*/, '');
    return patternInfo.patternPrefix + cleaned;
  }
  if (patternInfo.patternType === '~앞') {
    return '~' + choice;
  }
  if (patternInfo.patternType === '~중간') {
    if (choice.endsWith('하다')) {
      return '~을 ' + choice;
    }
    return '~' + choice;
  }
  
  return patternInfo.patternPrefix + choice;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { correctWord, correctMeaning, numberOfChoices = 4 } = await req.json();

    console.log('Generating Korean wrong choices for:', { correctWord, correctMeaning });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const randomSeed = Math.floor(Math.random() * 10000);
    const patternInfo = detectPattern(correctMeaning);
    console.log('Detected pattern:', patternInfo);
    
    const prompt = `당신은 영어 어휘 시험의 **한국어** 오답 선지 전문가입니다.

[절대 규칙]
⚠️ 모든 오답 선지는 반드시 **한국어**로 작성!
⚠️ 영어 단어를 오답으로 사용하면 절대 안 됨!
⚠️ 각 오답은 반드시 **단일 의미**만 포함!

[분석 대상]
영어 단어: "${correctWord}"
한국어 뜻(정답): "${correctMeaning}"

${patternInfo.hasPattern ? `
🚨 [패턴 일치 필수]
정답 "${correctMeaning}"에서 "${patternInfo.patternDescription}" 패턴이 감지됨!
모든 ${numberOfChoices}개의 오답도 반드시 동일한 패턴("${patternInfo.patternPrefix}")을 사용해야 합니다!
` : ''}

[오답 생성 핵심 원칙]

📌 원칙 1 - 동일 품사:
정답과 반드시 같은 품사(명사/동사/형용사/부사)의 한국어 단어를 사용하세요.

📌 원칙 2 - 동일 난이도:
영어 단어 "${correctWord}"의 CEFR 수준에 맞는 한국어 단어를 사용하세요.
- 초등 수준 영단어(cat, run) → 초등 수준 한국어
- 중급 영단어(retrieve, diminish) → 중급 한국어
- 고급 영단어(exacerbate, ubiquitous) → 고급 한국어

📌 원칙 3 - 같은 품사 · 같은 카테고리, 그러나 **의미는 완전히 무관**:
오답은 정답과 **같은 품사**, **같은 의미 카테고리/영역(추상명사·행동동사·사람명사 등)**이어야 하지만,
정답의 뜻과는 **전혀 관련이 없어야** 합니다. 정답과 의미상 거리가 멀수록 좋습니다.

✅ 올바른 예시 (같은 품사·카테고리, 전혀 다른 뜻):
- 정답 "때, 경우"(추상명사) → "규모", "절차", "성향", "명성"
- 정답 "막다"(행동동사) → "헤아리다", "빌려주다", "물려주다", "떠맡다"
- 정답 "거대한"(정도 형용사) → "낯선", "은밀한", "공정한", "성급한"
- 정답 "senior 연장자"(사람명사) → "심판", "후원자", "번역가", "목격자"

❌ 잘못된 예시:
- 카테고리 불일치: 정답 "때, 경우"(추상명사) → "선반", "양동이"
- 의미 근접: 정답 "막다" → "가로막다", "지연시키다"

📌 원칙 4 - "정답으로 인정될 수 있는" 선지 절대 금지 (가장 중요!):
다음에 하나라도 해당하면 절대 사용하지 마세요.
⛔ 정답의 유의어·동의어·상위어·하위어 (예: "때, 경우" → "시기", "순간")
⛔ 정답 뜻과 의미가 일부라도 겹치는 단어 (예: "막다" → "저지하다", "차단하다")
⛔ 영어 단어 "${correctWord}"가 가진 **다른 뜻(다의어의 나머지 의미)** — 사전에 실린 어떤 뜻과도 겹치면 안 됨
⛔ 정답의 반의어 또는 같은 짝을 이루는 개념 (헷갈림 유발)
⛔ 정답과 같은 문맥/상황에서 자연스럽게 쓰이는 단어

✅ 판단 기준: 학생이 사전을 찾아봤을 때 "이것도 ${correctWord}의 뜻이 될 수 있다"고 볼 여지가 **0%**여야 합니다.


[다양성]
⚠️ 아래 단어들은 너무 자주 사용되므로 사용 금지:
"분석하다", "정리하다", "격려하다", "축하하다", "협력하다", "기록하다", "측정하다", "계산하다", "설명하다", "확인하다", "평가하다", "조사하다", "수정하다", "기억하다", "관찰하다"

⚠️ ${numberOfChoices}개의 오답 각각이 서로 다른 의미여야 합니다.
⚠️ 이 단어("${correctWord}" = "${correctMeaning}")에 특화된 오답을 생성하세요.

[응답 형식 - JSON만]
{"detectedPartOfSpeech": "품사", "category": "의미카테고리", "wrongChoices": ["오답1", "오답2", ..., "오답${numberOfChoices}"]}

(시드: ${randomSeed})`;


    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `당신은 영어 어휘 시험 출제 전문가입니다. 각 영어 단어에 맞춤화된 한국어 오답 선지를 생성합니다.

핵심 규칙:
1. 모든 오답은 반드시 한국어
2. 정답과 동일한 품사
3. 정답과 **같은 의미 카테고리/영역**에서 선택 (예: 추상명사→추상명사, 행동동사→행동동사, 사람명사→사람명사)
4. 정답과 비슷한 난이도
5. 의미는 정답과 **전혀 무관**해야 함 — 유의어/동의어/부분적으로 겹치는 뜻/반의어/그 영단어의 다른 사전적 의미는 절대 금지
6. 학생이 "이것도 정답 아닌가?"라고 생각할 여지가 조금이라도 있으면 사용 금지
7. 매번 새롭고 다양한 단어 사용
${patternInfo.hasPattern ? `7. 모든 오답에 "${patternInfo.patternPrefix}" 패턴 필수!` : ''}
8. JSON 형식으로만 응답`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 1.0,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw GPT response:', content);

    let wrongChoices: string[] = [];
    let detectedPartOfSpeech: string = '';
    try {
      const parsed = JSON.parse(content);
      wrongChoices = parsed.wrongChoices || [];
      detectedPartOfSpeech = parsed.detectedPartOfSpeech || '';
    } catch (parseError) {
      console.error('JSON parsing failed, extracting manually:', parseError);
      const matches = content.match(/"([^"]+)"/g);
      if (matches) {
        wrongChoices = matches.map((match: string) => match.replace(/"/g, ''));
      }
    }

    // 영어 오답 필터링
    let koreanOnlyChoices = wrongChoices.filter(choice => {
      const hasKorean = containsKorean(choice);
      const isEnglish = isEnglishOnly(choice);
      if (isEnglish && !hasKorean) {
        console.log('Filtering out English choice:', choice);
        return false;
      }
      return true;
    });

    // 패턴 보정
    if (patternInfo.hasPattern) {
      koreanOnlyChoices = koreanOnlyChoices.map(choice => {
        const corrected = applyPatternToChoice(choice, patternInfo);
        if (corrected !== choice) {
          console.log(`Pattern correction: "${choice}" -> "${corrected}"`);
        }
        return corrected;
      });
    }

    let finalChoices = koreanOnlyChoices;
    
    // 최소 개수 보장 - 부족하면 GPT에 재요청 대신 간단한 fallback
    if (finalChoices.length < numberOfChoices) {
      console.log(`Only got ${finalChoices.length} choices, need ${numberOfChoices}. Adding minimal fallback.`);
      const minimalFallback: Record<string, string[]> = {
        '동사': ['뒤집다', '꿰매다', '절이다', '조각하다', '갈다', '헤엄치다', '짓밟다', '끓이다', '녹이다', '빚다', '깎다', '엮다'],
        '명사': ['선반', '양동이', '등대', '고개', '울타리', '벽돌', '손잡이', '발판', '칼날', '물레', '굴뚝', '바퀴'],
        '형용사': ['축축한', '날카로운', '희미한', '울퉁불퉁한', '뻣뻣한', '미지근한', '텁텁한', '느슨한', '빳빳한', '눅눅한', '꾸덕한', '퍽퍽한'],
        '부사': ['슬며시', '불쑥', '살금살금', '느닷없이', '부랴부랴', '주뼛주뼛', '꼬박꼬박', '더듬더듬', '우물쭈물', '허겁지겁', '질끈', '후다닥'],
      };
      
      const posKey = Object.keys(minimalFallback).find(key => detectedPartOfSpeech.includes(key)) || '명사';
      const pool = [...minimalFallback[posKey]].sort(() => Math.random() - 0.5);
      
      while (finalChoices.length < numberOfChoices && pool.length > 0) {
        const fallback = pool.pop();
        if (fallback && !finalChoices.includes(fallback) && fallback !== correctMeaning && !correctMeaning.includes(fallback)) {
          if (patternInfo.hasPattern) {
            finalChoices.push(applyPatternToChoice(fallback, patternInfo));
          } else {
            finalChoices.push(fallback);
          }
        }
      }
    }

    console.log('Final wrong choices:', finalChoices);

    return new Response(JSON.stringify({ wrongChoices: finalChoices.slice(0, numberOfChoices), detectedPartOfSpeech }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-korean-wrong-choices function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      wrongChoices: ['뒤집다', '선반', '축축한', '슬며시']
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
