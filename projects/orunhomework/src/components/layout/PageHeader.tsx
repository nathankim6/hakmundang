import { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ReactNode } from "react";

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
    <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.10)] px-5 py-4">
      {/* 앰비언트 글로우 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-10 w-64 h-64 bg-primary/[0.07] rounded-full blur-[80px]" />
        <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-muted-foreground/[0.08] rounded-full blur-[70px]" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* 타이틀 + 날짜 */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary shadow-[0_10px_20px_-6px_hsl(var(--primary)/0.45)] shrink-0">
            <Icon className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h1 className="text-[17px] font-bold tracking-tight text-foreground truncate">{title}</h1>
            {(showDate || description) && (
              <span className="text-xs font-medium text-muted-foreground truncate">
                {description || format(new Date(), "M월 d일 (EEEE)", { locale: ko })}
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼 또는 통계 */}
        <div className="flex items-center gap-2 shrink-0">
          {stats}
          {actions}
        </div>
      </div>
    </div>
  );
}

