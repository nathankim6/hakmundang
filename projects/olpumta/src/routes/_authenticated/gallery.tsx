import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { useMemo, useState } from "react";
import { ArrowLeft, Images, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/gallery")({
  component: Gallery,
  head: () => ({
    meta: [
      { title: "내 갤러리 — 옳품타" },
      { name: "description", content: "내가 올린 공부 인증 사진을 날짜별로 모아봐요." },
    ],
  }),
});

type Photo = {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
};

const SEOUL_TZ = "Asia/Seoul";

function seoulDateKey(iso: string) {
  // returns YYYY-MM-DD in Asia/Seoul
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatDateHeader(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 3)); // mid-day KST safe
  const now = new Date();
  const todayKey = seoulDateKey(now.toISOString());
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = seoulDateKey(yesterday.toISOString());
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()];
  const base = `${m}월 ${d}일 (${weekday})`;
  if (key === todayKey) return `오늘 · ${base}`;
  if (key === yKey) return `어제 · ${base}`;
  if (y !== now.getFullYear()) return `${y}년 ${base}`;
  return base;
}

function Gallery() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [active, setActive] = useState<Photo | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["my-gallery", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_photos")
        .select("id, photo_url, caption, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Photo[];
    },
  });

  const grouped = useMemo(() => {
    const m = new Map<string, Photo[]>();
    for (const p of photos) {
      const k = seoulDateKey(p.created_at);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    return Array.from(m.entries()); // already date-desc due to query order
  }, [photos]);

  return (
    <div className="min-h-screen bg-paper text-ink pb-32">
      <header className="max-w-md mx-auto pt-10 px-6 flex items-center justify-between gap-3">
        <Link
          to="/verify"
          className="size-9 rounded-full bg-black/[0.05] hover:bg-black/[0.08] grid place-items-center transition"
          aria-label="뒤로"
        >
          <ArrowLeft className="size-4.5" strokeWidth={2.4} />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-semibold font-display">내 갤러리</h1>
          <p className="text-[11px] text-ink/50">총 {photos.length}장</p>
        </div>
        <div className="size-9" />
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-7">
        {isLoading ? (
          <p className="text-sm text-ink/40 text-center py-12">불러오는 중…</p>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 px-8">
            <Images className="size-12 mx-auto text-ink/30 mb-3" />
            <p className="text-sm text-ink/60">아직 인증 사진이 없어요</p>
            <Link
              to="/verify"
              className="inline-block mt-4 px-4 py-2 rounded-full bg-ink text-white text-xs font-semibold"
            >
              인증하러 가기
            </Link>
          </div>
        ) : (
          grouped.map(([dateKey, items]) => (
            <section key={dateKey}>
              <div className="flex items-end justify-between mb-2 px-1">
                <h2 className="text-sm font-semibold text-ink">{formatDateHeader(dateKey)}</h2>
                <span className="text-[11px] text-ink/40">{items.length}장</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p)}
                    className="aspect-square overflow-hidden rounded-md bg-black/[0.04] group relative"
                  >
                    <img
                      src={p.photo_url}
                      alt={p.caption ?? "공부 인증"}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {active && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-5 right-5 size-9 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.photo_url}
              alt={active.caption ?? "공부 인증"}
              className="w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-white/90 text-sm text-center">
              {active.caption && <p className="mb-1">{active.caption}</p>}
              <p className="text-[11px] text-white/60">
                {new Date(active.created_at).toLocaleString("ko-KR", { timeZone: SEOUL_TZ })}
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
