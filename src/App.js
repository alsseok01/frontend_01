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

function App() {
  // ✅ Context에서 필요한 모든 것을 가져옵니다. App.js의 역할은 오직 페이지를 보여주는 것뿐입니다.
  const { currentPage, authSubPage, login, logout, user, setUser, onNavigate } = useAuth();
  
  //const [events, setEvents] = useState({});

  useEffect(() => {
    if (window.location.pathname === '/oauth/redirect' && currentPage !== 'oauthRedirect') {
      onNavigate('oauthRedirect');
    }
  }, [currentPage, onNavigate]);

  const handleSetupComplete = (formData) => {
    // 현재 로그인된 user 정보에 formData를 합쳐서 Context 상태를 업데이트합니다.
    setUser({ ...user, ...formData });
    onNavigate('login');
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
             return <SchedulePage /*events={events} setEvents={setEvents}*/ />;
          case 'profile':
              //return user ? <ProfilePage user={user} setUser={setUser} onNavigate={onNavigate} /> : <HomePage />;
              return <ProfilePage user={user || { preferences: {} }} setUser={setUser} onNavigate={onNavigate} />;
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