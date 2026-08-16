// src/features/customer/services/ServiceCategoryScreen.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../../../store/AppContext';

// بيانات الخدمات التجريبية الفخمة المنظمة حسب التبويب المختار للغات الأربع
const sampleServicesData = {
  food: [
    { id: 'f1', nameAr: 'بوفيه عشاء ملكي فاخر', nameEn: 'Royal Luxury Dinner Buffet', price: 50, icon: '🍽️' },
    { id: 'f2', nameAr: 'مقبلات مشكلة VIP', nameEn: 'VIP Mixed Appetizers Platters', price: 20, icon: '🧆' }
  ],
  drinks: [
    { id: 'd1', nameAr: 'كوكتيلات فواكه استوائية طبيعية', nameEn: 'Natural Tropical Fruit Cocktails', price: 8, icon: '🍹' },
    { id: 'd2', nameAr: 'بار مشروبات ساخنة مفتوح', nameEn: 'Open Premium Hot Drinks Bar', price: 12, icon: '☕' }
  ],
  flowers: [
    { id: 'fl1', nameAr: 'تنسيق كوشة ملوكية زهور طبيعية', nameEn: 'Royal Natural Flowers Stage Design', price: 1500, icon: '🌹' },
    { id: 'fl2', nameAr: 'باقات طاولة الضيوف الفاخرة', nameEn: 'Luxury Guests Table Bouquets', price: 40, icon: '💐' }
  ],
  cars: [
    { id: 'c1', nameAr: 'سيارة ليموزين رئوية ممددة مع سائق', nameEn: 'Presidential Stretch Limousine Fleet', price: 600, icon: '🚘' },
    { id: 'c2', nameAr: 'سيارات مرسيدس S-Class زفة VIP', nameEn: 'Mercedes S-Class VIP Convoy', price: 300, icon: '🏎️' }
  ],
  sweets: [
    { id: 's1', nameAr: 'كيك زفاف فخم ٥ طبقات ملوكي', nameEn: 'Royal 5-Tier Luxury Wedding Cake', price: 800, icon: '🎂' },
    { id: 's2', nameAr: 'صواني حلويات شرقية فاخرة بالسمن البلدي', nameEn: 'Premium Oriental Sweets Trays', price: 60, icon: '🥮' }
  ],
  fruits: [
    { id: 'fr1', nameAr: 'نافورة شوكولاتة مع الفواكه الموسمية', nameEn: 'Premium Chocolate Fountain & Fruits', price: 250, icon: '🍓' },
    { id: 'fr2', nameAr: 'أطباق فواكه ملكية منسقة للضيافة', nameEn: 'Arranged Royal Fruit Platters', price: 35, icon: '🍉' }
  ]
};

export default function ServiceCategoryScreen({ category, currentCart, onQuantityChange }) {
  const { theme, locale } = useApp();
  const isRTL = locale === 'ar';

  const services = sampleServicesData[category] || [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      {services.map(item => {
        const itemQuantity = currentCart[item.id]?.quantity || 0;
        const displayName = isRTL ? item.nameAr : item.nameEn;

        return (
          <View key={item.id} style={[styles.premiumCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 15 }}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{displayName}</Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>${item.price} / {isRTL ? 'وحدة' : 'Unit'}</Text>
              </View>
            </View>

            {/* صف التحكم الفخم بالعداد الرقمي الآمن (بدون ظهور كيبورد يزعج المستخدم) */}
            <View style={[styles.counterActionRow, { borderTopColor: theme.border + '50' }]}>
              <Text style={{ fontSize: 13, color: theme.textMuted }}>
                {isRTL ? 'إجمالي الصنف:' : 'Subtotal:'} <Text style={{ color: theme.text, fontWeight: 'bold' }}>${itemQuantity * item.price}</Text>
              </Text>
              
              <View style={styles.counterControlBox}>
                <TouchableOpacity 
                  style={[styles.counterBtn, { backgroundColor: theme.border }]} 
                  onPress={() => onQuantityChange(item.id, item, Math.max(0, itemQuantity - 1))}
                >
                  <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>-</Text>
                </TouchableOpacity>

                <View style={styles.quantityDisplayContainer}>
                  <Text style={[styles.quantityNumber, { color: theme.text }]}>{itemQuantity}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.counterBtn, { backgroundColor: theme.primary }]} 
                  onPress={() => onQuantityChange(item.id, item, itemQuantity + 1)}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  premiumCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 15, elevation: 2, shadowOpacity: 0.05, shadowRadius: 3 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  itemPrice: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  
  counterActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTopWidth: 0.8, paddingTop: 12 },
  counterControlBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden' },
  counterBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  quantityDisplayContainer: { paddingHorizontal: 16, minWidth: 40, justifyContent: 'center', alignItems: 'center' },
  quantityNumber: { fontSize: 14, fontWeight: 'bold' }
});