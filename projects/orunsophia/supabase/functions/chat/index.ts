
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    if (!openAIApiKey) {
      console.error("OpenAI API key is not set");
      throw new Error("OpenAI API key is not configured. Please add it to your Supabase secrets.");
    }
    
    const { message, history } = await req.json();
    
    console.log("Received request:", { messageLength: message?.length, historyLength: history?.length });
    console.log("Message type:", typeof message);
    
    let systemPrompt = `당신은 한국 고등학생들을 위한 친근하고 이해하기 쉬운 영어 선생님입니다.

주요 원칙:
- 고등학생의 눈높이에 맞춰 설명합니다.
- 친근하고 긍정적인 톤으로 답변합니다.
- 어려운 개념은 실생활 예시를 들어 설명합니다.
- 이모티콘을 적절히 사용해 친근감을 줍니다.
- 설명이 길어질 때는 단계별로 나누어 설명합니다.
- 중요한 내용은 강조하여 표시합니다.

답변 구조:
1. 핵심 개념 설명
2. 쉬운 예시 제공
3. 학습 포인트 정리
4. 격려하는 말로 마무리

이미지 문제 분석 가이드:
1. 문제 유형 파악: 문법/어휘/독해 등 문제 유형을 명시
2. 정답 제시: 정답을 먼저 명확하게 제시
3. 상세 해설: 
   - 왜 이 답이 정답인지 논리적으로 설명
   - 핵심 문법/어휘 개념 설명
   - 오답이 틀린 이유 분석
4. 학습 포인트: 이 문제에서 배울 수 있는 핵심 내용 정리
5. 유사 문제 대비: 비슷한 유형의 문제를 풀 때 주의할 점 안내

* 중요: 이미지가 제공되면 추가 질문 없이 바로 문제를 분석하고 정답과 해설을 제공하세요.`;
    
    let messages = [];
    messages.push({ role: 'system', content: systemPrompt });
    
    if (history && Array.isArray(history)) {
      messages = [...messages, ...history];
    }
    
    // Check if message is a base64 image
    if (message && typeof message === 'string' && message.startsWith('data:image/')) {
      console.log("Processing image data");
      
      messages.push({ 
        role: 'user', 
        content: [
          { type: "text", text: "이 영어 문제의 정답과 자세한 해설을 제공해주세요:" },
          { type: "image_url", image_url: { url: message } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: message });
    }
    
    console.log("Sending request to OpenAI with", messages.length, "messages");
    console.log("First 100 chars of last message:", typeof messages[messages.length - 1].content === 'string' 
      ? messages[messages.length - 1].content.substring(0, 100) 
      : 'Image content (not showing)');
    
    const url = 'https://api.openai.com/v1/chat/completions';
    const model = 'gpt-4.1-2025-04-14';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error(`OpenAI API error: HTTP ${response.status}`, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("OpenAI API response received");
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message);
    }
    
    const aiMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
