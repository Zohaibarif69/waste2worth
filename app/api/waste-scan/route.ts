import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { classifyWasteWithTeachableMachine } from "@/lib/teachable-machine";
import { classifyWasteWithVision } from "@/lib/vision";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const SIMPLE_AUTH_ENABLED = process.env.HACKATHON_SIMPLE_AUTH !== "false";

const bodySchema = z.object({
  surplusBatchId: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const surplusBatchId = formData.get("surplusBatchId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "image is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    const normalizedSurplusBatchId =
      typeof surplusBatchId === "string" && surplusBatchId.trim().length > 0
        ? surplusBatchId.trim()
        : undefined;

    const parsed = bodySchema.safeParse({ surplusBatchId: normalizedSurplusBatchId });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const imageBuffer = Buffer.from(bytes);

    const provider = process.env.WASTE_AI_PROVIDER ?? "teachable_machine";
    const classified =
      provider === "vision"
        ? await classifyWasteWithVision(imageBuffer.toString("base64"))
        : await classifyWasteWithTeachableMachine(imageBuffer, file.type);

    if (SIMPLE_AUTH_ENABLED && !parsed.data.surplusBatchId) {
      return NextResponse.json({
        item: {
          wasteType: classified.wasteType,
          confidence: classified.confidence,
          recyclable: classified.recyclable,
          compostable: classified.compostable,
          disposalRecommendation: classified.recommendation,
          labels: classified.labels,
          provider,
          hackathonMode: true,
        },
      });
    }

    if (!parsed.data.surplusBatchId) {
      return NextResponse.json({ error: "surplusBatchId is required" }, { status: 400 });
    }

    const orgId = session.user.organizationId;
    const batch = await prisma.surplusBatch.findFirst({
      where: {
        id: parsed.data.surplusBatchId,
        organizationId: orgId ?? undefined,
      },
    });

    if (!batch && session.user.role !== "admin") {
      return NextResponse.json({ error: "Surplus batch not found" }, { status: 404 });
    }

    const saved = await prisma.$transaction(async (tx) => {
      const scan = await tx.wasteScan.upsert({
        where: { surplusBatchId: parsed.data.surplusBatchId },
        create: {
          surplusBatchId: parsed.data.surplusBatchId,
          imageMimeType: file.type,
          imageSizeBytes: file.size,
        },
        update: {
          imageMimeType: file.type,
          imageSizeBytes: file.size,
        },
      });

      const classification = await tx.wasteClassification.upsert({
        where: { wasteScanId: scan.id },
        create: {
          wasteScanId: scan.id,
          wasteType: classified.wasteType,
          confidence: classified.confidence,
          recyclable: classified.recyclable,
          compostable: classified.compostable,
          disposalRecommendation: classified.recommendation,
          rawLabels: classified.labels,
        },
        update: {
          wasteType: classified.wasteType,
          confidence: classified.confidence,
          recyclable: classified.recyclable,
          compostable: classified.compostable,
          disposalRecommendation: classified.recommendation,
          rawLabels: classified.labels,
        },
      });

      await tx.recyclerJob.upsert({
        where: { wasteScanId: scan.id },
        create: {
          wasteScanId: scan.id,
          status: "OPEN",
        },
        update: {
          status: "OPEN",
        },
      });

      await tx.surplusBatch.update({
        where: { id: parsed.data.surplusBatchId },
        data: {
          status: "WASTE_PROCESSED",
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "waste.scan.classified",
          entityType: "WasteScan",
          entityId: scan.id,
          metadata: {
            wasteType: classified.wasteType,
            confidence: classified.confidence,
          },
        },
      });

      return { scan, classification };
    });

    return NextResponse.json({
      item: {
        ...saved.classification,
        labels: classified.labels,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to classify waste";
    const isClientImageError = /Unsupported image format|decode/i.test(message);
    return NextResponse.json({ error: message }, { status: isClientImageError ? 400 : 500 });
  }
}
