import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { attendanceStatusForNowCairo, cairoWeekday, cairoYMD, cairoLocalToUTC } from "@/app/lib/cairoTime";
import { z } from "zod";

const BodySchema = z.object({
  studentId: z.string().min(1),
});

function canMarkAny(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "GATE_ADMIN";
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    // ✅ Saturday-only guard
    const weekday = cairoWeekday(new Date());
    if (weekday !== "Saturday") {
      return NextResponse.json({ message: "لا يمكن تسجيل الحضور إلا يوم السبت" }, { status: 400 });
    }

    const body = await req.json();
    const { studentId } = BodySchema.parse(body);

    const student = await prisma.student.findFirst({
      where: { id: studentId, isActive: true },
      select: { id: true, classId: true },
    });
    if (!student) return NextResponse.json({ message: "الطالب غير موجود" }, { status: 404 });

    // ✅ Permissions:
    // - Gate/Admin/Super => any student
    // - Servant => only students in his assigned classes
    if (!canMarkAny(auth.role)) {
      const assigned = await prisma.classAssignment.findFirst({
        where: { userId: auth.userId, classId: student.classId },
        select: { id: true },
      });
      if (!assigned) {
        return NextResponse.json({ message: "غير مسموح: هذا الطالب ليس ضمن فصولك" }, { status: 403 });
      }
    }

    const now = new Date();
    const ymd = cairoYMD(now);
    const dateAtMidnightUTC = cairoLocalToUTC(ymd, "00:00");

    // ✅ Ensure session for today (Saturday)
    const session = await prisma.session.upsert({
      where: { date: dateAtMidnightUTC },
      update: {},
      create: {
        date: dateAtMidnightUTC,
        startAt: cairoLocalToUTC(ymd, "16:00"),
        cutoffAt: cairoLocalToUTC(ymd, "16:45"),
        status: "OPEN",
        createdById: auth.userId,
      },
      select: { id: true, status: true },
    });

    if (session.status !== "OPEN") {
      return NextResponse.json({ message: "جلسة اليوم مغلقة/ملغاة" }, { status: 400 });
    }

    // ✅ no duplicate attendance
    const existing = await prisma.attendance.findFirst({
      where: { sessionId: session.id, studentId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ message: "تم تسجيل الحضور مسبقًا" }, { status: 409 });
    }

    // ✅ active attendance reason
    const attendanceReason = await prisma.pointReason.findFirst({
      where: { category: "ATTENDANCE", isActive: true },
      orderBy: [{ createdAt: "asc" }],
      select: { id: true, points: true },
    });
    if (!attendanceReason) {
      return NextResponse.json({ message: "لا يوجد سبب حضور نشط (ATTENDANCE)" }, { status: 400 });
    }

    const status = attendanceStatusForNowCairo(now); // "ON_TIME" | "LATE"
    const points = status === "ON_TIME" ? attendanceReason.points : 0;

    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.create({
        data: {
          sessionId: session.id,
          studentId,
          status: status === "ON_TIME" ? "ON_TIME" : "LATE",
          takenById: auth.userId,
          takenAt: now,
        },
        select: { id: true, status: true, takenAt: true },
      });

      const txn = await tx.pointTransaction.create({
        data: {
          studentId,
          reasonId: attendanceReason.id,
          points,
          createdById: auth.userId,
          createdAt: now,
        },
        select: { id: true },
      });

      await tx.attendance.update({
        where: { id: attendance.id },
        data: { pointsTxnId: txn.id },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: auth.userId,
          action: "ATTENDANCE_MARKED",
          entityType: "Attendance",
          entityId: attendance.id,
          metadata: { studentId, status: attendance.status, points, sessionId: session.id },
        },
      });

      return { attendance, points };
    });

    // ✅ return the attendance object so UI can update immediately
    return NextResponse.json({
      message: "تم تسجيل الحضور",
      attendance: result.attendance,
      points: result.points,
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
