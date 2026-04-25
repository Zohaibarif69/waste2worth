import * as tf from "@tensorflow/tfjs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import sharp from "sharp";
import type { WasteClassificationResult } from "@/lib/vision";

type TeachableMachineMetadata = {
  labels: string[];
  imageSize?: number;
};

type TeachableMachineCache = {
  cachedModel: tf.LayersModel | null;
  cachedMeta: TeachableMachineMetadata | null;
  modelLoadPromise: Promise<tf.LayersModel> | null;
  metadataLoadPromise: Promise<TeachableMachineMetadata> | null;
};

const globalForTeachableMachine = globalThis as unknown as {
  __tmCache?: TeachableMachineCache;
};

const tmCache: TeachableMachineCache =
  globalForTeachableMachine.__tmCache ?? {
    cachedModel: null,
    cachedMeta: null,
    modelLoadPromise: null,
    metadataLoadPromise: null,
  };

globalForTeachableMachine.__tmCache = tmCache;

const defaultBaseUrl = "https://teachablemachine.withgoogle.com/models/gxoGDbLZf/";

function modelBaseUrl() {
  return process.env.TEACHABLE_MACHINE_MODEL_URL ?? defaultBaseUrl;
}

function modelJsonUrl() {
  const base = modelBaseUrl();
  return base.endsWith("/") ? `${base}model.json` : `${base}/model.json`;
}

function metadataJsonUrl() {
  const base = modelBaseUrl();
  return base.endsWith("/") ? `${base}metadata.json` : `${base}/metadata.json`;
}

async function loadMetadata(): Promise<TeachableMachineMetadata> {
  if (tmCache.cachedMeta) return tmCache.cachedMeta;
  if (tmCache.metadataLoadPromise) return tmCache.metadataLoadPromise;

  tmCache.metadataLoadPromise = (async () => {
    const response = await fetch(metadataJsonUrl());
    if (!response.ok) {
      throw new Error(`Failed to fetch Teachable Machine metadata: ${response.status}`);
    }

    const parsed = (await response.json()) as TeachableMachineMetadata;
    if (!Array.isArray(parsed.labels) || parsed.labels.length === 0) {
      throw new Error("Teachable Machine metadata has no labels");
    }

    tmCache.cachedMeta = parsed;
    return parsed;
  })();

  try {
    return await tmCache.metadataLoadPromise;
  } finally {
    tmCache.metadataLoadPromise = null;
  }
}

async function loadModel(): Promise<tf.LayersModel> {
  if (tmCache.cachedModel) return tmCache.cachedModel;
  if (tmCache.modelLoadPromise) return tmCache.modelLoadPromise;

  tmCache.modelLoadPromise = (async () => {
    try {
      const model = await tf.loadLayersModel(modelJsonUrl());
      tmCache.cachedModel = model;
      return model;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      if (/already registered/i.test(message)) {
        tf.disposeVariables();
        const retryModel = await tf.loadLayersModel(modelJsonUrl());
        tmCache.cachedModel = retryModel;
        return retryModel;
      }
      throw error;
    }
  })();

  try {
    return await tmCache.modelLoadPromise;
  } finally {
    tmCache.modelLoadPromise = null;
  }
}

async function decodeImageToRgb(buffer: Buffer, mimeType?: string): Promise<{ rgb: Uint8Array; width: number; height: number }> {
  try {
    const { data, info } = await sharp(buffer)
      .rotate()
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (!info.width || !info.height || !data?.length) {
      throw new Error("Decoded image is empty");
    }

    return {
      rgb: new Uint8Array(data),
      width: info.width,
      height: info.height,
    };
  } catch {
    const isPng = mimeType?.toLowerCase().includes("png") ?? false;
    const decoded = isPng ? PNG.sync.read(buffer) : jpeg.decode(buffer, { useTArray: true });

    if (!decoded?.data || !decoded.width || !decoded.height) {
      throw new Error("Unsupported image format. Please upload JPEG, PNG, or WebP.");
    }

    const rgba = decoded.data;
    const rgb = new Uint8Array(decoded.width * decoded.height * 3);

    for (let src = 0, dest = 0; src < rgba.length; src += 4) {
      rgb[dest++] = rgba[src];
      rgb[dest++] = rgba[src + 1];
      rgb[dest++] = rgba[src + 2];
    }

    return { rgb, width: decoded.width, height: decoded.height };
  }
}

function mapLabelToWasteResult(label: string, confidence: number, allScores: Array<{ description: string; score: number }>): WasteClassificationResult {
  const normalized = label.toLowerCase();

  if (/(organic|food|fruit|vegetable|leaf|compost|leftover)/.test(normalized)) {
    return {
      wasteType: "ORGANIC",
      confidence,
      recyclable: false,
      compostable: true,
      recommendation: "Send to composting/biogas stream.",
      labels: allScores,
    };
  }

  if (/(plastic|bottle|container|packaging|polyethylene|pet)/.test(normalized)) {
    return {
      wasteType: "PLASTIC",
      confidence,
      recyclable: true,
      compostable: false,
      recommendation: "Segregate and send to authorized plastic recycler.",
      labels: allScores,
    };
  }

  if (/(e-waste|ewaste|electronic|circuit|battery|mobile|computer|charger|wire)/.test(normalized)) {
    return {
      wasteType: "EWASTE",
      confidence,
      recyclable: true,
      compostable: false,
      recommendation: "Route to certified e-waste collection center.",
      labels: allScores,
    };
  }

  return {
    wasteType: "MIXED",
    confidence,
    recyclable: true,
    compostable: false,
    recommendation: "Manual segregation required before disposal.",
    labels: allScores,
  };
}

export async function classifyWasteWithTeachableMachine(imageBuffer: Buffer, mimeType?: string): Promise<WasteClassificationResult> {
  const [meta, model] = await Promise.all([loadMetadata(), loadModel()]);
  const imageSize = meta.imageSize ?? 224;
  const labels = meta.labels;

  const { rgb, width, height } = await decodeImageToRgb(imageBuffer, mimeType);

  const inputTensor = tf.tidy(() => {
    const image = tf.tensor3d(rgb, [height, width, 3], "int32");
    const resized = tf.image.resizeBilinear(image, [imageSize, imageSize]);
    const normalized = resized.toFloat().div(127.5).sub(1);
    return normalized.expandDims(0);
  });

  const prediction = model.predict(inputTensor) as tf.Tensor;
  const scores = Array.from(await prediction.data()) as number[];

  inputTensor.dispose();
  prediction.dispose();

  const allScores = labels.map((name, index) => ({
    description: name,
    score: scores[index] ?? 0,
  }));

  const top = allScores.reduce((best, current) => (current.score > best.score ? current : best), allScores[0]);

  return mapLabelToWasteResult(top.description, top.score, allScores);
}
