import { Exam, ExamSubmission } from '@/types/exam';

const EXAMS_KEY = 'orun_exams';
const SUBMISSIONS_KEY = 'orun_submissions';

export const getExams = (): Exam[] => {
  const data = localStorage.getItem(EXAMS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveExam = (exam: Exam): void => {
  const exams = getExams();
  exams.push(exam);
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
};

export const getExamById = (id: string): Exam | undefined => {
  const exams = getExams();
  return exams.find(exam => exam.id === id);
};

export const deleteExam = (id: string): void => {
  const exams = getExams().filter(exam => exam.id !== id);
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
};

export const getSubmissions = (): ExamSubmission[] => {
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSubmission = (submission: ExamSubmission): void => {
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const getSubmissionsByExamId = (examId: string): ExamSubmission[] => {
  return getSubmissions().filter(s => s.examId === examId);
};

// CSV 파싱 함수 - 첫 번째 열: 영어, 두 번째 열: 한국어
// 헤더 행(영어문장,한글문장 등)은 자동으로 제외됨
export const parseCSV = (csvText: string): { korean: string; english: string }[] => {
  const lines = csvText.trim().split('\n');
  const results: { korean: string; english: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV 파싱 (쉼표로 구분, 따옴표 처리)
    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const english = parts[0].trim();
      const korean = parts[1].trim();
      
      // 헤더 행 제외 (영어문장, 한글문장, English, Korean 등)
      const headerPatterns = ['영어문장', '한글문장', 'english', 'korean', '영어', '한글'];
      const isHeader = headerPatterns.some(pattern => 
        english.toLowerCase().includes(pattern.toLowerCase()) ||
        korean.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (!isHeader && english && korean) {
        results.push({
          english,
          korean
        });
      }
    }
  }
  
  return results;
};

// CSV 라인 파싱 (따옴표 처리)
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

// 단어 배열 생성 (영어 문장을 단어로 분리하고 섞기)
export const shuffleWords = (sentence: string): string[] => {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  // Fisher-Yates 셔플
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
};
