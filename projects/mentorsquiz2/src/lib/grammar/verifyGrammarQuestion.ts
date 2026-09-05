
import { AIClient, GrammarVerificationResult } from "./types";

export const verifyGrammarQuestion = async (
  client: AIClient, 
  generatedQuestion: string
): Promise<string> => {
  console.log('Starting grammar question verification');
  
  // Replace "[문제]" with "다음 중 어법 상 적절하지 않은 것은?"
  generatedQuestion = generatedQuestion.replace(/\[문제\]/g, "다음 중 어법 상 적절하지 않은 것은?");
  
  // First, perform basic validation
  const validationResult = validateGrammarQuestion(generatedQuestion);
  
  // If the question is invalid, attempt to fix it
  if (!validationResult.isValid && client) {
    console.log(`Grammar question needs fixing: ${validationResult.error}`);
    
    // Create a prompt to fix the question
    const fixPrompt = `
The following grammar question needs to be fixed because: ${validationResult.error}

Here is the original question:
${generatedQuestion}

Please rewrite this grammar question to fix the issues while maintaining the same format:
1. Keep the original format with "다음 중 어법 상 적절하지 않은 것은?" as the question title
2. Ensure there are exactly 5 grammar points marked with ①-⑤ and surrounded by **asterisks**
3. Make sure the question uses proper grammar terminology in the explanation
4. Preserve the difficulty level and intent of the original question

Return only the fixed question with no additional comments.`;

    try {
      // Generate a fixed version of the question
      const fixedQuestion = await client.generateCompletion(fixPrompt);
      console.log('Grammar question has been fixed');
      return fixedQuestion;
    } catch (error) {
      console.error('Error fixing grammar question:', error);
      // If fixing fails, return the original
      return generatedQuestion;
    }
  }
  
  // If the question is valid, return it as is
  return generatedQuestion;
};

// Helper function for basic validation without requiring AI
function validateGrammarQuestion(generatedQuestion: string): GrammarVerificationResult {
  console.log('Validating grammar question format');
  
  // Extract the question part
  const questionMatch = generatedQuestion.match(/다음 중 어법 상 적절하지 않은 것은\?([\s\S]*?)\[정답\]/);
  if (!questionMatch) {
    return { isValid: false, error: 'Invalid question format - missing question title or [정답]' };
  }
  
  const questionPart = questionMatch[1].trim();
  
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
}
