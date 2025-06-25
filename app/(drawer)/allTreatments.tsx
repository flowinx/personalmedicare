import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getDatabase } from '../../db/index';
import { useThemeColor } from '../../hooks/useThemeColor';

interface Treatment {
  id: number;
  medication: string;
  member_id: number;
  member_name: string;
  status: string;
  dosage: string;
  frequency_value: number;
  frequency_unit: string;
  duration: string;
  notes: string;
  start_datetime: string;
}

export default function AllTreatmentsScreen() {
  const router = useRouter();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'finalizados'>('todos');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  useFocusEffect(
    useCallback(() => {
      const fetchTreatments = async () => {
        setLoading(true);
        try {
          const db = await getDatabase();
          const allTreatments = await db.getAllAsync<Treatment>(
            `SELECT t.*, m.name as member_name FROM treatments t JOIN members m ON t.member_id = m.id ORDER BY t.start_datetime DESC`
          );
          setTreatments(allTreatments);
        } catch (error) {
          console.error('Erro ao buscar tratamentos:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTreatments();
    }, [])
  );

  const filteredTreatments =
    filter === 'todos'
      ? treatments
      : treatments.filter(t =>
          filter === 'ativos' ? t.status === 'ativo' : t.status !== 'ativo'
        );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Todos os Tratamentos</ThemedText>
      
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('todos')} style={[styles.filterButton, filter === 'todos' && styles.filterButtonActive]}>
          <ThemedText style={[styles.filterButtonText, filter === 'todos' && styles.filterButtonTextActive]}>Todos</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('ativos')} style={[styles.filterButton, filter === 'ativos' && styles.filterButtonActive]}>
          <ThemedText style={[styles.filterButtonText, filter === 'ativos' && styles.filterButtonTextActive]}>Ativos</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('finalizados')} style={[styles.filterButton, filter === 'finalizados' && styles.filterButtonActive]}>
          <ThemedText style={[styles.filterButtonText, filter === 'finalizados' && styles.filterButtonTextActive]}>Finalizados</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 40 }} />
        ) : filteredTreatments.length === 0 ? (
          <ThemedText style={styles.emptyText}>Nenhum tratamento encontrado.</ThemedText>
        ) : (
          <ScrollView>
            {filteredTreatments.map((treatment) => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <View style={styles.treatmentIcon}>
                  <FontAwesome name="medkit" size={20} color={iconColor} />
                </View>
                <View style={styles.treatmentContent}>
                  <ThemedText style={styles.treatmentName} lightColor="#2d1155" darkColor="#2d1155">{treatment.medication} - {treatment.member_name}</ThemedText>
                  <ThemedText style={styles.treatmentTime} lightColor="#2d1155" darkColor="#2d1155">Início: {new Date(treatment.start_datetime).toLocaleDateString()}</ThemedText>
                  <ThemedText style={styles.treatmentInfo} lightColor="#2d1155" darkColor="#2d1155">Dosagem: {treatment.dosage}</ThemedText>
                  <ThemedText style={styles.treatmentInfo} lightColor="#2d1155" darkColor="#2d1155">Frequência: a cada {treatment.frequency_value} {treatment.frequency_unit}</ThemedText>
                  <ThemedText style={styles.treatmentInfo} lightColor="#2d1155" darkColor="#2d1155">Duração: {treatment.duration}</ThemedText>
                  <ThemedText style={[styles.treatmentInfo, styles.treatmentStatus]} lightColor="#2d1155" darkColor="#2d1155">Status: {treatment.status}</ThemedText>
                  {treatment.notes ? <ThemedText style={styles.treatmentNotes} lightColor="#2d1155" darkColor="#2d1155">Obs: {treatment.notes}</ThemedText> : null}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backButtonText} lightColor="#b081ee" darkColor="#b081ee">Voltar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#b081ee',
  },
  filterButtonText: {
    color: '#b081ee',
    fontWeight: 'bold',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 30,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  treatmentIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  treatmentContent: {
    flex: 1,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  treatmentTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  treatmentInfo: {
    fontSize: 13,
  },
  treatmentStatus: {
    fontWeight: 'bold',
  },
  treatmentNotes: {
    fontSize: 13,
    marginTop: 4,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 