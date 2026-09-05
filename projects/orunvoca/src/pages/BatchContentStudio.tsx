import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  RefreshCw,
  Square,
  Image as ImageIcon,
  ListChecks,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface CardSetRow {
  id: string;
  title: string;
}

interface StatusData {
  cardSetId: string;
  title: string;
  totalWords: number;
  choices: { done: number; remaining: number };
  images: { done: number; remaining: number };
}

type Target = "choices" | "images" | "both";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

const FN = "batch-prepare-cardset";

const BatchContentStudio = () => {
  const [cardSets, setCardSets] = useState<CardSetRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [target, setTarget] = useState<Target>("both");
  const [batchSize, setBatchSize] = useState(12);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry["type"] = "info") =>
    setLogs((prev) => [
      ...prev.slice(-200),
      { time: new Date().toLocaleTimeString("ko-KR"), message, type },
    ]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("card_sets")
        .select("id, title")
        .order("title", { ascending: true });
      if (error) {
        toast.error("단어장 목록을 불러오지 못했습니다");
        return;
      }
      setCardSets(data || []);
    })();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchStatus = async (id = selectedId, silent = false) => {
    if (!id) return null;
    if (!silent) setLoadingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke(FN, {
        body: { cardSetId: id, action: "status" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStatus(data);
      return data as StatusData;
    } catch (err: any) {
      addLog(`상태 조회 실패: ${err.message}`, "error");
      return null;
    } finally {
      if (!silent) setLoadingStatus(false);
    }
  };

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setStatus(null);
    stopPolling();
    setIsRunning(false);
    const data = await fetchStatus(id);
    if (data) {
      addLog(
        `${data.title}: 단어 ${data.totalWords}개 · 선지 미생성 ${data.choices.remaining}개 · 사진 미생성 ${data.images.remaining}개`
      );
    }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      const data = await fetchStatus(selectedId, true);
      if (!data) return;
      const remaining =
        (target !== "images" ? data.choices.remaining : 0) +
        (target !== "choices" ? data.images.remaining : 0);
      addLog(
        `진행 중 · 선지 ${data.choices.done}/${data.totalWords} · 사진 ${data.images.done}/${data.totalWords}`
      );
      if (remaining === 0) {
        addLog("모든 생성이 완료되었습니다 🎉", "success");
        toast.success("일괄 생성 완료!");
        setIsRunning(false);
        stopPolling();
      }
    }, 15000);
  };

  const handleStart = async () => {
    if (!selectedId) {
      toast.error("단어장을 먼저 선택하세요");
      return;
    }
    setIsRunning(true);
    addLog(
      `일괄 생성 시작 (대상: ${target === "both" ? "선지 + 사진" : target === "choices" ? "선지" : "사진"}, 배치 ${batchSize})`
    );
    try {
      const { data, error } = await supabase.functions.invoke(FN, {
        body: { cardSetId: selectedId, action: "process", target, batchSize, autoChain: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStatus(data);
      addLog(
        `첫 배치 완료 · 선지 ${data.choiceSuccess}개 · 사진 ${data.imageSuccess}개 · 실패 ${data.failures}개 · 남은 ${data.remaining}개`,
        "success"
      );
      if (data.done) {
        addLog("모든 생성이 완료되었습니다 🎉", "success");
        toast.success("일괄 생성 완료!");
        setIsRunning(false);
      } else {
        toast.info("백그라운드에서 이어서 생성합니다");
        startPolling();
      }
    } catch (err: any) {
      addLog(`시작 실패: ${err.message}`, "error");
      toast.error("일괄 생성 시작 실패");
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    stopPolling();
    addLog("모니터링을 중지했습니다 (진행 중인 배치는 자연 종료됩니다)");
  };

  const choicePercent = useMemo(
    () => (status?.totalWords ? (status.choices.done / status.totalWords) * 100 : 0),
    [status]
  );
  const imagePercent = useMemo(
    () => (status?.totalWords ? (status.images.done / status.totalWords) * 100 : 0),
    [status]
  );

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <header className="flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">모의시험 콘텐츠 일괄 생성</h1>
          <p className="text-sm text-muted-foreground">
            선택한 단어장의 오답 선지와 단어 사진을 Edge Function으로 한 번에 생성합니다
          </p>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">생성 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">단어장</label>
            <Select value={selectedId} onValueChange={handleSelect} disabled={isRunning}>
              <SelectTrigger>
                <SelectValue placeholder="단어장을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {cardSets.map((cs) => (
                  <SelectItem key={cs.id} value={cs.id}>
                    {cs.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">생성 대상</label>
              <Select
                value={target}
                onValueChange={(v) => setTarget(v as Target)}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">선지 + 사진 전체</SelectItem>
                  <SelectItem value="choices">오답 선지만</SelectItem>
                  <SelectItem value="images">단어 사진만</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">배치 크기</label>
              <Select
                value={String(batchSize)}
                onValueChange={(v) => setBatchSize(Number(v))}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 12, 20, 30].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}개씩
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleStart} disabled={isRunning || !selectedId}>
              <Play className="mr-1 h-4 w-4" />
              일괄 생성 시작
            </Button>
            <Button variant="outline" onClick={handleStop} disabled={!isRunning}>
              <Square className="mr-1 h-4 w-4" />
              모니터링 중지
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchStatus()}
              disabled={!selectedId || loadingStatus}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${loadingStatus ? "animate-spin" : ""}`} />
              상태 새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {status && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{status.title}</CardTitle>
              <Badge variant="secondary">전체 {status.totalWords}단어</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> 오답 선지
                </span>
                <span>
                  {status.choices.done}/{status.totalWords} · 남은 {status.choices.remaining}
                </span>
              </div>
              <Progress value={choicePercent} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> 단어 사진
                </span>
                <span>
                  {status.images.done}/{status.totalWords} · 남은 {status.images.remaining}
                </span>
              </div>
              <Progress value={imagePercent} className="h-3" />
            </div>
            {status.choices.remaining === 0 && status.images.remaining === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-950/30">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">이 단어장은 모든 콘텐츠가 준비되었습니다</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">실행 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto rounded-lg bg-muted/40 p-3 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">아직 로그가 없습니다.</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.type === "error"
                      ? "text-red-600"
                      : log.type === "success"
                        ? "text-green-600"
                        : "text-foreground/80"
                  }
                >
                  [{log.time}] {log.message}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchContentStudio;
