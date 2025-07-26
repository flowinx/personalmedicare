import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Platform
} from 'react-native';
import { addTreatment, getAllMembers, getTreatmentById, updateTreatment } from '../../db/index';
import { Member } from '../../types';
import { useEntranceAnimation } from '../../utils/animations';
import { fetchMedicationInfo } from '../../services/gemini';

interface TreatmentFormData {
  member_id: string;
  medication: string;
  frequency_value: number;
  frequency_unit: string;
  duration: string;
  notes: string;
  start_datetime: string;
  status: string;
}

const frequencyOptions = [
  { value: 'horas', label: 'Horas', icon: 'clock-o' as const, color: '#b081ee' },
  { value: 'dias', label: 'Dias', icon: 'sun-o' as const, color: '#b081ee' },
  { value: 'semanas', label: 'Semanas', icon: 'calendar-o' as const, color: '#b081ee' },
  { value: 'meses', label: 'Meses', icon: 'calendar' as const, color: '#b081ee' }
];

const durationPresets = [
  { value: '7 dias', label: '1 Semana', icon: 'calendar-check-o', color: '#b081ee' },
  { value: '14 dias', label: '2 Semanas', icon: 'calendar-check-o', color: '#b081ee' },
  { value: '30 dias', label: '1 Mês', icon: 'calendar-check-o', color: '#b081ee' },
  { value: '90 dias', label: '3 Meses', icon: 'calendar-check-o', color: '#b081ee' },
  { value: 'Uso Contínuo', label: 'Contínuo', icon: 'refresh', color: '#b081ee' }
];

export default function AddTreatmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [members, setMembers] = useState<Member[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);


  // Form data
  const [formData, setFormData] = useState<TreatmentFormData>({
    member_id: '',
    medication: '',
    frequency_value: 1,
    frequency_unit: 'horas',
    duration: '7 dias',
    notes: '',
    start_datetime: new Date().toISOString(),
    status: 'ativo'
  });

  const [dosage, setDosage] = useState('');

  const [frequencyValueText, setFrequencyValueText] = useState('1');
  
  // Estados para duração personalizada
  const [customDurationValue, setCustomDurationValue] = useState('');
  const [customDurationUnit, setCustomDurationUnit] = useState('dias');
  const [showDurationUnitModal, setShowDurationUnitModal] = useState(false);
  const [durationTabSelected, setDurationTabSelected] = useState('custom');
  const [showMedicationInfoModal, setShowMedicationInfoModal] = useState(false);
  const [medicationInfo, setMedicationInfo] = useState('');
  const [loadingMedicationInfo, setLoadingMedicationInfo] = useState(false);

  // Animações
  const { startAnimation } = useEntranceAnimation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [progressAnim] = useState(new Animated.Value(0));

  const loadMembers = useCallback(async () => {
    try {
      const membersData = await getAllMembers();
      setMembers(membersData);
    } catch (error) {
      console.error('[AddTreatmentScreen] Erro ao carregar membros:', error);
    }
  }, []);

  useEffect(() => {
    startAnimation();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadMembers();
  }, [fadeAnim, slideAnim, startAnimation, loadMembers]);



  useEffect(() => {
    const loadTreatmentData = async () => {
      const params = route.params as any;
      if (params?.mode === 'edit' && params?.treatmentId) {
        try {
          const treatment = await getTreatmentById(params.treatmentId);
          if (treatment) {
            setFormData(prev => ({ 
              ...prev, 
              member_id: treatment.member_id, 
              medication: treatment.medication, 
              frequency_value: treatment.frequency_value, 
              frequency_unit: treatment.frequency_unit, 
              duration: treatment.duration, 
              notes: treatment.notes || '', 
              start_datetime: treatment.start_datetime 
            }));
            setSelectedDate(new Date(treatment.start_datetime));
            setSelectedTime(new Date(treatment.start_datetime));
            setFrequencyValueText(treatment.frequency_value.toString());
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
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const freqVal = parseInt(formData.frequency_value.toString(), 10);
    if (isNaN(freqVal) || freqVal <= 0) {
      Alert.alert('Erro de Validação', 'A frequência deve ser um número maior que zero.');
      return;
    }

    try {
      console.log('[AddTreatment] Iniciando salvamento do tratamento...');
      
      // Verificar se o usuário está autenticado antes de prosseguir
      console.log('[AddTreatment] Verificando autenticação do usuário...');
      
      const combinedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );

      const treatmentData = {
        member_id: formData.member_id,
        medication: formData.medication.trim(),
        dosage: '',
        frequency_value: freqVal,
        frequency_unit: formData.frequency_unit,
        duration: formData.duration,
        notes: formData.notes.trim(),
        start_datetime: combinedDateTime.toISOString(),
        status: 'ativo'
      };

      console.log('[AddTreatment] Dados do tratamento preparados:', treatmentData);

      const isEditMode = (route.params as any)?.mode === 'edit';
      const treatmentId = (route.params as any)?.treatmentId ? String((route.params as any).treatmentId) : undefined;

      if (isEditMode && treatmentId) {
        console.log('[AddTreatment] Modo edição - atualizando tratamento:', treatmentId);
        await updateTreatment(treatmentId, treatmentData);
        Alert.alert('Sucesso! 🎉', 'Tratamento atualizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              try {
                console.log('[AddTreatment] Navegando de volta após atualização...');
                if (navigation && typeof navigation.goBack === 'function') {
                  navigation.goBack();
                } else {
                  console.log('[AddTreatment] Navigation não disponível, permanecendo na tela');
                }
              } catch (navError) {
                console.error('[AddTreatment] Erro na navegação:', navError);
              }
            }
          }
        ]);
      } else {
        console.log('[AddTreatment] Modo criação - adicionando novo tratamento');
        const newTreatmentId = await addTreatment(treatmentData);
        console.log('[AddTreatment] Tratamento criado com ID:', newTreatmentId);
        Alert.alert('Sucesso! 🎉', 'Tratamento adicionado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              try {
                console.log('[AddTreatment] Navegando de volta após criação...');
                if (navigation && typeof navigation.goBack === 'function') {
                  navigation.goBack();
                } else {
                  console.log('[AddTreatment] Navigation não disponível, permanecendo na tela');
                }
              } catch (navError) {
                console.error('[AddTreatment] Erro na navegação:', navError);
              }
            }
          }
        ]);
      }
    } catch (error: any) {
      console.error('[AddTreatment] Falha ao salvar tratamento:', error);
      console.error('[AddTreatment] Erro detalhado:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      
      const isEditMode = (route.params as any)?.mode === 'edit';
      let errorMessage = `Não foi possível ${isEditMode ? 'atualizar' : 'salvar'} o tratamento.`;
      
      if (error?.message?.includes('não autenticado')) {
        errorMessage = 'Você precisa estar logado para salvar o tratamento. Faça login novamente.';
      } else if (error?.message?.includes('isReady')) {
        errorMessage = 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.';
      }
      
      Alert.alert('Erro', errorMessage);
    }
  };

  const handleSelectMember = (id: string) => {
    setFormData(prev => ({ ...prev, member_id: id }));
    setShowMemberModal(false);
  };

  const handleFrequencySelect = (unit: string) => {
    setFormData(prev => ({ ...prev, frequency_unit: unit }));
    setShowFrequencyModal(false);
  };

  const handleDurationSelect = (duration: string) => {
    setFormData(prev => ({ ...prev, duration }));
  };



  const durationUnits = [
    { value: 'dias', label: 'Dias' },
    { value: 'semanas', label: 'Semanas' },
    { value: 'meses', label: 'Meses' }
  ];

  const selectedMember = members.find(m => m.id === formData.member_id);
  const selectedFrequency = frequencyOptions.find(f => f.value === formData.frequency_unit);

  const isFormValid = () => {
    return formData.member_id && 
           formData.medication.trim() && 
           formData.frequency_value > 0 && 
           formData.duration;
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#b081ee" />
      


      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Seleção de Membro */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <FontAwesome name="user" size={20} color="#b081ee" />
              <Text style={styles.stepCardTitle}>Membro da Família</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.memberSelector, selectedMember && styles.memberSelectorSelected]}
              onPress={() => setShowMemberModal(true)}
              activeOpacity={0.7}
            >
              {selectedMember ? (
                <View style={styles.selectedMemberContent}>
                  <View style={styles.memberAvatarCompact}>
                    <FontAwesome name="user" size={18} color="#fff" />
                  </View>
                  <View style={styles.memberInfoCompact}>
                    <Text style={styles.memberNameCompact}>{selectedMember.name}</Text>
                    <Text style={styles.memberRelationCompact}>{selectedMember.relation}</Text>
                  </View>
                  <FontAwesome name="check-circle" size={20} color="#b081ee" />
                </View>
              ) : (
                <View style={styles.placeholderContentCompact}>
                  <View style={styles.placeholderIconContainer}>
                    <FontAwesome name="user-plus" size={20} color="#999" />
                  </View>
                  <Text style={styles.placeholderTextCompact}>Selecionar membro</Text>
                  <FontAwesome name="chevron-right" size={14} color="#999" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Medicamento */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <FontAwesome name="medkit" size={20} color="#b081ee" />
              <Text style={styles.stepCardTitle}>Medicamento</Text>
            </View>
            
            <View style={styles.medicationInputContainer}>
              <FontAwesome name="medkit" size={20} color="#b081ee" style={styles.inputIcon} />
              <TextInput
                style={styles.medicationInput}
                placeholder="Ex: Paracetamol"
                placeholderTextColor="#999"
                value={formData.medication}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, medication: text }));
                }}
              />
              <TouchableOpacity
                style={[
                  styles.medicationInfoButton,
                  !formData.medication.trim() && styles.medicationInfoButtonDisabled
                ]}
                onPress={async () => {
                  if (formData.medication.trim()) {
                    setLoadingMedicationInfo(true);
                    setShowMedicationInfoModal(true);
                    try {
                      const info = await fetchMedicationInfo(formData.medication.trim());
                      setMedicationInfo(info);
                    } catch (error) {
                      console.error('[AddTreatment] Erro ao buscar informações do medicamento:', error);
                      setMedicationInfo('Não foi possível obter informações sobre este medicamento no momento. Tente novamente mais tarde.');
                    } finally {
                      setLoadingMedicationInfo(false);
                    }
                  }
                }}
                disabled={!formData.medication.trim()}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name="info-circle" 
                  size={20} 
                  color={formData.medication.trim() ? '#b081ee' : '#CBD5E0'} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Campo de Dosagem */}
            <View style={styles.dosageInputContainer}>
              <FontAwesome name="tint" size={20} color="#b081ee" style={styles.inputIcon} />
              <TextInput
                style={styles.dosageInput}
                placeholder="Ex: 500mg, 1 comprimido, 5ml"
                placeholderTextColor="#999"
                value={dosage}
                onChangeText={setDosage}
              />
            </View>
          </View>

          {/* Frequência */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <FontAwesome name="clock-o" size={20} color="#b081ee" />
              <Text style={styles.stepCardTitle}>Frequência de Uso</Text>
            </View>
            
            <View style={styles.frequencyContainer}>
              <View style={styles.frequencyInputGroup}>
                <Text style={styles.frequencyLabel}>A cada</Text>
                <TextInput
                  style={styles.frequencyValueInput}
                  placeholder="1"
                  placeholderTextColor="#999"
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
                  style={styles.frequencyUnitSelector}
                  onPress={() => setShowFrequencyModal(true)}
                  activeOpacity={0.7}
                >
                  <FontAwesome 
                    name={selectedFrequency?.icon || 'clock-o'} 
                    size={16} 
                    color={selectedFrequency?.color || '#b081ee'} 
                  />
                  <Text style={styles.frequencyUnitText}>{selectedFrequency?.label}</Text>
                  <FontAwesome name="chevron-down" size={12} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Duração */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <FontAwesome name="calendar" size={20} color="#b081ee" />
              <Text style={styles.stepCardTitle}>Duração do Tratamento</Text>
            </View>
            
            {/* Tabs de Duração */}
            <View style={styles.durationTabs}>
              <TouchableOpacity
                style={[
                  styles.durationTab,
                  durationTabSelected === 'custom' && styles.durationTabActive
                ]}
                onPress={() => setDurationTabSelected('custom')}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name="calendar-o" 
                  size={16} 
                  color={durationTabSelected === 'custom' ? '#fff' : '#b081ee'} 
                />
                <Text style={[
                  styles.durationTabText,
                  durationTabSelected === 'custom' && styles.durationTabTextActive
                ]}>
                  Duração
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.durationTab,
                  durationTabSelected === 'continuous' && styles.durationTabActive
                ]}
                onPress={() => {
                  setDurationTabSelected('continuous');
                  handleDurationSelect('Uso Contínuo');
                }}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name="refresh" 
                  size={16} 
                  color={durationTabSelected === 'continuous' ? '#fff' : '#b081ee'} 
                />
                <Text style={[
                  styles.durationTabText,
                  durationTabSelected === 'continuous' && styles.durationTabTextActive
                ]}>
                  Uso Contínuo
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Conteúdo da Tab Selecionada */}
            {durationTabSelected === 'custom' && (
              <View style={styles.customDurationContainer}>
                <TextInput
                  style={styles.durationValueInput}
                  placeholder="Ex: 7"
                  placeholderTextColor="#999"
                  value={customDurationValue}
                  onChangeText={(text) => {
                    setCustomDurationValue(text);
                    if (text && parseInt(text) > 0) {
                      const customDuration = `${text} ${customDurationUnit}`;
                      setFormData(prev => ({ ...prev, duration: customDuration }));
                    }
                  }}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.durationUnitSelector}
                  onPress={() => setShowDurationUnitModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.durationUnitText}>{customDurationUnit}</Text>
                  <FontAwesome name="chevron-down" size={12} color="#999" />
                </TouchableOpacity>
              </View>
            )}
            
            {durationTabSelected === 'continuous' && (
              <View style={styles.continuousUseInfo}>
                <FontAwesome name="info-circle" size={16} color="#b081ee" />
                <Text style={styles.continuousUseInfoText}>
                  Medicamento de uso contínuo, sem data de término definida.
                </Text>
              </View>
            )}
          </View>

          {/* Data e Hora */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <FontAwesome name="calendar-o" size={20} color="#b081ee" />
              <Text style={styles.stepCardTitle}>Data e Hora de Início</Text>
            </View>
            
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <FontAwesome name="calendar" size={20} color="#b081ee" />
                <View style={styles.dateTimeInfo}>
                  <Text style={styles.dateTimeLabel}>Data</Text>
                  <Text style={styles.dateTimeValue}>
                    {selectedDate.toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <FontAwesome name="clock-o" size={20} color="#b081ee" />
                <View style={styles.dateTimeInfo}>
                  <Text style={styles.dateTimeLabel}>Horário</Text>
                  <Text style={styles.dateTimeValue}>
                    {selectedTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <FontAwesome name="info-circle" size={16} color="#b081ee" />
              <Text style={styles.previewText}>
                Primeiro medicamento: {new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  selectedTime.getHours(),
                  selectedTime.getMinutes()
                ).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Observações (Opcional) */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <FontAwesome name="sticky-note-o" size={20} color="#b081ee" />
              <Text style={styles.stepCardTitle}>Observações (Opcional)</Text>
            </View>
            
            <TextInput
              style={styles.notesInput}
              placeholder="Adicione observações sobre o tratamento..."
              placeholderTextColor="#999"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                try {
                  if (navigation && typeof navigation.goBack === 'function') {
                    navigation.goBack();
                  }
                } catch (navError) {
                  console.error('[AddTreatment] Erro na navegação do cancelar:', navError);
                }
              }}
              activeOpacity={0.8}
            >
              <FontAwesome name="times" size={20} color="#718096" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
              onPress={handleSaveTreatment}
              disabled={!isFormValid()}
              activeOpacity={0.8}
            >
              <FontAwesome name="check" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {(route.params as any)?.mode === 'edit' ? 'Atualizar' : 'Criar'} Tratamento
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal - Seleção de Membro */}
      <Modal
        animationType="slide"
        transparent
        visible={showMemberModal}
        onRequestClose={() => setShowMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Membro</Text>
              <TouchableOpacity 
                onPress={() => setShowMemberModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberModalOption}
                  onPress={() => handleSelectMember(member.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberModalAvatar}>
                    <FontAwesome name="user" size={20} color="#fff" />
                  </View>
                  <View style={styles.memberModalInfo}>
                    <Text style={styles.memberModalName}>{member.name}</Text>
                    <Text style={styles.memberModalRelation}>{member.relation}</Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#DDD" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal - Seleção de Frequência */}
      <Modal
        animationType="slide"
        transparent
        visible={showFrequencyModal}
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Frequência</Text>
              <TouchableOpacity 
                onPress={() => setShowFrequencyModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.frequencyModalGrid}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyModalOption,
                    { borderColor: option.color }
                  ]}
                  onPress={() => handleFrequencySelect(option.value)}
                  activeOpacity={0.7}
                >
                  <FontAwesome name={option.icon} size={24} color={option.color} />
                  <Text style={styles.frequencyModalText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal - Seleção de Data */}
      <Modal
        animationType="slide"
        transparent
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateTimeModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Data</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateTimePickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                locale="pt-BR"
                onChange={(event, date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                style={styles.dateTimePicker}
                textColor="#2D3748"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal - Seleção de Hora */}
      <Modal
        animationType="slide"
        transparent
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateTimeModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Horário</Text>
              <TouchableOpacity 
                onPress={() => setShowTimePicker(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateTimePickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={(event, date) => {
                  if (date) {
                    setSelectedTime(date);
                  }
                }}
                style={styles.dateTimePicker}
                textColor="#2D3748"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal - Seleção de Unidade de Duração */}
      <Modal
        animationType="slide"
        transparent
        visible={showDurationUnitModal}
        onRequestClose={() => setShowDurationUnitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Unidade</Text>
              <TouchableOpacity 
                onPress={() => setShowDurationUnitModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {durationUnits.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={styles.memberModalOption}
                  onPress={() => {
                    setCustomDurationUnit(unit.value);
                    setShowDurationUnitModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberModalAvatar}>
                    <FontAwesome name="calendar" size={20} color="#fff" />
                  </View>
                  <View style={styles.memberModalInfo}>
                    <Text style={styles.memberModalName}>{unit.label}</Text>
                  </View>
                  {customDurationUnit === unit.value && (
                    <FontAwesome name="check" size={16} color="#b081ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal - Informações do Medicamento */}
      <Modal
        animationType="slide"
        transparent
        visible={showMedicationInfoModal}
        onRequestClose={() => setShowMedicationInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Informações do Medicamento</Text>
              <TouchableOpacity 
                onPress={() => setShowMedicationInfoModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.medicationInfoContainer}>
                <View style={styles.medicationInfoHeader}>
                  <FontAwesome name="medkit" size={24} color="#b081ee" />
                  <Text style={styles.medicationInfoName}>{formData.medication}</Text>
                </View>
                
                {loadingMedicationInfo ? (
                  <View style={styles.medicationInfoLoading}>
                    <FontAwesome name="spinner" size={24} color="#b081ee" />
                    <Text style={styles.medicationInfoLoadingText}>
                      Buscando informações sobre o medicamento...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.medicationInfoSection}>
                    <Text style={styles.medicationInfoContent}>
                      {medicationInfo || 'Nenhuma informação disponível.'}
                    </Text>
                  </View>
                )}
                
                <View style={styles.medicationInfoWarning}>
                  <FontAwesome name="exclamation-triangle" size={16} color="#FF9500" />
                  <Text style={styles.medicationInfoWarningText}>
                    Sempre consulte um médico ou farmacêutico antes de iniciar qualquer tratamento.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },


  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    opacity: 1,
  },
  activeStepCard: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedStep: {
    backgroundColor: '#b081ee',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  memberSelector: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F7FAFC',
  },
  memberSelectorSelected: {
    borderColor: '#b081ee',
    backgroundColor: '#F0F4FF',
  },
  selectedMemberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatarCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#b081ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInfoCompact: {
    flex: 1,
  },
  memberNameCompact: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  memberRelationCompact: {
    fontSize: 13,
    color: '#718096',
  },
  placeholderContentCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderTextCompact: {
    flex: 1,
    fontSize: 15,
    color: '#718096',
  },
  placeholderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  medicationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  medicationInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 16,
  },
  medicationInfoButton: {
    padding: 8,
    marginLeft: 8,
  },
  medicationInfoButtonDisabled: {
    opacity: 0.5,
  },
  dosageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  dosageInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 16,
  },
  frequencyContainer: {
    alignItems: 'center',
  },
  frequencyInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyLabel: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  frequencyValueInput: {
    width: 60,
    height: 50,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  frequencyUnitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  frequencyUnitText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  durationOptionSelected: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  durationOptionText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  durationOptionTextSelected: {
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 12,
    marginTop: 16,
  },
  customDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationValueInput: {
    width: 80,
    height: 50,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationUnitSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationUnitText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },

  durationSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  continuousUseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  continuousUseButtonSelected: {
    backgroundColor: '#b081ee',
    borderColor: '#b081ee',
  },
  continuousUseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  continuousUseTextSelected: {
    color: '#fff',
  },
  durationTabs: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
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
    backgroundColor: '#b081ee',
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  durationTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  durationTabTextActive: {
    color: '#fff',
  },
  continuousUseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  continuousUseInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  medicationInfoLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  medicationInfoLoadingText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  medicationInfoContent: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 24,
    textAlign: 'left',
  },
  medicationInfoContainer: {
    padding: 4,
  },
  medicationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  medicationInfoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  medicationInfoSection: {
    marginBottom: 20,
  },
  medicationInfoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  medicationInfoText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  medicationInfoList: {
    gap: 8,
  },
  medicationInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medicationInfoItemText: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  medicationInfoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  medicationInfoWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
    fontWeight: '500',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeInfo: {
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b081ee',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScroll: {
    maxHeight: 400,
  },
  memberModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#b081ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memberModalInfo: {
    flex: 1,
  },
  memberModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  memberModalRelation: {
    fontSize: 14,
    color: '#718096',
  },
  frequencyModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  frequencyModalOption: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#F7FAFC',
  },
  frequencyModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 8,
  },
  // Estilos para os modais de data e hora
  dateTimeModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  dateTimePickerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  dateTimePicker: {
    width: '100%',
    height: 200,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});