// src/features/customer/services/SweetsServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';
import { translations } from '../../../utils/languages';

export default function SweetsServiceScreen() {
  const { theme, locale } = useApp();
  const [quantities, setQuantities] = useState({});

  const t = translations[locale] || translations['en'];

  // تم تصحيح المفاتيح هنا لتطابق ملف الترجمة (translations.ar / translations.en) تماماً
  const items = [
    { id: 'drt1', name: t.macaronsPyramid || 'Macarons Pyramid', price: 120, img: require('../../../assets/Desserts/1d.png') },
    { id: 'drt2', name: t.strawberrySliceCake || 'Strawberry Slice Cake', price: 160, img: require('../../../assets/Desserts/2d.png') },
    { id: 'drt3', name: t.raspberryGlaceCake || 'Raspberry Glace Cake', price: 210, img: require('../../../assets/Desserts/3d.png') },
    { id: 'drt4', name: t.lemonMeringueTart || 'Lemon Meringue Tart', price: 140, img: require('../../../assets/Desserts/4d.png') },
    { id: 'drt5', name: t.saintHonoreVanille || 'Saint Honoré Vanille', price: 190, img: require('../../../assets/Desserts/5d.png') },
    { id: 'drt6', name: t.cremeBruleeClassic || 'Crème Brûlée Classic', price: 85, img: require('../../../assets/Desserts/6d.png') },
    { id: 'drt7', name: t.macaronsLineSelection || 'Macarons Selection Line', price: 65, img: require('../../../assets/Desserts/7d.png') },
    { id: 'drt8', name: t.roseRaspberryDome || 'Rose Raspberry Dome', price: 75, img: require('../../../assets/Desserts/8d.png') },
    { id: 'drt9', name: t.chocolateGoldFlowerTart || 'Chocolate Gold Flower Tart', price: 55, img: require('../../../assets/Desserts/9d.png') },
    { id: 'drt10', name: t.berryPannaCotta || 'Berry Panna Cotta', price: 175, img: require('../../../assets/Desserts/10d.png') },
    { id: 'drt11', name: t.dessertFruitCake || 'Fruit Cake', price: 250, img: require('../../../assets/Desserts/11d.png') },
    { id: 'drt12', name: t.dessertWalnutNest || 'Walnut Nest', price: 90, img: require('../../../assets/Desserts/12d.png') },
    { id: 'drt13', name: t.dessertPistachioRoll || 'Pistachio Roll', price: 110, img: require('../../../assets/Desserts/13d.png') },
    { id: 'drt14', name: t.dessertAshtaNest || 'Ashta Nest with Pistachio', price: 95, img: require('../../../assets/Desserts/14d.png') },
    { id: 'drt15', name: t.dessertBasbousaPistachio || 'Basbousa with Pistachio', price: 70, img: require('../../../assets/Desserts/15d.png') },
    { id: 'drt16', name: t.dessertBasbousaAlmond || 'Basbousa with Almonds', price: 65, img: require('../../../assets/Desserts/16d.png') },
    { id: 'drt17', name: t.dessertWeddingCake || 'Royal Wedding Cake', price: 850, img: require('../../../assets/Desserts/17d.jpg') },
    { id: 'drt18', name: t.dessertAssortedBaklava || 'Assorted Oriental Baklava', price: 180, img: require('../../../assets/Desserts/18d.png') },
    { id: 'drt19', name: t.dessertKunafa || 'Traditional Kunafa', price: 130, img: require('../../../assets/Desserts/19d.png') }
  ];

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {items.map(item => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
  name: { fontSize: 13, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  price: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  qtyInput: { width: '80%', height: 35, borderRadius: 8, borderWidth: 1, textAlign: 'center', padding: 0 }
});