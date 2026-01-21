import { cairoLocalToUTC, cairoWeekday, cairoYMD } from "@/app/lib/cairoTime";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const classId = (searchParams.get("classId") ?? "").trim();

    if (!classId) {
      return NextResponse.json({ message: "classId مطلوب" }, { status: 400 });
    }

    const weekday = cairoWeekday(new Date()); // "Saturday", ...
    const isAttendanceDay = weekday === "Saturday";

    // ✅ لو مش سبت: رجّع الطلاب بدون session وبدون تسجيل
    if (!isAttendanceDay) {
      const students = await prisma.student.findMany({
        where: { isActive: true, classId },
        orderBy: [{ nameAr: "asc" }],
        select: { id: true, nameAr: true, gender: true },
      });

      return NextResponse.json({
        isAttendanceDay: false,
        message: "الحضور متاح يوم السبت فقط",
        session: null,
        students: students.map((s) => ({ ...s, attendance: null })),
      });
    }

    // ✅ لو سبت: اعمل session لليوم ده
    const ymd = cairoYMD(new Date());
    const dateAtMidnightUTC = cairoLocalToUTC(ymd, "00:00");

    const session = await prisma.session.upsert({
      where: { date: dateAtMidnightUTC },
      update: {},
      create: {
        date: dateAtMidnightUTC,
        startAt: cairoLocalToUTC(ymd, "16:00"),
        cutoffAt: cairoLocalToUTC(ymd, "16:45"),
        status: "OPEN",
      },
      select: { id: true, date: true, startAt: true, cutoffAt: true, status: true },
    });

    const students = await prisma.student.findMany({
      where: { isActive: true, classId },
      orderBy: [{ nameAr: "asc" }],
      select: {
        id: true,
        nameAr: true,
        gender: true,
        attendances: {
          where: { sessionId: session.id },
          select: { id: true, status: true, takenAt: true },
        },
      },
    });

    const rows = students.map((s) => ({
      id: s.id,
      nameAr: s.nameAr,
      gender: s.gender,
      attendance: s.attendances[0] ?? null,
    }));

    return NextResponse.json({
      isAttendanceDay: true,
      message: null,
      session,
      students: rows,
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
