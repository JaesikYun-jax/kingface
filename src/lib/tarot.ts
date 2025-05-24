import { tarotCards } from "@/assets/tarotData";
import { TarotCard } from "@/types";

export function getRandomTarotCards(count: number = 10): TarotCard[] {
  const shuffled = [...tarotCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
