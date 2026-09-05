import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 객관식 문제 정의 (inputType: 'choice'로 변경된 문제들)
const CHOICE_QUESTIONS: Record<number, string[]> = {
  29: [
    "Do Cathy likes movies?",
    "Does Cathy like movies?",        // 정답
    "Is Cathy likes movies?",
    "Does Cathy likes movies?"
  ],
  30: [
    "Has he a book in his hand?",
    "Do he have a book in his hand?",
    "Does he have a book in his hand?",  // 정답
    "Does he has a book in his hand?"
  ],
  31: [
    "Do the computer work fast?",
    "Does the computer works fast?",
    "Is the computer work fast?",
    "Does the computer work fast?"       // 정답
  ],
  32: [
    "Does your sisters know him?",
    "Do your sisters know him?",         // 정답
    "Are your sisters know him?",
    "Do your sisters knows him?"
  ],
  33: [
    "Does Cinderella cleaned the house?",
    "Did Cinderella cleaned the house?",
    "Did Cinderella clean the house?",   // 정답
    "Was Cinderella clean the house?"
  ],
  34: [
    "He hits the ball",
    "He is hitting the ball",            // 정답
    "He hit the ball",
    "He was hitting the ball"
  ],
  35: [
    "She kicks the ball",
    "She kicked the ball",
    "She is kicking the ball",           // 정답
    "She was kicking the ball"
  ],
  36: [
    "is going to passing",
    "is going pass",
    "is going to pass",                  // 정답
    "going to pass"
  ],
  37: [
    "are going go",
    "are going to go",                   // 정답
    "is going to go",
    "going to go"
  ]
};

// 문자열 정규화 함수
const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate apikey header
  const apikey = req.headers.get('apikey');
  if (!apikey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting comprehensive migration for prep level test answers...');

    // prep으로 시작하는 모든 레벨테스트 결과 조회
    const { data: allResults, error: fetchError } = await supabase
      .from('level_test_results')
      .select('id, answers, student_name, level')
      .like('level', 'prep%');

    if (fetchError) {
      console.error('Error fetching results:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${allResults?.length || 0} prep level test results`);

    const migrationLog: any[] = [];
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const result of allResults || []) {
      const answers = result.answers as Record<string, any>;
      let hasChanges = false;
      const updatedAnswers = { ...answers };
      const recordChanges: any[] = [];

      // 각 객관식 문제에 대해 처리
      for (const [qIdStr, options] of Object.entries(CHOICE_QUESTIONS)) {
        const qId = qIdStr;
        const answer = answers[qId];

        // 답안이 없거나 이미 숫자인 경우 스킵
        if (answer === undefined || answer === null) continue;
        if (typeof answer === 'number') continue;
        
        // 숫자 문자열인 경우 숫자로 변환
        if (typeof answer === 'string' && !isNaN(Number(answer)) && answer.trim() !== '') {
          updatedAnswers[qId] = Number(answer);
          hasChanges = true;
          recordChanges.push({
            questionId: qId,
            originalAnswer: answer,
            newAnswer: Number(answer),
            type: 'numeric_string'
          });
          continue;
        }

        // 문자열 답안인 경우 옵션과 매칭
        if (typeof answer === 'string' && answer.trim() !== '') {
          const normalizedAnswer = normalizeString(answer);
          let matchedIndex = -1;

          for (let i = 0; i < options.length; i++) {
            const normalizedOption = normalizeString(options[i]);
            if (normalizedAnswer === normalizedOption) {
              matchedIndex = i;
              break;
            }
          }

          if (matchedIndex >= 0) {
            // 매칭되면 숫자로 변환 (1-based index)
            const newAnswer = matchedIndex + 1;
            updatedAnswers[qId] = newAnswer;
            hasChanges = true;
            recordChanges.push({
              questionId: qId,
              originalAnswer: answer,
              newAnswer: newAnswer,
              matchedOption: options[matchedIndex],
              type: 'text_matched'
            });
          } else {
            // 매칭 안되면 스킵 (오타/다른 답)
            totalSkipped++;
            recordChanges.push({
              questionId: qId,
              originalAnswer: answer,
              status: 'skipped',
              reason: 'No matching option'
            });
          }
        }
      }

      // 변경사항이 있으면 DB 업데이트
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from('level_test_results')
          .update({ answers: updatedAnswers })
          .eq('id', result.id);

        if (updateError) {
          console.error(`Error updating result ${result.id}:`, updateError);
          totalErrors++;
          migrationLog.push({
            id: result.id,
            studentName: result.student_name,
            level: result.level,
            status: 'error',
            error: updateError.message
          });
        } else {
          totalMigrated++;
          console.log(`Migrated ${recordChanges.length} answers for ${result.student_name}`);
          migrationLog.push({
            id: result.id,
            studentName: result.student_name,
            level: result.level,
            status: 'migrated',
            changes: recordChanges.filter(c => c.type)
          });
        }
      }
    }

    const summary = {
      totalProcessed: allResults?.length || 0,
      recordsMigrated: totalMigrated,
      answersSkipped: totalSkipped,
      errors: totalErrors,
      questionsProcessed: Object.keys(CHOICE_QUESTIONS).map(Number),
      details: migrationLog.filter(l => l.status === 'migrated' || l.status === 'error')
    };

    console.log('Migration complete:', JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
