import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
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
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { addTreatment, getTreatmentById, updateTreatment } from '../../db/index';
import { Member, getAllMembers } from '../../db/members';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

const frequencyUnitOptions = ['horas', 'dias'];

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
  const [showMedicationInfo, setShowMedicationInfo] = useState(false);
  const [loadingMedicationInfo] = useState(false);

  // Form data
  const [formData, setFormData] = useState<TreatmentFormData>({
    member_id: '',
    medication: '',
    dosage: '',
    frequency_value: 1,
    frequency_unit: 'horas',
    duration: '',
    notes: '',
    start_datetime: new Date().toISOString(),
    status: 'ativo'
  });

  // Animações
  const { fadeAnim, slideAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

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

  useFocusEffect(
    useCallback(() => {
      // Limpa todos os campos ao abrir a tela, exceto o membro selecionado
      setFormData(prev => ({ ...prev, medication: '', dosage: '', duration: '', notes: '' }));
      setSelectedDate(new Date());
      setSelectedTime(new Date());
    }, [route.params]));

  // Carregar dados do tratamento para edição
  useFocusEffect(
    useCallback(() => {
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
    }, [route.params])
  );

  const handleSaveTreatment = async () => {
    if (!formData.member_id || !formData.medication.trim() || !formData.frequency_value) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Se não for uso contínuo, verificar se a duração foi preenchida
    if (!formData.duration.trim()) {
      Alert.alert('Erro', 'Preencha a duração do tratamento.');
      return;
    }

    const freqVal = parseInt(formData.frequency_value.toString(), 10);

    if (isNaN(freqVal) || freqVal <= 0) {
      Alert.alert('Erro', 'Frequência deve ser um número maior que zero.');
      return;
    }

    // Se não for uso contínuo, verificar se a duração é válida
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
    <>
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
                <TouchableOpacity style={styles.picker} onPress={() => !formData.member_id && setShowMedicationInfo(true)} disabled={!!formData.member_id}>
                  <FontAwesome name="user" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <ThemedText lightColor="#2d1155" darkColor="#2d1155" style={styles.pickerText}>
                    {members.find(m => m.id === formData.member_id)?.name || 'Selecione...'}
                  </ThemedText>
                  {!!formData.member_id && (
                    <FontAwesome name="lock" size={16} color="#b081ee" style={{ marginLeft: 8 }} />
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
                    placeholder="Ex: Paracetamol" 
                    placeholderTextColor="#8A8A8A"
                    value={formData.medication} 
                    onChangeText={text => setFormData(prev => ({ ...prev, medication: text }))} 
                  />
                  <TouchableOpacity 
                    onPress={async () => {
                      
                      if (!formData.medication.trim()) {
                        Alert.alert('Aviso', 'Digite o nome do medicamento primeiro.');
                        return;
                      }
                      
                      // Fechar todos os modais antes de navegar
                      if (showMedicationInfo) {
                        setShowMedicationInfo(false);
                      }
                      
                      // Aguardar um pouco para os modais fecharem
                      await new Promise(resolve => setTimeout(resolve, 100));
                      
                      try {
                        router.navigate({
                          pathname: '/+not-found',
                          params: {
                            medicationName: formData.medication.trim(),
                            medicationInfo: 'Informações detalhadas do medicamento serão carregadas aqui.'
                          }
                        });
                      } catch (error) {
                        console.error('[MedicationInfo] Erro na navegação:', error);
                        Alert.alert('Erro', 'Não foi possível abrir os detalhes do medicamento.');
                      }
                    }}
                    disabled={!formData.medication.trim() || loadingMedicationInfo}
                    style={[
                      styles.infoButton,
                      { opacity: formData.medication.trim() && !loadingMedicationInfo ? 1 : 0.3 }
                    ]}
                  >
                    <FontAwesome 
                      name="info-circle" 
                      size={20} 
                      color={formData.medication.trim() && !loadingMedicationInfo ? "#b081ee" : "#8A8A8A"} 
                    />
                  </TouchableOpacity>
                  {loadingMedicationInfo && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#b081ee" />
                    </View>
                  )}
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
                    value={formData.dosage} 
                    onChangeText={text => setFormData(prev => ({ ...prev, dosage: text }))} 
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
                      style={[styles.toggleOption, !formData.duration.includes('Uso Contínuo') && styles.toggleOptionActive]} 
                      onPress={() => setFormData(prev => ({ ...prev, duration: 'Uso Contínuo' }))}
                    >
                      <FontAwesome name="calendar" size={16} color={!formData.duration.includes('Uso Contínuo') ? "#fff" : "#8A8A8A"} />
                      <ThemedText style={[styles.toggleText, !formData.duration.includes('Uso Contínuo') && styles.toggleTextActive]}>
                        Duração Específica
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.toggleOption, formData.duration.includes('Uso Contínuo') && styles.toggleOptionActive]} 
                      onPress={() => setFormData(prev => ({ ...prev, duration: 'Uso Contínuo' }))}
                    >
                      <FontAwesome name="refresh" size={16} color={formData.duration.includes('Uso Contínuo') ? "#fff" : "#8A8A8A"} />
                      <ThemedText style={[styles.toggleText, formData.duration.includes('Uso Contínuo') && styles.toggleTextActive]}>
                        Uso Contínuo
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {!formData.duration.includes('Uso Contínuo') && (
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Duração do Tratamento</ThemedText>
                  <View style={styles.compositeInput}>
                    <View style={styles.inputWrapper}>
                      <FontAwesome 
                        name={formData.duration.includes('dias') ? 'calendar' : formData.duration.includes('semanas') ? 'calendar-o' : 'calendar-check-o'} 
                        size={20} 
                        color="#8A8A8A" 
                        style={styles.inputIcon} 
                      />
                      <TextInput 
                        style={[styles.input, styles.compositeInputText]} 
                        placeholder="Ex: 7" 
                        placeholderTextColor="#8A8A8A"
                        value={formData.duration.split(' ')[0]} 
                        onChangeText={text => setFormData(prev => ({ ...prev, duration: `${text} ${formData.duration.split(' ')[1]}` }))} 
                        keyboardType="numeric" 
                      />
                    </View>
                    <View style={styles.unitPicker}>
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity 
                          style={styles.dropdownButton}
                          onPress={() => {
                            const currentUnit = formData.duration.split(' ')[1];
                            const newUnit = currentUnit === 'dias' ? 'semanas' : currentUnit === 'semanas' ? 'meses' : 'dias';
                            setFormData(prev => ({ ...prev, duration: `${formData.duration.split(' ')[0]} ${newUnit}` }));
                          }}
                        >
                          <View style={styles.dropdownButtonContent}>
                            <FontAwesome 
                              name={formData.duration.includes('dias') ? 'calendar' : formData.duration.includes('semanas') ? 'calendar-o' : 'calendar-check-o'} 
                              size={16} 
                              color="#8A8A8A" 
                              style={styles.dropdownIcon}
                            />
                            <ThemedText style={styles.dropdownButtonText}>{formData.duration.split(' ')[1]}</ThemedText>
                          </View>
                          <FontAwesome 
                            name="chevron-down" 
                            size={16} 
                            color="#8A8A8A" 
                          />
                        </TouchableOpacity>
                        

                      </View>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Frequência (a cada)</ThemedText>
                <View style={styles.compositeInput}>
                  <View style={styles.inputWrapper}>
                    <FontAwesome 
                      name={formData.frequency_unit === 'horas' ? 'clock-o' : 'calendar'} 
                      size={20} 
                      color="#8A8A8A" 
                      style={styles.inputIcon} 
                    />
                    <TextInput 
                      style={[styles.input, styles.compositeInputText]} 
                      placeholder="Ex: 8" 
                      placeholderTextColor="#8A8A8A"
                      value={formData.frequency_value.toString()} 
                      onChangeText={text => setFormData(prev => ({ ...prev, frequency_value: parseInt(text, 10) || 1 }))} 
                      keyboardType="numeric" 
                    />
                  </View>
                  <View style={styles.unitPicker}>
                    <View style={styles.dropdownContainer}>
                      <TouchableOpacity 
                        style={styles.dropdownButton}
                        onPress={() => {
                          const currentUnit = formData.frequency_unit;
                          const newUnit = currentUnit === 'horas' ? 'dias' : 'horas';
                          setFormData(prev => ({ ...prev, frequency_unit: newUnit }));
                        }}
                      >
                        <View style={styles.dropdownButtonContent}>
                          <FontAwesome 
                            name={formData.frequency_unit === 'horas' ? 'clock-o' : 'calendar'} 
                            size={16} 
                            color="#8A8A8A" 
                            style={styles.dropdownIcon}
                          />
                          <ThemedText style={styles.dropdownButtonText}>{formData.frequency_unit}</ThemedText>
                        </View>
                        <FontAwesome 
                          name="chevron-down" 
                          size={16} 
                          color="#8A8A8A" 
                        />
                      </TouchableOpacity>
                      
                      {frequencyUnitOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownModalItem,
                            formData.frequency_unit === option && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, frequency_unit: option }));
                          }}
                        >
                          <ThemedText style={[
                            styles.dropdownItemText,
                            formData.frequency_unit === option && styles.dropdownItemTextSelected
                          ]}>
                            {option}
                          </ThemedText>
                          {formData.frequency_unit === option && (
                            <FontAwesome name="check" size={16} color="#b081ee" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
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
                  <TouchableOpacity 
                    style={styles.pickerHalf} 
                    onPress={() => setShowDatePicker(true)}
                  >
                    <FontAwesome name="calendar" size={20} color="#8A8A8A" style={styles.inputIcon} />
                    <ThemedText lightColor="#2d1155" darkColor="#2d1155">{selectedDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.pickerHalf} 
                    onPress={() => setShowTimePicker(true)}
                  >
                    <FontAwesome name="clock-o" size={20} color="#8A8A8A" style={styles.inputIcon} />
                    <ThemedText lightColor="#2d1155" darkColor="#2d1155">{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
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
                    placeholder="Ex: Tomar com um copo de água..." 
                    placeholderTextColor="#8A8A8A"
                    multiline 
                    value={formData.notes} 
                    onChangeText={text => setFormData(prev => ({ ...prev, notes: text }))} 
                  />
                </View>
              </View>
            </Animated.View>

            {/* Buttons */}
            <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim, transform: [{ scale: slideAnim }] }]}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                <ThemedText style={styles.secondaryButtonText} lightColor="#b081ee" darkColor="#b081ee">Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSaveTreatment}>
                <ThemedText style={styles.primaryButtonText} lightColor="#fff" darkColor="#fff">Salvar</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>

      {/* DateTimePicker com modal nativo */}
      {showDatePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Selecionar Data</ThemedText>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                locale="pt-BR"
                onChange={handleConfirmDate}
                style={{ width: '100%' }}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#b081ee' }]}
                  onPress={() => {
                    setShowDatePicker(false);
                  }}
                >
                  <ThemedText style={[styles.modalButtonText, { color: 'white' }]}>Confirmar</ThemedText>
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
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowTimePicker(false)}
          >
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Selecionar Hora</ThemedText>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                locale="pt-BR"
                onChange={handleConfirmTime}
                style={{ width: '100%' }}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#b081ee' }]}
                  onPress={() => {
                    setShowTimePicker(false);
                  }}
                >
                  <ThemedText style={[styles.modalButtonText, { color: 'white' }]}>Confirmar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Modal do Dropdown */}
      {/* Removed as per new_code, as dropdowns are now integrated into the main input */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showMedicationInfo}
        onRequestClose={() => setShowMedicationInfo(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMedicationInfo(false)}>
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
                  {formData.member_id === item.id && <FontAwesome name="check" size={16} color="#b081ee" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

    </>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    width: '100%', // Ocupa toda a largura do input
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
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
    justifyContent: 'center',
    width: '100%',
  },
  unitPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d1155',
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
  notesPreview: {
    fontSize: 16,
    color: '#8A8A8A',
    paddingVertical: 12,
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  closeButton: {
    padding: 5,
  },
  infoButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerStyle: {
    height: 50,
    width: '100%',
    color: '#2d1155',
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownIcon: {
    // marginRight: 8, // Removido pois o gap do container já faz o espaçamento
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#2d1155',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2d1155',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#b081ee',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownModalItemLast: {
    borderBottomWidth: 0,
  },
  dropdownModalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownModalItemIcon: {
    // marginRight: 8, // Removido pois o gap do container já faz o espaçamento
  },
  dropdownModalItemText: {
    fontSize: 16,
    color: '#2d1155',
  },

}); 