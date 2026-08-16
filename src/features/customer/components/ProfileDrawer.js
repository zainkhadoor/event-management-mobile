// src/features/customer/components/ProfileDrawer.js
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../store/AppContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export default function ProfileDrawer({ visible, onClose, onLogout, userData }) {
  const { theme, locale, t } = useApp();
  const isRTL = locale === 'ar';
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { 
        toValue: visible ? 1 : 0, 
        useNativeDriver: true, 
        tension: 65, 
        friction: 11 
      }),
      Animated.timing(fadeAnim, { 
        toValue: visible ? 1 : 0, 
        duration: 200, 
        useNativeDriver: true 
      }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isRTL ? DRAWER_WIDTH : -DRAWER_WIDTH, 0],
  });

  const menuItems = [
    { id: 'support', icon: 'headset-outline', label: t('helpCenter') || 'Help Center', gradient: [theme.info || '#3b82f6', theme.primary] },
    { id: 'history', icon: 'time-outline', label: t('paymentHistory') || 'Payment History', gradient: ['#8b5cf6', '#7c3aed'] },
    { id: 'settings', icon: 'settings-outline', label: t('settings') || 'Settings', gradient: [theme.success || '#10b981', theme.success || '#059669'] },
    { id: 'terms', icon: 'document-text-outline', label: t('termsConditions') || 'Terms & Conditions', gradient: ['#f59e0b', '#d97706'] },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      
      <Animated.View style={[styles.drawer, { backgroundColor: theme.surface, transform: [{ translateX }], [isRTL ? 'right' : 'left']: 0 }]}>
        <LinearGradient colors={[theme.primary, theme.primaryDark || theme.primary]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>EVENTAK</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.userPreview}>
            <LinearGradient colors={[theme.secondary || theme.primary, theme.primary]} style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.userName}>{userData?.name || 'Welcome back!'}</Text>
              <Text style={styles.userEmail}>{userData?.email || 'user@eventak.com'}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { backgroundColor: theme.background }]} 
              activeOpacity={0.7} 
              onPress={() => {
                onClose();
                // يمكن إضافة تنقل هنا
              }}
            >
              <LinearGradient colors={item.gradient} style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </LinearGradient>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { borderTopColor: theme.border, backgroundColor: theme.surface }]} 
          onPress={() => { 
            onClose(); 
            onLogout(); 
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.error || '#ef4444'} />
          <Text style={[styles.logoutText, { color: theme.error || '#ef4444' }]}>{t('logout') || 'Logout'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)' 
  },
  drawer: { 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    width: DRAWER_WIDTH, 
    overflow: 'hidden',
    ...Platform.select({ 
      ios: { 
        shadowOffset: { width: -4, height: 0 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 20 
      }, 
      android: { elevation: 20 } 
    }) 
  },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 48, 
    paddingBottom: 24, 
    paddingHorizontal: 20 
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  logo: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#fff', 
    letterSpacing: 1 
  },
  closeBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  userPreview: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  avatarPlaceholder: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: 'rgba(255,255,255,0.9)' 
  },
  userEmail: { 
    fontSize: 11, 
    color: 'rgba(255,255,255,0.7)', 
    marginTop: 2 
  },
  menuContainer: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 20, 
    gap: 8 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderRadius: 14, 
    gap: 14 
  },
  menuIconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuLabel: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '500' 
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    borderTopWidth: 1, 
    marginHorizontal: 16, 
    marginBottom: Platform.OS === 'ios' ? 34 : 20, 
    borderRadius: 14 
  },
  logoutText: { 
    fontSize: 15, 
    fontWeight: '600' 
  },
});