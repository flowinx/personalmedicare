import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTreatmentById, getMemberById, deleteTreatment, updateTreatment, Treatment, Member } from '../services/firebase';

interface TreatmentDetailScreenProps {
  navigation: any;
  route: {
    params: {
      treatmentId: string;
    };
  };
}

export default function TreatmentDetailScreen({ navigation, route }: TreatmentDetailScreenProps) {
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatmentData();
  }, []);

  const loadTreatmentData = async () => {
    try {
      const treatmentData = await getTreatmentById(route.params.treatmentId);
      if (treatmentData) {
        setTreatment(treatmentData);
        
        const memberData = await getMemberById(treatmentData.member_id);
        setMember(memberData);
      } else {
        Alert.alert('Erro', 'Tratamento não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do tratamento');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddTreatment', { 
      treatmentId: treatment?.id,
      mode: 'edit'
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o tratamento "${treatment?.medication}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!treatment) return;

    try {
      await deleteTreatment(treatment.id);
      Alert.alert('Sucesso', 'Tratamento excluído com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao excluir tratamento: ' + error.message);
    }
  };

  const handleToggleStatus = async () => {
    if (!treatment) return;

    const newStatus = treatment.status === 'ativo' ? 'pausado' : 'ativo';
    
    try {
      await updateTreatment(treatment.id, {
        ...treatment,
        status: newStatus,
      });
      
      setTreatment({ ...treatment, status: newStatus });
      
      Alert.alert(
        'Sucesso', 
        `Tratamento ${newStatus === 'ativo' ? 'reativado' : 'pausado'} com sucesso!`
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao alterar status: ' + error.message);
    }
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
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!treatment || !member) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Tratamento não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.medicationHeader}>
            <Text style={styles.medicationName}>{treatment.medication}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(treatment.status) }]}>
              <Text style={styles.statusText}>{getStatusText(treatment.status)}</Text>
            </View>
          </View>
          <Text style={styles.memberName}>Para: {member.name}</Text>
          <Text style={styles.memberRelation}>{member.relation}</Text>
        </View>

        {/* Treatment Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Detalhes do Tratamento</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="medical" size={20} color="#b081ee" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Dosagem</Text>
              <Text style={styles.detailValue}>{treatment.dosage}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time" size={20} color="#b081ee" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Frequência</Text>
              <Text style={styles.detailValue}>
                A cada {treatment.frequency_value} {treatment.frequency_unit}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={20} color="#b081ee" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Data de Início</Text>
              <Text style={styles.detailValue}>
                {new Date(treatment.start_datetime).toLocaleDateString('pt-BR')} às{' '}
                {new Date(treatment.start_datetime).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="hourglass" size={20} color="#b081ee" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duração</Text>
              <Text style={styles.detailValue}>{treatment.duration}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="create" size={20} color="#b081ee" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Criado em</Text>
              <Text style={styles.detailValue}>
                {treatment.createdAt.toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {treatment.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notesText}>{treatment.notes}</Text>
          </View>
        )}

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <View style={styles.actionIcon}>
              <Ionicons name="create" size={24} color="#b081ee" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Editar Tratamento</Text>
              <Text style={styles.actionSubtitle}>Alterar dosagem, frequência ou observações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleToggleStatus}>
            <View style={styles.actionIcon}>
              <Ionicons 
                name={treatment.status === 'ativo' ? 'pause' : 'play'} 
                size={24} 
                color="#b081ee" 
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                {treatment.status === 'ativo' ? 'Pausar' : 'Reativar'} Tratamento
              </Text>
              <Text style={styles.actionSubtitle}>
                {treatment.status === 'ativo' 
                  ? 'Pausar temporariamente este tratamento'
                  : 'Reativar este tratamento'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Delete Section */}
        <View style={styles.deleteSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Excluir Tratamento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  headerSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRelation: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notesText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  deleteSection: {
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});