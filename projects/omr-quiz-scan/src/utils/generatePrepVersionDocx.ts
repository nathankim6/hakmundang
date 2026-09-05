import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { getPrepSet, PREP_VERSION_META, type PrepVersion } from '@/data/prepVersions';
import type { PrepLevelTestQuestion } from '@/data/prepLevelTestQuestions';

const stripHtml = (t: string) =>
  (t || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ');

const textRuns = (text: string, size = 20, bold = false): TextRun[] => {
  const lines = stripHtml(text).split('\n');
  const runs: TextRun[] = [];
  lines.forEach((line, i) => {
    runs.push(new TextRun({ text: line, size, bold, break: i === 0 ? 0 : 1 }));
  });
  return runs;
};

const sectionHeader = (title: string) =>
  new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 28, color: '1e3a5f' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    border: { bottom: { color: '1e3a5f', space: 1, style: BorderStyle.SINGLE, size: 12 } },
  });

const questionParagraphs = (q: PrepLevelTestQuestion, no: number): Paragraph[] => {
  const paras: Paragraph[] = [];

  paras.push(
    new Paragraph({
      children: [new TextRun({ text: `${no}. `, bold: true, size: 22 }), ...textRuns(q.questionText, 22)],
      spacing: { before: 200, after: 100 },
    })
  );

  if (q.passageText) {
    paras.push(
      new Paragraph({
        children: textRuns(q.passageText, 20),
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  if (q.questionContent) {
    paras.push(
      new Paragraph({
        children: textRuns(q.questionContent, 20),
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  if (q.sentenceText || (q.sentenceWords && q.sentenceWords.length)) {
    paras.push(
      new Paragraph({
        children: textRuns(q.sentenceText || (q.sentenceWords || []).join(' '), 20),
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  if (q.arrangeWords && q.arrangeWords.length) {
    paras.push(
      new Paragraph({
        children: [new TextRun({ text: `[ ${q.arrangeWords.join(' / ')} ]`, size: 20 })],
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  const options = q.options && q.options.length ? q.options : q.fixedOptions;
  if (options && options.length) {
    const labels = ['①', '②', '③', '④', '⑤', '⑥'];
    options.forEach((opt, i) => {
      paras.push(
        new Paragraph({
          children: [new TextRun({ text: `${labels[i] || `(${i + 1})`} `, size: 20 }), ...textRuns(opt, 20)],
          indent: { left: 600 },
          spacing: { before: 40, after: 40 },
        })
      );
    });
  }

  if (q.inputType === 'text' || q.inputType === 'multiText' || q.inputType === 'wordArrangement') {
    paras.push(
      new Paragraph({
        children: [new TextRun({ text: '정답: _______________________________', size: 20 })],
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  return paras;
};

const groupKey = (q: PrepLevelTestQuestion): string =>
  q.section === 'grammar' ? `grammar${q.grammarLevel || 'A'}` : q.section;

const formatAnswer = (q: PrepLevelTestQuestion): string => {
  if (q.correctSubjects || q.correctVerbs) {
    const parts: string[] = [];
    if (q.correctSubjects?.length) parts.push(`S: ${q.correctSubjects.join(', ')}`);
    if (q.correctVerbs?.length) parts.push(`V: ${q.correctVerbs.join(', ')}`);
    if (parts.length) return parts.join(' / ');
  }
  if (q.correctAnswers && q.correctAnswers.length) return q.correctAnswers.join(', ');
  if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
    if (Array.isArray(q.correctAnswer)) return q.correctAnswer.join(', ');
    if (typeof q.correctAnswer === 'number') return String(q.correctAnswer);
    return stripHtml(String(q.correctAnswer)).replace(/\n/g, ' ');
  }
  return '-';
};

export const generatePrepVersionDocx = async (version: PrepVersion) => {
  const set = getPrepSet(version);
  const meta = PREP_VERSION_META[version];
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: '옳은영어 중등부 레벨테스트', bold: true, size: 40, color: '1e3a5f' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `${meta.label} · ${set.questions.length}문항 (총 ${set.totalMaxScore}점)`, size: 24, color: '64748b' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '이름: ________________    학교: ________________    학년: ________', size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
    })
  );

  const order = ['reading', 'grammarA', 'grammarB', 'grammarC', 'vocabulary', 'sentenceAnalysis'];
  const grouped = new Map<string, PrepLevelTestQuestion[]>();
  set.questions.forEach((q) => {
    const k = groupKey(q);
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(q);
  });

  const keys = [...order.filter((k) => grouped.has(k)), ...[...grouped.keys()].filter((k) => !order.includes(k))];
  let part = 1;
  keys.forEach((k) => {
    const list = grouped.get(k)!;
    paragraphs.push(sectionHeader(`PART ${part++}. ${set.sectionNames[k] || k}`));
    list.forEach((q) => paragraphs.push(...questionParagraphs(q, q.id)));
  });

  // ===== 정답표 =====
  const answerParagraphs: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '정답표 (Answer Key)', bold: true, size: 36, color: '1e3a5f' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      border: { bottom: { color: '1e3a5f', space: 1, style: BorderStyle.SINGLE, size: 12 } },
    }),
  ];

  let apart = 1;
  keys.forEach((k) => {
    const list = grouped.get(k)!;
    answerParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `PART ${apart++}. ${set.sectionNames[k] || k}`, bold: true, size: 24, color: '4a5568' })],
        spacing: { before: 240, after: 100 },
      })
    );

    const isLong = list.some((q) => formatAnswer(q).length > 12);
    const perRow = isLong ? 1 : 5;
    for (let i = 0; i < list.length; i += perRow) {
      const runs: TextRun[] = [];
      list.slice(i, i + perRow).forEach((q, idx) => {
        if (idx > 0) runs.push(new TextRun({ text: '    ', size: 20 }));
        runs.push(new TextRun({ text: `${q.id}.`, bold: true, size: 20, color: '1e3a5f' }));
        runs.push(new TextRun({ text: ` ${formatAnswer(q)}`, size: 20 }));
      });
      answerParagraphs.push(new Paragraph({ children: runs, spacing: { before: 40, after: 40 } }));
    }
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children: paragraphs,
      },
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children: answerParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `옳은영어_중등부_레벨테스트_${meta.label}_${set.questions.length}문항.docx`);
};
