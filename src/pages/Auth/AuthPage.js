import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import LoginPage from './Login';
import RegisterPage from './Register';
import ForgotPasswordPage from './ForgotPassword';
import ProfileSetupPage from '../ProfileSetupPage'; 


import '../../css/Auth.css';

const AuthPage = ({ onLogin, onNavigate, onSetupComplete, initialMode }) => {
  const [authMode, setAuthMode] = useState(initialMode || 'login');
  const [animationClass, setAnimationClass] = useState('animate-bounce-in');

  useEffect(() => {
    if (initialMode && initialMode !== authMode) {
      handleSwitchMode(initialMode);
    }
  }, [initialMode]);

  const handleSwitchMode = (newMode) => {
    setAnimationClass('animate-bounce-out');
    setTimeout(() => {
      setAuthMode(newMode);
      setAnimationClass('animate-bounce-in');
    }, 500); 
  };

  const renderAuthComponent = () => {
    switch (authMode) {
      case 'register':
        return <RegisterPage onSwitchMode={handleSwitchMode} onSetupComplete={onSetupComplete} />;
      case 'forgotPassword':
        return <ForgotPasswordPage onSwitchMode={handleSwitchMode} />;
      case 'profileSetup':
        return <ProfileSetupPage onSetupComplete={onSetupComplete} animationClass={animationClass} />;
      case 'login':
      default:
        return <LoginPage onLogin={onLogin} onSwitchMode={handleSwitchMode} />;
    }
  };
  
  const backgroundImageUrl = '';

  return (
    <div
      className="vh-100 d-flex align-items-center"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg="10" md="8">
            {/* 애니메이션 클래스를 적용할 div로 감싸줍니다. */}
            <div className={`auth-card-wrapper ${animationClass}`}>
              {renderAuthComponent()}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthPage;