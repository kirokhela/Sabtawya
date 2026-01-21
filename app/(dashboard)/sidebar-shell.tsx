"use client";

import type { Role } from "@prisma/client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function SidebarShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <aside
        className={`
          fixed top-5 right-0 h-full w-72 z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0
        `}
      >
        <Sidebar role={role} open={open} onClose={() => setOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-4 md:pt-6 px-4 md:px-6 md:pr-80">
        {/* Mobile menu button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white font-extrabold backdrop-blur shadow-lg"
          >
            ☰ القائمة
          </button>
        </div>

        {/* Page content */}
        <div className="max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}