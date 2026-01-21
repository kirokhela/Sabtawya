import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { z } from "zod";

const CreateClassSchema = z.object({
  gradeId: z.string().min(1),
  nameAr: z.string().min(1, "اسم الفصل مطلوب"),
  gender: z.enum(["MALE", "FEMALE"]),
});

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const gradeId = (searchParams.get("gradeId") ?? "").trim();
    const gender = (searchParams.get("gender") ?? "").trim(); // MALE/FEMALE
    const q = (searchParams.get("q") ?? "").trim();

    const classes = await prisma.classRoom.findMany({
      where: {
        isActive: true,
        ...(gradeId ? { gradeId } : {}),
        ...(gender ? { gender: gender as any } : {}),
        ...(q ? { nameAr: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: [{ grade: { order: "asc" } }, { nameAr: "asc" }],
      select: {
        id: true,
        nameAr: true,
        gender: true,
        grade: { select: { id: true, nameAr: true, order: true } },
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json({ classes });
  } catch {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();
    const data = CreateClassSchema.parse(body);

    const created = await prisma.classRoom.create({
      data: {
        gradeId: data.gradeId,
        nameAr: data.nameAr,
        gender: data.gender,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "تم إنشاء الفصل" }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ message: "بيانات غير صحيحة", errors: e.issues }, { status: 400 });
    return NextResponse.json({ message: "تعذر إنشاء الفصل" }, { status: 400 });
  }
}
