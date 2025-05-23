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
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // 랜덤 타로 카드 4장 가져오기
    const randomCards = getRandomTarotCards();
    setCards(randomCards.slice(0, 4));
    
    // 카드 입장 애니메이션 완료 후 float 애니메이션으로 전환
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 3000); // 마지막 카드의 delay(1.5s) + 애니메이션 시간(1.5s) = 3s
    
    return () => clearTimeout(animationTimer);
  }, []);

  const handleCardClick = (index: number, card: TarotCard) => {
    if (selectedCardIdx !== null) return; // 이미 선택된 경우 무시
    
    setSelectedCardIdx(index);
    setSelectedCard(card);
    setIsAnimating(false);
    
    // 2초 후 자동으로 다음 단계로 진행
    setTimeout(() => {
      onCardSelect(card);
    }, 2000);
  };

  if (cards.length === 0) {
    return <LoadingContainer>카드를 준비 중입니다...</LoadingContainer>;
  }

  return (
    <Container>
      <StepIndicator>2단계</StepIndicator>
      <Title>타로 카드를 한 장 선택하세요</Title>
      <Description>
        직관에 따라 끌리는 카드를 골라보세요. 타로 카드는 당신의 운세와 결합하여
        더 깊은 통찰력을 제공합니다.
      </Description>
      
      <CardsContainer>
        {/* 첫 번째 줄: 좌에서 우로 흐름 */}
        <CardRow>
          {cards.slice(0, 2).map((card, index) => (
            <FlowingCard 
              key={index} 
              direction="left-to-right"
              isSelected={selectedCardIdx === index}
              isAnimating={isAnimating}
              delay={index * 0.5}
              onClick={() => handleCardClick(index, card)}
            >
              <CardInner>
                <CardFront>
                  <CardBackIcon>?</CardBackIcon>
                  <CardBackText>운명의 카드</CardBackText>
                </CardFront>
                <CardBack>
                  <CardNumber>{card.id + 1}</CardNumber>
                  <CardTitle>{card.name}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardBack>
              </CardInner>
            </FlowingCard>
          ))}
        </CardRow>
        
        {/* 두 번째 줄: 우에서 좌로 흐름 */}
        <CardRow>
          {cards.slice(2, 4).map((card, index) => (
            <FlowingCard 
              key={index + 2} 
              direction="right-to-left"
              isSelected={selectedCardIdx === index + 2}
              isAnimating={isAnimating}
              delay={index * 0.5}
              onClick={() => handleCardClick(index + 2, card)}
            >
              <CardInner>
                <CardFront>
                  <CardBackIcon>?</CardBackIcon>
                  <CardBackText>운명의 카드</CardBackText>
                </CardFront>
                <CardBack>
                  <CardNumber>{card.id + 1}</CardNumber>
                  <CardTitle>{card.name}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardBack>
              </CardInner>
            </FlowingCard>
          ))}
        </CardRow>
      </CardsContainer>
      
      {selectedCard && (
        <SelectedCardDisplay>
          <SelectedCardTitle>선택된 카드: {selectedCard.name}</SelectedCardTitle>
          <SelectedCardMeaning>{selectedCard.meaning}</SelectedCardMeaning>
          <AutoProgressText>잠시 후 자동으로 다음 단계로 진행됩니다...</AutoProgressText>
        </SelectedCardDisplay>
      )}
    </Container>
  );
};

// 애니메이션 키프레임
const flowLeftToRight = keyframes`
  0% {
    transform: translateX(-100vw);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const flowRightToLeft = keyframes`
  0% {
    transform: translateX(100vw);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const gentleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(1deg);
  }
  50% {
    transform: translateY(-3px) rotate(0deg);
  }
  75% {
    transform: translateY(-7px) rotate(-1deg);
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
  background-color: transparent;
  border-radius: 12px;
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
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
  line-height: 1.6;
`;
Description.displayName = 'TarotSelection_Description';

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
  height: 400px;
`;
CardsContainer.displayName = 'TarotSelection_CardsContainer';

const CardRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  height: 180px;
`;
CardRow.displayName = 'TarotSelection_CardRow';

const FlowingCard = styled.div<{ 
  direction: 'left-to-right' | 'right-to-left';
  isSelected: boolean;
  isAnimating: boolean;
  delay: number;
}>`
  width: 120px;
  height: 160px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  opacity: 0;
  
  ${props => props.isSelected && `
    transform: scale(1.2) !important;
    z-index: 10;
    animation: none !important;
    opacity: 1 !important;
  `}
  
  ${props => props.isAnimating && `
    animation: ${props.direction === 'left-to-right' ? flowLeftToRight : flowRightToLeft} 
               1.5s ease-out forwards;
    animation-delay: ${props.delay}s;
  `}
  
  ${props => !props.isAnimating && !props.isSelected && `
    opacity: 1;
    animation: ${gentleFloat} 3s ease-in-out infinite;
    animation-delay: ${props.delay * 0.5}s;
  `}
  
  &:hover {
    transform: ${props => !props.isSelected ? 'scale(1.05)' : 'scale(1.2)'};
  }
  
  @media (min-width: 768px) {
    width: 140px;
    height: 187px;
  }
`;
FlowingCard.displayName = 'TarotSelection_FlowingCard';

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transform-style: preserve-3d;
`;
CardInner.displayName = 'TarotSelection_CardInner';

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  background: linear-gradient(135deg, #4a1551 0%, #2d3748 100%);
`;
CardFront.displayName = 'TarotSelection_CardFront';

const CardBackIcon = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;
CardBackIcon.displayName = 'TarotSelection_CardBackIcon';

const CardBackText = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;
CardBackText.displayName = 'TarotSelection_CardBackText';

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: rotateY(180deg);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  background: linear-gradient(135deg, #4a1551 0%, #6b46c1 100%);
  color: white;
  
  @media (min-width: 768px) {
    padding: 1rem;
  }
`;
CardBack.displayName = 'TarotSelection_CardBack';

const CardNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin: 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  @media (min-width: 768px) {
    font-size: 4rem;
    margin: 1rem 0;
  }
`;
CardNumber.displayName = 'TarotSelection_CardNumber';

const CardTitle = styled.h3`
  margin: 0.2rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 1rem;
    margin: 0.5rem 0;
  }
`;
CardTitle.displayName = 'TarotSelection_CardTitle';

const CardDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.6rem;
  line-height: 1.3;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
    line-height: 1.4;
  }
`;
CardDescription.displayName = 'TarotSelection_CardDescription';

const SelectedCardDisplay = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: rgba(74, 21, 81, 0.3);
  border-radius: 8px;
  border-left: 4px solid #9f7aea;
  color: white;
  text-align: center;
`;
SelectedCardDisplay.displayName = 'TarotSelection_SelectedCardDisplay';

const SelectedCardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
`;
SelectedCardTitle.displayName = 'TarotSelection_SelectedCardTitle';

const SelectedCardMeaning = styled.p`
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
`;
SelectedCardMeaning.displayName = 'TarotSelection_SelectedCardMeaning';

const AutoProgressText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
`;
AutoProgressText.displayName = 'TarotSelection_AutoProgressText';

export default TarotSelection; 