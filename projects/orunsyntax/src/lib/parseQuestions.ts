export interface Question {
  id: number;
  sentence: string;
  translation: string;
}

export function parseQuestions(content: string): Question[] {
  const lines = content.split('\n');
  const questions: Question[] = [];
  
  // Collect all sentences and translations separately
  const sentences: { id: number; text: string }[] = [];
  const translations: { id: number; text: string }[] = [];
  
  let currentId = 0;
  let collectingSentence = false;
  let currentSentence = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines - save current sentence if we have one
    if (!trimmed) {
      if (collectingSentence && currentId > 0 && currentSentence) {
        sentences.push({ id: currentId, text: currentSentence.trim() });
        currentSentence = '';
        collectingSentence = false;
      }
      continue;
    }
    
    // Match numbered sentences like "1)", "2)", "11)", etc.
    const sentenceNumberMatch = trimmed.match(/^(\d+)\)$/);
    if (sentenceNumberMatch) {
      // Save previous sentence if any
      if (collectingSentence && currentId > 0 && currentSentence) {
        sentences.push({ id: currentId, text: currentSentence.trim() });
        currentSentence = '';
      }
      currentId = parseInt(sentenceNumberMatch[1]);
      collectingSentence = true;
      continue;
    }
    
    // Match translation lines like "1. 하지만...", "2. 업무는..."
    const translationMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (translationMatch) {
      // Save previous sentence if any
      if (collectingSentence && currentId > 0 && currentSentence) {
        sentences.push({ id: currentId, text: currentSentence.trim() });
        currentSentence = '';
        collectingSentence = false;
      }
      
      const id = parseInt(translationMatch[1]);
      const text = translationMatch[2];
      translations.push({ id, text });
      continue;
    }
    
    // If we're collecting a sentence and line has content
    if (collectingSentence && currentId > 0) {
      currentSentence += (currentSentence ? ' ' : '') + trimmed;
    }
  }
  
  // Save last sentence if any
  if (collectingSentence && currentId > 0 && currentSentence) {
    sentences.push({ id: currentId, text: currentSentence.trim() });
  }
  
  // Sort sentences by ID
  sentences.sort((a, b) => a.id - b.id);
  
  // The file structure: every 10 sentences are followed by 10 translations
  // Translation with "1." after sentences 11-20 corresponds to sentence 11, etc.
  // We need to match translations to sentences based on position in each block of 10
  
  // Create translation lookup by position in each block
  const translationBlocks: Map<number, string>[] = [];
  let currentBlock: Map<number, string> = new Map();
  let lastTranslationId = 0;
  
  for (const t of translations) {
    // If we see a smaller ID, it's a new block
    if (t.id <= lastTranslationId && currentBlock.size > 0) {
      translationBlocks.push(currentBlock);
      currentBlock = new Map();
    }
    currentBlock.set(t.id, t.text);
    lastTranslationId = t.id;
  }
  // Push last block
  if (currentBlock.size > 0) {
    translationBlocks.push(currentBlock);
  }
  
  // Match sentences with translations
  // Block 0 translations (1-10) go with sentences 1-10
  // Block 1 translations (1-10) go with sentences 11-20
  // etc.
  for (const sentence of sentences) {
    const blockIndex = Math.floor((sentence.id - 1) / 10);
    const positionInBlock = ((sentence.id - 1) % 10) + 1;
    
    let translation = '';
    if (blockIndex < translationBlocks.length) {
      translation = translationBlocks[blockIndex].get(positionInBlock) || '';
    }
    
    questions.push({
      id: sentence.id,
      sentence: sentence.text,
      translation,
    });
  }
  
  // Sort by ID
  questions.sort((a, b) => a.id - b.id);
  
  return questions;
}
