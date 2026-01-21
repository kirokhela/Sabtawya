import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateReasonSchema = z.object({
  nameAr: z.string().min(2).optional(),
  points: z.number().int().min(0).optional(),
  category: z.enum(["ATTENDANCE", "MASS", "CONFESSION", "DISCIPLINE", "OTHER", "PURCHASE"]).optional(),
  limitType: z.enum(["NONE", "ONCE_PER_CALENDAR_MONTH"]).optional(),
  allowedRoles: z.array(z.enum(["SUPER_ADMIN", "ADMIN", "GATE_ADMIN", "SERVANT"])).min(1).optional(),
  isActive: z.boolean().optional(),
});

function isSuperAdmin(role: string) {
  return role === "SUPER_ADMIN";
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!isSuperAdmin(auth.role)) {
      return NextResponse.json({ message: "مسموح للسوبر أدمن فقط" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const data = UpdateReasonSchema.parse(body);

    await prisma.pointReason.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined ? { nameAr: data.nameAr } : {}),
        ...(data.points !== undefined ? { points: data.points } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.limitType !== undefined ? { limitType: data.limitType } : {}),
        ...(data.allowedRoles !== undefined ? { allowedRoles: data.allowedRoles } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return NextResponse.json({ message: "تم تعديل السبب" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "خطأ في التعديل" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!isSuperAdmin(auth.role)) {
      return NextResponse.json({ message: "مسموح للسوبر أدمن فقط" }, { status: 403 });
    }

    const { id } = await ctx.params;

    // soft delete
    await prisma.pointReason.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "تم تعطيل السبب" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ message: "خطأ في الحذف" }, { status: 400 });
  }
}
