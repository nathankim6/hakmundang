import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

// 알 선택은 폐기됨. 등대로 자동 배정 후 홈으로 이동합니다.
export const Route = createFileRoute("/_authenticated/character")({ component: AutoAssign });

function AutoAssign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      if (user) {
        await supabase.from("profiles").update({ character_type: "lighthouse" }).eq("id", user.id);
        await qc.invalidateQueries({ queryKey: ["profile-character", user.id] });
      }
      navigate({ to: "/" });
    })();
  }, [user, navigate, qc]);

  return <div className="min-h-screen bg-paper" />;
}
