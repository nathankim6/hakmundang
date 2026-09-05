import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-character", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("character_type, campus, class_name, full_name, school, grade")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user || profileLoading) return;
    const p = profile as { campus?: string | null; class_name?: string | null; full_name?: string | null; school?: string | null; grade?: string | null; character_type?: string | null } | undefined;
    const needsOnboarding = !p?.campus || !p?.class_name || !p?.full_name || !p?.school || !p?.grade;
    if (needsOnboarding && location.pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
      return;
    }
    // 건축 시스템: 캐릭터 선택 절차 폐기. 등대로 자동 배정합니다.
    if (!needsOnboarding && !p?.character_type) {
      supabase.from("profiles").update({ character_type: "lighthouse" }).eq("id", user.id).then(() => {});
    }
  }, [user, profile, profileLoading, location.pathname, navigate]);

  if (loading || !user || profileLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-ink/40 text-sm">불러오는 중...</div>
      </div>
    );
  }
  return <Outlet />;
}
