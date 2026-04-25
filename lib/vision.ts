import { z } from "zod";

const labelSchema = z.object({
  description: z.string(),
  score: z.number().optional(),
});

const responseSchema = z.object({
  responses: z.array(
    z.object({
      labelAnnotations: z.array(labelSchema).optional(),
    })
  ),
});

export type WasteClassificationResult = {
  wasteType: "ORGANIC" | "PLASTIC" | "EWASTE" | "MIXED" | "OTHER";
  confidence: number;
  recyclable: boolean;
  compostable: boolean;
  recommendation: string;
  labels: Array<{ description: string; score: number }>;
};

export async function classifyWasteWithVision(base64Image: string): Promise<WasteClassificationResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_VISION_API_KEY is not configured");
  }

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: "LABEL_DETECTION", maxResults: 12 }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Vision API error: ${res.status} ${errorText}`);
  }

  const payload = responseSchema.parse(await res.json());
  const labels = (payload.responses[0]?.labelAnnotations ?? []).map((l) => ({
    description: l.description.toLowerCase(),
    score: l.score ?? 0,
  }));

  const labelText = labels.map((l) => l.description).join(" ");
  const topScore = labels[0]?.score ?? 0.5;

  if (/(organic|food|fruit|vegetable|leaf|compost|leftover)/.test(labelText)) {
    return {
      wasteType: "ORGANIC",
      confidence: topScore,
      recyclable: false,
      compostable: true,
      recommendation: "Send to composting/biogas stream.",
      labels,
    };
  }

  if (/(plastic|bottle|container|packaging|polyethylene|pet)/.test(labelText)) {
    return {
      wasteType: "PLASTIC",
      confidence: topScore,
      recyclable: true,
      compostable: false,
      recommendation: "Segregate and send to authorized plastic recycler.",
      labels,
    };
  }

  if (/(electronic|circuit|battery|mobile|computer|charger|wire)/.test(labelText)) {
    return {
      wasteType: "EWASTE",
      confidence: topScore,
      recyclable: true,
      compostable: false,
      recommendation: "Route to certified e-waste collection center.",
      labels,
    };
  }

  if (labels.length > 0) {
    return {
      wasteType: "MIXED",
      confidence: topScore,
      recyclable: true,
      compostable: false,
      recommendation: "Manual segregation required before disposal.",
      labels,
    };
  }

  return {
    wasteType: "OTHER",
    confidence: 0.4,
    recyclable: false,
    compostable: false,
    recommendation: "Unable to classify confidently. Request manual review.",
    labels,
  };
}
