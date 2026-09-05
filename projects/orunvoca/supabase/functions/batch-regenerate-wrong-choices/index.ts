import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { batchSize = 25, dryRun = false, action = 'process', autoChain = false } = await req.json();

    // Action: status
    if (action === 'status') {
      const { count: totalCount } = await supabase
        .from('word_quiz_cache')
        .select('id', { count: 'exact', head: true })
        .eq('quiz_type', 'meaning');

      // Count entries updated in last hour (recently processed)
      const { count: processedCount } = await supabase
        .from('word_quiz_cache')
        .select('id', { count: 'exact', head: true })
        .eq('quiz_type', 'meaning')
        .gte('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      return new Response(JSON.stringify({
        total: totalCount,
        recentlyUpdated: processedCount,
        remaining: (totalCount || 0) - (processedCount || 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: stop - set a stop flag
    if (action === 'stop') {
      return new Response(JSON.stringify({ message: 'Stopping not needed - just don\'t chain anymore' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`=== Batch regeneration: batchSize=${batchSize}, autoChain=${autoChain} ===`);

    const cutoffTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data: cacheEntries, error: fetchError } = await supabase
      .from('word_quiz_cache')
      .select('id, word, meaning')
      .eq('quiz_type', 'meaning')
      .lt('updated_at', cutoffTime)
      .order('updated_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) throw new Error(`Failed to fetch: ${fetchError.message}`);

    if (!cacheEntries || cacheEntries.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'All entries processed!',
        processed: 0,
        done: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        message: `Would process ${cacheEntries.length} entries`,
        count: cacheEntries.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process with concurrency of 5
    const results: { word: string; status: string }[] = [];
    const CONCURRENT = 5;
    
    for (let i = 0; i < cacheEntries.length; i += CONCURRENT) {
      const chunk = cacheEntries.slice(i, i + CONCURRENT);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(async (entry) => {
          try {
            const cleanMeaning = entry.meaning
              .replace(/\[([명동형부])\]\s*/g, '')
              .replace(/^\d+\.\s*/g, '')
              .replace(/\s+\d+\.\s+/g, ', ')
              .trim();
            
            const wrongChoices = await generateWrongChoices(entry.word, cleanMeaning, 12);
            
            if (!wrongChoices || wrongChoices.length === 0) {
              return { word: entry.word, status: 'no_choices' };
            }

            const correctAnswers = splitMeaning(entry.meaning);

            await supabase
              .from('word_quiz_cache')
              .update({
                choices: [...correctAnswers, ...wrongChoices],
                correct_answers: correctAnswers,
                wrong_choices: wrongChoices,
                updated_at: new Date().toISOString()
              })
              .eq('id', entry.id);

            return { word: entry.word, status: 'success' };
          } catch {
            return { word: entry.word, status: 'error' };
          }
        })
      );

      chunkResults.forEach(r => {
        if (r.status === 'fulfilled') results.push(r.value);
        else results.push({ word: 'unknown', status: 'rejected' });
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;

    const { count: remaining } = await supabase
      .from('word_quiz_cache')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_type', 'meaning')
      .lt('updated_at', cutoffTime);

    // Auto-chain: call self again if there are remaining entries
    let chainStatus = 'not_chained';
    if (autoChain && (remaining || 0) > 0) {
      try {
        // Fire and forget - call self
        const selfUrl = `${supabaseUrl}/functions/v1/batch-regenerate-wrong-choices`;
        fetch(selfUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ batchSize, autoChain: true, action: 'process' }),
        }).catch(e => console.error('Chain call failed:', e));
        chainStatus = 'chained';
        console.log(`Auto-chaining: ${remaining} remaining`);
      } catch (e) {
        chainStatus = 'chain_failed';
        console.error('Failed to chain:', e);
      }
    }

    return new Response(JSON.stringify({
      message: `Batch done: ${successCount}/${results.length} success`,
      processed: results.length,
      success: successCount,
      remaining: remaining || 0,
      done: (remaining || 0) === 0,
      chainStatus,
      sample: results.filter(r => r.status === 'success').slice(0, 3).map(r => r.word)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function splitMeaning(meaning: string): string[] {
  let cleaned = meaning.replace(/\[([명동형부])\]\s*/g, '').trim();
  cleaned = cleaned.replace(/^\d+\.\s*/g, '').replace(/\s+\d+\.\s+/g, ', ');
  
  let parts: string[];
  if (cleaned.includes(';')) parts = cleaned.split(';');
  else if (cleaned.includes(',')) parts = cleaned.split(',');
  else if (cleaned.includes('/')) parts = cleaned.split('/');
  else parts = [cleaned];
  
  return parts
    .map(p => p.replace(/\([^)]*\)\s*/g, '').replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 0);
}

async function generateWrongChoices(word: string, meaning: string, count: number): Promise<string[]> {
  const seed = Math.floor(Math.random() * 10000);
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `영어 어휘 시험 한국어 오답 선지 생성기.\n절대 원칙: (1) 정답과 동일 품사, (2) 정답과 같은 의미 카테고리/영역, (3) 정답 단어와 비슷한 난이도(CEFR), (4) 정답 뜻과 완전히 무관한 의미.\n금지: 유의어/동의어/상위어/하위어/반의어, 뜻이 일부라도 겹치는 표현, 그 영단어의 다른 사전적 의미, 같은 문맥에서 쓰이는 단어.\n한국어만, 단일 의미, 다양성, JSON만.`
        },
        {
          role: 'user',
          content: `"${word}"="${meaning}" → 오답 ${count}개. 동일품사+같은의미카테고리+비슷한난이도+뜻은완전무관+유의어/반의어/다의어의다른뜻금지+단일의미. 흔한단어(분석하다,정리하다,격려하다,축하하다,협력하다)금지. {"wrongChoices":["오답1",...]} (시드:${seed})`
        }
      ],
      temperature: 1.0,
      max_tokens: 300,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
  const data = await res.json();
  const content = data.choices[0].message.content;

  try {
    return (JSON.parse(content).wrongChoices || []).filter((c: string) => /[가-힣]/.test(c));
  } catch {
    const m = content.match(/"([^"]+)"/g);
    return m ? m.map((s: string) => s.replace(/"/g, '')).filter((c: string) => /[가-힣]/.test(c)) : [];
  }
}
