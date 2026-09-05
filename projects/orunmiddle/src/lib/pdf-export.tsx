import { createRoot, type Root } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { ReportPage } from "@/components/ReportPage";
import type { Diagnostic } from "@/lib/diagnostic";

type Opts = {
  data: Diagnostic;
  classKey?: string;
  globalComment: string;
  headerEyebrow: string;
  headerTitle: string;
  headerSubtitle: string;
  onProgress?: (done: number, total: number, label: string) => void;
  onCancel?: () => void;
  signal?: AbortSignal;
};

export class ExportAbortedError extends Error {
  constructor() {
    super("ABORTED");
    this.name = "ExportAbortedError";
  }
}

function sanitize(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim();
}

export async function exportAllReportsAsZip(opts: Opts) {
  const { data, onProgress, signal } = opts;
  const checkAbort = () => {
    if (signal?.aborted) throw new ExportAbortedError();
  };

  const targets: Array<{ cls: any; student: any }> = [];
  const classes = opts.classKey
    ? data.classes.filter((c) => c.classKey === opts.classKey)
    : data.classes;
  for (const c of classes) {
    for (const s of c.students) {
      if (s.hasAny) targets.push({ cls: c, student: s });
    }
  }
  const total = targets.length;
  if (total === 0) throw new Error("응시한 학생이 없습니다.");

  // Visible overlay so each report actually paints on screen (one student at a
  // time) before capture — this guarantees the SVG charts are fully rendered.
  const backdrop = document.createElement("div");
  backdrop.style.cssText =
    "position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:2147483646;display:flex;align-items:center;justify-content:center;overflow:auto;padding:16px;";
  const host = document.createElement("div");
  host.style.cssText =
    "width:297mm;height:210mm;flex:0 0 auto;background:white;box-shadow:0 20px 60px rgba(0,0,0,0.4);";
  backdrop.appendChild(host);

  // In-overlay progress bar + cancel button (the overlay covers the header UI)
  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;width:min(560px,90vw);background:#ffffff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.35);padding:16px 18px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;";
  const labelEl = document.createElement("div");
  labelEl.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;font-weight:700;color:#0f172a;margin-bottom:10px;";
  const labelText = document.createElement("span");
  labelText.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  labelText.textContent = "준비 중…";
  const countText = document.createElement("span");
  countText.style.cssText = "flex:0 0 auto;color:#64748b;font-variant-numeric:tabular-nums;";
  countText.textContent = "";
  labelEl.appendChild(labelText);
  labelEl.appendChild(countText);
  const track = document.createElement("div");
  track.style.cssText = "height:10px;width:100%;border-radius:9999px;background:#e2e8f0;overflow:hidden;";
  const barFill = document.createElement("div");
  barFill.style.cssText =
    "height:100%;width:0%;border-radius:9999px;background:linear-gradient(135deg,#2563eb,#1e3a8a);transition:width .25s ease;";
  track.appendChild(barFill);
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "중단";
  cancelBtn.style.cssText =
    "margin-top:12px;width:100%;padding:9px 12px;border:1px solid #fecaca;border-radius:9px;background:#fef2f2;color:#dc2626;font-size:13px;font-weight:800;cursor:pointer;";
  cancelBtn.onclick = () => {
    cancelBtn.disabled = true;
    cancelBtn.textContent = "중단 중…";
    cancelBtn.style.opacity = "0.6";
    opts.onCancel?.();
  };
  panel.appendChild(labelEl);
  panel.appendChild(track);
  panel.appendChild(cancelBtn);
  backdrop.appendChild(panel);

  const updatePanel = (done: number, t: number, label: string) => {
    labelText.textContent = label;
    countText.textContent = t > 0 ? `${done} / ${t}` : "";
    barFill.style.width = t > 0 ? `${(done / t) * 100}%` : "8%";
  };

  document.body.appendChild(backdrop);
  const reactRoot: Root = createRoot(host);

  const zip = new JSZip();

  try {
    for (let i = 0; i < targets.length; i++) {
      checkAbort();
      const { cls, student } = targets[i];
      const label = `${cls.sheetName} · ${student.name}`;
      onProgress?.(i, total, label);
      updatePanel(i, total, label);

      // Render the report into the visible host
      await new Promise<void>((resolve) => {
        reactRoot.render(
          <ReportPage
            cls={cls}
            student={student}
            globalComment={opts.globalComment}
            headerEyebrow={opts.headerEyebrow}
            headerTitle={opts.headerTitle}
            headerSubtitle={opts.headerSubtitle}
          />,
        );
        // Wait for fonts + multiple paint frames so the vocab chart SVG is
        // fully rendered on screen before we capture it.
        const settle = () =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setTimeout(resolve, 350)),
          );
        if (document.fonts?.ready) {
          document.fonts.ready.then(settle).catch(settle);
        } else {
          settle();
        }
      });


      checkAbort();
      const pageEl = host.querySelector(".print-page") as HTMLElement | null;
      if (!pageEl) throw new Error("리포트 렌더링 실패");

      // Force scale=1 by using the full intrinsic size
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: pageEl.scrollWidth,
        windowHeight: pageEl.scrollHeight,
      });

      const img = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(img, "JPEG", 0, 0, 297, 210, undefined, "FAST");
      const pdfBlob = pdf.output("blob");

      const filename = `${sanitize(`진단평가_${cls.sheetName}_${student.name}`)}.pdf`;
      zip.file(filename, pdfBlob);
      updatePanel(i + 1, total, label);
    }

    onProgress?.(total, total, "ZIP 생성 중…");
    cancelBtn.disabled = true;
    cancelBtn.style.opacity = "0.6";
    const zipBlob = await zip.generateAsync({ type: "blob" }, (meta) => {
      onProgress?.(total, total, `ZIP 압축 ${Math.round(meta.percent)}%`);
      updatePanel(total, total, `ZIP 압축 ${Math.round(meta.percent)}%`);
    });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    const zipName = opts.classKey
      ? `진단평가_리포트_${sanitize(classes[0]?.sheetName ?? opts.classKey)}.zip`
      : `진단평가_리포트_전체.zip`;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    reactRoot.unmount();
    backdrop.remove();
  }
}
