import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map ORUN VOCA levels to CEFR difficulty descriptions
const getDifficultyDescription = (level: string): { cefr: string; description: string } => {
  switch (level) {
    case 'elementary':
    case '3':
      return {
        cefr: 'A1-A2',
        description: 'Use only very basic, elementary-level vocabulary (CEFR A1-A2). These are words a beginner English learner would know.'
      };
    case 'middle':
    case '4':
    case '5':
      return {
        cefr: 'A2-B1',
        description: 'Use intermediate vocabulary (CEFR A2-B1). These are common words that middle school students would encounter.'
      };
    case '6':
    case '7':
      return {
        cefr: 'B1-B2',
        description: 'Use upper-intermediate vocabulary (CEFR B1-B2). These are more sophisticated words appropriate for high school students.'
      };
    case 'high':
    case '8':
      return {
        cefr: 'B2-C1',
        description: 'Use advanced vocabulary (CEFR B2-C1). These are academic or literary words for advanced learners.'
      };
    default:
      return {
        cefr: 'A2-B1',
        description: 'Use intermediate vocabulary (CEFR A2-B1).'
      };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { wordIds, difficultyLevel = 'middle', workbookTitle = '' } = await req.json();
    
    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Word IDs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract level from workbook title (e.g., "ORUN VOCA 5" -> "5")
    const titleMatch = workbookTitle.match(/ORUN\s*VOCA\s*(\d+)/i);
    const vocaLevel = titleMatch ? titleMatch[1] : difficultyLevel;
    const difficultyInfo = getDifficultyDescription(vocaLevel);

    console.log(`Workbook: ${workbookTitle}, Detected level: ${vocaLevel}, CEFR: ${difficultyInfo.cefr}`);

    // Fetch words from database
    const { data: words, error: fetchError } = await supabase
      .from('words')
      .select('id, word, meaning')
      .in('id', wordIds);

    if (fetchError) {
      throw new Error(`Failed to fetch words: ${fetchError.message}`);
    }

    if (!words || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No words found with provided IDs' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Regenerating synonyms/antonyms for ${words.length} words at CEFR ${difficultyInfo.cefr}`);

    // Process in batches of 10
    const batchSize = 10;
    const results: any[] = [];

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const wordsToProcess = batch.map((w: any) => ({
        id: w.id,
        word: w.word,
        meaning: w.meaning
      }));

      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}: ${wordsToProcess.map((w: any) => w.word).join(', ')}`);

      const prompt = `You are a strict linguistics expert. Generate ONLY TRUE synonyms and antonyms.

=== CRITICAL: WHAT IS A TRUE SYNONYM? ===
A synonym is a word that can REPLACE the original word in ANY sentence with the EXACT SAME meaning.

TEST: "The [orbit] of the planet is elliptical."
- Can you replace [orbit] with "path"? → "The path of the planet is elliptical." 
  ❌ NO! "path" is more general (a walking path, career path) - NOT a true synonym
- Can you replace [orbit] with "trajectory"? → "The trajectory of the planet is elliptical."
  ❌ NO! "trajectory" describes motion path, but "orbit" specifically means circular/elliptical path around a body

RESULT: "orbit" has NO true synonyms in simple vocabulary. Return synonyms: []

=== CRITICAL: WHAT IS A TRUE ANTONYM? ===
An antonym is a word with the EXACT OPPOSITE meaning.

TEST: What is the opposite of "orbit"?
- "straight line"? ❌ NO! Not opposite - orbit can be elliptical, not necessarily circular vs straight
- "stationary"? ❌ NO! Stationary means not moving, but orbit is a path not motion
- "stop"? ❌ NO! Completely unrelated concept

RESULT: "orbit" has NO true antonyms. Return antonyms: []

=== ABSOLUTE RULES ===

1. **PERFECT INTERCHANGEABILITY TEST**:
   - If the synonym cannot replace the word in 100% of contexts → DON'T include it
   - "happy" ↔ "glad" ✅ (Can always swap)
   - "orbit" ↔ "path" ❌ (Cannot swap - path is too general)

2. **SINGLE WORD ONLY (CRITICAL!)**:
   - ALL synonyms and antonyms MUST be exactly ONE word
   - NO phrases, NO compound words, NO multi-word expressions
   - "cosmic explosion" = ❌ FORBIDDEN
   - "well-known" = ❌ FORBIDDEN (hyphenated counts as multi-word)
   - "ice cream" = ❌ FORBIDDEN
   - "happy" = ✅ ALLOWED
   - If you cannot find a SINGLE-WORD synonym, return empty array []

3. **CEFR A2~C1 LEVEL ONLY (CRITICAL!)**:
   - ALL synonyms and antonyms MUST be within CEFR A2 to C1 vocabulary level
   - ❌ TOO EASY (Below A2): "big", "small", "good" for advanced headwords
   - ❌ TOO HARD (Above C1): "pulchritudinous", "defenestrate", "sesquipedalian"
   - ✅ A2~C1 RANGE: "enormous", "adequate", "profound", "inevitable"
   - If the only valid synonyms are outside A2~C1 range, return empty array []

4. **CONCRETE NOUNS = EMPTY []**:
   - Physical objects: ring, chair, beard → synonyms: [], antonyms: []
   - Animals: dog, cat, penguin → synonyms: [], antonyms: []
   - Body parts: forehead, eyebrow → synonyms: [], antonyms: []

5. **PROPER NOUNS = EMPTY []**:
   - Big Bang, Milky Way, Earth → synonyms: [], antonyms: []

6. **SCIENTIFIC/TECHNICAL TERMS = USUALLY EMPTY []**:
   - orbit, galaxy, nucleus, molecule → Usually no true synonyms exist
   - These have precise technical definitions

7. **VERBS WITH SPECIFIC MEANINGS = USUALLY EMPTY []**:
   - "orbit" (verb: to move in orbit) → No true synonym. "circle" is close but not exact.

8. **WHEN IN DOUBT: RETURN EMPTY ARRAYS []**
   - 10 empty arrays are BETTER than 1 wrong synonym
   - Wrong synonyms confuse students. Empty arrays don't.

=== EXAMPLES OF CORRECT OUTPUT ===

WORD: "happy" (adjective - feeling pleasure)
✅ synonyms: ["glad", "pleased", "joyful"] (all single words, A2~C1 level)
✅ antonyms: ["sad", "unhappy"]
(These are truly interchangeable)

WORD: "orbit" (noun - curved path around celestial body)
✅ synonyms: []
✅ antonyms: []
(No single word can replace "orbit" with exact same meaning)

WORD: "famous" (adjective - widely known)
✅ synonyms: ["renowned", "celebrated"] (single words, A2~C1)
❌ NOT: "well-known" (two words!), "illustrious" (too advanced, C2+)
✅ antonyms: ["unknown", "obscure"]

WORD: "ring" (noun - circular jewelry)
✅ synonyms: []
✅ antonyms: []
(Concrete object - no synonyms)

WORD: "beard" (noun - facial hair on chin)
✅ synonyms: []
✅ antonyms: []
(Body part - no synonyms. Mustache is NOT a synonym!)

WORD: "Big Bang" (proper noun)
✅ synonyms: []
✅ antonyms: []
(Unique entity)

WORD: "run" (verb - move quickly on foot)
✅ synonyms: ["sprint", "dash"] (single words, A2~C1)
✅ antonyms: ["walk", "stop"]
(These can actually replace "run" in sentences)

=== DIFFICULTY LEVEL ===
CEFR: ${difficultyInfo.cefr}
${difficultyInfo.description}

REMEMBER: All outputs must be SINGLE WORDS within CEFR A2~C1 range!

=== WORDS TO PROCESS ===
${JSON.stringify(wordsToProcess, null, 2)}

Return ONLY a JSON array. Most words should have EMPTY arrays. Only common adjectives, verbs, and adverbs typically have true synonyms.

[
  {"id": "uuid", "word": "word", "synonyms": [], "synonymsKorean": [], "antonyms": [], "antonymsKorean": []}
]`;

      let retries = 3;
      let success = false;
      let parsed: any[] = [];

      while (retries > 0 && !success) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { 
                  role: 'system', 
                  content: `You are a strict linguist who ONLY accepts TRUE synonyms and antonyms.

RULE #1: A synonym MUST be 100% interchangeable in ALL contexts.
RULE #2: If you cannot find a TRUE synonym, return an empty array [].
RULE #3: Most nouns (objects, body parts, animals, places) have NO true synonyms.
RULE #4: Scientific/technical terms usually have NO true synonyms.
RULE #5: Only common adjectives, verbs, and adverbs typically have real synonyms.
RULE #6: ALL synonyms/antonyms MUST be SINGLE WORDS ONLY. No phrases, no hyphenated words.
RULE #7: ALL synonyms/antonyms MUST be within CEFR A2~C1 vocabulary level. Not too easy, not too hard.

EXPECTED: 70-80% of words should return empty arrays. This is CORRECT behavior.
Forcing wrong synonyms harms students. Empty arrays are educational honesty.

Always respond with valid JSON only.`
                },
                { role: 'user', content: prompt }
              ],
              max_tokens: 3000,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;

          if (!content) {
            throw new Error('No content in response');
          }

          // Parse JSON from response
          let jsonStr = content;
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
          }

          parsed = JSON.parse(jsonStr);
          success = true;
          console.log(`Successfully processed batch with ${parsed.length} words`);
        } catch (error) {
          retries--;
          console.error(`Retry ${3 - retries}/3 failed:`, error);
          if (retries === 0) {
            // Add fallback empty data for failed batch
            parsed = batch.map((w: any) => ({
              id: w.id,
              word: w.word,
              synonyms: [],
              synonymsKorean: [],
              antonyms: [],
              antonymsKorean: []
            }));
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          }
        }
      }

      // Update database for each word in the batch
      for (const wordData of parsed) {
        const { error: updateError } = await supabase
          .from('words')
          .update({
            synonyms: wordData.synonyms || [],
            synonyms_korean: wordData.synonymsKorean || [],
            antonyms: wordData.antonyms || [],
            antonyms_korean: wordData.antonymsKorean || []
          })
          .eq('id', wordData.id);

        if (updateError) {
          console.error(`Failed to update word ${wordData.id}:`, updateError);
        } else {
          results.push({
            id: wordData.id,
            word: wordData.word,
            synonyms: wordData.synonyms,
            antonyms: wordData.antonyms
          });
        }
      }
    }

    console.log(`Total updated: ${results.length} words`);

    return new Response(
      JSON.stringify({ success: true, updated: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regenerate-synonyms function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
