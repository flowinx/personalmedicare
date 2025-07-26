import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RemindersScreenProps {
  navigation: any;
}

interface ReminderTime {
  id: string;
  time: Date;
  enabled: boolean;
  label: string;
}

const DEFAULT_REMINDERS: ReminderTime[] = [
  {
    id: '1',
    time: new Date(2024, 0, 1, 8, 0), // 08:00
    enabled: true,
    label: 'Manhã'
  },
  {
    id: '2',
    time: new Date(2024, 0, 1, 14, 0), // 14:00
    enabled: true,
    label: 'Tarde'
  },
  {
    id: '3',
    time: new Date(2024, 0, 1, 20, 0), // 20:00
    enabled: true,
    label: 'Noite'
  }
];

export default function RemindersScreen({ navigation }: RemindersScreenProps) {
  const [reminders, setReminders] = useState<ReminderTime[]>(DEFAULT_REMINDERS);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderTime | null>(null);
  const [globalReminders, setGlobalReminders] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const savedReminders = await AsyncStorage.getItem('medication_reminders');
      const globalEnabled = await AsyncStorage.getItem('global_reminders_enabled');
      
      if (savedReminders) {
        const parsedReminders = JSON.parse(savedReminders).map((r: any) => ({
          ...r,
          time: new Date(r.time)
        }));
        setReminders(parsedReminders);
      }
      
      if (globalEnabled !== null) {
        setGlobalReminders(JSON.parse(globalEnabled));
      }
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  };

  const saveReminders = async (newReminders: ReminderTime[], globalEnabled: boolean) => {
    try {
      await AsyncStorage.setItem('medication_reminders', JSON.stringify(newReminders));
      await AsyncStorage.setItem('global_reminders_enabled', JSON.stringify(globalEnabled));
    } catch (error) {
      console.error('Erro ao salvar lembretes:', error);
    }
  };

  const scheduleNotification = async (reminder: ReminderTime) => {
    if (!reminder.enabled || !globalReminders) return;

    try {
      const trigger = {
        hour: reminder.time.getHours(),
        minute: reminder.time.getMinutes(),
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Hora do Medicamento',
          body: `Lembrete de ${reminder.label.toLowerCase()}: Verifique seus medicamentos`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
        identifier: `reminder_${reminder.id}`,
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  };

  const cancelNotification = async (reminderId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(`reminder_${reminderId}`);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  };

  const handleGlobalToggle = async (value: boolean) => {
    setLoading(true);
    try {
      setGlobalReminders(value);
      
      if (value) {
        // Verificar permissões
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            Alert.alert(
              'Permissão Necessária',
              'Para receber lembretes, ative as notificações nas configurações.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Configurações', onPress: () => Notifications.openSettingsAsync() }
              ]
            );
            setGlobalReminders(false);
            return;
          }
        }
        
        // Agendar todos os lembretes ativos
        for (const reminder of reminders) {
          if (reminder.enabled) {
            await scheduleNotification(reminder);
          }
        }
        
        Alert.alert('Lembretes Ativados', 'Você receberá notificações nos horários configurados.');
      } else {
        // Cancelar todos os lembretes
        for (const reminder of reminders) {
          await cancelNotification(reminder.id);
        }
        
        Alert.alert('Lembretes Desativados', 'Você não receberá mais lembretes automáticos.');
      }
      
      await saveReminders(reminders, value);
    } catch (error) {
      console.error('Erro ao configurar lembretes globais:', error);
      Alert.alert('Erro', 'Não foi possível configurar os lembretes.');
    } finally {
      setLoading(false);
    }
  };

  const handleReminderToggle = async (reminderId: string, enabled: boolean) => {
    const updatedReminders = reminders.map(r => 
      r.id === reminderId ? { ...r, enabled } : r
    );
    
    setReminders(updatedReminders);
    
    const reminder = updatedReminders.find(r => r.id === reminderId);
    if (reminder) {
      if (enabled && globalReminders) {
        await scheduleNotification(reminder);
      } else {
        await cancelNotification(reminderId);
      }
    }
    
    await saveReminders(updatedReminders, globalReminders);
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime && selectedReminder) {
      const updatedReminders = reminders.map(r => 
        r.id === selectedReminder.id ? { ...r, time: selectedTime } : r
      );
      
      setReminders(updatedReminders);
      
      // Reagendar notificação se estiver ativa
      if (selectedReminder.enabled && globalReminders) {
        await cancelNotification(selectedReminder.id);
        const updatedReminder = { ...selectedReminder, time: selectedTime };
        await scheduleNotification(updatedReminder);
      }
      
      await saveReminders(updatedReminders, globalReminders);
    }
    
    setSelectedReminder(null);
  };

  const openTimePicker = (reminder: ReminderTime) => {
    setSelectedReminder(reminder);
    setShowTimePicker(true);
  };

  const addNewReminder = () => {
    const newReminder: ReminderTime = {
      id: Date.now().toString(),
      time: new Date(2024, 0, 1, 12, 0),
      enabled: true,
      label: 'Personalizado'
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    saveReminders(updatedReminders, globalReminders);
  };

  const removeReminder = (reminderId: string) => {
    Alert.alert(
      'Remover Lembrete',
      'Tem certeza que deseja remover este lembrete?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await cancelNotification(reminderId);
            const updatedReminders = reminders.filter(r => r.id !== reminderId);
            setReminders(updatedReminders);
            await saveReminders(updatedReminders, globalReminders);
          }
        }
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lembretes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Global Toggle */}
          <View style={styles.globalToggleCard}>
            <View style={styles.globalToggleHeader}>
              <Ionicons name="notifications" size={24} color="#b081ee" />
              <View style={styles.globalToggleInfo}>
                <Text style={styles.globalToggleTitle}>Lembretes Automáticos</Text>
                <Text style={styles.globalToggleSubtitle}>
                  Receber notificações nos horários configurados
                </Text>
              </View>
              <Switch
                value={globalReminders}
                onValueChange={handleGlobalToggle}
                disabled={loading}
              />
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#b081ee" />
            <Text style={styles.infoText}>
              Configure os horários em que deseja receber lembretes sobre seus medicamentos.
            </Text>
          </View>

          {/* Reminders List */}
          <View style={styles.remindersCard}>
            <View style={styles.remindersHeader}>
              <Text style={styles.remindersTitle}>Horários de Lembrete</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addNewReminder}
              >
                <Ionicons name="add" size={20} color="#b081ee" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderLeft}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => openTimePicker(reminder)}
                    disabled={!globalReminders}
                  >
                    <Ionicons name="time" size={20} color="#b081ee" />
                    <Text style={styles.timeText}>{formatTime(reminder.time)}</Text>
                  </TouchableOpacity>
                  <Text style={styles.reminderLabel}>{reminder.label}</Text>
                </View>
                
                <View style={styles.reminderRight}>
                  <Switch
                    value={reminder.enabled && globalReminders}
                    onValueChange={(value) => handleReminderToggle(reminder.id, value)}
                    disabled={!globalReminders}
                  />
                  {reminders.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeReminder(reminder.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Dicas</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Configure lembretes nos horários das suas refeições</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Mantenha intervalos regulares entre os medicamentos</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Ative as notificações do sistema para não perder lembretes</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && selectedReminder && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Horário</Text>
              <DateTimePicker
                value={selectedReminder.time}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowTimePicker(false);
                  setSelectedReminder(null);
                }}
              >
                <Text style={styles.modalCloseText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  globalToggleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  globalToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalToggleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  globalToggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  globalToggleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#f0eaff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  remindersCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0eaff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b081ee',
    marginLeft: 4,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  reminderLeft: {
    flex: 1,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  reminderLabel: {
    fontSize: 14,
    color: '#666',
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  timePicker: {
    width: '100%',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});