import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthUser = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "GATE_ADMIN" | "SERVANT";
  nameAr: string;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies(); // ✅ await here
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
  } catch {
    return null;
  }
}
