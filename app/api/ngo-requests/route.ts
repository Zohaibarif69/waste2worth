import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const acceptSchema = z.object({
  ngoRequestId: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  const role = session.user.role;
  const orgId = session.user.organizationId;

  const items = await prisma.ngoRequest.findMany({
    where:
      role === "ngo"
        ? {
            OR: [{ ngoOrganizationId: null }, { ngoOrganizationId: orgId }],
          }
        : undefined,
    include: {
      surplusBatch: true,
      pickup: true,
      ngoOrganization: true,
      acceptance: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  if (session.user.role !== "ngo" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Only NGO/admin can accept requests" }, { status: 403 });
  }

  try {
    const payload = acceptSchema.parse(await req.json());
    const orgId = session.user.organizationId;

    const ngoRequest = await prisma.ngoRequest.findUnique({
      where: { id: payload.ngoRequestId },
      include: { pickup: true },
    });

    if (!ngoRequest) {
      return NextResponse.json({ error: "NGO request not found" }, { status: 404 });
    }

    if (ngoRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Request is no longer pending" }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.ngoRequest.update({
        where: { id: payload.ngoRequestId },
        data: {
          status: "ACCEPTED",
          ngoOrganizationId: orgId,
        },
      });

      const acceptance = await tx.ngoAcceptance.upsert({
        where: { ngoRequestId: payload.ngoRequestId },
        create: {
          ngoRequestId: payload.ngoRequestId,
          ngoOrganizationId: orgId,
          acceptedById: session.user.id,
          pickupWindowStart: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
          pickupWindowEnd: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
          notes: payload.notes,
        },
        update: {
          ngoOrganizationId: orgId,
          acceptedById: session.user.id,
          pickupWindowStart: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
          pickupWindowEnd: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
          notes: payload.notes,
        },
      });

      await tx.pickup.upsert({
        where: { ngoRequestId: payload.ngoRequestId },
        create: {
          ngoRequestId: payload.ngoRequestId,
          status: "SCHEDULED",
          scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : new Date(),
          notes: payload.notes,
        },
        update: {
          status: "SCHEDULED",
          scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : undefined,
          notes: payload.notes,
        },
      });

      await tx.surplusBatch.update({
        where: { id: updated.surplusBatchId },
        data: { status: "DONATION_ACCEPTED" },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "ngo_request.accepted",
          entityType: "NgoRequest",
          entityId: payload.ngoRequestId,
          metadata: {
            organizationId: orgId,
            acceptanceId: acceptance.id,
          },
        },
      });

      return { updated, acceptance };
    });

    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to accept NGO request" }, { status: 500 });
  }
}
