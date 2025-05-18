import React from 'react';
import styled from '@emotion/styled';
import { FortuneResult as FortuneResultType, TarotCard } from '../types';

interface FortuneResultProps {
  result: FortuneResultType;
  selectedCard: TarotCard | null;
  onRestart: () => void;
}

const FortuneResult: React.FC<FortuneResultProps> = ({ 
  result, 
  selectedCard, 
  onRestart 
}) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '나의 오늘의 운세',
        text: `오늘의 운세: ${result.overall.substring(0, 100)}...`,
        url: window.location.href,
      }).catch(error => console.log('공유하기 실패:', error));
    } else {
      alert('공유하기 기능을 지원하지 않는 브라우저입니다.');
    }
  };

  return (
    <Container>
      <Title>오늘의 운세</Title>

      {selectedCard && (
        <CardSection>
          <SectionTitle>선택한 타로 카드</SectionTitle>
          <CardDisplay>
            <img 
              src={selectedCard.image} 
              alt={selectedCard.name}
              style={{
                width: '150px',
                height: 'auto',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}
            />
            <CardInfo>
              <CardName>{selectedCard.name}</CardName>
              <CardMeaning>{selectedCard.meaning}</CardMeaning>
              <CardDescription>{selectedCard.description}</CardDescription>
            </CardInfo>
          </CardDisplay>
        </CardSection>
      )}

      <ResultSection>
        <SectionTitle>전체 운세</SectionTitle>
        <ResultText>{result.overall}</ResultText>
      </ResultSection>

      <ResultSection>
        <SectionTitle>사랑</SectionTitle>
        <ResultText>{result.love}</ResultText>
      </ResultSection>

      <ResultSection>
        <SectionTitle>직업</SectionTitle>
        <ResultText>{result.career}</ResultText>
      </ResultSection>

      <ResultSection>
        <SectionTitle>건강</SectionTitle>
        <ResultText>{result.health}</ResultText>
      </ResultSection>

      <ResultSection>
        <SectionTitle>조언</SectionTitle>
        <ResultText>{result.advice}</ResultText>
      </ResultSection>

      <Disclaimer>
        * 이 운세는 AI에 의해 생성된 것으로, 참고용으로만 활용해주세요.
      </Disclaimer>

      <ButtonContainer>
        <ActionButton primary onClick={onRestart}>다시 시작하기</ActionButton>
        <ActionButton onClick={handleShare}>공유하기</ActionButton>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CardSection = styled.div`
  margin-bottom: 2.5rem;
`;

const CardDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardName = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const CardMeaning = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: #6b46c1;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
`;

const ResultSection = styled.div`
  margin-bottom: 2rem;
`;

const ResultText = styled.p`
  font-size: 1.1rem;
  color: #2d3748;
  line-height: 1.7;
  white-space: pre-wrap;
`;

const Disclaimer = styled.p`
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
  text-align: center;
  margin: 2rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  background-color: ${props => props.primary ? '#6b46c1' : 'white'};
  color: ${props => props.primary ? 'white' : '#6b46c1'};
  border: ${props => props.primary ? 'none' : '1px solid #6b46c1'};
  
  &:hover {
    background-color: ${props => props.primary ? '#553c9a' : '#f8f4ff'};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default FortuneResult; 