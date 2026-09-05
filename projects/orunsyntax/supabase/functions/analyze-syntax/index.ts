
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sentence, translation, answer } = await req.json();

    if (!sentence) {
      console.error('Missing sentence in request');
      return new Response(
        JSON.stringify({ error: 'Sentence is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing sentence:', sentence);
    console.log('Translation:', translation);
    console.log('Answer:', answer);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

const systemPrompt = `당신은 영어 구문 분석 및 문법 오류 교정 전문가입니다. 주어진 영어 문장에는 **문법적 오류가 포함**되어 있습니다. 정답을 참고하여 오류를 분석하고 구문을 설명해주세요.

분석 결과는 다음 형식을 **반드시** 따라 출력해주세요:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【오류 수정】
❌ 오류: [틀린 표현]
✅ 정답: [올바른 표현]

【오답 분석】
(왜 틀렸는지, 왜 정답이 되어야 하는지 구조적/문법적 관점에서 직접 설명 - 템플릿 문구 없이 바로 설명 시작)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【구문 분석】

문장을 의미 단위로 끊어서 슬래시(/)로 구분하고, 각 부분의 한글 해석을 바로 옆에 작성합니다.

① [첫 번째 구문] ([한글 의미])
문법적 역할과 기능 설명
→ 추가 설명이 필요한 경우

② [두 번째 구문] ([한글 의미])
문법적 역할과 기능 설명

(필요한 만큼 계속)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

전체 해석
[자연스럽고 정확한 한글 번역 - 정답을 반영한 올바른 문장 기준]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

중요 지침:
1. 분석은 정답이 반영된 **올바른 문장**을 기준으로 합니다.
2. 오답 분석은 구조적 관점에서 명확하게 설명합니다. "왜 ~가 틀렸는지" 같은 템플릿 문구로 시작하지 말고 바로 내용으로 들어가세요.
3. 전문적이면서도 학생이 이해하기 쉽게 작성합니다.
4. 다른 인사말이나 추가 설명은 포함하지 마세요.`;

    const userPrompt = `다음 영어 문장을 분석해주세요:

📝 원문 (오류 포함): ${sentence}
${translation ? `📖 참고 해석: ${translation}` : ''}
${answer ? `✅ 정답: ${answer}` : ''}

위 정답을 반영하여 오류 수정, 오답 분석, 그리고 구문 분석을 진행해주세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Claude response received');
    
    const analysis = data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.';

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-syntax function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
