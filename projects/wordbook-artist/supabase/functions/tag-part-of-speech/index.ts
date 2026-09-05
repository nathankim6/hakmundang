import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TAGS = `[명] 명사 / [동] 동사 / [형] 형용사 / [부] 부사 / [대] 대명사 / [전] 전치사 / [접] 접속사 / [감탄] 감탄사 / [한정] 한정사 / [조동] 조동사 / [COLLOC.] 연어(콜로케이션) / [숙어] 관용표현·이디엄 / [동사] 구동사(동사+부사/전치사) / [접두] 접두사 / [접미] 접미사 / [약어] 약어`;

const SYSTEM = `너는 영어 어휘 편집 전문가다. 각 영어 단어의 한국어 뜻 문자열 앞(그리고 세미콜론으로 구분된 각 뜻 덩어리 앞)에 품사 기호를 붙인다.

사용 가능한 기호: ${TAGS}

규칙:
1) 뜻은 절대 바꾸지 말고 그대로 유지한다. 오직 품사 기호만 앞에 붙인다.
2) 세미콜론(;)으로 구분된 각 뜻 덩어리마다 해당 덩어리의 품사를 판정해 기호를 붙인다. 쉼표(,)로 이어진 동일 품사 뜻은 하나의 덩어리로 본다.
3) 이미 [xx] 형태의 기호가 붙어 있으면 그대로 두되, 잘못된 기호는 바로잡는다.
4) 표제어가 두 단어 이상의 고정 표현이면 [숙어], 자주 함께 쓰이는 연어 형태면 [COLLOC.], 동사+부사/전치사 형태면 [동사]를 쓴다.
5) (n.) (v.) 같은 기존 영문 표기는 제거하고 한글 기호로 대체한다.
6) 출력은 JSON만. 형식: {"results":[{"id":"...","meaning":"[명] 속임수; [동] 속이다"}]}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
      const { data: { user }, error } = await authClient.auth.getUser();
      if (error || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const startedAt = Date.now();
    const TIME_BUDGET_MS = 45_000;
    const { workbookId, batchSize = 20, maxWords = 60, force = false } = await req.json().catch(() => ({}));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Resolve target words
    let query = supabase.from('words').select('id, word, meaning, part_of_speech, day_group_id');

    if (workbookId) {
      const { data: dayGroups, error: dgErr } = await supabase
        .from('day_groups').select('id').eq('workbook_id', workbookId);
      if (dgErr) throw new Error(dgErr.message);
      const ids = (dayGroups || []).map(d => d.id);
      if (ids.length === 0) {
        return json({ success: true, processed: 0, updated: 0, remaining: 0, message: 'No day groups' });
      }
      query = query.in('day_group_id', ids);
    }

    if (!force) query = query.not('meaning', 'like', '[%');

    const { data: words, error: wErr } = await query.limit(maxWords);
    if (wErr) throw new Error(wErr.message);

    if (!words?.length) {
      return json({ success: true, processed: 0, updated: 0, remaining: 0, message: '모든 단어에 품사 기호가 적용되어 있습니다.' });
    }

    let updated = 0;
    const failures: string[] = [];

    for (let i = 0; i < words.length; i += batchSize) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) break;
      const batch = words.slice(i, i + batchSize);
      const payload = batch.map(w => ({ id: w.id, word: w.word, meaning: w.meaning }));

      try {
        const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Lovable-API-Key': LOVABLE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3.6-flash',
            messages: [
              { role: 'system', content: SYSTEM },
              { role: 'user', content: JSON.stringify({ words: payload }) },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (res.status === 429) return json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', updated }, 429);
        if (res.status === 402) return json({ error: 'AI 크레딧이 소진되었습니다.', updated }, 402);
        if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content ?? '';
        const parsed = JSON.parse(content.replace(/```(?:json)?/g, '').trim());
        const results = parsed.results || parsed.words || [];

        for (const r of results) {
          const original = batch.find(b => b.id === r.id);
          if (!original || !r.meaning || typeof r.meaning !== 'string') continue;
          const meaning = r.meaning.trim();
          if (meaning === original.meaning) continue;
          const pos = (meaning.match(/\[([^\]]+)\]/g) || [])
            .map((t: string) => t.replace(/[[\]]/g, ''))
            .filter((v: string, idx: number, arr: string[]) => arr.indexOf(v) === idx)
            .join('/');
          const { error: uErr } = await supabase
            .from('words')
            .update({ meaning, part_of_speech: pos || original.part_of_speech })
            .eq('id', original.id);
          if (!uErr) updated++;
        }
      } catch (e) {
        console.error('batch failed', e);
        failures.push(batch[0]?.word ?? 'unknown');
      }
    }

    // Count remaining untagged
    let remaining = 0;
    if (!force) {
      let countQuery = supabase.from('words').select('id', { count: 'exact', head: true }).not('meaning', 'like', '[%');
      if (workbookId) {
        const { data: dg } = await supabase.from('day_groups').select('id').eq('workbook_id', workbookId);
        countQuery = countQuery.in('day_group_id', (dg || []).map(d => d.id));
      }
      const { count } = await countQuery;
      remaining = count ?? 0;
    }

    return json({ success: true, processed: words.length, updated, remaining, failures });
  } catch (e) {
    console.error('tag-part-of-speech error:', e);
    // 이미 저장된 작업은 유지하고, 클라이언트가 이어서 재시도할 수 있도록 200으로 반환
    return json({ success: false, processed: 0, updated: 0, remaining: -1, error: e instanceof Error ? e.message : 'Unknown error' }, 200);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
