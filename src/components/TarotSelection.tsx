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
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // 랜덤 타로 카드 3장 가져오기
    setCards(getRandomTarotCards());
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
    setFlippedCards([false, false, false]);
    setSelectedCardIdx(null);
    setShowConfirm(false);
    setCards(getRandomTarotCards());
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
  padding: 2rem 1rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.5rem;
    box-shadow: none;
    border-radius: 0;
    background-color: transparent;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #666;
`;

const Title = styled.h2`
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Description = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
    overflow-x: auto;
    padding: 0.5rem 0;
    width: 100%;
    justify-content: flex-start;
  }
`;

const Card = styled.div<{ isFlipped: boolean; isSelected: boolean }>`
  width: 240px;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
  transform: ${props => props.isSelected ? 'translateY(-20px)' : 'none'};
  
  &:hover {
    transform: ${props => props.isFlipped ? 'none' : 'translateY(-10px)'};
  }
  
  @media (max-width: 768px) {
    width: 120px;
    height: 200px;
    flex-shrink: 0;
    transform: ${props => props.isSelected ? 'scale(1.1)' : 'none'};
    
    &:hover {
      transform: ${props => props.isFlipped ? 'none' : 'scale(1.05)'};
    }
  }
`;

const CardInner = styled.div<{ isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background-color: #2c1b5a;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  background: linear-gradient(135deg, #4a1551 0%, #2d3748 100%);
  
  @media (max-width: 768px) {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const CardBackIcon = styled.div`
  font-size: 5rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }
`;

const CardBackText = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
`;

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: rotateY(180deg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  background: linear-gradient(135deg, #f9f5ff 0%, #e9d8fd 100%);
  
  @media (max-width: 768px) {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
  }
`;

const CardNumber = styled.div`
  font-size: 8rem;
  font-weight: bold;
  color: #553c9a;
  text-align: center;
  margin: 2rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 4rem;
    margin: 1rem 0;
  }
`;

const CardTitle = styled.h3`
  margin: 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin: 0.2rem 0;
  }
`;

const CardDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    line-height: 1.3;
  }
`;

const SelectedCardInfo = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: #f9f5ff;
  border-radius: 8px;
  border-left: 4px solid #6b46c1;
`;

const SelectedCardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #4a5568;
  font-size: 1.2rem;
`;

const SelectedCardMeaning = styled.p`
  margin: 0;
  color: #718096;
  font-size: 1rem;
  line-height: 1.6;
`;

const NoneSelectedText = styled.p`
  color: #718096;
  font-style: italic;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #e2e8f0;
  color: #4a5568;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #cbd5e0;
  }
  
  @media (max-width: 768px) {
    width: 80%;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
`;

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
    background-color: #553c9a;
  }
  
  @media (max-width: 768px) {
    width: 80%;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
`;

export default TarotSelection; 