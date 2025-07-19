import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProfile } from '../../contexts/ProfileContext';
import { Treatment, getAllTreatments } from '../../db/index';
import { Member, getAllMembers } from '../../db/members';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
};

type RootStackParamList = {
  'Cadastrar Membro': undefined;
  'Novo Tratamento': { treatmentId?: string; mode?: string } | undefined;
  'Tratamentos': undefined;
  'Detalhes do Membro': { id: string };
  'Detalhes do Tratamento': { treatmentId: string };
};

interface ScheduleItem {
  id: string; // schedule id - string para garantir unicidade
  scheduled_time: string;
  status: 'pendente' | 'tomado';
  treatment_id: string;
  medication: string;
  dosage: string;
  member_name: string;
  member_avatar_uri: string;
}

interface Alert {
  id: string;
  mensagem: string;
  lido: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const { profile } = useProfile();
  const [members, setMembers] = useState<Member[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // Função para gerar horários baseados na frequência do tratamento
  const generateScheduleForToday = (treatment: Treatment, member: Member): ScheduleItem[] => {
    const today = new Date();
    const startDate = new Date(treatment.start_datetime);
    
    // Se o tratamento ainda não começou, não aparece na agenda de hoje
    if (startDate > today) {
      return [];
    }

    const scheduleItems: ScheduleItem[] = [];
    const frequencyHours = treatment.frequency_unit === 'horas' ? treatment.frequency_value : treatment.frequency_value * 24;
    
    // Gera horários para hoje baseado na frequência
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    let currentTime = new Date(startDate);
    
    // Se o tratamento começou antes de hoje, calcula o próximo horário baseado na frequência
    if (currentTime < todayStart) {
      // Calcula quantos horários já passaram desde o início do tratamento
      const timeDiff = todayStart.getTime() - currentTime.getTime();
      const frequencyMs = frequencyHours * 60 * 60 * 1000;
      const periodsPassed = Math.floor(timeDiff / frequencyMs) + 1;
      
      // Calcula o próximo horário baseado na frequência
      currentTime = new Date(currentTime.getTime() + (periodsPassed * frequencyMs));
    }
    
    // Gera horários até o final do dia
    while (currentTime <= todayEnd) {
      scheduleItems.push({
        id: `${treatment.id}_${currentTime.getTime()}`, // ID único baseado no tratamento e horário
        scheduled_time: currentTime.toISOString(),
        status: 'pendente',
        treatment_id: treatment.id,
        medication: treatment.medication,
        dosage: treatment.dosage,
        member_name: member.name,
        member_avatar_uri: member.avatar_uri || '',
      });
      
      // Avança para o próximo horário
      currentTime = new Date(currentTime.getTime() + (frequencyHours * 60 * 60 * 1000));
    }
    
    return scheduleItems;
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch Members
          const allMembers = await getAllMembers();
          setMembers(allMembers);

          // Fetch Treatments
          const allTreatments = await getAllTreatments();
          console.log('[HomeScreen] All treatments:', allTreatments);

          // Gera agenda de hoje baseada nos tratamentos
          const todaySchedule: ScheduleItem[] = [];
          
          for (const treatment of allTreatments) {
            const member = allMembers.find(m => m.id === treatment.member_id);
            if (member && treatment.status === 'ativo') {
              const scheduleItems = generateScheduleForToday(treatment, member);
              todaySchedule.push(...scheduleItems);
            }
          }
          
          // Ordena por horário
          todaySchedule.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
          
          console.log('[HomeScreen] Today schedule generated:', todaySchedule);
          setTodaysSchedule(todaySchedule);

        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      };
      fetchData();
    }, [])
  );

  useEffect(() => {
    const now = new Date();
    const overdueDoses = todaysSchedule
      .filter(item => item.status === 'pendente' && new Date(item.scheduled_time) < now)
      .map(item => ({
        id: item.id,
        mensagem: `${item.medication} para ${item.member_name} estava agendado para as ${new Date(item.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        lido: false, // Por enquanto, novos alertas sempre serão "não lidos"
      }));
    
    setAlerts(overdueDoses);

    // Notificação push local para cada dose atrasada
    overdueDoses.forEach(async (alerta) => {
        if (!alerta.lido) { // Apenas envia notificação para os não lidos
            await Notifications.scheduleNotificationAsync({
                content: {
                title: 'Alerta de Medicamento',
                body: alerta.mensagem,
                },
                trigger: null, // Envia imediatamente
            });
        }
    });
  }, [todaysSchedule]);

  const handleMarkAsDone = async (scheduleId: string) => {
    try {
      // Por enquanto, apenas atualizamos o estado local
      setTodaysSchedule(prevSchedule => 
        prevSchedule.map(item => 
          item.id === scheduleId ? { ...item, status: 'tomado' } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark as done:", error);
    }
  };

  const handleViewTreatment = (item: ScheduleItem) => {
    // Navegar para detalhes do tratamento específico
    navigation.navigate('Detalhes do Tratamento', { treatmentId: item.treatment_id });
  };

  const handleEditTreatment = (item: ScheduleItem) => {
    // Navegar para edição do tratamento específico
    navigation.navigate('Novo Tratamento', { 
      treatmentId: item.treatment_id,
      mode: 'edit'
    });
  };

  const memberCardColors = ['#E6E0FF', '#FFE0E0', '#D4F5E1', '#FFF3D4'];

  // Filtra a agenda pelo nome do medicamento
  const filteredSchedule = search.trim().length === 0
    ? todaysSchedule
    : todaysSchedule.filter(t => t.medication.toLowerCase().includes(search.toLowerCase()));

  return (
    <ThemedView style={styles.container}>
      {/* Header com logo e sininho */}
      <Animated.View style={[styles.topBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoIconContainer}>
              <Image source={require('../../assets/images/medica-avatar.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={styles.greetingText}>
              <Text style={styles.greetingTitle}>
                {t('hello')}, {profile?.name?.split(' ')[0] || t('user')}!
              </Text>
              <Text style={styles.greetingSubtitle}>{t('howAreYouToday')}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => setShowAlerts(true)}
        >
          <Ionicons name="notifications-outline" size={28} color="#2d1155" />
          {alerts.length > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{alerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8A8A8A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchMedications')}
            placeholderTextColor="#8A8A8A"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Agenda de Hoje */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('todayAgenda')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tratamentos')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {filteredSchedule.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#8A8A8A" />
              <Text style={styles.emptyText}>{t('noTreatmentsToday')}</Text>
            </View>
          ) : (
            <>
              {/* Cabeçalho da Tabela - Fixo */}
                              <View style={styles.tableHeader}>
                  <View style={[styles.headerCell, { flex: 1.5 }]}>
                    <Text style={[styles.headerText, { textAlign: 'center', width: '100%' }]}>{t('members')}</Text>
                  </View>
                  <View style={[styles.headerCell, { flex: 2 }]}>
                    <Text style={[styles.headerText, { textAlign: 'left', width: '100%' }]}>{t('medication')}</Text>
                  </View>
                  <View style={[styles.headerCell, { flex: 1.2 }]}>
                    <Text style={[styles.headerText, { textAlign: 'center', width: '100%' }]}>Horário</Text>
                  </View>
                  <View style={[styles.headerCell, { flex: 1 }]}>
                    <Text style={[styles.headerText, { textAlign: 'center', width: '100%' }]}>{t('actions')}</Text>
                  </View>
                </View>

              {/* ScrollView para as linhas da tabela */}
              <ScrollView 
                style={styles.tableScrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.tableScrollContent}
              >
                {filteredSchedule.map((item, index) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={[styles.cell, { flex: 1.5 }]}>
                      <View style={styles.memberCell}>
                        {item.member_avatar_uri ? (
                          <Image source={{ uri: item.member_avatar_uri }} style={styles.memberAvatar} />
                        ) : (
                          <View style={styles.memberAvatarPlaceholder}>
                            <FontAwesome name="user" size={12} color="#b081ee" />
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={[styles.cell, { flex: 2, paddingRight: 8 }]}>
                      <Text style={styles.medicationText} numberOfLines={2}>
                        <Text style={styles.medicationName}>{item.medication}</Text>
                        {item.dosage && (
                          <Text style={styles.dosageText}> - {item.dosage}</Text>
                        )}
                      </Text>
                    </View>
                    
                    <View style={[styles.cell, { flex: 1.2 }]}>
                      <Text style={styles.timeText}>
                        {new Date(item.scheduled_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    
                    <View style={[styles.cell, { flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 4 }]}>
                      <View style={styles.actionIcons}>
                        <TouchableOpacity 
                          style={styles.actionIcon} 
                          onPress={() => handleViewTreatment(item)}
                        >
                          <FontAwesome name="eye" size={14} color="#b081ee" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionIcon} 
                          onPress={() => handleEditTreatment(item)}
                        >
                          <FontAwesome name="edit" size={14} color="#b081ee" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionIcon, item.status === 'tomado' && styles.actionIconDone]} 
                          onPress={() => handleMarkAsDone(item.id)}
                        >
                          <FontAwesome 
                            name={item.status === 'tomado' ? 'check' : 'circle-o'} 
                            size={14} 
                            color={item.status === 'tomado' ? '#fff' : '#b081ee'} 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </Animated.View>

        {/* Membros da Família */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('familyMembers')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastrar Membro')}>
              <Text style={styles.viewAllText}>{t('addMember')}</Text>
            </TouchableOpacity>
          </View>

          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#8A8A8A" />
              <Text style={styles.emptyText}>{t('noMembers')}</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.membersContainer}
            >
              {members.map((member, index) => (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberCard, { backgroundColor: memberCardColors[index % memberCardColors.length] }]}
                  onPress={() => navigation.navigate('Detalhes do Membro', { id: member.id! })}
                >
                  {member.avatar_uri ? (
                    <Image source={{ uri: member.avatar_uri }} style={styles.memberCardAvatar} />
                  ) : (
                    <View style={styles.memberCardAvatarPlaceholder}>
                      <FontAwesome name="user" size={24} color="#b081ee" />
                    </View>
                  )}
                  <Text style={styles.memberCardName} numberOfLines={1}>{member.name}</Text>
                  <Text style={styles.memberCardRelation} numberOfLines={1}>{member.relation}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal de Alertas */}
      <Modal
        visible={showAlerts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlerts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alertas</Text>
              <TouchableOpacity onPress={() => setShowAlerts(false)}>
                <Ionicons name="close" size={24} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.alertsList}>
              {alerts.length === 0 ? (
                <Text style={styles.noAlertsText}>Nenhum alerta pendente</Text>
              ) : (
                alerts.map((alert) => (
                  <View key={alert.id} style={styles.alertItem}>
                    <Ionicons name="warning" size={20} color="#ff6b6b" />
                    <Text style={styles.alertText}>{alert.mensagem}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    zIndex: 1,
  },
  logoContainer: {
    flex: 1,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d1155',
    letterSpacing: 0.5,
  },
  logo: {
    width: 120,
    height: 40,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  alertBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d1155',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b081ee',
  },
  scheduleContainer: {
    // Container for the schedule table
  },
  tableScrollView: {
    maxHeight: 250,
  },
  tableScrollContent: {
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 12,
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d1155',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 65,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  memberCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  memberAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '600',
  },
  cellMedication: {
    flex: 2.5,
    paddingHorizontal: 6,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  medicationText: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '600',
    marginBottom: 2,
  },
  medicationName: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '600',
  },
  dosageText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '400',
  },
  cellTime: {
    flex: 1,
    paddingHorizontal: 6,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#2d1155',
    fontWeight: '500',
    textAlign: 'center',
  },
  cellActions: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  actionIconDone: {
    backgroundColor: '#34C759',
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  actionButtonDone: {
    backgroundColor: '#34C759',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  membersContainer: {
    paddingHorizontal: 10, // Add some horizontal padding for horizontal scroll
  },
  memberCard: {
    width: 120,
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    marginRight: 10,
  },
  memberCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberCardAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  memberCardRelation: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: 340,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  alertsList: {
    maxHeight: 200, // Limit height for scrollable list
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  alertText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  noAlertsText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
    marginHorizontal: 20,
    marginTop: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  greetingText: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d1155',
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
}); 