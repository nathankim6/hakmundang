import { createFileRoute } from "@tanstack/react-router";

// Server-side proxy for 학교알리미 OpenAPI (schoolinfo.go.kr) so the bundled
// HTML pages can call it from the browser without hitting CORS.
export const Route = createFileRoute("/api/schoolinfo-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const target = u.searchParams.get("url");
        if (!target) return new Response("missing url", { status: 400 });
        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return new Response("invalid url", { status: 400 });
        }
        if (
          parsed.hostname !== "www.schoolinfo.go.kr" &&
          parsed.hostname !== "open.neis.go.kr"
        ) {
          return new Response("host not allowed", { status: 400 });
        }
        try {
          const r = await fetch(parsed.toString(), {
            headers: { "User-Agent": "Mozilla/5.0 lovable-proxy" },
          });
          const text = await r.text();
          return new Response(text, {
            status: r.status,
            headers: {
              "content-type":
                r.headers.get("content-type") ?? "application/xml; charset=utf-8",
              "cache-control": "public, max-age=3600",
              "access-control-allow-origin": "*",
            },
          });
        } catch (e) {
          return new Response(`proxy error: ${(e as Error).message}`, {
            status: 502,
          });
        }
      },
    },
  },
});
