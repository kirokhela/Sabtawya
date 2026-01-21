"use client";

import GlassCard from "@/app/components/GlassCard";
import { useEffect, useState } from "react";

type AuthUser = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "GATE_ADMIN" | "SERVANT";
  nameAr: string;
};

const roleAr: Record<AuthUser["role"], string> = {
  SUPER_ADMIN: "سوبر أدمن",
  ADMIN: "أدمن",
  GATE_ADMIN: "مسؤول البوابة",
  SERVANT: "خادم",
};

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white">الرئيسية</h1>
        <p className="text-white/80 mt-1">نظرة سريعة على النظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Welcome card */}
        <GlassCard className="lg:col-span-2">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-500">مرحباً</div>
              <div className="text-xl font-black mt-1">
                {user?.nameAr ?? "مستخدم"}
              </div>
              <div className="mt-2 inline-flex items-center gap-2">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                  الدور: {user ? roleAr[user.role] : "غير معروف"}
                </span>
              </div>

              <div className="mt-5 text-sm text-slate-600 leading-7">
                من هنا هتقدر تسجل الحضور، تضيف نقاط حسب الأسباب، وتتابع السجلات.
              </div>
            </>
          )}
        </GlassCard>

        {/* Quick actions */}
        <GlassCard>
          <div className="text-sm font-black mb-3">اختصارات</div>

          <div className="grid gap-2">
            <a
              href="/attendance"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold hover:bg-slate-50 transition-colors"
            >
              تسجيل الحضور
            </a>
            <a
              href="/students"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold hover:bg-slate-50 transition-colors"
            >
              إدارة الطلاب
            </a>
            <a
              href="/reasons"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold hover:bg-slate-50 transition-colors"
            >
              إدارة الأسباب
            </a>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            * هنربط الصلاحيات بعد ما نجيب بيانات المستخدم (SuperAdmin فقط يشوف Users/Logs).
          </div>
        </GlassCard>
      </div>

      {/* Stats placeholders (next step will connect to DB) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-xs text-slate-500">عدد الطلاب</div>
          <div className="text-2xl font-black mt-1">—</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-slate-500">حضور اليوم</div>
          <div className="text-2xl font-black mt-1">—</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-slate-500">عمليات اليوم</div>
          <div className="text-2xl font-black mt-1">—</div>
        </GlassCard>
      </div>
    </div>
  );
}