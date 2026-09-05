import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { correctWord, correctMeaning, partOfSpeech, partsOfSpeech, numberOfChoices = 6 } = await req.json();

    console.log('Received request:', { correctWord, correctMeaning, partsOfSpeech, numberOfChoices });

    if (!correctWord) {
      return new Response(
        JSON.stringify({ error: 'correctWord is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // correctMeaning이 빈 문자열이면 Oxford Dictionary API를 사용해서 의미 가져오기
    let finalCorrectMeaning = correctMeaning;
    if (!correctMeaning || correctMeaning.trim() === '') {
      try {
        // Oxford Dictionary API 호출
        const oxfordResponse = await fetch(`https://jpanpwbdlhsxnyaldddm.supabase.co/functions/v1/oxford-dictionary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word: correctWord })
        });
        
        if (oxfordResponse.ok) {
          const oxfordData = await oxfordResponse.json();
          if (oxfordData.korean_definition) {
            finalCorrectMeaning = oxfordData.korean_definition;
            console.log(`Oxford API를 통해 ${correctWord}의 의미를 가져왔습니다: ${finalCorrectMeaning}`);
          }
        }
      } catch (error) {
        console.error('Oxford API 호출 실패:', error);
      }
      
      // Oxford API도 실패하면 기본 fallback 사용
      if (!finalCorrectMeaning || finalCorrectMeaning.trim() === '') {
        finalCorrectMeaning = '의미';
        console.log(`${correctWord}의 의미를 찾을 수 없어 기본값 사용: ${finalCorrectMeaning}`);
      }
    }

    // 요청된 오답 개수 계산 (기본 6개 선택지에서 정답 제외)
    const wrongChoicesNeeded = Math.max(2, Math.min(9, numberOfChoices - 1)); // 최소 2개, 최대 9개 오답

    const prompt = `당신은 영어 어휘 시험의 한국어 오답 선지 전문가입니다. ${wrongChoicesNeeded}개의 오답 선지를 생성하세요.

[대상] 영어 단어: "${correctWord}" / 정답 뜻: "${finalCorrectMeaning}"

[오답 생성 절대 원칙]
1) 동일 품사: 정답과 정확히 같은 품사(명사/동사/형용사/부사)
2) 동일 카테고리/영역: 정답과 같은 의미 범주(추상명사→추상명사, 행동동사→행동동사, 사람명사→사람명사, 정도 형용사→정도 형용사)
3) 동일 난이도: 영어 단어 "${correctWord}"의 CEFR 수준에 맞는 한국어 어휘 수준
4) 의미는 완전히 무관: 정답 뜻과 의미상 겹치는 부분이 0%여야 함

[절대 금지]
- 유의어/동의어/상위어/하위어/반의어
- 정답 뜻과 일부라도 겹치는 표현
- "${correctWord}"의 다른 사전적 의미(다의어의 나머지 뜻)
- 정답과 같은 문맥/상황에서 자연스럽게 쓰이는 단어

[예시]
- 정답 "때, 경우"(추상명사) → "규모", "절차", "성향", "명성" (O) / "시기", "순간" (X)
- 정답 "막다"(행동동사) → "헤아리다", "빌려주다", "물려주다" (O) / "저지하다", "차단하다" (X)

각 오답은 서로 다른 의미여야 하며, 한국어로만 작성합니다.
JSON 배열로만 응답: ["오답1", "오답2", ...] (총 ${wrongChoicesNeeded}개)`;

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
            content: '당신은 영어 어휘 시험 출제 전문가입니다. 오답 선지는 반드시 (1) 정답과 동일한 품사, (2) 정답과 같은 의미 카테고리/영역, (3) 정답 단어와 비슷한 난이도(CEFR 수준), (4) 정답 뜻과는 전혀 무관한 의미여야 합니다. 유의어·동의어·반의어·부분적으로 겹치는 뜻·그 영단어의 다른 사전적 의미는 절대 금지입니다. 항상 한국어 JSON 배열로만 응답하세요.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,  // 더 일관된 결과를 위해 낮춤
        max_tokens: 400,   // 토큰 수를 줄여서 속도 향상
        top_p: 0.9,        // 응답 품질과 속도의 균형
        frequency_penalty: 0.1,  // 반복 줄이기
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // JSON 배열 파싱 시도
    let wrongChoices: string[];
    try {
      wrongChoices = JSON.parse(generatedContent);
      
      // 배열이 아니거나 요청된 길이와 다른 경우 처리
      if (!Array.isArray(wrongChoices)) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse GPT response:', generatedContent);
      // Fallback: 기본 한국어 오답 선택지 제공  
      wrongChoices = ["선택", "답안", "문제", "단어"];
    }

    return new Response(JSON.stringify({ wrongChoices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-wrong-choices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});