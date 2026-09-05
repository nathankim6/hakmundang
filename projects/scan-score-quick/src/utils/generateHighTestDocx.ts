import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, HeadingLevel, PageOrientation, UnderlineType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { hsVocabularyQuestions, hsGrammarQuestions, hsPracticalQuestions, hsReadingQuestions } from '@/data/highSchoolLevelTestQuestions';

// Fetch image as ArrayBuffer
const fetchImageAsBuffer = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
};

// Parse HTML-like text and convert to TextRun array
const parseTextWithFormatting = (text: string, baseSize: number = 20): TextRun[] => {
  const runs: TextRun[] = [];
  
  // Replace <br> and <br/> with newlines
  let processedText = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove <span> tags but keep content
  processedText = processedText.replace(/<\/?span[^>]*>/gi, '');
  
  // Remove <strong> tags but keep content
  processedText = processedText.replace(/<\/?strong>/gi, '');
  
  // Process underline, italic, and em tags
  const underlineParts = processedText.split(/(<u>[\s\S]*?<\/u>)/gi);
  
  underlineParts.forEach(uPart => {
    if (uPart.match(/^<u>[\s\S]*<\/u>$/i)) {
      // Underlined text
      let content = uPart.slice(3, -4);
      content = content.replace(/<\/?em>/gi, '').replace(/<\/?i>/gi, '');
      
      if (content.includes('\n')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line) {
            runs.push(new TextRun({
              text: line,
              size: baseSize,
              underline: { type: UnderlineType.SINGLE },
            }));
          }
          if (idx < lines.length - 1) {
            runs.push(new TextRun({ text: '', break: 1 }));
          }
        });
      } else {
        runs.push(new TextRun({
          text: content,
          size: baseSize,
          underline: { type: UnderlineType.SINGLE },
        }));
      }
    } else {
      // Process em/italic tags
      const emParts = uPart.split(/(<em>[\s\S]*?<\/em>|<i>[\s\S]*?<\/i>)/gi);
      
      emParts.forEach(emPart => {
        if (emPart.match(/^<em>[\s\S]*<\/em>$/i) || emPart.match(/^<i>[\s\S]*<\/i>$/i)) {
          const content = emPart.replace(/<\/?em>/gi, '').replace(/<\/?i>/gi, '');
          if (content.includes('\n')) {
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (line) {
                runs.push(new TextRun({
                  text: line,
                  size: baseSize,
                  italics: true,
                }));
              }
              if (idx < lines.length - 1) {
                runs.push(new TextRun({ text: '', break: 1 }));
              }
            });
          } else {
            runs.push(new TextRun({
              text: content,
              size: baseSize,
              italics: true,
            }));
          }
        } else if (emPart.includes('\n')) {
          const lines = emPart.split('\n');
          lines.forEach((line, idx) => {
            if (line) {
              runs.push(new TextRun({ text: line, size: baseSize }));
            }
            if (idx < lines.length - 1) {
              runs.push(new TextRun({ text: '', break: 1 }));
            }
          });
        } else if (emPart) {
          runs.push(new TextRun({ text: emPart, size: baseSize }));
        }
      });
    }
  });
  
  return runs;
};

const createQuestionParagraph = (question: any, questionNumber: number): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  
  // Question number and text
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${questionNumber}. `,
          bold: true,
          size: 22,
        }),
        ...parseTextWithFormatting(question.questionText, 22),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  // Question content
  if (question.questionContent) {
    paragraphs.push(
      new Paragraph({
        children: parseTextWithFormatting(question.questionContent, 20),
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  // Passage text for reading
  if (question.passageText) {
    paragraphs.push(
      new Paragraph({
        children: parseTextWithFormatting(question.passageText, 20),
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  // Options
  if (question.options && question.options.length > 0) {
    const optionLabels = ['①', '②', '③', '④', '⑤'];
    question.options.forEach((option: string, index: number) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${optionLabels[index]} `,
              size: 20,
            }),
            ...parseTextWithFormatting(option, 20),
          ],
          indent: { left: 600 },
          spacing: { before: 50, after: 50 },
        })
      );
    });
  }

  // Answer blank for text input
  if (question.inputType === 'text') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '정답: _______________________________',
            size: 20,
          }),
        ],
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  return paragraphs;
};

const createSectionHeader = (title: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 28,
        color: '1e3a5f',
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: {
        color: '1e3a5f',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 12,
      },
    },
  });
};

export const generateHighTestDocx = async () => {
  const allParagraphs: Paragraph[] = [];

  // Title
  allParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '브래니악 영어 진단평가 고등부 · BEAT',
          bold: true,
          size: 40,
          color: '1e3a5f',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    })
  );

  // Student info
  allParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '이름: ________________    학교: ________________    학년: ________',
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
    })
  );

  // Vocabulary Section
  allParagraphs.push(createSectionHeader('PART 1. 어휘 (Vocabulary)'));
  hsVocabularyQuestions.forEach(q => {
    allParagraphs.push(...createQuestionParagraph(q, q.id));
  });

  // Grammar Section
  allParagraphs.push(createSectionHeader('PART 2. 문법 (Grammar)'));
  hsGrammarQuestions.forEach(q => {
    allParagraphs.push(...createQuestionParagraph(q, q.id));
  });

  // Practical English Section
  allParagraphs.push(createSectionHeader('PART 3. 실용영어 (Practical English)'));
  hsPracticalQuestions.forEach(q => {
    allParagraphs.push(...createQuestionParagraph(q, q.id));
  });

  // Reading Section
  allParagraphs.push(createSectionHeader('PART 4. 독해 (Reading)'));
  hsReadingQuestions.forEach(q => {
    allParagraphs.push(...createQuestionParagraph(q, q.id));
  });

  // Answer Key Section
  const answerKeyParagraphs: Paragraph[] = [];
  
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '정답표 (Answer Key)',
          bold: true,
          size: 36,
          color: '1e3a5f',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 300 },
      border: {
        bottom: {
          color: '1e3a5f',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
    })
  );

  // Helper function to format answer
  const formatAnswer = (q: any): string => {
    if (q.correctAnswer !== undefined) {
      if (typeof q.correctAnswer === 'number') {
        return `${q.correctAnswer}`;
      }
      return String(q.correctAnswer);
    }
    if (q.correctAnswers && q.correctAnswers.length > 0) {
      return q.correctAnswers.join(', ');
    }
    return '-';
  };

  // Vocabulary answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 1. 어휘 (Vocabulary)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  // Helper function to create styled answer runs
  const createAnswerRuns = (items: { num: number | string; answer: string }[]): TextRun[] => {
    const runs: TextRun[] = [];
    items.forEach((item, idx) => {
      if (idx > 0) {
        runs.push(new TextRun({ text: '    ', size: 20 }));
      }
      runs.push(new TextRun({ 
        text: `${item.num}.`, 
        bold: true, 
        size: 20, 
        color: '1e3a5f' 
      }));
      runs.push(new TextRun({ text: ` ${item.answer}`, size: 20 }));
    });
    return runs;
  };

  const vocabItems = hsVocabularyQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  answerKeyParagraphs.push(
    new Paragraph({
      children: createAnswerRuns(vocabItems),
      spacing: { before: 50, after: 150 },
    })
  );

  // Grammar answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 2. 문법 (Grammar)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  const grammarItems = hsGrammarQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  for (let i = 0; i < grammarItems.length; i += 10) {
    answerKeyParagraphs.push(
      new Paragraph({
        children: createAnswerRuns(grammarItems.slice(i, i + 10)),
        spacing: { before: 50, after: 50 },
      })
    );
  }

  // Practical English answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 3. 실용영어 (Practical English)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  const practicalItems = hsPracticalQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  answerKeyParagraphs.push(
    new Paragraph({
      children: createAnswerRuns(practicalItems),
      spacing: { before: 50, after: 150 },
    })
  );

  // Reading answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 4. 독해 (Reading)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  const readingItems = hsReadingQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  for (let i = 0; i < readingItems.length; i += 10) {
    answerKeyParagraphs.push(
      new Paragraph({
        children: createAnswerRuns(readingItems.slice(i, i + 10)),
        spacing: { before: 50, after: 50 },
      })
    );
  }

  // Create document with two columns
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
          column: {
            space: 400,
            count: 2,
          },
        },
        children: allParagraphs,
      },
      // Answer key section (single column)
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: answerKeyParagraphs,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, '브래니악_BEAT_고등부.docx');
};
