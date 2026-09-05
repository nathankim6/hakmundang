import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { passages } = await req.json();
    
    if (!passages || !Array.isArray(passages) || passages.length === 0) {
      return new Response(
        JSON.stringify({ error: "passages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const results = [];

    for (const passage of passages) {
      const { title, content, koreanContent } = passage;
      
      if (!content || content.trim().length === 0) {
        results.push({ title, sentences: [], koreanSentences: [], error: "빈 내용입니다" });
        continue;
      }

      // If Korean content is provided, do 1:1 matching
      const hasKorean = koreanContent && koreanContent.trim().length > 0;

      const systemPrompt = hasKorean
        ? `You are a bilingual sentence matcher for English-Korean language learning. Your task is to:
1. Split the English text into individual sentences
2. Split the Korean text by line breaks (each line = one Korean segment)
3. Match each English sentence with its corresponding Korean line based on meaning
4. CRITICAL: You MUST use the original Korean text EXACTLY as provided. Do NOT paraphrase, translate, or modify any Korean text. Copy it character-for-character.
5. If one Korean line covers multiple English sentences, assign that same Korean line to the first matching English sentence and leave subsequent ones with the nearest unmatched Korean line
6. If multiple Korean lines correspond to one English sentence, merge them with a space
7. Keep abbreviations like "Mr.", "Mrs.", "Dr.", "etc." intact
8. Return a JSON object with two arrays: "english" and "korean", where each index matches 1:1

IMPORTANT RULES:
- The "korean" array values MUST be copied verbatim from the provided Korean text. Never generate new Korean translations.
- The "english" and "korean" arrays MUST have the same length.
- Return ONLY the JSON object, nothing else.`
        : `You are a sentence splitter for English reading passages. Your task is to split the given English text into individual sentences for language learning purposes.

Rules:
1. Split by complete sentences (ending with . ! ?)
2. Keep quotation marks and their punctuation together
3. Keep abbreviations like "Mr.", "Mrs.", "Dr.", "etc." intact (don't split after these)
4. Each sentence should be a meaningful unit for reading practice
5. Remove any extra whitespace
6. Return ONLY a JSON array of strings, nothing else

Example input: "Hello world. How are you? I am fine!"
Example output: ["Hello world.", "How are you?", "I am fine!"]`;

      const userPrompt = hasKorean
        ? `Match the following English sentences with the Korean lines. Use the Korean text EXACTLY as provided - do not modify it.\n\nEnglish text:\n${content}\n\nKorean text (use verbatim):\n${koreanContent}`
        : `Split this English passage into sentences:\n\n${content}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "OpenAI API 요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        results.push({ title, sentences: [], koreanSentences: [], error: "AI 처리 실패" });
        continue;
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "";
      
      try {
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith("```json")) cleanResponse = cleanResponse.slice(7);
        if (cleanResponse.startsWith("```")) cleanResponse = cleanResponse.slice(3);
        if (cleanResponse.endsWith("```")) cleanResponse = cleanResponse.slice(0, -3);
        cleanResponse = cleanResponse.trim();
        
        const parsed = JSON.parse(cleanResponse);

        if (hasKorean && parsed.english && parsed.korean) {
          // 1:1 matched result
          const english = parsed.english.filter((s: string) => typeof s === 'string' && s.trim());
          const korean = parsed.korean.filter((s: string) => typeof s === 'string' && s.trim());
          
          // Ensure same length
          const minLen = Math.min(english.length, korean.length);
          results.push({
            title,
            sentences: english.slice(0, minLen),
            koreanSentences: korean.slice(0, minLen),
          });
        } else if (Array.isArray(parsed)) {
          // English-only result (legacy format)
          results.push({
            title,
            sentences: parsed.filter((s: string) => typeof s === 'string' && s.trim()),
            koreanSentences: [],
          });
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", aiResponse, parseError);
        // Fallback: simple regex split
        const fallbackSentences = content
          .split(/(?<=[.!?])\s+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        
        // Try to split Korean by newlines as fallback
        const fallbackKorean = hasKorean
          ? koreanContent.split("\n").map((s: string) => s.trim()).filter((s: string) => s.length > 0)
          : [];
        
        results.push({ title, sentences: fallbackSentences, koreanSentences: fallbackKorean });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("split-sentences error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
