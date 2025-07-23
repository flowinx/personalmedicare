import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllTreatments, getAllMembers, Treatment, Member } from '../services/firebase';

interface TreatmentsScreenProps {
  navigation: any;
  route?: {
    params?: {
      memberId?: string;
    };
  };
}

export default function TreatmentsScreen({ navigation, route }: TreatmentsScreenProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [allTreatments, allMembers] = await Promise.all([
        getAllTreatments(),
        getAllMembers()
      ]);

      // Filter by member if specified
      const filteredTreatments = route?.params?.memberId
        ? allTreatments.filter(t => t.member_id === route.params.memberId)
        : allTreatments;

      setTreatments(filteredTreatments);
      setMembers(allMembers);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar tratamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Membro não encontrado';
  };

  const handleAddTreatment = () => {
    navigation.navigate('AddTreatment', route?.params?.memberId ? { memberId: route.params.memberId } : undefined);
  };

  const handleTreatmentPress = (treatment: Treatment) => {
    navigation.navigate('TreatmentDetail', { treatmentId: treatment.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return '#34C759';
      case 'pausado':
        return '#FF9500';
      case 'finalizado':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'pausado':
        return 'Pausado';
      case 'finalizado':
        return 'Finalizado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando tratamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {route?.params?.memberId ? 'Tratamentos do Membro' : 'Todos os Tratamentos'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTreatment}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {treatments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum tratamento encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {route?.params?.memberId
                ? 'Este membro ainda não possui tratamentos cadastrados'
                : 'Comece adicionando um novo tratamento'
              }
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddTreatment}>
              <Ionicons name="add" size={20} color="#b081ee" />
              <Text style={styles.emptyButtonText}>Adicionar Tratamento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.treatmentsList}>
            {treatments.map((treatment) => (
              <TouchableOpacity
                key={treatment.id}
                style={styles.treatmentCard}
                onPress={() => handleTreatmentPress(treatment)}
              >
                <View style={styles.treatmentHeader}>
                  <View style={styles.treatmentInfo}>
                    <Text style={styles.medicationName}>{treatment.medication}</Text>
                    <Text style={styles.memberName}>{getMemberName(treatment.member_id)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(treatment.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(treatment.status)}</Text>
                  </View>
                </View>

                <View style={styles.treatmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="medical" size={16} color="#666" />
                    <Text style={styles.detailText}>Dosagem: {treatment.dosage}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      A cada {treatment.frequency_value} {treatment.frequency_unit}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Início: {new Date(treatment.start_datetime).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  {treatment.duration && (
                    <View style={styles.detailRow}>
                      <Ionicons name="hourglass" size={16} color="#666" />
                      <Text style={styles.detailText}>Duração: {treatment.duration}</Text>
                    </View>
                  )}
                </View>

                {treatment.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesText} numberOfLines={2}>
                      {treatment.notes}
                    </Text>
                  </View>
                )}

                <View style={styles.treatmentFooter}>
                  <Text style={styles.createdDate}>
                    Criado em {treatment.createdAt.toLocaleDateString('pt-BR')}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#b081ee',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b081ee',
  },
  emptyButtonText: {
    color: '#b081ee',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  treatmentsList: {
    padding: 16,
  },
  treatmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  treatmentInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  treatmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notesSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  treatmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
});