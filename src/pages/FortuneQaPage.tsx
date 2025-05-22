import React, { useState } from 'react';
import styled from '@emotion/styled';
import FortuneResult from '../components/FortuneResult';
import { FortuneResult as FortuneResultType, TarotCard } from '../types';

// 더미 데이터 생성 - 실제 API 응답과 유사한 형태
const dummyTarotCard: TarotCard = {
  id: 1,
  name: '운명의 수레바퀴',
  image: 'https://source.unsplash.com/random/300x400/?tarot',
  meaning: '변화와 운명의 흐름을 상징하는 카드입니다. 인생의 중요한 전환점에 있음을 의미합니다.',
  description: '변화, 기회, 운명, 전환점'
};

const dummyFortuneResult: FortuneResultType = {
  overall: `## ✨ 전체 운세

당신은 현재 삶의 중요한 교차로에 서 있습니다. 사주팔자의 흐름이 변화하고 있으며, 이번 달부터 시작되는 새로운 운세의 흐름이 약 3년간 지속될 것입니다. 천간과 지지의 조합이 당신에게 새로운 기회를 가져오고 있으며, 특히 창의적인 활동과 지적 발전에 유리한 시기가 됩니다.

## 💕 사랑

현재 당신의 애정운은 약간의 기복이 있지만, 전반적으로 안정을 찾아가는 과정에 있습니다. 기존의 관계에 있는 분들은 서로의 이해도가 높아지고, 더 깊은 교감을 나눌 수 있는 시간이 될 것입니다. 솔로인 분들은 11월경에 의미 있는 만남이 있을 수 있으니, 사회적 활동에 적극적으로 참여하는 것이 좋습니다.

## 🏢 직업

직업적으로는 안정기에 접어들고 있으며, 그동안의 노력이 인정받을 시기입니다. 특히 커뮤니케이션과 관련된 업무에서 두각을 나타낼 수 있으며, 협업 프로젝트에서 리더십을 발휘할 기회가 있을 것입니다. 12월에는 새로운 업무 제안이나 프로젝트가 시작될 수 있으니 준비하는 자세가 필요합니다.

## 🌿 건강

건강 면에서는 스트레스 관리에 특별히 신경 써야 합니다. 소화기 계통에 약간의 약점이 보이니, 규칙적인 식사와 충분한 휴식이 중요합니다. 또한 가벼운 유산소 운동을 꾸준히 하는 것이 전반적인 건강 유지에 도움이 될 것입니다. 특히 10월부터 11월까지는 과로를 피하고 충분한 수면을 취하는 것이 중요합니다.

## 💌 아이보살의 조언

1. **균형 잡힌 생활**: 일과 휴식, 사회생활과 개인시간의 균형을 잘 맞추세요. 현재 당신에게는 모든 영역의 조화가 중요한 시기입니다.

2. **직관 신뢰하기**: 중요한 결정을 내릴 때는 논리적 분석도 중요하지만, 당신의 직관도 믿으세요. 특히 대인관계에 관한 판단에서 그러합니다.

3. **새로운 지식 습득**: 새로운 기술이나 지식을 배우는 것이 이 시기에 매우 유익할 것입니다. 온라인 강의나 독서를 통해 자기계발에 투자하세요.

4. **감사 습관 들이기**: 매일 작은 것에도 감사하는 마음을 가지면, 운세의 흐름이 더욱 긍정적으로 바뀔 수 있습니다. 감사 일기를 써보는 것도 좋은 방법입니다.`,
  love: '현재 당신의 애정운은 약간의 기복이 있지만, 전반적으로 안정을 찾아가는 과정에 있습니다. 기존의 관계에 있는 분들은 서로의 이해도가 높아지고, 더 깊은 교감을 나눌 수 있는 시간이 될 것입니다.',
  career: '직업적으로는 안정기에 접어들고 있으며, 그동안의 노력이 인정받을 시기입니다. 특히 커뮤니케이션과 관련된 업무에서 두각을 나타낼 수 있으며, 협업 프로젝트에서 리더십을 발휘할 기회가 있을 것입니다.',
  health: '건강 면에서는 스트레스 관리에 특별히 신경 써야 합니다. 소화기 계통에 약간의 약점이 보이니, 규칙적인 식사와 충분한 휴식이 중요합니다.',
  advice: '균형 잡힌 생활을 유지하고, 직관을 신뢰하며, 새로운 지식을 습득하고, 감사하는 마음을 가지세요.'
};

// 디자인 변형 옵션 인터페이스
interface DesignOption {
  id: string;
  name: string;
  description: string;
}

// 스타일 설정 인터페이스
interface StyleSettings {
  contentPadding: number;
  contentMargin: number;
  resultTitleSize: number;
  textSize: number;
  backgroundColor: string;
  simplifiedBox: boolean;
}

const FortuneQaPage: React.FC = () => {
  // 디자인 변형 옵션
  const designOptions: DesignOption[] = [
    { 
      id: 'default', 
      name: '기본 디자인', 
      description: '원래 디자인' 
    },
    { 
      id: 'reduced-margins', 
      name: '여백 줄인 버전', 
      description: '좌우 여백을 줄인 디자인' 
    },
    { 
      id: 'simplified-box', 
      name: '박스 구조 변경', 
      description: '중첩 박스를 단순화한 디자인' 
    },
    { 
      id: 'custom', 
      name: '직접 조절하기', 
      description: '모든 수치를 직접 조절' 
    }
  ];

  // 현재 선택된 디자인 옵션 상태
  const [selectedOption, setSelectedOption] = useState<string>('default');
  
  // 스타일 설정 상태 관리
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    contentPadding: 1.5,
    contentMargin: 1,
    resultTitleSize: 1.8,
    textSize: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    simplifiedBox: false
  });
  
  // 리셋 함수 (실제로는 아무 동작도 하지 않음, 단순 테스트용)
  const handleRestart = () => {
    alert('다시 시작하기 버튼이 클릭되었습니다.');
  };

  // 디자인 옵션 변경 처리
  const handleOptionChange = (optionId: string) => {
    setSelectedOption(optionId);
    
    // 사전 정의된 스타일 설정 적용
    switch(optionId) {
      case 'default':
        setStyleSettings({
          contentPadding: 1.5,
          contentMargin: 1,
          resultTitleSize: 1.8,
          textSize: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          simplifiedBox: false
        });
        break;
      case 'reduced-margins':
        setStyleSettings({
          contentPadding: 0.75,
          contentMargin: 0.5,
          resultTitleSize: 1.8,
          textSize: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          simplifiedBox: false
        });
        break;
      case 'simplified-box':
        setStyleSettings({
          contentPadding: 1.5,
          contentMargin: 1,
          resultTitleSize: 1.8,
          textSize: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          simplifiedBox: true
        });
        break;
      // custom 옵션은 현재 설정 유지
    }
  };

  // 스타일 설정 변경 처리
  const handleStyleChange = (name: keyof StyleSettings, value: any) => {
    setStyleSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 직접 조절 시 옵션을 'custom'으로 변경
    if (selectedOption !== 'custom') {
      setSelectedOption('custom');
    }
  };

  // CSS 변수로 전달할 스타일 객체 생성
  const customStyles = {
    '--content-padding': `${styleSettings.contentPadding}rem`,
    '--content-margin': `${styleSettings.contentMargin}rem`,
    '--result-title-size': `${styleSettings.resultTitleSize}rem`,
    '--text-size': `${styleSettings.textSize}rem`,
    '--background-color': styleSettings.backgroundColor,
  } as React.CSSProperties;

  return (
    <QaContainer>
      <QaHeader>
        <h1>FortuneResult 컴포넌트 QA 페이지</h1>
        <p>UI 디자인 변형을 테스트하기 위한 페이지입니다.</p>
      </QaHeader>

      <OptionsContainer>
        <h2>디자인 옵션</h2>
        <OptionButtons>
          {designOptions.map(option => (
            <OptionButton 
              key={option.id}
              isSelected={selectedOption === option.id}
              onClick={() => handleOptionChange(option.id)}
            >
              <div>{option.name}</div>
              <small>{option.description}</small>
            </OptionButton>
          ))}
        </OptionButtons>
      </OptionsContainer>

      {/* 직접 조절 패널 추가 */}
      <ControlPanel isVisible={selectedOption === 'custom'}>
        <ControlPanelTitle>스타일 직접 조절</ControlPanelTitle>
        
        <ControlGroup>
          <ControlLabel>컨텐츠 패딩 ({styleSettings.contentPadding}rem)</ControlLabel>
          <RangeControl 
            type="range" 
            min="0" 
            max="3" 
            step="0.25" 
            value={styleSettings.contentPadding}
            onChange={(e) => handleStyleChange('contentPadding', parseFloat(e.target.value))}
          />
        </ControlGroup>
        
        <ControlGroup>
          <ControlLabel>컨텐츠 마진 ({styleSettings.contentMargin}rem)</ControlLabel>
          <RangeControl 
            type="range" 
            min="0" 
            max="3" 
            step="0.25" 
            value={styleSettings.contentMargin}
            onChange={(e) => handleStyleChange('contentMargin', parseFloat(e.target.value))}
          />
        </ControlGroup>
        
        <ControlGroup>
          <ControlLabel>제목 크기 ({styleSettings.resultTitleSize}rem)</ControlLabel>
          <RangeControl 
            type="range" 
            min="1" 
            max="3" 
            step="0.1" 
            value={styleSettings.resultTitleSize}
            onChange={(e) => handleStyleChange('resultTitleSize', parseFloat(e.target.value))}
          />
        </ControlGroup>
        
        <ControlGroup>
          <ControlLabel>텍스트 크기 배율 ({styleSettings.textSize})</ControlLabel>
          <RangeControl 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.05" 
            value={styleSettings.textSize}
            onChange={(e) => handleStyleChange('textSize', parseFloat(e.target.value))}
          />
        </ControlGroup>
        
        <ControlGroup>
          <ControlLabel>배경색</ControlLabel>
          <ColorOptions>
            <ColorOption 
              color="rgba(0, 0, 0, 0.2)" 
              isSelected={styleSettings.backgroundColor === "rgba(0, 0, 0, 0.2)"}
              onClick={() => handleStyleChange('backgroundColor', "rgba(0, 0, 0, 0.2)")}
            />
            <ColorOption 
              color="rgba(255, 255, 255, 0.1)" 
              isSelected={styleSettings.backgroundColor === "rgba(255, 255, 255, 0.1)"}
              onClick={() => handleStyleChange('backgroundColor', "rgba(255, 255, 255, 0.1)")}
            />
            <ColorOption 
              color="rgba(107, 70, 193, 0.2)" 
              isSelected={styleSettings.backgroundColor === "rgba(107, 70, 193, 0.2)"}
              onClick={() => handleStyleChange('backgroundColor', "rgba(107, 70, 193, 0.2)")}
            />
            <ColorOption 
              color="rgba(45, 55, 72, 0.3)" 
              isSelected={styleSettings.backgroundColor === "rgba(45, 55, 72, 0.3)"}
              onClick={() => handleStyleChange('backgroundColor', "rgba(45, 55, 72, 0.3)")}
            />
          </ColorOptions>
        </ControlGroup>
        
        <ControlGroup>
          <ControlLabel>박스 구조</ControlLabel>
          <ToggleSwitch>
            <ToggleInput 
              type="checkbox" 
              checked={styleSettings.simplifiedBox}
              onChange={(e) => handleStyleChange('simplifiedBox', e.target.checked)}
            />
            <ToggleSlider />
            <ToggleLabel>{styleSettings.simplifiedBox ? '단순화된 구조' : '기본 구조'}</ToggleLabel>
          </ToggleSwitch>
        </ControlGroup>
      </ControlPanel>

      {/* 설명 섹션 */}
      <InfoSection>
        <InfoTitle>현재 선택된 디자인: {designOptions.find(opt => opt.id === selectedOption)?.name}</InfoTitle>
        <InfoDescription>
          {selectedOption === 'reduced-margins' && 
            '이 버전은 좌우 여백을 줄이고 전체 화면을 더 효율적으로 사용합니다. 모바일 화면에서 콘텐츠 가독성이 향상됩니다.'}
          {selectedOption === 'simplified-box' && 
            '이 버전은 중첩 박스 구조를 단순화하여, 한 단계의 박스를 제거했습니다. UI가 더 깔끔하고 단순해집니다.'}
          {selectedOption === 'default' && 
            '원래 디자인입니다. 비교를 위한 기준점으로 사용됩니다.'}
          {selectedOption === 'custom' && 
            '현재 모든 수치를 직접 조절 중입니다. 위의 컨트롤러를 사용하여 원하는 대로 UI를 조정할 수 있습니다.'}
        </InfoDescription>
      </InfoSection>

      {/* 미리보기 제목 */}
      <PreviewTitle>미리보기</PreviewTitle>

      {/* 결과 컴포넌트 렌더링 */}
      <ResultContainer style={customStyles}>
        <StyledFortuneResult 
          result={dummyFortuneResult} 
          selectedCard={dummyTarotCard}
          onRestart={handleRestart}
          customStyles={styleSettings}
          simplifiedBox={styleSettings.simplifiedBox}
        />
      </ResultContainer>
    </QaContainer>
  );
};

// 스타일 컴포넌트
const QaContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Pretendard', sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const QaHeader = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  
  h1 {
    font-size: 2rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
  }
`;

const OptionsContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f7fafc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2d3748;
  }
`;

const OptionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const OptionButton = styled.button<{ isSelected: boolean }>`
  padding: 1rem 1.5rem;
  border: 2px solid ${props => props.isSelected ? '#6b46c1' : 'rgba(107, 70, 193, 0.3)'};
  background-color: ${props => props.isSelected ? 'rgba(107, 70, 193, 0.5)' : 'rgba(74, 21, 81, 0.3)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 200px;
  
  &:hover {
    border-color: #6b46c1;
    background-color: ${props => props.isSelected ? 'rgba(107, 70, 193, 0.5)' : 'rgba(107, 70, 193, 0.4)'};
  }
  
  div {
    font-weight: ${props => props.isSelected ? '700' : '500'};
    font-size: 1.1rem;
    color: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)'};
    margin-bottom: 0.5rem;
  }
  
  small {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
`;

// 컨트롤 패널 스타일
const ControlPanel = styled.div<{ isVisible: boolean }>`
  display: ${props => props.isVisible ? 'block' : 'none'};
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: rgba(74, 21, 81, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #6b46c1;
`;

const ControlPanelTitle = styled.h3`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const ControlLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const RangeControl = styled.input`
  width: 100%;
  height: 8px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background: #e2e8f0;
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6b46c1;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6b46c1;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  &::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ColorOption = styled.button<{ color: string; isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 3px solid ${props => props.isSelected ? '#6b46c1' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    border-color: ${props => props.isSelected ? '#6b46c1' : '#a0aec0'};
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #6b46c1;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #cbd5e0;
  border-radius: 24px;
  transition: all 0.2s;
  margin-right: 1rem;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.2s;
  }
`;

const ToggleLabel = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: rgba(74, 21, 81, 0.3);
  border-left: 4px solid #6b46c1;
  border-radius: 4px;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
`;

const InfoDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const PreviewTitle = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
`;

const ResultContainer = styled.div`
  background-color: #1a202c;
  padding: 2rem;
  border-radius: 16px;
  
  @media (max-width: 768px) {
    padding: 0;
    border-radius: 0;
  }
`;

// 스타일 커스터마이징을 위한 FortuneResult 래퍼
const StyledFortuneResult = styled(FortuneResult)<{ 
  customStyles: StyleSettings;
  simplifiedBox: boolean;
}>`
  /* 이 컴포넌트의 내부 스타일을 조작하기 위한 CSS 변수 전달 */
  .content-wrapper {
    padding: var(--content-padding, 1.5rem) !important;
    margin: var(--content-margin, 1rem) !important;
  }
  
  .markdown-container {
    background-color: var(--background-color, rgba(0, 0, 0, 0.2)) !important;
  }
  
  .result-title {
    font-size: var(--result-title-size, 1.8rem) !important;
  }
  
  .markdown-content p, .markdown-content li {
    font-size: calc(1rem * var(--text-size, 1)) !important;
  }
  
  .markdown-content h2 {
    font-size: calc(1.5rem * var(--text-size, 1)) !important;
  }
`;

export default FortuneQaPage; 