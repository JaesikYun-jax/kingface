import React from 'react';
import styled from '@emotion/styled';
import { TarotCard } from '../types';

interface TarotCardSelectorProps {
  cards: TarotCard[];
  onSelect: (card: TarotCard) => void;
}

const TarotCardSelector: React.FC<TarotCardSelectorProps> = ({ cards, onSelect }) => {
  return (
    <Container>
      {cards.map((card) => (
        <CardContainer key={card.id} onClick={() => onSelect(card)}>
          <Card>
            <img 
              src={card.image} 
              alt={card.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s'
              }}
            />
            <CardOverlay>
              <CardName>{card.name}</CardName>
            </CardOverlay>
          </Card>
          <CardDescription>{card.meaning}</CardDescription>
        </CardContainer>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const CardContainer = styled.div`
  width: 200px;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-10px);
  }
  
  @media (max-width: 768px) {
    width: 150px;
  }
`;

const Card = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  aspect-ratio: 3/5;
  margin-bottom: 1rem;
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 1rem;
  transition: opacity 0.3s;
`;

const CardName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const CardDescription = styled.div`
  color: #4a5568;
  font-size: 0.9rem;
  text-align: center;
`;

export default TarotCardSelector; 