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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WriteReviewPage from './pages/WriteReviewPage';
import MyReviewsPage from './pages/MyReviewsPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppRoutes = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <h2>앱을 준비하는 중입니다... 잠시만 기다려주세요.</h2>
      </div>
    );
  }

  const isNewUser = isAuthenticated && user && (user.isNewUser || user.newUser);

  if (isNewUser) {
    return (
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="*" element={<Navigate to="/profile-setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      {/* ✅ [수정] 아래 라우트 규칙을 수정하여 무한 리디렉션을 방지합니다. */}
       <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route 
        path="/oauth/callback" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <RedirectHandler />} 
      />
      
      <Route path="/oauth/callback" element={<RedirectHandler />} />
      
      <Route path="/matching" element={isAuthenticated ? <MatchingPage /> : <Navigate to="/auth" />} />
      <Route path="/schedule" element={isAuthenticated ? <SchedulePage /> : <Navigate to="/auth" />} />
      <Route path="/board" element={isAuthenticated ? <BoardPage /> : <Navigate to="/auth" />} />
      <Route path="/reviews" element={isAuthenticated ? <ReviewsPage /> : <Navigate to="/auth" />} />
      <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />} />
      <Route path="/match-requests" element={isAuthenticated ? <MatchRequestsPage /> : <Navigate to="/auth" />} />
      <Route path="/chat/:matchId" element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" />} />
      <Route path="/write-review" element={isAuthenticated ? <WriteReviewPage /> : <Navigate to="/auth" />} />
      <Route path="/my-reviews" element={isAuthenticated ? <MyReviewsPage /> : <Navigate to="/auth" />} />
      
      <Route path="/profile-setup" element={isAuthenticated ? <ProfileSetupPage /> : <Navigate to="/auth" />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;