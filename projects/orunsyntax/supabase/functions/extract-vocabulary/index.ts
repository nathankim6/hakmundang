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
    const { sentences, weekNumber } = await req.json();

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return new Response(JSON.stringify({ error: 'sentences array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Combine sentences into a batch prompt
    const sentenceList = sentences.map((s: { id: number; sentence: string }, i: number) => 
      `${i + 1}. ${s.sentence}`
    ).join('\n');

    const prompt = `From the following English sentences, extract ALL vocabulary words at CEFR B2 level or above. 
For each word, provide:
- word: the base/dictionary form
- pos: part of speech in Korean (명사, 동사, 형용사, 부사, etc.)
- meaning: Korean translation/definition
- sentence_id: which sentence number (1-indexed) it appears in

Return ONLY a JSON array of objects with keys: word, pos, meaning, sentence_id
Remove duplicates (keep first occurrence). Sort by sentence_id.

Sentences:
${sentenceList}

Return valid JSON array only, no markdown, no explanation.`;

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
        system: "You are a vocabulary extraction expert for Korean EFL students. Extract B2+ level words accurately. Return only valid JSON.",
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    // Parse JSON from response
    let vocab = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        vocab = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Failed to parse vocab response:", parseErr);
      console.error("Raw content:", content);
    }

    return new Response(JSON.stringify({ vocabulary: vocab, weekNumber }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("extract-vocabulary error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
