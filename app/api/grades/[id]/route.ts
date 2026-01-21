import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateGradeSchema = z.object({
  nameAr: z.string().min(2).optional(),
  order: z.number().int().min(1).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await ctx.params;

    const body = await req.json();
    const data = UpdateGradeSchema.parse(body);

    await prisma.grade.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined ? { nameAr: data.nameAr } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
      },
    });

    return NextResponse.json({ message: "تم تعديل المرحلة" });
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

    const classesCount = await prisma.classRoom.count({ where: { gradeId: id, isActive: true } });
    if (classesCount > 0) {
      return NextResponse.json(
        { message: "لا يمكن حذف المرحلة لأنها تحتوي على فصول" },
        { status: 400 }
      );
    }

    await prisma.grade.delete({ where: { id } });
    return NextResponse.json({ message: "تم حذف المرحلة" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ message: "خطأ في الحذف" }, { status: 400 });
  }
}
