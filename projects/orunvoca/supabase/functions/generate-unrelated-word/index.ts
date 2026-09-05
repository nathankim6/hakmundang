import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, meaning, synonyms = [], antonyms = [] } = await req.json();
    
    if (!word) {
      return new Response(
        JSON.stringify({ error: "Word is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 동의어와 반의어 목록 생성
    const synonymList = synonyms.map((s: any) => typeof s === 'string' ? s : s.word).filter(Boolean).join(', ');
    const antonymList = antonyms.map((a: any) => typeof a === 'string' ? a : a.word).filter(Boolean).join(', ');

    const prompt = `Given the English word "${word}" (meaning: ${meaning || 'unknown'}):
- Synonyms: ${synonymList || 'none provided'}
- Antonyms: ${antonymList || 'none provided'}

Generate ONE English word that:
1. Has the SAME part of speech as "${word}"
2. Belongs to the SAME lexical category/register (abstract noun -> abstract noun, action verb -> action verb, person noun -> person noun, gradable adjective -> gradable adjective)
3. Has SIMILAR difficulty/CEFR vocabulary level as "${word}"
4. Is COMPLETELY UNRELATED in meaning - not a synonym, antonym, hypernym, hyponym, or any semantically/contextually connected word, and must not match any other dictionary sense of "${word}"
5. Is NOT any of these words: ${word}, ${synonymList}, ${antonymList}

Also provide the Korean meaning of this word.

Respond in this exact JSON format only:
{"word": "the_unrelated_word", "meaning": "한국어 뜻"}`;

    // 재시도 로직 포함
    const fetchWithRetry = async (retries = 2): Promise<any> => {
      for (let i = 0; i <= retries; i++) {
        try {
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "You are a vocabulary test designer. Every distractor must share the target word's part of speech, lexical category, and CEFR difficulty level, while being completely unrelated in meaning (no synonyms, antonyms, or contextual associations). Always respond with valid JSON only, no markdown or extra text." },
                { role: "user", content: prompt }
              ],
              temperature: 0.8,
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw { status: 429, message: "Rate limit exceeded" };
            }
            if (response.status >= 500 && i < retries) {
              console.log(`Retry ${i + 1} after server error`);
              await new Promise(r => setTimeout(r, 1000 * (i + 1)));
              continue;
            }
            throw new Error(`AI gateway error: ${response.status}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          if (!content) {
            if (i < retries) {
              console.log(`Retry ${i + 1} - no content in response`);
              await new Promise(r => setTimeout(r, 1000 * (i + 1)));
              continue;
            }
            // 모든 재시도 실패 시 fallback 반환
            return { word: "tangible", meaning: "만질 수 있는" };
          }

          // JSON 파싱
          try {
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanContent);
          } catch (parseError) {
            console.error("Failed to parse response:", content);
            return { word: "tangible", meaning: "만질 수 있는" };
          }
        } catch (err: any) {
          console.error('Error:', err);
          if (i < retries) {
            console.log(`Retry ${i + 1} after error`);
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            continue;
          }
          // 모든 재시도 실패 시 (rate limit 포함) fallback 반환
          return { word: "tangible", meaning: "만질 수 있는" };
        }
      }
      return { word: "tangible", meaning: "만질 수 있는" };
    };

    const result = await fetchWithRetry();

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
