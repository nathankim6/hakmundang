import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 배치 사이즈 (한 번에 처리할 레코드 수)
    const { batchSize = 5, offset = 0 } = await req.json().catch(() => ({}));

    console.log(`Starting migration with batchSize: ${batchSize}, offset: ${offset}`);

    // base64로 시작하는 photo_urls가 있는 제출물 조회 (photo_urls 제외하고 id만)
    const { data: submissions, error: fetchError } = await supabase
      .from("daily_word_submissions")
      .select("id, student_id, submission_date")
      .not("photo_urls", "is", null)
      .order("submitted_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch submissions: ${fetchError.message}`);
    }

    if (!submissions || submissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No more submissions to migrate",
          migrated: 0,
          hasMore: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const submission of submissions) {
      try {
        // 개별 레코드의 photo_urls 조회
        const { data: photoData, error: photoError } = await supabase
          .from("daily_word_submissions")
          .select("photo_urls")
          .eq("id", submission.id)
          .single();

        if (photoError || !photoData?.photo_urls) {
          console.log(`Skipping ${submission.id}: no photos or error`);
          skippedCount++;
          continue;
        }

        const photoUrls = photoData.photo_urls as string[];
        
        // 이미 Storage URL인지 확인 (https://로 시작하면 스킵)
        if (photoUrls.length > 0 && photoUrls[0].startsWith("https://")) {
          console.log(`Skipping ${submission.id}: already migrated`);
          skippedCount++;
          continue;
        }

        // base64 이미지들을 Storage에 업로드
        const newUrls: string[] = [];
        
        for (let i = 0; i < photoUrls.length; i++) {
          const base64Data = photoUrls[i];
          
          if (!base64Data.startsWith("data:image/")) {
            console.log(`Skipping photo ${i} in ${submission.id}: not a valid base64 image`);
            continue;
          }

          // base64에서 실제 데이터 추출
          const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!matches) {
            console.log(`Skipping photo ${i} in ${submission.id}: invalid format`);
            continue;
          }

          const [, imageType, base64Content] = matches;
          const fileName = `${submission.student_id}/${submission.submission_date}/${Date.now()}_${i}.${imageType}`;
          
          // base64를 Uint8Array로 변환
          const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));

          // Storage에 업로드
          const { error: uploadError } = await supabase.storage
            .from("daily-word-photos")
            .upload(fileName, binaryData, {
              contentType: `image/${imageType}`,
              upsert: false,
            });

          if (uploadError) {
            console.error(`Upload error for ${fileName}:`, uploadError);
            errors.push(`${submission.id}:${i} - ${uploadError.message}`);
            continue;
          }

          // 공개 URL 생성
          const { data: urlData } = supabase.storage
            .from("daily-word-photos")
            .getPublicUrl(fileName);

          newUrls.push(urlData.publicUrl);
        }

        // 새 URL로 업데이트
        if (newUrls.length > 0) {
          const { error: updateError } = await supabase
            .from("daily_word_submissions")
            .update({ photo_urls: newUrls })
            .eq("id", submission.id);

          if (updateError) {
            errors.push(`${submission.id} update failed: ${updateError.message}`);
          } else {
            migratedCount++;
            console.log(`Migrated ${submission.id}: ${newUrls.length} photos`);
          }
        }
      } catch (submissionError) {
        console.error(`Error processing ${submission.id}:`, submissionError);
        errors.push(`${submission.id}: ${submissionError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration batch complete`,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
        nextOffset: offset + batchSize,
        hasMore: submissions.length === batchSize,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
