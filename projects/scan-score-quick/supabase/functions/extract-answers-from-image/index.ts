import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

async function verifyAccessCode(accessCode: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from('access_codes')
    .select('code, expiry_date')
    .eq('code', accessCode)
    .single();

  if (error || !data) return false;
  return new Date(data.expiry_date) > new Date();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apikey = req.headers.get("apikey");
  if (!apikey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { imageBase64, questionCount, accessCode } = body;

    // Require access code for this admin function
    if (!accessCode || typeof accessCode !== 'string' || !(await verifyAccessCode(accessCode))) {
      return new Response(JSON.stringify({ error: 'Valid access code required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "이미지가 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are a precise answer sheet reader. Your job is to extract answers from test answer sheet images with 100% accuracy.

The test has exactly ${questionCount} questions numbered 1 to ${questionCount}.

CRITICAL RULES:
1. Look at each question number carefully and match the answer to the EXACT question number.
2. For multiple choice questions (객관식): the answer options are numbered 1 through 5. Look for circled, checked, or marked numbers. Return them as an array of integers.
3. For subjective/written questions (주관식): read the handwritten or printed text answer carefully. Return the exact text.
4. If multiple options are marked for a single question, include ALL marked options in the array.
5. If NO answer is marked for a question, return {"type": "multiple", "answer": []}.
6. Double-check every answer before responding. Accuracy is critical.
7. You MUST return answers for ALL ${questionCount} questions, from number 1 to ${questionCount}.

Output format - return ONLY a JSON array, no other text:
[
  { "number": 1, "type": "multiple", "answer": [3] },
  { "number": 2, "type": "multiple", "answer": [1, 4] },
  { "number": 3, "type": "subjective", "answer": "정답텍스트" }
]`
          },
          {
            role: "user",
            content: [
              { type: "text", text: `이 이미지는 ${questionCount}문항 시험의 정답지입니다. 각 문항의 정답을 정확하게 추출해주세요. 객관식은 마킹된 번호를, 주관식은 적힌 텍스트를 읽어주세요. 반드시 1번부터 ${questionCount}번까지 모든 문항을 포함해야 합니다. JSON 배열로만 응답해주세요.` },
              { type: "image_url", image_url: { url: imageBase64, detail: "high" } }
            ]
          }
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    const answers = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ answers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "정답 추출에 실패했습니다." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
