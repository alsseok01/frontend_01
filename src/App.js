import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import AuthPage from './pages/Auth/AuthPage';
import ProfilePage from './pages/ProfilePage';
import OAuth2RedirectHandler from './pages/Auth/RedirectHandler';
import ProfileSetupPage from './pages/ProfileSetupPage';
import HomePage from './pages/HomePage';
import MatchingPage from './pages/MatchingPage';
import BoardPage from './pages/BoardPage';
import ReviewsPage from './pages/ReviewsPage';
import SchedulePage from './pages/SchedulePage';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios'; // ✅ [수정] axios를 import 합니다.

// ✅ [수정] 백엔드 API 기본 URL을 상수로 정의합니다.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  // ✅ Context에서 필요한 모든 것을 가져옵니다. App.js의 역할은 오직 페이지를 보여주는 것뿐입니다.
  const { currentPage, authSubPage, login, logout, user, setUser, onNavigate, updateUserProfile } = useAuth();
  
  console.log(`--- App.js 렌더링, 현재 페이지: ${currentPage} ---`);

  useEffect(() => {
    if (window.location.pathname === '/oauth/redirect' && currentPage !== 'oauthRedirect') {
      onNavigate('oauthRedirect');
    }
  }, [currentPage, onNavigate]);

const handleSetupComplete = async (formData) => {
    try {
      // ✅ 1. localStorage에서 저장된 토큰을 직접 가져옵니다.
      const token = localStorage.getItem('token');

      // ✅ 2. 토큰이 없는 경우를 대비한 방어 코드
      if (!token) {
        alert('인증 정보가 없습니다. 다시 로그인해주세요.');
        onNavigate('login');
        return;
      }
      
      // ✅ 3. API 요청 시 headers 객체를 만들어 직접 Authorization 헤더를 설정합니다.
      await axios.put(`${API_URL}/api/user/profile`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      

      updateUserProfile(formData);
      // setUser({ ...user, ...formData }); // 이 부분은 서버가 업데이트된 유저 정보를 반환하면 더 좋습니다.
      alert("프로필이 성공적으로 저장되었습니다.");
      onNavigate('home'); // 성공 후 홈으로 이동

    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert("프로필 정보 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderContentPage = () => {
      switch(currentPage) {
          case 'auth':
              return <AuthPage initialMode={authSubPage} onLogin={login} onSetupComplete={handleSetupComplete} />;
          case 'oauthRedirect':
              return <OAuth2RedirectHandler onLogin={login} />;
          case 'profileSetup':
              return <ProfileSetupPage onSetupComplete={handleSetupComplete} />;
          case 'home':
              return <HomePage />;
          case 'schedule':
             return <SchedulePage />;
          case 'profile':
              //return user ? <ProfilePage user={user} setUser={setUser} onNavigate={onNavigate} /> : <HomePage />;
              return <ProfilePage onNavigate={onNavigate} />;
          case 'matching':
              return <MatchingPage />;
          case 'board':
              return <BoardPage />;
          case 'reviews':
              return <ReviewsPage />;
          default:
              return <HomePage />;
      }
  }
  
  return (
    <div className="App">
      {/* onLogout에는 Context에서 가져온 logout 함수를 그대로 전달합니다. */}
      <AppLayout onLogout={logout}>
        {renderContentPage()}
      </AppLayout>
    </div>
  );
}

export default App;