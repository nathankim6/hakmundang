
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { passages, apiKey } = await req.json();

    if (!passages || !Array.isArray(passages) || passages.length === 0) {
      return new Response(
        JSON.stringify({ error: '분석할 지문이 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API 키가 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${passages.length} passages with OpenAI`);
    
    const results = [];
    
    for (const passage of passages) {
      const { englishText, koreanText, passageNumber } = passage;
      
      if (!englishText || !koreanText) {
        console.log(`Skipping passage ${passageNumber} due to missing text`);
        continue;
      }
      
      console.log(`Analyzing passage ${passageNumber}: ${englishText.substring(0, 50)}...`);

      const prompt = `
다음 영어 지문과 한글 번역을 분석해주세요:

영어 지문:
${englishText}

한글 번역:
${koreanText}

다음 형식으로 결과를 JSON 형식으로 반환해주세요:
1. 지문의 주제(theme): 한글로 간결하게 설명해주세요.
2. 문장별 분석(lines): 영어 문장과 해당 한글 번역을 매칭하여 배열로 제공해주세요.
3. 주요 단어 또는 표현(keywords): 지문에서 중요한 영어 단어나 표현 12개를 추출하고, 각각의 한글 의미를 제공해주세요. 의미는 지문에서 사용된 뜻을 우선으로 하되, 의미가 2개 이상인 다의어일 경우 2개의 뜻 모두 적어주세요.

결과는 아래 형식의 valid JSON으로만 제공해주세요. 다른 텍스트는 포함하지 마시고 순수한 JSON만 반환해주세요:
{
  "theme": "지문 주제에 대한 간결한 설명",
  "lines": [
    { "english": "영어 문장 1", "korean": "한글 번역 1" },
    { "english": "영어 문장 2", "korean": "한글 번역 2" }
  ],
  "keywords": [
    { "english": "영어 단어/표현 1", "korean": "한글 의미 1" },
    { "english": "영어 단어/표현 2", "korean": "한글 의미 2" }
  ]
}

절대로 다른 설명이나 텍스트를 추가하지 마세요. 형식에 맞는 유효한 JSON만 반환하세요.
`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert English-Korean translator and text analyzer. Only respond with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', errorData);
          results.push({
            passageNumber,
            error: 'OpenAI API 오류가 발생했습니다.'
          });
          continue;
        }

        const data = await response.json();
        console.log(`OpenAI response received for passage ${passageNumber}`);

        try {
          const content = data.choices[0].message.content;
          // Try to parse the JSON directly
          const analysisResult = JSON.parse(content);
          
          results.push({
            passageNumber,
            ...analysisResult
          });
        } catch (parseError) {
          console.error(`Error parsing OpenAI response for passage ${passageNumber}:`, parseError);
          console.log('Raw content:', data.choices[0].message.content);
          
          // Try to extract JSON with regex as a fallback
          try {
            const content = data.choices[0].message.content;
            // Extract JSON from the response
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*?}/);
            const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
            const analysisResult = JSON.parse(jsonString.trim());
            
            results.push({
              passageNumber,
              ...analysisResult
            });
          } catch (secondParseError) {
            console.error(`Second attempt at parsing failed for passage ${passageNumber}:`, secondParseError);
            results.push({
              passageNumber,
              error: 'OpenAI 응답을 파싱하는 중 오류가 발생했습니다.'
            });
          }
        }
      } catch (openaiError) {
        console.error(`OpenAI API call failed for passage ${passageNumber}:`, openaiError);
        results.push({
          passageNumber,
          error: 'OpenAI API 호출 중 오류가 발생했습니다.'
        });
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-passage function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
