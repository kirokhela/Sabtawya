"use client";

import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useToast } from "@/app/components/ToastProvider";
import { useEffect, useMemo, useState } from "react";

type UserItem = { id: string; nameAr: string; username: string | null; role: string; isActive: boolean };
type ClassItem = { id: string; nameAr: string; gender: "MALE" | "FEMALE"; grade: { nameAr: string; order: number } };
type AssignmentRow = { id: string; classRoom: ClassItem };

export default function AssignmentsPage() {
  const { toast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);

  const [userId, setUserId] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(true);

  const availableClasses = useMemo(() => {
    const assignedIds = new Set(assignments.map((a) => a.classRoom.id));
    return classes.filter((c) => !assignedIds.has(c.id));
  }, [classes, assignments]);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (!res.ok) return toast({ type: "error", title: "فشل", message: data?.message || "غير مسموح" });
    setUsers(data.users || []);
  }

  async function loadClasses() {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data.classes || []);
  }

  async function loadAssignments(uid: string) {
    if (!uid) return setAssignments([]);
    const res = await fetch(`/api/assignments?userId=${uid}`);
    const data = await res.json();
    if (!res.ok) return toast({ type: "error", title: "فشل", message: data?.message || "غير مسموح" });
    setAssignments(data.assignments || []);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadClasses()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAssignments(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function add() {
    if (!userId || !classId) return;

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, classId }),
    });
    const data = await res.json();
    if (!res.ok) return toast({ type: "error", title: "فشل", message: data?.message || "خطأ" });

    toast({ type: "success", title: "تم", message: "تم الربط" });
    setClassId("");
    await loadAssignments(userId);
  }

  async function remove(cid: string) {
    const ok = confirm("فك ربط هذا الفصل؟");
    if (!ok) return;

    const res = await fetch("/api/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, classId: cid }),
    });
    const data = await res.json();
    if (!res.ok) return toast({ type: "error", title: "فشل", message: data?.message || "خطأ" });

    toast({ type: "success", title: "تم", message: "تم فك الربط" });
    await loadAssignments(userId);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-black text-white">ربط المستخدمين بالفصول</h1>
        <p className="text-white/80 mt-1">سوبر أدمن فقط</p>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-xs font-extrabold text-slate-600">المستخدم</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            >
              <option value="">اختر مستخدم</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nameAr} {u.username ? `(${u.username})` : ""} {u.isActive ? "" : "— معطّل"}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs font-extrabold text-slate-600">إضافة فصل</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              disabled={!userId}
            >
              <option value="">اختر فصل</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade.nameAr} — {c.nameAr} ({c.gender === "MALE" ? "أولاد" : "بنات"})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <Button onClick={add} disabled={!userId || !classId || loading}>
              ربط
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-black text-slate-800">الفصول المرتبطة</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-slate-600">
                  <th className="py-2 px-2 font-extrabold">الفصل</th>
                  <th className="py-2 px-2 font-extrabold">النوع</th>
                  <th className="py-2 px-2 font-extrabold">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {!userId ? (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-500 font-bold">اختر مستخدم</td></tr>
                ) : assignments.length === 0 ? (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-500 font-bold">لا يوجد فصول مرتبطة</td></tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="border-t border-slate-200">
                      <td className="py-3 px-2 font-extrabold">
                        {a.classRoom.grade.nameAr} — {a.classRoom.nameAr}
                      </td>
                      <td className="py-3 px-2">{a.classRoom.gender === "MALE" ? "أولاد" : "بنات"}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => remove(a.classRoom.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"
                        >
                          فك الربط
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
