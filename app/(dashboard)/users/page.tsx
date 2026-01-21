"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/GlassCard";
import Button from "@/app/components/Button";
import { useToast } from "@/app/components/ToastProvider";

type UserRow = {
  id: string;
  nameAr: string;
  username: string | null;
  email: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "GATE_ADMIN" | "SERVANT";
  isActive: boolean;
  createdAt: string;
};

const roleAr: Record<UserRow["role"], string> = {
  SUPER_ADMIN: "سوبر أدمن",
  ADMIN: "أدمن",
  GATE_ADMIN: "بوابة",
  SERVANT: "خادم",
};

function Modal({ open, title, children, onClose }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">{title}</h2>
              <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold hover:bg-slate-50">
                إغلاق
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const [nameAr, setNameAr] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRow["role"]>("SERVANT");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  const canSave = useMemo(() => nameAr.trim().length >= 2 && username.trim().length >= 3, [nameAr, username]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());

    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "غير مسموح" });
      setLoading(false);
      return;
    }

    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setNameAr("");
    setUsername("");
    setRole("SERVANT");
    setIsActive(true);
    setPassword("");
    setOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing(u);
    setNameAr(u.nameAr);
    setUsername(u.username || "");
    setRole(u.role);
    setIsActive(u.isActive);
    setPassword(""); // optional reset
    setOpen(true);
  }

  async function save() {
    if (!canSave) return;

    if (!editing && password.trim().length < 6) {
      toast({ type: "error", title: "كلمة المرور", message: "لازم 6 أحرف أو أكثر" });
      return;
    }

    const payload: any = {
      nameAr: nameAr.trim(),
      username: username.trim(),
      role,
      isActive,
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    const res = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "حدث خطأ" });
      return;
    }

    toast({ type: "success", title: "تم", message: editing ? "تم تعديل المستخدم" : "تم إنشاء المستخدم" });
    setOpen(false);
    await load();
  }

  async function disableUser(id: string) {
    const ok = confirm("تعطيل المستخدم؟");
    if (!ok) return;

    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "حدث خطأ" });
      return;
    }

    toast({ type: "success", title: "تم", message: "تم تعطيل المستخدم" });
    await load();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">المستخدمين</h1>
          <p className="text-white/80 mt-1">إنشاء وتعديل وتعطيل المستخدمين (سوبر أدمن فقط)</p>
        </div>
        <div className="w-44">
          <Button onClick={openCreate}>+ إضافة مستخدم</Button>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <label className="text-xs font-extrabold text-slate-600">بحث</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="اسم / يوزرنيم / ايميل"
            />
          </div>
          <div className="w-full md:w-40">
            <Button variant="secondary" onClick={load}>تحديث</Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الاسم</th>
                <th className="py-2 px-2 font-extrabold">اسم المستخدم</th>
                <th className="py-2 px-2 font-extrabold">الدور</th>
                <th className="py-2 px-2 font-extrabold">الحالة</th>
                <th className="py-2 px-2 font-extrabold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-bold">لا يوجد مستخدمين</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200">
                    <td className="py-3 px-2 font-extrabold">{u.nameAr}</td>
                    <td className="py-3 px-2">{u.username || "—"}</td>
                    <td className="py-3 px-2">{roleAr[u.role]}</td>
                    <td className="py-3 px-2">
                      <span className={u.isActive ? "font-black text-emerald-700" : "font-black text-red-700"}>
                        {u.isActive ? "نشط" : "معطّل"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50">
                          تعديل
                        </button>
                        <button onClick={() => disableUser(u.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100">
                          تعطيل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal open={open} title={editing ? "تعديل مستخدم" : "إضافة مستخدم"} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">الاسم *</label>
            <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200" />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">اسم المستخدم *</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200" />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">الدور *</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200">
              <option value="SERVANT">خادم</option>
              <option value="GATE_ADMIN">بوابة</option>
              <option value="ADMIN">أدمن</option>
              <option value="SUPER_ADMIN">سوبر أدمن</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">كلمة المرور {editing ? "(اختياري لتغييرها)" : "*"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder={editing ? "اتركها فارغة لو مش هتغير" : "لازم 6 أحرف أو أكثر"}
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mt-2">
              <input id="active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <label htmlFor="active" className="text-sm font-bold text-slate-700">نشط</label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={save} disabled={!canSave}>{editing ? "حفظ" : "إضافة"}</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button>
        </div>
      </Modal>
    </div>
  );
}
