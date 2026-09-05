// Utility script to find duplicate sentences in workbook data
// This can be run to analyze the sentences.txt file

export interface DuplicateSentence {
  sentence: string;
  ids: number[];
}

export function findDuplicateSentences(sentencesText: string): DuplicateSentence[] {
  const lines = sentencesText.split('\n');
  const sentenceMap = new Map<string, number[]>();
  
  let currentId: number | null = null;
  let currentSentence = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this is a question number line (e.g., "1)", "123)")
    const idMatch = trimmedLine.match(/^(\d+)\)$/);
    if (idMatch) {
      // Save previous sentence if exists
      if (currentId !== null && currentSentence.trim()) {
        const normalizedSentence = currentSentence.trim().toLowerCase();
        const existing = sentenceMap.get(normalizedSentence) || [];
        existing.push(currentId);
        sentenceMap.set(normalizedSentence, existing);
      }
      
      currentId = parseInt(idMatch[1]);
      currentSentence = '';
      continue;
    }
    
    // Skip Korean translation lines (start with number followed by period)
    if (/^\d+\./.test(trimmedLine)) {
      continue;
    }
    
    // Skip empty lines between questions
    if (trimmedLine === '') {
      continue;
    }
    
    // This is part of the English sentence
    if (currentId !== null) {
      currentSentence += (currentSentence ? ' ' : '') + trimmedLine;
    }
  }
  
  // Don't forget the last sentence
  if (currentId !== null && currentSentence.trim()) {
    const normalizedSentence = currentSentence.trim().toLowerCase();
    const existing = sentenceMap.get(normalizedSentence) || [];
    existing.push(currentId);
    sentenceMap.set(normalizedSentence, existing);
  }
  
  // Filter to only duplicates (more than one ID)
  const duplicates: DuplicateSentence[] = [];
  for (const [sentence, ids] of sentenceMap.entries()) {
    if (ids.length > 1) {
      duplicates.push({
        sentence,
        ids: ids.sort((a, b) => a - b)
      });
    }
  }
  
  // Sort by first occurrence
  duplicates.sort((a, b) => a.ids[0] - b.ids[0]);
  
  return duplicates;
}

// Function to get duplicate analysis summary
export function getDuplicatesSummary(duplicates: DuplicateSentence[]): string {
  if (duplicates.length === 0) {
    return '중복 문장이 없습니다.';
  }
  
  let summary = `총 ${duplicates.length}개의 중복 문장이 발견되었습니다:\n\n`;
  
  for (const dup of duplicates) {
    const truncatedSentence = dup.sentence.length > 80 
      ? dup.sentence.substring(0, 80) + '...' 
      : dup.sentence;
    summary += `문장 번호 ${dup.ids.join(', ')}: "${truncatedSentence}"\n`;
  }
  
  return summary;
}
