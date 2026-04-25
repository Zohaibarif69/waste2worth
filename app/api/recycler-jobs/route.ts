import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(["ASSIGNED", "PICKED", "PROCESSED", "CANCELLED"]),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  const orgId = session.user.organizationId;
  const role = session.user.role;

  const items = await prisma.recyclerJob.findMany({
    where:
      role === "recycler"
        ? {
            OR: [{ recyclerOrgId: orgId }, { recyclerOrgId: null }],
          }
        : undefined,
    include: {
      wasteScan: {
        include: {
          classification: true,
          surplusBatch: true,
        },
      },
      recyclerOrg: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  if (session.user.role !== "recycler" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Only recycler/admin can update jobs" }, { status: 403 });
  }

  try {
    const payload = updateSchema.parse(await req.json());

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.recyclerJob.update({
        where: { id: payload.jobId },
        data: {
          status: payload.status,
          notes: payload.notes,
          recyclerOrgId: session.user.organizationId,
          completedAt: payload.status === "PROCESSED" ? new Date() : null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "recycler_job.updated",
          entityType: "RecyclerJob",
          entityId: payload.jobId,
          metadata: {
            status: payload.status,
          },
        },
      });

      return updated;
    });

    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update recycler job" }, { status: 500 });
  }
}
