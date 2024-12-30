import { Document, Paragraph, TextRun, Packer, HeadingLevel, BorderStyle } from "docx";
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

        // Add question number with consistent styling
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `문제 ${question.questionNumber}`,
                bold: true,
                size: 32,
                color: "#403E43",
              }),
            ],
            spacing: {
              before: 400,
              after: 240,
            },
          })
        );

        // Add original text for weekend clinic questions with proper styling
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
                before: 240,
                after: 240,
              },
              border: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "#0EA5E9", space: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "#0EA5E9", space: 1 },
                left: { style: BorderStyle.SINGLE, size: 1, color: "#0EA5E9", space: 1 },
                right: { style: BorderStyle.SINGLE, size: 1, color: "#0EA5E9", space: 1 },
              },
              shading: {
                fill: "#F8F7FF",
              },
            })
          );
        }

        // Process question content sections
        const sections = question.content.split(/\[(.*?)\]/g).filter(Boolean);
        for (let i = 0; i < sections.length; i += 2) {
          if (sections[i] && sections[i + 1]) {
            // Add section title
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${sections[i]}]`,
                    bold: true,
                    size: 24,
                    color: "#403E43",
                  }),
                ],
                spacing: {
                  before: 240,
                  after: 120,
                },
              })
            );

            // Add section content
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sections[i + 1].trim(),
                    size: 24,
                  }),
                ],
                spacing: {
                  before: 120,
                  after: 240,
                },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "#D3E4FD", space: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "#D3E4FD", space: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "#D3E4FD", space: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "#D3E4FD", space: 1 },
                },
                shading: {
                  fill: "#F1F0FB",
                },
              })
            );
          }
        }

        // Add separator line
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: "", size: 24 })],
            spacing: {
              before: 240,
              after: 240,
            },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "#0EA5E9", space: 1 },
            },
          })
        );

        return paragraphs;
      }),
    }],
  });

  // Generate and save the document
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "generated_questions.docx");
  });
};