import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { TarotCard } from '../types';
import { getRandomTarotCards } from '../services/api';

interface TarotSelectionProps {
  onCardSelect: (card: TarotCard) => void;
}

const TarotSelection: React.FC<TarotSelectionProps> = ({ onCardSelect }) => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false, false]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // 랜덤 타로 카드 4장 가져오기
    const randomCards = getRandomTarotCards();
    // 4장만 사용
    setCards(randomCards.slice(0, 4));
  }, []);

  const handleCardClick = (index: number) => {
    // 아직 뒤집히지 않은 카드만 선택 가능
    if (!flippedCards[index]) {
      const newFlippedCards = [...flippedCards];
      newFlippedCards[index] = true;
      setFlippedCards(newFlippedCards);
      setSelectedCardIdx(index);
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    if (selectedCardIdx !== null) {
      onCardSelect(cards[selectedCardIdx]);
    }
  };

  const handleReset = () => {
    setFlippedCards([false, false, false, false]);
    setSelectedCardIdx(null);
    setShowConfirm(false);
    const randomCards = getRandomTarotCards();
    setCards(randomCards.slice(0, 4));
  };

  if (cards.length === 0) {
    return <LoadingContainer>카드를 준비 중입니다...</LoadingContainer>;
  }

  return (
    <Container>
      <Title>타로 카드를 한 장 선택하세요</Title>
      <Description>
        직관에 따라 끌리는 카드를 골라보세요. 타로 카드는 당신의 운세와 결합하여
        더 깊은 통찰력을 제공합니다.
      </Description>
      
      <CardsContainer>
        {cards.map((card, index) => (
          <Card 
            key={index} 
            isFlipped={flippedCards[index]} 
            isSelected={selectedCardIdx === index}
            onClick={() => handleCardClick(index)}
          >
            <CardInner isFlipped={flippedCards[index]}>
              <CardFront>
                {/* 뒷면에는 물음표 아이콘 표시 */}
                <CardBackIcon>?</CardBackIcon>
                <CardBackText>운명의 카드</CardBackText>
              </CardFront>
              <CardBack>
                {/* 타로 카드 숫자 크게 표시 */}
                <CardNumber>{card.id + 1}</CardNumber>
                <CardTitle>{card.name}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardBack>
            </CardInner>
          </Card>
        ))}
      </CardsContainer>
      
      <SelectedCardInfo>
        {selectedCardIdx !== null && flippedCards[selectedCardIdx] ? (
          <>
            <SelectedCardTitle>
              선택된 카드: {cards[selectedCardIdx].name} ({cards[selectedCardIdx].id + 1}번)
            </SelectedCardTitle>
            <SelectedCardMeaning>
              {cards[selectedCardIdx].meaning}
            </SelectedCardMeaning>
          </>
        ) : (
          <NoneSelectedText>
            카드를 선택해주세요
          </NoneSelectedText>
        )}
      </SelectedCardInfo>
      
      <ButtonContainer>
        <Button onClick={handleReset}>카드 재설정</Button>
        <ConfirmButton onClick={handleConfirm} disabled={selectedCardIdx === null}>
          선택 확인
        </ConfirmButton>
      </ButtonContainer>
    </Container>
  );
};

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
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
`;
Description.displayName = 'TarotSelection_Description';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-items: center;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
`;
CardsContainer.displayName = 'TarotSelection_CardsContainer';

const Card = styled.div<{ isFlipped: boolean; isSelected: boolean }>`
  width: 120px;
  height: 160px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
  transform: ${props => props.isSelected ? 'translateY(-10px)' : 'none'};
  
  &:hover {
    transform: ${props => props.isFlipped ? 'none' : 'translateY(-5px)'};
  }
  
  @media (min-width: 768px) {
    width: 140px;
    height: 187px;
    transform: ${props => props.isSelected ? 'translateY(-20px)' : 'none'};
  }
`;
Card.displayName = 'TarotSelection_Card';

const CardInner = styled.div<{ isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
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

const SelectedCardInfo = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: rgba(74, 21, 81, 0.3);
  border-radius: 8px;
  border-left: 4px solid #9f7aea;
  color: white;
`;
SelectedCardInfo.displayName = 'TarotSelection_SelectedCardInfo';

const SelectedCardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
`;
SelectedCardTitle.displayName = 'TarotSelection_SelectedCardTitle';

const SelectedCardMeaning = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
`;
SelectedCardMeaning.displayName = 'TarotSelection_SelectedCardMeaning';

const NoneSelectedText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  text-align: center;
`;
NoneSelectedText.displayName = 'TarotSelection_NoneSelectedText';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;
ButtonContainer.displayName = 'TarotSelection_ButtonContainer';

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 80%;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
`;
Button.displayName = 'TarotSelection_Button';

const ConfirmButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #6b46c1;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #9f7aea;
  }
  
  @media (max-width: 768px) {
    width: 80%;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
`;
ConfirmButton.displayName = 'TarotSelection_ConfirmButton';

export default TarotSelection; 