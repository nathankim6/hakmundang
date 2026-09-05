import { DayGroup } from '@/types/vocabulary';

/**
 * Escapes a CSV field value to handle commas, quotes, and newlines
 */
function escapeCSVField(value: string | undefined): string {
  if (!value) return '';
  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Common English suffixes for word matching
 */
const COMMON_SUFFIXES = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'ment', 'ness', 'tion', 'ation', 'ity', 'ous', 'ive', 'al', 'ful', 'less', 'able', 'ible', 'd', 'n', 'en'];

/**
 * Placeholder patterns to exclude from collocations (e.g., "put A on B")
 */
const PLACEHOLDER_PATTERNS = ['a', 'b', 'c', 'the', 'an', 'one', 'sb', 'sth', 'something', 'someone', 'somebody', 'oneself'];

/**
 * Irregular verb forms mapping (base -> [past, past participle, other forms])
 */
const IRREGULAR_VERBS: Record<string, string[]> = {
  'break': ['broke', 'broken', 'breaks', 'breaking'],
  'take': ['took', 'taken', 'takes', 'taking'],
  'make': ['made', 'makes', 'making'],
  'go': ['went', 'gone', 'goes', 'going'],
  'come': ['came', 'comes', 'coming'],
  'get': ['got', 'gotten', 'gets', 'getting'],
  'give': ['gave', 'given', 'gives', 'giving'],
  'run': ['ran', 'runs', 'running'],
  'see': ['saw', 'seen', 'sees', 'seeing'],
  'do': ['did', 'done', 'does', 'doing'],
  'have': ['had', 'has', 'having'],
  'be': ['was', 'were', 'been', 'is', 'are', 'am', 'being'],
  'write': ['wrote', 'written', 'writes', 'writing'],
  'put': ['puts', 'putting'],
  'set': ['sets', 'setting'],
  'cut': ['cuts', 'cutting'],
  'let': ['lets', 'letting'],
  'hit': ['hits', 'hitting'],
  'read': ['reads', 'reading'],
  'tell': ['told', 'tells', 'telling'],
  'sell': ['sold', 'sells', 'selling'],
  'buy': ['bought', 'buys', 'buying'],
  'bring': ['brought', 'brings', 'bringing'],
  'think': ['thought', 'thinks', 'thinking'],
  'catch': ['caught', 'catches', 'catching'],
  'teach': ['taught', 'teaches', 'teaching'],
  'find': ['found', 'finds', 'finding'],
  'hold': ['held', 'holds', 'holding'],
  'stand': ['stood', 'stands', 'standing'],
  'understand': ['understood', 'understands', 'understanding'],
  'lose': ['lost', 'loses', 'losing'],
  'pay': ['paid', 'pays', 'paying'],
  'meet': ['met', 'meets', 'meeting'],
  'sit': ['sat', 'sits', 'sitting'],
  'speak': ['spoke', 'spoken', 'speaks', 'speaking'],
  'lie': ['lay', 'lain', 'lies', 'lying'],
  'lay': ['laid', 'lays', 'laying'],
  'lead': ['led', 'leads', 'leading'],
  'leave': ['left', 'leaves', 'leaving'],
  'feel': ['felt', 'feels', 'feeling'],
  'keep': ['kept', 'keeps', 'keeping'],
  'begin': ['began', 'begun', 'begins', 'beginning'],
  'show': ['showed', 'shown', 'shows', 'showing'],
  'hear': ['heard', 'hears', 'hearing'],
  'grow': ['grew', 'grown', 'grows', 'growing'],
  'know': ['knew', 'known', 'knows', 'knowing'],
  'throw': ['threw', 'thrown', 'throws', 'throwing'],
  'draw': ['drew', 'drawn', 'draws', 'drawing'],
  'fly': ['flew', 'flown', 'flies', 'flying'],
  'drive': ['drove', 'driven', 'drives', 'driving'],
  'ride': ['rode', 'ridden', 'rides', 'riding'],
  'rise': ['rose', 'risen', 'rises', 'rising'],
  'fall': ['fell', 'fallen', 'falls', 'falling'],
  'eat': ['ate', 'eaten', 'eats', 'eating'],
  'drink': ['drank', 'drunk', 'drinks', 'drinking'],
  'swim': ['swam', 'swum', 'swims', 'swimming'],
  'sing': ['sang', 'sung', 'sings', 'singing'],
  'ring': ['rang', 'rung', 'rings', 'ringing'],
  'wear': ['wore', 'worn', 'wears', 'wearing'],
  'tear': ['tore', 'torn', 'tears', 'tearing'],
  'blow': ['blew', 'blown', 'blows', 'blowing'],
  'choose': ['chose', 'chosen', 'chooses', 'choosing'],
  'freeze': ['froze', 'frozen', 'freezes', 'freezing'],
  'hide': ['hid', 'hidden', 'hides', 'hiding'],
  'bite': ['bit', 'bitten', 'bites', 'biting'],
  'wake': ['woke', 'woken', 'wakes', 'waking'],
  'shake': ['shook', 'shaken', 'shakes', 'shaking'],
  'forget': ['forgot', 'forgotten', 'forgets', 'forgetting'],
  'forgive': ['forgave', 'forgiven', 'forgives', 'forgiving'],
  'steal': ['stole', 'stolen', 'steals', 'stealing'],
  'stick': ['stuck', 'sticks', 'sticking'],
  'strike': ['struck', 'stricken', 'strikes', 'striking'],
  'sweep': ['swept', 'sweeps', 'sweeping'],
  'swing': ['swung', 'swings', 'swinging'],
  'win': ['won', 'wins', 'winning'],
  'fight': ['fought', 'fights', 'fighting'],
  'light': ['lit', 'lighted', 'lights', 'lighting'],
  'shoot': ['shot', 'shoots', 'shooting'],
  'spend': ['spent', 'spends', 'spending'],
  'send': ['sent', 'sends', 'sending'],
  'build': ['built', 'builds', 'building'],
  'lend': ['lent', 'lends', 'lending'],
  'bend': ['bent', 'bends', 'bending'],
  'sleep': ['slept', 'sleeps', 'sleeping'],
  'creep': ['crept', 'creeps', 'creeping'],
  'deal': ['dealt', 'deals', 'dealing'],
  'mean': ['meant', 'means', 'meaning'],
  'dream': ['dreamt', 'dreamed', 'dreams', 'dreaming'],
  'learn': ['learnt', 'learned', 'learns', 'learning'],
  'burn': ['burnt', 'burned', 'burns', 'burning'],
  'spell': ['spelt', 'spelled', 'spells', 'spelling'],
  'spill': ['spilt', 'spilled', 'spills', 'spilling'],
  'spoil': ['spoilt', 'spoiled', 'spoils', 'spoiling'],
};

/**
 * Get all forms of a word including irregular verb forms
 */
function getAllWordForms(word: string): string[] {
  const lowerWord = word.toLowerCase();
  const forms = [lowerWord];
  
  // Check if this word is an irregular verb base form
  if (IRREGULAR_VERBS[lowerWord]) {
    forms.push(...IRREGULAR_VERBS[lowerWord]);
  }
  
  // Check if this word is an irregular form and get the base + all forms
  for (const [base, irregularForms] of Object.entries(IRREGULAR_VERBS)) {
    if (irregularForms.includes(lowerWord) || base === lowerWord) {
      forms.push(base);
      forms.push(...irregularForms);
    }
  }
  
  return [...new Set(forms)]; // Remove duplicates
}

/**
 * Underlines the target word and its variations in a sentence using _word_ format
 */
function underlineWord(sentence: string, targetWord: string): string {
  if (!sentence || !targetWord) return sentence;

  // Handle phrasal verbs/collocations (e.g., "put A on B" -> ["put", "on"])
  // Also handles tildes (~), square brackets [hold], Korean chars, and punctuation
  const expandAndClean = (text: string): string[] => {
    const result: string[] = [];
    const tokens = text.split(/\s+/);
    for (const token of tokens) {
      const withoutTilde = token.replace(/~/g, '');
      if (withoutTilde.length === 0) continue;
      // Handle parenthetical alternatives: speak(talk)
      const parenMatch = withoutTilde.match(/^([a-zA-Z]+)\(([a-zA-Z]+)\)$/);
      if (parenMatch) {
        result.push(parenMatch[1]);
        result.push(parenMatch[2]);
        continue;
      }
      // Handle bracket alternatives: keep[hold]
      const bracketMatch = withoutTilde.match(/^([a-zA-Z]+)\[([a-zA-Z]+)\]$/);
      if (bracketMatch) {
        result.push(bracketMatch[1]);
        result.push(bracketMatch[2]);
        continue;
      }
      // Remove non-English characters
      const cleaned = withoutTilde.replace(/[^a-zA-Z'-]/g, '').trim();
      if (cleaned.length > 0) result.push(cleaned);
    }
    return result;
  };

  const allTokens = expandAndClean(targetWord.toLowerCase());
  const wordParts = allTokens.filter(part => 
    part.length >= 2 && !PLACEHOLDER_PATTERNS.includes(part.toLowerCase())
  );

  // If no valid parts found after filtering, try to use all tokens with length >= 2
  const partsToProcess = wordParts.length > 0 
    ? wordParts 
    : allTokens.filter(part => part.length >= 2);

  let result = sentence;

  partsToProcess.forEach(part => {
    // Get all forms including irregular verb forms
    const allForms = getAllWordForms(part);
    
    allForms.forEach(form => {
      // Escape regex special characters
      const escapedForm = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Build suffix pattern
      const suffixPattern = COMMON_SUFFIXES.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      
      // Match the word with optional suffixes, case-insensitive
      const pattern = new RegExp(`\\b(${escapedForm}(?:${suffixPattern})?)\\b`, 'gi');
      
      result = result.replace(pattern, '_$1_');
    });
  });

  // Clean up any double underlines that might have been created
  result = result.replace(/__+/g, '_');

  return result;
}

/**
 * Generates a CSV string from vocabulary data with 16 columns:
 * 단어, 뜻, 예문, 영영풀이, 동의어1, 동의어1뜻, 동의어2, 동의어2뜻, 동의어3, 동의어3뜻,
 * 반의어1, 반의어1뜻, 반의어2, 반의어2뜻, 반의어3, 반의어3뜻
 */
export function generateCSV(dayGroups: DayGroup[]): string {
  const headers = [
    'Day',
    '단어',
    '뜻',
    '예문',
    '영영풀이',
    '동의어1',
    '동의어1뜻',
    '동의어2',
    '동의어2뜻',
    '동의어3',
    '동의어3뜻',
    '반의어1',
    '반의어1뜻',
    '반의어2',
    '반의어2뜻',
    '반의어3',
    '반의어3뜻',
  ];

  const rows: string[][] = [];

  // Add header row
  rows.push(headers);

  // Process each word
  dayGroups.forEach(dayGroup => {
    dayGroup.words.forEach(word => {
      // Get synonyms (up to 3)
      const synonyms = word.synonyms || [];
      const synonymsKorean = word.synonymsKorean || [];
      
      // Get antonyms (up to 3)
      const antonyms = word.antonyms || [];
      const antonymsKorean = word.antonymsKorean || [];

      // Get first example sentence with underlined target word
      let exampleText = '';
      if (word.examples && word.examples.length > 0) {
        const englishExample = underlineWord(word.examples[0].english, word.word);
        exampleText = `${englishExample} / ${word.examples[0].korean}`;
      }

      const row = [
        dayGroup.day,
        word.word,
        word.meaning,
        exampleText,
        word.englishDefinition || '',
        synonyms[0] || '',
        synonymsKorean[0] || '',
        synonyms[1] || '',
        synonymsKorean[1] || '',
        synonyms[2] || '',
        synonymsKorean[2] || '',
        antonyms[0] || '',
        antonymsKorean[0] || '',
        antonyms[1] || '',
        antonymsKorean[1] || '',
        antonyms[2] || '',
        antonymsKorean[2] || '',
      ];

      rows.push(row.map(escapeCSVField));
    });
  });

  // Join rows with newlines
  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Generates a CSV for word-type (교과서) workbooks with 6 columns:
 * Day, 번호, 단어유형, 단어, 뜻, 예문
 */
export function generateWordTypeCSV(dayGroups: DayGroup[]): string {
  const headers = ['Day', '번호', '단어유형', '단어', '뜻', '예문'];
  const rows: string[][] = [headers];

  let globalIndex = 0;
  dayGroups.forEach(dayGroup => {
    dayGroup.words.forEach(word => {
      globalIndex++;
      let exampleText = '';
      if (word.examples && word.examples.length > 0) {
        const eng = underlineWord(word.examples[0].english, word.word);
        exampleText = word.examples[0].korean ? `${eng} / ${word.examples[0].korean}` : eng;
      }
      rows.push([
        dayGroup.day,
        String(globalIndex),
        word.wordType || '',
        word.word,
        word.meaning,
        exampleText,
      ].map(escapeCSVField));
    });
  });

  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Downloads word-type vocabulary data as a CSV file
 */
export function downloadWordTypeCSV(dayGroups: DayGroup[], filename: string): void {
  const csvContent = generateWordTypeCSV(dayGroups);
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the vocabulary data as a CSV file
 */
export function downloadCSV(dayGroups: DayGroup[], filename: string): void {
  const csvContent = generateCSV(dayGroups);
  
  // Add BOM for UTF-8 encoding (helps Excel recognize Korean characters)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
