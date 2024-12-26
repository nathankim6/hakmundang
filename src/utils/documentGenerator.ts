import { Document, Paragraph, TextRun, Table, TableRow, TableCell, Packer, BorderStyle } from "docx";
import { saveAs } from "file-saver";

interface Question {
  content: string;
  questionNumber: number;
}

export const generateDocument = (questions: Question[]) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: questions.flatMap(question => {
        const paragraphs: Paragraph[] = [];

        // Add question number with enhanced styling
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[문제 ${question.questionNumber}]`,
                bold: true,
                size: 32,
                color: "2563EB",
              }),
            ],
            spacing: {
              before: 400,
              after: 200,
            },
          })
        );

        // Check if this is a synonym/antonym table
        if (question.content.includes('| 표제어 | 표제어뜻 | 동의어 | 동의어뜻 | 반의어 | 반의어뜻 |')) {
          const rows = question.content
            .split('\n')
            .filter(line => line.includes('|'))
            .map(line => line.split('|').map(cell => cell.trim()));

          // Create a table with enhanced styling
          const table = new Table({
            rows: rows.map((cells, rowIndex) => new TableRow({
              children: cells
                .filter(cell => cell !== '')
                .map((cell, cellIndex) => {
                  // Extract difficulty stars if present
                  const stars = cell.match(/★+/)?.[0]?.length || 0;
                  const cleanText = cell.replace(/★+/, '').trim();
                  
                  return new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({ 
                          text: cleanText,
                          size: 24,
                          bold: rowIndex === 0,
                          color: rowIndex === 0 ? "2563EB" : "000000"
                        }),
                        ...(stars > 0 ? [
                          new TextRun({
                            text: " " + "★".repeat(stars),
                            color: "FFD700",
                            size: 24,
                          })
                        ] : [])
                      ],
                      spacing: { before: 120, after: 120 },
                    })],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                      left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                      right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                    },
                    shading: {
                      fill: rowIndex === 0 ? "F3F4F6" : "FFFFFF",
                    },
                    width: {
                      size: cellIndex === 0 || cellIndex === 1 ? 2000 : 2500,
                      type: "dxa",
                    },
                  });
                }),
              height: { value: 400, rule: "atLeast" },
            })),
            width: {
              size: 9000,
              type: "dxa",
            },
          });

          paragraphs.push(new Paragraph({ children: [table] }));
        }

        return paragraphs;
      }),
    }],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "generated_questions.docx");
  });
};