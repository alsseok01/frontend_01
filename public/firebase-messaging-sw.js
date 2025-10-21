// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDejn3GmdZ5zYCkMtawoO0m9gdVDD4Se5A",
  authDomain: "react-push-service.firebaseapp.com",
  projectId: "react-push-service",
  storageBucket: "react-push-service.firebasestorage.app",
  messagingSenderId: "273236139877",
  appId: "1:273236139877:web:41be4a0cdd048d6fc70b8c",
  measurementId: "G-K460C33JLW"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // 알림에 표시될 아이콘
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});