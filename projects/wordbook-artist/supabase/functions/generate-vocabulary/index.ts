import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map difficulty levels to CEFR descriptions
const difficultyPrompts: Record<string, string> = {
  elementary: `Use simple vocabulary and sentence structures appropriate for elementary school students (CEFR A2~B1 level).
- Use basic, everyday vocabulary
- Keep sentences short and simple (under 10 words)
- Use present tense primarily
- Avoid complex grammar structures`,
  
  middle: `Use intermediate vocabulary and sentence structures appropriate for middle school students (CEFR B2~C1 level).
- Use varied vocabulary with some advanced words
- Create moderately complex sentences (10-15 words)
- Include various tenses and grammar patterns
- Balance clarity with linguistic richness`,
  
  high: `Use advanced vocabulary and sophisticated sentence structures appropriate for high school students (CEFR C1~C2 level).
- Use rich, academic vocabulary
- Create complex, nuanced sentences (15-20 words)
- Include advanced grammar structures (subjunctive, passive voice, etc.)
- Demonstrate natural, native-like expressions`
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
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { words, difficultyLevel = 'middle', includeExamples = true } = await req.json();
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Words array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const difficultyInstruction = difficultyPrompts[difficultyLevel] || difficultyPrompts.middle;

    // Process words in batches of 10 for efficiency
    const batchSize = 10;
    const results: any[] = [];
    
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const wordsToProcess = batch.map((w: any) => ({
        word: w.word,
        meaning: w.meaning
      }));

      console.log(`Processing batch ${i / batchSize + 1}:`, wordsToProcess.map((w: any) => w.word));
      console.log(`Difficulty level: ${difficultyLevel}, Include examples: ${includeExamples}`);

      const exampleInstructions = includeExamples 
        ? `6. ONE example sentence with Korean translation that demonstrates the word's meaning
   ${difficultyInstruction}`
        : `6. Do NOT include example sentences - leave the examples array empty []`;

      const prompt = `You are an expert English-Korean language teacher. For each word, provide:
1. IPA pronunciation in international phonetic alphabet format (e.g., /ˈwɜːrd/)
2. Analyze the Korean meaning and identify ALL parts of speech present
3. Split the meaning into segments, each with its own part of speech
4. Synonyms and antonyms that are AT THE SAME DIFFICULTY LEVEL as the headword (not easier or harder)
5. Korean translations for each synonym and antonym (synonymsKorean and antonymsKorean arrays)
${exampleInstructions}
7. English definition: A clear, concise definition in simple English (like from a learner's dictionary). This should help students understand the word without Korean translation.
8. Etymology: The word's origin and history (e.g., "From Latin 'aqua' meaning water" or "Old English 'hūs', related to German 'Haus'"). Include the language of origin and any interesting word history that helps memorization.

CRITICAL RULES FOR SYNONYMS AND ANTONYMS:
- ONLY include synonyms/antonyms that are TRULY interchangeable in meaning
- Do NOT force 3 of each - quality over quantity. Prefer EMPTY arrays over forced ones
- If a word has NO true synonyms, return an empty array []
- If a word has NO true antonyms, return an empty array []

WORDS THAT SHOULD HAVE EMPTY SYNONYM/ANTONYM ARRAYS:
- Concrete nouns for specific objects: "sideburns", "beard", "mustache", "eyebrow" (these describe specific things, not interchangeable concepts)
- Proper nouns or unique entities
- Technical terms with precise definitions
- Body parts or physical features that are distinct (e.g., "beard" is NOT a synonym of "facial hair" - it's a TYPE of facial hair)
- Do NOT confuse "related words" or "category members" with "synonyms"
  - BAD: "beard" synonyms: ["facial hair", "whiskers"] - these are category/related, not synonyms
  - GOOD: "happy" synonyms: ["glad", "joyful", "pleased"] - these ARE interchangeable
- Do NOT list opposites that are conceptually unrelated as antonyms
  - BAD: "sideburns" antonyms: ["bald", "bare"] - being bald is not the opposite of having sideburns
  - GOOD: "happy" antonyms: ["sad", "unhappy"] - these ARE true opposites

- Maximum 3 synonyms and 3 antonyms, but ZERO is better than forcing incorrect ones
- Synonyms and antonyms MUST be at the SAME vocabulary level as the headword
  - For elementary words (like "happy"), use elementary-level synonyms (like "glad", "joyful")
  - For advanced words (like "ubiquitous"), use advanced-level synonyms (like "omnipresent", "pervasive")
- Do NOT include generic placeholders like "none" - just use empty arrays
- Korean translations must match the number of English words exactly

For example:
- "의미하다, 뜻하다, 의도하다; 예정하다, 야비한, 비열한, 수단" should be split into:
  - 동 (verb): 의미하다, 뜻하다, 의도하다, 예정하다
  - 형 (adjective): 야비한, 비열한
  - 명 (noun): 수단

Return JSON array with this exact structure:
[
  {
    "word": "happy",
    "pronunciation": "/ˈhæpi/",
    "meaningSegments": [
      { "partOfSpeech": "형", "meaning": "행복한, 기쁜" }
    ],
    "synonyms": ["glad", "joyful"],
    "synonymsKorean": ["기쁜", "즐거운"],
    "antonyms": ["sad", "unhappy"],
    "antonymsKorean": ["슬픈", "불행한"],
    "englishDefinition": "Feeling or showing pleasure and contentment; having a sense of well-being.",
    "etymology": "From Middle English 'hap' meaning luck or fortune. Originally meant 'lucky' before evolving to mean 'pleased' or 'content'.",
    "examples": ${includeExamples ? `[
      { "english": "She feels happy today.", "korean": "그녀는 오늘 행복하다." }
    ]` : '[]'}
  },
  {
    "word": "bear",
    "pronunciation": "/beər/",
    "meaningSegments": [
      { "partOfSpeech": "명", "meaning": "곰" }
    ],
    "synonyms": [],
    "synonymsKorean": [],
    "antonyms": [],
    "antonymsKorean": [],
    "englishDefinition": "A large, heavy mammal with thick fur and a short tail.",
    "etymology": "From Old English 'bera', related to German 'Bär' and Dutch 'beer'. The word has Indo-European roots meaning 'brown'.",
    "examples": ${includeExamples ? `[
      { "english": "A bear was walking through the forest.", "korean": "곰이 숲 속을 걸어가고 있었다." }
    ]` : '[]'}
  }
]

Parts of speech abbreviations to use (Korean):
- 명 (noun)
- 동 (verb)  
- 형 (adjective)
- 부 (adverb)
- 전 (preposition)
- 접 (conjunction)
- 감 (interjection)
- 대 (pronoun)
- 조 (auxiliary verb)

Words to process:
${JSON.stringify(wordsToProcess, null, 2)}

Important:
- Use correct IPA symbols
- Carefully analyze the Korean meaning to identify ALL parts of speech
- Group related meanings under the same part of speech
- Only include synonyms/antonyms that genuinely exist - empty arrays are acceptable
- Synonyms and antonyms MUST be at the same vocabulary level as the headword
- English definitions should be clear and learner-friendly
- Etymology should trace the word's origin and include interesting facts for memorization
${includeExamples ? '- Provide exactly ONE example sentence per word that naturally demonstrates the word\'s meaning\n- Korean translations should be natural and accurate' : '- Do NOT include any example sentences'}
- Return ONLY the JSON array, no additional text`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful English-Korean language expert. Always respond with valid JSON only. Pay special attention to correctly identifying and separating different parts of speech in Korean meanings. Be VERY STRICT about synonyms and antonyms: only include words that are TRULY interchangeable in meaning. Concrete nouns (like body parts, objects, animals) typically have NO true synonyms - do NOT confuse "related words" or "category members" with synonyms. For example, "beard", "mustache", "sideburns" are NOT synonyms - they are different things. Empty arrays are PREFERRED over forced, incorrect synonyms/antonyms. Also provide clear English definitions and interesting etymology for each word.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 5000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402 || response.status === 401) {
          return new Response(
            JSON.stringify({ error: 'API key issue. Please check your OpenAI API key.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        console.error('No content in response:', data);
        continue;
      }

      // Parse JSON from response
      try {
        // Extract JSON from markdown code blocks if present
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        
        const parsed = JSON.parse(jsonStr);
        results.push(...parsed);
        console.log(`Successfully processed ${parsed.length} words in batch`);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError, content);
        // Add fallback data for failed batch
        batch.forEach((w: any) => {
          results.push({
            word: w.word,
            pronunciation: `/${w.word.toLowerCase()}/`,
            meaningSegments: [{ partOfSpeech: '명', meaning: w.meaning }],
            synonyms: [],
            synonymsKorean: [],
            antonyms: [],
            antonymsKorean: [],
            englishDefinition: '',
            etymology: '',
            examples: []
          });
        });
      }
    }

    console.log(`Total processed: ${results.length} words`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-vocabulary function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});