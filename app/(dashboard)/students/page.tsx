"use client";

import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useToast } from "@/app/components/ToastProvider";
import type { Gender } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

type ClassItem = {
  id: string;
  nameAr: string;
  gender: Gender;
  grade: { nameAr: string; order: number };
};

type StudentRow = {
  id: string;
  nameAr: string;
  gender: "MALE" | "FEMALE";
  parentPhone1: string | null;
  parentPhone2: string | null;
  notes: string | null;
  createdAt: string;
  balance: number;
  classRoom: { id: string; nameAr: string; grade: { nameAr: string; order: number } };
};

type RewardItem = { id: string; nameAr: string; costPoints: number; stock: number | null };

const genderAr = { MALE: "ذكر", FEMALE: "أنثى" } as const;

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
        <div className="w-full max-w-xl">
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

export default function StudentsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");

  // student modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);

  // student form
  const [nameAr, setNameAr] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [formClassId, setFormClassId] = useState("");
  const [parentPhone1, setParentPhone1] = useState("");
  const [parentPhone2, setParentPhone2] = useState("");
  const [notes, setNotes] = useState("");

  const canSave = useMemo(() => nameAr.trim().length >= 2 && Boolean(formClassId), [nameAr, formClassId]);

  // purchase modal
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseStudent, setPurchaseStudent] = useState<StudentRow | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const selectedItem = rewards.find((r) => r.id === itemId);
  const totalCost = selectedItem ? selectedItem.costPoints * qty : 0;

  async function loadClasses() {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data.classes || []);
  }

  async function loadStudents() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (classId) params.set("classId", classId);

    const res = await fetch(`/api/students?${params.toString()}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  }

  async function loadRewards() {
    const res = await fetch("/api/rewards?active=true");
    const data = await res.json();
    const items: RewardItem[] = data.items || [];
    setRewards(items);
    setItemId((prev) => prev || items[0]?.id || "");
  }

  useEffect(() => {
    loadClasses();
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setNameAr("");
    setGender("MALE");
    setFormClassId(classes[0]?.id ?? "");
    setParentPhone1("");
    setParentPhone2("");
    setNotes("");
    setModalOpen(true);
  }

  function openEdit(s: StudentRow) {
    setEditing(s);
    setNameAr(s.nameAr);
    setGender(s.gender);
    setFormClassId(s.classRoom.id);
    setParentPhone1(s.parentPhone1 ?? "");
    setParentPhone2(s.parentPhone2 ?? "");
    setNotes(s.notes ?? "");
    setModalOpen(true);
  }

  async function save() {
    if (!canSave) return;

    const payload = {
      nameAr: nameAr.trim(),
      gender,
      classId: formClassId,
      parentPhone1: parentPhone1.trim() || null,
      parentPhone2: parentPhone2.trim() || null,
      notes: notes.trim() || null,
    };

    const res = await fetch(editing ? `/api/students/${editing.id}` : "/api/students", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "حدث خطأ" });
      return;
    }

    toast({ type: "success", title: "تم", message: editing ? "تم تعديل الطالب" : "تم إضافة الطالب" });
    setModalOpen(false);
    await loadStudents();
  }

  async function removeStudent(id: string) {
    const ok = confirm("تأكيد حذف الطالب؟");
    if (!ok) return;

    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "حدث خطأ أثناء الحذف" });
      return;
    }

    toast({ type: "success", title: "تم", message: "تم حذف الطالب" });
    await loadStudents();
  }

  function openPurchase(s: StudentRow) {
    setPurchaseStudent(s);
    setQty(1);
    setPurchaseOpen(true);
    if (rewards.length === 0) loadRewards();
  }

  async function confirmPurchase() {
    if (!purchaseStudent) return;

    if (!itemId) {
      toast({ type: "error", title: "اختيار الهدية", message: "اختر هدية أولاً" });
      return;
    }

    setPurchaseLoading(true);
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: purchaseStudent.id, itemId, quantity: qty }),
    });
    const data = await res.json();
    setPurchaseLoading(false);

    if (!res.ok) {
      toast({ type: "error", title: "فشل الشراء", message: data?.message || "حدث خطأ" });
      return;
    }

    toast({ type: "success", title: "تم الشراء", message: `تم الخصم (${data.totalCost} نقطة)` });

    // ✅ update student balance instantly
    setStudents((prev) => prev.map((x) => (x.id === purchaseStudent.id ? { ...x, balance: data.newBalance } : x)));

    // ✅ update stock locally (optional)
    setRewards((prev) =>
      prev.map((r) => {
        if (r.id !== itemId) return r;
        if (r.stock === null) return r;
        return { ...r, stock: Math.max(0, r.stock - qty) };
      })
    );

    setPurchaseOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">الطلاب</h1>
          <p className="text-white/80 mt-1">إضافة وتعديل وحذف الطلاب + شراء الجوائز</p>
        </div>

        <div className="w-44">
          <Button onClick={openCreate}>+ إضافة طالب</Button>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <label className="text-xs font-extrabold text-slate-600">بحث</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالاسم أو رقم ولي الأمر"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            />
          </div>

          <div className="w-full md:w-80">
            <label className="text-xs font-extrabold text-slate-600">الفصل</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="">كل الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade.nameAr} — {c.nameAr} ({c.gender === "MALE" ? "أولاد" : "بنات"})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40">
            <Button variant="secondary" onClick={loadStudents}>
              تحديث
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الاسم</th>
                <th className="py-2 px-2 font-extrabold">النوع</th>
                <th className="py-2 px-2 font-extrabold">الفصل</th>
                <th className="py-2 px-2 font-extrabold">الرصيد</th>
                <th className="py-2 px-2 font-extrabold">هاتف ولي الأمر</th>
                <th className="py-2 px-2 font-extrabold">إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-bold">
                    جاري التحميل...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-bold">
                    لا يوجد طلاب
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-t border-slate-200">
                    <td className="py-3 px-2 font-extrabold">{s.nameAr}</td>
                    <td className="py-3 px-2">{genderAr[s.gender]}</td>
                    <td className="py-3 px-2">
                      {s.classRoom.grade.nameAr} — {s.classRoom.nameAr}
                    </td>
                    <td className="py-3 px-2 font-black">{s.balance ?? 0}</td>
                    <td className="py-3 px-2 text-slate-700">{s.parentPhone1 || s.parentPhone2 || "—"}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPurchase(s)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50"
                        >
                          شراء
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => removeStudent(s.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"
                        >
                          حذف
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

      {/* Student Modal */}
      <Modal open={modalOpen} title={editing ? "تعديل طالب" : "إضافة طالب"} onClose={() => setModalOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">اسم الطالب *</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="مثال: مارك يوحنا"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">النوع *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">الفصل *</label>
            <select
              value={formClassId}
              onChange={(e) => setFormClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="" disabled>
                اختر فصل
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade.nameAr} — {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">هاتف ولي الأمر 1</label>
            <input
              value={parentPhone1}
              onChange={(e) => setParentPhone1(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">هاتف ولي الأمر 2</label>
            <input
              value={parentPhone2}
              onChange={(e) => setParentPhone2(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200 min-h-[90px]"
              placeholder="ملاحظات عن الطالب..."
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={save} disabled={!canSave}>
            {editing ? "حفظ التعديل" : "إضافة"}
          </Button>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
        </div>
      </Modal>

      {/* Purchase Modal */}
      <Modal
        open={purchaseOpen}
        title={purchaseStudent ? `شراء للطالب: ${purchaseStudent.nameAr}` : "شراء"}
        onClose={() => setPurchaseOpen(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">الهدية</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              {rewards.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr} — {r.costPoints} نقطة {r.stock !== null ? `(المخزون: ${r.stock})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">الكمية</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">الإجمالي</label>
            <div className="mt-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
              {totalCost} نقطة
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={confirmPurchase} disabled={purchaseLoading}>
            {purchaseLoading ? "جاري..." : "تأكيد الشراء"}
          </Button>
          <Button variant="secondary" onClick={() => setPurchaseOpen(false)}>
            إلغاء
          </Button>
        </div>
      </Modal>
    </div>
  );
}
