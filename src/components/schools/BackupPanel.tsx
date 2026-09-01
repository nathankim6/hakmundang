import { useRef, useState } from "react";
import { downloadObservations, importObservations, useObservations } from "@/lib/schools/store";

/**
 * 관측 입력은 이 브라우저에만 저장된다.
 * 다른 기기로 옮기거나 백업하려면 파일로 내보낸다.
 */
export function BackupPanel() {
  const observations = useObservations();
  const count = Object.keys(observations).length;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const onFile = async (file: File) => {
    const text = await file.text();
    const result = importObservations(text);
    if (result.status === "ok") {
      setMsg({ tone: "ok", text: `${result.count}개교를 불러왔습니다.` });
    } else {
      setMsg({ tone: "err", text: result.reason });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div
      style={{
        background: "var(--paper)",
        borderLeft: "2px solid var(--yellow-hi)",
        padding: "18px 22px",
        margin: "34px 0 0",
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9.5,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        Backup · 이 브라우저에만 저장됩니다
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 13.5, maxWidth: "62ch" }}>
        입력하신 <strong style={{ color: "var(--ink)" }}>{count}개교</strong>는 지금 이 브라우저에
        저장되어 있습니다. 다른 컴퓨터에서 쓰시거나 백업하시려면 파일로 내보내 주세요. 브라우저
        데이터를 지우면 함께 사라집니다.
      </p>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={downloadObservations}
          disabled={count === 0}
          style={{
            padding: "9px 16px",
            border: "none",
            background: count ? "var(--ink)" : "var(--hair)",
            color: count ? "#fff" : "var(--muted)",
            fontSize: 13,
            fontWeight: 700,
            cursor: count ? "pointer" : "not-allowed",
          }}
        >
          파일로 내보내기
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            padding: "9px 16px",
            border: "1px solid var(--hair)",
            background: "transparent",
            color: "var(--body)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          파일 불러오기
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
        {msg && (
          <span
            style={{
              fontSize: 12.5,
              color: msg.tone === "ok" ? "var(--blue)" : "var(--brick)",
            }}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
