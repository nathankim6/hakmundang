import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_CODE = '101100';

const GRAMMAR_CATEGORIES = [
  // 절 구조
  '관계대명사절',
  '관계부사절',
  '명사절 (that/whether/의문사)',
  '부사절',
  // 준동사 구문
  '분사구문',
  '분사 (현재/과거)',
  '동명사 구문',
  'to부정사 (명사적)',
  'to부정사 (형용사적/부사적)',
  // 특수 구문
  '가정법 (과거/과거완료)',
  '도치 구문',
  '강조 구문 (It is~that / do)',
  '삽입/동격 구문',
  '비교 구문 (비교급/최상급/원급)',
  '부정 구문 (부정어/이중부정)',
  // 동사 관련
  '시제/시상',
  '수동태/능동태',
  '주어-동사 수일치',
  '사역/지각동사',
  // 접속/연결
  '등위접속사/상관접속사',
  '종속접속사',
  '병렬구조',
  // 품사/수식
  '대명사/지시어',
  '관사/한정사',
  '전치사 (구)',
  '형용사/부사 구별',
  '복합관계사 (whoever/whatever 등)',
  // 기타
  '어순/문장구조',
  '기타',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sentence, answer, questionId, workbookId, adminCode, categories } = await req.json();
    const effectiveWorkbookId = workbookId || 'syntax10000';

    if (action === 'classify') {
      // Classify a single sentence
      if (!sentence || !answer) {
        return new Response(
          JSON.stringify({ error: 'sentence and answer are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const systemPrompt = `당신은 영어 구문 분석 전문가입니다. 주어진 영어 문장에서 가장 핵심적으로 쓰인 구문/문법 구조를 분석하고, 아래 카테고리 중 가장 적합한 하나를 선택해주세요.

분류 기준: 해당 문장의 핵심 구문이 무엇인지 판단합니다. 문법 오류가 있는 경우 오류가 속한 구문을, 오류가 없는 경우 문장의 가장 두드러진 구문적 특징을 기준으로 분류합니다.

가능한 카테고리:
${GRAMMAR_CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join('\n')}

반드시 위 카테고리 중 하나만 정확히 출력하세요. 다른 설명이나 텍스트는 포함하지 마세요.`;

      const userPrompt = `문장: ${sentence}
정답/해석: ${answer}

이 문장에서 가장 핵심적으로 쓰인 구문 카테고리를 하나만 선택하세요.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 50,
          messages: [{ role: 'user', content: userPrompt }],
          system: systemPrompt,
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: 'AI service error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      let category = data.content?.[0]?.text?.trim() || '';
      
      // Validate category
      if (!GRAMMAR_CATEGORIES.includes(category)) {
        // Try to find closest match
        const found = GRAMMAR_CATEGORIES.find(c => category.includes(c) || c.includes(category));
        category = found || '기타';
      }

      // Save to DB if questionId provided
      if (questionId && adminCode === ADMIN_CODE) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('question_grammar_categories')
          .upsert(
            { question_id: questionId, category, workbook_id: effectiveWorkbookId },
            { onConflict: 'workbook_id,question_id' }
          );
      }

      return new Response(
        JSON.stringify({ category }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'getAll') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('question_grammar_categories')
        .select('question_id, category')
        .eq('workbook_id', effectiveWorkbookId)
        .order('question_id', { ascending: true });

      if (error) throw error;

      const categoriesMap: Record<number, string> = {};
      data?.forEach(item => {
        categoriesMap[item.question_id] = item.category;
      });

      return new Response(
        JSON.stringify({ categories: categoriesMap }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'saveBatch') {
      if (adminCode !== ADMIN_CODE) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!categories || typeof categories !== 'object') {
        return new Response(
          JSON.stringify({ error: 'categories object required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const records = Object.entries(categories).map(([qId, cat]) => ({
        question_id: parseInt(qId),
        category: cat as string,
        workbook_id: effectiveWorkbookId,
      }));

      if (records.length > 0) {
        const { error } = await supabase
          .from('question_grammar_categories')
          .upsert(records, { onConflict: 'workbook_id,question_id' });
        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ success: true, count: records.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action', availableCategories: GRAMMAR_CATEGORIES }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in classify-grammar:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
