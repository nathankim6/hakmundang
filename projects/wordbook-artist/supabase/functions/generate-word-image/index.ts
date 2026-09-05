import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wordId, word, exampleSentence, vocaLevel } = await req.json();

    if (!wordId || !word || !exampleSentence) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const isVoca2 = vocaLevel === '2';

    const prompt = isVoca2
      ? `Create a photorealistic, high-quality image depicting this scene: "${exampleSentence}". Style: warm golden-hour lighting, vibrant colors, real-life children (ages 7-10) in natural outdoor or cozy indoor settings, flowers, animals, and nature elements. Shot like a professional children's lifestyle photograph with shallow depth of field and soft bokeh background. Do NOT include any text, letters, or words in the image.`
      : `Generate a cheerful, colorful cartoon-style illustration depicting this scene: "${exampleSentence}". This is for a children's vocabulary learning card. Style: friendly cartoon, bright warm colors, clean composition, safe for kids. Do NOT include any text, letters, or words in the image.`;

    const fallbackPrompt = isVoca2
      ? `Create a photorealistic, warm-toned image for a children's vocabulary card. The word is "${word}". Show happy children (ages 7-10) in a bright, natural setting with warm golden-hour lighting. Professional lifestyle photography style with soft bokeh. Do NOT include any text or letters.`
      : `Generate a simple, colorful cartoon illustration for a children's vocabulary card. The word is "${word}". Show a positive, friendly scene. Style: bright colors, cartoon-like. Do NOT include any text or letters.`;

    console.log(`Generating image for word: ${word}`);

    const generateWithPrompt = async (p: string) => {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`;

      const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: p }] }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`Gemini API error: ${aiResponse.status} ${errorText}`);
        if (aiResponse.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded. Please try again later.' };
        }
        throw new Error(`Gemini API error: ${aiResponse.status}`);
      }

      let aiData: any;
      try {
        const rawText = await aiResponse.text();
        if (!rawText || rawText.trim() === '') {
          console.warn('Empty response from Gemini API');
          return { base64Content: null, mimeType: 'image/png' };
        }
        aiData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini response:', parseErr);
        return { base64Content: null, mimeType: 'image/png' };
      }

      let base64Content: string | null = null;
      let mimeType = 'image/png';

      // Gemini direct API returns: candidates[].content.parts[] with inlineData
      const candidates = aiData.candidates || [];
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            mimeType = part.inlineData.mimeType || 'image/png';
            base64Content = part.inlineData.data;
          }
        }
        if (base64Content) break;
      }

      return { base64Content, mimeType };
    };

    // Try primary prompt, then fallback
    let base64Content: string | null = null;
    let mimeType = 'image/png';

    try {
      const result = await generateWithPrompt(prompt);
      base64Content = result.base64Content;
      mimeType = result.mimeType;
    } catch (e: any) {
      if (e.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw e;
    }

    if (!base64Content) {
      console.log(`Primary prompt failed for "${word}", trying fallback...`);
      try {
        const result = await generateWithPrompt(fallbackPrompt);
        base64Content = result.base64Content;
        mimeType = result.mimeType;
      } catch (e: any) {
        if (e.status === 429) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: e.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw e;
      }
    }

    if (!base64Content) {
      console.warn(`No image generated for word: "${word}" — skipping.`);
      return new Response(JSON.stringify({ imageUrl: null, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean and decode base64 to bytes
    const cleanedBase64 = base64Content.replace(/[\s\r\n]/g, '');
    let bytes: Uint8Array;
    try {
      const binaryString = atob(cleanedBase64);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } catch (decodeErr) {
      console.error('Base64 decode error for word:', word, decodeErr);
      throw new Error('Failed to decode image data');
    }

    console.log(`Image size for "${word}": ${bytes.length} bytes`);

    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const fileName = `${wordId}.${ext}`;

    // Upload to Supabase Storage with retry
    let uploadError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.storage
        .from('word-images')
        .upload(fileName, bytes, {
          contentType: mimeType,
          upsert: true,
        });
      if (!error) {
        uploadError = null;
        break;
      }
      uploadError = error;
      console.warn(`Upload attempt ${attempt + 1} failed for "${word}": ${error.message}`);
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }

    if (uploadError) {
      console.error('Upload failed after 3 attempts:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('word-images')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('words')
      .update({ image_url: publicUrl })
      .eq('id', wordId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update word: ${updateError.message}`);
    }

    console.log(`Image generated and saved for word: ${word}, URL: ${publicUrl}`);

    return new Response(JSON.stringify({ imageUrl: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-word-image error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
