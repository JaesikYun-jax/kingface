import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

// 로테이션할 이모지 배열
const fortuneEmojis = ['🔮', '✨', '🌙', '🌠', '💫', '🪄'];
const faceEmojis = ['👁️', '🧿', '🪬', '🧙', '⚡', '🌟'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [fortuneEmoji, setFortuneEmoji] = useState(fortuneEmojis[0]);
  const [faceEmoji, setFaceEmoji] = useState(faceEmojis[0]);

  useEffect(() => {
    // 운세 이모지 로테이션
    const fortuneInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * fortuneEmojis.length);
      setFortuneEmoji(fortuneEmojis[randomIndex]);
    }, 3000);
    
    // 관상 이모지 로테이션
    const faceInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * faceEmojis.length);
      setFaceEmoji(faceEmojis[randomIndex]);
    }, 3500);
    
    return () => {
      clearInterval(fortuneInterval);
      clearInterval(faceInterval);
    };
  }, []);

  const handleStartFortune = () => {
    navigate('/fortune');
  };

  const handleStartFaceReading = () => {
    navigate('/facereading');
  };

  return (
    <Container>
      <Header>
        <Sparkles>✨✨✨</Sparkles>
        <Title>아이(AI)보살 운세</Title>
        <Subtitle>인공지능으로 살펴보는 당신의 운명과 인연</Subtitle>
      </Header>

      <MainContent>
        <ServiceCard onClick={handleStartFortune}>
          <CardIcon>{fortuneEmoji}</CardIcon>
          <CardTitle>오늘의 사주 운세</CardTitle>
          <CardDescription>
            전통 사주와 타로의 지혜로 살펴보는 당신의 오늘 운세와 인연의 흐름
          </CardDescription>
          <CardButton>사주 보기</CardButton>
        </ServiceCard>

        <ServiceCard onClick={handleStartFaceReading}>
          <CardIcon>{faceEmoji}</CardIcon>
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
          <MysticText>천년의 지혜를 담은 신비로운 경험을 시작해보세요 ✨</MysticText>
        </InfoSection>
      </MainContent>
    </Container>
  );
};

const Sparkles = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: sparkle 3s infinite;
  
  @keyframes sparkle {
    0% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0.3; transform: scale(0.8); }
  }
`;

const MysticText = styled.p`
  font-size: 1.1rem;
  color: #e9d8fd;
  margin-top: 1.5rem;
  font-style: italic;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 15px rgba(233, 216, 253, 0.7);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  
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
  background-color: rgba(26, 32, 44, 0.8);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(156, 139, 218, 0.3);
    background-color: rgba(34, 41, 57, 0.9);
  }
`;

const CardIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: pulse 4s infinite ease-in-out;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const CardButton = styled.button`
  padding: 0.8rem 1.8rem;
  background-color: rgba(107, 70, 193, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: auto;
  backdrop-filter: blur(5px);
  
  &:hover {
    background-color: rgba(85, 60, 154, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(85, 60, 154, 0.4);
  }
`;

const InfoSection = styled.div`
  grid-column: 1 / -1;
  background-color: rgba(26, 32, 44, 0.7);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1rem;
  border-left: 4px solid rgba(107, 70, 193, 0.7);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const InfoTitle = styled.h3`
  font-size: 1.4rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
`;

const InfoText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
`;

export default HomePage; 