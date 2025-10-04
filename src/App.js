import React from 'react';
import AppLayout from './components/AppLayout';
import AuthPage from './pages/Auth/AuthPage';
import ProfilePage from './pages/ProfilePage';
import OAuth2RedirectHandler from './pages/Auth/RedirectHandler';
import HomePage from './pages/HomePage';
import MatchingPage from './pages/MatchingPage';
import BoardPage from './pages/BoardPage';
import ReviewsPage from './pages/ReviewsPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SchedulePage from './pages/SchedulePage';
import MatchRequestsPage from './pages/MatchRequestsPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentPage, authSubPage, isAuthenticated, onNavigate, isLoading, user } = useAuth();

  

  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <h2>앱을 준비하는 중입니다... 잠시만 기다려주세요.</h2>
      </div>
    );
  }

  const renderPage = () => {
    if (window.location.pathname === '/oauth/redirect') {
      return <OAuth2RedirectHandler />;
    }

    if (isAuthenticated) {
      const isNew = user && (user.isNewUser || user.newUser);
      if (isNew) {
        return <ProfileSetupPage />;
      }
      
      switch(currentPage) {
        case 'home': return <HomePage />;
        case 'schedule': return <SchedulePage />;
        case 'profile': return <ProfilePage onNavigate={onNavigate} />;
        case 'matching': return <MatchingPage />;
        case 'board': return <BoardPage />;
        case 'reviews': return <ReviewsPage />;
        case 'match-requests': return <MatchRequestsPage />;
        default: return <HomePage />;
      }
    } 
    else {
      if (currentPage === 'auth') {
        return <AuthPage initialMode={authSubPage} />;
      }
      return <HomePage />;
    }
  };
  
  return (
    <div className="App">
      <AppLayout>
        {renderPage()}
      </AppLayout>
    </div>
  );
}

export default App;