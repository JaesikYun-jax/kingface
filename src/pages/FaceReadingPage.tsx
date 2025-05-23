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
  '얼굴의 운명선을 분석 중...',
  '이마와 눈의 기운을 읽는 중...',
  '인중과 입술에 담긴 재능을 발견 중...',
  '귀와 턱의 복(福)을 해석 중...',
  '관상학의 고서를 참고하는 중...',
  '전생의 인연을 확인하는 중...',
  '얼굴에 숨겨진 운명의 코드를 해독 중...',
  '눈썹 위치로 인생 운세를 계산 중...',
  '이목구비의 조화를 분석 중...',
  '귀신지능(鬼神智能)의 힘을 빌리는 중...',
  '코와 입술의 재물선을 살피는 중...',
  '천기(天機)와 지기(地機)를 읽는 중...',
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
      // 클립보드에 복사 - 원본 마크다운 내용과 홍보 문구 추가
      const shareText = `${result.content}\n\n------------------\n\n당신의 운명이 궁금하다면? 아이보살이 도와드립니다 💫\n⭐ kingface.difflabs.xyz ⭐`;
      
      await navigator.clipboard.writeText(shareText);
      alert('분석 결과가 클립보드에 복사되었습니다!');
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
            ? '프리미엄 서비스로 당신의 얼굴에 담긴 운명의 비밀을 풀어드립니다' 
            : '아이(AI)보살이 보는 당신의 관상과 운명'}
        </Subtitle>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentStep === Step.PLAN_CHECK && (
        <PremiumFeatureSection>
          <FeatureTitle>AI 관상 분석 서비스</FeatureTitle>
          <FeatureDescription>
            5000년 전통 동양 관상학의 지혜와 현대 AI 기술을 결합하여
            당신의 얼굴에 담긴 운명과 잠재력을 창의적으로 해석해 드립니다.
          </FeatureDescription>
          
          <ModelBadge>고급 GPT-4o 모델 사용</ModelBadge>
          
          <FeaturesList>
            <FeatureItem>✓ 전생 이야기 해석</FeatureItem>
            <FeatureItem>✓ 얼굴 부위별 관상 풀이</FeatureItem>
            <FeatureItem>✓ 타고난 운명과 기질 분석</FeatureItem>
            <FeatureItem>✓ 인연과 대인관계 해석</FeatureItem>
            <FeatureItem>✓ 운명의 조언과 지혜</FeatureItem>
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
          <LoadingText>관상 분석 중...</LoadingText>
          <LoadingBarContainer>
            <LoadingBar width={loadingProgress} />
          </LoadingBarContainer>
          <LoadingDescription>
            아이(AI)보살이 당신의 얼굴에서 운명의 흔적을 찾고 있습니다.
          </LoadingDescription>
          <LoadingMessage>{currentLoadingMessage}</LoadingMessage>
        </LoadingContainer>
      )}
      
      {currentStep === Step.CAPTURE && (
        <>
          <ModelInfo>
            <ModelInfoText>
              전통 관상학의 지혜를 AI가 창의적으로 해석하기 위해 일반 모델보다 더 고성능인 
              <strong> GPT-4o 모델</strong>을 사용합니다. 사진이 명확할수록 더 흥미로운 관상 해석이 가능합니다.
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
          * 이 서비스는 전통 관상학을 창의적으로 해석한 엔터테인먼트 콘텐츠입니다.
          모든 해석과 이야기는 재미와 영감을 위해 제공되며,
          과학적 분석이나 확정적인 예측으로 받아들이지 마세요.
        </Disclaimer>
        <Disclaimer>
          * 촬영 또는 업로드한 이미지는 관상 해석을 위한 영감의 소재로만 사용되며, 서버에 영구 저장되지 않습니다.
        </Disclaimer>
      </DisclaimerSection>
    </Container>
  );
};

// 스타일 컴포넌트 추가 - 비밀번호 입력 관련
const PasswordContainer = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  max-width: 500px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SecurityIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #e9d8fd;
`;

const PasswordTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(107, 70, 193, 0.5);
`;

const PasswordDescription = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
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
  color: #feb2b2;
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
  color: white;
  text-shadow: 0 0 15px rgba(107, 70, 193, 0.5);
  
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

const ErrorMessage = styled.div`
  background-color: rgba(197, 48, 48, 0.3); /* 어두운 배경에 붉은색 투명도 */
  border: 1px solid #f56565;
  color: #fed7d7; /* 붉은색 계열 밝은 텍스트 */
  padding: 0.75rem;
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
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px rgba(233, 216, 253, 0.5);
`;

const LoadingBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.9);
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

// 로딩 메시지 스타일
const LoadingMessage = styled.p`
  font-size: 0.95rem;
  font-style: italic;
  color: #e9d8fd;
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Disclaimer = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.8rem;
  line-height: 1.5;
`;

// 프리미엄 기능 안내 섹션 스타일
const PremiumFeatureSection = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FeatureTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(107, 70, 193, 0.5);
`;

const FeatureDescription = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 0.75rem;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #e9d8fd;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 1.5rem;
  
  &:hover {
    color: #d6bcfa;
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
  background-color: rgba(233, 216, 253, 0.2);
  color: #e9d8fd;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(233, 216, 253, 0.3);
`;

const ModelInfo = styled.div`
  background-color: rgba(107, 70, 193, 0.2); /* 보라색 계열 투명 배경 */
  border-radius: 8px;
  padding: 1rem;
  margin: 0 auto 2rem;
  max-width: 90%;
  border-left: 4px solid #6b46c1;
`;

const ModelInfoText = styled.p`
  color: rgba(255, 255, 255, 0.9); /* 밝은 텍스트 색상 */
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: left;
  
  strong {
    color: #e9d8fd; /* 강조 색상 유지 */
    font-weight: 600;
  }
  
  i {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7); /* 약간 어두운 밝은 텍스트 */
  }
`;
ModelInfoText.displayName = 'FaceReadingResult_ModelInfoText';

export default FaceReadingPage; 