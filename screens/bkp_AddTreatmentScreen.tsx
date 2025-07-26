import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { addTreatment, getAllMembers, Member } from '../services/firebase';
import NotificationService from '../services/notifications';

interface AddTreatmentScreenProps {
  navigation: any;
  route?: {
    params?: {
      memberId?: string;
    };
  };
}

export default function AddTreatmentScreen({ navigation, route }: AddTreatmentScreenProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState(route?.params?.memberId || '');
  
  console.log('[AddTreatmentScreen] Route params:', route?.params);
  console.log('[AddTreatmentScreen] Initial selectedMemberId:', selectedMemberId);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequencyValue, setFrequencyValue] = useState('1');
  const [frequencyUnit, setFrequencyUnit] = useState('horas');
  const [duration, setDuration] = useState('');
  const [isContinuous, setIsContinuous] = useState(false);
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  useEffect(() => {
    loadMembers();
    
    // Set default start date and time
    const now = new Date();
    setStartDate(now.toISOString().split('T')[0]);
    setStartTime(now.toTimeString().slice(0, 5));
  }, []);

  const loadMembers = async () => {
    try {
      console.log('[AddTreatmentScreen] Carregando membros...');
      const allMembers = await getAllMembers();
      console.log('[AddTreatmentScreen] Membros carregados:', allMembers.length, allMembers);
      setMembers(allMembers);
    } catch (error) {
      console.error('[AddTreatmentScreen] Erro ao carregar membros:', error);
      Alert.alert('Erro', 'Erro ao carregar membros');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMemberId) {
      Alert.alert('Erro', 'Selecione um membro');
      return;
    }

    if (!medication.trim()) {
      Alert.alert('Erro', 'Nome do medicamento é obrigatório');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Erro', 'Dosagem é obrigatória');
      return;
    }

    if (!startDate || !startTime) {
      Alert.alert('Erro', 'Data e hora de início são obrigatórias');
      return;
    }

    setLoading(true);
    try {
      const startDateTime = `${startDate}T${startTime}:00`;

      const treatmentId = await addTreatment({
        member_id: selectedMemberId,
        medication: medication.trim(),
        dosage: dosage.trim(),
        frequency_value: parseInt(frequencyValue),
        frequency_unit: frequencyUnit,
        duration: isContinuous ? 'Contínuo' : (duration.trim() || 'Contínuo'),
        notes: notes.trim(),
        start_datetime: startDateTime,
        status: 'ativo',
      });

      // Agendar notificações para o tratamento
      try {
        const selectedMember = members.find(m => m.id === selectedMemberId);
        if (selectedMember && treatmentId) {
          const notifications = NotificationService.generateTreatmentNotifications(
            treatmentId,
            medication.trim(),
            selectedMember.name,
            dosage.trim(),
            new Date(startDateTime),
            parseInt(frequencyValue),
            frequencyUnit as 'horas' | 'dias',
            30 // 30 dias de notificações
          );

          await NotificationService.scheduleMultipleNotifications(notifications);
          console.log(`${notifications.length} notificações agendadas para o tratamento`);
        }
      } catch (notificationError) {
        console.error('Erro ao agendar notificações:', notificationError);
        // Não falha o salvamento se as notificações falharem
      }

      Alert.alert('Sucesso', 'Tratamento adicionado com sucesso!\nNotificações foram agendadas para lembrá-lo dos horários.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao adicionar tratamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMembers) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando membros...</Text>
      </View>
    );
  }

  console.log('[AddTreatmentScreen] Render - members:', members.length, members);
  console.log('[AddTreatmentScreen] Render - selectedMemberId:', selectedMemberId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Member Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Membro da Família *</Text>
          </View>
          <TouchableOpacity 
            style={styles.pickerContainer}
            onPress={() => setShowMemberModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.pickerDisplay}>
              <Text style={[
                styles.pickerText, 
                selectedMemberId ? styles.pickerTextSelected : styles.pickerTextPlaceholder
              ]}>
                {selectedMemberId 
                  ? members.find(m => m.id === selectedMemberId)?.name + ' (' + members.find(m => m.id === selectedMemberId)?.relation + ')'
                  : 'Selecione um membro da família'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#b081ee" />
            </View>
          </TouchableOpacity>
          {selectedMemberId === '' && (
            <Text style={styles.errorText}>Selecione um membro da família</Text>
          )}
        </View>

        {/* Medication */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Medicamento *</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={medication}
              onValueChange={(itemValue) => {
                console.log('[AddTreatmentScreen] Medicamento selecionado:', itemValue);
                setMedication(itemValue);
              }}
              style={styles.memberPicker}
            >
              <Picker.Item 
                label="Selecione um medicamento" 
                value="" 
                color="#999"
              />
              <Picker.Item label="Alenia" value="Alenia" color="#333" />
              <Picker.Item label="Dipirona" value="Dipirona" color="#333" />
              <Picker.Item label="Paracetamol" value="Paracetamol" color="#333" />
              <Picker.Item label="Ibuprofeno" value="Ibuprofeno" color="#333" />
              <Picker.Item label="Amoxicilina" value="Amoxicilina" color="#333" />
              <Picker.Item label="Omeprazol" value="Omeprazol" color="#333" />
              <Picker.Item label="Losartana" value="Losartana" color="#333" />
              <Picker.Item label="Metformina" value="Metformina" color="#333" />
              <Picker.Item label="Sinvastatina" value="Sinvastatina" color="#333" />
              <Picker.Item label="Captopril" value="Captopril" color="#333" />
              <Picker.Item label="Outro" value="Outro" color="#333" />
            </Picker>
          </View>
          {medication === '' && (
            <Text style={styles.errorText}>Selecione um medicamento</Text>
          )}
        </View>
        
        {/* Dosage */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Dosagem *</Text>
          </View>
          <View style={styles.dosageContainer}>
            <TextInput
              style={[styles.input, styles.dosageInput]}
              value={dosage}
              onChangeText={setDosage}
              placeholder="Dosagem (ex: 1 comprimido, 10ml)"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle" size={20} color="#b081ee" />
            </TouchableOpacity>
          </View>
          {dosage === '' && (
            <Text style={styles.errorText}>Digite a dosagem do medicamento</Text>
          )}
        </View>

        {/* Frequency */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Frequência</Text>
          </View>
          <View style={styles.frequencyContainer}>
            <TextInput
              style={styles.frequencyInput}
              value={frequencyValue}
              onChangeText={setFrequencyValue}
              keyboardType="numeric"
              placeholder="1"
            />
            <View style={styles.frequencyPickerContainer}>
              <Picker
                selectedValue={frequencyUnit}
                onValueChange={setFrequencyUnit}
                style={styles.frequencyPicker}
              >
                <Picker.Item label="Horas" value="horas" />
                <Picker.Item label="Dias" value="dias" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Start Date and Time */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Data de Início *</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Hora de Início *</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Duration */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Duração do Tratamento</Text>
          </View>
          
          <View style={styles.durationToggleContainer}>
            <View style={styles.durationOption}>
              <Ionicons name="calendar-outline" size={16} color={isContinuous ? "#999" : "#333"} />
              <Text style={[styles.durationOptionText, { color: isContinuous ? "#999" : "#333" }]}>Duração Definida</Text>
            </View>
            <Switch
              value={isContinuous}
              onValueChange={setIsContinuous}
              trackColor={{ false: "#e9ecef", true: "#b081ee" }}
              thumbColor={isContinuous ? "#fff" : "#f4f3f4"}
            />
            <View style={styles.durationOption}>
              <Ionicons name="refresh" size={16} color={isContinuous ? "#00C851" : "#999"} />
              <Text style={[styles.durationOptionText, { color: isContinuous ? "#00C851" : "#999" }]}>Uso Contínuo</Text>
            </View>
          </View>
          
          {isContinuous && (
            <View style={styles.continuousMessage}>
              <Text style={styles.continuousMessageText}>Este medicamento será usado continuamente sem data de término</Text>
            </View>
          )}
          
          {!isContinuous && (
             <View>
               <TextInput
                 style={styles.input}
                 value={duration}
                 onChangeText={setDuration}
                 placeholder="5"
                 placeholderTextColor="#999"
                 keyboardType="numeric"
               />
               <Text style={styles.durationHint}>Digite qualquer valor para a duração do tratamento</Text>
             </View>
           )}
        </View>

        {/* Notes */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Instruções especiais, efeitos colaterais, etc."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Salvar Tratamento</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Member Selection Modal */}
        <Modal
          visible={showMemberModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMemberModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione um Membro</Text>
                <TouchableOpacity 
                  onPress={() => setShowMemberModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberOption,
                      selectedMemberId === member.id && styles.memberOptionSelected
                    ]}
                    onPress={() => {
                      console.log('[AddTreatmentScreen] Membro selecionado via modal:', member.id);
                      setSelectedMemberId(member.id);
                      setShowMemberModal(false);
                    }}
                  >
                    <View style={styles.memberOptionContent}>
                      <Text style={[
                        styles.memberOptionText,
                        selectedMemberId === member.id && styles.memberOptionTextSelected
                      ]}>
                        {member.name} ({member.relation})
                      </Text>
                      {selectedMemberId === member.id && (
                        <Ionicons name="checkmark" size={20} color="#b081ee" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dosageInput: {
    flex: 1,
    marginBottom: 0,
  },
  infoButton: {
    padding: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    minWidth: 60,
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  frequencyValueInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    minWidth: 40,
  },
  frequencyPickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 2,
  },
  frequencyPicker: {
    height: 50,
  },
  durationToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continuousMessage: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  continuousMessageText: {
    color: '#00C851',
    fontSize: 14,
    textAlign: 'center',
  },
  durationHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  webPickerContainer: {
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  webPicker: {
    backgroundColor: '#fff',
    color: '#333',
  },
  webPickerItem: {
    fontSize: 16,
    color: '#333',
  },
  memberPickerContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPicker: {
    height: 50,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  pickerIcon: {
    position: 'absolute',
    right: 16,
    pointerEvents: 'none',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  pickerTextSelected: {
    color: '#333',
  },
  pickerTextPlaceholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  memberOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberOptionSelected: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#b081ee',
  },
  memberOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberOptionText: {
    fontSize: 16,
    color: '#333',
  },
  memberOptionTextSelected: {
    color: '#b081ee',
    fontWeight: '600',
  },

});