import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // ✅ [수정] axios를 import 합니다.

const AuthContext = createContext(null);

// ✅ [수정] 백엔드 API 기본 URL을 상수로 정의합니다.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [authSubPage, setAuthSubPage] = useState('login');

    const [events, setEvents] = useState({});

  // ✅ [수정] 앱 로딩 시 토큰을 확인하고, 유효하면 사용자 정보를 가져오는 로직으로 변경
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Axios의 모든 요청에 기본적으로 토큰을 포함시킵니다.
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 서버에 사용자 정보 요청 (토큰 유효성 검증)
      axios.get(`${API_URL}/api/user/me`)
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
          setCurrentPage('home'); // 사용자 정보가 있으면 홈으로 이동
        })
        .catch(() => {
          // 토큰이 유효하지 않은 경우
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        });
    }
  }, []);

  const processLoginData = (data) => {
    // ✅ [추가] 1. 서버로부터 받은 데이터 전체를 확인합니다.
    console.log("서버로부터 받은 로그인 데이터:", data); 

    const { accessToken, ...userData } = data;

    // ✅ [추가] 2. 객체에서 accessToken이 제대로 추출되었는지 확인합니다.
    console.log("추출된 토큰:", accessToken); 

    // 토큰이 유효할 때만 저장합니다.
    if (accessToken) {
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(userData);
        setIsAuthenticated(true);
    } else {
        console.error("토큰이 없습니다! 서버 응답을 확인해주세요.");
    }
};
  // ✅ [수정] 이메일, 비밀번호로 백엔드에 로그인 요청을 보내는 비동기 함수로 변경
  const login = async (email, password) => {
    try {
      console.log("서버로 보내는 이메일:", `'${email}'`);
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      processLoginData(response.data);
      setCurrentPage('home'); // 로그인 성공 후 홈으로 이동
      alert('로그인 성공!');
      
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('이메일 또는 비밀번호를 확인해주세요.');
      // 에러를 다시 던져서 컴포넌트 레벨에서도 처리할 수 있게 함
      throw error; 
    }
  };

  // ✅ [수정] 로그아웃 시 Axios 헤더 제거 및 로그인 페이지로 이동
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization']; // Axios 헤더에서 토큰 제거
    onNavigate('login'); // 로그아웃 후 로그인 페이지로 이동
  };

  const updateUserProfile = (updatedData) => {
    setUser(prevUser => ({
      ...prevUser, // 기존 사용자 정보 유지
      ...updatedData // 새로운 정보로 덮어쓰기
    }));
  };

  const onNavigate = (page) => {
    console.log(`!!! 2. onNavigate 호출됨, page: ${page} !!!`);
    if (['login', 'register', 'forgotPassword'].includes(page)) {
      setAuthSubPage(page);
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

const value = { 
    isAuthenticated, user, setUser, 
    login, logout, 
    currentPage, onNavigate, authSubPage, 
    processLoginData, updateUserProfile,
    events, setEvents // 추가된 부분
  };  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};