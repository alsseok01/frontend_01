import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// 🚨 중요: 이 값들을 본인의 Firebase 프로젝트 설정 값으로 반드시 교체해주세요!
const firebaseConfig = {
  apiKey: "AIzaSyDejn3GmdZ5zYCkMtawoO0m9gdVDD4Se5A",
  authDomain: "react-push-service.firebaseapp.com",
  projectId: "react-push-service",
  storageBucket: "react-push-service.firebasestorage.app",
  messagingSenderId: "273236139877",
  appId: "1:273236139877:web:41be4a0cdd048d6fc70b8c",
  measurementId: "G-K460C33JLW"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: 'BDgu_-oBG0So8oO4WU_qF28oDYermk_h503FqC4Nuo_4GdC3QjnV_p8tdF3jdVza27RQbJSPdVRV2s_l2y9vAdY' }); // 🚨 VAPID 키를 입력하세요
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // 서버로 토큰을 보내는 로직은 AuthContext에서 처리합니다.
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });