import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnimatedCard } from '../../components/AnimatedCard';
import { addTreatment, getAllMembers, getTreatmentById, updateTreatment } from '../../db/index';
import { Member } from '../../types';
import { useEntranceAnimation } from '../../utils/animations';

interface TreatmentFormData {
  member_id: string;
  medication: string;
  dosage: string;
  frequency_value: number;
  frequency_unit: string;
  duration: string;
  notes: string;
  start_datetime: string;
  status: string;
}

export default function AddTreatmentScreen() {
  const route = useRoute();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

  // Form data
  const [formData, setFormData] = useState<TreatmentFormData>({
    member_id: '',
    medication: '',
    dosage: '',
    frequency_value: 1,
    frequency_unit: 'horas',
    duration: '7 dias',
    notes: '',
    start_datetime: new Date().toISOString(),
    status: 'ativo'
  });

  // Estado local para o valor de frequência como string
  const [frequencyValueText, setFrequencyValueText] = useState('1');

  // Animações
  const { startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // Sincronizar o estado local de frequência com formData
  useEffect(() => {
    setFrequencyValueText(formData.frequency_value.toString());
  }, [formData.frequency_value]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const allMembers = await getAllMembers();
    setMembers(allMembers);

    // Prioriza sempre o memberId vindo da navegação
    const memberId = (route.params as any)?.memberId ? String((route.params as any).memberId) : undefined;
    if (memberId) {
      setFormData(prev => ({ ...prev, member_id: memberId }));
    } else if (!formData.member_id && allMembers.length > 0) {
      // Se não há memberId nos parâmetros e nenhum membro selecionado, seleciona o primeiro
      setFormData(prev => ({ ...prev, member_id: allMembers[0].id || '' }));
    }
  };

  // Carregar dados do tratamento para edição
  useEffect(() => {
    const loadTreatmentData = async () => {
      const isEditMode = (route.params as any)?.mode === 'edit';
      const treatmentId = (route.params as any)?.treatmentId ? String((route.params as any).treatmentId) : undefined;

      if (isEditMode && treatmentId) {
        try {
          const treatment = await getTreatmentById(treatmentId);
          if (treatment) {
            setFormData(prev => ({ 
              ...prev, 
              member_id: treatment.member_id, 
              medication: treatment.medication, 
              dosage: treatment.dosage, 
              frequency_value: treatment.frequency_value, 
              frequency_unit: treatment.frequency_unit, 
              duration: treatment.duration, 
              notes: treatment.notes || '', 
              start_datetime: treatment.start_datetime 
            }));
            setSelectedDate(new Date(treatment.start_datetime));
            setSelectedTime(new Date(treatment.start_datetime));
          }
        } catch (error) {
          console.error('[AddTreatment] Error loading treatment:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do tratamento.');
        }
      }
    };
    
    loadTreatmentData();
  }, [route.params]);

  const handleSaveTreatment = async () => {
    if (!formData.member_id || !formData.medication.trim() || !formData.frequency_value) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!formData.duration.trim()) {
      Alert.alert('Erro', 'Preencha a duração do tratamento.');
      return;
    }

    const freqVal = parseInt(formData.frequency_value.toString(), 10);

    if (isNaN(freqVal) || freqVal <= 0) {
      Alert.alert('Erro', 'Frequência deve ser um número maior que zero.');
      return;
    }

    if (formData.duration !== 'Uso Contínuo') {
      const durVal = parseInt(formData.duration.split(' ')[0], 10);
      if (isNaN(durVal) || durVal <= 0) {
        Alert.alert('Erro', 'Duração deve ser um número maior que zero.');
        return;
      }
    }

    try {
      const startDateTime = selectedDate.toISOString();
      const durationString = formData.duration;

      const treatmentData = {
        member_id: formData.member_id,
        medication: formData.medication.trim(),
        dosage: formData.dosage.trim(),
        frequency_value: freqVal,
        frequency_unit: formData.frequency_unit,
        duration: durationString,
        notes: formData.notes.trim(),
        start_datetime: startDateTime,
        status: 'ativo'
      };

      const isEditMode = (route.params as any)?.mode === 'edit';
      const treatmentId = (route.params as any)?.treatmentId ? String((route.params as any).treatmentId) : undefined;

      if (isEditMode && treatmentId) {
        await updateTreatment(treatmentId, treatmentData);
        Alert.alert('Sucesso', 'Tratamento atualizado com sucesso!');
      } else {
        await addTreatment(treatmentData);
        Alert.alert('Sucesso', 'Tratamento adicionado com sucesso!');
      }

      router.back();
    } catch (error) {
      console.error('Falha ao salvar tratamento:', error);
      const isEditMode = (route.params as any)?.mode === 'edit';
      Alert.alert('Erro', `Não foi possível ${isEditMode ? 'atualizar' : 'salvar'} o tratamento.`);
    }
  };
  
  const handleSelectMember = (id: string) => {
    setFormData(prev => ({ ...prev, member_id: id }));
    setShowMemberPicker(false);
  }

  const handleConfirmDate = (event: any, date: Date | undefined) => {
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setShowDatePicker(false);
    }
  };
  
  const handleConfirmTime = (event: any, date: Date | undefined) => {
    if (event.type === 'set' && date) {
      setSelectedTime(date);
      setShowTimePicker(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Card - Membro */}
        <AnimatedCard delay={100} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Membro *</Text>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowMemberPicker(true)}
            >
              <FontAwesome name="user" size={20} color="#8A8A8A" style={styles.inputIcon} />
              <Text style={styles.input}>
                {members.find(m => m.id === formData.member_id)?.name || 'Selecione um membro'}
              </Text>
              <FontAwesome name="chevron-down" size={16} color="#8A8A8A" />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Card - Medicamento */}
        <AnimatedCard delay={200} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do Medicamento *</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="medkit" size={20} color="#8A8A8A" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Paracetamol, Ibuprofeno..."
                placeholderTextColor="#8A8A8A"
                value={formData.medication} 
                onChangeText={text => setFormData(prev => ({ ...prev, medication: text }))} 
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dosagem</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="medkit" size={20} color="#8A8A8A" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 500mg, 1 comprimido..."
                placeholderTextColor="#8A8A8A"
                value={formData.dosage} 
                onChangeText={text => setFormData(prev => ({ ...prev, dosage: text }))} 
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Card - Frequência */}
        <AnimatedCard delay={300} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Frequência (a cada) *</Text>
            <View style={styles.compositeInput}>
              <View style={styles.compositeInputWrapper}>
                <FontAwesome name="clock-o" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#8A8A8A"
                  keyboardType="numeric"
                  value={frequencyValueText}
                  onChangeText={text => {
                    setFrequencyValueText(text);
                    const numValue = parseInt(text, 10);
                    if (!isNaN(numValue) && numValue > 0) {
                      setFormData(prev => ({ ...prev, frequency_value: numValue }));
                    } else if (text === '') {
                      setFormData(prev => ({ ...prev, frequency_value: 0 }));
                    }
                  }}
                />
              </View>
              <TouchableOpacity 
                style={styles.unitButton}
                onPress={() => setShowFrequencyDropdown(true)}
              >
                <Text style={styles.unitText}>{formData.frequency_unit}</Text>
                <FontAwesome name="chevron-down" size={14} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {/* Card - Duração */}
        <AnimatedCard delay={400} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duração *</Text>
            <View style={styles.compositeInput}>
              <View style={styles.compositeInputWrapper}>
                <FontAwesome name="calendar" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="7"
                  placeholderTextColor="#8A8A8A"
                  keyboardType="numeric"
                  value={formData.duration && formData.duration.includes(' ') ? formData.duration.split(' ')[0] : ''} 
                  onChangeText={text => {
                    const unit = formData.duration && formData.duration.includes(' ') ? formData.duration.split(' ')[1] : 'dias';
                    setFormData(prev => ({ ...prev, duration: text ? `${text} ${unit}` : '' }));
                  }} 
                />
              </View>
              <TouchableOpacity 
                style={styles.unitButton}
                onPress={() => setShowDurationDropdown(true)}
              >
                <Text style={styles.unitText}>
                  {formData.duration && formData.duration.includes(' ') ? formData.duration.split(' ')[1] : 'dias'}
                </Text>
                <FontAwesome name="chevron-down" size={14} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {/* Card - Início do Tratamento */}
        <AnimatedCard delay={500} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Início do Tratamento</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <Text style={styles.input}>
                  {selectedDate.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <FontAwesome name="clock-o" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <Text style={styles.input}>
                  {selectedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {/* Card - Observações */}
        <AnimatedCard delay={600} style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Observações</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <FontAwesome name="sticky-note" size={20} color="#8A8A8A" style={styles.textAreaIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Tomar com um copo de água..." 
                placeholderTextColor="#8A8A8A"
                multiline 
                numberOfLines={3}
                textAlignVertical="top"
                value={formData.notes} 
                onChangeText={text => setFormData(prev => ({ ...prev, notes: text }))} 
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTreatment}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal - Seleção de Membro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMemberPicker}
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMemberPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Membro</Text>
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.modalItem}
                onPress={() => handleSelectMember(member.id || '')}
              >
                <Text style={styles.modalItemText}>{member.name}</Text>
                {formData.member_id === member.id && <FontAwesome name="check" size={16} color="#b081ee" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal - Unidade de Frequência */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFrequencyDropdown}
        onRequestClose={() => setShowFrequencyDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFrequencyDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Unidade</Text>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData(prev => ({ ...prev, frequency_unit: 'horas' }));
                setShowFrequencyDropdown(false);
              }}
            >
              <Text style={styles.modalItemText}>horas</Text>
              {formData.frequency_unit === 'horas' && <FontAwesome name="check" size={16} color="#b081ee" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData(prev => ({ ...prev, frequency_unit: 'dias' }));
                setShowFrequencyDropdown(false);
              }}
            >
              <Text style={styles.modalItemText}>dias</Text>
              {formData.frequency_unit === 'dias' && <FontAwesome name="check" size={16} color="#b081ee" />}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal - Unidade de Duração */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDurationDropdown}
        onRequestClose={() => setShowDurationDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDurationDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Unidade</Text>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                const currentValue = formData.duration && formData.duration.includes(' ') ? formData.duration.split(' ')[0] : '7';
                setFormData(prev => ({ ...prev, duration: `${currentValue} dias` }));
                setShowDurationDropdown(false);
              }}
            >
              <Text style={styles.modalItemText}>dias</Text>
              {formData.duration.includes('dias') && <FontAwesome name="check" size={16} color="#b081ee" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                const currentValue = formData.duration && formData.duration.includes(' ') ? formData.duration.split(' ')[0] : '7';
                setFormData(prev => ({ ...prev, duration: `${currentValue} semanas` }));
                setShowDurationDropdown(false);
              }}
            >
              <Text style={styles.modalItemText}>semanas</Text>
              {formData.duration.includes('semanas') && <FontAwesome name="check" size={16} color="#b081ee" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                const currentValue = formData.duration && formData.duration.includes(' ') ? formData.duration.split(' ')[0] : '7';
                setFormData(prev => ({ ...prev, duration: `${currentValue} meses` }));
                setShowDurationDropdown(false);
              }}
            >
              <Text style={styles.modalItemText}>meses</Text>
              {formData.duration.includes('meses') && <FontAwesome name="check" size={16} color="#b081ee" />}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* DateTimePicker */}
      {showDatePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Data</Text>
              <View style={styles.dateTimePickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  locale="pt-BR"
                  onChange={handleConfirmDate}
                  style={Platform.OS === 'ios' ? { width: '100%', height: 200 } : { width: '100%' }}
                  textColor="#2d1155"
                  accentColor="#b081ee"
                />
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#E0E0E0' }]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#666666' }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#b081ee' }]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
      
      {showTimePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Hora</Text>
              <View style={styles.dateTimePickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  locale="pt-BR"
                  onChange={handleConfirmTime}
                  style={Platform.OS === 'ios' ? { width: '100%', height: 200 } : { width: '100%' }}
                  textColor="#2d1155"
                  accentColor="#b081ee"
                />
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#E0E0E0' }]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#666666' }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#b081ee' }]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    marginBottom: 25,
    padding: 0,
  },
  inputContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  compositeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    flex: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginRight: 12,
  },
  compositeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
    maxWidth: 100,
    flex: 0.3,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d1155',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flex: 1,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 40,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#b081ee',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#b081ee',
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 300,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2d1155',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
    gap: 15,
  },
  modalButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    flex: 1,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateTimePickerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
}); 