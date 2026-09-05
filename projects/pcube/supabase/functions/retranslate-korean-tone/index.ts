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
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { batchSize = 20, offset = 0 } = await req.json().catch(() => ({}));

    // Fetch writing_sentences that have korean_sentence
    const { data: sentences, error: fetchErr } = await supabase
      .from("writing_sentences")
      .select("id, english_sentence, korean_sentence, passage_id")
      .not("korean_sentence", "is", null)
      .neq("korean_sentence", "")
      .neq("korean_sentence", "—")
      .order("created_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchErr) throw fetchErr;
    if (!sentences || sentences.length === 0) {
      return new Response(JSON.stringify({ done: true, updated: 0, message: "모든 문장 처리 완료." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch all sentences into one AI call for efficiency
    const numberedPairs = sentences.map((s, i) => 
      `${i + 1}. English: ${s.english_sentence}\n   Korean: ${s.korean_sentence}`
    ).join("\n");

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
            content: `You are a Korean translation tone adjuster for high school English textbook materials.

TASK: Convert Korean translations to use formal declarative tone ("~했다", "~이다", "~한다", "~였다", "~되었다") style.

RULES:
- If the English sentence is clearly dialogue (inside quotation marks, or a direct speech), keep the conversational Korean tone as-is.
- For ALL other sentences (narrative, descriptive, explanatory), convert to formal declarative tone.
- Examples of conversion:
  "~합니다" → "~한다", "~했습니다" → "~했다", "~입니다" → "~이다", "~됩니다" → "~된다"
  "~하세요" → "~한다", "~해요" → "~한다", "~거예요" → "~것이다"
  "~할 수 있습니다" → "~할 수 있다", "~해야 합니다" → "~해야 한다"
- Keep the meaning exactly the same. Only change the sentence-ending tone.
- Do NOT change vocabulary or sentence structure.
- Output ONLY the numbered Korean translations, one per line.
- Format: "1. 수정된 한국어" (one per line)
- The number of output lines MUST exactly match the number of input pairs.`
          },
          {
            role: "user",
            content: `다음 한국어 번역들의 어조를 "~했다/~이다" 체로 수정해주세요:\n\n${numberedPairs}`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ done: false, updated: 0, nextOffset: offset, message: "속도 제한. 잠시 후 다시 시도해주세요." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse numbered lines
    const lines = content.split("\n").filter((l: string) => l.trim());
    const koreanLines: string[] = [];
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) koreanLines.push(match[1].trim());
    }

    let updated = 0;
    for (let i = 0; i < Math.min(koreanLines.length, sentences.length); i++) {
      if (koreanLines[i] && koreanLines[i] !== sentences[i].korean_sentence) {
        const { error: updateErr } = await supabase
          .from("writing_sentences")
          .update({ korean_sentence: koreanLines[i] })
          .eq("id", sentences[i].id);

        if (!updateErr) updated++;
        else console.error(`Update failed for ${sentences[i].id}:`, updateErr);
      }
    }

    // Also update passages korean_content for affected passages
    const affectedPassageIds = [...new Set(sentences.map(s => s.passage_id))];
    for (const passageId of affectedPassageIds) {
      const { data: allWs } = await supabase
        .from("writing_sentences")
        .select("korean_sentence, sentence_index")
        .eq("passage_id", passageId)
        .order("sentence_index");

      if (allWs && allWs.length > 0) {
        const koreanContent = allWs.map(w => w.korean_sentence).join("\n");
        await supabase.from("passages").update({ korean_content: koreanContent }).eq("id", passageId);
      }
    }

    // Check remaining
    const { count } = await supabase
      .from("writing_sentences")
      .select("id", { count: "exact", head: true })
      .not("korean_sentence", "is", null)
      .neq("korean_sentence", "")
      .neq("korean_sentence", "—");

    const totalRemaining = (count || 0) - offset - batchSize;

    return new Response(JSON.stringify({
      done: totalRemaining <= 0,
      updated,
      processed: sentences.length,
      nextOffset: offset + batchSize,
      remaining: Math.max(0, totalRemaining),
      message: `${updated}개 문장 어조 수정 완료.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("retranslate-korean-tone error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
