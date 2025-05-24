import React from 'react';
import styled from '@emotion/styled';
import Markdown from 'react-markdown';

// Footer와 유사한 스타일을 적용하거나, 전역 스타일을 따르도록 설정
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
  background-color: rgba(255, 255, 255, 0.05); // 배경색은 전체 테마에 맞게 조정
  color: #e0e0e0; // 기본 텍스트 색상
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);

  h1 {
    font-size: 2rem;
    color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }

  // react-markdown으로 렌더링될 요소들에 대한 기본 스타일
  h2 {
    font-size: 1.5rem;
    color: #eee;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  a {
    color: #90cdf4; // 링크 색상
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  strong {
    font-weight: bold;
    color: #f0f0f0;
  }

  code {
    background-color: rgba(0,0,0,0.2);
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    border-radius: 3px;
  }

  pre {
    background-color: rgba(0,0,0,0.2);
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
  }
`;

const PrivacyPolicyPage: React.FC = () => {
  // 마크다운 내용은 여기에 직접 작성하거나, 별도 파일에서 불러올 수 있습니다.
  // 우선은 사용자가 내용을 채울 수 있도록 placeholder를 둡니다.
  const markdownContent = `
# 개인정보 보호정책

(이곳에 개인정보 보호정책 내용을 마크다운 형식으로 작성해주세요.)

## 1. 수집하는 개인정보의 항목

...

## 2. 개인정보의 수집 및 이용목적

...

## 3. 개인정보의 보유 및 이용기간

...
  `;

  return (
    <PageContainer>
      <Markdown>{markdownContent}</Markdown>
    </PageContainer>
  );
};

export default PrivacyPolicyPage; 