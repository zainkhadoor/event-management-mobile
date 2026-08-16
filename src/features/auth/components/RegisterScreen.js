import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator, Animated } from 'react-native';
import { useApp } from '../../../store/AppContext';
import * as ImagePicker from 'expo-image-picker';
import authService from '../../../services/authService';

// Import logos
const logoLight = require('../../../assets/outLogoLight.jpg');
const logoDark = require('../../../assets/outLogoDark.jpg');

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }) {
  const { theme, locale, t, themeMode } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const isRTL = locale === 'ar';
  const textAlignment = isRTL ? 'right' : 'left';
  const flexDirectionStyle = isRTL ? 'row-reverse' : 'row';
  const isDark = themeMode === 'dark';

  // حركات متقدمة للشعار
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  
  // حركات الفقاعات
  const bubbleScales = Array(8).fill().map(() => useRef(new Animated.Value(0.3)).current);
  const bubbleTranslates = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);
  const bubbleRotations = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    // حركة تنفس للشعار
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 1.08, duration: 2500, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.8, duration: 2500, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 0.96, duration: 2500, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.2, duration: 2500, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 0.9, duration: 2500, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // دوران
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: -1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    // حركات الفقاعات
    const configs = [
      { dur: 3000, delay: 0, size: 1.2 },
      { dur: 3500, delay: 500, size: 0.9 },
      { dur: 2800, delay: 1000, size: 1.0 },
      { dur: 3200, delay: 1500, size: 1.1 },
      { dur: 2700, delay: 2000, size: 0.8 },
      { dur: 3400, delay: 2500, size: 0.9 },
      { dur: 3100, delay: 3000, size: 1.0 },
      { dur: 2900, delay: 3500, size: 0.95 },
    ];

    configs.forEach((cfg, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleTranslates[i], { toValue: -25, duration: cfg.dur, useNativeDriver: true }),
          Animated.timing(bubbleTranslates[i], { toValue: 25, duration: cfg.dur, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(bubbleScales[i], { toValue: cfg.size, duration: 800, delay: cfg.delay, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleRotations[i], { toValue: 15, duration: 2000 + i * 200, useNativeDriver: true }),
          Animated.timing(bubbleRotations[i], { toValue: -15, duration: 2000 + i * 200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const rotateInterpolate = logoRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-0.08rad', '0.08rad'] });
  
  const getBubbleRotation = (index) => {
    return bubbleRotations[index].interpolate({
      inputRange: [-15, 15],
      outputRange: ['-15deg', '15deg'],
    });
  };

  const handlePickImage = () => {
    Alert.alert(
      t('photoAlertTitle') || 'إضافة صورة',
      t('photoAlertMessage') || 'اختر مصدر الصورة',
      [
        { text: t('camera') || 'الكاميرا', onPress: launchCamera },
        { text: t('gallery') || 'المعرض', onPress: launchGallery },
        { text: t('cancel') || 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const launchGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert(t('alertTitle') || 'تنبيه', isRTL ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    if (!agreeTerms) {
      Alert.alert(t('alertTitle') || 'تنبيه', t('agreeTerms') || 'يجب الموافقة على الشروط');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', t('confirmPassword') || 'كلمة المرور غير متطابقة');
      return;
    }
    if (password.length < 8) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);
    const result = await authService.register({
      name, email, phone, password, password_confirmation: confirmPassword,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('نجاح', result.data.message);
      onRegisterSuccess(result.data.user);
    } else {
      Alert.alert('خطأ', result.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.surface }]} onPress={onNavigateToLogin}>
          <Text style={[styles.backText, { color: theme.text }]}>{isRTL ? "↩️" : "←"} {isRTL ? "عودة" : "Back"}</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
          {/* فقاعات */}
          {[0,1,2,3,4,5,6,7].map((i) => (
            <Animated.View key={i} style={[
              styles.bubblePro, styles[`bubblePro${i+1}`],
              {
                transform: [
                  { translateY: bubbleTranslates[i] },
                  { scale: bubbleScales[i] },
                  { rotate: getBubbleRotation(i) }
                ]
              }
            ]}>
              <View style={[styles.bubbleInnerPro, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '60' }]}>
                <Text style={styles.bubbleIconPro}>{['👑', '🌝', '🦥', '🧿', '🏰', '💐', '🥂', '🪸'][i]}</Text>
              </View>
            </Animated.View>
          ))}

          {/* توهج */}
          <Animated.View style={[styles.glowEffectAdvanced, { opacity: glowOpacity, transform: [{ scale: glowScale }], backgroundColor: theme.primary }]} />
          <Animated.View style={[styles.outerHalo, { borderColor: theme.primary, transform: [{ scale: glowScale }] }]} />

          {/* شعار */}
          <Animated.View style={[styles.largeRoundLogoContainer, { transform: [{ scale: logoScale }, { rotate: rotateInterpolate }], backgroundColor: theme.surface, borderColor: theme.primary }]}>
            <Image source={isDark ? logoDark : logoLight} style={styles.largeRoundLogo} resizeMode="cover" />
          </Animated.View>

          <Text style={[styles.brandName, { color: theme.primary }]}>Evently</Text>
          <Text style={[styles.mainTitle, { color: theme.text }]}>{t('createAccount') || 'إنشاء حساب'}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('loginSubtitle') || 'قم بإنشاء حساب جديد'}</Text>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity style={[styles.avatarCircle, { backgroundColor: theme.surface, borderColor: theme.primary }]} onPress={handlePickImage}>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.avatarImage} /> : <>
              <Text style={styles.avatarIcon}>📷</Text>
              <Text style={[styles.avatarText, { color: theme.textMuted }]}>{isRTL ? "إضافة صورة" : "Add Photo"}</Text>
            </>}
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <TextInput style={[styles.fullInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, textAlign: textAlignment }]} placeholder={t('fullName') || 'الاسم الكامل'} placeholderTextColor={theme.textMuted} value={name} onChangeText={setName} />
          <TextInput style={[styles.fullInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, textAlign: textAlignment }]} placeholder={t('emailPlaceholder') || 'البريد الإلكتروني'} placeholderTextColor={theme.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={[styles.fullInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, textAlign: textAlignment }]} placeholder={t('phonePlaceholder') || 'رقم الهاتف'} placeholderTextColor={theme.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={[styles.fullInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, textAlign: textAlignment }]} placeholder={t('passwordPlaceholder') || 'كلمة المرور'} placeholderTextColor={theme.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={[styles.fullInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, textAlign: textAlignment }]} placeholder={t('confirmPassword') || 'تأكيد كلمة المرور'} placeholderTextColor={theme.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={[styles.checkboxContainer, { flexDirection: flexDirectionStyle }]} onPress={() => setAgreeTerms(!agreeTerms)}>
          <View style={[styles.checkbox, { borderColor: theme.primary, backgroundColor: agreeTerms ? theme.primary : 'transparent' }]}>{agreeTerms && <Text style={styles.checkboxCheck}>✓</Text>}</View>
          <Text style={[styles.checkboxLabel, { color: theme.textMuted }]}>{t('agreeTerms') || 'أوافق على الشروط والأحكام'}</Text>
        </TouchableOpacity>

        <View style={styles.actionSection}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.primaryButtonText, { color: theme.background === '#121212' ? '#121212' : '#FFF' }]}>{t('signup') || 'إنشاء حساب'}</Text>}
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { flexDirection: flexDirectionStyle }]}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>{t('alreadyHaveAccount') || 'لديك حساب بالفعل؟'}</Text>
          <TouchableOpacity onPress={onNavigateToLogin}><Text style={[styles.loginLink, { color: theme.primary }]}>{t('loginHere') || 'تسجيل الدخول'}</Text></TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 20, left: 24, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, flexDirection: 'row', alignItems: 'center', zIndex: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  backText: { fontSize: 14, fontWeight: 'bold' },
  heroSection: { alignItems: 'center', marginBottom: 20, marginTop: 70, position: 'relative', minHeight: 280 },
  glowEffectAdvanced: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.4, top: -35 },
  outerHalo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 2, top: -25, opacity: 0.6 },
  bubblePro: { position: 'absolute', zIndex: 15 },
  bubblePro1: { top: -30, left: -20 },
  bubblePro2: { top: -50, right: -25 },
  bubblePro3: { bottom: 20, left: -35 },
  bubblePro4: { bottom: -20, right: -30 },
  bubblePro5: { top: 40, left: -45 },
  bubblePro6: { bottom: 50, right: -45 },
  bubbleInnerPro: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  bubbleIconPro: { fontSize: 26 },
  largeRoundLogoContainer: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 20, elevation: 12, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, zIndex: 20 },
  largeRoundLogo: { width: '100%', height: '100%' },
  brandName: { fontSize: 32, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  mainTitle: { fontSize: 22, fontWeight: '700', marginBottom: 5 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  avatarContainer: { alignItems: 'center', marginVertical: 15 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarIcon: { fontSize: 22, marginBottom: 2 },
  avatarText: { fontSize: 11, fontWeight: '600' },
  formSection: { width: '100%' },
  fullInput: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 1, fontSize: 14, marginBottom: 12, height: 50 },
  checkboxContainer: { alignItems: 'center', marginVertical: 15, paddingHorizontal: 5 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  checkboxCheck: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 13, flex: 1, textAlign: 'left' },
  actionSection: { width: '100%' },
  primaryButton: { padding: 16, borderRadius: 14, alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  primaryButtonText: { fontSize: 16, fontWeight: 'bold' },
  footer: { justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  footerText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },
});