import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessPath } from "@/lib/rbac";

const SIMPLE_AUTH_ENABLED = process.env.HACKATHON_SIMPLE_AUTH !== "false";

const protectedPagePrefixes = [
  "/dashboard",
  "/predict",
  "/leftover",
  "/decision",
  "/ngo-send",
  "/waste-scan",
  "/rewards",
  "/analytics",
  "/ngo-dashboard",
  "/recycler",
];

const protectedApiPrefixes = [
  "/api/surplus",
  "/api/decision",
  "/api/ngo-requests",
  "/api/waste-scan",
  "/api/recycler-jobs",
  "/api/predictions",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = protectedPagePrefixes.some((prefix) => pathname.startsWith(prefix));
  const isProtectedApi = protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (SIMPLE_AUTH_ENABLED && isProtectedPage) {
      // In hackathon demo mode, avoid auth-cookie/env mismatch loops on page navigation.
      return NextResponse.next();
    }

    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = (token.role as "kitchen" | "ngo" | "recycler" | "admin" | undefined) ?? "kitchen";

  if (!canAccessPath(pathname, role)) {
    const url = req.nextUrl.clone();
    url.pathname = role === "ngo" ? "/ngo-dashboard" : role === "recycler" ? "/recycler" : "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
