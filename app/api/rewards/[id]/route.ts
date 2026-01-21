import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateRewardSchema = z.object({
  nameAr: z.string().min(2).optional(),
  costPoints: z.number().int().min(1).optional(),
  stock: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

function canManage(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!canManage(auth.role)) return NextResponse.json({ message: "مسموح للأدمن فقط" }, { status: 403 });

    const { id } = await ctx.params;
    const body = await req.json();
    const data = UpdateRewardSchema.parse(body);

    await prisma.rewardItem.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined ? { nameAr: data.nameAr.trim() } : {}),
        ...(data.costPoints !== undefined ? { costPoints: data.costPoints } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    await prisma.auditLog.create({
      data: { actorUserId: auth.userId, action: "REWARD_UPDATED", entityType: "RewardItem", entityId: id, metadata: data as any },
    });

    return NextResponse.json({ message: "تم تعديل الهدية" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!canManage(auth.role)) return NextResponse.json({ message: "مسموح للأدمن فقط" }, { status: 403 });

    const { id } = await ctx.params;

    await prisma.rewardItem.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: { actorUserId: auth.userId, action: "REWARD_DISABLED", entityType: "RewardItem", entityId: id },
    });

    return NextResponse.json({ message: "تم تعطيل الهدية" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
