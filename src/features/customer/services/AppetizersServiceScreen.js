// src/features/customer/services/AppetizersServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';

export default function AppetizersServiceScreen() {
  const { theme, locale, t } = useApp();
  const isRTL = locale === 'ar';

  const [quantities, setQuantities] = useState({});

  // مصفوفة المقبلات متناسقة بالكامل مع الـ Wizard والترجمات الأربعة والصور المحلية
  const appetizerItems = [
    { 
      id: 'ap1', 
      labelKey: 'appetizerBabaGhanoush', 
      price: 45, 
      img: require('../../../assets/Appetizers/BabaGhanoush.jpg') 
    },
    { 
      id: 'ap2', 
      labelKey: 'appetizerBeefCarpaccio', 
      price: 95, 
      img: require('../../../assets/Appetizers/BeefCarpaccio.jpg') 
    },
    { 
      id: 'ap3', 
      labelKey: 'appetizerCheeseSambousek', 
      price: 35, 
      img: require('../../../assets/Appetizers/CheeseSambousek.jpg') 
    },
    { 
      id: 'ap4', 
      labelKey: 'appetizerGoatCheeseTartlets', 
      price: 60, 
      img: require('../../../assets/Appetizers/GoatCheeseTartletsWithHoney.jpg') 
    },
    { 
      id: 'ap5', 
      labelKey: 'appetizerGourmetSambousek', 
      price: 50, 
      img: require('../../../assets/Appetizers/GourmetSambousek.jpg') 
    },
    { 
      id: 'ap6', 
      labelKey: 'appetizerHummusFatteh', 
      price: 40, 
      img: require('../../../assets/Appetizers/HummusFattehCups.jpg') 
    },
    { 
      id: 'ap7', 
      labelKey: 'appetizerHummusCaviar', 
      price: 110, 
      img: require('../../../assets/Appetizers/HummusWithCaviar.jpg') 
    },
    { 
      id: 'ap8', 
      labelKey: 'appetizerKibbehNayyeh', 
      price: 85, 
      img: require('../../../assets/Appetizers/KibbehNayyeh.jpg') 
    },
    { 
      id: 'ap9', 
      labelKey: 'appetizerMiniQuiche', 
      price: 55, 
      img: require('../../../assets/Appetizers/MiniQuiche.jpg') 
    },
    { 
      id: 'ap10', 
      labelKey: 'appetizerMiniDolma', 
      price: 70, 
      img: require('../../../assets/Appetizers/MiniStuffedGrapeLeaves(Dolma).jpg') 
    }
  ];

  const handleManualQty = (id, text) => {
    const val = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    setQuantities({ ...quantities, [id]: val });
  };

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {appetizerItems.map(item => (
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