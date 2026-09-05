import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 정규화 함수 (TakeExam.tsx와 동일한 로직)
function normalizeForComparison(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')           // 연속 공백을 단일 공백으로
    .replace(/^\d+\.\s*/, '')       // 숫자 접두사 제거
    .replace(/\[([명동형부])\]\s*/g, '') // 품사 마커 제거
    .toLowerCase();                 // 소문자로 통일
}

// 특수 패턴 감지 함수 - 이 패턴들은 분리하지 않음
function hasSpecialPattern(text: string): boolean {
  if (/~/.test(text)) return true;
  if (/[A-Z]를|[A-Z]에게|[A-Z]의|[A-Z]을/.test(text)) return true;
  if (/[가-힣]+[을를]\s+[가-힣]+(하다|되다|주다|받다|시키다|지다|내다|치다|미치다|들이다|쏟다|기울이다|쓰다|보이다|끼치다|잡다|넣다|두다)/.test(text)) return true;
  return false;
}

// 복합 의미를 개별 단어로 분리 (특수 패턴 보존)
function splitCompoundMeaning(text: string): string[] {
  if (!text) return [];
  
  // 특수 패턴이 있으면 분리하지 않음
  if (hasSpecialPattern(text)) {
    return [text.trim()];
  }
  
  // 1. 숫자 패턴으로 분리
  if (/\d+\./.test(text)) {
    const parts = text.split(/\s*\d+\.\s*/).filter(p => p.trim());
    if (parts.length > 1) return parts.map(p => p.trim());
  }
  
  // 2. 공백으로 구분된 한글 단어들 분리
  const words = text.split(/\s+/);
  if (words.length >= 2) {
    const isKoreanMeaning = words.every(w => /[가-힣]/.test(w));
    if (isKoreanMeaning) {
      const verbPattern = /(하다|시키다|지우다|되다|오다|가다|보다|주다|받다|먹다|마시다|지다|나다|내다|치다|들다|미치다|들이다|쏟다|기울이다|쓰다|보이다|끼치다|잡다|넣다|두다)$/;
      
      if (verbPattern.test(words[0]) && words.length === 2) {
        return words;
      }
      
      if (verbPattern.test(words[words.length - 1])) {
        if (words.some(w => /을$|를$/.test(w))) {
          return [text.trim()]; // 동사구는 하나로 유지
        }
      }
      
      if (words.length === 2 && words[0].length <= 4 && words[1].length <= 4) {
        return words;
      }
    }
  }
  
  return [text.trim()];
}

// 정답 배열 파싱 - choices와 매칭하여 실제 선지에 있는 것만 반환
function getCorrectAnswersArray(correctAnswer: string, choices: string[] = []): string[] {
  const availableChoices = choices.map(c => normalizeForComparison(c));
  
  let rawCorrectAnswers: string[] = [];
  try {
    const parsed = JSON.parse(correctAnswer);
    if (Array.isArray(parsed)) {
      rawCorrectAnswers = parsed;
    } else {
      rawCorrectAnswers = [String(correctAnswer)];
    }
  } catch {
    rawCorrectAnswers = [String(correctAnswer)];
  }
  
  // 정답을 분리하여 실제 선지와 매칭
  const matchedAnswers: string[] = [];
  
  for (const rawAnswer of rawCorrectAnswers) {
    const normalizedRaw = normalizeForComparison(rawAnswer);
    
    // 직접 매칭 시도
    if (availableChoices.includes(normalizedRaw)) {
      matchedAnswers.push(normalizedRaw);
      continue;
    }
    
    // 분리 후 매칭 시도
    const splitParts = splitCompoundMeaning(rawAnswer);
    for (const part of splitParts) {
      const normalizedPart = normalizeForComparison(part);
      if (availableChoices.length === 0 || availableChoices.includes(normalizedPart)) {
        if (!matchedAnswers.includes(normalizedPart)) {
          matchedAnswers.push(normalizedPart);
        }
      }
    }
  }
  
  // 매칭된 정답이 없으면 원본 정규화 버전 반환
  if (matchedAnswers.length === 0) {
    return rawCorrectAnswers.map(a => normalizeForComparison(a));
  }
  
  return matchedAnswers;
}

// 복수 정답 문제인지 확인
function isMultipleAnswerQuestion(correctAnswer: string): boolean {
  try {
    const parsed = JSON.parse(correctAnswer);
    return Array.isArray(parsed) && parsed.length > 1;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 모든 제출 가져오기
    const { data: submissions, error: subError } = await supabase
      .from('exam_submissions')
      .select('*');

    if (subError) throw subError;

    const results = [];

    for (const submission of submissions || []) {
      // 해당 시험의 문제 가져오기
      const { data: questions, error: qError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', submission.exam_id);

      if (qError) {
        console.error('Error fetching questions:', qError);
        continue;
      }

      const questionMap = new Map();
      for (const q of questions || []) {
        questionMap.set(Number(q.question_number), q);
      }

      let correctCount = 0;
      let totalPartialScore = 0;
      const updatedAnswers = [];

      for (const answer of submission.answers || []) {
        const questionNumber = Number(answer.question_number);
        const question = questionMap.get(questionNumber);
        
        let isCorrect = false;
        let partialScore = 0;

        if (question) {
          const studentAnswer = answer.student_answer;
          
          if (question.question_type === "multiple_choice" && isMultipleAnswerQuestion(question.correct_answer)) {
            // 복수 정답 객관식: 부분 점수 시스템
            const correctAnswers = getCorrectAnswersArray(question.correct_answer, question.choices || []);
            const studentAnswersNormalized = Array.isArray(studentAnswer) 
              ? studentAnswer.map((a: string) => normalizeForComparison(a)).filter((a: string) => a && a.trim().length > 0)
              : [];

            // 실제 선지 목록에서 정규화된 버전 생성
            const availableChoices = (question.choices || []).map((c: string) => normalizeForComparison(c));

            // 학생이 선택한 답이 실제 선지에 있는지 확인
            const validStudentAnswers = studentAnswersNormalized.filter((sa: string) => 
              sa && sa.trim().length > 0 && availableChoices.includes(sa)
            );

            // 아무것도 선택하지 않았으면 0점
            if (validStudentAnswers.length === 0) {
              partialScore = 0;
              isCorrect = false;
            } else {
              // 정답 중 학생이 맞춘 개수
              const correctlySelected = correctAnswers.filter(correct => 
                validStudentAnswers.some((sa: string) => sa === correct)
              ).length;
              
              // 학생이 선택한 것 중 오답 개수
              const wronglySelected = validStudentAnswers.filter((answer: string) => 
                !correctAnswers.some(ca => ca === answer)
              ).length;

              // 부분 점수 계산
              const totalCorrectCount = correctAnswers.length || 1;
              partialScore = Math.max(0, (correctlySelected - wronglySelected) / totalCorrectCount);
              
              // 완전 정답인 경우에만 is_correct = true
              isCorrect = correctlySelected === totalCorrectCount && wronglySelected === 0;
            }
            
          } else if (question.question_type === "multiple_choice" || question.question_type === "definition") {
            // 단일 정답 객관식과 영영풀이
            const singleAnswer = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
            isCorrect = normalizeForComparison(singleAnswer) === normalizeForComparison(question.correct_answer);
            partialScore = isCorrect ? 1 : 0;
          } else {
            // 철자쓰기와 예문완성
            const singleAnswer = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
            isCorrect = (singleAnswer || '').toLowerCase().trim() === (question.correct_answer || '').toLowerCase().trim();
            partialScore = isCorrect ? 1 : 0;
          }
        }

        if (isCorrect) {
          correctCount++;
        }
        totalPartialScore += partialScore;

        updatedAnswers.push({
          ...answer,
          is_correct: isCorrect,
          partial_score: partialScore
        });
      }

      const totalCount = updatedAnswers.length;
      // 부분 점수 기반 총점 계산
      const newScore = totalCount > 0 ? Math.round((totalPartialScore / totalCount) * 100) : 0;

      // 업데이트
      const { error: updateError } = await supabase
        .from('exam_submissions')
        .update({
          score: newScore,
          correct_count: correctCount,
          answers: updatedAnswers
        })
        .eq('id', submission.id);

      if (updateError) {
        console.error('Error updating submission:', updateError);
      }

      results.push({
        submission_id: submission.id,
        student_name: submission.student_name,
        old_score: submission.score,
        new_score: newScore,
        old_correct: submission.correct_count,
        new_correct: correctCount
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
