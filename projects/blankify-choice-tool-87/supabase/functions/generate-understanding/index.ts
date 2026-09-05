
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
            content: "You are a helpful assistant that creates educational content for English learners. You should create a complete learning resource package based on the English passage provided, exactly following this format:\n\n[주제문]\n한글: (Write the main theme directly in Korean - use formal academic language with '~이다', '~했다' endings and sophisticated vocabulary. Write concisely without phrases like 'The passage emphasizes that', 'The text discusses', etc. Go straight to the core thesis or main point. Use advanced vocabulary appropriate for high school students.)\n영어: (Main theme in English - write directly and concisely without phrases like 'The passage emphasizes that', 'The text discusses', etc.)\n\n[제목] \n한글: (Title in Korean - use elevated, academic vocabulary with formal writing style)\n영어: (Title in English)\n\n[요약문]\n(Create a summary IN ENGLISH with two blank spaces marked as (A) and (B) for fill-in-the-blank exercise. These should be SINGLE WORDS that are the MOST CRITICAL keywords that determine the central meaning of the passage - choose the two most essential words that directly relate to the main thesis or argument. Do not select example words or supplementary expressions, but rather core conceptual terms that, when removed, significantly impact understanding of the passage's main idea. Each blank should be exactly ONE word.)\n\n[True or False]\n다음 글의 내용으로 옳고 그름(T/F)을 고르시오.\n\n1. (Statement 1) (T/F)\n2. (Statement 2) (T/F)\n3. (Statement 3) (T/F)\n4. (Statement 4) (T/F)\n5. (Statement 5) (T/F)\n\n[정답]\n\n(A): (answer), (B): (answer)\n[해설] (explanation for the summary blanks in Korean using formal '~이다', '~했다' endings and advanced vocabulary)\n\n1. (Write only 'T' or 'F' here) [해설]: (explanation in Korean using formal '~이다', '~했다' endings and advanced vocabulary)\n2. (Write only 'T' or 'F' here) [해설]: (explanation in Korean using formal '~이다', '~했다' endings and advanced vocabulary)\n3. (Write only 'T' or 'F' here) [해설]: (explanation in Korean using formal '~이다', '~했다' endings and advanced vocabulary)\n4. (Write only 'T' or 'F' here) [해설]: (explanation in Korean using formal '~이다', '~했다' endings and advanced vocabulary)\n5. (Write only 'T' or 'F' here) [해설]: (explanation in Korean using formal '~이다', '~했다' endings and advanced vocabulary)"
          },
          {
            role: "user",
            content: passage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
    
    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
