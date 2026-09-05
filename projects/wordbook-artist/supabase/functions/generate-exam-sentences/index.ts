import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type InputWord = { word?: string; meaning?: string };
type SentenceItem = {
  word: string;
  sentence1: string;
  sentence1Korean: string;
  sentence2: string;
  sentence2Korean: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const firstMeaning = (meaning?: string): string => {
  if (!meaning) return "의미";
  return meaning
    .replace(/^\([a-z.]+\)\s*/i, "")
    .split(/[,:;]/)[0]
    .trim() || "의미";
};

const buildFallbackSentences = (words: InputWord[]): SentenceItem[] => {
  return words
    .map((w) => {
      const word = String(w.word ?? "").trim();
      if (!word) return null;
      const m = firstMeaning(w.meaning);

      return {
        word,
        sentence1: `We should ${word} this idea carefully before making a final decision.`,
        sentence1Korean: `최종 결정을 내리기 전에 이 아이디어를 신중하게 ${m}해야 한다.`,
        sentence2: `Her ability to ${word} complex problems impressed the entire class.`,
        sentence2Korean: `복잡한 문제를 ${m}하는 그녀의 능력은 반 전체를 놀라게 했다.`,
      };
    })
    .filter((v): v is SentenceItem => v !== null);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let words: InputWord[] = [];

  try {
    const body = await req.json();
    words = Array.isArray(body?.words) ? body.words : [];

    if (words.length === 0) {
      return new Response(JSON.stringify({ error: "words 배열이 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const wordsText = words
      .map((w: InputWord, i: number) => `${i + 1}. ${String(w.word ?? "")} (${String(w.meaning ?? "")})`)
      .join("\n");

    const systemPrompt = `당신은 고등학교 영어 단어 시험 출제 전문가입니다.
주어진 각 단어에 대해 2개의 영어 예문과 각 예문의 한국어 해석을 작성하세요.

규칙:
- 예문은 고등학교 수준에 맞는 자연스러운 문장
- 각 예문에 해당 단어가 반드시 포함되어야 함
- 예문은 서로 다른 문맥에서 단어를 사용
- 10~20단어 길이의 문장
- 한국어 해석은 자연스럽고 정확한 번역
- 결과를 JSON 배열로 반환`;

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
          { role: "user", content: `다음 단어들의 예문을 각각 2개씩, 한국어 해석과 함께 작성해주세요:\n\n${wordsText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_sentences",
              description: "각 단어에 대한 2개의 예문을 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  sentences: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string", description: "단어" },
                        sentence1: { type: "string", description: "첫 번째 영어 예문" },
                        sentence1Korean: { type: "string", description: "첫 번째 예문의 한국어 해석" },
                        sentence2: { type: "string", description: "두 번째 영어 예문" },
                        sentence2Korean: { type: "string", description: "두 번째 예문의 한국어 해석" },
                      },
                      required: ["word", "sentence1", "sentence1Korean", "sentence2", "sentence2Korean"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["sentences"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_sentences" } },
      }),
    });

    if (!response.ok) {
      const reason = response.status === 402
        ? "insufficient_credits"
        : response.status === 429
        ? "rate_limited"
        : "ai_error";

      const text = await response.text();
      console.error("AI gateway error:", response.status, text);

      return new Response(JSON.stringify({
        sentences: buildFallbackSentences(words),
        fallback: true,
        reason,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let sentences: SentenceItem[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        sentences = Array.isArray(parsed?.sentences) ? parsed.sentences : [];
      } catch (parseError) {
        console.error("Tool arguments parse failed:", parseError);
      }
    }

    if (sentences.length === 0) {
      return new Response(JSON.stringify({
        sentences: buildFallbackSentences(words),
        fallback: true,
        reason: "empty_ai_result",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sentences }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({
      sentences: buildFallbackSentences(words),
      fallback: true,
      reason: "unexpected_error",
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
