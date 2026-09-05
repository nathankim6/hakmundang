import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, example, cardSetId, forceRegenerate } = await req.json();
    
    if (!word || !example) {
      return new Response(
        JSON.stringify({ error: "word and example are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if image already exists in word_images table
    const wordLower = word.toLowerCase().trim();
    const effectiveCardSetId = cardSetId || '00000000-0000-0000-0000-000000000000';
    
    const { data: existingImage } = await supabase
      .from("word_images")
      .select("image_url")
      .eq("word", wordLower)
      .eq("card_set_id", effectiveCardSetId)
      .maybeSingle();

    if (forceRegenerate && existingImage?.image_url) {
      // Delete old image from storage
      try {
        const oldUrl = existingImage.image_url;
        const bucketPath = oldUrl.split('/word-images/')[1];
        if (bucketPath) {
          await supabase.storage.from("word-images").remove([decodeURIComponent(bucketPath)]);
          console.log(`Deleted old image for word: ${word}`);
        }
      } catch (e) {
        console.error("Failed to delete old image:", e);
      }
      // Delete cache record
      await supabase
        .from("word_images")
        .delete()
        .eq("word", wordLower)
        .eq("card_set_id", effectiveCardSetId);
    } else if (!forceRegenerate && existingImage?.image_url) {
      console.log(`Cache hit for word: ${word}`);
      return new Response(
        JSON.stringify({ imageUrl: existingImage.image_url, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate image using Google Gemini API directly
    // Remove underscores and Korean text, keep only English
    const cleanExample = example
      .replace(/_/g, '')
      .replace(/[㄀-ㅣ가-힣]/g, '')
      .trim();

    const generateImage = async (prompt: string) => {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      });

      if (!resp.ok) {
        console.error("Gemini API error:", resp.status);
        return { ok: false, status: resp.status, data: null, blocked: false };
      }
      const data = await resp.json();
      
      // Extract image from Gemini response
      const parts = data.candidates?.[0]?.content?.parts || [];
      let imgBase64 = null;
      let blocked = false;
      
      // Check for blocked content
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason === "SAFETY" || finishReason === "BLOCKED") {
        blocked = true;
      }
      
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          imgBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
      
      return { ok: true, status: resp.status, data: imgBase64, blocked };
    };

    console.log(`Generating image for word: ${word}`);

    const primaryPrompt = `Create a realistic, grounded visual scene that depicts the following English sentence: "${cleanExample}". 
Style: Modern, clean, and realistic — like a high-quality photograph or a realistic digital illustration. Natural lighting, real-world settings, and everyday life scenes. 
Do NOT use fantasy, magical, glowing, or ethereal elements. Keep it grounded in reality.
IMPORTANT: Do not include any text, words, or letters in the image. Create a pure visual scene with no text overlays.
Aspect ratio: 3:4 (portrait orientation, taller than wide). Ultra high resolution.`;

    let result = await generateImage(primaryPrompt);

    // Handle errors
    if (!result.ok) {
      if (result.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If content was blocked, retry with a neutral educational prompt
    if (!result.data && result.blocked) {
      console.log(`Content blocked for "${word}", retrying with neutral prompt...`);
      const fallbackPrompt = `Create a beautiful, safe, educational illustration representing the English vocabulary word "${word}" in a positive, neutral context. 
Show a simple, wholesome everyday scene that helps learners understand this word visually.
Style: Friendly, colorful illustration suitable for all ages. No negative or violent imagery.
IMPORTANT: Do not include any text, words, or letters in the image.
Aspect ratio: 3:4 (portrait). Ultra high resolution.`;
      result = await generateImage(fallbackPrompt);
    }

    if (!result.data) {
      console.error("No image generated after retry for word:", word);
      return new Response(
        JSON.stringify({ error: "No image generated", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBase64 = result.data;

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to Supabase storage
    const fileName = `${cardSetId || 'general'}/${word.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("word-images")
      .upload(fileName, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("word-images")
      .getPublicUrl(fileName);

    console.log(`Image generated and uploaded for word: ${word}, URL: ${urlData.publicUrl}`);

    // Save to word_images table for caching
    await supabase
      .from("word_images")
      .upsert({
        word: wordLower,
        card_set_id: effectiveCardSetId,
        image_url: urlData.publicUrl,
      }, { onConflict: 'word,card_set_id' });

    return new Response(
      JSON.stringify({ imageUrl: urlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
