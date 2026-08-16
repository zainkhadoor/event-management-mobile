// src/features/auth/screens/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, Animated, Dimensions } from 'react-native';
import { useApp } from '../../../store/AppContext';
import authService from '../../../services/authService';

// Import logos
const logoLight = require('../../../assets/outLogoLight.jpg');
const logoDark = require('../../../assets/outLogoDark.jpg');

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister, onNavigateToForgot }) {
  const { theme, t, toggleTheme, changeLanguage, locale, themeMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
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
  
  // 8 فقاعات بدلاً من 6
  const bubbleScales = Array(8).fill().map(() => useRef(new Animated.Value(0.3)).current);
  const bubbleTranslatesX = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);
  const bubbleTranslatesY = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);
  const bubbleRotations = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);
  const bubbleOpacities = Array(8).fill().map(() => useRef(new Animated.Value(0)).current);

  // أيقونات أكثر فخامة
  const bubbleIcons = ['👑', '🌝', '🦥', '🌟', '🏰', '💐', '🥂', '🪸'];

  useEffect(() => {
    // حركة تنفس متطورة للشعار
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

    // دوران احترافي للشعار
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: -1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    // حركات الفقاعات المتعددة - مسارات بيضاوية أكثر جمالاً
    const bubbleConfigs = [
      { durX: 3000, durY: 2500, delay: 0, size: 1.2, rangeX: 40, rangeY: 30, startX: -25, startY: -20 },
      { durX: 3500, durY: 2800, delay: 500, size: 0.9, rangeX: 35, rangeY: 35, startX: 30, startY: -40 },
      { durX: 2800, durY: 3200, delay: 1000, size: 1.0, rangeX: 30, rangeY: 25, startX: -35, startY: 25 },
      { durX: 3200, durY: 2700, delay: 1500, size: 1.1, rangeX: 45, rangeY: 30, startX: 35, startY: 35 },
      { durX: 2700, durY: 3400, delay: 2000, size: 0.8, rangeX: 25, rangeY: 40, startX: -45, startY: -35 },
      { durX: 3400, durY: 2900, delay: 2500, size: 0.9, rangeX: 40, rangeY: 25, startX: 40, startY: -25 },
      { durX: 3100, durY: 3600, delay: 3000, size: 1.0, rangeX: 30, rangeY: 45, startX: -30, startY: 40 },
      { durX: 2900, durY: 3100, delay: 3500, size: 0.95, rangeX: 50, rangeY: 35, startX: 25, startY: 45 },
    ];

    bubbleConfigs.forEach((config, index) => {
      // حركة أفقية (X)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleTranslatesX[index], {
            toValue: config.rangeX,
            duration: config.durX,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleTranslatesX[index], {
            toValue: -config.rangeX,
            duration: config.durX,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // حركة عمودية (Y)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleTranslatesY[index], {
            toValue: config.rangeY,
            duration: config.durY,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleTranslatesY[index], {
            toValue: -config.rangeY,
            duration: config.durY,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // ظهور الفقاعات بشكل تدريجي
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(bubbleOpacities[index], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // حجم الفقاعات
      Animated.timing(bubbleScales[index], {
        toValue: config.size,
        duration: 800,
        delay: config.delay,
        useNativeDriver: true,
      }).start();

      // دوران الفقاعات
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleRotations[index], {
            toValue: 20,
            duration: 2500 + index * 150,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleRotations[index], {
            toValue: -20,
            duration: 2500 + index * 150,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-0.08rad', '0.08rad'],
  });

  const getBubbleRotation = (index) => {
    return bubbleRotations[index].interpolate({
      inputRange: [-20, 20],
      outputRange: ['-20deg', '20deg'],
    });
  };

  const getBubblePosition = (index) => {
    const positions = [
      { top: -40, left: -30 },
      { top: -60, right: -35 },
      { bottom: 30, left: -45 },
      { bottom: -30, right: -40 },
      { top: 50, left: -55 },
      { bottom: 60, right: -55 },
      { top: -20, right: -50 },
      { bottom: 20, left: -50 },
    ];
    return positions[index];
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('alertTitle') || 'تنبيه', t('alertMessage') || 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('نجاح', result.data.message);
      // تأكد من استدعاء onLoginSuccess مع بيانات المستخدم
      if (onLoginSuccess) {
        onLoginSuccess(result.data.user);
      }
    } else {
      Alert.alert('خطأ', result.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* أزرار الثيم واللغة */}
        <View style={[styles.topButtonsContainer, { flexDirection: flexDirectionStyle }]}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface }]} onPress={toggleTheme}>
            <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.langButton, { backgroundColor: theme.surface }]} onPress={changeLanguage}>
            <Text style={[styles.langText, { color: theme.text }]}>🌐 {locale.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* قسم الهيرو مع تأثيرات احترافية */}
        <View style={styles.heroSection}>
          
          {/* الفقاعات المتعددة - 8 فقاعات */}
          {[0,1,2,3,4,5,6,7].map((i) => {
            const position = getBubblePosition(i);
            return (
              <Animated.View
                key={i}
                style={[
                  styles.bubblePro,
                  {
                    ...position,
                    opacity: bubbleOpacities[i],
                    transform: [
                      { translateX: bubbleTranslatesX[i] },
                      { translateY: bubbleTranslatesY[i] },
                      { scale: bubbleScales[i] },
                      { rotate: getBubbleRotation(i) }
                    ]
                  }
                ]}
              >
                <View style={[
                  styles.bubbleInnerPro,
                  {
                    backgroundColor: theme.primary + (i % 2 === 0 ? '20' : '25'),
                    borderColor: theme.primary + (i % 2 === 0 ? '60' : '70'),
                  }
                ]}>
                  <Text style={styles.bubbleIconPro}>{bubbleIcons[i]}</Text>
                </View>
              </Animated.View>
            );
          })}

          {/* تأثير التوهج المتقدم */}
          <Animated.View style={[
            styles.glowEffectAdvanced,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
              backgroundColor: theme.primary,
            }
          ]} />

          {/* تأثير هالة خارجية */}
          <Animated.View style={[
            styles.outerHalo,
            {
              borderColor: theme.primary,
              transform: [{ scale: glowScale }],
            }
          ]} />

          {/* تأثير هالة ثانية داخلية */}
          <Animated.View style={[
            styles.innerHalo,
            {
              borderColor: theme.primary + '80',
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            }
          ]} />

          {/* الشعار الدائري مع إطار متوهج */}
          <Animated.View style={[
            styles.largeRoundLogoContainer,
            {
              transform: [
                { scale: logoScale },
                { rotate: rotateInterpolate }
              ],
              backgroundColor: theme.surface,
              borderColor: theme.primary,
              shadowColor: theme.primary,
            }
          ]}>
            <Image
              source={isDark ? logoDark : logoLight}
              style={styles.largeRoundLogo}
              resizeMode="cover"
            />
          </Animated.View>

          <Text style={[styles.brandName, { color: theme.primary }]}> </Text>
          <Text style={[styles.mainTitle, { color: 'white' }]}>{isRTL ? "تسجيل الدخول" : "Log In"}</Text>
          <Text style={[styles.subtitle, { color: 'white' }]}>{isRTL ? "سجل دخولك لإدارة فعالياتك" : "Sign in to manage your events"}</Text>
        </View>

        <View style={styles.formSection}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: flexDirectionStyle }]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, textAlign: textAlignment }]} 
              placeholder={t('emailPlaceholder') || 'البريد الإلكتروني'}
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: flexDirectionStyle }]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput 
              style={[styles.input, { color: theme.text, textAlign: textAlignment, flex: 1 }]} 
              placeholder={t('passwordPlaceholder') || 'كلمة المرور'}
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Text style={styles.inputIcon}>{secureText ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={onNavigateToForgot}
            style={{ alignSelf: isRTL ? 'flex-start' : 'flex-end', marginBottom: 20 }}
          >
            <Text style={[styles.forgotText, { color: 'yellow' }]}>
              {isRTL ? "هل نسيت كلمة المرور؟" : "Forgot Password?"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.primaryButtonText, { color: theme.background === '#121212' ? '#121212' : '#FFF' }]}>
                {t('login') || 'تسجيل الدخول'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.dividerWrapper, { flexDirection: flexDirectionStyle }]}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: 'white' }]}>{isRTL ? "أو سجل دخولك عبر" : "Or sign in with"}</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>



        <View style={[styles.footer, { flexDirection: flexDirectionStyle }]}>
          <Text style={[styles.footerText, { color: theme.text }]}>
            {isRTL ?  "ليس لديك حساب؟  " : "Don't have an account?  "}
          </Text>

          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={[styles.registerLink, { color: theme.text }]}>
              {isRTL ? "أنشئ حساباً" : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  
  topButtonsContainer: {
    position: 'absolute',
    top: 20,
    left: 24,
    right: 24,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  langButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  langText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 80,
    position: 'relative',
    minHeight: 300,
  },
  
  glowEffectAdvanced: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.4,
    top: -40,
  },
  
  outerHalo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    top: -30,
    opacity: 0.6,
  },
  
  innerHalo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    top: -15,
    opacity: 0.4,
  },
  
  bubblePro: {
    position: 'absolute',
    zIndex: 15,
  },
  
  bubbleInnerPro: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  bubbleIconPro: {
    fontSize: 28,
  },
  
  largeRoundLogoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 20,
  },
  largeRoundLogo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
    zIndex: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
    zIndex: 20,
  },
  subtitle: {
      fontSize: 13,
  textAlign: 'center',
  flexWrap: 'wrap',
  width: '100%',
  paddingHorizontal: 20,
  lineHeight: 18,
  marginTop: 4,
  },
  
  formSection: { width: '100%' },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 55,
  },
  inputIcon: { fontSize: 18, marginHorizontal: 5 },
  input: { flex: 1, height: '100%', fontSize: 15 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  actionSection: { width: '100%' },
  primaryButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  primaryButtonText: { fontSize: 16, fontWeight: 'bold' },
  dividerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, paddingHorizontal: 10 },
  socialRow: {
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
  },
  socialButton: {
    flex: 0.47,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: { fontSize: 16, marginHorizontal: 6 },
  socialText: { fontSize: 14, fontWeight: '600' },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});