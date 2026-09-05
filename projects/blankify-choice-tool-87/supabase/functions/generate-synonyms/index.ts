
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
        JSON.stringify({ error: "Missing passage in request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key in request body" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Making request to OpenAI with API key length:", apiKey.length);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are a language education assistant that helps English learners by analyzing passages and extracting important vocabulary words with their synonyms and antonyms. For each passage, extract 12-16 key words and provide EXACTLY 3 synonyms and 3 antonyms for each word. Words must be single words only, not phrases. Provide the Korean translation as single words as well, not phrases. Format the output as a structured JSON for easy table rendering."
          },
          {
            role: "user",
            content: `Please analyze the following English passage and create a table of 12-16 key words with EXACTLY 3 synonyms and 3 antonyms in both English and Korean:

${passage}

Respond with a JSON in this exact format:
{
  "words": [
    {
      "keyword": "magic",
      "keywordKorean": "마법",
      "synonyms": ["sorcery", "wizardry", "enchantment"],
      "synonymsKorean": ["마술", "요술", "주술"],
      "antonyms": ["reality", "truth", "science"],
      "antonymsKorean": ["현실", "진실", "과학"]
    },
    {
      "keyword": "create",
      "keywordKorean": "창조하다",
      "synonyms": ["produce", "generate", "construct"],
      "synonymsKorean": ["생산하다", "발생시키다", "구성하다"],
      "antonyms": ["destroy", "demolish", "ruin"],
      "antonymsKorean": ["파괴하다", "허물다", "망치다"]
    }
  ]
}

IMPORTANT RULES:
1. Make sure each keyword, synonym, and antonym is a SINGLE WORD ONLY, not a phrase.
2. Provide EXACTLY 3 synonyms and 3 antonyms for each word.
3. Provide Korean translations as individual words, not phrases.
4. If a word doesn't have clear synonyms or antonyms, choose the closest possible alternatives.`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return new Response(
        JSON.stringify({ error: data.error?.message || "OpenAI API 호출 중 오류가 발생했습니다." }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data.choices[0]?.message?.content;
    
    try {
      // Parse the result to validate it's proper JSON
      const jsonResult = JSON.parse(result);
      
      return new Response(
        JSON.stringify({ result: jsonResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return new Response(
        JSON.stringify({ error: "응답 형식이 올바르지 않습니다." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
