import { Search } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Btn, CardTitle, GlassCard, Loading, Pill, Segmented, StatGrid, PageHeader } from "@/components/ui-kit";
import { useBank } from "@/lib/grammar/useBank";
import { setState, toast, useApp } from "@/lib/grammar/store";
import { download, fmt, gcats } from "@/lib/grammar/engine";
import { docxBlob } from "@/lib/grammar/docx";
import { CIRC, GRADES, LVS, type Cat, type Question } from "@/lib/grammar/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bank")({
  head: () => ({
    meta: [
      { title: "문제은행 · 옳은문법 중고등 영문법 문항" },
      {
        name: "description",
        content: "중1부터 고등 공통영어까지 문법 항목별 문항을 난이도·유형으로 탐색하고 정답과 해설을 확인하세요.",
      },
      { property: "og:title", content: "옳은문법 문제은행" },
      { property: "og:description", content: "문법 항목별 영문법 문항을 난이도·유형별로 탐색합니다." },
    ],
  }),
  component: BankPage,
});

function QuestionCard({ q, showKey }: { q: Question; showKey: boolean }) {
  const answer =
    q.type === "mc"
      ? `${CIRC[(q.answer as number) - 1]} ${(q.choices || [])[(q.answer as number) - 1]}`
      : String(q.answer);
  return (
    <div className="mb-2.5 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-md transition duration-300 hover:border-subtle/40 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <span className="min-w-[26px] pt-0.5 text-[13.5px] font-extrabold text-primary">
          {String(q.no).padStart(3, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: fmt(q.stem) }} />
          {q.type === "mc" && (
            <ol className="mt-2 grid list-none grid-cols-1 gap-x-6 gap-y-1 p-0 sm:grid-cols-2">
              {(q.choices || []).map((c, i) => (
                <li key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: `${CIRC[i]} ${fmt(c)}` }} />
              ))}
            </ol>
          )}
        </div>
        <span className="ml-auto flex flex-none gap-1">
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
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-extrabold text-muted-foreground">
            {q.type === "mc" ? "객관식" : "주관식"}
          </span>
        </span>
      </div>
      {showKey && (
        <div className="rise mt-3 border-t border-dashed border-border pt-2.5 text-[13px]">
          <b className="font-extrabold text-destructive">정답</b>{" "}
          <span dangerouslySetInnerHTML={{ __html: fmt(answer) }} />
          {q.alt?.length ? (
            <span className="text-muted-foreground"> (허용: {q.alt.join(", ")})</span>
          ) : null}
          <div className="mt-1 leading-relaxed text-muted-foreground">{q.why}</div>
        </div>
      )}
    </div>
  );
}

function CatDetail({ cat }: { cat: Cat }) {
  const S = useApp();
  let qs = cat.questions;
  if (S.lv !== "전체") qs = qs.filter((q) => q.level === S.lv);
  if (S.ty !== "전체") qs = qs.filter((q) => q.type === (S.ty === "객관식" ? "mc" : "short"));

  const saveDocx = () => {
    try {
      download(
        docxBlob(
          {
            cfg: { title: cat.name + " 문제은행", grade: cat.grade, book: "" } as never,
            qs: cat.questions.map((q, i) => ({ ...q, cat: cat.name, catId: cat.id, grade: cat.grade, seq: i + 1 })),
          },
          true,
        ),
        `${cat.name.replace(/[\\/:*?"<>|]/g, "-")}_${cat.questions.length}문항.docx`,
      );
      toast("Word 파일을 저장했습니다");
    } catch {
      toast("Word 생성 실패");
    }
  };

  return (
    <>
      <button
        onClick={() => setState({ cat: null })}
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground"
      >
        ← {S.grade} 문법 카테고리
      </button>
      <GlassCard solid className="mb-3.5">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="text-base font-bold">{cat.name}</span>
          <span className="ml-auto text-[11.5px] font-semibold text-subtle">{cat.points.join(" · ")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["전체", ...LVS] as string[]).map((l) => (
            <Pill key={l} on={S.lv === l} onClick={() => setState({ lv: l })}>
              {l}
            </Pill>
          ))}
          <span className="w-2" />
          {["전체", "객관식", "주관식"].map((t) => (
            <Pill key={t} on={S.ty === t} onClick={() => setState({ ty: t })}>
              {t}
            </Pill>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <span className="text-[12.5px] text-muted-foreground">{qs.length}문항</span>
            <Btn variant="ghost" size="sm" onClick={saveDocx}>
              Word 저장
            </Btn>
            <Btn
              variant="danger"
              size="sm"
              onClick={() => setState({ showKey: !S.showKey })}
            >
              {S.showKey ? "정답 숨기기" : "정답 보기"}
            </Btn>
          </span>
        </div>
      </GlassCard>
      {qs.map((q, i) => (
        <QuestionCard key={i} q={q} showKey={S.showKey} />
      ))}
    </>
  );
}

function BankPage() {
  const S = useApp();
  const { bank, byId } = useBank();

  return (
    <Shell>
      <h1 className="sr-only">옳은문법 문제은행</h1>
      <PageHeader eyebrow="QUESTION STUDIO" title="문제은행" desc="카테고리별 문항을 검색하고 자료로 저장합니다. (문항 검색, 난이도, Word 내보내기)" icon={<Search size={26} strokeWidth={2.6} />} />
      {!bank ? (
        <Loading />
      ) : S.cat && byId[S.cat] ? (
        <CatDetail cat={byId[S.cat]!} />
      ) : (
        (() => {
          const cats = gcats(bank.cats, S.grade);
          const n = cats.reduce((s, c) => s + c.questions.length, 0);
          return (
            <>
              <Segmented
                className="mb-4 flex w-full max-w-[420px]"
                value={S.grade}
                onChange={(g) => setState({ grade: g, book: null, cat: null })}
                items={GRADES.map((g) => ({ v: g, label: g }))}
              />
              <StatGrid
                items={[
                  { v: bank.cats.length, label: "전체 문법 항목" },
                  { v: bank.cats.reduce((s, c) => s + c.questions.length, 0).toLocaleString(), label: "전체 문항" },
                  { v: cats.length, label: `${S.grade} 항목` },
                  { v: n.toLocaleString(), label: `${S.grade} 문항` },
                  { v: (bank.books[S.grade] || []).length, label: "연계 교과서" },
                ]}
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cats.map((c, i) => {
                  const mc = c.questions.filter((q) => q.type === "mc").length;
                  const short = c.questions.filter((q) => q.type === "short").length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setState({ cat: c.id, lv: "전체", ty: "전체" })}
                      style={{ animationDelay: `${i * 22}ms` }}
                      className="lift rise glass-elevated group relative overflow-hidden rounded-2xl p-5 text-left"
                    >
                      <span
                        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.34,1.4,.5,1)] group-hover:scale-x-100"
                        style={{ background: "var(--gradient-gold)" }}
                      />
                      <span className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-border/60 text-[11px] font-black text-muted-foreground transition-colors duration-300 group-hover:bg-gold group-hover:text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <b className="mb-2 block pr-10 text-[15px] font-bold leading-snug tracking-tight">
                        {c.name}
                      </b>
                      <div className="min-h-[34px] text-[12px] leading-relaxed text-muted-foreground">
                        {c.points.slice(0, 2).join(" · ")}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                        <div className="flex gap-1.5 text-[10.5px] font-extrabold">
                          <i className="rounded-lg bg-info-soft px-2 py-1 not-italic text-info">
                            {c.questions.length}문항
                          </i>
                          <i className="rounded-lg bg-[color-mix(in_oklab,var(--gold)_16%,white)] px-2 py-1 not-italic text-gold-deep">
                            객 {mc}
                          </i>
                          <i className="rounded-lg bg-muted px-2 py-1 not-italic text-muted-foreground">
                            주 {short}
                          </i>
                        </div>
                        <span className="text-[11px] font-bold text-subtle opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          자세히 →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          );
        })()
      )}
    </Shell>
  );
}
