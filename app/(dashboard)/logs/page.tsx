"use client";

import Button from "@/app/components/Button";
import GlassCard from "@/app/components/GlassCard";
import { useToast } from "@/app/components/ToastProvider";
import { useEffect, useState } from "react";

type LogRow = {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: any;
  createdAt: string;
  actor: { id: string; nameAr: string; username: string | null } | null;
};

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (action) params.set("action", action);
    if (entityType) params.set("entityType", entityType);

    const res = await fetch(`/api/logs?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      toast({ type: "error", title: "فشل", message: data?.message || "غير مسموح" });
      setLoading(false);
      return;
    }

    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-black text-white">السجلات</h1>
        <p className="text-white/80 mt-1">كل العمليات في النظام (سوبر أدمن فقط)</p>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-600">بحث</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="action / entityType / entityId"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">Action</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="مثال: USER_CREATED"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">EntityType</label>
            <input
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
              placeholder="مثال: Student"
            />
          </div>

          <div className="md:col-span-4 md:w-40">
            <Button variant="secondary" onClick={load}>تحديث</Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-600">
                <th className="py-2 px-2 font-extrabold">الوقت</th>
                <th className="py-2 px-2 font-extrabold">المستخدم</th>
                <th className="py-2 px-2 font-extrabold">Action</th>
                <th className="py-2 px-2 font-extrabold">Entity</th>
                <th className="py-2 px-2 font-extrabold">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-bold">جاري التحميل...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-bold">لا توجد سجلات</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-t border-slate-200">
                    <td className="py-3 px-2">{new Date(l.createdAt).toLocaleString("ar-EG")}</td>
                    <td className="py-3 px-2 font-extrabold">
                      {l.actor ? `${l.actor.nameAr}${l.actor.username ? ` (${l.actor.username})` : ""}` : "—"}
                    </td>
                    <td className="py-3 px-2 font-black">{l.action}</td>
                    <td className="py-3 px-2">
                      {l.entityType || "—"} {l.entityId ? `— ${l.entityId}` : ""}
                    </td>
                    <td className="py-3 px-2">
                      <details className="cursor-pointer">
                        <summary className="font-extrabold text-slate-700">عرض</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs bg-white/70 border border-slate-200 rounded-xl p-3">
{JSON.stringify(l.metadata ?? {}, null, 2)}
                        </pre>
                      </details>
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
