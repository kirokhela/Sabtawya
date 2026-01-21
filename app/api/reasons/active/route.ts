import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";

export async function GET() {
  try {
    const auth = await requireAuth();

    const reasons = await prisma.pointReason.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { nameAr: "asc" }],
      select: { id: true, nameAr: true, points: true, category: true, allowedRoles: true, limitType: true },
    });

    // فلترة على حسب role بتاع المستخدم
    const filtered = reasons.filter((r) => r.allowedRoles.includes(auth.role as any));

    return NextResponse.json({ reasons: filtered, role: auth.role });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
