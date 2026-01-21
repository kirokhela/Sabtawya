import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { z } from "zod";

const CreateReasonSchema = z.object({
  nameAr: z.string().min(2, "اسم السبب مطلوب"),
  points: z.number().int().min(0, "النقاط لازم تكون 0 أو أكثر"),
  category: z.enum(["ATTENDANCE", "MASS", "CONFESSION", "DISCIPLINE", "OTHER", "PURCHASE"]),
  limitType: z.enum(["NONE", "ONCE_PER_CALENDAR_MONTH"]),
  allowedRoles: z.array(z.enum(["SUPER_ADMIN", "ADMIN", "GATE_ADMIN", "SERVANT"])).min(1),
  isActive: z.boolean().optional(),
});

function isSuperAdmin(role: string) {
  return role === "SUPER_ADMIN";
}

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const category = (searchParams.get("category") ?? "").trim();
    const active = searchParams.get("active"); // "true"/"false"/null

    const reasons = await prisma.pointReason.findMany({
      where: {
        ...(active === "true" ? { isActive: true } : {}),
        ...(active === "false" ? { isActive: false } : {}),
        ...(category ? { category: category as any } : {}),
        ...(q ? { nameAr: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: [{ category: "asc" }, { nameAr: "asc" }],
      select: {
        id: true,
        nameAr: true,
        points: true,
        category: true,
        limitType: true,
        allowedRoles: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 300,
    });

    return NextResponse.json({ reasons });
  } catch {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!isSuperAdmin(auth.role)) {
      return NextResponse.json({ message: "مسموح للسوبر أدمن فقط" }, { status: 403 });
    }

    const body = await req.json();
    const data = CreateReasonSchema.parse(body);

    const created = await prisma.pointReason.create({
      data: {
        nameAr: data.nameAr,
        points: data.points,
        category: data.category,
        limitType: data.limitType,
        allowedRoles: data.allowedRoles,
        isActive: data.isActive ?? true,
        createdById: auth.userId,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "تم إنشاء السبب" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "تعذر إنشاء السبب" }, { status: 400 });
  }
}
