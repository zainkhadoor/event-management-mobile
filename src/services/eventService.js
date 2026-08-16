// src/services/eventService.js
import api from './api';

const eventService = {
  // جلب جميع الصالات
  getVenues: async (params = {}) => {
    try {
      const response = await api.get('/venues', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get venues error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب الصالات',
      };
    }
  },

  // البحث في الصالات
  searchVenues: async (params = {}) => {
    try {
      const response = await api.get('/venues/search', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Search venues error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل البحث عن الصالات',
      };
    }
  },

  // جلب الخدمات مع فلترة
  getServices: async (params = {}) => {
    try {
      const response = await api.get('/services', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get services error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب الخدمات',
      };
    }
  },

  // جلب فئات الخدمات
  getServiceCategories: async () => {
    try {
      const response = await api.get('/services/categories');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get service categories error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب فئات الخدمات',
      };
    }
  },

  // جلب تفاصيل خدمة معينة
  getServiceDetails: async (serviceId) => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get service details error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب تفاصيل الخدمة',
      };
    }
  },

  // إنشاء فعالية جديدة
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Create event error:', error.response?.data);
      const errorData = error.response?.data;
      return {
        success: false,
        message: errorData?.message || 'فشل إنشاء الفعالية',
        errors: errorData?.errors,
        conflict: errorData?.conflict_event,
      };
    }
  },

  // جلب فعالياتي
  getMyEvents: async () => {
    try {
      const response = await api.get('/events/my');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get my events error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب الفعاليات',
      };
    }
  },

  // جلب تفاصيل فعالية معينة
  getEventDetails: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get event details error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب تفاصيل الفعالية',
      };
    }
  },

  // إلغاء فعالية
  cancelEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Cancel event error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل إلغاء الفعالية',
      };
    }
  },

  // جلب تفاصيل الفاتورة المعلقة
  getPendingInvoice: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/invoice`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get pending invoice error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب تفاصيل الفاتورة',
      };
    }
  },

  // دفع الفاتورة
  payInvoice: async (paymentData) => {
    try {
      const response = await api.post('/invoices/pay', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Pay invoice error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل الدفع',
      };
    }
  },

  // جلب تفاصيل الدفع
  getPaymentByInvoice: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/payment`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get payment error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب تفاصيل الدفع',
      };
    }
  },

  // إضافة تقييم
  addRating: async (eventId, ratingData) => {
    try {
      const response = await api.post(`/events/${eventId}/rating`, ratingData);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Add rating error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل إضافة التقييم',
      };
    }
  },

  // جلب تقييمي لفعالية معينة
  getMyRating: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/rating`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get my rating error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب التقييم',
      };
    }
  },

  // جلب جميع الإشعارات
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get notifications error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب الإشعارات',
      };
    }
  },

  // جلب الإشعارات غير المقروءة
  getUnreadNotifications: async () => {
    try {
      const response = await api.get('/notifications/unread');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Get unread notifications error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل جلب الإشعارات غير المقروءة',
      };
    }
  },

  // تعيين إشعار كمقروء
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Mark notification as read error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل تعيين الإشعار كمقروء',
      };
    }
  },

  // تعيين جميع الإشعارات كمقروءة
  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.post('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Mark all notifications as read error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل تعيين الإشعارات كمقروءة',
      };
    }
  },

  // تحديث رمز FCM
  updateFcmToken: async (fcmToken) => {
    try {
      const response = await api.post('/notifications/fcm-token', { fcm_token: fcmToken });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Update FCM token error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل تحديث رمز FCM',
      };
    }
  },

  // إرسال إشعار FCM (للاختبار)
  sendFcmNotification: async (title, body, fcmToken = null) => {
    try {
      const payload = { title, body };
      if (fcmToken) {
        payload.fcm_token = fcmToken;
      }
      const response = await api.post('/notifications/send-fcm', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Send FCM notification error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل إرسال الإشعار',
      };
    }
  }
};

export default eventService;