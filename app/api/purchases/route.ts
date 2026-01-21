import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreatePurchaseSchema = z.object({
  studentId: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    const body = await req.json();
    const data = CreatePurchaseSchema.parse(body);

    const [student, item] = await Promise.all([
      prisma.student.findFirst({ where: { id: data.studentId, isActive: true }, select: { id: true } }),
      prisma.rewardItem.findFirst({
        where: { id: data.itemId, isActive: true },
        select: { id: true, costPoints: true, stock: true, nameAr: true },
      }),
    ]);

    if (!student) return NextResponse.json({ message: "الطالب غير موجود" }, { status: 404 });
    if (!item) return NextResponse.json({ message: "الهدية غير موجودة" }, { status: 404 });

    const totalCost = item.costPoints * data.quantity;

    // current balance
    const agg = await prisma.pointTransaction.aggregate({
      where: { studentId: data.studentId },
      _sum: { points: true },
    });
    const balance = agg._sum.points ?? 0;

    if (balance < totalCost) {
      return NextResponse.json({ message: `رصيد غير كافي (الرصيد: ${balance})` }, { status: 400 });
    }

    // stock check
    if (item.stock !== null && item.stock !== undefined) {
      if (item.stock < data.quantity) return NextResponse.json({ message: "المخزون غير كافي" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          studentId: data.studentId,
          itemId: data.itemId,
          quantity: data.quantity,
          totalCost,
          createdById: auth.userId,
        },
        select: { id: true, createdAt: true },
      });

      const txn = await tx.pointTransaction.create({
        data: {
          studentId: data.studentId,
          points: -totalCost,
          createdById: auth.userId,
          manualReasonText: `شراء: ${item.nameAr}`,
        },
        select: { id: true },
      });

      await tx.purchase.update({
        where: { id: purchase.id },
        data: { pointsTxnId: txn.id },
      });

      if (item.stock !== null && item.stock !== undefined) {
        await tx.rewardItem.update({
          where: { id: item.id },
          data: { stock: item.stock - data.quantity },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: auth.userId,
          action: "PURCHASE_CREATED",
          entityType: "Purchase",
          entityId: purchase.id,
          metadata: { studentId: data.studentId, itemId: item.id, quantity: data.quantity, totalCost },
        },
      });

      // new balance
      const newAgg = await tx.pointTransaction.aggregate({
        where: { studentId: data.studentId },
        _sum: { points: true },
      });

      return { purchaseId: purchase.id, totalCost, newBalance: newAgg._sum.points ?? 0 };
    });

    return NextResponse.json({ message: "تم تسجيل الشراء", ...result }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
