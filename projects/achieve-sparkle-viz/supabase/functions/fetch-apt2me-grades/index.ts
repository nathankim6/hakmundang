// Scrapes apt2.me middle-school achievement data and returns parsed JSON.
// Public endpoint (no auth required).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBJECTS: Record<string, string> = {
  영어: "%EC%98%81%EC%96%B4",
  국어: "%EA%B5%AD%EC%96%B4",
  수학: "%EC%88%98%ED%95%99",
};

// Drop the "학교" suffix to get a short label
function shortName(full: string): string {
  if (full === "중앙대학교사범대학부속중학교") return "중대부중";
  if (full.endsWith("여자중학교")) return full.replace("여자중학교", "여중");
  if (full.endsWith("중학교")) return full.replace("중학교", "중");
  return full;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const params = req.method === "POST" ? await req.json() : Object.fromEntries(url.searchParams);
    const area = String(params.area ?? "11590"); // default 동작구
    const year = String(params.year ?? "2025");
    const grade = String(params.grade ?? "2");
    const term = String(params.term ?? "1");
    const subjectKo = String(params.subject ?? "영어");
    const subject = SUBJECTS[subjectKo] ?? SUBJECTS["영어"];

    const target = `https://apt2.me/apt/middleGrade.jsp?pages=1&area=${area}&Cmb_year=${year}&Cmb_grade=${grade}&Cmb_term=${term}&Cmb_subject=${subject}`;

    const res = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `apt2.me responded ${res.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&nbsp;/g, " ");

    const pattern =
      /([가-힣]+(?:여자중학교|중학교))\s*[가-힣]+\s*(?:공립|사립)[\s\S]*?([\d.]+)\s*점\s*평균[\s\S]*?A\s*\/\s*B\s*\/\s*C\s*\/\s*D\s*\/\s*E\s*[^\d]+([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)\s*%/g;

    const schools: Array<{
      name: string;
      fullName: string;
      averageScore: number;
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
    }> = [];
    const seen = new Set<string>();

    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const fullName = m[1];
      if (seen.has(fullName)) continue;
      seen.add(fullName);
      schools.push({
        fullName,
        name: shortName(fullName),
        averageScore: parseFloat(m[2]),
        A: parseFloat(m[3]),
        B: parseFloat(m[4]),
        C: parseFloat(m[5]),
        D: parseFloat(m[6]),
        E: parseFloat(m[7]),
      });
    }

    schools.sort((a, b) => b.averageScore - a.averageScore);

    return new Response(
      JSON.stringify({
        success: true,
        source: target,
        meta: { area, year, grade, term, subject: subjectKo },
        count: schools.length,
        schools,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
