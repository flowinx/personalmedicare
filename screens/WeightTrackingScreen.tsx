import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline } from 'react-native-svg';
import {
  addWeightRecord,
  deleteWeightRecord,
  getMemberById,
  getWeightRecordsByMemberId,
  Member,
  WeightRecord,
} from '../services/firebase';
import { useEntranceAnimation } from '../utils/animations';

const { width: screenWidth } = Dimensions.get('window');

interface WeightTrackingScreenProps {
  navigation: any;
  route: {
    params: {
      memberId: string;
    };
  };
}

export default function WeightTrackingScreen({ navigation, route }: WeightTrackingScreenProps) {
  const { memberId } = route.params;
  const [member, setMember] = useState<Member | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
    loadMemberData();
    loadWeightRecords();
  }, [startAnimation]);

  const loadMemberData = async () => {
    try {
      const memberData = await getMemberById(memberId);
      setMember(memberData);
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do membro');
      navigation.goBack();
    }
  };

  const loadWeightRecords = async () => {
    if (!memberId) return;
    try {
      setLoading(true);
      const records = await getWeightRecordsByMemberId(memberId);
      setWeightRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar histórico de peso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = useCallback((text: string) => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  }, []);

  const handleDateChange = useCallback((text: string) => {
    const formatted = formatDate(text);
    setNewDate(formatted);
  }, [formatDate]);

  const handleAddWeight = async () => {
    if (!newWeight.trim() || !newDate.trim()) {
      Alert.alert('Erro', 'Peso e data são obrigatórios');
      return;
    }

    const weight = parseFloat(newWeight.replace(',', '.'));
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Erro', 'Por favor, insira um peso válido');
      return;
    }

    if (newDate.length !== 10) {
      Alert.alert('Erro', 'Por favor, insira uma data válida (DD/MM/AAAA)');
      return;
    }

    if (!member) {
      Alert.alert('Erro', 'Dados do membro não encontrados');
      return;
    }

    setSaving(true);
    try {
      await addWeightRecord({
        member_id: member.id,
        weight,
        date: newDate,
        notes: newNotes.trim() || undefined,
      });

      setNewWeight('');
      setNewDate('');
      setNewNotes('');
      setShowAddModal(false);
      await loadWeightRecords();
      
      Alert.alert('Sucesso', 'Registro de peso adicionado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao adicionar registro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = (record: WeightRecord) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este registro de peso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWeightRecord(record.id);
              await loadWeightRecords();
              Alert.alert('Sucesso', 'Registro excluído com sucesso!');
            } catch (error: any) {
              Alert.alert('Erro', 'Erro ao excluir registro: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openAddModal = () => {
    setNewDate(getCurrentDate());
    setShowAddModal(true);
  };

  const renderWeightRecord = ({ item }: { item: WeightRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordInfo}>
          <Text style={styles.weightText}>{item.weight.toFixed(1)} kg</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecord(item)}
        >
          <FontAwesome name="trash" size={16} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
      {item.notes && (
        <Text style={styles.notesText}>{item.notes}</Text>
      )}
    </View>
  );

  const getWeightTrend = () => {
    if (weightRecords.length < 2) return null;
    
    const latest = weightRecords[0].weight;
    const previous = weightRecords[1].weight;
    const difference = latest - previous;
    
    return {
      difference: Math.abs(difference),
      trend: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'stable'
    };
  };

  const renderWeightChart = () => {
    if (weightRecords.length < 2) return null;

    const chartWidth = screenWidth - 80;
    const chartHeight = 150;
    const padding = 20;
    const plotWidth = chartWidth - (padding * 2);
    const plotHeight = chartHeight - (padding * 2);

    // Ordenar registros por data para o gráfico
    const sortedRecords = [...weightRecords].sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    const weights = sortedRecords.map(r => r.weight);
    const minWeight = Math.min(...weights) - 1;
    const maxWeight = Math.max(...weights) + 1;
    const weightRange = maxWeight - minWeight;

    // Calcular pontos do gráfico
    const points = sortedRecords.map((record, index) => {
      const x = padding + (index / (sortedRecords.length - 1)) * plotWidth;
      const y = padding + ((maxWeight - record.weight) / weightRange) * plotHeight;
      return { x, y, weight: record.weight, date: record.date };
    });

    // Criar linha do gráfico
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <FontAwesome name="line-chart" size={20} color="#b081ee" />
          <Text style={styles.chartTitle}>Evolução do Peso</Text>
        </View>
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Linhas de grade horizontais */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + ratio * plotHeight;
              const weight = maxWeight - (ratio * weightRange);
              return (
                <React.Fragment key={index}>
                  <Line
                    x1={padding}
                    y1={y}
                    x2={padding + plotWidth}
                    y2={y}
                    stroke="#E9ECEF"
                    strokeWidth="1"
                  />
                  <SvgText
                    x={padding - 5}
                    y={y + 3}
                    fontSize="10"
                    fill="#8A8A8A"
                    textAnchor="end"
                  >
                    {weight.toFixed(0)}
                  </SvgText>
                </React.Fragment>
              );
            })}
            
            {/* Linha do gráfico */}
            <Polyline
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#b081ee"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Pontos do gráfico */}
            {points.map((point, index) => (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#b081ee"
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </Svg>
        </View>
        <View style={styles.chartFooter}>
          <Text style={styles.chartFooterText}>
            {sortedRecords.length} registros • {sortedRecords[0].date} a {sortedRecords[sortedRecords.length - 1].date}
          </Text>
        </View>
      </View>
    );
  };

  const weightTrend = getWeightTrend();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={20} color="#b081ee" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Acompanhamento de Peso</Text>
          <Text style={styles.headerSubtitle}>{member?.name || 'Carregando...'}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      {weightRecords.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <FontAwesome name="balance-scale" size={24} color="#b081ee" />
            <Text style={styles.summaryTitle}>Resumo</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Peso Atual</Text>
              <Text style={styles.summaryValue}>{weightRecords[0].weight.toFixed(1)} kg</Text>
            </View>
            {weightTrend && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Tendência</Text>
                <View style={styles.trendContainer}>
                  <FontAwesome 
                    name={weightTrend.trend === 'increase' ? 'arrow-up' : weightTrend.trend === 'decrease' ? 'arrow-down' : 'minus'} 
                    size={16} 
                    color={weightTrend.trend === 'increase' ? '#ff6b6b' : weightTrend.trend === 'decrease' ? '#4ecdc4' : '#8A8A8A'} 
                  />
                  <Text style={[styles.trendText, {
                    color: weightTrend.trend === 'increase' ? '#ff6b6b' : weightTrend.trend === 'decrease' ? '#4ecdc4' : '#8A8A8A'
                  }]}>
                    {weightTrend.difference.toFixed(1)} kg
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total de Registros</Text>
              <Text style={styles.summaryValue}>{weightRecords.length}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Weight Chart */}
      {renderWeightChart()}

      {/* Records List */}
      <View style={styles.recordsContainer}>
        <Text style={styles.recordsTitle}>Histórico de Peso</Text>
        {weightRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="balance-scale" size={48} color="#E9ECEF" />
            <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
            <Text style={styles.emptySubtext}>Adicione o primeiro registro de peso</Text>
          </View>
        ) : (
          <FlatList
            data={weightRecords}
            renderItem={renderWeightRecord}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recordsList}
          />
        )}
      </View>

      {/* Add Weight Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Peso</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddModal(false)}
              >
                <FontAwesome name="times" size={20} color="#8A8A8A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Peso (kg) *</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="balance-scale" size={16} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 70.5"
                    placeholderTextColor="#8A8A8A"
                    value={newWeight}
                    onChangeText={setNewWeight}
                    keyboardType="numeric"
                  />
                  <Text style={styles.unitText}>kg</Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Data *</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome name="calendar" size={16} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#8A8A8A"
                    value={newDate}
                    onChangeText={handleDateChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Observações</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <FontAwesome name="sticky-note" size={16} color="#8A8A8A" style={styles.textAreaIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Observações sobre o peso..."
                    placeholderTextColor="#8A8A8A"
                    value={newNotes}
                    onChangeText={setNewNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleAddWeight}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  chartFooterText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#b081ee',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  recordsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  recordsList: {
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  weightText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8A8A8A',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  unitText: {
    fontSize: 14,
    color: '#8A8A8A',
    fontWeight: '500',
    marginLeft: 8,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  textArea: {
    minHeight: 60,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b081ee',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b081ee',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});