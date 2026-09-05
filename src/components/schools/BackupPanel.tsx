import { useRef, useState } from "react";
import { downloadObservations, editedCount, importObservations, useObservations } from "@/lib/schools/store";
import { BACKUP } from "@/lib/schools/copy";
import { Icon } from "@/components/schools/Art";

/**
 * 관측 입력은 이 브라우저에만 저장된다.
 * 다른 기기로 옮기거나 백업하려면 파일로 내보낸다.
 */
export function BackupPanel() {
  // 내보내는 파일에는 사용자 입력만 들어간다. 시드를 세면 빈 백업을 "7개교"로 안내하게 된다.
  useObservations();
  const count = editedCount();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const onFile = async (file: File) => {
    const text = await file.text();
    const result = importObservations(text);
    if (result.status === "ok") setMsg({ tone: "ok", text: BACKUP.imported(result.count) });
    else setMsg({ tone: "err", text: result.reason });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="orun-callout" style={{ margin: "34px 0 0" }}>
      <Icon name="folder" size={19} style={{ color: "var(--ink)", marginTop: 1 }} />
      <div>
        <div className="orun-callout__label">{BACKUP.en}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{BACKUP.title}</div>
        <p style={{ maxWidth: "62ch" }}>{BACKUP.text(count)}</p>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginTop: 14 }}>
          <button className="orun-btn orun-btn--sm orun-btn--primary" onClick={downloadObservations} disabled={count === 0}>
            <Icon name="download" size={14} />
            {BACKUP.export}
          </button>
          <button className="orun-btn orun-btn--sm" onClick={() => fileRef.current?.click()}>
            <Icon name="folder" size={14} />
            {BACKUP.import}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
            style={{ display: "none" }}
          />
          {msg && <span style={{ fontSize: 12.5, color: msg.tone === "ok" ? "var(--blue)" : "var(--brick)" }}>{msg.text}</span>}
        </div>
      </div>
    </div>
  );
}
