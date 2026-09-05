import { ClipboardList } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Btn, CardTitle, GlassCard, StatGrid, TextInput, PageHeader } from "@/components/ui-kit";
import { ReportView } from "@/components/report-view";
import { toast, type Report } from "@/lib/grammar/store";
import { download } from "@/lib/grammar/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "응시 기록 · ORUN GRAMMAR 성적 리포트" },
      {
        name: "description",
        content: "학생별 응시 점수를 한눈에 보고, 개별 리포트로 문법 항목별 정답률과 오답 해설을 확인하세요.",
      },
      { property: "og:title", content: "ORUN GRAMMAR 응시 기록" },
      { property: "og:description", content: "응시 점수와 학생별 리포트를 확인하고 CSV로 내보냅니다." },
    ],
  }),
  component: RecordsPage,
});

type Rec = {
  org?: string;
  name: string;
  cls: string;
  phone4?: string;
  title: string;
  grade: string;
  date: string;
  score: number;
  total: number;
  right: number;
  report?: Report;
};

function RecordsPage() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    try {
      setRecs(JSON.parse(localStorage.getItem("og.records") || "[]"));
    } catch {
      setRecs([]);
    }
  }, []);

  const rows = recs.filter(
    (r) =>
      !q.trim() ||
      [r.org, r.name, r.cls, r.phone4, r.title, r.grade]
        .join(" ")
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
  const best = rows.length ? Math.max(...rows.map((r) => r.score)) : 0;

  const exportCsv = () => {
    const csv =
      "\uFEFF" +
      ["소속,반,이름,번호,시험명,학년,응시일시,점수,정답,문항수"]
        .concat(
          rows.map((r) =>
            [r.org ?? "", r.cls, r.name, r.phone4 ?? "", r.title, r.grade, r.date, r.score, r.right, r.total]
              .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
              .join(","),
          ),
        )
        .join("\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), "ORUN_응시기록.csv");
    toast("CSV로 내보냈습니다");
  };

  const clearAll = () => {
    if (!confirm("이 기기의 모든 응시 기록을 삭제할까요?")) return;
    localStorage.removeItem("og.records");
    setRecs([]);
    setOpen(null);
    toast("기록을 삭제했습니다");
  };

  const cur = open !== null ? rows[open] : null;

  return (
    <Shell>
      <h1 className="sr-only">ORUN GRAMMAR 응시 기록</h1>
      <PageHeader
        eyebrow="RECORDS STUDIO"
        title="응시 기록"
        desc="학생별 응시 결과를 확인하고 리포트를 열람합니다. (점수, 응시일, 문법 항목별 분석)"
        icon={<ClipboardList size={26} strokeWidth={2.6} />}
      />

      {cur && cur.report ? (
        <>
          <div className="mb-3.5">
            <Btn variant="ghost" size="sm" onClick={() => setOpen(null)}>
              ← 목록으로
            </Btn>
          </div>
          <ReportView
            report={cur.report}
            who={{ org: cur.org, cls: cur.cls, name: cur.name, phone4: cur.phone4 }}
          />
        </>
      ) : (
        <>
          <StatGrid
            items={[
              { v: rows.length, label: "응시 횟수" },
              { v: avg, label: "평균 점수" },
              { v: best, label: "최고 점수" },
              { v: new Set(rows.map((r) => r.name)).size, label: "응시 학생" },
            ]}
          />
          <GlassCard solid>
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <CardTitle className="mb-0">응시 기록</CardTitle>
              <span className="ml-auto flex flex-wrap items-center gap-2">
                <TextInput
                  className="max-w-[200px]"
                  placeholder="소속 · 이름 · 시험명 검색"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Btn variant="ghost" size="sm" onClick={exportCsv}>
                  CSV 내보내기
                </Btn>
                <Btn variant="danger" size="sm" onClick={clearAll}>
                  전체 삭제
                </Btn>
              </span>
            </div>

            {!rows.length ? (
              <div className="rounded-2xl border border-dashed border-border py-14 text-center text-[13px] text-muted-foreground">
                아직 저장된 응시 기록이 없습니다. 시험 응시에서 답안을 제출하면 이곳에 쌓입니다.
              </div>
            ) : (
              <div className="overflow-auto rounded-2xl border border-border">
                <table className="w-full border-separate border-spacing-0 bg-card text-[13px]">
                  <thead>
                    <tr className="bg-muted text-[12px] font-bold text-muted-foreground">
                      {["소속", "반", "이름", "번호", "시험명", "응시일시", "정답", "점수", "리포트"].map((h) => (
                        <th key={h} className="p-2.5 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="transition-colors hover:bg-muted/60">
                        <td className="border-t border-border p-2.5 text-muted-foreground">{r.org || "—"}</td>
                        <td className="border-t border-border p-2.5 text-muted-foreground">{r.cls || "—"}</td>
                        <td className="border-t border-border p-2.5 font-semibold">{r.name}</td>
                        <td className="border-t border-border p-2.5 text-muted-foreground">{r.phone4 || "—"}</td>
                        <td className="border-t border-border p-2.5">{r.title}</td>
                        <td className="border-t border-border p-2.5 text-muted-foreground">{r.date}</td>
                        <td className="border-t border-border p-2.5 text-muted-foreground">
                          {r.right}/{r.total}
                        </td>
                        <td
                          className={cn(
                            "border-t border-border p-2.5 font-extrabold",
                            r.score >= 80 ? "text-success" : r.score >= 60 ? "text-gold-deep" : "text-destructive",
                          )}
                        >
                          {r.score}
                        </td>
                        <td className="border-t border-border p-2.5">
                          {r.report ? (
                            <Btn size="sm" variant="ghost" onClick={() => setOpen(i)}>
                              리포트
                            </Btn>
                          ) : (
                            <span className="text-[11.5px] text-subtle">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      )}
    </Shell>
  );
}
