"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/home", label: "الرئيسية" },
  { href: "/students", label: "الطلاب" },
  { href: "/classes", label: "الفصول" },
  { href: "/attendance", label: "الحضور" },
  { href: "/reasons", label: "الأسباب" },
  { href: "/rewards", label: "المكافآت" },
  { href: "/users", label: "المستخدمين" },
  { href: "/logs", label: "السجلات" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative w-6 h-6">
      <span
        className={`absolute left-0 top-1.5 h-0.5 w-6 bg-slate-900 transition ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-3 h-0.5 w-6 bg-slate-900 transition ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-4.5 h-0.5 w-6 bg-slate-900 transition ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      {/* top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-black">نظام مدارس الأحد</div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-xl border border-slate-200 bg-white active:scale-[0.98]"
            aria-label="فتح القائمة"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {/* overlay (mobile) */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* sidebar drawer (mobile) */}
      <aside
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white border-l border-slate-200 shadow-2xl transform transition ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="font-black text-base">نظام مدارس الأحد</div>
          <div className="text-xs text-slate-500 mt-1">إدارة الحضور والنقاط</div>
        </div>

        <nav className="p-3 flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition
                  ${active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 mt-auto">
          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold hover:bg-slate-50"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* sidebar (desktop) */}
      <aside className="hidden md:block fixed right-0 top-0 h-screen w-64 bg-white border-l border-slate-200">
        <div className="p-5">
          <div className="font-black text-lg">نظام مدارس الأحد</div>
          <div className="text-xs text-slate-500 mt-1">إدارة الحضور والنقاط</div>
        </div>

        <nav className="px-3 pb-3 flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition
                  ${active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold hover:bg-slate-50"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
