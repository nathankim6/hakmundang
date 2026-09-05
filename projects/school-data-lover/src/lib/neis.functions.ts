import { createServerFn } from "@tanstack/react-start";

const NEIS_BASE = "https://open.neis.go.kr/hub";

type SchoolBasic = {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  SCHUL_KND_SC_NM: string;
  ORG_RDNMA: string;
  HMPG_ADRES?: string;
  FOND_YMD?: string;
  FOAS_MEMRD?: string;
  COEDU_SC_NM?: string;
};

async function neisFetch(path: string, params: Record<string, string>) {
  const search = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: "20",
    ...params,
  });
  const url = `${NEIS_BASE}/${path}?${search.toString()}`;
  const r = await fetch(url);
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

function extractRows(json: any, key: string): any[] {
  const root = json?.[key];
  if (!Array.isArray(root)) return [];
  const block = root.find((x: any) => x?.row);
  return block?.row ?? [];
}

export const lookupSchool = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; level?: "고등학교" | "중학교" | "초등학교" }) => d)
  .handler(async ({ data }) => {
    const json = await neisFetch("schoolInfo", { SCHUL_NM: data.name });
    const rows = extractRows(json, "schoolInfo") as SchoolBasic[];
    let row = rows[0];
    if (data.level) {
      const m = rows.find((r) => r.SCHUL_KND_SC_NM === data.level);
      if (m) row = m;
    }
    if (!row) return { found: false as const, name: data.name };
    return {
      found: true as const,
      name: row.SCHUL_NM,
      kind: row.SCHUL_KND_SC_NM,
      coedu: row.COEDU_SC_NM,
      address: row.ORG_RDNMA,
      homepage: row.HMPG_ADRES,
      founded: row.FOND_YMD,
      anniversary: row.FOAS_MEMRD,
      schoolCode: row.SD_SCHUL_CODE,
      officeCode: row.ATPT_OFCDC_SC_CODE,
      officeName: row.ATPT_OFCDC_SC_NM,
    };
  });

// NEIS "학교현황 - 학교 학년별·학과별 학생수" 등 일부 데이터 + 학교알리미 학업성취도(보통학력이상)
// 최근 3개년 데이터 자동 수집.
// NEIS 자체에는 과목별 학업성취도 분포가 없어, 학교알리미(schoolinfo.go.kr) OpenAPI를
// 서버 측에서 호출해 (CORS 우회) 국어/영어/수학 보통학력이상 비율을 가져온다.
export const getAchievement3yr = createServerFn({ method: "POST" })
  .inputValidator((d: { schoolName: string; level: "고등학교" | "중학교" }) => d)
  .handler(async ({ data }) => {
    const now = new Date();
    // 학교알리미 공시는 보통 8~9월 갱신. 안전하게 작년 기준 3개년.
    const baseYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const years = [baseYear - 2, baseYear - 1, baseYear];

    // 1) NEIS에서 학교 코드 조회
    const info = await neisFetch("schoolInfo", { SCHUL_NM: data.schoolName });
    const rows = extractRows(info, "schoolInfo") as SchoolBasic[];
    const match =
      rows.find((r) => r.SCHUL_KND_SC_NM === data.level) ?? rows[0];
    if (!match) {
      return { ok: false as const, error: "학교를 찾지 못함", years };
    }

    // 2) NEIS 학생수 (학교현황) - 최근 자료
    let students: number | null = null;
    let classes: number | null = null;
    try {
      const stu = await neisFetch("schoolMajorinfo", {
        ATPT_OFCDC_SC_CODE: match.ATPT_OFCDC_SC_CODE,
        SD_SCHUL_CODE: match.SD_SCHUL_CODE,
      });
      const sRows = extractRows(stu, "schoolMajorinfo");
      if (sRows.length) {
        // best-effort
        students = sRows.reduce(
          (a: number, r: any) => a + (parseInt(r?.DGHT_CRSE_SC_NM ?? "0", 10) || 0),
          0,
        );
      }
    } catch {
      /* ignore */
    }

    // 3) 학교알리미 OpenAPI (공시정보) - apiType 56: 교과별(학년별) 평가계획에 따른 학업성취사항
    //    응답 XML에서 국/영/수 "보통학력이상" 비율을 파싱.
    const aliKey = process.env.NEIS_API_KEY || "3d026aef9591456c89de699fd4f0fc3d";
    const schulKnd = data.level === "고등학교" ? "04" : "03";
    const per: Record<number, { kor?: number; eng?: number; math?: number; avg?: number }> = {};
    for (const yr of years) {
      const url =
        `https://www.schoolinfo.go.kr/openApi.do?apiKey=${aliKey}` +
        `&apiType=56&pbanYr=${yr}&schulKndCode=${schulKnd}` +
        `&schulCode=${match.SD_SCHUL_CODE}`;
      try {
        const r = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 lovable" },
        });
        const xml = await r.text();
        const pick = (subjectRegex: RegExp) => {
          // <list>...<subject>국어</subject>...<rate>92.3</rate>...</list>
          const blocks = xml.split(/<\/?list>/i);
          for (const b of blocks) {
            if (subjectRegex.test(b)) {
              const m =
                b.match(/<NORMAL_RATE>([\d.]+)<\/NORMAL_RATE>/i) ??
                b.match(/<rate>([\d.]+)<\/rate>/i) ??
                b.match(/보통학력이상[^0-9]*([\d.]+)/);
              if (m) return parseFloat(m[1]) / 100;
            }
          }
          return undefined;
        };
        const kor = pick(/국어/);
        const eng = pick(/영어/);
        const math = pick(/수학/);
        const vals = [kor, eng, math].filter((x): x is number => typeof x === "number");
        per[yr] = {
          kor,
          eng,
          math,
          avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined,
        };
      } catch {
        per[yr] = {};
      }
    }

    return {
      ok: true as const,
      school: {
        name: match.SCHUL_NM,
        kind: match.SCHUL_KND_SC_NM,
        coedu: match.COEDU_SC_NM,
        address: match.ORG_RDNMA,
        homepage: match.HMPG_ADRES,
        founded: match.FOND_YMD,
        students,
        classes,
        code: match.SD_SCHUL_CODE,
      },
      years,
      achievement: years.map((y) => ({ year: y, ...per[y] })),
    };
  });
