import { getDatabase } from '@/db';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
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
import { Config } from '../../constants/Config';
import { Member, getAllMembers } from '../../db/members';
import { useThemeColor } from '../../hooks/useThemeColor';

const unitOptions = ['horas', 'dias', 'semanas', 'meses'];

export default function AddTreatmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState('dias');
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

  useFocusEffect(
    useCallback(() => {
      async function fetchMembers() {
        const allMembers = await getAllMembers();
        setMembers(allMembers);
  
        // Se um membro já estava selecionado, tenta manter a seleção
        const stillExists = allMembers.some(m => m.id === selectedMemberId);
        if (params.memberId && !selectedMemberId) { // Prioriza ID vindo da navegação
          setSelectedMemberId(Number(params.memberId));
        } else if (!stillExists && allMembers.length > 0) { // Se o antigo não existe mais, seleciona o primeiro
          setSelectedMemberId(allMembers[0].id || null);
        } else if (!selectedMemberId && allMembers.length > 0) { // Se nenhum estiver selecionado, seleciona o primeiro
          setSelectedMemberId(allMembers[0].id || null)
        }
      }
      fetchMembers();
    }, [params.memberId]) // Mantemos a dependência para caso venha da tela de detalhes
  );

  useFocusEffect(
    useCallback(() => {
      // Limpa todos os campos ao abrir a tela, exceto o membro selecionado
      setMedication('');
      setDosage('');
      setDurationValue('');
      setDurationUnit('dias');
      setNotes('');
      setFrequencyValue('');
      setFrequencyUnit('horas');
      setStartDate(new Date());
    }, [params.memberId]));

  const handleSaveTreatment = async () => {
    if (!selectedMemberId || !medication.trim() || !durationValue.trim() || !frequencyValue.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const freqVal = parseInt(frequencyValue, 10);
    const durVal = parseInt(durationValue, 10);

    if (isNaN(freqVal) || isNaN(durVal) || freqVal <= 0 || durVal <= 0) {
      Alert.alert('Erro', 'Frequência e Duração devem ser números maiores que zero.');
      return;
    }

    try {
      const db = await getDatabase();
      const startDateTime = startDate.toISOString();
      const durationString = `${durVal} ${durationUnit}`;

      const result = await db.runAsync(
        'INSERT INTO treatments (member_id, medication, dosage, frequency_value, frequency_unit, duration, notes, start_datetime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [selectedMemberId, medication, dosage, freqVal, frequencyUnit, durationString, notes, startDateTime, 'ativo']
      );
      
      const treatmentId = result.lastInsertRowId;
      if (!treatmentId) throw new Error("Falha ao obter o ID do tratamento");

      let scheduledDoses = [];
      let currentDoseTime = new Date(startDate);
      
      const treatmentEndDate = new Date(startDate);
      if (durationUnit === 'dias') {
        treatmentEndDate.setDate(treatmentEndDate.getDate() + durVal);
      } else if (durationUnit === 'semanas') {
        treatmentEndDate.setDate(treatmentEndDate.getDate() + durVal * 7);
      } else if (durationUnit === 'meses') {
        treatmentEndDate.setMonth(treatmentEndDate.getMonth() + durVal);
      }

      // Adicione um limite para evitar loops infinitos
      const MAX_DOSES = 1000;
      while (currentDoseTime <= treatmentEndDate && scheduledDoses.length < MAX_DOSES) {
        scheduledDoses.push(new Date(currentDoseTime));
        
        if (frequencyUnit === 'horas') currentDoseTime.setHours(currentDoseTime.getHours() + freqVal);
        else if (frequencyUnit === 'dias') currentDoseTime.setDate(currentDoseTime.getDate() + freqVal);
        else if (frequencyUnit === 'semanas') currentDoseTime.setDate(currentDoseTime.getDate() + freqVal * 7);
        else if (frequencyUnit === 'meses') currentDoseTime.setMonth(currentDoseTime.getMonth() + freqVal);
        else break; // Safety break
      }

      const schedulePromises = scheduledDoses.map(doseTime => 
        db.runAsync(
            'INSERT INTO schedule (treatment_id, scheduled_time, status) VALUES (?, ?, ?)',
            treatmentId, doseTime.toISOString(), 'pendente'
        )
      );
      await Promise.all(schedulePromises);

      // Agendar notificações para cada dose
      const memberName = members.find(m => m.id === selectedMemberId)?.name || '...';
      for (const doseTime of scheduledDoses) {
        // Não agendar notificações para doses que já passaram
        if (doseTime > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💊 Hora do Medicamento!",
              body: `Está na hora de tomar ${medication} para ${memberName}.`,
              data: { treatmentId },
            },
            trigger: {
              hour: doseTime.getHours(),
              minute: doseTime.getMinutes(),
              repeats: false,
            } as any,
          });
        }
      }

      Alert.alert('Sucesso', 'Tratamento e notificações agendados!');
      router.back();
    } catch (error) {
      console.error('Falha ao salvar tratamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o tratamento e a agenda.');
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
  }

  const handleSelectUnit = (unit: string) => {
    if (unitPickerType === 'duration') setDurationUnit(unit);
    else setFrequencyUnit(unit);
    setUnitPickerVisible(false);
  }

  const fetchInfoMedicamento = async (nome: string) => {
    if (!nome.trim()) return;
    setLoadingObservacao(true);
    try {
      console.log('[AddTreatment] Valor da GROQ_API_KEY:', Config.GROQ_API_KEY);
      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Config.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Forneça um resumo muito curto e direto sobre o medicamento "${nome}". Inclua para que serve e um aviso principal, se houver. Use frases curtas, emojis para ilustrar e evite qualquer formatação markdown (como ** ou *).` }],
          model: 'llama3-8b-8192'
        })
      });
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setNotes(data.choices[0].message.content);
      }
    } catch (error) {
      console.error("Erro ao buscar informações do medicamento:", error);
      Alert.alert("Erro", "Não foi possível buscar as informações do medicamento.");
    } finally {
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
          <ThemedText style={styles.title}>Novo Tratamento</ThemedText>
          {/* Seletor de Membro */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Para qual membro da família?</ThemedText>
            <TouchableOpacity style={styles.picker} onPress={() => setMemberModalVisible(true)}>
              <ThemedText lightColor="#2d1155" darkColor="#2d1155">{members.find(m => m.id === selectedMemberId)?.name || 'Selecione...'}</ThemedText>
              <FontAwesome name="chevron-down" size={16} color="#2d1155" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nome do Medicamento</ThemedText>
            <TextInput style={styles.input} placeholder="Ex: Amoxicilina" value={medication} onChangeText={setMedication} onBlur={() => fetchInfoMedicamento(medication)} />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Dosagem</ThemedText>
            <TextInput style={styles.input} placeholder="Ex: 1 comprimido de 500mg" value={dosage} onChangeText={setDosage} />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Duração do Tratamento</ThemedText>
            <View style={styles.compositeInput}>
              <TextInput style={[styles.input, styles.compositeInputText]} placeholder="Ex: 7" value={durationValue} onChangeText={setDurationValue} keyboardType="numeric" />
              <TouchableOpacity style={styles.unitPicker} onPress={() => openUnitPicker('duration')}>
                <ThemedText lightColor="#2d1155" darkColor="#2d1155">{durationUnit}</ThemedText>
                <FontAwesome name="chevron-down" size={16} color="#2d1155" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Frequência (a cada)</ThemedText>
            <View style={styles.compositeInput}>
              <TextInput style={[styles.input, styles.compositeInputText]} placeholder="Ex: 8" value={frequencyValue} onChangeText={setFrequencyValue} keyboardType="numeric" />
              <TouchableOpacity style={styles.unitPicker} onPress={() => openUnitPicker('frequency')}>
                <ThemedText lightColor="#2d1155" darkColor="#2d1155">{frequencyUnit}</ThemedText>
                <FontAwesome name="chevron-down" size={16} color="#2d1155" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Início do Tratamento</ThemedText>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity style={styles.pickerHalf} onPress={() => setDatePickerVisibility(true)}>
                <ThemedText lightColor="#2d1155" darkColor="#2d1155">{startDate.toLocaleDateString()}</ThemedText>
                <FontAwesome name="calendar" size={16} color={useThemeColor({}, 'icon')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerHalf} onPress={() => setTimePickerVisibility(true)}>
                <ThemedText lightColor="#2d1155" darkColor="#2d1155">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
                <FontAwesome name="clock-o" size={16} color={useThemeColor({}, 'icon')} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Observações</ThemedText>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Ex: Tomar com um copo de água..." multiline value={notes} onChangeText={setNotes} />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                <ThemedText style={styles.secondaryButtonText} lightColor="#b081ee" darkColor="#b081ee">Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveTreatment}>
                <ThemedText style={styles.primaryButtonText} lightColor="#fff" darkColor="#fff">Salvar</ThemedText>
            </TouchableOpacity>
          </View>
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
            <ThemedText style={styles.modalTitle}>Selecione a Unidade</ThemedText>
            <FlatList
              data={unitOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectUnit(item)}>
                  <ThemedText style={styles.modalItemText}>{item}</ThemedText>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  primaryButton: {
      backgroundColor: '#b081ee',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      flex: 1,
      marginLeft: 10,
  },
  primaryButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  secondaryButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#b081ee'
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
  },
  compositeInputText: {
    flex: 1,
    borderWidth: 0,
  },
  unitPicker: {
    paddingHorizontal: 15,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
    backgroundColor: '#F5F5F5',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerHalf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  modalItemText: {
    fontSize: 16,
  },
}); 