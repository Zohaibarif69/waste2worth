import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const predictionSchema = z.object({
  expectedAttendance: z.number().int().positive(),
  weather: z.string().optional(),
  eventTag: z.string().optional(),
  weekday: z.number().int().min(0).max(6),
  historicalAvgMeals: z.number().int().positive().optional(),
});

function predictMeals(input: z.infer<typeof predictionSchema>): { predictedMeals: number; confidence: number } {
  const weatherFactor = input.weather?.toLowerCase().includes("rain") ? 0.93 : 1;
  const weekendFactor = input.weekday === 0 || input.weekday === 6 ? 0.9 : 1;
  const eventFactor = input.eventTag ? 1.08 : 1;
  const history = input.historicalAvgMeals ?? input.expectedAttendance;

  const baseline = (input.expectedAttendance * 0.65) + (history * 0.35);
  const predicted = Math.round(baseline * weatherFactor * weekendFactor * eventFactor);
  const confidence = 0.72;

  return {
    predictedMeals: Math.max(1, predicted),
    confidence,
  };
}

export async function POST(req: Request) {
  const { session, response } = await getRequiredSession();
  if (response) return response;

  try {
    const payload = predictionSchema.parse(await req.json());
    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization context" }, { status: 400 });
    }

    const predicted = predictMeals(payload);

    const created = await prisma.$transaction(async (tx) => {
      const input = await tx.predictionInput.create({
        data: {
          organizationId: orgId,
          createdById: session.user.id,
          expectedAttendance: payload.expectedAttendance,
          weather: payload.weather,
          eventTag: payload.eventTag,
          weekday: payload.weekday,
          historicalAvgMeals: payload.historicalAvgMeals,
        },
      });

      const output = await tx.predictionOutput.create({
        data: {
          predictionInputId: input.id,
          predictedMeals: predicted.predictedMeals,
          confidence: predicted.confidence,
          modelVersion: "baseline-v1",
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "prediction.generated",
          entityType: "PredictionOutput",
          entityId: output.id,
          metadata: {
            expectedAttendance: payload.expectedAttendance,
            predictedMeals: predicted.predictedMeals,
          },
        },
      });

      return output;
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 });
  }
}
