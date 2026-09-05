import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Part configuration
const PARTS = [
  { part: 1, workbookTitle: 'ORUN VOCA 3', title: '중등 필수 어휘', themeColor: '#7BAFD4', secondaryColor: '#4A8BB5', wordsPerDay: 60 },
  { part: 2, workbookTitle: 'ORUN VOCA 4', title: '중등 고난도 어휘', themeColor: '#7BC4A0', secondaryColor: '#5AA87E', wordsPerDay: 60 },
  { part: 3, workbookTitle: 'ORUN VOCA 5', title: '고등 기본 어휘', themeColor: '#9B8EC4', secondaryColor: '#7A6DAA', wordsPerDay: 40 },
  { part: 4, workbookTitle: 'ORUN VOCA 6', title: '고등 필수 어휘', themeColor: '#E8967A', secondaryColor: '#D47A5E', wordsPerDay: 40 },
  { part: 5, workbookTitle: 'ORUN VOCA 7', title: '고등 고난도 어휘', themeColor: '#5BA8A4', secondaryColor: '#458D89', wordsPerDay: 30 },
  { part: 6, workbookTitle: 'ORUN VOCA 8', title: '고등 어휘 완성', themeColor: '#B8A08A', secondaryColor: '#9D856F', wordsPerDay: 40 },
  { part: 7, workbookTitle: null, title: '고난도숙어', themeColor: '#C4697A', secondaryColor: '#A85060', wordsPerDay: 40 },
];

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

function getAuthClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');
  const client = getAuthClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await verifyAuth(req);
    const { action, idioms, partNumber, startSortOrder, dayGroupId } = await req.json();
    const db = getServiceClient();

    // === INIT: Create/reset Ultimate workbook, delete old data ===
    if (action === 'init-ultimate') {
      let { data: wb } = await db.from('workbooks').select('id').eq('title', 'ORUN VOCA Ultimate').single();
      
      if (wb) {
        const { data: existingDGs } = await db.from('day_groups').select('id').eq('workbook_id', wb.id);
        if (existingDGs && existingDGs.length > 0) {
          const dgIds = existingDGs.map(dg => dg.id);
          const { data: wordIds } = await db.from('words').select('id').in('day_group_id', dgIds);
          if (wordIds && wordIds.length > 0) {
            const wIds = wordIds.map(w => w.id);
            for (let i = 0; i < wIds.length; i += 500) {
              await db.from('word_examples').delete().in('word_id', wIds.slice(i, i + 500));
            }
            for (let i = 0; i < wIds.length; i += 500) {
              await db.from('words').delete().in('id', wIds.slice(i, i + 500));
            }
          }
          await db.from('day_groups').delete().eq('workbook_id', wb.id);
        }
      } else {
        const { data: newWb, error } = await db.from('workbooks').insert({
          title: 'ORUN VOCA Ultimate',
          cover_subtitle: 'Ultimate',
          theme_color: '#1A1A1A',
          secondary_color: '#D4AF37',
          difficulty_level: 'middle',
          include_examples: true,
        }).select().single();
        if (error) throw error;
        wb = newWb;
      }

      await db.from('workbooks').update({ include_examples: true, cover_subtitle: 'Ultimate' }).eq('id', wb.id);

      return new Response(JSON.stringify({ success: true, workbookId: wb.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // === COPY ONE PART: Copy words (with pronunciation & examples) from a single source workbook ===
    if (action === 'copy-one-part') {
      const partConfig = PARTS.find(p => p.part === partNumber);
      if (!partConfig || !partConfig.workbookTitle) throw new Error(`Invalid part: ${partNumber}`);

      const { data: wb } = await db.from('workbooks').select('id').eq('title', 'ORUN VOCA Ultimate').single();
      if (!wb) throw new Error('Ultimate workbook not found');

      const { data: srcWb } = await db.from('workbooks').select('id').eq('title', partConfig.workbookTitle).single();
      if (!srcWb) {
        console.log(`Skipping ${partConfig.workbookTitle} - not found`);
        return new Response(JSON.stringify({ success: true, words: 0, days: 0, nextSortOrder: startSortOrder || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: srcDGs } = await db.from('day_groups')
        .select('id, day_name, sort_order')
        .eq('workbook_id', srcWb.id)
        .order('sort_order');
      
      if (!srcDGs || srcDGs.length === 0) {
        return new Response(JSON.stringify({ success: true, words: 0, days: 0, nextSortOrder: startSortOrder || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Collect all words WITH pronunciation and examples using a single join query
      interface WordWithExamples {
        word: string;
        meaning: string;
        pronunciation: string | null;
        part_of_speech: string | null;
        examples: { english: string; korean: string | null }[];
      }

      const dgIds = srcDGs.map(dg => dg.id);
      
      // Fetch all words with examples in one query (no N+1)
      const { data: allWordsRaw } = await db.from('words')
        .select('word, meaning, pronunciation, part_of_speech, sort_order, day_group_id, word_examples(english, korean, sort_order)')
        .in('day_group_id', dgIds)
        .order('sort_order');

      if (!allWordsRaw) {
        return new Response(JSON.stringify({ success: true, words: 0, days: 0, nextSortOrder: startSortOrder || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Sort by day_group sort_order, then word sort_order
      const dgSortMap = new Map(srcDGs.map(dg => [dg.id, dg.sort_order]));
      allWordsRaw.sort((a, b) => {
        const dgA = dgSortMap.get(a.day_group_id) ?? 0;
        const dgB = dgSortMap.get(b.day_group_id) ?? 0;
        if (dgA !== dgB) return dgA - dgB;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });

      const allWords: WordWithExamples[] = allWordsRaw.map(w => ({
        word: w.word,
        meaning: w.meaning,
        pronunciation: w.pronunciation,
        part_of_speech: w.part_of_speech,
        examples: (w.word_examples as any[] || [])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .slice(0, 1)
          .map((ex: any) => ({ english: ex.english, korean: ex.korean })),
      }));

      // Arrange into new days
      let sortOrder = startSortOrder || 0;
      const wpd = partConfig.wordsPerDay;
      const totalDays = Math.ceil(allWords.length / wpd);
      
      for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
        const dayWords = allWords.slice(dayIdx * wpd, (dayIdx + 1) * wpd);
        const dayName = `[Part ${partConfig.part}] DAY ${String(dayIdx + 1).padStart(2, '0')}`;
        
        const { data: newDG, error: dgErr } = await db.from('day_groups').insert({
          workbook_id: wb.id,
          day_name: dayName,
          sort_order: sortOrder++,
        }).select().single();
        if (dgErr) throw dgErr;

        const wordInserts = dayWords.map((w, idx) => ({
          day_group_id: newDG.id,
          word: w.word,
          meaning: w.meaning,
          pronunciation: w.pronunciation,
          part_of_speech: w.part_of_speech,
          sort_order: idx,
        }));
        
        const { data: insertedWords, error: wErr } = await db.from('words').insert(wordInserts).select('id');
        if (wErr) throw wErr;

        // Insert examples for each word
        if (insertedWords) {
          const exampleInserts: { word_id: string; english: string; korean: string | null; sort_order: number }[] = [];
          for (let i = 0; i < insertedWords.length; i++) {
            const srcWord = dayWords[i];
            if (srcWord.examples && srcWord.examples.length > 0) {
              srcWord.examples.forEach((ex, exIdx) => {
                exampleInserts.push({
                  word_id: insertedWords[i].id,
                  english: ex.english,
                  korean: ex.korean,
                  sort_order: exIdx,
                });
              });
            }
          }
          if (exampleInserts.length > 0) {
            for (let i = 0; i < exampleInserts.length; i += 500) {
              const { error: exErr } = await db.from('word_examples').insert(exampleInserts.slice(i, i + 500));
              if (exErr) throw exErr;
            }
          }
        }
      }

      console.log(`Part ${partConfig.part} (${partConfig.title}): ${allWords.length} words, ${totalDays} days`);

      return new Response(JSON.stringify({ 
        success: true, 
        words: allWords.length, 
        days: totalDays,
        nextSortOrder: sortOrder 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // === ADD IDIOMS: Add idioms to Ultimate workbook ===
    if (action === 'add-idioms') {
      const { data: wb } = await db.from('workbooks').select('id').eq('title', 'ORUN VOCA Ultimate').single();
      if (!wb) throw new Error('Ultimate workbook not found');

      let sortOrder = startSortOrder || 0;
      if (!startSortOrder) {
        const { data: maxDG } = await db.from('day_groups')
          .select('sort_order')
          .eq('workbook_id', wb.id)
          .order('sort_order', { ascending: false })
          .limit(1);
        sortOrder = (maxDG && maxDG.length > 0) ? maxDG[0].sort_order + 1 : 0;
      }

      const wpd = 40;
      const totalDays = Math.ceil(idioms.length / wpd);

      for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
        const dayWords = idioms.slice(dayIdx * wpd, (dayIdx + 1) * wpd);
        const dayName = `[Part 7] DAY ${String(dayIdx + 1).padStart(2, '0')}`;

        const { data: newDG, error: dgErr } = await db.from('day_groups').insert({
          workbook_id: wb.id,
          day_name: dayName,
          sort_order: sortOrder++,
        }).select().single();
        if (dgErr) throw dgErr;

        const wordInserts = dayWords.map((w: any, idx: number) => ({
          day_group_id: newDG.id,
          word: w.word,
          meaning: w.meaning,
          sort_order: idx,
        }));

        const { error: wErr } = await db.from('words').insert(wordInserts);
        if (wErr) throw wErr;
      }

      console.log(`Part 7 (고난도숙어): ${idioms.length} idioms, ${totalDays} days`);

      return new Response(JSON.stringify({ success: true, days: totalDays }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // === GENERATE IDIOM MEANINGS ===
    if (action === 'generate-idiom-meanings') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert English-Korean translator specializing in English idioms, phrasal verbs, and collocations.
For each English expression, provide a concise Korean meaning (뜻).
Return JSON: {"results": [{"word": "expression", "meaning": "한국어 뜻"}]}
Keep meanings concise (1-5 words). Be accurate and natural.`
            },
            {
              role: 'user',
              content: `Translate these English expressions to Korean:\n${idioms.join('\n')}`
            }
          ],
          max_tokens: 8000,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return new Response(JSON.stringify({ results: parsed.results || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // === GENERATE IDIOM EXAMPLES FOR ONE DAY GROUP ===
    if (action === 'generate-idiom-examples-batch') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

      // dayGroupId is already destructured from req.json() above
      if (!dayGroupId) {
        // If no dayGroupId, return list of Part 7 day groups needing examples
        const { data: wb } = await db.from('workbooks').select('id').eq('title', 'ORUN VOCA Ultimate').single();
        if (!wb) throw new Error('Ultimate workbook not found');

        const { data: dgs } = await db.from('day_groups')
          .select('id, day_name')
          .eq('workbook_id', wb.id)
          .like('day_name', '[Part 7]%')
          .order('sort_order');

        if (!dgs || dgs.length === 0) {
          return new Response(JSON.stringify({ success: true, dayGroups: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check which day groups have incomplete examples
        const result: { id: string; dayName: string; missing: number }[] = [];
        for (const dg of dgs) {
          const { data: words } = await db.from('words').select('id').eq('day_group_id', dg.id);
          if (!words || words.length === 0) continue;
          const { data: examples } = await db.from('word_examples').select('word_id').in('word_id', words.map(w => w.id));
          const withExamples = new Set(examples?.map(e => e.word_id) || []);
          const missing = words.filter(w => !withExamples.has(w.id)).length;
          if (missing > 0) result.push({ id: dg.id, dayName: dg.day_name, missing });
        }

        return new Response(JSON.stringify({ success: true, dayGroups: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate examples for one specific day group
      const { data: words } = await db.from('words')
        .select('id, word, meaning')
        .eq('day_group_id', dayGroupId)
        .order('sort_order');

      if (!words || words.length === 0) {
        return new Response(JSON.stringify({ success: true, generated: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const wordIds = words.map(w => w.id);
      const { data: existingExamples } = await db.from('word_examples').select('word_id').in('word_id', wordIds);
      const wordsWithExamples = new Set(existingExamples?.map(e => e.word_id) || []);
      // Limit to 20 words per call to avoid timeout
      const wordsNeedingExamples = words.filter(w => !wordsWithExamples.has(w.id)).slice(0, 20);

      if (wordsNeedingExamples.length === 0) {
        return new Response(JSON.stringify({ success: true, generated: 0, remaining: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const totalRemaining = words.filter(w => !wordsWithExamples.has(w.id)).length;
      let totalGenerated = 0;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert English teacher creating example sentences for English idioms and expressions.
For each expression, create ONE clear, natural example sentence that demonstrates its usage, along with a Korean translation.
The sentence should be at a high school level, practical, and clearly demonstrate the idiom's meaning.
Return JSON: {"results": [{"word": "expression", "english": "example sentence", "korean": "한국어 번역"}]}`
            },
            {
              role: 'user',
              content: `Create example sentences for these expressions:\n${wordsNeedingExamples.map(w => `${w.word} (${w.meaning})`).join('\n')}`
            }
          ],
          max_tokens: 4000,
          temperature: 0.5,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      if (parsed.results) {
        const exampleInserts: { word_id: string; english: string; korean: string; sort_order: number }[] = [];
        for (const result of parsed.results) {
          const matchingWord = wordsNeedingExamples.find(w => w.word.toLowerCase() === result.word?.toLowerCase());
          if (matchingWord && result.english) {
            exampleInserts.push({
              word_id: matchingWord.id,
              english: result.english,
              korean: result.korean || '',
              sort_order: 0,
            });
          }
        }
        if (exampleInserts.length > 0) {
          await db.from('word_examples').insert(exampleInserts);
          totalGenerated = exampleInserts.length;
        }
      }

      const remaining = totalRemaining - totalGenerated;
      console.log(`Generated ${totalGenerated} idiom examples for day group ${dayGroupId}, ${remaining} remaining`);

      return new Response(JSON.stringify({ success: true, generated: totalGenerated, remaining }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
