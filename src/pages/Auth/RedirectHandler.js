import React, { useEffect } from 'react';

const OAuth2RedirectHandler = ({ onLogin }) => {
  useEffect(() => {
    // URL에서 'token'이라는 이름의 파라미터를 찾습니다.
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // 토큰이 있으면, 브라우저 저장소(localStorage)에 저장합니다.
      localStorage.setItem('token', token);
      
      // App.js에 있는 onLogin 함수를 호출하여 로그인 상태로 만들고 메인 페이지로 이동합니다.
      onLogin();
    } else {
      // 토큰이 없으면 로그인 실패로 간주하고, 알림 후 로그인 페이지로 이동합니다.
      alert('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
      window.location.href = '/'; 
    }
  }, [onLogin]);

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      <p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
