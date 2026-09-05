import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, batchIndex } = await req.json();

    if (!pdfText || typeof pdfText !== 'string') {
      return new Response(JSON.stringify({ error: 'pdfText string is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at parsing Korean high school English exam questions.
You will receive raw text extracted from a PDF that contains exam questions in a "좌본우해" (left: English passage, right: Korean translation) format.

Each question typically contains:
- A question prompt (e.g., "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?")
- Year and exam info in brackets like [2015년3월28번53.1%]
- An English passage with numbered options (①②③④⑤)
- Answer choices or options
- The correct answer marked as [정답]
- Korean translation/explanation
- Vocabulary list marked as [단어]
- Error rate percentages for each choice

Extract each question and return a JSON array. Each element should have:
{
  "id": number (sequential, starting from the provided startId),
  "year": string (e.g., "2015"),
  "month": string (e.g., "3월"),
  "questionNumber": string (e.g., "28번"),
  "errorRate": string (e.g., "53.1%"),
  "questionType": string (e.g., "어법", "어휘", "빈칸", "순서", "삽입"),
  "questionPrompt": string (the question instruction in Korean),
  "passage": string (the full English passage, preserving ① ② etc. markers),
  "choices": string[] (array of choice texts, e.g., ["① what → that", "② shown", ...]),
  "answer": string (e.g., "①"),
  "explanation": string (Korean explanation of the answer),
  "translation": string (full Korean translation of the passage),
  "vocabulary": { word: string, meaning: string }[] (vocabulary items)
}

IMPORTANT:
- Extract ALL questions from the text, don't skip any.
- Preserve the ① ② ③ ④ ⑤ markers in passages.
- For 어법 questions, choices should show what's wrong and the correction.
- For 어휘 questions with (A)(B)(C), include the table options as choices.
- For 빈칸/순서/삽입 questions, extract all answer options.
- Return ONLY valid JSON array, no markdown code blocks, no explanation.`;

    const prompt = `Parse the following PDF text and extract all exam questions. Start IDs from ${(batchIndex || 0) * 50 + 1}.

PDF TEXT:
${pdfText}

Return valid JSON array only.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          errorCode: "RATE_LIMITED",
          retryable: true,
        }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          error: "Credits exhausted. Please add credits.",
          errorCode: "CREDITS_EXHAUSTED",
          retryable: false,
        }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: `AI gateway error: ${response.status}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    let questions = [];
    try {
      // Strip markdown code fences if present
      let cleaned = content.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
      // Remove control characters (tabs, etc.) that break JSON.parse, but keep newlines for now
      cleaned = cleaned.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ' ');
      // Also escape unescaped control chars inside JSON string values
      cleaned = cleaned.replace(/\t/g, '\\t');
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Failed to parse questions response:", parseErr);
      console.error("Raw content:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse AI response", rawPreview: content.substring(0, 200) }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Extracted ${questions.length} questions from batch ${batchIndex || 0}`);

    return new Response(JSON.stringify({ questions, batchIndex: batchIndex || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("extract-exam-questions error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
