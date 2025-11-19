import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client'
import { requestForToken, onMessageListener } from '../firebase';
import { getToken as getStoredToken, setToken as storeToken, removeToken as clearStoredToken, startTokenExpiryTimer, cancelTokenExpiryTimer } from '../utils/tokenStorage';


const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
//const API_URL = process.env.REACT_APP_API_URL || 'http://tablefriends.site:8080';


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
  const [unreadMatches, setUnreadMatches] = useState(new Set());

  const markMatchAsRead = useCallback((matchId) => {
    setUnreadMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(Number(matchId))) {
        newSet.delete(Number(matchId));
        setUnreadMessageCount(prevCount => Math.max(0, prevCount - 1)); 
        return newSet;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
        const setupNotifications = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const fcmToken = await requestForToken();
                    if (fcmToken) {
                        const token = getStoredToken();
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
      const token = getStoredToken();
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
    const token = getStoredToken();
    const connectNotifications = (authToken, authUser) => {
        if (authUser && authUser.id && !notificationClientRef.current) {
            const socket = new SockJS(`${API_URL}/ws`);
            const stompClient = Stomp.over(socket);
            stompClient.reconnect_delay = 5000;
            stompClient.connect({ Authorization: `Bearer ${authToken}` }, () => {
              
              stompClient.subscribe(`/topic/user/${authUser.id}/notifications`, (message) => {
                
                setUnreadMessageCount(prevCount => prevCount + 1);
                const messageBody = message.body;
                console.log("WebSocket 알림 수신:", messageBody);

                let msgType = messageBody; 
                let msgData = {};

                try {
                    const parsed = JSON.parse(messageBody);
                    if (typeof parsed === 'object') {
                        msgType = parsed.type;
                        msgData = parsed;
                    }
                } catch (e) {
                    // JSON이 아니면 예전 방식대로 문자열로 처리
                }

                // 메시지 알림이면 전체 카운트 +1
                if (msgType === 'new_message' || msgType === 'new_match_request') {
                     setUnreadMessageCount(prevCount => prevCount + 1);
                }

                switch (msgType) {
                    case "new_match_request":
                        fetchFunctionsRef.current.fetchMatchRequests();
                        break;
                    case "match_accepted":
                    case "match_rejected":
                        fetchFunctionsRef.current.fetchSentMatchRequests();
                        break;
                    case "match_confirmed":
                        fetchFunctionsRef.current.fetchMatchRequests();
                        fetchFunctionsRef.current.fetchSentMatchRequests();
                        break;
                    case "new_message":
                        // ✅ [추가] 채팅 알림인 경우, 해당 채팅방 번호를 저장!
                        if (msgData.matchId) {
                             setUnreadMatches(prev => new Set(prev).add(Number(msgData.matchId)));
                        }
                        break;
                    default:
                        console.warn("알 수 없는 알림:", messageBody);
                }
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
          startTokenExpiryTimer(() => {
            setIsAuthenticated(false);
            setUser(null);
            setEvents({});
            clearStoredToken();
            delete axios.defaults.headers.common['Authorization'];
            if (notificationClientRef.current) {
              notificationClientRef.current.disconnect();
              notificationClientRef.current = null;
            }
            setUnreadMessageCount(0);
          });
          connectNotifications(token, fetchedUser); // ✅ connectNotifications 호출
        })
        .catch(() => {
          clearStoredToken();
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
  // ✅ 4. [수정] 메인 useEffect의 의존성 배열에서 fetch 함수들을 제거합니다. (최초 1회 실행)
  }, [fetchMySchedules]);

  const processLoginData = (loginData, remember = false) => {
      const { accessToken, ...userData } = loginData;
      if (accessToken) {
        storeToken(accessToken, { remember });
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(userData);
        setIsAuthenticated(true);
        fetchMySchedules();
        startTokenExpiryTimer(() => {
          setIsAuthenticated(false);
          setUser(null);
          setEvents({});
          clearStoredToken();
          delete axios.defaults.headers.common['Authorization'];
          if (notificationClientRef.current) {
            notificationClientRef.current.disconnect();
            notificationClientRef.current = null;
          }
          setUnreadMessageCount(0);
        });
        return userData;
      } else {
        console.error("서버 응답에 토큰이 없습니다.");
      }
    };
  
    const socialLogin = useCallback(async (token) => {
        storeToken(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const response = await axios.get(`${API_URL}/api/user/me`);
            const userData = response.data;
            setUser(userData);
            setIsAuthenticated(true);
            fetchMySchedules();
            startTokenExpiryTimer(() => {
              setIsAuthenticated(false);
              setUser(null);
              setEvents({});
              clearStoredToken();
              delete axios.defaults.headers.common['Authorization'];
              if (notificationClientRef.current) {
                notificationClientRef.current.disconnect();
                notificationClientRef.current = null;
              }
              setUnreadMessageCount(0);
            });
            return userData;
        } catch (error) {
            console.error("소셜 로그인 후 사용자 정보 가져오기 실패", error);
            clearStoredToken();
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
      clearStoredToken();
      delete axios.defaults.headers.common['Authorization'];
      if (notificationClientRef.current) {
          notificationClientRef.current.disconnect();
          notificationClientRef.current = null;
      }
      setUnreadMessageCount(0);
      cancelTokenExpiryTimer();
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
  
    const fetchMatchRequests = useCallback(async () => {
      const token = getStoredToken();
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
      } catch (err) {
        console.error('받은 매칭 요청 목록을 불러오지 못했습니다.', err);
        setMatchRequests([]);
      }
    }, []);
  
    const fetchSentMatchRequests = useCallback(async () => {
      const token = getStoredToken();
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
  
    const fetchFunctionsRef = useRef({
      fetchMatchRequests,
      fetchSentMatchRequests,
    });
  
    useEffect(() => {
      fetchFunctionsRef.current = {
        fetchMatchRequests,
        fetchSentMatchRequests,
      };
    }, [fetchMatchRequests, fetchSentMatchRequests]);
  
    const deleteMatch = async (matchId) => {
      try {
        const token = getStoredToken();
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
          const token = getStoredToken();
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
        const token = getStoredToken();
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
        const token = getStoredToken();
        const response = await axios.post(`${API_URL}/api/matches/${matchId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
        alert(response.data);
        await fetchMatchRequests();
      } catch (error) {
        alert(error.response?.data || '매칭 거절 중 오류가 발생했습니다.');
      }
    };
    
    const refreshUser = useCallback(async () => {
      const token = getStoredToken();
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
  
    // New: login with remember option, wrapper that preserves existing login for backward compatibility
    const loginWithOptions = async (email, password, options = {}) => {
      const { remember = false } = options;
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        processLoginData(response.data, remember);
      } catch (error) {
        const msg = error.response?.data?.message || error.response?.data || '로그인 처리 중 오류가 발생했습니다.';
        alert(msg);
        throw new Error(msg);
      }
    };
  
    const value = {
      isAuthenticated, user, isLoading, login: loginWithOptions, register, logout, onNavigate, currentPage,
      authSubPage, updateUser, events, setEvents, fetchMySchedules, matchRequests, fetchMatchRequests,
      acceptMatch, rejectMatch, sentMatchRequests, fetchSentMatchRequests, deleteMatch,
      confirmMatch, unreadMessageCount, clearUnreadMessages, socialLogin, refreshUser, markMatchAsRead, unreadMatches
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  
  export const useAuth = () => {
    return useContext(AuthContext);
  };
  