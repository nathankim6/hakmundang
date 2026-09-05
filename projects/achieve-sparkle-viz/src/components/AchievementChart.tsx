import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { SchoolData, SCHOOL_ICONS } from "./SchoolForm";
import { Trophy, GraduationCap, Award, Sparkles, Loader2, AlertTriangle, TrendingDown } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { SCHOOL_LOGOS } from "@/data/schoolLogos";
import orunLogo from "@/assets/orun-academy-logo.jpg.asset.json";
import brainiacLogo from "@/assets/brainiac-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

interface AchievementChartProps {
  middleSchools: SchoolData[];
}

const GRADE_COLORS = {
  A: "hsl(220, 45%, 22%)",
  B: "hsl(155, 28%, 42%)",
  C: "hsl(265, 25%, 52%)",
  D: "hsl(22, 55%, 55%)",
  E: "hsl(355, 45%, 55%)",
};

const HIGH_SCHOOL_DATA = {
  "1등급": 10,
  "2등급": 24,
  "3등급": 32,
  "4등급": 24,
  "5등급": 10,
};

const HIGH_SCHOOL_COLORS = [
  "hsl(220, 45%, 22%)",
  "hsl(155, 28%, 42%)",
  "hsl(265, 25%, 52%)",
  "hsl(22, 55%, 55%)",
  "hsl(355, 45%, 55%)",
];

const GOLD = "#b08d4f";
const GOLD_LIGHT = "#d4b87a";

// A4 page wrapper — 210mm x 297mm at 96dpi ≈ 794 × 1123 px
const A4Page = ({
  children,
  pageNumber,
  total,
  eyebrow,
}: {
  children: ReactNode;
  pageNumber: number;
  total: number;
  eyebrow?: string;
}) => (
  <div
    data-a4-page
    className="a4-page relative bg-white mx-auto shadow-[0_8px_40px_-12px_rgba(28,25,23,0.18)] border border-stone-200/80 overflow-hidden"
    style={{ width: "794px", height: "1123px" }}
  >
    {/* page header rule */}
    <div className="absolute top-0 left-0 right-0 px-14 pt-8 flex items-center justify-between text-[10px] tracking-[0.35em] uppercase text-stone-400">
      <span className="font-medium" style={{ color: GOLD }}>
        The Achievement Report
      </span>
      <span>{eyebrow ?? ""}</span>
    </div>

    {/* content area */}
    <div className="absolute inset-0 px-14 pt-20 pb-16 flex flex-col">
      {children}
    </div>

    {/* page footer */}
    <div className="absolute bottom-0 left-0 right-0 px-14 pb-8 flex items-center text-[10px] tracking-[0.3em] uppercase text-stone-400">
      <span>{new Date().getFullYear()} Edition</span>
    </div>
  </div>
);

export const AchievementChart = ({ middleSchools }: AchievementChartProps) => {
  const filtered = middleSchools
    .filter((s) => s.name !== "신길중")
    .map((s) => ({ ...s, logoUrl: s.logoUrl || SCHOOL_LOGOS[s.name] }));
  const ranked = [...filtered].sort((a, b) => b.A - a.A);
  const avgRanked = [...filtered].sort(
    (a, b) => (b.averageScore || 0) - (a.averageScore || 0)
  );
  const stacked = filtered.map((s) => ({
    name: s.name,
    A: s.A,
    B: s.B,
    C: s.C,
    D: s.D,
    E: s.E,
  }));

  const totalPages = 8;

  // ─── District detection ───
  const SONGPA_SCHOOL_SET = new Set([
    "해누리중","방이중","세륜중","오주중","정신여중","가락중",
    "송파중","잠실중","방산중","가원중","한산중","잠실여중","오륜중",
  ]);
  const isSongpa = middleSchools.some((s) => SONGPA_SCHOOL_SET.has(s.name));
  const districtName = isSongpa ? "송파구" : "동작구";
  const districtArea = isSongpa ? "11710" : "11590";

  // ─── E-grade comparison data (Chapter Ⅶ) ───
  const DONGJAK_E_ROWS: { name: string; E: number }[] = [
    { name: "숭의여중", E: 4.2 },
    { name: "장승중", E: 19.7 },
    { name: "성남중", E: 26.6 },
    { name: "강현중", E: 26.8 },
    { name: "영등포중", E: 33.8 },
    { name: "중대부중", E: 29.3 },
    { name: "국사봉중", E: 18.3 },
    { name: "문창중", E: 53.6 },
  ];
  const [songpaERows, setSongpaERows] = useState<{ name: string; E: number }[]>([]);
  const [eLoading, setELoading] = useState(false);

  useEffect(() => {
    if (!isSongpa) return;
    let cancelled = false;
    (async () => {
      setELoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("fetch-apt2me-grades", {
          body: { area: "11710", year: "2025", grade: "3", term: "1", subject: "영어" },
        });
        if (error) throw error;
        const list = (data?.schools || []) as Array<{ name: string; E?: number }>;
        const rows = list
          .filter((s) => SONGPA_SCHOOL_SET.has(s.name))
          .map((s) => ({ name: s.name, E: Number(s.E ?? NaN) }));
        if (!cancelled) setSongpaERows(rows);
      } catch (e) {
        console.error("Songpa E-grade fetch failed", e);
      } finally {
        if (!cancelled) setELoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isSongpa]);

  // ─── Songpa high-school 5-year trend (Chapter Ⅵ) ───
  type TrendRow = { name: string; type: string; years: (number | null)[]; avg5: number | null; trend: string; trendKind: string };
  const [songpaTrend, setSongpaTrend] = useState<TrendRow[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  useEffect(() => {
    if (!isSongpa) return;
    let cancelled = false;
    (async () => {
      setTrendLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("fetch-apt2me-trend", {
          body: { area: "11710", gubun: "03" },
        });
        if (error) throw error;
        const list = (data?.schools || []) as TrendRow[];
        if (!cancelled) setSongpaTrend(list);
      } catch (e) {
        console.error("Songpa trend fetch failed", e);
      } finally {
        if (!cancelled) setTrendLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isSongpa]);


  const eRows = isSongpa ? songpaERows : DONGJAK_E_ROWS;

  const sortedE = useMemo(
    () => [...eRows].sort((a, b) => (isNaN(b.E) ? -1 : isNaN(a.E) ? 1 : b.E - a.E)),
    [eRows]
  );
  const maxE = useMemo(
    () => Math.max(...eRows.filter((r) => !isNaN(r.E)).map((r) => r.E), 50),
    [eRows]
  );
  const avgE = useMemo(() => {
    const valid = eRows.filter((r) => !isNaN(r.E));
    return valid.length ? valid.reduce((s, r) => s + r.E, 0) / valid.length : 0;
  }, [eRows]);


  // 동작구 특목·자사고 진학현황 (2025) — apt2.me 출처
  const SPECIAL_HS_DATA = [
    { name: "중대부중", fullName: "중앙대학교사범대학부속중학교", dong: "흑석동", pct: 16.3, advanced: 32, total: 196, sci: 1, intl: 5, auto: 26, gifted: 0 },
    { name: "상현중", fullName: "상현중학교", dong: "상도동", pct: 13.7, advanced: 22, total: 161, sci: 3, intl: 4, auto: 15, gifted: 0 },
    { name: "동양중", fullName: "동양중학교", dong: "본동", pct: 13.3, advanced: 14, total: 105, sci: 3, intl: 0, auto: 11, gifted: 0 },
    { name: "숭의여중", fullName: "숭의여자중학교", dong: "대방동", pct: 12.6, advanced: 19, total: 151, sci: 1, intl: 7, auto: 11, gifted: 0 },
    { name: "장승중", fullName: "장승중학교", dong: "장승배기", pct: 7.7, advanced: 14, total: 183, sci: 2, intl: 3, auto: 9, gifted: 0 },
    { name: "동작중", fullName: "동작중학교", dong: "동작동", pct: 6.7, advanced: 7, total: 104, sci: 2, intl: 1, auto: 4, gifted: 0 },
    { name: "상도중", fullName: "상도중학교", dong: "사당5동", pct: 6.6, advanced: 9, total: 137, sci: 1, intl: 1, auto: 5, gifted: 2 },
    { name: "강남중", fullName: "강남중학교", dong: "대방동", pct: 5.3, advanced: 5, total: 95, sci: 0, intl: 0, auto: 5, gifted: 0 },
    { name: "국사봉중", fullName: "국사봉중학교", dong: "상도4동", pct: 4.3, advanced: 5, total: 115, sci: 0, intl: 2, auto: 2, gifted: 1 },
    { name: "문창중", fullName: "문창중학교", dong: "신대방동", pct: 3.6, advanced: 4, total: 110, sci: 0, intl: 1, auto: 2, gifted: 1 },
    { name: "대방중", fullName: "대방중학교", dong: "신대방동", pct: 3.5, advanced: 8, total: 226, sci: 1, intl: 2, auto: 5, gifted: 0 },
    { name: "사당중", fullName: "사당중학교", dong: "사당동", pct: 2.9, advanced: 5, total: 170, sci: 0, intl: 0, auto: 4, gifted: 1 },
    { name: "성남중", fullName: "성남중학교", dong: "대방동", pct: 2.2, advanced: 4, total: 178, sci: 0, intl: 0, auto: 4, gifted: 0 },
    { name: "강현중", fullName: "강현중학교", dong: "상도동", pct: 1.7, advanced: 2, total: 121, sci: 1, intl: 0, auto: 1, gifted: 0 },
    { name: "영등포중", fullName: "영등포중학교", dong: "대방동", pct: 1.4, advanced: 1, total: 70, sci: 0, intl: 0, auto: 0, gifted: 1 },
    { name: "남성중", fullName: "남성중학교", dong: "남부순환로", pct: 0.0, advanced: 0, total: 76, sci: 0, intl: 0, auto: 0, gifted: 0 },
  ];

  // 송파구 특목·자사·영재고 진학현황 (apt2.me middle2.jsp)
  type SpecialRow = { name: string; fullName: string; dong: string; pct: number; advanced: number; total: number; sci: number; intl: number; auto: number; gifted: number };
  const [songpaSpecial, setSongpaSpecial] = useState<SpecialRow[]>([]);
  const [specialLoading, setSpecialLoading] = useState(false);
  useEffect(() => {
    if (!isSongpa) return;
    let cancelled = false;
    (async () => {
      setSpecialLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("fetch-apt2me-middle2", {
          body: { area: "11710", year: "2025" },
        });
        if (error) throw error;
        const list = (data?.schools || []) as SpecialRow[];
        if (!cancelled) setSongpaSpecial(list);
      } catch (e) {
        console.error("Songpa middle2 fetch failed", e);
      } finally {
        if (!cancelled) setSpecialLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isSongpa]);

  const SPECIAL_DATA = isSongpa ? songpaSpecial : SPECIAL_HS_DATA;
  const userSchoolNames = new Set(middleSchools.map((s) => s.name));
  const specialMaxPct = Math.max(...SPECIAL_DATA.map((s) => s.pct), 1);


  // name → logoUrl map (only from user-uploaded data)
  const logoMap = new Map<string, string | undefined>(
    filtered.map((s) => [s.name, s.logoUrl])
  );

  // Reusable small circular school badge with logo or fallback initial
  const SchoolMark = ({
    name,
    size = 18,
  }: {
    name: string;
    size?: number;
  }) => {
    const url = logoMap.get(name);
    return (
      <span
        className="inline-flex items-center justify-center rounded-full overflow-hidden border shrink-0"
        style={{
          width: size,
          height: size,
          borderColor: "#E8DCC4",
          background: "linear-gradient(180deg,#fdfbf6,#f5ecda)",
        }}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span
            className="font-serif leading-none"
            style={{ color: GOLD, fontSize: Math.round(size * 0.55) }}
          >
            {name.charAt(0)}
          </span>
        )}
      </span>
    );
  };

  // Custom YAxis tick — renders logo + name for the stacked bar chart
  const LogoYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const name: string = payload.value;
    const url = logoMap.get(name);
    const r = 9;
    const cx = -88;
    return (
      <g transform={`translate(${x},${y})`}>
        <defs>
          <clipPath id={`clip-${name}`}>
            <circle cx={cx} cy={0} r={r} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={0} r={r} fill="#fdfbf6" stroke="#E8DCC4" strokeWidth={0.75} />
        {url ? (
          <image
            href={url}
            x={cx - r}
            y={-r}
            width={r * 2}
            height={r * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${name})`}
          />
        ) : (
          <text
            x={cx}
            y={3}
            textAnchor="middle"
            fontSize={9}
            fill={GOLD}
            style={{ fontFamily: "serif" }}
          >
            {name.charAt(0)}
          </text>
        )}
        <text
          x={cx + r + 6}
          y={4}
          fontSize={11}
          fill="#1c1917"
          style={{ fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif" }}
        >
          {name}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-stone-200 rounded-sm p-3 shadow-2xl">
          <p className="font-medium text-stone-900 mb-2 text-sm">
            {payload[0].payload.name}
          </p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-xs flex items-center gap-2 text-stone-600">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
              <span className="ml-auto font-semibold text-stone-900">
                {entry.value?.toFixed(1)}%
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ComingSoon = ({ chapter, en, title }: { chapter: string; en: string; title: string }) => (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="italic text-sm" style={{ color: GOLD }}>{`Chapter ${chapter}`}</span>
          <span className="h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">{en}</span>
        </div>
        <h2 className="text-4xl font-light text-stone-900 tracking-tight">
          {districtName} <span className="italic">{title}</span>
        </h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full border flex items-center justify-center mb-6" style={{ borderColor: "#E8DCC4", background: "linear-gradient(180deg,#fdfbf6,#f5ecda)" }}>
          <Sparkles className="w-8 h-8" style={{ color: GOLD }} />
        </div>
        <div className="text-[10px] tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>Coming Soon</div>
        <h3 className="text-2xl font-light text-stone-900 mb-2">데이터 준비 중</h3>
        <p className="text-sm text-stone-500 max-w-xs leading-relaxed">
          {districtName} 데이터는 현재 수집·정리 중입니다.<br/>다음 에디션에서 공개됩니다.
        </p>
      </div>
    </>
  );


  return (
    <div className="space-y-8 py-4">
      {/* ─────── PAGE 1 — COVER ─────── */}
      <A4Page pageNumber={1} total={totalPages}>
        <div className="flex-1 flex flex-col items-center justify-center text-center">

          <img
            src={isSongpa ? brainiacLogo.url : orunLogo.url}
            alt={isSongpa ? "브래니악 영어학원" : "ORUN ACADEMY"}
            className="h-16 object-contain mb-8"
          />

          <h1 className="text-6xl font-light text-stone-900 leading-[1.05] tracking-tight mb-4">
            성적 분포
          </h1>
          <div
            className="italic text-3xl font-light mb-4"
            style={{ color: GOLD }}
          >
            &amp;
          </div>
          <h1 className="text-6xl font-light text-stone-900 leading-[1.05] tracking-tight mb-12">
            학교 비교 분석
          </h1>

          <div className="max-w-sm mx-auto mb-16">
            <p className="text-stone-500 text-base leading-relaxed whitespace-pre-line">
              {`${isSongpa ? "브래니악 영어학원이" : "옳은영어가"} ${districtName} 관내\u00a0학교의 등급 분포와\u00a0\n평균 점수를 정량적으로 비교한\n교육 분석 리포트입니다.`}
            </p>
          </div>


          <div className="inline-flex items-stretch divide-x divide-stone-200 border-y-2 border-stone-900/90">
            {[
              { label: "Schools", value: String(middleSchools.length).padStart(2, "0") },
              { label: "Chapters", value: "Ⅳ" },
              { label: "Edition", value: String(new Date().getFullYear()) },
            ].map((s) => (
              <div key={s.label} className="px-10 py-5 text-center">
                <div className="text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-2">
                  {s.label}
                </div>
                <div className="text-3xl font-light text-stone-900">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </A4Page>

      {/* ─────── PAGE 2 — A등급 랭킹 ─────── */}
      <A4Page pageNumber={2} total={totalPages} eyebrow="Chapter Ⅰ">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="italic text-sm" style={{ color: GOLD }}>
              Chapter Ⅰ
            </span>
            <span
              className="h-px w-16"
              style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
            />
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">
              Top Achievement Index
            </span>
          </div>
          <h2 className="text-4xl font-light text-stone-900 tracking-tight">
            A등급 <span className="italic">랭킹</span>
          </h2>
        </div>

        <div className="flex-1 flex flex-col divide-y divide-stone-200 border-y border-stone-200/80 overflow-hidden">
          {ranked.map((s, i) => {
            const Icon = SCHOOL_ICONS[s.icon];
            const isTop = i === 0;
            return (
              <div
                key={s.name}
                className="flex-1 grid grid-cols-[40px_44px_1fr_auto] items-center gap-4 px-1"
              >
                <div className="italic text-xl text-stone-300 leading-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border"
                  style={{ borderColor: "#E8DCC4", background: "linear-gradient(180deg,#fdfbf6,#f5ecda)" }}
                >
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <span
                      className="font-serif text-[15px] leading-none"
                      style={{ color: GOLD }}
                    >
                      {s.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3
                      className={`${isTop ? "text-lg" : "text-base"} font-normal text-stone-900 truncate`}
                    >
                      {s.name}
                    </h3>
                    {i === 0 && <Trophy className="w-3.5 h-3.5" style={{ color: GOLD }} />}
                    {i === 1 && <Award className="w-3.5 h-3.5 text-stone-400" />}
                    {i === 2 && <Award className="w-3.5 h-3.5" style={{ color: "#b87333" }} />}
                  </div>
                  <div className="relative h-[2px] bg-stone-100 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${s.A}%`,
                        background: isTop
                          ? `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`
                          : i < 3
                          ? "linear-gradient(90deg, #57534e, #a8a29e)"
                          : "linear-gradient(90deg, #d6d3d1, #e7e5e4)",
                      }}
                    />
                  </div>
                </div>
                <div className="text-right pl-3">
                  <span
                    className="text-2xl font-normal"
                    style={{ color: isTop ? GOLD : "#1c1917" }}
                  >
                    {s.A.toFixed(1)}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 ml-1">
                    %
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </A4Page>

      {/* ─────── PAGE 3 — 평균 점수 ─────── */}
      <A4Page pageNumber={3} total={totalPages} eyebrow="Chapter Ⅱ">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="italic text-sm" style={{ color: GOLD }}>
              Chapter Ⅱ
            </span>
            <span
              className="h-px w-16"
              style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
            />
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">
              Average Score Ledger
            </span>
          </div>
          <h2 className="text-4xl font-light text-stone-900 tracking-tight">
            평균 점수 <span className="italic">비교</span>
          </h2>
          <p className="italic text-stone-500 mt-2 text-sm">
            {"\n"}
          </p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-stone-900">
              <th className="py-3 text-left text-[10px] font-semibold text-stone-500 uppercase tracking-[0.25em] w-12">
                №
              </th>
              <th className="py-3 text-left text-[10px] font-semibold text-stone-500 uppercase tracking-[0.25em]">
                SCHOOL
              </th>
              <th className="py-3 text-right text-[10px] font-semibold text-stone-500 uppercase tracking-[0.25em]">
                Average
              </th>
            </tr>
          </thead>
          <tbody>
            {avgRanked.map((s, i) => {
              const Icon = SCHOOL_ICONS[s.icon];
              return (
                <tr key={s.name} className="border-b border-stone-200/80">
                  <td className="py-2">
                    <span className="italic text-base text-stone-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden border shrink-0"
                        style={{ borderColor: "#E8DCC4", background: "linear-gradient(180deg,#fdfbf6,#f5ecda)" }}
                      >
                        {s.logoUrl ? (
                          <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif text-[12px] leading-none" style={{ color: GOLD }}>
                            {s.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-[15px] text-stone-900">{s.name}</span>
                      {i === 0 && <Trophy className="w-3 h-3" style={{ color: GOLD }} />}
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className="text-xl font-normal"
                      style={{ color: i === 0 ? GOLD : "#1c1917" }}
                    >
                      {s.averageScore ? s.averageScore.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 ml-1.5">
                      pt
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </A4Page>

      {/* ─────── PAGE 4 — 등급 분포 ─────── */}
      <A4Page pageNumber={4} total={totalPages} eyebrow="Chapter Ⅲ">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="italic text-sm" style={{ color: GOLD }}>
              Chapter Ⅲ
            </span>
            <span
              className="h-px w-16"
              style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
            />
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">
              Distribution Spectrum
            </span>
          </div>
          <h2 className="text-4xl font-light text-stone-900 tracking-tight">
            등급 분포 <span className="italic">비교</span>
          </h2>
          <p className="italic text-stone-500 mt-2 text-sm">
            A through E composition per school
          </p>
        </div>

        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stacked}
              layout="vertical"
              barSize={Math.max(14, Math.min(28, 320 / middleSchools.length))}
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="1 4" stroke="#e7e5e4" horizontal={false} />
              <XAxis
                type="number"
                stroke="#a8a29e"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#78716c"
                width={108}
                interval={0}
                tick={<LogoYAxisTick />}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(168,162,158,0.08)" }} />
              {(["A", "B", "C", "D", "E"] as const).map((g, i, arr) => (
                <Bar
                  key={g}
                  dataKey={g}
                  stackId="a"
                  fill={GRADE_COLORS[g]}
                  radius={
                    i === 0 ? [2, 0, 0, 2] : i === arr.length - 1 ? [0, 2, 2, 0] : [0, 0, 0, 0]
                  }
                >
                  <LabelList
                    dataKey={g}
                    position="center"
                    fill="white"
                    fontWeight="500"
                    fontSize={10}
                    formatter={(v: number) => (v > 8 ? `${v.toFixed(0)}` : "")}
                    style={{ fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif" }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-stone-200/80">
          {Object.entries(GRADE_COLORS).map(([grade, color]) => (
            <div key={grade} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-sm text-stone-700">{grade}</span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400">grade</span>
            </div>
          ))}
        </div>
      </A4Page>

      {/* ─────── PAGE 5 — 고등학교 기준 ─────── */}
      <A4Page pageNumber={5} total={totalPages} eyebrow="Chapter Ⅳ">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="italic text-sm" style={{ color: GOLD }}>
                Chapter Ⅳ
              </span>
              <span
                className="h-px w-16"
                style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
              />
              <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">
                Standard Distribution
              </span>
            </div>
            <h2 className="text-4xl font-light text-stone-900 tracking-tight">
              고등학교 <span className="italic">등급 기준</span>
            </h2>
            <p className="italic text-stone-500 mt-2 text-sm">
              Reference percentiles by national standard
            </p>
          </div>
          <GraduationCap className="w-7 h-7 text-stone-300" />
        </div>

        <div className="grid grid-cols-5 divide-x divide-stone-200/80 border-y border-stone-200/80">
          {[
            { grade: "1등급", value: HIGH_SCHOOL_DATA["1등급"], color: HIGH_SCHOOL_COLORS[0], desc: "최상위", range: "~4%" },
            { grade: "2등급", value: HIGH_SCHOOL_DATA["2등급"], color: HIGH_SCHOOL_COLORS[1], desc: "상위", range: "4~11%" },
            { grade: "3등급", value: HIGH_SCHOOL_DATA["3등급"], color: HIGH_SCHOOL_COLORS[2], desc: "중위", range: "11~23%" },
            { grade: "4등급", value: HIGH_SCHOOL_DATA["4등급"], color: HIGH_SCHOOL_COLORS[3], desc: "중하위", range: "23~40%" },
            { grade: "5등급", value: HIGH_SCHOOL_DATA["5등급"], color: HIGH_SCHOOL_COLORS[4], desc: "하위", range: "40~60%" },
          ].map((item, idx) => (
            <div key={item.grade} className="py-8 px-2 text-center">
              <div className="italic text-xs text-stone-400 mb-3">№ 0{idx + 1}</div>
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle cx="40" cy="40" r="34" stroke="#e7e5e4" strokeWidth="2" fill="none" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={item.color}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${(item.value / 100) * 213.6} 213.6`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-normal" style={{ color: item.color }}>
                    {item.value}
                  </span>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400">%</span>
                </div>
              </div>
              <div className="text-base text-stone-900">{item.grade}</div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mt-1">
                {item.desc}
              </div>
              <div className="mt-2 inline-block px-2 py-0.5 text-[10px] tracking-wider text-stone-500 border border-stone-200">
                {item.range}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pl-5 border-l-2" style={{ borderColor: GOLD }}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-2">
            <br />
          </div>
          <p className="text-stone-700 text-sm leading-relaxed">
            고등학교 내신 등급은 전체 응시자 중 상위 백분율에 따라 1~5등급으로 구분됩니다.
            상위 10%까지 1등급, 상위 34%까지 2등급, 상위 66%까지 3등급, 상위 90%까지 4등급, 그 이하는 5등급으로 배정됩니다.
          </p>
        </div>

        <div className="mt-8 pl-5 border-l-2" style={{ borderColor: "#b08080" }}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-2">
            <br />
          </div>
          <p className="text-stone-700 text-sm leading-relaxed">
            중학교 A등급은 반드시 고등 내신 1등급으로 이어지지 않습니다. 동작구 중학생의 평균 30~40%가 A등급을 받지만, 고등 내신에서는 상위 10%만이 1등급을 받을 수 있습니다.&nbsp; 중학교에서 A등급을 받았던 학생 중 과반 수 이상은&nbsp; 필연적으로 고등학교에서 2등급 또는 3등급을 받을 수 밖에 없습니다. 고등은 상대평가로 내신 성적이 백분위 기준으로 산출되기 때문입니다.
          </p>
        </div>

      </A4Page>

      {/* ─────── PAGE 6 — 동작구 특목·자사고 진학 현황 ─────── */}
      <A4Page pageNumber={6} total={totalPages} eyebrow="Chapter Ⅴ">
        {isSongpa && specialLoading && SPECIAL_DATA.length === 0 ? (
          <>
            <ComingSoon chapter="Ⅴ" en="Elite High-School Admissions" title="특목·자사·영재고 진학 현황" />
          </>
        ) : (<>


        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="italic text-sm" style={{ color: GOLD }}>
              Chapter Ⅴ
            </span>
            <span
              className="h-px w-16"
              style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
            />
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">
              Elite High-School Admissions
            </span>
          </div>
          <h2 className="text-4xl font-light text-stone-900 tracking-tight">
            {districtName} <span className="italic">특목·자사·영재고&nbsp;</span> 진학 현황
          </h2>
          <p className="italic text-stone-500 mt-2 text-sm">
            2025년 졸업생 기준
          </p>
        </div>

        {/* Aggregate strip — 4 categories */}
        {(() => {
          const totalGrad = SPECIAL_DATA.reduce((a, s) => a + s.total, 0);
          const totalSci = SPECIAL_DATA.reduce((a, s) => a + s.sci, 0);
          const totalGifted = SPECIAL_DATA.reduce((a, s) => a + s.gifted, 0);
          const totalIntl = SPECIAL_DATA.reduce((a, s) => a + s.intl, 0);
          const totalAuto = SPECIAL_DATA.reduce((a, s) => a + s.auto, 0);
          return (
            <div className="grid grid-cols-4 divide-x divide-stone-200 border-y-2 border-stone-900/90 mb-5">
              {[
                { ko: "과학고", en: "Science", count: totalSci },
                { ko: "영재고", en: "Gifted", count: totalGifted },
                { ko: "외고·국제고", en: "Intl / Foreign", count: totalIntl },
                { ko: "자사고", en: "Autonomous", count: totalAuto },
              ].map((c) => (
                <div key={c.ko} className="px-3 py-4 text-center">
                  <div className="text-[10px] tracking-[0.3em] uppercase font-medium mb-1.5" style={{ color: GOLD }}>
                    {c.en}
                  </div>
                  <div className="text-2xl font-light text-stone-900 leading-none">
                    {c.count}
                    <span className="text-xs text-stone-400 ml-1">명</span>
                  </div>
                  <div className="text-[10px] tracking-[0.2em] text-stone-500 mt-1.5">
                    {c.ko}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* 4 Category cards — split by 과학고 / 영재고 / 외고·국제고 / 자사고 */}
        {(() => {
          const categories = [
            { ko: "과학고", en: "Science Schools", key: "sci" as const },
            { ko: "영재고", en: "Gifted Schools", key: "gifted" as const },
            { ko: "외고·국제고", en: "Intl / Foreign Lang", key: "intl" as const },
            { ko: "자사고", en: "Autonomous Private", key: "auto" as const },
          ];
          return (
            <div className="flex-1 grid grid-cols-2 gap-4">
              {categories.map((cat) => {
                const ranked = [...SPECIAL_DATA]
                  .map((s) => ({ ...s, count: s[cat.key] }))
                  .filter((s) => s.count > 0)
                  .sort((a, b) => b.count - a.count || b.pct - a.pct)
                  .slice(0, 10);
                return (
                  <div
                    key={cat.ko}
                    className="flex flex-col border-t-2 px-4 pt-3 pb-2 relative"
                    style={{
                      borderColor: GOLD,
                      background: "linear-gradient(180deg, #fdfbf7 0%, #ffffff 60%)",
                    }}
                  >
                    <div className="mb-2 flex items-end justify-between">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-stone-900 leading-none">
                          {cat.ko}
                        </h3>
                        <p className="text-[8px] tracking-[0.25em] uppercase font-semibold mt-1" style={{ color: GOLD }}>
                          {cat.en}
                        </p>
                      </div>
                      <span className="italic text-[10px] text-stone-400">Top {ranked.length}</span>
                    </div>
                    <ul className="flex-1 flex flex-col justify-between gap-0">
                      {ranked.length === 0 && (
                        <li className="text-[10px] italic text-stone-400 text-center py-4">
                          진학 실적 없음
                        </li>
                      )}
                      {ranked.map((s, i) => (
                        <li
                          key={s.fullName}
                          className="flex justify-between items-center border-b py-1"
                          style={{ borderColor: "#F2E6D5" }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="italic text-[9px] text-stone-300 tabular-nums w-4">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <SchoolMark name={s.name} size={14} />
                            <span className="text-[11px] text-stone-700 truncate">{s.name}</span>
                          </div>
                          <span
                            className="font-serif font-bold text-sm leading-none tabular-nums shrink-0 ml-2"
                            style={{ color: GOLD }}
                          >
                            {s.count}
                            <span className="text-[8px] text-stone-400 font-sans font-normal ml-0.5">명</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center text-[10px] tracking-[0.2em] uppercase text-stone-500">
          <span>학교별 진학 인원 기준 · 상위 10개교</span>
        </div>
        </>)}
      </A4Page>


      {/* ─────── PAGE 7 — 5년 성취도 추이 (Chapter Ⅵ) ─────── */}
      <A4Page pageNumber={7} total={totalPages} eyebrow="Chapter Ⅵ">
        {(() => {
          const DONGJAK_TREND = [
            { rank: 1, name: "상현중", type: "공립", dong: "상도동", y: [39.1, 28.7, 39.0, 48.5, 51.7], avg5: 41.4, trend: "▲▲ 연속상승", trendKind: "up2", korA: 55.8, mathA: 55.6, engA: 60.9, mathE: 18.4, best: 2025 },
            { rank: 2, name: "남성중", type: "공립", dong: "남부순환로", y: [22.3, 24.4, 40.2, 39.5, 41.9], avg5: 33.7, trend: "▲ 반등", trendKind: "up", korA: 52.9, mathA: 60.0, engA: 44.7, mathE: 28.9, best: 2025 },
            { rank: 3, name: "상도중", type: "공립", dong: "사당5동", y: [38.1, 23.8, 33.3, 36.3, 39.2], avg5: 34.1, trend: "▲▲ 연속상승", trendKind: "up2", korA: 42.1, mathA: 49.3, engA: 45.7, mathE: 20.5, best: 2025 },
            { rank: 4, name: "숭의여중", type: "사립", dong: "대방동", y: [40.8, 27.5, 44.2, 36.8, 38.1], avg5: 37.5, trend: "▲ 반등", trendKind: "up", korA: 64.8, mathA: 33.1, engA: 62.7, mathE: 25.9, best: 2023 },
            { rank: 5, name: "사당중", type: "공립", dong: "사당동", y: [32.3, 24.6, 28.7, 37.7, 37.4], avg5: 32.1, trend: "▼ 하락", trendKind: "down", korA: 42.2, mathA: 47.3, engA: 45.3, mathE: 27.7, best: 2024 },
            { rank: 6, name: "장승중", type: "공립", dong: "장승배기", y: [31.3, 28.9, 40.3, 38.1, 37.3], avg5: 35.2, trend: "▼▼ 연속하락", trendKind: "down2", korA: 37.9, mathA: 51.0, engA: 52.4, mathE: 31.0, best: 2023 },
            { rank: 7, name: "대방중", type: "공립", dong: "신대방동", y: [36.0, 28.8, 36.3, 30.7, 36.0], avg5: 33.6, trend: "▲ 반등", trendKind: "up", korA: 46.3, mathA: 37.4, engA: 59.3, mathE: 28.3, best: 2023 },
            { rank: 8, name: "동양중", type: "사립", dong: "본동", y: [34.7, 30.2, 35.1, 35.0, 35.6], avg5: 34.1, trend: "▲ 반등", trendKind: "up", korA: 45.5, mathA: 30.9, engA: 54.5, mathE: 31.4, best: 2025 },
            { rank: 9, name: "강현중", type: "공립", dong: "상도동", y: [28.7, 24.2, 32.4, 35.6, 33.6], avg5: 30.9, trend: "▼ 하락", trendKind: "down", korA: 35.0, mathA: 38.2, engA: 43.1, mathE: 37.8, best: 2024 },
            { rank: 10, name: "동작중", type: "공립", dong: "동작동", y: [31.8, 31.8, 33.9, 38.2, 33.4], avg5: 33.8, trend: "▼ 하락", trendKind: "down", korA: 39.5, mathA: 41.1, engA: 46.5, mathE: 39.2, best: 2024 },
            { rank: 11, name: "성남중", type: "사립", dong: "대방동", y: [29.2, 25.3, 31.1, 29.3, 33.4], avg5: 29.7, trend: "▲ 반등", trendKind: "up", korA: 50.8, mathA: 39.6, engA: 32.2, mathE: 39.3, best: 2025 },
            { rank: 12, name: "중대부중", type: "사립", dong: "흑석동", y: [37.3, 26.1, 30.4, 30.4, 31.4], avg5: 31.1, trend: "▲ 상승", trendKind: "up", korA: 45.0, mathA: 46.0, engA: 42.2, mathE: 29.9, best: 2021 },
            { rank: 13, name: "강남중", type: "공립", dong: "대방동", y: [33.9, 23.2, 36.7, 38.6, 31.3], avg5: 32.7, trend: "▼ 하락", trendKind: "down", korA: 38.0, mathA: 39.6, engA: 41.3, mathE: 42.2, best: 2024 },
            { rank: 14, name: "국사봉중", type: "공립", dong: "상도4동", y: [23.1, 19.2, 32.2, 33.0, 27.8], avg5: 27.0, trend: "▼ 하락", trendKind: "down", korA: 46.7, mathA: 30.5, engA: 34.7, mathE: 45.8, best: 2024 },
            { rank: 15, name: "영등포중", type: "공립", dong: "대방동", y: [28.4, 28.1, 26.1, 31.0, 25.5], avg5: 27.8, trend: "▼ 하락", trendKind: "down", korA: 27.8, mathA: 33.3, engA: 32.5, mathE: 44.4, best: 2024 },
            { rank: 16, name: "문창중", type: "공립", dong: "신대방동", y: [28.6, 26.3, 28.7, 30.1, 25.4], avg5: 27.8, trend: "▼ 하락", trendKind: "down", korA: 53.6, mathA: 37.6, engA: 19.7, mathE: 41.7, best: 2024 },
          ];

          const SONGPA_TREND = songpaTrend.map((s, i) => {
            const ys = s.years.map((v) => (v == null || isNaN(v) ? 0 : v));
            return {
              rank: i + 1,
              name: s.name,
              type: s.type || "",
              dong: "",
              y: ys,
              avg5: s.avg5 ?? 0,
              trend: s.trend,
              trendKind: s.trendKind,
              korA: 0, mathA: 0, engA: 0, mathE: 0, best: 2025,
            };
          });

          const TREND_DATA = isSongpa ? SONGPA_TREND : DONGJAK_TREND;



          const trendColor = (k: string) =>
            k === "up2" ? GOLD : k === "up" ? "#6b8e6b" : k === "down" ? "#b08080" : "#9a6f6f";

          const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
            const W = 120, H = 28, P = 2;
            const max = Math.max(...data, 55);
            const min = Math.min(...data, 15);
            const range = Math.max(max - min, 1);
            const pts = data.map((v, i) => {
              const x = P + (i * (W - 2 * P)) / (data.length - 1);
              const y = H - P - ((v - min) / range) * (H - 2 * P);
              return [x, y] as const;
            });
            const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
            const areaD = `${d} L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z`;
            return (
              <svg width={W} height={H} className="overflow-visible">
                <path d={areaD} fill={color} opacity={0.08} />
                <path d={d} stroke={color} strokeWidth={1.2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 1.8 : 1} fill={i === pts.length - 1 ? color : "#fff"} stroke={color} strokeWidth={0.8} />
                ))}
              </svg>
            );
          };

          return (
            <>
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="italic text-sm" style={{ color: GOLD }}>Chapter Ⅵ</span>
                  <span className="h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">Five-Year Achievement Trend</span>
                </div>
                <h2 className="text-3xl font-light text-stone-900 tracking-tight font-serif">
                  {isSongpa ? "중학교" : "중학교"} 학업성취도평가&nbsp;&nbsp;<span className="italic">A등급</span>&nbsp; 5년 추이
                </h2>
                <p className="italic text-stone-500 mt-1.5 text-xs">
                  2021 – 2025&nbsp; {isSongpa ? "송파구 관내 중학교" : "국·영·수 학업성취도 평가"}에서 최상위 A등급을 받은 학생의 비율입니다.&nbsp;&nbsp;
                </p>
              </div>

              {/* Year axis */}
              <div className="flex justify-end mb-2">
                <div className="grid grid-cols-5 gap-0 w-[120px] text-[8px] tracking-[0.15em] text-stone-400 text-center">
                  {[2021, 2022, 2023, 2024, 2025].map((y) => <span key={y}>{String(y).slice(2)}</span>)}
                </div>
              </div>

              {/* Two-column trend grid */}
              {isSongpa && trendLoading && TREND_DATA.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-stone-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />데이터를 불러오는 중…
                </div>
              ) : isSongpa && TREND_DATA.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
                  데이터를 불러올 수 없습니다.
                </div>
              ) : (
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-0 border-t border-stone-200/80">
                {TREND_DATA.map((s) => {
                  const color = trendColor(s.trendKind);
                  return (
                    <div
                      key={s.name}
                      className="grid grid-cols-[20px_20px_1fr_120px_56px] items-center gap-2 py-[7px] border-b border-stone-100"
                    >
                      <span className="italic text-[10px] text-stone-300 tabular-nums text-right">
                        {String(s.rank).padStart(2, "0")}
                      </span>
                      <SchoolMark name={s.name} size={18} />
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[12px] text-stone-900 truncate font-medium">{s.name}</span>
                        <span className="text-[8px] tracking-[0.15em] text-stone-400">{s.type}</span>
                      </div>
                      <div className="flex justify-end">
                        <Sparkline data={s.y} color={color} />
                      </div>
                      <div className="text-right leading-tight">
                        <div className="font-serif text-sm tabular-nums" style={{ color }}>
                          {s.y[4].toFixed(1)}
                        </div>
                        <div className="text-[8px] tracking-wider" style={{ color }}>
                          {s.trend}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Legend */}
              <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[9px] tracking-[0.2em] uppercase text-stone-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-[2px]" style={{ background: GOLD }} />연속상승
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-[2px]" style={{ background: "#6b8e6b" }} />반등·상승
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-[2px]" style={{ background: "#b08080" }} />하락
                  </span>
                </div>
              </div>

            </>
          );
        })()}
      </A4Page>


      {/* ─────── PAGE 8 — E등급 비율 비교 (Chapter Ⅶ) ─────── */}
      <A4Page pageNumber={8} total={totalPages} eyebrow="Chapter Ⅶ">
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="italic text-sm" style={{ color: GOLD }}>Chapter Ⅶ</span>
            <span className="h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-medium">E-Grade Ratio Comparison</span>
          </div>
          <h2 className="text-3xl font-light text-stone-900 tracking-tight font-serif">
            {isSongpa ? "학업성취도 평가\u00a0\u00a0E등급 비율 비교" : `${districtName} ${eRows.length || 0}개 중학교 E등급 비율 비교`}
          </h2>
          <p className="italic text-stone-500 mt-1.5 text-xs">
            각 학교의 중학교 3학년 1학기 영어과목 성취도를 기준으로 비교한 데이터입니다.
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            성취도 점수는 학교별로 서로 다른 평가기준으로 계산됩니다.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5 py-3 px-4 border border-stone-200/80 rounded-sm" style={{ background: "linear-gradient(180deg, #fdfbf7 0%, #ffffff 60%)" }}>
          <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "#E8DCC4", background: "linear-gradient(180deg,#fdfbf6,#f5ecda)" }}>
            <TrendingDown className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div>
            <div className="text-[9px] tracking-[0.2em] uppercase text-stone-400 font-semibold">평균 E등급 비율</div>
            <div className="text-xl font-black text-stone-900 tabular-nums">{avgE.toFixed(1)}%</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          {eLoading && eRows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              데이터를 불러오는 중…
            </div>
          ) : (
            <div className="space-y-3.5">
              {sortedE.map((r, idx) => {
                const missing = isNaN(r.E);
                const widthPct = missing ? 0 : (r.E / maxE) * 100;
                const worstE = Math.max(...eRows.filter((x) => !isNaN(x.E)).map((x) => x.E));
                const isWorst = !missing && r.E === worstE;
                return (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="italic text-[10px] text-stone-300 tabular-nums w-4 text-right">{String(idx + 1).padStart(2, "0")}</span>
                    <SchoolMark name={r.name} size={18} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-stone-900 font-medium">{r.name}</span>
                          {isWorst && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ background: "rgba(176,141,79,0.10)", color: GOLD, borderColor: "rgba(176,141,79,0.25)" }}>
                              최다
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-black tabular-nums ${missing ? "text-stone-400" : ""}`} style={{ color: missing ? undefined : "#a05252" }}>
                          {missing ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" /> 데이터 없음
                            </span>
                          ) : (
                            `${r.E.toFixed(1)}%`
                          )}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                        {!missing && (
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${widthPct}%`, background: "linear-gradient(90deg, #c97b7b, #a05252)" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] tracking-[0.2em] uppercase text-stone-500">
          {`출처: 학업성취도 공시 (${districtName} · 2025년 1학기 · 중3 영어)`}
        </div>
      </A4Page>
    </div>
  );
};
