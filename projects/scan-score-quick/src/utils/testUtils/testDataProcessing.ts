// Define the section structure
export interface TestSection {
  name: string;
  range: number[];
}

// Standard test sections for 45-question tests
export const STANDARD_TEST_SECTIONS: TestSection[] = [
  {
    name: "듣기",
    range: Array.from({ length: 17 }, (_, i) => i + 1)
  },
  {
    name: "대의파악",
    range: [...Array.from({ length: 7 }, (_, i) => i + 18), 40]
  },
  {
    name: "내용이해",
    range: Array.from({ length: 4 }, (_, i) => i + 25)
  },
  {
    name: "어법어휘",
    range: [29, 30]
  },
  {
    name: "빈칸추론",
    range: [31, 32, 33, 34]
  },
  {
    name: "간접쓰기",
    range: [35, 36, 37, 38, 39]
  },
  {
    name: "장문",
    range: [41, 42, 43, 44, 45]
  }
];

// High school entrance test sections for 22-question tests
export const HIGH_SCHOOL_ENTRANCE_TEST_SECTIONS: TestSection[] = [
  {
    name: "어휘",
    range: Array.from({ length: 7 }, (_, i) => i + 1)
  },
  {
    name: "어법",
    range: Array.from({ length: 8 }, (_, i) => i + 8)
  },
  {
    name: "작문",
    range: [16, 17, 18]
  },
  {
    name: "독해",
    range: [19, 20, 21, 22]
  }
];

// Add the missing interface for QRData
export interface QRDataType {
  testId: string;
  title: string;
  questionCount: number;
  timestamp: string;
  answers: Record<number, any>;
  isEnded?: boolean;
  writingQuestions?: any[];
  testFormat?: string;
}

/**
 * Maps raw test data from database to QR data format
 */
export const mapTestsToQRData = (tests: any[]): QRDataType[] => {
  if (!tests || tests.length === 0) {
    return [];
  }
  
  return tests.map(test => {
    const answers = test.answers || {};
    
    // Infer testFormat from data: if any answer has grammarCategory, it's a grammar test
    let testFormat: string | undefined = test.test_format || undefined;
    if (!testFormat) {
      const hasGrammarCategory = Object.values(answers).some(
        (a: any) => a && typeof a === 'object' && a.grammarCategory
      );
      if (hasGrammarCategory) {
        testFormat = 'grammar';
      }
    }

    return {
      testId: test.test_id,
      title: test.title || '제목 없음',
      questionCount: test.question_count || 0,
      timestamp: test.created_at,
      answers,
      isEnded: test.is_ended || false,
      writingQuestions: test.writing_questions || undefined,
      testFormat: testFormat as any,
    };
  });
};

/**
 * Process test results for display and analysis
 */
export const processTestResults = (results: any[]): any[] => {
  if (!results || results.length === 0) {
    return [];
  }
  
  // Group results by test_id
  const groupedResults = results.reduce((acc, result) => {
    const testId = result.test_id;
    if (!acc[testId]) {
      acc[testId] = [];
    }
    acc[testId].push(result);
    return acc;
  }, {});
  
  // Sort groups by the latest result's timestamp
  const sortedGroups = Object.entries(groupedResults)
    .map(([testId, results]) => ({
      testId,
      results: results as any[],
      latestTimestamp: Math.max(...(results as any[]).map(r => new Date(r.created_at).getTime()))
    }))
    .sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  
  // Flatten the groups back but keep them ordered by test
  return sortedGroups.flatMap(group => group.results);
};

/**
 * Calculate area-specific performance from test results
 */
export const calculateAreaPerformance = (testResults: any[], testData: any[]): any[] => {
  console.log('=== calculateAreaPerformance Debug ===');
  console.log('testResults:', testResults);
  console.log('testData:', testData);
  
  if (!testResults || testResults.length === 0 || !testData || testData.length === 0) {
    console.log('Early return: no data');
    return [];
  }

  // Initialize area scores with all actual scores from all tests
  const areaScores: Record<string, { scores: number[] }> = {};
  
  STANDARD_TEST_SECTIONS.forEach(section => {
    areaScores[section.name] = { scores: [] };
  });

  // Process each test result
  testResults.forEach((result, index) => {
    console.log(`Processing test result ${index}:`, result);
    const testInfo = testData.find(test => test.test_id === result.test_id);
    console.log('Found testInfo:', testInfo);
    
    if (!testInfo) {
      console.log('No testInfo found for test_id:', result.test_id);
      return;
    }

    const correctAnswers = testInfo.answers || {};
    let studentAnswers = result.student_answers || {};
    
    // Parse student answers if it's a string
    if (typeof studentAnswers === 'string') {
      try {
        studentAnswers = JSON.parse(studentAnswers);
      } catch (e) {
        console.error('Error parsing student answers:', e);
        studentAnswers = {};
      }
    }
    
    console.log('correctAnswers:', correctAnswers);
    console.log('studentAnswers:', studentAnswers);

    // Calculate score for each section for this specific test
    STANDARD_TEST_SECTIONS.forEach(section => {
      let sectionCorrect = 0;
      let sectionTotal = 0;

      section.range.forEach(questionNum => {
        if (correctAnswers[questionNum] !== undefined) {
          sectionTotal++;
          
          // Handle different answer formats
          const correctAnswer = correctAnswers[questionNum]?.answer ?? correctAnswers[questionNum];
          const studentAnswer = studentAnswers[questionNum]?.answer ?? studentAnswers[questionNum];
          
          // Compare answers (handle both arrays and single values)
          let isCorrect = false;
          if (Array.isArray(correctAnswer) && Array.isArray(studentAnswer)) {
            isCorrect = JSON.stringify(correctAnswer.sort()) === JSON.stringify(studentAnswer.sort());
          } else if (Array.isArray(correctAnswer)) {
            isCorrect = correctAnswer.includes(studentAnswer);
          } else if (Array.isArray(studentAnswer)) {
            isCorrect = studentAnswer.includes(correctAnswer);
          } else {
            isCorrect = String(correctAnswer) === String(studentAnswer);
          }
          
          if (isCorrect) {
            sectionCorrect++;
          }
        }
      });

      // If this section had questions in this test, add the score
      if (sectionTotal > 0) {
        const sectionScore = Math.round((sectionCorrect / sectionTotal) * 100);
        console.log(`Section ${section.name}: ${sectionCorrect}/${sectionTotal} = ${sectionScore}%`);
        areaScores[section.name].scores.push(sectionScore);
      }
    });
  });

  console.log('Final areaScores with all test data:', areaScores);

  // Calculate average scores for each area across all tests
  const result = STANDARD_TEST_SECTIONS.map(section => {
    const areaData = areaScores[section.name];
    let avgScore = 0;
    
    if (areaData.scores.length > 0) {
      // Calculate weighted average based on all actual test performances
      avgScore = Math.round(areaData.scores.reduce((sum, score) => sum + score, 0) / areaData.scores.length);
    } else {
      // Fallback: if no actual data, use overall student performance as base
      const overallScore = testResults.length > 0 
        ? testResults.reduce((sum, test) => sum + Number(test.score), 0) / testResults.length 
        : 70;
      
      // Apply realistic variations based on section difficulty
      const sectionMultipliers = {
        '듣기': 0.85,
        '대의파악': 0.95,
        '내용이해': 1.05,
        '어법어휘': 0.90,
        '빈칸추론': 0.80,
        '간접쓰기': 0.88,
        '장문': 0.92
      };
      
      avgScore = Math.round(overallScore * (sectionMultipliers[section.name] || 1.0));
    }
    
    return {
      subject: section.name,
      score: Math.max(0, Math.min(100, avgScore)) // Ensure score is between 0-100
    };
  });

  console.log('Final calculated area performance:', result);
  return result;
};
