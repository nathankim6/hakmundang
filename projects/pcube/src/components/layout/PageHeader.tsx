import { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ReactNode } from "react";
import { getKSTNow } from "@/utils/koreanTime";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  showDate?: boolean;
  actions?: ReactNode;
  stats?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, showDate = true, actions, stats }: PageHeaderProps) {
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[1.375rem] sec-wine sec-header px-3 py-2.5 sm:px-5 shadow-[0_20px_44px_-28px_hsl(345_56%_15%/0.75)]">
      {/* 상단 브라스 골드 하이라이트 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      {/* 미니멀 글로우 (애플 감성: 장식 최소화) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-10 w-56 h-56 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-44 h-44 bg-white/[0.06] rounded-full blur-3xl" />
      </div>


      <div className="relative z-10 flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {/* 타이틀 + 날짜 */}
        <div className="flex w-full min-w-0 items-center gap-2.5 sm:w-auto sm:gap-3">
          <div className="shrink-0 p-2 rounded-xl bg-white/[0.14] backdrop-blur-md ring-1 ring-inset ring-white/15">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:gap-2.5">
            <h1 className="shrink-0 text-[17px] font-semibold text-white tracking-[-0.022em]">{title}</h1>
            {(showDate || description) && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                <span className="min-w-0 truncate text-xs text-white/55">
                  {description || format(getKSTNow(), "M월 d일 (EEEE)", { locale: ko })}
                </span>
              </>
            )}
          </div>
        </div>


        {/* 액션 버튼 또는 통계 */}
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:justify-end">
          {stats}
          {actions}
        </div>
      </div>
    </div>
  );
}
