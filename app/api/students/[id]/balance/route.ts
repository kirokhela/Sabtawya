import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await ctx.params;

    const student = await prisma.student.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ message: "الطالب غير موجود" }, { status: 404 });

    const agg = await prisma.pointTransaction.aggregate({
      where: { studentId: id },
      _sum: { points: true },
    });

    return NextResponse.json({ balance: agg._sum.points ?? 0 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
