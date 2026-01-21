"use client";

import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => username.trim().length >= 3 && password.length >= 3,
    [username, password]
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || "فشل تسجيل الدخول");
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* blurred bg */}
      <div
        className="absolute inset-0 scale-110 blur-2xl"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-white text-right mb-4">
            <div className="text-3xl font-black">نظام مدارس الأحد</div>
            <div className="text-white/80 mt-2 text-sm">تسجيل الحضور • النقاط • السجلات</div>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur p-4"
          >
            <div className="bg-white/95 rounded-2xl p-5">
              <h1 className="text-xl font-black mb-1">تسجيل الدخول</h1>
              <p className="text-slate-500 text-sm mb-4">أدخل بياناتك للمتابعة</p>

              <label className="block text-sm font-extrabold mb-2">اسم المستخدم</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: superadmin"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                autoComplete="username"
              />

              <label className="block text-sm font-extrabold mt-4 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                autoComplete="current-password"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5">
                <Button type="submit" disabled={!canSubmit || loading}>
                  {loading ? "جاري الدخول..." : "دخول"}
                </Button>

                <div className="mt-3 text-xs text-slate-500">
                  * إذا نسيت كلمة المرور تواصل مع المشرف.
                </div>
              </div>
            </div>
          </form>

          <div className="text-center text-white/80 text-xs mt-4">
            © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  );
}
