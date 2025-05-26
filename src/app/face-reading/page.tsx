import {
  getCurrentPlanType,
  getServicePlanConfig,
} from "@/lib/openai/config/service-plans";

import FaceReadingClient from "./page.client";

export default async function FaceReading() {
  const config = await getServicePlanConfig();
  const currentPlan = await getCurrentPlanType();

  return (
    <div className="max-w-5xl mx-auto py-4 md:py-6 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-shadow-mystical">
          전생 관상 풀이
        </h1>
        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          당신의 얼굴에 담긴 운명의 비밀을 AI가 살펴보세요
        </p>
        <div className="w-16 h-1 bg-gradient-mystical mx-auto rounded-full"></div>
      </div>

      <FaceReadingClient currentPlan={currentPlan} servicePlanConfig={config} />
    </div>
  );
}
