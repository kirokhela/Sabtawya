"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/GlassCard";
import Button from "@/app/components/Button";
import { useToast } from "@/app/components/ToastProvider";

type Reason = {
  id: string;
  nameAr: string;
  points: number;
  category: string;
  limitType: string;
};

type StudentRow = {
  id: string;
  nameAr: string;
  classRoom: { id: string; nameAr: string; grade: { nameAr: string; order: number } };
};

export default function BonusPage() {
  const { toast } = useToast();

  const [role, setRole] = useState<string>("");
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [loading, setLoading] = useState(true);

  // manual (ADMIN/SUPER_ADMIN only)
  const canManual = role === "SUPER_ADMIN" || role === "ADMIN";
  const [manualPoints, setManualPoints] = useState<number>(0);
  const [manualText, setManualText] = useState("");

  const selectedReason = useMemo(() => reasons.find((r) => r.id === reasonId) || null, [reasons, reasonId]);

  async function loadReasons() {
    const res = await fetch("/api/reasons/active");
    const data = await res.json();
    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "غير مسموح" });
      return;
    }
    setReasons(data.reasons || []);
    setRole(data.role || "");
  }

  async function loadClasses() {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data.classes || []);
  }

  async function loadStudents(cid: string) {
    if (!cid) return setStudents([]);
    const res = await fetch(`/api/students?classId=${cid}`);
    const data = await res.json();
    setStudents(data.students || []);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadReasons(), loadClasses()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStudents(classId);
    setStudentId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function submit() {
    if (!studentId) return toast({ type: "error", title: "الطالب", message: "اختر طالب" });

    // manual
    if (reasonId === "__MANUAL__") {
      if (!canManual) return toast({ type: "error", title: "غير مسموح", message: "لا تملك صلاحية السبب اليدوي" });
      if (!manualText.trim()) return toast({ type: "error", title: "السبب", message: "اكتب السبب" });
      if (!Number.isInteger(manualPoints) || manualPoints <= 0) return toast({ type: "error", title: "النقاط", message: "اكتب نقاط صحيحة" });

      const res = await fetch("/api/points/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, manualReasonText: manualText.trim(), manualPoints }),
      });
      const data = await res.json();
      if (!res.ok) return toast({ type: "error", title: "فشل", message: data?.message || "خطأ" });

      toast({ type: "success", title: "تم", message: "تم إضافة النقاط" });
      setManualPoints(0);
      setManualText("");
      return;
    }

    if (!reasonId) return toast({ type: "error", title: "السبب", message: "اختر سبب" });

    const res = await fetch("/api/points/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, reasonId }),
    });
    const data = await res.json();
    if (!res.ok) return toast({ type: "error", title: "فشل", message: data?.message || "خطأ" });

    toast({ type: "success", title: "تم", message: "تم إضافة النقاط" });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-black text-white">إضافة نقاط</h1>
        <p className="text-white/80 mt-1">اختيار طالب + سبب من القائمة</p>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-extrabold text-slate-600">الفصل</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="">اختر فصل</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade.nameAr} — {c.nameAr} ({c.gender === "MALE" ? "أولاد" : "بنات"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">الطالب</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              disabled={!classId}
            >
              <option value="">اختر طالب</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">السبب</label>
            <select
              value={reasonId}
              onChange={(e) => setReasonId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="">اختر سبب</option>
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr} (+{r.points})
                </option>
              ))}
              {canManual && <option value="__MANUAL__">سبب آخر (يدوي)</option>}
            </select>

            {selectedReason && (
              <p className="mt-2 text-xs font-bold text-slate-600">
                النقاط: <span className="font-black">+{selectedReason.points}</span>{" "}
                {selectedReason.limitType === "ONCE_PER_CALENDAR_MONTH" ? "— مرة واحدة شهريًا" : ""}
              </p>
            )}
          </div>

          {canManual && reasonId === "__MANUAL__" && (
            <>
              <div className="md:col-span-1">
                <label className="text-xs font-extrabold text-slate-600">عدد النقاط</label>
                <input
                  type="number"
                  value={manualPoints}
                  onChange={(e) => setManualPoints(parseInt(e.target.value || "0", 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-extrabold text-slate-600">السبب</label>
                <input
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
                  placeholder="اكتب السبب..."
                />
              </div>
            </>
          )}

          <div className="md:col-span-3">
            <Button onClick={submit} disabled={loading}>
              إضافة النقاط
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
