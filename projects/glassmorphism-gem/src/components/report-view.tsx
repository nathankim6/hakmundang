import { useEffect } from "react";
import { Btn, CardTitle, GlassCard } from "@/components/ui-kit";
import { esc, fmt } from "@/lib/grammar/engine";
import { CIRC, LVS } from "@/lib/grammar/types";
import type { Report } from "@/lib/grammar/store";
import { cn } from "@/lib/utils";

export interface Who {
  org?: string | undefined;
  cls?: string | undefined;
  name?: string | undefined;
  phone4?: string | undefined;
}

export function ReportView({
  report: R,
  who,
  actions,
}: {
  report: Report;
  who: Who;
  actions?: React.ReactNode;
}) {
  const tot = R.rows.length;
  const right = R.rows.filter((r) => r.ok).length;
  const weak = Object.keys(R.cat).filter(
    (n) => R.cat[n]![1] >= 2 && R.cat[n]![0] / R.cat[n]![1] < 0.6,
  );
  const dash = 314;
  const when = R.when instanceof Date ? R.when : new Date(R.when);

  useEffect(() => {
    const el = document.getElementById("ringfg");
    if (el)
      setTimeout(() => (el.style.strokeDashoffset = String(dash - (dash * R.score) / 100)), 60);
  }, [R.score]);

  const printReport = () => {
    const el = document.getElementById("paper");
    if (!el) return;
    el.innerHTML =
      '<div class="sheet"><div class="exh"><div class="lft"><div class="bar"></div><div>' +
      '<div class="t0">SCORE REPORT</div><div class="t1">' +
      esc(R.cfg.title) +
      '</div></div></div><div class="rgt"><b>옳은영어</b>ORUN GRAMMAR</div></div>' +
      '<div class="exi"><div><span>이름</span><i>' +
      esc(who.name || "-") +
      '</i></div><div><span>소속/반</span><i>' +
      esc([who.org, who.cls].filter(Boolean).join(" ") || "-") +
      '</i></div><div class="sc"><span>점수</span><i>' +
      R.score +
      " / 100 (" +
      right +
      "/" +
      tot +
      ")</i></div></div>" +
      '<div style="margin:12px 0 5px;font-size:11px;font-weight:800;color:#5b6b7c">문법 항목별 정답률</div>' +
      Object.keys(R.cat)
        .map((n) => {
          const o = R.cat[n]![0];
          const t = R.cat[n]![1];
          const p = Math.round((100 * o) / t);
          return (
            '<div style="display:grid;grid-template-columns:150px 1fr 64px;gap:8px;align-items:center;font-size:10px;margin-bottom:4px"><span>' +
            esc(n) +
            '</span><div style="background:#eef1f6;border-radius:9px;height:8px;overflow:hidden">' +
            '<div style="height:100%;width:' +
            p +
            "%;background:" +
            (p < 60 ? "#e0524d" : "#0f1b2d") +
            ';border-radius:9px"></div></div>' +
            '<span style="text-align:right;color:#5b6b7c;font-weight:700">' +
            o +
            "/" +
            t +
            " (" +
            p +
            "%)</span></div>"
          );
        })
        .join("") +
      '<table class="ktab" style="margin-top:12px"><tr><th style="width:24px">No</th><th>문제 · 오답 해설</th>' +
      '<th style="width:34px">결과</th><th style="width:80px">내 답</th><th style="width:110px">정답</th></tr>' +
      R.rows
        .map((r) => {
          const q = r.q;
          return (
            '<tr><td class="n">' +
            q.seq +
            "</td><td>" +
            fmt(q.stem) +
            (r.ok
              ? ""
              : '<div style="color:#8a97a8;margin-top:2px;font-size:9px">' + esc(q.why) + "</div>") +
            '</td><td style="text-align:center;font-weight:900;color:' +
            (r.ok ? "#0b7a56" : "#b8332e") +
            '">' +
            (r.ok ? "O" : "X") +
            "</td><td>" +
            (q.type === "mc" ? (r.my ? CIRC[(r.my as number) - 1] : "—") : esc(String(r.my || "—"))) +
            '</td><td class="a">' +
            (q.type === "mc" ? CIRC[(q.answer as number) - 1] : fmt(String(q.answer))) +
            "</td></tr>"
          );
        })
        .join("") +
      '</table><div class="exf"><b>ORUN GRAMMAR</b>&nbsp;· 성적 리포트<span class="pg">1 / 1</span></div></div>';
    setTimeout(() => window.print(), 150);
  };

  return (
    <>
      <GlassCard solid className="mb-3.5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative h-[118px] w-[118px] flex-none">
            <svg width="118" height="118" className="-rotate-90">
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="oklch(0.815 0.152 79)" />
                  <stop offset="1" stopColor="oklch(0.264 0.037 260)" />
                </linearGradient>
              </defs>
              <circle cx="59" cy="59" r="50" fill="none" strokeWidth="11" stroke="oklch(0.94 0.008 250)" />
              <circle
                id="ringfg"
                cx="59"
                cy="59"
                r="50"
                fill="none"
                strokeWidth="11"
                strokeLinecap="round"
                stroke="url(#gr)"
                strokeDasharray={dash}
                strokeDashoffset={dash}
                style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.34,1.4,.5,1)" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <b className="text-3xl font-extrabold leading-none tracking-tighter">{R.score}</b>
              <span className="text-[10.5px] font-bold text-subtle">/ 100점</span>
            </div>
          </div>
          <div>
            <div className="text-[17px] font-bold">
              {who.name}
              {(who.org || who.cls) && (
                <span className="ml-1 text-[12.5px] text-muted-foreground">
                  {[who.org, who.cls].filter(Boolean).join(" · ")}
                </span>
              )}
              {who.phone4 && <span className="ml-1 text-[12.5px] text-subtle">({who.phone4})</span>}
            </div>
            <div className="text-[12.5px] text-muted-foreground">
              {R.cfg.title} · {when.toLocaleString("ko-KR")}
            </div>
            <div className="mt-1 text-[12.5px] text-muted-foreground">
              정답 {right}/{tot} · 난이도별{" "}
              {LVS.map((l) => `${l} ${R.lvl[l][0]}/${R.lvl[l][1]}`).join(" · ")}
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={printReport}>
              리포트 인쇄
            </Btn>
            {actions}
          </div>
        </div>

        <div className="mt-5">
          {Object.keys(R.cat).map((n) => {
            const o = R.cat[n]![0];
            const t = R.cat[n]![1];
            const p = Math.round((100 * o) / t);
            return (
              <div
                key={n}
                className="mb-2 grid grid-cols-[120px_1fr_66px] items-center gap-3 text-[13px] sm:grid-cols-[186px_1fr_84px]"
              >
                <span className="truncate">{n}</span>
                <div className="h-[9px] overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(.34,1.4,.5,1)]"
                    style={{
                      width: `${p}%`,
                      background: p < 60 ? "var(--destructive)" : "var(--gradient-navy)",
                    }}
                  />
                </div>
                <span className="text-right text-[12px] font-bold text-muted-foreground">
                  {o}/{t} ({p}%)
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-2xl border p-4 text-[13px]"
          style={{
            background:
              "linear-gradient(120deg, color-mix(in oklab, var(--gold) 10%, white), color-mix(in oklab, var(--gold) 18%, white))",
            borderColor: "color-mix(in oklab, var(--gold) 35%, white)",
          }}
        >
          {weak.length ? (
            <>
              <b>보완 추천</b> — 정답률 60% 미만: {weak.join(", ")}. 문제은행에서 해당 항목의 [하] → [중] 순서로 다시
              풀어 보세요.
            </>
          ) : (
            <>
              <b>훌륭합니다.</b> 모든 항목에서 안정적인 정답률입니다. [상] 난이도로 올려 도전해 보세요.
            </>
          )}
        </div>
      </GlassCard>

      <GlassCard solid>
        <CardTitle>문항별 결과</CardTitle>
        <div className="overflow-auto rounded-2xl border border-border">
          <table className="w-full border-separate border-spacing-0 bg-card text-[13px]">
            <thead>
              <tr className="bg-muted text-[12px] font-bold text-muted-foreground">
                <th className="w-9 p-2.5 text-left">번호</th>
                <th className="p-2.5 text-left">문제</th>
                <th className="w-11 p-2.5 text-left">결과</th>
                <th className="w-32 p-2.5 text-left">내 답</th>
                <th className="w-36 p-2.5 text-left">정답</th>
              </tr>
            </thead>
            <tbody>
              {R.rows.map((r) => (
                <tr key={r.q.seq} className="border-t border-border align-top">
                  <td className="border-t border-border p-2.5">{r.q.seq}</td>
                  <td className="border-t border-border p-2.5">
                    <span dangerouslySetInnerHTML={{ __html: fmt(r.q.stem) }} />
                    {!r.ok && <div className="mt-1 text-[12.5px] text-muted-foreground">{r.q.why}</div>}
                  </td>
                  <td
                    className={cn(
                      "border-t border-border p-2.5 text-center font-black",
                      r.ok ? "text-success" : "text-destructive",
                    )}
                  >
                    {r.ok ? "O" : "X"}
                  </td>
                  <td className="border-t border-border p-2.5">
                    {r.q.type === "mc" ? (r.my ? CIRC[(r.my as number) - 1] : "—") : String(r.my || "—")}
                  </td>
                  <td className="border-t border-border p-2.5">
                    {r.q.type === "mc"
                      ? `${CIRC[(r.q.answer as number) - 1]} ${(r.q.choices || [])[(r.q.answer as number) - 1]}`
                      : String(r.q.answer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
}
