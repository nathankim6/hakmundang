import { supabase } from '@/integrations/supabase/client';

export interface ExamProblem {
  id: string;
  exam_id: string;
  problem_number: number;
  korean: string;
  english: string;
  shuffled_words: string[];
}

export interface Exam {
  id: string;
  title: string;
  creator: string;
  created_at: string;
  problems?: ExamProblem[];
}

export interface SubmissionAnswer {
  id: string;
  submission_id: string;
  problem_id: string;
  user_answer: string;
  is_correct: boolean;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  participant_name: string;
  affiliation: string | null;
  score: number;
  total_problems: number;
  submitted_at: string;
  answers?: SubmissionAnswer[];
}

// 시험 목록 조회
export const getExams = async (): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
  
  return data || [];
};

// 시험 상세 조회 (문제 포함)
export const getExamById = async (id: string): Promise<Exam | null> => {
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (examError || !exam) {
    console.error('Error fetching exam:', examError);
    return null;
  }
  
  const { data: problems, error: problemsError } = await supabase
    .from('exam_problems')
    .select('*')
    .eq('exam_id', id)
    .order('problem_number', { ascending: true });
  
  if (problemsError) {
    console.error('Error fetching problems:', problemsError);
    return null;
  }
  
  return {
    ...exam,
    problems: problems || [],
  };
};

// 시험 생성
export const saveExam = async (
  title: string,
  creator: string,
  problems: { korean: string; english: string; shuffledWords: string[] }[]
): Promise<string | null> => {
  // 시험 생성
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert({ title, creator })
    .select()
    .single();
  
  if (examError || !exam) {
    console.error('Error creating exam:', examError);
    return null;
  }
  
  // 문제 생성
  const problemsToInsert = problems.map((p, index) => ({
    exam_id: exam.id,
    problem_number: index + 1,
    korean: p.korean,
    english: p.english,
    shuffled_words: p.shuffledWords,
  }));
  
  const { error: problemsError } = await supabase
    .from('exam_problems')
    .insert(problemsToInsert);
  
  if (problemsError) {
    console.error('Error creating problems:', problemsError);
    // Rollback: delete the exam
    await supabase.from('exams').delete().eq('id', exam.id);
    return null;
  }
  
  return exam.id;
};

// 시험 삭제
export const deleteExam = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting exam:', error);
    return false;
  }
  
  return true;
};

// 제출 저장
export const saveSubmission = async (
  examId: string,
  participantName: string,
  affiliation: string | null,
  score: number,
  totalProblems: number,
  answers: { problemId: string; userAnswer: string; isCorrect: boolean }[]
): Promise<string | null> => {
  // 제출 생성
  const { data: submission, error: submissionError } = await supabase
    .from('exam_submissions')
    .insert({
      exam_id: examId,
      participant_name: participantName,
      affiliation,
      score,
      total_problems: totalProblems,
    })
    .select()
    .single();
  
  if (submissionError || !submission) {
    console.error('Error creating submission:', submissionError);
    return null;
  }
  
  // 개별 답안 저장
  const answersToInsert = answers.map(a => ({
    submission_id: submission.id,
    problem_id: a.problemId,
    user_answer: a.userAnswer,
    is_correct: a.isCorrect,
  }));
  
  const { error: answersError } = await supabase
    .from('submission_answers')
    .insert(answersToInsert);
  
  if (answersError) {
    console.error('Error saving answers:', answersError);
  }
  
  return submission.id;
};

// 시험별 제출 목록 조회
export const getSubmissionsByExamId = async (examId: string): Promise<ExamSubmission[]> => {
  const { data, error } = await supabase
    .from('exam_submissions')
    .select('*')
    .eq('exam_id', examId)
    .order('score', { ascending: false });
  
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  
  return data || [];
};

// 제출별 상세 답안 조회
export const getSubmissionAnswers = async (submissionId: string): Promise<SubmissionAnswer[]> => {
  const { data, error } = await supabase
    .from('submission_answers')
    .select('*')
    .eq('submission_id', submissionId);
  
  if (error) {
    console.error('Error fetching submission answers:', error);
    return [];
  }
  
  return data || [];
};

// 문제별 정답률 조회
export const getProblemAccuracy = async (examId: string): Promise<{ problemId: string; problemNumber: number; korean: string; correctCount: number; totalCount: number }[]> => {
  // 문제 목록 가져오기
  const { data: problems, error: problemsError } = await supabase
    .from('exam_problems')
    .select('*')
    .eq('exam_id', examId)
    .order('problem_number', { ascending: true });
  
  if (problemsError || !problems) {
    console.error('Error fetching problems for accuracy:', problemsError);
    return [];
  }
  
  // 각 문제별 정답 수 집계
  const results = await Promise.all(
    problems.map(async (problem) => {
      const { count: correctCount } = await supabase
        .from('submission_answers')
        .select('*', { count: 'exact', head: true })
        .eq('problem_id', problem.id)
        .eq('is_correct', true);
      
      const { count: totalCount } = await supabase
        .from('submission_answers')
        .select('*', { count: 'exact', head: true })
        .eq('problem_id', problem.id);
      
      return {
        problemId: problem.id,
        problemNumber: problem.problem_number,
        korean: problem.korean,
        correctCount: correctCount || 0,
        totalCount: totalCount || 0,
      };
    })
  );
  
  return results;
};

// 단어 셔플 함수
export const shuffleWords = (sentence: string): string[] => {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
};

// CSV 파싱 함수
export const parseCSV = (csvText: string): { korean: string; english: string }[] => {
  const lines = csvText.trim().split('\n');
  const results: { korean: string; english: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const english = parts[0].trim();
      const korean = parts[1].trim();
      
      const headerPatterns = ['영어문장', '한글문장', 'english', 'korean', '영어', '한글'];
      const isHeader = headerPatterns.some(pattern => 
        english.toLowerCase().includes(pattern.toLowerCase()) ||
        korean.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (!isHeader && english && korean) {
        results.push({ english, korean });
      }
    }
  }
  
  return results;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};
