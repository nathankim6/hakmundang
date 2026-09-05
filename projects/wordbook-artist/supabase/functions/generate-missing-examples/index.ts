import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — skip if no Bearer token (internal/service calls)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const { wordIds } = await req.json();

    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Word IDs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: words, error: fetchError } = await supabase
      .from('words')
      .select('id, word, meaning')
      .in('id', wordIds);

    if (fetchError) throw new Error(`Failed to fetch words: ${fetchError.message}`);
    if (!words || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No words found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating examples for ${words.length} words`);

    const prompt = `You are an expert English-Korean vocabulary teacher.

For each word below, create ONE natural example sentence that clearly demonstrates the word's meaning. Include a Korean translation.

Words:
${words.map((w: any) => `- ${w.word} (${w.meaning})`).join('\n')}

Return a JSON array:
[
  {
    "id": "word_id",
    "word": "example",
    "english": "This is an example sentence.",
    "korean": "이것은 예문입니다."
  }
]

IDs to use: ${JSON.stringify(words.map((w: any) => ({ id: w.id, word: w.word })))}

Return ONLY the JSON array.`;

    let response: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a vocabulary expert. Respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 3000,
            temperature: 0.7,
          }),
        });
        if (response.ok) break;
        if (response.status >= 400 && response.status < 500) throw new Error(`API error: ${response.status}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 2000));
      } catch (e) {
        if (attempt === 3) throw e;
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }

    if (!response || !response.ok) throw new Error('OpenAI API failed after retries');

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content in AI response');

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    const parsed = JSON.parse(jsonStr);
    let inserted = 0;

    for (const item of parsed) {
      const { error } = await supabase
        .from('word_examples')
        .insert({
          word_id: item.id,
          english: item.english,
          korean: item.korean,
          sort_order: 0
        });

      if (error) {
        console.error(`Failed to insert example for ${item.word}:`, error);
      } else {
        inserted++;
        console.log(`Added example for: ${item.word}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted, total: parsed.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
