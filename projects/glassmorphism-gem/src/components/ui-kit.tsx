import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useApp, setState } from "@/lib/grammar/store";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  solid,
}: {
  children: ReactNode;
  className?: string;
  solid?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 sm:p-6",
        solid ? "glass-strong" : "glass",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  right,
  icon,
  className,
}: {
  children: ReactNode;
  right?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2.5 text-[13px] font-bold tracking-tight text-muted-foreground",
        className,
      )}
    >
      {icon}
      <span>{children}</span>
      {right !== undefined && (
        <span className="ml-auto text-[11.5px] font-semibold text-subtle">{right}</span>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  desc,
  icon,
  right,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  icon?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-glass [background:linear-gradient(105deg,color-mix(in_oklab,var(--info)_9%,white)_0%,color-mix(in_oklab,var(--info)_4%,white)_45%,white_100%)] px-5 py-5 backdrop-blur-2xl sm:px-7 sm:py-6 rise">
      <div className="flex items-center gap-4 sm:gap-5">
        {icon !== undefined && (
          <span className="grid h-14 w-14 flex-none place-items-center rounded-[18px] text-primary-foreground shadow-[0_10px_26px_color-mix(in_oklab,var(--info)_34%,transparent)] [background:linear-gradient(140deg,color-mix(in_oklab,var(--info)_72%,white),var(--info))] sm:h-[60px] sm:w-[60px]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-info">
            {eyebrow}
          </div>
          <h2 className="mt-0.5 truncate text-[22px] font-black tracking-tight text-foreground sm:text-[25px]">
            {title}
          </h2>
          {desc && (
            <p className="mt-1 text-[13px] font-medium text-muted-foreground">{desc}</p>
          )}
        </div>
        {right && <div className="ml-auto hidden sm:block">{right}</div>}
      </div>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px [background:linear-gradient(90deg,transparent,color-mix(in_oklab,var(--info)_28%,transparent),transparent)]" />
    </div>
  );
}



type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "navy" | "gold" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Btn({ variant = "navy", size = "md", className, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden font-bold transition-[transform,box-shadow,background,border-color] duration-300 ease-[cubic-bezier(.34,1.4,.5,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        size === "sm" ? "rounded-xl px-4 py-2 text-[12.5px]" : "rounded-2xl px-6 py-3 text-sm",
        variant === "navy" &&
          "bg-primary text-primary-foreground shadow-[0_8px_22px_oklch(0.264_0.037_260/0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_oklch(0.264_0.037_260/0.34)]",
        variant === "gold" &&
          "bg-[image:var(--gradient-gold)] text-primary shadow-[0_8px_22px_oklch(0.72_0.148_72/0.38)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_oklch(0.72_0.148_72/0.45)]",
        variant === "ghost" &&
          "glass-strong text-foreground hover:-translate-y-0.5 hover:border-subtle/40",
        variant === "danger" &&
          "border border-destructive bg-card text-destructive hover:bg-destructive-soft",
        className,
      )}
    />
  );
}

export function Pill({
  on,
  children,
  onClick,
}: {
  on?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3.5 py-1.5 text-[12.5px] font-bold transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
        on
          ? "border-transparent bg-primary text-primary-foreground shadow-[0_6px_16px_oklch(0.264_0.037_260/0.26)]"
          : "border-border bg-card/70 text-muted-foreground hover:-translate-y-px hover:border-subtle/50",
      )}
    >
      {children}
    </button>
  );
}

export function Segmented({
  items,
  value,
  onChange,
  className,
}: {
  items: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-2xl border border-glass p-1 [background:color-mix(in_oklab,white_55%,transparent)] backdrop-blur-xl",
        className,
      )}
      style={{ borderColor: "var(--glass-line)" }}
    >
      {items.map((it) => (
        <button
          key={it.v}
          onClick={() => onChange(it.v)}
          className={cn(
            "flex-1 whitespace-nowrap rounded-xl px-4 py-1.5 text-[12.5px] font-bold transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
            value === it.v
              ? "bg-card text-foreground shadow-[0_2px_8px_oklch(0.21_0.03_258/0.14)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function NumInput({
  value,
  onChange,
  min = 0,
  max = 200,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      className={cn(
        "w-[68px] rounded-xl border border-border bg-card px-2 py-1.5 text-center text-[13px] font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        className,
      )}
    />
  );
}

export function TextInput({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={cn(
        "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13.5px] outline-none transition placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10",
        className,
      )}
    />
  );
}

export function Switch({
  on,
  onToggle,
  children,
}: {
  on: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex select-none items-center gap-2.5 text-[13px] font-semibold"
    >
      <span
        className={cn(
          "relative h-[22px] w-[38px] flex-none rounded-full transition-colors duration-300",
          on ? "bg-success" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute left-[2px] top-[2px] h-[18px] w-[18px] rounded-full bg-card shadow transition-transform duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
            on && "translate-x-4",
          )}
        />
      </span>
      {children}
    </button>
  );
}

export function LevelTag({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-extrabold",
        level === "하" && "bg-success-soft text-success",
        level === "중" && "bg-[color-mix(in_oklab,var(--gold)_18%,white)] text-gold-deep",
        level === "상" && "bg-destructive-soft text-destructive",
      )}
    >
      {level}
    </span>
  );
}

export function StatGrid({ items }: { items: { v: ReactNode; label: string; tone?: string }[] }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it, i) => (
        <div
          key={i}
          className={cn(
            "glass-elevated group relative overflow-hidden rounded-2xl px-4 py-4 rise",
            it.tone === "text-gold-deep" && "glow-gold",
            it.tone === "text-info" && "glow-info",
            it.tone === "text-success" && "glow-success",
            it.tone === "text-destructive" && "glow-destructive",
          )}
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span
            className={cn(
              "absolute inset-x-0 top-0 h-[2.5px] origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.34,1.4,.5,1)] group-hover:scale-x-100",
              it.tone === "text-gold-deep" ? "bg-gold" : it.tone || "bg-primary",
            )}
          />
          <b
            className={cn(
              "block text-[26px] font-black leading-none tracking-tight",
              it.tone || "text-foreground",
            )}
          >
            {it.v}
          </b>
          <span className="mt-1.5 block text-[11.5px] font-bold text-muted-foreground">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Toaster() {
  const { toast } = useApp();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setState({ toast: null }), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 rounded-2xl px-5 py-3 text-[13.5px] font-semibold text-primary-foreground shadow-[0_16px_40px_oklch(0.21_0.03_258/0.35)] transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
        "[background:color-mix(in_oklab,var(--primary)_92%,transparent)] backdrop-blur-xl",
        toast ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      {toast?.msg}
    </div>
  );
}

export function Loading({ label = "문제은행을 불러오는 중" }: { label?: string }) {
  return (
    <GlassCard solid className="text-center">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
    </GlassCard>
  );
}
