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

  useEffect(() => {
    loadMembers();
    
    // Set default start date and time
    const now = new Date();
    setStartDate(now.toISOString().split('T')[0]);
    setStartTime(now.toTimeString().slice(0, 5));
  }, []);

  const loadMembers = async () => {
    try {
      const allMembers = await getAllMembers();
      setMembers(allMembers);
    } catch (error) {
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
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Member Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Membro da Família</Text>
          </View>
          <View style={[styles.pickerContainer, Platform.OS === 'web' && styles.webPickerContainer]}>
            <Picker
              selectedValue={selectedMemberId}
              onValueChange={setSelectedMemberId}
              style={[styles.picker, Platform.OS === 'web' && styles.webPicker]}
              enabled={true}
              itemStyle={Platform.OS === 'web' ? styles.webPickerItem : undefined}
            >
              <Picker.Item label="Selecione um membro" value="" />
              {members.map((member) => (
                <Picker.Item
                  key={member.id}
                  label={`${member.name} (${member.relation})`}
                  value={member.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Medication */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#b081ee" />
            <Text style={styles.sectionTitle}>Medicamento</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={medication}
              onValueChange={setMedication}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um medicamento" value="" />
              <Picker.Item label="Alenia" value="Alenia" />
              <Picker.Item label="Dipirona" value="Dipirona" />
              <Picker.Item label="Paracetamol" value="Paracetamol" />
              <Picker.Item label="Ibuprofeno" value="Ibuprofeno" />
              <Picker.Item label="Amoxicilina" value="Amoxicilina" />
              <Picker.Item label="Omeprazol" value="Omeprazol" />
              <Picker.Item label="Losartana" value="Losartana" />
              <Picker.Item label="Metformina" value="Metformina" />
              <Picker.Item label="Sinvastatina" value="Sinvastatina" />
              <Picker.Item label="Captopril" value="Captopril" />
              <Picker.Item label="Outro" value="Outro" />
            </Picker>
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

});