"use client";

import { filterNavByRole } from "@/app/lib/filterNav";
import { NAV_ITEMS } from "@/app/lib/navLinks";
import type { Role } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

export default function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const items = filterNavByRole(NAV_ITEMS, role);

  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) {
      return toast({ type: "error", title: "فشل", message: "لم يتم تسجيل الخروج" });
    }
    toast({ type: "success", title: "تم", message: "تم تسجيل الخروج" });
    router.replace("/login");
  }

  // Mobile overlay
  const showOverlay = open;

  return (
    <>
      {showOverlay && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          // Desktop: static
          "md:static md:translate-x-0 md:z-auto md:h-auto",
          // Mobile: drawer
          "fixed top-0 right-0 z-50 h-full w-[280px] transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="h-full md:h-[calc(100vh-48px)] md:sticky md:top-6">
          <div className="h-full rounded-3xl border border-white/25 bg-white/10 backdrop-blur-xl shadow-2xl p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="text-lg font-black">Sabtawya</div>
                <div className="text-xs text-white/70 font-bold">
                  الدور: {role === "SUPER_ADMIN" ? "SuperAdmin" : role === "ADMIN" ? "Admin" : role === "GATE_ADMIN" ? "Gate" : "خادم"}
                </div>
              </div>

              <button
                onClick={onClose}
                className="md:hidden rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white text-sm font-extrabold"
              >
                ✕
              </button>
            </div>

            {/* Links */}
            <nav className="mt-5 space-y-2 flex-1 overflow-auto">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "block rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                      active
                        ? "bg-white text-slate-900 shadow"
                        : "text-white/90 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout at bottom */}
            <div className="pt-4 border-t border-white/15">
              <button
                onClick={logout}
                className="w-full rounded-2xl bg-white/15 hover:bg-white/20 text-white font-extrabold px-4 py-3 transition border border-white/15"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
