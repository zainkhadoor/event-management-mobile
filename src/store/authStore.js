// src/store/authStore.js
import { useState } from 'react';

// سنصنع كائن وهمي يحاكي حالة تسجيل الدخول
export const authState = {
  isLoggedIn: false,
  userRole: null, // ممكن يكون 'customer' أو 'agent'
  userEmail: '',
};