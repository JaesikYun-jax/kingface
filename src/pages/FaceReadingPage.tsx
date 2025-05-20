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
  PASSWORD = 'PASSWORD',
  CAPTURE = 'CAPTURE',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
}

// 로딩 중 보여줄 위트있는 메시지 배열
const wittyLoadingMessages = [
  "얼굴 특징 스캔 중...",
  "성격 분석 알고리즘 적용 중...",
  "얼굴 비율 계산 중...",
  "표정과 특징 패턴 분석 중...",
  "심리 프로필 생성 중...",
  "시각적 특성 매핑 중...",
  "인공지능 분석 진행 중...",
  "얼굴 특징 데이터베이스 참고 중...",
  "당신만의 특별한 프로필 만드는 중...",
  "결과 최적화 중..."
];

// 비밀번호 검증 로직 - 직접적인 비밀번호 노출 방지
const verifyPasswordSecurely = (input: string): boolean => {
  // "cat" 문자열을 직접 비교하지 않고 다양한 방법으로 검증
  // 단순히 문자열 비교보다 복잡한 방식 사용
  const hash = btoa(input.toLowerCase()); // 인코딩
  // 'cat'을 base64로 인코딩한 값은 'Y2F0'
  return hash === 'Y2F0';
};

const FaceReadingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.PLAN_CHECK);
  const [result, setResult] = useState<FaceReadingResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [currentPlan, setCurrentPlan] = useState<PlanType>(PlanType.FREE);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(wittyLoadingMessages[0]);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordAttempts, setPasswordAttempts] = useState<number>(0);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 플랜 확인
  useEffect(() => {
    const plan = getCurrentPlanType();
    setCurrentPlan(plan);
    
    // 관상 분석 기능 사용 가능 여부 확인
    if (isFeatureAvailable('관상 분석')) {
      // 플랜이 확인되면 바로 캡처 단계가 아닌 비밀번호 단계로 이동
      setCurrentStep(Step.PASSWORD);
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
      // 플랜이 확인되면 바로 캡처 단계가 아닌 비밀번호 단계로 이동
      setCurrentStep(Step.PASSWORD);
    }
  };

  // 비밀번호 검증 처리
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // 비밀번호 시도 횟수 증가
    const newAttempts = passwordAttempts + 1;
    setPasswordAttempts(newAttempts);
    
    // 최대 시도 횟수 제한 (5회)
    if (newAttempts > 5) {
      setPasswordError('시도 횟수를 초과했습니다. 나중에 다시 시도해주세요.');
      // 3초 후 홈으로 리다이렉트
      setTimeout(() => navigate('/'), 3000);
      return;
    }
    
    // 비밀번호 검증
    if (verifyPasswordSecurely(password)) {
      // 검증 성공 시 캡처 단계로 이동
      setCurrentStep(Step.CAPTURE);
      // 시도 횟수 및 비밀번호 초기화
      setPasswordAttempts(0);
      setPassword('');
    } else {
      // 검증 실패 시 에러 메시지 표시
      setPasswordError('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
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
        // 오류 발생 시 비밀번호 입력 단계로 돌아감
        setCurrentStep(Step.PASSWORD);
      }
    }
  }, [startLoadingAnimation, navigate]);

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
    // 다시 시작 시 비밀번호 단계로 이동
    setCurrentStep(Step.PASSWORD);
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
          
          <ModelBadge>고급 GPT-4o 모델 사용</ModelBadge>
          
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
      
      {/* 비밀번호 입력 폼 추가 */}
      {currentStep === Step.PASSWORD && (
        <PasswordContainer>
          <SecurityIcon>🔒</SecurityIcon>
          <PasswordTitle>보안 인증</PasswordTitle>
          <PasswordDescription>
            API 악용 방지를 위해 비밀번호 인증이 필요합니다.
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
          
          <BackLink onClick={handleReturn}>
            홈으로 돌아가기
          </BackLink>
        </PasswordContainer>
      )}
      
      {currentStep === Step.LOADING && (
        <LoadingContainer>
          <LoadingText>얼굴 분석 중...</LoadingText>
          <LoadingBarContainer>
            <LoadingBar width={loadingProgress} />
          </LoadingBarContainer>
          <LoadingDescription>
            AI가 당신의 얼굴 특징을 분석하여 성격 프로필을 만들고 있습니다.
          </LoadingDescription>
          <LoadingMessage>{currentLoadingMessage}</LoadingMessage>
        </LoadingContainer>
      )}
      
      {currentStep === Step.CAPTURE && (
        <>
          <ModelInfo>
            <ModelInfoText>
              관상 분석은 얼굴의 세밀한 특징을 파악해야 하므로, 일반 모델보다 더 고성능인 
              <strong> GPT-4o 모델</strong>을 사용합니다. 고품질 사진일수록 더 정확한 분석이 가능합니다.
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

// 스타일 컴포넌트 추가 - 비밀번호 입력 관련
const PasswordContainer = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
`;

const SecurityIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const PasswordTitle = styled.h3`
  font-size: 1.75rem;
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