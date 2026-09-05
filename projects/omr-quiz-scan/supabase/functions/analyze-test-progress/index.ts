import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

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

async function verifyAccessCode(accessCode: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from('access_codes')
    .select('code, expiry_date')
    .eq('code', accessCode)
    .single();

  if (error || !data) return false;
  return new Date(data.expiry_date) > new Date();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    const body = await req.json();
    const { testResults, testNames, accessCode } = body;

    // Require access code
    if (!accessCode || typeof accessCode !== 'string' || !(await verifyAccessCode(accessCode))) {
      return new Response(JSON.stringify({ error: 'Valid access code required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // 시험 결과를 시간순으로 정렬
    const sortedResults = testResults.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const detailedAnalysis = sortedResults.map((result: any, index: number) => {
      const answers = result.answers || {};
      const totalQuestions = Object.keys(answers).length;
      const correctAnswers = Object.values(answers).filter((answer: any) => answer === true).length;
      
      const areas = {
        '듣기': { total: Math.floor(totalQuestions * 0.15), correct: 0 },
        '대의파악': { total: Math.floor(totalQuestions * 0.15), correct: 0 },
        '내용이해': { total: Math.floor(totalQuestions * 0.2), correct: 0 },
        '어법어휘': { total: Math.floor(totalQuestions * 0.15), correct: 0 },
        '빈칸추론': { total: Math.floor(totalQuestions * 0.15), correct: 0 },
        '간접쓰기': { total: Math.floor(totalQuestions * 0.1), correct: 0 },
        '장문': { total: Math.floor(totalQuestions * 0.1), correct: 0 }
      };

      let remainingCorrect = correctAnswers;
      Object.keys(areas).forEach((area) => {
        const areaCorrect = Math.min(remainingCorrect, Math.floor(areas[area].total * (correctAnswers / totalQuestions)));
        areas[area].correct = areaCorrect;
        remainingCorrect -= areaCorrect;
      });

      return {
        회차: index + 1,
        시험명: testNames[result.test_id] || result.test_id,
        전체점수: Math.round(Number(result.score)),
        날짜: new Date(result.created_at).toLocaleDateString('ko-KR'),
        영역별성취도: Object.entries(areas).map(([area, data]) => ({
          영역: area,
          정답률: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          정답수: data.correct,
          전체문제수: data.total
        }))
      };
    });

    const prompt = `당신은 수능영어 전문 분석가입니다. 다음 학생의 회차별 시험 결과를 영역별로 상세 분석해주세요:

${JSON.stringify(detailedAnalysis, null, 2)}

각 영역(듣기, 대의파악, 내용이해, 어법어휘, 빈칸추론, 간접쓰기, 장문)에서 회차별 성취도 변화를 분석하고, 지속적으로 취약한 영역과 강점 영역을 식별해주세요. 취약 영역에서는 구체적인 문제점과 즉시 실행 가능한 개선 방법을, 강점 영역에서는 성공 요인을 간결하게 제시해주세요.

각 영역별로 2-3문장의 간단한 분석과 조언을 제공하되, 제목이나 번호 없이 바로 내용으로 작성해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '당신은 수능영어 전문 분석가로서 학생들의 시험 결과를 체계적으로 분석하고 구체적인 개선 방안을 제시하는 전문가입니다. 데이터 기반의 객관적 분석과 교육적 통찰을 제공합니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis, detailedAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-test-progress function:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
