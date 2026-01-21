import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = LoginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: { username, isActive: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, nameAr: user.nameAr },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ message: "تم تسجيل الدخول بنجاح" });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ message: "حدث خطأ" }, { status: 400 });
  }
}
