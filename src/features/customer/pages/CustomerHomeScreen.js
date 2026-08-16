// src/features/customer/pages/CustomerHomeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../../store/AppContext';
import CreateEventWizard from './CreateEventWizard';
import ProfileContent from '../components/ProfileContent';
import authService from '../../../services/authService';
import eventService from '../../../services/eventService';
import NotificationsList from '../components/NotificationsList';



const { width } = Dimensions.get('window');

export default function CustomerHomeScreen({ onLogout }) {
  const { theme, themeMode, locale, t, toggleTheme, changeLanguage, updateUserProfile } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [wizardVisible, setWizardVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('wedding');
  const [editingEvent, setEditingEvent] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isRTL = locale === 'ar';
  const languagesList = ['ar', 'en', 'fr', 'de'];
  const languageNames = { ar: 'عربي', en: 'EN', fr: 'FR', de: 'DE' };
  const isDarkMode = themeMode === 'dark';

  // جلب بيانات المستخدم والفعاليات عند تحميل الشاشة
  useEffect(() => {
    loadUserData();
    loadMyEvents();
  }, []);

  const loadUserData = async () => {
    const user = await authService.getCurrentUser();
    if (user) {
      setUserData(user);
      updateUserProfile({
        name: user.name,
        email: user.email,
      });
    }
  };

  const loadMyEvents = async () => {
    setLoading(true);
    const result = await eventService.getMyEvents();
    setLoading(false);
    
    if (result.success && result.data.data) {
      // تحويل البيانات من الباك إلى نفس هيكل البيانات المستخدم في الواجهة
      const events = result.data.data.map(event => ({
        id: event.id.toString(),
        type: event.event_type || 'wedding',
        eventDate: event.date || '',
        startTime: event.start_time || '',
        endTime: event.end_time || '',
        eventBudget: event.total_price || '0',
        venue: event.venue ? {
          id: event.venue.id.toString(),
          labelKey: event.venue.name,
          price: parseFloat(event.venue.price) || 0,
          location: event.venue.address || '',
          capacity: event.venue.capacity || '0',
          features: [],
          img: event.venue.cover_image_url ? { uri: `http://10.176.185.22:8000${event.venue.cover_image_url}` } : null,
        } : null,
        totalPrice: parseFloat(event.total_price) || 0,
        status: event.status || 'pending',
        createdAt: event.created_at || new Date().toISOString(),
        invoiceId: event.invoice_id,
        paymentId: event.payment_id,
        guestsCount: event.guests_count || 0,
        rejectionReason: event.rejection_reason || null,
        note: event.note || '',
        eventName: event.event_name || '',
      }));
      setMyEvents(events);
    } else {
      // لا نعرض تنبيه هنا، فقط نتركها فارغة
      console.log('No events found or error:', result.message);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const tabIndex = { home: 0, events: 1, notifications: 2, profile: 3 }[activeTab];
    const toValue = tabIndex * (width / 4);
    Animated.spring(indicatorPosition, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [activeTab]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleToggleLanguage = () => {
    const currentIndex = languagesList.indexOf(locale);
    const nextIndex = (currentIndex + 1) % languagesList.length;
    changeLanguage(languagesList[nextIndex]);
  };

  const handleThemeToggle = () => {
    Animated.timing(rotateAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => {
      rotateAnim.setValue(0);
    });
    toggleTheme();
  };

  const glowIntensity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const categories = [
    { id: 'wedding', label: t('wedding'), icon: '💍', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80' },
    { id: 'birthday', label: t('birthday'), icon: '🎂', img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=500&q=80' },
    { id: 'graduation', label: t('graduation'), icon: '🎓', img: 'https://tse2.mm.bing.net/th?id=OIF.Xt6%2fupMnoR1Jbur6Cj3Rvg&pid=Api&h=220&P=0' },
    { id: 'corporate', label: t('corporate'), icon: '🤝', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80' },
    { id: 'funeral', label: t('funeral'), icon: '🖤', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80' },
    { id: 'engagement', label: t('engagement'), icon: '💑', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=500&q=80' },
  ];

  const handleLaunchWizard = (type) => {
    setSelectedType(type);
    setEditingEvent(null);
    setWizardVisible(true);
  };

  const handleEditEventLaunch = (event) => {
    setEditingEvent(event);
    setSelectedType(event.type);
    setWizardVisible(true);
  };

  const handleSaveEvent = async (eventData) => {
    // تحويل البيانات إلى الشكل المطلوب من الباك إند
    const payload = {
      event_name: eventData.eventName || eventData.type || 'حفل',
      event_type: eventData.type || 'wedding',
      venue_id: parseInt(eventData.venue?.id) || null,
      date: eventData.eventDate || '',
      start_time: eventData.startTime || '',
      end_time: eventData.endTime || '',
      guests_count: parseInt(eventData.guestsCount) || 100,
      description: eventData.description || '',
      note: eventData.note || '',
      services: eventData.services || [],
    };

    // إضافة الخدمات من الـ cart إن وجدت
    if (eventData.cart) {
      const servicesFromCart = Object.keys(eventData.cart).flatMap(category => {
        const items = eventData.cart[category] || {};
        return Object.keys(items)
          .filter(id => items[id] && items[id].quantity > 0)
          .map(id => ({
            service_id: parseInt(id) || 1,
            quantity: items[id].quantity,
            price: items[id].price,
            vendor_id: items[id].vendor_id || 1,
          }));
      });
      if (servicesFromCart.length > 0) {
        payload.services = servicesFromCart;
      }
    }

    const result = await eventService.createEvent(payload);
    
    if (result.success) {
      Alert.alert('نجاح', result.data.message || 'تم إنشاء الفعالية بنجاح');
      await loadMyEvents();
      setWizardVisible(false);
    } else {
      // عرض رسالة الخطأ المناسبة
      let errorMsg = result.message;
      if (result.conflict) {
        errorMsg = `عذراً، هذا الوقت غير متاح للحجز. متاح بعد ${result.conflict.available_after || ''}`;
      } else if (result.errors) {
        errorMsg = Object.values(result.errors).flat().join('\n');
      }
      Alert.alert('خطأ', errorMsg);
    }
  };

  const handleCancelEvent = async (eventId) => {
    Alert.alert(
      isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancellation',
      isRTL ? 'هل أنت متأكد من إلغاء هذه الفعالية؟' : 'Are you sure you want to cancel this event?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await eventService.cancelEvent(eventId);
            if (result.success) {
              Alert.alert('نجاح', result.data.message || 'تم إلغاء الفعالية بنجاح');
              await loadMyEvents();
            } else {
              Alert.alert('خطأ', result.message);
            }
          }
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  const checkCanEdit = (createdAt) => {
    if (!createdAt) return false;
    const diffInMs = new Date() - new Date(createdAt);
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': isRTL ? 'قيد الانتظار' : 'Pending',
      'vendor_pending': isRTL ? 'بانتظار المورد' : 'Vendor Pending',
      'confirmed': isRTL ? 'مؤكد' : 'Confirmed',
      'paid': isRTL ? 'مدفوع' : 'Paid',
      'completed': isRTL ? 'مكتمل' : 'Completed',
      'cancelled': isRTL ? 'ملغي' : 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Animated.ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeText, { color: theme.text }]}>
                {isRTL ? `مرحباً, ${userData?.name || 'زائر'}` : `Welcome, ${userData?.name || 'Guest'}`}
              </Text>
              <Text style={[styles.welcomeSubtext, { color: 'white' }]}>
                {isRTL ? 'ماذا تخطط اليوم؟' : 'What are you planning today?'}
              </Text>
            </View>
            
            <View style={styles.categoriesSection}>
              <View style={styles.grid}>
                {categories.map((cat) => (
                  <TouchableOpacity key={cat.id} style={[styles.catCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => handleLaunchWizard(cat.id)} activeOpacity={0.9}>
                    <Image source={{ uri: cat.img }} style={styles.catImage} />
                    <View style={styles.catOverlay}>
                      <View style={styles.catBadge}><Text style={styles.catIcon}>{cat.icon}</Text></View>
                      <Text style={styles.catText}>{cat.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.ScrollView>
        );

      case 'events':
        return (
          <Animated.View style={[styles.tabFullWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.emptyStateTitle, { color: theme.text, marginTop: 16 }]}>
                  {isRTL ? 'جاري تحميل الفعاليات...' : 'Loading events...'}
                </Text>
              </View>
            ) : myEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>📅</Text>
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  {isRTL ? 'لا توجد فعاليات' : 'No Events Yet'}
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: theme.textMuted }]}>
                  {isRTL ? 'ابدأ بإنشاء فعاليتك الأولى' : 'Get started by creating your first event'}
                </Text>
                <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.primary }]} onPress={() => setActiveTab('home')}>
                  <Text style={styles.createButtonText}>+ {isRTL ? 'إنشاء فعالية' : 'Create Event'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? 'فعالياتي' : 'My Booked Events'}
                </Text>
                {myEvents.map((item) => {
                  const editable = checkCanEdit(item.createdAt) && item.status !== 'cancelled' && item.status !== 'completed';
                  const isCancelled = item.status === 'cancelled';
                  const canCancel = !isCancelled && item.status !== 'completed' && (item.status === 'pending' || item.status === 'vendor_pending' || item.status === 'confirmed');
                  
                  return (
                    <View key={item.id} style={[styles.eventRowCard, { backgroundColor: theme.surface, borderColor: isCancelled ? '#E74C3C' : theme.border }]}>
                      <View style={[styles.eventRowHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Text style={styles.eventRowIcon}>🎉</Text>
                        <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start', marginHorizontal: 10 }}>
                          <Text style={[styles.eventRowTitle, { color: theme.text }]}>{item.eventName || item.type?.toUpperCase() || 'EVENT'}</Text>
                          <Text style={[styles.eventRowDate, { color: theme.textMuted }]}>{item.eventDate}</Text>
                          <Text style={[styles.eventRowStatus, { color: isCancelled ? '#E74C3C' : item.status === 'completed' ? '#27AE60' : '#F39C12' }]}>
                            {getStatusText(item.status)}
                          </Text>
                        </View>
                        <Text style={[styles.eventRowPrice, { color: theme.primary }]}>${item.totalPrice}</Text>
                      </View>
                      
                      <View style={[styles.eventRowFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
                          <Text style={[styles.timeLabel, { color: editable ? '#27AE60' : theme.textMuted }]}>
                            {editable ? '⏳ Editable' : isCancelled ? '❌ Cancelled' : '🔒 Not editable'}
                          </Text>
                          {canCancel && (
                            <TouchableOpacity 
                              style={[styles.cancelBtn, { backgroundColor: '#E74C3C' }]} 
                              onPress={() => handleCancelEvent(item.id)}
                            >
                              <Text style={styles.cancelBtnText}>{isRTL ? 'إلغاء' : 'Cancel'}</Text>
                            </TouchableOpacity>
                          )}
                          {editable && (
                            <TouchableOpacity style={[styles.rowEditBtn, { backgroundColor: theme.primary }]} onPress={() => handleEditEventLaunch(item)}>
                              <Text style={styles.rowEditBtnText}>✏️ Edit</Text>
                            </TouchableOpacity>
                          )}
                          {item.status === 'confirmed' && item.invoiceId && (
                            <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#27AE60' }]} onPress={() => {
                              Alert.alert(
                                isRTL ? 'دفع الفاتورة' : 'Pay Invoice',
                                isRTL ? 'سيتم توجيهك لدفع الفاتورة' : 'You will be redirected to pay the invoice',
                                [{ text: isRTL ? 'حسناً' : 'OK' }]
                              );
                            }}>
                              <Text style={styles.payBtnText}>{isRTL ? 'دفع' : 'Pay'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>
        );

      case 'notifications':
  return (
    <Animated.View style={[styles.tabFullWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <NotificationsList theme={theme} t={t} locale={locale} />
    </Animated.View>
  );

      case 'profile':
        return (
          <Animated.View style={[styles.tabFullWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <ProfileContent 
              theme={theme} 
              t={t} 
              locale={locale} 
              userData={userData}
              onLogout={handleLogout} 
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  if (wizardVisible) {
    return (
      <CreateEventWizard
        initialType={selectedType}
        editingEvent={editingEvent}
        onClose={() => setWizardVisible(false)}
        onSaveEvent={handleSaveEvent}
      />
    );
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
        
        <View style={styles.appBarWrapper}>
          <ImageBackground source={theme.logo} style={styles.appBarImageBackground} resizeMode="cover">
            <View style={styles.statusBarSpacer} />
            <View style={[styles.appBarContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Animated.View style={{ shadowOpacity: glowIntensity, shadowRadius: 8, shadowColor: '#fff' }}>
                <TouchableOpacity style={[styles.controlBtn, styles.langBtn]} onPress={handleToggleLanguage} activeOpacity={0.7}>
                  <View style={styles.langBtnInner}>
                    <Text style={styles.langGlobeIcon}>🌐</Text>
                    <Text style={styles.langBtnText}>{languageNames[locale] || locale.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
              
              <View style={styles.logoCenterSpacer} />
              
              <Animated.View style={{ transform: [{ rotate }] }}>
                <TouchableOpacity style={[styles.controlBtn, styles.themeBtn]} onPress={handleThemeToggle} activeOpacity={0.7}>
                  <View style={styles.themeBtnInner}>
                    <Text style={styles.controlBtnEmoji}>{isDarkMode ? '☀️' : '🌙'}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>{renderTabContent()}</View>

        <View style={[styles.navBar2, { 
          backgroundColor: theme.surface,
          shadowColor: theme.primary,
        }]}>
          <View style={styles.navBarInner2}>
            {[
              { id: 'home', icon: 'home' },
              { id: 'events', icon: 'calendar' },
              { id: 'notifications', icon: 'notifications' },
              { id: 'profile', icon: 'person' },
            ].map((tab) => (
              <TouchableOpacity 
                key={tab.id} 
                style={[
                  styles.circularItem2,
                  activeTab === tab.id && styles.circularItemActive2,
                  { backgroundColor: activeTab === tab.id ? theme.primary : 'transparent' }
                ]} 
                onPress={() => setActiveTab(tab.id)} 
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`} 
                  size={22} 
                  color={activeTab === tab.id ? '#fff' : theme.textMuted} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBarWrapper: { 
    borderBottomLeftRadius: 28, 
    borderBottomRightRadius: 28, 
    overflow: 'hidden', 
    elevation: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    zIndex: 10 
  },
  appBarImageBackground: { width: '100%', paddingBottom: 8, position: 'relative' },
  statusBarSpacer: { height: StatusBar.currentHeight || 30 },
  appBarContainer: { height: 95, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  logoCenterSpacer: { flex: 1 },
  controlBtn: { 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.3)', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 3 
  },
  langBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  langBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  langGlobeIcon: { fontSize: 14 },
  langBtnText: { fontWeight: '600', fontSize: 13, color: '#FFFFFF', letterSpacing: 0.5 },
  themeBtn: { width: 40, height: 40 },
  themeBtnInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  controlBtnEmoji: { fontSize: 18 },
  
  content: { flex: 1 },
  tabFullWrapper: { flex: 1 },
  scrollBody: { paddingBottom: 32 },
  
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  
  categoriesSection: { paddingHorizontal: 20, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  catCard: { 
    width: (width - 52) / 2, 
    height: 220, 
    borderRadius: 40, 
    marginBottom: 16, 
    overflow: 'hidden', 
    borderWidth: 1,
    shadowColor: '#3700ff',
    shadowOffset: { width: 5, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  catImage: { width: '100%', height: '100%' },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 14 },
  catBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catIcon: { fontSize: 16 },
  catText: { color: '#FFF', fontWeight: '600', fontSize: 16, marginBottom: 8 },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyStateEmoji: { fontSize: 48, marginBottom: 16, opacity: 0.7 },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  emptyStateSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  createButton: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 5 },
  createButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  eventRowCard: { 
    borderRadius: 18, 
    borderWidth: 1, 
    padding: 16, 
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  eventRowHeader: { alignItems: 'center', marginBottom: 12 },
  eventRowIcon: { fontSize: 28 },
  eventRowTitle: { fontSize: 16, fontWeight: '700' },
  eventRowDate: { fontSize: 12, marginTop: 2 },
  eventRowStatus: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  eventRowPrice: { fontSize: 18, fontWeight: '800' },
  eventRowFooter: { 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 0.5, 
    borderTopColor: '#E0E0E0', 
    paddingTop: 10, 
    marginTop: 4,
    flexWrap: 'wrap',
  },
  timeLabel: { fontSize: 12, fontWeight: '500' },
  rowEditBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  rowEditBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  cancelBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  payBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  payBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  
  navBar2: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  navBarInner2: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circularItem2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularItemActive2: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});