// src/features/customer/services/CarsServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';
import { translations } from '../../../utils/languages';

export default function CarsServiceScreen() {
  const { theme, locale } = useApp();
  const [quantities, setQuantities] = useState({});

  const t = translations[locale] || translations['en'];

  const items = [
    { id: 'car1', name: t.carRollsClassic, price: 950, img: require('../../../assets/Cars/1c.jpg') },
    { id: 'car2', name: t.carAudiA8L, price: 500, img: require('../../../assets/Cars/2c.jpg') },
    { id: 'car3', name: t.carBentleySUV, price: 850, img: require('../../../assets/Cars/3c.jpg') },
    { id: 'car4', name: t.carDefenderLuxury, price: 600, img: require('../../../assets/Cars/4c.jpg') },
    { id: 'car5', name: t.carLimousineVIP, price: 1100, img: require('../../../assets/Cars/5c.jpg') },
    { id: 'car6', name: t.carMaybachSClass, price: 1200, img: require('../../../assets/Cars/6c.jpg') },
    { id: 'car7', name: t.carMercedesCabrio, price: 700, img: require('../../../assets/Cars/7c.jpg') },
    { id: 'car8', name: t.carMercedesGClass, price: 1500, img: require('../../../assets/Cars/8c.jpg') },
    { id: 'car9', name: t.carPorschePanamera, price: 800, img: require('../../../assets/Cars/9c.jpg') },
    { id: 'car10', name: t.carRollsPhantom, price: 2000, img: require('../../../assets/Cars/10c.jpg') }
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