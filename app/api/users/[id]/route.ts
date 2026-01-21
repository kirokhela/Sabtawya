import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateUserSchema = z.object({
  nameAr: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "GATE_ADMIN", "SERVANT"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(), // optional reset
});

function requireSuperAdmin(role: string) {
  if (role !== "SUPER_ADMIN") {
    const err: any = new Error("FORBIDDEN");
    throw err;
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireSuperAdmin(auth.role);

    const { id } = await ctx.params;
    const body = await req.json();
    const data = UpdateUserSchema.parse(body);

    const update: any = {
      ...(data.nameAr !== undefined ? { nameAr: data.nameAr.trim() } : {}),
      ...(data.username !== undefined ? { username: data.username.trim() } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };

    if (data.password) {
      update.passwordHash = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({ where: { id }, data: update });

    await prisma.auditLog.create({
      data: {
        actorUserId: auth.userId,
        action: "USER_UPDATED",
        entityType: "User",
        entityId: id,
        metadata: { ...data, password: data.password ? "***" : undefined },
      },
    });

    return NextResponse.json({ message: "تم تعديل المستخدم" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    if (e?.code === "P2002") return NextResponse.json({ message: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireSuperAdmin(auth.role);

    const { id } = await ctx.params;

    // soft disable بدل delete حقيقي
    await prisma.user.update({ where: { id }, data: { isActive: false } });

    await prisma.auditLog.create({
      data: { actorUserId: auth.userId, action: "USER_DISABLED", entityType: "User", entityId: id },
    });

    return NextResponse.json({ message: "تم تعطيل المستخدم" });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
