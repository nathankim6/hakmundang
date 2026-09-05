import { useState } from "react";
import { BookOpen } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Btn, GlassCard, Loading, Pill, Segmented, StatGrid, PageHeader } from "@/components/ui-kit";
import { useBank } from "@/lib/grammar/useBank";
import { toast } from "@/lib/grammar/store";
import { download, fmt } from "@/lib/grammar/engine";
import { docxBlob } from "@/lib/grammar/docx";
import { printHtml } from "@/lib/grammar/paper";
import { orunExam, orunPaper } from "@/lib/grammar/orun";
import { CIRC, type OrunBook, type OrunItem, type OrunTrack } from "@/lib/grammar/types";
import { coverUrl } from "@/lib/grammar/covers";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "옳은영어 커리큘럼 · 교재별 GRAMMAR CHECK" },
      {
        name: "description",
        content:
          "초등 옳은문법과 중등 ORUN METABOOK 교재의 챕터별 GRAMMAR CHECK·POP QUIZ 시험지를 확인하고 인쇄·Word로 저장하세요.",
      },
      { property: "og:title", content: "옳은영어 커리큘럼" },
      { property: "og:description", content: "교재 챕터별 시험지와 정답·해설을 한 곳에서." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BooksPage,
});

const TRACKS = [
  { v: "ele", label: "초등 · 옳은문법" },
  { v: "mid", label: "중등 · ORUN METABOOK" },
];

function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function ChkView({ it, showKey }: { it: OrunItem; showKey: boolean }) {
  const key: Record<number, { answer?: string; why?: string }> = {};
  (it.chk.answerKey || []).forEach((k) => (key[k.no] = k));
  return (
    <>
      {it.chk.questions.map((q, idx) => {
        const k = key[q.no] || {};
        return (
          <div key={idx}>
            {q.groupHeader && (
              <div className="mb-2 mt-4 rounded-2xl border-l-[3px] border-primary bg-info-soft px-3.5 py-2 text-[13.5px] font-bold">
                <Html html={fmt(q.groupHeader)} />
              </div>
            )}
            <div className="mb-2.5 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-md transition duration-300 hover:border-subtle/40 hover:shadow-[var(--shadow-soft)]">
              <div className="flex items-start gap-3">
                <span className="min-w-[26px] pt-0.5 text-[13.5px] font-extrabold text-primary">
                  {String(q.no).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  {q.stem && <Html className="block whitespace-pre-wrap leading-relaxed" html={fmt(q.stem)} />}
                  {!!q.bank?.length && (
                    <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-[13.5px]">
                      <b className="flex-none text-[11.5px] text-muted-foreground">보기</b>
                      <Html html={q.bank.map(fmt).join("&nbsp; &nbsp;")} />
                    </div>
                  )}
                  {!!q.bullets?.length && (
                    <div className="mt-1.5 pl-1">
                      {q.bullets.map((b, i) => (
                        <div key={i} className="my-0.5">
                          · <Html html={fmt(b)} />
                        </div>
                      ))}
                    </div>
                  )}
                  {!!q.choices?.length && (
                    <ol className="mt-2 grid list-none grid-cols-1 gap-x-6 gap-y-1 p-0 sm:grid-cols-2">
                      {q.choices.map((c, i) => (
                        <li key={i} className="text-sm leading-relaxed">
                          <Html html={`${CIRC[i]} ${fmt(c)}`} />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
              {showKey && (
                <div className="rise mt-3 border-t border-dashed border-border pt-2.5 text-[13px]">
                  <b className="font-extrabold text-destructive">정답</b> <Html html={fmt(k.answer || "")} />
                  <div className="mt-1 leading-relaxed text-muted-foreground">{k.why}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function RecView({ it, showKey }: { it: OrunItem; showKey: boolean }) {
  return (
    <>
      {(it.rec?.sections || []).map((sec, si) => (
        <GlassCard key={si} solid className="mb-3">
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <span className="rounded-xl bg-primary px-3 py-1.5 text-[12.5px] font-extrabold text-primary-foreground">
              {sec.label || sec.kind}
            </span>
            <span className="text-[13px] text-muted-foreground">{sec.instruction}</span>
          </div>
          {sec.rows.map((r, i) => (
            <div key={i} className="mb-2 rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex items-start gap-3">
                <span className="min-w-[26px] pt-0.5 text-[13.5px] font-extrabold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <Html className="block whitespace-pre-wrap leading-relaxed" html={fmt(r.prompt || "")} />
                  <div
                    className="mt-1.5 border-b border-dashed border-border"
                    style={{ height: (r.lines || 1) * 20 }}
                  />
                </div>
              </div>
              {showKey && (
                <div className="rise mt-2.5 border-t border-dashed border-border pt-2.5 text-[13px]">
                  <b className="font-extrabold text-destructive">정답</b> <Html html={fmt(r.answer || "")} />
                  <div className="mt-1 leading-relaxed text-muted-foreground">{r.why}</div>
                </div>
              )}
            </div>
          ))}
        </GlassCard>
      ))}
    </>
  );
}

function BooksPage() {
  const { bank } = useBank();
  const [track, setTrack] = useState<"ele" | "mid">("ele");
  const [bookId, setBookId] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [tab, setTab] = useState<"chk" | "rec">("chk");
  const [showKey, setShowKey] = useState(false);

  if (!bank) {
    return (
      <Shell>
        <Loading label="커리큘럼을 불러오는 중" />
      </Shell>
    );
  }

  const T: OrunTrack = bank.orun[track];
  const book: OrunBook | undefined = (T.books || []).find((b) => b.id === bookId);
  let item: OrunItem | undefined;
  if (book) for (const c of book.chapters) for (const i of c.items) if (i.id === itemId) item = i;

  const seg = (
    <Segmented
      className="mb-4 flex w-full max-w-[420px]"
      value={track}
      onChange={(v) => {
        setTrack(v as "ele" | "mid");
        setBookId(null);
        setChapter(null);
        setItemId(null);
      }}
      items={TRACKS}
    />
  );

  const doPrint = () => {
    if (book && item) printHtml(orunPaper(T, book, item, tab === "chk", showKey));
  };
  const doDocx = () => {
    if (!book || !item) return;
    try {
      const exam = orunExam(T, book, item, tab === "chk");
      download(
        docxBlob(exam, true),
        `${(book.short + "_" + item.t + "_" + (tab === "chk" ? T.check : T.recall)).replace(/[\\/:*?"<>|]/g, "-")}.docx`,
      );
      toast("Word 파일을 저장했습니다");
    } catch {
      toast("Word 생성 실패");
    }
  };

  return (
    <Shell>
      <h1 className="sr-only">옳은영어 커리큘럼</h1>
      <PageHeader eyebrow="WORKBOOK STUDIO" title="옳은영어 커리큘럼" desc="교재 챕터별 학습 자료를 제작합니다. (GRAMMAR CHECK, POP QUIZ, 정답·해설)" icon={<BookOpen size={26} strokeWidth={2.6} />} />
      {seg}

      {book && item ? (
        <>
          <button
            onClick={() => setItemId(null)}
            className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground"
          >
            ← {book.short}
          </button>
          <GlassCard solid className="mb-3.5">
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <span className="text-base font-bold">{item.t}</span>
              <span className="ml-auto text-[11.5px] font-semibold text-subtle">{item.src}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill on={tab === "chk"} onClick={() => setTab("chk")}>
                {T.check}
              </Pill>
              <Pill on={tab === "rec"} onClick={() => setTab("rec")}>
                {T.recall}
              </Pill>
              <span className="ml-auto flex flex-wrap items-center gap-2">
                <Btn variant="ghost" size="sm" onClick={doPrint}>
                  인쇄
                </Btn>
                <Btn variant="ghost" size="sm" onClick={doDocx}>
                  Word 저장
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? "정답 숨기기" : "정답 보기"}
                </Btn>
              </span>
            </div>
          </GlassCard>
          {tab === "chk" ? <ChkView it={item} showKey={showKey} /> : <RecView it={item} showKey={showKey} />}
        </>
      ) : book ? (
        <>
          <button
            onClick={() => setBookId(null)}
            className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground"
          >
            ← {T.vol} 커리큘럼 목록
          </button>
          <GlassCard solid className="mb-3.5">
            <div className="mb-4 flex flex-wrap items-center gap-3.5">
              {coverUrl(book.id) && (
                <img
                  src={coverUrl(book.id)}
                  alt={`${book.short} 교재 표지`}
                  className="aspect-[340/470] w-[64px] flex-none rounded-[4px_9px_9px_4px] object-cover shadow-[0_8px_22px_hsl(var(--foreground)/0.16),0_0_0_1px_hsl(var(--border))]"
                />
              )}
              <span className="text-base font-bold">{book.short}</span>
              <span className="ml-auto text-[11.5px] font-semibold text-subtle">{book.title}</span>
            </div>

            <div className="flex flex-col gap-2">
              {book.chapters.map((c) => {
                const op = chapter === c.no;
                return (
                  <div key={c.no} className="overflow-hidden rounded-2xl border border-border bg-card/70">
                    <button
                      onClick={() => setChapter(op ? null : c.no)}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-bold"
                    >
                      <span className={cn("text-[10px] text-subtle transition-transform", op && "rotate-90")}>▶</span>
                      <span className="text-muted-foreground">CHAPTER {c.no}</span>
                      <span className="truncate">{c.t}</span>
                      <span className="ml-auto text-[11px] font-semibold text-subtle">{c.items.length}</span>
                    </button>
                    {op && (
                      <div className="border-t border-border/70 p-2">
                        {c.items.map((i) => (
                          <div
                            key={i.id}
                            className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-muted/70"
                          >
                            <span className="min-w-[44px] text-[12px] font-bold text-primary">
                              {T.unit === "CHAPTER" ? `CH ${i.no}` : `U ${String(i.no).padStart(2, "0")}`}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[13px]">{i.t}</span>
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemId(i.id);
                                setTab("chk");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {T.check}
                            </Btn>
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemId(i.id);
                                setTab("rec");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {T.recall}
                            </Btn>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </>
      ) : (
        <>
          <StatGrid
            items={[
              { v: T.books.length, label: "교재" },
              {
                v: T.books.reduce((s, b) => s + b.chapters.reduce((t, c) => t + c.items.length, 0), 0),
                label: "시험지",
              },
              {
                v: T.books
                  .reduce(
                    (s, b) =>
                      s + b.chapters.reduce((t, c) => t + c.items.reduce((u, i) => u + i.chk.questions.length, 0), 0),
                    0,
                  )
                  .toLocaleString(),
                label: `${T.check} 문항`,
              },
              { v: T.recall, label: "회상형 시험지" },
            ]}
          />
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {T.books.map((b, i) => {
              const ns = b.chapters.reduce((t, c) => t + c.items.length, 0);
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setBookId(b.id);
                    setChapter(b.chapters[0]?.no ?? null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{ animationDelay: `${i * 24}ms` }}
                  className="lift rise glass-strong group relative flex gap-4 overflow-hidden rounded-2xl p-4 text-left"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.34,1.4,.5,1)] group-hover:scale-x-100"
                    style={{ background: "var(--gradient-gold)" }}
                  />
                  <span className="relative aspect-[340/470] w-[76px] flex-none overflow-hidden rounded-[4px_9px_9px_4px] bg-muted shadow-[0_8px_22px_hsl(var(--foreground)/0.16),0_0_0_1px_hsl(var(--border))] transition-transform duration-500 ease-[cubic-bezier(.34,1.4,.5,1)] group-hover:-rotate-2 group-hover:scale-105">
                    {coverUrl(b.id) ? (
                      <img
                        src={coverUrl(b.id)}
                        alt={`${b.short} 교재 표지`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-[10px] text-subtle">표지</span>
                    )}
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,hsl(var(--foreground)/.28)_0_4%,hsl(0_0%_100%/.5)_5.5%,hsl(var(--foreground)/.1)_9%,transparent_26%)]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="absolute right-4 top-4 text-[13px] font-black text-border">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <b className="mb-1.5 block pr-9 text-[14.5px] font-bold leading-snug">{b.short}</b>
                    <div className="min-h-[32px] text-[12px] leading-relaxed text-muted-foreground">
                      {b.pub ? `${b.pub} · ` : ""}
                      {b.chapters.length}개 챕터
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10.5px] font-extrabold">
                      <i className="rounded-md bg-info-soft px-2 py-0.5 not-italic text-info">시험지 {ns}</i>
                      <i className="rounded-md bg-success-soft px-2 py-0.5 not-italic text-success">{T.check}</i>
                      <i className="rounded-md bg-muted px-2 py-0.5 not-italic text-muted-foreground">{T.recall}</i>
                    </div>
                  </span>

                </button>
              );
            })}
          </div>
        </>
      )}
    </Shell>
  );
}


