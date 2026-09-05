import { allLevelTestQuestions, analysisCategories, LevelTestQuestion } from '@/data/levelTestQuestions';

interface SubCategoryScore {
  name: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
}

interface SectionScore {
  section: string;
  sectionName: string;
  totalQuestions: number;
  correctCount: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
}

// 문제 정답 여부 확인
const isAnswerCorrect = (question: LevelTestQuestion, studentAnswer: any): boolean => {
  if (studentAnswer === undefined || studentAnswer === null || studentAnswer === '') {
    return false;
  }

  // 문장 클릭 타입
  if (question.inputType === 'sentenceClick') {
    if (typeof studentAnswer === 'object') {
      const correctSubjects = question.correctSubjects || [];
      const correctVerbs = question.correctVerbs || [];
      const optionalSubjects = question.optionalSubjects || [];
      const optionalVerbs = question.optionalVerbs || [];
      const studentSubjects = studentAnswer.subjects || [];
      const studentVerbs = studentAnswer.verbs || [];
      
      // 주어와 동사 추출 (형식: "index-word")
      const extractWords = (arr: string[]) => arr.map((s: string) => {
        const parts = s.split('-');
        return parts.length > 1 ? parts.slice(1).join('-') : s;
      });
      
      const studentSubjectWords = extractWords(studentSubjects);
      const studentVerbWords = extractWords(studentVerbs);
      
      // 필수 정답이 모두 포함되어 있는지 확인
      const requiredSubjectsMatch = correctSubjects.every((s: string) => studentSubjectWords.includes(s));
      const requiredVerbsMatch = correctVerbs.every((v: string) => studentVerbWords.includes(v));
      
      // 학생이 선택한 것이 모두 정답(필수+선택적)에 속하는지 확인
      const allSubjectsValid = studentSubjectWords.every((s: string) => 
        correctSubjects.includes(s) || optionalSubjects.includes(s)
      );
      const allVerbsValid = studentVerbWords.every((v: string) => 
        correctVerbs.includes(v) || optionalVerbs.includes(v)
      );
      
      return requiredSubjectsMatch && requiredVerbsMatch && allSubjectsValid && allVerbsValid;
    }
    return false;
  }

  // 다중 정답 (어휘)
  if (question.correctAnswers) {
    // 학생 답안을 배열로 변환 (쉼표로 분리)
    let studentAnswerList: string[];
    if (Array.isArray(studentAnswer)) {
      studentAnswerList = studentAnswer.map((a: string) => String(a).trim());
    } else {
      // 쉼표로 분리하여 배열로 변환
      studentAnswerList = String(studentAnswer).split(/[,，]/).map(a => a.trim()).filter(a => a);
    }
    
    // 괄호 및 공백 제거하여 정규화
    const normalizedStudentAnswers = studentAnswerList.map(a => 
      a.toLowerCase().replace(/\s/g, '').replace(/[()（）\[\]]/g, '')
    );
    const normalizedCorrectAnswers = question.correctAnswers.map(a => 
      a.toLowerCase().replace(/\s/g, '').replace(/[()（）\[\]]/g, '')
    );
    
    // 학생이 입력한 모든 단어가 정답에 포함되고, 정답의 모든 단어가 학생 답에 포함되면 정답
    const allStudentAnswersValid = normalizedStudentAnswers.every(sa => 
      normalizedCorrectAnswers.some(ca => ca === sa || ca.includes(sa) || sa.includes(ca))
    );
    const allCorrectAnswersCovered = normalizedCorrectAnswers.every(ca => 
      normalizedStudentAnswers.some(sa => ca === sa || ca.includes(sa) || sa.includes(ca))
    );
    
    return allStudentAnswersValid && allCorrectAnswersCovered;
  }

  // 주관식 텍스트
  if (question.inputType === 'text') {
    const correctStr = String(question.correctAnswer).toLowerCase().replace(/\s/g, '');
    const studentStr = String(studentAnswer).toLowerCase().replace(/\s/g, '');
    return correctStr === studentStr;
  }

  // 객관식
  return Number(studentAnswer) === Number(question.correctAnswer);
};

// 섹션별 점수 계산
export const calculateSectionScores = (answers: Record<string, any>): SectionScore[] => {
  const sections = ['grammar', 'reading', 'vocabulary', 'sentence'] as const;
  const sectionNames: Record<string, string> = {
    grammar: '문법',
    reading: '독해',
    vocabulary: '어휘',
    sentence: '문장 구조'
  };

  return sections.map(section => {
    const sectionQuestions = allLevelTestQuestions.filter(q => q.section === section);
    let correctCount = 0;
    let earnedPoints = 0;
    let totalPoints = 0;

    sectionQuestions.forEach(question => {
      totalPoints += question.points;
      const studentAnswer = answers[question.id];
      if (isAnswerCorrect(question, studentAnswer)) {
        correctCount++;
        earnedPoints += question.points;
      }
    });

    return {
      section,
      sectionName: sectionNames[section],
      totalQuestions: sectionQuestions.length,
      correctCount,
      totalPoints,
      earnedPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    };
  });
};

// 서브 카테고리별 점수 계산
export const calculateSubCategoryScores = (answers: Record<string, any>): Record<string, SubCategoryScore[]> => {
  const result: Record<string, SubCategoryScore[]> = {};

  (Object.keys(analysisCategories) as Array<keyof typeof analysisCategories>).forEach(section => {
    const category = analysisCategories[section];
    result[section] = category.subCategories.map(subCat => {
      const questions = allLevelTestQuestions.filter(
        q => q.section === section && q.subCategory === subCat.name
      );
      
      let correctCount = 0;
      questions.forEach(question => {
        const studentAnswer = answers[question.id];
        if (isAnswerCorrect(question, studentAnswer)) {
          correctCount++;
        }
      });

      return {
        name: subCat.name,
        totalQuestions: questions.length,
        correctCount,
        percentage: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
      };
    });
  });

  return result;
};

// 총점 계산
export const calculateTotalScore = (answers: Record<string, any>): number => {
  let totalEarned = 0;

  allLevelTestQuestions.forEach(question => {
    const studentAnswer = answers[question.id];
    if (isAnswerCorrect(question, studentAnswer)) {
      totalEarned += question.points;
    }
  });

  return totalEarned;
};

// 전체 결과 재계산
export const recalculateResult = (result: {
  answers: Record<string, any>;
  [key: string]: any;
}) => {
  const sectionScores = calculateSectionScores(result.answers);
  const subCategoryScores = calculateSubCategoryScores(result.answers);
  const totalScore = calculateTotalScore(result.answers);

  return {
    ...result,
    section_scores: sectionScores,
    sub_category_scores: subCategoryScores,
    total_score: totalScore
  };
};
