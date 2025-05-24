"use server";

import { setCurrentPlanType } from "@/lib/openai/config/service-plans";
import { PlanType } from "@/types";

export async function setCurrentPlanTypeAction(planType: PlanType) {
  return await setCurrentPlanType(planType);
}
