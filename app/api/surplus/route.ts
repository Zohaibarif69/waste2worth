import { DonationSafety, SurplusStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const createSurplusSchema = z.object({
  foodType: z.string().min(2),
  quantityKg: z.number().positive(),
  timeSinceCookedHours: z.number().min(0),
  cookedAt: z.string().datetime().optional(),
  predictionOutputId: z.string().optional(),
});

function deriveSafety(quantityKg: number, hours: number): { suggestion: DonationSafety; confidence: number; reasoning: string } {
  const freshnessScore = Math.max(0, 1 - hours / 10);
  const volumeRisk = quantityKg > 80 ? 0.15 : quantityKg > 40 ? 0.07 : 0;
  const confidence = Math.min(0.95, Math.max(0.4, freshnessScore - volumeRisk + 0.2));

  if (hours <= 4) {
    return {
      suggestion: "SAFE",
      confidence,
      reasoning: "Recently cooked and within safe redistribution window.",
    };
  }

  return {
    suggestion: "RISKY",
    confidence,
    reasoning: "Outside preferred fresh window. Human safety check required.",
  };
}

export async function GET() {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "No organization context" }, { status: 400 });
  }

  const items = await prisma.surplusBatch.findMany({
    where: { organizationId: orgId },
    include: {
      aiSuggestions: { take: 1, orderBy: { createdAt: "desc" } },
      humanDecision: true,
      ngoRequests: {
        include: {
          acceptance: true,
          pickup: true,
        },
      },
      wasteScan: {
        include: { classification: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  try {
    const payload = createSurplusSchema.parse(await req.json());
    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization context" }, { status: 400 });
    }

    const ai = deriveSafety(payload.quantityKg, payload.timeSinceCookedHours);

    const created = await prisma.$transaction(async (tx) => {
      const surplus = await tx.surplusBatch.create({
        data: {
          organizationId: orgId,
          createdById: session.user.id,
          predictionOutputId: payload.predictionOutputId,
          foodType: payload.foodType,
          quantityKg: payload.quantityKg,
          cookedAt: payload.cookedAt ? new Date(payload.cookedAt) : new Date(),
          timeSinceCookedHours: payload.timeSinceCookedHours,
          status: "PENDING_REVIEW",
          aiSafety: ai.suggestion,
          aiConfidence: ai.confidence,
        },
      });

      await tx.aiSuggestion.create({
        data: {
          surplusBatchId: surplus.id,
          modelVersion: "heuristic-v1",
          suggestion: ai.suggestion,
          confidence: ai.confidence,
          reasoning: ai.reasoning,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "surplus.created",
          entityType: "SurplusBatch",
          entityId: surplus.id,
          metadata: {
            aiSuggestion: ai.suggestion,
            confidence: ai.confidence,
          },
        },
      });

      return surplus;
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create surplus batch" }, { status: 500 });
  }
}
