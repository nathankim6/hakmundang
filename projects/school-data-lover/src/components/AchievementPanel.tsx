import { useServerFn } from "@tanstack/react-start";
import { useQueries } from "@tanstack/react-query";
import { getAchievement3yr } from "@/lib/neis.functions";

type Props = {
  schools: string[];
  level: "고등학교" | "중학교";
  accent: string;
  navy: string;
};

export function AchievementPanel({ schools, level, accent, navy }: Props) {
  const fn = useServerFn(getAchievement3yr);
  const queries = useQueries({
    queries: schools.map((name) => ({
      queryKey: ["ach", level, name],
      queryFn: () => fn({ data: { schoolName: name, level } }),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const pct = (v?: number) =>
    typeof v === "number" ? (v * 100).toFixed(1) + "%" : "—";

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "10px 24px 80px",
        fontFamily:
          "'Noto Sans KR','Noto Sans',-apple-system,system-ui,sans-serif",
        color: "#16212B",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <span
          style={{ width: 30, height: 2, background: accent, display: "block" }}
        />
        <span
          style={{
            letterSpacing: 3,
            fontSize: 12,
            fontWeight: 800,
            color: accent,
          }}
        >
          LIVE · NEIS + 학교알리미
        </span>
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: navy,
          letterSpacing: -0.4,
          marginBottom: 6,
        }}
      >
        학교별 정보 · <em style={{ color: accent, fontStyle: "normal" }}>최근 3개년</em> 과목별 성취도
      </h2>
      <p style={{ fontSize: 13, color: "#5A6B79", marginBottom: 22, whiteSpace: 'pre-wrap' }}>
        -NEIS 학교 기본정보 + 학교알리미 공시 학업성취사항(보통학력이상 비율)
        {"\n\u00a0"}-응답 필드가 비어 있는 학교는 공시 기준일이 다르거나 해당 연도 자료가 아직 게시되지 않은 경우입니다.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {queries.map((q, i) => {
          const name = schools[i];
          if (q.isLoading)
            return <SkeletonCard key={name} name={name} navy={navy} />;
          if (q.isError || !q.data?.ok)
            return (
              <div
                key={name}
                style={{
                  background: "#fff",
                  border: "1px solid #E2DACB",
                  borderRadius: 12,
                  padding: 18,
                  fontSize: 13,
                  color: "#9a8e74",
                }}
              >
                <b style={{ color: navy }}>{name}</b> — 데이터를 불러오지 못했습니다.
              </div>
            );
          const d = q.data;
          if (!d.ok) return null;
          return (
            <article
              key={name}
              style={{
                background: "#fff",
                border: "1px solid #E2DACB",
                borderRadius: 14,
                padding: "20px 22px",
                boxShadow: "0 10px 28px -22px rgba(11,26,42,.4)",
                borderTop: `3px solid ${accent}`,
              }}
            >
              <header
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: navy,
                    letterSpacing: -0.3,
                  }}
                >
                  {d.school.name}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    background: navy,
                    color: "#fff",
                    borderRadius: 20,
                    letterSpacing: 0.3,
                  }}
                >
                  {d.school.kind}
                </span>
                {d.school.coedu && (
                  <span style={{ fontSize: 12, color: "#5A6B79" }}>
                    {d.school.coedu}
                  </span>
                )}
                {d.school.homepage && (
                  <a
                    href={d.school.homepage}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      color: accent,
                      marginLeft: "auto",
                      fontWeight: 700,
                    }}
                  >
                    홈페이지 ↗
                  </a>
                )}
              </header>
              <div
                style={{
                  fontSize: 12.5,
                  color: "#5A6B79",
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                {d.school.address}
                {d.school.founded && ` · 개교 ${d.school.founded.slice(0, 4)}년`}
                {d.school.code && ` · 코드 ${d.school.code}`}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 13.5,
                  }}
                >
                  <thead>
                    <tr>
                      {["학년도", "국어", "영어", "수학", "평균"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === "학년도" ? "left" : "center",
                            padding: "9px 8px",
                            fontSize: 11.5,
                            letterSpacing: 1,
                            color: "#5A6B79",
                            fontWeight: 700,
                            borderBottom: `2px solid ${navy}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.achievement.map((y) => (
                      <tr key={y.year}>
                        <td
                          style={{
                            padding: "10px 8px",
                            fontWeight: 700,
                            color: navy,
                            borderTop: "1px solid #E2DACB",
                          }}
                        >
                          {y.year}
                        </td>
                        {[y.kor, y.eng, y.math, y.avg].map((v, idx) => (
                          <td
                            key={idx}
                            style={{
                              textAlign: "center",
                              padding: "10px 8px",
                              borderTop: "1px solid #E2DACB",
                              fontWeight: 700,
                              color:
                                typeof v === "number"
                                  ? v >= 0.9
                                    ? accent
                                    : navy
                                  : "#b6ab92",
                            }}
                          >
                            {pct(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  color: "#9aa6b0",
                  textAlign: "right",
                }}
              >
                보통학력이상 비율 · 학교알리미 공시 기준
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SkeletonCard({ name, navy }: { name: string; navy: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2DACB",
        borderRadius: 14,
        padding: 20,
        fontSize: 13,
        color: "#9aa6b0",
      }}
    >
      <b style={{ color: navy }}>{name}</b> · 불러오는 중…
    </div>
  );
}
