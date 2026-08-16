// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/store/AppContext';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import SplashScreen from './src/features/auth/components/SplashScreen';
import OnboardingScreens from './src/features/auth/components/OnboardingScreens';
import LoginScreen from './src/features/auth/components/LoginScreen';
import RegisterScreen from './src/features/auth/components/RegisterScreen';
import ForgotPasswordScreen from './src/features/auth/components/ForgotPasswordScreen';
import ResetPasswordScreen from './src/features/auth/components/ResetPasswordScreen';
import CustomerHomeScreen from './src/features/customer/pages/CustomerHomeScreen';
import authService from './src/services/authService';
import notificationService from './src/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

// تكوين الإشعارات
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showOnboardingScreen, setShowOnboardingScreen] = useState(false);

  useEffect(() => {
    checkAppState();
  }, []);

  // تسجيل FCM token
  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Failed to get push token for push notification!');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      console.log('📱 Push token:', token.data);
      
      // حفظ token في الباك إند
      const result = await notificationService.updateFcmToken(token.data);
      if (result.success) {
        console.log('✅ FCM token updated successfully');
      } else {
        console.log('❌ Failed to update FCM token:', result.message);
      }
    } catch (error) {
      console.log('❌ Error registering for push notifications:', error);
    }
  };

  const checkAppState = async () => {
    try {
      // Check authentication
      const token = await authService.isAuthenticated();
      setIsAuthenticated(token);

      // إذا كان المستخدم مسجل دخول، سجل FCM token
      if (token) {
        await registerForPushNotifications();
      }

      // Check if onboarding was completed
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      console.log('📱 Onboarding completed:', onboardingCompleted);
      
      // FOR TESTING: Always show onboarding
      setShowOnboardingScreen(true);
      
      // Comment this for testing
      // if (onboardingCompleted === 'true') {
      //   setShowOnboarding(false);
      // }
    } catch (error) {
      console.log('Check state error:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
    setShowOnboardingScreen(false);
  };

  const handleLoginSuccess = async (userData) => {
    setIsAuthenticated(true);
    // تسجيل FCM بعد تسجيل الدخول
    await registerForPushNotifications();
  };

  const handleRegisterSuccess = async (userData) => {
    setIsAuthenticated(true);
    // تسجيل FCM بعد التسجيل
    await registerForPushNotifications();
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  // الاستماع للإشعارات الواردة
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📨 Notification response:', response);
      // يمكنك التنقل إلى شاشة معينة بناءً على الإشعار
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  // FOR TESTING: Show onboarding regardless of auth status
  if (showOnboardingScreen) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreens 
              {...props} 
              onFinish={handleOnboardingFinish}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated && showOnboarding && (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreens 
              {...props} 
              onFinish={handleOnboardingFinish}
            />
          )}
        </Stack.Screen>
      )}
      
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen 
                {...props} 
                onLoginSuccess={handleLoginSuccess}
                onNavigateToRegister={() => props.navigation.navigate('Register')}
                onNavigateToForgot={() => props.navigation.navigate('ForgotPassword')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => (
              <RegisterScreen 
                {...props} 
                onRegisterSuccess={handleRegisterSuccess}
                onNavigateToLogin={() => props.navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword">
            {(props) => (
              <ForgotPasswordScreen 
                {...props} 
                onNavigateToLogin={() => props.navigation.navigate('Login')}
                onNavigateToReset={() => props.navigation.navigate('ResetPassword')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ResetPassword">
            {(props) => (
              <ResetPasswordScreen 
                {...props} 
                onNavigateToLogin={() => props.navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="CustomerHome">
            {(props) => <CustomerHomeScreen {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}