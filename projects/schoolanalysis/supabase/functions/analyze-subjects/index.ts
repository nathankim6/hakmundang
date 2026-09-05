import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { schoolData, region } = body ?? {};
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const latestYear = schoolData?.yearData?.[2];
    if (!latestYear) {
      console.error("Invalid payload:", JSON.stringify(body));
      return new Response(
        JSON.stringify({ error: "분석 데이터가 올바르지 않습니다. 3개년 정보를 모두 입력해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const is2025 = String(latestYear.year ?? "").includes("2025");

    const stdDevNote = is2025
      ? " (2025학년도는 표준편차가 아직 공개되지 않았으므로 표준편차 수치는 분석에서 제외하고 평균과 등급 분포만으로 판단하세요. 본문에서도 표준편차를 언급하지 마세요.)"
      : "";
    const fmtStd = (v: any) => (is2025 ? "미공개" : Number(v).toFixed(1));

    const prompt = `다음은 ${schoolData.schoolName} 학교의 ${latestYear.year}학년도 과목별 성적 데이터입니다.${stdDevNote}

국어: 평균 ${Number(latestYear.koreanAvg).toFixed(1)}점, 표준편차 ${fmtStd(latestYear.koreanStdDev)}, A등급 ${Number(latestYear.koreanGrades.A).toFixed(1)}%, B등급 ${Number(latestYear.koreanGrades.B).toFixed(1)}%, C등급 ${Number(latestYear.koreanGrades.C).toFixed(1)}%, D등급 ${Number(latestYear.koreanGrades.D).toFixed(1)}%, E등급 ${Number(latestYear.koreanGrades.E).toFixed(1)}%

수학: 평균 ${Number(latestYear.mathAvg).toFixed(1)}점, 표준편차 ${fmtStd(latestYear.mathStdDev)}, A등급 ${Number(latestYear.mathGrades.A).toFixed(1)}%, B등급 ${Number(latestYear.mathGrades.B).toFixed(1)}%, C등급 ${Number(latestYear.mathGrades.C).toFixed(1)}%, D등급 ${Number(latestYear.mathGrades.D).toFixed(1)}%, E등급 ${Number(latestYear.mathGrades.E).toFixed(1)}%

영어: 평균 ${Number(latestYear.englishAvg).toFixed(1)}점, 표준편차 ${fmtStd(latestYear.englishStdDev)}, A등급 ${Number(latestYear.englishGrades.A).toFixed(1)}%, B등급 ${Number(latestYear.englishGrades.B).toFixed(1)}%, C등급 ${Number(latestYear.englishGrades.C).toFixed(1)}%, D등급 ${Number(latestYear.englishGrades.D).toFixed(1)}%, E등급 ${Number(latestYear.englishGrades.E).toFixed(1)}%

내년에 이 학교에 입학할 학생의 학부모님을 대상으로 각 과목별 시험 난이도를 쉽게 설명해주세요. ${is2025 ? "평균 점수와 등급 분포(A~E 비율, 상·하위권 비중)를 종합하여" : "평균 점수, 표준편차, 등급 분포를 종합하여"} 국어, 수학, 영어 중 어떤 과목이 상대적으로 어렵고 쉬운지 비교 분석하세요. 마지막에는 '이 학교는 영어에 비해 상대적으로 국어가 많이 어려운 학교입니다. 영어 기초가 부족한 학생들에게 유리할 수 있습니다'와 같은 과목 간 상대적 난이도 비교와 어떤 학생에게 유리한지에 대한 실질적인 코멘트를 포함해주세요. 교양있고 간결한 어투로 카테고리나 소제목 없이 하나의 자연스러운 문단으로 줄바꿈 없이 작성하세요.

반드시 지켜야 할 규칙:
- 인사말("존경하는 학부모님께", "안녕하세요" 등), 서론("~에 대한 분석을 제공하고자 합니다" 등), 마무리("도움이 되기를 바랍니다", "감사합니다" 등)는 절대 포함하지 마세요.
- 분석 내용만 바로 시작해서 끝까지 분석 내용으로 마무리하세요.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "당신은 예비 입학생 학부모님께 학교의 과목별 시험 난이도를 설명하는 교육 전문가입니다. 국어, 수학, 영어 세 과목의 데이터를 비교 분석하여 각 과목의 상대적 난이도를 쉽게 설명합니다. 평균과 표준편차가 낮을수록 어려운 시험, 높을수록 쉬운 시험임을 고려하여 분석합니다. 교양있고 품격있는 어투를 사용하며, 학부모님이 자녀의 입학 준비에 참고할 수 있도록 과목 간 비교와 실질적인 조언을 제공합니다. 카테고리 구분 없이 하나의 자연스러운 문단으로 작성합니다. 절대 인사말, 서론, 마무리 문장을 넣지 마세요. 분석 내용만 바로 시작하고 분석 내용으로 끝내세요."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API 오류 (${response.status}): ${errorText}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-subjects function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
