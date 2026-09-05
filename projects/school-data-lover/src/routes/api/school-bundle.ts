import { createFileRoute } from "@tanstack/react-router";

// NEIS 기본정보만 자동 갱신. 학업성취도·진학 데이터는 공개 API 제약으로
// 수동 입력값을 그대로 사용한다. (학교알리미 호출 제거)

const NEIS_BASE = "https://open.neis.go.kr/hub";

async function neis(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: "100",
    ...params,
  });
  const url = `${NEIS_BASE}/${path}?${qs}`;
  try {
    const r = await fetch(url);
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (e) {
    console.error("neis fetch failed", url, (e as Error).message);
    return null;
  }
}

function rows(json: any, key: string): any[] {
  const root = json?.[key];
  if (!Array.isArray(root)) return [];
  return root.find((x: any) => x?.row)?.row ?? [];
}

async function loadOne(name: string, level: "고등학교" | "중학교") {
  const info = await neis("schoolInfo", { SCHUL_NM: name });
  const list = rows(info, "schoolInfo");
  const m =
    list.find(
      (r: any) =>
        r.SCHUL_KND_SC_NM === level && r.LCTN_SC_NM === "서울특별시",
    ) ??
    list.find((r: any) => r.SCHUL_KND_SC_NM === level) ??
    list[0];
  if (!m) return { name, found: false };
  const schoolCode = m.SD_SCHUL_CODE as string;

  const now = new Date();
  const baseYear =
    now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const years = [baseYear - 2, baseYear - 1, baseYear];

  // 학급수 / 학년별 학급수 (NEIS classInfo)
  let classes: number | undefined;
  let entrants: number | undefined;
  let students: number | undefined;
  try {
    const cls = await neis("classInfo", {
      ATPT_OFCDC_SC_CODE: m.ATPT_OFCDC_SC_CODE,
      SD_SCHUL_CODE: schoolCode,
      AY: String(baseYear),
    });
    const cRows = rows(cls, "classInfo");
    if (cRows.length) {
      classes = cRows.length;
      const g1 = cRows.filter((r: any) => r.GRADE === "1").length;
      // 학급당 평균 25명 가정 (공시값이 아니므로 표시 시 주의)
      if (g1) entrants = g1 * 25;
      students = classes * 25;
    }
  } catch {
    /* noop */
  }

  return {
    name,
    found: true,
    schoolCode,
    address: m.ORG_RDNMA,
    coedu: m.COEDU_SC_NM,
    homepage: m.HMPG_ADRES,
    kind: m.SCHUL_KND_SC_NM,
    students,
    entrants,
    classes,
    years,
  };
}

export const Route = createFileRoute("/api/school-bundle")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "Content-Type",
          },
        }),
      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response("invalid json", { status: 400 });
        }
        const schools: string[] = Array.isArray(body?.schools)
          ? body.schools.filter((s: any) => typeof s === "string").slice(0, 30)
          : [];
        const level: "고등학교" | "중학교" =
          body?.level === "중학교" ? "중학교" : "고등학교";
        const results = await Promise.all(
          schools.map((n) => loadOne(n, level)),
        );
        return new Response(
          JSON.stringify({ level, schools: results }),
          {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "public, max-age=1800",
              "access-control-allow-origin": "*",
            },
          },
        );
      },
    },
  },
});
