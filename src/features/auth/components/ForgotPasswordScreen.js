import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../../store/AppContext';
import authService from '../../../services/authService';

export default function ForgotPasswordScreen({ onNavigateToLogin, onNavigateToReset }) {
  const { theme, t, locale } = useApp();
  const [contactInfo, setContactInfo] = useState('');
  const [sendMethod, setSendMethod] = useState('email'); // 'email' أو 'whatsapp'
  const [loading, setLoading] = useState(false);
  const isRTL = locale === 'ar';

  const bubbles = Array(6).fill().map(() => ({
    translateY: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0.3)).current,
    rotate: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    const configs = [
      { dur: 3000, delay: 0, size: 1.1, startY: -30, startX: -40 },
      { dur: 3500, delay: 500, size: 0.9, startY: -50, startX: 35 },
      { dur: 2800, delay: 1000, size: 1.0, startY: 40, startX: -35 },
      { dur: 3200, delay: 1500, size: 0.85, startY: 50, startX: 30 },
      { dur: 2700, delay: 2000, size: 1.05, startY: -20, startX: -50 },
      { dur: 3400, delay: 2500, size: 0.95, startY: 30, startX: 45 },
    ];

    bubbles.forEach((bubble, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.translateY, { toValue: -20, duration: configs[i].dur, useNativeDriver: true }),
          Animated.timing(bubble.translateY, { toValue: 20, duration: configs[i].dur, useNativeDriver: true }),
        ])
      ).start();

      Animated.timing(bubble.scale, { toValue: configs[i].size, duration: 800, delay: configs[i].delay, useNativeDriver: true }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.rotate, { toValue: 15, duration: 2000 + i * 200, useNativeDriver: true }),
          Animated.timing(bubble.rotate, { toValue: -15, duration: 2000 + i * 200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const getBubbleStyle = (i, config) => ({
    position: 'absolute',
    top: config.startY,
    left: config.startX,
    transform: [
      { translateY: bubbles[i].translateY },
      { scale: bubbles[i].scale },
      { rotate: bubbles[i].rotate.interpolate({ inputRange: [-15, 15], outputRange: ['-15deg', '15deg'] }) }
    ],
  });

  // معالجة الكتابة في الخانة لضمان إضافة الـ + تلقائياً عند كتابة رقم الهاتف
  const handleInputChange = (text) => {
    if (sendMethod === 'whatsapp') {
      if (!text) {
        setContactInfo('');
        return;
      }
      
      // إذا أدخل +963 أتركها، وإذا بدأ بدون + ضع الـ + تلقائياً للمستخدم
      if (text.startsWith('+')) {
        setContactInfo(text);
      } else {
        setContactInfo('+' + text);
      }
    } else {
      setContactInfo(text);
    }
  };

  const handleSendCode = async () => {
    const trimmedInfo = contactInfo.trim();
    
    if (!trimmedInfo || (sendMethod === 'whatsapp' && trimmedInfo === '+')) {
      const errorMsg = sendMethod === 'email' 
        ? (isRTL ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email')
        : (isRTL ? 'يرجى إدخال رقم الـ WhatsApp' : 'Please enter your WhatsApp number');
      
      Alert.alert(t('alertTitle') || 'تنبيه', errorMsg);
      return;
    }
    
    setLoading(true);
    let result;
    
    // إذا اختار البريد الإلكتروني يستخدم ForgotPassword، أما الواتساب فيستدعي SendOTP
    if (sendMethod === 'email') {
      result = await authService.forgotPassword(trimmedInfo);
    } else {
      result = await authService.sendOtp(trimmedInfo);
    }
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert('نجاح', result.message);
      if (onNavigateToReset) {
        onNavigateToReset({ contactInfo: trimmedInfo, sendMethod });
      }
    } else {
      Alert.alert('خطأ', result.message);
    }
  };

  const bubbleIcons = ['🔑', '📧', '✨', '💌', '🔐', '🌟'];
  const positions = [
    { top: -40, left: -30 }, 
    { top: -50, right: -35 }, 
    { bottom: 30, left: -35 }, 
    { bottom: -30, right: -30 }, 
    { top: 40, left: -45 }, 
    { bottom: 50, right: -45 }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {bubbles.map((_, i) => (
          <Animated.View key={i} style={[styles.bubble, positions[i], getBubbleStyle(i, positions[i])]}>
            <View style={[styles.bubbleInner, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '60' }]}>
              <Text style={styles.bubbleIcon}>{bubbleIcons[i]}</Text>
            </View>
          </Animated.View>
        ))}

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword') || 'نسيت كلمة المرور'}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {isRTL 
              ? 'اختر طريقة إرسال رمز التحقق المفضلة لديك' 
              : 'Choose your preferred verification code delivery method'}
          </Text>

          <View style={styles.methodContainer}>
            <TouchableOpacity 
              style={[
                styles.methodButton, 
                { borderColor: theme.border },
                sendMethod === 'email' && { backgroundColor: theme.primary + '15', borderColor: theme.primary }
              ]}
              onPress={() => {
                setSendMethod('email');
                setContactInfo('');
              }}
            >
              <Text style={[styles.methodText, { color: sendMethod === 'email' ? theme.primary : theme.text }]}>
                📧 {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.methodButton, 
                { borderColor: theme.border },
                sendMethod === 'whatsapp' && { backgroundColor: '#25D36620', borderColor: '#25D366' }
              ]}
              onPress={() => {
                setSendMethod('whatsapp');
                setContactInfo('+963'); // وضع المفتاح التلقائي لسوريا عند الضغط
              }}
            >
              <Text style={[styles.methodText, { color: sendMethod === 'whatsapp' ? '#25D366' : theme.text }]}>
                💬 WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput 
            style={[styles.input, { 
              borderColor: theme.border, 
              color: theme.text, 
              textAlign: isRTL ? 'right' : 'left', 
              backgroundColor: theme.background 
            }]} 
            placeholder={
              sendMethod === 'email' 
                ? (t('emailPlaceholder') || 'أدخل البريد الإلكتروني') 
                : '+9639xxxxxxx'
            }
            placeholderTextColor={theme.textMuted} 
            keyboardType={sendMethod === 'email' ? "email-address" : "phone-pad"} 
            autoCapitalize="none" 
            value={contactInfo} 
            onChangeText={handleInputChange} 
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]} 
            onPress={handleSendCode} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('sendResetCode') || 'إرسال رمز التحقق'}</Text>}
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
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center', opacity: 0.8 },
  methodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  methodButton: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  methodText: { fontSize: 14, fontWeight: '600' },
  input: { 
    borderWidth: 1, 
    padding: 15, 
    borderRadius: 14, 
    marginBottom: 20, 
    fontSize: 15 
  },
  button: { 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    elevation: 4, 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5 
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 15, textAlign: 'center', fontSize: 14, fontWeight: '600' },
});