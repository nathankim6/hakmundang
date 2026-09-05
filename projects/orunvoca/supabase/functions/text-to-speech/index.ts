import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// Real human recordings (Wiktionary / Google) served by dictionaryapi.dev.
// These are actual native-speaker recordings, so they sound far less robotic
// than synthesized TTS for single words.
async function fetchAudio(url: string): Promise<string | null> {
  try {
    const res = await fetch(url.startsWith('//') ? `https:${url}` : url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) return null;
    return toBase64(buf);
  } catch (_) {
    return null;
  }
}

async function fetchHumanRecording(word: string, accent: string): Promise<string | null> {
  const w = word.toLowerCase().replace(/[’']/g, '');
  const region = accent === 'uk' ? 'gb' : 'us';

  // 1) Google Dictionary (Oxford native-speaker recordings) — most natural
  for (const base of [
    `https://ssl.gstatic.com/dictionary/static/sounds/20220808/${w}--_${region}_1.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${w}--_${region}_1.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${w}--_${region}_1.mp3`,
  ]) {
    const audio = await fetchAudio(base);
    if (audio) return audio;
  }

  // 2) Wiktionary recordings via dictionaryapi.dev
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
    );
    if (!res.ok) return null;
    const entries = await res.json();
    if (!Array.isArray(entries)) return null;

    const audios: string[] = [];
    for (const entry of entries) {
      for (const p of entry?.phonetics ?? []) {
        if (p?.audio) audios.push(String(p.audio));
      }
    }
    const want = accent === 'uk' ? '-uk' : '-us';
    const other = accent === 'uk' ? '-us' : '-uk';
    const ordered = [
      ...audios.filter((a) => a.toLowerCase().includes(want)),
      ...audios.filter((a) => !a.toLowerCase().includes(other) && !a.toLowerCase().includes(want)),
    ];
    for (const url of ordered) {
      const audio = await fetchAudio(url);
      if (audio) return audio;
    }
    return null;

  } catch (_) {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, accent } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const trimmed = String(text).trim();

    // 1) Single words -> prefer authentic native-speaker recordings
    if (/^[A-Za-z][A-Za-z'’-]*$/.test(trimmed)) {
      const human = await fetchHumanRecording(trimmed, accent);
      if (human) {
        return new Response(
          JSON.stringify({ audioContent: human, source: 'human' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // 2) Fallback: high-quality neural TTS with a natural US voice
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const voice = accent === 'uk' ? 'fable' : 'nova';

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: trimmed,
        voice,
        instructions:
          accent === 'uk'
            ? 'Speak with a clear, natural British English accent at a calm, natural pace.'
            : 'Speak with a clear, natural General American accent, like a native US English teacher. Natural human intonation, not robotic.',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || 'Failed to generate speech');
    }

    const base64Audio = toBase64(await response.arrayBuffer());

    return new Response(
      JSON.stringify({ audioContent: base64Audio, source: 'tts' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
