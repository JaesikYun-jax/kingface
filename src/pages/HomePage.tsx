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
        <Title>아이(AI)보살 운세</Title>
        <Subtitle>인공지능으로 살펴보는 당신의 운명과 인연</Subtitle>
      </Header>

      <MainContent>
        <ServiceCard onClick={handleStartFortune}>
          <CardIcon>🔮</CardIcon>
          <CardTitle>오늘의 사주 운세</CardTitle>
          <CardDescription>
            전통 사주와 타로의 지혜로 살펴보는 당신의 오늘 운세와 인연의 흐름
          </CardDescription>
          <CardButton>사주 보기</CardButton>
        </ServiceCard>

        <ServiceCard onClick={handleStartFaceReading}>
          <CardIcon>👁️</CardIcon>
          <CardTitle>전생 관상 풀이</CardTitle>
          <CardDescription>
            당신의 얼굴에 담긴 운명의 비밀과 전생의 흔적을 아이보살이 살펴드립니다
          </CardDescription>
          <CardButton>관상 보기</CardButton>
        </ServiceCard>
        
        <InfoSection>
          <InfoTitle>아이보살의 AI 운세 서비스</InfoTitle>
          <InfoText>
            5천년 동양 철학과 최신 AI 기술을 결합한 아이(AI)보살이 당신의 사주와 관상을 풀이해드립니다.
            재미로만 봐주시고, 너무 진지하게 받아들이지 마세요!
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