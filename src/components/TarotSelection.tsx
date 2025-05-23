import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { TarotCard } from '../types';
import { getRandomTarotCards } from '../services/api';

interface TarotSelectionProps {
  onCardSelect: (card: TarotCard) => void;
}

const TarotSelection: React.FC<TarotSelectionProps> = ({ onCardSelect }) => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 랜덤 타로 카드 가져오기
    const randomCards = getRandomTarotCards();
    setCards(randomCards);
  }, []);

  const handleCardClick = (card: TarotCard) => {
    if (selectedCard) return; // 이미 선택된 경우 무시
    
    setSelectedCard(card);
    setShowModal(true);
    
    // 2초 후 자동으로 다음 단계로 진행
    setTimeout(() => {
      onCardSelect(card);
    }, 2000);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (cards.length === 0) {
    return <LoadingContainer>카드를 준비 중입니다...</LoadingContainer>;
  }

  // 카드를 두 그룹으로 나누기
  const firstRowCards = cards.slice(0, 6); // 6개로 증가
  const secondRowCards = cards.slice(6, 12); // 6개로 증가

  return (
    <Container>
      <StepIndicator>2단계</StepIndicator>
      <Title>타로 카드를 한 장 선택하세요</Title>
      <Description>
        흐르는 카드 중에서 직관에 따라 끌리는 카드를 골라보세요.
        타로 카드는 당신의 운세와 결합하여 더 깊은 통찰력을 제공합니다.
      </Description>
      
      <CardsContainer>
        {/* 첫 번째 줄: 좌에서 우로 흐름 */}
        <CardRowContainer className="row-1">
          <CardWrapper className="card-wrapper" direction="left-to-right">
            {/* 원본 카드들 */}
            {firstRowCards.map((card, index) => (
              <FlowingCard 
                key={`original-1-${index}`}
                onClick={() => handleCardClick(card)}
              >
                <CardBackDesign>✨</CardBackDesign>
              </FlowingCard>
            ))}
            {/* 복제된 카드들 (무한 스크롤을 위해) */}
            {firstRowCards.map((card, index) => (
              <FlowingCard 
                key={`clone-1-${index}`}
                onClick={() => handleCardClick(card)}
              >
                <CardBackDesign>✨</CardBackDesign>
              </FlowingCard>
            ))}
          </CardWrapper>
        </CardRowContainer>
        
        {/* 두 번째 줄: 우에서 좌로 흐름 */}
        <CardRowContainer className="row-2">
          <CardWrapper className="card-wrapper" direction="right-to-left">
            {/* 원본 카드들 */}
            {secondRowCards.map((card, index) => (
              <FlowingCard 
                key={`original-2-${index}`}
                onClick={() => handleCardClick(card)}
              >
                <CardBackDesign>✨</CardBackDesign>
              </FlowingCard>
            ))}
            {/* 복제된 카드들 (무한 스크롤을 위해) */}
            {secondRowCards.map((card, index) => (
              <FlowingCard 
                key={`clone-2-${index}`}
                onClick={() => handleCardClick(card)}
              >
                <CardBackDesign>✨</CardBackDesign>
              </FlowingCard>
            ))}
          </CardWrapper>
        </CardRowContainer>
      </CardsContainer>
      
      {/* 모달 */}
      {showModal && selectedCard && (
        <ModalOverlay onClick={closeModal}>
          <EnlargedCardContainer onClick={(e) => e.stopPropagation()}>
            <EnlargedCard>
              <CardNumber>{selectedCard.id + 1}</CardNumber>
              <CardTitle>{selectedCard.name}</CardTitle>
              <CardDescription>{selectedCard.description}</CardDescription>
            </EnlargedCard>
            <CloseButton onClick={closeModal}>
              잠시 후 자동으로 다음 단계로 진행됩니다...
            </CloseButton>
          </EnlargedCardContainer>
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
  min-height: 600px;
`;
CardsContainer.displayName = 'TarotSelection_CardsContainer';

const CardRowContainer = styled.div`
  width: 100%;
  overflow: hidden;
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px 0;
  height: auto;
  
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
             5s linear infinite;
`;
CardWrapper.displayName = 'TarotSelection_CardWrapper';

const FlowingCard = styled.div`
  width: 168px;
  height: 280px;
  background-color: #4a4e69;
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
  
  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
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
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
CardBackDesign.displayName = 'TarotSelection_CardBackDesign';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;
ModalOverlay.displayName = 'TarotSelection_ModalOverlay';

const EnlargedCardContainer = styled.div`
  position: relative;
  background-color: #22223b;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
`;
EnlargedCardContainer.displayName = 'TarotSelection_EnlargedCardContainer';

const EnlargedCard = styled.div`
  width: 300px;
  height: 400px;
  background-color: #f2e9e4;
  border: 3px solid #9a8c98;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #1a1a2e;
  text-align: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    width: 240px;
    height: 320px;
  }
  
  @media (max-width: 480px) {
    width: 180px;
    height: 240px;
  }
`;
EnlargedCard.displayName = 'TarotSelection_EnlargedCard';

const CardNumber = styled.div`
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;
CardNumber.displayName = 'TarotSelection_CardNumber';

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;
CardTitle.displayName = 'TarotSelection_CardTitle';

const CardDescription = styled.p`
  font-size: 1rem;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;
CardDescription.displayName = 'TarotSelection_CardDescription';

const CloseButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #c9ada7;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #9a8c98;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;
CloseButton.displayName = 'TarotSelection_CloseButton';

export default TarotSelection; 