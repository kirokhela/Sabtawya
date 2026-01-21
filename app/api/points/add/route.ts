import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddPointsSchema = z.object({
  studentId: z.string().min(1),
  reasonId: z.string().optional().nullable(),
  manualReasonText: z.string().optional().nullable(),
  manualPoints: z.number().int().optional().nullable(),
});

function canUseOther(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const data = AddPointsSchema.parse(body);

    if (!data.studentId) return NextResponse.json({ message: "studentId مطلوب" }, { status: 400 });

    // حالة "Other" (manual)
    if (!data.reasonId) {
      if (!canUseOther(auth.role)) return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
      const pts = data.manualPoints ?? 0;
      if (!Number.isInteger(pts) || pts <= 0) return NextResponse.json({ message: "النقاط غير صحيحة" }, { status: 400 });
      if (!data.manualReasonText?.trim()) return NextResponse.json({ message: "اكتب السبب" }, { status: 400 });

      const txn = await prisma.pointTransaction.create({
        data: {
          studentId: data.studentId,
          points: pts,
          manualReasonText: data.manualReasonText.trim(),
          createdById: auth.userId,
        },
        select: { id: true },
      });

      await prisma.auditLog.create({
        data: {
          actorUserId: auth.userId,
          action: "TXN_MANUAL_CREATED",
          entityType: "PointTransaction",
          entityId: txn.id,
          metadata: { studentId: data.studentId, points: pts, reason: data.manualReasonText.trim() },
        },
      });

      return NextResponse.json({ message: "تم إضافة النقاط" }, { status: 201 });
    }

    // حالة reasonId
    const reason = await prisma.pointReason.findUnique({
      where: { id: data.reasonId },
      select: { id: true, points: true, nameAr: true, limitType: true, allowedRoles: true, isActive: true },
    });

    if (!reason || !reason.isActive) return NextResponse.json({ message: "السبب غير موجود" }, { status: 404 });
    if (!reason.allowedRoles.includes(auth.role as any)) return NextResponse.json({ message: "غير مسموح" }, { status: 403 });

    // limit: once per calendar month
    if (reason.limitType === "ONCE_PER_CALENDAR_MONTH") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const exists = await prisma.pointTransaction.findFirst({
        where: {
          studentId: data.studentId,
          reasonId: reason.id,
          createdAt: { gte: start, lt: end },
        },
        select: { id: true },
      });

      if (exists) return NextResponse.json({ message: "تم تسجيل هذا السبب بالفعل هذا الشهر" }, { status: 409 });
    }

    const txn = await prisma.pointTransaction.create({
      data: {
        studentId: data.studentId,
        reasonId: reason.id,
        points: reason.points,
        createdById: auth.userId,
      },
      select: { id: true },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: auth.userId,
        action: "TXN_CREATED",
        entityType: "PointTransaction",
        entityId: txn.id,
        metadata: { studentId: data.studentId, reasonId: reason.id, reasonName: reason.nameAr, points: reason.points },
      },
    });

    return NextResponse.json({ message: "تم إضافة النقاط" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
