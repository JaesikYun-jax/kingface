import React, { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import FaceCapture from '../components/FaceCapture';
import FaceReadingResult from '../components/FaceReadingResult';
import { analyzeFaceReading, getCurrentPlanType, isFeatureAvailable } from '../services/api';
import { FaceReadingResult as FaceReadingResultType, PlanType } from '../types';
import { useNavigate } from 'react-router-dom';
import PlanSelector from '../components/PlanSelector';

enum Step {
  PLAN_CHECK = 'PLAN_CHECK',
  CAPTURE = 'CAPTURE',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
}

// 로딩 중 보여줄 위트있는 메시지 배열
const wittyLoadingMessages = [
  "천기를 읽는 중...",
  "타로신과 사주신이 토론하는 중...",
  "당신의 얼굴에 담긴 비밀을 분석하는 중...", 
  "운명의 라인을 따라가는 중...",
  "눈과 코의 비율로 성격을 파악하는 중...",
  "관상학 고서를 참고하는 중...",
  "인공지능이 당신의 면상을 스캔하는 중...",
  "옛 선인들의 지혜를 불러오는 중...",
  "우주의 기운을 모으는 중...",
  "관상 데이터베이스를 검색하는 중...",
];

const FaceReadingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.PLAN_CHECK);
  const [result, setResult] = useState<FaceReadingResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [currentPlan, setCurrentPlan] = useState<PlanType>(PlanType.FREE);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(wittyLoadingMessages[0]);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 플랜 확인
  useEffect(() => {
    const plan = getCurrentPlanType();
    setCurrentPlan(plan);
    
    // 관상 분석 기능 사용 가능 여부 확인
    if (isFeatureAvailable('관상 분석')) {
      setCurrentStep(Step.CAPTURE);
    }
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

  // 플랜 업그레이드 처리
  const handlePlanSelect = (planType: PlanType) => {
    setCurrentPlan(planType);
    
    // 관상 분석 기능 사용 가능 여부 다시 확인
    if (isFeatureAvailable('관상 분석')) {
      setCurrentStep(Step.CAPTURE);
    }
  };

  // 로딩 진행 효과를 위한 타이머 설정
  const startLoadingAnimation = useCallback(() => {
    setLoadingProgress(0);
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
  }, []);

  // 이미지 캡처 처리 함수
  const handleCapture = useCallback(async (imageSrc: string) => {
    setCurrentStep(Step.LOADING);
    setError(null);
    
    // 초기 로딩 메시지 설정
    setCurrentLoadingMessage(wittyLoadingMessages[0]);
    
    // 로딩 진행 애니메이션 시작
    const loadingInterval = startLoadingAnimation();

    try {
      // 프리미엄 플랜 확인
      if (!isFeatureAvailable('관상 분석')) {
        clearInterval(loadingInterval);
        setError('관상 분석은 프리미엄 플랜 전용 기능입니다.');
        setCurrentStep(Step.PLAN_CHECK);
        return;
      }
      
      // 관상 분석 API 호출
      const analysisResult = await analyzeFaceReading(imageSrc);
      
      // 사용자 경험을 위해 최소 로딩 시간 보장
      setTimeout(() => {
        clearInterval(loadingInterval);
        setLoadingProgress(100);
        setResult(analysisResult);
        setCurrentStep(Step.RESULT);
      }, 2000);
    } catch (err: any) {
      console.error('Face analysis error:', err);
      clearInterval(loadingInterval);
      setError(err?.message || '관상 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
      
      // 프리미엄 플랜 관련 오류인 경우 플랜 선택 화면으로 이동
      if (err?.message?.includes('프리미엄 플랜')) {
        setCurrentStep(Step.PLAN_CHECK);
      } else {
        setCurrentStep(Step.CAPTURE);
      }
    }
  }, [startLoadingAnimation]);

  // 결과 공유 기능
  const handleShareResult = useCallback(async () => {
    if (!result) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI 관상 분석 결과',
          text: `AI가 분석한 나의 관상: ${result.personalityTraits.join(', ')}`,
          url: window.location.href,
        });
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(
          `AI 관상 분석 결과\n\n성격: ${result.personalityTraits.join(', ')}\n전체 운세: ${result.overallFortune}\n직업 적성: ${result.careerSuitability}\n대인 관계: ${result.relationships}\n조언: ${result.advice}`
        );
        alert('결과가 클립보드에 복사되었습니다.');
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      alert('결과 공유에 실패했습니다.');
    }
  }, [result]);

  // 처음으로 돌아가기
  const handleReturn = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // 다시 시작하기
  const handleRestart = useCallback(() => {
    setCurrentStep(Step.CAPTURE);
    setResult(null);
    setError(null);
  }, []);

  return (
    <Container>
      <Header>
        <Title>AI 관상 분석</Title>
        <Subtitle>
          {currentStep === Step.PLAN_CHECK 
            ? '프리미엄 서비스로 당신의 얼굴에 담긴 운명을 분석해 드립니다' 
            : '당신의 얼굴에 담긴 운명을 AI가 분석해 드립니다'}
        </Subtitle>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentStep === Step.PLAN_CHECK && (
        <PremiumFeatureSection>
          <FeatureTitle>AI 관상 분석 서비스</FeatureTitle>
          <FeatureDescription>
            얼굴 사진을 분석하여 성격 특성, 운세, 직업 적성, 대인 관계에 대한 
            깊이 있는 분석 결과를 제공하는 프리미엄 전용 서비스입니다.
          </FeatureDescription>
          
          <ModelBadge>고급 GPT-4 Vision 모델 사용</ModelBadge>
          
          <FeaturesList>
            <FeatureItem>✓ AI 기반 얼굴 특징 인식</FeatureItem>
            <FeatureItem>✓ 성격 특성 키워드 분석</FeatureItem>
            <FeatureItem>✓ 직업 적성 및 재능 분석</FeatureItem>
            <FeatureItem>✓ 대인 관계 및 연애 성향 파악</FeatureItem>
            <FeatureItem>✓ 운세 및 미래 전망 제시</FeatureItem>
          </FeaturesList>
          <PlanSelector onSelect={handlePlanSelect} />
          <BackLink onClick={handleReturn}>
            홈으로 돌아가기
          </BackLink>
        </PremiumFeatureSection>
      )}
      
      {currentStep === Step.LOADING && (
        <LoadingContainer>
          <LoadingText>관상 분석 중...</LoadingText>
          <LoadingBarContainer>
            <LoadingBar width={loadingProgress} />
          </LoadingBarContainer>
          <LoadingDescription>
            AI가 당신의 얼굴에서 운명의 패턴을 찾고 있습니다.
          </LoadingDescription>
          <LoadingMessage>{currentLoadingMessage}</LoadingMessage>
        </LoadingContainer>
      )}
      
      {currentStep === Step.CAPTURE && (
        <>
          <ModelInfo>
            <ModelInfoText>
              관상 분석은 얼굴의 세밀한 특징을 파악해야 하므로, 일반 모델보다 더 고성능인 
              <strong> GPT-4 Vision 모델</strong>을 사용합니다. 고품질 사진일수록 더 정확한 분석이 가능합니다.
            </ModelInfoText>
          </ModelInfo>
          <FaceCapture 
            onCapture={handleCapture} 
            isLoading={false} 
          />
        </>
      )}
      
      {currentStep === Step.RESULT && result && (
        <ResultContainer>
          <FaceReadingResult 
            result={result} 
            onRestart={handleRestart} 
            onShare={handleShareResult}
            onReturn={handleReturn}
          />
        </ResultContainer>
      )}
      
      {/* 하단 플랜 상태 표시 */}
      {currentStep !== Step.PLAN_CHECK && (
        <PlanStatusBar>
          <PlanBadge isPremium={true}>프리미엄 플랜</PlanBadge>
        </PlanStatusBar>
      )}
      
      <DisclaimerSection>
        <Disclaimer>
          * 이 서비스는 오락 목적으로 제공되며, 분석 결과는 참고용입니다.
          AI 기술을 활용하여 재미있고 개인화된 분석을 제공하지만,
          실제 미래나 운명을 예측하지는 않습니다.
        </Disclaimer>
        <Disclaimer>
          * 촬영 또는 업로드한 이미지는 분석 목적으로만 사용되며, 서버에 영구 저장되지 않습니다.
        </Disclaimer>
      </DisclaimerSection>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2d3748;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #4a5568;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
`;

const LoadingText = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
`;

const LoadingBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const LoadingBar = styled.div<{ width: number }>`
  width: ${({ width }) => `${width}%`};
  height: 100%;
  background-image: linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%);
  border-radius: 6px;
  transition: width 0.3s ease-in-out;
`;

const LoadingDescription = styled.p`
  font-size: 1rem;
  color: #4a5568;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 0.5rem;
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

const ResultContainer = styled.div`
  margin-top: 2rem;
`;

const DisclaimerSection = styled.div`
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const Disclaimer = styled.p`
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.8rem;
  line-height: 1.5;
`;

// 프리미엄 기능 안내 섹션 스타일
const PremiumFeatureSection = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FeatureTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 auto 2rem auto;
  max-width: 500px;
  text-align: left;
`;

const FeatureItem = styled.li`
  padding: 0.75rem 0;
  color: #4a5568;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
`;

const BackLink = styled.button`
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

const PlanStatusBar = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
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

const ModelBadge = styled.div`
  display: inline-block;
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin: 0.75rem 0 1.25rem;
`;

const ModelInfo = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #6b46c1;
`;

const ModelInfoText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.5;
  
  strong {
    color: #6b46c1;
    font-weight: 600;
  }
`;

export default FaceReadingPage; 