import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json; charset=utf-8",
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
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { sentences, accessCode } = body;

    // Require access code for this admin function
    if (!accessCode || typeof accessCode !== 'string' || !(await verifyAccessCode(accessCode))) {
      return new Response(JSON.stringify({ error: 'Valid access code required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!sentences || !Array.isArray(sentences)) {
      throw new Error("sentences array is required");
    }

    if (sentences.length > 100) {
      return new Response(JSON.stringify({ error: 'Too many sentences' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const results = [];
    const batchSize = 10;
    for (let i = 0; i < sentences.length; i += batchSize) {
      const batch = sentences.slice(i, i + batchSize);
      
      const prompt = `You are an English language expert helping Korean students learn sentence structure.

For each English sentence below, analyze it and SELECTIVELY group only certain components into chunks. Most words should remain individual.

Rules:
1. ONLY chunk these specific cases:
   - Articles with their nouns: "the book", "a cat", "an apple"
   - Short preposition phrases (2-3 words max): "at home", "in the morning"
   - Common auxiliary verb phrases: "have been", "will be", "is going to"
   - Compound nouns: "ice cream", "high school"
2. Keep MOST words as individual units - do NOT over-chunk
3. Main verbs, adjectives, adverbs should stay as INDIVIDUAL words
4. Maximum chunk size: 3 words
5. Punctuation stays with the word it's attached to
6. When in doubt, keep words SEPARATE - the goal is to challenge students

Return ONLY a JSON array where each item corresponds to a sentence. Each item should be an object with:
- "original": the original sentence
- "chunks": array of chunks (strings)

Sentences:
${batch.map((s, idx) => `${idx + 1}. "${s}"`).join('\n')}

Return valid JSON only, no markdown.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs valid JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      try {
        const parsed = JSON.parse(content.trim());
        results.push(...parsed);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", content);
        batch.forEach(sentence => {
          results.push({ original: sentence, chunks: sentence.split(/\s+/) });
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-writing-chunks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
