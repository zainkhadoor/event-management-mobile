// src/features/customer/pages/BarMezzeServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';

export default function BarMezzeServiceScreen() {
  const { theme, locale, t } = useApp();
  const isRTL = locale === 'ar';

  const [quantities, setQuantities] = useState({});

  // مصفوفة المقبلات الخفيفة متناسقة بالكامل مع الـ Wizard والترجمات الأربعة والصور المحلية
  const barMezzeItems = [
    { id: 'ap11', labelKey: 'appetizerCrunchyRoastedChickpeas', price: 25, img: require('../../../assets/Barmezze/CrunchyRoastedChickpeas.jpg') },
    { id: 'ap12', labelKey: 'appetizerMarinatedOlives', price: 30, img: require('../../../assets/Barmezze/MarinatedOlives.jpg') },
    { id: 'ap13', labelKey: 'appetizerAleppoPistachios', price: 65, img: require('../../../assets/Barmezze/Pistachios(AleppoPistachios).jpg') },
    { id: 'ap14', labelKey: 'appetizerRoastedCashews', price: 55, img: require('../../../assets/Barmezze/RoastedCashews.jpg') },
    { id: 'ap15', labelKey: 'appetizerRoastedMixedNuts', price: 50, img: require('../../../assets/Barmezze/RoastedMixedNuts.jpg') },
    { id: 'ap16', labelKey: 'appetizerRoastedPumpkinSeeds', price: 20, img: require('../../../assets/Barmezze/RoastedPumpkinSeeds.jpg') },
    { id: 'ap17', labelKey: 'appetizerSaltedPeanuts', price: 15, img: require('../../../assets/Barmezze/SaltedPeanuts.jpg') },
    { id: 'ap18', labelKey: 'appetizerSaltedRoastedAlmonds', price: 48, img: require('../../../assets/Barmezze/SaltedRoastedAlmonds.jpg') },
    { id: 'ap19', labelKey: 'appetizerShanklishCheese', price: 40, img: require('../../../assets/Barmezze/ShanklishCheese.jpg') }
  ];

  const handleManualQty = (id, text) => {
    const val = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    setQuantities({ ...quantities, [id]: val });
  };

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {barMezzeItems.map(item => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* عرض الصور المحلية الفاخرة مباشرة */}
          <Image source={item.img} style={styles.image} resizeMode="cover" />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {t(item.labelKey)}
            </Text>
            <Text style={[styles.price, { color: theme.primary }]}>${item.price}</Text>
            <TextInput
              style={[styles.qtyInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              value={String(quantities[item.id] || '')}
              onChangeText={(text) => handleManualQty(item.id, text)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 5 },
  card: { width: '48%', borderRadius: 12, borderWidth: 1, marginBottom: 15, overflow: 'hidden', elevation: 1 },
  image: { width: '100%', height: 110 },
  info: { padding: 10, alignItems: 'center' },
  name: { fontSize: 13, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  price: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  qtyInput: { width: '80%', height: 35, borderRadius: 8, borderWidth: 1, textAlign: 'center', fontSize: 14, padding: 0 }
});