import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests.' }), {
      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { pageImages, questionCount, accessCode, questionMeta } = await req.json();

    if (!accessCode || typeof accessCode !== 'string' || !(await verifyAccessCode(accessCode))) {
      return new Response(JSON.stringify({ error: 'Valid access code required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(pageImages) || pageImages.length === 0) {
      return new Response(JSON.stringify({ error: "PDF 페이지 이미지가 필요합니다." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const metaHint = typeof questionMeta === 'string' && questionMeta.length > 0
      ? `\n\n문항 유형 정보 (번호: 유형):\n${questionMeta}`
      : '';

    const systemPrompt = `너는 학생이 손으로 작성한 영어 레벨테스트 답안지를 읽는 정밀 OCR 채점 보조원이다.
시험은 총 ${questionCount}문항이며 문항 번호는 1부터 ${questionCount}까지다.

규칙:
1. 이 이미지에 보이는 문항만 추출한다. 보이지 않는 문항은 절대 지어내지 마라.
2. 객관식: 학생이 동그라미/체크/색칠한 보기 번호(1~5)를 정수 배열로 반환한다.
3. 주관식(단답형/영작): 학생이 쓴 텍스트를 그대로(철자 포함) 반환한다.
4. 아무것도 쓰지 않은 문항은 결과에서 제외한다.
5. 학생 이름/학교/학년이 보이면 studentInfo로 함께 반환한다.
6. JSON 외의 어떤 텍스트도 출력하지 마라.${metaHint}

출력 형식:
{"studentInfo":{"name":"","school":"","grade":""},"answers":[{"number":1,"type":"multiple","answer":[3]},{"number":2,"type":"subjective","answer":"text"}]}`;

    const merged: Record<string, unknown> = {};
    const studentInfo: { name?: string; school?: string; grade?: string } = {};

    for (let i = 0; i < pageImages.length; i++) {
      const userContent = [
        { type: "text", text: `PDF ${i + 1}/${pageImages.length} 페이지입니다. 이 페이지에 보이는 문항의 학생 답안을 정확히 추출해 JSON으로만 응답하세요.` },
        { type: "image_url", image_url: { url: pageImages[i], detail: "high" } },
      ];

      const MODEL_CANDIDATES = ["gpt-5.1", "gpt-4.1"];
      let response: Response | null = null;
      for (const model of MODEL_CANDIDATES) {
        const isReasoningModel = model.startsWith("gpt-5");
        const payload: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        };
        if (isReasoningModel) payload.reasoning_effort = "high";
        else payload.temperature = 0;

        const attempt = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!attempt.ok && (attempt.status === 400 || attempt.status === 404)) {
          console.error(`Model ${model} unavailable:`, attempt.status, await attempt.text());
          continue;
        }
        response = attempt;
        break;
      }

      if (!response) throw new Error("No usable vision model available");

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
        console.error("AI error:", response.status, errorText);
        throw new Error(`AI error: ${response.status}`);
      }

      const data = await response.json();
      let jsonStr = (data.choices?.[0]?.message?.content || "").trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (_e) {
        console.error("Failed to parse page result", i + 1, jsonStr.slice(0, 300));
        continue;
      }

      const list = Array.isArray(parsed) ? parsed : (parsed.answers || []);
      for (const item of list) {
        const num = Number(item?.number);
        if (!Number.isFinite(num) || num < 1 || num > questionCount) continue;
        const value = item?.answer;
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value) && value.length === 0) continue;
        merged[String(num)] = Array.isArray(value) && value.length === 1 && typeof value[0] === 'number'
          ? value[0]
          : value;
      }

      const info = parsed?.studentInfo;
      if (info) {
        if (!studentInfo.name && info.name) studentInfo.name = String(info.name).trim();
        if (!studentInfo.school && info.school) studentInfo.school = String(info.school).trim();
        if (!studentInfo.grade && info.grade) studentInfo.grade = String(info.grade).trim();
      }
    }

    return new Response(JSON.stringify({ answers: merged, studentInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "답안 인식에 실패했습니다." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});