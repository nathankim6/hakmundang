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
    const { questions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a prompt describing each question
    const questionsText = questions.map((q: any) => {
      let desc = `문제 ${q.number} (유형: ${q.type}, 정답: ${q.answer}번)\n`;
      desc += `지시문: ${q.instruction.replace(/<[^>]*>/g, '')}\n`;
      if (q.choices) {
        desc += q.choices.map((c: any) => `  ${c.label} ${c.text}`).join('\n') + '\n';
      }
      if (q.sentences) {
        desc += q.sentences.map((s: any) => `  ${s.label} ${s.text.replace(/<[^>]*>/g, '')}`).join('\n') + '\n';
      }
      if (q.sentencePairs) {
        desc += q.sentencePairs.map((sp: any) => `  ${sp.sentence1}\n  ${sp.sentence2}`).join('\n') + '\n';
      }
      return desc;
    }).join('\n---\n');

    const systemPrompt = `당신은 고등학교 영어 단어 시험의 해설을 작성하는 전문 교사입니다.
각 문제에 대해 간결하고 명확한 해설을 한국어로 작성하세요.

규칙:
- 각 문제의 정답이 왜 정답인지 설명
- 오답인 선지가 왜 틀린지 간단히 언급
- 핵심 단어의 뜻을 포함
- 각 해설은 2-3문장으로 간결하게
- JSON 배열로 반환: [{"number": 1, "explanation": "해설..."}, ...]`;

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
          { role: "user", content: `다음 시험 문제들의 해설을 작성해주세요:\n\n${questionsText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_explanations",
              description: "각 문제에 대한 해설을 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  explanations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        number: { type: "number", description: "문제 번호" },
                        explanation: { type: "string", description: "해설 내용 (한국어)" },
                      },
                      required: ["number", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["explanations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_explanations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청 한도 초과, 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 해설 생성 실패" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let explanations = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      explanations = parsed.explanations || [];
    }

    return new Response(JSON.stringify({ explanations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
