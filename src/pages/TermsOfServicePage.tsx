import React from 'react';
import styled from '@emotion/styled';
import Markdown from 'react-markdown';

// PrivacyPolicyPage와 동일한 스타일 사용 또는 필요시 조정
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
  background-color: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);

  h1 {
    font-size: 2rem;
    color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }

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
    color: #90cdf4;
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

const TermsOfServicePage: React.FC = () => {
  const markdownContent = `
# 아이보살 서비스 이용약관

(이곳에 서비스 이용약관 내용을 마크다운 형식으로 작성해주세요.)

## 제1조 (목적)

...

## 제2조 (용어의 정의)

...

## 제3조 (약관의 명시와 개정)

...
  `;

  return (
    <PageContainer>
      <Markdown>{markdownContent}</Markdown>
    </PageContainer>
  );
};

export default TermsOfServicePage; 