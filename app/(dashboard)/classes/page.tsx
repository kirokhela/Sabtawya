"use client";

import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useToast } from "@/app/components/ToastProvider";
import { useEffect, useMemo, useState } from "react";

type Grade = { id: string; nameAr: string; order: number };
type ClassRow = {
  id: string;
  nameAr: string;
  gender: "MALE" | "FEMALE";
  grade: { id: string; nameAr: string; order: number };
  _count: { students: number };
};

const genderAr = { MALE: "أولاد", FEMALE: "بنات" } as const;

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

export default function ClassesPage() {
  const { toast } = useToast(); 
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // filters
  const [gradeId, setGradeId] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [q, setQ] = useState("");

  // grade modal
  const [gradeModal, setGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeName, setGradeName] = useState("");
  const [gradeOrder, setGradeOrder] = useState<number>(1);

  // class modal
  const [classModal, setClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null);
  const [className, setClassName] = useState("");
  const [classGender, setClassGender] = useState<"MALE" | "FEMALE">("MALE");
  const [classGradeId, setClassGradeId] = useState("");

  const canSaveGrade = useMemo(() => gradeName.trim().length >= 2 && gradeOrder >= 1, [gradeName, gradeOrder]);
  const canSaveClass = useMemo(() => className.trim().length >= 1 && classGradeId, [className, classGradeId]);

  async function loadGrades() {
    setLoadingGrades(true);
    const res = await fetch("/api/grades");
    const data = await res.json();
    setGrades(data.grades || []);
    setLoadingGrades(false);
  }

  async function loadClasses() {
    setLoadingClasses(true);
    const params = new URLSearchParams();
    if (gradeId) params.set("gradeId", gradeId);
    if (gender) params.set("gender", gender);
    if (q.trim()) params.set("q", q.trim());

    const res = await fetch(`/api/classes?${params.toString()}`);
    const data = await res.json();
    setClasses(data.classes || []);
    setLoadingClasses(false);
  }

  useEffect(() => {
    loadGrades();
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreateGrade() {
    setEditingGrade(null);
    setGradeName("");
    setGradeOrder((grades.at(-1)?.order ?? 0) + 1);
    setGradeModal(true);
  }

  function openEditGrade(g: Grade) {
    setEditingGrade(g);
    setGradeName(g.nameAr);
    setGradeOrder(g.order);
    setGradeModal(true);
  }

  async function saveGrade() {
    if (!canSaveGrade) return;

    if (!editingGrade) {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameAr: gradeName.trim(), order: gradeOrder }),
      });
      if (!res.ok) return toast({
  type: "error",
  title: "فشل",
  message: "فشل إنشاء المرحلة",
});
    } else {
      const res = await fetch(`/api/grades/${editingGrade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameAr: gradeName.trim(), order: gradeOrder }),
      });
      if (!res.ok) return toast({
  type: "error",
  title: "فشل",
  message: "فشل تعديل المرحلة",
});
    }

    setGradeModal(false);
    await loadGrades();
  }

  async function deleteGrade(id: string) {
    const ok = confirm("حذف المرحلة؟ (لازم تكون بدون فصول)");
    if (!ok) return;

    const res = await fetch(`/api/grades/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return toast({
  type: "error",
  title: "فشل",
  message: data?.message || "فشل حذف المرحلة",
});

    await loadGrades();
    await loadClasses();
  }

  function openCreateClass() {
    setEditingClass(null);
    setClassName("");
    setClassGender("MALE");
    setClassGradeId(grades[0]?.id ?? "");
    setClassModal(true);
  }

  function openEditClass(c: ClassRow) {
    setEditingClass(c);
    setClassName(c.nameAr);
    setClassGender(c.gender);
    setClassGradeId(c.grade.id);
    setClassModal(true);
  }

  async function saveClass() {
    if (!canSaveClass) return;

    const payload = {
      gradeId: classGradeId,
      nameAr: className.trim(),
      gender: classGender,
    };

    if (!editingClass) {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return toast({
  type: "error",
  title: "فشل",
  message: "فشل إنشاء الفصل",
});
    } else {
      const res = await fetch(`/api/classes/${editingClass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return toast({
  type: "error",
  title: "فشل",
  message: data?.message || "فشل تعديل الفصل",
});
    }

    setClassModal(false);
    await loadClasses();
  }

  async function deleteClass(id: string) {
    const ok = confirm("حذف الفصل؟");
    if (!ok) return;

    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    if (!res.ok) return toast({
  type: "error",
  title: "فشل",
  message: "فشل حذف الفصل",
});
    await loadClasses();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">المراحل والفصول</h1>
          <p className="text-white/80 mt-1">إدارة المراحل (Grades) والفصول (Classes)</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-44">
            <Button onClick={openCreateGrade}>+ مرحلة</Button>
          </div>
          <div className="flex-1 md:w-44">
            <Button onClick={openCreateClass}>+ فصل</Button>
          </div>
        </div>
      </div>

      {/* Grades */}
      <GlassCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black">المراحل</div>
            <div className="text-sm text-slate-600">رتّبهم بالأرقام (1..6)</div>
          </div>
          <div className="w-36">
            <Button variant="secondary" onClick={loadGrades}>
              تحديث
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الترتيب</th>
                <th className="py-2 px-2 font-extrabold">الاسم</th>
                <th className="py-2 px-2 font-extrabold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loadingGrades ? (
                <tr><td colSpan={3} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
              ) : grades.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-slate-500 font-bold">لا توجد مراحل</td></tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} className="border-t border-slate-200">
                    <td className="py-3 px-2 font-extrabold">{g.order}</td>
                    <td className="py-3 px-2">{g.nameAr}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditGrade(g)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteGrade(g.id)}
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

      {/* Classes */}
      <div className="mt-5">
        <GlassCard>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div>
              <div className="text-lg font-black">الفصول</div>
              <div className="text-sm text-slate-600">كل فصل له نوع (أولاد/بنات)</div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="w-full md:w-72">
                <label className="text-xs font-extrabold text-slate-600">بحث</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                  placeholder="ابحث باسم الفصل"
                />
              </div>

              <div className="w-full md:w-64">
                <label className="text-xs font-extrabold text-slate-600">المرحلة</label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <option value="">كل المراحل</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.order} — {g.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-48">
                <label className="text-xs font-extrabold text-slate-600">النوع</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <option value="">الكل</option>
                  <option value="MALE">أولاد</option>
                  <option value="FEMALE">بنات</option>
                </select>
              </div>

              <div className="w-full md:w-40">
                <Button variant="secondary" onClick={loadClasses}>
                  تحديث
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-slate-600">
                  <th className="py-2 px-2 font-extrabold">المرحلة</th>
                  <th className="py-2 px-2 font-extrabold">الفصل</th>
                  <th className="py-2 px-2 font-extrabold">النوع</th>
                  <th className="py-2 px-2 font-extrabold">عدد الطلاب</th>
                  <th className="py-2 px-2 font-extrabold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loadingClasses ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
                ) : classes.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-bold">لا توجد فصول</td></tr>
                ) : (
                  classes.map((c) => (
                    <tr key={c.id} className="border-t border-slate-200">
                      <td className="py-3 px-2">{c.grade.order} — {c.grade.nameAr}</td>
                      <td className="py-3 px-2 font-extrabold">{c.nameAr}</td>
                      <td className="py-3 px-2">{genderAr[c.gender]}</td>
                      <td className="py-3 px-2">{c._count.students}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditClass(c)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => deleteClass(c.id)}
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
      </div>

      {/* Grade Modal */}
      <Modal open={gradeModal} title={editingGrade ? "تعديل مرحلة" : "إضافة مرحلة"} onClose={() => setGradeModal(false)}>
        <div className="grid gap-3">
          <div>
            <label className="text-xs font-extrabold text-slate-600">اسم المرحلة *</label>
            <input
              value={gradeName}
              onChange={(e) => setGradeName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="مثال: أولى ابتدائي"
            />
          </div>
          <div>
            <label className="text-xs font-extrabold text-slate-600">الترتيب *</label>
            <input
              type="number"
              value={gradeOrder}
              onChange={(e) => setGradeOrder(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              min={1}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={saveGrade} disabled={!canSaveGrade}>
              {editingGrade ? "حفظ" : "إضافة"}
            </Button>
            <Button variant="secondary" onClick={() => setGradeModal(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Class Modal */}
      <Modal open={classModal} title={editingClass ? "تعديل فصل" : "إضافة فصل"} onClose={() => setClassModal(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">اسم الفصل *</label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="مثال: فصل (أ)"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">النوع *</label>
            <select
              value={classGender}
              onChange={(e) => setClassGender(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="MALE">أولاد</option>
              <option value="FEMALE">بنات</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">المرحلة *</label>
            <select
              value={classGradeId}
              onChange={(e) => setClassGradeId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="" disabled>اختر مرحلة</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.order} — {g.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={saveClass} disabled={!canSaveClass}>
            {editingClass ? "حفظ" : "إضافة"}
          </Button>
          <Button variant="secondary" onClick={() => setClassModal(false)}>
            إلغاء
          </Button>
        </div>
      </Modal>
    </div>
  );
}
