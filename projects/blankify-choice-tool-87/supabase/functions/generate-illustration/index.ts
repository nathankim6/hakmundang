
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { passage, apiKey } = await req.json();
    
    if (!passage) {
      return new Response(
        JSON.stringify({ error: "지문이 누락되었습니다." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API 키가 누락되었습니다." }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("OpenAI에 그림 생성 요청 전송 중");

    // First, analyze the passage to extract the theme and key points
    const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You analyze English passages and identify the main theme and key points. Respond in Korean."
          },
          {
            role: "user",
            content: `다음 영어 지문의 주제와 핵심 내용을 분석해 주세요:\n\n${passage}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const analysisData = await analysisResponse.json();
    
    if (!analysisResponse.ok) {
      console.error("OpenAI 분석 API 오류:", analysisData);
      return new Response(
        JSON.stringify({ error: analysisData.error?.message || "지문 분석 중 오류가 발생했습니다." }),
        { status: analysisResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysis = analysisData.choices[0]?.message?.content;
    
    // Use the analysis to generate an image prompt
    const promptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Create a detailed image prompt for DALL-E based on the theme and key points of a passage. The image should be a simple, cute illustration that symbolizes the main idea, with a horizontal wide format."
          },
          {
            role: "user",
            content: `다음은 영어 지문에 대한 분석입니다. 이 분석을 바탕으로 간단하고 귀여운 그림체의 가로로 긴 삽화를 생성하기 위한 상세한 프롬프트를 작성해 주세요:\n\n${analysis}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const promptData = await promptResponse.json();
    
    if (!promptResponse.ok) {
      console.error("OpenAI 프롬프트 생성 API 오류:", promptData);
      return new Response(
        JSON.stringify({ error: promptData.error?.message || "이미지 프롬프트 생성 중 오류가 발생했습니다." }),
        { status: promptResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imagePrompt = promptData.choices[0]?.message?.content;
    console.log("생성된 이미지 프롬프트:", imagePrompt);

    // Use DALL-E to generate the image
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1792x1024", // Wide format for illustrations
        quality: "standard",
        response_format: "url"
      })
    });

    const imageData = await imageResponse.json();
    
    if (!imageResponse.ok) {
      console.error("DALL-E API 오류:", imageData);
      return new Response(
        JSON.stringify({ error: imageData.error?.message || "이미지 생성 중 오류가 발생했습니다." }),
        { status: imageResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageUrl = imageData.data?.[0]?.url;
    
    return new Response(
      JSON.stringify({ 
        imageUrl,
        prompt: imagePrompt,
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Edge Function 오류:", error);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
