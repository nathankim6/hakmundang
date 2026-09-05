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

    const body = await req.json();
    const { wordIds, workbookId, batchSize = 10, startOffset = 0, maxBatches = 20 } = body;
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let wordsToFetch: string[] = [];

    if (workbookId) {
      // Bulk mode: get all headwords without definitions for this workbook
      const { data: headwords, error: hwError } = await supabase
        .from('words')
        .select('id, day_group_id!inner(workbook_id)')
        .eq('day_group_id.workbook_id', workbookId)
        .eq('word_type', '표제어')
        .is('english_definition', null)
        .order('sort_order')
        .range(startOffset, startOffset + batchSize * maxBatches - 1);

      if (hwError) throw new Error(`Failed to fetch headwords: ${hwError.message}`);
      wordsToFetch = (headwords || []).map((w: any) => w.id);
      console.log(`Bulk mode: found ${wordsToFetch.length} headwords without definitions (offset ${startOffset})`);
    } else if (wordIds && Array.isArray(wordIds) && wordIds.length > 0) {
      wordsToFetch = wordIds;
    } else {
      return new Response(
        JSON.stringify({ error: 'wordIds array or workbookId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (wordsToFetch.length === 0) {
      return new Response(
        JSON.stringify({ success: true, updated: 0, message: 'No words need definitions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process in batches of batchSize
    const allResults: any[] = [];
    
    for (let offset = 0; offset < wordsToFetch.length; offset += batchSize) {
      const batchIds = wordsToFetch.slice(offset, offset + batchSize);
      
      // Fetch words from database
      const { data: words, error: fetchError } = await supabase
        .from('words')
        .select('id, word, meaning')
        .in('id', batchIds);

      if (fetchError || !words || words.length === 0) {
        console.error(`Batch at offset ${offset} fetch error:`, fetchError);
        continue;
      }

      console.log(`Batch ${offset / batchSize + 1}: Processing ${words.length} words`);

      const wordsToProcess = words.map((w: any) => ({
        id: w.id, word: w.word, meaning: w.meaning
      }));

      const prompt = `You are an expert English-Korean language teacher specializing in vocabulary education.

For each word below, provide:
1. English Definition: A clear, concise definition in simple English (like from a learner's dictionary). Keep under 30 words.

2. Etymology (어원): 반드시 한글로 작성하세요!
   - 접두사, 어근, 접미사가 있으면 분리해서 설명
   - 💡 이모지와 함께 간단한 암기 팁 추가
   - 40자 이내로 간결하게!

Return a JSON array:
[{"id":"word_id","word":"comfortable","englishDefinition":"Providing physical ease and relaxation.","etymology":"com(함께) + fort(힘) → 편안하게 💡 위로해주는 것!"}]

Words to process:
${JSON.stringify(wordsToProcess, null, 2)}

Return ONLY the JSON array.`;

      // Retry logic
      let response: Response | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: 'You are a vocabulary expert. Return valid JSON with key "words" containing an array. English definitions in English, etymology in Korean.' },
                { role: 'user', content: prompt }
              ],
              max_tokens: 3000,
              temperature: 0.7,
            }),
          });
          if (response.ok) break;
          if (response.status >= 400 && response.status < 500) break;
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 2000));
        } catch (e) {
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 2000));
        }
      }

      if (!response || !response.ok) {
        console.error(`Batch at offset ${offset} failed after retries`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      let jsonStr = content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
      jsonStr = jsonStr
        .replace(/::\s*/g, ': ')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

      let parsed;
      try {
        const obj = JSON.parse(jsonStr);
        parsed = Array.isArray(obj) ? obj : (obj.words || obj.results || Object.values(obj)[0]);
      } catch {
        console.error('JSON parse error for batch at offset', offset);
        continue;
      }

      if (!Array.isArray(parsed)) continue;

      for (const wordData of parsed) {
        const { error: updateError } = await supabase
          .from('words')
          .update({
            english_definition: wordData.englishDefinition,
            etymology: wordData.etymology
          })
          .eq('id', wordData.id);

        if (!updateError) {
          allResults.push(wordData);
        }
      }

      console.log(`Batch done: ${allResults.length} total updated so far`);
    }

    console.log(`Successfully updated ${allResults.length} words total`);

    return new Response(
      JSON.stringify({ success: true, updated: allResults.length, remaining: Math.max(0, wordsToFetch.length - allResults.length) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-word-definitions function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});