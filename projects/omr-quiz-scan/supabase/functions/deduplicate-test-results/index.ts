import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

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
  if (new Date(data.expiry_date) < new Date()) return false;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apikey = req.headers.get('apikey');
  if (!apikey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { testId, accessCode } = body as { testId?: string; accessCode?: string };

    // Require valid access code
    if (!accessCode || typeof accessCode !== 'string' || !(await verifyAccessCode(accessCode))) {
      return new Response(JSON.stringify({ error: 'Valid access code required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let totalDeleted = 0;
    let totalFailed = 0;
    let totalGroups = 0;
    const errorSamples: string[] = [];
    const batchSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from('test_results')
        .select('id, test_id, student_name, score, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + batchSize - 1);

      if (testId) query = query.eq('test_id', testId);

      const { data: results, error } = await query;
      if (error) throw new Error(`결과 조회 실패: ${error.message}`);

      if (!results || results.length === 0) { hasMore = false; break; }

      const groups = new Map<string, { keep: any; dups: any[] }>();
      for (const r of results) {
        const key = `${r.test_id}__${r.student_name ?? ''}__${r.score}`;
        if (!groups.has(key)) {
          groups.set(key, { keep: r, dups: [] });
        } else {
          groups.get(key)!.dups.push(r);
        }
      }

      let batchDeleted = 0;
      for (const [key, { dups }] of groups) {
        if (dups.length > 0) {
          totalGroups++;
          for (const d of dups) {
            try {
              const { error: delError } = await supabase
                .from('test_results')
                .delete()
                .eq('id', d.id);
              if (delError) {
                totalFailed++;
                if (errorSamples.length < 3) errorSamples.push(`${d.id}: ${delError.message}`);
              } else {
                batchDeleted++; totalDeleted++;
              }
            } catch (e: any) {
              totalFailed++;
              if (errorSamples.length < 3) errorSamples.push(`${d.id}: ${e?.message}`);
            }
          }
        }
      }

      if (results.length < batchSize) { hasMore = false; }
      else { offset += batchSize; }
      if (offset > 10000) { hasMore = false; }
    }

    const message = totalFailed > 0 
      ? `중복 정리 완료 (일부 실패): ${totalGroups}개 그룹, ${totalDeleted}개 삭제, ${totalFailed}개 실패`
      : `중복 정리 완료: ${totalGroups}개 그룹, ${totalDeleted}개 삭제`;
    
    return new Response(
      JSON.stringify({ message, deleted: totalDeleted, failed: totalFailed, groupsWithDup: totalGroups, scope: testId ?? 'all', errorSamples }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('Dedup error:', e);
    return new Response(JSON.stringify({ error: e.message ?? 'unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
