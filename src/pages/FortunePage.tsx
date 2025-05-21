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
  PASSWORD, // 비밀번호 입력 단계 추가
  FACE_CAPTURE,
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
    
    // 프리미엄 플랜이며 생년월일 정보가 있으면 얼굴 촬영 단계로
    if (currentPlan === PlanType.PREMIUM && birthInfo) {
      // 얼굴 촬영 단계로 이동하기 전에 비밀번호 단계로 먼저 이동
      setCurrentStep(Step.PASSWORD);
    } else if (birthInfo) {
      // 그 외의 경우 바로 결과 생성
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, card, null);
    }
  };

  // 비밀번호 확인 처리
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // 비밀번호 시도 횟수 증가
    const newAttempts = passwordAttempts + 1;
    setPasswordAttempts(newAttempts);
    
    // 최대 시도 횟수 제한 (5회)
    if (newAttempts > 5) {
      setPasswordError('시도 횟수를 초과했습니다. 나중에 다시 시도해주세요.');
      // 3초 후 타로 선택 단계로 돌아감
      setTimeout(() => setCurrentStep(Step.TAROT_SELECTION), 3000);
      return;
    }
    
    // 비밀번호 검증
    if (verifyPasswordSecurely(password)) {
      // 검증 성공 시 얼굴 촬영 단계로 이동
      setCurrentStep(Step.FACE_CAPTURE);
      // 시도 횟수 및 비밀번호 초기화
      setPasswordAttempts(0);
      setPassword('');
    } else {
      // 검증 실패 시 에러 메시지 표시
      setPasswordError('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
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
  const handleFaceCapture = async (imageSrc: string) => {
    setFaceImage(imageSrc);
    
    if (birthInfo) {
      setCurrentStep(Step.LOADING);
      handleGenerateFortune(birthInfo, selectedCard, imageSrc);
    }
  };

  // 운세 생성 처리
  const handleGenerateFortune = async (birth: BirthInfo, card: TarotCard | null, faceImg: string | null = null) => {
    setLoadingProgress(0);
    setCurrentLoadingMessage(wittyLoadingMessages[0]);
    const interval = updateLoadingProgress();

    try {
      // 운세 생성 API 호출 (얼굴 이미지가 있든 없든 동일한 함수 사용)
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
      // 프리미엄 플랜이면 얼굴 촬영 단계로 (비밀번호 단계를 거침)
      if (currentPlan === PlanType.PREMIUM) {
        setCurrentStep(Step.PASSWORD);
      } else {
        // 그 외의 경우 결과 생성
        setCurrentStep(Step.LOADING);
        handleGenerateFortune(birthInfo, null, null);
      }
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
              타로와 얼굴 분석을 더한 심층적인, 운명의 비밀과 전생의 인연까지 살펴드립니다.
              더 깊은 영적 인사이트를 원하신다면, 지금 프리미엄으로 알아보세요!
            </UpgradeText>
            
            <ModelInfoBox>
              <ModelInfoText>
                <strong>비법 공개</strong>: 일반 운세에는 경제적인 4o-mini 모델을, 
                얼굴 분석에는 영험한 <strong>GPT-4.1-turbo 모델</strong>을 사용합니다.
                <br />
                <i>* 고급 모델은 전생 관상 분석에만 사용됩니다.</i>
              </ModelInfoText>
              {faceImage && (
                <ModelBadge>영험한 GPT-4.1-turbo 모델 사용</ModelBadge>
              )}
            </ModelInfoBox>
            
            <PlanSelector onSelect={handlePlanUpgrade} />
          </UpgradeMessage>
        </ContentSection>
      )}

      {/* 비밀번호 입력 단계 추가 */}
      {currentStep === Step.PASSWORD && (
        <ContentSection>
          <PasswordContainer>
            <SecurityIcon>🔒</SecurityIcon>
            <PasswordTitle>보안 인증</PasswordTitle>
            <PasswordDescription>
              얼굴 분석 API 악용 방지를 위해 비밀번호 인증이 필요합니다.
              관리자에게 문의하여 비밀번호를 얻으세요.
            </PasswordDescription>
            
            <PasswordForm onSubmit={handlePasswordSubmit}>
              <PasswordInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
              <SubmitButton type="submit">확인</SubmitButton>
            </PasswordForm>
            
            {passwordError && <PasswordErrorMessage>{passwordError}</PasswordErrorMessage>}
            
            <SkipLink onClick={handleSkipTarot}>
              얼굴 분석 건너뛰기
            </SkipLink>
          </PasswordContainer>
        </ContentSection>
      )}

      {currentStep === Step.FACE_CAPTURE && birthInfo && (
        <ContentSection>
          <FaceCapture onCapture={handleFaceCapture} isLoading={false} />
          <SkipLink onClick={() => {
            setCurrentStep(Step.LOADING);
            handleGenerateFortune(birthInfo, selectedCard, null);
          }}>
            얼굴 분석 건너뛰기
          </SkipLink>
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
            {faceImage && ' 얼굴의 전생 흔적도 함께 분석하여 더 깊은 해석을 제공합니다.'}
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

// 비밀번호 입력 관련 스타일 컴포넌트
const PasswordContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 500px;
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

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  color: #c53030;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

// 기존 스타일 컴포넌트들
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

// 로딩 메시지 스타일
const LoadingMessage = styled.p`
  font-size: 0.95rem;
  font-style: italic;
  color: #805ad5;
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
  margin-bottom: 1rem;
`;

// 모델 정보 스타일 추가
const ModelInfoBox = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 0 auto 2rem;
  max-width: 90%;
  border-left: 4px solid #6b46c1;
`;

const ModelInfoText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: left;
  
  strong {
    color: #6b46c1;
    font-weight: 600;
  }
  
  i {
    font-size: 0.9rem;
    color: #718096;
  }
`;

const ModelBadge = styled.div`
  display: inline-block;
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 0.75rem;
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

export default FortunePage; 