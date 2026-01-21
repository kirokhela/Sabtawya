import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateStudentSchema = z.object({
  nameAr: z.string().min(2).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  classId: z.string().min(1).optional(),
  parentPhone1: z.string().optional().nullable(),
  parentPhone2: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await ctx.params;

    const body = await req.json();
    const data = UpdateStudentSchema.parse(body);

    // ✅ 1) هات الطالب الحالي (عشان نعرف قيمه القديمة لو مش مبعوتة)
    const existing = await prisma.student.findFirst({
      where: { id, isActive: true },
      select: { id: true, gender: true, classId: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "الطالب غير موجود" }, { status: 404 });
    }

    // ✅ 2) احسب القيم النهائية بعد التعديل
    const finalGender = data.gender ?? existing.gender;
    const finalClassId = data.classId ?? existing.classId;

    // ✅ 3) تحقق من الفصل النهائي
    const cls = await prisma.classRoom.findUnique({
      where: { id: finalClassId },
      select: { id: true, gender: true },
    });

    if (!cls) {
      return NextResponse.json({ message: "الفصل غير موجود" }, { status: 400 });
    }

    // ✅ 4) منع mismatch
    if (cls.gender !== finalGender) {
      return NextResponse.json(
        { message: "لا يمكن وضع الطالب في فصل مختلف عن نوعه" },
        { status: 400 }
      );
    }

    // ✅ 5) نفّذ التعديل
    await prisma.student.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined ? { nameAr: data.nameAr } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.classId !== undefined ? { classId: data.classId } : {}),
        ...(data.parentPhone1 !== undefined ? { parentPhone1: data.parentPhone1 } : {}),
        ...(data.parentPhone2 !== undefined ? { parentPhone2: data.parentPhone2 } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    return NextResponse.json({ message: "تم تعديل الطالب" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }
    if (e?.name === "ZodError") {
      return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في التعديل" }, { status: 400 });
  }
}
