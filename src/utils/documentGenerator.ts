import { Document, Paragraph, TextRun, Table, TableRow, TableCell, Packer } from "docx";
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

        // Check if this is a synonym/antonym table
        if (question.content.includes('| 표제어 | 표제어뜻 | 동의어 | 동의어뜻 | 반의어 | 반의어뜻 |')) {
          const rows = question.content
            .split('\n')
            .filter(line => line.includes('|'))
            .map(line => line.split('|').map(cell => cell.trim()));

          // Create a paragraph to wrap the table
          const tableParagraph = new Paragraph({
            children: [
              new Table({
                rows: rows.map(cells => new TableRow({
                  children: cells
                    .filter(cell => cell !== '')
                    .map(cell => new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: cell, size: 20 })]
                      })]
                    }))
                }))
              })
            ]
          });

          paragraphs.push(tableParagraph);
        } else {
          // Add regular question content
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
        }

        return paragraphs;
      }),
    }],
  });

  // Generate and save the document using Packer
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "generated_questions.docx");
  });
};