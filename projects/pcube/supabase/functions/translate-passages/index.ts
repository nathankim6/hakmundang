import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 5, offset = 0 } = await req.json().catch(() => ({}));

    // Fetch passages without korean_content
    const { data: passages, error: fetchErr } = await supabase
      .from("passages")
      .select("id, title, sentences")
      .or("korean_content.is.null,korean_content.eq.")
      .order("created_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchErr) throw fetchErr;
    if (!passages || passages.length === 0) {
      return new Response(JSON.stringify({ done: true, translated: 0, message: "모든 지문이 이미 번역되었습니다." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let translatedCount = 0;

    for (const passage of passages) {
      const sentences = passage.sentences as string[];
      if (!sentences || sentences.length === 0) continue;

      // Build prompt - send all sentences at once for context
      const numberedSentences = sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a professional English-to-Korean translator for Korean high school English textbooks. 
Rules:
- Translate each numbered English sentence to Korean accurately and naturally.
- Maintain the same numbering. Output ONLY the numbered Korean translations, one per line.
- Translate as literally as possible while keeping natural Korean grammar.
- IMPORTANT: Use formal declarative tone ("~했다", "~이다", "~한다", "~였다") for all sentences UNLESS the sentence is clearly dialogue or a conversational context (e.g. quotes with quotation marks). For dialogue, preserve the conversational tone.
- Do NOT add explanations, notes, or anything else.
- The number of output lines MUST exactly match the number of input sentences.
- Format: "1. 한국어 번역" (one per line)`
            },
            {
              role: "user",
              content: `다음 영어 지문 "${passage.title}"의 문장들을 한국어로 번역해주세요:\n\n${numberedSentences}`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Translation failed for passage ${passage.id}:`, response.status, errText);
        if (response.status === 429) {
          // Rate limited - return partial results
          return new Response(JSON.stringify({
            done: false,
            translated: translatedCount,
            remaining: passages.length - translatedCount,
            nextOffset: offset + translatedCount,
            message: `속도 제한으로 ${translatedCount}개만 번역 완료. 잠시 후 다시 시도해주세요.`,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          // Credits exhausted
          return new Response(JSON.stringify({
            error: "AI 크레딧이 부족합니다. 관리자에게 문의해주세요.",
            done: true,
            translated: translatedCount,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        continue;
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "";

      // Parse numbered lines - extract Korean text after "N. "
      const lines = content.split("\n").filter((l: string) => l.trim());
      const koreanLines: string[] = [];
      
      for (const line of lines) {
        const match = line.match(/^\d+\.\s*(.+)/);
        if (match) {
          koreanLines.push(match[1].trim());
        }
      }

      // Validate count matches
      if (koreanLines.length !== sentences.length) {
        console.warn(`Passage ${passage.id} (${passage.title}): expected ${sentences.length} translations, got ${koreanLines.length}. Padding/trimming.`);
        // Pad with empty strings or trim
        while (koreanLines.length < sentences.length) koreanLines.push("");
        if (koreanLines.length > sentences.length) koreanLines.length = sentences.length;
      }

      const koreanContent = koreanLines.join("\n");

      const { error: updateErr } = await supabase
        .from("passages")
        .update({ korean_content: koreanContent })
        .eq("id", passage.id);

      if (updateErr) {
        console.error(`Update failed for passage ${passage.id}:`, updateErr);
        continue;
      }

      translatedCount++;
      console.log(`Translated: ${passage.title} (${koreanLines.length} sentences)`);
      
      // Small delay between passages to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    // Check if there are more passages to translate
    const { count } = await supabase
      .from("passages")
      .select("id", { count: "exact", head: true })
      .or("korean_content.is.null,korean_content.eq.");

    return new Response(JSON.stringify({
      done: (count || 0) === 0,
      translated: translatedCount,
      remaining: count || 0,
      nextOffset: offset + batchSize,
      message: `${translatedCount}개 지문 번역 완료. 남은 지문: ${count || 0}개`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-passages error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
