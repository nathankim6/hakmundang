import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

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
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { word, correctAnswers, questionId } = await req.json();

    if (!word || typeof word !== 'string' || word.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!correctAnswers || !Array.isArray(correctAnswers) || correctAnswers.length > 10) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const correctCount = correctAnswers.length;
    const distractorCount = 5 - correctCount;

    const prompt = `영어 단어 "${word}"의 정답 한글 뜻: ${correctAnswers.map((a: string) => `"${a}"`).join(', ')}

**반드시 한글로** 오답 선지 ${distractorCount}개를 생성하세요.

**필수 규칙:**
1. **반드시 한글**: 모든 오답은 한글 단어여야 함 (영어 금지)
2. **품사 일치**: 정답과 동일한 품사 (명사→명사, 동사→동사, 형용사→형용사)
3. **난이도 일치**: 정답과 동일한 어휘 수준의 한글 단어
4. **의미 무관**: 정답과 유의어, 반의어, 연관 개념 모두 금지
5. **형식**: 각 선지는 한 단어 또는 짧은 구만

JSON 배열만 응답 (한글만): ["한글오답1", "한글오답2", ...]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '당신은 영어 교육 전문가입니다. 요청된 형식으로만 정확하게 응답해주세요.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse distractors from AI response');
    }
    
    let distractors = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(distractors)) {
      throw new Error('Invalid distractors format');
    }
    
    distractors = distractors.filter((d: string) => /[가-힣]/.test(d));
    
    if (distractors.length === 0) {
      throw new Error('No valid Korean distractors generated');
    }
    
    if (distractors.length > distractorCount) {
      distractors = distractors.slice(0, distractorCount);
    }

    return new Response(JSON.stringify({ 
      distractors,
      questionId,
      word,
      correctAnswers
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-vocabulary-distractors function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
