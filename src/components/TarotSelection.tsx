import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { TarotCard } from '../types';
// import { getRandomTarotCards } from '../services/api'; // FortunePage에서 카드를 미리 선택하므로 여기서 필요 없음

interface TarotSelectionProps {
  onCardSelect: (card: TarotCard) => void;
  preselectedCards: TarotCard[]; // 부모로부터 미리 선택된 카드 목록을 받음
}

const TarotSelection: React.FC<TarotSelectionProps> = ({ onCardSelect, preselectedCards }) => {
  // const [cards, setCards] = useState<TarotCard[]>([]); // 미리 선택된 카드를 prop으로 받으므로 필요 없음
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null); // 사용자가 선택한 카드 (인덱스) - 0, 1, 2 중 하나
  // 모달 및 애니메이션 상태 관리
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isSelectionTextVisible, setIsSelectionTextVisible] = useState(false);
  const [isSelectionTextFadingOut, setIsSelectionTextFadingOut] = useState(false);
  const [isEnlargedCardAnimating, setIsEnlargedCardAnimating] = useState(false); // 확대/뒤집기 애니메이션 준비
  const [isCardFlipped, setIsCardFlipped] = useState(false); // 카드가 뒤집혔는지 여부

  // 애니메이션 타임아웃 관리를 위한 ref
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 로딩 메시지 설정 - 이제 FortunePage에서 카드를 미리 선택하므로 이펙트 필요 없음
  useEffect(() => {
    // 이펙트 내용 비움 또는 제거
  }, []);

  // prop으로 받은 preselectedCards를 기반으로 화면에 보여줄 카드 목록 생성 (3장을 반복해서 약 15개 이상)
  const cardsToDisplay = [];
  const repeatCount = Math.ceil(20 / preselectedCards.length); // 최소 20개 이상 표시되도록 반복
  for (let i = 0; i < repeatCount; i++) {
    cardsToDisplay.push(...preselectedCards);
  }

  const handleCardClick = (cardIndex: number) => { // 클릭된 카드의 인덱스를 받도록 수정
    if (selectedCardIndex !== null) return; // 이미 선택된 경우 무시
    
    setSelectedCardIndex(cardIndex); // 선택된 카드의 인덱스 저장
    const selectedActualCard = preselectedCards[cardIndex]; // 미리 선택된 카드 목록에서 실제 카드 정보 가져오기
    
    setIsModalVisible(true); // 모달 컨테이너 보이게 설정
    setIsOverlayVisible(false); // 오버레이 투명 상태로 시작
    setIsSelectionTextVisible(false);
    setIsSelectionTextFadingOut(false);
    setIsEnlargedCardAnimating(false);
    setIsCardFlipped(false);

    // 모든 애니메이션 타임아웃 클리어 (방어 코드)
    if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
    }

    // 1. 흐르는 카드들 움직임 멈춤
    document.querySelectorAll('.card-wrapper').forEach(el => el.classList.add('paused'));

    // 애니메이션 시퀀스 시작
    requestAnimationFrame(() => { // 다음 프레임에서 transition 시작
      // 2. 화면이 천천히 어두워짐 (2초)
      setIsOverlayVisible(true);
    });

    animationTimeoutRef.current = setTimeout(() => {
      // 3. "당신이 선택한 카드는..." 문구 서서히 나타남 (1.5초)
      setIsSelectionTextVisible(true);
      setIsEnlargedCardAnimating(true); // 카드는 아직 숨김 상태로 애니메이션 준비

      animationTimeoutRef.current = setTimeout(() => {
          // 문구 서서히 사라짐 (1.5초)
          setIsSelectionTextFadingOut(true);

          animationTimeoutRef.current = setTimeout(() => {
              setIsSelectionTextVisible(false); // 문구 완전히 숨김
              setIsSelectionTextFadingOut(false);

              // 4. 카드가 뒤집히며 확대되는 애니메이션 시작
              requestAnimationFrame(() => { // DOM 업데이트 후 애니메이션 시작
                  setIsCardFlipped(true); // 뒤집기 (1.4초)

                  // 뒤집기 애니메이션 중간쯤 확대 시작 (1.4초 * 0.5 = 0.7초 후)
                  animationTimeoutRef.current = setTimeout(() => {
                      setIsEnlargedCardAnimating(false); // 준비 상태 해제, 확대 애니메이션 시작 (1.0초)
                  }, 700);

                  // 모든 애니메이션 완료 후 onCardSelect 호출 및 모달 닫기
                  // onCardSelect 콜백에 선택된 실제 카드 정보를 넘겨줍니다.
                  animationTimeoutRef.current = setTimeout(() => {
                      onCardSelect(selectedActualCard); // 선택된 실제 카드 객체를 전달
                      closeModal();
                  }, 1400 + 1000 + 500); // 예: 뒤집기 끝 + 확대 끝 + 0.5초 대기

              });
          }, 1500); // 문구 사라지는 시간
      }, 1500); // 문구 표시 시간
    }, 2000); // 화면 어두워지는 시간
  };

  const closeModal = () => {
    // 모든 애니메이션 타임아웃 클리어
    if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
    }

    setIsModalVisible(false); // 모달 숨김
    setIsOverlayVisible(false); // 오버레이 투명 상태로 되돌림
    setIsSelectionTextVisible(false);
    setIsSelectionTextFadingOut(false);
    setIsEnlargedCardAnimating(false);
    setIsCardFlipped(false);
    setSelectedCardIndex(null); // 선택된 카드 인덱스 초기화

    // 흐르는 카드들 움직임 다시 시작
    document.querySelectorAll('.card-wrapper').forEach(el => el.classList.remove('paused'));
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
            {cardsToDisplay.map((card, index) => (
              <FlowingCard 
                key={`card-${index}`}
                onClick={() => handleCardClick(index % preselectedCards.length)} // 클릭 시 미리 선택된 카드 인덱스(0, 1, 2) 전달
              >
                <CardBackDesign>{/* 뒷면 디자인 */}</CardBackDesign>
                 {/* 뒤집혔을 때 보여줄 실제 카드 이미지 - 초기에는 숨김 */}
                 {selectedCardIndex !== null && (index % preselectedCards.length === selectedCardIndex) && (
                    <ActualCardImage src={preselectedCards[selectedCardIndex].image} alt={preselectedCards[selectedCardIndex].name} isFlipped={isCardFlipped} />
                 )}
              </FlowingCard>
            ))}
            {/* 복제된 카드들 (무한 스크롤을 위해) - 이제 cardsToDisplay에 이미 포함됨 */}
          </CardWrapper>
        </CardRowContainer>
      </CardsContainer>
      
      {/* 모달 */}
      {/* selectedCard 상태 대신 selectedCardIndex와 preselectedCards prop 사용 */}
      {isModalVisible && selectedCardIndex !== null && (
        <ModalOverlay isVisible={isOverlayVisible} onClick={closeModal}>
          <EnlargedCardAnimContainer isAnimating={isEnlargedCardAnimating} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <FlipCardArea>
              <FlipCardInner isFlipped={isCardFlipped}>
                {/* 뒤집힌 카드 뒷면 */}
                <FlipCardFace>
                  <FlipCardBack>
                    {/* 여기에 선택된 실제 카드의 이미지를 넣습니다. */} 
                    {selectedCardIndex !== null && (
                        <ActualCardImage src={preselectedCards[selectedCardIndex].image} alt={preselectedCards[selectedCardIndex].name} isFlipped={isCardFlipped} />
                    )}
                  </FlipCardBack>
                </FlipCardFace>
                {/* 뒤집힌 카드 앞면 */}
                <FlipCardFace>
                  <FlipCardFront>
                    {/* 앞면에는 이미지, 이름, 설명 표시 */} 
                    {selectedCardIndex !== null && preselectedCards[selectedCardIndex] && (
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
            <SelectionText isVisible={isSelectionTextVisible} isFadingOut={isSelectionTextFadingOut}>
              당신이 선택한 카드는...
            </SelectionText>
            <CloseButton onClick={closeModal}>
              &times;
            </CloseButton>
          </EnlargedCardAnimContainer>
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
  min-height: 320px;
`;
CardsContainer.displayName = 'TarotSelection_CardsContainer';

const CardRowContainer = styled.div`
  width: 100%;
  overflow: hidden;
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px 0;
  height: 340px;
  
  &:hover .card-wrapper {
    animation-play-state: paused;
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
  background-color: #4a4e69; /* 카드 뒷면 기본 색상 */
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
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(107, 70, 193, 0.1) 0%, rgba(233, 216, 253, 0.1) 100%);
    pointer-events: none;
  }
  
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

const CardBackDesign = styled.div`
  font-size: 24px;
  color: #f2e9e4;
  text-shadow: 0 0 10px rgba(242, 233, 228, 0.8);
  z-index: 1;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
CardBackDesign.displayName = 'TarotSelection_CardBackDesign';

// 모달 오버레이 스타일
const ModalOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.isVisible ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0)'}; /* 초기 투명, 최종 어두움 */
  display: ${props => props.isVisible || !props.isVisible ? 'flex' : 'none'}; /* isVisible이 false여도 transition 동안 flex 유지 */
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: background-color 2s ease-out, opacity 2s ease-out, visibility 0s ${props => props.isVisible ? '0s' : '2s'}; /* visibility는 지연 후 변경 */
`;
ModalOverlay.displayName = 'TarotSelection_ModalOverlay';

// "당신이 선택한 카드는..." 문구 스타일
const SelectionText = styled.div<{ isVisible: boolean, isFadingOut: boolean }>`
  position: absolute;
  top: 25%; /* 화면 중앙 상단으로 조정 */
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFFFFF; /* 순수 흰색 */
  font-size: 36px; /* 글자 크기 확대 */
  font-weight: bold;
  z-index: 1005;
  text-shadow: 0 0 20px rgba(255,255,255,0.8); /* 빛나는 효과 강화 */
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */

  opacity: ${props => props.isVisible ? (props.isFadingOut ? 0 : 1) : 0};
  transition: opacity 1.5s ease-out;
  ${props => props.isVisible && !props.isFadingOut && `
    animation: fadeInText 1.5s ease-out forwards;
  `}
  ${props => props.isFadingOut && `
    animation: fadeOutText 1.5s ease-out forwards;
  `}

  @keyframes fadeInText {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes fadeOutText {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }

  @media (max-width: 768px) {
    font-size: 28px;
    top: 20%;
  }
  @media (max-width: 480px) {
    font-size: 22px;
    top: 18%;
  }
`;
SelectionText.displayName = 'TarotSelection_SelectionText';

// 확대된 카드 애니메이션 컨테이너
const EnlargedCardAnimContainer = styled.div<{ isAnimating: boolean }>`
  position: relative;
  transform: ${props => props.isAnimating ? 'scale(0.7)' : 'scale(1)'}; /* 애니메이션 준비 상태일 때 작게 */
  opacity: ${props => props.isAnimating ? 0 : 1};
  /* 애니메이션 속도 절반으로 (기존 0.5s -> 1.0s, 0.4s -> 0.8s) */
  transition: transform 1.0s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.8s ease-out;
  visibility: ${props => props.isAnimating ? 'visible' : 'visible'}; /* 애니메이션 준비 상태일 때 보이게 */
`;
EnlargedCardAnimContainer.displayName = 'TarotSelection_EnlargedCardAnimContainer';

const FlipCardArea = styled.div`
  width: 300px;
  height: 400px;
  perspective: 1500px;

  @media (max-width: 768px) {
    width: 240px;
    height: 320px;
  }
  @media (max-width: 480px) {
    width: 210px;
    height: 280px;
  }
`;
FlipCardArea.displayName = 'TarotSelection_FlipCardArea';

const FlipCardInner = styled.div<{ isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  /* 애니메이션 속도 절반으로 (기존 0.7s -> 1.4s) */
  transition: transform 1.4s cubic-bezier(0.4, 0.0, 0.2, 1);
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
  overflow: hidden; /* 이미지 넘침 방지 */
`;
FlipCardFace.displayName = 'TarotSelection_FlipCardFace';

const FlipCardBack = styled(FlipCardFace)`
  background-color: #4a4e69;
  border: 3px solid #9a8c98;
  color: #f2e9e4;
`;
FlipCardBack.displayName = 'TarotSelection_FlipCardBack';

const FlipCardFront = styled(FlipCardFace)`
  background-color: #f2e9e4;
  border: 3px solid #9a8c98;
  color: #1a1a2e;
  transform: rotateY(180deg);
  padding: 20px;
  text-align: center;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 */
`;
FlipCardFront.displayName = 'TarotSelection_FlipCardFront';

// 흐르는 카드 뒷면에 표시될 실제 카드 이미지 스타일
const ActualCardImage = styled.img<{ isFlipped: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px; /* 부모(FlowingCard)의 border-radius와 일치 */
  backface-visibility: hidden; /* 뒤집힐 때 안 보이게 */
  transform: rotateY(180deg); /* 뒷면에 위치하도록 180도 회전 */
  opacity: ${props => props.isFlipped ? 1 : 0}; /* 뒤집힌 상태일 때 보이게 */
  transition: opacity 0.1s ease-out ${props => props.isFlipped ? '0.7s' : '0s'}; /* 뒤집기 애니메이션 중간쯤 나타나도록 지연 */
`;
ActualCardImage.displayName = 'TarotSelection_ActualCardImage';

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

const ImageDimOverlay = styled.div<{ isFlipped: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: ${props => props.isFlipped ? 0 : 1};
  /* 애니메이션 속도 절반으로 (기존 0.8s -> 1.6s), 딜레이도 조정 */
  transition: opacity 1.6s 0.4s ease-out; /* 딜레이 0.2s -> 0.4s */
  pointer-events: none;
`;
ImageDimOverlay.displayName = 'TarotSelection_ImageDimOverlay';

const CloseButton = styled.button`
  position: absolute;
  top: 30px; 
  right: 30px;
  padding: 10px 15px;
  background-color: #c9ada7;
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