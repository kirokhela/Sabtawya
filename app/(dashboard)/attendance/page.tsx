"use client";
import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useToast } from "@/app/components/ToastProvider";
import { useEffect, useMemo, useState } from "react";

type ClassItem = {
  id: string;
  nameAr: string;
  gender: "MALE" | "FEMALE";
  grade: { id: string; nameAr: string; order: number };
};

type AttendanceRow = {
  id: string;
  nameAr: string;
  gender: "MALE" | "FEMALE";
  attendance: null | { id: string; status: "ON_TIME" | "LATE" | "ABSENT"; takenAt: string };
};

const genderAr = { MALE: "أولاد", FEMALE: "بنات" } as const;

export default function AttendancePage() {
    const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const presentCount = useMemo(
    () => students.filter((s) => s.attendance?.status === "ON_TIME").length,
    [students]
  );
  const lateCount = useMemo(
    () => students.filter((s) => s.attendance?.status === "LATE").length,
    [students]
  );

  async function loadClasses() {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data.classes || []);
    setClassId((prev) => prev || data?.classes?.[0]?.id || "");
  }

  async function loadToday() {
    if (!classId) return;
    setLoading(true);
    const res = await fetch(`/api/attendance/today?classId=${classId}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

async function markAttendance(studentId: string) {
  setMarkingId(studentId);

  const res = await fetch("/api/attendance/mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });

  const data = await res.json();
  setMarkingId(null);

  if (!res.ok) {
  toast({
  type: "error",
  title: "فشل",
  message: data?.message || "فشل تسجيل الحضور",
});
    return;
  }

  // ✅ update UI instantly (no reload)
  setStudents((prev) =>
    prev.map((s) =>
      s.id === studentId
        ? {
            ...s,
            attendance: data.attendance
              ? {
                  id: data.attendance.id,
                  status: data.attendance.status,
                  takenAt: data.attendance.takenAt,
                }
              : s.attendance,
          }
        : s
    )
  );
}


  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">الحضور</h1>
          <p className="text-white/80 mt-1">تسجيل حضور اليوم تلقائيًا (في وقت القاهرة)</p>
        </div>

        <div className="w-40">
          <Button variant="secondary" onClick={loadToday}>
            تحديث
          </Button>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="w-full md:w-[420px]">
            <label className="text-xs font-extrabold text-slate-600">اختر الفصل</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade.order} — {c.grade.nameAr} — {c.nameAr} ({genderAr[c.gender]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="rounded-2xl bg-white/70 border border-slate-200 px-4 py-3">
              <div className="text-xs font-extrabold text-slate-600">حاضر</div>
              <div className="text-lg font-black">{presentCount}</div>
            </div>
            <div className="rounded-2xl bg-white/70 border border-slate-200 px-4 py-3">
              <div className="text-xs font-extrabold text-slate-600">متأخر</div>
              <div className="text-lg font-black">{lateCount}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الاسم</th>
                <th className="py-2 px-2 font-extrabold">الحالة</th>
                <th className="py-2 px-2 font-extrabold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-slate-500 font-bold">لا يوجد طلاب في هذا الفصل</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-t border-slate-200">
                    <td className="py-3 px-2 font-extrabold">{s.nameAr}</td>
                    <td className="py-3 px-2">
                      {s.attendance ? (
                        s.attendance.status === "ON_TIME" ? (
                          <span className="inline-flex rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700">
                            حاضر
                          </span>
                        ) : (
                          <span className="inline-flex rounded-xl bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-700">
                            متأخر (0 نقاط)
                          </span>
                        )
                      ) : (
                        <span className="inline-flex rounded-xl bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700">
                          لم يُسجَّل
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {s.attendance ? (
                        <span className="text-xs font-bold text-slate-500">—</span>
                      ) : (
                        <button
                          onClick={() => markAttendance(s.id)}
                          disabled={markingId === s.id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50 disabled:opacity-60"
                        >
                          {markingId === s.id ? "جاري..." : "تسجيل حضور"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
