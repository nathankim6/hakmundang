import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, HeadingLevel, PageOrientation, UnderlineType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { grammarQuestions, readingQuestions, vocabularyQuestions, sentenceQuestions } from '@/data/levelTestQuestions';

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
  // First split by underline
  const underlineParts = processedText.split(/(<u>[\s\S]*?<\/u>)/gi);
  
  underlineParts.forEach(uPart => {
    if (uPart.match(/^<u>[\s\S]*<\/u>$/i)) {
      // Underlined text - also check for nested em/italic
      let content = uPart.slice(3, -4);
      content = content.replace(/<\/?em>/gi, '').replace(/<\/?i>/gi, '');
      
      // Handle line breaks within underlined text
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
      // Process em/italic tags in non-underlined parts
      const emParts = uPart.split(/(<em>[\s\S]*?<\/em>|<i>[\s\S]*?<\/i>)/gi);
      
      emParts.forEach(emPart => {
        if (emPart.match(/^<em>[\s\S]*<\/em>$/i) || emPart.match(/^<i>[\s\S]*<\/i>$/i)) {
          // Italic text
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
          // Handle line breaks
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

const createQuestionParagraph = async (question: any, questionNumber: number, imageCache: Map<string, ArrayBuffer | null>): Promise<Paragraph[]> => {
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

  // Question content (빈칸 문제, 대화 문제 등)
  if (question.questionContent) {
    paragraphs.push(
      new Paragraph({
        children: parseTextWithFormatting(question.questionContent, 20),
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  // Chart image - actually insert the image
  if (question.chartImage) {
    const imageBuffer = imageCache.get(question.chartImage);
    if (imageBuffer) {
      paragraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: 280,
                height: 180,
              },
              type: 'png',
            }),
          ],
          indent: { left: 400 },
          spacing: { before: 100, after: 100 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '[도표 이미지 참조]',
              size: 18,
              italics: true,
              color: '6b7280',
            }),
          ],
          indent: { left: 400 },
          spacing: { before: 100, after: 100 },
        })
      );
    }
  }

  // Sentence words for sentenceClick type
  if (question.inputType === 'sentenceClick' && question.sentenceWords) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: question.sentenceWords.join(' '),
            size: 20,
          }),
        ],
        indent: { left: 400 },
        spacing: { before: 100, after: 100 },
      })
    );
  }

  // Options if exists (for choice questions, not vocabulary)
  if (question.options && question.options.length > 0 && question.section !== 'vocabulary') {
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
  if (question.inputType === 'text' || question.inputType === 'multiText') {
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

// Generate distractors for vocabulary
const generateVocabOptions = (correctAnswers: string[]): string[] => {
  const allDistractors = [
    "행복한", "슬픈", "빠른", "느린", "크다", "작다", "높다", "낮다",
    "뜨거운", "차가운", "부드러운", "거친", "밝다", "어둡다", "깨끗한", "더러운",
    "강한", "약한", "무거운", "가벼운", "길다", "짧다", "넓다", "좁다",
    "새로운", "오래된", "젊다", "늙다", "부자", "가난한", "바쁜", "한가한",
    "친절한", "불친절한", "정직한", "거짓말", "용감한", "겁쟁이", "현명한", "어리석은",
    "건강한", "아픈", "피곤한", "활기찬", "배고픈", "배부른", "목마른", "졸린",
    "즐거운", "지루한", "흥미로운", "재미없는", "유용한", "쓸모없는", "중요한", "사소한",
    "아름다운", "못생긴", "예쁜", "평범한", "특별한", "일반적인", "희귀한", "흔한",
    "필요한", "불필요한", "가능한", "불가능한", "쉬운", "어려운", "간단한", "복잡한",
    "참여하다", "떠나다", "시작하다", "끝내다", "만들다", "파괴하다", "찾다", "잃다",
    "사다", "팔다", "주다", "받다", "보내다", "가져오다", "열다", "닫다"
  ];
  
  const availableDistractors = allDistractors.filter(d => 
    !correctAnswers.some(c => c.includes(d) || d.includes(c))
  );
  
  const shuffled = [...availableDistractors].sort(() => Math.random() - 0.5);
  const numDistractors = Math.min(5 - correctAnswers.length, 4);
  const selectedDistractors = shuffled.slice(0, numDistractors);
  
  const allOptions = [...correctAnswers, ...selectedDistractors].sort(() => Math.random() - 0.5);
  return allOptions;
};

export const generateMiddleTestDocx = async () => {
  const allParagraphs: Paragraph[] = [];

  // Pre-fetch all chart images
  const imageCache = new Map<string, ArrayBuffer | null>();
  const allQuestions = [...grammarQuestions, ...readingQuestions, ...vocabularyQuestions, ...sentenceQuestions];
  const questionsWithImages = allQuestions.filter(q => q.chartImage);
  
  await Promise.all(
    questionsWithImages.map(async (q) => {
      if (q.chartImage) {
        const buffer = await fetchImageAsBuffer(q.chartImage);
        imageCache.set(q.chartImage, buffer);
      }
    })
  );

  // Title
  allParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '브래니악 영어 진단평가 중등부 · BEAT',
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

  // Grammar Section
  allParagraphs.push(createSectionHeader('PART 1. 문법 (Grammar)'));
  for (const q of grammarQuestions) {
    const paras = await createQuestionParagraph(q, q.id, imageCache);
    allParagraphs.push(...paras);
  }

  // Reading Section
  allParagraphs.push(createSectionHeader('PART 2. 독해 (Reading)'));
  for (const q of readingQuestions) {
    const paras = await createQuestionParagraph(q, q.id, imageCache);
    allParagraphs.push(...paras);
  }

  // Vocabulary Section
  allParagraphs.push(createSectionHeader('PART 3. 어휘 (Vocabulary)'));
  allParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '※ 다음 영어 단어에 해당하는 뜻을 모두 고르시오.',
          size: 20,
          italics: true,
        }),
      ],
      spacing: { before: 100, after: 200 },
    })
  );

  vocabularyQuestions.forEach(q => {
    const correctAnswers = q.correctAnswers || [];
    const options = generateVocabOptions(correctAnswers);
    const optionLabels = ['①', '②', '③', '④', '⑤'];
    
    allParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${q.id}. `,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: q.questionText,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: `  (정답 ${correctAnswers.length}개)`,
            size: 18,
            color: '6b7280',
          }),
        ],
        spacing: { before: 200, after: 80 },
      })
    );
    
    const optionText = options.map((opt, idx) => `${optionLabels[idx]} ${opt}`).join('    ');
    allParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: optionText,
            size: 20,
          }),
        ],
        indent: { left: 400 },
        spacing: { before: 50, after: 100 },
      })
    );
  });

  // Sentence Structure Section
  allParagraphs.push(createSectionHeader('PART 4. 문장 구조 분석 (Sentence Analysis)'));
  allParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '※ 다음 문장에서 본주어(S)와 본동사(V)를 찾아 쓰시오.',
          size: 20,
          italics: true,
        }),
      ],
      spacing: { before: 100, after: 200 },
    })
  );

  sentenceQuestions.forEach(q => {
    allParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${q.id}. `,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: q.sentenceWords?.join(' ') || q.questionContent || '',
            size: 20,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    
    allParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '주어(S): _______________    동사(V): _______________',
            size: 20,
          }),
        ],
        indent: { left: 400 },
        spacing: { before: 50, after: 100 },
      })
    );
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
    if (q.correctSubjects || q.correctVerbs) {
      const parts = [];
      if (q.correctSubjects) parts.push(`S: ${q.correctSubjects.join(', ')}`);
      if (q.correctVerbs) parts.push(`V: ${q.correctVerbs.join(', ')}`);
      return parts.join(' / ');
    }
    return '-';
  };

  // Grammar answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 1. 문법 (Grammar)',
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

  const grammarItems = grammarQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  for (let i = 0; i < grammarItems.length; i += 10) {
    answerKeyParagraphs.push(
      new Paragraph({
        children: createAnswerRuns(grammarItems.slice(i, i + 10)),
        spacing: { before: 50, after: 50 },
      })
    );
  }

  // Reading answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 2. 독해 (Reading)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  const readingItems = readingQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  for (let i = 0; i < readingItems.length; i += 10) {
    answerKeyParagraphs.push(
      new Paragraph({
        children: createAnswerRuns(readingItems.slice(i, i + 10)),
        spacing: { before: 50, after: 50 },
      })
    );
  }

  // Vocabulary answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 3. 어휘 (Vocabulary)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  const vocabItems = vocabularyQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  for (let i = 0; i < vocabItems.length; i += 5) {
    answerKeyParagraphs.push(
      new Paragraph({
        children: createAnswerRuns(vocabItems.slice(i, i + 5)),
        spacing: { before: 50, after: 50 },
      })
    );
  }

  // Sentence Structure answers
  answerKeyParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART 4. 문장 구조 분석 (Sentence Analysis)',
          bold: true,
          size: 24,
          color: '4a5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  const sentenceItems = sentenceQuestions.map(q => ({ num: q.id, answer: formatAnswer(q) }));
  sentenceItems.forEach(item => {
    answerKeyParagraphs.push(
      new Paragraph({
        children: createAnswerRuns([item]),
        spacing: { before: 50, after: 50 },
      })
    );
  });

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
  saveAs(blob, '브래니악_BEAT_중등부.docx');
};
