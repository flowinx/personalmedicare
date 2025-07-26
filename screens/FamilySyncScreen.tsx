import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { 
  createFamily, 
  joinFamily, 
  getFamilyByCode, 
  getFamilyMembers, 
  leaveFamily, 
  removeFamilyMember,
  generateNewFamilyCode,
  getUserFamily
} from '../services/familyService';

interface FamilySyncScreenProps {
  navigation: any;
}

interface FamilyMember {
  userId: string;
  role: 'admin' | 'member';
  name: string;
  email: string;
  joinedAt: Date;
}

interface Family {
  id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

export default function FamilySyncScreen({ navigation }: FamilySyncScreenProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userFamily = await getUserFamily(user.uid);
      if (userFamily) {
        setFamily(userFamily.family);
        setIsAdmin(userFamily.family.createdBy === user.uid);
        
        const members = await getFamilyMembers(userFamily.family.id);
        setFamilyMembers(members);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da família:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Erro', 'Digite um nome para a família');
      return;
    }

    if (!user || !profile) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      const newFamily = await createFamily({
        name: familyName.trim(),
        createdBy: user.uid,
        adminName: profile.name || user.displayName || 'Usuário',
        adminEmail: profile.email || user.email || '',
      });

      setFamily(newFamily);
      setIsAdmin(true);
      setShowCreateModal(false);
      setFamilyName('');
      
      await loadFamilyData();
      
      Alert.alert(
        'Família Criada!',
        `Sua família "${newFamily.name}" foi criada com sucesso!\n\nCódigo: ${newFamily.code}\n\nCompartilhe este código com outros membros da família.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Erro ao criar família:', error);
      Alert.alert('Erro', error.message || 'Não foi possível criar a família');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!familyCode.trim()) {
      Alert.alert('Erro', 'Digite o código da família');
      return;
    }

    if (!user || !profile) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      const familyData = await getFamilyByCode(familyCode.trim().toUpperCase());
      
      if (!familyData) {
        Alert.alert('Erro', 'Código inválido ou família não encontrada');
        return;
      }

      await joinFamily({
        familyId: familyData.id,
        userId: user.uid,
        userName: profile.name || user.displayName || 'Usuário',
        userEmail: profile.email || user.email || '',
      });

      setFamily(familyData);
      setIsAdmin(false);
      setShowJoinModal(false);
      setFamilyCode('');
      
      await loadFamilyData();
      
      Alert.alert(
        'Entrou na Família!',
        `Você agora faz parte da família "${familyData.name}".`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Erro ao entrar na família:', error);
      Alert.alert('Erro', error.message || 'Não foi possível entrar na família');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveFamily = () => {
    if (!family || !user) return;

    Alert.alert(
      'Sair da Família',
      `Tem certeza que deseja sair da família "${family.name}"?\n\nVocê perderá acesso aos dados compartilhados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await leaveFamily(family.id, user.uid);
              setFamily(null);
              setFamilyMembers([]);
              setIsAdmin(false);
              
              Alert.alert('Saiu da Família', 'Você saiu da família com sucesso.');
            } catch (error: any) {
              console.error('Erro ao sair da família:', error);
              Alert.alert('Erro', 'Não foi possível sair da família');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRemoveMember = (member: FamilyMember) => {
    if (!family || !isAdmin) return;

    Alert.alert(
      'Remover Membro',
      `Tem certeza que deseja remover ${member.name} da família?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await removeFamilyMember(family.id, member.userId);
              await loadFamilyData();
              
              Alert.alert('Membro Removido', `${member.name} foi removido da família.`);
            } catch (error: any) {
              console.error('Erro ao remover membro:', error);
              Alert.alert('Erro', 'Não foi possível remover o membro');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGenerateNewCode = () => {
    if (!family || !isAdmin) return;

    Alert.alert(
      'Gerar Novo Código',
      'Isso invalidará o código atual. Membros que ainda não entraram precisarão do novo código.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar',
          onPress: async () => {
            setLoading(true);
            try {
              const newCode = await generateNewFamilyCode(family.id);
              setFamily({ ...family, code: newCode });
              
              Alert.alert(
                'Novo Código Gerado',
                `Novo código da família: ${newCode}\n\nCompartilhe com novos membros.`,
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Erro ao gerar novo código:', error);
              Alert.alert('Erro', 'Não foi possível gerar novo código');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const copyCodeToClipboard = () => {
    if (!family) return;
    
    // Simular cópia (em produção, usar Clipboard API)
    Alert.alert(
      'Código da Família',
      `${family.code}\n\nCompartilhe este código com outros membros da família.`,
      [{ text: 'OK' }]
    );
  };

  if (loading && !family) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Família</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {!family ? (
            // Não está em família
            <>
              {/* Info Card */}
              <View style={styles.infoCard}>
                <Ionicons name="people" size={32} color="#b081ee" />
                <Text style={styles.infoTitle}>Família Compartilhada</Text>
                <Text style={styles.infoText}>
                  Compartilhe dados médicos com sua família de forma segura e sincronizada. 
                  Perfeito para pais, cuidadores e famílias que precisam coordenar cuidados médicos.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.createButton]}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Criar Nova Família</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.joinButton]}
                  onPress={() => setShowJoinModal(true)}
                >
                  <Ionicons name="enter" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Entrar em Família</Text>
                </TouchableOpacity>
              </View>

              {/* Benefits Card */}
              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>💡 Benefícios</Text>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Dados sincronizados entre dispositivos</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Coordenação de cuidados familiares</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Acesso em emergências</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Controle total de privacidade</Text>
                </View>
              </View>
            </>
          ) : (
            // Já está em família
            <>
              {/* Family Info Card */}
              <View style={styles.familyCard}>
                <View style={styles.familyHeader}>
                  <Ionicons name="home" size={24} color="#b081ee" />
                  <Text style={styles.familyName}>{family.name}</Text>
                  {isAdmin && (
                    <View style={styles.adminBadge}>
                      <Ionicons name="star" size={12} color="#FF9500" />
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity style={styles.codeContainer} onPress={copyCodeToClipboard}>
                  <Text style={styles.codeLabel}>Código da Família:</Text>
                  <Text style={styles.codeText}>{family.code}</Text>
                  <Ionicons name="copy" size={16} color="#b081ee" />
                </TouchableOpacity>
              </View>

              {/* Members List */}
              <View style={styles.membersCard}>
                <View style={styles.membersHeader}>
                  <Text style={styles.membersTitle}>Membros da Família</Text>
                  <Text style={styles.membersCount}>{familyMembers.length}</Text>
                </View>

                {familyMembers.map((member) => (
                  <View key={member.userId} style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Ionicons name="person" size={20} color="#b081ee" />
                      </View>
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberEmail}>{member.email}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.memberActions}>
                      {member.role === 'admin' && (
                        <View style={styles.adminBadge}>
                          <Ionicons name="star" size={12} color="#FF9500" />
                          <Text style={styles.adminText}>Admin</Text>
                        </View>
                      )}
                      {isAdmin && member.userId !== user?.uid && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveMember(member)}
                        >
                          <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Admin Actions */}
              {isAdmin && (
                <View style={styles.adminActionsCard}>
                  <Text style={styles.adminActionsTitle}>Ações do Administrador</Text>
                  
                  <TouchableOpacity
                    style={styles.adminActionButton}
                    onPress={handleGenerateNewCode}
                  >
                    <Ionicons name="refresh" size={20} color="#b081ee" />
                    <Text style={styles.adminActionText}>Gerar Novo Código</Text>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Leave Family */}
              <View style={styles.leaveCard}>
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={handleLeaveFamily}
                >
                  <Ionicons name="exit" size={20} color="#ff6b6b" />
                  <Text style={styles.leaveButtonText}>Sair da Família</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Create Family Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Nova Família</Text>
            
            <View style={styles.codePreviewContainer}>
              <Text style={styles.codePreviewLabel}>Código que será gerado:</Text>
              <View style={styles.codePreview}>
                <Ionicons name="key" size={16} color="#b081ee" />
                <Text style={styles.codePreviewText}>Automático (6 caracteres)</Text>
              </View>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da família (ex: Família Silva, Casa dos Pais)"
              value={familyName}
              onChangeText={setFamilyName}
              maxLength={50}
            />
            
            <Text style={styles.modalHint}>
              O nome é apenas para identificação. Um código único e seguro será gerado automaticamente.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setFamilyName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateFamily}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Criar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Family Modal */}
      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entrar em Família</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Código da família (ex: ABC123)"
              value={familyCode}
              onChangeText={(text) => setFamilyCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
            />
            
            <Text style={styles.modalHint}>
              Digite o código de 6 caracteres compartilhado pelo administrador da família.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowJoinModal(false);
                  setFamilyCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleJoinFamily}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 8,
  },
  createButton: {
    backgroundColor: '#b081ee',
  },
  joinButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  familyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  adminText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0eaff',
    borderRadius: 12,
    padding: 12,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b081ee',
    flex: 1,
    fontFamily: 'monospace',
  },
  membersCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  membersCount: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 4,
  },
  adminActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adminActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  adminActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  adminActionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  leaveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#b081ee',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  codePreviewContainer: {
    marginBottom: 16,
  },
  codePreviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  codePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0eaff',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  codePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b081ee',
  },
});