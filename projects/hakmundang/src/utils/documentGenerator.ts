import { Document, Paragraph, TextRun, Packer, IPageSizeAttributes, IPageMarginAttributes } from "docx";
import { saveAs } from "file-saver";

interface Question {
  content: string;
  questionNumber: number;
  originalText?: string;
}

const createDocumentWithBackground = () => {
  const doc = new Document({
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
  return doc;
};

const generateQuestionDoc = (questions: Question[]) => {
  const doc = createDocumentWithBackground();
  const sections = (doc as any).sections;
  
  if (!sections || !sections[0]) {
    throw new Error("Document sections not initialized properly");
  }

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
  const sections = (doc as any).sections;
  
  if (!sections || !sections[0]) {
    throw new Error("Document sections not initialized properly");
  }

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

export const generateDocument = async (questions: Question[]) => {
  // Generate and save questions document
  const questionDoc = generateQuestionDoc(questions);
  const questionBlob = await Packer.toBlob(questionDoc);
  saveAs(questionBlob, "문제.docx");

  // Generate and save answers document
  const answerDoc = generateAnswerDoc(questions);
  const answerBlob = await Packer.toBlob(answerDoc);
  saveAs(answerBlob, "정답과해설.docx");
};