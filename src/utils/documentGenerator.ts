import { saveAs } from 'file-saver';

interface QuestionData {
  content: string;
  questionNumber: number;
}

export const generateDocument = async (questions: QuestionData[]) => {
  // Prepare questions section
  let questionsText = "[ 문제 ]\n\n";
  let answersText = "\n\n\n";  // Add extra newlines for visual separation
  answersText += "=".repeat(80) + "\n";  // Add a separator line
  answersText += "[ 정답 및 해설 ]\n\n";
  
  questions.forEach((q) => {
    // Split content into question part and answer/explanation part
    const parts = q.content.split('[정답]');
    
    if (parts.length >= 2) {
      const questionPart = parts[0].trim();
      // Join all remaining parts in case there are multiple [정답] occurrences
      const answerPart = parts.slice(1).join('[정답]').trim();
      
      // Add numbered labels to both question and answer sections
      questionsText += `[문제 ${q.questionNumber}]\n${questionPart}\n\n`;
      answersText += `[문제 ${q.questionNumber}]\n[정답]${answerPart}\n\n`;
    } else {
      // If no [정답] is found, treat the entire content as a question
      questionsText += `[문제 ${q.questionNumber}]\n${q.content.trim()}\n\n`;
    }
  });

  // Add page break markers between questions and answers
  const pageBreak = "\n".repeat(5) + "=".repeat(80) + "\n".repeat(5);
  
  // Combine all text with clear separation
  const fullText = questionsText + pageBreak + answersText;

  // Create and save the text file
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'ORUN_AI_QUIZ.txt');
};