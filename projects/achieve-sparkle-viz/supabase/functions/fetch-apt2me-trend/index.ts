// Scrapes apt2.me schoolTrend.jsp (5-year achievement trend) and returns parsed JSON.
// Public endpoint (no auth required).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function shortName(full: string): string {
  if (full === "중앙대학교사범대학부속중학교") return "중대부중";
  if (full === "중앙대학교사범대학부속고등학교") return "중대부고";
  if (full.endsWith("여자고등학교")) return full.replace("여자고등학교", "여고");
  if (full.endsWith("고등학교")) return full.replace("고등학교", "고");
  if (full.endsWith("여자중학교")) return full.replace("여자중학교", "여중");
  if (full.endsWith("중학교")) return full.replace("중학교", "중");
  return full;
}

function stripTags(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#9650;/g, "▲")
    .replace(/&#9660;/g, "▼")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const params = req.method === "POST" ? await req.json() : Object.fromEntries(url.searchParams);
    const area = String(params.area ?? "11710");
    const gubun = String(params.gubun ?? "04"); // 04 고등학교, 03 중학교

    const target = `https://apt2.me/apt/schoolTrend.jsp?pages=1&area=${area}&Cmb_gubun=${gubun}&danjiNm=`;
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

    // Each school block starts with: <a href="/apt/...Grade.jsp...">학교명</a>
    // followed by 공립/사립 badge, then a table containing 원점수 and 환산 rows.
    const schools: Array<{
      name: string;
      fullName: string;
      type: string;
      address: string;
      years: number[];
      avg5: number | null;
      trend: string;
      trendKind: string;
    }> = [];

    const blockRe =
      /<a [^>]*href="\/apt\/(?:high|middle)Grade\.jsp[^"]*"[^>]*>([^<]+(?:고등학교|중학교))<\/a>([\s\S]*?)(?=<a [^>]*href="\/apt\/(?:high|middle)Grade\.jsp|<\/body>)/g;

    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(html)) !== null) {
      const fullName = m[1].trim();
      const body = m[2];

      const typeMatch = body.match(/>(공립|사립)</);
      const type = typeMatch ? typeMatch[1] : "";
      const addrMatch = body.match(/서울특별시\s*[가-힣]+구\s*[가-힣0-9~·\s\-]+?</);
      const address = addrMatch ? stripTags(addrMatch[0]).replace(/<$/, "") : "";

      // Find the 환산 row (수학×1.5). It is the second data row; extract 8 TDs after it.
      const hwanIdx = body.indexOf("환산");
      const slice = hwanIdx >= 0 ? body.slice(hwanIdx) : body;
      const tds = Array.from(slice.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map((x) =>
        stripTags(x[1]),
      );
      // tds[0..4] = year values 2021..2025, tds[5] = 5년평균, tds[6] = 3년추세, tds[7] = 전년
      const years = tds.slice(0, 5).map((v) => {
        const n = parseFloat(v);
        return isNaN(n) ? NaN : n;
      });
      const avg5Raw = tds[5] ?? "";
      const avg5 = parseFloat(avg5Raw);
      const trendRaw = tds[6] ?? "";
      let trendKind = "flat";
      if (/▲▲|연속상승|급등/.test(trendRaw)) trendKind = "up2";
      else if (/▲|반등|상승/.test(trendRaw)) trendKind = "up";
      else if (/▼▼|연속하락|급락/.test(trendRaw)) trendKind = "down2";
      else if (/▼|하락/.test(trendRaw)) trendKind = "down";

      if (years.some((v) => !isNaN(v))) {
        schools.push({
          fullName,
          name: shortName(fullName),
          type,
          address,
          years,
          avg5: isNaN(avg5) ? null : avg5,
          trend: trendRaw,
          trendKind,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: target,
        meta: { area, gubun },
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
