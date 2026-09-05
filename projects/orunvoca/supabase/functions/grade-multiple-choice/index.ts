import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GradeRequest {
  word: string;
  meaning: string;
  choices: string[];
  studentAnswers: string[];
  correctAnswers: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions }: { questions: GradeRequest[] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      // Fallback to simple matching if no API key
      console.log('No API key, using fallback grading');
      const results = questions.map(q => fallbackGrade(q));
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const question of questions) {
      try {
        const prompt = `당신은 영어 단어 시험 채점 전문가입니다. 학생의 답안을 채점해주세요.

영단어: "${question.word}"
원본 뜻: "${question.meaning}"

제시된 선지들:
${question.choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

정답으로 저장된 뜻들:
${question.correctAnswers.map((c, i) => `- ${c}`).join('\n')}

학생이 선택한 답안:
${question.studentAnswers.map((a, i) => `- ${a}`).join('\n')}

채점 기준:
1. 학생이 선택한 답안이 정답 뜻과 의미적으로 동일하면 정답으로 인정
2. "노력을 들이다"와 "노력을 기울이다"는 같은 의미로 인정
3. "~을 조사하다"와 "조사하다"도 같은 의미로 인정
4. 품사 마커([명], [동] 등)는 무시
5. 띄어쓰기나 조사의 미세한 차이는 무시

응답 형식 (JSON만):
{
  "correctlySelected": 학생이 올바르게 선택한 정답 개수 (숫자),
  "wronglySelected": 학생이 잘못 선택한 오답 개수 (숫자),
  "totalCorrect": 전체 정답 개수 (숫자),
  "isFullyCorrect": 완전 정답 여부 (true/false),
  "partialScore": 부분 점수 (0-1 사이 소수)
}`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              {
                role: 'system',
                content: 'You are an exam grading assistant. Respond with JSON only, no markdown.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          console.error(`AI grading failed for "${question.word}":`, response.status);
          results.push(fallbackGrade(question));
          continue;
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // Remove markdown code blocks if present
        if (content.startsWith('```')) {
          content = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }

        try {
          const gradeResult = JSON.parse(content);
          results.push({
            word: question.word,
            correctlySelected: gradeResult.correctlySelected || 0,
            wronglySelected: gradeResult.wronglySelected || 0,
            totalCorrect: gradeResult.totalCorrect || question.correctAnswers.length,
            isFullyCorrect: gradeResult.isFullyCorrect || false,
            partialScore: gradeResult.partialScore || 0,
          });
        } catch (parseError) {
          console.error('Failed to parse AI response:', content);
          results.push(fallbackGrade(question));
        }

      } catch (error) {
        console.error(`Error grading question for "${question.word}":`, error);
        results.push(fallbackGrade(question));
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grade-multiple-choice:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Fallback grading when AI is unavailable
function fallbackGrade(question: GradeRequest): any {
  const normalize = (text: string): string => {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^\d+\.\s*/, '')
      .replace(/\[([명동형부])\]\s*/g, '')
      .toLowerCase();
  };

  const normalizedCorrect = question.correctAnswers.map(a => normalize(a));
  const normalizedStudent = question.studentAnswers.map(a => normalize(a));

  const correctlySelected = normalizedStudent.filter(sa => 
    normalizedCorrect.some(ca => ca === sa || ca.includes(sa) || sa.includes(ca))
  ).length;

  const wronglySelected = normalizedStudent.filter(sa => 
    !normalizedCorrect.some(ca => ca === sa || ca.includes(sa) || sa.includes(ca))
  ).length;

  const totalCorrect = normalizedCorrect.length;
  const partialScore = Math.max(0, (correctlySelected - wronglySelected) / totalCorrect);
  const isFullyCorrect = correctlySelected === totalCorrect && wronglySelected === 0;

  return {
    word: question.word,
    correctlySelected,
    wronglySelected,
    totalCorrect,
    isFullyCorrect,
    partialScore,
  };
}
