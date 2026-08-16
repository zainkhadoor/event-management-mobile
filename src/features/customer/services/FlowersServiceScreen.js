// src/features/customer/services/FlowersServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';
import { translations } from '../../../utils/languages';

export default function FlowersServiceScreen() {
  const { theme, locale } = useApp();
  const [quantities, setQuantities] = useState({});

  const t = translations[locale] || translations['en'];

  const items = [
    { id: 'fl1', name: t.blackStar, price: 1200, img: require('../../../assets/Flowers/BlackStar.jpg') },
    { id: 'fl2', name: t.boatOrchid, price: 650, img: require('../../../assets/Flowers/BoatOrchid.jpg') },
    { id: 'fl3', name: t.camellia, price: 450, img: require('../../../assets/Flowers/Camellia.jpg') },
    { id: 'fl4', name: t.daisy, price: 180, img: require('../../../assets/Flowers/Daisy.jpg') },
    { id: 'fl5', name: t.damaskRose, price: 220, img: require('../../../assets/Flowers/DamaskRose.jpg') },
    { id: 'fl6', name: t.hydrangea, price: 380, img: require('../../../assets/Flowers/Hydrangea.jpg') },
    { id: 'fl7', name: t.jasmine, price: 150, img: require('../../../assets/Flowers/Jasmine.jpg') },
    { id: 'fl8', name: t.narcissus, price: 170, img: require('../../../assets/Flowers/Narcissus.jpg') },
    { id: 'fl9', name: t.orichid, price: 500, img: require('../../../assets/Flowers/Orichid.jpg') },
    { id: 'fl10', name: t.tulips, price: 260, img: require('../../../assets/Flowers/Tulips.jpg') }
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