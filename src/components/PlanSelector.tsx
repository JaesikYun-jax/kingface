import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { PlanType, ServicePlanConfig } from '../types';
import { getCurrentPlanType, setCurrentPlanType, getServicePlanConfig } from '../services/api';

interface PlanSelectorProps {
  onSelect: (planType: PlanType) => void;
  showDetails?: boolean;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ 
  onSelect,
  showDetails = true
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.FREE);
  const [config, setConfig] = useState<ServicePlanConfig | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  
  // 컴포넌트 마운트 시 현재 플랜 및 설정 로드
  useEffect(() => {
    const currentPlan = getCurrentPlanType();
    setSelectedPlan(currentPlan);
    
    const planConfig = getServicePlanConfig();
    setConfig(planConfig);
  }, []);
  
  // 플랜 선택 변경 시 처리
  const handlePlanChange = (planType: PlanType) => {
    setSelectedPlan(planType);
    setCurrentPlanType(planType);
    
    if (onSelect) {
      onSelect(planType);
    }
  };
  
  // 프리미엄 결제 처리
  const handlePayment = () => {
    // 실제 결제 API 연동 대신 바로 성공 처리
    setPaymentSuccess(true);
    handlePlanChange(PlanType.PREMIUM);
    
    // 사용자 경험을 위한 알림 표시 후 리셋
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 3000);
  };
  
  // 설정이 로드되지 않은 경우
  if (!config) {
    return <LoadingMessage>플랜 정보를 불러오는 중...</LoadingMessage>;
  }

  const isPremium = selectedPlan === PlanType.PREMIUM;
  
  return (
    <Container>
      {paymentSuccess && (
        <SuccessMessage>
          <SuccessIcon>✓</SuccessIcon>
          프리미엄 결제가 완료되었습니다!
        </SuccessMessage>
      )}

      <PlansContainer>
        <PlanCard 
          isSelected={selectedPlan === PlanType.FREE}
          onClick={() => handlePlanChange(PlanType.FREE)}
        >
          <PlanHeader>
            <PlanName>무료 플랜</PlanName>
            <PlanPrice>0원</PlanPrice>
          </PlanHeader>
          
          {showDetails && (
            <FeatureList>
              {config.features.free.map((feature, index) => (
                <FeatureItem key={index}>
                  <FeatureCheck>✓</FeatureCheck>
                  {feature}
                </FeatureItem>
              ))}
              
              {config.features.premium
                .filter(feature => !config.features.free.includes(feature))
                .map((feature, index) => (
                  <FeatureItemDisabled key={`premium-${index}`}>
                    <FeatureCheckDisabled>✕</FeatureCheckDisabled>
                    {feature}
                  </FeatureItemDisabled>
                ))
              }
            </FeatureList>
          )}
          
          <PlanButton 
            isSelected={selectedPlan === PlanType.FREE}
            onClick={() => handlePlanChange(PlanType.FREE)}
            disabled={selectedPlan === PlanType.FREE}
          >
            {selectedPlan === PlanType.FREE ? '현재 플랜' : '무료 이용하기'}
          </PlanButton>
        </PlanCard>
        
        <PlanCard 
          isSelected={selectedPlan === PlanType.PREMIUM}
          isPremium
          onClick={() => handlePlanChange(PlanType.PREMIUM)}
        >
          <PremiumBadge>인기</PremiumBadge>
          <PlanHeader>
            <PlanName>프리미엄 플랜</PlanName>
            <PlanPrice>{config.prices.premium.toLocaleString()}원</PlanPrice>
          </PlanHeader>
          
          {showDetails && (
            <FeatureList>
              {config.features.premium.map((feature, index) => (
                <FeatureItem key={index}>
                  <FeatureCheck isPremium>✓</FeatureCheck>
                  {feature}
                </FeatureItem>
              ))}
            </FeatureList>
          )}
          
          <PlanButton 
            isSelected={selectedPlan === PlanType.PREMIUM}
            isPremium
            onClick={!isPremium ? handlePayment : undefined}
            disabled={selectedPlan === PlanType.PREMIUM}
          >
            {selectedPlan === PlanType.PREMIUM ? '현재 플랜' : '프리미엄 결제하기'}
          </PlanButton>
          {!isPremium && (
            <SecurityInfo>
              <SecurityIcon>🔒</SecurityIcon>
              안전한 결제, 언제든지 해지 가능
            </SecurityInfo>
          )}
        </PlanCard>
      </PlansContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(107, 70, 193, 0.3);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 600;
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const SuccessIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #9f7aea;
  color: white;
  border-radius: 50%;
  font-weight: bold;
`;

const PlansContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PlanCard = styled.div<{ isSelected: boolean; isPremium?: boolean }>`
  flex: 1;
  min-width: 250px;
  background-color: ${props => props.isSelected 
    ? 'rgba(107, 70, 193, 0.3)' 
    : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid ${props => {
    if (props.isSelected && props.isPremium) return '#9f7aea';
    if (props.isSelected) return '#9f7aea';
    if (props.isPremium) return 'rgba(159, 122, 234, 0.5)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PremiumBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 20px;
  background-color: #9f7aea;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
`;

const PlanHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PlanName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
`;

const PlanPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
`;

const FeatureItemDisabled = styled(FeatureItem)`
  color: rgba(255, 255, 255, 0.5);
`;

const FeatureCheck = styled.span<{ isPremium?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: ${props => props.isPremium ? '#9f7aea' : '#9f7aea'};
  color: white;
  border-radius: 50%;
  margin-right: 0.75rem;
  font-size: 0.7rem;
  font-weight: bold;
`;

const FeatureCheckDisabled = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  margin-right: 0.75rem;
  font-size: 0.7rem;
  font-weight: bold;
`;

const PlanButton = styled.button<{ isSelected: boolean; isPremium?: boolean }>`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: background-color 0.2s;
  
  background-color: ${props => {
    if (props.disabled) return 'rgba(255, 255, 255, 0.1)';
    if (props.isPremium) return '#6b46c1';
    return 'rgba(107, 70, 193, 0.7)';
  }};
  
  color: ${props => {
    if (props.disabled) return 'rgba(255, 255, 255, 0.7)';
    return 'white';
  }};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.isPremium ? '#9f7aea' : '#9f7aea'};
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const SecurityIcon = styled.span`
  margin-right: 0.5rem;
`;

export default PlanSelector; 