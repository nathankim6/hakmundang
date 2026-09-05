import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedExample {
  number: number;
  english: string;
  korean: string;
}

interface DayExamples {
  dayNumber: number;
  examples: ParsedExample[];
}

function parseExamplesText(text: string): DayExamples[] {
  const days: DayExamples[] = [];
  const lines = text.split('\n');
  
  let currentDay: number | null = null;
  let currentExamples: ParsedExample[] = [];
  let currentNumber = 0;
  let currentEnglish = '';
  let state: 'idle' | 'expectEnglish' | 'expectKorean' = 'idle';
  
  // Debug: log first 500 chars
  console.log('First 500 chars:', JSON.stringify(text.substring(0, 500)));
  
  // Find "DAY" occurrences for debug
  const dayOccurrences = [];
  let searchIdx = 0;
  while ((searchIdx = text.indexOf('DAY', searchIdx)) !== -1) {
    dayOccurrences.push({ idx: searchIdx, context: JSON.stringify(text.substring(searchIdx, searchIdx + 20)) });
    searchIdx += 3;
    if (dayOccurrences.length >= 5) break;
  }
  console.log('DAY occurrences:', JSON.stringify(dayOccurrences));
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r/g, '').trim();
    if (!line) continue;
    
    // Check for DAY header - flexible match allowing surrounding junk
    const dayMatch = line.match(/DAY\s*(\d+)/i);
    // Only treat as DAY header if line is short-ish (avoid matching inside sentences)
    if (dayMatch && line.length < 40 && !/[a-z]{3,}/i.test(line.replace(/DAY\s*\d+/i, '').trim())) {
      // Save pending example
      if (state === 'expectKorean' && currentEnglish) {
        currentExamples.push({ number: currentNumber, english: currentEnglish, korean: '' });
      }
      if (currentDay !== null && currentExamples.length > 0) {
        days.push({ dayNumber: currentDay, examples: [...currentExamples] });
      }
      currentDay = parseInt(dayMatch[1]);
      currentExamples = [];
      state = 'idle';
      currentEnglish = '';
      continue;
    }
    
    // Skip junk lines
    if (line.includes('영작테스트') || line.includes('필사노트') || line.includes('정답') || line.includes('링크') ||
        line.includes('\xbf\xb5\xc0\xdb') || line.includes('\xc7\xca\xbb\xe7') || line.includes('\xc1\xa4\xb4\xd9')) continue;
    
    // Check for standalone number like "1." or "26."
    const numberMatch = line.match(/^(\d+)\.$/);
    if (numberMatch) {
      // Save pending
      if (state === 'expectKorean' && currentEnglish) {
        currentExamples.push({ number: currentNumber, english: currentEnglish, korean: '' });
      }
      currentNumber = parseInt(numberMatch[1]);
      state = 'expectEnglish';
      currentEnglish = '';
      continue;
    }
    
    // Check for "1. English text" on same line
    const inlineMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (inlineMatch && /[a-zA-Z]/.test(inlineMatch[2])) {
      // Save pending
      if (state === 'expectKorean' && currentEnglish) {
        currentExamples.push({ number: currentNumber, english: currentEnglish, korean: '' });
      }
      currentNumber = parseInt(inlineMatch[1]);
      currentEnglish = inlineMatch[2].trim();
      state = 'expectKorean';
      continue;
    }
    
    // If expecting English after a number
    if (state === 'expectEnglish' && /[a-zA-Z]/.test(line)) {
      currentEnglish = line;
      state = 'expectKorean';
      continue;
    }
    
    // If expecting Korean after English - detect as non-English text
    // Korean in UTF-8: \uAC00-\uD7AF, in garbled EUC-KR: high bytes
    const hasKorean = /[\uAC00-\uD7AF]/.test(line) || 
      (!(/^[a-zA-Z0-9\s.,!?'"()\-;:\/\\@#$%^&*+=\[\]{}|<>~`]+$/).test(line) && !/^\d+\.\s*$/.test(line));
    if (state === 'expectKorean' && hasKorean && !/^\d+\./.test(line)) {
      currentExamples.push({ number: currentNumber, english: currentEnglish, korean: line });
      state = 'idle';
      currentEnglish = '';
      continue;
    }
  }
  
  // Save last pending
  if (state === 'expectKorean' && currentEnglish) {
    currentExamples.push({ number: currentNumber, english: currentEnglish, korean: '' });
  }
  if (currentDay !== null && currentExamples.length > 0) {
    days.push({ dayNumber: currentDay, examples: currentExamples });
  }
  
  return days;
}

// Fix encoding issues: replace common mojibake patterns
function fixEncoding(text: string): string {
  // Replace right single quotation mark mojibake and other common issues
  return text
    .replace(/\ufffd/g, "'")  // replacement character → apostrophe
    .replace(/â€™/g, "'")     // UTF-8 mojibake for '
    .replace(/â€œ/g, '"')     // UTF-8 mojibake for "
    .replace(/â€\u009d/g, '"') // UTF-8 mojibake for "
    .replace(/â€"/g, '—')     // em dash
    .replace(/â€"/g, '–');    // en dash
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workbookId, examplesText, fileUrl, clearExisting } = await req.json();
    
    let text = examplesText;
    
    // If fileUrl provided, fetch the text
    if (fileUrl && !text) {
      console.log('Fetching from URL:', fileUrl);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return new Response(JSON.stringify({ error: `Failed to fetch file: ${response.status}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      // Get raw bytes and try both encodings
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      console.log('First 20 bytes:', Array.from(bytes.slice(0, 20)).map(b => b.toString(16)).join(' '));
      
      // Try EUC-KR first
      try {
        const eucKrText = new TextDecoder('euc-kr', { fatal: false }).decode(bytes);
        const koreanCount = (eucKrText.match(/[\uAC00-\uD7AF]/g) || []).length;
        console.log('EUC-KR Korean chars:', koreanCount, 'sample:', eucKrText.substring(0, 100));
        if (koreanCount > 0) {
          text = eucKrText;
          console.log('Using EUC-KR encoding');
        }
      } catch(e) {
        console.log('EUC-KR failed:', e.message);
      }
      
      if (!text) {
        text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        console.log('Using UTF-8 encoding');
      }
      console.log('Fetched text length:', text?.length);
    }
    
    if (!workbookId || !text) {
      return new Response(JSON.stringify({ error: 'Missing workbookId or examplesText/fileUrl' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fix encoding issues
    text = fixEncoding(text);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // If clearExisting, delete old examples for this workbook
    if (clearExisting) {
      const { data: dayGroups } = await supabase
        .from('day_groups')
        .select('id')
        .eq('workbook_id', workbookId);
      
      if (dayGroups && dayGroups.length > 0) {
        for (const dg of dayGroups) {
          const { data: words } = await supabase
            .from('words')
            .select('id')
            .eq('day_group_id', dg.id)
            .eq('word_type', '표제어');
          
          if (words && words.length > 0) {
            const wordIds = words.map(w => w.id);
            await supabase.from('word_examples').delete().in('word_id', wordIds);
          }
        }
      }
      console.log('Cleared existing examples');
    }

    // Parse examples
    const dayExamples = parseExamplesText(text);
    console.log(`Parsed ${dayExamples.length} days of examples`);
    
    // Log sample to verify Korean parsing
    if (dayExamples.length > 0 && dayExamples[0].examples.length > 0) {
      console.log('Sample:', JSON.stringify(dayExamples[0].examples[0]));
    }

    // Get all day_groups for this workbook
    const { data: dayGroups, error: dgError } = await supabase
      .from('day_groups')
      .select('id, day_name, sort_order')
      .eq('workbook_id', workbookId)
      .order('sort_order');

    if (dgError) throw new Error(`Failed to load day groups: ${dgError.message}`);

    let totalInserted = 0;
    const errors: string[] = [];

    for (const de of dayExamples) {
      const dayName = `DAY ${String(de.dayNumber).padStart(2, '0')}`;
      const dayGroup = dayGroups?.find(dg => dg.day_name === dayName);
      
      if (!dayGroup) {
        errors.push(`Day group not found: ${dayName}`);
        continue;
      }

      // Get 표제어 words for this day
      const { data: words, error: wError } = await supabase
        .from('words')
        .select('id, word, sort_order')
        .eq('day_group_id', dayGroup.id)
        .eq('word_type', '표제어')
        .order('sort_order');

      if (wError || !words) {
        errors.push(`Failed to load words for ${dayName}`);
        continue;
      }

      // Match examples to 표제어 by position
      const inserts: { word_id: string; english: string; korean: string | null; sort_order: number }[] = [];
      
      for (const ex of de.examples) {
        const wordIndex = ex.number - 1;
        if (wordIndex >= 0 && wordIndex < words.length) {
          inserts.push({
            word_id: words[wordIndex].id,
            english: fixEncoding(ex.english),
            korean: ex.korean ? fixEncoding(ex.korean) : null,
            sort_order: 0,
          });
        }
      }

      if (inserts.length > 0) {
        for (let b = 0; b < inserts.length; b += 50) {
          const batch = inserts.slice(b, b + 50);
          const { error: insertError } = await supabase
            .from('word_examples')
            .insert(batch);
          
          if (insertError) {
            errors.push(`Insert error for ${dayName}: ${insertError.message}`);
          } else {
            totalInserted += batch.length;
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      totalInserted, 
      daysProcessed: dayExamples.length,
      errors: errors.length > 0 ? errors : undefined 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
