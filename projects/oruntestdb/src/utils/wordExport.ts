import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, SectionType, convertInchesToTwip } from "docx";
import { saveAs } from "file-saver";
import { Question } from "@/hooks/useQuestions";

export const exportQuestionsToWord = async (questions: Question[]) => {
  const sections: any[] = [];

  // 문제 섹션 생성
  const questionChildren: any[] = [
    new Paragraph({
      text: "문제",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  questions.forEach((question, index) => {
    // 문제 번호와 정보
    questionChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. [${question.school} / ${question.grade} / ${question.exam_year} / ${question.semester}]`,
            bold: true,
            size: 16,
            font: "맑은 고딕",
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    // 문제 제목
    questionChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: question.title,
            size: 16,
            font: "맑은 고딕",
          }),
        ],
        spacing: { after: 100 },
      })
    );

    // 문제 내용 - 줄바꿈 처리
    const contentLines = question.content.split('\n');
    contentLines.forEach((line, lineIndex) => {
      questionChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line || " ", // 빈 줄은 공백으로
              size: 16,
              font: "맑은 고딕",
            }),
          ],
          spacing: { 
            after: lineIndex === contentLines.length - 1 ? 300 : 0 
          },
        })
      );
    });
  });

  sections.push({
    properties: {
      type: SectionType.CONTINUOUS,
      column: {
        space: convertInchesToTwip(0.5),
        count: 2,
      },
    },
    children: questionChildren,
  });

  // 정답 및 해설 섹션 생성
  const answerChildren: any[] = [
    new Paragraph({
      text: "정답 및 해설",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
    }),
  ];

  questions.forEach((question, index) => {
    // 문제 번호와 정보
    answerChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. [${question.school} / ${question.grade} / ${question.exam_year} / ${question.semester}]`,
            bold: true,
            size: 16,
            font: "맑은 고딕",
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    // 정답 제목
    answerChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "정답:",
            bold: true,
            size: 16,
            font: "맑은 고딕",
          }),
        ],
        spacing: { after: 50 },
      })
    );

    // 정답 내용 - 줄바꿈 처리
    const answerLines = question.answer.split('\n');
    answerLines.forEach((line) => {
      answerChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line || " ",
              size: 16,
              font: "맑은 고딕",
            }),
          ],
          spacing: { after: 0 },
        })
      );
    });

    if (question.explanation) {
      // 해설 제목
      answerChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "해설:",
              bold: true,
              size: 16,
              font: "맑은 고딕",
            }),
          ],
          spacing: { before: 100, after: 50 },
        })
      );

      // 해설 내용 - 줄바꿈 처리
      const explanationLines = question.explanation.split('\n');
      explanationLines.forEach((line, lineIndex) => {
        answerChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line || " ",
                size: 16,
                font: "맑은 고딕",
              }),
            ],
            spacing: { 
              after: lineIndex === explanationLines.length - 1 ? 300 : 0 
            },
          })
        );
      });
    } else {
      answerChildren.push(
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }
  });

  sections.push({
    properties: {
      type: SectionType.NEXT_PAGE,
    },
    children: answerChildren,
  });

  const doc = new Document({
    sections: sections,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `문제_${new Date().toISOString().split('T')[0]}.docx`);
};
