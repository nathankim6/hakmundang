import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { BookTree, CatRow, TreeShell } from "@/components/selection-tree";
import {
  Btn,
  CardTitle,
  GlassCard,
  Loading,
  NumInput,
  Pill,
  Segmented,
  StatGrid,
  Switch,
  TextInput, PageHeader } from "@/components/ui-kit";
import { useBank } from "@/lib/grammar/useBank";
import {
  setSel,
  setState,
  setTotal,
  toast,
  useApp,
} from "@/lib/grammar/store";
import {
  download,
  encCfg,
  gcats,
  pickQuestions,
  poolStat,
  rememberUsed,
} from "@/lib/grammar/engine";
import { paperHtml, printHtml } from "@/lib/grammar/paper";
import { docxBlob } from "@/lib/grammar/docx";
import { GRADES, LVS, type ExamCfg } from "@/lib/grammar/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "옳은문법 · 중고등 영문법 시험지 출제 마법사" },
      {
        name: "description",
        content:
          "교과서 단원과 난이도별로 중·고등 영문법 문항을 골라 A4 시험지와 정답해설지를 즉시 인쇄·Word로 저장하세요.",
      },
      { property: "og:title", content: "옳은문법 ORUN GRAMMAR · 영문법 시험지 출제" },
      {
        property: "og:description",
        content: "교과서 단원·난이도별 영문법 문제은행에서 A4 시험지를 1분 만에 만듭니다.",
      },
    ],
  }),
  component: WizardPage,
});

function Sidebar() {
  const { grade, book } = useApp();
  const { bank } = useBank();
  const books = bank?.books || {};
  const totalBooks = Object.keys(books).reduce((s, k) => s + (books[k]?.length || 0), 0);

  const Row = ({
    on,
    label,
    n,
    onClick,
  }: {
    on: boolean;
    label: string;
    n?: number | string;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "mb-1.5 flex cursor-pointer items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
        on
          ? "bg-primary text-primary-foreground shadow-[0_8px_20px_oklch(0.264_0.037_260/0.26)]"
          : "bg-card/60 hover:translate-x-0.5 hover:bg-accent",
      )}
    >
      <span
        className={cn(
          "h-[7px] w-[7px] flex-none rounded-full transition",
          on ? "bg-gold shadow-[0_0_0_3px_oklch(0.815_0.152_79/0.25)]" : "bg-border",
        )}
      />
      <span className="truncate">{label}</span>
      <span className={cn("ml-auto text-[11px] font-semibold", on ? "opacity-60" : "text-subtle")}>
        {n}
      </span>
    </div>
  );

  return (
    <GlassCard className="sticky top-[78px] max-h-[calc(100vh-104px)] overflow-auto">
      <CardTitle right={`${totalBooks}종`}>학년 · 교재</CardTitle>
      <Link
        to="/books"
        className="glass-strong mb-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-bold transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)] hover:translate-x-0.5"
      >
        <span className="h-[7px] w-[7px] flex-none rounded-full bg-gold shadow-[0_0_0_3px_oklch(0.815_0.152_79/0.25)]" />
        <span className="truncate">옳은영어 커리큘럼</span>
        <span className="ml-auto text-[11px] font-semibold text-subtle">→</span>
      </Link>
      <div className="mb-2 mt-0 px-1 text-[11px] font-extrabold tracking-[0.14em] text-subtle">중등</div>
      {["중1", "중2", "중3"].map((g) => (
        <div key={g}>
          <Row
            on={grade === g && !book}
            label={`${g} 전체 문법`}
            n={bank ? gcats(bank.cats, g).length : 0}
            onClick={() => setState({ grade: g, book: null, cat: null })}
          />
          {grade === g &&
            (books[g] || []).map((b) => (
              <Row
                key={b.pub}
                on={grade === g && book === b.pub}
                label={b.pub}
                onClick={() => setState({ grade: g, book: b.pub, mode: "book", open: [1] })}
              />
            ))}
        </div>
      ))}
      <div className="mb-2 mt-4 px-1 text-[11px] font-extrabold tracking-[0.14em] text-subtle">
        고등 · 공통영어
      </div>
      <Row
        on={grade === "고등" && !book}
        label="고등 전체 문법"
        n={bank ? gcats(bank.cats, "고등").length : 0}
        onClick={() => setState({ grade: "고등", book: null, cat: null })}
      />
      {grade === "고등" &&
        (books["고등"] || []).map((b) => (
          <Row
            key={b.pub}
            on={book === b.pub}
            label={b.pub}
            onClick={() => setState({ grade: "고등", book: b.pub, mode: "book", open: [1] })}
          />
        ))}
    </GlassCard>
  );
}

function Steps() {
  const { step } = useApp();
  const item = (n: 1 | 2, title: string, sub: string) => {
    const on = step === n;
    const done = step > n;
    return (
      <div
        className={cn(
          "relative flex flex-1 items-center gap-3 overflow-hidden rounded-2xl px-5 py-3.5 text-[13.5px] font-bold transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
          on && "sheen text-primary-foreground shadow-[0_10px_28px_oklch(0.264_0.037_260/0.28)]",
          done && "bg-success-soft text-success",
          !on && !done && "bg-card/60 text-muted-foreground",
        )}
        style={on ? { background: "var(--gradient-navy)" } : undefined}
      >
        <b
          className={cn(
            "grid h-[23px] w-[23px] flex-none place-items-center rounded-full text-[11.5px]",
            on ? "bg-gold text-primary" : done ? "bg-success text-primary-foreground" : "bg-border text-card",
          )}
        >
          {done ? "✓" : n}
        </b>
        {title}
        <small className={cn("ml-auto text-[11.5px] font-medium", on ? "opacity-70" : "text-subtle")}>
          {sub}
        </small>
      </div>
    );
  };
  return (
    <div className="mb-4 flex gap-3">
      {item(1, "문항 검색", "단원 · 난이도 선택")}
      {item(2, "시험지 만들기", "인쇄 · Word · 배포")}
    </div>
  );
}

function Step1() {
  const S = useApp();
  const { bank, byId } = useBank();
  if (!bank) return <Loading />;

  const stat = poolStat(byId, S.sel);
  const lvSum = LVS.reduce((s, l) => s + (S.lvN[l] || 0), 0);
  const tySum = S.tyN.mc + S.tyN.short;
  const enough = LVS.every((l) => stat[l].mc + stat[l].short >= (S.lvN[l] || 0));
  const ok = S.sel.length > 0 && lvSum === S.total && tySum === S.total && S.total > 0 && enough;

  let msg = (
    <span className="text-[12px] font-semibold text-success">
      ✓ 선택 범위 {stat.all.toLocaleString()}문항 중 {S.total}문항을 출제합니다.
    </span>
  );
  if (!S.sel.length)
    msg = <span className="text-[12px] font-semibold text-destructive">단원 또는 문법 항목을 선택하세요.</span>;
  else if (lvSum !== S.total)
    msg = (
      <span className="text-[12px] font-semibold text-destructive">
        난이도 합계 {lvSum} ≠ 총 {S.total}문항
      </span>
    );
  else if (tySum !== S.total)
    msg = (
      <span className="text-[12px] font-semibold text-destructive">
        유형 합계 {tySum} ≠ 총 {S.total}문항
      </span>
    );
  else if (!enough)
    msg = (
      <span className="text-[12px] font-semibold text-destructive">
        선택 범위에 해당 난이도 문항이 부족합니다.
      </span>
    );

  const currentBook = (bank.books[S.grade] || []).find((b) => b.pub === S.book);

  const selectAll = (on: boolean) => {
    let ids: string[] = [];
    if (currentBook && S.mode === "book") currentBook.lessons.forEach((l) => (ids = ids.concat(l.ids)));
    else ids = gcats(bank.cats, S.grade).map((c) => c.id);
    setSel(ids, on);
  };

  const makeExam = () => {
    const cfg: ExamCfg = {
      title: S.title || `${S.book ? S.book + " " : ""}${S.grade} 문법 TEST`,
      grade: S.grade,
      book: S.book || "",
      cats: S.sel,
      lvN: { ...S.lvN },
      tyN: { ...S.tyN },
      total: S.total,
      noDup: S.noDup,
      seed: Date.now() % 2147483647,
    };
    const qs = pickQuestions(byId, cfg);
    if (qs.length < cfg.total) toast(`조건에 맞는 문항이 부족합니다 (${qs.length}/${cfg.total})`);
    if (S.noDup) rememberUsed(qs);
    setState({ exam: { cfg, qs }, step: 2 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <GlassCard solid className="mb-4">
        <CardTitle right={S.book ? `${S.grade} · ${S.book}` : `${S.grade} 전체 문법`}>
          Step 1. 문항 검색
        </CardTitle>
        {S.book && (
          <Segmented
            className="mb-3"
            value={S.mode}
            onChange={(v) => setState({ mode: v as "book" | "cat" })}
            items={[
              { v: "book", label: "교과서 단원별" },
              { v: "cat", label: "문법 카테고리별" },
            ]}
          />
        )}
        {currentBook && S.mode === "book" ? (
          <BookTree book={currentBook} byId={byId} />
        ) : (
          <TreeShell>
            {gcats(bank.cats, S.grade).map((c) => (
              <CatRow key={c.id} cat={c} currentGrade={S.grade} />
            ))}
          </TreeShell>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Btn variant="ghost" size="sm" onClick={() => selectAll(true)}>
            범위 전체 선택
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => selectAll(false)}>
            선택 해제
          </Btn>
          <span className="ml-auto text-[12.5px] text-muted-foreground">
            선택 <b className="text-foreground">{S.sel.length}</b>개 항목 · 보유{" "}
            {stat.all.toLocaleString()}문항
          </span>
        </div>
      </GlassCard>

      <GlassCard solid>
        <CardTitle>출제 옵션</CardTitle>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="glass-strong rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-extrabold tracking-wide text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              총 문항수
            </div>
            <div className="flex items-end gap-4">
              <div className="relative">
                <NumInput
                  value={S.total}
                  min={1}
                  onChange={(n) => setTotal(n)}
                  className="h-14 w-28 rounded-2xl border-glass-line bg-card/80 text-center text-2xl font-black shadow-inner"
                />
                <span className="absolute -bottom-5 left-0 right-0 text-center text-[11px] font-semibold text-muted-foreground">
                  직접 입력
                </span>
              </div>
              <div className="flex flex-1 flex-wrap gap-1.5 pb-5">
                {[10, 15, 20, 25, 30, 35, 40, 45, 50].map((n) => (
                  <Pill key={n} on={S.total === n} onClick={() => setTotal(n)}>
                    {n}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-extrabold tracking-wide text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-info" />
              문항 유형
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="glass flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                <span className="text-[12.5px] font-extrabold text-info">객관식</span>
                <NumInput value={S.tyN.mc} onChange={(n) => setState({ tyN: { ...S.tyN, mc: n } })} />
              </span>
              <span className="glass flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                <span className="text-[12.5px] font-extrabold text-gold-deep">주관식</span>
                <NumInput value={S.tyN.short} onChange={(n) => setState({ tyN: { ...S.tyN, short: n } })} />
              </span>
              <span className="text-[12px] font-semibold text-muted-foreground">
                보유 객 {LVS.reduce((s, l) => s + stat[l].mc, 0)} · 주{" "}
                {LVS.reduce((s, l) => s + stat[l].short, 0)}
              </span>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-extrabold tracking-wide text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              난이도 구성
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {LVS.map((l) => (
                <span
                  key={l}
                  className={cn(
                    "glass flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 transition-shadow duration-300",
                    l === "상" ? "glow-destructive" : l === "중" ? "glow-gold" : "glow-success",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black",
                      l === "상" ? "bg-destructive-soft text-destructive" : l === "중" ? "bg-[color-mix(in_oklab,var(--gold)_18%,white)] text-gold-deep" : "bg-success-soft text-success",
                    )}
                  >
                    {l}
                  </span>
                  <NumInput value={S.lvN[l] || 0} onChange={(n) => setState({ lvN: { ...S.lvN, [l]: n } })} />
                </span>
              ))}
              <span className="text-[12px] font-semibold text-muted-foreground">
                보유 {LVS.map((l) => `${l} ${stat[l].mc + stat[l].short}`).join(" · ")}
              </span>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-extrabold tracking-wide text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              시험 제목
            </div>
            <TextInput
              className="h-12 rounded-2xl border-glass-line bg-card/80 text-base font-bold shadow-inner"
              placeholder="예: 2학기 중간고사 대비 문법 TEST"
              value={S.title}
              onChange={(e) => setState({ title: e.target.value })}
            />
          </div>

          <div className="glass-strong rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-extrabold tracking-wide text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              중복 출제
            </div>
            <Switch on={S.noDup} onToggle={() => setState({ noDup: !S.noDup })}>
              이전에 출제한 문항 제외
            </Switch>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3.5 rounded-2xl border border-glass-line bg-card/50 p-4 backdrop-blur-xl">
          {msg}
          <Btn variant="gold" className="ml-auto" disabled={!ok} onClick={makeExam}>
            시험지 만들기 →
          </Btn>
        </div>
      </GlassCard>
    </>
  );
}

function Preview({ html }: { html: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const w = wrap.current?.clientWidth;
      if (!w || !inner.current) return;
      const sc = Math.min(1, (w - 40) / 794);
      inner.current.querySelectorAll<HTMLElement>(".sheet").forEach((s) => {
        s.style.transformOrigin = "top left";
        s.style.transform = `scale(${sc})`;
        s.style.marginBottom = `${16 - (1 - sc) * 1122}px`;
      });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [html]);
  return (
    <div
      ref={wrap}
      className="max-h-[78vh] overflow-auto rounded-2xl border border-border p-5"
      style={{ background: "color-mix(in oklab, var(--foreground) 8%, white)" }}
    >
      <div ref={inner} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function Step2() {
  const S = useApp();
  const [code, setCode] = useState<string | null>(null);
  const exam = S.exam!;
  const lv = { 상: 0, 중: 0, 하: 0 } as Record<string, number>;
  const ty = { mc: 0, short: 0 } as Record<string, number>;
  const cat: Record<string, number> = {};
  exam.qs.forEach((q) => {
    lv[q.level]!++;
    ty[q.type]!++;
    cat[q.cat] = (cat[q.cat] || 0) + 1;
  });

  const saveDocx = (withKey: boolean) => {
    try {
      download(
        docxBlob(exam, withKey),
        exam.cfg.title.replace(/[\\/:*?"<>|]/g, "-") + (withKey ? "_정답해설" : "") + ".docx",
      );
      toast("Word 파일을 저장했습니다");
    } catch (e) {
      toast("Word 생성 실패: " + (e as Error).message);
    }
  };

  return (
    <>
      <GlassCard solid className="mb-4">
        <CardTitle right={exam.cfg.title}>Step 2. 시험지 만들기</CardTitle>
        <StatGrid
          items={[
            { v: exam.qs.length, label: "총 문항" },
            { v: ty["mc"], label: "객관식 (5지선다)", tone: "text-info" },
            { v: ty["short"], label: "주관식", tone: "text-gold-deep" },
            {
              v: <span className="text-base">{`상 ${lv["상"]} · 중 ${lv["중"]} · 하 ${lv["하"]}`}</span>,

              label: "난이도 구성",
            },
            { v: Object.keys(cat).length, label: "출제 문법 항목" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => printHtml(paperHtml(exam, false))}>문제지 인쇄</Btn>
          <Btn variant="ghost" onClick={() => printHtml(paperHtml(exam, true))}>
            문제지 + 정답해설지
          </Btn>
          <Btn variant="ghost" onClick={() => saveDocx(false)}>
            Word 다운로드
          </Btn>
          <Btn variant="ghost" onClick={() => saveDocx(true)}>
            Word (정답해설 포함)
          </Btn>
          <Btn
            variant="gold"
            onClick={() => {
              setCode(encCfg(exam.cfg));
              toast("응시 코드를 만들었습니다");
            }}
          >
            학생 응시 코드
          </Btn>
          <Btn variant="ghost" onClick={() => setState({ step: 1 })}>
            ← 조건 수정
          </Btn>
        </div>
        {code && (
          <div className="mt-4 rise">
            <p className="mb-2 text-[12.5px] text-muted-foreground">
              학생에게 아래 코드를 전달하세요. [학생 응시] 탭에 붙여 넣으면 같은 시험이 열립니다.
            </p>
            <div className="select-all break-all rounded-xl border border-border bg-muted p-3.5 font-mono text-[12px] leading-relaxed">
              {code}
            </div>
            <Btn
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                navigator.clipboard?.writeText(code);
                toast("응시 코드를 복사했습니다");
              }}
            >
              코드 복사
            </Btn>
          </div>
        )}
      </GlassCard>

      <GlassCard solid>
        <CardTitle right="A4 · 실제 인쇄와 동일">미리보기</CardTitle>
        <Preview html={paperHtml(exam, false)} />
      </GlassCard>
    </>
  );
}

function WizardPage() {
  const S = useApp();
  return (
    <Shell>
      <h1 className="sr-only">옳은문법 영문법 시험지 출제 마법사</h1>
      <PageHeader eyebrow="EXAM STUDIO" title="시험지 출제" desc="교재·카테고리별 맞춤 시험지를 제작합니다. (문항 선택, 난이도 구성, 인쇄)" icon={<FileText size={26} strokeWidth={2.6} />} />
      <div className="grid items-start gap-4 lg:grid-cols-[254px_1fr]">
        <Sidebar />
        <div>
          <Steps />
          {S.step === 1 || !S.exam ? <Step1 /> : <Step2 />}
        </div>
      </div>
      <div className="sr-only">{GRADES.join(" ")}</div>
    </Shell>
  );
}
