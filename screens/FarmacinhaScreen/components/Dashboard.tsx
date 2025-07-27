import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardProps {
  totalCount: number;
  expiredCount: number;
  expiringSoonCount: number;
}

export default function Dashboard({ totalCount, expiredCount, expiringSoonCount }: DashboardProps) {
  const activeCount = totalCount - expiredCount - expiringSoonCount;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <DashboardItem
          icon="medical"
          iconColor="#4ECDC4"
          iconBgColor="#E5F9F6"
          number={totalCount}
          label="Total"
        />
        
        <DashboardItem
          icon="warning"
          iconColor="#FF6B6B"
          iconBgColor="#FFE5E5"
          number={expiredCount}
          label="Vencidos"
        />
        
        <DashboardItem
          icon="time"
          iconColor="#FFB800"
          iconBgColor="#FFF4E5"
          number={expiringSoonCount}
          label="Vencendo"
        />
        
        <DashboardItem
          icon="checkmark-circle"
          iconColor="#4CAF50"
          iconBgColor="#E8F5E8"
          number={activeCount}
          label="OK"
        />
      </View>
    </View>
  );
}

interface DashboardItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  number: number;
  label: string;
}

function DashboardItem({ icon, iconColor, iconBgColor, number, label }: DashboardItemProps) {
  return (
    <View style={styles.item}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.number}>{number}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  info: {
    alignItems: 'center',
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
});