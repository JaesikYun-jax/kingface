import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

// 로테이션할 이모지 배열
const fortuneEmojis = ['🔮', '✨', '🌙', '🌠', '💫', '🪄'];
const faceEmojis = ['👁️', '🧿', '🪬', '🧙', '⚡', '🌟'];

// 글로잉 애니메이션 추가
const glowingAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(173, 216, 230, 0.2), 0 0 10px rgba(173, 216, 230, 0.2); }
  50% { box-shadow: 0 0 15px rgba(173, 216, 230, 0.5), 0 0 25px rgba(173, 216, 230, 0.5); }
  100% { box-shadow: 0 0 5px rgba(173, 216, 230, 0.2), 0 0 10px rgba(173, 216, 230, 0.2); }
`;

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
        </ServiceCard>

        <ServiceCard onClick={handleStartFaceReading}>
          <CardIcon>{faceEmoji}</CardIcon>
          <CardTitle>전생 관상 풀이</CardTitle>
          <CardDescription>
            당신의 얼굴에 담긴 운명의 비밀과 전생의 흔적을 아이보살이 살펴드립니다
          </CardDescription>
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
Sparkles.displayName = 'HomePage_Sparkles';

const MysticText = styled.p`
  font-size: 1.1rem;
  color: #e9d8fd;
  margin-top: 1.5rem;
  font-style: italic;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
`;
MysticText.displayName = 'HomePage_MysticText';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;
Container.displayName = 'HomePage_Container';

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;
Header.displayName = 'HomePage_Header';

const Title = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 15px rgba(233, 216, 253, 0.7);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;
Title.displayName = 'HomePage_Title';

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;
Subtitle.displayName = 'HomePage_Subtitle';

const MainContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;
MainContent.displayName = 'HomePage_MainContent';

const ServiceCard = styled.div`
  background-color: rgba(26, 32, 44, 0.8);
  border-radius: 16px;
  overflow: hidden;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out, background-color 0.35s ease-out;
  cursor: pointer;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);

  box-shadow: 0 0 8px rgba(173, 216, 230, 0.2), 
              0 0 12px rgba(173, 216, 230, 0.15), 
              0 4px 15px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-8px) scale(1.03);
    background-color: rgba(34, 41, 57, 0.95);
    box-shadow: 0 0 15px rgba(196, 160, 250, 0.5), 
                0 0 25px rgba(196, 160, 250, 0.4), 
                0 0 35px rgba(196, 160, 250, 0.3), 
                0 8px 30px rgba(156, 139, 218, 0.4);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
    &:hover {
        transform: translateY(-5px) scale(1.02);
    }
  }
`;
ServiceCard.displayName = 'HomePage_ServiceCard';

const CardIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: pulse 4s infinite ease-in-out;
  color: #e9d8fd;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
  }

  @media (max-width: 768px) {
    font-size: 2.8rem;
    margin-bottom: 0.75rem;
  }
`;
CardIcon.displayName = 'HomePage_CardIcon';

const CardTitle = styled.h2`
  font-size: 1.4rem;
  color: #fff;
  margin-bottom: 0.75rem;
  font-weight: 600;
  text-shadow: 0 0 12px rgba(233, 216, 253, 0.6);

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
`;
CardTitle.displayName = 'HomePage_CardTitle';

const CardDescription = styled.p`
  color: rgba(220, 220, 240, 0.85);
  line-height: 1.55;
  margin-bottom: 0;
  font-size: 0.9rem;
  flex-grow: 1;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: calc(1.5em * 3);
  }
`;
CardDescription.displayName = 'HomePage_CardDescription';

const InfoSection = styled.div`
  grid-column: 1 / -1;
  background-color: rgba(26, 32, 44, 0.7);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1rem;
  border-left: 4px solid rgba(107, 70, 193, 0.7);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-top: 0.5rem;
  }
`;
InfoSection.displayName = 'HomePage_InfoSection';

const InfoTitle = styled.h3`
  font-size: 1.4rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }
`;
InfoTitle.displayName = 'HomePage_InfoTitle';

const InfoText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.55;
  }
`;
InfoText.displayName = 'HomePage_InfoText';

export default HomePage; 