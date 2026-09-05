import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { word } = await req.json();
    if (!word || typeof word !== 'string') {
      return new Response(
        JSON.stringify({ error: 'word is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `너는 영어 단어 학습을 돕는 한국어 사전 어시스턴트야.
- 입력된 영어 단어의 가장 일반적이고 핵심적인 한국어 뜻을 1~6단어로 간결하게 출력해.
- 사전식 어미(하다/되다/이다 등)를 자연스럽게 사용하되, 장문 설명은 금지.
- 가능하면 품사도 함께 간단히 식별해.(예: 동사/명사/형용사/부사)
- 출력은 반드시 JSON으로만 하고, 불필요한 텍스트는 포함하지 마.

출력 형식 예시:
{"meaning": "호소하다; 매력을 주다", "part_of_speech": "동사"}`;

    const userPrompt = `영어 단어: ${word}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 120,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    // JSON 파싱 시도
    let meaning = '';
    let partOfSpeech = '';
    try {
      const parsed = JSON.parse(content);
      meaning = (parsed.meaning || '').toString().trim();
      partOfSpeech = (parsed.part_of_speech || '').toString().trim();
    } catch (_) {
      // 만약 JSON 파싱 실패 시, 따옴표로 감싸진 텍스트에서 의미만 추출 시도
      const m = content.match(/"meaning"\s*:\s*"([^"]+)"/);
      if (m) meaning = m[1];
    }

    if (!meaning) {
      // 최후의 보정: 영어를 그대로 반환하지 않도록 기본 메시지
      meaning = '의미 생성 실패';
    }

    return new Response(
      JSON.stringify({ meaning, part_of_speech: partOfSpeech }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message, meaning: '' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
