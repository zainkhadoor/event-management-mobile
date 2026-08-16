// CreateEventWizard.js - معدل مع ربط الباك إند
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Animated,
  Dimensions,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../../store/AppContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import eventService from '../../../services/eventService';

const { width } = Dimensions.get('window');

export default function CreateEventWizard({ initialType, editingEvent, onClose, onSaveEvent }) {
  const { theme, locale, t, toggleTheme, changeLanguage } = useApp();
  const isRTL = locale === 'ar';
  
  useEffect(() => {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  
  // بيانات من API
  const [venuesFromApi, setVenuesFromApi] = useState([]);
  const [servicesFromApi, setServicesFromApi] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  
  // وقت الفعالية
  const [eventName, setEventName] = useState(editingEvent?.eventName || '');
  const [eventDate, setEventDate] = useState(editingEvent?.date || '');
  const [startTime, setStartTime] = useState(editingEvent?.start_time || '');
  const [endTime, setEndTime] = useState(editingEvent?.end_time || '');
  const [guestsCount, setGuestsCount] = useState(editingEvent?.guests_count?.toString() || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [note, setNote] = useState(editingEvent?.note || '');
  
  const [selectedVenue, setSelectedVenue] = useState(editingEvent?.venue || null);
  const [selectedServices, setSelectedServices] = useState(editingEvent?.services || []);
  const [currentServiceTab, setCurrentServiceTab] = useState('all');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // حالة الفلترة للصالات
  const [showFilters, setShowFilters] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState(0);
  const [filterMaxPrice, setFilterMaxPrice] = useState(500000);
  const [filterCapacity, setFilterCapacity] = useState('');
  
  // جلب البيانات من API
  useEffect(() => {
    fetchVenues();
    fetchServices();
    fetchServiceCategories();
  }, []);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    const result = await eventService.getVenues();
    setLoadingVenues(false);
    if (result.success) {
      setVenuesFromApi(result.data.data || []);
    } else {
      Alert.alert('خطأ', result.message);
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    const result = await eventService.getServices({ per_page: 50 });
    setLoadingServices(false);
    if (result.success) {
      setServicesFromApi(result.data.data.data || []);
    } else {
      Alert.alert('خطأ', result.message);
    }
  };

  const fetchServiceCategories = async () => {
    const result = await eventService.getServiceCategories();
    if (result.success) {
      setServiceCategories(result.data.data || []);
    }
  };

  // الحصول على قائمة الخدمات حسب الفئة المختارة
  const getFilteredServices = () => {
    if (currentServiceTab === 'all') {
      return servicesFromApi;
    }
    const categoryId = parseInt(currentServiceTab);
    return servicesFromApi.filter(s => s.category_id === categoryId);
  };

  // دالة فلترة الصالات
  const getFilteredVenues = () => {
    return venuesFromApi.filter(venue => {
      const price = parseFloat(venue.price) || 0;
      if (price < filterMinPrice || price > filterMaxPrice) return false;
      
      if (filterCapacity) {
        const capacityNum = parseInt(venue.capacity) || 0;
        const filterNum = parseInt(filterCapacity) || 0;
        if (capacityNum < filterNum) return false;
      }
      
      return true;
    });
  };

  const filteredVenues = getFilteredVenues();
  const filteredServices = getFilteredServices();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  // بناء تبويبات الخدمات من الفئات المسترجعة من API
  const serviceTabs = [
    { id: 'all', icon: '📦', label: isRTL ? 'الكل' : 'All' },
    ...serviceCategories.map(cat => ({
      id: cat.id.toString(),
      icon: '✨',
      label: cat.name,
    })),
  ];

  const isStep1Valid = () => {
    if (!eventName || !eventDate || !startTime || !endTime || !guestsCount) {
      Alert.alert(t('alertTitle'), isRTL ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return false;
    }
    if (parseInt(guestsCount) <= 0) {
      Alert.alert(t('alertTitle'), isRTL ? 'الرجاء إدخال عدد ضيوف صحيح' : 'Please enter a valid number of guests');
      return false;
    }
    return true;
  };

  const isStep2Valid = () => {
    if (!selectedVenue) {
      Alert.alert(t('alertTitle'), isRTL ? 'الرجاء اختيار قاعة للمناسبة' : 'Please select a venue');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid()) return;
    if (step === 2 && !isStep2Valid()) return;
    if (step < 4) setStep(step + 1);
  };

  const toggleServiceSelection = (service) => {
    const existingIndex = selectedServices.findIndex(s => s.service_id === service.id);
    if (existingIndex >= 0) {
      setSelectedServices(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedServices(prev => [...prev, {
        service_id: service.id,
        quantity: 1,
        price: parseFloat(service.price),
        vendor_id: service.vendor_id,
        name: service.name,
      }]);
    }
  };

  const updateServiceQuantity = (serviceId, qty) => {
    setSelectedServices(prev => prev.map(s => 
      s.service_id === serviceId ? { ...s, quantity: parseInt(qty) || 1 } : s
    ));
  };

  const calculateTotal = () => {
    let total = selectedVenue ? parseFloat(selectedVenue.price) || 0 : 0;
    selectedServices.forEach(s => {
      total += (s.price || 0) * (s.quantity || 1);
    });
    return total;
  };

  const totalPrice = calculateTotal();

  const handleFinalSubmit = async () => {
    setLoading(true);
    
    const eventData = {
      event_name: eventName,
      event_type: initialType || 'wedding',
      venue_id: selectedVenue.id,
      date: eventDate,
      start_time: startTime,
      end_time: endTime,
      guests_count: parseInt(guestsCount),
      description: description,
      note: note || undefined,
      services: selectedServices.map(s => ({
        service_id: s.service_id,
        quantity: s.quantity || 1,
        price: s.price,
        vendor_id: s.vendor_id,
      })),
    };

    const result = await eventService.createEvent(eventData);
    setLoading(false);

    if (result.success) {
      Alert.alert('نجاح', result.data.message || 'تم إنشاء الفعالية بنجاح');
      
      if (onSaveEvent) {
        onSaveEvent({
          id: result.data.data?.event_id,
          ...eventData,
          total_price: result.data.data?.total_price,
          invoice_id: result.data.data?.invoice_id,
          status: 'pending',
        });
      }
      
      onClose();
    } else {
      let errorMsg = result.message;
      if (result.conflict) {
        errorMsg = `عذراً، هذا الوقت غير متاح للحجز. متاح بعد ${result.conflict.available_after || ''}`;
      } else if (result.errors) {
        errorMsg = Object.values(result.errors).flat().join('\n');
      }
      Alert.alert('خطأ', errorMsg);
    }
  };

  const resetFilters = () => {
    setFilterMinPrice(0);
    setFilterMaxPrice(500000);
    setFilterCapacity('');
  };

  const renderStepIndicator = () => {
    const stepLabels = [
      t('step 1') || 'Details',
      t('step 2') || 'Venue',
      t('step 3') || 'Services',
      t('step 4') || 'Review'
    ];
    
    return (
      <View style={[styles.stepIndicatorContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {[1, 2, 3, 4].map((s, idx) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= s && { backgroundColor: theme.primary }]}>
                {step > s ? (
                  <Text style={styles.stepCircleCheck}>✓</Text>
                ) : (
                  <Text style={[styles.stepCircleText, step >= s && { color: theme.background === '#000000' ? '#fff' : '#fff' }]}>{s}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, step >= s && { color: theme.primary }]} numberOfLines={1}>
                {stepLabels[idx]}
              </Text>
            </View>
            {idx < 3 && <View style={[styles.stepConnector, step > s && { backgroundColor: theme.primary }]} />}
          </React.Fragment>
        ))}
      </View>
    );
  };

  // عرض الفلاتر
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <View style={[styles.filtersContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.filtersTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {isRTL ? 'فلترة الصالات' : 'Filter Venues'}
        </Text>
        
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'نطاق السعر' : 'Price Range'}: ${filterMinPrice} - ${filterMaxPrice}
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderMinMax, { color: theme.textMuted }]}>$0</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500000}
              step={10000}
              value={filterMinPrice}
              onValueChange={setFilterMinPrice}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <Text style={[styles.sliderMinMax, { color: theme.textMuted }]}>$500k</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderMinMax, { color: theme.textMuted }]}>$0</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500000}
              step={10000}
              value={filterMaxPrice}
              onValueChange={setFilterMaxPrice}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <Text style={[styles.sliderMinMax, { color: theme.textMuted }]}>$500k</Text>
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'الحد الأدنى للسعة' : 'Minimum Capacity'}
          </Text>
          <TextInput
            style={[styles.filterInput, { 
              backgroundColor: theme.background, 
              color: theme.text, 
              borderColor: theme.border,
              textAlign: isRTL ? 'right' : 'left'
            }]}
            placeholder={isRTL ? 'مثال: 300' : 'e.g., 300'}
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={filterCapacity}
            onChangeText={setFilterCapacity}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.resetFiltersBtn, { borderColor: theme.border }]}
          onPress={resetFilters}
        >
          <Text style={[styles.resetFiltersText, { color: theme.textMuted }]}>
            {isRTL ? 'إعادة تعيين الفلترة' : 'Reset Filters'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // عرض الصالات
  const renderVenues = () => {
    if (loadingVenues) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            {isRTL ? 'جاري تحميل الصالات...' : 'Loading venues...'}
          </Text>
        </View>
      );
    }

    if (filteredVenues.length === 0) {
      return (
        <View style={[styles.emptyVenues, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.emptyVenuesEmoji}>🔍</Text>
          <Text style={[styles.emptyVenuesText, { color: theme.textMuted }]}>
            {isRTL ? 'لا توجد صالات تطابق معايير الفلترة' : 'No venues match your filters'}
          </Text>
        </View>
      );
    }
    
    return filteredVenues.map(venue => (
      <TouchableOpacity
        key={venue.id}
        style={[
          styles.venueCard,
          { backgroundColor: theme.surface, borderColor: selectedVenue?.id === venue.id ? theme.primary : theme.border },
          selectedVenue?.id === venue.id && styles.venueCardSelected
        ]}
        onPress={() => setSelectedVenue(venue)}
        activeOpacity={0.9}
      >
        <View style={styles.venueImageWrapper}>
          {venue.cover_image_url ? (
            <Image source={{ uri: `http://10.176.185.22:8000${venue.cover_image_url}` }} style={styles.venueImage} />
          ) : (
            <View style={[styles.venueImagePlaceholder, { backgroundColor: theme.border }]}>
              <Text style={styles.venueImagePlaceholderText}>🏰</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.venueImageOverlay}
          />
          <View style={[styles.venuePrice, { backgroundColor: theme.primary }]}>
            <Text style={styles.venuePriceText}>${parseFloat(venue.price).toLocaleString()}</Text>
          </View>
          <View style={[styles.venueLocationBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <Text style={styles.venueLocationText}>📍 {venue.address}</Text>
          </View>
        </View>

        <View style={[styles.venueMetaContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.venueName, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{venue.name}</Text>
          <Text style={[styles.venueCapacity, { color: theme.textMuted }]}>👥 {venue.capacity} {isRTL ? 'شخص' : 'guests'}</Text>
        </View>

        {selectedVenue?.id === venue.id && (
          <View style={[styles.selectedBadge, { backgroundColor: theme.primary, left: isRTL ? 16 : undefined, right: isRTL ? undefined : 16 }]}>
            <Text style={styles.selectedBadgeText}>✓ {t('selected') || 'Selected'}</Text>
          </View>
        )}
      </TouchableOpacity>
    ));
  };

  // عرض الخدمات
  const renderServicesGrid = () => {
    if (loadingServices) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            {isRTL ? 'جاري تحميل الخدمات...' : 'Loading services...'}
          </Text>
        </View>
      );
    }

    if (filteredServices.length === 0) {
      return (
        <View style={[styles.emptyVenues, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.emptyVenuesEmoji}>📦</Text>
          <Text style={[styles.emptyVenuesText, { color: theme.textMuted }]}>
            {isRTL ? 'لا توجد خدمات في هذه الفئة' : 'No services in this category'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.servicesGrid}>
        {filteredServices.map(item => {
          const isSelected = selectedServices.some(s => s.service_id === item.id);
          const currentQty = selectedServices.find(s => s.service_id === item.id)?.quantity || 0;
          return (
            <View key={item.id} style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: isSelected ? theme.primary : theme.border }]}>
              <View style={styles.serviceImageContainer}>
                {item.images && item.images.length > 0 ? (
                  <Image source={{ uri: item.images[0] }} style={styles.serviceImage} />
                ) : (
                  <View style={[styles.serviceImagePlaceholder, { backgroundColor: theme.border }]}>
                    <Text style={styles.serviceImagePlaceholderText}>✨</Text>
                  </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.serviceImageOverlay} />
                <View style={[styles.servicePriceTag, { backgroundColor: theme.primary }]}>
                  <Text style={styles.servicePriceText}>${parseFloat(item.price).toLocaleString()}</Text>
                </View>
              </View>
              <View style={[styles.serviceInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.serviceName, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>{item.name}</Text>
                <View style={[styles.serviceActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.serviceTotal, { color: theme.primary }]}>${(currentQty * parseFloat(item.price)).toLocaleString()}</Text>
                  <View style={[styles.counterControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      style={[styles.counterBtn, styles.counterBtnMinus, { backgroundColor: theme.border }]}
                      onPress={() => {
                        if (isSelected) {
                          const newQty = Math.max(0, currentQty - 1);
                          if (newQty === 0) {
                            setSelectedServices(prev => prev.filter(s => s.service_id !== item.id));
                          } else {
                            updateServiceQuantity(item.id, newQty);
                          }
                        }
                      }}
                    >
                      <Text style={styles.counterBtnText}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.counterInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                      value={currentQty.toString()}
                      onChangeText={(text) => {
                        const qty = parseInt(text) || 0;
                        if (qty > 0) {
                          if (!isSelected) {
                            setSelectedServices(prev => [...prev, {
                              service_id: item.id,
                              quantity: qty,
                              price: parseFloat(item.price),
                              vendor_id: item.vendor_id,
                              name: item.name,
                            }]);
                          } else {
                            updateServiceQuantity(item.id, qty);
                          }
                        } else {
                          setSelectedServices(prev => prev.filter(s => s.service_id !== item.id));
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <TouchableOpacity
                      style={[styles.counterBtn, styles.counterBtnPlus, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        if (!isSelected) {
                          setSelectedServices(prev => [...prev, {
                            service_id: item.id,
                            quantity: 1,
                            price: parseFloat(item.price),
                            vendor_id: item.vendor_id,
                            name: item.name,
                          }]);
                        } else {
                          updateServiceQuantity(item.id, currentQty + 1);
                        }
                      }}
                    >
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.header, { height: headerHeight, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={[styles.headerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <LinearGradient colors={[theme.primary, theme.primaryDark || theme.primary]} style={styles.closeGradient}>
              <Text style={styles.closeIcon}>✕</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('appName') || 'EVENTAK'}</Text>
          
          <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: theme.background + '20' }]} onPress={toggleTheme}>
              <Text style={styles.headerActionEmoji}>{theme.background === '#000000' ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerActionBtn, styles.langBtn, { borderColor: theme.border }]} onPress={() => {
              const langs = ['ar', 'en', 'fr', 'de'];
              const nextIndex = (langs.indexOf(locale) + 1) % langs.length;
              changeLanguage(langs[nextIndex]);
            }}>
              <Text style={[styles.langBtnText, { color: theme.textMuted }]}>{locale.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderStepIndicator()}
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          {/* Step 1: Event Details */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{t('step 1') || 'Event Details'}</Text>
                <View style={[styles.stepHeaderLine, { backgroundColor: theme.primary }]} />
              </View>
              
              <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow }]}>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('eventName') || 'Event Name'}
                  </Text>
                  <View style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.inputIcon}>📝</Text>
                    <TextInput
                      style={[styles.inputField, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
                      placeholder={isRTL ? 'اسم الفعالية' : 'Event name'}
                      placeholderTextColor={theme.textMuted}
                      value={eventName}
                      onChangeText={setEventName}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('selectDate') || 'Event Date'}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
                    onPress={() => setDatePickerVisibility(true)}
                  >
                    <Text style={styles.inputIcon}>📅</Text>
                    <Text style={[styles.inputText, { color: eventDate ? theme.text : theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {eventDate || (t('selectDate') || 'Select date')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('startTime') || 'Start Time'}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
                    onPress={() => setStartTimePickerVisibility(true)}
                  >
                    <Text style={styles.inputIcon}>🕐</Text>
                    <Text style={[styles.inputText, { color: startTime ? theme.text : theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {startTime || (t('startTime') || 'Select start time')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('endTime') || 'End Time'}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
                    onPress={() => setEndTimePickerVisibility(true)}
                  >
                    <Text style={styles.inputIcon}>🕐</Text>
                    <Text style={[styles.inputText, { color: endTime ? theme.text : theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {endTime || (t('endTime') || 'Select end time')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('guestsCount') || 'Number of Guests'}
                  </Text>
                  <View style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.inputIcon}>👥</Text>
                    <TextInput
                      style={[styles.inputField, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
                      placeholder={isRTL ? 'عدد الضيوف' : 'Number of guests'}
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                      value={guestsCount}
                      onChangeText={setGuestsCount}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('description') || 'Description'}
                  </Text>
                  <View style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row', minHeight: 60 }]}>
                    <TextInput
                      style={[styles.inputField, { color: theme.text, textAlign: isRTL ? 'right' : 'left', minHeight: 60 }]}
                      placeholder={isRTL ? 'وصف الفعالية (اختياري)' : 'Event description (optional)'}
                      placeholderTextColor={theme.textMuted}
                      multiline
                      value={description}
                      onChangeText={setDescription}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('note') || 'Additional Note'}
                  </Text>
                  <View style={[styles.formInput, { borderColor: theme.border, backgroundColor: theme.background + '10', flexDirection: isRTL ? 'row-reverse' : 'row', minHeight: 60 }]}>
                    <TextInput
                      style={[styles.inputField, { color: theme.text, textAlign: isRTL ? 'right' : 'left', minHeight: 60 }]}
                      placeholder={isRTL ? 'ملاحظة إضافية (اختياري)' : 'Additional note (optional)'}
                      placeholderTextColor={theme.textMuted}
                      multiline
                      value={note}
                      onChangeText={setNote}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Venue Selection */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{t('step 2') || 'Choose Venue'}</Text>
                <View style={[styles.stepHeaderLine, { backgroundColor: theme.primary }]} />
              </View>
              
              <TouchableOpacity
                style={[styles.filterToggleBtn, { backgroundColor: showFilters ? theme.primary : theme.surface, borderColor: theme.border }]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Text style={styles.filterToggleIcon}>🔍</Text>
                <Text style={[styles.filterToggleText, { color: showFilters ? '#FFF' : theme.text }]}>
                  {showFilters ? (isRTL ? 'إخفاء الفلترة' : 'Hide Filters') : (isRTL ? 'عرض الفلترة' : 'Show Filters')}
                </Text>
                <Text style={[styles.filterToggleArrow, { color: showFilters ? '#FFF' : theme.textMuted }]}>
                  {showFilters ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              
              {renderFilters()}
              
              <Text style={[styles.resultsCount, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {filteredVenues.length} {isRTL ? 'صالة متاحة' : 'venues available'}
              </Text>
              
              <View style={styles.venuesContainer}>
                {renderVenues()}
              </View>
            </View>
          )}

          {/* Step 3: Services Selection */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{t('step 3') || 'Customize Services'}</Text>
                <View style={[styles.stepHeaderLine, { backgroundColor: theme.primary }]} />
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{flexDirection: isRTL ? 'row-reverse' : 'row'}}>
                {serviceTabs.map(tab => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tab, currentServiceTab === tab.id && styles.tabActive, { borderColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                    onPress={() => setCurrentServiceTab(tab.id)}
                  >
                    <Text style={styles.tabIcon}>{tab.icon}</Text>
                    <Text style={[styles.tabText, { color: theme.text }, currentServiceTab === tab.id && { color: theme.primary }]}>
                      {tab.label}
                    </Text>
                    {currentServiceTab === tab.id && <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {renderServicesGrid()}
            </View>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{t('step 4') || 'Review & Confirm'}</Text>
                <View style={[styles.stepHeaderLine, { backgroundColor: theme.primary }]} />
              </View>
              
              <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow }]}>
                <View style={styles.summaryHeader}>
                  <Text style={[styles.summaryTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('eventSummary') || 'Event Summary'}</Text>
                </View>
                <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t('eventName') || 'Event Name'}:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text, textAlign: isRTL ? 'left' : 'right' }]}>{eventName || (t('notSet') || 'Not set')}</Text>
                </View>
                <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t('eventDateTime') || 'Date'}:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text, textAlign: isRTL ? 'left' : 'right' }]}>{eventDate || (t('notSet') || 'Not set')}</Text>
                </View>
                <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t('startTime') || 'Start Time'}:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text, textAlign: isRTL ? 'left' : 'right' }]}>{startTime || (t('notSet') || 'Not set')}</Text>
                </View>
                <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t('endTime') || 'End Time'}:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text, textAlign: isRTL ? 'left' : 'right' }]}>{endTime || (t('notSet') || 'Not set')}</Text>
                </View>
                <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t('guestsCount') || 'Guests'}:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text, textAlign: isRTL ? 'left' : 'right' }]}>{guestsCount || '0'}</Text>
                </View>
                <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t('selectVenue') || 'Venue'}:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text, textAlign: isRTL ? 'left' : 'right' }]}>{selectedVenue?.name || (t('notSelected') || 'Not selected')}</Text>
                </View>
              </View>

              {selectedServices.length > 0 && (
                <>
                  <Text style={[styles.cartTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('selectedServices') || 'Selected Services'}
                  </Text>
                  <View style={[styles.cartSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {selectedServices.map((service, index) => (
                      <View key={index} style={[styles.cartItem, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomWidth: index < selectedServices.length - 1 ? 0.5 : 0, borderBottomColor: theme.border, paddingVertical: 8 }]}>
                        <View style={[styles.cartItemInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                          <Text style={[styles.cartItemName, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{service.name}</Text>
                          <Text style={[styles.cartItemMeta, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>{service.quantity || 1} × ${parseFloat(service.price).toLocaleString()}</Text>
                        </View>
                        <Text style={[styles.cartItemPrice, { color: theme.primary }]}>${((service.price || 0) * (service.quantity || 1)).toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <View style={[styles.totalCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                <View style={[styles.totalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>{t('totalPrice') || 'Total Cost'}</Text>
                  <Text style={[styles.totalAmount, { color: theme.primary }]}>${totalPrice.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <View style={[styles.bottomNavContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.priceSummary, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.priceSummaryLabel, { color: theme.textMuted }]}>{t('totalPrice') || 'Total'}</Text>
              <Text style={[styles.priceSummaryValue, { color: theme.primary }]}>${totalPrice.toLocaleString()}</Text>
            </View>
            <View style={[styles.navButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {step > 1 && (
                <TouchableOpacity style={[styles.navBtn, styles.navBtnSecondary, { borderColor: theme.border }]} onPress={() => setStep(step - 1)}>
                  <Text style={[styles.navBtnText, { color: theme.text }]}>{t('prevStep') || 'Back'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: step === 4 ? theme.primary : theme.primary }]}
                onPress={step === 4 ? handleFinalSubmit : handleNextStep}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
                    {step === 4 ? (t('submitEvent') || 'Confirm & Pay') : (t('nextStep') || 'Continue')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successModal, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
            <LinearGradient colors={[theme.success, theme.success + 'CC']} style={styles.successGradient}>
              <View style={styles.successContent}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>{t('paymentSuccess') || 'Event Created!'}</Text>
                <Text style={styles.successMessage}>{t('redirectingMessage') || 'Your event has been successfully planned.'}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDatePickerVisibility(false);
          setEventDate(date.toISOString().split('T')[0]);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
      
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          setStartTimePickerVisibility(false);
          const hours = time.getHours().toString().padStart(2, '0');
          const minutes = time.getMinutes().toString().padStart(2, '0');
          setStartTime(`${hours}:${minutes}`);
        }}
        onCancel={() => setStartTimePickerVisibility(false)}
      />
      
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          setEndTimePickerVisibility(false);
          const hours = time.getHours().toString().padStart(2, '0');
          const minutes = time.getMinutes().toString().padStart(2, '0');
          setEndTime(`${hours}:${minutes}`);
        }}
        onCancel={() => setEndTimePickerVisibility(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingTop: 12, zIndex: 10, elevation: 4, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  headerContent: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  closeButton: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', elevation: 2, shadowOpacity: 0.2, shadowRadius: 4 },
  closeGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  closeIcon: { fontSize: 18, color: '#FFF', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  headerActions: { gap: 12, flexDirection: 'row' },
  headerActionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerActionEmoji: { fontSize: 16 },
  langBtn: { backgroundColor: 'transparent', borderWidth: 1 },
  langBtnText: { fontSize: 11, fontWeight: '700' },
  stepIndicatorContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row' },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 2 },
  stepCircleText: { fontSize: 14, fontWeight: '600', color: '#666' },
  stepCircleCheck: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  stepLabel: { fontSize: 10, fontWeight: '500', maxWidth: 60, color: '#999' },
  stepConnector: { flex: 0.15, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 8 },
  scrollContent: { paddingBottom: 100, paddingTop: 8 },
  stepContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  stepHeader: { marginBottom: 24, alignItems: 'center' },
  stepTitle: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  stepHeaderLine: { width: 60, height: 3, borderRadius: 3, marginTop: 4 },
  formCard: { borderRadius: 24, borderWidth: 1, padding: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: { flexDirection: 'row', alignItems: 'center', height: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, gap: 12 },
  inputIcon: { fontSize: 18 },
  inputText: { flex: 1, fontSize: 14 },
  inputField: { flex: 1, fontSize: 14 },
  
  filterToggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 16, gap: 8 },
  filterToggleIcon: { fontSize: 18 },
  filterToggleText: { fontSize: 14, fontWeight: '600' },
  filterToggleArrow: { fontSize: 12 },
  filtersContainer: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, gap: 16 },
  filtersTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  filterGroup: { gap: 8 },
  filterLabel: { fontSize: 13, fontWeight: '500' },
  filterInput: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slider: { flex: 1, height: 40 },
  sliderMinMax: { fontSize: 11, fontWeight: '500', minWidth: 40 },
  resetFiltersBtn: { padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  resetFiltersText: { fontSize: 13, fontWeight: '500' },
  resultsCount: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  venuesContainer: { gap: 20 },
  venueCard: { borderRadius: 24, borderWidth: 1.5, padding: 12, position: 'relative', overflow: 'hidden', elevation: 2, shadowOpacity: 0.1, shadowRadius: 6 },
  venueCardSelected: { borderWidth: 2.5, elevation: 4 },
  venueImageWrapper: { width: '100%', height: 180, borderRadius: 18, overflow: 'hidden', position: 'relative', marginBottom: 12 },
  venueImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  venueImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  venueImagePlaceholderText: { fontSize: 60 },
  venueImageOverlay: { ...StyleSheet.absoluteFillObject },
  venuePrice: { position: 'absolute', bottom: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, elevation: 2 },
  venuePriceText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  venueLocationBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  venueLocationText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  venueMetaContainer: { paddingHorizontal: 4, marginBottom: 8 },
  venueName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  venueCapacity: { fontSize: 13, fontWeight: '500' },
  selectedBadge: { position: 'absolute', top: 24, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, elevation: 2 },
  selectedBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  emptyVenues: { padding: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: 12 },
  emptyVenuesEmoji: { fontSize: 48 },
  emptyVenuesText: { fontSize: 14, fontWeight: '500' },
  loadingContainer: { padding: 40, borderRadius: 20, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  
  tabsScroll: { marginBottom: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', position: 'relative', alignItems: 'center', gap: 6 },
  tabActive: { borderBottomColor: 'transparent' },
  tabIcon: { fontSize: 16 },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabIndicator: { position: 'absolute', bottom: -2, left: 0, right: 0, height: 2 },
  
  servicesGrid: { gap: 16 },
  serviceCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', elevation: 2, shadowOpacity: 0.08, shadowRadius: 4, flexDirection: 'row' },
  serviceImageContainer: { width: 130, height: 130, position: 'relative' },
  serviceImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  serviceImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  serviceImagePlaceholderText: { fontSize: 40 },
  serviceImageOverlay: { ...StyleSheet.absoluteFillObject },
  servicePriceTag: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, elevation: 2 },
  servicePriceText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  serviceInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  serviceName: { fontSize: 14, fontWeight: '600', marginBottom: 8, flex: 1 },
  serviceActions: { justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  serviceTotal: { fontSize: 14, fontWeight: '600' },
  counterControls: { alignItems: 'center', gap: 8, flexDirection: 'row' },
  counterBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  counterBtnText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  counterInput: { width: 45, height: 40, borderRadius: 8, borderWidth: 1, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  
  summaryCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryHeader: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summaryRow: { justifyContent: 'space-between', marginBottom: 10, flexDirection: 'row' },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  cartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  cartSection: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden', padding: 12 },
  cartItem: { alignItems: 'center', gap: 12, flexDirection: 'row', paddingVertical: 8 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  cartItemMeta: { fontSize: 11 },
  cartItemPrice: { fontSize: 13, fontWeight: '700' },
  totalCard: { marginTop: 20, borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  totalRow: { justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '800' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12, elevation: 8, shadowOpacity: 0.1, shadowRadius: 8 },
  bottomNavContent: { justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' },
  priceSummary: { alignItems: 'flex-start' },
  priceSummaryLabel: { fontSize: 11, marginBottom: 2 },
  priceSummaryValue: { fontSize: 20, fontWeight: '800' },
  navButtons: { gap: 12, flexDirection: 'row' },
  navBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, minWidth: 110, alignItems: 'center', elevation: 2 },
  navBtnSecondary: { borderWidth: 1, backgroundColor: 'transparent' },
  navBtnPrimary: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  navBtnText: { fontSize: 14, fontWeight: '600' },
  navBtnTextPrimary: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  successModal: { width: width * 0.85, borderRadius: 24, overflow: 'hidden', elevation: 16, shadowOpacity: 0.3, shadowRadius: 24 },
  successGradient: { padding: 32, alignItems: 'center' },
  successContent: { alignItems: 'center' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  successMessage: { fontSize: 14, color: '#FFF', textAlign: 'center', opacity: 0.9 },
});