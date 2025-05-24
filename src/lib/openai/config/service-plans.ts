import { PlanType, ServicePlanConfig } from "@/types";
import { cookies } from "next/dist/server/request/cookies";

import { AI_MODELS } from "./models";

export const DEFAULT_SERVICE_PLAN: ServicePlanConfig = {
  models: {
    fortune: {
      free: AI_MODELS.FORTUNE.FREE,
      premium: AI_MODELS.FORTUNE.PREMIUM,
    },
    faceReading: AI_MODELS.FACE_READING,
  },
  features: {
    free: ["사주 기반 운세"],
    premium: ["사주 기반 운세", "타로 카드 해석", "관상 분석"],
  },
  prices: {
    premium: 5000,
  },
};

export async function getServicePlanConfig(): Promise<ServicePlanConfig> {
  const cookieStore = await cookies();
  const savedConfig = cookieStore.get("servicePlanConfig");
  if (savedConfig) {
    return JSON.parse(savedConfig.value);
  }
  return DEFAULT_SERVICE_PLAN;
}

export async function getCurrentPlanType(): Promise<PlanType> {
  const cookieStore = await cookies();
  const planType = cookieStore.get("currentPlanType");
  return planType?.value === "PREMIUM" ? PlanType.PREMIUM : PlanType.FREE;
}

export async function setCurrentPlanType(planType: PlanType): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("currentPlanType", planType);
}

export async function isFeatureAvailable(feature: string): Promise<boolean> {
  const currentPlan = await getCurrentPlanType();
  const config = await getServicePlanConfig();

  if (currentPlan === PlanType.PREMIUM) {
    return config.features.premium.includes(feature);
  } else {
    return config.features.free.includes(feature);
  }
}
