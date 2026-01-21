import type { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "الرئيسية" },
  { href: "/students", label: "الطلاب" },
  { href: "/classes", label: "الفصول" },
  { href: "/attendance", label: "الحضور" },
  { href: "/reasons", label: "الأسباب" },
  { href: "/rewards", label: "المكافآت" },

  { href: "/bonus", label: "إضافة نقاط" },

  { href: "/assignments", label: "ربط المستخدمين بالفصول", roles: ["SUPER_ADMIN"] },
  { href: "/users", label: "المستخدمين", roles: ["SUPER_ADMIN"] },
  { href: "/logs", label: "السجلات", roles: ["SUPER_ADMIN"] },
  
];
