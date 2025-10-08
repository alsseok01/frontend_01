import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [authSubPage, setAuthSubPage] = useState('login');
  // ✅ [수정] 일정(events) 상태를 AuthContext에서 관리하도록 위치를 옮겼습니다.
  const [events, setEvents] = useState({});
  const [sentMatchRequests, setSentMatchRequests] = useState([]);
  // ✅ [추가] "내 일정"을 서버에서 불러오는 함수를 Context에 만들었습니다.
  // 다른 페이지에서도 이 함수를 호출하여 데이터를 새로고침할 수 있습니다.

  const fetchSentMatchRequests = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await axios.get(`${API_URL}/api/matches/sent`, { headers: { Authorization: `Bearer ${token}` } });
    setSentMatchRequests(response.data);
  } catch (err) {
    console.error('내가 보낸 매칭 요청 목록을 불러오지 못했습니다.', err);
    setSentMatchRequests([]);
  }
}, []);

  const fetchMySchedules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/schedules/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let scheduleList;
    if (Array.isArray(response.data)) {
      scheduleList = response.data;
    } else if (response.data && Array.isArray(response.data.schedules)) {
      scheduleList = response.data.schedules;
    } else {
      scheduleList = [];
    }

    // 날짜별로 그룹핑
    const formattedEvents = scheduleList.reduce((acc, schedule) => {
      const date = schedule.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push({
        id: schedule.id,
        text: schedule.text,
        time: schedule.time,
        participants: schedule.participants,
        currentParticipants: schedule.currentParticipants,
        placeCategory: schedule.placeCategory,
      });
      return acc;
    }, {});

    setEvents(formattedEvents);
  } catch (error) {
    console.error('내 일정을 불러오는데 실패했습니다:', error);
    setEvents({});
  }
}, []);

  // 앱이 처음 시작될 때 사용자 정보와 함께 "내 일정"도 불러오도록 수정합니다.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_URL}/api/user/me`)
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
          fetchMySchedules(); 
          
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMySchedules]);

  const processLoginData = (loginData) => {
    const { accessToken, ...userData } = loginData;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userData);
      setIsAuthenticated(true);
      fetchMySchedules(); // ✅ 로그인 성공 직후에도 일정 데이터를 불러옵니다.
    } else {
      console.error("서버 응답에 토큰이 없습니다.");
    }
  };

  axios.defaults.withCredentials = true;

  const login = async (email, password) => {
    try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { withCredentials: true });
    processLoginData(response.data);
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data ||
      '로그인 중 오류가 발생했습니다.';
    alert(msg);
  }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      processLoginData(response.data);
      onNavigate('profileSetup'); // 회원가입 후 프로필 설정 페이지로 이동
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        '회원가입 중 오류가 발생했습니다.';
      alert(msg);
    }
  };

  // 로그아웃 시 사용자 정보뿐만 아니라 일정 데이터도 깨끗하게 비웁니다.
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setEvents({}); // ✅ [수정] 로그아웃 시 일정 데이터 초기화
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    onNavigate('home');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const onNavigate = (page) => {
    if (['login', 'register', 'forgotPassword'].includes(page)) {
      setAuthSubPage(page);
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

  // AuthContext.js 내
const [matchRequests, setMatchRequests] = useState([]);

const fetchMatchRequests = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await axios.get(`${API_URL}/api/matches`, { headers: { Authorization: `Bearer ${token}` } });
    setMatchRequests(response.data);
  } catch (err) {
    console.error('매칭 요청 목록을 불러오지 못했습니다.', err);
    setMatchRequests([]);
  }
}, []);

const acceptMatch = async (matchId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/matches/${matchId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
    alert(response.data);
    fetchMatchRequests();
    fetchMySchedules(); // 내 일정의 현재 참여 인원도 갱신
  } catch (error) {
    alert(error.response?.data || '매칭 수락 중 오류가 발생했습니다.');
  }
};

const rejectMatch = async (matchId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/matches/${matchId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
    alert(response.data);
    fetchMatchRequests();
  } catch (error) {
    alert(error.response?.data || '매칭 거절 중 오류가 발생했습니다.');
  }
};

  // ✅ 다른 페이지나 컴포넌트에서 사용할 수 있도록 events, setEvents, fetchMySchedules를 value에 추가합니다.
  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    onNavigate,
    currentPage,
    authSubPage,
    updateUser,
    events,
    setEvents,
    fetchMySchedules,
    matchRequests,
    fetchMatchRequests,
    acceptMatch,
    rejectMatch,
    sentMatchRequests,
    fetchSentMatchRequests,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};