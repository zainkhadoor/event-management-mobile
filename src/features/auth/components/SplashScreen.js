// src/features/auth/components/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../../store/AppContext';

const { width, height } = Dimensions.get('window');

// Import logos
const logoLight = require('../../../assets/outLogoLight.jpg');

export default function SplashScreen({ onFinish }) {
  const { theme, t, locale, themeMode } = useApp();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.3)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(40)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const decorativeMoveAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  const isRTL = locale === 'ar';
  const isDark = themeMode === 'dark';

  // Fallback logo if dark mode
  const logoSource = isDark ? require('../../../assets/outLogoLight.jpg') : logoLight;

  useEffect(() => {
    // Sequential animations for professional feel
    const animationSequence = Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Logo appears with spring effect
      Animated.parallel([
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Decorative elements float
      Animated.parallel([
        Animated.timing(decorativeMoveAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        // Text slides in
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Start shimmer animation for loader
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    animationSequence.start();

    // Transition after 5 seconds
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Decorative floating circles interpolation
  const circle1Transform = decorativeMoveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });
  const circle2Transform = decorativeMoveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });
  const circle3Transform = decorativeMoveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const circle4Transform = decorativeMoveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  // Shimmer translation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  return (
    <LinearGradient
      colors={isDark ? ['#1E2B38', '#0D1520'] : ['#BFDEF3', '#E8F4F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Decorative background elements */}
        <View style={styles.decorativeContainer}>
          <Animated.View 
            style={[
              styles.decorationCircle1, 
              { 
                backgroundColor: isDark ? 'rgba(224, 183, 244, 0.08)' : 'rgba(224, 183, 244, 0.15)',
                transform: [{ translateY: circle1Transform }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.decorationCircle2, 
              { 
                backgroundColor: isDark ? 'rgba(242, 181, 225, 0.06)' : 'rgba(242, 181, 225, 0.12)',
                transform: [{ translateY: circle2Transform }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.decorationCircle3, 
              { 
                backgroundColor: isDark ? 'rgba(255, 201, 180, 0.05)' : 'rgba(255, 201, 180, 0.10)',
                transform: [{ translateY: circle3Transform }]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.decorationCircle4, 
              { 
                backgroundColor: isDark ? 'rgba(107, 212, 200, 0.05)' : 'rgba(107, 212, 200, 0.10)',
                transform: [{ translateY: circle4Transform }]
              }
            ]} 
          />
        </View>

        {/* Logo with elegant animation */}
        <Animated.View
          style={[
            styles.logoOuterContainer,
            {
              opacity: logoOpacityAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          {/* Glow effect behind logo */}
          <View style={[styles.logoGlow, { 
            backgroundColor: isDark ? 'rgba(224, 183, 244, 0.15)' : 'rgba(224, 183, 244, 0.20)' 
          }]} />
          
          <View style={[styles.logoContainer, { 
            shadowColor: isDark ? 'rgba(224, 183, 244, 0.3)' : 'rgba(191, 222, 243, 0.5)',
            backgroundColor: isDark ? 'rgba(30, 43, 56, 0.8)' : '#FFFFFF',
          }]}>
            <Image
              source={logoSource}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* App name with elegant typography */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <Text style={[styles.brandName, { color: isDark ? '#E0B7F4' : '#1E2B38' }]}>
            {t('appName') || 'Eventak'}
          </Text>

          <Text style={[styles.tagline, { color: isDark ? 'rgba(255,255,255,0.6)' : '#5C748C' }]}>
            {isRTL ? 'أفخم الفعاليات بلمسة ملكية' : 'Luxury events with a royal touch'}
          </Text>
        </Animated.View>

        {/* Elegant shimmer loader */}
        <View style={styles.loaderContainer}>
          <View style={[styles.loaderTrack, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30, 43, 56, 0.08)' 
          }]}>
            <Animated.View 
              style={[
                styles.loaderShimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                  backgroundColor: isDark ? 'rgba(224, 183, 244, 0.3)' : 'rgba(224, 183, 244, 0.4)',
                }
              ]} 
            />
          </View>
        </View>

        {/* Decorative dots */}
        <View style={styles.decorativeDots}>
          <View style={[styles.dot, { backgroundColor: isDark ? '#E0B7F4' : '#E0B7F4', opacity: 0.6 }]} />
          <View style={[styles.dot, { backgroundColor: isDark ? '#F2B5E1' : '#F2B5E1', opacity: 0.4 }]} />
          <View style={[styles.dot, { backgroundColor: isDark ? '#6BD4C8' : '#6BD4C8', opacity: 0.3 }]} />
        </View>

        {/* Copyright */}
        <Animated.Text style={[styles.copyright, { 
          color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(30, 43, 56, 0.3)',
          opacity: textFadeAnim 
        }]}>
          © 2024 Eventak | {isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85,
    height: height,
    position: 'relative',
  },
  decorativeContainer: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorationCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  decorationCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    bottom: -width * 0.1,
    left: -width * 0.25,
  },
  decorationCircle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    top: height * 0.35,
    right: width * 0.05,
  },
  decorationCircle4: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    bottom: height * 0.25,
    left: width * 0.1,
  },
  logoOuterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.5,
    transform: [{ scale: 1.2 }],
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(224, 183, 244, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  tagline: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  loaderContainer: {
    width: 200,
    marginBottom: 50,
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  loaderShimmer: {
    width: 80,
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
  },
  decorativeDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 30,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  copyright: {
    fontSize: 10,
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    width: width * 0.8,
    letterSpacing: 0.5,
  },
});