"use client";

import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useToast } from "@/app/components/ToastProvider";
import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  nameAr: string;
  costPoints: number;
  stock: number | null;
  isActive: boolean;
};

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
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

export default function RewardsPage() {
     const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const [nameAr, setNameAr] = useState("");
  const [costPoints, setCostPoints] = useState(10);
  const [stock, setStock] = useState<string>(""); // empty => null
  const [isActive, setIsActive] = useState(true);

  const canSave = useMemo(() => nameAr.trim().length >= 2 && costPoints >= 1, [nameAr, costPoints]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (activeOnly) params.set("active", "true");

    const res = await fetch(`/api/rewards?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setNameAr("");
    setCostPoints(10);
    setStock("");
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(it: Item) {
    setEditing(it);
    setNameAr(it.nameAr);
    setCostPoints(it.costPoints);
    setStock(it.stock === null ? "" : String(it.stock));
    setIsActive(it.isActive);
    setModalOpen(true);
  }

  async function save() {
    if (!canSave) return;

    const payload = {
      nameAr: nameAr.trim(),
      costPoints,
      stock: stock.trim() === "" ? null : Number(stock),
      isActive,
    };

    const res = await fetch(editing ? `/api/rewards/${editing.id}` : "/api/rewards", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "حدث خطأ" });
      return;
    }

    toast ({ type: "success", title: "تم", message: editing ? "تم تعديل الهدية" : "تم إنشاء الهدية" });
    setModalOpen(false);
    await load();
  }

  async function disable(id: string) {
    const ok = confirm("تعطيل الهدية؟");
    if (!ok) return;

    const res = await fetch(`/api/rewards/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "حدث خطأ" });
      return;
    }

    toast({ type: "success", title: "تم", message: "تم تعطيل الهدية" });
    await load();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">الجوائز</h1>
          <p className="text-white/80 mt-1">إدارة قائمة الجوائز وتكلفتها</p>
        </div>

        <div className="w-44">
          <Button onClick={openCreate}>+ إضافة هدية</Button>
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
              placeholder="ابحث باسم الهدية"
            />
          </div>

          <div className="w-full md:w-56">
            <label className="text-xs font-extrabold text-slate-600">الحالة</label>
            <div className="mt-2 flex items-center gap-2">
              <input id="activeOnly" type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
              <label htmlFor="activeOnly" className="text-sm font-bold text-slate-700">عرض النشطة فقط</label>
            </div>
          </div>

          <div className="w-full md:w-36">
            <Button variant="secondary" onClick={load}>تحديث</Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الاسم</th>
                <th className="py-2 px-2 font-extrabold">التكلفة</th>
                <th className="py-2 px-2 font-extrabold">المخزون</th>
                <th className="py-2 px-2 font-extrabold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500 font-bold">لا توجد جوائز</td></tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="border-t border-slate-200">
                    <td className="py-3 px-2 font-extrabold">{it.nameAr}</td>
                    <td className="py-3 px-2">{it.costPoints} نقطة</td>
                    <td className="py-3 px-2">{it.stock === null ? "غير محدد" : it.stock}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(it)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50">
                          تعديل
                        </button>
                        <button onClick={() => disable(it.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100">
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

      <Modal open={modalOpen} title={editing ? "تعديل هدية" : "إضافة هدية"} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">اسم الهدية *</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">التكلفة (نقاط) *</label>
            <input
              type="number"
              value={costPoints}
              onChange={(e) => setCostPoints(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              min={1}
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">المخزون (اختياري)</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              min={0}
              placeholder="اتركه فارغًا لو غير محدد"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mt-2">
              <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700">نشط</label>
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
