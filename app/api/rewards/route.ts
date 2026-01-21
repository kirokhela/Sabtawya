import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateRewardSchema = z.object({
  nameAr: z.string().min(2, "اسم الهدية مطلوب"),
  costPoints: z.number().int().min(1, "لازم تكلفة >= 1"),
  stock: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

function canManage(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const active = searchParams.get("active"); // "true"/"false"/null

    const items = await prisma.rewardItem.findMany({
      where: {
        ...(active === "true" ? { isActive: true } : {}),
        ...(active === "false" ? { isActive: false } : {}),
        ...(q ? { nameAr: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: [{ isActive: "desc" }, { costPoints: "asc" }, { nameAr: "asc" }],
      select: { id: true, nameAr: true, costPoints: true, stock: true, isActive: true, createdAt: true, updatedAt: true },
      take: 300,
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!canManage(auth.role)) return NextResponse.json({ message: "مسموح للأدمن فقط" }, { status: 403 });

    const body = await req.json();
    const data = CreateRewardSchema.parse(body);

    const created = await prisma.rewardItem.create({
      data: {
        nameAr: data.nameAr.trim(),
        costPoints: data.costPoints,
        stock: data.stock ?? null,
        isActive: data.isActive ?? true,
      },
      select: { id: true },
    });

    await prisma.auditLog.create({
      data: { actorUserId: auth.userId, action: "REWARD_CREATED", entityType: "RewardItem", entityId: created.id, metadata: data as any },
    });

    return NextResponse.json({ id: created.id, message: "تم إنشاء الهدية" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "تعذر إنشاء الهدية" }, { status: 400 });
  }
}
