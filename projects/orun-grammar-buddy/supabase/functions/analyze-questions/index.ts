import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, grade, sourceFile } = await req.json();

    if (!pdfText || !grade) {
      return new Response(
        JSON.stringify({ success: false, error: 'PDF 텍스트와 학년이 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Anthropic API 키가 구성되지 않았습니다." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Analyzing PDF text for grade:", grade);
    console.log("PDF text length:", pdfText.length);
    console.log("PDF text sample (first 2000 chars):", pdfText.substring(0, 2000));

    // 학년별 난이도 매핑
    const gradeTodifficulty: Record<string, string> = {
      '중1': '하', '중2': '하', '중3': '하',
      '고1': '하', '고2': '중', '고3': '상',
      '1학년': '하', '2학년': '중', '3학년': '상',
    };
    
    const defaultDifficulty = gradeTodifficulty[grade] || '중';

    const systemPrompt = `당신은 영어 문법 시험 문제를 분석하는 전문가입니다.

## 임무
텍스트에서 영어 문법 문제를 **하나씩 차근차근** 추출합니다.

## 중요: 제외할 문제 유형
다음 유형의 문제는 **절대 추출하지 마세요**:
- 표(table)가 포함된 문제 (시간표, 스케줄, 비교표 등)
- 그림(image, picture, figure)이 포함된 문제
- "다음 표를 보고", "위 표를 참고하여", "그림을 보고" 등의 지시문이 있는 문제
- 표나 그림 없이는 풀 수 없는 문제

## 문제 식별 기준
- 번호가 있는 항목 (1., 2., ①, ②, (1), (2) 등)
- 빈칸/밑줄이 있는 문장
- 선택지가 있는 문항

## 문법 유형 (구체적으로 분류)
시제, 조동사, 수동태, to부정사, 동명사, 분사, 관계사, 접속사, 가정법, 비교급, 일치/화법, 특수구문, 명사/관사, 대명사, 형용사/부사, 전치사, 기타

## 특수 형식 보존
- 밑줄 빈칸: _______ 또는 _____ 형태로 유지
- 괄호 마커: (A), (B), (C) 그대로 유지
- [보기] 또는 <보기>: 그대로 유지
- 대화문: A:, B: 형식 유지

## 출력 규칙
1. **JSON 배열만 출력** (설명 없이)
2. 각 문제 형식:
{"grammar_type":"유형","question_type":"객관식/주관식","difficulty":"${defaultDifficulty}","question_text":"문제 전체","options":["①","②","③","④","⑤"],"answer":"정답","explanation":"해설","pattern_name":"섹션명"}
3. options가 없으면 null
4. 첫 글자 [, 마지막 글자 ]
5. 표/그림이 필요한 문제는 절대 포함하지 마세요`;

    const userPrompt = `파일: ${sourceFile || "unknown"} | 학년: ${grade}

## 중요 주의사항
- 표(table)나 그림(image)이 포함된 문제는 **반드시 제외**
- 텍스트만으로 풀 수 있는 문제만 추출

[텍스트]
${pdfText.substring(0, 30000)}
[끝]

JSON 배열만 출력. 표/그림 문제 제외. 첫 글자 [, 마지막 글자 ]`;

    console.log("Calling Claude API with simplified prompt...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 32000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI 사용량이 초과되었습니다." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "AI 분석 중 오류가 발생했습니다." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const content = aiData.content?.[0]?.text;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ success: false, error: "AI 응답이 비어있습니다." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("AI response received, parsing questions...");
    console.log("Raw AI response (first 1000 chars):", content.substring(0, 1000));

    // Extract JSON from the response - try multiple methods
    let jsonStr = content.trim();
    
    // Method 1: Try to extract from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // Method 2: Find the JSON array in the response (look for [ ... ])
    if (!jsonStr.startsWith('[')) {
      const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        jsonStr = arrayMatch[0];
      }
    }
    
    // Method 3: Try to find JSON starting from first [
    if (!jsonStr.startsWith('[')) {
      const startIdx = content.indexOf('[');
      const endIdx = content.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = content.substring(startIdx, endIdx + 1);
      }
    }

    let questions;
    try {
      questions = JSON.parse(jsonStr);
    } catch (parseError) {
      // If JSON is truncated, try to fix it by finding complete objects
      console.log("Initial parse failed, trying to recover truncated JSON...");
      
      // Try to find the last complete object in the array
      let fixedJson = jsonStr;
      
      // Remove trailing incomplete object
      const lastCompleteObjEnd = jsonStr.lastIndexOf('},');
      if (lastCompleteObjEnd !== -1) {
        fixedJson = jsonStr.substring(0, lastCompleteObjEnd + 1) + ']';
      } else {
        // Try finding just the last }
        const lastBrace = jsonStr.lastIndexOf('}');
        if (lastBrace !== -1) {
          fixedJson = jsonStr.substring(0, lastBrace + 1) + ']';
        }
      }
      
      try {
        questions = JSON.parse(fixedJson);
        console.log(`Recovered ${questions.length} questions from truncated response`);
      } catch (secondError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        console.error("Recovery also failed:", secondError);
        console.error("Response content:", content.substring(0, 1000));
        return new Response(
          JSON.stringify({ success: false, error: "AI 응답을 파싱할 수 없습니다." }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log("Parsed questions count:", Array.isArray(questions) ? questions.length : 1);
    if (Array.isArray(questions) && questions.length > 0) {
      console.log("First parsed question:", JSON.stringify(questions[0]).substring(0, 500));
    }

    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ success: false, error: "데이터베이스 설정이 없습니다." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const questionsToInsert = questions.map((q: any) => ({
      grade: grade,
      grammar_type: q.grammar_type || q.grammarType || q.category || "기타",
      difficulty: q.difficulty || defaultDifficulty,
      question_type: q.question_type || q.questionType || (q.options && q.options.length > 0 ? "객관식" : "주관식"),
      question_text: q.question_text || q.questionText || q.question || q.text || "",
      options: q.options || q.choices || null,
      answer: q.answer || q.correctAnswer || q.correct_answer || "",
      explanation: q.explanation || q.解説 || null,
      source_file: sourceFile || null,
      pattern_name: q.pattern_name || q.patternName || q.pattern || null,
    })).filter((q: any) => q.question_text && q.question_text.trim() !== "");

    console.log(`Questions after mapping: ${questions.length}, after filtering: ${questionsToInsert.length}`);
    if (questionsToInsert.length > 0) {
      console.log("First question to insert:", JSON.stringify(questionsToInsert[0]).substring(0, 500));
    } else if (questions.length > 0) {
      console.log("Sample raw question that got filtered:", JSON.stringify(questions[0]).substring(0, 500));
    }

    console.log(`Inserting ${questionsToInsert.length} questions into database`);

    if (questionsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "추출할 수 있는 문제가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: insertedData, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: `데이터베이스 저장 실패: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully inserted ${insertedData?.length} questions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedData?.length}개의 문제가 추출되어 저장되었습니다.`,
        questions: insertedData,
        count: insertedData?.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-questions function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "알 수 없는 오류" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
