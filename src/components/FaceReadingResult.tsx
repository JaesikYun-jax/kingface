import React, { useState } from 'react';
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
  // 디버그 모달 상태 관리
  const [showDebugModal, setShowDebugModal] = useState<boolean>(false);
  // 원본 분석 결과 표시 여부 - 기본값을 true로 변경
  const [showOriginalContent, setShowOriginalContent] = useState<boolean>(true);

  // 현재 날짜 포맷팅
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 클립보드에 복사 함수
  const copyToClipboard = async () => {
    if (!result.content) return;
    
    try {
      // 마크다운 원본 내용에 홍보 문구 추가
      const shareText = `${result.content}\n\n------------------\n\n당신의 운명이 궁금하다면? 아이보살이 도와드립니다 💫\n⭐ kingface.difflabs.xyz ⭐`;
      
      await navigator.clipboard.writeText(shareText);
      alert('분석 결과가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <Container>
      {/* 디버그 버튼 추가 */}
      <DebugButton onClick={() => setShowDebugModal(true)}>
        🐛
      </DebugButton>

      {/* 디버그 모달 */}
      {showDebugModal && (
        <DebugModal>
          <DebugModalContent>
            <DebugModalHeader>
              <h2>API 응답 디버그</h2>
              <CloseButton onClick={() => setShowDebugModal(false)}>✕</CloseButton>
            </DebugModalHeader>
            <DebugModalBody>
              <h3>원본 응답 내용:</h3>
              <pre>{result.content || '응답 데이터가 없습니다.'}</pre>
              
              <h3>파싱된 데이터:</h3>
              <DebugTable>
                <tbody>
                  <tr>
                    <td>성격 특성:</td>
                    <td>{result.personalityTraits.join(', ') || '데이터 없음'}</td>
                  </tr>
                  <tr>
                    <td>전반적 운세:</td>
                    <td>{result.overallFortune || '데이터 없음'}</td>
                  </tr>
                  <tr>
                    <td>직업 적성:</td>
                    <td>{result.careerSuitability || '데이터 없음'}</td>
                  </tr>
                  <tr>
                    <td>대인 관계:</td>
                    <td>{result.relationships || '데이터 없음'}</td>
                  </tr>
                  <tr>
                    <td>조언:</td>
                    <td>{result.advice || '데이터 없음'}</td>
                  </tr>
                </tbody>
              </DebugTable>
            </DebugModalBody>
          </DebugModalContent>
        </DebugModal>
      )}

      <ResultHeader>
        <Title>당신의 관상 분석 결과</Title>
        <SubTitle>{currentDate} 기준</SubTitle>
      </ResultHeader>

      {/* 원본 마크다운 콘텐츠 - 기본적으로 표시됨 */}
      {showOriginalContent && (
        <OriginalContent>
          {/* 분석 이미지 상단에 표시 */}
          {result.imageUrl && (
            <UserImageContainer>
              <CenteredUserImage src={result.imageUrl} alt="분석된 얼굴" />
            </UserImageContainer>
          )}

          {/* 아이보살 분석 결과 제목 */}
          <ResultTitle>아이보살의 관상 분석 결과</ResultTitle>
          
          {/* 원본 마크다운 콘텐츠 */}
          <ReactMarkdown>{result.content || '분석 결과가 없습니다.'}</ReactMarkdown>
        </OriginalContent>
      )}
      
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
        
        <ActionButton onClick={onShare || copyToClipboard} color="#6b46c1">
          <ButtonIcon>📋</ButtonIcon>
          결과 복사하기
        </ActionButton>
      </ButtonContainer>
    </Container>
  );
};

// 얼굴 부위별 분석 데이터 추출 함수
const extractFacialFeatureAnalysis = (content: string): Array<{icon: string, title: string, content: string}> => {
  // 콘솔에 원본 내용을 출력하여 디버깅 지원
  console.log("Raw content for parsing:", content);

  // 기본 구조 정의
  const features = [
    { 
      icon: '🧠', 
      title: '이마 (지혜와 재능)', 
      keywords: ['이마', '앞이마', '이마(額)', '額'], 
      content: '분석 정보가 없습니다.' 
    },
    { 
      icon: '👁️', 
      title: '눈 (성격과 감정)', 
      keywords: ['눈', '눈동자', '눈썹', '눈과 눈썹', '눈(目)', '目'], 
      content: '분석 정보가 없습니다.' 
    },
    { 
      icon: '👃', 
      title: '코 (재물운과 사회성)', 
      keywords: ['코', '코(鼻)', '鼻'], 
      content: '분석 정보가 없습니다.' 
    },
    { 
      icon: '👄', 
      title: '입과 턱 (의지력과 대인관계)', 
      keywords: ['입', '턱', '입술', '입과 턱', '입턱', '입(口)', '口顎'], 
      content: '분석 정보가 없습니다.' 
    },
    { 
      icon: '👂', 
      title: '귀 (타고난 운과 가족)', 
      keywords: ['귀', '귀(耳)', '耳'], 
      content: '분석 정보가 없습니다.' 
    }
  ];
  
  try {
    // 새로운 접근법: 표준화된 마크다운 헤더를 기반으로 섹션 추출
    
    // 마크다운에서 '## 얼굴 부위별 분석' 섹션 찾기
    const analysisHeaderRegex = /## 얼굴 부위별 분석/i;
    const analysisMatch = content.match(analysisHeaderRegex);
    
    if (analysisMatch && analysisMatch.index !== undefined) {
      const sectionStart = analysisMatch.index + analysisMatch[0].length;
      
      // 다음 '##' 헤더까지 또는 내용 끝까지
      const nextHeaderMatch = content.substring(sectionStart).match(/\n## /);
      const sectionEnd = nextHeaderMatch && nextHeaderMatch.index !== undefined
        ? sectionStart + nextHeaderMatch.index
        : content.length;
      
      // 얼굴 부위별 분석 섹션만 추출
      const facialFeaturesSection = content.substring(sectionStart, sectionEnd).trim();
      
      // 각 얼굴 부위 섹션 추출 (### 헤더로 구분)
      features.forEach((feature) => {
        for (const keyword of feature.keywords) {
          const headerRegex = new RegExp(`### ${keyword}[^#]*(?=###|$)`, 'i');
          const match = facialFeaturesSection.match(headerRegex);
          
          if (match && match[0]) {
            // 헤더 라인 제거
            let extracted = match[0].replace(/^### .+\n/, '').trim();
            
            if (extracted) {
              feature.content = extracted;
              break;
            }
          }
        }
      });
      
      // 더 일반적인 접근 방식으로 재시도 (### 이마, ### 눈 등)
      features.forEach((feature, index) => {
        if (feature.content === '분석 정보가 없습니다.') {
          const headerText = feature.title.split(' ')[0]; // "이마", "눈" 등만 사용
          const headerRegex = new RegExp(`### ${headerText}[^#]*(?=###|$)`, 'i');
          const match = facialFeaturesSection.match(headerRegex);
          
          if (match && match[0]) {
            // 헤더 라인 제거
            let extracted = match[0].replace(/^### .+\n/, '').trim();
            
            if (extracted) {
              feature.content = extracted;
            }
          }
        }
      });
    }
    
    // 새 방식으로 추출 실패 시 기존 방식으로 대체
    features.forEach((feature, index) => {
      if (feature.content === '분석 정보가 없습니다.') {
        // 특징 키워드 중 하나라도 매칭되면 내용 추출
        for (const keyword of feature.keywords) {
          // 다양한 패턴으로 검색 시도
          let extracted = extractSectionByPattern(content, keyword);
          
          if (extracted) {
            feature.content = extracted;
            break;
          }
        }
        
        // 내용이 없으면 두 번째 시도: 마크다운 헤더 패턴으로 검색
        if (feature.content === '분석 정보가 없습니다.') {
          // 마크다운 헤더 패턴으로 시도
          for (const keyword of feature.keywords) {
            const headerRegex = new RegExp(`#+\\s*${keyword}[\\s\\S]*?(?=#+\\s|$)`, 'i');
            const match = content.match(headerRegex);
            if (match) {
              feature.content = match[0].trim();
              break;
            }
          }
        }
        
        // 여전히 내용이 없으면 단순 키워드 포함 여부 확인
        if (feature.content === '분석 정보가 없습니다.') {
          for (const keyword of feature.keywords) {
            if (content.includes(keyword)) {
              // 키워드 주변 문맥 추출 (50자 전후)
              const keywordIndex = content.indexOf(keyword);
              const start = Math.max(0, keywordIndex - 50);
              const end = Math.min(content.length, keywordIndex + 100);
              feature.content = content.substring(start, end).trim();
              break;
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error extracting facial features:', error);
  }
  
  // 디버그 로깅
  console.log('Extracted facial features:', features.map(f => ({ title: f.title, content: f.content.substring(0, 30) + '...' })));
  
  return features;
};

// 다양한 패턴으로 섹션 추출 시도
const extractSectionByPattern = (content: string, sectionName: string): string | null => {
  // 콘텐츠가 없으면 null 반환
  if (!content) return null;
  
  // 일반적인 마크다운 헤더 패턴
  const patterns = [
    // ### 섹션명 패턴
    new RegExp(`###\\s*${sectionName}[^#]*(?=###|$)`, 'i'),
    // ## 섹션명 패턴
    new RegExp(`##\\s*${sectionName}[^#]*(?=##|$)`, 'i'),
    // # 섹션명 패턴
    new RegExp(`#\\s*${sectionName}[^#]*(?=\\s*#|$)`, 'i'),
    // 섹션명: 패턴
    new RegExp(`\\b${sectionName}\\s*:[^\\n]*(?:\\n(?!\\b\\w+\\s*:)[^\\n]*)*`, 'i'),
    // **섹션명** 패턴
    new RegExp(`\\*\\*\\s*${sectionName}\\s*\\*\\*[^*]*(?=\\*\\*|$)`, 'i'),
    // 섹션명 단락 패턴 (단락 단위로 추출)
    new RegExp(`(?:^|\\n)${sectionName}[^\\n]*(?:\\n(?!\\b\\w+:)[^\\n]*)*`, 'i')
  ];
  
  // 각 패턴으로 시도
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[0]) {
      let result = match[0].trim();
      
      // 헤더 제거 (예: ### 이마 -> 이마)
      result = result.replace(/^#{1,3}\s*/, '');
      
      // 볼드 마크다운 제거 (예: **이마** -> 이마)
      result = result.replace(/^\*\*|\*\*$/g, '');
      
      // 섹션명 자체 제거 (결과에서 섹션명+콜론 제거)
      result = result.replace(new RegExp(`^${sectionName}\\s*:?\\s*`, 'i'), '');
      
      return result.trim();
    }
  }
  
  return null;
};

// 특정 섹션 추출 함수 (기존)
const extractSection = (content: string, startSection: string, endSection: string): string => {
  // 원본 로직 유지
  const startIndex = content.indexOf(startSection);
  if (startIndex === -1) return '';
  
  const endIndex = content.indexOf(endSection, startIndex);
  if (endIndex === -1) return content.substring(startIndex);
  
  // 추가 로직: 마크다운 헤더 패턴 인식
  const sectionText = content.substring(startIndex, endIndex).trim();
  
  // ### 같은 마크다운 헤더 제거
  return sectionText.replace(/^#{1,3}\s*/, '');
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
`;
Container.displayName = 'FaceReadingResult_Container';

const ResultHeader = styled.div`
  background: linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%);
  padding: 2rem;
  color: white;
  text-align: center;
`;
ResultHeader.displayName = 'FaceReadingResult_Header';

const Title = styled.h1`
  font-size: 1.33rem; /* 2rem의 3분의 2 */
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
Title.displayName = 'FaceReadingResult_Title';

const SubTitle = styled.p`
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
`;
SubTitle.displayName = 'FaceReadingResult_SubTitle';

// 사용자 이미지 컨테이너 스타일
const UserImageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;
UserImageContainer.displayName = 'FaceReadingResult_UserImageContainer';

const CenteredUserImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #6b46c1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;
CenteredUserImage.displayName = 'FaceReadingResult_CenteredUserImage';

// 아이보살 결과 제목 스타일
const ResultTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #e9d8fd;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(233, 216, 253, 0.3);
  text-shadow: 0 0 15px rgba(107, 70, 193, 0.5);
`;
ResultTitle.displayName = 'FaceReadingResult_ResultTitle';

const Disclaimer = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin: 0;
  padding: 1rem 2rem 2rem;
  font-style: italic;
`;
Disclaimer.displayName = 'FaceReadingResult_Disclaimer';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;
ButtonContainer.displayName = 'FaceReadingResult_ButtonContainer';

const ButtonIcon = styled.span`
  margin-right: 0.5rem;
`;
ButtonIcon.displayName = 'FaceReadingResult_ButtonIcon';

const ActionButton = styled.button<{ color: string }>`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.color === '#6b46c1' ? '#6b46c1' : 'rgba(74, 21, 81, 0.3)'};
  color: ${props => props.color === '#6b46c1' ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.color === '#6b46c1' ? props.color : 'rgba(107, 70, 193, 0.5)'};
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.color === '#6b46c1' ? '#553c9a' : 'rgba(107, 70, 193, 0.7)'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;
ActionButton.displayName = 'FaceReadingResult_ActionButton';

// 디버그 버튼 스타일
const DebugButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;
DebugButton.displayName = 'FaceReadingResult_DebugButton';

// 디버그 모달 스타일
const DebugModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
DebugModal.displayName = 'FaceReadingResult_DebugModal';

const DebugModalContent = styled.div`
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background-color: #1a202c;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;
DebugModalContent.displayName = 'FaceReadingResult_DebugModalContent';

const DebugModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  
  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
`;
DebugModalHeader.displayName = 'FaceReadingResult_DebugModalHeader';

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    opacity: 0.7;
  }
`;
CloseButton.displayName = 'FaceReadingResult_CloseButton';

const DebugModalBody = styled.div`
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(90vh - 60px);
  background-color: #1a202c;
  
  h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #e2e8f0;
  }
  
  pre {
    background-color: #2d3748;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.5;
    margin-bottom: 1rem;
    white-space: pre-wrap;
    color: #e2e8f0;
  }
`;
DebugModalBody.displayName = 'FaceReadingResult_DebugModalBody';

const DebugTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  
  td {
    padding: 0.5rem;
    border: 1px solid #4a5568;
    font-size: 0.85rem;
    color: #e2e8f0;
  }
  
  td:first-of-type {
    width: 120px;
    font-weight: bold;
    background-color: #2d3748;
  }
`;
DebugTable.displayName = 'FaceReadingResult_DebugTable';

// 원본 관상 분석 콘텐츠 렌더링을 위한 컴포넌트 추가
const OriginalContent = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 8px;
  white-space: pre-wrap;
  font-size: 0.9rem;
  margin: 0 0 2rem;
  color: rgba(255, 255, 255, 0.9);
  
  h2 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(107, 70, 193, 0.5);
  }
  
  h3 {
    color: #e9d8fd;
    font-size: 1.2rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    text-shadow: 0 0 5px rgba(107, 70, 193, 0.3);
  }
  
  p {
    margin-bottom: 1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  strong {
    color: #e9d8fd;
    font-weight: bold;
  }
  
  em {
    color: #c3dafe;
    font-style: italic;
  }
  
  a {
    color: #90cdf4;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    color: #e9d8fd;
  }
  
  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.2);
    padding-left: 1rem;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
  }
`;
OriginalContent.displayName = 'FaceReadingResult_OriginalContent';

export default FaceReadingResult; 