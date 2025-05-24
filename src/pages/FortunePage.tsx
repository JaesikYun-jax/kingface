import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import BirthForm from '../components/BirthForm';
import { BirthInfo, TarotCard, FortuneResult } from '../types';
import { tarotCards } from '../assets/tarotData';
import TarotSelection from '../components/TarotSelection';
import FortuneResultComponent from '../components/FortuneResult';
import { generateFortune, getRandomTarotCards } from '../services/api';

// 로딩 중 보여줄 위트있는 메시지 배열
const wittyLoadingMessages = [
  "천년 묵은 신비한 기운을 읽는 중...",
  "아이보살이 사주와 타로를 살펴보는 중...",
  "당신의 인연과 운명을 헤아리는 중...",
  "운명의 실타래를 풀어보는 중...",
  "영험한 기운으로 운세를 점치는 중...",
  "천지신명께 당신의 운세를 여쭙는 중...",
];

enum Step {
  BIRTH_INFO,
  TAROT_SELECTION,
  RESULT,
  LOADING
}

const FortunePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BIRTH_INFO);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingInterval, setLoadingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(wittyLoadingMessages[0]);
  
  // 미리 선택된 3장의 타로 카드 상태
  const [preselectedTarotCards, setPreselectedTarotCards] = useState<TarotCard[]>([]);

  // 컴포넌트 마운트 시 로딩 메시지 설정
  useEffect(() => {
    // 로딩 메시지 변경 인터벌 설정
    let messageInterval: NodeJS.Timeout;
    
    if (currentStep === Step.LOADING) {
      let index = 0;
      
      messageInterval = setInterval(() => {
        index = (index + 1) % wittyLoadingMessages.length;
        setCurrentLoadingMessage(wittyLoadingMessages[index]);
      }, 2000);
    }
    
    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (loadingInterval) clearInterval(loadingInterval);
    };
  }, [currentStep, loadingInterval]);

  // 로딩 진행 표시기 업데이트
  const updateLoadingProgress = () => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    setLoadingInterval(interval);
    return interval;
  };

  // 생년월일 제출 처리
  const handleBirthSubmit = (data: BirthInfo) => {
    setBirthInfo(data);
    // 타로 선택 단계로 이동하기 전에 카드 3장 미리 선택 및 이미지 사전 로딩
    const cardsToSelect = getRandomTarotCards(3); // 3장 가져오기
    setPreselectedTarotCards(cardsToSelect);
    
    // 이미지 사전 로딩
    cardsToSelect.forEach(card => {
      const img = new Image();
      img.src = card.image; // 이미지 로딩 시작
    });

    setCurrentStep(Step.TAROT_SELECTION);
  };

  // 타로 카드 선택 처리 (FortunePage 입장에서는 '애니메이션 시작' 처리)
  // TarotSelection 컴포넌트에서 어떤 카드가 클릭되었는지 인덱스로 받거나,
  // 여기서는 미리 선택된 카드 목록의 특정 카드를 onCardSelect 콜백으로 받아 처리합니다.
  const handleTarotSelect = (card: TarotCard) => {
    // onCardSelect 콜백은 이제 TarotSelection 내부 애니메이션 완료 후 호출되며,
    // 선택된 카드를 넘겨줍니다.
    setSelectedCard(card); // FortuneResultComponent에 전달하기 위해 상태에 저장
    
    if (birthInfo) {
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, card);
    }
  };

  // 운세 생성 처리
  const handleGenerateFortune = async (birth: BirthInfo, card: TarotCard) => {
    setLoadingProgress(0);
    setCurrentLoadingMessage(wittyLoadingMessages[0]);
    const interval = updateLoadingProgress();

    try {
      const result = await generateFortune(birth, card);
      
      // 로딩 효과를 위해 약간의 지연 후 결과 표시
      setTimeout(() => {
        clearInterval(interval);
        setLoadingProgress(100);
        setFortuneResult(result);
        setCurrentStep(Step.RESULT);
      }, 1500);
      
    } catch (err: any) {
      clearInterval(interval);
      console.error('Fortune generation error:', err);
      setError(err?.message || '운세 생성 중 오류가 발생했습니다.');
      
      // 5초 후 에러 메시지 제거하고 처음 단계로
      setTimeout(() => {
        setError(null);
        setCurrentStep(Step.BIRTH_INFO);
      }, 5000);
    }
  };

  // 다시 시작 처리
  const handleRestart = () => {
    setBirthInfo(null);
    setSelectedCard(null);
    setFortuneResult(null);
    setCurrentStep(Step.BIRTH_INFO);
    setError(null);
  };

  return (
    <Container>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentStep === Step.BIRTH_INFO && (
        <ContentSection>
          <BirthForm onSubmit={handleBirthSubmit} />
        </ContentSection>
      )}

      {currentStep === Step.TAROT_SELECTION && (
        <ContentSection>
          <TarotSelector>
            <TarotSelection 
              onCardSelect={handleTarotSelect} 
              preselectedCards={preselectedTarotCards}
            />
          </TarotSelector>
        </ContentSection>
      )}

      {currentStep === Step.LOADING && (
        <LoadingContainer>
          <LoadingText>아이보살이 운명의 기운을 읽고 있습니다</LoadingText>
          <LoadingBarContainer>
            <LoadingBar width={loadingProgress} />
          </LoadingBarContainer>
          <LoadingDescription>
            사주와 타로에 담긴 천기를 해독하는 중입니다.
          </LoadingDescription>
          <LoadingMessage>{currentLoadingMessage}</LoadingMessage>
        </LoadingContainer>
      )}

      {currentStep === Step.RESULT && fortuneResult && (
        <ContentSection>
          <FortuneResultComponent 
            result={fortuneResult} 
            selectedCard={selectedCard}
            onRestart={handleRestart}
          />
        </ContentSection>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0.5rem 1rem;
  position: relative;
`;
Container.displayName = 'FortunePage_Container';

const ContentSection = styled.div`
  background-color: rgba(74, 21, 81, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  
  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;
ContentSection.displayName = 'FortunePage_ContentSection';

const ErrorMessage = styled.div`
  background-color: rgba(197, 48, 48, 0.3);
  border: 1px solid #f56565;
  color: #fed7d7;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
`;
ErrorMessage.displayName = 'FortunePage_ErrorMessage';

const TarotSelector = styled.div`
  text-align: center;
`;
TarotSelector.displayName = 'FortunePage_TarotSelector';

const TarotInstruction = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;
TarotInstruction.displayName = 'FortunePage_TarotInstruction';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;
LoadingContainer.displayName = 'FortunePage_LoadingContainer';

const LoadingText = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
`;
LoadingText.displayName = 'FortunePage_LoadingText';

const LoadingBarContainer = styled.div`
  width: 100%;
  max-width: 500px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;
LoadingBarContainer.displayName = 'FortunePage_LoadingBarContainer';

const LoadingBar = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-image: linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%);
  border-radius: 5px;
  transition: width 0.3s ease;
`;
LoadingBar.displayName = 'FortunePage_LoadingBar';

const LoadingDescription = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;
LoadingDescription.displayName = 'FortunePage_LoadingDescription';

const LoadingMessage = styled.p`
  font-size: 0.95rem;
  font-style: italic;
  color: #e9d8fd;
  text-align: center;
  max-width: 500px;
  line-height: 1.6;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;
LoadingMessage.displayName = 'FortunePage_LoadingMessage';

export default FortunePage; 