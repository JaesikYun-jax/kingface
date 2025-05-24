export const AI_MODELS = {
  FORTUNE: {
    FREE: "gpt-4o-mini-2024-07-18",
    PREMIUM: "gpt-4o-mini-2024-07-18",
  },
  FACE_READING: "gpt-4.1-2025-04-14",
} as const;

export type ModelType = keyof typeof AI_MODELS;
