import type { ReactNode } from "react";
import type { SchoolRecord } from "@/types/school";
import { NEWS_KIND_LABEL, type NewsKind, type SchoolNews } from "@/data/news";
import { NEWS_KIND_ICON, NEWS_KIND_ORDER, tmiIcon } from "@/lib/schools/icons";
import { ORUN_MESSAGES, ORUN_RESULTS, type ExamReport, type SourcedSchool } from "@/data/sourced";
import type { IconName } from "@/assets/art";
import type { SceneName } from "@/assets/toon";
import { Icon, Sticker } from "@/components/schools/Art";
import { BLOCK, NUMBERS, SECTION } from "@/lib/schools/copy";

/**
 * 시험 리포트·실적·TMI·소식 조각들. 만화풍 카드와 말풍선으로 그린다.
 * 문구는 copy.ts 에서만 온다.
 */

export interface HeadProps {
  id: string;
  no: string;
  en: string;
  ko: string;
  lede?: string;
  art?: SceneName;
}
export type HeadFn = (p: HeadProps) => ReactNode;
export interface Chapter {
  id: string;
  no: string;
}

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");

/* ── 블록 머리 ─────────────────────────── */

export function SourcedBlock({ en, ko, icon, period, children }: { en: string; ko: string; icon?: IconName; period?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 10, marginBottom: 14, borderBottom: "2.5px solid var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {icon && (
            <span className="orun-blob orun-blob--sky" style={{ width: 32, height: 32 }}>
              <Icon name={icon} size={16} style={{ color: "var(--on-pastel)" }} />
            </span>
          )}
          <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5, letterSpacing: ".2em" }}>
            {en}
          </span>
          <span className="orun-h2" style={{ fontSize: 20 }}>
            {ko}
          </span>
        </div>
        {period && <span className="orun-chip orun-chip--yellow">{period}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── 올해 시험지 리포트(학교별) ─────────── */

function ExamCard({ e }: { e: ExamReport }) {
  const isMid = e.term.endsWith("중간");
  return (
    <div className="orun-card orun-card--flat" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 16px", background: isMid ? "var(--t-sky)" : "var(--t-coral)", borderBottom: "2px solid var(--ink)" }}>
        <span style={{ fontFamily: "var(--display)", fontSize: 15, color: "var(--on-pastel)" }}>{isMid ? "중간고사" : "기말고사"}</span>
        <span style={{ fontSize: 12, color: "var(--on-pastel)", fontWeight: 700 }}>
          {e.grade}학년 · {e.format}
        </span>
      </div>
      <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {e.cut && (e.cut.grade1 || e.cut.grade2 || e.cut.avg) && (
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-end" }}>
            {e.cut.grade1 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>1등급 컷</div>
                <div className="orun-stat" style={{ fontSize: 26, lineHeight: 1.15 }}>
                  {e.cut.grade1}
                </div>
              </div>
            )}
            {e.cut.grade2 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>2등급 컷</div>
                <div className="orun-stat" style={{ fontSize: 19, color: "var(--body)", lineHeight: 1.2 }}>
                  {e.cut.grade2}
                </div>
              </div>
            )}
            {e.cut.avg && (
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>평균</div>
                <div className="orun-stat" style={{ fontSize: 19, color: "var(--body)", lineHeight: 1.2 }}>
                  {e.cut.avg}
                </div>
              </div>
            )}
          </div>
        )}
        {e.scope && (
          <div style={{ fontSize: 12.5, color: "var(--body)", display: "flex", gap: 6 }}>
            <Icon name="range" size={14} style={{ color: "var(--muted)", marginTop: 3 }} />
            <span>{e.scope}</span>
          </div>
        )}
        <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 700, lineHeight: 1.5 }}>{e.difficulty}</div>
        {e.killers.length > 0 && (
          <div style={{ display: "grid", gap: 6 }}>
            {e.killers.map((k, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 8, fontSize: 12.5, color: "var(--body)", lineHeight: 1.5 }}>
                <Sticker name="bolt" size={16} style={{ marginTop: 2 }} />
                <span>{k}</span>
              </div>
            ))}
          </div>
        )}
        <div className="orun-callout orun-callout--mint" style={{ margin: "6px 0 0", padding: "12px 14px", gridTemplateColumns: "18px 1fr", boxShadow: "none" }}>
          <Icon name="quote" size={16} style={{ color: "var(--ink)", marginTop: 2 }} />
          <p style={{ fontSize: 13 }}>
            {e.verdict}
            {e.teacher && <span className="orun-small"> {e.teacher} T</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExamTrend2026({ s, level }: { s: SourcedSchool; level: "중" | "고" }) {
  if (!s.exams.length) return null;
  const grades = [...new Set(s.exams.map((e) => e.grade))].sort();
  return (
    <SourcedBlock en={BLOCK.exam2026.en} ko={BLOCK.exam2026.ko} period={BLOCK.exam2026.tag} icon="paper">
      {s.oneLiner && (
        <p style={{ margin: "0 0 14px", fontSize: 15.5, color: "var(--ink)", fontFamily: "var(--display)", lineHeight: 1.5 }}>{s.oneLiner}</p>
      )}
      {grades.map((g) => {
        const list = s.exams.filter((e) => e.grade === g);
        return (
          <div key={g} style={{ marginBottom: 16 }}>
            <span className="orun-chip orun-chip--lav" style={{ marginBottom: 10 }}>
              {BLOCK.examGrade(level, g)}
            </span>
            <div style={{ display: "grid", gridTemplateColumns: list.length > 1 ? "repeat(auto-fit,minmax(300px,1fr))" : "1fr", gap: 12, marginTop: 8 }}>
              {list.map((e) => (
                <ExamCard key={e.term + e.grade} e={e} />
              ))}
            </div>
          </div>
        );
      })}
    </SourcedBlock>
  );
}

/* ── 선배들의 TMI — 말풍선 ──────────────── */

const BUBBLE_FILLS = ["var(--t-white)", "var(--yellow-soft)", "var(--blue-soft)", "var(--mint-soft)", "var(--lav-soft)"];

export function SeniorTmi({ s }: { s: SourcedSchool }) {
  if (!s.tmi.length) return null;
  return (
    <SourcedBlock en={BLOCK.tmi.en} ko={BLOCK.tmi.ko} icon="speech">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "16px 14px", paddingTop: 8 }}>
        {s.tmi.map((t, i) => (
          <div key={i} className="orun-callout" style={{ margin: 0, padding: "12px 14px", gridTemplateColumns: "30px 1fr", gap: 10, background: BUBBLE_FILLS[i % BUBBLE_FILLS.length] }}>
            <span className="orun-blob orun-blob--sky" style={{ width: 30, height: 30 }}>
              <Icon name={tmiIcon(t)} size={15} style={{ color: "var(--on-pastel)" }} />
            </span>
            <p style={{ fontSize: 13.5, color: "var(--body)" }}>{t}</p>
          </div>
        ))}
      </div>
    </SourcedBlock>
  );
}

/* ── 강사진이 짚은 포인트 ───────────────── */

export function LiveInsights({ s }: { s: SourcedSchool }) {
  if (!s.insights.length) return null;
  return (
    <SourcedBlock en={BLOCK.insights.en} ko={BLOCK.insights.ko} icon="mic">
      <div style={{ display: "grid", gap: 10 }}>
        {s.insights.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 12, alignItems: "start" }}>
            <span className={`orun-blob ${["", "orun-blob--sky", "orun-blob--mint", "orun-blob--coral", "orun-blob--lav"][i % 5]}`}>{String(i + 1).padStart(2, "0")}</span>
            <p style={{ margin: 0, fontSize: 14, color: "var(--body)", lineHeight: 1.6, paddingTop: 6 }}>{it.text}</p>
          </div>
        ))}
      </div>
    </SourcedBlock>
  );
}

/* ── 학교별 실적 카드 ───────────────────── */

export function SourcedResults({ s }: { s: SourcedSchool }) {
  if (!s.results.length) return null;
  return (
    <SourcedBlock en={BLOCK.results.en} ko={BLOCK.results.ko} period={BLOCK.results.tag} icon="trophy">
      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
        {s.results.map((r, i) => (
          <div key={i} style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
            <Sticker name={i % 2 ? "star" : "medal"} size={30} style={{ position: "absolute", top: -10, right: -8 }} />
            <div className="orun-small">{r.label}</div>
            <div className="orun-stat" style={{ fontSize: 30, lineHeight: 1.1 }}>
              {r.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.45 }}>{r.basis}</div>
            <div className="orun-small" style={{ fontSize: 11.5 }}>
              {r.term}
            </div>
          </div>
        ))}
      </div>
    </SourcedBlock>
  );
}

/* ── 전체 비교: 올해 시험지 한눈에 ─────── */

function pick(s: SourcedSchool, term: "중간" | "기말", grade: number) {
  return s.exams.find((e) => e.term.endsWith(term) && e.grade === grade);
}

export function Exam2026Table({ records, chapter, head }: { records: SchoolRecord[]; chapter?: Chapter; head: HeadFn }) {
  const highs = records.filter((r) => r.fact.level === "고" && r.sourced?.exams.length);
  const mids = records.filter((r) => r.fact.level === "중" && r.sourced?.exams.length);
  if ((!highs.length && !mids.length) || !chapter) return null;
  const C = SECTION.exam2026;

  const table = (list: SchoolRecord[], level: "고" | "중", grade: number) => (
    <div style={{ overflowX: "auto", marginBottom: 22 }}>
      <table className="orun-table" style={{ minWidth: 820 }}>
        <thead>
          <tr>
            <th>{C.cols.school}</th>
            <th>{C.cols.mid}</th>
            <th>{C.cols.fin}</th>
            {level === "고" && <th className="num">{C.cols.cut}</th>}
            <th>{C.cols.oneLiner}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const s = r.sourced!;
            const m = pick(s, "중간", grade);
            const f = pick(s, "기말", grade);
            const cut = f?.cut?.grade1 ?? m?.cut?.grade1;
            const cell = (e?: ExamReport) =>
              e ? (
                <>
                  <div style={{ color: "var(--ink)", fontWeight: 700 }}>{e.format}</div>
                  <div style={{ color: "var(--muted)" }}>{e.difficulty}</div>
                </>
              ) : (
                "—"
              );
            return (
              <tr key={r.fact.code}>
                <td className="name">{short(r.fact.name)}</td>
                <td style={{ fontSize: 12.5, minWidth: 180 }}>{cell(m)}</td>
                <td style={{ fontSize: 12.5, minWidth: 180 }}>{cell(f)}</td>
                {level === "고" && (
                  <td className="num" style={{ color: "var(--ink)", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {cut ?? "—"}
                  </td>
                )}
                <td style={{ fontSize: 12.5, color: "var(--body)", minWidth: 200 }}>{s.oneLiner ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const midGrade = mids.some((r) => pick(r.sourced!, "중간", 3) || pick(r.sourced!, "기말", 3)) ? 3 : 2;

  return (
    <section style={{ marginBottom: 64 }}>
      {head({ ...chapter, en: C.en, ko: C.ko, lede: C.lede, art: "paper" })}
      {highs.length > 0 && (
        <>
          <span className="orun-chip orun-chip--lav" style={{ marginBottom: 10 }}>
            {C.subHigh}
          </span>
          {table(highs, "고", 1)}
        </>
      )}
      {mids.length > 0 && (
        <>
          <span className="orun-chip orun-chip--lav" style={{ marginBottom: 10 }}>
            {C.subMid}
          </span>
          {table(mids, "중", midGrade)}
        </>
      )}
      <p className="orun-small" style={{ margin: 0 }}>
        {C.foot}
      </p>
    </section>
  );
}

/* ── 숫자 읽는 법 + 실적 포스터 ────────── */

const POSTER_SRC = ["/orun/2026-1-mid-results.jpg", "/orun/2026-1-final-allA.jpg", "/orun/2026-1-final-honor-high.jpg"];
const BLOBS = ["", "orun-blob--sky", "orun-blob--mint", "orun-blob--coral", "orun-blob--lav"];

export function OrunSection({ chapter, head }: { chapter: Chapter; head: HeadFn }) {
  const C = SECTION.numbers;
  return (
    <section style={{ marginBottom: 64 }}>
      {head({ ...chapter, en: C.en, ko: C.ko, lede: C.lede, art: "numbers" })}

      <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
        {ORUN_MESSAGES.slice(0, 4).map((m, i) => (
          <div key={i} className="orun-card orun-card--flat" style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "center", padding: "12px 16px" }}>
            <span className={`orun-blob ${BLOBS[i % BLOBS.length]}`}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.6 }}>{m.text}</span>
          </div>
        ))}
      </div>

      <span className="orun-eyebrow" style={{ marginBottom: 12 }}>
        {NUMBERS.cards}
      </span>
      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginBottom: 24, marginTop: 10 }}>
        {ORUN_RESULTS.map((r, i) => (
          <div key={i} style={{ padding: "14px 16px", position: "relative" }}>
            <Sticker name={["medal", "star", "sparkle", "trophy"][i % 4] as never} size={30} style={{ position: "absolute", top: -10, right: -8 }} />
            <div className="orun-small">{r.label}</div>
            <div className="orun-stat" style={{ fontSize: 34, lineHeight: 1.1, margin: "4px 0 2px" }}>
              {r.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--body)" }}>{r.basis}</div>
            <div className="orun-small" style={{ fontSize: 11.5, marginTop: 2 }}>
              {r.term}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
        {POSTER_SRC.map((src, i) => (
          <figure key={src} style={{ margin: 0 }}>
            <div className="orun-card" style={{ padding: 8 }}>
              <img src={src} alt={NUMBERS.posterCaptions[i]} style={{ width: "100%", display: "block", aspectRatio: "966 / 1371", objectFit: "cover", borderRadius: 10, border: "2px solid var(--ink)" }} loading="lazy" />
            </div>
            <figcaption style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.5, marginTop: 10 }}>
              {NUMBERS.posterCaptions[i]}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ── 학교 소식 ──────────────────────────── */

const KIND_CHIP: Record<NewsKind, string> = {
  news: "orun-chip--yellow",
  curriculum: "orun-chip--blue",
  results: "orun-chip--coral",
  life: "orun-chip--mint",
  program: "orun-chip--lav",
  english: "orun-chip--blue",
  freeSemester: "orun-chip--mint",
  admission: "orun-chip--coral",
};

export function SchoolNewsBlock({ n }: { n: SchoolNews }) {
  if (!n.items.length) return null;
  const items = [...n.items].sort((a, b) => NEWS_KIND_ORDER.indexOf(a.kind) - NEWS_KIND_ORDER.indexOf(b.kind));
  return (
    <SourcedBlock en={BLOCK.news.en} ko={BLOCK.news.ko} icon="news">
      {n.oneLiner && (
        <p style={{ margin: "0 0 14px", fontSize: 15.5, color: "var(--ink)", fontFamily: "var(--display)", lineHeight: 1.5 }}>{n.oneLiner}</p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} className="orun-card orun-card--flat" style={{ padding: "14px 16px", display: "grid", gap: 8 }}>
            <span className={`orun-chip ${KIND_CHIP[it.kind]}`} style={{ justifySelf: "start" }}>
              <Icon name={NEWS_KIND_ICON[it.kind]} size={13} />
              {NEWS_KIND_LABEL[it.kind]}
            </span>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4 }}>{it.title}</div>
            <div style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.55 }}>{it.summary}</div>
          </div>
        ))}
      </div>
    </SourcedBlock>
  );
}
