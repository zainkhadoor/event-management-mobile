// src/features/customer/components/ProfileContent.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProfileDrawer from './ProfileDrawer';
import authService from '../../../services/authService';

const { width, height } = Dimensions.get('window');

export default function ProfileContent({ theme, t, locale, userData: initialUserData, onLogout }) {
  const isRTL = locale === 'ar';
  const isDark = theme.mode === 'dark';

  // استخدام بيانات المستخدم من الـ API
  const [profileData, setProfileData] = useState({
    name: initialUserData?.name || 'Guest',
    email: initialUserData?.email || '',
    avatar: initialUserData?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    balance: 5420.00,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [topUpVisible, setTopUpVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // تحديث البيانات إذا تغيرت userData
  useEffect(() => {
    if (initialUserData) {
      setProfileData(prev => ({
        ...prev,
        name: initialUserData.name || prev.name,
        email: initialUserData.email || prev.email,
      }));
    }
  }, [initialUserData]);

  const showNotification = (message, type = 'success') => {
    setNotification({ visible: true, message, type });
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, friction: 8 }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]),
    ]).start(() => setNotification({ visible: false, message: '', type: 'success' }));
  };

  const handleStartEdit = () => {
    setEditForm({ name: profileData.name, email: profileData.email });
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showNotification(t('invalidAmount') || 'Please fill all fields', 'error');
      return;
    }
    
    setProfileData(prev => ({ ...prev, name: editForm.name, email: editForm.email }));
    setIsEditing(false);
    showNotification(t('profileUpdated') || 'Profile updated successfully!', 'success');
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showNotification('Permission required', 'error');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileData(prev => ({ ...prev, avatar: result.assets[0].uri }));
      showNotification('Avatar updated successfully!', 'success');
    }
  };

  const handleRevealBalance = () => {
    setPasswordInput('');
    setPasswordModalVisible(true);
  };

  const verifyPassword = () => {
    if (passwordInput === '1234') {
      setShowBalance(true);
      setBalanceRevealed(true);
      setPasswordModalVisible(false);
      setPasswordInput('');
      showNotification('Balance revealed', 'success');
    } else {
      showNotification('Incorrect password', 'error');
      setPasswordInput('');
    }
  };

  const handleSendTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amount) || amount <= 0) {
      showNotification(t('invalidAmount') || 'Please enter valid amount', 'error');
      return;
    }
    setTopUpVisible(false);
    setTopUpAmount('');
    showNotification(`$${amount} top-up request sent!`, 'success');
  };

  const handleBalancePress = () => {
    if (balanceRevealed) {
      setShowBalance(false);
      setBalanceRevealed(false);
      showNotification('Balance hidden', 'info');
    } else {
      handleRevealBalance();
    }
  };

  const cardGradient = isDark 
    ? [theme.primary, theme.primaryDark || theme.primary] 
    : [theme.border || theme.primary, theme.primaryDark || theme.primary];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Notification Toast */}
      {notification.visible && (
        <Animated.View 
          style={[
            styles.notificationToast,
            { 
              backgroundColor: notification.type === 'success' ? theme.success : notification.type === 'error' ? theme.error : theme.info,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Ionicons 
            name={notification.type === 'success' ? 'checkmark-circle' : notification.type === 'error' ? 'close-circle' : 'information-circle'} 
            size={22} 
            color="#fff" 
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Card */}
        <TouchableOpacity activeOpacity={0.95} onPress={handleBalancePress}>
          <LinearGradient colors={cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.brandText}>EVENTAK</Text>
                <Text style={styles.brandBadge}>PREMIUM</Text>
              </View>
              <View style={styles.chipContainer}>
                <Ionicons name="flash" size={16} color="#fff" />
              </View>
            </View>
            
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>{t('availableBalance') || 'Available Balance'}</Text>
              {showBalance ? (
                <View style={styles.balanceValueContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Text style={styles.balanceValue}>{profileData.balance.toFixed(2)}</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={handleBalancePress} style={styles.hiddenBalanceBtn}>
                  <View style={styles.hiddenBalanceDots}>
                    {[...Array(6)].map((_, i) => <View key={i} style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />)}
                  </View>
                  <Text style={styles.tapToReveal}>Tap to reveal</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.cardNumberContainer}>
                <Ionicons name="card-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.cardNumber}>•••• 4321</Text>
              </View>
              <TouchableOpacity onPress={() => setTopUpVisible(true)} style={styles.topUpBtn}>
                <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.topUpGradient}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.topUpText}>{t('topUp') || 'Top Up'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={styles.avatarContainer}>
            <LinearGradient colors={[theme.primary, theme.primaryDark || theme.primary]} style={styles.avatarRing} />
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
            </View>
            <View style={[styles.editIconBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={18} color={theme.textMuted} />
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  value={editForm.name} 
                  onChangeText={(txt) => setEditForm(p => ({ ...p, name: txt }))} 
                  placeholder={t('name')}
                  placeholderTextColor={theme.textMuted}
                />
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="mail-outline" size={18} color={theme.textMuted} />
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  value={editForm.email} 
                  onChangeText={(txt) => setEditForm(p => ({ ...p, email: txt }))} 
                  placeholder={t('email')}
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address" 
                />
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setIsEditing(false)}>
                  <Text style={{ color: theme.textMuted }}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveChanges}>
                  <Text style={styles.saveBtnText}>{t('saveChanges')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.text }]}>{profileData.name}</Text>
              <Text style={[styles.email, { color: theme.textMuted }]}>{profileData.email}</Text>
              
              <TouchableOpacity onPress={handleStartEdit} style={[styles.editProfileBtn, { borderColor: theme.primary }]}>
                <Ionicons name="create-outline" size={16} color={theme.primary} />
                <Text style={[styles.editProfileText, { color: theme.primary }]}>{t('editProfile')}</Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              
              <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.moreOptionsBtn}>
                <View style={styles.moreOptionsLeft}>
                  <LinearGradient colors={[theme.secondary || theme.primary, theme.primary]} style={styles.menuIcon}>
                    <Ionicons name="apps-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.moreOptionsText, { color: theme.text }]}>{t('moreOptions') || 'More Options'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button - مع مساحة أكبر في الأسفل */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity onPress={onLogout} style={[styles.logoutBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="log-out-outline" size={20} color={'orange'} />
            <Text style={[styles.logoutBtnText, { color: 'yellow' }]}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* مساحة إضافية في الأسفل لتجنب تغطية الـ Navigation Bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.passwordModal, { backgroundColor: theme.surface }]}>
            <LinearGradient colors={[theme.primary, theme.primaryDark || theme.primary]} style={styles.lockGradient}>
              <Ionicons name="lock-closed" size={28} color="#fff" />
            </LinearGradient>
            <Text style={[styles.passwordTitle, { color: theme.text }]}>Enter Password</Text>
            <Text style={[styles.passwordSubtitle, { color: theme.textMuted }]}>Please enter your password to view balance</Text>
            <View style={[styles.passwordInputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="key-outline" size={18} color={theme.textMuted} />
              <TextInput 
                style={[styles.passwordInput, { color: theme.text }]} 
                placeholder="Password" 
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={passwordInput}
                onChangeText={setPasswordInput}
                autoFocus
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={[styles.modalCancel, { backgroundColor: theme.border }]}>
                <Text style={{ color: theme.text, width: 40 }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={verifyPassword} style={[styles.modalSubmit, { backgroundColor: theme.primary }]}>
                <Text style={styles.modalSubmitText}>Verify</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.demoHint, { color: theme.textMuted }]}>Demo password: 1234</Text>
          </View>
        </View>
      </Modal>

      {/* Top Up Modal */}
      <Modal visible={topUpVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <LinearGradient colors={[theme.success, theme.success]} style={styles.modalIconGradient}>
              <Ionicons name="wallet-outline" size={28} color="#fff" />
            </LinearGradient>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('topUpTitle') || 'Add Funds'}</Text>
            <View style={[styles.modalInputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.modalCurrency, { color: theme.text }]}>$</Text>
              <TextInput 
                style={[styles.modalInput, { color: theme.text }]} 
                placeholder="Amount" 
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setTopUpVisible(false)} style={[styles.modalCancel, { backgroundColor: theme.border }]}>
                <Text style={{ color: theme.text, width: 100 }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendTopUp} style={[styles.modalSubmit, { backgroundColor: theme.success }]}>
                <Text style={styles.modalSubmitText}>{t('send')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ProfileDrawer 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
        onLogout={onLogout}
        userData={profileData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 20, paddingBottom: 40 },
  
  notificationToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  notificationText: { color: '#FFF', fontSize: 14, fontWeight: '500', flex: 1 },
  
  card: { height: 210, marginBottom: 24, borderRadius: 28, padding: 20, justifyContent: 'space-between', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandText: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 1.5 },
  brandBadge: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '600', marginTop: 4 },
  chipContainer: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  balanceSection: { alignItems: 'flex-start' },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },
  balanceValueContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  currencySymbol: { color: '#FFF', fontSize: 22, fontWeight: '600', marginRight: 4 },
  balanceValue: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  hiddenBalanceBtn: { marginTop: 6 },
  hiddenBalanceDots: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tapToReveal: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNumberContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardNumber: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  topUpBtn: { borderRadius: 30, overflow: 'hidden' },
  topUpGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  topUpText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  
  profileSection: { borderRadius: 28, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 28, alignItems: 'center', marginBottom: 24 },
  avatarContainer: { marginBottom: 20, position: 'relative' },
  avatarRing: { position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 62 },
  avatarWrapper: { width: 104, height: 104, borderRadius: 52, overflow: 'hidden', borderWidth: 3, borderColor: '#fff' },
  avatar: { width: '100%', height: '100%' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  
  profileInfo: { alignItems: 'center', width: '100%' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 20 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, marginBottom: 24 },
  editProfileText: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, width: '100%', marginBottom: 20 },
  moreOptionsBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 8 },
  moreOptionsLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  moreOptionsText: { fontSize: 15, fontWeight: '500' },
  
  editForm: { width: '100%', gap: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 52 },
  input: { flex: 1, fontSize: 15 },
  buttonGroup: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 0.6, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '600' },
  
  logoutWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    paddingVertical: 14,
    marginTop: 8,

  },
  logoutBtnText: { fontSize: 15, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, padding: 24, borderRadius: 28, alignItems: 'center', gap: 16 },
  modalIconGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalInputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, width: '100%', height: 52 },
  modalCurrency: { fontSize: 18, fontWeight: '600', marginRight: 8 },
  modalInput: { flex: 1, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  modalCancel: { flex: 1, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalSubmit: { flex: 1, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalSubmitText: { color: '#FFF', fontWeight: '600' },
  
  passwordModal: { width: width * 0.85, padding: 24, borderRadius: 28, alignItems: 'center', gap: 12 },
  lockGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  passwordTitle: { fontSize: 20, fontWeight: '700' },
  passwordSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  passwordInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, width: '100%', height: 52, marginVertical: 8 },
  passwordInput: { flex: 1, fontSize: 15 },
  demoHint: { fontSize: 11, marginTop: 8, fontStyle: 'italic' },
});