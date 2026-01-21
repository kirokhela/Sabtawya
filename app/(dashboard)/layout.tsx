import AppBackground from "../components/AppBackground";
import SidebarShell from "./sidebar-shell";
import { requireAuth } from "@/app/lib/serverAuth.ts";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuth(); // لازم يرجع { role: "SUPER_ADMIN" | ... }

  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <SidebarShell role={auth.role}>
        {children}
      </SidebarShell>
    </div>
  );
}
