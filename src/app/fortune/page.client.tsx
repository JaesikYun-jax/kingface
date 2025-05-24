"use client";

import BirthForm from "@/components/BirthForm";
import FortuneResultComponent from "@/components/FortuneResult";
import TarotSelection from "@/components/TarotSelection";
import { Card } from "@/components/ui/card";
import { getRandomTarotCards } from "@/lib/tarot";
import { BirthInfo, FortuneResult, TarotCard } from "@/types";
import { useEffect, useState } from "react";

import { generateFortuneAction } from "./actions";

// 로딩 중 보여줄 위트있는 메시지 배열
const wittyLoadingMessages = [
  "천년 묵은 신비한 기운을 읽는 중...",
  "아이보살이 사주와 타로를 살펴보는 중...",
  "당신의 인연과 운명을 헤아리는 중...",
  "운명의 실타래를 풀어보는 중...",
  "영험한 기운으로 운세를 점치는 중...",
  "천지신명께 당신의 운세를 여쭙는 중...",
];

enum Step {
  BIRTH_INFO,
  TAROT_SELECTION,
  RESULT,
  LOADING,
}

export default function FortuneClient() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BIRTH_INFO);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingInterval, setLoadingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(
    wittyLoadingMessages[0],
  );

  // 미리 선택된 3장의 타로 카드 상태
  const [preselectedTarotCards, setPreselectedTarotCards] = useState<
    TarotCard[]
  >([]);

  // 컴포넌트 마운트 시 로딩 메시지 설정
  useEffect(() => {
    // 로딩 메시지 변경 인터벌 설정
    let messageInterval: NodeJS.Timeout;

    if (currentStep === Step.LOADING) {
      let index = 0;

      messageInterval = setInterval(() => {
        index = (index + 1) % wittyLoadingMessages.length;
        setCurrentLoadingMessage(wittyLoadingMessages[index]);
      }, 2000);
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (loadingInterval) clearInterval(loadingInterval);
    };
  }, [currentStep, loadingInterval]);

  // 로딩 진행 표시기 업데이트
  const updateLoadingProgress = () => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    setLoadingInterval(interval);
    return interval;
  };

  // 생년월일 제출 처리
  const handleBirthSubmit = (data: BirthInfo) => {
    setBirthInfo(data);
    // 타로 선택 단계로 이동하기 전에 카드 3장 미리 선택 및 이미지 사전 로딩
    const cardsToSelect = getRandomTarotCards(10); // 3장 가져오기
    setPreselectedTarotCards(cardsToSelect);

    // 이미지 사전 로딩
    cardsToSelect.forEach((card) => {
      const img = new Image();
      img.src = card.image; // 이미지 로딩 시작
    });

    setCurrentStep(Step.TAROT_SELECTION);
  };

  // 타로 카드 선택 처리 (FortunePage 입장에서는 '애니메이션 시작' 처리)
  // TarotSelection 컴포넌트에서 어떤 카드가 클릭되었는지 인덱스로 받거나,
  // 여기서는 미리 선택된 카드 목록의 특정 카드를 onCardSelect 콜백으로 받아 처리합니다.
  const handleTarotSelect = (card: TarotCard) => {
    // onCardSelect 콜백은 이제 TarotSelection 내부 애니메이션 완료 후 호출되며,
    // 선택된 카드를 넘겨줍니다.
    setSelectedCard(card); // FortuneResultComponent에 전달하기 위해 상태에 저장

    if (birthInfo) {
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, card);
    }
  };

  // 운세 생성 처리
  const handleGenerateFortune = async (birth: BirthInfo, card: TarotCard) => {
    setLoadingProgress(0);
    setCurrentLoadingMessage(wittyLoadingMessages[0]);
    const interval = updateLoadingProgress();

    try {
      const result = await generateFortuneAction(birth, card);

      // 로딩 효과를 위해 약간의 지연 후 결과 표시
      setTimeout(() => {
        clearInterval(interval);
        setLoadingProgress(100);
        setFortuneResult(result);
        setCurrentStep(Step.RESULT);
      }, 1500);
    } catch (err: any) {
      clearInterval(interval);
      console.error("Fortune generation error:", err);
      setError(err?.message || "운세 생성 중 오류가 발생했습니다.");

      // 5초 후 에러 메시지 제거하고 처음 단계로
      setTimeout(() => {
        setError(null);
        setCurrentStep(Step.BIRTH_INFO);
      }, 5000);
    }
  };

  // 다시 시작 처리
  const handleRestart = () => {
    setBirthInfo(null);
    setSelectedCard(null);
    setFortuneResult(null);
    setCurrentStep(Step.BIRTH_INFO);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card
          variant="elevated"
          className="border-red-500/30 bg-red-900/20 animate-scale-in-bounce"
        >
          <div className="text-red-200 text-center font-medium">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <span>오류가 발생했습니다</span>
            </div>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </Card>
      )}

      {currentStep === Step.BIRTH_INFO && (
        <Card variant="elevated" className="animate-fade-in-up">
          <BirthForm onSubmit={handleBirthSubmit} />
        </Card>
      )}

      {currentStep === Step.TAROT_SELECTION && (
        <Card variant="elevated" className="animate-fade-in-up">
          <div className="text-center">
            <TarotSelection
              onCardSelect={handleTarotSelect}
              preselectedCards={preselectedTarotCards}
            />
          </div>
        </Card>
      )}

      {currentStep === Step.LOADING && (
        <Card variant="glow" className="animate-scale-in-bounce">
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <div className="text-4xl mb-6 animate-sparkle-enhanced">🔮</div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center text-shadow-mystical">
              아이보살이 운명의 기운을 읽고 있습니다
            </h3>

            {/* Progress bar */}
            <div className="w-full max-w-lg mb-8">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-mystical rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>0%</span>
                <span>{Math.round(loadingProgress)}%</span>
                <span>100%</span>
              </div>
            </div>

            <p className="text-center text-white/90 text-base max-w-lg leading-relaxed mb-4">
              사주와 타로에 담긴 천기를 해독하는 중입니다.
            </p>
            <p className="text-sm italic text-primary-200 text-center max-w-lg leading-relaxed animate-pulse-slow">
              {currentLoadingMessage}
            </p>
          </div>
        </Card>
      )}

      {currentStep === Step.RESULT && fortuneResult && (
        <Card variant="elevated" className="animate-fade-in-up">
          <FortuneResultComponent
            result={fortuneResult}
            selectedCard={selectedCard}
            onRestart={handleRestart}
          />
        </Card>
      )}
    </div>
  );
}
