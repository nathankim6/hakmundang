import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Relation = "동의" | "반의" | "파생어" | "표현";

interface HeadwordInput {
  index?: number;
  word: string;
  meaning: string;
  day: string;
}

interface DerivativeInput {
  id: string;
  word: string;
  meaning: string;
  currentHeadword: string;
  day: string;
}

interface Assignment {
  derivativeId: string;
  derivativeWord: string;
  correctHeadword: string;
  relation: Relation;
  reason?: string;
}

const normalizeWord = (value: string) => value.toLowerCase().trim();

const tokenizeMeaning = (meaning: string): string[] =>
  meaning
    .split(/[\s,;·ㆍ/()\[\]{}~!?.:+-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

const getSharedTokenCount = (a: string, b: string): number => {
  const aSet = new Set(tokenizeMeaning(a));
  const bSet = new Set(tokenizeMeaning(b));
  let count = 0;
  for (const token of aSet) {
    if (bSet.has(token)) count += 1;
  }
  return count;
};

const getRootOverlapScore = (a: string, b: string): number => {
  const x = normalizeWord(a);
  const y = normalizeWord(b);
  if (!x || !y) return 0;
  if (x === y) return 10;
  if (x.includes(y) || y.includes(x)) return 8;

  let prefix = 0;
  const max = Math.min(x.length, y.length);
  while (prefix < max && x[prefix] === y[prefix]) prefix += 1;
  return prefix >= 4 ? prefix : 0;
};

const classifyRelation = (derivative: DerivativeInput, headword: HeadwordInput): Relation => {
  const derivativeWord = normalizeWord(derivative.word);
  const headwordWord = normalizeWord(headword.word);

  if (derivativeWord.includes(" ")) return "표현";

  const rootScore = getRootOverlapScore(derivative.word, headword.word);
  if (rootScore >= 4) return "파생어";

  const sharedTokens = getSharedTokenCount(derivative.meaning, headword.meaning);
  if (sharedTokens > 0) return "동의";

  return "파생어";
};

const pickBestHeadword = (derivative: DerivativeInput, headwords: HeadwordInput[]): HeadwordInput => {
  let best = headwords[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const hw of headwords) {
    let score = 0;
    if (hw.day === derivative.day) score += 6;

    if (normalizeWord(hw.word) === normalizeWord(derivative.currentHeadword)) score += 2;

    score += getRootOverlapScore(derivative.word, hw.word) * 2;
    score += getSharedTokenCount(derivative.meaning, hw.meaning) * 5;

    if (score > bestScore) {
      bestScore = score;
      best = hw;
    }
  }

  return best;
};

const buildFallbackAssignments = (
  derivatives: DerivativeInput[],
  headwords: HeadwordInput[],
): Assignment[] => {
  return derivatives.map((d) => {
    const dayHeadwords = headwords.filter((h) => h.day === d.day);
    const candidates = dayHeadwords.length > 0 ? dayHeadwords : headwords;
    const best = pickBestHeadword(d, candidates);
    return {
      derivativeId: d.id,
      derivativeWord: d.word,
      correctHeadword: best.word,
      relation: classifyRelation(d, best),
      reason: "AI rate limit fallback (의미/어근 기반)",
    };
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseAssignmentsFromToolCall = (data: any): Assignment[] => {
  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) return [];

  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    const rawAssignments = Array.isArray(parsed?.assignments) ? parsed.assignments : [];
    const allowed = new Set(["동의", "반의", "파생어", "표현"]);

    return rawAssignments
      .filter((a: any) => typeof a?.derivativeId === "string" && typeof a?.correctHeadword === "string")
      .map((a: any) => ({
        derivativeId: a.derivativeId,
        derivativeWord: typeof a.derivativeWord === "string" ? a.derivativeWord : "",
        correctHeadword: a.correctHeadword,
        relation: (allowed.has(a.relation) ? a.relation : "파생어") as Relation,
        reason: typeof a.reason === "string" ? a.reason : undefined,
      }));
  } catch {
    return [];
  }
};

const requestAssignmentsWithRetry = async (
  apiKey: string,
  headwords: HeadwordInput[],
  derivatives: DerivativeInput[],
): Promise<{ assignments: Assignment[]; reason?: string }> => {
  const headwordsList = headwords
    .map((h, i) => `${i + 1}. [${h.day}] ${h.word} (${h.meaning})`)
    .join("\n");

  const derivativesList = derivatives
    .map((d, i) => `${i + 1}. ${d.word} (${d.meaning}) — 현재 위치: [${d.day}] ${d.currentHeadword}`)
    .join("\n");

  const systemPrompt = `당신은 영어 어휘 관계 분석 전문가입니다.

**작업:** 아래 파생어 목록의 각 단어가 어떤 표제어에 소속되어야 하는지 판단하세요.

**핵심 원칙: 반드시 표제어의 한글 의미와 파생어의 한글 의미를 최우선으로 비교하세요.**
1. 한글 뜻이 같거나 유사하면 "동의"
2. 한글 뜻이 반대면 "반의"
3. 어근이 같고 품사/형태 변화면 "파생어"
4. 다단어 표현/숙어면 "표현"
5. 어근/의미가 무관하면 절대 동의/반의로 분류하지 마세요

**중요:** global(세계적인)은 international(국제적인)과 동의 관계이며, encourage(격려하다)와는 무관합니다.`;

  const maxRetries = 3;
  let delay = 800;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 1800,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `## 표제어 목록:\n${headwordsList}\n\n## 파생어 목록 (재배치 대상):\n${derivativesList}\n\n각 파생어를 올바른 표제어에 매칭하고 관계를 분류해주세요.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_assignments",
              description: "각 파생어의 올바른 표제어 매칭과 관계를 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  assignments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        derivativeId: { type: "string", description: "파생어의 id" },
                        derivativeWord: { type: "string", description: "파생어 단어" },
                        correctHeadword: { type: "string", description: "올바른 표제어 단어" },
                        relation: { type: "string", enum: ["동의", "반의", "파생어", "표현"] },
                        reason: { type: "string", description: "판단 근거 (한글 뜻 비교)" },
                      },
                      required: ["derivativeId", "derivativeWord", "correctHeadword", "relation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["assignments"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_assignments" } },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const data = await response.json();
      return { assignments: parseAssignmentsFromToolCall(data) };
    }

    if (response.status === 429) {
      if (attempt < maxRetries - 1) {
        const jitter = Math.floor(Math.random() * 400);
        const waitMs = delay + jitter;
        console.warn(`Rate limited (429). Retrying in ${waitMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitMs);
        delay = Math.min(delay * 2, 4000);
        continue;
      }
      return { assignments: [], reason: "rate_limited" };
    }

    if (response.status === 402) {
      return { assignments: [], reason: "insufficient_credits" };
    }

    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    return { assignments: [], reason: `ai_error_${response.status}` };
  }

  return { assignments: [], reason: "retry_exhausted" };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headwords, derivatives } = await req.json();
    // headwords: [{ index: number, word: string, meaning: string, day: string }]
    // derivatives: [{ id: string, word: string, meaning: string, currentHeadword: string, day: string }]

    if (!Array.isArray(headwords) || !Array.isArray(derivatives) || headwords.length === 0 || derivatives.length === 0) {
      return new Response(JSON.stringify({ error: "headwords와 derivatives 배열이 필요합니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    const typedHeadwords = headwords as HeadwordInput[];
    const typedDerivatives = derivatives as DerivativeInput[];

    const groupedHeadwords = new Map<string, HeadwordInput[]>();
    const groupedDerivatives = new Map<string, DerivativeInput[]>();

    for (const hw of typedHeadwords) {
      const key = hw.day || "";
      if (!groupedHeadwords.has(key)) groupedHeadwords.set(key, []);
      groupedHeadwords.get(key)!.push(hw);
    }

    for (const d of typedDerivatives) {
      const key = d.day || "";
      if (!groupedDerivatives.has(key)) groupedDerivatives.set(key, []);
      groupedDerivatives.get(key)!.push(d);
    }

    const assignments: Assignment[] = [];
    const fallbackReasons = new Set<string>();
    const chunkSize = 12;
    const allowAIForThisRequest = typedDerivatives.length <= 140;
    let aiDisabledForRemainingChunks = !allowAIForThisRequest;

    if (!allowAIForThisRequest) {
      fallbackReasons.add("payload_too_large_fallback");
    }

    for (const [day, dayDerivatives] of groupedDerivatives.entries()) {
      const dayHeadwords = groupedHeadwords.get(day) ?? typedHeadwords;

      for (let i = 0; i < dayDerivatives.length; i += chunkSize) {
        const derivativeChunk = dayDerivatives.slice(i, i + chunkSize);

        let aiAssignments: Assignment[] = [];
        if (!aiDisabledForRemainingChunks) {
          const aiResult = await requestAssignmentsWithRetry(OPENAI_API_KEY, dayHeadwords, derivativeChunk);
          aiAssignments = aiResult.assignments;

          if (aiResult.reason) {
            fallbackReasons.add(aiResult.reason);
            if (aiResult.reason === "rate_limited" || aiResult.reason === "insufficient_credits") {
              aiDisabledForRemainingChunks = true;
              fallbackReasons.add("ai_disabled_after_limit");
            }
          }
        } else {
          fallbackReasons.add("ai_skipped");
        }

        const validHeadwordMap = new Map(dayHeadwords.map((h) => [normalizeWord(h.word), h]));
        const derivativeMap = new Map(derivativeChunk.map((d) => [d.id, d]));
        const accepted = new Map<string, Assignment>();

        for (const item of aiAssignments) {
          const derivative = derivativeMap.get(item.derivativeId);
          if (!derivative) continue;

          const matchedHeadword = validHeadwordMap.get(normalizeWord(item.correctHeadword));
          if (!matchedHeadword) continue;

          accepted.set(item.derivativeId, {
            derivativeId: derivative.id,
            derivativeWord: derivative.word,
            correctHeadword: matchedHeadword.word,
            relation: item.relation,
            reason: item.reason,
          });
        }

        const missing = derivativeChunk.filter((d) => !accepted.has(d.id));
        if (missing.length > 0) {
          fallbackReasons.add("partial_or_empty_ai_result");
          const fallback = buildFallbackAssignments(missing, dayHeadwords);
          fallback.forEach((a) => accepted.set(a.derivativeId, a));
        }

        assignments.push(...Array.from(accepted.values()));
      }
    }

    return new Response(JSON.stringify({
      assignments,
      fallback: fallbackReasons.size > 0,
      reason: fallbackReasons.size > 0 ? Array.from(fallbackReasons).join(",") : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({
      assignments: [],
      fallback: true,
      reason: "internal_error",
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
