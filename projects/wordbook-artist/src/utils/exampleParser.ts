import mammoth from 'mammoth';
import { supabase } from '@/integrations/supabase/client';

interface ParsedExample {
  number: number;
  english: string;
  korean: string;
}

interface DayExamples {
  dayNumber: number;
  examples: ParsedExample[];
}

/**
 * Extract text from a DOCX file using mammoth
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Parse the extracted text into structured DAY → examples mapping
 */
export function parseExamplesText(text: string): DayExamples[] {
  const days: DayExamples[] = [];
  
  // Split by DAY headers
  const dayPattern = /DAY\s*(\d+)/gi;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentDay: number | null = null;
  let currentExamples: ParsedExample[] = [];
  let currentNumber = 0;
  let lastEnglish = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for DAY header
    const dayMatch = line.match(/^DAY\s*(\d+)$/i);
    if (dayMatch) {
      // Save previous day
      if (currentDay !== null && currentExamples.length > 0) {
        days.push({ dayNumber: currentDay, examples: currentExamples });
      }
      currentDay = parseInt(dayMatch[1]);
      currentExamples = [];
      currentNumber = 0;
      lastEnglish = '';
      continue;
    }
    
    // Skip non-content lines
    if (line.includes('해커스 보카') || line.includes('예문 영작테스트') || line.includes('필사노트') || line.includes('정답')) {
      continue;
    }
    
    // Check for numbered example line: "1. English text" or just a number
    const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (numberedMatch) {
      const num = parseInt(numberedMatch[1]);
      const content = numberedMatch[2].trim();
      
      // If there's a previous English waiting for Korean, save it without Korean
      if (lastEnglish && currentNumber > 0) {
        // Check if current line might be Korean for previous
        // No, this is a new numbered item
        currentExamples.push({ number: currentNumber, english: lastEnglish, korean: '' });
      }
      
      currentNumber = num;
      lastEnglish = content;
      continue;
    }
    
    // Check if this line is Korean (contains Korean characters) - it's the translation of lastEnglish
    const hasKorean = /[\uAC00-\uD7AF]/.test(line);
    if (hasKorean && lastEnglish && currentNumber > 0) {
      currentExamples.push({ number: currentNumber, english: lastEnglish, korean: line });
      lastEnglish = '';
      continue;
    }
    
    // If we have a pending English without Korean and hit a non-Korean, non-numbered line
    if (lastEnglish && currentNumber > 0 && !hasKorean) {
      // Could be continuation of English or something else
      // Save without Korean
      currentExamples.push({ number: currentNumber, english: lastEnglish, korean: '' });
      lastEnglish = '';
    }
  }
  
  // Save last day
  if (lastEnglish && currentNumber > 0) {
    currentExamples.push({ number: currentNumber, english: lastEnglish, korean: '' });
  }
  if (currentDay !== null && currentExamples.length > 0) {
    days.push({ dayNumber: currentDay, examples: currentExamples });
  }
  
  return days;
}

/**
 * Match parsed examples to 표제어 words in the database and insert into word_examples
 */
export async function insertExamplesToWorkbook(
  workbookId: string,
  dayExamples: DayExamples[],
  onProgress?: (percent: number) => void
): Promise<number> {
  let totalInserted = 0;
  
  // Get all day_groups for this workbook
  const { data: dayGroups, error: dgError } = await supabase
    .from('day_groups')
    .select('id, day_name, sort_order')
    .eq('workbook_id', workbookId)
    .order('sort_order');
  
  if (dgError || !dayGroups) {
    throw new Error('Failed to load day groups: ' + dgError?.message);
  }
  
  for (let i = 0; i < dayExamples.length; i++) {
    const de = dayExamples[i];
    
    // Find matching day_group by day number
    const dayName = `DAY ${String(de.dayNumber).padStart(2, '0')}`;
    const dayGroup = dayGroups.find(dg => dg.day_name === dayName);
    
    if (!dayGroup) {
      console.warn(`Day group not found for ${dayName}`);
      continue;
    }
    
    // Get 표제어 words for this day, sorted by sort_order
    const { data: words, error: wError } = await supabase
      .from('words')
      .select('id, word, sort_order, word_type')
      .eq('day_group_id', dayGroup.id)
      .eq('word_type', '표제어')
      .order('sort_order');
    
    if (wError || !words) {
      console.warn(`Failed to load words for ${dayName}:`, wError?.message);
      continue;
    }
    
    // Match examples to 표제어 by position (example 1 → first 표제어, etc.)
    const exampleInserts: { word_id: string; english: string; korean: string | null; sort_order: number }[] = [];
    
    for (const ex of de.examples) {
      const wordIndex = ex.number - 1; // 1-based to 0-based
      if (wordIndex >= 0 && wordIndex < words.length) {
        exampleInserts.push({
          word_id: words[wordIndex].id,
          english: ex.english,
          korean: ex.korean || null,
          sort_order: 0,
        });
      }
    }
    
    // Batch insert examples
    if (exampleInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('word_examples')
        .insert(exampleInserts);
      
      if (insertError) {
        console.warn(`Failed to insert examples for ${dayName}:`, insertError.message);
      } else {
        totalInserted += exampleInserts.length;
      }
    }
    
    if (onProgress) {
      onProgress(Math.round(((i + 1) / dayExamples.length) * 100));
    }
  }
  
  return totalInserted;
}
