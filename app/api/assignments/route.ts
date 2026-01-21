import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { z } from "zod";

function requireSuperAdmin(role: string) {
  if (role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
}

const AddSchema = z.object({
  userId: z.string().min(1),
  classId: z.string().min(1),
});

const RemoveSchema = z.object({
  userId: z.string().min(1),
  classId: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    requireSuperAdmin(auth.role);

    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") ?? "").trim();
    if (!userId) return NextResponse.json({ message: "userId مطلوب" }, { status: 400 });

    const assignments = await prisma.classAssignment.findMany({
      where: { userId },
      select: {
        id: true,
        classRoom: {
          select: {
            id: true,
            nameAr: true,
            gender: true,
            grade: { select: { nameAr: true, order: true } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ assignments });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    requireSuperAdmin(auth.role);

    const body = await req.json();
    const data = AddSchema.parse(body);

    const created = await prisma.classAssignment.create({
      data: { userId: data.userId, classId: data.classId },
      select: { id: true },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: auth.userId,
        action: "CLASS_ASSIGNMENT_ADDED",
        entityType: "ClassAssignment",
        entityId: created.id,
        metadata: { userId: data.userId, classId: data.classId },
      },
    });

    return NextResponse.json({ message: "تم ربط المستخدم بالفصل" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    if (e?.code === "P2002") return NextResponse.json({ message: "الربط موجود بالفعل" }, { status: 409 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    requireSuperAdmin(auth.role);

    const body = await req.json();
    const data = RemoveSchema.parse(body);

    await prisma.classAssignment.delete({
      where: { userId_classId: { userId: data.userId, classId: data.classId } },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: auth.userId,
        action: "CLASS_ASSIGNMENT_REMOVED",
        entityType: "ClassAssignment",
        metadata: { userId: data.userId, classId: data.classId },
      },
    });

    return NextResponse.json({ message: "تم فك الربط" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
