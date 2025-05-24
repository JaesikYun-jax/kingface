import { z } from "zod";

// 타로 카드 스키마
export const TarotCardSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
  meaning: z.string(),
  description: z.string(),
});

// 운세 결과 스키마
export const FortuneResultSchema = z.object({
  headline: z.string().describe("신비로운 첫 문장"),
  overall: z.string().describe("전반적인 운세에 대한 분석"),
  love: z.string().describe("사랑과 연애 운세에 대한 분석"),
  career: z.string().describe("직업과 커리어 운세에 대한 분석"),
  health: z.string().describe("건강 운세에 대한 분석"),
  advice: z.string().describe("조언과 제안사항"),
  content: z.string().describe("원본 분석 내용 (마크다운 형식)"),
});

// 관상 분석 결과 스키마 (Structured Outputs 호환)
export const FaceReadingResultSchema = z.object({
  personalityTraits: z
    .array(z.string())
    .max(5)
    .describe("성격 특성 배열 (최대 5개)"),
  overallFortune: z.string().describe("전반적인 운세 분석"),
  careerSuitability: z.string().describe("직업 적성과 재능 분석"),
  relationships: z.string().describe("대인관계와 인연 분석"),
  advice: z.string().describe("운명의 조언과 제안사항"),
  content: z.string().describe("원본 분석 내용 (마크다운 형식)"),
});

// 타입 추론
export type FortuneResultSchemaType = z.infer<typeof FortuneResultSchema>;
export type FaceReadingResultSchemaType = z.infer<
  typeof FaceReadingResultSchema
>;
export type TarotCardSchemaType = z.infer<typeof TarotCardSchema>;
