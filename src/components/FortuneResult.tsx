import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { FortuneResult as FortuneResultType, TarotCard } from '../types';
import ReactMarkdown from 'react-markdown';

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
  // 마크다운 형식으로 변환한 결과
  const [markdownContent, setMarkdownContent] = useState<string>("");
  
  useEffect(() => {
    // API에서 받은 텍스트를 그대로 사용
    setMarkdownContent(result.overall);
  }, [result]);

  // 클립보드에 복사 함수 - 관상보기와 동일한 방식으로 변경
  const copyToClipboard = async () => {
    if (!markdownContent) return;
    
    try {
      // 마크다운 원본 내용에 홍보 문구 추가
      const shareText = `${markdownContent}\n\n------------------\n\n당신의 운명이 궁금하다면? 아이보살이 도와드립니다 💫\n⭐ kingface.difflabs.xyz ⭐`;
      
      await navigator.clipboard.writeText(shareText);
      alert('운세 결과가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  // 현재 날짜 포맷팅
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container>
      <ResultHeader>
        <Title>아이보살의 사주 풀이</Title>
        <SubTitle>{currentDate} 기준</SubTitle>
      </ResultHeader>

      <OriginalContent>
        {/* 타로 카드 이미지 표시 - 관상보기의 사용자 이미지와 유사하게 */}
        {selectedCard && (
          <UserImageContainer>
            <CenteredCardImage src={selectedCard.image} alt={selectedCard.name} />
            <CardName>{selectedCard.name}</CardName>
            <CardMeaning>{selectedCard.meaning}</CardMeaning>
          </UserImageContainer>
        )}

        {/* 아이보살 사주 분석 결과 제목 */}
        <ResultTitle>아이보살의 사주 분석 결과</ResultTitle>
        
        {/* 마크다운 결과 표시 */}
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </OriginalContent>

      <Disclaimer>
        * 이 운세는 AI에 의해 생성된 것으로, 참고용으로만 활용해주세요.
      </Disclaimer>

      <ButtonContainer>
        <ActionButton onClick={onRestart} color="#4a5568">
          <ButtonIcon>🔄</ButtonIcon>
          다시 시작하기
        </ActionButton>
        <ActionButton onClick={copyToClipboard} color="#6b46c1">
          <ButtonIcon>📋</ButtonIcon>
          결과 복사하기
        </ActionButton>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
  
  @media (max-width: 768px) {
    border-radius: 0;
    box-shadow: none;
    margin: 0;
    width: 100%;
  }
`;
Container.displayName = 'FortuneResult_Container';

const ResultHeader = styled.div`
  background: linear-gradient(135deg, #6b46c1 0%, #9f7aea 100%);
  padding: 2rem;
  color: white;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;
ResultHeader.displayName = 'FortuneResult_Header';

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 1.7rem;
  }
`;
Title.displayName = 'FortuneResult_Title';

const SubTitle = styled.p`
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;
SubTitle.displayName = 'FortuneResult_SubTitle';

// 사용자 이미지 컨테이너 스타일 - 관상보기와 동일한 형식
const UserImageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;
UserImageContainer.displayName = 'FortuneResult_UserImageContainer';

const CenteredCardImage = styled.img`
  width: 180px;
  height: auto;
  aspect-ratio: 3/5;
  object-fit: cover;
  border-radius: 12px;
  border: 4px solid #6b46c1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    width: 140px;
  }
`;
CenteredCardImage.displayName = 'FortuneResult_CenteredCardImage';

const CardName = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 5px rgba(107, 70, 193, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;
CardName.displayName = 'FortuneResult_CardName';

const CardMeaning = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  max-width: 80%;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;
CardMeaning.displayName = 'FortuneResult_CardMeaning';

// 아이보살 결과 제목 스타일
const ResultTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #e9d8fd;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(233, 216, 253, 0.3);
  text-shadow: 0 0 15px rgba(107, 70, 193, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;
ResultTitle.displayName = 'FortuneResult_ResultTitle';

const OriginalContent = styled.div`
  background-color: #4a1551;
  background: linear-gradient(135deg, #4a1551 0%, #2d3748 100%);
  padding: 2rem;
  margin: 0 2rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  color: rgba(255, 255, 255, 0.9);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 0 1rem 1.5rem;
  }
  
  h2 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(107, 70, 193, 0.5);
    
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
  
  h3 {
    color: #e9d8fd;
    font-size: 1.2rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    text-shadow: 0 0 5px rgba(107, 70, 193, 0.3);
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
  
  p {
    margin-bottom: 1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    
    @media (max-width: 768px) {
      font-size: 0.95rem;
    }
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    
    @media (max-width: 768px) {
      padding-left: 1.2rem;
    }
  }
  
  li {
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      font-size: 0.95rem;
      margin-bottom: 0.4rem;
    }
  }
  
  strong {
    color: #e9d8fd;
    font-weight: bold;
  }
  
  em {
    color: #c3dafe;
    font-style: italic;
  }
  
  a {
    color: #90cdf4;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    color: #e9d8fd;
  }
  
  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.2);
    padding-left: 1rem;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
  }
`;
OriginalContent.displayName = 'FortuneResult_OriginalContent';

const Disclaimer = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin: 0;
  padding: 1rem 2rem 2rem;
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem 1rem 1.5rem;
  }
`;
Disclaimer.displayName = 'FortuneResult_Disclaimer';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;
ButtonContainer.displayName = 'FortuneResult_ButtonContainer';

const ButtonIcon = styled.span`
  margin-right: 0.5rem;
`;
ButtonIcon.displayName = 'FortuneResult_ButtonIcon';

const ActionButton = styled.button<{ color: string }>`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.color === '#6b46c1' ? '#6b46c1' : 'rgba(74, 21, 81, 0.3)'};
  color: ${props => props.color === '#6b46c1' ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.color === '#6b46c1' ? props.color : 'rgba(107, 70, 193, 0.5)'};
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.color === '#6b46c1' ? '#553c9a' : 'rgba(107, 70, 193, 0.7)'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;
ActionButton.displayName = 'FortuneResult_ActionButton';

export default FortuneResult; 