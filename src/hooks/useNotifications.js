import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  fetchAllNotifications,
  fetchUnreadNotifications,
  markNotificationAsRead,
} from '../services/notificationService';

export const useNotifications = (onNavigate) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const responseListener = useRef();

  // جلب كل الإشعارات وحساب غير المقروء
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllNotifications();
      setNotifications(data);
      const unread = data.filter((item) => item.read_at === null).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // تعليم الإشعار كمقروء محلياً وفي السيرفر
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
      console.error('Failed to mark notification as read:', error);
    }
  };

  // توجيه المستخدم بناءً على data.type
  const handleNotificationNavigation = useCallback(
    (data) => {
      if (!data || !data.type || !onNavigate) return;

      const { type, event_id, service_id, payment_id, venue_request_id } = data;

      switch (type) {
        // 1. إشعارات الزبون
        case 'booking_approved':
        case 'booking_confirmed':
        case 'event_rejected':
        case 'venue_available':
          if (event_id) onNavigate('EventDetails', { eventId: event_id });
          break;

        case 'vendor_service_approved':
        case 'vendor_service_rejected':
          if (event_id) onNavigate('EventServices', { eventId: event_id, serviceId: service_id });
          break;

        // 2. إشعارات المورد/صاحب الصالة
        case 'new_event_request':
        case 'booking_cancelled_by_customer':
          if (event_id) onNavigate('VendorEventRequests', { eventId: event_id });
          break;

        case 'invoice_paid':
          onNavigate('InvoiceDetails', { paymentId: payment_id, eventId: event_id });
          break;

        // 3. إشعارات الخدمات والصلات
        case 'service_request_create':
        case 'service_request_update':
        case 'service_request_delete':
        case 'service_result_approved':
        case 'service_result_rejected':
          if (service_id) onNavigate('ServiceDetails', { serviceId: service_id });
          break;

        case 'venue_request_create':
        case 'venue_request_update':
        case 'venue_request_delete':
        case 'venue_result_approved':
        case 'venue_result_rejected':
          if (venue_request_id) onNavigate('VenueDetails', { venueRequestId: venue_request_id });
          break;

        default:
          onNavigate('Notifications');
          break;
      }
    },
    [onNavigate]
  );

  useEffect(() => {
    // 1. تسجيل FCM Token
    registerForPushNotificationsAsync();

    // 2. الاستماع لتفاعل المستخدم عند ضغط الإشعار من شريط التنبيهات
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const notificationData = response.notification.request.content.data;
      if (notificationData?.id) {
        handleMarkAsRead(notificationData.id);
      }
      handleNotificationNavigation(notificationData);
    });

    // 3. Polling كل 30 ثانية للإشعارات غير المشمولة بـ FCM Direct Push
    const interval = setInterval(async () => {
      try {
        const unreadList = await fetchUnreadNotifications();
        setUnreadCount(unreadList.length);
      } catch (e) {
        // تجاهل الأخطاء المؤقتة أثناء polling
      }
    }, 30000);

    loadNotifications();

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      clearInterval(interval);
    };
  }, [loadNotifications, handleNotificationNavigation]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: loadNotifications,
    markAsRead: handleMarkAsRead,
    handleNotificationNavigation,
  };
};