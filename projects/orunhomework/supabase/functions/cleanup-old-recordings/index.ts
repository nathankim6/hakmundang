import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 검토 완료 후 2주(14일) 경과 기준
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // 검토 완료 후 2주 지난 제출 중 녹음 파일이 있는 것들 조회
    const { data: oldSubmissions, error: fetchError } = await supabase
      .from('homework_submissions')
      .select('id, recording_url, submitted_at, reviewed_at')
      .not('recording_url', 'is', null)
      .not('reviewed_at', 'is', null)
      .lt('reviewed_at', twoWeeksAgo.toISOString())
      .limit(500);

    if (fetchError) {
      throw new Error(`Failed to fetch old submissions: ${fetchError.message}`);
    }

    if (!oldSubmissions || oldSubmissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No old recordings to clean up',
          deletedCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let deletedFilesCount = 0;
    let updatedRecordsCount = 0;
    const errors: string[] = [];

    for (const submission of oldSubmissions) {
      try {
        // 녹음 파일 URL에서 파일 경로 추출
        if (submission.recording_url) {
          const url = new URL(submission.recording_url);
          const pathMatch = url.pathname.match(/rt-recordings\/(.+)$/);
          
          if (pathMatch && pathMatch[1]) {
            const filePath = decodeURIComponent(pathMatch[1]);
            
            // Storage에서 파일 삭제
            const { error: deleteError } = await supabase.storage
              .from('rt-recordings')
              .remove([filePath]);

            if (deleteError) {
              errors.push(`Failed to delete file ${filePath}: ${deleteError.message}`);
            } else {
              deletedFilesCount++;
            }
          }
        }

        // DB에서 recording_url과 recording_timestamps를 null로 업데이트
        // (제출 기록과 피드백은 유지)
        const { error: updateError } = await supabase
          .from('homework_submissions')
          .update({ 
            recording_url: null,
            recording_timestamps: null
          })
          .eq('id', submission.id);

        if (updateError) {
          errors.push(`Failed to update submission ${submission.id}: ${updateError.message}`);
        } else {
          updatedRecordsCount++;
        }
      } catch (err) {
        errors.push(`Error processing submission ${submission.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed`,
        deletedFilesCount,
        updatedRecordsCount,
        totalProcessed: oldSubmissions.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
