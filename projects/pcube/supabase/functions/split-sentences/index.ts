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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const processPassage = async (passage: any) => {
      const { title, content, koreanContent } = passage;
      
      if (!content || content.trim().length === 0) {
        return { title, sentences: [], koreanSentences: [], error: "빈 내용입니다" };
      }

      const hasKorean = koreanContent && koreanContent.trim().length > 0;

      const systemPrompt = hasKorean
        ? `You are an expert bilingual sentence matcher for English-Korean language learning. Your task is to produce a PERFECT 1:1 match between English and Korean sentences.

CRITICAL RULES:
1. First, split the English text into individual sentences (by . ! ? endings, keeping abbreviations like "Mr.", "Mrs.", "Dr.", "etc.", "U.S.", "No." intact)
2. Then, match EACH English sentence with its corresponding Korean translation
3. The "english" and "korean" arrays MUST have EXACTLY the same length - this is the #1 priority
4. If a Korean translation covers multiple English sentences, split the Korean accordingly
5. If multiple Korean sentences map to one English sentence, merge them into one Korean string
6. If a Korean translation is missing for an English sentence, provide a reasonable translation or use "—"
7. Never skip or drop any English sentence
8. Keep quotation marks and dialogue punctuation together with the sentence they belong to
9. IMPORTANT: Korean translations must use formal declarative tone ("~했다", "~이다", "~한다", "~였다") for all sentences UNLESS the sentence is clearly dialogue or conversational (e.g. inside quotation marks). For dialogue, preserve the conversational tone.

COUNTING CHECK: Before returning, count both arrays. If lengths differ, fix them until they match.

Return ONLY a JSON object: {"english": [...], "korean": [...]}
No markdown, no explanation, just the JSON.`
        : `You are a sentence splitter for English reading passages. Split the given English text into individual sentences.

Rules:
1. Split by sentence-ending punctuation (. ! ?)
2. Keep abbreviations intact: "Mr.", "Mrs.", "Dr.", "etc.", "U.S.", "No."
3. Keep quoted dialogue together with its attribution
4. Each result should be a complete, meaningful sentence
5. Remove extra whitespace

Return ONLY a JSON array of strings. No markdown, no explanation.
Example: "Hello world. How are you?" → ["Hello world.", "How are you?"]`;

      const userPrompt = hasKorean
        ? `Match the following English and Korean sentences 1:1.\n\nEnglish text:\n${content}\n\nKorean text:\n${koreanContent}`
        : `Split this English passage into sentences:\n\n${content}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw { status: 429, message: "API 요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요." };
        }
        if (response.status === 402) {
          throw { status: 402, message: "AI 크레딧이 부족합니다." };
        }
        const errorText = await response.text();
        console.error("Claude API error:", response.status, errorText);
        return { title, sentences: [], koreanSentences: [], error: "AI 처리 실패" };
      }

      const data = await response.json();
      const aiResponse = data.content?.[0]?.text || "";

      const parseJsonFromModel = (raw: string) => {
        let clean = raw.trim();
        if (clean.startsWith("```json")) clean = clean.slice(7);
        if (clean.startsWith("```")) clean = clean.slice(3);
        if (clean.endsWith("```")) clean = clean.slice(0, -3);
        clean = clean.trim();

        try {
          return JSON.parse(clean);
        } catch {
          const firstBrace = clean.indexOf("{");
          const lastBrace = clean.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
          }

          const firstBracket = clean.indexOf("[");
          const lastBracket = clean.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            return JSON.parse(clean.slice(firstBracket, lastBracket + 1));
          }

          throw new Error("No valid JSON found in model response");
        }
      };

      const normalizeToOneToOne = (english: string[], korean: string[]) => {
        const cleanEnglish = english.map((s) => s.trim()).filter((s) => s.length > 0);
        let cleanKorean = korean.map((s) => s.trim()).filter((s) => s.length > 0);

        if (cleanEnglish.length === 0) return { english: [], korean: [] };

        if (cleanKorean.length > cleanEnglish.length) {
          const splitPoint = cleanEnglish.length - 1;
          cleanKorean = [
            ...cleanKorean.slice(0, Math.max(0, splitPoint)),
            cleanKorean.slice(Math.max(0, splitPoint)).join(" ").trim(),
          ];
        }

        if (cleanKorean.length < cleanEnglish.length) {
          cleanKorean = [
            ...cleanKorean,
            ...Array.from({ length: cleanEnglish.length - cleanKorean.length }, () => "—"),
          ];
        }

        return { english: cleanEnglish, korean: cleanKorean.slice(0, cleanEnglish.length) };
      };
      
      try {
        const parsed = parseJsonFromModel(aiResponse);

        if (hasKorean && parsed.english && parsed.korean) {
          const english = Array.isArray(parsed.english) ? parsed.english : [];
          const korean = Array.isArray(parsed.korean) ? parsed.korean : [];
          const normalized = normalizeToOneToOne(english, korean);
          return { title, sentences: normalized.english, koreanSentences: normalized.korean };
        } else if (Array.isArray(parsed)) {
          return { title, sentences: parsed.filter((s: string) => typeof s === "string" && s.trim()), koreanSentences: [] };
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", aiResponse, parseError);

        const fallbackSentences = content
          .split(/(?<=[.!?])\s+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        if (hasKorean) {
          const fallbackKorean = koreanContent
            .split(/(?<=[.!?。！？])\s+|\n+/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
          const normalized = normalizeToOneToOne(fallbackSentences, fallbackKorean);
          return { title, sentences: normalized.english, koreanSentences: normalized.korean };
        } else {
          return { title, sentences: fallbackSentences, koreanSentences: [] };
        }
      }
    };

    // Process all passages in parallel
    const results = await Promise.all(passages.map(processPassage));

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
