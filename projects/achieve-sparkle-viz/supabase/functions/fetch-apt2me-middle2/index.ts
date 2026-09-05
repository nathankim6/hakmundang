// Scrapes apt2.me middle2.jsp (특목·자사·영재고 진학 현황) and returns parsed JSON.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function shortName(full: string): string {
  if (full === "중앙대학교사범대학부속중학교") return "중대부중";
  if (full.endsWith("여자중학교")) return full.replace("여자중학교", "여중");
  if (full.endsWith("중학교")) return full.replace("중학교", "중");
  return full;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const params = req.method === "POST" ? await req.json() : Object.fromEntries(url.searchParams);
    const area = String(params.area ?? "11710");
    const year = String(params.year ?? "2025");

    const target = `https://apt2.me/apt/middle2.jsp?area=${area}&Cmb_year=${year}`;
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

    // Split into <article class="scard ..."> blocks
    const articleRe = /<article class="scard[^"]*">([\s\S]*?)<\/article>/g;

    const schools: Array<{
      name: string;
      fullName: string;
      dong: string;
      pct: number;
      advanced: number;
      total: number;
      sci: number;
      intl: number;
      auto: number;
      gifted: number;
    }> = [];

    let m: RegExpExecArray | null;
    while ((m = articleRe.exec(html)) !== null) {
      const body = m[1];

      const nm = body.match(/<span class="nm">([^<]+)<\/span>/);
      if (!nm) continue;
      const fullName = nm[1].trim();

      const addrMatch = body.match(/<div class="addr">([^<]*)<\/div>/);
      const address = addrMatch ? addrMatch[1].trim() : "";
      const dongMatch = address.match(/송파구\s+([가-힣0-9]+(?:동|로|길|가))/);
      const dong = dongMatch ? dongMatch[1] : "";

      const pctMatch = body.match(/<div class="v">([\d.]+)<small>%<\/small>/);
      const pct = pctMatch ? parseFloat(pctMatch[1]) : 0;

      const advMatch = body.match(/진학\s*<b>(\d+)명<\/b>/);
      const advanced = advMatch ? parseInt(advMatch[1], 10) : 0;

      const totalMatch = body.match(/졸업\s*(\d+)명/);
      const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;

      const statMap: Record<string, number> = {};
      const statRe = /<div class="stat"><div class="k">([^<]+)<\/div><div class="v">(\d+)<small>명<\/small>/g;
      let sm: RegExpExecArray | null;
      while ((sm = statRe.exec(body)) !== null) {
        statMap[sm[1].trim()] = parseInt(sm[2], 10);
      }

      schools.push({
        fullName,
        name: shortName(fullName),
        dong,
        pct,
        advanced,
        total,
        sci: statMap["과학고"] ?? 0,
        gifted: statMap["영재고"] ?? 0,
        intl: statMap["외고·국제"] ?? statMap["외고·국제고"] ?? 0,
        auto: statMap["자사고"] ?? 0,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: target,
        meta: { area, year },
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
