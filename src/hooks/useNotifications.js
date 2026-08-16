import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  fetchNotifications,
  fetchUnreadNotifications,
  markNotificationAsRead,
} from '../services/notificationService';

export const useNotifications = (navigation, isUserLoggedIn = true) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const responseListener = useRef();

  // جلب البيانات وتحديث العداد
  const loadNotifications = useCallback(async () => {
    if (!isUserLoggedIn) return;
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      const unread = data.filter((item) => item.read_at === null).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  }, [isUserLoggedIn]);

  // منطق التوجيه بناءً على data.type و الأقسام المخزنة
  const handleNotificationNavigation = (data) => {
    if (!data || !data.type) return;

    const notificationType = data.type;

    switch (notificationType) {
      // إشعارات الحجوزات للزبون
      case 'booking_approved':
      case 'booking_confirmed':
      case 'event_rejected':
      case 'venue_available':
        if (data.event_id) {
          navigation.navigate('EventDetails', { eventId: data.event_id });
        }
        break;

      case 'vendor_service_approved':
      case 'vendor_service_rejected':
        if (data.event_id) {
          navigation.navigate('EventServices', { eventId: data.event_id, serviceId: data.service_id });
        }
        break;

      // إشعارات صاحب الصالة والموردين
      case 'new_event_request':
      case 'booking_cancelled_by_customer':
        if (data.event_id) {
          navigation.navigate('VendorEventRequests', { eventId: data.event_id });
        }
        break;

      case 'invoice_paid':
        if (data.payment_id || data.event_id) {
          navigation.navigate('InvoiceDetails', { paymentId: data.payment_id, eventId: data.event_id });
        }
        break;

      // إشعارات الخدمات والصلات للأدمن والمورد
      case 'service_request_create':
      case 'service_request_update':
      case 'service_request_delete':
      case 'service_result_approved':
      case 'service_result_rejected':
        if (data.service_id) {
          navigation.navigate('VendorServiceDetails', { serviceId: data.service_id });
        }
        break;

      case 'venue_request_create':
      case 'venue_request_update':
      case 'venue_request_delete':
      case 'venue_result_approved':
      case 'venue_result_rejected':
        if (data.venue_request_id) {
          navigation.navigate('VenueDetails', { venueRequestId: data.venue_request_id });
        }
        break;

      default:
        navigation.navigate('NotificationsList');
        break;
    }
  };

  // تعليم إشعار واحد كمقروء
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('خطأ أثناء تعليم الإشعار كمقروء:', error);
    }
  };

  useEffect(() => {
    if (!isUserLoggedIn) return;

    // تسجيل الجهاز واستقبال التوكن
    registerForPushNotificationsAsync();

    // الاستماع لضغط المستخدم على الإشعار من شريط التنبيهات
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const notificationData = response.notification.request.content.data;
      if (notificationData?.id) {
        handleMarkAsRead(notificationData.id);
      }
      handleNotificationNavigation(notificationData);
    });

    // Polling كل 30 ثانية لتحديث قائمة الإشعارات غير المشمولة بـ FCM Direct Push
    const intervalId = setInterval(async () => {
      try {
        const unreadData = await fetchUnreadNotifications();
        setUnreadCount(unreadData.length);
      } catch (err) {
        // تجاهل أخطاء الشبكة المؤقتة في Polling
      }
    }, 30000);

    loadNotifications();

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      clearInterval(intervalId);
    };
  }, [isUserLoggedIn]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: loadNotifications,
    markAsRead: handleMarkAsRead,
    handleNotificationNavigation,
  };
};