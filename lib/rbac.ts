export type AppRole = "kitchen" | "ngo" | "recycler" | "admin";

export const roleRedirectMap: Record<AppRole, string> = {
  kitchen: "/",
  ngo: "/ngo-dashboard",
  recycler: "/recycler",
  admin: "/analytics",
};

export const roleRouteAccess: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/ngo-dashboard", roles: ["ngo", "admin"] },
  { prefix: "/ngo-send", roles: ["kitchen", "admin"] },
  { prefix: "/recycler", roles: ["recycler", "admin"] },
  { prefix: "/leftover", roles: ["kitchen", "admin"] },
  { prefix: "/decision", roles: ["kitchen", "admin"] },
  { prefix: "/predict", roles: ["kitchen", "admin"] },
  { prefix: "/waste-scan", roles: ["kitchen", "recycler", "admin"] },
  { prefix: "/dashboard", roles: ["kitchen", "admin"] },
  { prefix: "/rewards", roles: ["kitchen", "admin"] },
];

export function canAccessPath(pathname: string, role: AppRole): boolean {
  const matched = roleRouteAccess.find((route) => pathname.startsWith(route.prefix));
  if (!matched) return true;
  return matched.roles.includes(role);
}
