import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAllTreatments } from '../../db/index';
import { Member, getMemberById } from '../../db/members';

type RootStackParamList = {
  'Editar Membro': { id: string };
  'Novo Tratamento': { memberId: string };
  'Dossiê do Membro': { id: string };
};

interface Treatment {
    id: string;
    medication: string;
    dosage: string;
    start_datetime: string;
    status: string;
}

export default function MemberDetailScreen() {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const memberId = ((route.params as any)?.id ? String((route.params as any).id) : '');
  const [member, setMember] = useState<Member | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  const loadData = useCallback(async () => {
    if (!memberId) return;
    try {
      const memberData = await getMemberById(memberId);
      setMember(memberData);

      if (memberData) {
        const allTreatments = await getAllTreatments();
        const memberTreatments = allTreatments
          .filter(treatment => treatment.member_id === memberId)
          .map(treatment => ({
            id: treatment.id,
            medication: treatment.medication,
            dosage: treatment.dosage,
            start_datetime: treatment.start_datetime,
            status: treatment.status
          }));
        setTreatments(memberTreatments);
      }
    } catch (error) {
      console.error("Failed to load member or treatment data:", error);
    }
  }, [memberId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!member) {
    return <Text>Carregando...</Text>; // Ou um spinner
  }

  const getAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) { // Check for invalid date
        const parts = dob.split('/');
        if (parts.length === 3) {
            // Assuming DD/MM/YYYY
            const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            const parsedDate = new Date(isoDate);
            if (!isNaN(parsedDate.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - parsedDate.getFullYear();
                const m = today.getMonth() - parsedDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < parsedDate.getDate())) {
                    age--;
                }
                return `${age} anos`;
            }
        }
        return 'N/A';
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age} anos`;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: member.avatar_uri || 'https://i.pravatar.cc/300' }} style={styles.avatar} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Editar Membro', { id: memberId })} style={styles.editButton}>
            <FontAwesome name="pencil" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.relation}>{member.relation}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getAge(member.dob)}</Text>
              <Text style={styles.statLabel}>Idade</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>O+</Text>
              <Text style={styles.statLabel}>Tipo Sanguíneo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Nenhuma</Text>
              <Text style={styles.statLabel}>Alergias</Text>
            </View>
          </View>
          


          <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Dossiê do Membro', { id: memberId })}>
            <Text style={styles.reportButtonText}>Ver Dossiê</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Pressable onPress={() => navigation.navigate('Novo Tratamento', { memberId })} style={styles.mainButton}>
        <Text style={styles.mainButtonText}>Novo Tratamento</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  imageContainer: {
    width: '100%',
    height: 280,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 5,
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -80,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  relation: {
    fontSize: 18,
    color: '#8A8A8A',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b081ee',
  },
  statLabel: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 5,
  },

  mainButton: {
    backgroundColor: '#b081ee',
    borderRadius: 15,
    padding: 18,
    margin: 20,
    alignItems: 'center',
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  reportButton: {
    backgroundColor: '#b081ee',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});