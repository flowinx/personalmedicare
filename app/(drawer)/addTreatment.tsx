import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Member, getAllMembers } from '../../db/members';
import { addTreatment, getTreatmentById, updateTreatment } from '../../db/memoryStorage';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { fetchMedicationInfo } from '../../services/n8nWebhook';

const unitOptions = ['horas', 'dias', 'semanas', 'meses'];

// Opções específicas para duração e frequência
const durationUnitOptions = ['dias', 'semanas', 'meses'];
const frequencyUnitOptions = ['horas', 'dias'];

export default function AddTreatmentScreen() {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  
  console.log('[AddTreatment] Component mounted with route params:', route.params);
  
  // Extrair memberId dos parâmetros da rota
  const memberId = (route.params as any)?.memberId ? Number((route.params as any).memberId) : undefined;
  const treatmentId = (route.params as any)?.treatmentId ? Number((route.params as any).treatmentId) : undefined;
  const mode = (route.params as any)?.mode || 'add';
  const isMemberLocked = !!memberId;
  const isEditMode = mode === 'edit';
  
  console.log('[AddTreatment] Extracted memberId:', memberId);
  console.log('[AddTreatment] Extracted treatmentId:', treatmentId);
  console.log('[AddTreatment] Mode:', mode);
  console.log('[AddTreatment] isMemberLocked:', isMemberLocked);
  console.log('[AddTreatment] isEditMode:', isEditMode);

  // Atualizar título da tela baseado no modo
  useEffect(() => {
    const title = isEditMode ? 'Editar Tratamento' : 'Novo Tratamento';
    navigation.setOptions({ title });
  }, [isEditMode, navigation]);

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState('dias');
  const [isContinuousUse, setIsContinuousUse] = useState(false);
  const [notes, setNotes] = useState('');
  const [frequencyValue, setFrequencyValue] = useState('');
  const [frequencyUnit, setFrequencyUnit] = useState('horas');
  const [startDate, setStartDate] = useState(new Date());

  const [isMemberModalVisible, setMemberModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isUnitPickerVisible, setUnitPickerVisible] = useState(false);
  const [unitPickerType, setUnitPickerType] = useState<'duration' | 'frequency'>('frequency');

  const [loadingObservacao, setLoadingObservacao] = useState(false);
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  useFocusEffect(
    useCallback(() => {
      async function fetchMembers() {
        const allMembers = await getAllMembers();
        setMembers(allMembers);

        console.log('[AddTreatment] Params memberId:', memberId);
        console.log('[AddTreatment] Current selectedMemberId:', selectedMemberId);
        console.log('[AddTreatment] All members:', allMembers.map(m => ({ id: m.id, name: m.name })));

        // Prioriza sempre o memberId vindo da navegação
        if (memberId) {
          console.log('[AddTreatment] Setting memberId from params:', memberId);
          setSelectedMemberId(memberId);
        } else if (!selectedMemberId && allMembers.length > 0) {
          // Se não há memberId nos parâmetros e nenhum membro selecionado, seleciona o primeiro
          console.log('[AddTreatment] No memberId in params, selecting first member:', allMembers[0].id);
          setSelectedMemberId(allMembers[0].id || null);
        }
      }
      fetchMembers();
    }, [memberId, selectedMemberId]) // Adicionamos selectedMemberId como dependência
  );

  useFocusEffect(
    useCallback(() => {
      // Limpa todos os campos ao abrir a tela, exceto o membro selecionado
      setMedication('');
      setDosage('');
      setDurationValue('');
      setDurationUnit('dias');
      setIsContinuousUse(false);
      setNotes('');
      setFrequencyValue('');
      setFrequencyUnit('horas');
      setStartDate(new Date());
    }, [memberId]));

  // Carregar dados do tratamento para edição
  useFocusEffect(
    useCallback(() => {
      const loadTreatmentData = async () => {
        if (isEditMode && treatmentId) {
          try {
            const treatment = await getTreatmentById(treatmentId);
            if (treatment) {
              console.log('[AddTreatment] Loading treatment data:', treatment);
              
              setSelectedMemberId(treatment.member_id);
              setMedication(treatment.medication);
              setDosage(treatment.dosage);
              setFrequencyValue(treatment.frequency_value.toString());
              setFrequencyUnit(treatment.frequency_unit);
              setNotes(treatment.notes || '');
              setStartDate(new Date(treatment.start_datetime));
              
              // Processar duração
              if (treatment.duration === 'Uso Contínuo') {
                setIsContinuousUse(true);
                setDurationValue('');
                setDurationUnit('dias');
              } else {
                setIsContinuousUse(false);
                const durationParts = treatment.duration.split(' ');
                if (durationParts.length >= 2) {
                  setDurationValue(durationParts[0]);
                  setDurationUnit(durationParts[1]);
                }
              }
            }
          } catch (error) {
            console.error('[AddTreatment] Error loading treatment:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do tratamento.');
          }
        }
      };
      
      loadTreatmentData();
    }, [isEditMode, treatmentId])
  );

  const handleSaveTreatment = async () => {
    if (!selectedMemberId || !medication.trim() || !frequencyValue.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Se não for uso contínuo, verificar se a duração foi preenchida
    if (!isContinuousUse && !durationValue.trim()) {
      Alert.alert('Erro', 'Preencha a duração do tratamento.');
      return;
    }

    const freqVal = parseInt(frequencyValue, 10);

    if (isNaN(freqVal) || freqVal <= 0) {
      Alert.alert('Erro', 'Frequência deve ser um número maior que zero.');
      return;
    }

    // Se não for uso contínuo, verificar se a duração é válida
    if (!isContinuousUse) {
      const durVal = parseInt(durationValue, 10);
      if (isNaN(durVal) || durVal <= 0) {
        Alert.alert('Erro', 'Duração deve ser um número maior que zero.');
        return;
      }
    }

    try {
      const startDateTime = startDate.toISOString();
      const durationString = isContinuousUse ? 'Uso Contínuo' : `${durationValue} ${durationUnit}`;

      const treatmentData = {
        member_id: selectedMemberId,
        medication: medication.trim(),
        dosage: dosage.trim(),
        frequency_value: freqVal,
        frequency_unit: frequencyUnit,
        duration: durationString,
        notes: notes.trim(),
        start_datetime: startDateTime,
        status: 'ativo'
      };

      if (isEditMode && treatmentId) {
        await updateTreatment(treatmentId, treatmentData);
        Alert.alert('Sucesso', 'Tratamento atualizado com sucesso!');
      } else {
        await addTreatment(treatmentData);
        Alert.alert('Sucesso', 'Tratamento salvo com sucesso!');
      }

      router.back();
    } catch (error) {
      console.error('Falha ao salvar tratamento:', error);
      Alert.alert('Erro', `Não foi possível ${isEditMode ? 'atualizar' : 'salvar'} o tratamento.`);
    }
  };
  
  const handleSelectMember = (id: number) => {
    setSelectedMemberId(id);
    setMemberModalVisible(false);
  }

  const handleConfirmDate = (date: Date) => {
    const newDate = new Date(startDate);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setStartDate(newDate);
    setDatePickerVisibility(false);
  };
  
  const handleConfirmTime = (date: Date) => {
    const newDate = new Date(startDate);
    newDate.setHours(date.getHours(), date.getMinutes());
    setStartDate(newDate);
    setTimePickerVisibility(false);
  };

  const openUnitPicker = (type: 'duration' | 'frequency') => {
    setUnitPickerType(type);
    setUnitPickerVisible(true);
  };

  const handleSelectUnit = (unit: string) => {
    if (unitPickerType === 'duration') {
      setDurationUnit(unit);
    } else {
      setFrequencyUnit(unit);
    }
    setUnitPickerVisible(false);
  };

  const getUnitOptions = (type: 'duration' | 'frequency') => {
    return type === 'duration' ? durationUnitOptions : frequencyUnitOptions;
  };

  const fetchInfoMedicamento = async (nome: string) => {
    if (!nome.trim()) {
      console.log('[AddTreatment] Nome do medicamento vazio, ignorando busca');
      return;
    }
    
    console.log('[AddTreatment] Iniciando busca de informações para:', nome);
    console.log('[AddTreatment] Valor atual do notes antes da busca:', notes);
    setLoadingObservacao(true);
    
    try {
      console.log('[AddTreatment] Chamando fetchMedicationInfo...');
      const medicationInfo = await fetchMedicationInfo(nome);
      console.log('[AddTreatment] Informações recebidas:', medicationInfo);
      console.log('[AddTreatment] Tipo da resposta:', typeof medicationInfo);
      console.log('[AddTreatment] Tamanho da resposta:', medicationInfo?.length);
      console.log('[AddTreatment] Resposta é string vazia?', medicationInfo === '');
      console.log('[AddTreatment] Resposta é null/undefined?', medicationInfo == null);
      
      if (medicationInfo && medicationInfo.trim()) {
        console.log('[AddTreatment] Salvando informações no campo notes');
        console.log('[AddTreatment] Valor que será salvo:', medicationInfo);
        setNotes(medicationInfo);
        console.log('[AddTreatment] setNotes chamado com sucesso');
      } else {
        console.log('[AddTreatment] Nenhuma informação recebida ou resposta vazia');
        console.log('[AddTreatment] medicationInfo:', medicationInfo);
      }
    } catch (error) {
      console.error('[AddTreatment] Erro ao buscar informações do medicamento:', error);
      console.error('[AddTreatment] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      Alert.alert('Erro', 'Não foi possível buscar as informações do medicamento.');
    } finally {
      console.log('[AddTreatment] Finalizando busca, removendo loading');
      setLoadingObservacao(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Card - Informações do Membro */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="user" size={20} color="#b081ee" />
              <ThemedText style={styles.cardTitle}>Membro da Família</ThemedText>
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Para qual membro da família?</ThemedText>
              <TouchableOpacity style={styles.picker} onPress={() => !isMemberLocked && setMemberModalVisible(true)} disabled={isMemberLocked}>
                <FontAwesome name="user" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <ThemedText lightColor="#2d1155" darkColor="#2d1155" style={styles.pickerText}>
                  {members.find(m => m.id === selectedMemberId)?.name || 'Selecione...'}
                </ThemedText>
                {isMemberLocked ? (
                  <FontAwesome name="lock" size={16} color="#b081ee" style={{ marginLeft: 8 }} />
                ) : (
                  <FontAwesome name="chevron-down" size={16} color="#2d1155" />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Card - Informações do Medicamento */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="medkit" size={20} color="#b081ee" />
              <ThemedText style={styles.cardTitle}>Medicamento</ThemedText>
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nome do Medicamento</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="medkit" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: Amoxicilina" 
                  placeholderTextColor="#8A8A8A"
                  value={medication} 
                  onChangeText={setMedication} 
                  onBlur={() => fetchInfoMedicamento(medication)} 
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Dosagem</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="balance-scale" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: 1 comprimido de 500mg" 
                  placeholderTextColor="#8A8A8A"
                  value={dosage} 
                  onChangeText={setDosage} 
                />
              </View>
            </View>
          </Animated.View>

          {/* Card - Duração e Frequência */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="clock-o" size={20} color="#b081ee" />
              <ThemedText style={styles.cardTitle}>Duração e Frequência</ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.toggleContainer}>
                <ThemedText style={styles.label}>Tipo de Tratamento</ThemedText>
                <View style={styles.toggleRow}>
                  <TouchableOpacity 
                    style={[styles.toggleOption, !isContinuousUse && styles.toggleOptionActive]} 
                    onPress={() => setIsContinuousUse(false)}
                  >
                    <FontAwesome name="calendar" size={16} color={!isContinuousUse ? "#fff" : "#8A8A8A"} />
                    <ThemedText style={[styles.toggleText, !isContinuousUse && styles.toggleTextActive]}>
                      Duração Específica
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleOption, isContinuousUse && styles.toggleOptionActive]} 
                    onPress={() => setIsContinuousUse(true)}
                  >
                    <FontAwesome name="refresh" size={16} color={isContinuousUse ? "#fff" : "#8A8A8A"} />
                    <ThemedText style={[styles.toggleText, isContinuousUse && styles.toggleTextActive]}>
                      Uso Contínuo
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {!isContinuousUse && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Duração do Tratamento</ThemedText>
                <View style={styles.compositeInput}>
                  <View style={styles.inputWrapper}>
                    <FontAwesome 
                      name={durationUnit === 'dias' ? 'calendar' : durationUnit === 'semanas' ? 'calendar-o' : 'calendar-check-o'} 
                      size={20} 
                      color="#8A8A8A" 
                      style={styles.inputIcon} 
                    />
                    <TextInput 
                      style={[styles.input, styles.compositeInputText]} 
                      placeholder="Ex: 7" 
                      placeholderTextColor="#8A8A8A"
                      value={durationValue} 
                      onChangeText={setDurationValue} 
                      keyboardType="numeric" 
                    />
                  </View>
                  <TouchableOpacity style={styles.unitPicker} onPress={() => openUnitPicker('duration')}>
                    <FontAwesome 
                      name={durationUnit === 'dias' ? 'calendar' : durationUnit === 'semanas' ? 'calendar-o' : 'calendar-check-o'} 
                      size={16} 
                      color="#b081ee" 
                    />
                    <ThemedText lightColor="#2d1155" darkColor="#2d1155" style={styles.unitText}>{durationUnit}</ThemedText>
                    <FontAwesome name="chevron-down" size={16} color="#2d1155" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Frequência (a cada)</ThemedText>
              <View style={styles.compositeInput}>
                <View style={styles.inputWrapper}>
                  <FontAwesome 
                    name={frequencyUnit === 'horas' ? 'clock-o' : 'calendar'} 
                    size={20} 
                    color="#8A8A8A" 
                    style={styles.inputIcon} 
                  />
                  <TextInput 
                    style={[styles.input, styles.compositeInputText]} 
                    placeholder="Ex: 8" 
                    placeholderTextColor="#8A8A8A"
                    value={frequencyValue} 
                    onChangeText={setFrequencyValue} 
                    keyboardType="numeric" 
                  />
                </View>
                <TouchableOpacity style={styles.unitPicker} onPress={() => openUnitPicker('frequency')}>
                  <FontAwesome 
                    name={frequencyUnit === 'horas' ? 'clock-o' : 'calendar'} 
                    size={16} 
                    color="#b081ee" 
                  />
                  <ThemedText lightColor="#2d1155" darkColor="#2d1155" style={styles.unitText}>{frequencyUnit}</ThemedText>
                  <FontAwesome name="chevron-down" size={16} color="#2d1155" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Card - Início do Tratamento */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="calendar" size={20} color="#b081ee" />
              <ThemedText style={styles.cardTitle}>Início do Tratamento</ThemedText>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity style={styles.pickerHalf} onPress={() => setDatePickerVisibility(true)}>
                  <FontAwesome name="calendar" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <ThemedText lightColor="#2d1155" darkColor="#2d1155">{startDate.toLocaleDateString()}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerHalf} onPress={() => setTimePickerVisibility(true)}>
                  <FontAwesome name="clock-o" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <ThemedText lightColor="#2d1155" darkColor="#2d1155">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Card - Observações */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="sticky-note" size={20} color="#b081ee" />
              <ThemedText style={styles.cardTitle}>Observações</ThemedText>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <FontAwesome name="sticky-note" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                  placeholder={loadingObservacao ? "Buscando informações do medicamento... :Ex: Tomar com um copo de água..." : "Ex: Tomar com um copo de água..."} 
                  placeholderTextColor="#8A8A8A"
                  multiline 
                  value={notes} 
                  onChangeText={setNotes} 
                  editable={!loadingObservacao}
                />
                {loadingObservacao && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#b081ee" />
                    <ThemedText style={styles.loadingText}>Buscando...</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
              <ThemedText style={styles.secondaryButtonText} lightColor="#b081ee" darkColor="#b081ee">Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveTreatment}>
              <ThemedText style={styles.primaryButtonText} lightColor="#fff" darkColor="#fff">Salvar</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ThemedView>

      <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirmDate} onCancel={() => setDatePickerVisibility(false)} date={startDate} />
      <DateTimePickerModal isVisible={isTimePickerVisible} mode="time" onConfirm={handleConfirmTime} onCancel={() => setTimePickerVisibility(false)} date={startDate} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isMemberModalVisible}
        onRequestClose={() => setMemberModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMemberModalVisible(false)}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle} lightColor="#2d1155" darkColor="#2d1155">Selecione o Membro</ThemedText>
            <FlatList
              data={members}
              keyExtractor={item => item.id?.toString() || ''}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => item.id && handleSelectMember(item.id)}
                >
                  <ThemedText style={styles.modalItemText} lightColor="#2d1155" darkColor="#2d1155">{item.name}</ThemedText>
                  {selectedMemberId === item.id && <FontAwesome name="check" size={16} color="#b081ee" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal animationType="slide" transparent visible={isUnitPickerVisible} onRequestClose={() => setUnitPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setUnitPickerVisible(false)}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {unitPickerType === 'duration' ? 'Duração do Tratamento' : 'Frequência'}
            </ThemedText>
            <FlatList
              data={getUnitOptions(unitPickerType)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => handleSelectUnit(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    <FontAwesome 
                      name={item === 'horas' ? 'clock-o' : item === 'dias' ? 'calendar' : item === 'semanas' ? 'calendar-o' : 'calendar-check-o'} 
                      size={20} 
                      color="#b081ee" 
                      style={styles.modalItemIcon}
                    />
                    <ThemedText style={styles.modalItemText}>{item}</ThemedText>
                  </View>
                  {(unitPickerType === 'duration' ? durationUnit : frequencyUnit) === item && (
                    <FontAwesome name="check" size={16} color="#b081ee" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2d1155',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2d1155',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 8,
  },
  primaryButton: {
      backgroundColor: '#b081ee',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
      shadowColor: '#b081ee',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  primaryButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  secondaryButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      flex: 1,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: '#b081ee',
      shadowColor: '#b081ee',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
  },
  secondaryButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  memberItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberItemText: {
    fontSize: 16,
  },
  compositeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    width: '100%', // Ocupa toda a largura do input
    alignSelf: 'stretch',
    backgroundColor: '#fff',
  },
  compositeInputText: {
    flex: 7, // 70%
    borderWidth: 0,
    minWidth: 0,
  },
  unitPicker: {
    flex: 3, // 30%
    paddingHorizontal: 15,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    minWidth: 0,
    maxWidth: 120,
  },
  unitText: {
    fontWeight: '500',
    marginHorizontal: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    marginHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemIcon: {
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#2d1155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    minWidth: 100, // Largura mínima para o campo de texto
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  pickerText: {
    flex: 1,
  },
  toggleContainer: {
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toggleOptionActive: {
    backgroundColor: '#b081ee',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  toggleTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#b081ee',
  },
}); 