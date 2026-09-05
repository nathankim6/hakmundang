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
    const { pairs } = await req.json();

    if (!Array.isArray(pairs) || pairs.length === 0) {
      return new Response(JSON.stringify({ error: "pairs 배열이 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const pairsText = pairs.map((p: any, i: number) => {
      const hwPos = p.headwordPos ? ` [품사: ${p.headwordPos}]` : '';
      const dPos = p.derivativePos ? ` [품사: ${p.derivativePos}]` : '';
      return `${i + 1}. 표제어: ${p.headword}${hwPos} (한글뜻: ${p.headwordMeaning}) → 파생어: ${p.derivative}${dPos} (한글뜻: ${p.derivativeMeaning})`;
    }).join('\n');

    const systemPrompt = `당신은 영어 어휘 관계 분석 전문가입니다.

**핵심 원칙:**
1. 반드시 각 단어의 "한글 뜻"과 "품사"를 함께 고려하여 관계를 판단하세요.
2. **품사가 다르면 동의어/반의어가 될 수 없습니다. 반드시 "파생어"로 분류하세요.**
   - 예: develop(동사, 개발하다) → development(명사, 개발) → 품사가 다르므로 "파생어"
   - 예: object(동사, 반대하다) → objection(명사, 반대) → 품사가 다르므로 "파생어"
   - 예: happy(형용사) → happiness(명사) → 품사가 다르므로 "파생어"
3. **같은 어근에서 접미사(-ful, -less, -ment, -tion, -ness, -ly, -able, -ive, -ous 등)가 붙어 파생된 단어는 품사가 달라지므로 반드시 "파생어"입니다.**
   - 예: mean(동사) → meaningless(형용사) → 파생어 (어근이 같고 -less 접미사로 품사 변경)
   - 예: care(동사/명사) → careful(형용사) → 파생어
   - 예: hope(명사/동사) → hopeless(형용사) → 파생어
4. **품사 정보가 없는 경우, 단어의 형태(접미사)와 한글 뜻의 품사적 특성을 분석하여 품사를 추론하세요.**
   - 한글 뜻이 "~하다"로 끝나면 동사
   - 한글 뜻이 "~한, ~의, ~적인, ~없는, ~있는"으로 끝나면 형용사
   - 한글 뜻이 "~것, ~함, ~성, ~력"으로 끝나면 명사
   - 영어 단어가 -tion, -ment, -ness, -ity로 끝나면 명사
   - 영어 단어가 -ful, -less, -ous, -ive, -able로 끝나면 형용사
   - 영어 단어가 -ly로 끝나면 부사

표제어와 파생어를 다음 중 하나로 분류하세요:

- "동의" : 두 단어의 **추론된 품사가 같고**, 한글 뜻이 같거나 거의 같은 뜻 (예: improve(동사, 향상시키다) ↔ enhance(동사, 향상시키다))
- "반의" : 두 단어의 **추론된 품사가 같고**, 한글 뜻이 정반대 뜻 (예: employ(동사, 고용하다) ↔ dismiss(동사, 해고하다), happy(형용사) ↔ unhappy(형용사))
- "파생어" : 품사가 다른 경우, 같은 어근에서 파생된 경우, 또는 접미사/접두사로 형태가 변한 경우
- "표현" : 구동사나 숙어적 표현 (예: take part in, be aware of)

**판단 기준 (우선순위 순):**
1. 같은 어근 + 접미사/접두사로 형태가 다르고 품사가 다르면 → 무조건 "파생어"
2. 품사가 다르면 → 무조건 "파생어" (동의/반의 불가)
3. 품사가 같고 한글 뜻이 같으면 → "동의"
4. 품사가 같고 한글 뜻이 정반대면 → "반의"
5. 여러 단어로 구성된 표현이면 → "표현"
6. 그 외 → "파생어"
7. **중요: 어근이 같더라도 품사가 다르면 절대 동의/반의가 아닙니다**
8. **중요: 표제어의 뜻이 여러 개(예: "의미하다, 비열한, 수단")인 경우, 한 뜻만 보고 반의어로 판단하지 마세요. 파생 관계를 우선 확인하세요.**`;

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
          { role: "user", content: `다음 표제어-파생어 쌍의 관계를 분석해주세요:\n\n${pairsText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_relations",
              description: "각 쌍의 관계를 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  relations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        headword: { type: "string" },
                        derivative: { type: "string" },
                        relation: { type: "string", enum: ["동의", "반의", "파생어", "표현"] },
                      },
                      required: ["headword", "derivative", "relation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["relations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_relations" } },
      }),
    });

    if (!response.ok) {
      const reason = response.status === 402 ? "insufficient_credits"
        : response.status === 429 ? "rate_limited" : "ai_error";
      console.error("AI gateway error:", response.status);
      
      const fallbackRelations = pairs.map((p: any) => ({
        headword: p.headword,
        derivative: p.derivative,
        relation: "파생어",
      }));
      return new Response(JSON.stringify({ relations: fallbackRelations, fallback: true, reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let relations = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        relations = Array.isArray(parsed?.relations) ? parsed.relations : [];
      } catch {
        console.error("Parse failed");
      }
    }

    if (relations.length === 0) {
      const fallbackRelations = pairs.map((p: any) => ({
        headword: p.headword,
        derivative: p.derivative,
        relation: "파생어",
      }));
      return new Response(JSON.stringify({ relations: fallbackRelations, fallback: true, reason: "empty_result" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ relations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
