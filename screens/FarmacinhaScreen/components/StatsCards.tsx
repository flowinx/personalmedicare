import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardsProps {
  expiredCount: number;
  expiringSoonCount: number;
  fadeAnim: Animated.Value;
}

export default function StatsCards({ expiredCount, expiringSoonCount, fadeAnim }: StatsCardsProps) {
  if (expiredCount === 0 && expiringSoonCount === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {expiredCount > 0 && (
        <View style={[styles.card, styles.expiredCard]}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.text}>{expiredCount} vencido(s)</Text>
        </View>
      )}
      {expiringSoonCount > 0 && (
        <View style={[styles.card, styles.expiringSoonCard]}>
          <Ionicons name="time" size={20} color="#fff" />
          <Text style={styles.text}>{expiringSoonCount} vence(m) em breve</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  expiredCard: {
    backgroundColor: '#FF6B6B',
  },
  expiringSoonCard: {
    backgroundColor: '#FFD93D',
  },
  text: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});