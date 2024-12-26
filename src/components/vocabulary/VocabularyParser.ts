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

    const rows: string[][] = [];
    let currentRow: string[] = [];
    
    const lines = section.split('\n');
    let isHeader = true;

    lines.forEach(line => {
      if (line.includes('|')) {
        // Skip the header rows
        if (isHeader) {
          if (!line.includes('표제어 |')) {
            isHeader = false;
          }
          return;
        }

        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        
        if (cells.length >= 6) {
          // If this is a new row (has a headword), start a new entry
          if (cells[0]) {
            if (currentRow.length > 0) {
              rows.push(currentRow);
            }
            currentRow = [...cells];
          } else {
            // This is a continuation of the previous row
            // Append values to existing cells
            cells.forEach((cell, index) => {
              if (cell) {
                currentRow[index] = currentRow[index] ? 
                  currentRow[index] + '\n' + cell : 
                  cell;
              }
            });
          }
        }
      }
    });
    
    // Don't forget to push the last row
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    // Convert rows to VocabularyEntry objects
    rows.forEach(row => {
      if (row.length >= 6) {
        tableData.push({
          headword: row[0],
          meaning: row[1],
          synonyms: row[2],
          synonymMeanings: row[3],
          antonyms: row[4],
          antonymMeanings: row[5],
          questionNumber: currentQuestionNumber
        });
      }
    });
    
    currentQuestionNumber++;
  });
  
  console.log('Parsed table data:', tableData);
  return tableData;
};