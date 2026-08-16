// src/features/customer/services/HallsServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';

export default function HallsServiceScreen() {
  const { theme, locale, t } = useApp();
  const isRTL = locale === 'ar';

  const [quantities, setQuantities] = useState({});

  // مصفوفة القاعات متناسقة بالكامل مع الـ Wizard والترجمات الأربعة والصور المحلية h1 ... h9
  const hallItems = [
    { id: 'h1', labelKey: 'hallRoyalGrand', price: 2500, img: require('../../../assets/Halls/h1.jpg') },
    { id: 'h2', labelKey: 'hallCrystalBallroom', price: 1800, img: require('../../../assets/Halls/h2.jpg') },
    { id: 'h3', labelKey: 'hallGoldenOasis', price: 2200, img: require('../../../assets/Halls/h3.jpg') },
    { id: 'h4', labelKey: 'hallMajesticPalace', price: 3000, img: require('../../../assets/Halls/h4.jpg') },
    { id: 'h5', labelKey: 'hallSapphireLounge', price: 1500, img: require('../../../assets/Halls/h5.jpg') },
    { id: 'h6', labelKey: 'hallEmeraldGarden', price: 1700, img: require('../../../assets/Halls/h6.jpg') },
    { id: 'h7', labelKey: 'hallDiamondPavilion', price: 3500, img: require('../../../assets/Halls/h7.jpg') },
    { id: 'h8', labelKey: 'hallSunsetTerrace', price: 1300, img: require('../../../assets/Halls/h8.jpg') },
    { id: 'h9', labelKey: 'hallVintageClassic', price: 1600, img: require('../../../assets/Halls/h9.jpg') }
  ];

  const handleManualQty = (id, text) => {
    const val = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    setQuantities({ ...quantities, [id]: val });
  };

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {hallItems.map(item => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* عرض صور القاعات المحلية مباشرة */}
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