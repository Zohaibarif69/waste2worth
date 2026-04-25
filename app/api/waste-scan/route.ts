import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { classifyWasteWithVision } from "@/lib/vision";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const bodySchema = z.object({
  surplusBatchId: z.string().min(1),
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

    const parsed = bodySchema.safeParse({ surplusBatchId });
    if (!parsed.success) {
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

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    const classified = await classifyWasteWithVision(base64Image);

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
    return NextResponse.json({ error: "Failed to classify waste" }, { status: 500 });
  }
}
