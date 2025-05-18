import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import BirthForm from '../components/BirthForm';
import TarotCardSelector from '../components/TarotCardSelector';
import FortuneResult from '../components/FortuneResult';
import FaceCapture from '../components/FaceCapture';
import { BirthInfo, TarotCard, FortuneResult as FortuneResultType, PlanType } from '../types';
import { 
  generateFortune, 
  getRandomTarotCards as getRandomCards,
  getCurrentPlanType,
  isFeatureAvailable,
  analyzeFaceReading
} from '../services/api';
import PlanSelector from '../components/PlanSelector';

// 페이지 상태 정의
enum Step {
  BIRTH_INFO,
  TAROT_SELECTION,
  PLAN_UPGRADE,
  FACE_CAPTURE,
  RESULT,
  LOADING
}

// 로딩 중 보여줄 위트있는 메시지 배열
const wittyLoadingMessages = [
  "천기를 읽는 중...",
  "타로신과 사주신이 토론하는 중...",
  "당신의 운명을 계산하는 중...",
  "별자리의 정렬을 확인하는 중...",
  "우주의 기운을 모으는 중...",
  "과거, 현재, 미래를 연결하는 중...",
  "사주팔자를 해석하는 중...",
  "타로카드에 담긴 비밀을 해독하는 중...",
  "동양 철학과 서양 점성술을 접목하는 중...",
  "운명의 실타래를 풀어가는 중...",
];

const FortunePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BIRTH_INFO);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [tarotCards, setTarotCards] = useState<TarotCard[]>([]);
  const [fortuneResult, setFortuneResult] = useState<FortuneResultType | null>(null);
  const [error, setError] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<PlanType>(PlanType.FREE);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(wittyLoadingMessages[0]);

  // 컴포넌트 마운트 시 타로 카드 로드 및 현재 플랜 확인
  useEffect(() => {
    setTarotCards(getRandomCards());
    setCurrentPlan(getCurrentPlanType());
  }, []);
  
  // 로딩 중 메시지 변경을 위한 효과
  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    
    if (currentStep === Step.LOADING) {
      let index = 0;
      
      // 1초마다 메시지 변경
      messageInterval = setInterval(() => {
        index = (index + 1) % wittyLoadingMessages.length;
        setCurrentLoadingMessage(wittyLoadingMessages[index]);
      }, 1000);
    }
    
    return () => {
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [currentStep]);

  // 로딩 진행 효과를 위한 함수
  const updateLoadingProgress = () => {
    setLoadingProgress(0);
    // 초기 로딩 메시지 설정
    setCurrentLoadingMessage(wittyLoadingMessages[0]);
    
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
    return interval;
  };

  // 사주 정보 제출 처리
  const handleBirthSubmit = (data: BirthInfo) => {
    setBirthInfo(data);
    
    // 타로 카드 기능 가능 여부 확인
    if (isFeatureAvailable('타로 카드 해석')) {
      setCurrentStep(Step.TAROT_SELECTION);
    } else {
      // 무료 플랜이면 바로 결과 생성
      handleGenerateFortune(data, null);
    }
  };

  // 타로 카드 선택 처리
  const handleTarotSelect = (card: TarotCard) => {
    setSelectedCard(card);
    
    const isPremium = getCurrentPlanType() === PlanType.PREMIUM;
    
    if (isPremium && isFeatureAvailable('관상 분석')) {
      // 프리미엄 사용자이고 관상 분석 기능이 있으면 얼굴 촬영 단계로
      setCurrentStep(Step.FACE_CAPTURE);
    } else if (birthInfo) {
      // 아니면 바로 결과 생성
      handleGenerateFortune(birthInfo, card);
    }
  };

  // 플랜 업그레이드 처리
  const handlePlanUpgrade = (planType: PlanType) => {
    setCurrentPlan(planType);
    
    // 타로 카드 기능 가능 여부 다시 확인
    if (isFeatureAvailable('타로 카드 해석')) {
      setCurrentStep(Step.TAROT_SELECTION);
    } else if (birthInfo) {
      // 여전히 무료 플랜이면 그냥 결과 생성
      handleGenerateFortune(birthInfo, null);
    }
  };

  // 얼굴 이미지 촬영 처리
  const handleFaceCapture = async (imageSrc: string) => {
    setFaceImage(imageSrc);
    
    if (birthInfo && selectedCard) {
      handleGenerateFortune(birthInfo, selectedCard, imageSrc);
    }
  };

  // 운세 생성 함수
  const handleGenerateFortune = async (birth: BirthInfo, card: TarotCard | null, faceImg: string | null = null) => {
    setCurrentStep(Step.LOADING);
    setError('');
    
    const loadingInterval = updateLoadingProgress();
    
    try {
      // API 키 확인
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        clearInterval(loadingInterval);
        setError('API 키가 설정되지 않았습니다. .env 파일에 REACT_APP_OPENAI_API_KEY를 추가해주세요.');
        setCurrentStep(Step.BIRTH_INFO);
        return;
      }
      
      // 운세 생성 API 호출
      const result = await generateFortune(birth, card);
      
      // 사용자 경험을 위해 최소 로딩 시간 보장
      setTimeout(() => {
        clearInterval(loadingInterval);
        setLoadingProgress(100);
        setFortuneResult(result);
        setCurrentStep(Step.RESULT);
      }, 1500);
      
    } catch (err: any) {
      console.error('운세 생성 오류:', err);
      clearInterval(loadingInterval);
      
      // API 키 관련 오류 특별 처리
      if (err.message.includes('API 키') || err.message.includes('유효하지 않은 문자')) {
        setError('API 키 설정에 문제가 있습니다. .env 파일에 올바른 REACT_APP_OPENAI_API_KEY를 추가해주세요.');
      } else {
        setError(err?.message || '운세 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
      
      setCurrentStep(Step.BIRTH_INFO);
    }
  };

  // 처음으로 돌아가기
  const handleRestart = () => {
    setBirthInfo(null);
    setSelectedCard(null);
    setFaceImage(null);
    setFortuneResult(null);
    setTarotCards(getRandomCards());
    setCurrentStep(Step.BIRTH_INFO);
  };

  // 타로 카드 선택 스킵 (무료 사용자가 타로 기능으로 업그레이드하지 않을 경우)
  const handleSkipTarot = () => {
    if (birthInfo) {
      handleGenerateFortune(birthInfo, null);
    }
  };

  // 플랜 업그레이드 페이지로 이동
  const handleShowUpgrade = () => {
    setCurrentStep(Step.PLAN_UPGRADE);
  };

  return (
    <Container>
      <Header>
        <Title>나만의 운세 보기</Title>
        <SubTitle>
          {currentStep === Step.BIRTH_INFO && '당신의 사주 정보를 입력해주세요'}
          {currentStep === Step.TAROT_SELECTION && '직관에 따라 타로 카드를 선택해주세요'}
          {currentStep === Step.PLAN_UPGRADE && '타로 카드 해석을 위해 플랜을 업그레이드 해보세요'}
          {currentStep === Step.FACE_CAPTURE && '얼굴 사진을 촬영하여 더 정확한 운세를 확인하세요'}
          {currentStep === Step.LOADING && '운세를 분석 중입니다...'}
          {currentStep === Step.RESULT && '당신을 위한 오늘의 운세입니다'}
        </SubTitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentStep === Step.BIRTH_INFO && (
        <ContentSection>
          <BirthForm onSubmit={handleBirthSubmit} />
        </ContentSection>
      )}

      {currentStep === Step.TAROT_SELECTION && (
        <ContentSection>
          <TarotSelector>
            <TarotInstruction>
              세 장의 타로 카드 중 마음이 끌리는 한 장을 선택하세요.
              선택한 카드는 당신의 운세에 영향을 줍니다.
            </TarotInstruction>
            <TarotCardSelector 
              cards={tarotCards} 
              onSelect={handleTarotSelect} 
            />
            <SkipLink onClick={handleSkipTarot}>
              타로 카드 선택 건너뛰기
            </SkipLink>
          </TarotSelector>
        </ContentSection>
      )}

      {currentStep === Step.PLAN_UPGRADE && (
        <ContentSection>
          <UpgradeMessage>
            <UpgradeTitle>타로 카드 해석 기능 이용하기</UpgradeTitle>
            <UpgradeText>
              타로 카드 해석 기능은 프리미엄 플랜 전용 기능입니다.
              더 정확하고 깊이 있는 운세를 위해 플랜을 업그레이드해보세요.
            </UpgradeText>
            <ModelInfo>
              <ModelInfoTitle>AI 모델 정보</ModelInfoTitle>
              <ModelInfoText>
                - 일반 운세 (사주 + 타로): 경제적인 4o-mini 모델 사용
                - 관상 분석 (얼굴 사진): 고급 GPT-4 Vision 모델 사용
              </ModelInfoText>
              <ModelInfoNote>
                * 프리미엄 플랜은 관상 분석 기능만 고급 모델을 사용하며, 일반 운세는 경제적인 모델을 사용하여 효율적으로 서비스를 제공합니다.
              </ModelInfoNote>
            </ModelInfo>
            <PlanSelector onSelect={handlePlanUpgrade} />
            <SkipLink onClick={handleSkipTarot}>
              무료 운세만 보기
            </SkipLink>
          </UpgradeMessage>
        </ContentSection>
      )}

      {currentStep === Step.FACE_CAPTURE && (
        <ContentSection>
          <CaptureContainer>
            <CaptureTitle>얼굴 사진 촬영</CaptureTitle>
            <CaptureDescription>
              얼굴 사진을 분석하여 더 정확한 운세를 알려드립니다.
              프리미엄 사용자만 이용 가능한 기능입니다.
            </CaptureDescription>
            <ModelBadge>고급 GPT-4 Vision 모델 사용</ModelBadge>
            <FaceCapture 
              onCapture={handleFaceCapture}
              isLoading={false}
            />
            <SkipLink onClick={() => handleGenerateFortune(birthInfo!, selectedCard)}>
              얼굴 촬영 건너뛰기
            </SkipLink>
          </CaptureContainer>
        </ContentSection>
      )}

      {currentStep === Step.LOADING && (
        <LoadingContainer>
          <LoadingText>당신의 운세를 분석하고 있습니다</LoadingText>
          <LoadingBarContainer>
            <LoadingBar width={loadingProgress} />
          </LoadingBarContainer>
          <LoadingDescription>
            AI가 사주와 타로 카드를 분석 중입니다.
            {faceImage && ' 얼굴 이미지도 함께 분석하여 더 정확한 결과를 제공합니다.'}
          </LoadingDescription>
          <LoadingMessage>{currentLoadingMessage}</LoadingMessage>
        </LoadingContainer>
      )}

      {currentStep === Step.RESULT && fortuneResult && (
        <ContentSection>
          <FortuneResult 
            result={fortuneResult} 
            selectedCard={selectedCard}
            onRestart={handleRestart}
          />
        </ContentSection>
      )}

      {/* 하단 플랜 상태 표시 */}
      <PlanStatusBar>
        {currentPlan === PlanType.FREE ? (
          <>
            <PlanBadge isPremium={false}>무료 플랜</PlanBadge>
            <UpgradeButton onClick={handleShowUpgrade}>
              프리미엄으로 업그레이드
            </UpgradeButton>
          </>
        ) : (
          <PlanBadge isPremium={true}>프리미엄 플랜</PlanBadge>
        )}
      </PlanStatusBar>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: #4a5568;
`;

const ContentSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  border: 1px solid #f56565;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const TarotSelector = styled.div`
  text-align: center;
`;

const TarotInstruction = styled.p`
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const SkipLink = styled.button`
  background: none;
  border: none;
  color: #6b46c1;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 1.5rem;
  
  &:hover {
    color: #553c9a;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;

const LoadingText = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
`;

const LoadingBarContainer = styled.div`
  width: 100%;
  max-width: 500px;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const LoadingBar = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #6b46c1;
  transition: width 0.3s ease;
`;

const LoadingDescription = styled.p`
  text-align: center;
  color: #718096;
  font-size: 1rem;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const UpgradeMessage = styled.div`
  text-align: center;
  padding: 1rem 0;
`;

const UpgradeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const UpgradeText = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const PlanStatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PlanBadge = styled.div<{ isPremium: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  background-color: ${props => props.isPremium ? '#ebf8ff' : '#f0fff4'};
  color: ${props => props.isPremium ? '#3182ce' : '#38a169'};
  border: 1px solid ${props => props.isPremium ? '#bee3f8' : '#c6f6d5'};
`;

const UpgradeButton = styled.button`
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: #6b46c1;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #553c9a;
  }
`;

const CaptureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CaptureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
`;

const CaptureDescription = styled.p`
  font-size: 1rem;
  color: #718096;
  text-align: center;
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.6;
`;

const ModelInfo = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.2rem;
  margin: 1.5rem 0;
  border-left: 4px solid #6b46c1;
`;

const ModelInfoTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.8rem;
`;

const ModelInfoText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  margin-bottom: 0.8rem;
  line-height: 1.5;
`;

const ModelInfoNote = styled.p`
  color: #718096;
  font-size: 0.85rem;
  font-style: italic;
  line-height: 1.5;
`;

const ModelBadge = styled.div`
  display: inline-block;
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
`;

// 로딩 메시지 스타일
const LoadingMessage = styled.p`
  font-size: 0.95rem;
  font-style: italic;
  color: #805ad5;
  max-width: 500px;
  line-height: 1.6;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

export default FortunePage; 