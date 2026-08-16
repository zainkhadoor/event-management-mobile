import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// تحديد الأيقونة واللون بناءً على نوع الإشعار (data.type)
const getNotificationTypeConfig = (type) => {
  switch (type) {
    case 'booking_approved':
    case 'booking_confirmed':
    case 'vendor_service_approved':
    case 'service_result_approved':
    case 'venue_result_approved':
      return { icon: 'checkmark-circle-outline', color: '#2e7d32' };

    case 'event_rejected':
    case 'vendor_service_rejected':
    case 'booking_cancelled_by_customer':
    case 'service_result_rejected':
    case 'venue_result_rejected':
      return { icon: 'close-circle-outline', color: '#c62828' };

    case 'invoice_paid':
      return { icon: 'card-outline', color: '#1565c0' };

    case 'new_event_request':
    case 'venue_available':
      return { icon: 'calendar-outline', color: '#ef6c00' };

    default:
      return { icon: 'notifications-outline', color: '#424242' };
  }
};

export const NotificationsList = ({ notifications, loading, onRefresh, onNotificationPress }) => {
  const renderItem = ({ item }) => {
    const isUnread = item.read_at === null;
    const innerData = item.data || {};
    const config = getNotificationTypeConfig(innerData.type);

    return (
      <TouchableOpacity
        style={[styles.itemContainer, isUnread && styles.unreadContainer]}
        onPress={() => onNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={26} color={config.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isUnread && styles.unreadTitle]}>
            {innerData.title || 'إشعار جديد'}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {innerData.message || ''}
          </Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleString('ar-EG')}
          </Text>
        </View>

        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      ListEmptyComponent={
        !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد إشعارات حالياً</Text>
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row-reverse',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  unreadContainer: {
    backgroundColor: '#f0f7ff',
  },
  iconContainer: {
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginRight: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
});