// CreateEventScreen.js - نسخة مبسطة مع التعديلات
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, StatusBar, 
  TouchableOpacity, ScrollView, TextInput, Alert, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../../store/AppContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function CreateEventScreen({ onEventCreated, onBack }) {
  const { theme, locale, t } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventBudget, setEventBudget] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const isRTL = locale === 'ar';
  const flexDirectionStyle = isRTL ? 'row-reverse' : 'row';
  const textAlignment = isRTL ? 'right' : 'left';

  // دالة للتحقق من صحة الوقت
  const validateTimes = () => {
    if (!startTime || !endTime) return true;
    // تحويل الوقت إلى دقائق للمقارنة
    const getMinutes = (timeStr) => {
      const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!parts) return 0;
      let hours = parseInt(parts[1]);
      const minutes = parseInt(parts[2]);
      const ampm = parts[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return getMinutes(startTime) < getMinutes(endTime);
  };

  const venuesList = [
    { id: 1, name: isRTL ? 'قاعة الماسة الملكية' : 'Royal Diamond Hall', price: 5000, location: 'Downtown', capacity: 500 },
    { id: 2, name: isRTL ? 'قصر الياقوت للأعراس' : 'Sapphire Wedding Palace', price: 7500, location: 'Garden Area', capacity: 800 },
  ];

  const servicesList = [
    { id: 'food', name: isRTL ? 'بوفيه عشاء فاخر' : 'Luxury Dinner Buffet', price: 50, unit: isRTL ? 'شخص' : 'person' },
    { id: 'flowers', name: isRTL ? 'تنسيق ورود طبيعية' : 'Royal Floral Design', price: 300, unit: isRTL ? 'باقة' : 'bouquet' },
    { id: 'cars', name: isRTL ? 'سيارة ليموزين' : 'Processional Limousine', price: 200, unit: isRTL ? 'سيارة' : 'car' },
  ];

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
      const newQuantities = { ...serviceQuantities };
      delete newQuantities[service.id];
      setServiceQuantities(newQuantities);
    } else {
      setSelectedServices([...selectedServices, service]);
      setServiceQuantities({ ...serviceQuantities, [service.id]: '1' });
    }
  };

  const updateQuantity = (serviceId, qty) => {
    setServiceQuantities({ ...serviceQuantities, [serviceId]: qty });
  };

  const calculateTotal = () => {
    let venuePrice = selectedVenue ? selectedVenue.price : 0;
    let servicesPrice = selectedServices.reduce((sum, s) => {
      let qty = parseInt(serviceQuantities[s.id] || 1, 10);
      return sum + (s.id === 'food' ? s.price * qty : s.price);
    }, 0);
    return venuePrice + servicesPrice;
  };

  const handleSubmitEvent = () => {
    if (!validateTimes()) {
      Alert.alert(
        isRTL ? 'خطأ في الوقت' : 'Time Error',
        isRTL ? 'وقت النهاية يجب أن يكون بعد وقت البداية' : 'End time must be after start time'
      );
      return;
    }
    Alert.alert(
      isRTL ? 'تأكيد الطلب' : 'Confirm Order',
      isRTL ? 'هل أنت مستعد لإرسال طلب الفعالية للموردين؟' : 'Ready to submit your event request to vendors?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: isRTL ? 'إرسال الطلب' : 'Submit Request', 
          onPress: () => {
            onEventCreated({
              eventType,
              eventDate,
              startTime,
              endTime,
              eventBudget,
              venue: selectedVenue,
              services: selectedServices,
              quantities: serviceQuantities,
              totalPrice: calculateTotal(),
              status: 'Pending Vendor Confirmation'
            });
          } 
        }
      ]
    );
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!eventType.trim() || !eventDate || !startTime || !endTime || !eventBudget.trim()) {
        Alert.alert(
          isRTL ? 'بيانات ناقصة' : 'Missing Information', 
          isRTL ? 'الرجاء تحديد نوع المناسبة، التاريخ، وقت البداية والنهاية، والميزانية' : 'Please provide event type, date, start/end times, and budget'
        );
        return false;
      }
      if (!validateTimes()) {
        Alert.alert(
          isRTL ? 'خطأ في الوقت' : 'Time Error',
          isRTL ? 'وقت النهاية يجب أن يكون بعد وقت البداية' : 'End time must be after start time'
        );
        return false;
      }
    }
    if (currentStep === 2 && !selectedVenue) {
      Alert.alert(isRTL ? 'تنبيه' : 'Alert', isRTL ? 'الرجاء اختيار قاعة المناسبة' : 'Please select a venue');
      return false;
    }
    return true;
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4, 5].map(step => (
        <View key={step} style={styles.stepDotWrapper}>
          <View style={[
            styles.stepDot, 
            { 
              backgroundColor: step <= currentStep ? theme.primary : theme.border,
              opacity: step <= currentStep ? 1 : 0.3
            }
          ]} />
          {step < 5 && <View style={[styles.stepLine, { backgroundColor: theme.border }]} />}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.background === '#000000' ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backButtonText, { color: theme.primary }]}>← {isRTL ? 'رجوع' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isRTL ? 'إنشاء فعالية' : 'Create Event'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <StepIndicator />

      <ScrollView 
        contentContainerStyle={styles.scrollBody} 
        showsVerticalScrollIndicator={false}>
        
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment }]}>
              {isRTL ? 'ما هي مناسبتك؟' : 'What is your event?'}
            </Text>
            <TextInput 
              style={[styles.input, { 
                backgroundColor: theme.surface, 
                color: theme.text, 
                borderColor: theme.border,
                textAlign: textAlignment
              }]}
              placeholder={isRTL ? 'مثال: حفل زفاف، مؤتمر' : "e.g., Wedding, Conference"}
              placeholderTextColor={theme.textMuted}
              value={eventType}
              onChangeText={setEventType}
            />

            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment, marginTop: 20 }]}>
              {isRTL ? 'تاريخ الفعالية' : 'Event Date'}
            </Text>
            <TouchableOpacity 
              style={[styles.dateButton, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}
              onPress={() => setDatePickerVisibility(true)}>
              <Text style={{ color: eventDate ? theme.text : theme.textMuted, textAlign: textAlignment }}>
                {eventDate || (isRTL ? 'اختر التاريخ' : 'Select date')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment, marginTop: 20 }]}>
              {isRTL ? 'وقت البداية' : 'Start Time'}
            </Text>
            <TouchableOpacity 
              style={[styles.dateButton, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}
              onPress={() => setStartTimePickerVisibility(true)}>
              <Text style={{ color: startTime ? theme.text : theme.textMuted, textAlign: textAlignment }}>
                {startTime || (isRTL ? 'اختر وقت البداية' : 'Select start time')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment, marginTop: 20 }]}>
              {isRTL ? 'وقت النهاية' : 'End Time'}
            </Text>
            <TouchableOpacity 
              style={[styles.dateButton, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}
              onPress={() => setEndTimePickerVisibility(true)}>
              <Text style={{ color: endTime ? theme.text : theme.textMuted, textAlign: textAlignment }}>
                {endTime || (isRTL ? 'اختر وقت النهاية' : 'Select end time')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment, marginTop: 20 }]}>
              {isRTL ? 'الميزانية المتوقعة' : 'Estimated Budget'} ($)
            </Text>
            <TextInput 
              style={[styles.input, { 
                backgroundColor: theme.surface, 
                color: theme.text, 
                borderColor: theme.border,
                textAlign: textAlignment
              }]}
              placeholder={isRTL ? 'أدخل الميزانية' : 'Enter budget'}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={eventBudget}
              onChangeText={setEventBudget}
            />

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={(date) => {
                setDatePickerVisibility(false);
                setEventDate(date.toLocaleDateString());
              }}
              onCancel={() => setDatePickerVisibility(false)}
            />
            <DateTimePickerModal
              isVisible={isStartTimePickerVisible}
              mode="time"
              onConfirm={(time) => {
                setStartTimePickerVisibility(false);
                setStartTime(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              }}
              onCancel={() => setStartTimePickerVisibility(false)}
            />
            <DateTimePickerModal
              isVisible={isEndTimePickerVisible}
              mode="time"
              onConfirm={(time) => {
                setEndTimePickerVisibility(false);
                setEndTime(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              }}
              onCancel={() => setEndTimePickerVisibility(false)}
            />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment }]}>
              {isRTL ? 'اختر القاعة المناسبة' : 'Select Venue'}
            </Text>
            {venuesList.map(venue => (
              <TouchableOpacity 
                key={venue.id} 
                style={[
                  styles.selectableCard, 
                  { 
                    backgroundColor: theme.surface, 
                    borderColor: selectedVenue?.id === venue.id ? theme.primary : theme.border,
                    shadowColor: selectedVenue?.id === venue.id ? theme.primary : '#000'
                  }
                ]}
                onPress={() => setSelectedVenue(venue)}>
                <Text style={styles.cardEmoji}>🏰</Text>
                <View style={[styles.cardContent, { alignItems: textAlignment === 'right' ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.cardName, { color: theme.text }]}>{venue.name}</Text>
                  <Text style={[styles.cardSubtext, { color: theme.textMuted }]}>📍 {venue.location} • 👥 {venue.capacity}</Text>
                  <Text style={[styles.cardPrice, { color: theme.primary }]}>${venue.price}</Text>
                </View>
                {selectedVenue?.id === venue.id && (
                  <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment }]}>
              {isRTL ? 'الخدمات الإضافية' : 'Additional Services'}
            </Text>
            {servicesList.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <TouchableOpacity 
                  key={service.id} 
                  style={[
                    styles.selectableCard, 
                    { 
                      backgroundColor: theme.surface, 
                      borderColor: isSelected ? theme.primary : theme.border 
                    }
                  ]}
                  onPress={() => toggleService(service)}>
                  <Text style={styles.cardEmoji}>✨</Text>
                  <View style={[styles.cardContent, { alignItems: textAlignment === 'right' ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.cardName, { color: theme.text }]}>{service.name}</Text>
                    <Text style={[styles.cardSubtext, { color: theme.textMuted }]}>
                      ${service.price} / {service.unit}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox, 
                    { 
                      borderColor: theme.primary,
                      backgroundColor: isSelected ? theme.primary : 'transparent'
                    }
                  ]}>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment }]}>
              {isRTL ? 'تحديد الكميات' : 'Set Quantities'}
            </Text>
            {selectedServices.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.emptyStateEmoji}>📦</Text>
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                  {isRTL ? 'لم تختر أي خدمات بعد' : 'No services selected yet'}
                </Text>
              </View>
            ) : (
              selectedServices.map(service => (
                <View key={service.id} style={[styles.quantityCard, { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border 
                }]}>
                  <View style={[styles.quantityHeader, { flexDirection: flexDirectionStyle }]}>
                    <Text style={[styles.quantityName, { color: theme.text }]}>{service.name}</Text>
                    <TextInput 
                      style={[styles.quantityInput, { 
                        backgroundColor: theme.background, 
                        color: theme.text, 
                        borderColor: theme.border 
                      }]}
                      keyboardType="numeric"
                      value={serviceQuantities[service.id] || '1'}
                      onChangeText={(val) => updateQuantity(service.id, val)}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text, textAlign: textAlignment }]}>
              {isRTL ? 'مراجعة الطلب' : 'Review Order'}
            </Text>
            
            <View style={[styles.summaryCard, { 
              backgroundColor: theme.surface, 
              borderColor: theme.border 
            }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isRTL ? 'المناسبة:' : 'Event:'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textMuted }]}>{eventType || '---'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isRTL ? 'التاريخ:' : 'Date:'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textMuted }]}>{eventDate || '---'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isRTL ? 'وقت البداية:' : 'Start Time:'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textMuted }]}>{startTime || '---'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isRTL ? 'وقت النهاية:' : 'End Time:'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textMuted }]}>{endTime || '---'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isRTL ? 'الميزانية:' : 'Budget:'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textMuted }]}>${eventBudget || '---'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>
                  {isRTL ? 'القاعة:' : 'Venue:'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textMuted }]}>{selectedVenue?.name || '---'}</Text>
              </View>

              {selectedServices.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.summaryLabel, { color: theme.text, marginBottom: 8 }]}>
                    {isRTL ? 'الخدمات:' : 'Services:'}
                  </Text>
                  {selectedServices.map(s => (
                    <Text key={s.id} style={[styles.serviceItem, { color: theme.textMuted }]}>
                      • {s.name} (x{serviceQuantities[s.id] || 1})
                    </Text>
                  ))}
                </>
              )}

              <View style={styles.divider} />
              <View style={[styles.totalRow, { flexDirection: flexDirectionStyle }]}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>
                  {isRTL ? 'الإجمالي:' : 'Total:'}
                </Text>
                <Text style={[styles.totalAmount, { color: theme.primary }]}>${calculateTotal()}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.navButtons, { flexDirection: flexDirectionStyle }]}>
          {currentStep > 1 ? (
            <TouchableOpacity 
              style={[styles.navButton, { 
                backgroundColor: theme.surface, 
                borderWidth: 1, 
                borderColor: theme.border 
              }]} 
              onPress={() => setCurrentStep(currentStep - 1)}>
              <Text style={[styles.navButtonText, { color: theme.text }]}>
                {isRTL ? 'السابق' : 'Back'}
              </Text>
            </TouchableOpacity>
          ) : <View style={styles.navButtonPlaceholder} />}

          {currentStep < 5 ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.nextButton, { backgroundColor: theme.primary }]} 
              onPress={() => {
                if (validateStep()) setCurrentStep(currentStep + 1);
              }}>
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                {isRTL ? 'التالي' : 'Next'} →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton]} 
              onPress={handleSubmitEvent}>
              <Text style={[styles.navButtonText, styles.submitButtonText]}>
                {isRTL ? 'تأكيد الطلب' : 'Submit Order'} ✓
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginLeft: -8 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerRight: { width: 60 },
  stepIndicatorContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  stepDotWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 8 },
  scrollBody: { padding: 20, flexGrow: 1 },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { 
    width: '100%', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    fontSize: 15,
    marginBottom: 8,
  },
  dateButton: { 
    width: '100%', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginBottom: 8,
  },
  selectableCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 14, 
    borderWidth: 1.5, 
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardEmoji: { fontSize: 28, marginRight: 12 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardPrice: { fontSize: 14, fontWeight: '600' },
  cardSubtext: { fontSize: 12 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyState: { padding: 32, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  emptyStateEmoji: { fontSize: 40, marginBottom: 12, opacity: 0.5 },
  emptyStateText: { fontSize: 14 },
  quantityCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  quantityHeader: { justifyContent: 'space-between', alignItems: 'center' },
  quantityName: { fontSize: 14, fontWeight: '600' },
  quantityInput: { width: 60, height: 40, borderRadius: 8, borderWidth: 1, textAlign: 'center', fontSize: 15 },
  summaryCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, fontWeight: '600' },
  summaryValue: { fontSize: 14 },
  serviceItem: { fontSize: 13, marginLeft: 12, marginBottom: 6 },
  divider: { height: 1, marginVertical: 16, backgroundColor: '#E0E0E0' },
  totalRow: { justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalAmount: { fontSize: 20, fontWeight: '800' },
  navButtons: { justifyContent: 'space-between', marginTop: 30, marginBottom: 20, gap: 12 },
  navButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  navButtonPlaceholder: { flex: 1 },
  navButtonText: { fontSize: 15, fontWeight: '600' },
  nextButton: { elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  nextButtonText: { color: '#FFF' },
  submitButton: { backgroundColor: '#27AE60', elevation: 3 },
  submitButtonText: { color: '#FFF' },
});