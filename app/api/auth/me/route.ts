import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type AuthUser = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "GATE_ADMIN" | "SERVANT";
  nameAr: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "غير مسجل" }, { status: 401 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "جلسة غير صالحة" }, { status: 401 });
  }
}
