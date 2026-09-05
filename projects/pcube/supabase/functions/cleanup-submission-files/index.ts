import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, submissionId } = await req.json();
    // type: "photo" | "recording"

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (type === "photo") {
      // Get photo URLs before clearing
      const { data: submission, error: fetchErr } = await supabase
        .from("daily_word_submissions")
        .select("photo_urls")
        .eq("id", submissionId)
        .single();

      if (fetchErr) throw fetchErr;

      const photoUrls: string[] = submission?.photo_urls || [];

      // Extract storage paths and delete files
      const filePaths = photoUrls
        .map((url: string) => {
          // URL format: .../storage/v1/object/public/daily-word-photos/...
          const match = url.match(/\/daily-word-photos\/(.+)$/);
          return match ? match[1].split("?")[0] : null;
        })
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from("daily-word-photos")
          .remove(filePaths);
        if (storageErr) console.error("Storage delete error:", storageErr);
      }

      // Also try daily-submissions bucket
      const dailyPaths = photoUrls
        .map((url: string) => {
          const match = url.match(/\/daily-submissions\/(.+)$/);
          return match ? match[1].split("?")[0] : null;
        })
        .filter(Boolean) as string[];

      if (dailyPaths.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from("daily-submissions")
          .remove(dailyPaths);
        if (storageErr) console.error("Storage delete error:", storageErr);
      }

      // Clear photo_urls from DB record
      const { error: updateErr } = await supabase
        .from("daily_word_submissions")
        .update({ photo_urls: [] })
        .eq("id", submissionId);

      if (updateErr) throw updateErr;

    } else if (type === "recording") {
      // Get recording URL before clearing
      const { data: submission, error: fetchErr } = await supabase
        .from("homework_submissions")
        .select("recording_url")
        .eq("id", submissionId)
        .single();

      if (fetchErr) throw fetchErr;

      const recordingUrl: string | null = submission?.recording_url;

      if (recordingUrl) {
        const match = recordingUrl.match(/\/rt-recordings\/(.+)$/);
        if (match) {
          const filePath = match[1].split("?")[0];
          const { error: storageErr } = await supabase.storage
            .from("rt-recordings")
            .remove([filePath]);
          if (storageErr) console.error("Storage delete error:", storageErr);
        }
      }

      // Clear recording_url from DB record
      const { error: updateErr } = await supabase
        .from("homework_submissions")
        .update({ recording_url: null, recording_timestamps: null })
        .eq("id", submissionId);

      if (updateErr) throw updateErr;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
