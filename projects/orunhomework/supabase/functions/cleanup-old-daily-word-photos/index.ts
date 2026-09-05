import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 30일 이전에 확인 처리된(reviewed) 단어과제 제출 중 사진이 남아있는 것 조회
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const { data: oldSubmissions, error: fetchError } = await supabase
      .from('daily_word_submissions')
      .select('id, photo_urls, reviewed_at')
      .eq('status', 'reviewed')
      .lt('reviewed_at', oneMonthAgo.toISOString())
      .not('photo_urls', 'is', null);

    if (fetchError) throw new Error(fetchError.message);

    if (!oldSubmissions || oldSubmissions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, deletedCount: 0, message: 'Nothing to clean' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let deletedFilesCount = 0;
    let updatedRecordsCount = 0;
    const errors: string[] = [];

    for (const sub of oldSubmissions) {
      try {
        const urls: string[] = Array.isArray(sub.photo_urls) ? sub.photo_urls : [];
        if (urls.length === 0) continue;

        const filePaths = urls
          .filter((u: string) => typeof u === 'string' && u.includes('/daily-word-photos/'))
          .map((u: string) => {
            const parts = u.split('/daily-word-photos/');
            return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
          })
          .filter(Boolean);

        if (filePaths.length > 0) {
          const { error: delErr } = await supabase.storage
            .from('daily-word-photos')
            .remove(filePaths);
          if (delErr) {
            errors.push(`Storage delete failed for ${sub.id}: ${delErr.message}`);
          } else {
            deletedFilesCount += filePaths.length;
          }
        }

        const { error: updErr } = await supabase
          .from('daily_word_submissions')
          .update({ photo_urls: [] })
          .eq('id', sub.id);

        if (updErr) {
          errors.push(`DB update failed for ${sub.id}: ${updErr.message}`);
        } else {
          updatedRecordsCount++;
        }
      } catch (e) {
        errors.push(`Error on ${sub.id}: ${(e as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedFilesCount,
        updatedRecordsCount,
        totalProcessed: oldSubmissions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
