"use client";

import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useEffect, useMemo, useState } from "react";

type Reason = {
  id: string;
  nameAr: string;
  points: number;
  category: "ATTENDANCE" | "MASS" | "CONFESSION" | "DISCIPLINE" | "OTHER" | "PURCHASE";
  limitType: "NONE" | "ONCE_PER_CALENDAR_MONTH";
  allowedRoles: Array<"SUPER_ADMIN" | "ADMIN" | "GATE_ADMIN" | "SERVANT">;
  isActive: boolean;
};

const categoryAr: Record<Reason["category"], string> = {
  ATTENDANCE: "حضور",
  MASS: "قداس",
  CONFESSION: "اعتراف",
  DISCIPLINE: "انضباط",
  OTHER: "أخرى",
  PURCHASE: "شراء",
};

const roleAr = {
  SUPER_ADMIN: "سوبر أدمن",
  ADMIN: "أدمن",
  GATE_ADMIN: "بوابة",
  SERVANT: "خادم",
} as const;

const limitAr: Record<Reason["limitType"], string> = {
  NONE: "بدون حد",
  ONCE_PER_CALENDAR_MONTH: "مرة كل شهر",
};

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold hover:bg-slate-50"
              >
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

export default function ReasonsPage() {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"" | Reason["category"]>("");
  const [activeOnly, setActiveOnly] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reason | null>(null);

  // form
  const [nameAr, setNameAr] = useState("");
  const [points, setPoints] = useState<number>(5);
  const [formCategory, setFormCategory] = useState<Reason["category"]>("ATTENDANCE");
  const [limitType, setLimitType] = useState<Reason["limitType"]>("NONE");
  const [allowedRoles, setAllowedRoles] = useState<Reason["allowedRoles"]>(["SERVANT", "GATE_ADMIN", "ADMIN", "SUPER_ADMIN"]);
  const [isActive, setIsActive] = useState(true);

  const canSave = useMemo(() => nameAr.trim().length >= 2 && points >= 0 && allowedRoles.length >= 1, [nameAr, points, allowedRoles]);

  async function loadReasons() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    params.set("active", activeOnly ? "true" : ""); // لو فاضي هنجيب الكل

    const res = await fetch(`/api/reasons?${params.toString()}`);
    const data = await res.json();
    setReasons(data.reasons || []);
    setLoading(false);
  }

  useEffect(() => {
    loadReasons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setNameAr("");
    setPoints(5);
    setFormCategory("ATTENDANCE");
    setLimitType("NONE");
    setAllowedRoles(["SERVANT", "GATE_ADMIN", "ADMIN", "SUPER_ADMIN"]);
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(r: Reason) {
    setEditing(r);
    setNameAr(r.nameAr);
    setPoints(r.points);
    setFormCategory(r.category);
    setLimitType(r.limitType);
    setAllowedRoles(r.allowedRoles);
    setIsActive(r.isActive);
    setModalOpen(true);
  }

  function toggleRole(role: Reason["allowedRoles"][number]) {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((x) => x !== role) : [...prev, role]
    );
  }

  async function save() {
    if (!canSave) return;

    const payload = {
      nameAr: nameAr.trim(),
      points,
      category: formCategory,
      limitType,
      allowedRoles,
      isActive,
    };

    if (!editing) {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.message || "فشل إنشاء السبب");
    } else {
      const res = await fetch(`/api/reasons/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.message || "فشل تعديل السبب");
    }

    setModalOpen(false);
    await loadReasons();
  }

  async function disableReason(id: string) {
    const ok = confirm("تعطيل السبب؟");
    if (!ok) return;

    const res = await fetch(`/api/reasons/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data?.message || "فشل تعطيل السبب");

    await loadReasons();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">الأسباب</h1>
          <p className="text-white/80 mt-1">أسباب النقاط + قيمتها + الحدود</p>
        </div>

        <div className="w-44">
          <Button onClick={openCreate}>+ إضافة سبب</Button>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex-1">
            <label className="text-xs font-extrabold text-slate-600">بحث</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="ابحث باسم السبب"
            />
          </div>

          <div className="w-full md:w-72">
            <label className="text-xs font-extrabold text-slate-600">التصنيف</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="">الكل</option>
              {Object.entries(categoryAr).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-60">
            <label className="text-xs font-extrabold text-slate-600">الحالة</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="activeOnly"
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
              />
              <label htmlFor="activeOnly" className="text-sm font-bold text-slate-700">
                عرض النشطة فقط
              </label>
            </div>
          </div>

          <div className="w-full md:w-36">
            <Button variant="secondary" onClick={loadReasons}>تحديث</Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الاسم</th>
                <th className="py-2 px-2 font-extrabold">التصنيف</th>
                <th className="py-2 px-2 font-extrabold">النقاط</th>
                <th className="py-2 px-2 font-extrabold">الحد</th>
                <th className="py-2 px-2 font-extrabold">مسموح لـ</th>
                <th className="py-2 px-2 font-extrabold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
              ) : reasons.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500 font-bold">لا توجد أسباب</td></tr>
              ) : (
                reasons.map((r) => (
                  <tr key={r.id} className="border-t border-slate-200">
                    <td className="py-3 px-2 font-extrabold">{r.nameAr}</td>
                    <td className="py-3 px-2">{categoryAr[r.category]}</td>
                    <td className="py-3 px-2">{r.points}</td>
                    <td className="py-3 px-2">{limitAr[r.limitType]}</td>
                    <td className="py-3 px-2 text-slate-700">
                      {r.allowedRoles.map((x) => roleAr[x]).join("، ")}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => disableReason(r.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"
                        >
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

      <Modal open={modalOpen} title={editing ? "تعديل سبب" : "إضافة سبب"} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">اسم السبب *</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="مثال: حضور الاجتماع"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">التصنيف *</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              {Object.entries(categoryAr).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">النقاط *</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              min={0}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">الحد</label>
            <select
              value={limitType}
              onChange={(e) => setLimitType(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="NONE">بدون حد</option>
              <option value="ONCE_PER_CALENDAR_MONTH">مرة كل شهر (مثلاً الاعتراف)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">مسموح لمن؟ *</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {(["SERVANT","GATE_ADMIN","ADMIN","SUPER_ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={[
                    "rounded-xl border px-3 py-2 text-xs font-extrabold",
                    allowedRoles.includes(r)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  ].join(" ")}
                >
                  {roleAr[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mt-2">
              <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700">
                نشط
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={save} disabled={!canSave}>{editing ? "حفظ" : "إضافة"}</Button>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>إلغاء</Button>
        </div>
      </Modal>
    </div>
  );
}
