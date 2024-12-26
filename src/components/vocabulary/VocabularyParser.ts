export interface VocabularyEntry {
  headword: string;
  meaning: string;
  synonyms: string;
  synonymMeanings: string;
  antonyms: string;
  antonymMeanings: string;
  questionNumber?: number;
}

export const parseTableContent = (content: string): VocabularyEntry[] => {
  console.log('Parsing content:', content);
  
  if (!content.trim()) {
    console.log('Content is empty');
    return [];
  }

  const sections = content.split(/문제 \d+/);
  const tableData: VocabularyEntry[] = [];
  let currentQuestionNumber = 1;

  sections.forEach((section) => {
    if (!section.trim()) return;

    const lines = section.split('\n');
    lines.forEach(line => {
      if (line.includes('|')) {
        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        
        console.log('Parsed cells:', cells);
        
        if (cells.length >= 6 && !line.includes('표제어')) {
          tableData.push({
            headword: cells[0],
            meaning: cells[1],
            synonyms: cells[2],
            synonymMeanings: cells[3],
            antonyms: cells[4],
            antonymMeanings: cells[5],
            questionNumber: currentQuestionNumber
          });
        }
      }
    });
    currentQuestionNumber++;
  });
  
  console.log('Parsed table data:', tableData);
  return tableData;
};