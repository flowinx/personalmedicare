import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, RefreshControl, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useEntranceAnimation } from '../utils/animations';
import { getAllMembers, getAllTreatments, Member, Treatment } from '../services/firebase';

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const [members, setMembers] = useState<Member[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen: useFocusEffect triggered - reloading data');
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('HomeScreen: Loading data...');
      const [allMembers, allTreatments] = await Promise.all([
        getAllMembers(),
        getAllTreatments()
      ]);

      console.log('HomeScreen: Loaded', allMembers.length, 'members and', allTreatments.length, 'treatments');
      setMembers(allMembers);
      setTreatments(allTreatments);

      // Generate today's schedule
      const todaySchedule = generateTodaysSchedule(allTreatments, allMembers);
      setTodaysSchedule(todaySchedule);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const generateTodaysSchedule = (treatments: Treatment[], members: Member[]) => {
    const today = new Date();
    const schedule: any[] = [];

    treatments.forEach(treatment => {
      if (treatment.status !== 'ativo') return;

      const member = members.find(m => m.id === treatment.member_id);
      if (!member) return;

      const startDate = new Date(treatment.start_datetime);
      if (startDate > today) return;

      // Generate schedule items for today based on frequency
      const frequencyHours = treatment.frequency_unit === 'horas' ? treatment.frequency_value : treatment.frequency_value * 24;
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      let currentTime = new Date(startDate);

      // Calculate next time based on frequency
      if (currentTime < todayStart) {
        const timeDiff = todayStart.getTime() - currentTime.getTime();
        const frequencyMs = frequencyHours * 60 * 60 * 1000;
        const periodsPassed = Math.floor(timeDiff / frequencyMs) + 1;
        currentTime = new Date(currentTime.getTime() + (periodsPassed * frequencyMs));
      }

      // Generate times for today
      while (currentTime <= todayEnd) {
        schedule.push({
          id: `${treatment.id}_${currentTime.getTime()}`,
          scheduled_time: currentTime.toISOString(),
          status: 'pendente',
          treatment_id: treatment.id,
          medication: treatment.medication,
          dosage: treatment.dosage,
          member_name: member.name,
          member_avatar_uri: member.avatar_uri || '',
        });

        currentTime = new Date(currentTime.getTime() + (frequencyHours * 60 * 60 * 1000));
      }
    });

    return schedule.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
  };

  const handleMemberPress = (member: Member) => {
    navigation.navigate('MemberDetail', { id: member.id });
  };

  const getMemberCardColor = (index: number) => {
    const colors = ['#E6E0FF', '#FFE0E0', '#D4F5E1', '#FFF3D4'];
    return colors[index % colors.length];
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  };

  const handleAddMember = () => {
    navigation.navigate('AddMember');
  };

  const handleViewTreatments = () => {
    navigation.navigate('TreatmentsStack');
  };

  const handleAddTreatment = () => {
    navigation.navigate('AddTreatment');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleViewSettings = () => {
    navigation.navigate('Settings');
  };

  const handleMarkAsDone = (scheduleId: string) => {
    setTodaysSchedule(prevSchedule => 
      prevSchedule.map(item => 
        item.id === scheduleId ? { ...item, status: 'tomado' } : item
      )
    );
    Alert.alert('Sucesso', 'Medicamento marcado como tomado!');
  };

  const handleNotificationPress = () => {
    const overdueItems = todaysSchedule.filter(item => 
      item.status === 'pendente' && new Date(item.scheduled_time) < new Date()
    );
    
    if (overdueItems.length > 0) {
      setShowNotificationsModal(true);
    } else {
      Alert.alert('Sem Alertas', 'Não há medicamentos em atraso no momento.');
    }
  };

  const getOverdueItems = () => {
    return todaysSchedule.filter(item => 
      item.status === 'pendente' && new Date(item.scheduled_time) < new Date()
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#b081ee']}
          tintColor="#b081ee"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <Animated.View style={[styles.welcomeSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.welcomeContent}>
          <View style={styles.avatarContainer}>
            <Image source={require('../assets/images/medica-avatar.png')} style={styles.avatarImage} resizeMode="contain" />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              Olá, {profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
          </View>
          
          {/* Notification Bell */}
          <TouchableOpacity style={styles.notificationBell} onPress={handleNotificationPress}>
            <Ionicons name="notifications" size={24} color="rgba(255,255,255,0.9)" />
            {todaysSchedule.filter(item => item.status === 'pendente' && new Date(item.scheduled_time) < new Date()).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {todaysSchedule.filter(item => item.status === 'pendente' && new Date(item.scheduled_time) < new Date()).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Summary */}
        <View style={styles.dailySummary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryText}>
                {todaysSchedule.length} medicamento{todaysSchedule.length !== 1 ? 's' : ''} hoje
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryText}>
                {todaysSchedule.filter(item => item.status === 'tomado').length} concluído{todaysSchedule.filter(item => item.status === 'tomado').length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          {todaysSchedule.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.round((todaysSchedule.filter(item => item.status === 'tomado').length / todaysSchedule.length) * 100)}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((todaysSchedule.filter(item => item.status === 'tomado').length / todaysSchedule.length) * 100)}% concluído
              </Text>
            </View>
          )}


        </View>
      </Animated.View>

      {/* Agenda de Hoje - Área Rolável */}
      <View style={styles.agendaContainer}>
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
            <TouchableOpacity onPress={handleViewTreatments}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {todaysSchedule.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#8A8A8A" />
              <Text style={styles.emptyText}>Nenhum tratamento para hoje</Text>
              <Text style={styles.emptySubtext}>Adicione membros e tratamentos para começar</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.scheduleScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.scheduleList}>
                {todaysSchedule.map((item, index) => (
                  <View key={item.id} style={styles.scheduleItem}>
                    {/* Avatar do Membro */}
                    <View style={styles.scheduleMemberAvatar}>
                      {item.member_avatar_uri ? (
                        <Image source={{ uri: item.member_avatar_uri }} style={styles.scheduleAvatar} />
                      ) : (
                        <View style={styles.scheduleAvatarPlaceholder}>
                          <FontAwesome name="user" size={12} color="#b081ee" />
                        </View>
                      )}
                    </View>

                    {/* Horário */}
                    <View style={styles.scheduleTimeContainer}>
                      <Text style={[
                        styles.scheduleTime,
                        item.status === 'tomado' && styles.scheduleTimeDone
                      ]}>
                        {new Date(item.scheduled_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      <View style={[
                        styles.scheduleStatusDot, 
                        item.status === 'tomado' && styles.scheduleStatusDotDone
                      ]} />
                    </View>
                    
                    {/* Conteúdo do Medicamento */}
                    <View style={styles.scheduleContent}>
                      <Text style={[
                        styles.scheduleMedication,
                        item.status === 'tomado' && styles.scheduleMedicationDone
                      ]} numberOfLines={1}>
                        {item.medication}
                      </Text>
                      <Text style={[
                        styles.scheduleDosage,
                        item.status === 'tomado' && styles.scheduleDosageDone
                      ]} numberOfLines={1}>
                        {item.dosage}
                      </Text>
                    </View>
                    
                    {/* Botão de Ação */}
                    <TouchableOpacity 
                      style={[styles.scheduleAction, item.status === 'tomado' && styles.scheduleActionDone]}
                      onPress={() => handleMarkAsDone(item.id)}
                    >
                      <Ionicons 
                        name={item.status === 'tomado' ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={20} 
                        color={item.status === 'tomado' ? '#fff' : '#b081ee'} 
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>

      {/* Membros da Família - Fixo no Final */}
      <View style={styles.fixedMembersContainer}>
        <Animated.View style={[styles.membersSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membros da Família</Text>
            <TouchableOpacity onPress={handleAddMember}>
              <Text style={styles.viewAllText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {members.length === 0 ? (
            <View style={styles.emptyStateMini}>
              <Ionicons name="people-outline" size={32} color="#8A8A8A" />
              <Text style={styles.emptyTextMini}>Nenhum membro cadastrado</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
              {members.map((member, index) => (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberCard, { backgroundColor: getMemberCardColor(index) }]}
                  onPress={() => handleMemberPress(member)}
                >
                  {member.avatar_uri ? (
                    <Image source={{ uri: member.avatar_uri }} style={styles.memberAvatar} />
                  ) : (
                    <View style={styles.memberAvatarPlaceholder}>
                      <FontAwesome name="user" size={24} color="#b081ee" />
                    </View>
                  )}
                  <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                  <Text style={styles.memberRelation} numberOfLines={1}>{member.relation}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>

      {/* Modal de Medicamentos em Atraso */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medicamentos em Atraso</Text>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.overdueList} showsVerticalScrollIndicator={false}>
              {getOverdueItems().map((item, index) => (
                <View key={item.id} style={styles.overdueItem}>
                  {/* Avatar do Membro */}
                  <View style={styles.overdueAvatar}>
                    {item.member_avatar_uri ? (
                      <Image source={{ uri: item.member_avatar_uri }} style={styles.overdueAvatarImage} />
                    ) : (
                      <View style={styles.overdueAvatarPlaceholder}>
                        <FontAwesome name="user" size={16} color="#ff6b6b" />
                      </View>
                    )}
                  </View>

                  {/* Informações do Medicamento */}
                  <View style={styles.overdueInfo}>
                    <Text style={styles.overdueMedication}>{item.medication}</Text>
                    <Text style={styles.overdueMember}>{item.member_name}</Text>
                    <Text style={styles.overdueDosage}>{item.dosage}</Text>
                    <Text style={styles.overdueTime}>
                      Previsto para: {new Date(item.scheduled_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>

                  {/* Botão de Ação */}
                  <TouchableOpacity 
                    style={styles.overdueActionButton}
                    onPress={() => {
                      handleMarkAsDone(item.id);
                      // Se não há mais itens em atraso, fecha o modal
                      const remainingOverdue = getOverdueItems().filter(overdueItem => overdueItem.id !== item.id);
                      if (remainingOverdue.length === 0) {
                        setShowNotificationsModal(false);
                      }
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Botão para Fechar */}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowNotificationsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    backgroundColor: '#b081ee',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d1155',
    textAlign: 'center',
  },
  // Schedule styles
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#b081ee',
  },
  scheduleMemberAvatar: {
    marginRight: 12,
  },
  scheduleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  scheduleAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(176, 129, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  scheduleTimeContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d1155',
    marginBottom: 4,
  },
  scheduleStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b081ee',
  },
  scheduleStatusDotDone: {
    backgroundColor: '#34C759',
  },
  scheduleContent: {
    flex: 1,
    marginRight: 12,
  },
  scheduleMedication: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  scheduleMember: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleDosage: {
    fontSize: 12,
    color: '#666',
  },
  scheduleTimeDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  scheduleMedicationDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  scheduleDosageDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  scheduleAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(176, 129, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleActionDone: {
    backgroundColor: '#34C759',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
    marginRight: 4,
  },
  // Members styles
  membersScroll: {
    paddingHorizontal: 4,
  },
  memberCard: {
    width: 120,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  memberRelation: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Daily Summary styles
  dailySummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD60A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  overdueText: {
    fontSize: 12,
    color: '#FFD60A',
    marginLeft: 6,
    fontWeight: '600',
  },
  // Notification Bell styles
  notificationBell: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD60A',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  notificationBadgeText: {
    color: '#2d1155',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  overdueList: {
    maxHeight: 400,
  },
  overdueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  overdueAvatar: {
    marginRight: 12,
  },
  overdueAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  overdueAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  overdueInfo: {
    flex: 1,
    marginRight: 12,
  },
  overdueMedication: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  overdueMember: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
    marginBottom: 2,
  },
  overdueDosage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  overdueTime: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  overdueActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New layout styles
  agendaContainer: {
    marginTop: 10,
    marginBottom: 0,
  },
  scheduleScrollView: {
    maxHeight: 320,
    paddingHorizontal: 4,
  },
  fixedMembersContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 0,
    paddingBottom: 20,
    marginTop: -10,
  },
  membersSection: {
    paddingHorizontal: 16,
  },
  emptyStateMini: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTextMini: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});