import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/serverAuth.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateStudentSchema = z.object({
  nameAr: z.string().min(2, "الاسم مطلوب"),
  gender: z.enum(["MALE", "FEMALE"]),
  classId: z.string().min(1),
  parentPhone1: z.string().optional().nullable(),
  parentPhone2: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const classId = (searchParams.get("classId") ?? "").trim();

    const students = await prisma.student.findMany({
      where: {
        isActive: true,
        ...(classId ? { classId } : {}),
        ...(q
          ? {
              OR: [
                { nameAr: { contains: q, mode: "insensitive" } },
                { parentPhone1: { contains: q, mode: "insensitive" } },
                { parentPhone2: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        nameAr: true,
        gender: true,
        parentPhone1: true,
        parentPhone2: true,
        notes: true,
        createdAt: true,
        classRoom: {
          select: { id: true, nameAr: true,  gender: true, grade:  { select: { nameAr: true, order: true } } },
        },
      },
      take: 200,
    });

    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    const body = await req.json();
    const data = CreateStudentSchema.parse(body);

    // ✅ هنا نتحقق من الفصل
    const cls = await prisma.classRoom.findUnique({
      where: { id: data.classId },
      select: { id: true, gender: true },
    });

    if (!cls) {
      return NextResponse.json({ message: "الفصل غير موجود" }, { status: 400 });
    }

    // ✅ لو نوع الطالب مختلف عن نوع الفصل
    if (cls.gender !== data.gender) {
      return NextResponse.json(
        { message: "لا يمكن إضافة الطالب في فصل مختلف عن نوعه" },
        { status: 400 }
      );
    }

    // ✅ بعد كده نعمل create طبيعي
    const created = await prisma.student.create({
      data: {
        nameAr: data.nameAr,
        gender: data.gender,
        classId: data.classId,
        parentPhone1: data.parentPhone1 ?? null,
        parentPhone2: data.parentPhone2 ?? null,
        notes: data.notes ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json(
      { id: created.id, message: "تم إضافة الطالب" },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }
    return NextResponse.json({ message: "بيانات غير صحيحة" }, { status: 400 });
  }
}

