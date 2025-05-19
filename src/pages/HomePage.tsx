import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartFortune = () => {
    navigate('/fortune');
  };

  const handleStartFaceReading = () => {
    navigate('/facereading');
  };

  return (
    <Container>
      <Header>
        <Title>행운을 찾는 당신에게</Title>
        <Subtitle>사주와 타로, 관상으로 보는 나만의 운세</Subtitle>
      </Header>

      <MainContent>
        <ServiceCard onClick={handleStartFortune}>
          <CardIcon>🔮</CardIcon>
          <CardTitle>나의 운세 확인하기</CardTitle>
          <CardDescription>
            사주와 타로카드를 통해 오늘의 운세, 연애운, 재물운, 건강운을 확인해보세요.
          </CardDescription>
          <CardButton>운세 보러가기</CardButton>
        </ServiceCard>

        <ServiceCard onClick={handleStartFaceReading}>
          <CardIcon>📷</CardIcon>
          <CardTitle>관상으로 보는 나의 미래</CardTitle>
          <CardDescription>
            얼굴 사진을 분석하여 성격, 운세, 적성 등을 알아보세요. (프리미엄 전용)
          </CardDescription>
          <CardButton>관상 보러가기</CardButton>
        </ServiceCard>
        
        <InfoSection>
          <InfoTitle>AI 기반 운세 서비스</InfoTitle>
          <InfoText>
            최신 AI 기술을 활용하여 당신의 사주와 타로 카드, 그리고 얼굴 특성을 분석하여 
            맞춤형 운세를 제공합니다. 지금 바로 시작해보세요!
          </InfoText>
        </InfoSection>
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #718096;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ServiceCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const CardDescription = styled.p`
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const CardButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #6b46c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: auto;
  
  &:hover {
    background-color: #553c9a;
  }
`;

const InfoSection = styled.div`
  grid-column: 1 / -1;
  background-color: #f7fafc;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1rem;
  border-left: 4px solid #6b46c1;
`;

const InfoTitle = styled.h3`
  font-size: 1.3rem;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  color: #4a5568;
  line-height: 1.6;
`;

export default HomePage; 