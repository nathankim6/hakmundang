import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 괄호가 의미의 핵심 문맥인지 판별
function hasContextualParentheses(text: string): boolean {
  if (/\([^)]*등[이의을를에]\)\s*[가-힣]+/.test(text)) return true;
  if (/\([^)]*[이가]\)\s*[가-힣]+/.test(text)) return true;
  if (/^\(/.test(text.trim())) return true;
  return false;
}

// 괄호 내부 쉼표를 무시하고 분리
function smartSplitIgnoringParens(text: string, delimiters: RegExp): string[] {
  const results: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(') { parenDepth++; current += char; }
    else if (char === ')') { parenDepth = Math.max(0, parenDepth - 1); current += char; }
    else if (delimiters.test(char) && parenDepth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 0) results.push(trimmed);
      current = '';
    } else { current += char; }
  }
  const last = current.trim();
  if (last.length > 0) results.push(last);
  return results;
}

// 정규화 함수 - 강화된 버전
function normalizeChoice(s: string | undefined | null): string {
  if (!s) return '';
  let result = s.trim()
    .replace(/\[([명동형부전])\]\s*/g, '')      // POS 마커 제거
    .replace(/\s*\[([명동형부전])\]\s*/g, ' ');
  
  // 괄호: 의미의 일부인 경우 보존
  if (!hasContextualParentheses(result)) {
    result = result.replace(/\([^)]*\)\s*/g, '');
  }
  
  result = result
    .replace(/\[[^\]]*\]/g, '')                // 대괄호 내용 제거
    .replace(/^(\d+\.)\s*/g, '')               // 숫자 prefix 제거
    .replace(/~\s*/g, '')                       // 물결표 제거
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return result;
}

// 복합 의미 분리 함수
function splitComplexMeaning(meaning: string): string[] {
  const results: string[] = [];
  
  // POS 마커로 분리: [형] ... [명] ...
  const posParts = meaning.split(/\s*\[([명동형부전])\]\s*/).filter(Boolean);
  
  for (const part of posParts) {
    if (['명', '동', '형', '부', '전'].includes(part)) continue;
    
    // 쉼표로 분리 (괄호 내부 무시)
    const commaParts = smartSplitIgnoringParens(part, /[,，]/);
    for (const cp of commaParts) {
      // 숫자로 시작하는 부분 처리 (1. xxx 2. yyy)
      const numParts = cp.split(/\d+\.\s*/);
      for (const np of numParts) {
        const trimmed = np.trim();
        if (trimmed && !['명', '동', '형', '부', '전'].includes(trimmed)) {
          results.push(trimmed);
        }
      }
    }
  }
  
  return results.length > 0 ? results : [meaning];
}

// 정답 배열 파싱 - 복합 의미 지원
function parseCorrectAnswers(correctAnswer: string, meaning: string): string[] {
  try {
    const parsed = JSON.parse(correctAnswer);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // JSON 배열이 아니면 복합 의미 분리 시도
    return splitComplexMeaning(String(correctAnswer));
  } catch {
    // 복합 의미 분리 시도
    return splitComplexMeaning(String(correctAnswer));
  }
}

// 복수 정답 문제인지 확인
function isMultipleAnswerQuestion(correctAnswer: string, meaning: string): boolean {
  try {
    const parsed = JSON.parse(correctAnswer);
    if (Array.isArray(parsed)) {
      return parsed.length > 1;
    }
  } catch {
    // JSON 파싱 실패하면 복합 의미인지 확인
    const parts = splitComplexMeaning(correctAnswer);
    return parts.length > 1;
  }
  return false;
}

// 강화된 채점 로직
function gradeMultipleChoice(
  studentAnswers: string[],
  correctAnswers: string[],
  meaning: string
): { isCorrect: boolean; partialScore: number } {
  // 정규화 - 빈 문자열 필터링
  const normalizedSelected = studentAnswers.filter(a => a && a.trim().length > 0).map(normalizeChoice);
  
  // 아무것도 선택하지 않았으면 바로 0점 반환
  if (normalizedSelected.length === 0) {
    return { isCorrect: false, partialScore: 0 };
  }
  
  // 정답 처리: 배열이면 그대로, 아니면 의미에서 분리
  let normalizedCorrect: string[];
  if (correctAnswers.length === 1 && correctAnswers[0].includes('[')) {
    // 복합 의미 문자열인 경우 분리
    normalizedCorrect = splitComplexMeaning(correctAnswers[0]).map(normalizeChoice).filter(Boolean);
  } else {
    normalizedCorrect = correctAnswers.filter(Boolean).map(normalizeChoice).filter(Boolean);
  }
  
  // 의미에서도 정답 추출 시도
  const meaningParts = splitComplexMeaning(meaning).map(normalizeChoice).filter(Boolean);
  
  // 학생이 선택한 모든 항목이 정답에 포함되는지 확인
  const allSelectionsValid = normalizedSelected.every(selected => {
    if (!selected || selected.length === 0) return false;
    // 정답 배열에서 매칭
    const matchInCorrect = normalizedCorrect.some(correct => 
      correct && (
        selected === correct || 
        (selected.length > 1 && selected.includes(correct)) || 
        (correct.length > 1 && correct.includes(selected)) ||
        selected.replace(/\s/g, '') === correct.replace(/\s/g, '')
      )
    );
    // 의미에서도 매칭 확인
    const matchInMeaning = meaningParts.some(mp => 
      mp && (
        selected === mp || 
        (selected.length > 1 && selected.includes(mp)) || 
        (mp.length > 1 && mp.includes(selected)) ||
        selected.replace(/\s/g, '') === mp.replace(/\s/g, '')
      )
    );
    return matchInCorrect || matchInMeaning;
  });
  
  // 모든 정답을 선택했는지 확인
  const allCorrectSelected = normalizedCorrect.every(correct => {
    if (!correct || correct.length === 0) return true;
    return normalizedSelected.some(selected => 
      selected && (
        selected === correct || 
        (selected.length > 1 && selected.includes(correct)) || 
        (correct.length > 1 && correct.includes(selected)) ||
        selected.replace(/\s/g, '') === correct.replace(/\s/g, '')
      )
    );
  });
  
  // 부분 점수 먼저 계산
  const correctlySelected = normalizedCorrect.filter(correct => 
    correct && normalizedSelected.some(sa => 
      sa && (
        sa === correct || (sa.length > 1 && sa.includes(correct)) || (correct.length > 1 && correct.includes(sa)) ||
        sa.replace(/\s/g, '') === correct.replace(/\s/g, '')
      )
    )
  ).length;
  const wronglySelected = normalizedSelected.filter(selected => 
    selected && !normalizedCorrect.some(ca => 
      ca && (
        ca === selected || (ca.length > 1 && ca.includes(selected)) || (selected.length > 1 && selected.includes(ca)) ||
        ca.replace(/\s/g, '') === selected.replace(/\s/g, '')
      )
    ) && !meaningParts.some(mp => 
      mp && (
        mp === selected || (mp.length > 1 && mp.includes(selected)) || (selected.length > 1 && selected.includes(mp))
      )
    )
  ).length;
  const totalCorrectCount = normalizedCorrect.length || 1;
  
  // 모든 정답을 선택하고 오답이 없으면 정답
  const isCorrect = correctlySelected === totalCorrectCount && wronglySelected === 0;
  const partialScore = isCorrect ? 1 : Math.max(0, (correctlySelected - wronglySelected) / totalCorrectCount);

  return { isCorrect, partialScore };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exam_id, submission_id } = await req.json();
    
    if (!exam_id) {
      throw new Error('exam_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 제출물 쿼리
    let query = supabase.from('exam_submissions').select('*').eq('exam_id', exam_id);
    if (submission_id) {
      query = query.eq('id', submission_id);
    }
    
    const { data: submissions, error: subError } = await query;
    if (subError) throw subError;

    // 문제 가져오기
    const { data: questions, error: qError } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', exam_id);

    if (qError) throw qError;

    const questionMap = new Map();
    for (const q of questions || []) {
      questionMap.set(Number(q.question_number), q);
    }

    const results = [];

    for (const submission of submissions || []) {
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
          const meaning = question.meaning || '';
          
          if (question.question_type === 'multiple_choice') {
            // 모든 객관식 문제에 유연한 채점 적용
            const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer].filter(Boolean);
            const correctAnswers = parseCorrectAnswers(question.correct_answer, meaning);
            
            const result = gradeMultipleChoice(studentAnswers, correctAnswers, meaning);
            isCorrect = result.isCorrect;
            partialScore = result.partialScore;
            
          } else if (question.question_type === 'definition') {
            // 영영풀이
            const singleAnswer = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
            isCorrect = normalizeChoice(singleAnswer) === normalizeChoice(question.correct_answer);
            partialScore = isCorrect ? 1 : 0;
            
          } else if (question.question_type === 'spelling' || question.question_type === 'example') {
            // 철자/예문: 대소문자 무시 정확 매칭
            const studentAns = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
            isCorrect = (studentAns || '').toLowerCase().trim() === (question.correct_answer || '').toLowerCase().trim();
            partialScore = isCorrect ? 1 : 0;
            
          } else {
            // 기타 유형
            const studentAns = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
            isCorrect = normalizeChoice(studentAns) === normalizeChoice(question.correct_answer);
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
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
