import { useAuth } from "@/lib/auth";

export const ADMIN_EMAIL = "5554ksj2@gmail.com";

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return (user?.email ?? "").toLowerCase() === ADMIN_EMAIL;
}
