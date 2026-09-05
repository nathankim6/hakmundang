import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, Table, TableRow, TableCell, WidthType, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { QRDataType, QuestionAnswer } from '@/types/test';

const FONT_NAME = 'Malgun Gothic';
const FONT_SIZE = 18;
const FONT_SIZE_SMALL = 15;
const FONT_SIZE_TITLE = 28;
const FONT_SIZE_SUBTITLE = 20;
const FONT_SIZE_CATEGORY = 14;

interface GrammarTestData {
  title: string;
  testId: string;
  answers: Record<number, QuestionAnswer>;
  questionCount: number;
}

export const generateGrammarTestDocx = async (testData: GrammarTestData) => {
  const paragraphs: Paragraph[] = [];

  // ═══ Title ═══
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '📝 ', size: FONT_SIZE_TITLE, font: FONT_NAME }),
        new TextRun({ text: testData.title, bold: true, size: FONT_SIZE_TITLE, font: FONT_NAME }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      border: {
        top: { style: BorderStyle.DOUBLE, size: 6, color: '4338CA' },
        left: { style: BorderStyle.DOUBLE, size: 6, color: '4338CA' },
        right: { style: BorderStyle.DOUBLE, size: 6, color: '4338CA' },
      },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '문법 시험지', size: FONT_SIZE_SUBTITLE, font: FONT_NAME, color: '555555' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '4338CA' },
        left: { style: BorderStyle.DOUBLE, size: 6, color: '4338CA' },
        right: { style: BorderStyle.DOUBLE, size: 6, color: '4338CA' },
      },
    })
  );

  // ═══ Student Info ═══
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '반: ___________     이름: ___________     점수:       /       ', size: FONT_SIZE, font: FONT_NAME }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 150, after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '333333' },
      },
    })
  );

  // ═══ Questions ═══
  const questionNumbers = Object.keys(testData.answers)
    .map(Number)
    .sort((a, b) => a - b);

  for (const num of questionNumbers) {
    const qa = testData.answers[num];
    if (!qa) continue;

    const categoryText = qa.grammarCategory ? `  [${qa.grammarCategory}]` : '';

    // Question number + category
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: `${num}. `, 
            bold: true, 
            size: FONT_SIZE, 
            font: FONT_NAME 
          }),
          ...(qa.grammarCategory ? [
            new TextRun({ 
              text: `[${qa.grammarCategory}]`, 
              size: FONT_SIZE_CATEGORY, 
              font: FONT_NAME, 
              color: '6D28D9',
              italics: true,
            }),
          ] : []),
        ],
        spacing: { before: 180, after: 40 },
      })
    );

    // Answer choices (①②③④⑤)
    if (qa.type === 'multiple') {
      const symbols = ['①', '②', '③', '④', '⑤'];
      paragraphs.push(
        new Paragraph({
          children: symbols.map((symbol, idx) => 
            new TextRun({ 
              text: `${symbol}          `, 
              size: FONT_SIZE, 
              font: FONT_NAME 
            })
          ),
          spacing: { before: 0, after: 60 },
          indent: { left: 400 },
        })
      );
    } else if (qa.type === 'subjective') {
      // Subjective answer blank
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ 
              text: '→ ________________________________________', 
              size: FONT_SIZE, 
              font: FONT_NAME,
              color: '666666',
            }),
          ],
          spacing: { before: 0, after: 60 },
          indent: { left: 400 },
        })
      );
    }
  }

  // ═══ Separator ═══
  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { before: 400, after: 100 },
      border: {
        bottom: { style: BorderStyle.DOUBLE, size: 6, color: '4338CA' },
      },
    })
  );

  // ═══ Answer Key ═══
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '📋 정답지', bold: true, size: FONT_SIZE_TITLE - 4, font: FONT_NAME, color: '4338CA' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 150 },
    })
  );

  for (const num of questionNumbers) {
    const qa = testData.answers[num];
    if (!qa) continue;

    const answerText = Array.isArray(qa.answer) 
      ? qa.answer.join(', ') 
      : String(qa.answer);

    const categoryLabel = qa.grammarCategory ? ` [${qa.grammarCategory}]` : '';
    const pointsLabel = qa.points ? ` (${qa.points}점)` : '';

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${num}번: `, bold: true, size: FONT_SIZE_SMALL, font: FONT_NAME }),
          new TextRun({ text: answerText, size: FONT_SIZE_SMALL, font: FONT_NAME, color: 'DC2626', bold: true }),
          new TextRun({ text: pointsLabel, size: FONT_SIZE_SMALL - 2, font: FONT_NAME, color: '666666' }),
          new TextRun({ text: categoryLabel, size: FONT_SIZE_SMALL - 2, font: FONT_NAME, color: '6D28D9', italics: true }),
        ],
        spacing: { before: 40, after: 40 },
      })
    );
  }

  // ═══ Generate Document ═══
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,
            right: 720,
            bottom: 720,
            left: 720,
          },
        },
      },
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${testData.title}_문법시험지.docx`);
};
