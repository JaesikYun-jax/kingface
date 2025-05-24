"server-only";

import { FaceReadingResult, PlanType } from "@/types";
import OpenAI from "openai";

import { callOpenAIStructured } from "../api/openai";
import { AI_MODELS } from "../config/models";
import { getCurrentPlanType } from "../config/service-plans";
import {
  FACE_READING_SYSTEM_PROMPT,
  FACE_READING_USER_PROMPT,
} from "../prompts/face-reading";
import { FaceReadingResultSchema } from "../schemas/schemas";

export async function analyzeFaceReading(
  imageBase64: string,
): Promise<FaceReadingResult> {
  try {
    const userPlan = await getCurrentPlanType();
    // 프리미엄 플랜 확인
    if (userPlan !== PlanType.PREMIUM) {
      throw new Error("관상 분석은 프리미엄 플랜 전용 기능입니다.");
    }

    const model = AI_MODELS.FACE_READING;
    console.log(`관상 분석 사용 모델: ${model}`);

    // 이미지 데이터에서 base64 본문만 추출
    const base64Data = imageBase64.split(",")[1];
    const imageUrl = `data:image/jpeg;base64,${base64Data}`;

    const content = await callOpenAIStructured<typeof FaceReadingResultSchema>({
      model,
      input: [
        {
          role: "system",
          content: FACE_READING_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: FACE_READING_USER_PROMPT,
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "high",
            },
          ],
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
      responseSchema: FaceReadingResultSchema,
      schemaName: "face_reading_analysis",
    });

    if (!content) {
      throw new Error(
        "AI가 구조화된 응답을 생성하지 못했습니다. 다시 시도해 주세요.",
      );
    }

    return {
      ...content,
      imageUrl,
    } as const;
  } catch (error: any) {
    console.error("관상 분석 오류:", error);

    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API 오류: ${error.status} - ${error.message}`);
    } else if (error instanceof OpenAI.APIConnectionError) {
      throw new Error("OpenAI API 연결 오류: 인터넷 연결을 확인하세요.");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new Error("API 요청 한도 초과: 잠시 후 다시 시도해주세요.");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new Error(
        "OpenAI API 키가 유효하지 않습니다. API 키를 확인해주세요.",
      );
    } else {
      throw error;
    }
  }
}
