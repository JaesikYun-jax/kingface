"use client";

import { TarotCard } from "@/types";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { getRandomTarotCard } from "@/lib/tarot";
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

// 한글 타로카드 이름을 영어로 매핑하는 함수
function getEnglishCardName(koreanName: string): string {
  const nameMap: Record<string, string> = {
    "광대": "THE FOOL",
    "마법사": "THE MAGICIAN", 
    "여사제": "THE HIGH PRIESTESS",
    "여제": "THE EMPRESS",
    "황제": "THE EMPEROR",
    "교황": "THE HIEROPHANT",
    "연인": "THE LOVERS",
    "전차": "THE CHARIOT",
    "힘": "STRENGTH",
    "은둔자": "THE HERMIT",
    "운명의 수레바퀴": "WHEEL OF FORTUNE",
    "정의": "JUSTICE",
    "매달린 사람": "THE HANGED MAN",
    "죽음": "DEATH",
    "절제": "TEMPERANCE",
    "악마": "THE DEVIL",
    "탑": "THE TOWER",
    "별": "THE STAR",
    "달": "THE MOON",
    "태양": "THE SUN",
    "심판": "JUDGEMENT",
    "세계": "THE WORLD",
    "거울": "THE MIRROR",
    "나비": "THE BUTTERFLY",
    "등대": "THE LIGHTHOUSE",
    "책": "THE BOOK",
    "열쇠": "THE KEY",
    "미로": "THE LABYRINTH",
    "모래시계": "THE HOURGLASS",
    "다리": "THE BRIDGE"
  };
  
  return nameMap[koreanName] || koreanName.toUpperCase();
}

const TarotSelection: React.FC<TarotSelectionProps> = ({
  onCardSelect,
}) => {
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
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

  // 카드 애니메이션 제어
  function toggleCardAnimation(play: boolean) {
    if (cardWrapperRef.current) {
      cardWrapperRef.current.style.animationPlayState = play
        ? "running"
        : "paused";
    }
  }

  // 애니메이션 상태 리셋
  function resetAnimationStates() {
    setAnimationState(INITIAL_ANIMATION_STATE);
    setSelectedCard(getRandomTarotCard());
    toggleCardAnimation(true);
  }

  // 모달 닫기 및 리셋
  function closeModalAndReset() {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setSelectedCard(null);
    resetAnimationStates();
  }

  // 카드 제출 핸들러
  function handleSubmitCard() {
    if (selectedCard !== null) {
      try {
        onCardSelect(selectedCard);
        resetAnimationStates();
      } catch (error) {
        console.error("카드 선택 중 오류가 발생했습니다:", error);
        // 에러가 발생해도 상태는 리셋
        resetAnimationStates();
      }
    }
  }

  // 애니메이션 시퀀스 실행
  function executeAnimationSequence() {
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
  }

  // 카드 클릭 핸들러
  function handleCardClick() {
    setSelectedCard(getRandomTarotCard());
    setAnimationState({ ...INITIAL_ANIMATION_STATE, isModalVisible: true });
    toggleCardAnimation(false);
    executeAnimationSequence();
  }

  // 키보드 이벤트 핸들링
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
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
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [animationState.isModalVisible, animationState.showSubmitButton]);

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

  return (
    <div className="w-full max-w-5xl mx-auto p-0 bg-transparent relative">
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
      <p className="text-white/90 text-sm mb-8 text-center leading-relaxed break-words whitespace-normal [word-break:keep-all]">
        흐르는 카드 중에서 직관에 따라 끌리는 
        카드를 골라보세요. 타로 카드는 
        당신의 운세와 결합하여 더 깊은 
        통찰력을 제공합니다.
      </p>

      {/* 카드 슬라이더 */}
      <div className="w-full overflow-hidden mb-8 h-auto min-h-0">
        <div className="w-full overflow-hidden mb-8 rounded-xl bg-white/5 py-5 h-80 md:h-[340px] flex items-center">
          <div
            ref={cardWrapperRef}
            className="flex will-change-transform animate-scroll-left-to-right items-center"
            role="group"
            aria-label="선택 가능한 타로 카드들"
          >
            {Array(20)
              .fill(null)
              .map((_, index) => (
                <Button
                  key={`flowing-card-set1-${index}`}
                  onClick={handleCardClick}
                  className="w-[150px] h-[200px] bg-purple-900/50 border-2 border-white/30 rounded-lg mx-2 cursor-pointer transition-transform duration-200 flex-shrink-0 shadow-lg relative overflow-hidden hover:transform hover:-translate-y-1 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent p-0"
                  aria-label={`타로 카드 ${index + 1} 선택`}
                  disabled={animationState.isModalVisible}
                >
                  <Image
                    src="/assets/images/tarot/card-back.png"
                    alt="🃏"
                    width={600}
                    height={797}
                    className="w-full h-full object-cover rounded-lg"
                    priority={index < 5}
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
          className={`fixed inset-0 flex justify-center items-center z-[1000] px-5 transition-all duration-[2s] ease-out overflow-hidden ${
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
                  className="absolute w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden"
                  aria-hidden="true"
                >
                  <Image
                    src="/assets/images/tarot/card-back.png"
                    alt="타로 카드 뒷면"
                    width={400}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 카드 테두리 */}
                  <div className="absolute inset-0 border-4 border-purple-300/60 rounded-xl shadow-inner"></div>
                  
                  {/* 모서리 장식 */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-purple-300/80 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-purple-300/80 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-purple-300/80 rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-purple-300/80 rounded-br-lg"></div>
                </div>

                {/* 카드 앞면 */}
                <div
                  className="absolute w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  {/* 카드 이미지 배경 */}
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedCard.image}
                      alt={`${selectedCard.name} 타로 카드`}
                      width={400}
                      height={600}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 카드 테두리 */}
                    <div className="absolute inset-0 border-4 border-amber-300/80 rounded-xl shadow-inner"></div>
                    
                    {/* 상단 영어 이름 오버레이 */}
                    <div className="absolute top-4 left-0 right-0 text-center">
                      <div 
                        className="inline-block px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg border border-amber-300/50"
                        style={{
                          fontFamily: "var(--font-cinzel), 'Times New Roman', serif",
                          textShadow: "0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)"
                        }}
                      >
                        <span className="text-amber-200 text-sm md:text-base font-bold tracking-wider">
                          {getEnglishCardName(selectedCard.name)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 하단 장식적 테두리 */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* 모서리 장식 */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-amber-300/60 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-amber-300/60 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-amber-300/60 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-amber-300/60 rounded-br-lg"></div>
                  </div>
                  
                  {/* 접근성을 위한 숨겨진 설명 */}
                  <p id="selected-card-description" className="sr-only">
                    {selectedCard.meaning} - {selectedCard.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 한글 카드 이름 */}
            <div className="text-center mb-4">
              <h3
                id="selected-card-title"
                className="text-white text-xl md:text-2xl font-bold"
                style={{ 
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)",
                  fontFamily: "var(--font-noto-serif-kr), serif"
                }}
              >
                {selectedCard.name}
              </h3>
            </div>

            {/* 제출 버튼 */}
            <button
              ref={submitButtonRef}
              onClick={handleSubmitCard}
              className={`px-6 py-3 bg-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-500 mt-4 shadow-lg hover:bg-purple-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent ${
                animationState.showSubmitButton && animationState.isCardFlipped
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible translate-y-2"
              }`}
              style={{ boxShadow: "0 4px 10px rgba(107, 70, 193, 0.4)" }}
              aria-describedby="submit-button-description"
              disabled={!animationState.showSubmitButton || !animationState.isCardFlipped}
            >
              아이보살에게 카드를 내민다.
              <span id="submit-button-description" className="sr-only">
                선택한 타로 카드를 확정하고 다음 단계로 진행합니다.
              </span>
            </button>
          </div>

          {/* 선택 텍스트 */}
          <div
            className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl md:text-4xl font-bold z-[1005] whitespace-nowrap transition-all duration-1500 overflow-hidden ${
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
          {animationState.showSubmitButton && animationState.isCardFlipped && <button
            onClick={closeModalAndReset}
            className="absolute top-8 right-8 w-10 h-10 text-gray-800 border-none rounded-full cursor-pointer text-xl leading-none flex justify-center items-center transition-all duration-200 z-[1010] hover:text-gray-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="모달 닫기"
            disabled={!animationState.showSubmitButton || !animationState.isCardFlipped}
          >
            &times;
          </button>}
        </div>
      )}
    </div>
  );
};

export default TarotSelection;
