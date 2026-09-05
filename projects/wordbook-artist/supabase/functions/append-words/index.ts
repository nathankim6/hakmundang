import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIVocabularyResult {
  word: string;
  pronunciation: string;
  meaningSegments?: { partOfSpeech: string; meaning: string }[];
  synonyms?: string[];
  antonyms?: string[];
  synonymsKorean?: string[];
  antonymsKorean?: string[];
  examples: { english: string; korean: string }[];
}

const difficultyPrompts: Record<string, string> = {
  elementary: `You are a vocabulary assistant for elementary school students (CEFR A1-A2 level).`,
  middle: `You are a vocabulary assistant for middle school students (CEFR B1-B2 level).`,
  high: `You are a vocabulary assistant for high school students (CEFR B2-C1 level).`
};

async function generateVocabularyWithAI(
  words: { word: string; meaning: string }[],
  difficultyLevel: string,
  includeExamples: boolean,
  apiKey: string,
  useGateway: boolean = false
): Promise<AIVocabularyResult[]> {
  const results: AIVocabularyResult[] = [];
  const chunkSize = includeExamples ? 5 : 15; // Process more words at once when no examples
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    
    try {
      const prompt = `${difficultyPrompts[difficultyLevel] || difficultyPrompts.middle}

For each English word below, provide:
1. IPA pronunciation (in slashes like /word/)
2. Part of speech abbreviation in Korean (명, 동, 형, 부, etc.)
3. 1-2 synonyms in English
4. 1-2 antonyms in English (if applicable)
5. Korean translations of synonyms
6. Korean translations of antonyms
${includeExamples ? '7. One example sentence with Korean translation' : ''}

Words to process:
${chunk.map((w, idx) => `${idx + 1}. ${w.word} - ${w.meaning}`).join('\n')}

Respond in this exact JSON format:
{
  "results": [
    {
      "word": "example",
      "pronunciation": "/ɪɡˈzæmpəl/",
      "partOfSpeech": "명",
      "synonyms": ["instance", "sample"],
      "antonyms": [],
      "synonymsKorean": ["사례", "표본"],
      "antonymsKorean": []${includeExamples ? ',\n      "examples": [{"english": "This is an example.", "korean": "이것은 예시입니다."}]' : ''}
    }
  ]
}`;

      const endpoint = useGateway 
        ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      
      const model = useGateway ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a vocabulary generation assistant. Always respond with valid JSON only, no markdown.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: includeExamples ? 4000 : 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', response.status, errorText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Clean markdown code blocks if present
      let cleanContent = content;
      if (content.includes('```')) {
        cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      }
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.results) {
          parsed.results.forEach((r: any) => {
            results.push({
              word: r.word,
              pronunciation: r.pronunciation || `/${r.word.toLowerCase()}/`,
              meaningSegments: r.partOfSpeech ? [{ partOfSpeech: r.partOfSpeech, meaning: '' }] : [],
              synonyms: r.synonyms || [],
              antonyms: r.antonyms || [],
              synonymsKorean: r.synonymsKorean || [],
              antonymsKorean: r.antonymsKorean || [],
              examples: r.examples || []
            });
          });
        }
      }
      
      console.log(`Processed ${chunk.length} words (chunk ${Math.floor(i/chunkSize) + 1})`);
    } catch (err) {
      console.error('AI generation error for chunk:', err);
      // Fallback: add words without AI data
      chunk.forEach(w => {
        results.push({
          word: w.word,
          pronunciation: '',
          meaningSegments: [],
          synonyms: [],
          antonyms: [],
          synonymsKorean: [],
          antonymsKorean: [],
          examples: []
        });
      });
    }
    
    // Small delay between chunks
    if (i + chunkSize < words.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
}

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

    const { workbookId, entries, startSortOrder, difficultyLevel = 'middle', includeExamples = false } = await req.json();

    if (!workbookId || !entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${entries.length} days starting from sort_order ${startSortOrder}, includeExamples: ${includeExamples}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Try Lovable AI first, fallback to OpenAI
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    const useGateway = !!lovableKey;
    const apiKey = lovableKey || openaiKey;
    
    if (!apiKey) {
      throw new Error('No AI API key configured');
    }
    
    console.log(`Using ${useGateway ? 'Lovable AI Gateway' : 'OpenAI'}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const processedDays: string[] = [];
    let totalWordsAdded = 0;
    let currentSortOrder = startSortOrder;

    for (const dayEntry of entries) {
      const { dayName, words: dayWords } = dayEntry;
      
      console.log(`Processing ${dayName} with ${dayWords.length} words`);

      // Create day_group
      const { data: dayGroup, error: dayGroupError } = await supabase
        .from('day_groups')
        .insert({
          workbook_id: workbookId,
          day_name: dayName,
          sort_order: currentSortOrder
        })
        .select()
        .single();

      if (dayGroupError) {
        console.error(`Error creating day_group for ${dayName}:`, dayGroupError);
        throw dayGroupError;
      }

      // Generate AI data for words
      const aiResults = await generateVocabularyWithAI(
        dayWords.map((w: { word: string; meaning: string }) => ({ word: w.word, meaning: w.meaning })),
        difficultyLevel,
        includeExamples,
        apiKey,
        useGateway
      );

      const resultMap = new Map<string, AIVocabularyResult>();
      aiResults.forEach(r => resultMap.set(r.word.toLowerCase(), r));

      // Insert words in batches for efficiency
      const wordInserts = dayWords.map((wordEntry: { word: string; meaning: string }, i: number) => {
        const aiData = resultMap.get(wordEntry.word.toLowerCase());
        return {
          day_group_id: dayGroup.id,
          word: wordEntry.word,
          meaning: wordEntry.meaning,
          part_of_speech: aiData?.meaningSegments?.[0]?.partOfSpeech || null,
          pronunciation: aiData?.pronunciation || null,
          synonyms: aiData?.synonyms || [],
          synonyms_korean: aiData?.synonymsKorean || [],
          antonyms: aiData?.antonyms || [],
          antonyms_korean: aiData?.antonymsKorean || [],
          sort_order: i
        };
      });

      const { data: insertedWords, error: wordsError } = await supabase
        .from('words')
        .insert(wordInserts)
        .select();

      if (wordsError) {
        console.error(`Error inserting words for ${dayName}:`, wordsError);
        throw wordsError;
      }

      // Insert examples if needed
      if (includeExamples && insertedWords) {
        const exampleInserts: { word_id: string; english: string; korean: string; sort_order: number }[] = [];
        
        insertedWords.forEach((insertedWord) => {
          const aiData = resultMap.get(insertedWord.word.toLowerCase());
          if (aiData?.examples && aiData.examples.length > 0) {
            aiData.examples.forEach((ex, idx) => {
              exampleInserts.push({
                word_id: insertedWord.id,
                english: ex.english,
                korean: ex.korean,
                sort_order: idx
              });
            });
          }
        });

        if (exampleInserts.length > 0) {
          await supabase.from('word_examples').insert(exampleInserts);
        }
      }

      totalWordsAdded += insertedWords?.length || 0;
      processedDays.push(dayName);
      currentSortOrder++;
      console.log(`Completed ${dayName}: ${insertedWords?.length || 0} words added`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        wordsAdded: totalWordsAdded,
        daysAdded: processedDays,
        nextSortOrder: currentSortOrder
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in append-words function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});