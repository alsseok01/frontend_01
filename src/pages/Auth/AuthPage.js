import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import LoginPage from './Login';
import RegisterPage from './Register';
import ForgotPasswordPage from './ForgotPassword';
import ProfileSetupPage from '../ProfileSetupPage'; 


// ✨ 방금 만든 CSS 파일을 import 합니다.
import '../../css/Auth.css';

const AuthPage = ({ onLogin, onNavigate, onSetupComplete, initialMode }) => {
  // 'login', 'register', 'forgotPassword' 중 현재 보여줄 모드를 관리합니다.
  const [authMode, setAuthMode] = useState(initialMode || 'login');
  // 애니메이션 효과를 위한 CSS 클래스를 관리합니다.
  const [animationClass, setAnimationClass] = useState('animate-bounce-in');

  useEffect(() => {
    // 외부에서 전달된 initialMode와 현재 authMode가 다를 경우,
    // 화면 전환이 필요하다고 판단합니다.
    if (initialMode && initialMode !== authMode) {
      // 기존의 화면 전환 애니메이션 로직을 그대로 사용합니다.
      handleSwitchMode(initialMode);
    }
    // useEffect의 두 번째 인자인 배열에 initialMode를 넣어,
    // 이 값이 변경될 때만 함수가 실행되도록 설정합니다.
  }, [initialMode]);

  // 화면 모드를 전환하는 함수
  const handleSwitchMode = (newMode) => {
    // 1. 먼저 나가는 애니메이션을 적용합니다.
    setAnimationClass('animate-bounce-out');

    // 2. 애니메이션이 끝날 시간(0.5초)을 기다린 후,
    setTimeout(() => {
      // 3. 실제 컴포넌트를 교체하고,
      setAuthMode(newMode);
      // 4. 다시 들어오는 애니메이션을 적용합니다.
      setAnimationClass('animate-bounce-in');
    }, 500); // 0.5초 (CSS 애니메이션 시간보다 약간 짧게)
  };

  // 현재 모드에 따라 렌더링할 컴포넌트를 결정합니다.
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