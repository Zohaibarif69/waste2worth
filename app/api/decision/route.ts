import { DonationSafety, NgoRequestStatus, SurplusStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const decisionSchema = z.object({
  surplusBatchId: z.string().min(1),
  decision: z.enum(["SAFE", "NOT_SAFE"]),
  notes: z.string().max(500).optional(),
  pickupWindowStart: z.string().datetime().optional(),
  pickupWindowEnd: z.string().datetime().optional(),
  pickupLocation: z.string().max(250).optional(),
});

export async function POST(req: Request) {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  try {
    const payload = decisionSchema.parse(await req.json());
    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization context" }, { status: 400 });
    }

    const surplus = await prisma.surplusBatch.findFirst({
      where: { id: payload.surplusBatchId, organizationId: orgId },
      include: { humanDecision: true },
    });

    if (!surplus) {
      return NextResponse.json({ error: "Surplus batch not found" }, { status: 404 });
    }

    if (surplus.humanDecision) {
      return NextResponse.json({ error: "Decision already recorded" }, { status: 409 });
    }

    const decisionValue: DonationSafety = payload.decision === "SAFE" ? "SAFE" : "NOT_SAFE";

    const result = await prisma.$transaction(async (tx) => {
      const humanDecision = await tx.humanDecision.create({
        data: {
          surplusBatchId: surplus.id,
          decidedById: session.user.id,
          decision: decisionValue,
          notes: payload.notes,
        },
      });

      let ngoRequestId: string | null = null;
      let wasteScanId: string | null = null;

      if (payload.decision === "SAFE") {
        const ngoRequest = await tx.ngoRequest.create({
          data: {
            surplusBatchId: surplus.id,
            status: NgoRequestStatus.PENDING,
            pickupWindowStart: payload.pickupWindowStart ? new Date(payload.pickupWindowStart) : null,
            pickupWindowEnd: payload.pickupWindowEnd ? new Date(payload.pickupWindowEnd) : null,
            pickupLocation: payload.pickupLocation,
          },
        });
        ngoRequestId = ngoRequest.id;

        await tx.surplusBatch.update({
          where: { id: surplus.id },
          data: { status: SurplusStatus.DONATION_APPROVED },
        });

        await tx.rewardEvent.create({
          data: {
            userId: session.user.id,
            organizationId: orgId,
            type: "FOOD_DONATION",
            points: 50,
            sourceId: surplus.id,
            metadata: { flow: "human-safe-decision" },
          },
        });
      } else {
        const wasteScan = await tx.wasteScan.upsert({
          where: { surplusBatchId: surplus.id },
          create: { surplusBatchId: surplus.id },
          update: {},
        });
        wasteScanId = wasteScan.id;

        await tx.recyclerJob.upsert({
          where: { wasteScanId: wasteScan.id },
          create: { wasteScanId: wasteScan.id, status: "OPEN" },
          update: { status: "OPEN" },
        });

        await tx.surplusBatch.update({
          where: { id: surplus.id },
          data: { status: SurplusStatus.WASTE_REVIEW },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "decision.recorded",
          entityType: "SurplusBatch",
          entityId: surplus.id,
          metadata: {
            decision: payload.decision,
            ngoRequestId,
            wasteScanId,
          },
        },
      });

      return { humanDecision, ngoRequestId, wasteScanId };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save human decision" }, { status: 500 });
  }
}
