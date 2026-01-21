import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateClassSchema = z.object({
  gradeId: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await ctx.params;

    const body = await req.json();
    const data = UpdateClassSchema.parse(body);

    // لو هنغيّر gender، لازم نتأكد إن الطلاب الحاليين نفس النوع
    if (data.gender) {
      const countMismatch = await prisma.student.count({
        where: { classId: id, isActive: true, gender: data.gender === "MALE" ? "FEMALE" : "MALE" },
      });

      if (countMismatch > 0) {
        return NextResponse.json(
          { message: "لا يمكن تغيير نوع الفصل لأن به طلاب من نوع مختلف" },
          { status: 400 }
        );
      }
    }

    await prisma.classRoom.update({
      where: { id },
      data: {
        ...(data.gradeId !== undefined ? { gradeId: data.gradeId } : {}),
        ...(data.nameAr !== undefined ? { nameAr: data.nameAr } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return NextResponse.json({ message: "تم تعديل الفصل" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "خطأ في التعديل" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await ctx.params;

    // soft delete
    await prisma.classRoom.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "تم حذف الفصل" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ message: "خطأ في الحذف" }, { status: 400 });
  }
}
