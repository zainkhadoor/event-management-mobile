// src/store/AppContext.js
import React, { createContext, useState, useContext } from 'react';
import { translations } from '../utils/languages';
import { themes } from '../styles/theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [locale, setLocale] = useState('ar'); 
  const [themeMode, setThemeMode] = useState('light'); 
  
  // 1. إدارة الأحداث المستحدثة
  const [events, setEvents] = useState([]);

  // 2. إدارة بيانات المستخدم (الملف الشخصي)
  const [userProfile, setUserProfile] = useState({
    name: 'زين',
    email: 'zain@eventak.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
  });

  // 3. إدارة رصيد المحفظة / بطاقة المستخدم
  const [walletBalance, setWalletBalance] = useState(5000);

  // 4. حالة الشاشات التعريفية
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = () => {
    setLocale((prevLang) => {
      if (prevLang === 'ar') return 'en';
      if (prevLang === 'en') return 'fr';
      if (prevLang === 'fr') return 'de';
      return 'ar';
    });
  };

  const addEvent = (newEventData) => {
    const eventWithTimestamp = {
      ...newEventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(), 
    };
    setEvents((prevEvents) => [eventWithTimestamp, ...prevEvents]);
  };

  const updateEvent = (eventId, updatedData) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) => (ev.id === eventId ? { ...ev, ...updatedData } : ev))
    );
  };

  const updateUserProfile = (updatedProfile) => {
    setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
  };

  const updateWalletBalance = (amount) => {
    setWalletBalance((prev) => prev + amount);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  const currentTheme = themes[themeMode] || themes['light'];
  const t = (key) => translations[locale]?.[key] || key;

  return (
    <AppContext.Provider 
      value={{ 
        locale: locale || 'ar',
        themeMode, 
        toggleTheme, 
        changeLanguage, 
        theme: currentTheme, 
        t,
        events,
        addEvent,
        updateEvent,
        userProfile,
        updateUserProfile,
        walletBalance,
        updateWalletBalance,
        hasCompletedOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);