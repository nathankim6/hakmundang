import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  PageBreak,
  Packer,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";

interface ExamSentence {
  index: number;
  korean: string;
  english: string;
  fullEnglish: string;
}

interface ExamPassage {
  title: string;
  sentences: ExamSentence[];
}

interface ExamGrade {
  name: string;
  passages: ExamPassage[];
}

/** Shuffle an array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Remove trailing period from the last word */
function removeTrailingPeriod(words: string[]): string[] {
  if (words.length === 0) return words;
  const last = words[words.length - 1];
  if (last.endsWith(".")) {
    return [...words.slice(0, -1), last.slice(0, -1)];
  }
  return words;
}

/** Split text into words */
function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function buildScrambledLine(english: string, fullEnglish: string): TextRun[] {
  const isPartial = english.trim() !== fullEnglish.trim() && fullEnglish.includes(english.trim());

  if (isPartial) {
    const trimmed = english.trim();
    const startIdx = fullEnglish.indexOf(trimmed);
    const before = fullEnglish.substring(0, startIdx);
    const after = fullEnglish.substring(startIdx + trimmed.length);
    let words = splitWords(trimmed);
    // Remove trailing period if this partial is at the end of the sentence
    if (!after.trim()) {
      words = removeTrailingPeriod(words);
    }
    const scrambledWords = shuffle(words);

    const runs: TextRun[] = [];

    if (before.trim()) {
      runs.push(new TextRun({
        text: before,
        size: 20,
        font: "맑은 고딕",
      }));
    }

    runs.push(new TextRun({
      text: `[ ${scrambledWords.join("  /  ")} ]`,
      size: 20,
      font: "맑은 고딕",
      bold: true,
    }));

    if (after.trim()) {
      runs.push(new TextRun({
        text: after,
        size: 20,
        font: "맑은 고딕",
      }));
    }

    return runs;
  }

  // Full scramble — remove trailing period from last word
  let words = splitWords(english);
  words = removeTrailingPeriod(words);
  const scrambledWords = shuffle(words);
  return [
    new TextRun({
      text: `[ ${scrambledWords.join("  /  ")} ]`,
      size: 20,
      font: "맑은 고딕",
      bold: true,
    }),
  ];
}

export async function generateExamDocx(
  schoolName: string,
  grades: ExamGrade[],
  logoUrl?: string
) {
  const docChildren: Paragraph[] = [];

  // ── Title ──
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: schoolName, bold: true, size: 36, font: "맑은 고딕" }),
      ],
    })
  );
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "서술형 대비 문장", bold: true, size: 28, font: "맑은 고딕", color: "4B5563" }),
      ],
    })
  );

  // Name / Date
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 80, after: 160 },
      children: [
        new TextRun({ text: "이름: ________________    ", size: 20, font: "맑은 고딕" }),
        new TextRun({ text: "날짜: ________________", size: 20, font: "맑은 고딕" }),
      ],
    })
  );

  docChildren.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" } },
      spacing: { after: 200 },
      children: [],
    })
  );

  let questionNum = 1;
  // Store answers for answer key
  const answers: { num: number; answer: string; passageTitle: string; gradeName: string }[] = [];

  grades.forEach((grade, gradeIdx) => {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: gradeIdx > 0 ? 400 : 0, after: 160 },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3F4F6" },
        indent: { left: 100, right: 100 },
        children: [
          new TextRun({ text: `  📖 ${grade.name}`, bold: true, size: 26, font: "맑은 고딕" }),
        ],
      })
    );

    grade.passages.forEach((passage) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 120 },
          indent: { left: 100 },
          children: [
            new TextRun({ text: `▸ ${passage.title}`, bold: true, size: 22, font: "맑은 고딕", color: "1A56DB" }),
          ],
        })
      );

      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: "※ 다음 한글 뜻을 읽고, 제시된 단어를 올바른 순서로 배열하여 영작하세요.",
              size: 18, font: "맑은 고딕", color: "6B7280", italics: true,
            }),
          ],
        })
      );

      passage.sentences.forEach((s) => {
        // Store answer
        answers.push({
          num: questionNum,
          answer: s.fullEnglish,
          passageTitle: passage.title,
          gradeName: grade.name,
        });

        // Korean
        docChildren.push(
          new Paragraph({
            spacing: { before: 180, after: 60 },
            indent: { left: 200 },
            children: [
              new TextRun({ text: `${questionNum}. `, bold: true, size: 21, font: "맑은 고딕" }),
              new TextRun({ text: s.korean, size: 21, font: "맑은 고딕" }),
            ],
          })
        );

        // Scrambled
        const scrambledRuns = buildScrambledLine(s.english, s.fullEnglish);
        docChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: 400 },
            children: [
              new TextRun({ text: "→ ", size: 20, font: "맑은 고딕", color: "9CA3AF" }),
              ...scrambledRuns,
            ],
          })
        );

        // 3 blank lines
        docChildren.push(new Paragraph({ spacing: { after: 0 }, children: [] }));
        docChildren.push(new Paragraph({ spacing: { after: 0 }, children: [] }));
        docChildren.push(new Paragraph({ spacing: { after: 100 }, children: [] }));

        questionNum++;
      });
    });
  });

  // ── Answer Key (new page) ──
  const answerChildren: Paragraph[] = [];

  const answerTitleRuns: (TextRun)[] = [new PageBreak() as any];
  answerTitleRuns.push(new TextRun({ text: schoolName, bold: true, size: 36, font: "맑은 고딕" }));

  answerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: answerTitleRuns,
    })
  );
  answerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new TextRun({ text: "📝 정답지", bold: true, size: 28, font: "맑은 고딕", color: "DC2626" }),
      ],
    })
  );

  answerChildren.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" } },
      spacing: { after: 200 },
      children: [],
    })
  );

  let currentGrade = "";
  let currentPassage = "";

  answers.forEach((a) => {
    if (a.gradeName !== currentGrade) {
      currentGrade = a.gradeName;
      answerChildren.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3F4F6" },
          indent: { left: 100, right: 100 },
          children: [
            new TextRun({ text: `  📖 ${a.gradeName}`, bold: true, size: 24, font: "맑은 고딕" }),
          ],
        })
      );
      currentPassage = "";
    }

    if (a.passageTitle !== currentPassage) {
      currentPassage = a.passageTitle;
      answerChildren.push(
        new Paragraph({
          spacing: { before: 140, after: 80 },
          indent: { left: 100 },
          children: [
            new TextRun({ text: `▸ ${a.passageTitle}`, bold: true, size: 20, font: "맑은 고딕", color: "1A56DB" }),
          ],
        })
      );
    }

    answerChildren.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        indent: { left: 300 },
        children: [
          new TextRun({ text: `${a.num}. `, bold: true, size: 20, font: "맑은 고딕", color: "374151" }),
          new TextRun({ text: a.answer, size: 20, font: "맑은 고딕" }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        children: [...docChildren, ...answerChildren],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${schoolName}_서술형시험지.docx`);
}
