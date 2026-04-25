import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { isDatabaseUnavailableError } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

const SIMPLE_AUTH_ENABLED = process.env.HACKATHON_SIMPLE_AUTH !== "false";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["kitchen", "ngo", "recycler", "admin"]),
});

function toAppRole(role: UserRole): "kitchen" | "ngo" | "recycler" | "admin" {
  if (role === "KITCHEN") return "kitchen";
  if (role === "NGO") return "ngo";
  if (role === "RECYCLER") return "recycler";
  return "admin";
}

export const authOptions: NextAuthOptions = {
  adapter: SIMPLE_AUTH_ENABLED ? undefined : PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        if (SIMPLE_AUTH_ENABLED) {
          const email = parsed.data.email.toLowerCase();
          const role = parsed.data.role;
          const name = email.split("@")[0] || "Hackathon User";
          const organizationName = role === "kitchen"
            ? "Hackathon Kitchen"
            : role === "ngo"
            ? "Hackathon NGO"
            : role === "recycler"
            ? "Hackathon Recycler"
            : "Hackathon Admin";

          return {
            id: `demo-${role}-${email.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "user"}`,
            email,
            name,
            role,
            organizationId: `org-${role}`,
            organizationName,
          };
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
            include: {
              memberships: {
                include: { organization: true },
                orderBy: { createdAt: "asc" },
              },
            },
          });
        } catch (error) {
          if (isDatabaseUnavailableError(error)) {
            throw new Error("DB_UNAVAILABLE");
          }
          throw error;
        }

        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        if (user.memberships.length === 0) {
          throw new Error("No organization membership found for this account");
        }

        const requestedRole = parsed.data.role.toUpperCase() as UserRole;
        const selectedMembership = user.memberships.find((m) => m.role === requestedRole);

        if (!selectedMembership) {
          throw new Error("Requested role does not match your assigned membership");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: toAppRole(selectedMembership.role),
          organizationId: selectedMembership.organizationId,
          organizationName: selectedMembership.organization.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.organizationName = (user as any).organizationName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as any) ?? "kitchen";
        session.user.organizationId = (token.organizationId as string | null) ?? null;
        session.user.organizationName = (token.organizationName as string | null) ?? null;
      }
      return session;
    },
  },
};
