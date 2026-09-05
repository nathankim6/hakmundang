import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/debug-neis")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const name = u.searchParams.get("name") ?? "오륜중학교";
        const key = process.env.NEIS_API_KEY;
        const qs = new URLSearchParams({
          Type: "json",
          pIndex: "1",
          pSize: "10",
          SCHUL_NM: name,
          ...(key ? { KEY: key } : {}),
        });
        const url = `https://open.neis.go.kr/hub/schoolInfo?${qs}`;
        const r = await fetch(url);
        const text = await r.text();
        return new Response(
          JSON.stringify({
            hasKey: !!key,
            keyLen: key?.length ?? 0,
            url,
            status: r.status,
            body: text.slice(0, 1500),
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
