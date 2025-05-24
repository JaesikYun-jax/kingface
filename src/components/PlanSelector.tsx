"use client";

import React, { useEffect, useMemo, useState } from "react";

import { PlanType, ServicePlanConfig } from "../types";
import { setCurrentPlanTypeAction } from "./actions";

interface PlanSelectorProps {
  servicePlanConfig: ServicePlanConfig;
  currentPlanType: PlanType;
  showDetails?: boolean;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  servicePlanConfig,
  currentPlanType,
  showDetails = true,
}) => {
  const config = useMemo(() => servicePlanConfig, [servicePlanConfig]);
  const [isPremium, setIsPremium] = useState<boolean>(
    currentPlanType === PlanType.PREMIUM,
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.FREE);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    setIsPremium(selectedPlan === PlanType.PREMIUM);
  }, [selectedPlan]);

  // 플랜 선택 변경 시 처리
  const handlePlanChange = (planType: PlanType) => {
    setSelectedPlan(planType);
    setCurrentPlanTypeAction(planType);
  };

  // 프리미엄 결제 처리
  const handlePayment = () => {
    // 실제 결제 API 연동 대신 바로 성공 처리
    setPaymentSuccess(true);
    handlePlanChange(PlanType.PREMIUM);

    // 사용자 경험을 위한 알림 표시 후 리셋
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 3000);
  };

  return (
    <div className="w-full mx-auto">
      {paymentSuccess && (
        <div className="flex items-center justify-center gap-2 bg-purple-600/30 text-white/90 p-3 rounded-lg mb-4 font-semibold animate-pulse">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full font-bold text-sm">
            ✓
          </span>
          프리미엄 결제가 완료되었습니다!
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        {/* 무료 플랜 */}
        <div
          className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
            selectedPlan === PlanType.FREE
              ? "border-purple-500 bg-purple-500/20"
              : "border-white/20 bg-white/5 hover:border-purple-400"
          }`}
          onClick={() => handlePlanChange(PlanType.FREE)}
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">무료 플랜</h3>
            <div className="text-2xl font-bold text-purple-200">0원</div>
          </div>

          {showDetails && (
            <div className="mb-6">
              {config.features.free.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 mb-2 text-white/90"
                >
                  <span className="text-green-400 font-bold">✓</span>
                  {feature}
                </div>
              ))}

              {config.features.premium
                .filter((feature) => !config.features.free.includes(feature))
                .map((feature, index) => (
                  <div
                    key={`premium-${index}`}
                    className="flex items-center gap-2 mb-2 text-white/50"
                  >
                    <span className="text-red-400 font-bold">✕</span>
                    {feature}
                  </div>
                ))}
            </div>
          )}

          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              selectedPlan === PlanType.FREE
                ? "bg-purple-600 text-white cursor-default"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            onClick={() => handlePlanChange(PlanType.FREE)}
            disabled={selectedPlan === PlanType.FREE}
          >
            {selectedPlan === PlanType.FREE ? "현재 플랜" : "무료 이용하기"}
          </button>
        </div>

        {/* 프리미엄 플랜 */}
        <div
          className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${
            selectedPlan === PlanType.PREMIUM
              ? "border-purple-500 bg-purple-500/20"
              : "border-purple-400 bg-purple-500/10 hover:border-purple-300"
          }`}
          onClick={() => handlePlanChange(PlanType.PREMIUM)}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            인기
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">프리미엄 플랜</h3>
            <div className="text-2xl font-bold text-purple-200">
              {config.prices.premium.toLocaleString()}원
            </div>
          </div>

          {showDetails && (
            <div className="mb-6">
              {config.features.premium.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 mb-2 text-white/90"
                >
                  <span className="text-purple-400 font-bold">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          )}

          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              selectedPlan === PlanType.PREMIUM
                ? "bg-purple-600 text-white cursor-default"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
            onClick={!isPremium ? handlePayment : undefined}
            disabled={selectedPlan === PlanType.PREMIUM}
          >
            {selectedPlan === PlanType.PREMIUM
              ? "현재 플랜"
              : "프리미엄 결제하기"}
          </button>

          {!isPremium && (
            <div className="flex items-center justify-center gap-2 mt-3 text-white/70 text-sm">
              <span>🔒</span>
              안전한 결제, 언제든지 해지 가능
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
