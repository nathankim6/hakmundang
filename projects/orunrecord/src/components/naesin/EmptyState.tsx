import { SearchX } from "lucide-react";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-5 ring-1 ring-border">
        <SearchX className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      {hint && <p className="text-sm text-muted-foreground mt-2 max-w-md">{hint}</p>}
    </div>
  );
}
