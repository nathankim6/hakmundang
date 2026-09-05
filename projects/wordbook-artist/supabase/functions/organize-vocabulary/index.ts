import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens = 4000): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenAI error:', response.status, errText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseJSON(content: string): any {
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();
  
  // Sanitize common AI JSON formatting errors
  jsonStr = jsonStr
    .replace(/:\s*:/g, ':')                          // double colons
    .replace(/,\s*}/g, '}')                          // trailing commas in objects
    .replace(/,\s*]/g, ']')                          // trailing commas in arrays
    .replace(/[\u201C\u201D]/g, '"')                 // smart quotes
    .replace(/[\u2018\u2019]/g, "'")                 // smart single quotes
    .replace(/(?<=:\s*"[^"]*)\n([^"]*")/g, ' $1')   // newlines inside strings
    .replace(/\t/g, ' ');                            // tabs to spaces
  
  try {
    return JSON.parse(jsonStr);
  } catch (_firstError) {
    // Try extracting just the array portion
    const arrayMatch = jsonStr.match(/\[[\s\S]*/);
    if (arrayMatch) {
      let arr = arrayMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      try { return JSON.parse(arr); } catch (_) {}
      
      // Handle truncated JSON: find last complete object and close the array
      const lastCompleteObj = arr.lastIndexOf('}');
      if (lastCompleteObj > 0) {
        const truncated = arr.substring(0, lastCompleteObj + 1).replace(/,\s*$/, '') + ']';
        try {
          const result = JSON.parse(truncated);
          console.log(`Recovered ${result.length} items from truncated JSON`);
          return result;
        } catch (_) {}
      }
    }
    console.error('JSON parse failed, raw content (first 500 chars):', jsonStr.substring(0, 500));
    throw _firstError;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, text, words, organizedWords } = await req.json();

    if (action === 'extract') {
      // Extract word-meaning pairs from raw PDF text
      const systemPrompt = `You are an expert at extracting English vocabulary from Korean-English vocabulary lists.
Extract ALL English word and Korean meaning pairs from the given text.
The text comes from PDF vocabulary books. Words may be in various formats:
- "word 뜻" or "word - 뜻" or tabular format
- Ignore page numbers, headers, footers, and non-vocabulary content
- Include ALL words you find, even partial or unclear ones

Return a JSON object: {"words": [{"word": "example", "meaning": "예시"}]}
Return ONLY the JSON object, nothing else.`;

      const content = await callOpenAI(systemPrompt, text, 16000);
      const parsed = parseJSON(content);
      const extracted = parsed.words || parsed;

      console.log(`Extracted ${extracted.length} words from text chunk`);
      
      return new Response(
        JSON.stringify({ words: extracted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'organize') {
      // Deduplicate, identify derivatives, assign CEFR levels
      const wordList = words.map((w: any) => `${w.word} - ${w.meaning}`).join('\n');
      
      const systemPrompt = `You are an expert English linguist specializing in CEFR levels and word families.

Given a list of English words with Korean meanings:
1. REMOVE exact duplicates (keep one)
2. Assign CEFR level (A1, A2, B1, B2, C1, C2) to each word
3. Identify derivative/word family groups (e.g., "act", "action", "active", "activate" belong together)
   - Use the ROOT word as the derivativeGroup name
4. Keep the Korean meaning as-is

Return JSON object sorted by CEFR level (A1 first, C2 last):
{"words": [{"word": "act", "meaning": "행동하다", "cefrLevel": "A2", "derivativeGroup": "act"}]}

IMPORTANT: Return ONLY valid JSON object.`;

      const content = await callOpenAI(systemPrompt, wordList, 16000);
      const parsed = parseJSON(content);
      const organized = parsed.words || parsed;
      
      console.log(`Organized ${organized.length} words`);
      
      return new Response(
        JSON.stringify({ organizedWords: organized }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'arrange') {
      // Final deduplication across all batches
      const seen = new Map<string, any>();
      for (const w of organizedWords) {
        const key = w.word.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, w);
        }
      }
      
      const uniqueWords = Array.from(seen.values());
      
      // Sort: primary by CEFR level, secondary keep derivatives together
      const cefrOrder: Record<string, number> = { 'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3, 'C1': 4, 'C2': 5 };
      
      // Define 4 difficulty sections with CEFR mapping
      const sections = [
        { name: '중등실력', levels: ['A1', 'A2'], prefix: 'A' },
        { name: '고등기본', levels: ['B1'], prefix: 'B' },
        { name: '고등필수', levels: ['B2'], prefix: 'C' },
        { name: '고난도', levels: ['C1', 'C2'], prefix: 'D' },
      ];
      
      const days: { day: string; words: { word: string; meaning: string }[] }[] = [];
      
      for (const section of sections) {
        // Filter words for this section
        const sectionWords = uniqueWords.filter(w => section.levels.includes(w.cefrLevel));
        if (sectionWords.length === 0) continue;
        
        // Group by derivative group, then sort groups by CEFR
        const derivativeGroups = new Map<string, any[]>();
        for (const w of sectionWords) {
          const group = w.derivativeGroup || w.word;
          if (!derivativeGroups.has(group)) derivativeGroups.set(group, []);
          derivativeGroups.get(group)!.push(w);
        }
        
        for (const [, groupWords] of derivativeGroups) {
          groupWords.sort((a: any, b: any) => (cefrOrder[a.cefrLevel] || 0) - (cefrOrder[b.cefrLevel] || 0));
        }
        
        const sortedGroups = Array.from(derivativeGroups.entries()).sort((a, b) => {
          const aLevel = cefrOrder[a[1][0].cefrLevel] || 0;
          const bLevel = cefrOrder[b[1][0].cefrLevel] || 0;
          return aLevel - bLevel;
        });
        
        // Flatten
        const sortedWords: any[] = [];
        for (const [, groupWords] of sortedGroups) sortedWords.push(...groupWords);
        
        // Arrange into DAY groups of ~40 words within this section
        let currentDay: { word: string; meaning: string }[] = [];
        let dayNum = days.length + 1;
        let i = 0;
        
        while (i < sortedWords.length) {
          const w = sortedWords[i];
          const group = w.derivativeGroup || w.word;
          
          const groupWords: any[] = [w];
          let j = i + 1;
          while (j < sortedWords.length && (sortedWords[j].derivativeGroup || sortedWords[j].word) === group) {
            groupWords.push(sortedWords[j]);
            j++;
          }
          
          if (currentDay.length + groupWords.length > 45 && currentDay.length >= 35) {
            days.push({ day: `[${section.name}] DAY ${String(dayNum).padStart(2, '0')}`, words: currentDay });
            currentDay = [];
            dayNum = days.length + 1;
          }
          
          for (const gw of groupWords) {
            currentDay.push({ word: gw.word, meaning: gw.meaning });
          }
          i = j;
          
          if (currentDay.length >= 40) {
            const nextGroup = i < sortedWords.length ? (sortedWords[i].derivativeGroup || sortedWords[i].word) : null;
            if (nextGroup !== group || currentDay.length >= 45) {
              days.push({ day: `[${section.name}] DAY ${String(dayNum).padStart(2, '0')}`, words: currentDay });
              currentDay = [];
              dayNum = days.length + 1;
            }
          }
        }
        
        if (currentDay.length > 0) {
          days.push({ day: `[${section.name}] DAY ${String(dayNum).padStart(2, '0')}`, words: currentDay });
        }
      }
      
      const totalWords = uniqueWords.length;
      console.log(`Arranged ${totalWords} unique words into ${days.length} days across 4 sections`);
      
      return new Response(
        JSON.stringify({ days }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: extract, organize, or arrange' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in organize-vocabulary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
