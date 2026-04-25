import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { databaseUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

const SIMPLE_AUTH_ENABLED = process.env.HACKATHON_SIMPLE_AUTH !== "false";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(2),
  role: z.enum(["kitchen", "ngo", "recycler", "admin"]),
});

const roleMap: Record<"kitchen" | "ngo" | "recycler" | "admin", UserRole> = {
  kitchen: "KITCHEN",
  ngo: "NGO",
  recycler: "RECYCLER",
  admin: "ADMIN",
};

export async function POST(req: Request) {
  try {
    const payload = registerSchema.parse(await req.json());

    if (SIMPLE_AUTH_ENABLED) {
      return NextResponse.json(
        {
          ok: true,
          hackathonMode: true,
          userId: `demo-${payload.role}-${payload.email.toLowerCase().replace(/[^a-z0-9]/gi, "").slice(0, 12) || "user"}`,
          organizationId: `org-${payload.role}`,
        },
        { status: 201 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: payload.organizationName,
          kind: payload.role.toUpperCase(),
        },
      });

      const createdUser = await tx.user.create({
        data: {
          name: payload.name,
          email: payload.email.toLowerCase(),
          passwordHash,
        },
      });

      await tx.membership.create({
        data: {
          userId: createdUser.id,
          organizationId: org.id,
          role: roleMap[payload.role],
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: createdUser.id,
          action: "auth.register",
          entityType: "User",
          entityId: createdUser.id,
          metadata: {
            organizationId: org.id,
            role: payload.role,
          },
        },
      });

      return { userId: createdUser.id, organizationId: org.id };
    });

    return NextResponse.json({ ok: true, ...user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: databaseUnavailableMessage() }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
