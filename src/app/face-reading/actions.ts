"use server";

import { analyzeFaceReading } from "@/lib/openai/services/face-reading";

export async function analyzeFaceReadingAction(imageSrc: string) {
  return await analyzeFaceReading(imageSrc);
}
