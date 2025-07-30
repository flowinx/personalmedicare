import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { updateProfile } from '../services/firebase';
import StatisticsService, { UserStatistics } from '../services/statistics';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setAvatarUri(profile.avatar_uri);
    } else if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setAvatarUri(user.photoURL);
    }
  }, [profile, user]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await StatisticsService.getUserStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handlePickImage = async () => {
    try {
      console.log('[ProfileScreen] Iniciando seleção de imagem...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduzir qualidade para 50%
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[ProfileScreen] Imagem selecionada, iniciando compressão...');
        
        // Comprimir e redimensionar imagem
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [
            { resize: { width: 800, height: 800 } }, // Redimensionar para 800x800
          ],
          {
            compress: 0.7, // Compressão adicional
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        console.log('[ProfileScreen] Imagem comprimida com sucesso');
        setAvatarUri(manipulatedImage.uri);
      }
    } catch (error) {
      console.error('[ProfileScreen] Erro ao selecionar/comprimir imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }

    setLoading(true);
    if (avatarUri) {
      setUploadingImage(true);
    }
    
    try {
      console.log('[ProfileScreen] Iniciando salvamento do perfil...');
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        avatar_uri: avatarUri,
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setAvatarUri(profile.avatar_uri);
    }
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={editing ? handlePickImage : undefined}
            disabled={!editing}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#b081ee" />
              </View>
            )}
            {editing && (
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.infoText}>{name || 'Não informado'}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoText}>{email || 'Não informado'}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ID do Usuário</Text>
            <Text style={[styles.infoText, styles.userId]}>{user?.uid}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Método de Login</Text>
            <Text style={styles.infoText}>
              {user?.providerData[0]?.providerId === 'google.com' ? 'Google' :
               user?.providerData[0]?.providerId === 'apple.com' ? 'Apple' :
               'Email/Senha'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {editing ? (
            <View style={styles.editingActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>
                      {uploadingImage ? 'Salvando imagem...' : 'Salvando...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create" size={20} color="#b081ee" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          {loadingStats ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color="#b081ee" />
              <Text style={styles.statsLoadingText}>Carregando estatísticas...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="people" size={24} color="#b081ee" />
                  <Text style={styles.statNumber}>{statistics?.totalMembers || 0}</Text>
                  <Text style={styles.statLabel}>Membros</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="medical" size={24} color="#b081ee" />
                  <Text style={styles.statNumber}>{statistics?.activeTreatments || 0}</Text>
                  <Text style={styles.statLabel}>Ativos</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                  <Text style={styles.statNumber}>{statistics?.completedTodayCount || 0}</Text>
                  <Text style={styles.statLabel}>Hoje</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="time" size={24} color="#FF9500" />
                  <Text style={styles.statNumber}>{statistics?.pendingTodayCount || 0}</Text>
                  <Text style={styles.statLabel}>Pendentes</Text>
                </View>
              </View>

              {/* Additional Stats */}
              {statistics && (
                <View style={styles.additionalStats}>
                  <View style={styles.statRow}>
                    <Text style={styles.statRowLabel}>Total de Tratamentos:</Text>
                    <Text style={styles.statRowValue}>{statistics.totalTreatments}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statRowLabel}>Agenda de Hoje:</Text>
                    <Text style={styles.statRowValue}>{statistics.todayScheduleCount} medicamentos</Text>
                  </View>
                  {statistics.overdueTodayCount > 0 && (
                    <View style={[styles.statRow, styles.overdueRow]}>
                      <Text style={styles.statRowLabel}>Em Atraso:</Text>
                      <Text style={[styles.statRowValue, styles.overdueValue]}>{statistics.overdueTodayCount}</Text>
                    </View>
                  )}
                  {statistics.mostUsedMedication.medication && (
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Medicamento Mais Usado:</Text>
                      <Text style={styles.statRowValue}>{statistics.mostUsedMedication.medication}</Text>
                    </View>
                  )}
                  {statistics.memberWithMostTreatments.member && (
                    <View style={styles.statRow}>
                      <Text style={styles.statRowLabel}>Membro com Mais Tratamentos:</Text>
                      <Text style={styles.statRowValue}>{statistics.memberWithMostTreatments.member.name}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Insights */}
              {statistics && (
                <View style={styles.insightsSection}>
                  <Text style={styles.insightsTitle}>Insights</Text>
                  {StatisticsService.getInsights(statistics).map((insight, index) => (
                    <View key={index} style={styles.insightItem}>
                      <Ionicons name="bulb" size={16} color="#b081ee" />
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                  {StatisticsService.getInsights(statistics).length === 0 && (
                    <Text style={styles.noInsights}>Continue usando o app para ver insights personalizados!</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  userId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  actionsSection: {
    marginBottom: 20,
  },
  editingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b081ee',
  },
  editButtonText: {
    color: '#b081ee',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#b081ee',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  additionalStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  overdueRow: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  overdueValue: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  insightsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  noInsights: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});