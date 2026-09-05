import { PenLine } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { CatRow, TreeShell } from "@/components/selection-tree";
import {
  Btn,
  CardTitle,
  GlassCard,
  Loading,
  Pill,
  Segmented,
  TextInput,
  PageHeader,
} from "@/components/ui-kit";
import { useBank } from "@/lib/grammar/useBank";
import { setState, setTotal, toast, useApp, type Report } from "@/lib/grammar/store";
import { decCfg, fmt, gcats, okShort, pickQuestions } from "@/lib/grammar/engine";
import { CIRC, GRADES, type Cat, type ExamCfg } from "@/lib/grammar/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/take")({
  head: () => ({
    meta: [
      { title: "시험 응시 · ORUN GRAMMAR OMR 답안 입력" },
      {
        name: "description",
        content:
          "소속·반·이름·번호 뒷 4자리를 입력하고 OMR 답안지에 답을 마킹해 영문법 시험에 응시하세요. 결과는 응시 기록의 리포트에서 확인합니다.",
      },
      { property: "og:title", content: "ORUN GRAMMAR 시험 응시" },
      { property: "og:description", content: "OMR 답안지로 응시하고 리포트는 응시 기록에서 확인합니다." },
    ],
  }),
  component: TakePage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] font-extrabold tracking-tight text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Setup({ byId, cats }: { byId: Record<string, Cat>; cats: Cat[] }) {
  const S = useApp();
  const T = S.taker;

  const validId = () => {
    if (!T.org.trim()) return toast("소속을 입력하세요"), false;
    if (!T.cls.trim()) return toast("반을 입력하세요"), false;
    if (!T.name.trim()) return toast("이름을 입력하세요"), false;
    if (!/^\d{4}$/.test(T.phone4.trim())) return toast("전화번호 뒷 4자리를 입력하세요"), false;
    return true;
  };

  const begin = (cfg: ExamCfg) => {
    const qs = pickQuestions(byId, cfg);
    if (!qs.length) return toast("조건에 맞는 문항이 없습니다");
    setState({ sheet: { cfg, qs }, answers: {}, report: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startByCode = () => {
    if (!validId()) return;
    const cfg = decCfg(T.code.trim());
    if (!cfg) return toast("코드가 올바르지 않습니다");
    begin(cfg);
  };

  const startSelf = () => {
    if (!validId()) return;
    if (!S.sel.length) return toast("문법 항목을 하나 이상 고르세요");
    begin({
      title: `${S.grade} 자유 연습`,
      grade: S.grade,
      book: "",
      cats: S.sel,
      lvN: S.lvN,
      tyN: S.tyN,
      total: S.total,
      noDup: false,
      seed: Date.now() % 2147483647,
    });
  };

  return (
    <div className="mx-auto max-w-[820px]">
      <GlassCard solid className="mb-3.5">
        <CardTitle right="모든 항목 필수">응시자 정보</CardTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Field label="소속">
            <TextInput
              placeholder="예) 옳은영어학원"
              value={T.org}
              onChange={(e) => setState({ taker: { ...T, org: e.target.value } })}
            />
          </Field>
          <Field label="반">
            <TextInput
              placeholder="예) 중2-A"
              value={T.cls}
              onChange={(e) => setState({ taker: { ...T, cls: e.target.value } })}
            />
          </Field>
          <Field label="이름">
            <TextInput
              placeholder="예) 홍길동"
              value={T.name}
              onChange={(e) => setState({ taker: { ...T, name: e.target.value } })}
            />
          </Field>
          <Field label="번호 뒷 4자리">
            <TextInput
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              value={T.phone4}
              onChange={(e) =>
                setState({ taker: { ...T, phone4: e.target.value.replace(/\D/g, "").slice(0, 4) } })
              }
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="응시 코드">
            <TextInput
              placeholder="선생님께 받은 OG2. 코드 붙여넣기"
              value={T.code}
              onChange={(e) => setState({ taker: { ...T, code: e.target.value } })}
            />
          </Field>
          <Btn variant="gold" onClick={startByCode}>
            응시 시작
          </Btn>
        </div>
      </GlassCard>

      <GlassCard solid>
        <CardTitle>코드 없이 연습하기</CardTitle>
        <Segmented
          className="mb-3 flex w-full max-w-[380px]"
          value={S.grade}
          onChange={(g) => setState({ grade: g, book: null })}
          items={GRADES.map((g) => ({ v: g, label: g }))}
        />
        <TreeShell className="max-h-[220px]">
          {cats.map((c) => (
            <CatRow key={c.id} cat={c} currentGrade={S.grade} />
          ))}
        </TreeShell>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[10, 15, 20, 25, 30].map((n) => (
            <Pill key={n} on={S.total === n} onClick={() => setTotal(n)}>
              {n}
            </Pill>
          ))}
          <Btn className="ml-auto" onClick={startSelf}>
            연습 시작
          </Btn>
        </div>
      </GlassCard>
    </div>
  );
}

/* ── OMR 답안지 ── */
function OmrRow({ seq, choices }: { seq: number; choices: number }) {
  const S = useApp();
  const cur = S.answers[seq];
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 px-2.5 py-1.5">
      <b className="w-6 text-right text-[12px] font-extrabold text-muted-foreground">{seq}</b>
      <div className="flex gap-1">
        {Array.from({ length: choices }, (_, i) => i + 1).map((n) => {
          const on = cur === n;
          return (
            <button
              key={n}
              aria-label={`${seq}번 ${n}번 선택`}
              onClick={() => setState({ answers: { ...S.answers, [seq]: on ? "" : n } })}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-bold transition-all duration-200",
                on
                  ? "border-transparent bg-primary text-primary-foreground shadow-[0_4px_12px_oklch(0.264_0.037_260/0.3)]"
                  : "border-border text-subtle hover:border-primary/40 hover:text-foreground",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Taking() {
  const S = useApp();
  const sheet = S.sheet!;
  const T = S.taker;
  const done = sheet.qs.filter((q) => {
    const a = S.answers[q.seq];
    return a !== undefined && String(a).trim() !== "";
  }).length;

  const submit = () => {
    const left = sheet.qs.length - done;
    if (left > 0 && !confirm(`아직 ${left}문항이 비어 있습니다. 제출할까요?`)) return;
    const per = Math.floor(100 / sheet.qs.length);
    const ex = 100 - per * sheet.qs.length;
    let sc = 0;
    const rows: Report["rows"] = [];
    const cat: Record<string, [number, number]> = {};
    const lvl: Report["lvl"] = { 상: [0, 0], 중: [0, 0], 하: [0, 0] };
    sheet.qs.forEach((q, i) => {
      const pts = per + (i < ex ? 1 : 0);
      const my = S.answers[q.seq];
      const ok = q.type === "mc" ? my === q.answer : okShort(q, my);
      if (ok) sc += pts;
      if (!cat[q.cat]) cat[q.cat] = [0, 0];
      cat[q.cat]![1]++;
      if (ok) cat[q.cat]![0]++;
      lvl[q.level][1]++;
      if (ok) lvl[q.level][0]++;
      rows.push({ q, my, ok, pts });
    });
    const report: Report = { score: sc, rows, cat, lvl, when: new Date(), cfg: sheet.cfg };
    try {
      const r = JSON.parse(localStorage.getItem("og.records") || "[]");
      r.unshift({
        org: T.org,
        name: T.name,
        cls: T.cls,
        phone4: T.phone4,
        title: sheet.cfg.title,
        grade: sheet.cfg.grade || "",
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        score: sc,
        total: sheet.qs.length,
        right: rows.filter((x) => x.ok).length,
        report,
      });
      localStorage.setItem("og.records", JSON.stringify(r.slice(0, 200)));
    } catch {
      /* ignore */
    }
    setState({ report, sheet: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shortQs = sheet.qs.filter((q) => q.type === "short");

  return (
    <>
      <GlassCard solid className="mb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">{sheet.cfg.title}</span>
          <span className="ml-auto text-[11.5px] font-semibold text-subtle">
            {[T.org, T.cls, T.name].filter(Boolean).join(" · ")} ({T.phone4}) · {sheet.qs.length}문항
          </span>
        </div>
      </GlassCard>

      <div className="grid gap-3.5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          {sheet.qs.map((q) => (
            <div key={q.seq} className="glass-strong mb-3 rounded-2xl p-5">
              <div className="whitespace-pre-wrap leading-relaxed">
                <b className="mr-1.5 text-primary">{String(q.seq).padStart(2, "0")}.</b>
                <span dangerouslySetInnerHTML={{ __html: fmt(q.stem) }} />{" "}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-extrabold",
                    q.level === "하" && "bg-success-soft text-success",
                    q.level === "중" && "bg-[color-mix(in_oklab,var(--gold)_18%,white)] text-gold-deep",
                    q.level === "상" && "bg-destructive-soft text-destructive",
                  )}
                >
                  {q.level}
                </span>
              </div>
              {q.type === "mc" ? (
                <div className="mt-2.5 grid gap-1">
                  {(q.choices || []).map((c, i) => (
                    <div
                      key={i}
                      className="text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: `${CIRC[i]} ${fmt(c)}` }}
                    />
                  ))}
                </div>
              ) : (
                <TextInput
                  className="mt-2.5 max-w-[460px]"
                  placeholder="답을 입력하세요"
                  value={String(S.answers[q.seq] ?? "")}
                  onChange={(e) => setState({ answers: { ...S.answers, [q.seq]: e.target.value } })}
                />
              )}
            </div>
          ))}
        </div>

        <GlassCard solid className="lg:sticky lg:top-20">
          <CardTitle right={`${done}/${sheet.qs.length}`}>OMR 답안지</CardTitle>
          <div className="grid max-h-[52vh] gap-1.5 overflow-auto pr-1">
            {sheet.qs.map((q) =>
              q.type === "mc" ? (
                <OmrRow key={q.seq} seq={q.seq} choices={(q.choices || []).length || 5} />
              ) : (
                <div
                  key={q.seq}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border px-2.5 py-1.5"
                >
                  <b className="w-6 text-right text-[12px] font-extrabold text-muted-foreground">{q.seq}</b>
                  <span className="truncate text-[11.5px] text-subtle">
                    {String(S.answers[q.seq] ?? "") || "주관식 — 본문에 입력"}
                  </span>
                </div>
              ),
            )}
          </div>
          {!!shortQs.length && (
            <p className="mt-2 text-[11px] text-subtle">주관식 {shortQs.length}문항은 왼쪽 본문에 직접 입력합니다.</p>
          )}
        </GlassCard>
      </div>

      <div className="glass-strong sticky bottom-4 z-20 mt-5 flex flex-wrap items-center gap-3.5 rounded-2xl px-5 py-3">
        <span className="text-[12.5px] text-muted-foreground">
          <b className="text-foreground">{done}</b> / {sheet.qs.length} 답함
        </span>
        <span className="h-[7px] max-w-[280px] flex-1 overflow-hidden rounded-full bg-muted">
          <i
            className="block h-full rounded-full transition-all duration-500 ease-[cubic-bezier(.34,1.4,.5,1)]"
            style={{
              width: `${Math.round((100 * done) / sheet.qs.length)}%`,
              background: "var(--gradient-gold)",
            }}
          />
        </span>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => confirm("응시를 취소할까요?") && setState({ sheet: null })}
        >
          취소
        </Btn>
        <Btn variant="gold" onClick={submit}>
          답안 제출
        </Btn>
      </div>
    </>
  );
}

function Submitted() {
  const S = useApp();
  const R = S.report!;
  const right = R.rows.filter((r) => r.ok).length;
  return (
    <div className="mx-auto max-w-[560px]">
      <GlassCard solid className="text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success text-2xl font-black">
          ✓
        </div>
        <h2 className="text-[19px] font-black tracking-tight">답안이 제출되었습니다</h2>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {S.taker.name} 학생 · {R.cfg.title} · {right}/{R.rows.length} 정답
        </p>
        <p className="mt-1 text-[12.5px] text-subtle">
          상세 리포트는 <b>응시 기록</b> 메뉴에서 확인할 수 있습니다.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link to="/records">
            <Btn variant="gold">응시 기록으로 이동</Btn>
          </Link>
          <Btn variant="ghost" onClick={() => setState({ report: null, sheet: null, answers: {} })}>
            새 응시
          </Btn>
        </div>
      </GlassCard>
    </div>
  );
}

function TakePage() {
  const S = useApp();
  const { bank, byId } = useBank();
  return (
    <Shell>
      <h1 className="sr-only">ORUN GRAMMAR 시험 응시</h1>
      <PageHeader
        eyebrow="TEST STUDIO"
        title="시험 응시"
        desc="소속·반·이름·번호 뒷 4자리를 입력하고 OMR 답안지에 답을 마킹하세요. 리포트는 응시 기록에서 확인합니다."
        icon={<PenLine size={26} strokeWidth={2.6} />}
      />
      {!bank ? (
        <Loading />
      ) : S.report ? (
        <Submitted />
      ) : S.sheet ? (
        <Taking />
      ) : (
        <Setup byId={byId} cats={gcats(bank.cats, S.grade)} />
      )}
    </Shell>
  );
}
