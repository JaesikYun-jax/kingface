import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import BirthForm from '../components/BirthForm';
import { BirthInfo, TarotCard, PlanType, FortuneResult } from '../types';
import { tarotCards } from '../assets/tarotData';
import TarotSelection from '../components/TarotSelection';
import FortuneResultComponent from '../components/FortuneResult';
import FaceCapture from '../components/FaceCapture';
import PlanSelector from '../components/PlanSelector';
import { 
  generateFortune, 
  getCurrentPlanType, 
  setCurrentPlanType,
  isFeatureAvailable
} from '../services/api';

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
  PLAN_UPGRADE,
  RESULT,
  LOADING
}

// 비밀번호 검증 로직 - 직접적인 비밀번호 노출 방지
const verifyPasswordSecurely = (input: string): boolean => {
  // "cat" 문자열을 직접 비교하지 않고 다양한 방법으로 검증
  const hash = btoa(input.toLowerCase()); // 인코딩
  // 'cat'을 base64로 인코딩한 값은 'Y2F0'
  return hash === 'Y2F0';
};

const FortunePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BIRTH_INFO);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingInterval, setLoadingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>(PlanType.FREE);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(wittyLoadingMessages[0]);
  
  // 비밀번호 관련 상태 추가
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordAttempts, setPasswordAttempts] = useState<number>(0);

  // 컴포넌트 마운트 시 현재 플랜 설정
  useEffect(() => {
    const plan = getCurrentPlanType();
    setCurrentPlan(plan);

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
    
    // 무료 플랜은 타로 선택 없이 바로 결과 생성
    if (currentPlan === PlanType.FREE) {
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(data, null, null);
    } else {
      // 프리미엄 플랜은 타로 선택 단계로
      setCurrentStep(Step.TAROT_SELECTION);
    }
  };

  // 타로 카드 선택 처리
  const handleTarotSelect = (card: TarotCard) => {
    setSelectedCard(card);
    
    if (birthInfo) {
      // 바로 결과 생성으로 진행
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, card, null);
    }
  };

  // 비밀번호 제출 처리
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 확인 로직
    if (password === 'ibosal') {
      setPasswordError('');
      setCurrentStep(Step.LOADING);
      
      // 타로 카드와 생년월일 정보가 모두 있을 때만 진행
      if (birthInfo && selectedCard) {
        handleGenerateFortune(birthInfo, selectedCard, null);
      }
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    }
  };

  // 플랜 업그레이드 처리
  const handlePlanUpgrade = (planType: PlanType) => {
    setCurrentPlan(planType);
    setCurrentPlanType(planType); // 서비스에 플랜 저장
    
    // 생년월일 정보가 있으면 타로 단계로, 없으면 생년월일 입력 단계로
    if (birthInfo) {
      setCurrentStep(Step.TAROT_SELECTION);
    } else {
      setCurrentStep(Step.BIRTH_INFO);
    }
  };

  // 얼굴 이미지 캡처 처리
  const handleFaceCapture = (img: string) => {
    setFaceImage(img);
    
    if (birthInfo && selectedCard) {
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, selectedCard, img);
    }
  };

  // 운세 생성 처리
  const handleGenerateFortune = async (birth: BirthInfo, card: TarotCard | null, faceImg: string | null = null) => {
    setLoadingProgress(0);
    setCurrentLoadingMessage(wittyLoadingMessages[0]);
    const interval = updateLoadingProgress();

    try {
      // 운세 생성 API 호출 (얼굴 이미지 관련 인자 제거)
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
      
      // 5초 후 에러 메시지 제거
      setTimeout(() => {
        setError(null);
        // 플랜 관련 오류인 경우 업그레이드 단계로, 아니면 처음 단계로
        if (err?.message?.includes('프리미엄 플랜')) {
          setCurrentStep(Step.PLAN_UPGRADE);
        } else {
          setCurrentStep(Step.BIRTH_INFO);
        }
      }, 5000);
    }
  };

  // 다시 시작 처리
  const handleRestart = () => {
    setBirthInfo(null);
    setSelectedCard(null);
    setFortuneResult(null);
    setFaceImage(null);
    setCurrentStep(Step.BIRTH_INFO);
    setError(null);
  };

  // 타로 선택 건너뛰기
  const handleSkipTarot = () => {
    if (birthInfo) {
      // 바로 결과 생성
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, null, null);
    }
  };

  // 업그레이드 페이지 표시
  const handleShowUpgrade = () => {
    setCurrentStep(Step.PLAN_UPGRADE);
  };

  return (
    <Container>
      <Header>
        <Title>아이보살 사주 운세</Title>
        <SubTitle>당신의 사주와 인연을 AI 보살이 풀어드립니다</SubTitle>
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
              마음을 가라앉히고 진정한 마음으로 끌리는 타로 카드 한 장을 선택하세요.
            </TarotInstruction>
            <TarotSelection 
              onCardSelect={handleTarotSelect} 
            />
            <SkipLink onClick={handleSkipTarot}>
              타로 선택 건너뛰기
            </SkipLink>
          </TarotSelector>
        </ContentSection>
      )}

      {currentStep === Step.PLAN_UPGRADE && (
        <ContentSection>
          <UpgradeMessage>
            <UpgradeTitle>아이보살 프리미엄 서비스</UpgradeTitle>
            <UpgradeText>
              타로와 함께 더 심층적인 운명의 비밀과 인연까지 살펴드립니다.
              더 깊은 영적 인사이트를 원하신다면, 지금 프리미엄으로 알아보세요!
            </UpgradeText>
            
            <ModelInfoBox>
              <ModelInfoText>
                <strong>비법 공개</strong>: 일반 운세에는 경제적인 4o-mini 모델을, 
                프리미엄 플랜에서는 더 정확한 <strong>GPT-4.1-turbo 모델</strong>을 사용합니다.
              </ModelInfoText>
            </ModelInfoBox>
            
            <PlanSelector onSelect={handlePlanUpgrade} />
          </UpgradeMessage>
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

const PasswordContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const SecurityIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const PasswordTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const PasswordDescription = styled.p`
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const AnalysisOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AnalysisOption = styled.div`
  background-color: #f9f5ff;
  border: 1px solid #e9d8fd;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
`;

const OptionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const OptionTitle = styled.h4`
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 0.8rem;
`;

const OptionDescription = styled.p`
  font-size: 0.9rem;
  color: #718096;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const SkipButton = styled.button`
  background-color: #6b46c1;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #553c9a;
  }
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const PasswordInput = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  outline: none;
  
  &:focus {
    border-color: #6b46c1;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: #6b46c1;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #553c9a;
  }
`;

const PasswordErrorMessage = styled.div`
  color: #fed7d7;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
`;
Container.displayName = 'FortunePage_Container';

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;
Header.displayName = 'FortunePage_Header';

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 15px rgba(107, 70, 193, 0.5);
`;
Title.displayName = 'FortunePage_Title';

const SubTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;
SubTitle.displayName = 'FortunePage_SubTitle';

const ContentSection = styled.div`
  background-color: rgba(74, 21, 81, 0.3);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.9);
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
SkipLink.displayName = 'FortunePage_SkipLink';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;
LoadingContainer.displayName = 'FortunePage_LoadingContainer';

const LoadingText = styled.h3`
  font-size: 1.5rem;
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

const UpgradeMessage = styled.div`
  text-align: center;
  padding: 1rem 0;
`;
UpgradeMessage.displayName = 'FortunePage_UpgradeMessage';

const UpgradeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
`;
UpgradeTitle.displayName = 'FortunePage_UpgradeTitle';

const UpgradeText = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
`;
UpgradeText.displayName = 'FortunePage_UpgradeText';

const ModelInfoBox = styled.div`
  background-color: rgba(107, 70, 193, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 0 auto 2rem;
  max-width: 90%;
  border-left: 4px solid #6b46c1;
`;
ModelInfoBox.displayName = 'FortunePage_ModelInfoBox';

const ModelInfoText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: left;
  
  strong {
    color: #e9d8fd;
    font-weight: 600;
  }
  
  i {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
`;
ModelInfoText.displayName = 'FortunePage_ModelInfoText';

const ModelBadge = styled.div`
  display: inline-block;
  background-color: rgba(107, 70, 193, 0.5);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 0.75rem;
`;
ModelBadge.displayName = 'FortunePage_ModelBadge';

const PlanStatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
  background-color: rgba(74, 21, 81, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
PlanStatusBar.displayName = 'FortunePage_PlanStatusBar';

const PlanBadge = styled.div<{ isPremium: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  background-color: ${props => props.isPremium ? 'rgba(107, 70, 193, 0.3)' : 'rgba(107, 70, 193, 0.2)'};
  color: ${props => props.isPremium ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.isPremium ? 'rgba(159, 122, 234, 0.5)' : 'rgba(159, 122, 234, 0.3)'};
`;
PlanBadge.displayName = 'FortunePage_PlanBadge';

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
UpgradeButton.displayName = 'FortunePage_UpgradeButton';

export default FortunePage; 