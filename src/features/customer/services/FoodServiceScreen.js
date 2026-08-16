// src/features/customer/pages/FoodServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';

export default function FoodServiceScreen() {
  const { theme, locale, t } = useApp();
  const isRTL = locale === 'ar';

  const [quantities, setQuantities] = useState({});

  // مصفوفة الأطباق متناسقة بالكامل مع الـ Wizard والترجمات الأربعة والصور المحلية
  const foodItems = [
    { id: 'f1', labelKey: 'foodFiletMignon', price: 180, img: require('../../../assets/Food/FiletMignon.jpg') },
    { id: 'f2', labelKey: 'foodFoieGras', price: 220, img: require('../../../assets/Food/FoieGras.jpg') },
    { id: 'f3', labelKey: 'foodJagerschnitzel', price: 95, img: require('../../../assets/Food/Jägerschnitzel.jpg') },
    { id: 'f4', labelKey: 'foodLobsterThermidor', price: 260, img: require('../../../assets/Food/LobsterThermidor.jpg') },
    { id: 'f5', labelKey: 'foodPekingDuck', price: 140, img: require('../../../assets/Food/PekingDuck.jpg') },
    { id: 'f6', labelKey: 'foodRisottoAiFunghi', price: 85, img: require('../../../assets/Food/RisottoAiFunghi.jpg') },
    { id: 'f7', labelKey: 'foodSaffronRisotto', price: 195, img: require('../../../assets/Food/SaffronRisottoWithGoldLeaf.jpg') },
    { id: 'f8', labelKey: 'foodStuffedCalamari', price: 130, img: require('../../../assets/Food/SquidInkStuffedCalamari.jpg') },
    { id: 'f9', labelKey: 'foodTagliatelleTartufo', price: 165, img: require('../../../assets/Food/TagliatelleAlTartufoNero.jpg') },
    { id: 'f10', labelKey: 'foodTurbotChampagne', price: 210, img: require('../../../assets/Food/TurbotWithChampagneSauce.jpg') }
  ];

  const handleManualQty = (id, text) => {
    const val = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    setQuantities({ ...quantities, [id]: val });
  };

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {foodItems.map(item => (
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