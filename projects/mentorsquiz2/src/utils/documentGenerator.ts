
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";
import { convertToHWP } from "./hancomConverter";

interface Question {
  content: string;
  questionNumber: number;
  originalText?: string;
}

const createDocumentWithBackground = () => {
  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,  // A4 width in twips
            height: 16838, // A4 height in twips
          },
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      },
      children: []
    }]
  });
};

const generateQuestionDoc = (questions: Question[]) => {
  const doc = createDocumentWithBackground();
  // Access sections property through type assertion
  const sections = (doc as any).sections;
  
  const children = questions.flatMap(question => {
    const paragraphs: Paragraph[] = [];

    // Add question number
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `문제 ${question.questionNumber}`,
            bold: true,
            size: 28,
          }),
        ],
      })
    );

    // Add original text for weekend clinic questions
    if (question.originalText) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: question.originalText,
              size: 24,
            }),
          ],
          spacing: {
            before: 400,
            after: 400,
          },
        })
      );
    }

    // Add question content (without answer)
    const parts = question.content.split('[정답]');
    const questionPart = parts[0].trim();
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: questionPart,
            size: 24,
          }),
        ],
        spacing: {
          before: 400,
          after: 800,
        },
      })
    );

    return paragraphs;
  });

  sections[0].children = children;
  return doc;
};

const generateAnswerDoc = (questions: Question[]) => {
  const doc = createDocumentWithBackground();
  // Access sections property through type assertion
  const sections = (doc as any).sections;
  
  const children = questions.flatMap(question => {
    const paragraphs: Paragraph[] = [];
    const parts = question.content.split('[정답]');
    
    if (parts.length > 1) {
      // Add question number and answer
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `문제 ${question.questionNumber}`,
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `[정답] ${parts[1].trim()}`,
              size: 24,
            }),
          ],
          spacing: {
            before: 400,
            after: 800,
          },
        })
      );
    }

    return paragraphs;
  });

  sections[0].children = children;
  return doc;
};

export const generateDocument = async (questions: Question[], format: "docx" | "hwp" | "hwpx" = "docx") => {
  if (!questions || questions.length === 0) {
    throw new Error("저장할 문제가 없습니다.");
  }

  try {
    // Generate questions document
    const questionDoc = generateQuestionDoc(questions);
    
    // Generate answers document
    const answerDoc = generateAnswerDoc(questions);

    if (format === "docx") {
      // Use the original docx format and save directly
      const questionBlob = await Packer.toBlob(questionDoc);
      saveAs(questionBlob, "문제.docx");
      
      const answerBlob = await Packer.toBlob(answerDoc);
      saveAs(answerBlob, "정답과해설.docx");
      
      return { success: true, format: "docx" };
    } else {
      // Use the Hancom converter for hwp/hwpx formats
      const questionResult = await convertToHWP(questionDoc, "문제", format);
      const answerResult = await convertToHWP(answerDoc, "정답과해설", format);
      
      if (!questionResult.success || !answerResult.success) {
        // If either conversion failed, return the error
        const errorMessage = questionResult.error || answerResult.error;
        return { 
          success: false, 
          error: errorMessage, 
          format: "docx" // Fallback format
        };
      }
      
      return { success: true, format };
    }
  } catch (error) {
    console.error("Document generation error:", error);
    throw new Error("문서 저장 중 오류가 발생했습니다.");
  }
};
