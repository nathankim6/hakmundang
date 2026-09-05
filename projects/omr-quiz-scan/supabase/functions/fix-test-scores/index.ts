import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

async function verifyAdminAccessCode(accessCode: string): Promise<boolean> {
  const supabaseUrl = "https://jpanpwbdlhsxnyaldddm.supabase.co";
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from('access_codes')
    .select('code, expiry_date, is_admin')
    .eq('code', accessCode)
    .single();

  if (error || !data) return false;
  if (new Date(data.expiry_date) < new Date()) return false;
  return !!data.is_admin;
}

// 3점 문제 목록
const THREE_POINT_QUESTIONS = [6, 13, 15, 21, 23, 29, 33, 34, 37, 39];

const isSubjectiveAnswerCorrect = (studentAnswer: string, correctAnswer: string): boolean => {
  if (!studentAnswer || !correctAnswer) return false;
  const normalize = (s: string) =>
    s.toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/g, '');

  let rawOptions: string[];
  if (/[\r\n]/.test(correctAnswer)) {
    rawOptions = correctAnswer.split(/\r?\n/);
  } else if (/[.!?]/.test(correctAnswer)) {
    rawOptions = [correctAnswer];
  } else {
    rawOptions = correctAnswer.split(',');
  }
  const correctOptions = rawOptions.map(normalize).filter(Boolean);
  const student = normalize(studentAnswer);
  if (correctOptions.some(opt => opt === student)) return true;

  const numStudent = parseFloat(student);
  const numCorrect = parseFloat(normalize(correctAnswer));
  if (!isNaN(numStudent) && !isNaN(numCorrect)) {
    return Math.abs(numStudent - numCorrect) < 0.0001;
  }
  return false;
};

const calculateConsistentScore = (
  studentAnswers: Record<number, any>,
  correctAnswers: Record<number, any>
): { score: number; correctCount: number } => {
  let totalScore = 0;
  let correctCount = 0;
  const totalQuestionCount = Object.keys(correctAnswers).length;
  const is45QuestionTest = totalQuestionCount === 45;
  const hasCustomPoints = Object.values(correctAnswers).some((answer: any) => answer.points !== undefined);
  const pointsPerQuestion = (is45QuestionTest && !hasCustomPoints) ? 0 : 
                           (!is45QuestionTest && !hasCustomPoints) ? 100 / totalQuestionCount : 0;
  
  Object.entries(studentAnswers).forEach(([questionNumStr, answerData]) => {
    const questionNum = parseInt(questionNumStr);
    const studentAnswer = answerData?.answer;
    const correctAnswer = correctAnswers[questionNum]?.answer;
    const questionType = correctAnswers[questionNum]?.type;
    let isCorrect = false;
    
    if (questionType === 'subjective') {
      isCorrect = isSubjectiveAnswerCorrect(String(studentAnswer), String(correctAnswer));
    } else {
      const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
      const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
      const sortedStudent = [...studentAnswerArray].sort((a, b) => a - b);
      isCorrect = sortedCorrect.length === sortedStudent.length &&
                  sortedCorrect.every((value, index) => value === sortedStudent[index]);
    }
    
    if (isCorrect) {
      correctCount++;
      if (hasCustomPoints) {
        totalScore += correctAnswers[questionNum]?.points || 2;
      } else if (is45QuestionTest) {
        totalScore += THREE_POINT_QUESTIONS.includes(questionNum) ? 3 : 2;
      } else {
        totalScore += pointsPerQuestion;
      }
    }
  });
  
  const finalScore = is45QuestionTest ? totalScore : Math.round(totalScore * 10) / 10;
  return { score: finalScore, correctCount };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apikey = req.headers.get('apikey');
  if (!apikey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { accessCode } = body as { accessCode?: string };

    // Require admin access code
    if (!accessCode || typeof accessCode !== 'string' || !(await verifyAdminAccessCode(accessCode))) {
      return new Response(JSON.stringify({ error: 'Admin access code required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = "https://jpanpwbdlhsxnyaldddm.supabase.co";
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const testId = '250830';

    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select('answers')
      .eq('test_id', testId)
      .single();

    if (testError || !testData) {
      throw new Error(`테스트 데이터를 찾을 수 없습니다: ${testError?.message}`);
    }

    const { data: results, error: resultsError } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId);

    if (resultsError) {
      throw new Error(`결과 데이터를 가져오는 중 오류: ${resultsError.message}`);
    }

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ message: '수정할 결과가 없습니다.', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    const updates = [];

    for (const result of results) {
      const { score: recalculatedScore, correctCount: recalculatedCorrectCount } = calculateConsistentScore(
        result.student_answers as Record<number, any>,
        testData.answers as Record<number, any>
      );

      if (Math.abs(result.score - recalculatedScore) > 0.1 || result.correct_count !== recalculatedCorrectCount) {
        updates.push({ id: result.id, score: recalculatedScore, correct_count: recalculatedCorrectCount });
        updatedCount++;
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('test_results')
          .update({ score: update.score, correct_count: update.correct_count })
          .eq('id', update.id);
      }
    }

    return new Response(
      JSON.stringify({ message: `${updatedCount}개의 점수가 수정되었습니다.`, updated: updatedCount, total: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
