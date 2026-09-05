import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { ClassData, Student, OX } from "@/lib/diagnostic";
import orunLogo from "@/assets/orun-logo.png";
import iconGrammar from "@/assets/icon-grammar.png";
import iconReading from "@/assets/icon-reading.png";
import iconVocab from "@/assets/icon-vocab.png";

interface Props {
  cls: ClassData;
  student: Student;
  globalComment?: string;
  headerEyebrow?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

// 학부모 친화 등급 정의 — 이모지·색·평이한 한 줄 설명
const BANDS = [
  { min: 90, label: "최우수",   grade: "S", emoji: "🌟", color: "oklch(0.62 0.16 50)",  msg: "거의 모든 영역을 안정적으로 이해하고 있어요. 심화 학습으로 한 단계 더 도약할 시기입니다." },
  { min: 80, label: "우수",     grade: "A", emoji: "✨", color: "oklch(0.62 0.14 75)",  msg: "핵심 개념을 잘 잡고 있어요. 약한 부분만 다듬으면 최상위권으로 올라설 수 있습니다." },
  { min: 70, label: "양호",     grade: "B", emoji: "👍", color: "oklch(0.62 0.13 145)", msg: "기본기는 충분합니다. 응용 문제와 오답 유형을 반복 학습해 보세요." },
  { min: 60, label: "보통",     grade: "C", emoji: "📘", color: "oklch(0.62 0.13 230)", msg: "취약 단원의 개념 정리가 필요해요. 차근차근 다시 짚고 가는 학습을 권합니다." },
  { min: 0,  label: "노력 요함", grade: "D", emoji: "💪", color: "oklch(0.55 0.18 25)",  msg: "기초 개념부터 다시 점검해 보세요. 1:1 보강을 함께하면 빠르게 따라잡을 수 있습니다." },
];
const bandFor = (s: number) => BANDS.find((b) => s >= b.min) ?? BANDS[BANDS.length - 1];

export function ReportPage({ cls, student, globalComment, headerEyebrow, headerTitle, headerSubtitle }: Props) {
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const gFinal = student.grammarFinal ?? 0;
  const rFinal = student.readingFinal ?? 0;
  const vAvg = student.vocabAvg ?? 0;
  const composite = student.hasGrammar && student.hasReading
    ? (gFinal + rFinal) / 2
    : (student.hasGrammar ? gFinal : student.hasReading ? rFinal : vAvg);
  const band = bandFor(composite);

  const avgG = cls.avgGrammarFinal;
  const avgR = cls.avgReadingFinal;
  const avgV = cls.avgVocab;

  // Rank
  const rankList = cls.students
    .filter((s) => s.grammarFinal != null || s.readingFinal != null)
    .map((s) => {
      const c = s.hasGrammar && s.hasReading
        ? ((s.grammarFinal ?? 0) + (s.readingFinal ?? 0)) / 2
        : (s.hasGrammar ? (s.grammarFinal ?? 0) : (s.readingFinal ?? 0));
      return { name: s.rawName, c };
    })
    .sort((a, b) => b.c - a.c);
  const rank = rankList.findIndex((s) => s.name === student.rawName) + 1;
  const percentile = rankList.length ? Math.round(((rankList.length - rank + 1) / rankList.length) * 100) : 0;

  // 영역별 성취도
  const topicAgg: Record<string, { correct: number; total: number; nums: number[] }> = {};
  cls.questions.filter((q) => q.type === "객관식").forEach((q, i) => {
    const ans = student.objAnswers[i];
    if (!topicAgg[q.topic]) topicAgg[q.topic] = { correct: 0, total: 0, nums: [] };
    topicAgg[q.topic].total += 1;
    topicAgg[q.topic].nums.push(q.num);
    if (ans === "O") topicAgg[q.topic].correct += 1;
  });
  const topicEntries = Object.entries(topicAgg).map(([topic, v]) => ({
    topic, ...v, pct: v.total ? (v.correct / v.total) * 100 : 0,
  }));
  const weakTopics = [...topicEntries].sort((a, b) => a.pct - b.pct).slice(0, 3).filter((t) => t.pct < 100);
  const strongTopics = [...topicEntries].sort((a, b) => b.pct - a.pct).slice(0, 3).filter((t) => t.pct >= 70);

  const subjQuestions = cls.questions.filter((q) => q.type === "주관식");
  const objQuestions = cls.questions.filter((q) => q.type === "객관식");

  return (
    <Page>
      <Masthead cls={cls} today={today} student={student} eyebrow={headerEyebrow} title={headerTitle} subtitle={headerSubtitle} />

      <div className="mt-2.5 flex-1 grid grid-cols-2 gap-3">
        {/* LEFT COLUMN */}
        <div className="space-y-2.5 min-w-0">
          <section>
            <FriendlyTitle no="01" title="영역별 성적" hint="" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              <PillarCard
                icon={iconGrammar} korean="문법" tag="Grammar"
                present={student.hasGrammar}
                score={gFinal} avg={avgG}
                breakdown={[]}
              />
              <PillarCard
                icon={iconReading} korean="독해" tag="Reading"
                present={student.hasReading}
                score={rFinal} avg={avgR}
                breakdown={[]}
              />
              <PillarCard
                icon={iconVocab} korean="단어" tag="Vocab"
                present={student.hasVocab}
                score={vAvg} avg={avgV}
                breakdown={[]}
              />
            </div>
          </section>

          <section>
            <FriendlyTitle no="02" title="문법 주관식 채점" hint="26~30번 · 각 4점 만점" />
            <div className="mt-1.5 grid grid-cols-5 gap-2">
              {subjQuestions.map((q: any, i: number) => {
                const sc = student.subjScores[i];
                return <SubjCard key={q.num} num={q.num} topic={q.topic} score={sc} />;
              })}
            </div>
          </section>

          <section>
            <FriendlyTitle no="03" title="문법 단원별 이해도" hint="" />
            <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(topicEntries.length, 4)}, minmax(0, 1fr))` }}>
              {topicEntries.map((t: any) => (
                <TopicDonut key={t.topic} topic={t.topic} correct={t.correct} total={t.total} pct={t.pct} />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-2.5 min-w-0 h-full">
          <section>
            <FriendlyTitle no="04" title="단어 누적 테스트" hint="회차별 점수" />
            <div className="mt-1.5 rounded-2xl p-2 space-y-2" style={{ background: "var(--paper-tint)", border: "1px solid var(--hairline)" }}>
              <VocabChart vocab={student.vocab} avg={student.vocabAvg ?? 0} classAvg={cls.avgVocab} />
              <VocabTable vocab={student.vocab} avg={student.vocabAvg ?? 0} classAvg={cls.avgVocab} />
            </div>
          </section>

          <TeacherComment
            band={band}
            text={(globalComment && globalComment.trim().length > 0)
              ? globalComment
              : `[${band.label}] ${band.msg}${weakTopics.length > 0 ? ` 특히 ${weakTopics.map((t: any) => t.topic).join(", ")} 단원의 추가 학습을 권장합니다.` : ""}`}
          />
        </div>
      </div>

      <footer
        className="mt-auto relative flex items-center justify-between rounded-2xl overflow-hidden px-6 py-3 text-[10px] tracking-[0.18em] uppercase font-medium"
        style={{
          background:
            "radial-gradient(120% 180% at 100% 100%, oklch(0.28 0.025 260) 0%, oklch(0.18 0.015 265) 55%, oklch(0.14 0.012 265) 100%)",
          color: "oklch(0.85 0.008 90)",
          boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.06)",
          marginTop: "12px",
        }}
      >
        <span
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent)" }}
        />
        <span style={{ color: "oklch(0.95 0.005 90)" }}>© {new Date().getFullYear()} ORUN ENGLISH. All rights reserved.</span>
        <span style={{ color: "var(--gold)" }}>ORUN ENGLISH · Diagnostic Report</span>
      </footer>
    </Page>
  );
}

/* ============================ BUILDING BLOCKS ============================ */

function TeacherComment({ band, text }: { band: typeof BANDS[number]; text: string }) {
  return (
    <section className="rounded-2xl px-4 py-3 flex-1 flex flex-col" style={{ background: `linear-gradient(135deg, ${band.color}10, ${band.color}03)`, borderLeft: `4px solid ${band.color}` }}>
      <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em]" style={{ color: band.color }}>
        <span>종합 의견</span>
      </div>
      <p className="mt-2 font-serif-kr leading-[1.75] font-medium whitespace-pre-wrap flex-1 text-sm" style={{ color: "var(--ink)", overflowWrap: "anywhere", wordBreak: "break-word" }}>
        {text}
      </p>
    </section>
  );
}

function Page({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const updateScale = () => {
      const frame = frameRef.current;
      const content = contentRef.current;
      if (!frame || !content) return;

      const nextScale = Math.min(
        1,
        frame.clientWidth / Math.max(content.scrollWidth, 1),
        frame.clientHeight / Math.max(content.scrollHeight, 1),
      );

      setScale((current) => Math.abs(current - nextScale) > 0.003 ? nextScale : current);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (frameRef.current) observer.observe(frameRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div
      className="print-page mx-auto relative overflow-hidden rounded-2xl"
      style={{
        width: "297mm",
        height: "210mm",
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-sans)",
        boxShadow: "0 40px 90px -30px oklch(0.2 0.05 260 / 0.18)",
      }}
    >
      <div
        ref={frameRef}
        className="report-frame"
        style={{ padding: "5mm", height: "100%", boxSizing: "border-box", overflow: "hidden" }}
      >
        <div
          ref={contentRef}
          className="report-content flex flex-col"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${100 / scale}%`,
            minHeight: "200mm",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Masthead({ cls, today, student, compact, eyebrow, title, subtitle }: { cls: ClassData; today: string; student: Student; compact?: boolean; eyebrow?: string; title?: string; subtitle?: string }) {
  return (
    <header
      className="relative flex items-center justify-between rounded-2xl overflow-hidden gap-4"
      style={{
        padding: compact ? "12px 22px" : "16px 24px",
        background:
          "radial-gradient(120% 180% at 0% 0%, oklch(0.28 0.025 260) 0%, oklch(0.18 0.015 265) 55%, oklch(0.14 0.012 265) 100%)",
        color: "oklch(0.97 0.005 90)",
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.06)",
      }}
    >
      {/* gold hairline top accent */}
      <span
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent)" }}
      />
      {/* subtle decorative monogram */}
      <span
        aria-hidden
        className="absolute -right-6 -bottom-10 font-display font-bold select-none pointer-events-none"
        style={{ fontSize: "150px", lineHeight: 1, color: "oklch(1 0 0 / 0.04)", letterSpacing: "-0.04em" }}
      >
        ORUN
      </span>

      <div className="relative flex items-center gap-3 min-w-0">
        <img src={orunLogo} alt="ORUN ACADEMY" className="w-11 h-11 object-contain shrink-0 relative" />
        <div className="min-w-0">
          <div
            className="text-[8.5px] font-bold tracking-[0.3em] truncate uppercase"
            style={{ color: "var(--gold)" }}
          >
            {eyebrow ?? "ORUN ACADEMY · DIAGNOSTIC REPORT"}
          </div>
          <div className="font-serif-kr text-[20px] font-bold tracking-tight mt-0.5 leading-tight text-white">
            {title ?? "옳은영어 중학 진단평가 리포트"}
          </div>
          {(compact || (subtitle && subtitle.length > 0)) && (
            <div className="text-[10px] mt-0.5 font-medium" style={{ color: "oklch(0.78 0.012 260)" }}>
              {compact ? `${student.name} 학생 · 2 page` : subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-4 shrink-0">
        <span className="h-10 w-px" style={{ background: "linear-gradient(180deg, transparent, oklch(1 0 0 / 0.18), transparent)" }} />
        <div className="text-right">
          <div
            className="text-[8.5px] font-bold tracking-[0.3em]"
            style={{ color: "oklch(0.7 0.015 260)" }}
          >
            STUDENT INFO
          </div>
          <div className="font-serif-kr text-[17px] leading-none font-bold mt-1" style={{ color: "oklch(0.98 0.005 90)" }}>
            {student.name}
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-2">
            <span
              className="font-display text-[10px] font-bold tracking-[0.18em] px-2 py-0.5 rounded"
              style={{
                color: "var(--gold)",
                border: "1px solid oklch(0.7 0.13 75 / 0.45)",
                background: "oklch(0.7 0.13 75 / 0.08)",
              }}
            >
              {cls.classKey}
            </span>
            <span className="text-[9.5px] font-medium" style={{ color: "oklch(0.78 0.012 260)" }}>{today}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function FriendlyTitle({ no, title, hint }: { no: string; title: string; hint: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full font-display text-[11px] font-bold"
              style={{ background: "var(--navy-deep)", color: "var(--gold)" }}>{no}</span>
        <span className="font-serif-kr text-[15px] font-bold tracking-tight" style={{ color: "var(--navy-deep)" }}>{title}</span>
        {hint && <span className="font-serif-kr text-[10px] font-medium" style={{ color: "var(--ink-faint)" }}>· {hint}</span>}
      </div>
    </div>
  );
}

function KPICard({ label, value, suffix, hint, icon, wide }: { label: string; value: string; suffix: string; hint: string; icon: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${wide ? "col-span-2" : ""}`}
         style={{ background: "var(--paper)", border: "1px solid var(--hairline-strong)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.25em]" style={{ color: "var(--ink-faint)" }}>{label}</span>
        <span className="text-[18px]">{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] leading-none font-bold" style={{ color: "var(--navy-deep)" }}>{value}</span>
        <span className="text-[12px] font-bold" style={{ color: "var(--ink-faint)" }}>{suffix}</span>
      </div>
      {hint && <div className="mt-1.5 font-serif-kr text-[10.5px] font-medium" style={{ color: "var(--ink-soft)" }}>{hint}</div>}
    </div>
  );
}

function BigGauge({ value, color }: { value: number; color: string }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, Math.max(0, value / 100));
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="mt-3">
      <circle cx="90" cy="90" r={r} fill="none" stroke="oklch(0.93 0.005 260)" strokeWidth="14" />
      <circle
        cx="90" cy="90" r={r} fill="none"
        stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${c * frac} ${c}`}
        transform="rotate(-90 90 90)"
      />
      <text x="90" y="92" textAnchor="middle" fontSize="44" fontWeight="800" fill="var(--navy-deep)">
        {value.toFixed(0)}
      </text>
      <text x="90" y="115" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-faint)">
        / 100점
      </text>
    </svg>
  );
}

function PillarCard({ icon, korean, tag, present, score, avg, breakdown }: {
  icon: string; korean: string; tag: string; present: boolean; score: number; avg: number;
  breakdown: { label: string; v: number | null; max: number; unit?: string; raw?: string }[];
}) {
  const pct = Math.min(100, Math.max(0, score));
  const diff = score - avg;
  const better = diff >= 0;
  return (
    <div className="rounded-2xl p-3 relative min-w-0" style={{ border: "1px solid var(--hairline-strong)", background: "var(--paper)" }}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <img src={icon} alt="" className="h-6 w-6 object-contain shrink-0" loading="lazy" width={64} height={64} />
          <span className="font-serif-kr text-[14px] font-bold truncate" style={{ color: "var(--navy-deep)" }}>{korean}</span>
        </div>
        <span className="text-[9px] font-bold tracking-wide shrink-0" style={{ color: "var(--ink-faint)" }}>{tag}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-[32px] leading-none font-bold" style={{ color: "var(--navy-deep)" }}>
          {present ? score.toFixed(score % 1 === 0 ? 0 : 1) : "—"}
        </span>
        <span className="text-[11px] font-bold" style={{ color: "var(--ink-faint)" }}>/ 100점</span>
      </div>
      <div className="mt-2 relative h-[5px] rounded-full overflow-hidden" style={{ background: "oklch(0.93 0.005 260)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: "var(--gold-grad)" }} />
        <div className="absolute -top-1 -bottom-1 w-px" style={{ left: `${Math.min(100, avg)}%`, background: "var(--navy-deep)" }} />
      </div>
      <div className="mt-1 flex justify-between items-baseline text-[10px] font-bold gap-1" style={{ color: "var(--ink-faint)" }}>
        <span className="font-serif-kr truncate">반 평균 {avg.toFixed(1)}</span>
        {present && (
          <span className="font-serif-kr shrink-0" style={{ color: better ? "oklch(0.55 0.13 145)" : "oklch(0.55 0.18 25)" }}>
            {better ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-2 pt-2 space-y-1" style={{ borderTop: "1px solid var(--hairline)" }}>
        {breakdown.map((b) => (
          <div key={b.label} className="flex justify-between items-baseline text-[10.5px] gap-1">
            <span className="font-serif-kr font-medium truncate" style={{ color: "var(--ink-soft)" }}>{b.label}</span>
            <span className="font-display font-bold shrink-0" style={{ color: "var(--navy-deep)" }}>
              {b.raw ? b.raw : b.v == null ? "—" : `${b.v}${b.unit ? b.unit : ""}${b.max ? ` / ${b.max}${b.unit ?? ""}` : ""}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function bestWorst(student: Student): string {
  const valid = student.vocab.filter((v) => v.score != null).map((v) => v.score as number);
  if (!valid.length) return "—";
  return `${Math.max(...valid).toFixed(0)} / ${Math.min(...valid).toFixed(0)}`;
}

function OXCell({ num, topic, ans }: { num: number; topic: string; ans: OX }) {
  const isO = ans === "O", isX = ans === "X";
  const color = isO ? "oklch(0.55 0.13 145)" : isX ? "oklch(0.55 0.18 25)" : "var(--ink-faint)";
  const bg = isO ? "oklch(0.96 0.04 145)" : isX ? "oklch(0.96 0.04 25)" : "transparent";
  const border = isO ? "oklch(0.75 0.13 145)" : isX ? "oklch(0.75 0.15 25)" : "var(--hairline)";
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md min-w-0" style={{ background: bg, border: `1px solid ${border}` }}>
      <span className="font-display text-[10px] font-bold w-3.5 shrink-0 leading-none" style={{ color: "var(--ink)" }}>{num}</span>
      <span className="font-serif-kr text-[9px] font-semibold flex-1 truncate min-w-0 leading-none" style={{ color: "var(--ink-soft)" }}>{topic}</span>
      <span className="font-display text-[11px] font-bold leading-none shrink-0" style={{ color }}>
        {ans ?? "—"}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </span>
  );
}

function TopicDonut({ topic, correct, total, pct }: { topic: string; correct: number; total: number; pct: number }) {
  const color = pct >= 80 ? "oklch(0.62 0.14 150)" : pct >= 60 ? "oklch(0.68 0.14 75)" : "oklch(0.6 0.18 25)";
  const tag = pct >= 80 ? "잘함" : pct >= 60 ? "보통" : "보충 필요";
  const gid = `donut-${topic.replace(/[\s()/\\#:.,]+/g, "_")}`;
  const size = 92;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, Math.max(0, pct / 100));
  const dash = c * frac;
  return (
    <div
      className="rounded-2xl p-2.5 flex flex-col items-center min-w-0"
      style={{
        background: `linear-gradient(160deg, ${color}0F, var(--paper) 70%)`,
        border: "1px solid var(--hairline-strong)",
      }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.94 0.005 260)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="font-display text-[20px] font-bold" style={{ color: "var(--navy-deep)" }}>{Math.round(pct)}<span className="text-[10px] font-bold ml-0.5" style={{ color: "var(--ink-faint)" }}>%</span></span>
          
        </div>
      </div>
      <div className="mt-1.5 font-serif-kr text-[11px] font-bold truncate w-full text-center" style={{ color: "var(--ink)" }}>{topic}</div>
      <span
        className="mt-1 inline-block rounded-full px-2 py-[1px] font-display text-[9px] font-bold tracking-wider"
        style={{ background: `${color}1A`, color }}
      >
        {tag}
      </span>
    </div>
  );
}

function SubjCard({ num, topic, score }: { num: number; topic: string; score: number | null }) {
  const max = 4;
  const pct = score == null ? 0 : (score / max) * 100;
  const color = score == null ? "var(--ink-faint)" : score >= 4 ? "oklch(0.55 0.13 145)" : score >= 2 ? "oklch(0.62 0.13 75)" : "oklch(0.55 0.18 25)";
  return (
    <div className="rounded-xl p-2 text-center min-w-0" style={{ border: "1px solid var(--hairline-strong)", background: "var(--paper)" }}>
      <div className="text-[9.5px] font-bold" style={{ color: "var(--ink-faint)" }}>{num}번</div>
      <div className="mt-1 font-display text-[24px] leading-none font-bold" style={{ color }}>
        {score == null ? "—" : score}
        <span className="text-[10px] font-bold ml-0.5" style={{ color: "var(--ink-faint)" }}>/{max}점</span>
      </div>
      <div className="mt-1.5 font-serif-kr text-[9.5px] font-bold truncate" style={{ color: "var(--ink-soft)" }}>{topic}</div>
      <div className="mt-1.5 relative h-[3px] rounded-full overflow-hidden" style={{ background: "oklch(0.93 0.005 260)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ReadStat({ label, value, sub, big, highlight }: { label: string; value: string; sub: string; big?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold" style={{ color: "var(--ink-faint)" }}>{label}</div>
      <div
        className="font-display mt-1 font-bold leading-none"
        style={{
          fontSize: big ? "32px" : "22px",
          color: highlight ? "oklch(0.62 0.14 75)" : "var(--navy-deep)",
        }}
      >{value}</div>
      <div className="text-[10px] mt-1 font-bold" style={{ color: "var(--ink-faint)" }}>{sub}</div>
    </div>
  );
}

function CompareDonut({ value, avg, max }: { value: number; avg: number; max: number }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, Math.max(0, value / max));
  const diff = value - avg;
  const better = diff >= 0;
  return (
    <div className="mt-3 flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="oklch(0.93 0.005 260)" strokeWidth="11" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="url(#cd-g)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          transform="rotate(-90 60 60)"
        />
        <defs>
          <linearGradient id="cd-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.12 75)" />
            <stop offset="100%" stopColor="oklch(0.78 0.11 85)" />
          </linearGradient>
        </defs>
        <text x="60" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--navy-deep)">
          {value.toFixed(0)}
        </text>
        <text x="60" y="78" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink-faint)">
          / {max}점
        </text>
      </svg>
      <div className="flex-1 space-y-2 text-[11px]">
        <div className="flex justify-between"><span className="font-serif-kr font-bold" style={{color:"var(--navy-deep)"}}>우리 아이</span><b className="font-display" style={{color:"var(--navy-deep)"}}>{value.toFixed(1)}점</b></div>
        <div className="flex justify-between"><span className="font-serif-kr font-bold" style={{color:"var(--ink-soft)"}}>반 평균</span><b className="font-display" style={{color:"var(--ink-soft)"}}>{avg.toFixed(1)}점</b></div>
        <div className="font-serif-kr font-bold pt-2" style={{ borderTop: "1px solid var(--hairline)", color: better ? "oklch(0.55 0.13 145)" : "oklch(0.55 0.18 25)" }}>
          {better ? "▲" : "▼"} 반 평균보다 {Math.abs(diff).toFixed(1)}점 {better ? "높음" : "낮음"}
        </div>
      </div>
    </div>
  );
}

function VocabChart({ vocab, avg, classAvg }: { vocab: { round: number; score: number | null; absent: boolean }[]; avg: number; classAvg: number }) {
  const W = 600, H = 150, padL = 30, padR = 12, padT = 12, padB = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const denom = Math.max(1, vocab.length - 1);
  const xs = (i: number) => padL + (i / denom) * innerW;
  const ys = (v: number) => padT + (1 - v / 100) * innerH;
  const points = vocab.map((v, i) => v.score != null ? { x: xs(i), y: ys(v.score), v: v.score, i } : null);
  const valid = points.filter((p): p is NonNullable<typeof p> => p != null);
  const path = valid.length ? "M " + valid.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ") : "";
  const areaPath = valid.length ? `${path} L ${valid[valid.length - 1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${valid[0].x.toFixed(1)} ${(padT + innerH).toFixed(1)} Z` : "";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="xMidYMid meet" style={{ display: "block", width: "100%", height: "auto", aspectRatio: `${W} / ${H}` }}>
      <defs>
        <linearGradient id="vocab-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.11 85)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.78 0.11 85)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={padL} x2={W - padR} y1={ys(g)} y2={ys(g)} stroke="oklch(0.93 0.005 260)" strokeWidth="0.6" />
          <text x={padL - 5} y={ys(g) + 3} fontSize="8" textAnchor="end" fill="var(--ink-faint)" fontWeight="700">{g}</text>
        </g>
      ))}
      <line x1={padL} x2={W - padR} y1={ys(classAvg)} y2={ys(classAvg)} stroke="var(--navy-deep)" strokeWidth="0.9" strokeDasharray="3 3" />
      <text x={W - padR} y={ys(classAvg) - 3} fontSize="8" textAnchor="end" fill="var(--navy-deep)" fontWeight="700">반 평균 {classAvg.toFixed(1)}</text>
      {avg > 0 && (
        <>
          <line x1={padL} x2={W - padR} y1={ys(avg)} y2={ys(avg)} stroke="oklch(0.62 0.14 75)" strokeWidth="0.9" strokeDasharray="2 2" />
          <text x={padL + 4} y={ys(avg) - 3} fontSize="8" fill="oklch(0.62 0.14 75)" fontWeight="700">내 평균 {avg.toFixed(1)}</text>
        </>
      )}
      {areaPath && <path d={areaPath} fill="url(#vocab-area)" />}
      {path && <path d={path} fill="none" stroke="oklch(0.62 0.12 75)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
      {vocab.map((v, i) => {
        const x = xs(i);
        if (v.absent) return <circle key={i} cx={x} cy={padT + innerH} r="3" fill="oklch(0.55 0.18 25)" />;
        if (v.score == null) return null;
        return <circle key={i} cx={x} cy={ys(v.score)} r="2.5" fill="var(--paper)" stroke="oklch(0.62 0.12 75)" strokeWidth="1.5" />;
      })}
      {vocab.map((v, i) => i % 2 === 0 ? (
        <text key={i} x={xs(i)} y={H - 4} fontSize="7" textAnchor="middle" fill="var(--ink-faint)" fontWeight="700">{v.round}</text>
      ) : null)}
    </svg>
  );
}

function VocabTable({ vocab, avg, classAvg }: { vocab: { round: number; score: number | null; absent: boolean }[]; avg: number; classAvg: number }) {
  const cell = (v: { round: number; score: number | null; absent: boolean }) => {
    if (v.absent) return { text: "결석", color: "oklch(0.55 0.18 25)", bg: "oklch(0.96 0.04 25)" };
    if (v.score == null) return { text: "—", color: "var(--ink-faint)", bg: "transparent" };
    const s = v.score;
    const color = s >= 90 ? "oklch(0.45 0.13 145)" : s >= 70 ? "oklch(0.5 0.13 75)" : s >= 50 ? "oklch(0.55 0.14 50)" : "oklch(0.55 0.18 25)";
    const bg = s >= 90 ? "oklch(0.96 0.05 145)" : s >= 70 ? "oklch(0.97 0.04 85)" : s >= 50 ? "oklch(0.97 0.04 50)" : "oklch(0.96 0.04 25)";
    return { text: String(s), color, bg };
  };
  const rows: typeof vocab[] = [];
  const perRow = 11;
  for (let i = 0; i < vocab.length; i += perRow) rows.push(vocab.slice(i, i + perRow));
  const taken = vocab.filter((v) => v.score != null).length;
  const absentCount = vocab.filter((v) => v.absent).length;
  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2 text-[10px] font-bold" style={{ color: "var(--ink-soft)" }}>
        <span className="font-serif-kr">총 {vocab.length}회 · 응시 {taken}회 · 결석 {absentCount}회</span>
        <span className="font-serif-kr">내 평균 <b style={{color:"var(--navy-deep)"}}>{avg.toFixed(1)}</b> · 반 평균 <b>{classAvg.toFixed(1)}</b></span>
      </div>
      <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
        <tbody>
          {rows.map((row, ri) => (
            <Fragment key={ri}>
              <tr>
                {row.map((v) => (
                  <th key={`h-${v.round}`} className="text-[9px] font-bold py-1" style={{ color: "var(--ink-faint)", borderBottom: "1px solid var(--hairline)" }}>
                    {v.round}회
                  </th>
                ))}
              </tr>
              <tr>
                {row.map((v) => {
                  const c = cell(v);
                  return (
                    <td key={`s-${v.round}`} className="text-center py-1.5">
                      <span className="inline-block min-w-[28px] px-1.5 py-0.5 rounded font-display text-[11px] font-bold" style={{ color: c.color, background: c.bg }}>
                        {c.text}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Insight({ icon, title, hint, items, empty, accent }: { icon: string; title: string; hint: string; items: { label: string; value: string; pct: number }[]; empty: string; accent: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ border: `1px solid ${accent}30`, background: `${accent}08` }}>
      <div className="flex items-center gap-2">
        <span className="text-[20px]">{icon}</span>
        <span className="font-serif-kr text-[15px] font-bold" style={{ color: accent }}>{title}</span>
      </div>
      <div className="mt-1 font-serif-kr text-[10.5px] font-medium" style={{ color: "var(--ink-faint)" }}>{hint}</div>
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? (
          <li className="text-[11.5px] font-medium font-serif-kr" style={{ color: "var(--ink-faint)" }}>{empty}</li>
        ) : (
          items.map((it) => (
            <li key={it.label} className="flex justify-between items-baseline gap-2">
              <span className="font-serif-kr text-[12px] font-semibold flex-1" style={{ color: "var(--ink)" }}>{it.label}</span>
              <span className="font-display text-[12px] font-bold whitespace-nowrap" style={{ color: accent }}>{it.value} · {Math.round(it.pct)}%</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
