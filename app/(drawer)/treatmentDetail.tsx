import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { getAllMembers } from '../../db/members';
import { getTreatmentById } from '../../db/memoryStorage';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

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

export default function TreatmentDetailScreen() {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  
  const treatmentId = (route.params as any)?.treatmentId ? Number((route.params as any).treatmentId) : undefined;
  
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);
  const { fadeAnim, slideAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  useFocusEffect(
    useCallback(() => {
      const loadTreatment = async () => {
        if (!treatmentId) {
          Alert.alert('Erro', 'ID do tratamento não fornecido.');
          router.back();
          return;
        }

        setLoading(true);
        try {
          const treatmentData = await getTreatmentById(treatmentId);
          if (treatmentData) {
            const allMembers = await getAllMembers();
            const member = allMembers.find(m => m.id === treatmentData.member_id);
            
                         setTreatment({
               ...treatmentData,
               member_name: member?.name || 'Membro não encontrado',
               notes: treatmentData.notes || ''
             });
          } else {
            Alert.alert('Erro', 'Tratamento não encontrado.');
            router.back();
          }
        } catch (error) {
          console.error('Erro ao carregar tratamento:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do tratamento.');
          router.back();
        } finally {
          setLoading(false);
        }
      };

      loadTreatment();
    }, [treatmentId, router])
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

  const handleEdit = () => {
    if (treatment) {
      router.push({
        pathname: '/addTreatment',
        params: { 
          memberId: treatment.member_id,
          treatmentId: treatment.id.toString(),
          mode: 'edit'
        }
      });
    }
  };

  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b081ee" />
          <ThemedText style={styles.loadingText}>Carregando tratamento...</ThemedText>
        </View>
      </Animated.View>
    );
  }

  if (!treatment) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#F44336" />
          <ThemedText style={styles.errorTitle}>Tratamento não encontrado</ThemedText>
          <ThemedText style={styles.errorText}>
            O tratamento solicitado não foi encontrado ou foi removido.
          </ThemedText>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.headerCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerContent}>
            <FontAwesome name="medkit" size={24} color="#b081ee" style={styles.headerIcon} />
            <ThemedText style={styles.headerTitle}>Detalhes do Tratamento</ThemedText>
          </View>
        </Animated.View>

        {/* Card do Tratamento */}
        <Animated.View style={[styles.treatmentCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.treatmentHeader}>
            <View style={styles.treatmentIconContainer}>
              <FontAwesome name="medkit" size={20} color="#b081ee" />
            </View>
            <View style={styles.treatmentTitleContainer}>
              <ScrollView 
                style={styles.medicationScrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.medicationScrollContent}
              >
                <ThemedText style={styles.treatmentName}>
                  {treatment.medication}
                </ThemedText>
              </ScrollView>
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
              <ScrollView 
                style={styles.notesScrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.notesScrollContent}
              >
                <View style={styles.notesContainer}>
                  <FontAwesome name="sticky-note-o" size={14} color="#6c757d" />
                  <ThemedText style={styles.notesText}>
                    {treatment.notes}
                  </ThemedText>
                </View>
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Botões Fixos na Parte Inferior */}
      <Animated.View style={[styles.fixedButtonsContainer, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
                      <FontAwesome name="edit" size={16} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Editar</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <FontAwesome name="arrow-left" size={16} color="#fff" style={styles.backButtonIcon} />
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </Animated.View>
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
    paddingBottom: 120, // Espaço para os botões fixos
  },
  medicationScrollView: {
    maxHeight: 60,
  },
  medicationScrollContent: {
    paddingVertical: 4,
  },
  // Estilos da tabela
  tableWrapper: {
    marginBottom: 16,
    flex: 1,
    minHeight: 300,
    maxHeight: 400,
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
    maxHeight: '60%',
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 8,
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 60,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  fieldText: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '400',
  },
  statusCell: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  // Botões fixos na parte inferior
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2d1155',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d1155',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
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
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d1155',
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
  notesScrollView: {
    maxHeight: 300,
  },
  notesScrollContent: {
    paddingVertical: 4,
  },
  actionButtonsContainer: {
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
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