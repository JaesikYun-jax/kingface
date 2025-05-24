import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import HomePage from './pages/HomePage';
import FortunePage from './pages/FortunePage';
import FaceReadingPage from './pages/FaceReadingPage';
import AdminPage from './pages/AdminPage';
import FortuneQaPage from './pages/FortuneQaPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PlanSelector from './components/PlanSelector';
import './App.css';

// 로테이션할 이모지 배열
const mysticEmojis = ['🔮', '✨', '🌙', '🌠', '👁️', '🧿', '🪬', '🧙', '💫', '⚡', '🌟', '🪄'];

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(mysticEmojis[0]);
  const [emojiIndex, setEmojiIndex] = useState(0);
  
  // 이모지 로테이션 효과
  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setEmojiIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % mysticEmojis.length;
        setCurrentEmoji(mysticEmojis[newIndex]);
        return newIndex;
      });
    }, 2000); // 2초마다 변경
    
    return () => clearInterval(emojiInterval);
  }, []);
  
  const togglePricing = () => {
    setShowPricing(!showPricing);
  };
  
  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderContent>
            <Logo>
              <RotatingEmoji>{currentEmoji}</RotatingEmoji>
              <Link to="/">아이보살 1.0</Link>
            </Logo>
            
            <HeaderRight>
              <PricingButton onClick={togglePricing}>
                프라이싱
              </PricingButton>
            </HeaderRight>
          </HeaderContent>
        </Header>
        
        {showPricing && (
          <PricingModal>
            <PricingModalContent>
              <PricingHeader>
                <h3>서비스 플랜 선택</h3>
                <CloseButton onClick={togglePricing}>✕</CloseButton>
              </PricingHeader>
              <PlanSelector onSelect={() => {
                setTimeout(() => {
                  setShowPricing(false);
                }, 1000);
              }} />
            </PricingModalContent>
          </PricingModal>
        )}
        
        <Main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fortune" element={<FortunePage />} />
            <Route path="/facereading" element={<FaceReadingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/fortune-qa" element={<FortuneQaPage />} />
            <Route path="/private" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
          </Routes>
        </Main>
        
        <Footer>
          <FooterText>
            &copy; {new Date().getFullYear()} 아이보살 1.0 - AI 운세 서비스
          </FooterText>
          <FooterText>
            이 서비스는 오락 목적으로 제공되며, 실제 운세 결과와 다를 수 있습니다.
          </FooterText>
          <FooterButtonContainer>
            <Link to="/terms" style={{ textDecoration: 'none' }}>
              <FooterButton>이용약관</FooterButton>
            </Link>
            <Link to="/private" style={{ textDecoration: 'none' }}>
              <FooterButton>개인정보 보호정책</FooterButton>
            </Link>
          </FooterButtonContainer>
        </Footer>
      </AppContainer>
    </Router>
  );
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #2d3748 0%, #4a1551 50%, #252a37 100%);
  color: white;
`;

const Header = styled.header`
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RotatingEmoji = styled.span`
  font-size: 1.8rem;
  margin-right: 0.5rem;
  display: inline-block;
  transition: transform 0.3s ease;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  
  a {
    color: white;
    text-decoration: none;
    transition: color 0.3s;
    text-shadow: 0 0 10px rgba(107, 70, 193, 0.8);
    
    &:hover {
      color: #e9d8fd;
    }
  }
`;

const PricingButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: rgba(107, 70, 193, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  backdrop-filter: blur(5px);
  
  &:hover {
    background-color: rgba(85, 60, 154, 0.9);
  }
`;

const PricingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const PricingModalContent = styled.div`
  background-color: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PricingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: white;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  padding: 0.5rem;
`;

const Main = styled.main`
  flex: 1;
  padding: 1.5rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const Footer = styled.footer`
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0.8rem;
  text-align: center;
  margin-top: auto;
  backdrop-filter: blur(10px);
`;
Footer.displayName = 'App_Footer';

const FooterText = styled.p`
  margin: 0.2rem 0;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
`;
FooterText.displayName = 'App_FooterText';

const FooterButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;
FooterButtonContainer.displayName = 'App_FooterButtonContainer';

const FooterButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.5rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  text-decoration: underline;
  transition: color 0.2s;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;
FooterButton.displayName = 'App_FooterButton';

export default App;
