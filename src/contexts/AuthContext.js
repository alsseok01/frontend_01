import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client'
import { requestForToken, onMessageListener } from '../firebase';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [authSubPage, setAuthSubPage] = useState('login');
  const [events, setEvents] = useState({});
  const [matchRequests, setMatchRequests] = useState([]); // 항상 배열로 초기화
  const [sentMatchRequests, setSentMatchRequests] = useState([]); // 항상 배열로 초기화
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const notificationClientRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
        const setupNotifications = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const fcmToken = await requestForToken();
                    if (fcmToken) {
                        const token = localStorage.getItem('token');
                        await axios.post(`${API_URL}/api/fcm/token`,
                            { token: fcmToken },
                            { headers: { 'Authorization': `Bearer ${token}` } }
                        );
                        console.log("FCM 토큰이 서버에 성공적으로 저장되었습니다.");
                    }
                }
            } catch (error) {
                console.error("FCM 토큰 처리 중 오류 발생:", error);
            }
        };
        setupNotifications();

        onMessageListener()
            .then(payload => {
                alert(`[새 메시지] ${payload.notification.title}: ${payload.notification.body}`);
            })
            .catch(err => console.log('failed: ', err));
    }
}, [isAuthenticated]);

  const fetchMySchedules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

     const response = await axios.get(`${API_URL}/api/schedules/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const scheduleList = Array.isArray(response.data) ? response.data : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingSchedules = scheduleList.filter(schedule => new Date(schedule.date) >= today);

      const formattedEvents = upcomingSchedules.reduce((acc, schedule) => {
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
  
   useEffect(() => {
    const token = localStorage.getItem('token');
    const connectNotifications = (authToken, authUser) => {
        if (authUser && authUser.id && !notificationClientRef.current) {
            const socket = new SockJS(`${API_URL}/ws`);
            const stompClient = Stomp.over(socket);
            stompClient.reconnect_delay = 5000;
            stompClient.connect({ Authorization: `Bearer ${authToken}` }, () => {
              stompClient.subscribe(`/topic/user/${authUser.id}/notifications`, () => {
                setUnreadMessageCount(prevCount => prevCount + 1);
              });
            });
            notificationClientRef.current = stompClient;
        }
    }
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_URL}/api/user/me`)
        .then(response => {
          const fetchedUser = response.data;
          setUser(response.data);
          setIsAuthenticated(true);
          fetchMySchedules();
          connectNotifications(token, fetchedUser);
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
    return () => {
      if (notificationClientRef.current) {
        notificationClientRef.current.disconnect();
        notificationClientRef.current = null;
      }
    };
  }, [fetchMySchedules]);

  const processLoginData = (loginData) => {
    const { accessToken, ...userData } = loginData;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userData);
      setIsAuthenticated(true);
      fetchMySchedules();
      return userData;
    } else {
      console.error("서버 응답에 토큰이 없습니다.");
    }
  };
  
  const socialLogin = useCallback(async (token) => {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
          const response = await axios.get(`${API_URL}/api/user/me`);
          const userData = response.data;
          setUser(userData);
          setIsAuthenticated(true);
          fetchMySchedules();
          return userData;
      } catch (error) {
          console.error("소셜 로그인 후 사용자 정보 가져오기 실패", error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          throw error;
      }
  }, [fetchMySchedules]);

  const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        processLoginData(response.data);
    } catch (error) {
        const msg = error.response?.data?.message || error.response?.data || '로그인 중 오류가 발생했습니다.';
        alert(msg);
        throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      processLoginData(response.data);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || '회원가입 중 오류가 발생했습니다.';
      alert(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setEvents({});
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    if (notificationClientRef.current) {
        notificationClientRef.current.disconnect();
        notificationClientRef.current = null;
    }
    setUnreadMessageCount(0);
  };

  const clearUnreadMessages = () => setUnreadMessageCount(0);
  const updateUser = (newUserData) => setUser(newUserData);
  const onNavigate = (page) => {
    if (['login', 'register', 'forgotPassword'].includes(page)) {
      setAuthSubPage(page);
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

  // ✅ [최종 수정] `fetchMatchRequests` 함수
  const fetchMatchRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/matches`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("--- 받은 매칭 신청 API 응답 ---", response.data);
      if (Array.isArray(response.data)) {
        setMatchRequests(response.data);
      } else {
        console.warn("API 응답(받은 신청)이 배열이 아님:", response.data);
        setMatchRequests([]);
      }
      // 🚨 setMatchRequests(response.data); <- 이전에 문제가 되었던 이 줄을 삭제했습니다.
    } catch (err) {
      console.error('받은 매칭 요청 목록을 불러오지 못했습니다.', err);
      setMatchRequests([]);
    }
  }, []);

  // ✅ [최종 수정] `fetchSentMatchRequests` 함수
  const fetchSentMatchRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/matches/sent`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("--- 내가 보낸 매칭 신청 API 응답 ---", response.data);
      if (Array.isArray(response.data)) {
        setSentMatchRequests(response.data);
      } else {
        console.warn("API 응답(보낸 신청)이 배열이 아님:", response.data);
        setSentMatchRequests([]);
      }
      // 🚨 setSentMatchRequests(response.data); <- 이전에 문제가 되었던 이 줄을 삭제했습니다.
    } catch (err) {
      console.error('보낸 매칭 요청 목록을 불러오지 못했습니다.', err);
      setSentMatchRequests([]);
    }
  }, []);

  const deleteMatch = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSentMatchRequests();
      fetchMatchRequests();
    } catch (err) {
      alert(err.response?.data || '매칭 삭제/나가기 중 오류가 발생했습니다.');
      throw err;
    }
  };

  const confirmMatch = async (matchId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/matches/${matchId}/confirm`, {}, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        alert(response.data);
        fetchMatchRequests();
        fetchSentMatchRequests();
        fetchMySchedules();
    } catch (error) {
        alert(error.response?.data || '매칭 확정 중 오류가 발생했습니다.');
    }
  };

  const acceptMatch = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/matches/${matchId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(response.data);
      fetchMatchRequests();
      fetchSentMatchRequests();
      fetchMySchedules();
    } catch (error) {
      alert(error.response?.data || '매칭 수락 중 오류가 발생했습니다.');
    }
  };

  const rejectMatch = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/matches/${matchId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(response.data);
      await fetchMatchRequests();
    } catch (error) {
      alert(error.response?.data || '매칭 거절 중 오류가 발생했습니다.');
    }
  };
  
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await axios.get(`${API_URL}/api/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error("사용자 정보 새로고침 실패:", error);
        }
    }
  }, []);

  const value = {
    isAuthenticated, user, isLoading, login, register, logout, onNavigate, currentPage,
    authSubPage, updateUser, events, setEvents, fetchMySchedules, matchRequests, fetchMatchRequests,
    acceptMatch, rejectMatch, sentMatchRequests, fetchSentMatchRequests, deleteMatch,
    confirmMatch, unreadMessageCount, clearUnreadMessages, socialLogin, refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};