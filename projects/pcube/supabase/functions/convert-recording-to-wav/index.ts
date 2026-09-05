import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, bucket } = await req.json();
    if (!filePath || !bucket) {
      return new Response(JSON.stringify({ error: "filePath and bucket required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 이미 WAV인 경우 스킵
    if (filePath.endsWith(".wav")) {
      return new Response(JSON.stringify({ message: "Already WAV, skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. 원본 파일 다운로드
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("[WAV Convert] Download failed:", downloadError);
      return new Response(JSON.stringify({ error: "Download failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. ffmpeg로 WAV 변환 (Deno subprocess)
    const inputBytes = new Uint8Array(await fileData.arrayBuffer());
    
    // 임시 파일에 쓰기
    const tempInput = await Deno.makeTempFile({ suffix: getExtension(filePath) });
    const tempOutput = await Deno.makeTempFile({ suffix: ".wav" });
    
    await Deno.writeFile(tempInput, inputBytes);

    // ffmpeg 실행
    const ffmpeg = new Deno.Command("ffmpeg", {
      args: ["-i", tempInput, "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "1", "-y", tempOutput],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stderr } = await ffmpeg.output();
    
    if (code !== 0) {
      const errMsg = new TextDecoder().decode(stderr);
      console.error("[WAV Convert] ffmpeg failed:", errMsg);
      
      // ffmpeg 사용 불가 시 Web Audio API 폴백은 불가하므로 원본 유지
      await Deno.remove(tempInput).catch(() => {});
      await Deno.remove(tempOutput).catch(() => {});
      
      return new Response(JSON.stringify({ error: "ffmpeg conversion failed", details: errMsg.slice(-500) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. 변환된 WAV 파일 읽기
    const wavBytes = await Deno.readFile(tempOutput);

    // 4. WAV 파일을 새 경로에 업로드
    const wavPath = filePath.replace(/\.[^.]+$/, ".wav");
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(wavPath, wavBytes, {
        contentType: "audio/wav",
        upsert: true,
      });

    if (uploadError) {
      console.error("[WAV Convert] Upload failed:", uploadError);
      await Deno.remove(tempInput).catch(() => {});
      await Deno.remove(tempOutput).catch(() => {});
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. DB에서 recording_url 업데이트 (원본 URL → WAV URL)
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(wavPath);
    const wavUrl = urlData.publicUrl;

    // 원본 URL로 해당 submission 찾아서 업데이트
    const { data: origUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const origUrl = origUrlData.publicUrl;

    await supabase
      .from("homework_submissions")
      .update({ recording_url: wavUrl })
      .eq("recording_url", origUrl);

    // 6. 원본 파일 삭제 (선택)
    await supabase.storage.from(bucket).remove([filePath]);

    // 임시 파일 정리
    await Deno.remove(tempInput).catch(() => {});
    await Deno.remove(tempOutput).catch(() => {});

    console.log(`[WAV Convert] Success: ${filePath} → ${wavPath}`);
    
    return new Response(JSON.stringify({ success: true, wavPath, wavUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[WAV Convert] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getExtension(path: string): string {
  const match = path.match(/(\.[^.]+)$/);
  return match ? match[1] : ".webm";
}
