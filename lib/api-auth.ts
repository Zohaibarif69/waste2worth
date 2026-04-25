import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const SIMPLE_AUTH_ENABLED = process.env.HACKATHON_SIMPLE_AUTH !== "false";

export async function getRequiredSession() {
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    // In hackathon demo mode, allow API access without valid session token
    // (similar to how middleware allows page access in demo mode)
    if (SIMPLE_AUTH_ENABLED) {
      return {
        session: {
          user: {
            id: "demo-user",
            role: "kitchen",
            organizationId: "org-kitchen",
            organizationName: "Hackathon Kitchen",
          },
        },
        response: null,
      };
    }
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}
