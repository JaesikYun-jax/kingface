import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import HomePage from './pages/HomePage';
import FortunePage from './pages/FortunePage';
import FaceReadingPage from './pages/FaceReadingPage';
import AdminPage from './pages/AdminPage';
import PlanSelector from './components/PlanSelector';
import './App.css';

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const togglePricing = () => {
    setShowPricing(!showPricing);
  };
  
  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderContent>
            <Logo>
              <Link to="/">사주 & 타로</Link>
            </Logo>
            
            <HeaderRight>
              <PricingButton onClick={togglePricing}>
                프라이싱
              </PricingButton>
              <MenuButton onClick={toggleMenu}>
                {menuOpen ? '✕' : '☰'}
              </MenuButton>
            </HeaderRight>
          </HeaderContent>
          
          <Nav isOpen={menuOpen}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>홈</NavLink>
            <NavLink to="/fortune" onClick={() => setMenuOpen(false)}>운세보기</NavLink>
            <NavLink to="/facereading" onClick={() => setMenuOpen(false)}>관상보기</NavLink>
          </Nav>
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
          </Routes>
        </Main>
        
        <Footer>
          <FooterText>
            &copy; {new Date().getFullYear()} 사주 & 타로 - AI 운세 서비스
          </FooterText>
          <FooterText>
            이 서비스는 오락 목적으로 제공되며, 실제 운세 결과와 다를 수 있습니다.
          </FooterText>
        </Footer>
      </AppContainer>
    </Router>
  );
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7fafc;
`;

const Header = styled.header`
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  
  a {
    color: #6b46c1;
    text-decoration: none;
    transition: color 0.3s;
    
    &:hover {
      color: #553c9a;
    }
  }
`;

const MenuButton = styled.button`
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: none;
  color: #4a5568;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const PricingButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #6b46c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #553c9a;
  }
`;

const PricingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PricingModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const PricingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4a5568;
  padding: 0.5rem;
`;

const Nav = styled.nav<{ isOpen: boolean }>`
  display: flex;
  padding: 0 1rem 1rem;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    padding: 1rem;
    background-color: white;
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  
  &:hover {
    color: #6b46c1;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 1.5rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const Footer = styled.footer`
  background-color: #2d3748;
  color: white;
  padding: 1.5rem;
  text-align: center;
  margin-top: auto;
`;

const FooterText = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #cbd5e0;
`;

export default App;
