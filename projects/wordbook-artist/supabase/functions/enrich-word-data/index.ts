import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { workbookId, startDay, endDay, batchSize = 20 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get words missing data
    const { data: dayGroups } = await supabase
      .from("day_groups")
      .select("id, day_name")
      .eq("workbook_id", workbookId)
      .order("sort_order");

    if (!dayGroups?.length) throw new Error("No day groups found");

    // Filter by day range
    const filteredGroups = dayGroups.filter(dg => {
      const num = parseInt(dg.day_name.replace(/\D/g, ""));
      return num >= (startDay || 1) && num <= (endDay || 999);
    });

    const groupIds = filteredGroups.map(dg => dg.id);

    const { data: words } = await supabase
      .from("words")
      .select("id, word, meaning, part_of_speech, english_definition, synonyms, antonyms")
      .in("day_group_id", groupIds)
      .or("english_definition.is.null,synonyms.eq.{},antonyms.eq.{}")
      .limit(batchSize);

    if (!words?.length) {
      return new Response(JSON.stringify({ message: "No words need enrichment", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const wordList = words.map(w => `${w.word} (${w.meaning})`).join("\n");

    const prompt = `You are a vocabulary expert. For each word below, provide:
1. A clear English definition (1 sentence, suitable for a dictionary)
2. 2-3 synonyms (single words only, CEFR A2-C1 level)
3. 1-2 antonyms (single words only, CEFR A2-C1 level). If no clear antonym exists, leave empty.

Words:
${wordList}

Respond in this exact JSON format (array):
[
  {
    "word": "the word",
    "english_definition": "definition here",
    "synonyms": ["syn1", "syn2"],
    "antonyms": ["ant1"]
  }
]

Rules:
- Synonyms and antonyms must be SINGLE WORDS (no phrases)
- Definitions should be concise and clear
- If a word has no clear antonyms, use an empty array []
- Match the meaning context given in parentheses`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a vocabulary expert. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI response");
    
    const enrichedWords = JSON.parse(jsonMatch[0]);
    
    // Update each word in DB
    let updated = 0;
    for (const enriched of enrichedWords) {
      const original = words.find(w => w.word.toLowerCase() === enriched.word.toLowerCase());
      if (!original) continue;

      const updateData: Record<string, any> = {};
      if (!original.english_definition && enriched.english_definition) {
        updateData.english_definition = enriched.english_definition;
      }
      if ((!original.synonyms || original.synonyms.length === 0) && enriched.synonyms?.length > 0) {
        updateData.synonyms = enriched.synonyms;
      }
      if ((!original.antonyms || original.antonyms.length === 0) && enriched.antonyms?.length > 0) {
        updateData.antonyms = enriched.antonyms;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase.from("words").update(updateData).eq("id", original.id);
        if (!error) updated++;
      }
    }

    return new Response(JSON.stringify({ 
      message: `Enriched ${updated} words`, 
      processed: updated,
      total: words.length,
      remaining: words.length - updated 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("enrich-word-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
