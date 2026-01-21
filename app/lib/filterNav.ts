import type { Role } from "@prisma/client";
import type { NavItem } from "./navLinks";

export function filterNavByRole(items: NavItem[], role: Role) {
  return items.filter((item) => !item.roles || item.roles.includes(role));
}
