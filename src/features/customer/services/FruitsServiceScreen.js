// src/features/customer/services/FruitsServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';
import { translations } from '../../../utils/languages'; // التأكد من مسار ملف اللغة الصحيح

export default function FruitsServiceScreen() {
  const { theme, locale } = useApp();
  const [quantities, setQuantities] = useState({});

  // جلب النصوص بناءً على اللغة الحالية للشفافية والترتيب
  const t = translations[locale] || translations['en'];

  // مصفوفة الفواكه مضافاً إليها الصور الخاصة بك ومربوطة بملف الترجمة
  const items = [
  { 
    id: 'frt1', 
    name: t.fruitSculptures, 
    price: 140, 
    img: require('../../../../assets/Fruits/Fruits/1f.png') 
  },
  { 
    id: 'frt2', 
    name: t.fruitPlatterClassic, 
    price: 180, 
    img: require('../../../../assets/Fruits/Fruits/2f.png') 
  },
  { 
    id: 'frt3', 
    name: t.fruitBasketRoyal, 
    price: 250, 
    img: require('../../../../assets/Fruits/Fruits/3f.png') 
  },
  { 
    id: 'frt4', 
    name: t.fruitMelonBoat, 
    price: 160, 
    img: require('../../../../assets/Fruits/Fruits/4f.png') 
  },
  { 
    id: 'frt5', 
    name: t.fruitTowerPremium, 
    price: 320, 
    img: require('../../../../assets/Fruits/Fruits/5f.png') 
  },
  { 
    id: 'frt6', 
    name: t.fruitBowlMix, 
    price: 90, 
    img: require('../../../../assets/Fruits/Fruits/6f.png') 
  },
  { 
    id: 'frt7', 
    name: t.pomegranatePlate, 
    price: 45, 
    img: require('../../../../assets/Fruits/Fruits/7f.png') 
  },
  { 
    id: 'frt8', 
    name: t.strawberryPlate, 
    price: 50, 
    img: require('../../../../assets/Fruits/Fruits/8f.png') 
  },
  { 
    id: 'frt9', 
    name: t.kiwiPlate, 
    price: 40, 
    img: require('../../../../assets/Fruits/Fruits/9f.png') 
  },
  { 
    id: 'frt10', 
    name: t.exoticFruitPlatter, 
    price: 200, 
    img: require('../../../../assets/Fruits/Fruits/10f.png') 
  }
];

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {items.map(item => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* تعديل الـ source ليتناسب مع الصور المحلية require */}
          <Image source={item.img} style={styles.image} resizeMode="cover" />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.price, { color: theme.primary }]}>${item.price}</Text>
            <TextInput
              style={[styles.qtyInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              value={String(quantities[item.id] || '')}
              onChangeText={(txt) => setQuantities({...quantities, [item.id]: parseInt(txt) || 0})}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ 
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 5 }, 
  card: { width: '48%', borderRadius: 12, borderWidth: 1, marginBottom: 15, overflow: 'hidden' }, 
  image: { width: '100%', height: 110 }, 
  info: { padding: 10, alignItems: 'center' }, 
  name: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 }, 
  price: { fontSize: 13, fontWeight: '700', marginBottom: 8 }, 
  qtyInput: { width: '80%', height: 35, borderRadius: 8, borderWidth: 1, textAlign: 'center', padding: 0 } 
});