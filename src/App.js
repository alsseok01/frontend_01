// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import MatchingPage from './pages/MatchingPage';
import SchedulePage from './pages/SchedulePage';
import BoardPage from './pages/BoardPage';
import ReviewsPage from './pages/ReviewsPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import MatchRequestsPage from './pages/MatchRequestsPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AuthPage from './pages/Auth/AuthPage';
import RedirectHandler from './pages/Auth/RedirectHandler';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // 💡 useAuth import
import 'bootstrap/dist/css/bootstrap.min.css';

// 💡 라우팅 관련 로직을 처리할 별도의 컴포넌트를 만듭니다.
const AppRoutes = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  // 1. 인증 상태를 확인하는 동안 로딩 화면을 보여줍니다.
  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <h2>앱을 준비하는 중입니다... 잠시만 기다려주세요.</h2>
      </div>
    );
  }

  const isNewUser = isAuthenticated && user && (user.isNewUser || user.newUser);

  // 2. 만약 신규 사용자라면, 프로필 설정 페이지만 접근 가능하도록 합니다.
  if (isNewUser) {
    return (
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        {/* 다른 모든 경로로 접근 시 profile-setup으로 강제 이동시킵니다. */}
        <Route path="*" element={<Navigate to="/profile-setup" replace />} />
      </Routes>
    );
  }

  // 3. 일반 사용자를 위한 라우팅 규칙입니다.
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/oauth/callback" element={<RedirectHandler />} />
      
      {/* 아래는 로그인이 필요한 페이지들입니다. */}
      <Route path="/matching" element={isAuthenticated ? <MatchingPage /> : <Navigate to="/auth" />} />
      <Route path="/schedule" element={isAuthenticated ? <SchedulePage /> : <Navigate to="/auth" />} />
      <Route path="/board" element={isAuthenticated ? <BoardPage /> : <Navigate to="/auth" />} />
      <Route path="/reviews" element={isAuthenticated ? <ReviewsPage /> : <Navigate to="/auth" />} />
      <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />} />
      <Route path="/match-requests" element={isAuthenticated ? <MatchRequestsPage /> : <Navigate to="/auth" />} />
      <Route path="/chat/:matchId" element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" />} />
      
      {/* 신규 사용자가 아니더라도 프로필 설정 페이지에 접근은 가능해야 합니다. */}
      <Route path="/profile-setup" element={isAuthenticated ? <ProfileSetupPage /> : <Navigate to="/auth" />} />

      {/* 정의되지 않은 경로로 접근 시 홈으로 이동시킵니다. */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          {/* 💡 위에서 만든 AppRoutes 컴포넌트를 호출합니다. */}
          <AppRoutes />
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;