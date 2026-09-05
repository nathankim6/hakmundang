import { GrammarVerificationResult } from "./types";

export const verifyGrammarQuestion = (originalText: string, generatedQuestion: string): GrammarVerificationResult => {
  console.log('Starting grammar question verification');
  
  // Extract the question part
  const questionMatch = generatedQuestion.match(/\[문제\]([\s\S]*?)\[정답\]/);
  if (!questionMatch) {
    return { isValid: false, error: 'Invalid question format - missing [문제] or [정답]' };
  }
  
  const questionPart = questionMatch[1].trim();
  
  // Clean the text for comparison
  const cleanText = (text: string) => {
    return text
      .replace(/[①-⑤]/g, '')
      .replace(/\*\*/g, '')
      .replace(/["""]/g, '"')
      .replace(/['′']/g, "'")
      .replace(/[.,;:!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
  };

  const cleanedQuestion = cleanText(questionPart);
  const cleanedOriginal = cleanText(originalText);

  // Split into words and normalize
  const normalizeWord = (word: string) => {
    return word
      .replace(/['"]/g, '')
      .replace(/^[.,;:!?]+|[.,;:!?]+$/g, '')
      .toLowerCase()
      .trim();
  };

  const getWords = (text: string) => {
    return text
      .split(/\s+/)
      .map(normalizeWord)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'that', 'with', 'to', 'in', 'of', 'a', 'an', 'is', 'are', 'was', 'were'].includes(word));
  };

  const originalWords = getWords(cleanedOriginal);
  const questionWords = getWords(cleanedQuestion);

  // Check for word preservation with more flexible matching
  const missingWords = originalWords.filter(word => {
    return !questionWords.some(qWord => {
      // Direct match
      if (qWord === word) return true;
      
      // Handle variations (plurals, tenses, etc.)
      const baseWord = word.replace(/(?:ed|ing|s|es)$/, '');
      const baseQWord = qWord.replace(/(?:ed|ing|s|es)$/, '');
      
      if (baseWord === baseQWord) return true;
      if (qWord.includes(baseWord) || baseWord.includes(qWord)) return true;
      
      // Handle contractions
      if (qWord.includes("'") && qWord.replace(/'.+$/, '') === word) return true;
      
      return false;
    });
  });

  // Allow some flexibility in word matching
  if (missingWords.length > Math.ceil(originalWords.length * 0.1)) {
    console.log('Missing words:', missingWords);
    return { 
      isValid: false, 
      error: `Too many words missing from original text: ${missingWords.join(', ')}` 
    };
  }

  // Verify grammar points with more flexible matching
  const numberMatches = questionPart.match(/[①-⑤]\s*\*\*[^*]+\*\*/g);
  if (!numberMatches || numberMatches.length !== 5) {
    return { 
      isValid: false, 
      error: `Found ${numberMatches?.length || 0} grammar points, expected exactly 5` 
    };
  }

  // Check answer format
  const answerMatch = generatedQuestion.match(/\[정답\]\s*([①-⑤])/);
  if (!answerMatch) {
    return { 
      isValid: false, 
      error: 'Missing or invalid answer format' 
    };
  }

  // Check explanation
  const explanationMatch = generatedQuestion.match(/\[해설\]\s*([\s\S]+?)(?=\s*$)/);
  if (!explanationMatch || explanationMatch[1].trim().length < 10) {
    return { 
      isValid: false, 
      error: 'Missing or invalid explanation' 
    };
  }

  // Verify explanation quality
  const explanation = explanationMatch[1].trim();
  const hasGrammarTerms = /동사|형용사|부사|전치사|관계대명사|관계부사|분사|수동태|능동태|시제|조동사|주어|목적어|보어|접속사/.test(explanation);
  
  if (!hasGrammarTerms) {
    return {
      isValid: false,
      error: 'Explanation lacks proper grammar terminology'
    };
  }

  return { isValid: true };
};