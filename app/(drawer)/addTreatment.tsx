import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addTreatment, getAllMembers, getTreatmentById, updateTreatment } from '../../db/index';
import { Member } from '../../types';
import { useEntranceAnimation } from '../../utils/animations';

const { width } = Dimensions.get('window');

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

const frequencyOptions = [
  { value: 'horas', label: 'Horas', icon: 'clock-o' as const },
  { value: 'dias', label: 'Dias', icon: 'calendar' as const },
  { value: 'semanas', label: 'Semanas', icon: 'calendar' as const },
  { value: 'meses', label: 'Meses', icon: 'calendar' as const }
];

const durationOptions = [
  { value: 'Uso Contínuo', label: 'Uso Contínuo', icon: 'refresh' as const, color: '#10B981' },
  { value: 'personalizado', label: 'Personalizado', icon: 'edit' as const, color: '#6B7280' },
  { value: '7 dias', label: '7 dias', icon: 'calendar' as const, color: '#3B82F6' },
  { value: '14 dias', label: '14 dias', icon: 'calendar' as const, color: '#3B82F6' },
  { value: '30 dias', label: '30 dias', icon: 'calendar' as const, color: '#3B82F6' },
  { value: '60 dias', label: '60 dias', icon: 'calendar' as const, color: '#3B82F6' },
  { value: '90 dias', label: '90 dias', icon: 'calendar' as const, color: '#3B82F6' }
];

export default function AddTreatmentScreen() {
  const route = useRoute();
  const router = useRouter();
  const navigation = useNavigation();
  const [members, setMembers] = useState<Member[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [isContinuousUse, setIsContinuousUse] = useState(false);
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState('dias');


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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    startAnimation();
    // Animações de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
            const isContinuous = treatment.duration === 'Uso Contínuo';
            setIsContinuousUse(isContinuous);
            
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
    // Validação dos campos obrigatórios
    if (!formData.member_id || !formData.medication.trim() || !formData.frequency_value) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Validação da duração
    if (!formData.duration.trim()) {
      Alert.alert('Erro', 'Preencha a duração do tratamento.');
      return;
    }

    const freqVal = parseInt(formData.frequency_value.toString(), 10);

    if (isNaN(freqVal) || freqVal <= 0) {
      Alert.alert('Erro', 'Frequência deve ser um número maior que zero.');
      return;
    }

    // Validação específica para uso contínuo
    const isContinuous = formData.duration === 'Uso Contínuo';
    
    if (!isContinuous) {
      // Para durações com período definido, validar se é um número válido
      const durVal = parseInt(formData.duration.split(' ')[0], 10);
      if (isNaN(durVal) || durVal <= 0) {
        Alert.alert('Erro', 'Duração deve ser um número maior que zero.');
        return;
      }
    }

    try {
      const startDateTime = selectedDate.toISOString();
      
      // Garantir que a duração seja salva corretamente
      const durationString = isContinuous ? 'Uso Contínuo' : formData.duration;

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
    // No iOS, só atualizar o estado, não fechar o modal
    if (Platform.OS === 'ios') {
      if (date) {
        setSelectedDate(date);
      }
    } else {
      // No Android, fechar automaticamente
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        setShowDatePicker(false);
      }
    }
  };
  
  const handleConfirmTime = (event: any, date: Date | undefined) => {
    // No iOS, só atualizar o estado, não fechar o modal
    if (Platform.OS === 'ios') {
      if (date) {
        setSelectedTime(date);
      }
    } else {
      // No Android, fechar automaticamente
      if (event.type === 'set' && date) {
        setSelectedTime(date);
        setShowTimePicker(false);
      }
    }
  };

  const handleDurationSelect = (duration: string) => {
    const isContinuous = duration === 'Uso Contínuo';
    
    // Atualizar o estado de uso contínuo
    setIsContinuousUse(isContinuous);
    
    if (isContinuous) {
      // Para uso contínuo, definir duração como "Uso Contínuo"
      setFormData(prev => ({ ...prev, duration: 'Uso Contínuo' }));
    } else {
      // Para duração definida, usar o valor atual do campo
      const finalDuration = durationValue ? `${durationValue} ${durationUnit}` : duration;
      setFormData(prev => ({ ...prev, duration: finalDuration }));
    }
    
    // Fechar o modal
    setShowDurationDropdown(false);
    
    // Log para debug
    console.log('[AddTreatment] Duração selecionada:', duration, 'Uso contínuo:', isContinuous);
  };

  const handleFrequencySelect = (unit: string) => {
    setFormData(prev => ({ ...prev, frequency_unit: unit }));
    setShowFrequencyDropdown(false);
  };

  const handleDurationChange = (value: string) => {
    setDurationValue(value);
    if (value && !isContinuousUse) {
      const finalDuration = `${value} ${durationUnit}`;
      setFormData(prev => ({ ...prev, duration: finalDuration }));
    }
  };

  const handleDurationUnitChange = (unit: string) => {
    setDurationUnit(unit);
    if (durationValue && !isContinuousUse) {
      const finalDuration = `${durationValue} ${unit}`;
      setFormData(prev => ({ ...prev, duration: finalDuration }));
    }
  };

  const handleContinuousUseToggle = () => {
    const newContinuousUse = !isContinuousUse;
    setIsContinuousUse(newContinuousUse);
    
    if (newContinuousUse) {
      setFormData(prev => ({ ...prev, duration: 'Uso Contínuo' }));
    } else {
      const finalDuration = durationValue ? `${durationValue} ${durationUnit}` : '7 dias';
      setFormData(prev => ({ ...prev, duration: finalDuration }));
    }
  };

  const handleMedicationInfo = () => {
    console.log('[AddTreatment] Função handleMedicationInfo chamada');
    
    if (!formData.medication.trim()) {
      Alert.alert('Erro', 'Digite o nome do medicamento primeiro.');
      return;
    }

    console.log('[AddTreatment] Navegando para detalhes do medicamento:', formData.medication.trim());
    console.log('[AddTreatment] Navigation object:', navigation);
    
    // Tentar com navigation.navigate com type assertion
    try {
      (navigation as any).navigate('Detalhes do Medicamento', { 
        medicationName: formData.medication.trim() 
      });
      console.log('[AddTreatment] Navegação executada com sucesso');
    } catch (error) {
      console.error('[AddTreatment] Erro na navegação:', error);
      Alert.alert('Erro', 'Não foi possível abrir os detalhes do medicamento.');
    }
    
    // Log adicional para debug
    console.log('[AddTreatment] Tentativa de navegação concluída');
  };

  const selectedMember = members.find(m => m.id === formData.member_id);
  const selectedDuration = durationOptions.find(d => d.value === formData.duration);
  const selectedFrequency = frequencyOptions.find(f => f.value === formData.frequency_unit);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Card - Membro */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="user" size={20} color="#b081ee" />
              <Text style={styles.cardTitle}>Membro da Família</Text>
            </View>
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowMemberPicker(true)}
              activeOpacity={0.7}
            >
              {selectedMember ? (
                <View style={styles.selectedMember}>
                  <View style={styles.memberAvatar}>
                    <FontAwesome name="user" size={16} color="#fff" />
                  </View>
                  <Text style={styles.memberName}>{selectedMember.name}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Selecione um membro</Text>
              )}
              <FontAwesome name="chevron-down" size={16} color="#8A8A8A" />
            </TouchableOpacity>
          </View>

          {/* Card - Medicamento */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="medkit" size={20} color="#b081ee" />
              <Text style={styles.cardTitle}>Medicamento</Text>
            </View>
            <View style={styles.medicationInputContainer}>
              <TextInput
                style={styles.medicationInput}
                placeholder="Nome do medicamento"
                placeholderTextColor="#8A8A8A"
                value={formData.medication}
                onChangeText={(text) => setFormData(prev => ({ ...prev, medication: text }))}
              />
              {formData.medication.trim() && (
                <TouchableOpacity 
                  style={styles.infoButton}
                  onPress={handleMedicationInfo}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="info-circle" size={20} color="#b081ee" />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Dosagem (ex: 1 comprimido, 10ml)"
              placeholderTextColor="#8A8A8A"
              value={formData.dosage}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
            />
          </View>

          {/* Card - Frequência */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="clock-o" size={20} color="#b081ee" />
              <Text style={styles.cardTitle}>Frequência</Text>
            </View>
            <View style={styles.frequencyContainer}>
              <TextInput
                style={styles.frequencyInput}
                placeholder="1"
                placeholderTextColor="#8A8A8A"
                value={frequencyValueText}
                onChangeText={(text) => {
                  setFrequencyValueText(text);
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num > 0) {
                    setFormData(prev => ({ ...prev, frequency_value: num }));
                  }
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={styles.frequencyPicker}
                onPress={() => setShowFrequencyDropdown(true)}
                activeOpacity={0.7}
              >
                <FontAwesome name={selectedFrequency?.icon || 'clock-o'} size={16} color="#b081ee" />
                <Text style={styles.frequencyText}>{selectedFrequency?.label}</Text>
                <FontAwesome name="chevron-down" size={12} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card - Duração */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="calendar" size={20} color="#b081ee" />
              <Text style={styles.cardTitle}>Duração do Tratamento</Text>
            </View>
            
            {/* Abas de duração */}
            <View style={styles.durationTabs}>
              <TouchableOpacity 
                style={[
                  styles.durationTab,
                  !isContinuousUse && styles.durationTabActive
                ]}
                onPress={() => setIsContinuousUse(false)}
                activeOpacity={0.7}
              >
                <FontAwesome name="calendar" size={16} color={!isContinuousUse ? '#b081ee' : '#8A8A8A'} />
                <Text style={[styles.durationTabText, !isContinuousUse && styles.durationTabTextActive]}>
                  Duração Definida
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.durationTab,
                  isContinuousUse && styles.durationTabActive
                ]}
                onPress={() => setIsContinuousUse(true)}
                activeOpacity={0.7}
              >
                <FontAwesome name="refresh" size={16} color={isContinuousUse ? '#10B981' : '#8A8A8A'} />
                <Text style={[styles.durationTabText, isContinuousUse && styles.durationTabTextActive]}>
                  Uso Contínuo
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Conteúdo baseado na aba selecionada */}
            {isContinuousUse ? (
              <View style={styles.continuousUseContainer}>
                <View style={styles.continuousUseContent}>
                  <FontAwesome name="refresh" size={20} color="#10B981" />
                  <Text style={styles.continuousUseText}>
                    Este medicamento será usado continuamente sem data de término
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.durationInputContainer}>
                <View style={styles.durationInputRow}>
                  <TextInput
                    style={styles.durationValueInput}
                    placeholder="5"
                    placeholderTextColor="#8A8A8A"
                    value={durationValue}
                    onChangeText={handleDurationChange}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.durationUnitPicker}
                    onPress={() => setShowFrequencyDropdown(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.durationUnitText}>{durationUnit}</Text>
                    <FontAwesome name="chevron-down" size={12} color="#8A8A8A" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.durationHint}>
                  Digite qualquer valor para a duração do tratamento
                </Text>
              </View>
            )}
          </View>

          {/* Card - Data e Hora de Início */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="calendar-plus-o" size={20} color="#b081ee" />
              <Text style={styles.cardTitle}>Data e Hora de Início</Text>
            </View>
            <View style={styles.datetimeContainer}>
              <TouchableOpacity 
                style={styles.datetimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <FontAwesome name="calendar" size={16} color="#b081ee" />
                <Text style={styles.datetimeText}>
                  {selectedDate.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datetimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <FontAwesome name="clock-o" size={16} color="#b081ee" />
                <Text style={styles.datetimeText}>
                  {selectedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card - Observações */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="sticky-note-o" size={20} color="#b081ee" />
              <Text style={styles.cardTitle}>Observações</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações adicionais sobre o tratamento..."
              placeholderTextColor="#8A8A8A"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveTreatment}
            activeOpacity={0.8}
          >
            <View style={styles.saveButtonGradient}>
              <FontAwesome name="save" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>
                {(route.params as any)?.mode === 'edit' ? 'Atualizar' : 'Salvar'} Tratamento
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Modal - Seleção de Membro */}
      <Modal
        animationType="slide"
        transparent
        visible={showMemberPicker}
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMemberPicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Membro</Text>
              <TouchableOpacity onPress={() => setShowMemberPicker(false)}>
                <FontAwesome name="times" size={20} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberOption}
                  onPress={() => handleSelectMember(member.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberAvatar}>
                    <FontAwesome name="user" size={16} color="#fff" />
                  </View>
                  <Text style={styles.memberOptionText}>{member.name}</Text>
                  {formData.member_id === member.id && (
                    <FontAwesome name="check" size={16} color="#b081ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Modal - Seleção de Duração */}
      <Modal
        animationType="slide"
        transparent
        visible={showDurationDropdown}
        onRequestClose={() => setShowDurationDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDurationDropdown(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Duração do Tratamento</Text>
              <TouchableOpacity onPress={() => setShowDurationDropdown(false)}>
                <FontAwesome name="times" size={20} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.durationOption}
                  onPress={() => handleDurationSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <FontAwesome name={option.icon} size={18} color={option.color} />
                  <Text style={[styles.durationOptionText, { color: option.color }]}>
                    {option.label}
                  </Text>
                  {formData.duration === option.value && (
                    <FontAwesome name="check" size={16} color="#b081ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Modal - Seleção de Frequência */}
      <Modal
        animationType="slide"
        transparent
        visible={showFrequencyDropdown}
        onRequestClose={() => setShowFrequencyDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFrequencyDropdown(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Frequência</Text>
              <TouchableOpacity onPress={() => setShowFrequencyDropdown(false)}>
                <FontAwesome name="times" size={20} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.frequencyOption}
                  onPress={() => handleFrequencySelect(option.value)}
                  activeOpacity={0.7}
                >
                  <FontAwesome name={option.icon} size={18} color="#b081ee" />
                  <Text style={styles.frequencyOptionText}>{option.label}</Text>
                  {formData.frequency_unit === option.value && (
                    <FontAwesome name="check" size={16} color="#b081ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <Modal
          animationType="slide"
          transparent
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Data</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <FontAwesome name="times" size={20} color="#8A8A8A" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimePickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleConfirmDate}
                  locale="pt-BR"
                  style={Platform.OS === 'ios' ? { width: '100%', height: 200 } : { width: '100%' }}
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
                  onPress={() => {
                    // Confirmar a data selecionada
                    setShowDatePicker(false);
                  }}
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
          transparent
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Hora</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <FontAwesome name="times" size={20} color="#8A8A8A" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimePickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleConfirmTime}
                  locale="pt-BR"
                  style={Platform.OS === 'ios' ? { width: '100%', height: 200 } : { width: '100%' }}
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
                  onPress={() => {
                    // Confirmar a hora selecionada
                    setShowTimePicker(false);
                  }}
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
  },
  content: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedMember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#b081ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#8A8A8A',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  frequencyInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  frequencyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 100,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d1155',
    marginLeft: 5,
  },
  durationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  datetimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flex: 1,
  },
  datetimeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: '#b081ee',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    width: '100%',
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberOptionText: {
    fontSize: 16,
    color: '#2d1155',
    marginLeft: 10,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  durationOptionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  frequencyOptionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  continuousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  continuousBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  durationPickerContinuous: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  dateTimePickerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
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
  customDurationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  customDurationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  customDurationValueInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  customDurationUnitPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  customDurationUnitText: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  customDurationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  customDurationCancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  customDurationCancelText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  customDurationConfirmButton: {
    flex: 1,
    backgroundColor: '#b081ee',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  customDurationConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  durationTabs: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  durationTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  durationTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  durationTabTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  continuousUseContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  continuousUseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  continuousUseText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  durationInputContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  durationValueInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  durationUnitPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  durationUnitText: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  durationHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  medicationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  medicationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  infoButton: {
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
}); 