import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InputItem = { word: string; meanings: string[] };
type OutItem = { word: string; examples: { meaning: string; english: string; korean: string }[] };

function fallback(items: InputItem[]): OutItem[] {
  return items.map((it) => ({
    word: it.word,
    examples: it.meanings.map((m) => ({
      meaning: m,
      english: `She tried to ${it.word} the situation in a thoughtful way.`,
      korean: `그녀는 그 상황을 사려깊게 ${m}하려고 했다.`,
    })),
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let items: InputItem[] = [];
  try {
    const body = await req.json();
    items = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: "items required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userText = items
      .map((it, i) => `${i + 1}. ${it.word}\n   의미: ${it.meanings.map((m, j) => `(${j + 1}) ${m}`).join("  ")}`)
      .join("\n");

    const systemPrompt = `당신은 고등학교 영어 단어 시험 출제 전문가입니다.
각 단어의 여러 의미(다의어)에 대해, 각 의미별로 1개의 영어 예문과 한국어 해석을 작성하세요.

규칙:
- 각 의미가 명확히 구분되도록, 그 의미의 문맥에 맞는 자연스러운 문장
- 단어가 반드시 문장에 포함될 것 (필요시 활용형 가능)
- 10~18단어 길이
- 한국어 해석은 평서문 종결(~다)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `다음 단어들의 각 의미별 예문을 작성해주세요:\n\n${userText}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_meaning_examples",
            description: "각 단어의 의미별 예문",
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      examples: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            meaning: { type: "string" },
                            english: { type: "string" },
                            korean: { type: "string" },
                          },
                          required: ["meaning", "english", "korean"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["word", "examples"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["results"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_meaning_examples" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ results: fallback(items), fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let results: OutItem[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        results = Array.isArray(parsed?.results) ? parsed.results : [];
      } catch (e) {
        console.error("parse failed", e);
      }
    }
    if (results.length === 0) results = fallback(items);
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("err", e);
    return new Response(JSON.stringify({ results: fallback(items), fallback: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});