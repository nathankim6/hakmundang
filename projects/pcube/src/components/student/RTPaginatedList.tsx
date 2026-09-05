import { useState } from "react";
import { SubmittedRTCard } from "./SubmittedRTCard";

const PAGE_SIZE = 10;

interface RTPaginatedListProps {
  submissions: any[];
  onEdit: (submission: any) => void;
  isLate: (submission: any) => boolean;
}

export function RTPaginatedList({ submissions, onEdit, isLate }: RTPaginatedListProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = submissions.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // 페이지 내에서 지문(그룹)별로 묶어서 표시
  const groups = new Map<string, any[]>();
  paged.forEach((s: any) => {
    const key = s.homework?.homework_group_id || `title:${(s.homework?.title || "").replace(/\s*#\d+$/, "")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  });

  return (
    <div>
      <div className="divide-y divide-slate-50">
        {Array.from(groups.entries()).map(([key, items]) => {
          const baseTitle = (items[0].homework?.title || "")
            .replace(/\s*#\d+$/, "")
            .replace(/^녹음 과제:\s*/, "");
          return (
            <div key={key}>
              {items.length > 1 && (
                <div className="px-4 py-1 bg-violet-50/30">
                  <span className="text-[10px] font-semibold text-violet-400">📖 {baseTitle} ({items.length}개)</span>
                </div>
              )}
              {items.map((submission: any) => (
                <SubmittedRTCard
                  key={submission.id}
                  submission={submission}
                  onEdit={() => onEdit(submission)}
                  isLate={isLate(submission)}
                />
              ))}
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-1.5 border-t border-slate-100">
          <button
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-200 disabled:opacity-30"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1)
            .map((i, idx, arr) => (
              <span key={i} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== i - 1 && <span className="text-[10px] text-slate-300 px-0.5">…</span>}
                <button
                  onClick={() => setPage(i)}
                  className={`w-5 h-5 rounded text-[10px] font-semibold ${
                    i === safePage ? "bg-primary text-primary-foreground" : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            disabled={safePage === totalPages - 1}
            className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-200 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
