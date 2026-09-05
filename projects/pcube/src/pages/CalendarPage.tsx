import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { format, differenceInCalendarDays } from "date-fns";
import { getKSTNow, getKSTDateString } from "@/utils/koreanTime";
import { ko } from "date-fns/locale";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(getKSTNow());
  const { ownerCodeId, shouldFilter } = useOwnerFilter();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // DB에서 homework 마감일 조회
  const { data: homework = [] } = useQuery({
    queryKey: ["calendar-homework", year, month, ownerCodeId, shouldFilter],
    queryFn: async () => {
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      let query = supabase
        .from("homework")
        .select(`
          id,
          title,
          type,
          due_date,
          target_type,
          target_grade_id,
          grades:target_grade_id(name)
        `)
        .gte("due_date", startDate)
        .lte("due_date", endDate)
        .order("due_date");

      if (shouldFilter) {
        query = query.eq("owner_code_id", ownerCodeId!);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const today = getKSTNow();
  const todayStr = getKSTDateString();

  const getTypeStyle = (daysLeft: number) => {
    if (daysLeft <= 0) return { label: "D-Day", className: "bg-destructive text-destructive-foreground" };
    if (daysLeft === 1) return { label: "D-1", className: "bg-warning text-warning-foreground" };
    if (daysLeft <= 3) return { label: `D-${daysLeft}`, className: "bg-muted text-muted-foreground" };
    return { label: "", className: "bg-primary/20 text-primary" };
  };

  // 마감 임박 목록 (오늘 이후 7일 이내)
  const upcomingDeadlines = useMemo(() => {
    return homework
      .filter((hw: any) => {
        const diff = differenceInCalendarDays(new Date(hw.due_date), today);
        return diff >= 0 && diff <= 7;
      })
      .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [homework, todayStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={CalendarIcon}
        title="캘린더"
        description="과제 마감일 관리"
        showDate={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {year}년 {monthNames[month]}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(getKSTNow())}>
                오늘
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "text-center text-sm font-medium py-2",
                    day === "일" ? "text-destructive" : day === "토" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayHomework = homework.filter((hw: any) => hw.due_date === dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square p-1 rounded-lg border transition-colors hover:bg-secondary/50 cursor-pointer",
                      isToday && "bg-primary/10 border-primary"
                    )}
                  >
                    <div className={cn("text-sm font-medium", isToday && "text-primary")}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {dayHomework.slice(0, 2).map((hw: any, idx: number) => {
                        const daysLeft = differenceInCalendarDays(new Date(hw.due_date), today);
                        const style = getTypeStyle(daysLeft);
                        return (
                          <div
                            key={idx}
                            className={cn("text-xs px-1 py-0.5 rounded truncate", style.className)}
                          >
                            {hw.title.replace("녹음 과제: ", "")}
                          </div>
                        );
                      })}
                      {dayHomework.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayHomework.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 마감 임박 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>마감 임박</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                임박한 마감일이 없습니다.
              </div>
            ) : (
              upcomingDeadlines.map((hw: any, idx: number) => {
                const daysLeft = differenceInCalendarDays(new Date(hw.due_date), today);
                const style = getTypeStyle(daysLeft);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {style.label && (
                        <Badge className={style.className}>{style.label}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(hw.due_date), "M월 d일 (EEE)", { locale: ko })}
                      </span>
                    </div>
                    <h4 className="font-medium">{hw.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {(hw.grades as any)?.name || "전체"} · {hw.type === "rt_review" ? "녹음" : "영작"}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
