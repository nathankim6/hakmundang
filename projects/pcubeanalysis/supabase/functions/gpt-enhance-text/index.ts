import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: '텍스트를 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    
    if (type === 'exam-characteristics') {
      systemPrompt = `당신은 영어 학원 강사입니다. 사용자가 입력한 시험 정보만을 바탕으로 전문적인 시험지 분석을 작성해주세요. 

      중요한 제약 사항:
      - 입력되지 않은 내용에 대해서는 절대 추측하거나 임의로 내용을 생성하지 마세요
      - 오직 제공된 정보만을 바탕으로 분석하세요
      - 구체적인 데이터나 세부사항이 없다면 일반적인 표현을 사용하세요

      작성 방식:
      - "이번 시험 분석 결과" 등의 표현으로 시작
      - 입력된 내용을 전문적이고 자연스러운 문체로 다듬어 작성
      - 인사말 없이 줄바꿈 없는 한 문단으로 작성
      - 길이: 250-350자 정도`;
    } else if (type === 'overall-evaluation') {
      systemPrompt = `당신은 영어 학원 강사입니다. 사용자가 입력한 평가 내용만을 바탕으로 전문적인 종합 학습 평가를 작성해주세요.

      중요한 제약 사항:
      - 입력되지 않은 내용에 대해서는 절대 추측하거나 임의로 내용을 생성하지 마세요
      - 오직 제공된 평가 내용만을 바탕으로 분석하세요
      - 구체적인 데이터나 세부사항이 없다면 일반적인 표현을 사용하세요

      작성 방식:
      - "시험 결과 분석에 따르면" 등의 표현으로 시작
      - 입력된 내용을 전문적이고 자연스러운 문체로 다듬어 작성
      - 학부모가 이해하기 쉬운 톤으로 작성
      - 인사말 없이 줄바꿈 없는 한 문단으로 작성
      - 길이: 300-400자 정도`;
    }

    console.log('GPT Enhancement request:', { text, type });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `다음 내용을 바탕으로 학부모님께 드리는 전문적인 분석을 작성해주세요: ${text}` }
        ],
        max_tokens: 800,
      }),
    });

    console.log('AI Gateway response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: '크레딧이 부족합니다.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error response:', errorText);
      throw new Error(`AI Gateway 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;

    console.log('Enhancement success:', { enhancedText });

    return new Response(JSON.stringify({ enhancedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gpt-enhance-text function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
