import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// تهيئة سلوك الإشعارات أثناء فتح التطبيق
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 1. تسجيل FCM Token في الباك إيند
export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    console.log('المحاكي لا يدعم استقبال Push Notifications، يرجى التجربة على جهاز حقيقي');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('لم يتم منح صلاحية الإشعارات');
    return null;
  }

  try {
    // جلب FCM Device Token مباشرة
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const fcmToken = tokenData.data;

    // إرسال التوكن للباك إيند
    await api.post('/notifications/fcm-token', { fcm_token: fcmToken });
    return fcmToken;
  } catch (error) {
    console.error('خطأ أثناء تسجيل FCM Token:', error);
    return null;
  }
};

// 2. جلب كافة الإشعارات
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data?.data || [];
};

// 3. جلب الإشعارات غير المقروءة فقط
export const fetchUnreadNotifications = async () => {
  const response = await api.get('/notifications/unread');
  return response.data?.data || [];
};

// 4. تعليم إشعار كمقروء
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};