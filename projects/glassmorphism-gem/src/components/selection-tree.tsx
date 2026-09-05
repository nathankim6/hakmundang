import { cn } from "@/lib/utils";
import { setSel, setState, toggleSel, useApp } from "@/lib/grammar/store";
import type { Book, Cat } from "@/lib/grammar/types";

function Check({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "grid h-[18px] w-[18px] flex-none place-items-center rounded-md border transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)]",
        on ? "border-primary bg-primary" : "border-border bg-card",
      )}
    >
      <svg viewBox="0 0 14 14" className={cn("h-3 w-3 transition-all", on ? "opacity-100" : "scale-50 opacity-0")} fill="none" stroke="white" strokeWidth="3.2">
        <path d="M2 7.5 5.5 11 12 3.5" />
      </svg>
    </span>
  );
}

export function CatRow({ cat, currentGrade }: { cat: Cat; currentGrade: string }) {
  const { sel } = useApp();
  const on = sel.includes(cat.id);
  return (
    <div
      onClick={() => toggleSel(cat.id)}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] transition-colors",
        on ? "bg-info-soft" : "hover:bg-muted",
      )}
    >
      <Check on={on} />
      {cat.grade !== currentGrade && (
        <span className="flex-none rounded bg-muted px-1.5 text-[10px] font-extrabold text-subtle">{cat.grade}</span>
      )}
      <span className="truncate">{cat.name}</span>
      <span className="ml-auto flex-none text-[11px] font-semibold text-subtle">{cat.questions.length}</span>
    </div>
  );
}

export function TreeShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-h-[392px] overflow-auto rounded-2xl border border-border bg-card/70 p-2 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BookTree({ book, byId }: { book: Book; byId: Record<string, Cat> }) {
  const { open, sel, grade } = useApp();
  return (
    <TreeShell>
      {book.lessons.map((L) => {
        const all = L.ids.length > 0 && L.ids.every((i) => sel.includes(i));
        const op = open.includes(L.no);
        return (
          <div key={L.no} className="mb-1 overflow-hidden rounded-xl">
            <div
              onClick={() =>
                setState((s) => ({
                  open: s.open.includes(L.no) ? s.open.filter((n) => n !== L.no) : [...s.open, L.no],
                }))
              }
              className="flex cursor-pointer items-center gap-2.5 bg-muted/70 px-3 py-2.5 text-[13px] font-bold transition-colors hover:bg-accent"
            >
              <span className={cn("text-[10px] text-subtle transition-transform duration-300", op && "rotate-90")}>▶</span>
              <span onClick={(e) => { e.stopPropagation(); setSel(L.ids, !all); }}>
                <Check on={all} />
              </span>
              <span>Lesson {L.no}</span>
              <span className="truncate text-[11.5px] font-medium text-subtle">{L.labels.join(" · ")}</span>
              <span className="ml-auto flex-none text-[11px] font-semibold text-subtle">{L.ids.length}</span>
            </div>
            {op && (
              <div className="rise px-1.5 pb-2 pt-1">
                {L.ids.length ? (
                  L.ids.map((id) =>
                    byId[id] ? <CatRow key={id} cat={byId[id]!} currentGrade={grade} /> : null,
                  )
                ) : (
                  <div className="px-3 py-2 text-[13px] text-subtle">문제은행 미수록 단원</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </TreeShell>
  );
}
