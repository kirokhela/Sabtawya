import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthUser = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "GATE_ADMIN" | "SERVANT";
  nameAr: string;
};

export async function requireAuth(): Promise<AuthUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("UNAUTHORIZED");

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}