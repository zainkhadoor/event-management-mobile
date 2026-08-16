import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../../store/AppContext';
import { themes } from '../../../styles/theme';

// Import logos
const logoLight = require('../../../assets/outLogoLight.jpg');
const logoDark = require('../../../assets/outLogoDark.jpg');

const { width, height } = Dimensions.get('window');

// Create Animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Premium Onboarding Data with Theme Colors
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'صالات فاخرة\nلأجمل المناسبات',
    subtitle: 'اختر قاعة أحلامك',
    description: 'تصفح تشكيلة واسعة من القاعات الفخمة والمجهزة بأحدث التقنيات',
    tagline: '✨ قاعات أحلامك',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=800&fit=crop&q=80',
    gradient: ['#E0B7F4', '#BFDEF3'],
    accentColor: '#E0B7F4',
    floatingIcons: ['👑', '🏰', '💐', '🌟', '✨', '🎪', '🥂', '🪄'],
  },
  {
    id: '2',
    title: 'قائمة طعام\nمتكاملة',
    subtitle: 'أشهى المأكولات والمشروبات',
    description: 'تشكيلة مميزة من الأطباق العالمية والحلويات والمشروبات المنعشة',
    tagline: '🍽️ تجربة طعام فاخرة',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&q=80',
    gradient: ['#6BD4C8', '#B9E9E9'],
    accentColor: '#6BD4C8',
    floatingIcons: ['🍽️', '🍷', '🥩', '🍰', '🍣', '🥗', '🍝', '🍨'],
  },
  {
    id: '3',
    title: 'سيارات فاخرة\nلمواكبتك',
    subtitle: 'أناقة تليق بمناسبتك',
    description: 'أضف لمسة من الفخامة مع تشكيلة من السيارات الراقية',
    tagline: '🚗 أناقة لا تضاهى',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=800&fit=crop&q=80',
    gradient: ['#F2B5E1', '#FFC9B4'],
    accentColor: '#F2B5E1',
    floatingIcons: ['🚗', '🏎️', '✨', '🌟', '💫', '🎯', '⭐', '🌈'],
  },
];

export default function OnboardingScreens({ onFinish }) {
  const { locale, themeMode } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Get theme colors
  const colors = themes.light;
  const isDark = themeMode === 'dark';
  
  // Animation values
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  
  // Floating particles
  const particleAnimations = Array(8).fill().map(() => ({
    scale: useRef(new Animated.Value(0.3)).current,
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  }));

  const isRTL = locale === 'ar';

  useEffect(() => {
    // Premium breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 1.06, duration: 3000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.7, duration: 3000, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.2, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 0.97, duration: 3000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.15, duration: 3000, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 0.85, duration: 3000, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Gentle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, { toValue: 0.5, duration: 5000, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: -0.5, duration: 5000, useNativeDriver: true }),
      ])
    ).start();

    // Start particle animations
    startParticleAnimations();
  }, []);

  const startParticleAnimations = () => {
    const configs = [
      { durX: 4000, durY: 3500, delay: 0, size: 1.0, rangeX: 50, rangeY: 40 },
      { durX: 4500, durY: 3800, delay: 600, size: 0.8, rangeX: 45, rangeY: 45 },
      { durX: 3800, durY: 4200, delay: 1200, size: 0.9, rangeX: 40, rangeY: 35 },
      { durX: 4200, durY: 3700, delay: 1800, size: 1.1, rangeX: 55, rangeY: 40 },
      { durX: 3700, durY: 4400, delay: 2400, size: 0.7, rangeX: 35, rangeY: 50 },
      { durX: 4400, durY: 3900, delay: 3000, size: 0.85, rangeX: 50, rangeY: 35 },
      { durX: 4100, durY: 4600, delay: 3600, size: 0.95, rangeX: 40, rangeY: 55 },
      { durX: 3900, durY: 4100, delay: 4200, size: 0.75, rangeX: 60, rangeY: 45 },
    ];

    configs.forEach((config, index) => {
      const anim = particleAnimations[index];

      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateX, {
            toValue: config.rangeX,
            duration: config.durX,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: -config.rangeX,
            duration: config.durX,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateY, {
            toValue: config.rangeY,
            duration: config.durY,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: -config.rangeY,
            duration: config.durY,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(anim.scale, {
        toValue: config.size,
        duration: 1000,
        delay: config.delay,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.rotate, {
            toValue: 15,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: -15,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [-0.5, 0.5],
    outputRange: ['-0.05rad', '0.05rad'],
  });

  const getParticleRotation = (index) => {
    return particleAnimations[index].rotate.interpolate({
      inputRange: [-15, 15],
      outputRange: ['-15deg', '15deg'],
    });
  };

  const getParticlePosition = (index) => {
    const positions = [
      { top: -30, left: -25 },
      { top: -50, right: -30 },
      { bottom: 35, left: -40 },
      { bottom: -25, right: -35 },
      { top: 35, left: -50 },
      { bottom: 45, right: -50 },
      { top: -15, right: -45 },
      { bottom: 25, left: -45 },
    ];
    return positions[index];
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      if (onFinish) onFinish();
    }
  };

  const handleSkip = () => {
    if (onFinish) onFinish();
  };

  // Parallax effects
  const getParallaxStyle = (index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    const outputRange = [1.1, 1, 1.1];
    const scale = scrollX.interpolate({ inputRange, outputRange });
    return { transform: [{ scale }] };
  };

  const getTextParallax = (index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    const outputRange = [0.3, 1, 0.3];
    const opacity = scrollX.interpolate({ inputRange, outputRange });
    return { opacity };
  };

  const renderItem = ({ item, index }) => {
    const isLast = index === ONBOARDING_DATA.length - 1;
    const currentGradient = isDark ? 
      [colors.primaryDark, colors.background] : 
      item.gradient;

    return (
      <View style={[styles.slideContainer, { width }]}>
        <LinearGradient
          colors={currentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.slideGradient}
        >
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            translucent
            backgroundColor="transparent"
          />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.slideContent}>
              {/* Creative Floating Particles */}
              {item.floatingIcons.map((icon, i) => {
                const position = getParticlePosition(i);
                const anim = particleAnimations[i];
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.particle,
                      {
                        ...position,
                        opacity: anim.opacity,
                        transform: [
                          { translateX: anim.translateX },
                          { translateY: anim.translateY },
                          { scale: anim.scale },
                          { rotate: getParticleRotation(i) }
                        ]
                      }
                    ]}
                  >
                    <View style={[
                      styles.particleInner,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
                      }
                    ]}>
                      <Text style={styles.particleIcon}>{icon}</Text>
                    </View>
                  </Animated.View>
                );
              })}

              {/* Premium Glow Effects with Theme Colors */}
              <Animated.View style={[
                styles.glowEffect,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                  backgroundColor: isDark ? colors.primary : 'rgba(255,255,255,0.15)',
                }
              ]} />

              <Animated.View style={[
                styles.haloRing,
                {
                  borderColor: isDark ? colors.primary : 'rgba(255,255,255,0.2)',
                  transform: [{ scale: glowScale }],
                }
              ]} />

              <Animated.View style={[
                styles.haloRingInner,
                {
                  borderColor: isDark ? colors.primary : 'rgba(255,255,255,0.1)',
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                }
              ]} />

              {/* Hero Section with Logo */}
              <Animated.View style={[
                styles.heroSection,
                getParallaxStyle(index)
              ]}>
                <Animated.View style={[
                  styles.logoContainer,
                  {
                    transform: [
                      { scale: logoScale },
                      { rotate: rotateInterpolate }
                    ],
                    borderColor: isDark ? colors.primary : 'rgba(255,255,255,0.3)',
                  }
                ]}>
                  <Image
                    source={isDark ? logoDark : logoLight}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </Animated.View>

                <Animated.View style={[
                  styles.taglineContainer,
                  getTextParallax(index)
                ]}>
                  <Text style={[styles.tagline, { color: isDark ? colors.text : 'rgba(255,255,255,0.8)' }]}>
                    {item.tagline}
                  </Text>
                </Animated.View>
              </Animated.View>

              {/* Premium Image with Creative Overlay */}
              <Animated.View style={[
                styles.imageWrapper,
                getParallaxStyle(index)
              ]}>
                <View style={[
                  styles.imageContainer,
                  {
                    backgroundColor: isDark ? colors.surface : '#FFFFFF',
                    borderColor: isDark ? colors.border : 'rgba(255,255,255,0.2)',
                    shadowColor: isDark ? colors.shadow : '#000',
                  }
                ]}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  
                  {/* Gradient Overlay for better text readability */}
                  <LinearGradient
                    colors={[
                      'rgba(0,0,0,0)',
                      'rgba(0,0,0,0.1)',
                      'rgba(0,0,0,0.4)',
                    ]}
                    style={styles.imageGradientOverlay}
                  />
                  
                  {/* Accent Line with Theme Color */}
                  <View style={[styles.accentLine, { backgroundColor: isDark ? colors.primary : 'rgba(255,255,255,0.4)' }]} />
                  
                  {/* Floating Icon Badge */}
                  <View style={styles.badgeContainer}>
                    <LinearGradient
                      colors={isDark ? 
                        [colors.primary + '40', colors.primary + '10'] :
                        ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']
                      }
                      style={styles.badge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.badgeIcon}>✦</Text>
                      <Text style={[styles.badgeText, { color: isDark ? colors.text : '#FFFFFF' }]}>
                        {isRTL ? 'مميز' : 'PREMIUM'}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              {/* Creative Text Content */}
              <Animated.View style={[
                styles.textContainer,
                getTextParallax(index)
              ]}>
                <Text style={[styles.subtitle, { color: isDark ? colors.textMuted : 'rgba(255,255,255,0.6)' }]}>
                  {item.subtitle}
                </Text>
                <Text style={[styles.title, { color: isDark ? colors.text : '#FFFFFF' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.description, { color: isDark ? colors.textMuted : 'rgba(255,255,255,0.8)' }]}>
                  {item.description}
                </Text>
              </Animated.View>

              {/* Premium Pagination */}
              <View style={styles.paginationContainer}>
                {ONBOARDING_DATA.map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.paginationDot,
                      {
                        backgroundColor:
                          i === currentIndex
                            ? isDark ? colors.primary : '#FFFFFF'
                            : isDark ? colors.border : 'rgba(255,255,255,0.3)',
                        width: i === currentIndex ? 48 : 8,
                        height: i === currentIndex ? 3 : 8,
                        borderRadius: i === currentIndex ? 1.5 : 4,
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Premium Buttons */}
              <View style={styles.buttonsContainer}>
                {!isLast && (
                  <TouchableOpacity
                    style={[styles.skipButton, { 
                      backgroundColor: isDark ? colors.surface + '20' : 'rgba(255,255,255,0.1)'
                    }]}
                    onPress={handleSkip}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.skipText, { color: isDark ? colors.textMuted : 'rgba(255,255,255,0.6)' }]}>
                      {isRTL ? 'تخطي' : 'Skip'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.nextButton, { flex: isLast ? 1 : 0.6 }]}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isDark ? 
                      [colors.primary, colors.primaryDark] :
                      ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.nextButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.nextButtonText, { color: isDark ? colors.text : '#FFFFFF' }]}>
                      {isLast
                        ? isRTL
                          ? 'ابدأ الرحلة'
                          : 'Begin Journey'
                        : isRTL
                        ? 'التالي'
                        : 'Next'}
                    </Text>
                    {!isLast && (
                      <View style={[styles.arrowContainer, { 
                        backgroundColor: isDark ? colors.surface + '30' : 'rgba(255,255,255,0.2)'
                      }]}>
                        <Text style={[styles.arrowText, { color: isDark ? colors.text : '#FFFFFF' }]}>→</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : colors.background }]}>
      <AnimatedFlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        bounces={false}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  
  // Creative Particles
  particle: {
    position: 'absolute',
    zIndex: 15,
  },
  particleInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  particleIcon: {
    fontSize: 24,
    opacity: 0.9,
  },
  
  // Glow Effects
  glowEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '-15%',
    alignSelf: 'center',
    opacity: 0.3,
  },
  haloRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    top: '-10%',
    alignSelf: 'center',
    opacity: 0.4,
  },
  haloRingInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    top: '-5%',
    alignSelf: 'center',
    opacity: 0.2,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  
  taglineContainer: {
    marginTop: 12,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  
  // Image Section - Improved
  imageWrapper: {
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.32,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  
  // Accent Line
  accentLine: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 40,
    height: 2.5,
    borderRadius: 1.5,
  },
  
  // Badge
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  badgeIcon: {
    fontSize: 10,
    color: '#FFFFFF',
    marginRight: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  
  // Text Content
  textContainer: {
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    opacity: 0.9,
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 6,
  },
  paginationDot: {
    marginHorizontal: 2,
  },
  
  // Buttons
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  nextButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    marginLeft: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 13,
    fontWeight: '700',
  },
});