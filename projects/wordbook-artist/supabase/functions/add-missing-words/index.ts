import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { workbookId, rawContent } = await req.json();
    
    if (!workbookId || !rawContent) {
      return new Response(
        JSON.stringify({ error: 'workbookId and rawContent are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Parse the raw content - split by Day patterns
    const dayPattern = /Day\s+(\d+)\s+(\S+)\s+([\s\S]*?)(?=Day\s+\d+|$)/gi;
    const wordEntries: { day: string; word: string; meaning: string }[] = [];
    
    // First, normalize the content by handling the tab/space patterns
    const normalizedContent = rawContent.replace(/\s+/g, ' ');
    
    // Extract day-word-meaning patterns
    const matches = normalizedContent.matchAll(/Day\s+(\d+)\s+([a-zA-Z][a-zA-Z\s\-']*?)\s+([가-힣][^\t\n]*?)(?=\s*Day\s+\d+|$)/gi);
    
    for (const match of matches) {
      const dayNum = match[1];
      const word = match[2].trim();
      const meaning = match[3].trim();
      
      if (word && meaning && word.length > 0 && meaning.length > 0) {
        wordEntries.push({
          day: `DAY ${dayNum.padStart(2, '0')}`,
          word: word,
          meaning: meaning
        });
      }
    }

    console.log(`Parsed ${wordEntries.length} word entries from file`);

    if (wordEntries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No words could be parsed from the content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing day groups for this workbook
    const { data: existingDays, error: daysError } = await supabase
      .from('day_groups')
      .select('id, day_name, sort_order')
      .eq('workbook_id', workbookId);

    if (daysError) {
      console.error('Error fetching day groups:', daysError);
      throw daysError;
    }

    const dayGroupMap = new Map<string, string>();
    (existingDays || []).forEach((day: any) => {
      dayGroupMap.set(day.day_name, day.id);
    });

    // Group words by day
    const wordsByDay = new Map<string, { word: string; meaning: string }[]>();
    wordEntries.forEach(entry => {
      if (!wordsByDay.has(entry.day)) {
        wordsByDay.set(entry.day, []);
      }
      wordsByDay.get(entry.day)!.push({ word: entry.word, meaning: entry.meaning });
    });

    console.log(`Words grouped into ${wordsByDay.size} days:`, [...wordsByDay.keys()]);

    // Create missing day groups and collect all words to process
    const allWordsToProcess: { dayGroupId: string; word: string; meaning: string; sortOrder: number }[] = [];
    let maxSortOrder = existingDays?.reduce((max: number, d: any) => Math.max(max, d.sort_order), -1) ?? -1;

    for (const [dayName, words] of wordsByDay) {
      let dayGroupId = dayGroupMap.get(dayName);
      
      if (!dayGroupId) {
        // Create new day group
        maxSortOrder++;
        const { data: newDay, error: createError } = await supabase
          .from('day_groups')
          .insert({
            workbook_id: workbookId,
            day_name: dayName,
            sort_order: maxSortOrder
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error(`Error creating day group ${dayName}:`, createError);
          continue;
        }
        dayGroupId = newDay.id;
        dayGroupMap.set(dayName, dayGroupId as string);
        console.log(`Created new day group: ${dayName}`);
      }

      // Check existing words in this day group
      const { data: existingWords } = await supabase
        .from('words')
        .select('word')
        .eq('day_group_id', dayGroupId);
      
      const existingWordSet = new Set((existingWords || []).map((w: any) => w.word.toLowerCase()));
      const existingWordCount = existingWords?.length || 0;

      words.forEach((w, idx) => {
        if (!existingWordSet.has(w.word.toLowerCase())) {
          allWordsToProcess.push({
            dayGroupId: dayGroupId!,
            word: w.word,
            meaning: w.meaning,
            sortOrder: existingWordCount + idx
          });
        }
      });
    }

    console.log(`Total new words to process: ${allWordsToProcess.length}`);

    if (allWordsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All words already exist in the database', addedCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process words in batches with AI to get synonyms/antonyms
    const batchSize = 10;
    let totalAdded = 0;

    for (let i = 0; i < allWordsToProcess.length; i += batchSize) {
      const batch = allWordsToProcess.slice(i, i + batchSize);
      console.log(`Processing AI batch ${Math.floor(i / batchSize) + 1}: ${batch.map(w => w.word).join(', ')}`);

      // Call OpenAI to get synonyms and antonyms
      const prompt = `You are an expert English-Korean language teacher. For each word, provide:
1. IPA pronunciation
2. Analyze the Korean meaning and identify parts of speech
3. Split meanings by part of speech if multiple exist
4. EXACTLY 2 synonyms and EXACTLY 2 antonyms
5. ONE example sentence with Korean translation

Return JSON array:
[
  {
    "word": "word",
    "pronunciation": "/wɜːrd/",
    "meaningSegments": [{ "partOfSpeech": "명", "meaning": "단어" }],
    "synonyms": ["term", "vocabulary"],
    "antonyms": ["silence", "quiet"],
    "examples": [{ "english": "This word is new.", "korean": "이 단어는 새롭다." }]
  }
]

Parts of speech: 명 (noun), 동 (verb), 형 (adjective), 부 (adverb), 전 (preposition)

Words to process:
${JSON.stringify(batch.map(w => ({ word: w.word, meaning: w.meaning })), null, 2)}

Return ONLY the JSON array.`;

      let aiResults: any[] = [];
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
              { role: 'system', content: 'You are a helpful English-Korean language expert. Always respond with valid JSON only. Always provide exactly 2 synonyms and 2 antonyms for each word.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          console.error('OpenAI API error:', await response.text());
          throw new Error('OpenAI API failed');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        let jsonStr = content;
        const jsonMatch = content?.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
        
        aiResults = JSON.parse(jsonStr);
        console.log(`AI processed ${aiResults.length} words successfully`);
      } catch (aiError) {
        console.error('AI processing failed:', aiError);
        // Fallback to basic data
        aiResults = batch.map(w => ({
          word: w.word,
          pronunciation: '',
          meaningSegments: [{ partOfSpeech: '명', meaning: w.meaning }],
          synonyms: [],
          antonyms: [],
          examples: []
        }));
      }

      // Insert words into database
      for (let j = 0; j < batch.length; j++) {
        const wordData = batch[j];
        const aiData = aiResults.find((a: any) => a.word.toLowerCase() === wordData.word.toLowerCase()) || aiResults[j];

        // Build part of speech string from segments
        const posStr = aiData?.meaningSegments?.map((s: any) => s.partOfSpeech).filter((p: any) => p).join(', ') || null;

        const { data: insertedWord, error: insertError } = await supabase
          .from('words')
          .insert({
            day_group_id: wordData.dayGroupId,
            word: wordData.word,
            meaning: wordData.meaning,
            pronunciation: aiData?.pronunciation || null,
            part_of_speech: posStr,
            sort_order: wordData.sortOrder
          })
          .select('id')
          .single();

        if (insertError) {
          console.error(`Error inserting word ${wordData.word}:`, insertError);
          continue;
        }

        totalAdded++;

        // Insert example if exists
        if (aiData?.examples?.length > 0) {
          const example = aiData.examples[0];
          await supabase.from('word_examples').insert({
            word_id: insertedWord.id,
            english: example.english,
            korean: example.korean,
            sort_order: 0
          });
        }
      }
    }

    console.log(`Successfully added ${totalAdded} words to workbook`);

    return new Response(
      JSON.stringify({ 
        message: `Successfully added ${totalAdded} words with synonyms and antonyms`,
        addedCount: totalAdded,
        daysProcessed: [...wordsByDay.keys()]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-missing-words function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
