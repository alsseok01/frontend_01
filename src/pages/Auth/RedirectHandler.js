import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Spinner } from 'reactstrap';

const RedirectHandler = () => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleSocialLogin = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      console.error("소셜 로그인 에러:", error);
      alert("로그인에 실패했습니다.");
      navigate('/auth'); // 에러 발생 시 로그인 페이지로 이동
      return;
    }
    
    if (token) {
      try {
        await socialLogin(token);
        navigate('/');
      } catch (e) {
        console.error("토큰 처리 중 에러:", e);
        alert("로그인 처리 중 오류가 발생했습니다.");
        navigate('/auth');
      }
    } else {
        // 토큰이 없는 경우 (비정상적인 접근)
        navigate('/auth');
    }
  }, [socialLogin, navigate]);

  useEffect(() => {
    handleSocialLogin();
  }, [handleSocialLogin]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner color="primary" />
      <h4 className="ms-3">로그인 처리 중...</h4>
    </Container>
  );
};

export default RedirectHandler;