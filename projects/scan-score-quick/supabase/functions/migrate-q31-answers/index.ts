import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 31번 문제의 옵션들 (prepLevelTestQuestions.ts에서 가져옴)
const QUESTION_31_OPTIONS = [
  "Do the computer work fast?",        // option 1
  "Does the computer works fast?",     // option 2  
  "Is the computer work fast?",        // option 3
  "Does the computer work fast?"       // option 4 (정답)
];

// 문자열 정규화 함수
const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    console.log('Starting migration for question 31 string answers...');

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
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let alreadyNumericCount = 0;

    for (const result of allResults || []) {
      const answers = result.answers as Record<string, any>;
      const q31Answer = answers['31'];

      // 31번 답안이 없는 경우 스킵
      if (q31Answer === undefined || q31Answer === null) {
        continue;
      }

      // 이미 숫자인 경우 스킵
      if (typeof q31Answer === 'number') {
        alreadyNumericCount++;
        continue;
      }

      // 문자열인 경우만 처리
      if (typeof q31Answer === 'string' && q31Answer.trim() !== '') {
        // 숫자 문자열인 경우 ("4" 등) 숫자로 변환
        if (!isNaN(Number(q31Answer))) {
          const numAnswer = Number(q31Answer);
          const updatedAnswers = { ...answers, '31': numAnswer };

          const { error: updateError } = await supabase
            .from('level_test_results')
            .update({ answers: updatedAnswers })
            .eq('id', result.id);

          if (!updateError) {
            migratedCount++;
            migrationLog.push({
              id: result.id,
              studentName: result.student_name,
              level: result.level,
              originalAnswer: q31Answer,
              newAnswer: numAnswer,
              status: 'migrated (numeric string)'
            });
          }
          continue;
        }

        const normalizedAnswer = normalizeString(q31Answer);
        
        // 옵션과 매칭
        let matchedIndex = -1;
        for (let i = 0; i < QUESTION_31_OPTIONS.length; i++) {
          const normalizedOption = normalizeString(QUESTION_31_OPTIONS[i]);
          if (normalizedAnswer === normalizedOption) {
            matchedIndex = i;
            break;
          }
        }

        if (matchedIndex >= 0) {
          // 매칭되면 숫자로 변환 (1-based index)
          const newAnswer = matchedIndex + 1;
          const updatedAnswers = { ...answers, '31': newAnswer };

          const { error: updateError } = await supabase
            .from('level_test_results')
            .update({ answers: updatedAnswers })
            .eq('id', result.id);

          if (updateError) {
            console.error(`Error updating result ${result.id}:`, updateError);
            errorCount++;
            migrationLog.push({
              id: result.id,
              studentName: result.student_name,
              level: result.level,
              originalAnswer: q31Answer,
              status: 'error',
              error: updateError.message
            });
          } else {
            migratedCount++;
            console.log(`Migrated: "${q31Answer}" -> ${newAnswer} (option: ${QUESTION_31_OPTIONS[matchedIndex]})`);
            migrationLog.push({
              id: result.id,
              studentName: result.student_name,
              level: result.level,
              originalAnswer: q31Answer,
              newAnswer: newAnswer,
              matchedOption: QUESTION_31_OPTIONS[matchedIndex],
              status: 'migrated'
            });
          }
        } else {
          // 매칭 안되면 스킵 (오타/다른 답)
          skippedCount++;
          console.log(`Skipped (no match): "${q31Answer}" - student: ${result.student_name}`);
          migrationLog.push({
            id: result.id,
            studentName: result.student_name,
            level: result.level,
            originalAnswer: q31Answer,
            status: 'skipped',
            reason: 'No matching option found'
          });
        }
      }
    }

    const summary = {
      totalProcessed: allResults?.length || 0,
      alreadyNumeric: alreadyNumericCount,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      details: migrationLog
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