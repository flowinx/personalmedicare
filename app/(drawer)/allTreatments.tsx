import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { getAllMembers } from '../../db/members';
import { getAllTreatments } from '../../db/memoryStorage';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
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

  // Animações de entrada
  const { fadeAnim, slideAnim, startAnimation } = useEntranceAnimation();

  useFocusEffect(
    useCallback(() => {
      startAnimation();
      const fetchTreatments = async () => {
        setLoading(true);
        try {
          const allTreatments = await getAllTreatments();
          const allMembers = await getAllMembers();
          
          // Combinar tratamentos com nomes dos membros
          const treatmentsWithMemberNames = allTreatments.map(treatment => {
            const member = allMembers.find(m => m.id === treatment.member_id);
            return {
              ...treatment,
              member_name: member?.name || 'Membro não encontrado',
              notes: treatment.notes || ''
            };
          });
          
          setTreatments(treatmentsWithMemberNames);
        } catch (error) {
          console.error('Erro ao buscar tratamentos:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTreatments();
    }, [startAnimation])
  );

  const filteredTreatments =
    filter === 'todos'
      ? treatments
      : treatments.filter(t =>
          filter === 'ativos' ? t.status === 'ativo' : t.status !== 'ativo'
        );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return '#4CAF50';
      case 'finalizado':
        return '#FF9800';
      case 'pausado':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'play-circle';
      case 'finalizado':
        return 'check-circle';
      case 'pausado':
        return 'pause-circle';
      default:
        return 'circle';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Filtros */}
        <Animated.View style={[styles.headerCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerContent}>
            <FontAwesome name="medkit" size={24} color="#b081ee" style={styles.headerIcon} />
            <ThemedText style={styles.headerTitle}>Tratamentos</ThemedText>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              onPress={() => setFilter('todos')} 
              style={[styles.filterButton, filter === 'todos' && styles.filterButtonActive]}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.filterButtonText, filter === 'todos' && styles.filterButtonTextActive]}>
                Todos
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFilter('ativos')} 
              style={[styles.filterButton, filter === 'ativos' && styles.filterButtonActive]}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.filterButtonText, filter === 'ativos' && styles.filterButtonTextActive]}>
                Ativos
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFilter('finalizados')} 
              style={[styles.filterButton, filter === 'finalizados' && styles.filterButtonActive]}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.filterButtonText, filter === 'finalizados' && styles.filterButtonTextActive]}>
                Finalizados
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Loading */}
        {loading && (
          <Animated.View style={[styles.loadingCard, { transform: [{ translateY: slideAnim }] }]}>
            <ActivityIndicator size="large" color="#b081ee" />
            <ThemedText style={styles.loadingText}>Carregando tratamentos...</ThemedText>
          </Animated.View>
        )}

        {/* Lista de Tratamentos */}
        {!loading && (
          <>
            {filteredTreatments.length === 0 ? (
              <Animated.View style={[styles.emptyCard, { transform: [{ translateY: slideAnim }] }]}>
                <FontAwesome name="inbox" size={48} color="#b081ee" style={styles.emptyIcon} />
                <ThemedText style={styles.emptyTitle}>Nenhum tratamento encontrado</ThemedText>
                <ThemedText style={styles.emptyText}>
                  {filter === 'todos' 
                    ? 'Você ainda não possui tratamentos cadastrados.'
                    : `Nenhum tratamento ${filter === 'ativos' ? 'ativo' : 'finalizado'} encontrado.`
                  }
                </ThemedText>
              </Animated.View>
            ) : (
              filteredTreatments.map((treatment, index) => (
                <Animated.View 
                  key={treatment.id} 
                  style={[
                    styles.treatmentCard, 
                    { 
                      transform: [{ 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50 + (index * 20), 0]
                        })
                      }] 
                    }
                  ]}
                >
                  <View style={styles.treatmentHeader}>
                    <View style={styles.treatmentIconContainer}>
                      <FontAwesome name="medkit" size={20} color="#b081ee" />
                    </View>
                    <View style={styles.treatmentTitleContainer}>
                      <ThemedText style={styles.treatmentName}>
                        {treatment.medication}
                      </ThemedText>
                      <ThemedText style={styles.treatmentMember}>
                        {treatment.member_name}
                      </ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(treatment.status) }]}>
                      <FontAwesome name={getStatusIcon(treatment.status)} size={12} color="#fff" />
                      <ThemedText style={styles.statusText}>
                        {treatment.status}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.treatmentDetails}>
                    <View style={styles.detailRow}>
                      <FontAwesome name="calendar" size={14} color="#6c757d" />
                      <ThemedText style={styles.detailText}>
                        Início: {new Date(treatment.start_datetime).toLocaleDateString('pt-BR')}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <FontAwesome name="tint" size={14} color="#6c757d" />
                      <ThemedText style={styles.detailText}>
                        Dosagem: {treatment.dosage}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <FontAwesome name="clock-o" size={14} color="#6c757d" />
                      <ThemedText style={styles.detailText}>
                        Frequência: a cada {treatment.frequency_value} {treatment.frequency_unit}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <FontAwesome name="hourglass" size={14} color="#6c757d" />
                      <ThemedText style={styles.detailText}>
                        Duração: {treatment.duration}
                      </ThemedText>
                    </View>
                    
                    {treatment.notes && (
                      <View style={styles.notesContainer}>
                        <FontAwesome name="sticky-note-o" size={14} color="#6c757d" />
                        <ThemedText style={styles.notesText}>
                          {treatment.notes}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </Animated.View>
              ))
            )}
          </>
        )}

        {/* Botão Voltar */}
        <Animated.View style={[styles.backButtonContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <FontAwesome name="arrow-left" size={16} color="#fff" style={styles.backButtonIcon} />
            <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d1155',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  filterButtonText: {
    color: '#6c757d',
    fontWeight: '500',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2d1155',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d1155',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  treatmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  treatmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  treatmentTitleContainer: {
    flex: 1,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d1155',
    marginBottom: 2,
  },
  treatmentMember: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  treatmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#2d1155',
    flex: 1,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  notesText: {
    fontSize: 14,
    color: '#2d1155',
    flex: 1,
    fontStyle: 'italic',
  },
  backButtonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 