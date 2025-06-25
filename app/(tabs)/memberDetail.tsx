import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dados de exemplo
const member = {
  name: 'João Silva',
  relation: 'Pai',
  avatar: 'https://i.pravatar.cc/150?u=pai',
  age: '52 anos',
  bloodType: 'O+',
  allergies: 'Nenhuma',
  notes: 'Hipertenso. Faz uso contínuo de Losartana. Aferir pressão diariamente pela manhã.'
};

export default function MemberDetailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.relation}>{member.relation}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{member.age}</Text>
              <Text style={styles.statLabel}>Idade</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{member.bloodType}</Text>
              <Text style={styles.statLabel}>Tipo Sanguíneo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{member.allergies}</Text>
              <Text style={styles.statLabel}>Alergias</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Observações Médicas</Text>
          <Text style={styles.notes}>{member.notes}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.mainButton}>
        <Text style={styles.mainButtonText}>Novo Tratamento</Text>
      </TouchableOpacity>
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
    height: 350,
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
  contentContainer: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
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
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  notes: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
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
}); 