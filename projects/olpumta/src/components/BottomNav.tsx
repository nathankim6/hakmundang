import { Link } from "@tanstack/react-router";
import { Clock, BarChart3, Camera, Users, User, Shield } from "lucide-react";
import { useIsAdmin } from "@/lib/admin";

const baseItems = [
  { to: "/", label: "타이머", Icon: Clock, adminOnly: false },
  { to: "/stats", label: "통계", Icon: BarChart3, adminOnly: false },
  { to: "/verify", label: "인증", Icon: Camera, adminOnly: false },
  { to: "/friends", label: "랭킹", Icon: Users, adminOnly: false },
  { to: "/profile", label: "마이", Icon: User, adminOnly: false },
  { to: "/admin", label: "관리", Icon: Shield, adminOnly: true },
] as const;

export function BottomNav() {
  const admin = useIsAdmin();
  const items = baseItems.filter(i => !i.adminOnly || admin);
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md h-16 bg-sheet/90 backdrop-blur-md rounded-full ring-1 ring-black/5 shadow-lg flex items-center justify-around px-3 z-50">
      {items.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col items-center gap-1 text-ink/40 px-2"
          activeProps={{ className: "flex flex-col items-center gap-1 text-accent px-2" }}
          activeOptions={{ exact: to === "/" }}
        >
          <Icon className="size-5" strokeWidth={2.5} />
          <span className="text-[10px] font-semibold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
