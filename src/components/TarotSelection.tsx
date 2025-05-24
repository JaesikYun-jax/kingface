"use client";

import { TarotCard } from "@/types";
import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "./ui/button";

interface TarotSelectionProps {
  onCardSelect: (card: TarotCard) => void;
  preselectedCards: TarotCard[];
}

// 애니메이션 타이밍 상수
const ANIMATION_TIMING = {
  OVERLAY_FADE_IN: 2000,
  TEXT_FADE_IN: 1500,
  TEXT_DISPLAY: 1500,
  TEXT_FADE_OUT: 1500,
  CARD_FLIP: 1400,
  CARD_ZOOM: 1000,
  POST_ANIMATION_DELAY: 500,
} as const;

// 애니메이션 상태 타입
interface AnimationState {
  isModalVisible: boolean;
  isOverlayVisible: boolean;
  isSelectionTextVisible: boolean;
  isSelectionTextFadingOut: boolean;
  isEnlargedCardPrepare: boolean;
  isEnlargedCardAnimating: boolean;
  isCardFlipped: boolean;
  showSubmitButton: boolean;
}

// 초기 애니메이션 상태
const INITIAL_ANIMATION_STATE: AnimationState = {
  isModalVisible: false,
  isOverlayVisible: false,
  isSelectionTextVisible: false,
  isSelectionTextFadingOut: false,
  isEnlargedCardPrepare: false,
  isEnlargedCardAnimating: false,
  isCardFlipped: false,
  showSubmitButton: false,
};

const TarotSelection: React.FC<TarotSelectionProps> = ({
  onCardSelect,
  preselectedCards,
}) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null,
  );
  const [animationState, setAnimationState] = useState<AnimationState>(
    INITIAL_ANIMATION_STATE,
  );

  // Refs
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // 정리 함수
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // 화면에 표시할 카드 목록 생성 (메모이제이션)
  const cardsToDisplay = useMemo(() => {
    if (preselectedCards.length === 0) return [];

    const targetCount = 20;
    const repeatCount = Math.ceil(targetCount / preselectedCards.length);
    return Array(repeatCount).fill(preselectedCards).flat();
  }, [preselectedCards]);

  // 카드 애니메이션 제어
  const toggleCardAnimation = useCallback((play: boolean) => {
    if (cardWrapperRef.current) {
      cardWrapperRef.current.style.animationPlayState = play
        ? "running"
        : "paused";
    }
  }, []);

  // 애니메이션 상태 리셋
  const resetAnimationStates = useCallback(() => {
    setAnimationState(INITIAL_ANIMATION_STATE);
    setSelectedCardIndex(null);
    toggleCardAnimation(true);
  }, [toggleCardAnimation]);

  // 모달 닫기 및 리셋
  const closeModalAndReset = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    resetAnimationStates();
  }, [resetAnimationStates]);

  // 카드 제출 핸들러
  const handleSubmitCard = useCallback(() => {
    if (selectedCardIndex !== null) {
      try {
        onCardSelect(preselectedCards[selectedCardIndex]);
        resetAnimationStates();
      } catch (error) {
        console.error("카드 선택 중 오류가 발생했습니다:", error);
        // 에러가 발생해도 상태는 리셋
        resetAnimationStates();
      }
    }
  }, [selectedCardIndex, onCardSelect, preselectedCards, resetAnimationStates]);

  // 애니메이션 시퀀스 실행
  const executeAnimationSequence = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Step 1: 오버레이 표시
    requestAnimationFrame(() => {
      setAnimationState((prev) => ({ ...prev, isOverlayVisible: true }));
    });

    // Step 2: 텍스트 표시 및 카드 준비
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState((prev) => ({
        ...prev,
        isSelectionTextVisible: true,
        isEnlargedCardPrepare: true,
      }));

      // Step 3: 텍스트 페이드아웃 시작
      animationTimeoutRef.current = setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          isSelectionTextFadingOut: true,
        }));

        // Step 4: 카드 애니메이션 시작
        animationTimeoutRef.current = setTimeout(() => {
          setAnimationState((prev) => ({
            ...prev,
            isSelectionTextVisible: false,
            isSelectionTextFadingOut: false,
            isEnlargedCardPrepare: false,
          }));

          requestAnimationFrame(() => {
            setAnimationState((prev) => ({
              ...prev,
              isEnlargedCardAnimating: true,
              isCardFlipped: true,
            }));
          });

          // Step 5: 제출 버튼 표시
          const longestCardAnimation = Math.max(
            ANIMATION_TIMING.CARD_FLIP,
            ANIMATION_TIMING.CARD_ZOOM,
          );
          animationTimeoutRef.current = setTimeout(() => {
            setAnimationState((prev) => ({ ...prev, showSubmitButton: true }));
          }, longestCardAnimation + ANIMATION_TIMING.POST_ANIMATION_DELAY);
        }, ANIMATION_TIMING.TEXT_FADE_OUT);
      }, ANIMATION_TIMING.TEXT_DISPLAY);
    }, ANIMATION_TIMING.OVERLAY_FADE_IN);
  }, []);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (cardIndexInPreselected: number) => {
      if (selectedCardIndex !== null || preselectedCards.length === 0) return;

      setSelectedCardIndex(cardIndexInPreselected);
      setAnimationState({ ...INITIAL_ANIMATION_STATE, isModalVisible: true });
      toggleCardAnimation(false);
      executeAnimationSequence();
    },
    [
      selectedCardIndex,
      preselectedCards.length,
      toggleCardAnimation,
      executeAnimationSequence,
    ],
  );

  // 키보드 이벤트 핸들링
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!animationState.isModalVisible) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          closeModalAndReset();
          break;
        case "Enter":
        case " ":
          if (animationState.showSubmitButton && submitButtonRef.current) {
            event.preventDefault();
            handleSubmitCard();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    animationState.isModalVisible,
    animationState.showSubmitButton,
    closeModalAndReset,
    handleSubmitCard,
  ]);

  // 모달이 열릴 때 포커스 관리
  useEffect(() => {
    if (animationState.isModalVisible && modalRef.current) {
      modalRef.current.focus();
    }
  }, [animationState.isModalVisible]);

  // 제출 버튼이 나타날 때 포커스 이동
  useEffect(() => {
    if (animationState.showSubmitButton && submitButtonRef.current) {
      submitButtonRef.current.focus();
    }
  }, [animationState.showSubmitButton]);

  // 로딩 상태
  if (preselectedCards.length === 0) {
    return (
      <div
        className="flex justify-center items-center h-96 text-xl text-white/90"
        role="status"
        aria-live="polite"
      >
        카드를 준비 중입니다...
      </div>
    );
  }

  const selectedCard =
    selectedCardIndex !== null ? preselectedCards[selectedCardIndex] : null;

  return (
    <div className="w-full max-w-5xl mx-auto p-0 bg-transparent">
      {/* 단계 표시 */}
      <div
        className="bg-purple-600/60 text-white text-sm font-semibold py-1 px-3 rounded-2xl text-center mb-4 w-fit mx-auto"
        role="status"
      >
        2단계
      </div>

      {/* 제목 */}
      <h2
        className="text-white text-2xl mb-2 text-center"
        style={{ textShadow: "0 0 10px rgba(107, 70, 193, 0.5)" }}
      >
        타로 카드를 한 장 선택하세요
      </h2>

      {/* 설명 */}
      <p className="text-white/90 text-sm mb-8 text-center leading-relaxed">
        흐르는 카드 중에서 직관에 따라 끌리는 카드를 골라보세요. 타로 카드는
        당신의 운세와 결합하여 더 깊은 통찰력을 제공합니다.
      </p>

      {/* 카드 슬라이더 */}
      <div className="w-full overflow-hidden mb-8 h-auto min-h-0">
        <div className="w-full overflow-hidden mb-8 rounded-xl bg-white/5 py-5 h-80 md:h-[340px] flex items-center">
          <div
            ref={cardWrapperRef}
            className="flex w-fit will-change-transform animate-scroll-left-to-right items-center"
            role="group"
            aria-label="선택 가능한 타로 카드들"
          >
            {cardsToDisplay.map((_, index) => (
              <Button
                key={`flowing-card-${index}`}
                onClick={() => handleCardClick(index % preselectedCards.length)}
                className="w-[150px] h-[200px] bg-purple-900/50 border-2 border-white/30 rounded-lg mx-2 cursor-pointer transition-transform duration-200 flex-shrink-0 shadow-lg relative overflow-hidden hover:transform hover:-translate-y-1 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent p-0"
                aria-label={`타로 카드 ${index + 1} 선택`}
                disabled={selectedCardIndex !== null}
              >
                <Image
                  src="/assets/images/tarot/card-back.png"
                  alt="🃏"
                  width={600}
                  height={797}
                  className="w-full h-full object-cover rounded-lg"
                  priority={index < 5} // 처음 5개 카드만 우선 로딩
                />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {animationState.isModalVisible && selectedCard && (
        <div
          ref={modalRef}
          className={`fixed top-0 left-0 w-full h-full flex justify-center items-center z-[1000] px-5 transition-all duration-[2s] ease-out ${
            animationState.isOverlayVisible
              ? "bg-black/85 opacity-100 visible"
              : "bg-black/0 opacity-0 invisible"
          }`}
          onClick={closeModalAndReset}
          role="dialog"
          aria-modal="true"
          aria-labelledby="selected-card-title"
          aria-describedby="selected-card-description"
          tabIndex={-1}
        >
          {/* 확대된 카드 애니메이션 컨테이너 */}
          <div
            className={`relative flex flex-col items-center transition-all duration-1000 ${
              animationState.isEnlargedCardPrepare &&
              !animationState.isEnlargedCardAnimating
                ? "scale-75 opacity-0 visible"
                : animationState.isEnlargedCardAnimating
                  ? "scale-100 opacity-100 visible"
                  : "scale-75 opacity-0 invisible"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 카드 뒤집기 영역 */}
            <div
              className="w-72 h-96 md:w-80 md:h-[400px] mb-4"
              style={{ perspective: "1500px" }}
              role="img"
              aria-label="선택된 타로 카드"
            >
              <div
                className={`relative w-full h-full transition-transform duration-[1400ms] shadow-2xl rounded-xl ${
                  animationState.isCardFlipped ? "transform-gpu" : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transitionTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)",
                  transform: animationState.isCardFlipped
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
                }}
              >
                {/* 카드 뒷면 */}
                <div
                  className="absolute w-full h-full [backface-visibility:hidden] rounded-xl flex flex-col justify-center items-center overflow-hidden bg-purple-900/50 bg-cover bg-center bg-no-repeat border-3 border-white/30"
                  style={{ backgroundImage: "url(/tarot/card-back.png)" }}
                  aria-hidden="true"
                />

                {/* 카드 앞면 */}
                <div
                  className="absolute w-full h-full [backface-visibility:hidden] rounded-xl flex flex-col justify-center items-center overflow-hidden bg-gray-100 border-3 border-white/30 p-5 text-center overflow-y-auto text-gray-800"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <Image
                    src={selectedCard.image}
                    alt={`${selectedCard.name} 타로 카드`}
                    width={200}
                    height={400}
                    className="max-w-[80%] max-h-[70%] h-auto mb-2 rounded-lg object-cover"
                  />
                  <h3
                    id="selected-card-title"
                    className="text-lg md:text-xl font-bold mb-0 text-gray-800"
                  >
                    {selectedCard.name}
                  </h3>
                  <p id="selected-card-description" className="sr-only">
                    {selectedCard.meaning} - {selectedCard.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            {animationState.showSubmitButton &&
              animationState.isCardFlipped && (
                <button
                  ref={submitButtonRef}
                  onClick={handleSubmitCard}
                  className="px-6 py-3 bg-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 mt-4 shadow-lg hover:bg-purple-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  style={{ boxShadow: "0 4px 10px rgba(107, 70, 193, 0.4)" }}
                  aria-describedby="submit-button-description"
                >
                  아이보살에게 카드를 내민다.
                  <span id="submit-button-description" className="sr-only">
                    선택한 타로 카드를 확정하고 다음 단계로 진행합니다.
                  </span>
                </button>
              )}
          </div>

          {/* 선택 텍스트 */}
          <div
            className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl md:text-4xl font-bold z-[1005] whitespace-nowrap transition-all duration-1500 ${
              animationState.isSelectionTextVisible &&
              !animationState.isSelectionTextFadingOut
                ? "opacity-100 visible scale-100"
                : animationState.isSelectionTextFadingOut
                  ? "opacity-0 visible scale-90"
                  : "opacity-0 invisible scale-90"
            }`}
            style={{
              textShadow: "0 0 20px rgba(255,255,255,0.8)",
              transitionTimingFunction: "ease-out",
            }}
            aria-live="polite"
            role="status"
          >
            당신이 선택한 카드는...
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={closeModalAndReset}
            className="absolute top-8 right-8 w-10 h-10 bg-white/20 text-gray-800 border-none rounded-full cursor-pointer text-xl leading-none flex justify-center items-center transition-all duration-200 z-[1010] hover:bg-white/30 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="모달 닫기"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default TarotSelection;
