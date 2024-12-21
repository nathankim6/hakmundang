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
        ...questions.map((q) => {
          // Split content into question part and answer/explanation part
          const parts = q.content.split('[정답]');
          const questionPart = parts[0].trim();
          
          return new Paragraph({
            children: [
              new TextRun({
                text: `문제 ${q.questionNumber}\n`,
                bold: true,
                size: 24
              }),
              new TextRun({
                text: questionPart,
                size: 24,
                font: {
                  name: "맑은 고딕"
                }
              }),
              new TextRun({
                text: "\n\n",  // Add spacing between questions
                size: 24
              })
            ]
          });
        }),

        // Page break before answers section
        new Paragraph({
          children: [new TextRun({ break: 1 })]
        }),

        // Answers and Explanations Section Title
        new Paragraph({
          children: [
            new TextRun({
              text: "정답 및 해설\n\n",
              bold: true,
              size: 28,
              font: {
                name: "맑은 고딕"
              }
            })
          ]
        }),
        
        // Answers and Explanations Content
        ...questions.map(q => {
          const content = q.content;
          const answerMatch = content.match(/\[정답\] (.*?)\n/);
          const explanationMatch = content.match(/\[해설\] (.*?)(?=(\n|$))/);
          
          return new Paragraph({
            children: [
              new TextRun({
                text: `문제 ${q.questionNumber}\n`,
                bold: true,
                size: 24,
                font: {
                  name: "맑은 고딕"
                }
              }),
              new TextRun({
                text: `정답: ${answerMatch?.[1] || '정답 없음'}\n`,
                size: 24,
                font: {
                  name: "맑은 고딕"
                }
              }),
              new TextRun({
                text: `해설: ${explanationMatch?.[1] || '해설 없음'}\n\n`,
                size: 24,
                font: {
                  name: "맑은 고딕"
                }
              })
            ]
          });
        })
      ]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, 'ORUN_AI_QUIZ.docx');
};