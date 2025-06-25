import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Olá, Marcos!</Text>
            <Text style={styles.subGreeting}>Como você está hoje?</Text>
          </View>
        </View>
        <Ionicons name="notifications-outline" size={28} color="#555" />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={20} color="#8A8A8A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar Doutor"
            placeholderTextColor="#8A8A8A"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
             <Ionicons name="options-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Seção Menu Principal */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Menu Principal</Text>
      </View>
      <View style={styles.menuContainer}>
        <Pressable
          onPress={() => router.push('/(tabs)/addMember')}
          style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: '#E6E0FF' },
              pressed && { opacity: 0.7 }
            ]}>
            <FontAwesome name="user-plus" size={28} color="#8A7DFF" />
            <Text style={styles.menuItemText}>Cadastrar Membro</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: '#D4F5E1' },
            pressed && { opacity: 0.7 }
          ]}>
          <FontAwesome name="plus-square" size={28} color="#34C759" />
          <Text style={styles.menuItemText}>Novo Tratamento</Text>
        </Pressable>
      </View>

      {/* Seção Tratamentos Ativos */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tratamentos Ativos</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver Todos</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.treatmentList}>
        <View style={styles.treatmentItem}>
          <View style={styles.treatmentIcon}>
            <FontAwesome name="medkit" size={20} color="#b081ee" />
          </View>
          <View>
            <Text style={styles.treatmentName}>Amoxicilina - João Silva</Text>
            <Text style={styles.treatmentTime}>Próxima dose: Hoje às 14:00</Text>
          </View>
        </View>
        <View style={styles.treatmentItem}>
          <View style={styles.treatmentIcon}>
             <FontAwesome name="medkit" size={20} color="#34C759" />
          </View>
          <View>
            <Text style={styles.treatmentName}>Vitamina D - Maria Silva</Text>
            <Text style={styles.treatmentTime}>Próxima dose: Amanhã às 09:00</Text>
          </View>
        </View>
      </View>

      {/* Seção Membros da Família */}
      <View style={[styles.sectionHeader, {marginTop: 20}]}>
        <Text style={styles.sectionTitle}>Membros da Família</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver Todos</Text>
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Card de Membro da Família */}
          <Pressable onPress={() => router.push('/(tabs)/memberDetail')} style={({ pressed }) => [styles.memberCard, {backgroundColor: '#E6E0FF'}, pressed && { opacity: 0.8 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=pai' }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>João Silva</Text>
            <Text style={styles.memberRelation}>Pai</Text>
          </Pressable>
          
          {/* Card de Membro da Família */}
          <Pressable onPress={() => router.push('/(tabs)/memberDetail')} style={({ pressed }) => [styles.memberCard, {backgroundColor: '#FFE0E0'}, pressed && { opacity: 0.8 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=mae' }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>Maria Silva</Text>
            <Text style={styles.memberRelation}>Mãe</Text>
          </Pressable>

          {/* Card de Membro da Família */}
          <Pressable onPress={() => router.push('/(tabs)/memberDetail')} style={({ pressed }) => [styles.memberCard, {backgroundColor: '#D4F5E1'}, pressed && { opacity: 0.8 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=filho' }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>Lucas Silva</Text>
            <Text style={styles.memberRelation}>Filho</Text>
          </Pressable>
        </ScrollView>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingTop: 60,
    paddingHorizontal: 20,
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
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#8A8A8A',
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
  filterButton: {
    backgroundColor: '#b081ee',
    padding: 12,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: 'bold',
  },
  memberCard: {
    width: 150,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginRight: 15,
  },
  memberAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberRelation: {
    fontSize: 14,
    color: '#8A8A8A',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  menuItem: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  menuItemText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },
  treatmentList: {
    marginBottom: 20,
  },
  treatmentItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  treatmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  treatmentTime: {
    fontSize: 14,
    color: '#8A8A8A',
  },
}); 