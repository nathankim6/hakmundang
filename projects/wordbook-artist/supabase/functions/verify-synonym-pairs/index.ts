import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pairs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return new Response(JSON.stringify({ error: "No pairs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process in batches of 30
    const batchSize = 30;
    const allResults: { index: number; valid: boolean; reason?: string }[] = [];

    for (let i = 0; i < pairs.length; i += batchSize) {
      const batch = pairs.slice(i, i + batchSize);
      const pairDescriptions = batch.map((p: any, idx: number) => {
        const globalIdx = i + idx;
        return `${globalIdx}. ${p.headword}(${p.headwordMeaning}) - ${p.relatedWord}(${p.relatedMeaning}) [${p.relation}]`;
      }).join("\n");

      const prompt = `당신은 영어 어휘 전문가입니다. 아래 단어 쌍들을 검증해주세요.

검증 기준:
1. 품사가 다르면 무조건 invalid입니다 (예: 명사-동사, 형용사-부사, 명사-형용사 등). 이것은 절대적 기준입니다.
2. 동의어 쌍: 품사가 같고, 넓은 의미에서 유사한 개념이면 valid입니다.
3. 반의어 쌍: 품사가 같고, 넓은 의미에서 대조/반대 관계이면 valid입니다. 정확한 반대가 아니어도 대비되거나 반대 방향의 의미가 있으면 valid입니다. 예: withstand(견디다)-postpone(미루다)는 '맞서다 vs 회피하다'로 대비되므로 valid입니다.
4. 접두사/접미사만 공유하고 의미적으로 전혀 관련이 없는 쌍은 invalid입니다 (예: surrender-ultrasound, overflow-overboard).
5. 학습 교재에서 함께 묶여 가르칠 수 있는 관계라면 valid로 판정하세요 (단, 품사가 같아야 함).
6. 반의어 판정 시 관대하게 판단하세요. 두 단어가 어떤 맥락에서든 반대/대비 관계로 해석될 수 있으면 valid입니다.

단어 쌍:
${pairDescriptions}

각 쌍에 대해 valid(유효) 또는 invalid(무효) 판정과 간단한 이유를 제시하세요.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a vocabulary expert. Always respond using the provided tool." },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "verify_pairs",
                description: "Return verification results for word pairs",
                parameters: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "number", description: "The pair index number" },
                          valid: { type: "boolean", description: "Whether the pair is valid" },
                          reason: { type: "string", description: "Brief reason in Korean" },
                        },
                        required: ["index", "valid", "reason"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["results"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "verify_pairs" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await response.text();
        console.error("AI error:", response.status, errText);
        // Fallback: mark all as valid
        for (let idx = i; idx < i + batch.length; idx++) {
          allResults.push({ index: idx, valid: true });
        }
        continue;
      }

      const data = await response.json();
      try {
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        const args = JSON.parse(toolCall.function.arguments);
        if (args.results) {
          allResults.push(...args.results);
        }
      } catch {
        // Fallback
        for (let idx = i; idx < i + batch.length; idx++) {
          allResults.push({ index: idx, valid: true });
        }
      }
    }

    return new Response(JSON.stringify({ results: allResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
