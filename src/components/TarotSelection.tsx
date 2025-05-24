import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { TarotCard } from '../types';
// import { getRandomTarotCards } from '../services/api'; // FortunePage에서 카드를 미리 선택하므로 여기서 필요 없음
// import { cardBackImagePath } from '../assets/tarotData'; // cardBackImagePath를 직접 사용하지 않고 styled-component에서 설정

interface TarotSelectionProps {
  onCardSelect: (card: TarotCard) => void;
  preselectedCards: TarotCard[]; // 부모로부터 미리 선택된 카드 목록을 받음
}

const cardBackImagePath = '/assets/images/tarot/card-back.png'; // 최상단으로 이동하여 FlipCardBack에서도 참조 가능하도록 함

// 애니메이션 타이밍 상수화 (시뮬레이터 기본값 기반)
const OVERLAY_FADE_IN_TIME = 2000;
const TEXT_FADE_IN_TIME = 1500;
const TEXT_DISPLAY_TIME = 1500; // 텍스트가 나타난 후 유지되는 시간
const TEXT_FADE_OUT_TIME = 1500;
const CARD_FLIP_TIME = 1400;
const CARD_ZOOM_TIME = 1000; // 확대 애니메이션 시간
const POST_ANIMATION_DELAY = 500; // 모든 카드 애니메이션 후 최종 대기

const TarotSelection: React.FC<TarotSelectionProps> = ({ onCardSelect, preselectedCards }) => {
  // const [cards, setCards] = useState<TarotCard[]>([]); // 미리 선택된 카드를 prop으로 받으므로 필요 없음
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null); // 사용자가 선택한 카드 (인덱스) - 0, 1, 2 중 하나
  // 모달 및 애니메이션 상태 관리
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 전체 가시성
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // 오버레이(어두워지는 배경) 가시성
  const [isSelectionTextVisible, setIsSelectionTextVisible] = useState(false); // "당신이 선택한 카드는..." 텍스트 가시성
  const [isSelectionTextFadingOut, setIsSelectionTextFadingOut] = useState(false); // "당신이 선택한 카드는..." 텍스트 페이드 아웃 상태
  const [isEnlargedCardPrepare, setIsEnlargedCardPrepare] = useState(false); // 확대된 카드 준비 상태 (나타나기 전)
  const [isEnlargedCardAnimating, setIsEnlargedCardAnimating] = useState(false); // 확대된 카드 애니메이션(확대/페이드인) 상태
  const [isCardFlipped, setIsCardFlipped] = useState(false); // 카드가 뒤집혔는지 여부

  // 애니메이션 타임아웃 관리를 위한 ref
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 로딩 메시지 설정 - 이제 FortunePage에서 카드를 미리 선택하므로 이펙트 필요 없음
  useEffect(() => {
    // 이펙트 내용 비움 또는 제거
    return () => {
      // 컴포넌트 언마운트 시 타임아웃 클리어
      if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // prop으로 받은 preselectedCards를 기반으로 화면에 보여줄 카드 목록 생성 (3장을 반복해서 약 15개 이상)
  const cardsToDisplay = [];
  if (preselectedCards.length > 0) { // preselectedCards가 있을 때만 실행
    const repeatCount = Math.ceil(20 / preselectedCards.length);
    for (let i = 0; i < repeatCount; i++) {
      cardsToDisplay.push(...preselectedCards);
    }
  }

  const handleCardClick = (cardIndexInPreselected: number) => {
    if (selectedCardIndex !== null || preselectedCards.length === 0) return;

    setSelectedCardIndex(cardIndexInPreselected);

    setIsModalVisible(true);
    setIsOverlayVisible(false);
    setIsSelectionTextVisible(false);
    setIsSelectionTextFadingOut(false);
    setIsEnlargedCardPrepare(false);
    setIsEnlargedCardAnimating(false);
    setIsCardFlipped(false);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    document.querySelectorAll('.card-wrapper').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.animationPlayState = 'paused';
      }
    });
    
    requestAnimationFrame(() => {
        setIsOverlayVisible(true); // 오버레이 트랜지션 시작
    });

    // 1. 화면 어두워짐 후 (OVERLAY_FADE_IN_TIME)
    animationTimeoutRef.current = setTimeout(() => {
      setIsSelectionTextVisible(true); // 2. 텍스트 나타남 (TEXT_FADE_IN_TIME)
      setIsEnlargedCardPrepare(true);  // 카드 준비 (애니메이션 컨테이너는 보이지만 내용물은 아직 숨김)

      // 텍스트 나타난 후 유지 (TEXT_DISPLAY_TIME)
      animationTimeoutRef.current = setTimeout(() => {
        setIsSelectionTextFadingOut(true); // 3. 텍스트 사라짐 시작 (TEXT_FADE_OUT_TIME)

        // 텍스트 사라진 후 (TEXT_FADE_OUT_TIME)
        animationTimeoutRef.current = setTimeout(() => {
          setIsSelectionTextVisible(false); // 텍스트 완전히 숨김
          setIsSelectionTextFadingOut(false);
          
          // 4. 카드 애니메이션 시작
          setIsEnlargedCardPrepare(false); // 카드 준비 상태 해제
          requestAnimationFrame(() => { // 다음 프레임에서 카드 애니메이션 시작 (동시에)
            setIsEnlargedCardAnimating(true); // 카드 확대/페이드인 (CARD_ZOOM_TIME)
            setIsCardFlipped(true); // 카드 뒤집기 (CARD_FLIP_TIME)
          });

          // 5. 카드 애니메이션 종료 후 (가장 긴 애니메이션 + POST_ANIMATION_DELAY)
          const longestCardAnimation = Math.max(CARD_FLIP_TIME, CARD_ZOOM_TIME);
          animationTimeoutRef.current = setTimeout(() => {
            if (selectedCardIndex !== null) { // selectedCardIndex가 설정된 상태에서만 실행
                 const selectedActualCard = preselectedCards[cardIndexInPreselected]; // cardIndexInPreselected 사용
                 onCardSelect(selectedActualCard);
            }
            // closeModal(); // 결과 화면으로 넘어가므로 여기서 닫지 않음
          }, longestCardAnimation + POST_ANIMATION_DELAY);
        }, TEXT_FADE_OUT_TIME);
      }, TEXT_DISPLAY_TIME);
    }, OVERLAY_FADE_IN_TIME);
  };

  const closeModal = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsModalVisible(false);
    setSelectedCardIndex(null);
    document.querySelectorAll('.card-wrapper').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.animationPlayState = 'running';
        }
      });
  };

  // cards 상태 대신 preselectedCards prop과 selectedCardIndex 상태 사용
  if (preselectedCards.length === 0) {
    return <LoadingContainer>카드를 준비 중입니다...</LoadingContainer>;
  }

  // 카드를 두 그룹으로 나누기 - 이제 미리 선택된 3장으로만 구성 (반복)
  // const firstRowCards = cards.slice(0, 10); // 이 부분 필요 없음

  return (
    <Container>
      <StepIndicator>2단계</StepIndicator>
      <Title>타로 카드를 한 장 선택하세요</Title>
      <Description>
        흐르는 카드 중에서 직관에 따라 끌리는 카드를 골라보세요.
        타로 카드는 당신의 운세와 결합하여 더 깊은 통찰력을 제공합니다.
      </Description>
      
      <CardsContainer>
        {/* 한 줄로 된 카드 흐름 */}
        <CardRowContainer className="row-1">
          <CardWrapper className="card-wrapper" direction="left-to-right">
            {/* 미리 선택된 카드들을 반복해서 표시 */}
            {cardsToDisplay.map((_, index) => (
              <FlowingCard 
                key={`flowing-card-${index}`}
                onClick={() => handleCardClick(index % preselectedCards.length)}
              />
            ))}
            {/* 복제된 카드들 (무한 스크롤을 위해) - 이제 cardsToDisplay에 이미 포함됨 */}
          </CardWrapper>
        </CardRowContainer>
      </CardsContainer>
      
      {/* 모달 */}
      {/* selectedCard 상태 대신 selectedCardIndex와 preselectedCards prop 사용 */}
      {/* isModalVisible 상태에 따라 전체 모달 표시/숨김 */}
      {isModalVisible && selectedCardIndex !== null && (
        <ModalOverlay isVisible={isOverlayVisible} onClick={closeModal}>
          {/* isEnlargedCardPrepare: 텍스트 애니메이션 동안 카드를 작고 투명하게 보이게 준비 */}
          {/* isEnlargedCardAnimating: 확대 및 페이드인 애니메이션 시작 */}
          <EnlargedCardAnimContainer 
            isPrepare={isEnlargedCardPrepare} 
            isAnimating={isEnlargedCardAnimating} 
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <FlipCardArea>
              {/* isCardFlipped: 카드 뒤집기 애니메이션 상태 */}
              <FlipCardInner isFlipped={isCardFlipped}>
                {/* 뒤집힌 카드 뒷면 */}
                <FlipCardFace>
                  <FlipCardBack />
                </FlipCardFace>
                {/* 뒤집힌 카드 앞면 */}
                <FlipCardFace>
                  <FlipCardFront>
                    {/* 앞면에는 이미지, 이름, 설명 표시 (선택된 카드가 있을 때만) */} 
                    {preselectedCards[selectedCardIndex] && (
                      <>
                        <AnimatedCardImage src={preselectedCards[selectedCardIndex].image} alt={preselectedCards[selectedCardIndex].name} />
                        <AnimatedCardName>{preselectedCards[selectedCardIndex].name}</AnimatedCardName>
                        <AnimatedCardDescription>{preselectedCards[selectedCardIndex].description}</AnimatedCardDescription>
                      </>
                    )}
                  </FlipCardFront>
                </FlipCardFace>
              </FlipCardInner>
            </FlipCardArea>
          </EnlargedCardAnimContainer>
          
          {/* SelectionText는 EnlargedCardAnimContainer와 분리하여 오버레이 중앙에 배치 */}
          <SelectionText isVisible={isSelectionTextVisible} isFadingOut={isSelectionTextFadingOut}>
              당신이 선택한 카드는...
          </SelectionText>

          {/* CloseButton은 항상 보이도록 모달 오버레이 안에 배치 */}
          <CloseButton onClick={closeModal}>
            &times;
          </CloseButton>
        </ModalOverlay>
      )}
    </Container>
  );
};

// 애니메이션 키프레임
const scrollLeftToRight = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const scrollRightToLeft = keyframes`
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  background-color: transparent;
`;
Container.displayName = 'TarotSelection_Container';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
`;
LoadingContainer.displayName = 'TarotSelection_LoadingContainer';

const StepIndicator = styled.div`
  background-color: rgba(107, 70, 193, 0.6);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 1rem;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
`;
StepIndicator.displayName = 'TarotSelection_StepIndicator';

const Title = styled.h2`
  color: white;
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(107, 70, 193, 0.5);
`;
Title.displayName = 'TarotSelection_Title';

const Description = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
`;
Description.displayName = 'TarotSelection_Description';

const CardsContainer = styled.div`
  width: 100%;
  overflow: hidden;
  margin-bottom: 2rem;
  height: auto;
  min-height: auto; /* 하위 CardRowContainer 높이에 따라 유연하게 조정 */
`;
CardsContainer.displayName = 'TarotSelection_CardsContainer';

const CardRowContainer = styled.div`
  width: 100%;
  overflow: hidden;
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px 0;
  height: 340px; /* 기본 PC 크기: 카드 300px + 패딩 40px */
  
  &:hover .card-wrapper {
    /* animation-play-state: paused; */ /* 클릭 시 JS로 제어 */
  }
  
  @media (max-width: 768px) {
    height: 273px; /* 카드 233px + 패딩 40px */
  }
  
  @media (max-width: 480px) {
    height: 227px; /* 카드 187px + 패딩 40px */
  }
`;
CardRowContainer.displayName = 'TarotSelection_CardRowContainer';

const CardWrapper = styled.div<{ direction: 'left-to-right' | 'right-to-left' }>`
  display: flex;
  width: fit-content;
  will-change: transform;
  
  animation: ${props => props.direction === 'left-to-right' ? scrollLeftToRight : scrollRightToLeft} 
             10.7s linear infinite;
`;
CardWrapper.displayName = 'TarotSelection_CardWrapper';

const FlowingCard = styled.div`
  width: 180px;
  height: 300px;
  /* 카드 뒷면 이미지 설정 */
  background-image: url(${cardBackImagePath});
  background-color: #4a4e69; /* 폴백 색상 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid #9a8c98;
  border-radius: 8px;
  margin: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden; /* 배경 이미지가 넘치지 않도록 */
  
  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }
  
  /* 기존 ::before 스타일 제거 또는 주석 처리 (카드 뒷면 이미지 사용 시 불필요) */
  /* &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(107, 70, 193, 0.1) 0%, rgba(233, 216, 253, 0.1) 100%);
    pointer-events: none;
  } */
  
  @media (max-width: 768px) {
    width: 140px;
    height: 233px;
    margin: 0 8px;
  }
  
  @media (max-width: 480px) {
    width: 112px;
    height: 187px;
    margin: 0 5px;
  }
`;
FlowingCard.displayName = 'TarotSelection_FlowingCard';

// 카드 뒷면 디자인 콘텐츠 (선택 사항, 이미지 위에 올릴 요소)
const CardBackDesignContent = styled.div`
  /* 여기에 뒷면 이미지 위에 표시할 요소 스타일 정의 */
  /* 예: 로고, 패턴 등 */
  /* 현재는 비워둡니다. */
`;
CardBackDesignContent.displayName = 'TarotSelection_CardBackDesignContent';


// 모달 오버레이 스타일
const ModalOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0); /* 초기 투명 */
  display: flex; /* 항상 flex로 두고 visibility와 opacity로 제어 */
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  /* 애니메이션 시간은 상수로 제어 */
  transition: background-color ${OVERLAY_FADE_IN_TIME / 1000}s ease-out, 
              opacity ${OVERLAY_FADE_IN_TIME / 1000}s ease-out, 
              visibility 0s ${props => props.isVisible ? '0s' : `${OVERLAY_FADE_IN_TIME / 1000}s`};
  ${props => props.isVisible && `background-color: rgba(0, 0, 0, 0.85);`}
`;
ModalOverlay.displayName = 'TarotSelection_ModalOverlay';

// "당신이 선택한 카드는..." 문구 스타일
const SelectionText = styled.div<{ isVisible: boolean, isFadingOut: boolean }>`
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFFFFF;
  font-size: 36px;
  font-weight: bold;
  z-index: 1005;
  text-shadow: 0 0 20px rgba(255,255,255,0.8);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;

  @keyframes fadeInText {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes fadeOutText {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }

  ${props => props.isVisible && !props.isFadingOut && `
    animation: fadeInText ${TEXT_FADE_IN_TIME / 1000}s ease-out forwards;
    visibility: visible;
  `}
  ${props => props.isFadingOut && `
    animation: fadeOutText ${TEXT_FADE_OUT_TIME / 1000}s ease-out forwards;
    visibility: visible; /* 사라지는 동안은 보여야 함 */
  `}
  ${props => !props.isVisible && !props.isFadingOut && `
    /* 완전히 숨겨진 상태 (애니메이션 후) */
    animation: none;
  `}

  @media (max-width: 768px) { font-size: 28px; top: 20%; }
  @media (max-width: 480px) { font-size: 22px; top: 18%; }
`;
SelectionText.displayName = 'TarotSelection_SelectionText';

// 확대된 카드 애니메이션 컨테이너
const EnlargedCardAnimContainer = styled.div<{ isPrepare: boolean, isAnimating: boolean }>`
  position: relative;
  transform: scale(0.7);
  opacity: 0;
  visibility: hidden;
  /* 애니메이션 시간은 상수로 제어, 확대/페이드 비율 유지 */
  transition: transform ${CARD_ZOOM_TIME / 1000}s cubic-bezier(0.68, -0.55, 0.27, 1.55), 
              opacity ${CARD_ZOOM_TIME * 0.8 / 1000}s ease-out;

  ${props => props.isPrepare && `
    visibility: visible;
    opacity: 0;
    transform: scale(0.7);
    transition: none;
  `}

  ${props => props.isAnimating && `
    visibility: visible;
    transform: scale(1);
    opacity: 1;
  `}
`;
EnlargedCardAnimContainer.displayName = 'TarotSelection_EnlargedCardAnimContainer';

const FlipCardArea = styled.div`
  width: 300px;
  height: 400px;
  perspective: 1500px;
  @media (max-width: 768px) { width: 240px; height: 320px; }
  @media (max-width: 480px) { width: 210px; height: 280px; }
`;
FlipCardArea.displayName = 'TarotSelection_FlipCardArea';

const FlipCardInner = styled.div<{ isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  /* 애니메이션 시간은 상수로 제어 */
  transition: transform ${CARD_FLIP_TIME / 1000}s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-radius: 12px;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;
FlipCardInner.displayName = 'TarotSelection_FlipCardInner';

const FlipCardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;
FlipCardFace.displayName = 'FlipCardFace';

const FlipCardBack = styled(FlipCardFace)`
  background-image: url(${cardBackImagePath});
  background-color: #4a4e69; /* Fallback */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 3px solid #9a8c98;
`;
FlipCardBack.displayName = 'TarotSelection_FlipCardBack';

const FlipCardFront = styled(FlipCardFace)`
  background-color: #f2e9e4;
  border: 3px solid #9a8c98;
  color: #1a1a2e;
  transform: rotateY(180deg);
  padding: 20px;
  text-align: center;
  overflow-y: auto;
`;
FlipCardFront.displayName = 'TarotSelection_FlipCardFront';

// 흐르는 카드 뒷면에 표시될 실제 카드 이미지 스타일 - 이제 사용하지 않음
/* const ActualCardImage = styled.img<{ isFlipped: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  opacity: ${props => props.isFlipped ? 1 : 0};
  transition: opacity 0.1s ease-out ${props => props.isFlipped ? '0.7s' : '0s'};
`;
ActualCardImage.displayName = 'TarotSelection_ActualCardImage'; */

const AnimatedCardImage = styled.img`
  max-width: 80%;
  max-height: 60%;
  height: auto; /* 비율 유지를 위해 auto */
  margin-bottom: 15px;
  border-radius: 8px;
  object-fit: cover;
`;
AnimatedCardImage.displayName = 'TarotSelection_AnimatedCardImage';

const AnimatedCardName = styled.h3`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #1a1a2e;

  @media (max-width: 768px) {
    font-size: 18px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
AnimatedCardName.displayName = 'TarotSelection_AnimatedCardName';

const AnimatedCardDescription = styled.p`
  font-size: 14px;
  margin-top: 10px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 12px;
  }
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;
AnimatedCardDescription.displayName = 'TarotSelection_AnimatedCardDescription';

// 이미지 어둡게 하는 오버레이 - 이제 사용하지 않음 (뒷면에 이미지 대신 디자인 사용)
/* const ImageDimOverlay = styled.div<{ isFlipped: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: ${props => props.isFlipped ? 0 : 1};
  transition: opacity 1.6s 0.4s ease-out;
  pointer-events: none;
`;
ImageDimOverlay.displayName = 'TarotSelection_ImageDimOverlay'; */

const CloseButton = styled.button`
  position: absolute;
  top: 30px; 
  right: 30px;
  padding: 10px 15px;
  background-color: rgba(201, 173, 167, 0.8); /* 약간 투명하게 */
  color: #1a1a2e;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s, transform 0.2s;
  z-index: 1010;

  &:hover {
      background-color: #9a8c98;
      transform: scale(1.1);
  }

  @media (max-width: 768px) {
      top: 15px; right: 15px; width: 35px; height: 35px; font-size: 18px;
  }
`;
CloseButton.displayName = 'TarotSelection_CloseButton';

export default TarotSelection;