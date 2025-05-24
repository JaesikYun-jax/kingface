"use server";

import { generateFortune } from "@/lib/openai/services/fortune";
import { BirthInfo, TarotCard } from "@/types";

export async function generateFortuneAction(
  birthInfo: BirthInfo,
  card: TarotCard,
) {
  return await generateFortune(birthInfo, card);
}
