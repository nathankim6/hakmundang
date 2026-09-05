import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TARGET_SCHOOLS = [
  "숭의여중",
  "장승중",
  "성남중",
  "강현중",
  "영등포중",
  "중대부중",
  "국사봉중",
  "문창중",
];

interface Row {
  name: string;
  E: number;
  averageScore?: number;
}

const EGradeCompare = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-apt2me-grades", {
        body: { area: "11590", year: "2025", grade: "3", term: "1", subject: "영어" },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "데이터 로드 실패");
      const all: any[] = data.schools || [];
      const picked: Row[] = TARGET_SCHOOLS.map((name) => {
        const found = all.find((s) => s.name === name);
        return found
          ? { name, E: found.E, averageScore: found.averageScore }
          : { name, E: NaN };
      });
      setRows(picked);
      setLoadedAt(new Date().toLocaleString("ko-KR"));
    } catch (e: any) {
      toast.error(e?.message || "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => (isNaN(b.E) ? -1 : isNaN(a.E) ? 1 : b.E - a.E)),
    [rows]
  );
  const maxE = useMemo(
    () => Math.max(...rows.filter((r) => !isNaN(r.E)).map((r) => r.E), 50),
    [rows]
  );
  const avgE = useMemo(() => {
    const valid = rows.filter((r) => !isNaN(r.E));
    return valid.length ? valid.reduce((s, r) => s + r.E, 0) / valid.length : 0;
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] bg-rose-100 text-rose-700 rounded-full border border-rose-200">
            E-Grade Focus · 2025년 1학기 · 중3 영어
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            동작구 8개 중학교 E등급 비율 비교
          </h1>
          <p className="text-muted-foreground mt-3 text-sm font-medium">
            apt2.me 공시 데이터 기반 · 숭의여중·장승중·성남중·강현중·영등포중·중대부중·국사봉중·문창중
          </p>
        </div>

        <Card className="p-6 mb-6 bg-white border-2 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                평균 E등급 비율
              </div>
              <div className="text-2xl font-black text-foreground">{avgE.toFixed(1)}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">
              {loadedAt && `업데이트: ${loadedAt}`}
            </div>
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              size="sm"
              className="mt-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              새로고침
            </Button>
          </div>
        </Card>

        <Card className="p-8 bg-white border-2 shadow-sm">
          {loading && rows.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
              데이터를 불러오는 중…
            </div>
          ) : (
            <div className="space-y-5">
              {sorted.map((r, idx) => {
                const missing = isNaN(r.E);
                const widthPct = missing ? 0 : (r.E / maxE) * 100;
                const isWorst = !missing && r.E === Math.max(...rows.filter(x => !isNaN(x.E)).map(x => x.E));
                return (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-foreground">{r.name}</span>
                        {isWorst && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                            최다
                          </span>
                        )}
                        {r.averageScore != null && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            평균 {r.averageScore}점
                          </span>
                        )}
                      </div>
                      <div className={`font-black tabular-nums ${missing ? "text-muted-foreground" : "text-rose-600"}`}>
                        {missing ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <AlertTriangle className="w-3 h-3" /> 데이터 없음
                          </span>
                        ) : (
                          `${r.E.toFixed(1)}%`
                        )}
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-700"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          출처: apt2.me 학업성취도 공시 (동작구 · 2025년 1학기 · 중3 영어)
        </p>
      </div>
    </div>
  );
};

export default EGradeCompare;
