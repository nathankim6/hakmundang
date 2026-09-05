import * as XLSX from 'xlsx';
import { VocabularyWord, DayGroup, WordType } from '@/types/vocabulary';

export const parseExcelFile = (file: File): Promise<DayGroup[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        if (jsonData.length < 2) {
          reject(new Error('No data found'));
          return;
        }

        // Detect format by checking header row and data
        const header = jsonData[0];
        const hasWordType = header && header.length >= 4 && 
          String(header[1] || '').trim().includes('유형');
        
        // Detect 4-column format: Day, #, Word, Meaning (number in col 1)
        const firstDataRow = jsonData[1];
        const isNumberedFormat = firstDataRow && firstDataRow.length >= 4 && 
          !isNaN(Number(firstDataRow[1]));
        
        // Detect if there are "Plus" days (e.g., "Day 01 Plus")
        const hasPlusDays = jsonData.some(row => 
          row && String(row[0] || '').toLowerCase().includes('plus')
        );
        
        const words: VocabularyWord[] = [];
        
        // Start from row 0 if numbered format (no header), else row 1
        const startRow = isNumberedFormat ? 0 : 1;
        
        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 3) continue;
          
          if (hasWordType) {
            // 5-column format: DAY, 단어유형, 단어, 뜻, 예문
            const day = String(row[0] || '').trim();
            const wordType = String(row[1] || '').trim() as WordType;
            const word = String(row[2] || '').trim();
            const meaning = String(row[3] || '').trim();
            const exampleText = String(row[4] || '').trim();
            
            if (!word || !meaning) continue;
            
            const examples = exampleText ? [{ english: exampleText, korean: '' }] : undefined;
            
            words.push({
              id: `${day}-${i}`,
              day: day || 'day1',
              word,
              meaning,
              wordType: wordType || undefined,
              examples,
              pronunciation: undefined,
              partsOfSpeech: undefined,
              meaningSegments: undefined,
            });
          } else if (isNumberedFormat) {
            // 4-column format: Day, #, Word, Meaning
            const dayRaw = String(row[0] || '').trim();
            const word = String(row[2] || '').trim();
            const meaning = String(row[3] || '').trim();
            
            if (!word || !meaning) continue;
            
            // Determine if this is a Plus day
            const isPlus = dayRaw.toLowerCase().includes('plus');
            // Extract base day name (e.g., "Day 01 Plus" -> "Day 01")
            const baseDayMatch = dayRaw.match(/day\s*(\d+)/i);
            const baseDayNum = baseDayMatch ? baseDayMatch[1].padStart(2, '0') : '01';
            const day = `DAY ${baseDayNum}`;
            
            words.push({
              id: `${day}-${isPlus ? 'plus-' : ''}${i}`,
              day,
              word,
              meaning,
              wordType: isPlus ? '파생어' : '표제어',
              pronunciation: undefined,
              examples: undefined,
              partsOfSpeech: undefined,
              meaningSegments: undefined,
            });
          } else {
            // 3-column format: DAY, 단어, 뜻
            const day = String(row[0] || '').trim();
            const word = String(row[1] || '').trim();
            const meaning = String(row[2] || '').trim();
            
            if (!word || !meaning) continue;
            
            words.push({
              id: `${day}-${i}`,
              day: day || 'day1',
              word,
              meaning,
              pronunciation: undefined,
              examples: undefined,
              partsOfSpeech: undefined,
              meaningSegments: undefined,
            });
          }
        }
        
        // Split derivatives with comma-separated words into individual entries
        const expandedWords = splitCommaDerivatives(words);
        const dayGroups = groupByDay(expandedWords);
        resolve(dayGroups);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Check if parsed data has word types
export const hasWordTypes = (dayGroups: DayGroup[]): boolean => {
  return dayGroups.some(g => g.words.some(w => w.wordType));
};

// Check if parsed data needs derivative matching (Plus-day format)
export const needsDerivativeMatching = (dayGroups: DayGroup[]): boolean => {
  return dayGroups.some(g => {
    const words = g.words;
    const hasHeadwords = words.some(w => w.wordType === '표제어');
    const hasDerivatives = words.some(w => w.wordType === '파생어');
    if (!hasHeadwords || !hasDerivatives) return false;
    // Check if all headwords come before all derivatives (not interleaved)
    const lastHwIdx = Math.max(...words.map((w, i) => w.wordType === '표제어' ? i : -1));
    const firstDvIdx = Math.min(...words.map((w, i) => w.wordType === '파생어' ? i : words.length));
    return lastHwIdx < firstDvIdx;
  });
};

const splitCommaDerivatives = (words: VocabularyWord[]): VocabularyWord[] => {
  const result: VocabularyWord[] = [];
  for (const w of words) {
    if (w.wordType === '파생어' && w.word.includes(',')) {
      const parts = w.word.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        parts.forEach((part, idx) => {
          result.push({
            ...w,
            id: `${w.id}-split-${idx}`,
            word: part,
          });
        });
        continue;
      }
    }
    result.push(w);
  }
  return result;
};

const groupByDay = (words: VocabularyWord[]): DayGroup[] => {
  const groups: Record<string, VocabularyWord[]> = {};
  
  words.forEach((word) => {
    const day = word.day.toLowerCase().replace(/\s+/g, '');
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(word);
  });
  
  return Object.entries(groups).map(([day, words]) => ({
    day: formatDayName(day),
    words,
  }));
};

const formatDayName = (day: string): string => {
  const match = day.match(/day\s*(\d+)/i);
  if (match) {
    return `DAY ${match[1].padStart(2, '0')}`;
  }
  return day.toUpperCase();
};
