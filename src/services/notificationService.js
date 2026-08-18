import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useApp } from '../store/AppContext';

export default function NotificationsList({ notifications, loading, onRefresh, onNotificationClick }) {
  const { theme, locale } = useApp();
  const isRTL = locale === 'ar';

  const renderItem = ({ item }) => {
    const isUnread = item.read_at === null;
    const innerData = item.data || {};

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: isUnread ? theme.surface || '#F0F7FF' : theme.background || '#FFF' },
          { borderColor: theme.border || '#E0E0E0' }
        ]}
        onPress={() => onNotificationClick(item)}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.title, { color: theme.text || '#000', textAlign: isRTL ? 'right' : 'left' }]}>
            {innerData.title || 'إشعار جديد'}
          </Text>
          {isUnread && <View style={styles.unreadBadge} />}
        </View>

        <Text style={[styles.message, { color: theme.textMuted || '#666', textAlign: isRTL ? 'right' : 'left' }]}>
          {innerData.message || ''}
        </Text>

        <Text style={[styles.date, { textAlign: isRTL ? 'right' : 'left' }]}>
          {new Date(item.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        !loading && (
          <View style={styles.emptyView}>
            <Text style={{ color: theme.textMuted || '#888' }}>
              {isRTL ? 'لا توجد إشعارات حالياً' : 'No notifications found'}
            </Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginHorizontal: 6,
  },
  message: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  emptyView: {
    padding: 40,
    alignItems: 'center',
  },
});