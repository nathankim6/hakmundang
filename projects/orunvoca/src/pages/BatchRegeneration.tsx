import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RefreshCw, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BatchLog {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error";
}

interface StatusData {
  total: number;
  recentlyUpdated: number;
  remaining: number;
}

const BatchRegeneration = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [batchSize, setBatchSize] = useState(25);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: BatchLog["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString("ko-KR"), message, type },
    ]);
  };

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "batch-regenerate-wrong-choices",
        { body: { action: "status" } }
      );
      if (error) throw error;
      setStatus(data);
      return data;
    } catch (err: any) {
      addLog(`상태 조회 실패: ${err.message}`, "error");
      return null;
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const startBatch = async () => {
    setIsRunning(true);
    addLog(`배치 재생성 시작 (배치 크기: ${batchSize}, 자동 체이닝: ON)`, "info");
    toast.info("배치 재생성을 시작합니다...");

    try {
      const { data, error } = await supabase.functions.invoke(
        "batch-regenerate-wrong-choices",
        {
          body: { batchSize, autoChain: true, action: "process" },
        }
      );
      if (error) throw error;
      setLastResult(data);
      addLog(
        `첫 배치 완료: ${data.success}/${data.processed} 성공, 남은 항목: ${data.remaining}`,
        "success"
      );

      if (data.done) {
        addLog("모든 항목 처리 완료! 🎉", "success");
        toast.success("모든 오답선지 재생성 완료!");
        setIsRunning(false);
      } else {
        // Start polling for status
        startPolling();
      }
    } catch (err: any) {
      addLog(`시작 실패: ${err.message}`, "error");
      toast.error("배치 시작 실패");
      setIsRunning(false);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      const data = await fetchStatus();
      if (data) {
        addLog(
          `진행 상황: ${data.recentlyUpdated}/${data.total} 처리됨, 남은: ${data.remaining}`,
          "info"
        );
        if (data.remaining === 0) {
          addLog("모든 항목 처리 완료! 🎉", "success");
          toast.success("모든 오답선지 재생성 완료!");
          setIsRunning(false);
          stopPolling();
        }
      }
    }, 15000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    stopPolling();
    addLog("폴링 중지됨 (백그라운드 체이닝은 자연 종료됩니다)", "info");
    toast.info("모니터링 중지");
  };

  useEffect(() => {
    fetchStatus();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const progressPercent = status
    ? ((status.total - status.remaining) / status.total) * 100
    : 0;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">오답선지 배치 재생성</h1>
          <p className="text-sm text-muted-foreground">
            뜻 맞추기 모드의 모든 오답선지를 새 프롬프트로 재생성합니다
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">진행 상황</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={isLoadingStatus}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoadingStatus ? "animate-spin" : ""}`}
              />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status ? (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold">{status.total?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">전체 항목</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {(status.total - status.remaining)?.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">처리 완료</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">
                    {status.remaining?.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">남은 항목</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>진행률</span>
                  <span>{progressPercent.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
              {status.remaining === 0 && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">모든 항목 처리 완료!</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              상태를 불러오는 중...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">실행 제어</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">배치 크기:</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              disabled={isRunning}
              className="border rounded px-3 py-1.5 text-sm bg-background"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={startBatch}
              disabled={isRunning}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "실행 중..." : "배치 재생성 시작"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleStop}
              disabled={!isRunning}
            >
              <Square className="h-4 w-4 mr-2" />
              중지
            </Button>
          </div>
          {isRunning && (
            <p className="text-xs text-muted-foreground">
              ⚡ 자동 체이닝이 활성화되어 백그라운드에서 계속 처리됩니다.
              모니터링을 중지해도 서버 작업은 계속됩니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">실행 로그</CardTitle>
            {logs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogs([])}
              >
                로그 지우기
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                로그가 없습니다. 배치를 시작해주세요.
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    log.type === "error"
                      ? "text-red-500"
                      : log.type === "success"
                      ? "text-green-600"
                      : "text-foreground/70"
                  }`}
                >
                  <span className="text-muted-foreground shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span>{log.message}</span>
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

export default BatchRegeneration;
