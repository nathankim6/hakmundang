import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type InputWord = { word?: string; meaning?: string };
type TranslationItem = { word: string; korean: string; english: string };

const firstMeaning = (meaning?: string) =>
  (meaning ?? "")
    .replace(/\s+/g, " ")
    .split(/[;,]/)[0]
    ?.trim() || "의미";

const buildFallbackTranslations = (words: InputWord[], type?: string): TranslationItem[] => {
  if (!words.length) return [];

  return words.map((w, idx) => {
    const word = String(w.word ?? "").trim() || `word_${idx + 1}`;
    const baseMeaning = firstMeaning(w.meaning);
    const other = words[(idx + 1) % words.length];
    const otherMeaning = firstMeaning(other?.meaning);

    if (type === "sentence") {
      return {
        word,
        korean: `${word}의 뜻(${baseMeaning})을 떠올리게 하는 문장입니다.`,
        english: `This sentence actually matches "${otherMeaning}", not "${baseMeaning}".`,
      };
    }

    return {
      word,
      korean: `${word}는 '${baseMeaning}'라는 뜻이다.`,
      english: `${word} means "${otherMeaning}" in this sentence.`,
    };
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let words: InputWord[] = [];
  let type: string | undefined;

  try {
    const payload = await req.json();
    words = Array.isArray(payload?.words) ? payload.words : [];
    type = payload?.type;

    if (!words.length) {
      return new Response(JSON.stringify({ error: "words가 비어 있습니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const wordsText = words.map((w, i) => `${i + 1}. ${w.word} (${w.meaning})`).join("\n");

    const systemPrompt = type === "sentence"
      ? `당신은 고등학교 영어 시험 출제 전문가입니다.
주어진 각 단어에 대해 한국어 문장과 그에 대한 "의도적으로 틀린" 영어 번역을 만들어주세요.

규칙:
- 한국어 문장은 해당 단어의 뜻을 활용한 자연스러운 문장 (10~20단어)
- 영어 번역에서 핵심 단어를 비슷하지만 의미가 다른 단어로 바꿔서 오역을 만드세요
- 예: "discretion(분별력)"을 "discrimination(차별)"로, "vessel(선박)"을 "vassal(가신)"로
- 문법적으로는 맞지만 의미적으로 틀린 번역이어야 합니다
- JSON으로 반환`
      : `당신은 고등학교 영어 시험 출제 전문가입니다.
주어진 각 단어에 대해 한국어 의미와 그에 맞는 "의도적으로 틀린" 영어 예문을 만들어주세요.

규칙:
- 한국어는 해당 단어와 관련된 자연스러운 한국어 문장
- 영어 예문에서 핵심 단어를 비슷하지만 의미가 다른 단어로 교체하세요
- 문법은 맞지만 한국어와 의미가 일치하지 않아야 합니다
- JSON으로 반환`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `다음 단어들에 대해 틀린 번역을 생성해주세요:\n\n${wordsText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_wrong_translations",
              description: "각 단어에 대한 틀린 번역을 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  translations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string", description: "원래 단어" },
                        korean: { type: "string", description: "한국어 문장" },
                        english: { type: "string", description: "의도적으로 틀린 영어 번역" },
                      },
                      required: ["word", "korean", "english"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["translations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_wrong_translations" } },
      }),
    });

    if (!response.ok) {
      const fallbackTranslations = buildFallbackTranslations(words, type);

      if (response.status === 429 || response.status === 402) {
        const reason = response.status === 402 ? "insufficient_credits" : "rate_limited";
        return new Response(JSON.stringify({
          translations: fallbackTranslations,
          fallback: true,
          reason,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({
        translations: fallbackTranslations,
        fallback: true,
        reason: "ai_error",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let translations: TranslationItem[] = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      translations = parsed.translations || [];
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);

    if (words.length) {
      return new Response(JSON.stringify({
        translations: buildFallbackTranslations(words, type),
        fallback: true,
        reason: "unexpected_error",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
