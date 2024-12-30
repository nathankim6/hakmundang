import { saveAs } from "file-saver";

interface Question {
  content: string;
  questionNumber: number;
  originalText?: string;
}

export const generateDocument = (questions: Question[]) => {
  let questionsText = "";
  let explanationsText = "\n\n===== 정답 및 해설 =====\n\n";
  
  questions.forEach((question, index) => {
    const questionNumber = index + 1;
    
    // Process question content
    let questionContent = question.content;
    let explanation = "";
    
    // Split content into question and answer parts
    const parts = questionContent.split('[정답]');
    if (parts.length > 1) {
      questionContent = parts[0].trim();
      explanation = parts[1].trim();
    }

    // Add original text if it exists (for weekend clinic format)
    if (question.originalText) {
      questionsText += `[문제 ${questionNumber}]\n\n${question.originalText}\n\n`;
    }

    // Add question content
    questionsText += `[문제 ${questionNumber}]\n\n${questionContent}\n\n`;

    // Add to explanations section
    if (explanation) {
      explanationsText += `[문제 ${questionNumber} 정답]\n${explanation}\n\n`;
    }
  });

  // Combine questions and explanations
  const fullContent = questionsText + explanationsText;

  // Create and save the text file
  const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "generated_questions.txt");
};