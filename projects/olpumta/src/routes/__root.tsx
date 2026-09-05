import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-ink">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">페이지를 찾을 수 없어요</h2>
        <p className="mt-2 text-sm text-ink/60">주소를 다시 확인해주세요.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-sheet"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-ink">문제가 발생했어요</h1>
        <p className="mt-2 text-sm text-ink/60">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-sheet"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "옳품타 - 옳은영어 열정품은 타이머" },
      { name: "description", content: "과목별 타이머, 일·주간 통계 그래프, 친구 랭킹까지. 다이어리 감성의 공부 기록 앱 옳품타." },
      { name: "theme-color", content: "#fcf9f2" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "옳품타" },
      { property: "og:title", content: "옳품타 - 옳은영어 열정품은 타이머" },
      { property: "og:description", content: "과목별 타이머, 일·주간 통계 그래프, 친구 랭킹까지. 다이어리 감성의 공부 기록 앱 옳품타." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "옳품타 - 옳은영어 열정품은 타이머" },
      { name: "twitter:description", content: "과목별 타이머, 일·주간 통계 그래프, 친구 랭킹까지. 다이어리 감성의 공부 기록 앱 옳품타." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/oiDFvdvsgoYOKc6wHcqdFZvD3iC2/social-images/social-1780469949445-3213213213213213.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/oiDFvdvsgoYOKc6wHcqdFZvD3iC2/social-images/social-1780469949445-3213213213213213.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", href: "/icon-512.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthInvalidator() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInvalidator />
        <Outlet />
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
