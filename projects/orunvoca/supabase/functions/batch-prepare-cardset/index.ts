import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WordItem {
  word: string;
  meaning: string;
  example: string;
}

const cleanWord = (w: unknown) =>
  String(w ?? "")
    .replace(/^Day\s*\d+\s*/i, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();

// 괄호 안 쉼표를 무시하고 뜻을 분리
const splitMeanings = (meaning: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of meaning) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === ";") && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.length ? out.slice(0, 4) : [meaning.trim()];
};

const extractWords = (wordData: unknown): WordItem[] => {
  const raw = Array.isArray(wordData) ? wordData : [];
  const seen = new Set<string>();
  const items: WordItem[] = [];
  for (const entry of raw as any[]) {
    const word = cleanWord(entry?.word);
    const meaning = String(entry?.meaning ?? "").trim();
    if (!word || !/[a-zA-Z]/.test(word) || !meaning) continue;
    if (/day/i.test(meaning) && meaning.length < 10) continue;
    const key = `${word.toLowerCase()}|${meaning}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ word, meaning, example: String(entry?.example ?? "").trim() });
  }
  return items;
};

const callFunction = async (name: string, body: unknown) => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(data?.error || `${name} failed (${res.status})`);
  return data;
};

const runPool = async <T,>(items: T[], limit: number, fn: (item: T) => Promise<void>) => {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      try {
        await fn(current);
      } catch (e) {
        console.error("pool item failed:", (e as Error).message);
      }
    }
  });
  await Promise.all(workers);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const {
      cardSetId,
      action = "status",
      target = "both", // 'choices' | 'images' | 'both'
      batchSize = 12,
      autoChain = false,
    } = await req.json();

    if (!cardSetId) {
      return new Response(JSON.stringify({ error: "cardSetId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: cardSet, error: setError } = await supabase
      .from("card_sets")
      .select("id, title, word_data")
      .eq("id", cardSetId)
      .maybeSingle();

    if (setError) throw new Error(setError.message);
    if (!cardSet) throw new Error("Card set not found");

    const words = extractWords(cardSet.word_data);

    // ---- 이미 생성된 항목 조회 ----
    const cachedKeys = new Set<string>();
    for (let i = 0; i < words.length; i += 200) {
      const chunk = words.slice(i, i + 200).map((w) => w.word);
      const { data } = await supabase
        .from("word_quiz_cache")
        .select("word, meaning")
        .eq("quiz_type", "meaning")
        .in("word", chunk);
      (data || []).forEach((row: any) =>
        cachedKeys.add(`${String(row.word).toLowerCase()}|${String(row.meaning).trim()}`)
      );
    }

    const imagedWords = new Set<string>();
    const { data: imageRows } = await supabase
      .from("word_images")
      .select("word")
      .eq("card_set_id", cardSetId);
    (imageRows || []).forEach((row: any) => imagedWords.add(String(row.word).toLowerCase()));

    const pendingChoices = words.filter(
      (w) => !cachedKeys.has(`${w.word.toLowerCase()}|${w.meaning}`)
    );
    const pendingImages = words.filter((w) => !imagedWords.has(w.word.toLowerCase()));

    const buildStatus = () => ({
      cardSetId,
      title: cardSet.title,
      totalWords: words.length,
      choices: {
        done: words.length - pendingChoices.length,
        remaining: pendingChoices.length,
      },
      images: {
        done: words.length - pendingImages.length,
        remaining: pendingImages.length,
      },
    });

    if (action === "status") {
      return new Response(JSON.stringify(buildStatus()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- process ----
    const wantChoices = target === "choices" || target === "both";
    const wantImages = target === "images" || target === "both";

    let choiceSuccess = 0;
    let imageSuccess = 0;
    let failures = 0;

    const choiceBatch = wantChoices ? pendingChoices.slice(0, batchSize) : [];
    const imageBatch = wantImages ? pendingImages.slice(0, Math.max(1, Math.ceil(batchSize / 2))) : [];

    if (choiceBatch.length) {
      await runPool(choiceBatch, 4, async (item) => {
        try {
          const result = await callFunction("generate-wrong-choices", {
            correctWord: item.word,
            correctMeaning: item.meaning,
            numberOfChoices: 10,
          });
          const wrongChoices: string[] = Array.isArray(result?.wrongChoices)
            ? result.wrongChoices.filter((c: unknown) => typeof c === "string" && c.trim())
            : [];
          if (!wrongChoices.length) throw new Error("no wrong choices");

          const correctAnswers = splitMeanings(item.meaning);
          const { error } = await supabase.from("word_quiz_cache").upsert(
            {
              word: item.word,
              meaning: item.meaning,
              english_definition: item.meaning,
              part_of_speech: "",
              quiz_type: "meaning",
              wrong_choices: wrongChoices,
              choices: [...correctAnswers, ...wrongChoices],
              correct_answers: correctAnswers,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "word,meaning,quiz_type" }
          );
          if (error) throw new Error(error.message);
          choiceSuccess++;
        } catch (e) {
          failures++;
          console.error(`choices failed for ${item.word}:`, (e as Error).message);
        }
      });
    }

    if (imageBatch.length) {
      await runPool(imageBatch, 2, async (item) => {
        try {
          const example =
            item.example || `The word ${item.word} means ${item.meaning}.`;
          const result = await callFunction("generate-word-image", {
            word: item.word,
            example,
            cardSetId,
          });
          if (result?.imageUrl) imageSuccess++;
          else failures++;
        } catch (e) {
          failures++;
          console.error(`image failed for ${item.word}:`, (e as Error).message);
        }
      });
    }

    const remainingChoices = wantChoices
      ? Math.max(0, pendingChoices.length - choiceSuccess)
      : 0;
    const remainingImages = wantImages
      ? Math.max(0, pendingImages.length - imageSuccess)
      : 0;
    const remaining = remainingChoices + remainingImages;
    const processed = choiceBatch.length + imageBatch.length;
    const done = processed === 0 || remaining === 0;

    if (autoChain && !done && processed > 0 && (choiceSuccess > 0 || imageSuccess > 0)) {
      const chain = fetch(`${SUPABASE_URL}/functions/v1/batch-prepare-cardset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ cardSetId, action: "process", target, batchSize, autoChain: true }),
      }).catch((e) => console.error("chain failed:", e.message));
      // @ts-ignore EdgeRuntime is available in Supabase runtime
      if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(chain);
    }

    return new Response(
      JSON.stringify({
        ...buildStatus(),
        processed,
        choiceSuccess,
        imageSuccess,
        failures,
        remainingChoices,
        remainingImages,
        remaining,
        done,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("batch-prepare-cardset error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
