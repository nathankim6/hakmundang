import { Document, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface Question {
  content: string;
  questionNumber: number;
  originalText?: string;
}

export const generateDocument = (questions: Question[]) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: questions.flatMap(question => {
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

        // Add question content
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: question.content,
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
      }),
    }],
  });

  // Generate and save the document
  doc.save().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    saveAs(blob, "generated_questions.docx");
  });
};