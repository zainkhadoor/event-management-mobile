// src/features/auth/components/ResetPasswordScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../../store/AppContext';
import authService from '../../../services/authService';

export default function ResetPasswordScreen({ route, onNavigateToLogin }) {
  const contactInfo = route?.params?.contactInfo || '';
  const sendMethod = route?.params?.sendMethod || 'email'; 
  const { theme, t, locale } = useApp();
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const isRTL = locale === 'ar';

  const bubbles = Array(8).fill().map(() => ({
    translateY: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0.3)).current,
    rotate: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    const configs = [
      { durY: 3000, durX: 2500, delay: 0, size: 1.1, rangeX: 30, rangeY: 25 },
      { durY: 3500, durX: 2800, delay: 400, size: 0.9, rangeX: 25, rangeY: 30 },
      { durY: 2800, durX: 3200, delay: 800, size: 1.0, rangeX: 35, rangeY: 20 },
      { durY: 3200, durX: 2700, delay: 1200, size: 0.85, rangeX: 20, rangeY: 35 },
      { durY: 2700, durX: 3400, delay: 1600, size: 1.05, rangeX: 40, rangeY: 25 },
      { durY: 3400, durX: 2900, delay: 2000, size: 0.95, rangeX: 25, rangeY: 40 },
      { durY: 3100, durX: 3600, delay: 2400, size: 1.0, rangeX: 30, rangeY: 30 },
      { durY: 2900, durX: 3100, delay: 2800, size: 0.9, rangeX: 35, rangeY: 25 },
    ];

    bubbles.forEach((bubble, i) => {
      Animated.loop(Animated.sequence([
        Animated.timing(bubble.translateY, { toValue: configs[i].rangeY, duration: configs[i].durY, useNativeDriver: true }),
        Animated.timing(bubble.translateY, { toValue: -configs[i].rangeY, duration: configs[i].durY, useNativeDriver: true }),
      ])).start();

      Animated.loop(Animated.sequence([
        Animated.timing(bubble.translateX, { toValue: configs[i].rangeX, duration: configs[i].durX, useNativeDriver: true }),
        Animated.timing(bubble.translateX, { toValue: -configs[i].rangeX, duration: configs[i].durX, useNativeDriver: true }),
      ])).start();

      Animated.timing(bubble.scale, { toValue: configs[i].size, duration: 700, delay: configs[i].delay, useNativeDriver: true }).start();

      Animated.loop(Animated.sequence([
        Animated.timing(bubble.rotate, { toValue: 20, duration: 2200 + i * 150, useNativeDriver: true }),
        Animated.timing(bubble.rotate, { toValue: -20, duration: 2200 + i * 150, useNativeDriver: true }),
      ])).start();
    });
  }, []);

  const handleResetPassword = async () => {
    if (!otpCode || !password || !passwordConfirmation) {
      Alert.alert(t('alertTitle') || 'تنبيه', isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    
    if (password !== passwordConfirmation) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'كلمتا المرور غير متطابقتين!' : 'Passwords do not match!');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (!contactInfo) {
      Alert.alert('خطأ', isRTL ? 'البيانات المطلوبة مفقودة' : 'Required information is missing');
      return;
    }

    setLoading(true);
    let result;
    
    if (sendMethod === 'email') {
      // التحقق عبر الإيميل
      result = await authService.verifyOtpEmail(contactInfo, otpCode);
    } else {
      // التحقق عبر الهاتف
      result = await authService.verifyOtpPhone(contactInfo, otpCode);
    }
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert('نجاح', result.message || 'تم التحقق بنجاح');
      onNavigateToLogin();
    } else {
      Alert.alert('خطأ', result.message);
    }
  };

  const bubbleIcons = ['🔐', '✨', '⭐', '💫', '🔑', '🛡️', '🌟', '💎'];
  const positions = [
    { top: -45, left: -35 }, { top: -55, right: -40 }, { bottom: 25, left: -40 }, { bottom: -35, right: -35 },
    { top: 35, left: -50 }, { bottom: 45, right: -50 }, { top: -25, right: -45 }, { bottom: 15, left: -45 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {bubbles.map((_, i) => (
          <Animated.View key={i} style={[styles.bubble, positions[i], {
            transform: [
              { translateX: bubbles[i].translateX },
              { translateY: bubbles[i].translateY },
              { scale: bubbles[i].scale },
              { rotate: bubbles[i].rotate.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] }) }
            ]
          }]}>
            <View style={[styles.bubbleInner, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '60' }]}>
              <Text style={styles.bubbleIcon}>{bubbleIcons[i]}</Text>
            </View>
          </Animated.View>
        ))}

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t('resetPassword') || 'تعيين كلمة المرور الجديدة'}</Text>
          <Text style={[styles.subLabel, { color: theme.textMuted }]}>
            {sendMethod === 'email'
              ? (isRTL ? `البريد الإلكتروني: ${contactInfo}` : `Email: ${contactInfo}`)
              : (isRTL ? `رقم الهاتف: ${contactInfo}` : `Phone: ${contactInfo}`)
            }
          </Text>
          
          <TextInput 
            style={[styles.input, { 
              borderColor: theme.border, 
              color: theme.text, 
              textAlign: 'center', 
              backgroundColor: theme.background 
            }]} 
            placeholder={t('otpPlaceholder') || 'رمز التحقق (OTP)'} 
            placeholderTextColor={theme.textMuted} 
            keyboardType="number-pad" 
            value={otpCode} 
            onChangeText={setOtpCode} 
          />
          
          <TextInput 
            style={[styles.input, { 
              borderColor: theme.border, 
              color: theme.text, 
              textAlign: isRTL ? 'right' : 'left', 
              backgroundColor: theme.background 
            }]} 
            placeholder={t('newPasswordPlaceholder') || 'كلمة المرور الجديدة'} 
            placeholderTextColor={theme.textMuted} 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />
          
          <TextInput 
            style={[styles.input, { 
              borderColor: theme.border, 
              color: theme.text, 
              textAlign: isRTL ? 'right' : 'left', 
              backgroundColor: theme.background 
            }]} 
            placeholder={t('confirmPasswordPlaceholder') || 'تأكيد كلمة المرور'} 
            placeholderTextColor={theme.textMuted} 
            secureTextEntry 
            value={passwordConfirmation} 
            onChangeText={setPasswordConfirmation} 
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]} 
            onPress={handleResetPassword} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('savePassword') || 'حفظ وتغيير كلمة المرور'}</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={[styles.link, { color: theme.primary }]}>{t('backToLogin') || 'العودة لتسجيل الدخول'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { 
    padding: 30, 
    borderRadius: 25, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    overflow: 'hidden' 
  },
  content: { zIndex: 10 },
  bubble: { position: 'absolute', zIndex: 5 },
  bubbleInner: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    borderWidth: 1.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 6 
  },
  bubbleIcon: { fontSize: 22 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subLabel: { fontSize: 14, marginBottom: 25, textAlign: 'center', opacity: 0.7, fontStyle: 'italic' },
  input: { 
    borderWidth: 1, 
    padding: 15, 
    borderRadius: 14, 
    marginBottom: 15, 
    fontSize: 15 
  },
  button: { 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 10, 
    elevation: 4, 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5 
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 15, textAlign: 'center', fontSize: 14, fontWeight: '600' },
});