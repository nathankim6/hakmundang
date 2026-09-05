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

// 정규화 함수 - 채점용 (강화 버전)
function normalizeChoice(s: string | undefined | null): string {
  if (!s) return '';
  let result = s.trim()
    // 품사 마커 제거 [명], [동], [형], [부], [전]
    .replace(/\[([명동형부전])\]\s*/g, '')
    .replace(/\s*\[([명동형부전])\]\s*/g, ' ');
  
  // 괄호: 의미의 일부인 경우 보존, 보조 설명만 제거
  if (!hasContextualParentheses(result)) {
    result = result.replace(/\([^)]*\)\s*/g, '');
  }
  
  result = result
    // 대괄호 제거
    .replace(/\[[^\]]*\]/g, '')
    // 숫자 접두어 제거 (1. 2. 등)
    .replace(/^\d+\.\s*/g, '')
    .replace(/\s+\d+\.\s+/g, ' ')
    // 물결표 제거
    .replace(/~\s*/g, '')
    // 연속 공백 정리
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return result;
}

// 복합 정답 문자열을 개별 의미로 분리
function splitComplexMeaning(meaning: string): string[] {
  if (!meaning) return [];
  
  // 품사 마커 기준 분리: [명] xxx [동] yyy -> ["xxx", "yyy"]
  const posSplit = meaning.split(/\s*\[([명동형부전])\]\s*/).filter(s => s && !['명','동','형','부','전'].includes(s));
  
  if (posSplit.length > 1) {
    const results: string[] = [];
    for (const part of posSplit) {
      const subParts = smartSplitIgnoringParens(part, /[,，]/).filter(Boolean);
      results.push(...subParts);
    }
    return results.map(r => normalizeChoice(r)).filter(Boolean);
  }
  
  // 쉼표로 분리 (괄호 내부 무시)
  const commaSplit = smartSplitIgnoringParens(meaning, /[,，]/).filter(Boolean);
  if (commaSplit.length > 1) {
    return commaSplit.map(r => normalizeChoice(r)).filter(Boolean);
  }
  
  // 숫자 접두어로 분리: 1. xxx 2. yyy
  const numSplit = meaning.split(/\s*\d+\.\s*/).filter(Boolean);
  if (numSplit.length > 1) {
    const results: string[] = [];
    for (const part of numSplit) {
      const subParts = smartSplitIgnoringParens(part, /[,，]/).filter(Boolean);
      results.push(...subParts);
    }
    return results.map(r => normalizeChoice(r)).filter(Boolean);
  }
  
  return [normalizeChoice(meaning)].filter(Boolean);
}

// 정답 배열 파싱 (복합 문자열 분리 포함)
function parseCorrectAnswers(correctAnswer: string): string[] {
  try {
    const parsed = JSON.parse(correctAnswer);
    if (Array.isArray(parsed)) {
      // 각 요소가 복합 문자열일 수 있으므로 추가 분리
      const expanded: string[] = [];
      for (const answer of parsed) {
        const split = splitComplexMeaning(String(answer));
        expanded.push(...split);
      }
      return expanded.length > 0 ? expanded : parsed.map(s => normalizeChoice(String(s)));
    }
    return splitComplexMeaning(String(correctAnswer));
  } catch {
    return splitComplexMeaning(String(correctAnswer));
  }
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

// 복수 정답 채점 로직 (강화 버전)
function gradeMultipleChoice(
  studentAnswers: string[],
  correctAnswers: string[]
): { isCorrect: boolean; partialScore: number } {
  const normalizedSelected = studentAnswers.filter(a => a && a.trim().length > 0).map(normalizeChoice);
  
  // 아무것도 선택하지 않았으면 바로 0점 반환
  if (normalizedSelected.length === 0) {
    return { isCorrect: false, partialScore: 0 };
  }
  
  // correctAnswers가 이미 분리되었을 수 있지만 다시 한번 분리 시도
  const expandedCorrect: string[] = [];
  for (const answer of correctAnswers) {
    const split = splitComplexMeaning(answer);
    if (split.length > 0) {
      expandedCorrect.push(...split);
    } else {
      expandedCorrect.push(normalizeChoice(answer));
    }
  }
  const normalizedCorrect = expandedCorrect.filter(c => c && c.trim().length > 0);
  
  console.log('Grading debug:', { normalizedSelected, normalizedCorrect });
  
  // 매칭 확인: 학생 선택이 정답 목록에 있는지
  const hasAllCorrect = normalizedCorrect.every(answer => 
    answer && normalizedSelected.some(selected => 
      selected && (
        selected === answer || 
        (selected.length > 1 && selected.includes(answer)) || 
        (answer.length > 1 && answer.includes(selected)) ||
        selected.replace(/\s/g, '') === answer.replace(/\s/g, '')
      )
    )
  );
  
  const hasNoIncorrect = normalizedSelected.every(choice => 
    choice && normalizedCorrect.some(correct => 
      correct && (
        choice === correct || 
        (choice.length > 1 && choice.includes(correct)) || 
        (correct.length > 1 && correct.includes(choice)) ||
        choice.replace(/\s/g, '') === correct.replace(/\s/g, '')
      )
    )
  );
  
  const isCorrect = hasAllCorrect && hasNoIncorrect && normalizedSelected.length === normalizedCorrect.length;
  
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
    )
  ).length;
  const totalCorrectCount = normalizedCorrect.length || 1;
  const partialScore = isCorrect ? 1 : Math.max(0, (correctlySelected - wronglySelected) / totalCorrectCount);

  return { isCorrect, partialScore };
}

// 배열 셔플
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 지연 함수
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API 호출 재시도 래퍼
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      await delay(500 * (i + 1));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(500 * (i + 1));
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exam_id, start_question = 1, end_question = 100, regrade_only = false } = await req.json();
    
    if (!exam_id) {
      throw new Error('exam_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Processing exam: ${exam_id}, Q${start_question}-${end_question}, regrade_only: ${regrade_only}`);

    // 1. 시험 정보 조회
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*, card_sets(word_data)')
      .eq('id', exam_id)
      .single();

    if (examError || !exam) {
      throw new Error(`Exam not found: ${examError?.message}`);
    }

    // 재채점만 요청된 경우
    if (regrade_only) {
      console.log('Regrade only mode - skipping regeneration');
      
      const { data: submissions } = await supabase
        .from('exam_submissions')
        .select('*')
        .eq('exam_id', exam_id);

      const { data: updatedQuestions } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam_id);

      const questionMap = new Map();
      for (const q of updatedQuestions || []) {
        questionMap.set(Number(q.question_number), q);
      }

      const regradeResults: any[] = [];

      for (const submission of submissions || []) {
        let correctCount = 0;
        let totalPartialScore = 0;
        const updatedAnswers: any[] = [];

        for (const answer of submission.answers || []) {
          const questionNumber = Number(answer.question_number);
          const question = questionMap.get(questionNumber);
          
          let isCorrect = false;
          let partialScore = 0;

          if (question) {
            const studentAnswer = answer.student_answer;
            
            if (question.question_type === 'multiple_choice' && isMultipleAnswerQuestion(question.correct_answer)) {
              const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer].filter(Boolean);
              const correctAnswers = parseCorrectAnswers(question.correct_answer);
              const result = gradeMultipleChoice(studentAnswers, correctAnswers);
              isCorrect = result.isCorrect;
              partialScore = result.partialScore;
            } else if (question.question_type === 'multiple_choice' || question.question_type === 'definition') {
              const singleAnswer = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
              const correctAnswers = parseCorrectAnswers(question.correct_answer);
              isCorrect = correctAnswers.some(ca => normalizeChoice(singleAnswer) === normalizeChoice(ca));
              partialScore = isCorrect ? 1 : 0;
            } else if (question.question_type === 'spelling' || question.question_type === 'example') {
              const studentAns = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
              isCorrect = (studentAns || '').toLowerCase().trim() === (question.correct_answer || '').toLowerCase().trim();
              partialScore = isCorrect ? 1 : 0;
            } else {
              const studentAns = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
              isCorrect = normalizeChoice(studentAns) === normalizeChoice(question.correct_answer);
              partialScore = isCorrect ? 1 : 0;
            }
          }

          if (isCorrect) correctCount++;
          totalPartialScore += partialScore;

          updatedAnswers.push({
            ...answer,
            is_correct: isCorrect,
            partial_score: partialScore,
            correct_answer: question?.correct_answer
          });
        }

        const totalCount = updatedAnswers.length;
        const newScore = totalCount > 0 ? Math.round((totalPartialScore / totalCount) * 100) : 0;

        await supabase
          .from('exam_submissions')
          .update({ score: newScore, correct_count: correctCount, answers: updatedAnswers })
          .eq('id', submission.id);

        regradeResults.push({
          student_name: submission.student_name,
          old_score: submission.score,
          new_score: newScore,
          old_correct: submission.correct_count,
          new_correct: correctCount
        });
      }

      return new Response(
        JSON.stringify({ success: true, mode: 'regrade_only', regrading: { results: regradeResults } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 문제 재생성 모드
    const wordData = exam.card_sets?.word_data || [];
    const selectedDays = exam.selected_days || [];
    const wordsForExam = wordData.filter((word: any) => selectedDays.includes(word.day));
    
    const wordMeaningMap = new Map<string, string>();
    for (const word of wordsForExam) {
      wordMeaningMap.set(word.word.toLowerCase(), word.meaning);
    }

    const { data: questions, error: qError } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', exam_id)
      .gte('question_number', start_question)
      .lte('question_number', end_question)
      .order('question_number');

    if (qError) throw new Error(`Failed to fetch questions: ${qError.message}`);

    console.log(`Processing ${questions?.length || 0} questions (Q${start_question}-${end_question})`);

    const regenerationResults: any[] = [];
    const baseUrl = supabaseUrl.replace('/rest/v1', '');

    for (const question of questions || []) {
      try {
        if (question.question_type !== 'multiple_choice') {
          regenerationResults.push({ question_number: question.question_number, status: 'skipped' });
          continue;
        }

        const wordKey = question.word.toLowerCase();
        const originalMeaning = wordMeaningMap.get(wordKey) || question.meaning;
        
        // 기존 선지 개수 저장 (재생성 시 동일한 개수 유지)
        const existingChoicesCount = question.choices?.length || 8;
        
        console.log(`Q${question.question_number}: ${question.word} (기존 선지: ${existingChoicesCount}개)`);

        // split-choices 호출
        const splitResponse = await fetchWithRetry(
          `${baseUrl}/functions/v1/split-choices`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choices: [originalMeaning] }) }
        );

        let correctAnswers: string[] = [];
        if (splitResponse.ok) {
          const splitData = await splitResponse.json();
          correctAnswers = splitData.splitChoices || [];
        }
        
        if (correctAnswers.length === 0) {
          correctAnswers = [originalMeaning.replace(/\[([명동형부])\]\s*/g, '').trim()];
        }

        // 정답 개수는 최대 4개로 제한
        const finalCorrectAnswers = correctAnswers.slice(0, 4);
        
        // 필요한 오답 개수 계산: 기존 선지 개수 - 정답 개수
        const neededWrongCount = existingChoicesCount - finalCorrectAnswers.length;

        // generate-korean-wrong-choices 호출
        const wrongChoicesResponse = await fetchWithRetry(
          `${baseUrl}/functions/v1/generate-korean-wrong-choices`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correctWord: question.word, correctMeaning: finalCorrectAnswers[0], numberOfChoices: neededWrongCount }) }
        );

        let wrongChoices: string[] = [];
        if (wrongChoicesResponse.ok) {
          const wrongData = await wrongChoicesResponse.json();
          wrongChoices = wrongData.wrongChoices || [];
        }

        const fallbackWrong = ['발전', '진보', '개선', '향상', '증진', '강화', '확대', '성장'];
        while (wrongChoices.length < neededWrongCount) {
          const fb = fallbackWrong[wrongChoices.length % fallbackWrong.length];
          if (!wrongChoices.includes(fb) && !finalCorrectAnswers.includes(fb)) wrongChoices.push(fb);
        }

        const neededWrongChoices = wrongChoices.slice(0, neededWrongCount);
        const allChoices = [...finalCorrectAnswers, ...neededWrongChoices];
        const shuffledChoices = shuffleArray(allChoices);

        await supabase
          .from('exam_questions')
          .update({ choices: shuffledChoices, correct_answer: JSON.stringify(finalCorrectAnswers) })
          .eq('id', question.id);

        regenerationResults.push({
          question_number: question.question_number,
          status: 'success',
          correct_count: finalCorrectAnswers.length,
          total_choices: shuffledChoices.length
        });

        await delay(100);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        regenerationResults.push({ question_number: question.question_number, status: 'error', error: errorMessage });
      }
    }

    const lastProcessed = questions && questions.length > 0 ? questions[questions.length - 1].question_number : end_question;
    const hasMore = lastProcessed < 100;

    return new Response(
      JSON.stringify({
        success: true,
        exam_title: exam.title,
        processed_range: { start: start_question, end: lastProcessed },
        has_more: hasMore,
        next_start: hasMore ? lastProcessed + 1 : null,
        regeneration: {
          total: regenerationResults.length,
          success: regenerationResults.filter(r => r.status === 'success').length,
          results: regenerationResults
        }
      }),
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
