import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { WritingQuestion } from '@/types/test';

const FONT_NAME = 'Malgun Gothic';
const FONT_SIZE = 17; // 8.5pt
const FONT_SIZE_SMALL = 15;
const FONT_SIZE_TITLE = 28;
const FONT_SIZE_SUBTITLE = 20;

interface WritingTestData {
  title: string;
  questionCount: number;
  questions: WritingQuestion[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const processWordForDisplay = (word: string): string => {
  let processed = word.replace(/[.,!?]+$/, '');
  if (processed !== 'I' && processed.length > 0 && processed[0] === processed[0].toUpperCase()) {
    processed = processed[0].toLowerCase() + processed.slice(1);
  }
  return processed;
};

export const generateWritingTestDocx = async (testData: WritingTestData) => {
  const paragraphs: Paragraph[] = [];

  // ═══ Title ═══
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '✎ ', size: FONT_SIZE_TITLE, font: FONT_NAME }),
        new TextRun({ text: testData.title, bold: true, size: FONT_SIZE_TITLE, font: FONT_NAME }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      border: {
        top: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
        left: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
        right: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
      },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '영작 배열 시험', size: FONT_SIZE_SUBTITLE, font: FONT_NAME, color: '555555' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E7D32' },
        left: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
        right: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
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
      spacing: { before: 150, after: 150 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '333333' },
      },
    })
  );

  // ═══ Instructions ═══
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '※ 다음 한국어 문장을 보고, 주어진 단어를 올바르게 배열하여 영작하시오.', size: FONT_SIZE_SMALL, font: FONT_NAME, italics: true, color: '444444' }),
      ],
      spacing: { before: 100, after: 200 },
    })
  );

  // ═══ Questions ═══
  testData.questions.forEach((question, idx) => {
    const questionNum = idx + 1;
    const words = question.arrangeWords || [];
    const shuffledWords = shuffleArray(words).map((w: string) => processWordForDisplay(w));

    // Question number + Korean
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${questionNum}. `, bold: true, size: FONT_SIZE, font: FONT_NAME }),
          new TextRun({ text: question.korean, size: FONT_SIZE, font: FONT_NAME }),
        ],
        spacing: { before: 180, after: 50 },
      })
    );

    // Word bank
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '    〔 ', size: FONT_SIZE_SMALL, font: FONT_NAME, color: '888888' }),
          new TextRun({ text: shuffledWords.join('  /  '), size: FONT_SIZE_SMALL, font: FONT_NAME }),
          new TextRun({ text: ' 〕', size: FONT_SIZE_SMALL, font: FONT_NAME, color: '888888' }),
        ],
        spacing: { before: 30, after: 50 },
      })
    );

    // Answer line
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '    → ', size: FONT_SIZE_SMALL, font: FONT_NAME, color: '2E7D32' }),
          new TextRun({ text: '________________________________________________________________________________', size: FONT_SIZE_SMALL, font: FONT_NAME, color: 'CCCCCC' }),
        ],
        spacing: { before: 30, after: 100 },
      })
    );
  });

  // ═══ Answer Key (new page) ═══
  paragraphs.push(
    new Paragraph({ children: [], pageBreakBefore: true })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: '📋 정답표 (Answer Key)', bold: true, size: 24, font: FONT_NAME }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 200 },
      border: {
        top: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
        bottom: { style: BorderStyle.DOUBLE, size: 6, color: '2E7D32' },
      },
    })
  );

  testData.questions.forEach((question, idx) => {
    const questionNum = idx + 1;
    const correctSentence = question.english || question.arrangeWords?.join(' ') || '';

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${questionNum}. `, bold: true, size: FONT_SIZE, font: FONT_NAME }),
          new TextRun({ text: correctSentence, size: FONT_SIZE, font: FONT_NAME, color: '1B5E20' }),
        ],
        spacing: { before: 80, after: 80 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
        },
      })
    );
  });

  // ═══ Create Document ═══
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 567, right: 567, bottom: 567, left: 567 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${testData.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_영작시험지.docx`;
  saveAs(blob, fileName);
};
