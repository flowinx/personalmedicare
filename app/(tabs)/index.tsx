import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnimatedButton } from '../../components/AnimatedButton';
import { AnimatedCard } from '../../components/AnimatedCard';
import { useEntranceAnimation } from '../../utils/animations';

export default function HomeScreen() {
  const router = useRouter();
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Animado */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.userInfo}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100' }}
              style={styles.avatar}
            />
          </Animated.View>
          <View>
            <Text style={styles.greeting}>Olá, Marcos!</Text>
            <Text style={styles.subGreeting}>Como você está hoje?</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color="#555" />
        </TouchableOpacity>
      </Animated.View>

      {/* Barra de Pesquisa Animada */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={20} color="#8A8A8A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar Doutor"
            placeholderTextColor="#8A8A8A"
          />
        </View>
        <AnimatedButton
          title=""
          onPress={() => {}}
          variant="primary"
          size="small"
          icon={<Ionicons name="options-outline" size={20} color="white" />}
          style={styles.filterButton}
        />
      </Animated.View>

      {/* Seção Menu Principal */}
      <Animated.View 
        style={[
          styles.sectionHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Menu Principal</Text>
      </Animated.View>
      
      <View style={styles.menuContainer}>
        <AnimatedCard
          delay={100}
          onPress={() => router.push('/(tabs)/addMember')}
          style={styles.menuCard}
        >
          <View style={styles.menuItem}>
            <FontAwesome name="user-plus" size={28} color="#8A7DFF" />
            <Text style={styles.menuItemText}>Cadastrar Membro</Text>
          </View>
        </AnimatedCard>
        
        <AnimatedCard
          delay={200}
          onPress={() => router.push('/(drawer)/addTreatment')}
          style={styles.menuCard}
        >
          <View style={styles.menuItem}>
            <FontAwesome name="plus-square" size={28} color="#34C759" />
            <Text style={styles.menuItemText}>Novo Tratamento</Text>
          </View>
        </AnimatedCard>
      </View>

      {/* Seção Tratamentos Ativos */}
      <Animated.View 
        style={[
          styles.sectionHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Tratamentos Ativos</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver Todos</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.treatmentList}>
        <AnimatedCard delay={300} style={styles.treatmentCard}>
          <View style={styles.treatmentItem}>
            <View style={styles.treatmentIcon}>
              <FontAwesome name="medkit" size={20} color="#b081ee" />
            </View>
            <View>
              <Text style={styles.treatmentName}>Amoxicilina - João Silva</Text>
              <Text style={styles.treatmentTime}>Próxima dose: Hoje às 14:00</Text>
            </View>
          </View>
        </AnimatedCard>
        
        <AnimatedCard delay={400} style={styles.treatmentCard}>
          <View style={styles.treatmentItem}>
            <View style={styles.treatmentIcon}>
               <FontAwesome name="medkit" size={20} color="#34C759" />
            </View>
            <View>
              <Text style={styles.treatmentName}>Vitamina D - Maria Silva</Text>
              <Text style={styles.treatmentTime}>Próxima dose: Amanhã às 09:00</Text>
            </View>
          </View>
        </AnimatedCard>
      </View>

      {/* Seção Membros da Família */}
      <Animated.View 
        style={[
          styles.sectionHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Membros da Família</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver Todos</Text>
        </TouchableOpacity>
      </Animated.View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AnimatedCard
            delay={500}
            onPress={() => router.push('/(tabs)/memberDetail')}
            style={styles.memberCard}
            backgroundColor="#E6E0FF"
          >
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=pai' }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>João Silva</Text>
            <Text style={styles.memberRelation}>Pai</Text>
          </AnimatedCard>
          
          <AnimatedCard
            delay={600}
            onPress={() => router.push('/(tabs)/memberDetail')}
            style={styles.memberCard}
            backgroundColor="#FFE0E0"
          >
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=mae' }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>Maria Silva</Text>
            <Text style={styles.memberRelation}>Mãe</Text>
          </AnimatedCard>

          <AnimatedCard
            delay={700}
            onPress={() => router.push('/(tabs)/memberDetail')}
            style={styles.memberCard}
            backgroundColor="#D4F5E1"
          >
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=filho' }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>Lucas Silva</Text>
            <Text style={styles.memberRelation}>Filho</Text>
          </AnimatedCard>
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
    borderWidth: 2,
    borderColor: '#b081ee',
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
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0eaff',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: '#333'
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
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
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  menuCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 0,
  },
  menuItem: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
  treatmentCard: {
    padding: 0,
    marginBottom: 10,
  },
  treatmentItem: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
  memberCard: {
    width: 150,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 15,
    padding: 0,
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
}); 