import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { deleteTreatment, getAllTreatments, Treatment } from '../../db/index';
import { getAllMembers } from '../../db/members';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

interface TreatmentWithMember extends Treatment {
  member_name: string;
}

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

export default function AllTreatmentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [treatments, setTreatments] = useState<TreatmentWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'finalizados'>('todos');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState<TreatmentWithMember | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          const treatmentsWithMemberNames: TreatmentWithMember[] = allTreatments.map(treatment => {
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
          Alert.alert('Erro', 'Não foi possível carregar os tratamentos.');
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
        return '#10B981';
      case 'finalizado':
        return '#F59E0B';
      case 'pausado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'circle';
      case 'finalizado':
        return 'check-circle';
      case 'pausado':
        return 'pause-circle';
      default:
        return 'circle';
    }
  };

  const handleEditTreatment = (treatment: TreatmentWithMember) => {
    navigation.navigate('Novo Tratamento', { 
      treatmentId: treatment.id,
      mode: 'edit'
    });
  };

  const handleViewTreatment = (treatment: TreatmentWithMember) => {
    navigation.navigate('Detalhes do Tratamento', { 
      treatmentId: treatment.id
    });
  };

  const handleDeleteTreatment = (treatment: TreatmentWithMember) => {
    setTreatmentToDelete(treatment);
    setDeleteModalVisible(true);
  };

  const confirmDeleteTreatment = async () => {
    if (!treatmentToDelete) return;
    
    setDeleting(true);
    try {
      await deleteTreatment(treatmentToDelete.id);
      setTreatments(prev => prev.filter(t => t.id !== treatmentToDelete.id));
      setDeleteModalVisible(false);
      setTreatmentToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir tratamento:', error);
      Alert.alert('Erro', 'Não foi possível excluir o tratamento. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setTreatmentToDelete(null);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
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
              <View style={styles.tableWrapper}>
                <Animated.View style={[
                  styles.tableContainer, 
                  { transform: [{ translateY: slideAnim }] }
                ]}>
                  {/* Cabeçalho da Tabela - Fixo */}
                  <View style={styles.tableHeader}>
                    <ThemedText style={[styles.headerCell, { flex: 1 }]}>Membro</ThemedText>
                    <ThemedText style={[styles.headerCell, { flex: 2 }]}>Descrição</ThemedText>
                    <ThemedText style={[styles.headerCell, { flex: 1 }]}>Status</ThemedText>
                    <ThemedText style={[styles.headerCell, { flex: 1 }]}>Ações</ThemedText>
                  </View>

                  {/* ScrollView para as linhas da tabela */}
                  <ScrollView 
                    style={styles.tableScrollView}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.tableScrollContent}
                  >
                    {filteredTreatments.map((treatment, index) => (
                      <Animated.View 
                        key={treatment.id} 
                        style={[
                          styles.tableRow, 
                          { 
                            transform: [{ 
                              translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30 + (index * 10), 0]
                              })
                            }] 
                          }
                        ]}
                      >
                                              <View style={[styles.cell, { flex: 1 }]}>
                        <View style={styles.memberCell}>
                          <Image 
                            source={{ uri: `https://i.pravatar.cc/100?u=${treatment.member_name}` }}
                            style={styles.memberAvatar}
                          />
                        </View>
                      </View>
                      
                      <View style={[styles.cell, { flex: 2, paddingRight: 8 }]}>
                        <ThemedText style={styles.medicationText}>
                          <ThemedText style={styles.medicationName}>{treatment.medication}</ThemedText>
                        </ThemedText>
                      </View>
                        
                        <View style={[styles.cell, { flex: 1 }]}>
                                                  <View style={styles.statusCell}>
                          <TouchableOpacity 
                            style={styles.statusBadge}
                            onPress={() => Alert.alert('Status', `Status: ${treatment.status}`)}
                            activeOpacity={0.7}
                          >
                            <FontAwesome 
                              name={getStatusIcon(treatment.status)} 
                              size={12} 
                              color={getStatusColor(treatment.status)} 
                            />
                          </TouchableOpacity>
                        </View>
                        </View>
                        
                        <View style={[styles.cell, { flex: 1 }]}>
                          <View style={styles.actionIcons}>
                            <TouchableOpacity 
                              style={styles.actionIcon}
                              onPress={() => handleViewTreatment(treatment)}
                              activeOpacity={0.7}
                            >
                              <FontAwesome name="eye" size={16} color="#2196F3" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.actionIcon}
                              onPress={() => handleEditTreatment(treatment)}
                              activeOpacity={0.7}
                            >
                              <FontAwesome name="edit" size={16} color="#4CAF50" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.actionIcon}
                              onPress={() => handleDeleteTreatment(treatment)}
                              activeOpacity={0.7}
                            >
                              <FontAwesome name="trash" size={16} color="#F44336" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Animated.View>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            )}
          </>
        )}

        {/* Botão Voltar */}
        <Animated.View style={[styles.backButtonContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <FontAwesome name="arrow-left" size={16} color="#fff" style={styles.backButtonIcon} />
            <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* Modal de Confirmação de Exclusão */}
        <Modal
          animationType="fade"
          transparent
          visible={deleteModalVisible}
          onRequestClose={cancelDelete}
        >
          <Pressable style={styles.modalOverlay} onPress={cancelDelete}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <FontAwesome name="exclamation-triangle" size={24} color="#F44336" />
                <ThemedText style={styles.modalTitle}>Confirmar Exclusão</ThemedText>
              </View>
              
              <ThemedText style={styles.modalMessage}>
                Tem certeza que deseja excluir o tratamento &quot;{treatmentToDelete?.medication}&quot;?
              </ThemedText>
              <ThemedText style={styles.modalSubMessage}>
                Esta ação não pode ser desfeita.
              </ThemedText>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancelDelete}
                  disabled={deleting}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, deleting && styles.confirmButtonDisabled]}
                  onPress={confirmDeleteTreatment}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontAwesome name="trash" size={14} color="#fff" />
                      <ThemedText style={styles.confirmButtonText}>Excluir</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100,
    flexGrow: 1,
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
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  filterButtonText: {
    color: '#6c757d',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
    flexShrink: 1,
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
  tableWrapper: {
    marginBottom: 16,
    flex: 1,
    minHeight: 300,
    maxHeight: '60%',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    maxHeight: '90%',
  },
  tableScrollView: {
    flex: 1,
  },
  tableScrollContent: {
    paddingBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 12,
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d1155',
    flex: 1,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 65,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  medicationText: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '500',
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  medicationName: {
    fontWeight: '600',
    color: '#2d1155',
  },
  memberText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '400',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  memberCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  statusBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'transparent',
    minHeight: 32,
  },

  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionIcon: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  backButtonContainer: {
    marginTop: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d1155',
    marginLeft: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#2d1155',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#2d1155',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonDisabled: {
    backgroundColor: '#a5d6a7',
    opacity: 0.7,
  },
}); 