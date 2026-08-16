// src/services/authService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import notificationService from './notificationService';

// دالة مساعدة لتنظيف وتنسيق رقم الهاتف للسيرفر
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.startsWith('09')) {
    cleaned = '963' + cleaned.substring(1);
  }
  return cleaned;
};

const authService = {
  // تسجيل حساب جديد
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        phone: formatPhoneNumber(userData.phone),
        password: userData.password,
        password_confirmation: userData.password_confirmation,
      });

      if (response.data?.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.log('Register error:', error.response?.data);
      const resData = error.response?.data;
      
      let errorMessage = resData?.message || 'حدث خطأ في التسجيل';
      if (resData?.errors) {
        const firstErrorKey = Object.keys(resData.errors)[0];
        if (firstErrorKey && resData.errors[firstErrorKey][0]) {
          errorMessage = resData.errors[firstErrorKey][0];
        }
      }

      return { success: false, message: errorMessage, errors: resData?.errors };
    }
  },

  // تسجيل الدخول
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      // تسجيل FCM token بعد تسجيل الدخول
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync();
          await notificationService.updateFcmToken(token.data);
        }
      } catch (fcmError) {
        console.log('FCM registration error:', fcmError);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.log('Login error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'بيانات الدخول غير صحيحة',
      };
    }
  },

  // تسجيل الخروج
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'owner_token', 'vendor_token']);
    }
  },

  // إرسال رمز OTP
  sendOtp: async (contactInfo) => {
    try {
      const isEmail = contactInfo.includes('@');
      
      const payload = isEmail 
        ? { email: contactInfo.trim() } 
        : { phone: formatPhoneNumber(contactInfo) };

      const response = await api.post('/auth/send-otp', payload);
      return { 
        success: response.data?.status === 'success' || true, 
        message: response.data?.message || 'تم إرسال الرمز بنجاح' 
      };
    } catch (error) {
      console.log('Send OTP error:', error.response?.data);
      
      const errorData = error.response?.data;
      return {
        success: false,
        message: errorData?.message || 'تعذر إرسال الرمز، يرجى التأكد من البيانات والمحاولة مجدداً',
      };
    }
  },

  // التحقق من OTP
  verifyOtp: async (contactInfo, otpCode) => {
    try {
      const isEmail = contactInfo.includes('@');
      const payload = isEmail 
        ? { email: contactInfo.trim(), otp_code: otpCode }
        : { phone: formatPhoneNumber(contactInfo), otp_code: otpCode };

      const response = await api.post('/auth/verify-otp', payload);

      if (response.data?.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.log('Verify OTP error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'الرمز غير صحيح أو منتهي الصلاحية',
      };
    }
  },

  // نسيت كلمة المرور - إرسال رمز الاستعادة
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() });
      return { success: true, message: response.data?.message || 'تم إرسال رمز الاستعادة بنجاح' };
    } catch (error) {
      console.log('Forgot password error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل إرسال رمز الاستعادة، تأكد من صحة البريد',
      };
    }
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (contactInfo, otpCode, password, passwordConfirmation) => {
    try {
      const isEmail = contactInfo.includes('@');
      const payload = {
        otp_code: otpCode,
        password: password,
        password_confirmation: passwordConfirmation,
      };

      if (isEmail) {
        payload.email = contactInfo.trim();
      } else {
        payload.phone = formatPhoneNumber(contactInfo);
      }

      const response = await api.post('/auth/reset-password', payload);
      return { success: true, message: response.data?.message || 'تم تغيير كلمة المرور بنجاح' };
    } catch (error) {
      console.log('Reset password error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'الرمز غير صحيح أو منتهي الصلاحية',
      };
    }
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // التحقق من حالة تسجيل الدخول
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
};

export default authService;