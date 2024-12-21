import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';

interface QuestionData {
  content: string;
  questionNumber: number;
}

export const generateDocument = async (questions: QuestionData[]) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Questions Section
        ...questions.map(q => new Paragraph({
          children: [
            new TextRun({
              text: `문제 ${q.questionNumber}\n`,
              bold: true,
            }),
            new TextRun(q.content),
            new TextRun("\n\n"),
          ],
        })),

        // Answers and Explanations Section
        new Paragraph({
          children: [
            new TextRun({
              text: "\n정답 및 해설\n",
              bold: true,
              size: 28,
            }),
          ],
        }),
        
        ...questions.map(q => {
          const content = q.content;
          const answerMatch = content.match(/\[정답\] (.*?)\n/);
          const explanationMatch = content.match(/\[해설\] (.*?)(?=(\n|$))/);
          
          return new Paragraph({
            children: [
              new TextRun({
                text: `문제 ${q.questionNumber}\n`,
                bold: true,
              }),
              new TextRun({
                text: `정답: ${answerMatch?.[1] || '정답 없음'}\n`,
              }),
              new TextRun({
                text: `해설: ${explanationMatch?.[1] || '해설 없음'}\n\n`,
              }),
            ],
          });
        }),
      ],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, 'ORUN_AI_QUIZ.docx');
};