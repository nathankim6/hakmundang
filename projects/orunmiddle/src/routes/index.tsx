import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadDiagnosticFromBuffer, type Diagnostic } from "@/lib/diagnostic";
import { ReportPage } from "@/components/ReportPage";
import { exportAllReportsAsZip, ExportAbortedError } from "@/lib/pdf-export";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "진단평가 리포트 생성기" },
      { name: "description", content: "엑셀 파일을 업로드하면 학생별 진단평가 리포트가 자동 생성됩니다." },
    ],
  }),
});

function Index() {
  const [data, setData] = useState<Diagnostic | null>(null);
  const [classKey, setClassKey] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const DEFAULT_GLOBAL_COMMENT = "이번시험은 3월과 4월에 공부했던 내용을 기반으로 출제했습니다. 문법의 경우 각 레벨에서 소화 해야 할 난이도의 문법을 출제했습니다. 영역별 성취도를 통해 추후 보강이 필요한 부분은 개별보강 할 예정입니다. 독해의 경우 그동안 공부한 지문이지만, 내신과 수능에서 만날수 있는 문제유형(주제, 제목, 내용일치, 추론)을 출제함으로, 글의 이해와 유형에 대한 연습을 목적으로 출제 하였습니다. 단어 결과는 정규 과정에서 공부한 단어의 누적 결과로 정규 단어 결과 + 주말 진행한 누적테스트의 결과 입니다.";
  const [globalComment, setGlobalComment] = useState<string>(DEFAULT_GLOBAL_COMMENT);
  const [commentOpen, setCommentOpen] = useState(false);
  const [headerEyebrow, setHeaderEyebrow] = useState<string>("ORUN ACADEMY · CUMULATIVE TEST REPORT");
  const [headerTitle, setHeaderTitle] = useState<string>("옳은영어 중학 누적테스트 리포트");
  const [headerSubtitle, setHeaderSubtitle] = useState<string>("");
  const [headerOpen, setHeaderOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);

  async function handleExportAll() {
    if (!data || exporting) return;
    const ac = new AbortController();
    exportAbortRef.current = ac;
    setExporting(true);
    setExportProgress({ done: 0, total: 0, label: "준비 중…" });
    try {
      await exportAllReportsAsZip({
        data,
        classKey,
        globalComment,
        headerEyebrow,
        headerTitle,
        headerSubtitle,
        signal: ac.signal,
        onCancel: () => ac.abort(),
        onProgress: (done, total, label) => setExportProgress({ done, total, label }),
      });
    } catch (e) {
      if (!(e instanceof ExportAbortedError)) {
        setError(`PDF 일괄 생성 중 오류: ${String(e)}`);
      }
    } finally {
      exportAbortRef.current = null;
      setExporting(false);
      setExportProgress(null);
    }
  }

  function handleCancelExport() {
    exportAbortRef.current?.abort();
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("teacher-comment::global");
      if (saved !== null) setGlobalComment(saved);
      const e = window.localStorage.getItem("report-header::eyebrow");
      if (e !== null) setHeaderEyebrow(e);
      const t = window.localStorage.getItem("report-header::title");
      if (t !== null) setHeaderTitle(t);
      const s = window.localStorage.getItem("report-header::subtitle");
      if (s !== null) setHeaderSubtitle(s);
    } catch {}
  }, []);

  const updateGlobalComment = (v: string) => {
    setGlobalComment(v);
    try { window.localStorage.setItem("teacher-comment::global", v); } catch {}
  };
  const updateHeaderEyebrow = (v: string) => {
    setHeaderEyebrow(v);
    try { window.localStorage.setItem("report-header::eyebrow", v); } catch {}
  };
  const updateHeaderTitle = (v: string) => {
    setHeaderTitle(v);
    try { window.localStorage.setItem("report-header::title", v); } catch {}
  };
  const updateHeaderSubtitle = (v: string) => {
    setHeaderSubtitle(v);
    try { window.localStorage.setItem("report-header::subtitle", v); } catch {}
  };

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const d = await loadDiagnosticFromBuffer(buf);
      setData(d);
      setFileName(file.name);
      const firstClass = d.classes[0];
      if (firstClass) {
        setClassKey(firstClass.classKey);
        const firstStudent = firstClass.students.find((s) => s.hasAny) ?? firstClass.students[0];
        if (firstStudent) setStudentName(firstStudent.rawName);
      }
    } catch (e) {
      setError(`파일을 읽는 중 오류가 발생했습니다: ${String(e)}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const cls = useMemo(() => data?.classes.find((c) => c.classKey === classKey), [data, classKey]);
  const student = useMemo(() => cls?.students.find((s) => s.rawName === studentName), [cls, studentName]);

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-lg font-bold">진단평가 리포트 생성기</h1>
            <p className="text-xs text-muted-foreground">엑셀 파일을 업로드한 뒤 반·학생을 선택하면 리포트가 자동 생성됩니다.</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              {data ? "엑셀 다시 업로드" : "엑셀 파일 업로드"}
            </button>
            {fileName && (
              <span className="text-xs text-muted-foreground max-w-[180px] truncate" title={fileName}>
                {fileName}
              </span>
            )}
            {data && (
              <>
                <select
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={classKey}
                  onChange={(e) => {
                    setClassKey(e.target.value);
                    const c = data.classes.find((x) => x.classKey === e.target.value);
                    const s = c?.students.find((x) => x.hasAny) ?? c?.students[0];
                    setStudentName(s?.rawName ?? "");
                  }}
                >
                  {data.classes.map((c) => (
                    <option key={c.classKey} value={c.classKey}>
                      {c.sheetName} ({c.students.filter((s) => s.hasAny).length}/{c.students.length}명)
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm min-w-[180px]"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                >
                  {cls?.students.map((s) => (
                    <option key={s.rawName} value={s.rawName}>
                      {s.name} {s.hasAny ? "" : "(미응시)"}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setHeaderOpen((v) => !v)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted"
                  title="리포트 상단 제목 정보를 수정합니다"
                >
                  헤더 정보
                </button>
                <button
                  onClick={() => setCommentOpen((v) => !v)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted"
                  title="모든 학생에게 동일하게 적용되는 강사 종합 의견을 입력하세요"
                >
                  공통 코멘트{globalComment.trim() ? " ●" : ""}
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-md px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90"
                  style={{ background: "var(--report-grad)" }}
                >
                  인쇄 / PDF 저장
                </button>
                <button
                  onClick={handleExportAll}
                  disabled={exporting}
                  className="rounded-md px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, oklch(0.45 0.15 265), oklch(0.35 0.12 265))" }}
                  title="현재 선택된 반의 응시 학생 리포트를 PDF로 만들어 ZIP 파일로 다운로드합니다"
                >
                  {exporting ? "PDF 생성 중…" : "반 PDF 일괄 다운로드"}
                </button>
              </>
            )}
          </div>
          {exporting && exportProgress && (
            <div className="w-full mt-2 rounded-md border border-border bg-background/80 p-3">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold mb-1.5">
                <span className="truncate">{exportProgress.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground">
                    {exportProgress.total > 0 ? `${exportProgress.done} / ${exportProgress.total}` : ""}
                  </span>
                  <button
                    onClick={handleCancelExport}
                    className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/20"
                  >
                    중단
                  </button>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: exportProgress.total > 0 ? `${(exportProgress.done / exportProgress.total) * 100}%` : "10%",
                    background: "var(--report-grad)",
                  }}
                />
              </div>
            </div>
          )}
          {data && headerOpen && (
            <div className="w-full mt-2 rounded-md border border-border bg-background/60 p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">상단 라벨 (영문)</span>
                <input value={headerEyebrow} onChange={(e) => updateHeaderEyebrow(e.target.value)} className="rounded-md border border-border bg-background p-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">메인 제목</span>
                <input value={headerTitle} onChange={(e) => updateHeaderTitle(e.target.value)} className="rounded-md border border-border bg-background p-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">부제목</span>
                <input value={headerSubtitle} onChange={(e) => updateHeaderSubtitle(e.target.value)} className="rounded-md border border-border bg-background p-2 text-sm" />
              </label>
            </div>
          )}
          {data && commentOpen && (
            <div className="w-full mt-2 rounded-md border border-border bg-background/60 p-3">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-semibold">공통 코멘트 (모든 학생 리포트에 동일하게 표시)</label>
                <button
                  onClick={() => updateGlobalComment(DEFAULT_GLOBAL_COMMENT)}
                  className="ml-auto rounded border border-border px-2 py-0.5 text-[11px] font-semibold hover:bg-muted"
                >
                  초기화 (기본 문구 사용)
                </button>
              </div>
              <textarea
                value={globalComment}
                onChange={(e) => updateGlobalComment(e.target.value)}
                placeholder="비워두면 등급에 따른 기본 코멘트가 표시됩니다."
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-8">
        {error && (
          <div className="mx-auto max-w-2xl rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {loading && <div className="text-center text-muted-foreground py-10">엑셀 파일을 분석하는 중…</div>}
        {!data && !loading && !error && (
          <div className="mx-auto max-w-xl mt-16 text-center">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className="rounded-2xl border-2 border-dashed border-border bg-card/50 px-10 py-16 transition-colors"
            >
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-xl font-bold mb-2">엑셀 파일을 업로드하세요</h2>
              <p className="text-sm text-muted-foreground mb-6">
                진단평가 결과 엑셀 파일(.xlsx)을 업로드하면 학생별 리포트가 자동 생성됩니다.
              </p>
              <label
                className="inline-block cursor-pointer rounded-md px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90"
                style={{ background: "var(--report-grad)" }}
              >
                파일 선택 또는 끌어다 놓기
                <input
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="text-[11px] text-muted-foreground mt-6">
                필수 시트: 문법유형 · 중1FO/INTER/AD/IVY(문법주관식) · 중1(문법) · 중1(독해) · 중1(단어누적) · 이름(명렬표)
              </p>
            </div>
          </div>
        )}
        {cls && student && <ReportPage cls={cls} student={student} globalComment={globalComment} headerEyebrow={headerEyebrow} headerTitle={headerTitle} headerSubtitle={headerSubtitle} />}
      </main>
    </div>
  );
}
