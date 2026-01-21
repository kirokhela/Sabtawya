import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateGradeSchema = z.object({
  nameAr: z.string().min(2, "اسم المرحلة مطلوب"),
  order: z.number().int().min(1, "الترتيب مطلوب"),
});

export async function GET() {
  try {
    await requireAuth();

    const grades = await prisma.grade.findMany({
      orderBy: [{ order: "asc" }],
      select: { id: true, nameAr: true, order: true, createdAt: true },
    });

    return NextResponse.json({ grades });
  } catch {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();
    const data = CreateGradeSchema.parse(body);

    const created = await prisma.grade.create({
      data: { nameAr: data.nameAr, order: data.order },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "تم إنشاء المرحلة" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }
    if (e?.name === "ZodError") {
      return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "تعذر إنشاء المرحلة" }, { status: 400 });
  }
}
