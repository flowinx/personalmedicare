import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMemberById, deleteMember } from '../services/firebase';
import { Member } from '../types';

interface MemberDetailScreenProps {
  navigation: any;
  route: {
    params: {
      id: string;
    };
  };
}

export default function MemberDetailScreen({ navigation, route }: MemberDetailScreenProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob: string): string => {
    if (!dob || dob.trim() === '') {
      return '-';
    }

    let birthDate: Date;
    
    // Tenta diferentes formatos de data
    if (dob.includes('/')) {
      // Formato DD/MM/YYYY
      const parts = dob.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
        const year = parseInt(parts[2], 10);
        birthDate = new Date(year, month, day);
      } else {
        return 'Data inválida';
      }
    } else {
      // Tenta formato ISO ou outros formatos
      birthDate = new Date(dob);
    }
    
    // Verifica se a data é válida
    if (isNaN(birthDate.getTime())) {
      return 'Data inválida';
    }
    
    const today = new Date();
    
    // Verifica se a data de nascimento não é no futuro
    if (birthDate > today) {
      return 'Data inválida';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 0) {
      return 'Data inválida';
    } else if (age === 0) {
      // Calcula meses para bebês
      const months = today.getMonth() - birthDate.getMonth() + 
                    (12 * (today.getFullYear() - birthDate.getFullYear()));
      if (months === 0) {
        const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Recém-nascido' : `${days} dias`;
      }
      return `${months} meses`;
    } else {
      return `${age} anos`;
    }
  };

  useEffect(() => {
    loadMember();
  }, []);

  const loadMember = async () => {
    try {
      const memberData = await getMemberById(route.params.id);
      setMember(memberData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do membro');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditMember', { memberId: member?.id });
  };



  const handleAddTreatment = () => {
    navigation.navigate('AddTreatment', { memberId: member?.id });
  };

  const handleViewTreatments = () => {
    if (member) {
      navigation.navigate('TreatmentsStack', { 
        screen: 'TreatmentsMain',
        params: { memberId: member.id }
      });
    }
  };

  const handleDossier = () => {
    if (member) {
      navigation.navigate('Reports', { memberId: member.id });
    }
  };

  const handleDeleteMember = async () => {
    if (!member) {
      console.log('ERRO: Membro não encontrado!');
      return;
    }
    
    console.log('MemberDetailScreen: handleDeleteMember called for member:', member.id, member.name);
    
    Alert.alert(
      'Excluir Membro',
      `Tem certeza que deseja excluir ${member.name}? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('MemberDetailScreen: Starting deletion process for member:', member.id);
              await deleteMember(member.id);
              console.log('MemberDetailScreen: Member deleted successfully:', member.id);
              console.log('MemberDetailScreen: Navigating back to HomeScreen');
              navigation.goBack();
            } catch (error) {
              console.error('MemberDetailScreen: Error deleting member:', error);
              Alert.alert('Erro', 'Não foi possível excluir o membro. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Membro não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Section with Background Image */}
      <View style={styles.heroSection}>
        <View style={styles.backgroundImageContainer}>
          {member.avatar_uri ? (
            <Image source={{ uri: member.avatar_uri }} style={styles.backgroundImage} />
          ) : (
            <View style={styles.backgroundGradient} />
          )}
          <View style={styles.overlay} />
        </View>
        
        {/* Header with Back and Edit buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Member Info Section - First section with member details */}
        <View style={styles.memberInfoSection}>
          <View style={styles.nameRelationRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRelation}>({member.relation})</Text>
          </View>
          
          {/* Member Details Row */}
          <View style={styles.memberDetailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>
                {member.dob ? calculateAge(member.dob) : '-'}
              </Text>
              <Text style={styles.detailLabel}>Idade</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>
                {member.bloodType || member.blood_type || '-'}
              </Text>
              <Text style={styles.detailLabel}>Tipo Sanguíneo</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>Nenhuma</Text>
              <Text style={styles.detailLabel}>Alergias</Text>
            </View>
          </View>
        </View>



        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleAddTreatment}>
            <View style={styles.actionIcon}>
              <Ionicons name="medical" size={20} color="#b081ee" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Novo Tratamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewTreatments}>
            <View style={styles.actionIcon}>
              <Ionicons name="list" size={20} color="#b081ee" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Tratamentos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDossier}>
            <View style={styles.actionIcon}>
              <Ionicons name="folder" size={20} color="#b081ee" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Dossiê</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Delete Member Section */}
        <View style={styles.deleteSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMember}>
            <View style={styles.deleteIcon}>
              <Ionicons name="trash" size={20} color="#ff6b6b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.deleteTitle}>Excluir Membro</Text>
              <Text style={styles.deleteSubtitle}>Remover permanentemente</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
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
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -40,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  memberInfoSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  // Hero Section Styles
  heroSection: {
    position: 'relative',
    height: 280,
    marginBottom: 0,
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#b081ee',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },

  memberInfoCard: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  memberAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  memberAvatar: {
    width: '100%',
    height: '100%',
  },
  memberAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b081ee',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  headerSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
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
  nameRelationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  memberRelation: {
    fontSize: 16,
    color: '#b081ee',
    fontWeight: '600',
  },
  memberDob: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  deleteSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 2,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: '#999',
  },

});