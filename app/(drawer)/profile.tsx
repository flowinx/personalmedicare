import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getAllMembers } from '../../db/members';
import { getProfile, updateProfile } from '../../db/profile';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [treatmentsCount, setTreatmentsCount] = useState(0);
  const navigation = useNavigation();

  // Carrega os dados do perfil quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const profile = await getProfile();
        if (profile) {
          setName(profile.name && profile.name !== 'Nome do Usuário' ? profile.name : '');
          setEmail(profile.email && profile.email !== 'usuario@email.com' ? profile.email : '');
          setAvatar(profile.avatar_uri ?? null);
        }
        
        // Carregar contadores
        try {
          const members = await getAllMembers();
          setMembersCount(members.length);
          // TODO: Implementar contador de tratamentos quando a tabela estiver disponível
          setTreatmentsCount(0);
        } catch (error) {
          console.error('Erro ao carregar contadores:', error);
        }
      }
      loadProfile();
    }, [])
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), avatar_uri: avatar });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (e) {
      console.error("Erro ao salvar perfil:", e);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Editar Perfil</ThemedText>
        
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image 
              source={{ uri: avatar || 'https://i.pravatar.cc/150?u=user' }} 
              style={styles.avatar}
            />
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label} lightColor="#2d1155" darkColor="#2d1155">Nome</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label} lightColor="#2d1155" darkColor="#2d1155">E-mail</ThemedText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <ThemedText style={styles.saveButtonText} lightColor="#fff" darkColor="#fff">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle} lightColor="#2d1155" darkColor="#2d1155">Estatísticas</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber} lightColor="#2d1155" darkColor="#2d1155">{membersCount}</ThemedText>
              <ThemedText style={styles.statLabel} lightColor="#2d1155" darkColor="#2d1155">Membros</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber} lightColor="#2d1155" darkColor="#2d1155">{treatmentsCount}</ThemedText>
              <ThemedText style={styles.statLabel} lightColor="#2d1155" darkColor="#2d1155">Tratamentos</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0eaff',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#b081ee',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#b081ee',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
}); 