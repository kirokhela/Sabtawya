"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastCtx = {
  toast: (t: { type: ToastType; title: string; message?: string }) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const api = useMemo(
    () => ({
      toast: (t: { type: ToastType; title: string; message?: string }) => {
        const id = crypto.randomUUID();
        const toast: Toast = { id, ...t };
        setToasts((prev) => [toast, ...prev].slice(0, 4));

        setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== id));
        }, 3200);
      },
    }),
    []
  );

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* Toasts */}
      <div className="fixed top-4 left-4 z-[9999] flex w-[92vw] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl",
              "bg-white/85",
              t.type === "success" ? "border-emerald-200" : "",
              t.type === "error" ? "border-red-200" : "",
              t.type === "info" ? "border-slate-200" : "",
            ].join(" ")}
            style={{ direction: "rtl" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-black text-sm text-slate-900">{t.title}</div>
                {t.message && <div className="mt-1 text-xs font-bold text-slate-600">{t.message}</div>}
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-extrabold hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
