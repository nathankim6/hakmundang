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

    const yearData = schoolData?.yearData;
    if (!Array.isArray(yearData) || yearData.length < 3 || !yearData[0] || !yearData[2]) {
      console.error("Invalid payload:", JSON.stringify(body));
      return new Response(
        JSON.stringify({ error: "분석 데이터가 올바르지 않습니다. 3개년 정보를 모두 입력해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const firstYear = yearData[0];
    const lastYear = yearData[2];
    const lastIs2025 = String(lastYear?.year ?? "").includes("2025");


    const avgChange = Number(lastYear.englishAvg) - Number(firstYear.englishAvg);
    const topGradeChange = Number(lastYear.englishGrades.A) - Number(firstYear.englishGrades.A);
    const lowGradeChange = (Number(lastYear.englishGrades.D) + Number(lastYear.englishGrades.E)) -
                           (Number(firstYear.englishGrades.D) + Number(firstYear.englishGrades.E));
    const stdDevChange = Number(lastYear.englishStdDev) - Number(firstYear.englishStdDev);

    const stdDevNotice = lastIs2025
      ? `\n\n※ 중요: 2025학년도는 표준편차가 아직 공개되지 않았습니다. 2025학년도의 표준편차 수치와 "표준편차 변화" 항목은 분석에서 제외하고, 본문에서도 표준편차를 언급하지 마세요. 학생들 간 실력 차이는 등급 분포(특히 A등급 비율과 D+E 하위권 비율의 격차)로 판단하세요.`
      : "";

    const prompt = `다음은 ${schoolData.schoolName} 학교의 3개년 영어 성적 데이터입니다.${stdDevNotice}

${yearData.map((year: any) => {
  const y = String(year.year);
  const isPred = y.includes("2025");
  const stdLine = isPred
    ? `- 표준편차: 미공개 (분석에서 제외)`
    : `- 표준편차: ${Number(year.englishStdDev).toFixed(1)}`;
  return `
${year.year}학년도:
- 평균: ${Number(year.englishAvg).toFixed(1)}점
${stdLine}
- A등급: ${Number(year.englishGrades.A).toFixed(1)}%
- B등급: ${Number(year.englishGrades.B).toFixed(1)}%
- C등급: ${Number(year.englishGrades.C).toFixed(1)}%
- D등급: ${Number(year.englishGrades.D).toFixed(1)}%
- E등급: ${Number(year.englishGrades.E).toFixed(1)}%
- 상위권(A+B): ${(Number(year.englishGrades.A) + Number(year.englishGrades.B)).toFixed(1)}%
- 하위권(D+E): ${(Number(year.englishGrades.D) + Number(year.englishGrades.E)).toFixed(1)}%`;
}).join('\n')}

3개년 변화 요약:
- 평균 점수 변화: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)}점
- A등급 비율 변화: ${topGradeChange > 0 ? '+' : ''}${topGradeChange.toFixed(1)}%p
- 하위권(D+E) 비율 변화: ${lowGradeChange > 0 ? '+' : ''}${lowGradeChange.toFixed(1)}%p
${lastIs2025 ? '' : `- 표준편차 변화: ${stdDevChange > 0 ? '+' : ''}${stdDevChange.toFixed(1)}`}

내년에 이 학교에 입학할 학생의 학부모님을 대상으로, 영어 시험의 난이도를 쉽게 설명해주세요.

다음 내용을 포함해주세요:
1. 3개년 동안 난이도가 어떻게 변화했는지 (어려워지는 추세인지, 쉬워지는 추세인지)
2. 상위권(A등급)과 하위권(D+E등급)의 격차가 어떤지
3. ${lastIs2025 ? '등급 분포(A등급 비율과 D+E 하위권 비율의 격차)를 통해 본 학생들 간 실력 차이 (표준편차는 언급하지 마세요)' : '표준편차 변화를 통해 본 학생들 간 실력 차이'}
4. 이 학교 영어 시험만의 특징 (예: "상위권 진입이 어려운 편", "학력 격차가 큰 편", "난이도가 점차 높아지는 추세" 등)

학부모님이 이해하기 쉽도록 전문 용어는 최소화하고, 품격있고 신뢰감 있는 어투로 작성해주세요. 
3-4개의 자연스러운 문단으로 구성하되, 마지막 문단에서는 이 학교 영어 시험의 특징을 종합적으로 설명해주세요.

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
            content: "당신은 학교 데이터를 분석하여 예비 학부모님께 정보를 제공하는 교육 전문가입니다. 내년에 입학할 학생의 학부모님을 대상으로, 영어 시험의 난이도와 특징을 쉽고 명확하게 설명합니다. 전문 용어는 최소화하고, 품격있고 신뢰감 있는 어투로 작성합니다. 3-4개의 자연스러운 문단으로 구성하며, 마지막 문단에서는 이 학교 영어 시험만의 특징을 종합적으로 설명합니다. 절대 인사말, 서론, 마무리 문장을 넣지 마세요. 분석 내용만 바로 시작하고 분석 내용으로 끝내세요."
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
    console.error("Error in analyze-school-data function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
