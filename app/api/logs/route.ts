import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";

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
    const action = (searchParams.get("action") ?? "").trim();
    const entityType = (searchParams.get("entityType") ?? "").trim();

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(entityType ? { entityType } : {}),
        ...(q
          ? {
              OR: [
                { action: { contains: q, mode: "insensitive" } },
                { entityType: { contains: q, mode: "insensitive" } },
                { entityId: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      take: 250,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: { select: { id: true, nameAr: true, username: true } },
      },
    });

    return NextResponse.json({ logs });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.message === "FORBIDDEN") return NextResponse.json({ message: "غير مسموح" }, { status: 403 });
    return NextResponse.json({ message: "خطأ" }, { status: 400 });
  }
}
