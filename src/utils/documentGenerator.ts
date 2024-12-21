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
    const questionPart = parts[0].trim();
    const answerPart = parts[1] ? '[정답]' + parts[1].trim() : '';
    
    // Add to respective sections
    questionsText += `문제 ${q.questionNumber}\n${questionPart}\n\n`;
    answersText += `문제 ${q.questionNumber}\n${answerPart}\n\n`;
  });

  // Add page break markers between questions and answers
  const pageBreak = "\n".repeat(5) + "=".repeat(80) + "\n".repeat(5);
  
  // Combine all text with clear separation
  const fullText = questionsText + pageBreak + answersText;

  // Create and save the text file
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'ORUN_AI_QUIZ.txt');
};