// src/features/customer/services/DrinksServiceScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';
import { useApp } from '../../../store/AppContext';
import { translations } from '../../../utils/languages';

export default function DrinksServiceScreen() {
  const { theme, locale } = useApp();
  const [quantities, setQuantities] = useState({});

  const t = translations[locale] || translations['en'];

const items = [
  { id: 'd1', name: t.drinkBitterCoffee || 'Bitter Coffee', price: 12, img: require('../../../assets/Drinks/BitterCoffee.jpg') },
  { id: 'd2', name: t.drinkChampagne || 'Champagne', price: 14, img: require('../../../assets/Drinks/Champagne.jpg') },
  { id: 'd3', name: t.drinkCocktail || 'Cocktail', price: 10, img: require('../../../assets/Drinks/Cocktail.jpg') },
  { id: 'd4', name: t.drinkEnergyDrinks || 'Energy Drinks', price: 15, img: require('../../../assets/Drinks/EnergyDrinks.jpg') },
  { id: 'd5', name: t.drinkFizzyDrinks || 'Fizzy Drinks', price: 18, img: require('../../../assets/Drinks/FizzyDrinks.jpg') },
  { id: 'd6', name: t.drinkFreshJuice || 'Fresh Juice', price: 16, img: require('../../../assets/Drinks/FreshJuice.jpg') },
  { id: 'd7', name: t.drinkHerbalTea || 'Herbal Tea', price: 9, img: require('../../../assets/Drinks/HerbalTea.jpg') },
  { id: 'd8', name: t.drinkHotDrinks || 'Hot Drinks', price: 14, img: require('../../../assets/Drinks/HotDrinks.jpg') },
  { id: 'd9', name: t.drinkMilkShake || 'Milk Shake', price: 17, img: require('../../../assets/Drinks/MilkShake.jpg') },
  { id: 'd10', name: t.drinkWhiskey || 'Whiskey', price: 13, img: require('../../../assets/Drinks/Whiskey.jpg') }
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