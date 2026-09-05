import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "./ui-kit";

const PAGES = [
  { to: "/", label: "시험지 출제" },
  { to: "/bank", label: "문제은행" },
  { to: "/take", label: "시험 응시" },
  { to: "/records", label: "응시 기록" },
];

function Aura() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 700px at 8% -12%, oklch(0.96 0.028 255) 0%, transparent 62%)," +
          "radial-gradient(900px 620px at 100% -4%, oklch(0.975 0.035 84) 0%, transparent 58%)," +
          "radial-gradient(1000px 820px at 52% 112%, oklch(0.97 0.028 165) 0%, transparent 64%)," +
          "var(--background)",
      }}
      aria-hidden
    >
      <i
        className="absolute -left-[6%] -top-[8%] h-[520px] w-[520px] rounded-full opacity-40 blur-[110px]"
        style={{ background: "oklch(0.9 0.055 255)", animation: "aura-float 26s var(--ease-spring) infinite alternate" }}
      />
      <i
        className="absolute -right-[4%] top-[6%] h-[420px] w-[420px] rounded-full opacity-35 blur-[110px]"
        style={{ background: "oklch(0.94 0.06 84)", animation: "aura-float 31s var(--ease-spring) infinite alternate" }}
      />
      <i
        className="absolute -bottom-[14%] left-[36%] h-[460px] w-[460px] rounded-full opacity-35 blur-[110px]"
        style={{ background: "oklch(0.94 0.05 165)", animation: "aura-float 35s var(--ease-spring) infinite alternate" }}
      />
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Aura />
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "color-mix(in oklab, white 78%, transparent)",
          backdropFilter: "blur(40px) saturate(180%)",
          borderColor: "var(--glass-line)",
        }}
      >
        <div className="mx-auto flex max-w-[1340px] flex-wrap items-center gap-4 px-5 py-2.5">
          <Link to="/" className="flex flex-none items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl shadow-[0_6px_16px_oklch(0.264_0.037_260/0.3)]"
              style={{ background: "var(--gradient-navy)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="oklch(0.815 0.152 79)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="h-[19px] w-[19px]">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
                <path d="M8.5 8.5h6M8.5 12h4" />
              </svg>
            </span>
            <span>
              <b className="block text-[17px] font-bold tracking-tight">ORUN GRAMMAR</b>
            </span>
          </Link>

          <nav
            className="ml-auto flex gap-1 rounded-2xl p-1"
            style={{ background: "color-mix(in oklab, white 55%, transparent)", border: "1px solid var(--glass-line)" }}
          >
            {PAGES.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[13px] font-semibold text-muted-foreground transition-all duration-300 hover:text-foreground"
                activeProps={{
                  className:
                    "whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[13px] font-bold bg-card text-foreground shadow-[0_2px_8px_oklch(0.21_0.03_258/0.14)]",
                }}
                activeOptions={{ exact: p.to === "/" }}
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <span className="flex-none rounded-full bg-muted px-3 py-1.5 text-[10.5px] font-extrabold tracking-[0.1em] text-muted-foreground">
            PRO
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1340px] px-5 pb-24 pt-6">{children}</main>
      <div id="paper" />
      <Toaster />
    </>
  );
}
