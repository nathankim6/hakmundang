import { useState } from "react";
import { SubmittedDailyWordCard } from "./SubmittedDailyWordCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

interface DailyWordPaginatedListProps {
  submissions: any[];
  onEdit: () => void;
  isDailyWordLate: (submission: any) => boolean;
}

export function DailyWordPaginatedList({ submissions, onEdit, isDailyWordLate }: DailyWordPaginatedListProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(submissions.length / PAGE_SIZE);
  const paged = submissions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="divide-y divide-slate-50">
        {paged.map((submission: any) => (
          <SubmittedDailyWordCard
            key={submission.id}
            submission={submission}
            onEdit={onEdit}
            isLate={isDailyWordLate(submission)}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-1.5 border-t border-slate-100">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-5 h-5 rounded text-[10px] font-medium ${
                i === page
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
