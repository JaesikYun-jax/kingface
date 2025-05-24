"server-only";

import { BirthInfo, FortuneResult, TarotCard } from "@/types";

import { callOpenAIStructured } from "../api/openai";
import { AI_MODELS } from "../config/models";
import { FORTUNE_SYSTEM_PROMPT } from "../prompts/fortune";
import { FortuneResultSchema } from "../schemas/schemas";

export async function generateFortune(
  birthInfo: BirthInfo,
  selectedCard?: TarotCard | null,
): Promise<FortuneResult> {
  try {
    const model = AI_MODELS.FORTUNE.FREE; // 기본 모델 사용

    const cardInfo = selectedCard
      ? `선택한 타로 카드: ${selectedCard.name} - ${selectedCard.meaning}`
      : "타로 카드 없이 진행";

    const tarotContent = selectedCard
      ? `선택한 타로 카드: ${selectedCard.name}
      카드 의미: ${selectedCard.description}`
      : "타로 카드를 선택하지 않았습니다.";

    const userMessage = `
사주 정보: ${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일 ${birthInfo.hour}시 ${birthInfo.minute}분
성별: ${birthInfo.gender === "male" ? "남성" : "여성"}
음력/양력: ${birthInfo.calendar === "lunar" ? "음력" : "양력"}

${tarotContent}

이 정보를 바탕으로 오늘의 운세를 전체적인 운세, 사랑, 직업, 건강 영역으로 나누어 상세하게 알려주고, 마지막에 조언을 추가해주세요.
    `;

    const content = await callOpenAIStructured<typeof FortuneResultSchema>({
      model,
      input: [
        {
          role: "system",
          content: FORTUNE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1000,
      responseSchema: FortuneResultSchema,
      schemaName: "fortune_analysis",
    });

    return {
      ...content,
    } as const;
  } catch (error: any) {
    console.error("운세 생성 오류:", error);
    throw error;
  }
}
