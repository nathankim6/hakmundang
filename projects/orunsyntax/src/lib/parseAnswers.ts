export interface Answer {
  id: number;
  correction: string; // "disturbed -> disturbing" format
}

export function parseAnswers(content: string): Map<number, string> {
  const answers = new Map<number, string>();
  const lines = content.split('\n');
  
  let currentId: number | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match question number like "1)" or "123)"
    const idMatch = trimmed.match(/^(\d+)\)$/);
    if (idMatch) {
      currentId = parseInt(idMatch[1], 10);
      continue;
    }
    
    // If we have a current ID and this line has content, it's the answer
    if (currentId !== null && trimmed) {
      answers.set(currentId, trimmed);
      currentId = null;
    }
  }
  
  return answers;
}
