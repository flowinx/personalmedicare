import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar como as notificações devem ser tratadas quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface ScheduledNotification {
  id: string;
  treatmentId: string;
  medication: string;
  memberName: string;
  dosage: string;
  scheduledTime: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, string> = new Map(); // scheduleId -> notificationId

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão de notificação negada');
        return false;
      }

      // Configurar canal de notificação para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
          name: 'Lembretes de Medicamentos',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#b081ee',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões de notificação:', error);
      return false;
    }
  }

  async scheduleNotification(schedule: ScheduledNotification): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const now = new Date();
      const scheduledTime = new Date(schedule.scheduledTime);

      // Não agendar notificações para o passado
      if (scheduledTime <= now) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Hora do Medicamento',
          body: `${schedule.medication} para ${schedule.memberName}\nDosagem: ${schedule.dosage}`,
          data: {
            scheduleId: schedule.id,
            treatmentId: schedule.treatmentId,
            medication: schedule.medication,
            memberName: schedule.memberName,
            dosage: schedule.dosage,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: scheduledTime,
        },
      });

      // Armazenar o ID da notificação para poder cancelar depois
      this.scheduledNotifications.set(schedule.id, notificationId);

      console.log(`Notificação agendada: ${schedule.medication} para ${scheduledTime.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return null;
    }
  }

  async cancelNotification(scheduleId: string): Promise<void> {
    try {
      const notificationId = this.scheduledNotifications.get(scheduleId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.scheduledNotifications.delete(scheduleId);
        console.log(`Notificação cancelada para schedule: ${scheduleId}`);
      }
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
      console.log('Todas as notificações foram canceladas');
    } catch (error) {
      console.error('Erro ao cancelar todas as notificações:', error);
    }
  }

  async scheduleMultipleNotifications(schedules: ScheduledNotification[]): Promise<void> {
    try {
      const promises = schedules.map(schedule => this.scheduleNotification(schedule));
      await Promise.all(promises);
      console.log(`${schedules.length} notificações agendadas`);
    } catch (error) {
      console.error('Erro ao agendar múltiplas notificações:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erro ao obter notificações agendadas:', error);
      return [];
    }
  }

  async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permissão de notificação negada');
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Enviar imediatamente
      });
    } catch (error) {
      console.error('Erro ao enviar notificação imediata:', error);
      throw error;
    }
  }

  // Gerar notificações para um tratamento específico
  generateTreatmentNotifications(
    treatmentId: string,
    medication: string,
    memberName: string,
    dosage: string,
    startDateTime: Date,
    frequencyValue: number,
    frequencyUnit: 'horas' | 'dias',
    durationDays: number = 30 // Padrão: 30 dias
  ): ScheduledNotification[] {
    const notifications: ScheduledNotification[] = [];
    const frequencyMs = frequencyUnit === 'horas' 
      ? frequencyValue * 60 * 60 * 1000 
      : frequencyValue * 24 * 60 * 60 * 1000;

    const endDate = new Date(startDateTime.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    let currentTime = new Date(startDateTime);

    while (currentTime <= endDate) {
      const scheduleId = `${treatmentId}_${currentTime.getTime()}`;
      
      notifications.push({
        id: scheduleId,
        treatmentId,
        medication,
        memberName,
        dosage,
        scheduledTime: new Date(currentTime),
      });

      currentTime = new Date(currentTime.getTime() + frequencyMs);
    }

    return notifications;
  }
}

export default NotificationService.getInstance();