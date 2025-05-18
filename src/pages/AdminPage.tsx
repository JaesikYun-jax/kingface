import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ServicePlanConfig, AIModelConfig } from '../types';

// 프롬프트 설정 타입 정의
interface PromptConfig {
  id: string;
  title: string;
  description: string;
  content: string;
}

// 어드민 페이지 탭
enum AdminTab {
  PROMPTS = 'prompts',
  SERVICE_PLANS = 'service_plans'
}

const AdminPage: React.FC = () => {
  // 현재 선택된 탭
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.PROMPTS);

  // ===== 프롬프트 설정 =====
  // 초기 프롬프트 설정
  const defaultPrompts: PromptConfig[] = [
    {
      id: 'fortune-system',
      title: '운세 프롬프트 (시스템)',
      description: '사주 & 타로 운세 생성에 사용되는 시스템 프롬프트',
      content: `당신은 사주와 타로를 결합하여 정확하고 긍정적인 운세를 제공하는 전문가입니다.
한국어로 답변을 제공하며, 사용자의 사주 정보와 선택한 타로 카드를 기반으로
전체적인 운세, 사랑, 직업, 건강 영역에 대한 통찰과 조언을 제공하세요.`
    },
    {
      id: 'facereading-system',
      title: '관상 분석 프롬프트 (시스템)',
      description: '관상 분석에 사용되는 시스템 프롬프트',
      content: `당신은 관상학에 기반한 얼굴 분석 전문가입니다. 
한국어로 답변을 제공하며, 사용자의 얼굴 사진을 분석하여 
성격 특성, 전반적인 운세, 직업 적성, 대인 관계에 대한 통찰과 조언을 제공하세요.

성격 특성은 키워드 형태로 5-7개 제공해주세요. (예: "리더십", "창의적", "섬세함" 등)

각 섹션을 명확히 구분하여 '성격 특성', '전체 운세', '직업 적성', '대인 관계', '조언'으로 나누어 분석해주세요.
긍정적이고 건설적인 분석을 제공하되, 전통적인 관상학의 특징도 함께 언급해주세요.`
    },
    {
      id: 'facereading-user',
      title: '관상 분석 프롬프트 (사용자)',
      description: '관상 분석에 사용되는 사용자 프롬프트',
      content: '제 얼굴 사진을 분석하여 관상을 봐주세요.'
    }
  ];

  const [prompts, setPrompts] = useState<PromptConfig[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptConfig | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // ===== 서비스 플랜 설정 =====
  const defaultServicePlan: ServicePlanConfig = {
    models: {
      fortune: {
        free: 'gpt-3.5-turbo',
        premium: 'gpt-4-turbo'
      },
      faceReading: 'gpt-4o'
    },
    features: {
      free: ['사주 기반 운세'],
      premium: ['사주 기반 운세', '타로 카드 해석', '관상 분석']
    },
    prices: {
      premium: 5000  // 5,000원
    }
  };

  const [servicePlan, setServicePlan] = useState<ServicePlanConfig>(defaultServicePlan);
  const [isServicePlanSaved, setIsServicePlanSaved] = useState<boolean>(false);

  // ===== 컴포넌트 마운트 시 로컬 스토리지에서 설정 로드 =====
  useEffect(() => {
    // 프롬프트 설정 로드
    const savedPrompts = localStorage.getItem('promptConfigs');
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    } else {
      setPrompts(defaultPrompts);
      localStorage.setItem('promptConfigs', JSON.stringify(defaultPrompts));
    }

    // 서비스 플랜 설정 로드
    const savedServicePlan = localStorage.getItem('servicePlanConfig');
    if (savedServicePlan) {
      setServicePlan(JSON.parse(savedServicePlan));
    } else {
      setServicePlan(defaultServicePlan);
      localStorage.setItem('servicePlanConfig', JSON.stringify(defaultServicePlan));
    }
  }, []);

  // ===== 프롬프트 관련 함수 =====
  // 프롬프트 선택
  const handleSelectPrompt = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId) || null;
    setSelectedPrompt(prompt);
    setIsSaved(false);
    setSaveMessage('');
  };

  // 프롬프트 내용 변경
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedPrompt) return;
    
    setSelectedPrompt({
      ...selectedPrompt,
      content: e.target.value
    });
    setIsSaved(false);
  };

  // 프롬프트 저장
  const handleSavePrompt = () => {
    if (!selectedPrompt) return;
    
    const updatedPrompts = prompts.map(p => 
      p.id === selectedPrompt.id ? selectedPrompt : p
    );
    
    setPrompts(updatedPrompts);
    localStorage.setItem('promptConfigs', JSON.stringify(updatedPrompts));
    setIsSaved(true);
    setSaveMessage('프롬프트가 성공적으로 저장되었습니다!');
    
    // 2초 후 메시지 초기화
    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  };

  // 프롬프트 초기화
  const handleResetPrompts = () => {
    if (window.confirm('모든 프롬프트를 기본값으로 초기화하시겠습니까?')) {
      setPrompts(defaultPrompts);
      localStorage.setItem('promptConfigs', JSON.stringify(defaultPrompts));
      setSelectedPrompt(null);
      setIsSaved(false);
      setSaveMessage('모든 프롬프트가 초기화되었습니다.');
      
      // 2초 후 메시지 초기화
      setTimeout(() => {
        setSaveMessage('');
      }, 2000);
    }
  };

  // ===== 서비스 플랜 관련 함수 =====
  // 서비스 플랜 모델 설정 변경
  const handleModelChange = (modelType: string, planType: string, value: string) => {
    let updatedModels = { ...servicePlan.models };
    
    if (modelType === 'fortune') {
      updatedModels.fortune = {
        ...updatedModels.fortune,
        [planType]: value
      };
    } else if (modelType === 'faceReading') {
      updatedModels.faceReading = value;
    }
    
    setServicePlan({
      ...servicePlan,
      models: updatedModels
    });
    
    setIsServicePlanSaved(false);
  };

  // 서비스 플랜 가격 변경
  const handlePriceChange = (value: string) => {
    const price = parseInt(value) || 0;
    
    setServicePlan({
      ...servicePlan,
      prices: {
        ...servicePlan.prices,
        premium: price
      }
    });
    
    setIsServicePlanSaved(false);
  };

  // 서비스 플랜 저장
  const handleSaveServicePlan = () => {
    localStorage.setItem('servicePlanConfig', JSON.stringify(servicePlan));
    setIsServicePlanSaved(true);
    setSaveMessage('서비스 플랜이 성공적으로 저장되었습니다!');
    
    // 2초 후 메시지 초기화
    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  };

  // 서비스 플랜 초기화
  const handleResetServicePlan = () => {
    if (window.confirm('서비스 플랜 설정을 기본값으로 초기화하시겠습니까?')) {
      setServicePlan(defaultServicePlan);
      localStorage.setItem('servicePlanConfig', JSON.stringify(defaultServicePlan));
      setIsServicePlanSaved(false);
      setSaveMessage('서비스 플랜이 초기화되었습니다.');
      
      // 2초 후 메시지 초기화
      setTimeout(() => {
        setSaveMessage('');
      }, 2000);
    }
  };

  return (
    <Container>
      <Title>관리자 페이지</Title>
      <Description>
        AI 응답 생성 프롬프트 및 서비스 플랜을 관리하는 페이지입니다.
        수정한 설정은 실제 서비스에 즉시 반영됩니다.
      </Description>
      
      <TabContainer>
        <TabButton 
          isActive={activeTab === AdminTab.PROMPTS}
          onClick={() => setActiveTab(AdminTab.PROMPTS)}
        >
          프롬프트 설정
        </TabButton>
        <TabButton 
          isActive={activeTab === AdminTab.SERVICE_PLANS}
          onClick={() => setActiveTab(AdminTab.SERVICE_PLANS)}
        >
          서비스 플랜 설정
        </TabButton>
      </TabContainer>
      
      {activeTab === AdminTab.PROMPTS && (
        <Content>
          <Sidebar>
            <SidebarTitle>프롬프트 목록</SidebarTitle>
            <PromptList>
              {prompts.map(prompt => (
                <PromptItem 
                  key={prompt.id}
                  isSelected={selectedPrompt?.id === prompt.id}
                  onClick={() => handleSelectPrompt(prompt.id)}
                >
                  {prompt.title}
                </PromptItem>
              ))}
            </PromptList>
            <ResetButton onClick={handleResetPrompts}>
              모든 프롬프트 초기화
            </ResetButton>
          </Sidebar>
          
          <MainContent>
            {selectedPrompt ? (
              <>
                <PromptHeader>
                  <PromptTitle>{selectedPrompt.title}</PromptTitle>
                  <PromptDescription>{selectedPrompt.description}</PromptDescription>
                </PromptHeader>
                
                <TextareaContainer>
                  <PromptTextarea 
                    value={selectedPrompt.content}
                    onChange={handleContentChange}
                    rows={15}
                  />
                </TextareaContainer>
                
                <SaveButtonContainer>
                  <SaveButton 
                    onClick={handleSavePrompt}
                    disabled={isSaved}
                  >
                    저장하기
                  </SaveButton>
                  {saveMessage && <SaveMessage>{saveMessage}</SaveMessage>}
                </SaveButtonContainer>
              </>
            ) : (
              <NoSelection>
                좌측 목록에서 수정할 프롬프트를 선택해주세요.
              </NoSelection>
            )}
          </MainContent>
        </Content>
      )}
      
      {activeTab === AdminTab.SERVICE_PLANS && (
        <Content>
          <MainContent fullWidth>
            <SectionTitle>서비스 플랜 설정</SectionTitle>
            
            <ServicePlanSection>
              <SectionSubtitle>AI 모델 설정</SectionSubtitle>
              
              <FormGroup>
                <FormLabel>무료 플랜 - 운세 분석 모델</FormLabel>
                <ModelSelect 
                  value={servicePlan.models.fortune.free}
                  onChange={(e) => handleModelChange('fortune', 'free', e.target.value)}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (저렴)</option>
                  <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (고품질)</option>
                </ModelSelect>
                <FormHint>무료 플랜에서 사용할 AI 모델입니다. 저렴한 모델 선택을 권장합니다.</FormHint>
              </FormGroup>
              
              <FormGroup>
                <FormLabel>유료 플랜 - 운세 분석 모델</FormLabel>
                <ModelSelect 
                  value={servicePlan.models.fortune.premium}
                  onChange={(e) => handleModelChange('fortune', 'premium', e.target.value)}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (저렴)</option>
                  <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (고품질)</option>
                </ModelSelect>
                <FormHint>유료 플랜에서는 보다 정확한 결과를 위해 고품질 모델 선택을 권장합니다.</FormHint>
              </FormGroup>
              
              <FormGroup>
                <FormLabel>관상 분석 모델 (유료 플랜 전용)</FormLabel>
                <ModelSelect 
                  value={servicePlan.models.faceReading}
                  onChange={(e) => handleModelChange('faceReading', '', e.target.value)}
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                </ModelSelect>
                <FormHint>이미지 분석을 위한 AI 모델입니다. GPT-4o는 가장 최신 모델로 이미지 분석 기능을 지원합니다.</FormHint>
              </FormGroup>
            </ServicePlanSection>
            
            <ServicePlanSection>
              <SectionSubtitle>요금 설정</SectionSubtitle>
              
              <FormGroup>
                <FormLabel>유료 플랜 가격 (원)</FormLabel>
                <PriceInput 
                  type="number" 
                  value={servicePlan.prices.premium} 
                  onChange={(e) => handlePriceChange(e.target.value)}
                  min="0"
                  step="1000"
                />
                <FormHint>유료 플랜의 가격을 설정합니다. 권장 가격은 3,000원~10,000원 사이입니다.</FormHint>
              </FormGroup>
            </ServicePlanSection>
            
            <ServicePlanFeatures>
              <FeatureColumn>
                <FeatureColumnTitle>무료 플랜 기능</FeatureColumnTitle>
                <FeatureList>
                  {servicePlan.features.free.map((feature, index) => (
                    <FeatureItem key={index}>✓ {feature}</FeatureItem>
                  ))}
                </FeatureList>
              </FeatureColumn>
              
              <FeatureColumn highlight>
                <FeatureColumnTitle>유료 플랜 기능</FeatureColumnTitle>
                <FeatureList>
                  {servicePlan.features.premium.map((feature, index) => (
                    <FeatureItem key={index}>✓ {feature}</FeatureItem>
                  ))}
                </FeatureList>
                <FeaturePrice>{servicePlan.prices.premium.toLocaleString()}원</FeaturePrice>
              </FeatureColumn>
            </ServicePlanFeatures>
            
            <ButtonContainer>
              <SaveButton 
                onClick={handleSaveServicePlan}
                disabled={isServicePlanSaved}
              >
                설정 저장하기
              </SaveButton>
              <ResetButton onClick={handleResetServicePlan}>
                기본값으로 초기화
              </ResetButton>
              {saveMessage && <SaveMessage>{saveMessage}</SaveMessage>}
            </ButtonContainer>
          </MainContent>
        </Content>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 2rem;
  max-width: 800px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 1rem 1.5rem;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.isActive ? '#6b46c1' : 'transparent'};
  color: ${props => props.isActive ? '#2d3748' : '#718096'};
  font-size: 1.1rem;
  font-weight: ${props => props.isActive ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #2d3748;
  }
`;

const Content = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const PromptItem = styled.div<{ isSelected: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: ${props => props.isSelected ? '#e9d8fd' : '#f7fafc'};
  color: ${props => props.isSelected ? '#553c9a' : '#4a5568'};
  font-weight: ${props => props.isSelected ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#e9d8fd' : '#edf2f7'};
  }
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #feb2b2;
  color: #c53030;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #fc8181;
  }
`;

const MainContent = styled.div<{ fullWidth?: boolean }>`
  flex: 1;
  min-height: 500px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  ${props => props.fullWidth && 'width: 100%;'}
`;

const NoSelection = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  font-size: 1.2rem;
`;

const PromptHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const PromptTitle = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const PromptDescription = styled.p`
  font-size: 1rem;
  color: #718096;
`;

const TextareaContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const PromptTextarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 300px;
  
  &:focus {
    outline: none;
    border-color: #805ad5;
    box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.2);
  }
`;

const SaveButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #6b46c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #553c9a;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const SaveMessage = styled.span`
  color: #38a169;
  font-weight: 500;
`;

// 서비스 플랜 페이지 스타일
const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
`;

const SectionSubtitle = styled.h3`
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ServicePlanSection = styled.div`
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4a5568;
`;

const FormHint = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.5rem;
`;

const ModelSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  color: #2d3748;
  
  &:focus {
    outline: none;
    border-color: #805ad5;
    box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.2);
  }
`;

const PriceInput = styled.input`
  width: 100%;
  max-width: 200px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #2d3748;
  
  &:focus {
    outline: none;
    border-color: #805ad5;
    box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.2);
  }
`;

const ServicePlanFeatures = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FeatureColumn = styled.div<{ highlight?: boolean }>`
  flex: 1;
  padding: 1.5rem;
  border-radius: 10px;
  background-color: ${props => props.highlight ? '#f0f9ff' : '#f7fafc'};
  border: 1px solid ${props => props.highlight ? '#bae6fd' : '#e2e8f0'};
  ${props => props.highlight && 'box-shadow: 0 4px 10px rgba(56, 189, 248, 0.1);'}
`;

const FeatureColumnTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const FeatureItem = styled.li`
  padding: 0.5rem 0;
  color: #4a5568;
  font-size: 1rem;
`;

const FeaturePrice = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0284c7;
  margin-top: 1rem;
`;

export default AdminPage; 