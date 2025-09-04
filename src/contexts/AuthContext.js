import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // ✨ 1. 페이지 상태와 이동 함수를 Context에서 직접 관리합니다.
  const [currentPage, setCurrentPage] = useState('home');
  const [authSubPage, setAuthSubPage] = useState('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUser({
        name: 'Gildong Hong',
        profileImage: 'https://placehold.co/100x100/EFEFEF/AAAAAA&text=User',
      });
    }
    // URL에 oauth/redirect가 있으면 해당 페이지로 설정
    if (window.location.pathname === '/oauth/redirect') {
      setCurrentPage('oauthRedirect');
    }
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    
    if (userData) {
      setUser(userData);
    } else {
      // 이 기본 객체가 설정되어 user가 더 이상 null이 아니게 됩니다.
      setUser({
        name: '홍길동 (기본값)',
        profileImage: 'https://placehold.co/100x100/EFEFEF/AAAAAA&text=User',
        age: 25,                // 기본 나이 추가
        preferences: {          // 기본 취향 추가 (빈 객체)
          '한식': true,
          '맵찔이': true,
        },
        bio: '기본 자기소개입니다.', // 기본 자기소개 추가
        email: 'test@example.com', // 기본 이메일 추가
      });
    }
    setCurrentPage('home');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPage('home'); 
  };

  // ✨ 2. 페이지 이동 로직을 Context 안으로 가져옵니다.
  const onNavigate = (page) => {
    // 'login', 'register', 'forgotPassword' 중 하나가 들어오면,
    if (['login', 'register', 'forgotPassword'].includes(page)) {
      // authSubPage 상태를 해당 페이지로 설정하고,
      setAuthSubPage(page);
      // 메인 페이지는 'auth'로 변경합니다.
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

  // ✨ 3. value에 currentPage와 onNavigate를 추가하여 모든 자식 컴포넌트가 사용할 수 있게 합니다.
const value = { isAuthenticated, user, setUser, login, logout, currentPage, onNavigate, authSubPage };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};