import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getDatabase } from '../../db/index';
import { Member, getAllMembers } from '../../db/members';
import { useThemeColor } from '../../hooks/useThemeColor';

type RootStackParamList = {
    'Cadastrar Membro': undefined;
    'Novo Tratamento': undefined;
    'Tratamentos': undefined;
    'Detalhes do Membro': { id: number };
};

interface ScheduleItem {
    id: number; // schedule id
    scheduled_time: string;
    status: 'pendente' | 'tomado';
    treatment_id: number;
    medication: string;
    dosage: string;
    member_name: string;
    member_avatar_uri: string;
}

interface Alert {
  id: number;
  mensagem: string;
  lido: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [members, setMembers] = useState<Member[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch Members
          const allMembers = await getAllMembers();
          setMembers(allMembers);

          // Fetch Today's Schedule
          const today = new Date();
          const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
          const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

          const db = await getDatabase();
          const scheduleItems = await db.getAllAsync<ScheduleItem>(
            `SELECT s.id, s.scheduled_time, s.status, s.treatment_id, t.medication, t.dosage, m.name as member_name, m.avatar_uri as member_avatar_uri
            FROM schedule s
            JOIN treatments t ON s.treatment_id = t.id
            JOIN members m ON t.member_id = m.id
            WHERE s.scheduled_time >= ? AND s.scheduled_time <= ?
            ORDER BY s.scheduled_time ASC
          `, [todayStart, todayEnd]);
          setTodaysSchedule(scheduleItems);

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

  const handleMarkAsDone = async (scheduleId: number) => {
    try {
      const db = await getDatabase();
      await db.runAsync('UPDATE schedule SET status = ? WHERE id = ?', 'tomado', scheduleId);
      // Refresh schedule
      setTodaysSchedule(prevSchedule => 
        prevSchedule.map(item => 
          item.id === scheduleId ? { ...item, status: 'tomado' } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark as done:", error);
    }
  };

  const memberCardColors = ['#E6E0FF', '#FFE0E0', '#D4F5E1', '#FFF3D4'];

  // Filtra a agenda pelo nome do medicamento
  const filteredSchedule = search.trim().length === 0
    ? todaysSchedule
    : todaysSchedule.filter(t => t.medication.toLowerCase().includes(search.toLowerCase()));

  return (
    <ThemedView style={styles.container}>
      <View style={{paddingHorizontal: 20}}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={require('../../assets/images/medica-avatar.png')}
              style={styles.avatar}
            />
            <View>
              <ThemedText style={styles.greeting}>Olá, Marcos!</ThemedText>
              <ThemedText style={styles.subGreeting}>Como você está hoje?</ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowAlerts(true)} style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={28} color={useThemeColor({}, 'icon')} />
            {alerts.some(a => !a.lido) && (
              <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'red', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{alerts.filter(a => !a.lido).length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { marginBottom: 10 }]}> 
          <View style={styles.searchBar}>
            <FontAwesome name="search" size={20} color="#8A8A8A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar Medicamento"
              placeholderTextColor="#8A8A8A"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Agenda de Hoje</ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate('Tratamentos')}>
            <ThemedText style={styles.seeAll}>Ver Todos</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.treatmentList}>
          {filteredSchedule.length === 0 && (
            <ThemedText style={{ textAlign: 'center', marginVertical: 10 }}>Nenhuma dose agendada para hoje.</ThemedText>
          )}
          {filteredSchedule.map((item) => (
            <View key={item.id} style={[styles.treatmentItem, item.status === 'tomado' && styles.treatmentItemDone]}>
              <Image 
                source={{ uri: item.member_avatar_uri || `https://i.pravatar.cc/100?u=${item.member_name}` }}
                style={styles.treatmentAvatar}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.treatmentName, item.status === 'tomado' && styles.treatmentTextDone]} lightColor="#2d1155" darkColor="#2d1155">
                  {item.medication}
                </ThemedText>
                <ThemedText style={[styles.treatmentTime, item.status === 'tomado' && styles.treatmentTextDone]} lightColor="#2d1155" darkColor="#2d1155">
                  {item.dosage} • {new Date(item.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>
              {item.status === 'pendente' && (
                  <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => handleMarkAsDone(item.id)}>
                      <FontAwesome name="check-circle-o" size={24} color="#34C759" />
                  </TouchableOpacity>
              )}
              {item.status === 'tomado' && (
                  <FontAwesome name="check-circle" size={24} color="#34C759" style={{ opacity: 0.5, marginHorizontal: 8 }} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{paddingHorizontal: 20}}>
        <View style={[styles.sectionHeader, {marginTop: 20}]}>
          <ThemedText style={styles.sectionTitle}>Membros da Família</ThemedText>
        </View>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {members.map((member, index) => (
              <Pressable
                key={member.id}
                style={({ pressed }) => [styles.memberCard, {backgroundColor: memberCardColors[index % memberCardColors.length]}, pressed && { opacity: 0.8 }]}
                onPress={() => member.id && navigation.navigate('Detalhes do Membro', { id: member.id })}
              >
                <Image source={{ uri: member.avatar_uri || 'https://i.pravatar.cc/150?u=' + member.name }} style={styles.memberAvatar} />
                <ThemedText style={styles.memberName} lightColor="#2d1155" darkColor="#2d1155">{member.name}</ThemedText>
                <ThemedText style={styles.memberRelation} lightColor="#2d1155" darkColor="#2d1155">{member.relation}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal de Alertas */}
      <Modal visible={showAlerts} animationType="slide" transparent onRequestClose={() => setShowAlerts(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, minWidth: 280, maxWidth: 340 }}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Alertas</ThemedText>
            {alerts.length === 0 && <ThemedText style={{ color: '#888' }}>Nenhum alerta no momento.</ThemedText>}
            {alerts.map(alerta => (
              <View key={alerta.id} style={{ marginBottom: 10 }}>
                <ThemedText style={{ color: alerta.lido ? '#aaa' : '#b081ee', fontWeight: alerta.lido ? 'normal' : 'bold' }}>{alerta.mensagem}</ThemedText>
              </View>
            ))}
            <TouchableOpacity style={{ marginTop: 16, alignSelf: 'flex-end' }} onPress={() => { setShowAlerts(false); setAlerts(alerts.map(a => ({ ...a, lido: true }))); }}>
              <ThemedText style={{ color: '#b081ee', fontWeight: 'bold' }}>Fechar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: '#333'
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
  },
  seeAll: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberCard: {
    width: 120,
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    marginRight: 10,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  memberRelation: {
    fontSize: 12,
  },
  treatmentList: {
    marginBottom: 20,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  treatmentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  treatmentTime: {
    fontSize: 14,
  },
  treatmentItemDone: {
    backgroundColor: '#f0f0f0',
  },
  treatmentTextDone: {
    textDecorationLine: 'line-through',
  },
  addMemberCard: {
    width: 120,
    height: 155, // Adjust height to match other cards
    justifyContent: 'center',
  },
  addMemberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b081ee',
    marginTop: 5,
  },
}); 