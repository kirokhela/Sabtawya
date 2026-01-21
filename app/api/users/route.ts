import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateUserSchema = z.object({
  nameAr: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "GATE_ADMIN", "SERVANT"]),
  isActive: z.boolean().optional(),
});

function requireSuperAdmin(role: string) {
  if (role !== "SUPER_ADMIN") {
    const err: any = new Error("FORBIDDEN");
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    requireSuperAdmin(auth.role);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    const users = await prisma.user.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { nameAr: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        nameAr: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      take: 300,
    });

    return NextResponse.json({ users });
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
    const data = CreateUserSchema.parse(body);

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await prisma.user.create({
      data: {
        nameAr: data.nameAr.trim(),
        username: data.username.trim(),
        role: data.role,
        isActive: data.isActive ?? true,
        passwordHash,
      },
      select: { id: true },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: auth.userId,
        action: "USER_CREATED",
        entityType: "User",
        entityId: created.id,
        metadata: { nameAr: data.nameAr, username: data.username, role: data.role, isActive: data.isActive ?? true },
      },
    });

    return NextResponse.json({ id: created.id, message: "تم إنشاء المستخدم" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });

    // Prisma unique (username/email)
    if (e?.code === "P2002") return NextResponse.json({ message: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });

    return NextResponse.json({ message: "تعذر إنشاء المستخدم" }, { status: 400 });
  }
}
