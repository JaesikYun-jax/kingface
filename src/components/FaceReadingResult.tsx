import React from 'react';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import { FaceReadingResult as FaceReadingResultType } from '../types';

interface FaceReadingResultProps {
  result: FaceReadingResultType;
  onRestart: () => void;
  onShare?: () => void;
  onReturn?: () => void;
}

const FaceReadingResult: React.FC<FaceReadingResultProps> = ({ 
  result,
  onRestart,
  onShare,
  onReturn
}) => {
  // 현재 날짜 포맷팅
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 얼굴 부위별 분석 데이터 추출
  const facialFeatureAnalysis = extractFacialFeatureAnalysis(result.content || '');

  return (
    <Container>
      <ResultHeader>
        <Title>당신의 관상 분석 결과</Title>
        <SubTitle>{currentDate} 기준</SubTitle>
      </ResultHeader>
      
      <ResultSection>
        <ImageSection>
          {result.imageUrl && (
            <ImageWrapper>
              <UserImage src={result.imageUrl} alt="분석된 얼굴" />
              <ImageOverlay />
            </ImageWrapper>
          )}
          <PersonalityTraitsCard>
            <TraitsHeader>핵심 성격 키워드</TraitsHeader>
            <PersonalityTraits>
              {result.personalityTraits.map((trait, index) => (
                <PersonalityTrait key={index}>{trait}</PersonalityTrait>
              ))}
            </PersonalityTraits>
          </PersonalityTraitsCard>
        </ImageSection>
        
        {/* 얼굴 부위별 분석 섹션 추가 */}
        <FacialFeaturesSection>
          <FeaturesHeader>얼굴 부위별 분석</FeaturesHeader>
          
          {facialFeatureAnalysis.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureContent>
                <ReactMarkdown>{feature.content}</ReactMarkdown>
              </FeatureContent>
            </FeatureCard>
          ))}
        </FacialFeaturesSection>
        
        <AnalysisSection>
          <AnalysisCard>
            <SectionIcon>🔮</SectionIcon>
            <SectionTitle>종합 운세</SectionTitle>
            <SectionContent>{result.overallFortune}</SectionContent>
          </AnalysisCard>
          
          <AnalysisCard>
            <SectionIcon>💼</SectionIcon>
            <SectionTitle>직업 적성</SectionTitle>
            <SectionContent>{result.careerSuitability}</SectionContent>
          </AnalysisCard>
          
          <AnalysisCard>
            <SectionIcon>👥</SectionIcon>
            <SectionTitle>대인 관계</SectionTitle>
            <SectionContent>{result.relationships}</SectionContent>
          </AnalysisCard>
          
          <AdviceCard>
            <AdviceIcon>💡</AdviceIcon>
            <AdviceTitle>금주의 기운과 조언</AdviceTitle>
            <AdviceContent>{result.advice}</AdviceContent>
          </AdviceCard>
        </AnalysisSection>
      </ResultSection>
      
      <Disclaimer>
        * 이 관상 분석은 AI를 활용한 참고용 결과로, 실제 특성이나 운세와 다를 수 있습니다.
      </Disclaimer>
      
      <ButtonContainer>
        <ActionButton onClick={onRestart} color="#4a5568">
          <ButtonIcon>🔄</ButtonIcon>
          다시 분석하기
        </ActionButton>
        
        {onReturn && (
          <ActionButton onClick={onReturn} color="#3182ce">
            <ButtonIcon>🏠</ButtonIcon>
            홈으로 돌아가기
          </ActionButton>
        )}
        
        {onShare ? (
          <ActionButton onClick={onShare} color="#6b46c1">
            <ButtonIcon>📤</ButtonIcon>
            결과 공유하기
          </ActionButton>
        ) : (
          <ActionButton onClick={() => window.print()} color="#6b46c1">
            <ButtonIcon>💾</ButtonIcon>
            결과 저장하기
          </ActionButton>
        )}
      </ButtonContainer>
    </Container>
  );
};

// 얼굴 부위별 분석 데이터 추출 함수
const extractFacialFeatureAnalysis = (content: string): Array<{icon: string, title: string, content: string}> => {
  const features = [
    { 
      icon: '🧠', 
      title: '이마 (지혜와 재능)', 
      content: extractSection(content, '이마', '눈') || '분석 정보가 없습니다.' 
    },
    { 
      icon: '👁️', 
      title: '눈 (성격과 감정)', 
      content: extractSection(content, '눈', '코') || '분석 정보가 없습니다.' 
    },
    { 
      icon: '👃', 
      title: '코 (재물운과 사회성)', 
      content: extractSection(content, '코', '입') || '분석 정보가 없습니다.' 
    },
    { 
      icon: '👄', 
      title: '입과 턱 (의지력과 대인관계)', 
      content: extractSection(content, '입', '귀') || '분석 정보가 없습니다.' 
    },
    { 
      icon: '👂', 
      title: '귀 (타고난 운과 가족)', 
      content: extractSection(content, '귀', '종합') || '분석 정보가 없습니다.' 
    }
  ];
  
  return features;
};

// 콘텐츠에서 특정 섹션 추출
const extractSection = (content: string, startSection: string, endSection: string): string => {
  const startIndex = content.indexOf(startSection);
  if (startIndex === -1) return '';
  
  const endIndex = content.indexOf(endSection, startIndex);
  if (endIndex === -1) return content.substring(startIndex);
  
  return content.substring(startIndex, endIndex).trim();
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
  background-color: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
`;

const ResultHeader = styled.div`
  background: linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%);
  padding: 2rem;
  color: white;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SubTitle = styled.p`
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
`;

const ResultSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ImageSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImageWrapper = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const UserImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  
  @media (min-width: 768px) {
    max-width: 100%;
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
`;

const PersonalityTraitsCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TraitsHeader = styled.h3`
  color: #4a5568;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
`;

const PersonalityTraits = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
`;

const PersonalityTrait = styled.span`
  display: inline-block;
  background-color: #e9d8fd;
  color: #6b46c1;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AnalysisSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AnalysisCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
  vertical-align: middle;
`;

const SectionTitle = styled.h3`
  display: inline-block;
  color: #4a5568;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  vertical-align: middle;
`;

const SectionContent = styled.p`
  color: #2d3748;
  font-size: 1rem;
  line-height: 1.8;
  white-space: pre-line;
`;

const AdviceCard = styled(AnalysisCard)`
  background-color: #f0fff4;
  border-left: 4px solid #38a169;
`;

const AdviceIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
  vertical-align: middle;
`;

const AdviceTitle = styled.h3`
  display: inline-block;
  color: #2f855a;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  vertical-align: middle;
`;

const AdviceContent = styled.p`
  color: #2d3748;
  font-size: 1rem;
  line-height: 1.8;
  white-space: pre-line;
`;

const Disclaimer = styled.p`
  font-size: 0.85rem;
  color: #718096;
  text-align: center;
  margin: 0;
  padding: 1rem 2rem 2rem;
  font-style: italic;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  background-color: white;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ButtonIcon = styled.span`
  margin-right: 0.5rem;
`;

const ActionButton = styled.button<{ color: string }>`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.color === '#6b46c1' ? '#6b46c1' : 'white'};
  color: ${props => props.color === '#6b46c1' ? 'white' : props.color};
  border: 1px solid ${props => props.color};
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.color};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;

// 얼굴 부위별 분석 섹션 스타일
const FacialFeaturesSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;
  
  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const FeaturesHeader = styled.h2`
  color: #4a5568;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
`;

const FeatureContent = styled.div`
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  
  p {
    margin: 0.5rem 0;
  }
  
  strong {
    color: #2d3748;
    font-weight: 600;
  }
`;

export default FaceReadingResult; 