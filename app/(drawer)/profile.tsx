import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useProfile } from '../../contexts/ProfileContext';
import { getAllMembers } from '../../db/members';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';

export default function ProfileScreen() {
  const { profile, updateProfileData } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [treatmentsCount, setTreatmentsCount] = useState(0);
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  // Carrega os dados do perfil quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (profile) {
        console.log('Profile loaded in profile screen:', profile);
        setName(profile.name && profile.name !== 'Nome do Usuário' ? profile.name : '');
        setEmail(profile.email && profile.email !== 'usuario@email.com' ? profile.email : '');
        setAvatar(profile.avatar_uri ?? null);
        console.log('Avatar URI set to:', profile.avatar_uri);
      }
    }, [profile])
  );

  // Carrega estatísticas
  useFocusEffect(
    useCallback(() => {
      async function loadStats() {
        try {
          const members = await getAllMembers();
          setMembersCount(members.length);
          // TODO: Implementar contador de tratamentos quando a tabela estiver disponível
          setTreatmentsCount(0);
        } catch (error) {
          console.error('Error loading stats:', error);
        }
      }
      loadStats();
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
      console.log('Saving profile with avatar:', avatar);
      await updateProfileData({ name: name.trim(), email: email.trim(), avatar_uri: avatar });
      console.log('Profile saved successfully');
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        >
          {/* Avatar Card */}
          <Animated.View style={[styles.avatarCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <FontAwesome name="user" size={40} color="#b081ee" />
                  </View>
                )}
                <View style={styles.avatarOverlay}>
                  <Ionicons name="camera" size={20} color="white" />
                </View>
              </TouchableOpacity>
              <ThemedText style={styles.avatarText}>Toque para alterar foto</ThemedText>
            </View>
          </Animated.View>

          {/* Profile Form Card */}
          <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label} lightColor="#2d1155" darkColor="#2d1155">Nome</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor="#8A8A8A"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label} lightColor="#2d1155" darkColor="#2d1155">E-mail</ThemedText>
              <View style={styles.inputWrapper}>
                <FontAwesome name="envelope" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu.email@exemplo.com"
                  placeholderTextColor="#8A8A8A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <ThemedText style={styles.saveButtonText} lightColor="#fff" darkColor="#fff">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Container */}
          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
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
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatarButton: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarText: {
    color: '#8A8A8A',
    fontSize: 14,
    textAlign: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#b081ee',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#b081ee',
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7f53ac',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#7f53ac',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f53ac',
    textAlign: 'center',
    minHeight: 40,
    lineHeight: 40,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
}); 